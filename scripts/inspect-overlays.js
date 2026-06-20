#!/usr/bin/env node
const { chromium } = require('playwright-core');
const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

const PORT = 8772;
const ROOT = path.join(__dirname, '..');

async function main() {
  const lesson = process.argv[2] || '0004-owens-white-long-castle.html';
  const wait = () => new Promise((res, rej) => {
    const start = Date.now();
    (function poll() {
      http.get(`http://127.0.0.1:${PORT}/`, (r) => { r.resume(); res(); }).on('error', () => {
        if (Date.now() - start > 8000) rej(new Error('timeout'));
        else setTimeout(poll, 200);
      });
    })();
  });

  const server = spawn('py', ['-m', 'http.server', String(PORT)], { cwd: ROOT, stdio: 'ignore', shell: true });
  try {
    await wait();
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 560, height: 620 } });
    await page.goto(`http://127.0.0.1:${PORT}/lessons/${lesson}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);

    const data = await page.evaluate(() => {
      function info(id) {
        const el = document.getElementById(id);
        const grid = el.querySelector('.board-b72b1');
        const hl = [...el.querySelectorAll('.com-highlight')].map((s) => s.getAttribute('data-square'));
        const lines = [...grid.querySelectorAll('.com-board-arrows line')].map((l) => ({
          x1: +l.getAttribute('x1'), y1: +l.getAttribute('y1'),
          x2: +l.getAttribute('x2'), y2: +l.getAttribute('y2')
        }));
        const centers = {};
        for (const sq of ['a3', 'd3', 'e3', 'f1', 'c1', 'd1', 'd2', 'h6', 'd6']) {
          const sqEl = grid.querySelector(`[data-square="${sq}"]`);
          const g = grid.getBoundingClientRect();
          const s = sqEl.getBoundingClientRect();
          centers[sq] = {
            x: ((s.left + s.width / 2) - g.left) / g.width * 8,
            y: ((s.top + s.height / 2) - g.top) / g.height * 8,
            highlighted: sqEl.classList.contains('com-highlight')
          };
        }
        return { id, hl, lines, centers, orient: el.getAttribute('data-orientation') };
      }
      return [...document.querySelectorAll('.chesscom-board')].map((el) => info(el.id));
    });

    for (const b of data) {
      console.log(`\n=== ${b.id} (${b.orient}) ===`);
      console.log('highlighted squares (DOM):', b.hl.join(', '));
      for (const sq of Object.keys(b.centers)) {
        if (b.centers[sq].highlighted) console.log(`  ring on ${sq}`);
      }
      for (const line of b.lines) {
        console.log(`arrow: (${line.x1.toFixed(2)},${line.y1.toFixed(2)}) -> (${line.x2.toFixed(2)},${line.y2.toFixed(2)})`);
        for (const [sq, c] of Object.entries(b.centers)) {
          const d1 = Math.hypot(line.x1 - c.x, line.y1 - c.y);
          const d2 = Math.hypot(line.x2 - c.x, line.y2 - c.y);
          if (d1 < 0.6) console.log(`  start near ${sq} (dist ${d1.toFixed(2)})`);
          if (d2 < 0.6) console.log(`  end near ${sq} (dist ${d2.toFixed(2)})`);
        }
      }
    }
    await browser.close();
  } finally {
    server.kill();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });