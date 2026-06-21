---
name: chess-lesson-boards
description: >
  Mandatory workflow for creating or editing chess lesson boards in this workspace.
  Use when building lessons, fixing board/FEN/arrow/highlight mistakes, publishing HTML
  lessons under ./lessons/, or when the user reports wrong pieces, squares, or arrows.
  Triggers: "board is wrong", "arrows misaligned", "FEN", "chess board", lesson HTML,
  /chess-lesson-boards, /verify-boards.
---

# Chess Lesson Boards — Zero-Mistake Workflow

This workspace renders boards via `reference/init-boards.mjs` + chessboard.js. **Hand-built FENs and coordinate math caused every past board bug.** Follow this workflow exactly; never skip verification.

## Golden rules

1. **`data-moves` is the only source of truth** for piece placement. Copy SAN from the user's PGN (PubAPI or lesson case study). Never invent or edit FEN by hand.
2. **Derive `data-fen` from moves** — do not guess it:
   ```bash
   cd <workspace-root>
   node scripts/fen-from-moves.js "e4 b6 d4 Bb7 Nc3 e6 Be3 d6 Qd2 Qd7 O-O-O"
   ```
   Paste the output into `data-fen`. If it disagrees with `data-moves`, fix `data-moves` — not the FEN.
3. **Never compute arrow/highlight pixel positions.** Use algebraic squares only (`data-arrows`, `data-highlight`). `init-boards.mjs` maps squares via live DOM.
4. **Arrows must start on the piece that plays the move** — and follow that piece's movement pattern. Example: `4.Be3` is the **c1** bishop (`c1→e3`), not f1. `7.Bb5` after `6.Be3` is the **f1** bishop (`f1→b5`), not e3. `verify-board-semantics.js` rejects illegal arrows (e.g. f1→e3 for a bishop).
5. **No decorative arrows.** Every arrow must illustrate a move or threat **named in the caption or the paragraph directly above the board**. If the caption says "Next: Bb5", the arrow must be `f1→b5` (or omit the arrow and highlight `f1` only). Never draw "bishop scope" lines to random squares (e.g. e3→h6).
6. **Highlights name lesson-critical squares** (mantra pieces, mistake squares). Empty highlights are allowed only when marking a target square (e.g. `e3` when showing where Be3 should go).
7. **`data-orientation`** must match the learner's view: `black` when teaching Black's plans, `white` when teaching White's.
8. **Default: fewer annotations.** One arrow maximum unless the lesson explicitly needs two. When in doubt, highlight squares only — no arrow.

## Board HTML template

```html
<div id="board-unique-id"
     class="chesscom-board"
     data-orientation="white"
     data-moves="e4 b6 d4 Bb7 Nc3 e6 Be3 d6 Qd2 Qd7 O-O-O"
     data-fen="<paste output of fen-from-moves.js>"
     data-highlight="e3,d2,c1,d1,f1"
     data-arrows='[{"from":"d1","to":"d6"}]'
     data-caption="After &lt;strong&gt;6.O-O-O&lt;/strong&gt; — short caption."
     data-piece-path="../reference/pieces/wikipedia/{piece}.png"
     aria-label="Human-readable position description">
</div>
```

Required sibling assets in every lesson:
- `../reference/vendor/jquery-3.7.1.min.js`
- `../reference/vendor/chessboard-1.0.0.min.js` + `.min.css`
- `../reference/chess-com-board.css`
- `../reference/init-boards.mjs` (type="module")

## Arrow & highlight checklist (before commit)

For each board, answer these from the computed position (use `fen-from-moves.js` + mental board, or chess.com analysis):

| Check | Pass criteria |
|-------|---------------|
| Position | Every piece matches the cited game at that move number |
| Move list | SAN is legal in sequence; no clocks/comments in `data-moves` |
| Highlights | Each square is valid (`a1`–`h8`); highlighted squares are the ones named in the caption |
| Arrows | `from` square has the piece/color that should move or aim along that line |
| Arrows | `to` square is the tactical/positional target named in the lesson text |
| Orientation | Flipping the board would not contradict "you are White/Black" in the prose |
| Caption | Matches the position (move number, side to move, key mantra move) |

Common semantic errors to avoid (all blocked the user’s learning):
- **`f1→e3` for Be3** — wrong bishop; use `c1→e3`
- **`e3→h6` as decoration** — not a lesson move; remove or replace with the move the caption names
- Arrow from a square that is **empty** when showing a move not yet played — highlight the target square instead
- Highlighting **wrong mantra squares** (off by one file/rank)
- **Illegal move strings** (missing capture symbol, wrong castling side)
- **White/black orientation flip** making arrows appear mirrored to the reader

## Mandatory: update the leak map for every new lesson

When publishing a new lesson, always add it to the **Lesson queue** ordered list in `reference/leak-map.html` before announcing the lesson to the user:

```html
<li><a href="../lessons/000N-slug.html">Opening — short mantra</a></li>
```

Also add the lesson to the `LESSONS` array in `reference/lesson-nav.js` so it appears in the sidebar.

## Mandatory verification (run all three)

From workspace root:

```bash
npm run verify-lessons
```

This runs, in order:
1. `verify-lesson-boards.js` — FEN loads; `data-fen` matches `data-moves`
2. `verify-board-semantics.js` — highlights valid; arrow origins have pieces; JSON well-formed
3. `verify-board-overlays.js` — Playwright: arrow endpoints land inside correct squares in a real browser

**All three must exit 0 before you tell the user the lesson is ready.** If any fail, fix and re-run. Do not publish on failure.

## Human gate (required — automation is not enough)

After `npm run verify-lessons`, you must manually confirm each arrow against the caption:

1. Read the caption aloud as a move (e.g. "4.Be3" → which bishop, which squares?).
2. If you cannot justify the arrow in one sentence tied to the caption, **delete the arrow**.
3. Do not announce the lesson to the user until this gate passes.

The user has said wrong boards are **distracting for learning** — treat a bad arrow as a ship-blocking bug, not a polish item.

## Visual smoke test (required for new/changed boards)

```bash
pwsh -File open-lesson.ps1   # update the filename inside to the lesson under test
```

Or manually:
```bash
py -m http.server 8765
# open http://localhost:8765/lessons/<lesson-file>.html
```

Confirm with your own eyes:
- Pieces sit on correct squares (compare to Chess.com game link in the lesson)
- Arrow tips land on the intended squares (not adjacent files)
- Highlights ring the squares named in the caption
- Piece images load (not blank squares)

## Saving verified positions

After verification, optionally snapshot to `data/positions/<gameId>-<slug>.json`:

```json
{
  "gameId": "165392932390",
  "moves": "e4 b6 d4 Bb7 Nc3 e6 Be3 d6 Qd2 Qd7 O-O-O",
  "fen": "<verified fen>"
}
```

## When the user reports a wrong board

1. Read the cited game PGN from Chess.com PubAPI (do not trust memory).
2. Regenerate `data-moves` and `data-fen` from that PGN.
3. Rebuild arrows/highlights from the **semantic checklist** above.
4. Run `npm run verify-lessons`.
5. Open the lesson in the browser and confirm visually.

## Reference files

- Board init: `reference/init-boards.mjs`
- Styles: `reference/chess-com-board.css`
- Past incident log: `NOTES.md` (Session log — FEN/arrow bugs)