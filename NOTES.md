# Teaching Notes

## User preferences
- Wants **understanding** over rote memorization
- Plays **Chess.com 3+0 blitz** (~1700; peak ~1948)
- Chess.com username: **anth87**
- Wants hyper-personalized lessons from **game history**
- Liked Chess.com-style boards and local HTTP server from `chess-openings` workspace
- **Board annotations must be chess-legal and match the caption** — no decorative arrows, no wrong bishop (e.g. f1 for Be3). Wrong boards are distracting and block learning; verify before calling a lesson ready.

## Context
- Separate from `chess-openings` (Alekhine as White repertoire)
- This workspace: holistic 1700 → 2000 blitz improvement

## Game-data snapshot (2026-03 → 2026-06, 342 blitz games)
- Record in sample: ~50% (wins ≈ losses)
- Loss termination: resigned ~53%, checkmated ~26%, timeout ~10%
- **Top loss openings (Black):** Pirc (Modern + Classical), KID, Petroff
- **Top loss openings (White):** Philidor, Owen's Defense, Berlin/Zukertort, Caro-Kann sidelines
- Average accuracy (when reported): ~74%

## Session log
- **2026-06-12**: Workspace initialized. Pulled anth87 archives via Chess.com PubAPI. Lesson 1: personalized leak map + CCT blunder-check habit, using live Sicilian loss (vs NejsemNikdo, 2026-06-12).
- **2026-06-12**: User confirmed Chess.com username **anth87**. Game history via `https://api.chess.com/pub/player/anth87/games/archives` → monthly endpoints with PGN inline.
- **2026-06-12**: Lesson 1 board was empty — root cause was **invalid FEN** (ranks with 9 squares). Fixed position; `chess-com-board.js` now validates FEN and falls back to SVG.
- **2026-06-12**: Board still wrong after first fix — hand-built FEN had **white pawn on f6 instead of black queen**. Fix: positions now derived from `data-moves` via chess.js (`init-boards.mjs`). Run `npm run verify-boards` before publishing lessons.
- **2026-06-12**: Lesson 2 created — Pirc Classical center strike (…Ng4 + …c5 mantra), case study vs XAXAXAXAXA6 (169959119948).
- **2026-06-12**: Lesson 2 black-oriented arrows were misaligned — `sqCenter` y-axis flip fixed to match chessboard.js. Board 2 arrow changed to c7→c6→c5 (legal pawn path).
- **2026-06-12**: Arrow/highlight overlay rewritten — positions measured from live DOM squares inside `.board-b72b1` (no algebraic coordinate math). `npm run verify-overlays` browser-checks alignment. Highlights: board 1 = g4,e5; board 2 = c7,h6.
- **2026-06-13**: Lesson 3 created — KID Samisch don't bite on g4 (…e5 · …Nc5 · …h6 · …b5 mantra), case study vs irerie (169729761620). `verify-board-overlays.js` generalized to scan all lessons.
- **2026-06-13**: Lesson 4 created — Owen's long castle first (Be3 · Qd2 · O-O-O · Bb5 mantra), contrast win vs ssharipov (165392932390) vs loss vs jirias (169388691554).
- **2026-06-13**: Added `.grok/skills/chess-lesson-boards` skill + `verify-board-semantics.js` — mandatory 3-step verification (FEN, semantics, browser overlays) before publishing lesson boards.