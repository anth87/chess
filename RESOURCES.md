# Chess Improvement (1700 → 2000 Blitz) Resources

## Knowledge

- [ChessBase: Typical mistakes by 1600–1900 players — GM Nicholas Pert](https://en.chessbase.com/post/typical-mistakes-by-1600-1900-players)
  Research-backed mistake themes at your rating band. Use for: leak categories (failed sacrifices, ignoring threats, endgame technique, pawn structure).

- [Chess.com blog: How I Got 2000 — O-O](https://www.chess.com/blog/KingsideCastleNotation/how-i-got-2000-a-guide-for-you)
  Practical training stack (puzzles + rated games + self-review). Use for: daily habit structure, not opening theory.

- [Chess.com: Game Review / Self-Analysis](https://www.chess.com/analysis)
  Review your own games before engine. Use for: post-session homework on games cited in lessons.

- [Chess.com PubAPI — anth87 archives](https://api.chess.com/pub/player/anth87/games/archives)
  Your game history for ongoing personalization. Pattern: `/pub/player/{username}/games/archives` lists months; each month URL returns games with inline PGN. Use for: refreshing leak stats, sourcing lesson case studies.

- [Chess.com: What is the PubAPI?](https://support.chess.com/en/articles/9650547-what-is-the-pubapi-and-how-do-i-use-it)
  Official docs for the public API. Use for: rate limits, available endpoints, archive structure.

- [Chess.com: Pirc Defense — Classical Variation](https://www.chess.com/openings/Pirc-Defense-Classical-Variation)
  Your #1 loss cluster as Black. Use for: Lesson 2+ on Pirc plans.

- [Chess.com: King's Indian — Samisch Variation](https://www.chess.com/openings/Kings-Indian-Defense-Samisch-Variation)
  Your #2 Black leak cluster (Samisch branch). Use for: Lesson 3 on …e5 / …Nc5 / …h6.

- [Chess.com: Owen's Defense](https://www.chess.com/openings/Owens-Defense)
  Your top offbeat White leak (1…b6). Use for: Lesson 4 on Be3 · Qd2 · O-O-O · Bb5.

- [TheChessWorld: Pirc Defense — complete guide for Black](https://thechessworld.com/articles/openings/pirc-defense-complete-guide-for-black/)
  Strategic overview of Classical and Modern systems. Use for: understanding why …c5 and …Ng4 matter vs Bc4.

- [Chess.com: Learn Chess — Checks, Captures, Threats](https://www.chess.com/lessons/learn-chess/capture-pieces)
  Foundational CCT framing. Use for: blunder-check habit in Lesson 1.

## Wisdom (Communities)

- [r/chess](https://www.reddit.com/r/chess/)
  Post a loss PGN and ask "what habit would have prevented this?" Use for: sanity-checking your leak diagnosis.

- [Chess.com forums — Game Analysis](https://www.chess.com/forum/view/game-analysis)
  Community analysis of member games. Use for: second opinions on recurring opening losses.

## Gaps

- No free automated "leak classifier" tuned to your repertoire — we build this incrementally from PubAPI pulls in `./scripts/`.
- Pirc/KID as Black need custom lesson modules (Chess.com opening pages are reference, not a training plan).

## Learner profile

- **anth87** — Chess.com blitz **1705** (best **1948**), 3+0 primary
- **Loss signature:** tactical oversights in complex positions + recurring opening discomfort as **Black** in Pirc/KID
- **Related workspace:** `chess-openings` for Alekhine-as-White prep