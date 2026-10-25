# Handoff 13 → widget-builder w-blocks (build-w-blocks)

## Your role

Read and follow `/Users/m/workspace/didactician/skills/didactician/agents/widget-builder.md`. This file is your task.

## Original request (verbatim)

See `/Users/m/workspace/didactician/explainers/didactician/run/brief.md` § Original request.

## Root spec

- Brief: `/Users/m/workspace/didactician/explainers/didactician/run/brief.md`
- Skill base directory: `/Users/m/workspace/didactician/skills/didactician`

## Task

Build the new `w-blocks` widget for s-05 "The Building Blocks". It replaces the old § 5 at the user's request (H-29, approved as d-07). Follow the plan's w-blocks entry and the manifest's w-blocks contract. The page builder has already added the mount (`[data-widget="w-blocks"]`), the CSS/JS links, the s-05 opening, k-05 and the "beyond" paragraphs. Your part is only what goes inside the mount.

The user's comment, verbatim (H-29): "Section 5 is a little confusing, and I'm not sure how valuable it is. It may be worth instead replacing it with all of the building blocks that didactician works with, including progressive reveals, multiple choice, predict then reveal, as simple examples built-in. Impress upon the reader that agents can have the freedom to explore other user interface approaches (hypothesize more interactive elements like embedded socrates or feynman style challenges connecting to live llm driven AIs)."

Also from the user (H-27): a progressive-disclosure element had "no affordance that you can click on this". Every expandable or clickable specimen must look clickable.

Word each block's load line as a design directive, not a proven effect (A-02). The skill's `references/` count as sources (d-08). Tune the page's reserved min-height if your widget needs less or more, and report the value. The page builder owns that CSS, so don't edit it; state the number you need.

## Inputs (read these; don't expect them pasted)

- `/Users/m/workspace/didactician/explainers/didactician/run/plan/learning-plan.md`: the w-blocks entry, s-05, visual direction
- `/Users/m/workspace/didactician/explainers/didactician/site/widgets/manifest.json`: the w-blocks contract
- `/Users/m/workspace/didactician/explainers/didactician/site/index.html`, `site/assets/`: the page and its tokens
- `/Users/m/workspace/didactician/skills/didactician/references/learning-science-patterns.md`, `cognitive-design-patterns.md`, `widgets.md`
- `/Users/m/workspace/didactician/explainers/didactician/run/review/human-site-1/findings.md`: H-27, H-29

## Outputs (write only these)

- `/Users/m/workspace/didactician/explainers/didactician/site/widgets/w-blocks/`
- Your report goes in your final message, in the format of `/Users/m/workspace/didactician/skills/didactician/templates/report.md`.

## Invariants that apply to you (verbatim; only the user can relax them)

- I1: No horizontal overflow at 360px, unless the user confirmed a mobile waiver
- I2: Static only: no runtime data calls (fetch/XHR/WebSocket/beacon) to undeclared origins, and no backend. CDN loads are fine
- I4: Finite animations longer than flair have a replay control
- I6: Carousels don't change height (reflow) between pages
- I7: SVG markers resolve and aren't clipped
- I8: Each agent writes only in its namespace

## User decisions that apply (quoted from run/decisions.md)

- d-01: "…something more classical" → treatise look; textbook-exercise styling for checks
- d-03: "…Crunched prose, imo, is way worse for instructional design than just having something a little longer…"
- d-07: "Approve, build" → the revised plan with w-blocks
- d-08: "Use skill references (Recommended)"

## Findings to address (revision rounds only)

- H-29 (as above), H-27 (affordance)

## Done when

- [ ] `node /Users/m/workspace/didactician/skills/didactician/scripts/verify.mjs --out /Users/m/workspace/didactician/explainers/didactician --widget w-blocks` passes

## Not your job

- Page prose, k-05 and the page's CSS; w-pipeline; the plan
