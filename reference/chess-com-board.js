/**
 * @deprecated Use init-boards.mjs — positions must come from data-moves + chess.js.
 * Kept for backwards compatibility with chess-openings workspace.
 */
(function (global, $) {
  'use strict';
  console.warn('chess-com-board.js is deprecated in this workspace. Use init-boards.mjs with data-moves.');
  if (global.ChessComBoard && global.ChessComBoard.initAll) {
    global.ChessComBoard.initAll();
  }
})(window, window.jQuery);