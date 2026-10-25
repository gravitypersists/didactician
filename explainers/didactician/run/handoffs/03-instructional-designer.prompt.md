# Handoff 03 → instructional-designer (revise-k03)

## Your role

Read and follow `/Users/m/workspace/didactician/skills/didactician/agents/instructional-designer.md`. This file is your task.

## Original request (verbatim)

See `/Users/m/workspace/didactician/explainers/didactician/run/brief.md` § Original request (unchanged from handoff 02).

## Root spec

- Brief: `/Users/m/workspace/didactician/explainers/didactician/run/brief.md`
- Skill base directory: `/Users/m/workspace/didactician/skills/didactician`

## Task

Revise the plan per the user's checkpoint note (d-03, quoted below): remove check k-03 (the "retired word gate" Problem 4) from the learning plan, cut list and mockup. The user approved everything else, so keep the change minimal. Specifically:
- Delete k-03 and any segment prose/feedback that exists only to set it up. Wherever else the plan presents the retired word gate as a selling point or story, drop it or reduce it to at most one neutral clause. The user sees crunched prose as a problem they are still fixing, not a feature to showcase.
- o-4 must still have coverage (k-04 and w-plan2page remain). Update the checks field for o-4 and the "Not on the list" note in `## If it runs long`.
- Move k-03 and the word-gate story (c-11 / x-04) to the cut list with the reason "user removed at checkpoint (d-03)".
- Renumber the visible "Problem N" labels so they're sequential. Keep the check IDs stable, and don't reuse k-03.
- Do not change objectives, other segments, the overall shape, or the visual direction. If removing k-03 forces such a change, return `blocked` and explain why.

## Inputs (read these; don't expect them pasted)

- `/Users/m/workspace/didactician/explainers/didactician/run/plan/learning-plan.md`, `cut-list.md`, `mockup.html`: your previous output
- `/Users/m/workspace/didactician/explainers/didactician/run/decisions.md`: d-01, d-02, d-03
- `/Users/m/workspace/didactician/explainers/didactician/run/research/facts.md`, `examples.md`

## Outputs (write only these)

- `/Users/m/workspace/didactician/explainers/didactician/run/plan/learning-plan.md`, `cut-list.md`, `mockup.html` (edited in place)
- Your report goes in your final message, in the format of `/Users/m/workspace/didactician/skills/didactician/templates/report.md`.

## Invariants that apply to you (verbatim; only the user can relax them)

- I8: Each agent writes only in its namespace (yours: `run/plan/`)

## User decisions that apply (quoted from run/decisions.md)

- d-01: "I might not have been explicit enough but give it a flashy visual design. Something that looks education inspired, maybe a bit scientific (not this newfangled edtech look, something more classical)" → keep visual direction unchanged
- d-02: "Keep all 4 (Recommended)" → objectives o-1…o-4 stay
- d-03: "Problem 4 · Predict · k-03 - I'm not sure this is a feature. It seems kind of weird to include and it's actually something I've been trying to fix in this system. Crunched prose, imo, is way worse for instructional design than just having something a little longer. Let's get rid of this check. Other than that, let's approve this!" → remove k-03; rest approved

## Findings to address (revision rounds only)

- none

## Done when

- [ ] No k-03 in learning-plan.md or mockup.html; k-03 and c-11/x-04 listed in cut-list.md with reason d-03
- [ ] `python3 /Users/m/workspace/didactician/skills/didactician/scripts/check_plan.py /Users/m/workspace/didactician/explainers/didactician/run` reports no errors

## Not your job

- Any other plan changes; building `site/`; research
