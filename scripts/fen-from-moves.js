#!/usr/bin/env node
/**
 * Derive a verified FEN from a SAN move list.
 * Usage: node scripts/fen-from-moves.js "e4 c5 Nf3 ... Qxf6"
 */
const { Chess } = require('chess.js');

const moves = process.argv[2];
if (!moves) {
  console.error('Usage: node scripts/fen-from-moves.js "<SAN moves>"');
  process.exit(1);
}

const chess = new Chess();
for (const san of moves.trim().split(/\s+/)) {
  const result = chess.move(san);
  if (!result) {
    console.error(`Invalid move: ${san}`);
    console.error(`Position: ${chess.fen()}`);
    console.error(`Legal: ${chess.moves().join(', ')}`);
    process.exit(1);
  }
}

console.log(chess.fen());
console.log(chess.ascii());