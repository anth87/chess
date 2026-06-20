#!/usr/bin/env node
/**
 * Semantic checks lesson boards: highlights exist, arrow origins have pieces,
 * orientation matches data-orientation attribute.
 */
const fs = require('fs');
const path = require('path');
const { Chess } = require('chess.js');

const lessonsDir = path.join(__dirname, '..', 'lessons');
const files = fs.readdirSync(lessonsDir).filter((f) => f.endsWith('.html'));

const FILES = 'abcdefgh';
const RANKS = '12345678';

function fenFromMoves(moves) {
  const chess = new Chess();
  for (const san of moves.trim().split(/\s+/)) {
    const result = chess.move(san);
    if (!result) throw new Error(`Invalid move "${san}" at ${chess.fen()}`);
  }
  return chess.fen();
}

function resolveFen(board) {
  if (board.moves) return fenFromMoves(board.moves);
  if (board.fen) return board.fen;
  throw new Error('no data-moves or data-fen');
}

function squareValid(sq) {
  return sq && sq.length === 2 && FILES.includes(sq[0]) && RANKS.includes(sq[1]);
}

function pieceAt(fen, square) {
  const board = new Chess(fen);
  return board.get(square);
}

function fileRank(sq) {
  return { f: FILES.indexOf(sq[0]), r: RANKS.indexOf(sq[1]) };
}

/** Arrow must follow the movement pattern of the piece on `from`. */
function arrowMatchesPiece(from, to, piece) {
  const a = fileRank(from);
  const b = fileRank(to);
  const df = Math.abs(a.f - b.f);
  const dr = Math.abs(a.r - b.r);
  if (!df && !dr) return false;

  switch (piece.type) {
    case 'b':
      return df === dr;
    case 'r':
      return df === 0 || dr === 0;
    case 'q':
      return df === dr || df === 0 || dr === 0;
    case 'n':
      return (df === 2 && dr === 1) || (df === 1 && dr === 2);
    case 'k':
      return df <= 1 && dr <= 1;
    case 'p': {
      const forward = piece.color === 'w' ? b.r - a.r : a.r - b.r;
      if (df === 0 && (forward === 1 || forward === 2)) return true;
      if (df === 1 && forward === 1) return true;
      return false;
    }
    default:
      return true;
  }
}

function extractBoards(html) {
  const boards = [];
  const re = /<div[^>]*class="chesscom-board"[^>]*>/gi;
  let match;
  while ((match = re.exec(html)) !== null) {
    const tag = match[0];
    const get = (attr) => {
      const dbl = tag.match(new RegExp(`${attr}="([^"]*)"`, 'i'));
      if (dbl) return dbl[1];
      const sgl = tag.match(new RegExp(`${attr}='([^']*)'`, 'i'));
      return sgl ? sgl[1] : null;
    };
    const arrowsRaw = get('data-arrows');
    let arrows = [];
    if (arrowsRaw) {
      try { arrows = JSON.parse(arrowsRaw); } catch { arrows = null; }
    }
    boards.push({
      id: (tag.match(/id="([^"]*)"/i) || [])[1] || `board-${boards.length + 1}`,
      fen: get('data-fen'),
      moves: get('data-moves'),
      orientation: get('data-orientation') || 'white',
      highlight: (get('data-highlight') || '').split(',').map((s) => s.trim()).filter(Boolean),
      arrows: arrows
    });
  }
  return boards;
}

let failed = 0;
let checked = 0;

for (const file of files) {
  const html = fs.readFileSync(path.join(lessonsDir, file), 'utf8');
  const boards = extractBoards(html);
  if (!boards.length) continue;

  console.log(`${file}:`);

  for (const board of boards) {
    checked++;
    const label = board.id;

    try {
      const fen = resolveFen(board);

      for (const sq of board.highlight) {
        if (!squareValid(sq)) {
          console.log(`  FAIL  ${label}  highlight "${sq}" is not valid algebraic notation`);
          failed++;
        } else if (!pieceAt(fen, sq)) {
          console.log(`  WARN  ${label}  highlight ${sq} is empty — confirm this is intentional`);
        }
      }

      if (board.arrows === null) {
        console.log(`  FAIL  ${label}  data-arrows JSON is malformed`);
        failed++;
        continue;
      }

      for (const arrow of board.arrows) {
        if (!squareValid(arrow.from) || !squareValid(arrow.to)) {
          console.log(`  FAIL  ${label}  arrow ${arrow.from}->${arrow.to} uses invalid squares`);
          failed++;
          continue;
        }
        const fromPiece = pieceAt(fen, arrow.from);
        if (!fromPiece) {
          console.log(`  FAIL  ${label}  arrow ${arrow.from}->${arrow.to} starts on empty square`);
          failed++;
        } else if (!arrowMatchesPiece(arrow.from, arrow.to, fromPiece)) {
          const tag = `${fromPiece.color === 'w' ? 'w' : 'b'}${fromPiece.type}`;
          console.log(`  FAIL  ${label}  arrow ${arrow.from}->${arrow.to} is illegal for ${tag} on ${arrow.from}`);
          failed++;
        }
        if (arrow.from === arrow.to) {
          console.log(`  FAIL  ${label}  arrow ${arrow.from}->${arrow.to} has identical endpoints`);
          failed++;
        }
      }

      if (!['white', 'black'].includes(board.orientation)) {
        console.log(`  FAIL  ${label}  data-orientation must be "white" or "black"`);
        failed++;
      }

      console.log(`  OK    ${label}  ${board.highlight.length} highlight(s), ${board.arrows.length} arrow(s)`);
    } catch (err) {
      console.log(`  FAIL  ${label}  ${err.message}`);
      failed++;
    }
  }
}

if (failed > 0) {
  console.error(`\n${failed} semantic check(s) failed.`);
  process.exit(1);
}

console.log(`\nAll ${checked} board(s) passed semantic checks.`);