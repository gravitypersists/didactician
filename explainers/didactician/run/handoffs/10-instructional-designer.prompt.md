# Handoff 10 → instructional-designer (revise-human-site-1)

## Your role

Read and follow `/Users/m/workspace/didactician/skills/didactician/agents/instructional-designer.md`. This file is your task. You are a fresh agent. The plan in `run/plan/` was written by an earlier designer (handoffs 02 and 03), and the page has since been built from it.

## Original request (verbatim)

See `/Users/m/workspace/didactician/explainers/didactician/run/brief.md` § Original request.

## Root spec

- Brief: `/Users/m/workspace/didactician/explainers/didactician/run/brief.md`
- Skill base directory: `/Users/m/workspace/didactician/skills/didactician`

## Task

The user reviewed the built page and left 30 comments. They are now findings H-01…H-30, quoted verbatim in `/Users/m/workspace/didactician/explainers/didactician/run/review/human-site-1/findings.md`. `comments.md` in the same folder has the same comments numbered #1…#30, each with the exact text or the element it was left on.

Revise the plan so that it carries out the comments that change **what the page teaches or how it is structured** (listed below under "Findings to address"). The other comments are wording and UX fixes that the builders will make directly from the findings. Read them too, so that your plan doesn't contradict them, but don't rewrite the plan to do their job.

Every H- finding is the user's own decision about their page. Do what each comment asks. If a comment conflicts with `facts.md`, with an invariant, or with another comment, or if you can't tell what it asks, don't guess: say so under `concerns` and leave that part of the plan as it is.

The frozen copy of the page the user reviewed is `/Users/m/workspace/didactician/explainers/didactician/run/review/human-site-1/build/index.html` (identical to the current `site/`). Look at it to see what each comment points at.

Specific guidance:
- **H-29 (§ 5 / s-05):** replace s-05 with a segment that shows the building blocks the pipeline works with: progressive reveal, multiple choice, predict-then-reveal and the others the skill's references actually describe (see `/Users/m/workspace/didactician/skills/didactician/references/learning-science-patterns.md`, `cognitive-design-patterns.md`, `widgets.md`). Each one is a small working example on the page, with a line on what it does for the reader's load. Then say that agents are free to go beyond these. Interactive elements driven by a live LLM (Socratic or Feynman-style challenges) can be mentioned as possibilities, but the page itself must stay static (I2): describe them, don't build them. This changes how o-4 is covered, and w-plan2page and k-04 will probably go. Revise o-4's wording if it no longer fits, keep its checks coherent, and move what's removed to the cut list with the reason "user, human review H-29". Changing an objective is a change the orchestrator takes back to the user before anything is built, so state any objective change plainly at the top of your summary.
- **H-01, H-03, H-05 (s-01):** the opening should present Didactician as a pipeline built around pedagogy and human-in-the-loop review, aimed at content with a heavy cognitive load. It should also say that it is multi-agent and heavy on tokens. It should not be presented as a one-line-in, page-out box. The two halves are introduced simply: "the pipeline process" and "the pedagogical motivations".
- **H-25 (s-04 opening example):** replace the "characteristics" figure (x-01, F-chunk) with the user's code example: `total = sum(x for x in values if x > 0)`, read as about 10 separate tokens by a non-programmer and as one schema ("sum the positive numbers") by an experienced developer. The user's comment has the full wording they want. Update anything in the plan that referred to F-chunk or x-01.
- **H-30 and H-26 (s-04 checks and Plate III):** the user isn't sure the lookup question ("Which stage writes findings.md?") is relevant to the diagram, and points out that the answer to k-02 ("For you, would adding a step-by-step explanation…") depends on whether the reader already knows subagents. Rework the F-split question and k-02 so that each one asks something whose answer the reader can reason out from the page.
- **H-28 (germane-load aside):** the user didn't understand the collapsed note. Either rewrite its intent so it can be understood on its own, or cut it (cut list, reason "user, human review H-28").
- **H-23 (Rule 3, s-03):** the user isn't sure the "scripts gate what's checkable" rule is worth showing the reader, since it is an implementation detail, but says they can be convinced otherwise. This is your judgment call. Keep it with a one-line reason the reader would care about, or drop it and adjust s-03 and w-pipeline's "why" mode to three rules. Either way, state the call and the reason in the plan.
- **H-21, H-22 (s-02/s-03, w-pipeline):** stages are not agents. The orchestrator coordinates the stages through artifacts; agents never chat with each other, and each one communicates only through a strict structure (a handoff prompt in, a report out). Update the plan's wording where it is the source of the confusion, including the w-pipeline model's "Files, never chat" caption and the W2 rule.
- **H-24 (Rule 4):** the rule should be stated with authority as part of the design: a human checks the plan early so a wrong premise doesn't cascade through every later stage, which saves time and cost. It should not cite "the skill's design notes".
- **H-17:** the user wants "plate" renamed to "diagram" everywhere. Update the plan's visual direction and figure titles to match ("Diagram I." and so on). The classical treatise look otherwise stays (d-01).

