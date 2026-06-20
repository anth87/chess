#!/usr/bin/env node
/**
 * Browser test: arrow endpoints must land inside their from/to squares.
 * Requires local server: py -m http.server (spawned automatically).
 */
const { chromium } = require('playwright-core');
const { spawn } = require('child_process');
const fs = require('fs');
const http = require('http');
const path = require('path');

const PORT = 8766;
const ROOT = path.join(__dirname, '..');
const LESSONS_DIR = path.join(ROOT, 'lessons');

function waitForServer(url, ms = 8000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    (function poll() {
      http.get(url, (res) => { res.resume(); resolve(); }).on('error', () => {
        if (Date.now() - start > ms) reject(new Error('Server did not start'));
        else setTimeout(poll, 200);
      });
    })();
  });
}

function extractBoardsWithArrows(html) {
  const boards = [];
  const re = /<div[^>]*class="chesscom-board"[^>]*>/gi;
  let match;
  while ((match = re.exec(html)) !== null) {
    const tag = match[0];
    const id = (tag.match(/id="([^"]*)"/i) || [])[1];
    const arrowsMatch =
      tag.match(/data-arrows='([^']*)'/i) ||
      tag.match(/data-arrows="([^"]*)"/i);
    if (!id || !arrowsMatch) continue;
    try {
      const arrows = JSON.parse(arrowsMatch[1]);
      if (arrows.length) boards.push({ id, arrows });
    } catch {
      /* skip malformed */
    }
  }
  return boards;
}

function lessonSpecs() {
  const specs = [];
  for (const file of fs.readdirSync(LESSONS_DIR).filter((f) => f.endsWith('.html'))) {
    const html = fs.readFileSync(path.join(LESSONS_DIR, file), 'utf8');
    const boards = extractBoardsWithArrows(html);
    if (boards.length) {
      specs.push({
        file,
        url: `http://127.0.0.1:${PORT}/lessons/${file}`,
        boards
      });
    }
  }
  return specs;
}

async function verifyLesson(page, spec) {
  await page.goto(spec.url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  return page.evaluate((boards) => {
    function inSquare(boardId, square, xPct, yPct) {
      const grid = document.querySelector(`#${boardId} .board-b72b1`);
      const sq = grid && grid.querySelector(`[data-square="${square}"]`);
      if (!grid || !sq) return { ok: false, reason: 'missing square' };
      const g = grid.getBoundingClientRect();
      const s = sq.getBoundingClientRect();
      const px = g.left + (xPct / 8) * g.width;
      const py = g.top + (yPct / 8) * g.height;
      const pad = 2;
      const ok =
        px >= s.left - pad && px <= s.right + pad &&
        py >= s.top - pad && py <= s.bottom + pad;
      return { ok };
    }

    const out = [];
    for (const b of boards) {
      const grid = document.querySelector(`#${b.id} .board-b72b1`);
      const svg = grid && grid.querySelector('.com-board-arrows');
      if (!svg) { out.push({ board: b.id, ok: false, reason: 'no arrow svg' }); continue; }
      const lines = [...svg.querySelectorAll('line')];
      if (lines.length !== b.arrows.length) {
        out.push({ board: b.id, ok: false, reason: `expected ${b.arrows.length} lines, got ${lines.length}` });
        continue;
      }
      lines.forEach((line, i) => {
        const x1 = parseFloat(line.getAttribute('x1'));
        const y1 = parseFloat(line.getAttribute('y1'));
        const x2 = parseFloat(line.getAttribute('x2'));
        const y2 = parseFloat(line.getAttribute('y2'));
        const spec = b.arrows[i];
        const fromOk = inSquare(b.id, spec.from, x1, y1);
        const toOk = inSquare(b.id, spec.to, x2, y2);
        out.push({
          board: b.id,
          arrow: `${spec.from}->${spec.to}`,
          ok: fromOk.ok && toOk.ok
        });
      });
    }
    return out;
  }, spec.boards);
}

async function main() {
  const specs = lessonSpecs();
  if (!specs.length) {
    console.log('No lesson boards with arrows found.');
    return;
  }

  const server = spawn('py', ['-m', 'http.server', String(PORT)], {
    cwd: ROOT,
    stdio: 'ignore',
    shell: true
  });

  try {
    await waitForServer(`http://127.0.0.1:${PORT}/`);
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 900, height: 1200 } });

    let failed = 0;
    for (const spec of specs) {
      console.log(`${spec.file}:`);
      const results = await verifyLesson(page, spec);
      for (const r of results) {
        const status = r.ok ? 'OK' : 'FAIL';
        console.log(`  ${status}  ${r.board}  ${r.arrow || r.reason || ''}`);
        if (!r.ok) failed++;
      }
    }

    await browser.close();

    if (failed) {
      console.error(`\n${failed} overlay check(s) failed.`);
      process.exit(1);
    }
    console.log('\nAll board overlays aligned.');
  } finally {
    server.kill();
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});