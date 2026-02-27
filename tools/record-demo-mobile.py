#!/usr/bin/env python3
"""Record a mobile demo video of Signal Lost using Playwright.

320x640 viewport. Demonstrates: boot, adding vessels, tab switching,
phenomena, vessel death memorial, and boosting.
"""

import os
import http.server
import threading
import time

from playwright.sync_api import sync_playwright

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VIDEO_DIR = os.path.join(PROJECT_ROOT, 'tools', 'demo-video')
PORT = 8766
URL = f'http://localhost:{PORT}'
WIDTH = 320
HEIGHT = 640

os.makedirs(VIDEO_DIR, exist_ok=True)


def start_server():
    os.chdir(PROJECT_ROOT)
    handler = http.server.SimpleHTTPRequestHandler
    handler.log_message = lambda *a: None
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
            viewport={'width': WIDTH, 'height': HEIGHT},
            record_video_dir=VIDEO_DIR,
            record_video_size={'width': WIDTH, 'height': HEIGHT},
            is_mobile=True,
            has_touch=True,
        )
        page = context.new_page()

        # Clear saved state
        page.goto(URL)
        page.evaluate('localStorage.clear()')
        page.reload()
        page.wait_for_load_state('networkidle')
        print('Page loaded, boot sequence starting...')

        # === SCENE 1: BOOT SEQUENCE ===
        page.wait_for_selector('#boot-text', state='visible', timeout=5000)
        time.sleep(8)

        page.wait_for_selector('#boot-prompt:not(.hidden)', timeout=30000)
        time.sleep(1)

        page.fill('#operator-input', 'DEMO')
        time.sleep(1)
        page.click('#boot-submit')
        print('Boot complete, entering game...')

        page.wait_for_selector('#game-ui:not(.hidden)', timeout=10000)
        time.sleep(3)

        # === SCENE 2: FIRST VESSEL (auto-created) ===
        print('Watching first vessel...')
        time.sleep(10)

        # === SCENE 3: BOOST FIRST VESSEL ===
        print('Boosting vessel...')
        page.click('#cmd-boost')
        time.sleep(4)

        # === SCENE 4: ADD SECOND VESSEL VIA TAB ===
        print('Adding second vessel via + tab...')
        # On mobile the add-vessel column is hidden; use the + tab
        page.click('.vessel-tab.tab-add')
        time.sleep(2)

        # Watch second vessel
        time.sleep(8)

        # === SCENE 5: SWITCH TABS ===
        print('Switching between vessel tabs...')
        # Switch to first vessel tab
        tabs = page.query_selector_all('.vessel-tab:not(.tab-add)')
        if len(tabs) >= 2:
            tabs[0].click()
            time.sleep(4)
            tabs[1].click()
            time.sleep(4)
            tabs[0].click()
            time.sleep(3)

        # === SCENE 6: ADD THIRD VESSEL ===
        print('Adding third vessel...')
        page.click('.vessel-tab.tab-add')
        time.sleep(2)

        # Switch through all three tabs
        tabs = page.query_selector_all('.vessel-tab:not(.tab-add)')
        if len(tabs) >= 3:
            tabs[0].click()
            time.sleep(3)
            tabs[1].click()
            time.sleep(3)
            tabs[2].click()
            time.sleep(3)

        # === SCENE 7: TRIGGER PHENOMENON ===
        print('Triggering phenomenon...')
        page.evaluate('''() => {
            const banner = document.getElementById('global-event');
            const text = document.getElementById('global-event-text');
            banner.classList.remove('hidden');
            text.textContent = 'SOLAR FLARE — Electromagnetic pulse. All vessel shields compromised.';
        }''')
        time.sleep(6)

        # Dismiss via JS (banner overlaps tabs on mobile)
        page.evaluate('document.getElementById("global-event").classList.add("hidden")')
        time.sleep(2)

        # === SCENE 8: VESSEL DEATH + MEMORIAL ===
        print('Simulating vessel death on second vessel...')

        # Switch to second vessel first to show it alive
        tabs = page.query_selector_all('.vessel-tab:not(.tab-add)')
        if len(tabs) >= 2:
            tabs[1].click()
        time.sleep(2)

        # Kill the second vessel
        page.evaluate('''() => {
            // Find the currently visible (mobile-active) vessel column
            const col = document.querySelector('.vessel-col.mobile-active');
            if (!col) return;

            // Add death log entry
            const logEl = col.querySelector('.vessel-log');
            const entry = document.createElement('div');
            entry.className = 'log-entry event-entry';
            const now = new Date().toTimeString().slice(0, 8);
            entry.innerHTML = `<span class="log-time">${now}</span> <span class="log-text"><span class="hl-event">[VESSEL LOST]</span> — integrity critical. All systems offline. Signal terminated.</span>`;
            logEl.appendChild(entry);
            logEl.scrollTop = logEl.scrollHeight;

            // Convert to memorial
            col.classList.add('vessel-dead');
            const stats = col.querySelector('.vessel-stats');
            if (stats) stats.remove();
            const phase = col.querySelector('.vessel-phase-bar');
            if (phase) phase.remove();

            // Add SIGNAL LOST overlay
            const overlay = document.createElement('div');
            overlay.className = 'signal-lost-overlay';
            overlay.innerHTML = `
                <div class="signal-lost-bg">&#x1FBCC;</div>
                <div class="signal-lost-label">SIGNAL LOST</div>
            `;
            col.insertBefore(overlay, logEl);
        }''')
        time.sleep(6)  # Show the memorial

        # === SCENE 9: SWITCH TO SURVIVING VESSELS ===
        print('Switching to surviving vessels...')
        tabs = page.query_selector_all('.vessel-tab:not(.tab-add)')
        if len(tabs) >= 1:
            tabs[0].click()
            time.sleep(4)
        if len(tabs) >= 3:
            tabs[2].click()
            time.sleep(4)

        # Switch back to memorial
        if len(tabs) >= 2:
            tabs[1].click()
            time.sleep(4)

        # === SCENE 10: SAT DECREASE ===
        print('Decreasing SAT...')
        for sat in [4, 3, 2, 1, 0]:
            page.evaluate(f'''() => {{
                document.getElementById('sat-health').textContent = '{sat}';
                const statusEl = document.getElementById('sat-status');
                statusEl.className = '';
                if ({sat} <= 2) statusEl.className = 'critical';
                else if ({sat} <= 3) statusEl.className = 'degraded';
                if ({sat} === 0) {{
                    statusEl.className = 'dark-mode';
                    document.getElementById('top-banner').classList.add('sat-dark-mode');
                    document.getElementById('bottom-bar').classList.add('sat-dark-mode');
                }}
            }}''')
            time.sleep(1)

        time.sleep(3)

        # Restore SAT
        page.evaluate('''() => {
            document.getElementById('sat-health').textContent = '5';
            document.getElementById('sat-status').className = '';
            document.getElementById('top-banner').classList.remove('sat-dark-mode');
            document.getElementById('bottom-bar').classList.remove('sat-dark-mode');
        }''')
        time.sleep(2)

        # === FINAL ===
        print('Final moments...')
        # Switch to a live vessel for the end
        tabs = page.query_selector_all('.vessel-tab:not(.tab-add)')
        if len(tabs) >= 1:
            tabs[0].click()
        time.sleep(5)

        print('Recording complete. Saving video...')
        context.close()
        browser.close()

    # Find and rename the video
    videos = [f for f in os.listdir(VIDEO_DIR) if f.endswith('.webm')]
    if videos:
        latest = max(videos, key=lambda f: os.path.getmtime(os.path.join(VIDEO_DIR, f)))
        final_path = os.path.join(VIDEO_DIR, 'signal-lost-mobile.webm')
        if os.path.exists(final_path):
            os.remove(final_path)
        os.rename(os.path.join(VIDEO_DIR, latest), final_path)
        print(f'Video saved: {final_path}')
        size_mb = os.path.getsize(final_path) / (1024 * 1024)
        print(f'Size: {size_mb:.1f} MB')

        # Convert to mp4
        mp4_path = os.path.join(VIDEO_DIR, 'signal-lost-mobile.mp4')
        os.system(f'ffmpeg -y -i "{final_path}" -c:v libx264 -preset fast -crf 23 "{mp4_path}" 2>/dev/null')
        if os.path.exists(mp4_path):
            mp4_size = os.path.getsize(mp4_path) / (1024 * 1024)
            print(f'MP4 saved: {mp4_path} ({mp4_size:.1f} MB)')
    else:
        print('No video file found!')

    server.shutdown()


if __name__ == '__main__':
    record()
