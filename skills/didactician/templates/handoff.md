# Handoff NN → <role> (<label>)

<!-- Written by the orchestrator before every dispatch, saved as run/handoffs/NN-<role>.prompt.md.
     The receiving agent has NONE of the orchestrator's context. Everything it needs is here or
     at a path listed here. Fill every field; write "none" rather than deleting one. -->

## Your role

Read and follow `<skill>/agents/<role>.md`. This file is your task.

## Original request (verbatim)

> <paste from brief.md>

## Root spec

- Brief: `<abs path>/run/brief.md`
- Skill base directory: `<abs path to skill>`

## Task

<one paragraph: what this dispatch must accomplish. For revisions: "Address findings P-03, A-01 …" or "Revise the plan per the user's notes below.">

## Inputs (read these; don't expect them pasted)

- `<abs path>`: <what it is>
- …

## Outputs (write only these)

- `<abs path>`: <what goes there>
- Your report goes in your final message, in the format of `<skill>/templates/report.md`.

## Invariants that apply to you (verbatim; only the user can relax them)

- <e.g. I1: No horizontal overflow at 360px unless a confirmed mobile waiver is recorded.>
- …

## User decisions that apply (quoted from run/decisions.md)

- d-NN: "<verbatim answer>" → <how it applies to this task>
- or: none

## Findings to address (revision rounds only)

- <ID> (<severity>): <criterion> — <location> — <expected fix>  (full text: `<path>/findings.md`)
- or: none

## Done when

- [ ] <checkable item>
- [ ] <e.g. `node <skill>/scripts/verify.mjs --out <out> --widget w-foo` passes>

## Not your job

- <e.g. prose outside your widget; other widgets; global CSS; editing the plan; deployment>
