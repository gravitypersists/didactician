# Handoff 07 → pedagogy-ux-reviewer (review-pux-1)

## Your role

Read and follow `/Users/m/workspace/didactician/skills/didactician/agents/pedagogy-ux-reviewer.md`. This file is your task.

## Original request (verbatim)

See `/Users/m/workspace/didactician/explainers/didactician/run/brief.md` § Original request.

## Root spec

- Brief: `/Users/m/workspace/didactician/explainers/didactician/run/brief.md`
- Skill base directory: `/Users/m/workspace/didactician/skills/didactician`

## Task

Review round 1, pedagogy and UX. Judge the built page against the brief's audience and objectives, the approved learning plan and its acceptance criteria, and the user's visual direction (d-01). Pay attention to two things: whether a skimming technical reader understands how the system works within the first minute or two, and whether the instructional-design half (cognitive load leading to page decisions) lands for a reader new to learning science. Exercise the widgets and checks at mobile and desktop widths, and in dark mode.

## Inputs (read these; don't expect them pasted)

- `/Users/m/workspace/didactician/explainers/didactician/run/brief.md`
- `/Users/m/workspace/didactician/explainers/didactician/run/plan/learning-plan.md` (approved plan, acceptance criteria, visual direction), `/Users/m/workspace/didactician/explainers/didactician/run/plan/cut-list.md`
- `/Users/m/workspace/didactician/explainers/didactician/site/`: the built page
- `/Users/m/workspace/didactician/explainers/didactician/run/screenshots/page-round-4/`: gate screenshots at 360/768/1280 (full-page, large)
- `/Users/m/workspace/didactician/explainers/didactician/run/gate/page-round-4.json`: gate result (reading time ~10.1 min vs 8 min brief; user's stated ceiling is ~10)
- `/Users/m/workspace/didactician/skills/didactician/references/`: ux-ui.md, widgets.md, graphics.md, learning-science-patterns.md, cognitive-design-patterns.md

## Outputs (write only these)

- `/Users/m/workspace/didactician/explainers/didactician/run/review/round-1/pedagogy-ux.md` in the format of `/Users/m/workspace/didactician/skills/didactician/templates/review.md`
- Probe screenshots may go in `/Users/m/workspace/didactician/explainers/didactician/run/screenshots/probe/`
- Your report goes in your final message, in the format of `/Users/m/workspace/didactician/skills/didactician/templates/report.md`.

## Invariants that apply to you (verbatim; only the user can relax them)

- I1: No horizontal overflow at 360px, unless the user confirmed a mobile waiver
- I2: Static only: no runtime data calls (fetch/XHR/WebSocket/beacon) to undeclared origins, and no backend. CDN loads are fine
- I3: Third-party media is cleared (by licence for the intended use, or by the user) and visibly attributed
- I8: Each agent writes only in its namespace
- I4: Finite animations longer than flair have a replay control
- I6: Carousels don't change height (reflow) between pages
- I7: SVG markers resolve and aren't clipped

## User decisions that apply (quoted from run/decisions.md)

- d-01: "I might not have been explicit enough but give it a flashy visual design. Something that looks education inspired, maybe a bit scientific (not this newfangled edtech look, something more classical)" → visual direction to judge against
- d-02: "Keep all 4 (Recommended)" → four objectives for an 8-min piece are user-accepted; do not raise objective count as a finding
- d-03: "Problem 4 · Predict · k-03 - I'm not sure this is a feature. It seems kind of weird to include and it's actually something I've been trying to fix in this system. Crunched prose, imo, is way worse for instructional design than just having something a little longer. Let's get rid of this check. Other than that, let's approve this!" → k-03 and the retired word-gate story were removed deliberately; the page should not tell it. Length serving clarity is preferred over compression.

## Findings to address (revision rounds only)

- none

## Done when

- [ ] `run/review/round-1/pedagogy-ux.md` exists in the review format with every finding having severity, location and expected fix

## Not your job

- Fact-checking (a separate accuracy reviewer does that); editing the site; writing outside your outputs
