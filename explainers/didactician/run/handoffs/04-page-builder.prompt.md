# Handoff 04 → page-builder (build-page)

## Your role

Read and follow `/Users/m/workspace/didactician/skills/didactician/agents/page-builder.md`. This file is your task.

## Original request (verbatim)

See `/Users/m/workspace/didactician/explainers/didactician/run/brief.md` § Original request.

## Root spec

- Brief: `/Users/m/workspace/didactician/explainers/didactician/run/brief.md`
- Skill base directory: `/Users/m/workspace/didactician/skills/didactician`
- Run out dir: `/Users/m/workspace/didactician/explainers/didactician`

## Task

Build the page shell, design tokens, all prose, simple figures (F-*), the three checks (k-01, k-02, k-04), widget mounts, and `site/widgets/manifest.json` from the approved plan. Build `w-plan2page` (complexity: low) yourself. `w-pipeline` (complexity: high, two mounts: "what" mode and "why" mode) will be built by a separate widget builder in `site/widgets/w-pipeline/`. Leave a correctly sized mount for it and declare it in the manifest. Use the approved mockup for content and flow. Its wording is a draft, though. Write the prose for this reader at whatever length clarity needs, and don't crunch it. Only the check prompts, options and answers in the mockup are final. Apply the plan's `## Visual direction` (d-01): it should be striking and classical-scientific, with legibility and accessibility outranking the look. Keep a system-serif fallback for any web fonts.

The user removed k-03 at the checkpoint (d-03). Do not tell the retired word-gate story anywhere on the page.

## Inputs (read these; don't expect them pasted)

- `/Users/m/workspace/didactician/explainers/didactician/run/plan/learning-plan.md`: the approved plan (segments, widgets, checks, acceptance criteria, visual direction)
- `/Users/m/workspace/didactician/explainers/didactician/run/plan/mockup.html`: approved content and flow (draft wording)
- `/Users/m/workspace/didactician/explainers/didactician/run/plan/cut-list.md`: what's deliberately out (don't add it back)
- `/Users/m/workspace/didactician/explainers/didactician/run/research/facts.md`, `examples.md`, `misconceptions.md`: claims cited by the plan
- `/Users/m/workspace/didactician/explainers/didactician/run/`: this run's real files, for any real-artifact excerpts the plan calls for (e.g. the tree figure)
- `/Users/m/workspace/didactician/skills/didactician/kit/`: optional runtime helpers to copy into `site/assets/`
- `/Users/m/workspace/didactician/skills/didactician/references/ux-ui.md`, `graphics.md`, `widgets.md`

## Outputs (write only these)

- `/Users/m/workspace/didactician/explainers/didactician/site/`: everything except files inside `site/widgets/<id>/` folders. `site/widgets/manifest.json` is yours. Because of that namespace, build w-plan2page inline in the page or under `site/assets/`, not in `site/widgets/w-plan2page/`.
- Your report goes in your final message, in the format of `/Users/m/workspace/didactician/skills/didactician/templates/report.md`.

## Invariants that apply to you (verbatim; only the user can relax them)

- I1: No horizontal overflow at 360px, unless the user confirmed a mobile waiver
- I2: Static only: no runtime data calls (fetch/XHR/WebSocket/beacon) to undeclared origins, and no backend. CDN loads are fine
- I3: Third-party media is cleared (by licence for the intended use, or by the user) and visibly attributed
- I4: Finite animations longer than flair have a replay control
- I6: Carousels don't change height (reflow) between pages
- I7: SVG markers resolve and aren't clipped
- I8: Each agent writes only in its namespace

## User decisions that apply (quoted from run/decisions.md)

- d-01: "I might not have been explicit enough but give it a flashy visual design. Something that looks education inspired, maybe a bit scientific (not this newfangled edtech look, something more classical)" → follow the plan's Visual direction
- d-02: "Keep all 4 (Recommended)" → all four objectives stay
- d-03: "Problem 4 · Predict · k-03 - I'm not sure this is a feature. It seems kind of weird to include and it's actually something I've been trying to fix in this system. Crunched prose, imo, is way worse for instructional design than just having something a little longer. Let's get rid of this check. Other than that, let's approve this!" → no k-03, no word-gate story; prose length serves clarity

## Findings to address (revision rounds only)

- none

## Done when

- [ ] Every segment s-01…s-06 is built with final prose; checks k-01, k-02, k-04 work
- [ ] w-plan2page works; the w-pipeline mount and manifest entry exist for the widget builder
- [ ] `node /Users/m/workspace/didactician/skills/didactician/scripts/verify.mjs --out /Users/m/workspace/didactician/explainers/didactician --phase page` passes (w-pipeline reported pending is expected)

## Not your job

- `site/widgets/w-pipeline/` contents; editing the plan or research; review; deployment
