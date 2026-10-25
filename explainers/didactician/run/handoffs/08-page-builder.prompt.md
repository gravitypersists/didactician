# Handoff 08 → page-builder (fix-r1-page)

## Your role

Read and follow `/Users/m/workspace/didactician/skills/didactician/agents/page-builder.md`. This file is your task (a revision round, same session as handoff 04).

## Original request (verbatim)

See `/Users/m/workspace/didactician/explainers/didactician/run/brief.md` § Original request.

## Root spec

- Brief: `/Users/m/workspace/didactician/explainers/didactician/run/brief.md`
- Skill base directory: `/Users/m/workspace/didactician/skills/didactician`

## Task

Address the round-1 review findings below that belong to the page, and give each a disposition: `fixed`, `disputed` (with evidence), or `blocked`. The full text of each finding, with evidence and the expected fix, is in `/Users/m/workspace/didactician/explainers/didactician/run/review/round-1/findings.md`. Also fix a mismatch the widget builder reported: Plate I step 4's prose says "the user asked for one change and approved the rest" (that describes d-03), but the decisions.md specimen card shows d-02. Make the prose match d-02, or make it neutral. Do not quote or describe d-03 or the word-gate story.

Notes:
- P-01 changes how Plate III version A is labelled (filenames on nodes, stage names only in the key, or the reviewer's alternative). That is your figure, so you can change it within the plan's intent.
- P-03: the k-01 options were marked final in the plan. Rewording them for parallel length/specificity is approved here. Keep the correct answer B and the Solution text's substance.
- Keep prose length set by clarity; don't compress to save time (d-03).

## Inputs (read these; don't expect them pasted)

- `/Users/m/workspace/didactician/explainers/didactician/run/review/round-1/findings.md`: findings (round 1)
- `/Users/m/workspace/didactician/explainers/didactician/run/review/round-1/accuracy.md`, `pedagogy-ux.md`: the full reviews
- `/Users/m/workspace/didactician/explainers/didactician/run/screenshots/probe/`: the reviewers' evidence screenshots
- `/Users/m/workspace/didactician/explainers/didactician/run/research/facts.md`, `/Users/m/workspace/didactician/explainers/didactician/run/plan/learning-plan.md`

## Outputs (write only these)

- `/Users/m/workspace/didactician/explainers/didactician/site/` except files inside `site/widgets/<id>/` folders
- Your report goes in your final message, in the format of `/Users/m/workspace/didactician/skills/didactician/templates/report.md`, with a `dispositions:` list giving one line per finding ID.

## Invariants that apply to you (verbatim; only the user can relax them)

- I1: No horizontal overflow at 360px, unless the user confirmed a mobile waiver
- I2: Static only: no runtime data calls (fetch/XHR/WebSocket/beacon) to undeclared origins, and no backend. CDN loads are fine
- I3: Third-party media is cleared (by licence for the intended use, or by the user) and visibly attributed
- I4: Finite animations longer than flair have a replay control
- I6: Carousels don't change height (reflow) between pages
- I7: SVG markers resolve and aren't clipped
- I8: Each agent writes only in its namespace

## User decisions that apply (quoted from run/decisions.md)

- d-01: "I might not have been explicit enough but give it a flashy visual design. Something that looks education inspired, maybe a bit scientific (not this newfangled edtech look, something more classical)"
- d-03: "...Crunched prose, imo, is way worse for instructional design than just having something a little longer. Let's get rid of this check. Other than that, let's approve this!" → no word-gate story; don't compress prose

## Findings to address (revision rounds only)

- A-01 (should): step 7 prose lists reviewer inputs incorrectly. Only the step prose (page-owned) is yours; the overlay label belongs to the widget builder.
- A-02 (should): Problem 3 solution overstates/miscredits the "wrong guess sticks" effect to ICAP
- A-03 (nit): step 5/6/7 prose overgeneralises (optional, cheap)
- P-01 (blocking): Plate III A doesn't force split attention; the key answers the question alone
- P-02 (blocking, ac-01): full 8-stage strip and the step-0 cue are not above the fold at 1280×800
- P-03 (should): k-01 options not parallel; B gives itself away
- P-05 (should): w-plan2page too tall on mobile; buttons move between steps
- P-06 (nit): internal IDs unglossed in w-plan2page / Fig. 2
- P-07 (nit): ToC progress percentage clipped
- P-10 (nit): "beside this text" is wrong on mobile

## Done when

- [ ] Each finding listed above has a disposition
- [ ] `node /Users/m/workspace/didactician/skills/didactician/scripts/verify.mjs --out /Users/m/workspace/didactician/explainers/didactician --phase page` passes

## Not your job

- Files inside `site/widgets/w-pipeline/` (A-01's overlay label, P-04, P-08 and P-09 are being fixed in parallel by the widget builder); the plan; the review
