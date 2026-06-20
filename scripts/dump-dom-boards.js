#!/usr/bin/env node
const { chromium } = require('playwright-core');
const { spawn } = require('child_process');
const http = require('http');
const path = require('path');
const { Chess } = require('chess.js');

const PORT = 8768;
const ROOT = path.join(__dirname, '..');

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

function fenFromMoves(moves) {
  const c = new Chess();
  for (const san of moves.trim().split(/\s+/)) c.move(san);
  return c.fen();
}

function expectedPieces(fen) {
  const c = new Chess(fen);
  const out = {};
  for (const f of 'abcdefgh') for (const r of '12345678') {
    const sq = f + r;
    const p = c.get(sq);
    if (p) out[sq] = (p.color === 'w' ? 'w' : 'b') + p.type;
  }
  return out;
}

function pieceFromClass(cls) {
  const m = cls.match(/piece-([wb])([pnbrqk])/);
  return m ? m[1] + m[2] : null;
}

async function main() {
  const lesson = process.argv[2] || '0004-owens-white-long-castle.html';
  const server = spawn('py', ['-m', 'http.server', String(PORT)], { cwd: ROOT, stdio: 'ignore', shell: true });
  try {
    await waitForServer();
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 900, height: 1400 } });
    await page.goto(`http://127.0.0.1:${PORT}/lessons/${lesson}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);

    const boards = await page.evaluate(() => {
      function piecesOnBoard(el) {
        const grid = el.querySelector('.board-b72b1');
        if (!grid) return [];
        const out = [];
        for (const sqEl of grid.querySelectorAll('[data-square]')) {
          const square = sqEl.getAttribute('data-square');
          const piece = sqEl.querySelector('[class*="piece-"]');
          if (piece) out.push({ square, class: piece.className });
        }
        return out;
      }
      return [...document.querySelectorAll('.chesscom-board')].map((el) => ({
        id: el.id,
        moves: el.getAttribute('data-moves'),
        orientation: el.getAttribute('data-orientation'),
        pieces: piecesOnBoard(el),
        highlights: [...el.querySelectorAll('.com-highlight')].map((s) => s.getAttribute('data-square')),
        arrowCount: el.querySelectorAll('.com-board-arrows line').length,
        boardHtmlSnippet: el.querySelector('.board-b72b1')?.innerHTML?.slice(0, 200) || 'no grid'
      }));
    });

    for (const b of boards) {
      const fen = fenFromMoves(b.moves);
      const exp = expectedPieces(fen);
      const dom = {};
      for (const p of b.pieces) dom[p.square] = pieceFromClass(p.class);

      console.log(`\n=== ${b.id} (${b.orientation}) ===`);
      console.log(`Expected FEN: ${fen.split(' ')[0]}`);
      console.log(`DOM pieces: ${b.pieces.length}, arrows: ${b.arrowCount}, highlights: ${b.highlights.join(',')}`);

      const allSq = new Set([...Object.keys(exp), ...Object.keys(dom)]);
      let mismatches = 0;
      for (const sq of [...allSq].sort()) {
        if (exp[sq] !== dom[sq]) {
          console.log(`  MISMATCH ${sq}: expected ${exp[sq] || 'empty'} | DOM ${dom[sq] || 'empty'}`);
          mismatches++;
        }
      }
      if (!mismatches) console.log('  All squares match expected position.');
    }

    await browser.close();
  } finally {
    server.kill();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });