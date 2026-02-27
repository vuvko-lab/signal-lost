#!/usr/bin/env python3
"""Generate an animated GIF cover image for itch.io (630x500)."""

import os
import http.server
import random
import threading
import time
import subprocess

from PIL import Image, ImageDraw
from playwright.sync_api import sync_playwright

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(PROJECT_ROOT, 'tools', 'cover')
PORT = 8767
URL = f'http://localhost:{PORT}'
W, H = 630, 500

os.makedirs(OUT_DIR, exist_ok=True)

# Clean previous frames
for f in os.listdir(OUT_DIR):
    if f.endswith('.png'):
        os.remove(os.path.join(OUT_DIR, f))


def start_server():
    os.chdir(PROJECT_ROOT)
    handler = http.server.SimpleHTTPRequestHandler
    handler.log_message = lambda *a: None
    server = http.server.HTTPServer(('localhost', PORT), handler)
    t = threading.Thread(target=server.serve_forever, daemon=True)
    t.start()
    return server


def screenshot(page, name):
    path = os.path.join(OUT_DIR, name)
    page.screenshot(path=path, clip={'x': 0, 'y': 0, 'width': W, 'height': H})
    print(f'  {name}')
    return path


def gen_glitch_frame(src_path, out_name, intensity=1.0):
    """Generate a glitch transition frame from a source screenshot.

    Creates horizontal slice displacement, RGB channel offset,
    and scanline corruption.
    """
    img = Image.open(src_path).convert('RGB')
    w, h = img.size
    pixels = img.load()

    # 1) Horizontal slice displacement — shift random strips left/right
    result = img.copy()
    num_slices = random.randint(6, 14)
    for _ in range(num_slices):
        y = random.randint(0, h - 1)
        slice_h = random.randint(2, int(30 * intensity))
        shift = random.randint(int(-80 * intensity), int(80 * intensity))
        strip = img.crop((0, y, w, min(y + slice_h, h)))
        result.paste(strip, (shift, y))

    # 2) RGB channel offset — shift red channel horizontally
    r, g, b = result.split()
    r_shift = random.randint(int(-6 * intensity), int(6 * intensity))
    r = r.transform(r.size, Image.AFFINE, (1, 0, r_shift, 0, 1, 0))
    result = Image.merge('RGB', (r, g, b))

    # 3) Scanline corruption — black/green horizontal bars
    draw = ImageDraw.Draw(result)
    num_bars = random.randint(3, 8)
    for _ in range(num_bars):
        y = random.randint(0, h - 1)
        bar_h = random.randint(1, 3)
        color = random.choice([(0, 0, 0), (0, 255, 65, 40)])
        draw.rectangle([(0, y), (w, y + bar_h)], fill=color[:3])

    out_path = os.path.join(OUT_DIR, out_name)
    result.save(out_path)
    print(f'  {out_name} (glitch)')
    return out_path


TITLE_HTML = f'''<!DOCTYPE html>
<html>
<head>
<style>
  @import url('https://fonts.googleapis.com/css2?family=VT323&family=IBM+Plex+Mono:wght@400;700&display=swap');
  * {{ margin: 0; padding: 0; box-sizing: border-box; }}
  body {{
    width: {W}px; height: {H}px;
    background: #0a0a0f;
    display: flex; align-items: center; justify-content: center;
    overflow: hidden;
  }}
  .frame {{
    width: {W-16}px; height: {H-16}px;
    border: 2px solid #00ff41;
    position: relative;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
  }}
  .frame::after {{
    content: '';
    position: absolute; inset: 5px;
    border: 1px solid #004d15;
    pointer-events: none;
  }}
  .title {{
    font-family: 'Courier Prime', monospace;
    font-size: 52px; font-weight: 700;
    color: #ff3333;
    letter-spacing: 6px;
    text-shadow: 0 0 20px rgba(255,51,51,0.5);
  }}
  .subtitle {{
    font-family: 'Courier Prime', monospace;
    font-size: 32px;
    color: #00ff41;
    margin-top: 18px;
    letter-spacing: 4px;
  }}
  .bottom {{
    font-family: 'Courier Prime', monospace;
    font-size: 28px;
    color: #337a33;
    margin-top: 32px;
  }}
  .cursor {{
    color: #00ff41;
  }}
  .cursor.hidden {{ visibility: hidden; }}
</style>
</head>
<body>
<div class="frame">
  <div class="title">SIGNAL LOST</div>
  <div class="subtitle">A ZERO-PLAYER RPG</div>
  <div class="bottom">&gt; MONITORING AUTONOMOUS AI VESSELS<span class="cursor">_</span></div>
</div>
</body>
</html>'''


