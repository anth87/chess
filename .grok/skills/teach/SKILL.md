---
name: teach
description: >
  Stateful, multi-session teaching framework. Use when the user wants to learn
  a skill or concept across sessions, requests a lesson, asks for a learning plan,
  or invokes /teach. Grounds all teaching in MISSION.md, tracks progress in
  ./learning-records/, and delivers self-contained HTML lessons in ./lessons/.
---

# Teaching Workspace

This skill turns the workspace into a structured learning environment for multi-session teaching. Before writing a single lesson, ground everything in the mission.

## Workspace structure

| Path | Purpose |
|------|---------|
| `MISSION.md` | Why the user is learning this — the real-world goal that drives all decisions |
| `RESOURCES.md` | Curated, trusted sources. Pull knowledge from here, not from parametric guesses |
| `GLOSSARY.md` | Canonical compressed definitions. Add a term only once the user understands it |
| `./learning-records/` | ADR-style records of genuine understanding and prior knowledge |
| `./lessons/*.html` | Self-contained, beautiful HTML lessons — one concept each |
| `./reference/` | Quick-lookup cheat sheets for long-term review |
| `./assets/` | Reusable components (CSS, JS, partials) shared across lessons |

Use the format files alongside this skill:
- `MISSION-FORMAT.md` — how to write `MISSION.md`
- `RESOURCES-FORMAT.md` — how to write `RESOURCES.md`
- `GLOSSARY-FORMAT.md` — how to write `GLOSSARY.md`
- `LEARNING-RECORD-FORMAT.md` — how to write learning records

## Session start protocol

1. **Read `MISSION.md`** — if it doesn't exist, interview the user before doing anything else. A session without a mission is directionless.
2. **Read all learning records** — to establish the zone of proximal development (ZPD). What is already known sets the floor; the mission sets the ceiling.
3. **Read `RESOURCES.md`** — surface the right sources before designing any lesson. If `RESOURCES.md` doesn't exist yet, note which areas lack trusted sources.

Never teach from parametric memory alone. Always anchor to `RESOURCES.md`.

## Teaching philosophy

Learning has three dimensions:

- **Knowledge** — facts and concepts, sourced from trusted references. Clarity is paramount here; confusion impedes acquisition.
- **Skills** — practiced abilities built through effortful retrieval. Difficulty is a feature, not a bug. Interactive feedback loops must be as immediate as possible.
- **Wisdom** — judgment developed through real-world application in communities. Point the user toward communities where they can apply what they've learned.

### Storage strength over fluency strength

**Fluency strength**: how fast something comes to mind right now.
**Storage strength**: how durably it is encoded for later.

The two are inversely related in the short term — easy retrieval feels good but builds little. Design lessons for storage strength using **desirable difficulty**:

- **Retrieval practice**: make the user recall rather than re-read
- **Spacing**: revisit earlier concepts across sessions, not just within one
- **Interleaving**: mix related problem types rather than blocking by topic

## Zone of proximal development (ZPD)

Every lesson should sit just beyond what the user can do unaided. Derive the ZPD from:
1. Learning records (what they've demonstrated understanding of)
2. The mission (what they're ultimately trying to accomplish)
3. Direct observation in the session (what they can and can't do right now)

Too easy → no storage strength gained. Too hard → comprehension breaks down. The edge is the target.

## Lesson design

Lessons live in `./lessons/*.html`. Each lesson:

- Teaches **one concept**
- Is **brief and completable quickly** (aim for under 15 minutes)
- Is **visually beautiful** — Tufte-inspired typography, generous whitespace, clear hierarchy
- Ties directly to the **mission** — the user should be able to answer "why am I learning this?"
- Lives within the **ZPD** — challenging but not opaque
- Cites **primary sources** from `RESOURCES.md`
- Is **interactive** where the topic is a skill (not just knowledge)

Shared assets (CSS reset, fonts, syntax highlighting) go in `./assets/` so lessons stay DRY.

## Learning records

Write a learning record when:
- The user demonstrates genuine understanding of something non-trivial
- The user discloses prior knowledge
- A misconception is corrected
- The mission shifts in response to learning

Do **not** write records for material merely covered. Coverage is not learning.

Format: `./learning-records/NNNN-slug.md` (sequential numbering). See `LEARNING-RECORD-FORMAT.md`.

## Glossary

Add a term to `GLOSSARY.md` only once the user can use it correctly — not when they've just heard it. The glossary is a record of compressed knowledge, not a reading list.

See `GLOSSARY-FORMAT.md` for format.

## What not to do

- **Do not teach without a mission.** Interview first.
- **Do not rely on parametric memory for facts.** Cross-check against `RESOURCES.md`.
- **Do not write a learning record for exposure.** Wait for evidence of understanding.
- **Do not design lessons beyond the ZPD.** Confusion is not difficulty — it's a design failure.
- **Do not skip the session start protocol**, even if continuing from a previous session.
