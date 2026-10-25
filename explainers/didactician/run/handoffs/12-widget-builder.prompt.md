# Handoff 12 → widget-builder w-pipeline (human-site-1)

## Your role

Read and follow `/Users/m/workspace/didactician/skills/didactician/agents/widget-builder.md`. This file is your task. You are a fresh agent; w-pipeline was built by an earlier widget builder (handoffs 05 and 09). This is a revision round.

## Original request (verbatim)

See `/Users/m/workspace/didactician/explainers/didactician/run/brief.md` § Original request.

## Root spec

- Brief: `/Users/m/workspace/didactician/explainers/didactician/run/brief.md`
- Skill base directory: `/Users/m/workspace/didactician/skills/didactician`

## Task

Bring `site/widgets/w-pipeline/` in line with the revised plan (approved by the user, d-07) and the user's comments:
- **"why" mode has three rules, not four.** Rule 3, "scripts gate what's checkable", is dropped (H-23), so the old W4 becomes rule 3. The page builder (dispatch 12's sibling, 11, running in parallel) is changing the page's steps to match. Read the plan's w-pipeline entry for the new step numbering and the `data-step`/`data-rule` contract, and keep `site/widgets/manifest.json`'s contract for w-pipeline accurate. If you need to change it, report the change; the page builder owns the file.
- **Wording inside the widget:**
  - the overview caption replaces "Files, never chat": stages are not agents, the orchestrator coordinates the stages through files, and agents communicate only through a fixed handoff-prompt-in / report-out structure (H-21, H-22);
  - the W1 label lists reviewer inputs correctly (A-01, as in the plan);
  - "plate" appears nowhere (H-17).
- Any other H- finding whose location is inside the widget. Check each one in `findings.md`.

## Inputs (read these; don't expect them pasted)

- `/Users/m/workspace/didactician/explainers/didactician/run/review/human-site-1/findings.md`: H-01…H-30 (verbatim user comments with locations)
- `/Users/m/workspace/didactician/explainers/didactician/run/handoffs/10-instructional-designer.report.md`: the plan changes
- `/Users/m/workspace/didactician/explainers/didactician/run/plan/learning-plan.md`: the w-pipeline entry and s-02/s-03
- `/Users/m/workspace/didactician/explainers/didactician/site/widgets/manifest.json`, `site/index.html`

## Outputs (write only these)

- `/Users/m/workspace/didactician/explainers/didactician/site/widgets/w-pipeline/`
- Your report goes in your final message, in the format of `/Users/m/workspace/didactician/skills/didactician/templates/report.md`, with a `dispositions:` line per finding ID you touched.

## Invariants that apply to you (verbatim; only the user can relax them)

- I1: No horizontal overflow at 360px, unless the user confirmed a mobile waiver
- I2: Static only: no runtime data calls (fetch/XHR/WebSocket/beacon) to undeclared origins, and no backend. CDN loads are fine
- I4: Finite animations longer than flair have a replay control
- I7: SVG markers resolve and aren't clipped
- I8: Each agent writes only in its namespace

## User decisions that apply (quoted from run/decisions.md)

- d-01: "…something more classical" → keep the engraved look
- d-05: "Finished" → the user's comments are their decisions
- d-07: "Approve, build" → three rules, revised wording

## Findings to address (revision rounds only)

H-17, H-21, H-22, H-23, H-24 and A-01, where they fall inside the widget; any other H- finding located in the widget.

## Done when

- [ ] Each finding you touched has a disposition
- [ ] `node /Users/m/workspace/didactician/skills/didactician/scripts/verify.mjs --out /Users/m/workspace/didactician/explainers/didactician --phase page` shows no w-pipeline failures

## Not your job

- Page prose and steps (page builder); w-blocks (a later dispatch); the plan
