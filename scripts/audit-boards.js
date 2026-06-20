#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { Chess } = require('chess.js');

const lessonsDir = path.join(__dirname, '..', 'lessons');

function fenFromMoves(moves) {
  const c = new Chess();
  for (const san of moves.trim().split(/\s+/)) c.move(san);
  return c.fen();
}

function pieceMap(fen) {
  const c = new Chess(fen);
  const m = {};
  for (const f of 'abcdefgh') {
    for (const r of '12345678') {
      const sq = f + r;
      const p = c.get(sq);
      if (p) m[sq] = (p.color === 'w' ? 'W' : 'B') + p.type.toUpperCase();
    }
  }
  return m;
}

function getAttr(tag, attr) {
  const dbl = tag.match(new RegExp(`${attr}="([^"]*)"`, 'i'));
  if (dbl) return dbl[1];
  const sgl = tag.match(new RegExp(`${attr}='([^']*)'`, 'i'));
  return sgl ? sgl[1] : null;
}

for (const file of fs.readdirSync(lessonsDir).filter((f) => f.endsWith('.html'))) {
  const html = fs.readFileSync(path.join(lessonsDir, file), 'utf8');
  const re = /<div[^>]*class="chesscom-board"[^>]*>/gi;
  let m;
  console.log(`=== ${file} ===`);
  while ((m = re.exec(html)) !== null) {
    const tag = m[0];
    const id = getAttr(tag, 'id') || 'unknown';
    const moves = getAttr(tag, 'data-moves');
    const fen = fenFromMoves(moves);
    const arrows = getAttr(tag, 'data-arrows');
    const hl = getAttr(tag, 'data-highlight');
    const orient = getAttr(tag, 'data-orientation');
    console.log(`${id} | orient=${orient} | ${moves.split(/\s+/).length} plies`);
    console.log(`  ${fen.split(' ')[0]}`);
    if (arrows) console.log(`  arrows: ${arrows}`);
    if (hl) {
      const pm = pieceMap(fen);
      for (const sq of hl.split(',')) {
        const s = sq.trim();
        console.log(`  highlight ${s}: ${pm[s] || 'EMPTY (target)'}`);
      }
    }
    if (arrows) {
      const pm = pieceMap(fen);
      for (const a of JSON.parse(arrows)) {
        console.log(`  arrow ${a.from}->${a.to}: from=${pm[a.from] || 'EMPTY'}`);
      }
    }
    console.log(chessAscii(fen));
    console.log('');
  }
}

function chessAscii(fen) {
  const c = new Chess(fen);
  return c.ascii();
}