Keep the reader's time in view. If the new s-05 and the other additions take the piece well past the brief's budget (about 8 minutes, with the user's earlier ceiling of about 10), say which ideas you'd cut and update `## If it runs long`. Don't compress prose to fit (d-03).

## Inputs (read these; don't expect them pasted)

- `/Users/m/workspace/didactician/explainers/didactician/run/review/human-site-1/findings.md`: the 30 H- findings (verbatim user comments with locations)
- `/Users/m/workspace/didactician/explainers/didactician/run/review/human-site-1/comments.md`: the same, as numbered comments
- `/Users/m/workspace/didactician/explainers/didactician/run/review/human-site-1/shots/`: a screenshot for H-30 (a shape drawn on Plate III)
- `/Users/m/workspace/didactician/explainers/didactician/run/review/human-site-1/build/`: the page the user reviewed
- `/Users/m/workspace/didactician/explainers/didactician/run/plan/learning-plan.md`, `cut-list.md`, `mockup.html`: the current plan
- `/Users/m/workspace/didactician/explainers/didactician/run/decisions.md`: d-01…d-06
- `/Users/m/workspace/didactician/explainers/didactician/run/research/facts.md`, `examples.md`

## Outputs (write only these)

- `/Users/m/workspace/didactician/explainers/didactician/run/plan/learning-plan.md`, `cut-list.md`, `mockup.html` (edited in place)
- Your report goes in your final message, in the format of `/Users/m/workspace/didactician/skills/didactician/templates/report.md`, with a `dispositions:` line for each H- finding listed below.

## Invariants that apply to you (verbatim; only the user can relax them)

- I2: Static only: no runtime data calls (fetch/XHR/WebSocket/beacon) to undeclared origins, and no backend. CDN loads are fine
- I8: Each agent writes only in its namespace (yours: `run/plan/`)

## User decisions that apply (quoted from run/decisions.md)

- d-01: "I might not have been explicit enough but give it a flashy visual design. Something that looks education inspired, maybe a bit scientific (not this newfangled edtech look, something more classical)"
- d-02: "Keep all 4 (Recommended)" → objectives o-1…o-4 stay (subject to H-29 changing how o-4 is met)
- d-03: "…Crunched prose, imo, is way worse for instructional design than just having something a little longer. Let's get rid of this check. Other than that, let's approve this!" → no word-gate story; don't compress prose
- d-04: "let's do only a single round of reviews. I'm gonna have some comments to make of my own."
- d-05: "Finished" → the user's 30 comments (human review site-1) are their decisions on the page

## Findings to address (revision rounds only)

H-01, H-03, H-05, H-17, H-21, H-22, H-23, H-24, H-25, H-26, H-28, H-29, H-30. The full text of each is in `review/human-site-1/findings.md`. The others (H-02, H-04, H-06…H-16, H-18…H-20, H-27) go to the builders. Read them, but you don't need to give them dispositions.

## Done when

- [ ] Each finding listed above has a disposition: `fixed` (what changed in the plan), `disputed` (with evidence), or `blocked`
- [ ] `mockup.html` reflects the revised plan, including the new s-05
- [ ] `python3 /Users/m/workspace/didactician/skills/didactician/scripts/check_plan.py /Users/m/workspace/didactician/explainers/didactician/run` reports no errors

## Not your job

- Building or editing `site/`; wording fixes the builders will make; research; the review
