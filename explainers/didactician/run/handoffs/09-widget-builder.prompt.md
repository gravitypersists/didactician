# Handoff 09 → widget-builder (fix-r1-widget)

## Your role

Read and follow `/Users/m/workspace/didactician/skills/didactician/agents/widget-builder.md`. This file is your task (a revision round, same session as handoff 05).

## Original request (verbatim)

See `/Users/m/workspace/didactician/explainers/didactician/run/brief.md` § Original request.

## Root spec

- Brief: `/Users/m/workspace/didactician/explainers/didactician/run/brief.md`
- Skill base directory: `/Users/m/workspace/didactician/skills/didactician`

## Task

Address the round-1 review findings below that belong to w-pipeline, and give each a disposition: `fixed`, `disputed` (with evidence), or `blocked`. The full text of each finding is in `/Users/m/workspace/didactician/explainers/didactician/run/review/round-1/findings.md`. The page builder is fixing page-owned items in parallel. One of them is P-02, which tightens the hero so Plate I sits higher at 1280×800. Don't change the mount contract; report a needed change as a concern.

## Inputs (read these; don't expect them pasted)

- `/Users/m/workspace/didactician/explainers/didactician/run/review/round-1/findings.md`: findings (round 1)
- `/Users/m/workspace/didactician/explainers/didactician/run/review/round-1/accuracy.md`, `pedagogy-ux.md`
- `/Users/m/workspace/didactician/explainers/didactician/run/screenshots/probe/`: the reviewers' evidence
- `/Users/m/workspace/didactician/skills/didactician/SKILL.md` (around line 183, for what each reviewer receives; needed for A-01)

## Outputs (write only these)

- `/Users/m/workspace/didactician/explainers/didactician/site/widgets/w-pipeline/`
- Your report goes in your final message, in the format of `/Users/m/workspace/didactician/skills/didactician/templates/report.md`, with a `dispositions:` list giving one line per finding ID.

## Invariants that apply to you (verbatim; only the user can relax them)

- I1: No horizontal overflow at 360px, unless the user confirmed a mobile waiver
- I2: Static only: no runtime data calls (fetch/XHR/WebSocket/beacon) to undeclared origins, and no backend. CDN loads are fine
- I4: Finite animations longer than flair have a replay control
- I6: Carousels don't change height (reflow) between pages
- I7: SVG markers resolve and aren't clipped
- I8: Each agent writes only in its namespace

## User decisions that apply (quoted from run/decisions.md)

- d-01: classical-scientific visual direction (unchanged)
- d-03: no word-gate story anywhere

## Findings to address (revision rounds only)

- A-01 (should): the Rule 1 overlay label lists reviewer inputs incorrectly (the page builder fixes the step prose)
- P-04 (should): "format" label on the findings card and the status line are truncated
- P-08 (nit): empty space below the card/overlay in the plate frame
- P-09 (nit): the W2 canvas note repeats the step text

## Done when

- [ ] Each finding listed above has a disposition
- [ ] `node /Users/m/workspace/didactician/skills/didactician/scripts/verify.mjs --out /Users/m/workspace/didactician/explainers/didactician --widget w-pipeline` passes

## Not your job

- Page prose, Plate III, w-plan2page, page CSS/tokens, the manifest
