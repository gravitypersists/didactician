# Learning plan: fixture

## Shape

Article with one sandbox.
toc: no — short

## Conventions

Lengths in metres, periods in seconds, everywhere.

## Objectives
- o-1: predict how the period changes — checks: k-01

## Diagnosis

Notes for the reviewer only.

## Segments

### s-01 — Length sets the period
intent: the reader sees period grow with length
objectives: o-1
claims: c-01
widget: w-swing (complexity: high) — drag the length
checks: k-01

### s-02 — Mass doesn't
intent: the reader rules out mass
objectives: o-1
claims: c-02
widget: none
checks: none

## Widgets

### w-swing
segment: s-01
complexity: high
model: T = 2π√(L/g) (c-01)
acceptance: ac-02

## Comprehension items

### k-01
segment: s-01
objective: o-1
type: predict
prompt: Double the length. What happens to the period?

## Acceptance criteria
- ac-01 (s-01): the reader sees a concrete length before the formula
- ac-02 (w-swing): a 1 m pendulum shows a period of about 2.0 s
- ac-03 (s-02): mass changes nothing visible
- ac-04 (all checks): commit before reveal