def gen_title_frames(browser):
    """Generate title card frames using Playwright."""
    page = browser.new_page(viewport={'width': W, 'height': H})
    page.set_content(TITLE_HTML)
    page.wait_for_load_state('networkidle')
    time.sleep(1)

    # Frame with cursor visible
    screenshot(page, 'frame_000.png')
    screenshot(page, 'frame_001.png')

    # Frame with cursor hidden (blink effect)
    page.evaluate('document.querySelector(".cursor").classList.add("hidden")')
    screenshot(page, 'frame_002.png')

    # Glitch transition: title → boot
    gen_glitch_frame(os.path.join(OUT_DIR, 'frame_002.png'), 'frame_003.png', intensity=1.5)
    gen_glitch_frame(os.path.join(OUT_DIR, 'frame_002.png'), 'frame_004.png', intensity=2.0)

    page.close()
    print('Title frames generated')


def capture_gameplay(browser):
    server = start_server()
    print(f'Server on {URL}')

    page = browser.new_page(viewport={'width': W, 'height': H})

    # Clear state, load fresh
    page.goto(URL)
    page.evaluate('localStorage.clear()')
    page.reload()
    page.wait_for_load_state('networkidle')

    # === FRAME: Boot screen ===
    print('Capturing boot...')
    page.wait_for_selector('#boot-text', state='visible', timeout=5000)
    time.sleep(5)
    screenshot(page, 'frame_010.png')
    time.sleep(3)
    screenshot(page, 'frame_011.png')

    # Wait for prompt
    page.wait_for_selector('#boot-prompt:not(.hidden)', timeout=30000)
    page.fill('#operator-input', 'OPERATOR-7')
    time.sleep(0.5)
    screenshot(page, 'frame_012.png')

    # Glitch transition: boot → game
    gen_glitch_frame(os.path.join(OUT_DIR, 'frame_012.png'), 'frame_013.png', intensity=1.2)

    # Boot and enter game
    page.click('#boot-submit')
    page.wait_for_selector('#game-ui:not(.hidden)', timeout=10000)
    time.sleep(3)

    # === FRAME: Single vessel ===
    print('Capturing single vessel...')
    time.sleep(8)
    screenshot(page, 'frame_020.png')
    time.sleep(6)
    screenshot(page, 'frame_021.png')

    # === FRAME: After boost ===
    print('Capturing boost...')
    # On mobile layout, first vessel is already active
    page.click('#cmd-boost')
    time.sleep(2)
    screenshot(page, 'frame_030.png')

    # === Add more vessels (use tab-add since viewport < 767px) ===
    print('Adding vessels...')
    page.click('.vessel-tab.tab-add')
    time.sleep(5)
    screenshot(page, 'frame_040.png')

    page.click('.vessel-tab.tab-add')
    time.sleep(5)
    screenshot(page, 'frame_041.png')
    time.sleep(5)
    screenshot(page, 'frame_042.png')

    # Glitch transition: gameplay → phenomenon
    gen_glitch_frame(os.path.join(OUT_DIR, 'frame_042.png'), 'frame_045.png', intensity=1.5)

    # === FRAME: Phenomenon ===
    print('Capturing phenomenon...')
    page.evaluate('''() => {
        const banner = document.getElementById('global-event');
        const text = document.getElementById('global-event-text');
        banner.classList.remove('hidden');
        text.textContent = 'SOLAR FLARE \u2014 Electromagnetic pulse detected. All vessel shields compromised.';
    }''')
    time.sleep(1)
    screenshot(page, 'frame_050.png')
    time.sleep(3)
    screenshot(page, 'frame_051.png')

    page.evaluate('document.getElementById("global-event").classList.add("hidden")')
    time.sleep(1)

    # === FRAME: SAT degraded ===
    print('Capturing SAT decay...')
    page.evaluate('''() => {
        document.getElementById('sat-health').textContent = '1';
        document.getElementById('sat-status').className = 'critical';
    }''')
    time.sleep(2)
    screenshot(page, 'frame_060.png')

    # Glitch transition: SAT critical → dark mode
    gen_glitch_frame(os.path.join(OUT_DIR, 'frame_060.png'), 'frame_065.png', intensity=2.0)

    # === FRAME: SAT 0 / dark mode ===
    page.evaluate('''() => {
        document.getElementById('sat-health').textContent = '0';
        document.getElementById('sat-status').className = 'dark-mode';
        document.getElementById('top-banner').classList.add('sat-dark-mode');
        document.getElementById('bottom-bar').classList.add('sat-dark-mode');
    }''')
    time.sleep(1)
    screenshot(page, 'frame_070.png')

    # Restore
    page.evaluate('''() => {
        document.getElementById('sat-health').textContent = '5';
        document.getElementById('sat-status').className = '';
        document.getElementById('top-banner').classList.remove('sat-dark-mode');
        document.getElementById('bottom-bar').classList.remove('sat-dark-mode');
    }''')
    time.sleep(2)

    # Glitch transition: → vessel death
    gen_glitch_frame(os.path.join(OUT_DIR, 'frame_070.png'), 'frame_075.png', intensity=1.8)

    # === FRAME: Vessel death ===
    print('Capturing vessel death...')
    # Switch to second vessel tab first
    tabs = page.query_selector_all('.vessel-tab:not(.tab-add)')
    if len(tabs) >= 2:
        tabs[1].click()
        time.sleep(2)

    page.evaluate('''() => {
        const col = document.querySelector('.vessel-col.mobile-active') ||
                    document.querySelectorAll('.vessel-col:not(.add-col)')[1];
        if (!col) return;
        const logEl = col.querySelector('.vessel-log');
        const entry = document.createElement('div');
        entry.className = 'log-entry event-entry';
        const now = new Date().toTimeString().slice(0, 8);
        entry.innerHTML = `<span class="log-time">${now}</span> <span class="log-text"><span class="hl-event">[VESSEL LOST]</span> \u2014 integrity critical. All systems offline. Signal terminated.</span>`;
        logEl.appendChild(entry);
        logEl.scrollTop = logEl.scrollHeight;
        col.classList.add('vessel-dead');
        const stats = col.querySelector('.vessel-stats');
        if (stats) stats.remove();
        const phase = col.querySelector('.vessel-phase-bar');
        if (phase) phase.remove();
        const overlay = document.createElement('div');
        overlay.className = 'signal-lost-overlay';
        overlay.innerHTML = `<div class="signal-lost-bg">&#x1FBCC;</div><div class="signal-lost-label">SIGNAL LOST</div>`;
        col.insertBefore(overlay, logEl);
    }''')
    time.sleep(2)
    screenshot(page, 'frame_080.png')

    # Switch to first (surviving) vessel for final frame
    tabs = page.query_selector_all('.vessel-tab:not(.tab-add)')
    if len(tabs) >= 1:
        tabs[0].click()
    time.sleep(6)
    screenshot(page, 'frame_090.png')

    page.close()
    server.shutdown()
    print('Gameplay frames captured')


