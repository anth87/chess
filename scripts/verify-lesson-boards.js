#!/usr/bin/env node
/**
 * Verify every lesson board: FEN loads in chess.js and matches data-moves when present.
 */
const fs = require('fs');
const path = require('path');
const { Chess } = require('chess.js');

const lessonsDir = path.join(__dirname, '..', 'lessons');
const files = fs.readdirSync(lessonsDir).filter((f) => f.endsWith('.html'));

function fenFromMoves(moves) {
  const chess = new Chess();
  for (const san of moves.trim().split(/\s+/)) {
    const result = chess.move(san);
    if (!result) {
      throw new Error(`Invalid move "${san}" at ${chess.fen()}`);
    }
  }
  return chess.fen();
}

function extractBoards(html) {
  const boards = [];
  const re = /<div[^>]*class="chesscom-board"[^>]*>/gi;
  let match;
  while ((match = re.exec(html)) !== null) {
    const tag = match[0];
    const get = (attr) => {
      const m = tag.match(new RegExp(`${attr}="([^"]*)"`, 'i'));
      return m
        ? m[1].replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
        : null;
    };
    boards.push({
      id: (tag.match(/id="([^"]*)"/i) || [])[1] || `board-${boards.length + 1}`,
      fen: get('data-fen'),
      moves: get('data-moves')
    });
  }
  return boards;
}

let failed = 0;
let total = 0;

for (const file of files) {
  const html = fs.readFileSync(path.join(lessonsDir, file), 'utf8');
  const boards = extractBoards(html);
  if (!boards.length) continue;

  console.log(`${file}:`);

  for (const board of boards) {
    total++;
    process.stdout.write(`  ${board.id}: `);

    if (!board.fen && !board.moves) {
      console.log('SKIP — no data-fen or data-moves');
      continue;
    }

    try {
      if (board.moves) {
        const computed = fenFromMoves(board.moves);
        const computedBoard = computed.split(' ')[0];
        if (board.fen) {
          const givenBoard = board.fen.split(' ')[0];
          if (givenBoard !== computedBoard) {
            console.log('FAIL — FEN does not match data-moves');
            console.log(`    given:    ${board.fen}`);
            console.log(`    computed: ${computed}`);
            failed++;
            continue;
          }
        }
        new Chess(computed);
        console.log(`OK (${computedBoard.slice(0, 28)}…)`);
      } else {
        new Chess(board.fen);
        console.log(`OK fen-only (${board.fen.split(' ')[0].slice(0, 28)}…)`);
      }
    } catch (err) {
      console.log(`FAIL — ${err.message}`);
      failed++;
    }
  }
}

if (failed > 0) {
  console.error(`\n${failed} of ${total} board(s) failed verification.`);
  process.exit(1);
}

console.log(`\nAll ${total} lesson board(s) verified.`);