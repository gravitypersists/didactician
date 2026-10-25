# Handoff 14 → page-builder (w-blocks-height)

Continuation of handoff 11 (same agent). Follow `/Users/m/workspace/didactician/skills/didactician/agents/page-builder.md`.

## Task

The w-blocks widget is built (handoff 13; report at `/Users/m/workspace/didactician/explainers/didactician/run/handoffs/13-widget-builder.report.md`). Its measured mount heights are 1908px at 1280, 2982px at 768 and 3565px at 360, but the page reserves 1100px (≥ 900px) and 1800px (< 900px), so the page jumps when the widget loads. Set the w-blocks mount's reserved min-height to fit (about 1900px at ≥ 900px; for < 900px, cover the range 768–360 without leaving a large gap at 768, e.g. a clamp or a breakpoint), and update `size` for w-blocks in `site/widgets/manifest.json`. No other changes.

## Outputs (write only these)

- `site/` except files inside `site/widgets/<id>/`. Report in the `templates/report.md` format.

## Invariants

- I1: No horizontal overflow at 360px, unless the user confirmed a mobile waiver
- I8: Each agent writes only in its namespace

## Done when

- [ ] `node /Users/m/workspace/didactician/skills/didactician/scripts/verify.mjs --out /Users/m/workspace/didactician/explainers/didactician --phase page` passes
