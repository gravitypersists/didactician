# Handoff 02 → instructional-designer (plan)

## Your role

Read and follow `/Users/m/workspace/didactician/skills/didactician/agents/instructional-designer.md`. This file is your task.

## Original request (verbatim)

> We're going to get a bit meta here, and point didactician at itself. Think of this almost like a promotional piece for the skillset itself. A reader, presumably a technical claude code or similar agentic coder user, likely familiar already with skills, will see this and it should as quickly as possibly explain how the system works. I'm thinking maybe a scrollytelling of the pipeline process, with visuals for artifacts. Try not to make it overly detailed, just explain at a high-level what the process is, why the skill does what it does. I think it might also be necessary to introduce cognitive load and lean more on the instructional design aspects of this as well, which is truly what makes this tool interactive. Let's aim for something consumable in no more than ~10 minutes (you can aim for less if you identify less is more).

## Root spec

- Brief: `/Users/m/workspace/didactician/explainers/didactician/run/brief.md`
- Skill base directory: `/Users/m/workspace/didactician/skills/didactician`

## Task

Produce the learning plan, cut list and mockup for this explainer. The user suggested a scrollytelling of the pipeline with visuals for each stage's artifacts, but the shape is your judgment call: record your reasoning. Two things the user stressed: (1) the reader should grasp how the system works as fast as possible (front-load the overview), and (2) cognitive load and the instructional-design stage deserve real weight, because that is what makes the output interactive/effective, not decoration. "Less is more" is explicitly welcome; 8 minutes is a ceiling. Since the piece explains a skill that itself applies these principles, it should visibly practise what it describes (the piece can be its own worked example), but don't let the self-reference become a gimmick that adds load.

Notes from research to respect: do not state a precise working-memory number (the "2–3 interacting elements" figure is unverified, see parking lot); do not claim the reviewer split is proven better (c-06 is medium and DESIGN.md says it's untested); present germane load carefully (c-09).

## Inputs (read these; don't expect them pasted)

- `/Users/m/workspace/didactician/explainers/didactician/run/brief.md`: objectives, audience, scope
- `/Users/m/workspace/didactician/explainers/didactician/run/research/facts.md`, `misconceptions.md`, `examples.md`: research (cite claims by ID)
- `/Users/m/workspace/didactician/explainers/didactician/run/research/parking-lot.md`: skim only
- `/Users/m/workspace/didactician/explainers/didactician/run/handoffs/01-researcher.report.md`: researcher's concerns
- `/Users/m/workspace/didactician/skills/didactician/README.md`, `SKILL.md`, `DESIGN.md`: the subject matter (artifacts per stage, run directory layout) — useful for drawing accurate artifact visuals
- `/Users/m/workspace/didactician/skills/didactician/templates/learning-plan.md`, `templates/mockup.html`: your output formats
- `/Users/m/workspace/didactician/skills/didactician/references/`: learning-science, cognitive-design, ux-ui, graphics, widgets references

## Outputs (write only these)

- `/Users/m/workspace/didactician/explainers/didactician/run/plan/learning-plan.md`
- `/Users/m/workspace/didactician/explainers/didactician/run/plan/cut-list.md` (including `## If it runs long` cut order)
- `/Users/m/workspace/didactician/explainers/didactician/run/plan/mockup.html`
- Your report goes in your final message, in the format of `/Users/m/workspace/didactician/skills/didactician/templates/report.md`.

## Invariants that apply to you (verbatim; only the user can relax them)

- I1: No horizontal overflow at 360px, unless the user confirmed a mobile waiver
- I2: Static only: no runtime data calls (fetch/XHR/WebSocket/beacon) to undeclared origins, and no backend. CDN loads are fine
- I3: Third-party media is cleared (by licence for the intended use, or by the user) and visibly attributed
- I4: Finite animations longer than flair have a replay control
- I6: Carousels don't change height (reflow) between pages
- I7: SVG markers resolve and aren't clipped
- I8: Each agent writes only in its namespace (yours: `run/plan/`)

## User decisions that apply (quoted from run/decisions.md)

- none yet (the user will review your plan and mockup at the checkpoint)

## Findings to address (revision rounds only)

- none

## Done when

- [ ] learning-plan.md, cut-list.md and mockup.html exist in the template formats
- [ ] `python3 /Users/m/workspace/didactician/skills/didactician/scripts/check_plan.py /Users/m/workspace/didactician/explainers/didactician/run` reports no errors
- [ ] Every objective o-1…o-4 is covered by at least one segment, scoped to fit ≤ 8 minutes

## Not your job

- Building `site/`; writing final prose (mockup wording is a draft); research; editing the skill's own files
