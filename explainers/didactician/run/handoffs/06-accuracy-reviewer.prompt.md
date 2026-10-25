# Handoff 06 → accuracy-reviewer (review-acc-1)

## Your role

Read and follow `/Users/m/workspace/didactician/skills/didactician/agents/accuracy-reviewer.md`. This file is your task.

## Original request (verbatim)

See `/Users/m/workspace/didactician/explainers/didactician/run/brief.md` § Original request.

## Root spec

- Brief: `/Users/m/workspace/didactician/explainers/didactician/run/brief.md`
- Skill base directory: `/Users/m/workspace/didactician/skills/didactician`

## Task

Review round 1, accuracy. Check every factual claim on the built page (prose, figures, widget cards, check feedback) against the facts file. This page describes the didactician skill itself, so claims about how the skill works can also be checked directly against the skill's source in `/Users/m/workspace/didactician/skills/didactician` (SKILL.md, README.md, DESIGN.md, agents/, scripts/). Claims about this run (e.g. what was asked, what files exist) can be checked against `/Users/m/workspace/didactician/explainers/didactician/run/`. Learning-science claims must match facts.md and must not overstate the evidence (e.g. no numeric working-memory capacity; the reviewer split must not be presented as proven).

## Inputs (read these; don't expect them pasted)

- `/Users/m/workspace/didactician/explainers/didactician/run/brief.md`
- `/Users/m/workspace/didactician/explainers/didactician/run/research/facts.md` (the facts file), `misconceptions.md`, `examples.md`
- `/Users/m/workspace/didactician/explainers/didactician/site/`: the built page (serve or open `index.html`; widgets are JS-rendered, so read rendered output, e.g. via `/Users/m/workspace/didactician/skills/didactician/scripts/probe.mjs`)
- `/Users/m/workspace/didactician/explainers/didactician/run/screenshots/page-round-4/`: gate screenshots (full-page, large)
- `/Users/m/workspace/didactician/skills/didactician/`: the skill source, for claims about the skill

## Outputs (write only these)

- `/Users/m/workspace/didactician/explainers/didactician/run/review/round-1/accuracy.md` in the format of `/Users/m/workspace/didactician/skills/didactician/templates/review.md`
- Your report goes in your final message, in the format of `/Users/m/workspace/didactician/skills/didactician/templates/report.md`.

## Invariants that apply to you (verbatim; only the user can relax them)

- I1: No horizontal overflow at 360px, unless the user confirmed a mobile waiver
- I2: Static only: no runtime data calls (fetch/XHR/WebSocket/beacon) to undeclared origins, and no backend. CDN loads are fine
- I3: Third-party media is cleared (by licence for the intended use, or by the user) and visibly attributed
- I8: Each agent writes only in its namespace

## User decisions that apply (quoted from run/decisions.md)

- d-01: "I might not have been explicit enough but give it a flashy visual design. Something that looks education inspired, maybe a bit scientific (not this newfangled edtech look, something more classical)" → visual direction to judge against
- d-02: "Keep all 4 (Recommended)" → four objectives for an 8-min piece are user-accepted; do not raise objective count as a finding
- d-03: "Problem 4 · Predict · k-03 - I'm not sure this is a feature. It seems kind of weird to include and it's actually something I've been trying to fix in this system. Crunched prose, imo, is way worse for instructional design than just having something a little longer. Let's get rid of this check. Other than that, let's approve this!" → k-03 and the retired word-gate story were removed deliberately; the page should not tell it. Length serving clarity is preferred over compression.

## Findings to address (revision rounds only)

- none

## Done when

- [ ] `run/review/round-1/accuracy.md` exists in the review format with every finding having severity, location and expected fix

## Not your job

- Pedagogy, UX, visual design; editing the site; writing outside `run/review/round-1/`
