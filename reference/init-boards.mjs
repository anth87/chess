/**
 * Lesson board initializer — positions derived from data-moves (source of truth).
 * Arrows/highlights use live DOM square positions (never hand-mapped coordinates).
 */
import { Chess } from './vendor/chess-1.4.0.esm.js';

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

function resolvePosition(el) {
  const moves = el.getAttribute('data-moves');
  const fenAttr = el.getAttribute('data-fen');

  if (moves) {
    const computed = fenFromMoves(moves);
    if (fenAttr) {
      const a = fenAttr.split(' ')[0];
      const b = computed.split(' ')[0];
      if (a !== b) {
        console.error('Board FEN mismatch — using data-moves (authoritative):', {
          element: el.id,
          dataFen: fenAttr,
          computed
        });
      }
    }
    return computed;
  }

  if (fenAttr) {
    const chess = new Chess(fenAttr);
    return chess.fen();
  }

  throw new Error(`Board #${el.id || '(no id)'} needs data-moves or data-fen`);
}

function parseArrows(el) {
  const raw = el.getAttribute('data-arrows');
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error('Invalid data-arrows JSON on', el.id, e);
    return [];
  }
}

function boardGridEl(boardId) {
  return document.querySelector(`#${boardId} .board-b72b1`);
}

/** Map a rendered square's centre to 0–8 SVG space on the 8×8 grid. */
function squareCenterInSvg(boardId, square) {
  const grid = boardGridEl(boardId);
  const sqEl = grid && grid.querySelector(`[data-square="${square}"]`);
  if (!grid || !sqEl) {
    console.error(`Board overlay: square ${square} not found on #${boardId}`);
    return null;
  }
  const sq = sqEl.getBoundingClientRect();
  const box = grid.getBoundingClientRect();
  if (!box.width || !box.height) return null;
  return {
    x: ((sq.left + sq.width / 2) - box.left) / box.width * 8,
    y: ((sq.top + sq.height / 2) - box.top) / box.height * 8
  };
}

function removeArrows(boardId) {
  const grid = boardGridEl(boardId);
  if (grid) grid.querySelectorAll('.com-board-arrows').forEach((el) => el.remove());
}

function drawArrows(boardId, arrows) {
  removeArrows(boardId);
  if (!arrows.length) return;

  const grid = boardGridEl(boardId);
  if (!grid) return;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'com-board-arrows');
  svg.setAttribute('viewBox', '0 0 8 8');
  svg.setAttribute('preserveAspectRatio', 'none');

  let drawn = 0;
  arrows.forEach((arrow) => {
    const from = squareCenterInSvg(boardId, arrow.from);
    const to = squareCenterInSvg(boardId, arrow.to);
    if (!from || !to) return;
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', from.x);
    line.setAttribute('y1', from.y);
    line.setAttribute('x2', to.x);
    line.setAttribute('y2', to.y);
    line.setAttribute('class', 'arrow-line');
    svg.appendChild(line);
    drawn++;
  });

  if (drawn > 0) {
    grid.style.position = 'relative';
    grid.appendChild(svg);
  }
}

function applyHighlights(boardId, squares, $) {
  squares.forEach((sq) => {
    const $sq = $(`#${boardId} [data-square="${sq}"]`);
    if (!$sq.length) {
      console.error(`Board overlay: cannot highlight missing square ${sq} on #${boardId}`);
      return;
    }
    $sq.addClass('com-highlight');
  });
}

function initBoard(el, $) {
  const $el = $(el);
  const boardId = el.id || `board-${Math.random().toString(36).slice(2, 8)}`;
  if (!el.id) el.id = boardId;

  let fen;
  try {
    fen = resolvePosition(el);
  } catch (err) {
    console.error(err);
    el.innerHTML = `<p class="board-error">Board failed to load: ${err.message}</p>`;
    return null;
  }

  const piecePath = el.getAttribute('data-piece-path') || '../reference/pieces/wikipedia/{piece}.png';
  const highlight = (el.getAttribute('data-highlight') || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const arrows = parseArrows(el);
  const caption = el.getAttribute('data-caption') || '';
  const orientation = el.getAttribute('data-orientation') === 'black' ? 'black' : 'white';

  $el.wrap('<div class="com-board-wrap"></div>');
  $el.parent().wrap('<div class="com-board-outer"></div>');

  const $wrap = $el.parent('.com-board-wrap');
  const wrapEl = $wrap[0];
  const boardWidth = Math.min($el.closest('.board-wrap').width() || 480, 480);

  const board = window.Chessboard(boardId, {
    position: fen,
    orientation,
    draggable: false,
    showNotation: true,
    pieceTheme: piecePath,
    width: boardWidth
  });

  const renderOverlay = () => {
    applyHighlights(boardId, highlight, $);
    drawArrows(boardId, arrows);
  };

  // Wait for chessboard.js to lay out squares before measuring DOM.
  requestAnimationFrame(() => requestAnimationFrame(renderOverlay));

  if (caption) {
    $el.closest('.com-board-outer').append(
      $('<p class="com-board-caption"></p>').html(caption)
    );
  }

  $(window).on('resize', () => {
    const w = Math.min($el.closest('.com-board-outer').width() || 480, 480);
    board.resize(w);
    requestAnimationFrame(() => requestAnimationFrame(renderOverlay));
  });

  return board;
}

function initAll() {
  const $ = window.jQuery;
  if (!$ || !window.Chessboard) {
    console.error('init-boards: jQuery and Chessboard must load before init-boards.mjs');
    return;
  }
  document.querySelectorAll('.chesscom-board').forEach((el) => initBoard(el, $));
}

initAll();