/**
 * Self-contained SVG chess board — no CDN, works from local file://
 * Usage: ChessBoard.render(element, { fen, highlights, pinSquares, arrows, caption })
 */
(function (global) {
  'use strict';

  const FILES = 'abcdefgh';

  const PIECES = {
    K: '\u2654', Q: '\u2655', R: '\u2656', B: '\u2657', N: '\u2658', P: '\u2659',
    k: '\u265A', q: '\u265B', r: '\u265C', b: '\u265D', n: '\u265E', p: '\u265F'
  };

  function parseFen(fen) {
    const ranks = fen.split(' ')[0].split('/');
    return ranks.map((rank) => {
      const row = [];
      for (const ch of rank) {
        if (ch >= '1' && ch <= '8') {
          for (let i = 0; i < +ch; i++) row.push(null);
        } else {
          row.push(ch);
        }
      }
      return row;
    });
  }

  function sqToXY(square) {
    const file = FILES.indexOf(square[0]);
    const rank = 8 - parseInt(square[1], 10);
    return { cx: file + 0.5, cy: rank + 0.5 };
  }

  function render(container, options) {
    const {
      fen,
      highlights = [],
      pinSquares = [],
      arrows = [],
      caption = ''
    } = options;

    const board = parseFen(fen);
    const highlightSet = new Set(highlights.map((s) => s.toLowerCase()));
    const pinSet = new Set(pinSquares.map((s) => s.toLowerCase()));

    const svgNS = 'http://www.w3.org/2000/svg';
    const wrapper = document.createElement('div');
    wrapper.className = 'chess-board';

    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 8 8');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', caption.replace(/<[^>]+>/g, '') || 'Chess position');

    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const sq = FILES[x] + (8 - y);
        const isLight = (x + y) % 2 === 0;
        const rect = document.createElementNS(svgNS, 'rect');
        rect.setAttribute('x', x);
        rect.setAttribute('y', y);
        rect.setAttribute('width', 1);
        rect.setAttribute('height', 1);
        let cls = isLight ? 'sq-light' : 'sq-dark';
        if (pinSet.has(sq)) cls = 'sq-pin';
        else if (highlightSet.has(sq)) cls = 'sq-highlight';
        rect.setAttribute('class', cls);
        svg.appendChild(rect);
      }
    }

    arrows.forEach((arrow) => {
      const from = sqToXY(arrow.from);
      const to = sqToXY(arrow.to);
      const line = document.createElementNS(svgNS, 'line');
      line.setAttribute('x1', from.cx);
      line.setAttribute('y1', from.cy);
      line.setAttribute('x2', to.cx);
      line.setAttribute('y2', to.cy);
      line.setAttribute('class', 'pin-line');
      svg.appendChild(line);
    });

    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const piece = board[y][x];
        if (!piece) continue;
        const text = document.createElementNS(svgNS, 'text');
        text.setAttribute('x', x + 0.5);
        text.setAttribute('y', y + 0.68);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('font-size', '0.78');
        text.setAttribute('class', 'piece-glyph');
        text.textContent = PIECES[piece];
        svg.appendChild(text);
      }
    }

    for (let i = 0; i < 8; i++) {
      const fileLabel = document.createElementNS(svgNS, 'text');
      fileLabel.setAttribute('x', i + 0.05);
      fileLabel.setAttribute('y', 7.88);
      fileLabel.setAttribute('font-size', '0.28');
      fileLabel.setAttribute('class', 'coord');
      fileLabel.textContent = FILES[i];
      svg.appendChild(fileLabel);

      const rankLabel = document.createElementNS(svgNS, 'text');
      rankLabel.setAttribute('x', 0.05);
      rankLabel.setAttribute('y', i + 0.22);
      rankLabel.setAttribute('font-size', '0.28');
      rankLabel.setAttribute('class', 'coord');
      rankLabel.textContent = 8 - i;
      svg.appendChild(rankLabel);
    }

    wrapper.appendChild(svg);

    if (caption) {
      const cap = document.createElement('p');
      cap.className = 'chess-board-caption';
      cap.innerHTML = caption;
      wrapper.appendChild(cap);
    }

    container.innerHTML = '';
    container.appendChild(wrapper);
  }

  global.ChessBoard = { render, parseFen };
})(typeof window !== 'undefined' ? window : globalThis);