# Handoff 05 → widget-builder (w-pipeline)

## Your role

Read and follow `/Users/m/workspace/didactician/skills/didactician/agents/widget-builder.md`. This file is your task.

## Original request (verbatim)

See `/Users/m/workspace/didactician/explainers/didactician/run/brief.md` § Original request.

## Root spec

- Brief: `/Users/m/workspace/didactician/explainers/didactician/run/brief.md`
- Skill base directory: `/Users/m/workspace/didactician/skills/didactician`
- Run out dir: `/Users/m/workspace/didactician/explainers/didactician`

## Task

Build widget `w-pipeline` (complexity: high) inside its two mounts on the built page: "what" mode (Plate I, s-02: overview at step 0, then one stage per step, each with a specimen card excerpting that stage's real artifact from this run) and "why" mode (Plate II, s-03: rule overlays W1–W4). The widget spec is in the learning plan. The page builder's contract for you (mount selectors, step events, sizes, tokens, stage shapes, artifact names) is in `site/widgets/manifest.json` → `widgets.w-pipeline.contract`. Follow it. Apply the plan's `## Visual direction` (d-01): engraved-plate look, legible first.

Specimen card excerpts must be real text from this run's files under `run/` (short, a few lines, legible on mobile). The review stage happens after you build, so its card is a clearly labelled format sample, as the plan says. Pick excerpts that respect these constraints, all raised by the page builder:
- The brief.md card must not show the o-3 line, and the learning-plan.md card must not show the s-04 `readiness:` line. Terms like "working memory" or "intrinsic vs. extraneous" must not appear before § 4 introduces them.
- No numeric working-memory capacity anywhere (ac-07).
- The decisions.md card: use d-02 or another neutral excerpt. Do not quote d-03 or anything about the retired word gate (the user removed that story, d-03).

## Inputs (read these; don't expect them pasted)

- `/Users/m/workspace/didactician/explainers/didactician/run/plan/learning-plan.md`: the w-pipeline spec, acceptance criteria, visual direction
- `/Users/m/workspace/didactician/explainers/didactician/site/widgets/manifest.json`: mount contract
- `/Users/m/workspace/didactician/explainers/didactician/site/index.html`, `site/assets/tokens.css`, `site/assets/treatise.css`, `site/assets/page.js`: the page around your mounts (read only)
- `/Users/m/workspace/didactician/explainers/didactician/run/`: this run's real artifacts for excerpts (brief.md, research/facts.md, plan/learning-plan.md, decisions.md, gate/, log.md)
- `/Users/m/workspace/didactician/explainers/didactician/run/research/facts.md`: claims
- `/Users/m/workspace/didactician/skills/didactician/references/widgets.md`, `graphics.md`, `ux-ui.md`; `kit/` helpers already copied to `site/assets/`

## Outputs (write only these)

- `/Users/m/workspace/didactician/explainers/didactician/site/widgets/w-pipeline/` (index.js, index.css, as declared in the manifest)
- Your report goes in your final message, in the format of `/Users/m/workspace/didactician/skills/didactician/templates/report.md`.

## Invariants that apply to you (verbatim; only the user can relax them)

- I1: No horizontal overflow at 360px, unless the user confirmed a mobile waiver
- I2: Static only: no runtime data calls (fetch/XHR/WebSocket/beacon) to undeclared origins, and no backend. CDN loads are fine
- I3: Third-party media is cleared (by licence for the intended use, or by the user) and visibly attributed
- I4: Finite animations longer than flair have a replay control
- I6: Carousels don't change height (reflow) between pages
- I7: SVG markers resolve and aren't clipped
- I8: Each agent writes only in its namespace (yours: `site/widgets/w-pipeline/`)

## User decisions that apply (quoted from run/decisions.md)

- d-01: "I might not have been explicit enough but give it a flashy visual design. Something that looks education inspired, maybe a bit scientific (not this newfangled edtech look, something more classical)" → engraved-plate visual direction
- d-03: "...Let's get rid of this check. Other than that, let's approve this!" (about k-03, the retired word-gate problem) → no word-gate story in any card

## Findings to address (revision rounds only)

- none

## Done when

- [ ] Both modes render and respond to the page's step events; keyboard/screen-reader accessible per widgets.md
- [ ] `node /Users/m/workspace/didactician/skills/didactician/scripts/verify.mjs --out /Users/m/workspace/didactician/explainers/didactician --widget w-pipeline` passes

## Not your job

- Page prose, other figures, w-plan2page, global CSS/tokens, manifest edits (report needed changes as concerns), the plan
