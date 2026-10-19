# Learning plan: <title>

<!-- Written by the instructional designer. Parsed by scripts/check_plan.py: keep the headings,
     the `### s-NN — Title` / `### k-NN` / `- ac-NN` entry forms, and the `key:` lines. -->

## Shape

<2–5 sentences: the overall form (article / scrollytelling / full-page widget / a mix) and WHY it
fits this topic, audience and the reader's time. Name the main alternative you rejected and why.>

toc: <yes | no> — <reason>
tokens: <default kit tokens | user-provided: … | custom: …>
mobile: <how the piece adapts; or "waived per decisions.md d-NN">

## Objectives

<!-- Copy the brief's objective IDs. Map each to its comprehension items, or say why it has none. -->
- o-1: <text> — checks: k-01, k-03
- o-2: <text> — checks: none — <reason, e.g. "exposure-level overview; a check would add friction without payoff">

## Segments

### s-01 — <Title>
intent: <one sentence: what this segment must achieve for the reader>
objectives: o-1
claims: c-01, c-04
readiness: <novice | intermediate | advanced> · interactivity: <low | high> (<the interacting elements>) · max-elements: <n>
mode: <e.g. concrete example → worked example> · blueprint: <B1 | B2 | B3 | B4 | none>
layout:
  contiguity: <e.g. inline — values labelled on the diagram, not in a legend>
  pacing: <e.g. step-revealed; step 3 gated on k-02>
  redundancy: <e.g. no prose restating the step captions>
  scaffold: <e.g. "show the derivation" collapsed for readers who pass k-01 | none>
ux: <what the reader does here; how it behaves at 360px>
figure: <description of each figure/diagram/animation, precise enough to build | none>
widget: <w-<id> (complexity: high | low) — one-line spec | none>
checks: <k-01 | none>

### s-02 — <Title>
…

## Widgets

<!-- One entry per widget named in a segment. Builders implement from this; be precise about the
     model (state, inputs, outputs, equations or rules, with claim IDs), not the code. -->

### w-<id>
segment: s-02
complexity: <high | low>
blueprint: <B2 …>
model: <the state variables, inputs, update rule / equations (cite claims)>
reader_does: <controls and the question the reader explores>
shows: <what is visible, with direct labels, at each step/state>
size: <desktop: e.g. full column width, 480px tall; mobile: e.g. full width, 360px tall, controls below>
acceptance: ac-03, ac-04

## Comprehension items

### k-01
segment: s-02
objective: o-1
type: <predict | explain | apply | retrieve | compare>
prompt: <the question>
options: <for choice items, including the misconception's answer> | model_answer: <for think-then-reveal>
feedback: <explains WHY, especially why the tempting answer is wrong>

## Acceptance criteria

<!-- The contract builders build to and reviewers judge against. Checkable statements, each tied to
     a segment or widget. Not style wishes ("engaging"), but observable properties. -->
- ac-01 (s-01): <e.g. the reader sees the concrete case with real numbers before the general rule>
- ac-02 (w-<id>): <e.g. changing only the length visibly changes the period; the angle barely does below 20°>
- ac-03 (k-01): <e.g. the prediction is committed before the reveal; the feedback names the misconception m-01>