def assemble_gif():
    """Assemble frames into animated GIF using ffmpeg."""
    frames = sorted(f for f in os.listdir(OUT_DIR) if f.startswith('frame_') and f.endswith('.png'))
    print(f'Assembling {len(frames)} frames into GIF...')

    # Create a concat file with durations
    # Glitch frame names (short flash durations)
    glitch_names = {'frame_003.png', 'frame_004.png', 'frame_013.png',
                    'frame_045.png', 'frame_065.png', 'frame_075.png'}

    concat_path = os.path.join(OUT_DIR, 'frames.txt')
    with open(concat_path, 'w') as f:
        for frame in frames:
            fpath = os.path.join(OUT_DIR, frame)
            if frame in glitch_names:
                # Glitch transitions: quick flash
                f.write(f"file '{fpath}'\nduration 0.12\n")
            elif frame.startswith('frame_00'):
                # Title cards: 1.5s
                f.write(f"file '{fpath}'\nduration 1.5\n")
            elif frame.startswith('frame_01'):
                # Boot screens: 1.5s
                f.write(f"file '{fpath}'\nduration 1.5\n")
            elif frame.startswith('frame_05') or frame.startswith('frame_07') or frame.startswith('frame_08'):
                # Dramatic moments (phenomenon, dark mode, death): 2.5s
                f.write(f"file '{fpath}'\nduration 2.5\n")
            else:
                # Regular gameplay: 2s
                f.write(f"file '{fpath}'\nduration 2.0\n")
        # Last frame needs to be listed again for duration to work
        f.write(f"file '{os.path.join(OUT_DIR, frames[-1])}'\n")

    gif_path = os.path.join(OUT_DIR, 'cover.gif')

    # Two-pass for better quality: generate palette first
    palette_path = os.path.join(OUT_DIR, 'palette.png')
    subprocess.run([
        'ffmpeg', '-y', '-f', 'concat', '-safe', '0', '-i', concat_path,
        '-vf', f'scale={W}:{H}:flags=lanczos,palettegen=max_colors=64:stats_mode=diff',
        palette_path
    ], capture_output=True)

    subprocess.run([
        'ffmpeg', '-y', '-f', 'concat', '-safe', '0', '-i', concat_path,
        '-i', palette_path,
        '-lavfi', f'scale={W}:{H}:flags=lanczos [x]; [x][1:v] paletteuse=dither=bayer:bayer_scale=3',
        gif_path
    ], capture_output=True)

    if os.path.exists(gif_path):
        size_kb = os.path.getsize(gif_path) / 1024
        print(f'GIF saved: {gif_path} ({size_kb:.0f} KB)')
    else:
        print('GIF generation failed!')

    # Cleanup temp files
    os.remove(concat_path)
    if os.path.exists(palette_path):
        os.remove(palette_path)


if __name__ == '__main__':
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            executable_path='/usr/bin/chromium',
        )
        gen_title_frames(browser)
        capture_gameplay(browser)
        browser.close()
    assemble_gif()
