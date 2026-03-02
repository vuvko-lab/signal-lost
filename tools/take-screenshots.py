#!/usr/bin/env python3
"""Take mobile screenshots of Signal Lost: phenomena + dark mode/memorial.

Produces two PNGs at 320x600:
  1. screenshot-phenomena.png — global phenomenon banner visible
  2. screenshot-darkmode-memorial.png — SAT 0 dark mode + vessel death memorial
"""

import os
import http.server
import threading
import time

from playwright.sync_api import sync_playwright

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(PROJECT_ROOT, 'tools')
PORT = 8767
URL = f'http://localhost:{PORT}'
WIDTH = 320
HEIGHT = 600


def start_server():
    os.chdir(PROJECT_ROOT)
    handler = http.server.SimpleHTTPRequestHandler
    handler.log_message = lambda *a: None
    server = http.server.HTTPServer(('localhost', PORT), handler)
    t = threading.Thread(target=server.serve_forever, daemon=True)
    t.start()
    return server


def take_screenshots():
    server = start_server()
    print(f'Server started on {URL}')

    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            executable_path='/usr/bin/chromium',
        )
        context = browser.new_context(
            viewport={'width': WIDTH, 'height': HEIGHT},
            is_mobile=True,
            has_touch=True,
        )
        page = context.new_page()

        # Clear saved state and load
        page.goto(URL)
        page.evaluate('localStorage.clear()')
        page.reload()
        page.wait_for_load_state('networkidle')
        print('Page loaded, boot sequence starting...')

        # Boot
        page.wait_for_selector('#boot-text', state='visible', timeout=5000)
        page.wait_for_selector('#boot-prompt:not(.hidden)', timeout=60000)
        time.sleep(0.5)
        page.fill('#operator-input', 'DEMO')
        page.click('#boot-submit')
        page.wait_for_selector('#game-ui:not(.hidden)', timeout=10000)
        print('Game UI loaded')

        # Wait for first vessel to accumulate some log entries
        time.sleep(15)

        # Add a second vessel
        page.click('.vessel-tab.tab-add')
        time.sleep(8)

        # Add a third vessel
        page.click('.vessel-tab.tab-add')
        time.sleep(8)

        # Switch to first vessel tab for the phenomena screenshot
        tabs = page.query_selector_all('.vessel-tab:not(.tab-add)')
        if tabs:
            tabs[0].click()
        time.sleep(2)

        # === SCREENSHOT 1: PHENOMENON ===
        print('Triggering phenomenon...')
        page.evaluate('''() => {
            const banner = document.getElementById('global-event');
            const text = document.getElementById('global-event-text');
            banner.classList.remove('hidden');
            text.textContent = 'SOLAR FLARE — Electromagnetic pulse detected. All vessel shields compromised.';
        }''')
        time.sleep(1)

        path1 = os.path.join(OUT_DIR, 'screenshot-phenomena.png')
        page.screenshot(path=path1)
        print(f'Saved: {path1}')

        # Dismiss phenomenon
        page.evaluate('document.getElementById("global-event").classList.add("hidden")')
        time.sleep(1)

        # === SCREENSHOT 2: DARK MODE + MEMORIAL ===

        # Switch to second vessel, then kill it to create memorial
        if len(tabs) >= 2:
            tabs[1].click()
        time.sleep(2)

        # Kill second vessel via DOM (matching ui.js removeVesselColumn)
        print('Creating vessel memorial...')
        page.evaluate('''() => {
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

            // Remove details panel, toggle, phase bar, disconnect (match ui.js)
            const dp = col.querySelector('.vessel-details-panel');
            if (dp) dp.remove();
            const dt = col.querySelector('.vessel-details-toggle');
            if (dt) dt.remove();
            const pb = col.querySelector('.vessel-phase');
            if (pb) pb.remove();
            const dc = col.querySelector('.vessel-disconnect');
            if (dc) dc.remove();

            // Add memorial overlay
            col.classList.add('vessel-dead');
            const overlay = document.createElement('div');
            overlay.className = 'signal-lost-overlay';
            overlay.innerHTML = `
                <div class="signal-lost-bg">&#x1FBCC;</div>
                <div class="signal-lost-label">SIGNAL LOST</div>
            `;
            col.insertBefore(overlay, logEl);

            // Mark vessel name as dead
            const name = col.querySelector('.vessel-name');
            if (name) {
                name.style.color = 'var(--red)';
                name.style.textDecoration = 'line-through';
            }
        }''')
        time.sleep(1)

        # Drop SAT to 0 — dark mode
        print('Activating dark mode (SAT 0)...')
        page.evaluate('''() => {
            document.getElementById('sat-health').textContent = '0';
            const statusEl = document.getElementById('sat-status');
            statusEl.className = 'dark-mode';
            document.getElementById('bottom-bar').classList.add('sat-dark-mode');
        }''')
        time.sleep(1)

        path2 = os.path.join(OUT_DIR, 'screenshot-darkmode-memorial.png')
        page.screenshot(path=path2)
        print(f'Saved: {path2}')

        context.close()
        browser.close()

    server.shutdown()
    print('Done.')


if __name__ == '__main__':
    take_screenshots()
