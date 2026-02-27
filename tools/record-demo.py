#!/usr/bin/env python3
"""Record a demo video of Signal Lost using Playwright.

Demonstrates: boot sequence, adding vessels, boosting, phenomena,
SAT at zero, and vessel death.
"""

import os
import http.server
import threading
import time

from playwright.sync_api import sync_playwright

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VIDEO_DIR = os.path.join(PROJECT_ROOT, 'tools', 'demo-video')
PORT = 8765
URL = f'http://localhost:{PORT}'

os.makedirs(VIDEO_DIR, exist_ok=True)

# Clean up previous recordings
for f in os.listdir(VIDEO_DIR):
    if f.endswith('.webm'):
        os.remove(os.path.join(VIDEO_DIR, f))


def start_server():
    """Start a simple HTTP server in the project root."""
    os.chdir(PROJECT_ROOT)
    handler = http.server.SimpleHTTPRequestHandler
    handler.log_message = lambda *a: None  # suppress logs
    server = http.server.HTTPServer(('localhost', PORT), handler)
    t = threading.Thread(target=server.serve_forever, daemon=True)
    t.start()
    return server


def record():
    server = start_server()
    print(f'Server started on {URL}')

    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            executable_path='/usr/bin/chromium',
        )
        context = browser.new_context(
            viewport={'width': 1280, 'height': 720},
            record_video_dir=VIDEO_DIR,
            record_video_size={'width': 1280, 'height': 720},
        )
        page = context.new_page()

        # Clear any saved state
        page.goto(URL)
        page.evaluate('localStorage.clear()')
        page.reload()
        page.wait_for_load_state('networkidle')
        print('Page loaded, boot sequence starting...')

        # === SCENE 1: BOOT SEQUENCE ===
        page.wait_for_selector('#boot-text', state='visible', timeout=5000)
        time.sleep(8)  # Let boot text type out

        # Wait for operator prompt
        page.wait_for_selector('#boot-prompt:not(.hidden)', timeout=30000)
        time.sleep(1)

        # Type operator ID
        page.fill('#operator-input', 'DEMO-OPS')
        time.sleep(1)
        page.click('#boot-submit')
        print('Boot complete, entering game...')

        # Wait for game UI
        page.wait_for_selector('#game-ui:not(.hidden)', timeout=10000)
        time.sleep(3)

        # === SCENE 2: FIRST VESSEL RUNS ===
        print('Watching first vessel...')
        time.sleep(12)

        # === SCENE 3: SELECT AND BOOST ===
        print('Selecting vessel and boosting...')
        page.click('.vessel-col:first-child')
        time.sleep(1)
        page.click('#cmd-boost')
        time.sleep(5)

        # === SCENE 4: ADD SECOND VESSEL ===
        print('Adding second vessel...')
        page.click('#add-vessel-btn')
        time.sleep(8)

        # === SCENE 5: ADD THIRD VESSEL ===
        print('Adding third vessel...')
        page.click('#add-vessel-btn')
        time.sleep(8)

        # === SCENE 6: TRIGGER PHENOMENON ===
        print('Triggering phenomenon...')
        page.evaluate('''() => {
            const banner = document.getElementById('global-event');
            const text = document.getElementById('global-event-text');
            banner.classList.remove('hidden');
            text.textContent = 'SOLAR FLARE — Electromagnetic pulse detected. All vessel shields compromised. Integrity damage across all feeds.';
            document.getElementById('game-ui').classList.add('phenomenon-active');
        }''')
        time.sleep(6)

        # Dismiss phenomenon
        page.click('#global-event-dismiss')
        time.sleep(2)

        # === SCENE 7: SAT DECREASE TO ZERO ===
        print('Decreasing SAT to zero...')
        for sat in [4, 3, 2, 1, 0]:
            page.evaluate(f'''() => {{
                document.getElementById('sat-health').textContent = '{sat}';
                const statusEl = document.getElementById('sat-status');
                // Clear previous classes
                statusEl.className = '';
                if ({sat} <= 2) statusEl.className = 'critical';
                else if ({sat} <= 3) statusEl.className = 'degraded';
                if ({sat} === 0) {{
                    statusEl.className = 'dark-mode';
                    document.getElementById('top-banner').classList.add('sat-dark-mode');
                    document.getElementById('bottom-bar').classList.add('sat-dark-mode');
                }}
            }}''')
            time.sleep(1.5)

        time.sleep(4)  # Show SAT 0 / dark mode state (COMMANDS OFFLINE)

        # Restore SAT
        page.evaluate('''() => {
            document.getElementById('sat-health').textContent = '5';
            const statusEl = document.getElementById('sat-status');
            statusEl.className = '';
            document.getElementById('top-banner').classList.remove('sat-dark-mode');
            document.getElementById('bottom-bar').classList.remove('sat-dark-mode');
        }''')
        time.sleep(2)

        # === SCENE 8: VESSEL DEATH ===
        print('Simulating vessel death...')
        page.evaluate('''() => {
            const cols = document.querySelectorAll('.vessel-col:not(.add-col)');
            if (cols.length >= 2) {
                const col = cols[1];

                // Add death log entry
                const logEl = col.querySelector('.vessel-log');
                const entry = document.createElement('div');
                entry.className = 'log-entry event-entry';
                const now = new Date().toTimeString().slice(0, 8);
                entry.innerHTML = `<span class="log-time">${now}</span> <span class="log-text"><span class="hl-event">[VESSEL LOST]</span> — integrity critical. All systems offline. Signal terminated.</span>`;
                logEl.appendChild(entry);
                logEl.scrollTop = logEl.scrollHeight;

                // Convert to memorial (match ui.js removeVesselColumn)
                col.classList.add('vessel-dead');
                const stats = col.querySelector('.vessel-stats');
                if (stats) stats.remove();
                const phase = col.querySelector('.vessel-phase-bar');
                if (phase) phase.remove();

                // Add SIGNAL LOST overlay (using actual CSS classes)
                const overlay = document.createElement('div');
                overlay.className = 'signal-lost-overlay';
                overlay.innerHTML = `
                    <div class="signal-lost-bg">&#x1FBCC;</div>
                    <div class="signal-lost-label">SIGNAL LOST</div>
                `;
                col.insertBefore(overlay, logEl);
            }
        }''')
        time.sleep(6)

        # === FINAL: Let remaining vessels run ===
        print('Final moments...')
        time.sleep(5)

        print('Recording complete. Saving video...')
        context.close()
        browser.close()

    # Find the video file
    videos = [f for f in os.listdir(VIDEO_DIR) if f.endswith('.webm')]
    if videos:
        latest = max(videos, key=lambda f: os.path.getmtime(os.path.join(VIDEO_DIR, f)))
        final_path = os.path.join(VIDEO_DIR, 'signal-lost-demo.webm')
        if os.path.exists(final_path):
            os.remove(final_path)
        os.rename(os.path.join(VIDEO_DIR, latest), final_path)
        print(f'Video saved: {final_path}')
        size_mb = os.path.getsize(final_path) / (1024 * 1024)
        print(f'Size: {size_mb:.1f} MB')

        # Also convert to mp4 for wider compatibility
        mp4_path = os.path.join(VIDEO_DIR, 'signal-lost-demo.mp4')
        os.system(f'ffmpeg -y -i "{final_path}" -c:v libx264 -preset fast -crf 23 "{mp4_path}" 2>/dev/null')
        if os.path.exists(mp4_path):
            mp4_size = os.path.getsize(mp4_path) / (1024 * 1024)
            print(f'MP4 saved: {mp4_path} ({mp4_size:.1f} MB)')
    else:
        print('No video file found!')

    server.shutdown()


if __name__ == '__main__':
    record()
