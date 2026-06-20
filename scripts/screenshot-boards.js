#!/usr/bin/env node
const { chromium } = require('playwright-core');
const { spawn } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');

const PORT = 8767;
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'data', 'board-screenshots');

function waitForServer(ms = 8000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    (function poll() {
      http.get(`http://127.0.0.1:${PORT}/`, (res) => { res.resume(); resolve(); }).on('error', () => {
        if (Date.now() - start > ms) reject(new Error('server timeout'));
        else setTimeout(poll, 200);
      });
    })();
  });
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const server = spawn('py', ['-m', 'http.server', String(PORT)], { cwd: ROOT, stdio: 'ignore', shell: true });
  try {
    await waitForServer();
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 900, height: 1400 } });

    const lessons = fs.readdirSync(path.join(ROOT, 'lessons')).filter((f) => f.endsWith('.html'));
    for (const lesson of lessons) {
      await page.goto(`http://127.0.0.1:${PORT}/lessons/${lesson}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(600);
      const boards = await page.evaluate(() => {
        return [...document.querySelectorAll('.chesscom-board')].map((el) => {
          const grid = el.querySelector('.board-b72b1');
          const pieces = grid ? [...grid.querySelectorAll('[class*="piece-"]')].map((p) => ({
            square: p.getAttribute('data-square'),
            classes: p.className
          })) : [];
          const arrows = grid ? [...grid.querySelectorAll('.com-board-arrows line')].map((l) => ({
            x1: l.getAttribute('x1'), y1: l.getAttribute('y1'),
            x2: l.getAttribute('x2'), y2: l.getAttribute('y2')
          })) : [];
          const highlights = grid ? [...grid.querySelectorAll('.com-highlight')].map((s) => s.getAttribute('data-square')) : [];
          return { id: el.id, pieceCount: pieces.length, pieces: pieces.slice(0, 5), arrows, highlights };
        });
      });
      console.log(`\n${lesson}:`);
      for (const b of boards) {
        console.log(`  ${b.id}: ${b.pieceCount} pieces, ${b.arrows.length} arrows, highlights=${b.highlights.join(',')}`);
        if (b.pieceCount < 10) console.log('    WARNING: suspiciously few pieces');
      }
      const wrap = await page.$('.board-wrap');
      if (wrap) {
        await page.screenshot({ path: path.join(OUT, lesson.replace('.html', '.png')), fullPage: true });
      }
    }
    await browser.close();
    console.log(`\nScreenshots saved to ${OUT}`);
  } finally {
    server.kill();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });