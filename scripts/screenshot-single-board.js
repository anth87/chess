#!/usr/bin/env node
const { chromium } = require('playwright-core');
const { spawn } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');

const PORT = 8771;
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'data', 'board-screenshots');

async function main() {
  const lesson = process.argv[2] || '0004-owens-white-long-castle.html';
  const boardId = process.argv[3] || 'board-win';
  fs.mkdirSync(OUT, { recursive: true });

  const server = spawn('py', ['-m', 'http.server', String(PORT)], { cwd: ROOT, stdio: 'ignore', shell: true });
  const wait = () => new Promise((res, rej) => {
    const start = Date.now();
    (function poll() {
      http.get(`http://127.0.0.1:${PORT}/`, (r) => { r.resume(); res(); }).on('error', () => {
        if (Date.now() - start > 8000) rej(new Error('timeout'));
        else setTimeout(poll, 200);
      });
    })();
  });

  try {
    await wait();
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 560, height: 620 } });
    await page.goto(`http://127.0.0.1:${PORT}/lessons/${lesson}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    const handle = await page.evaluateHandle((id) => {
      const node = document.getElementById(id);
      return node?.closest('.com-board-outer') || node?.parentElement?.parentElement;
    }, boardId);
    const el = handle.asElement();
    if (!el) throw new Error(`board ${boardId} not found`);
    const outPath = path.join(OUT, `${lesson.replace('.html', '')}-${boardId}.png`);
    await el.screenshot({ path: outPath });
    console.log('saved', outPath);
    await browser.close();
  } finally {
    server.kill();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });