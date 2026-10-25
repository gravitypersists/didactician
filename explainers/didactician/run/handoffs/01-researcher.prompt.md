# Handoff 01 → researcher (research)

## Your role

Read and follow `/Users/m/workspace/didactician/skills/didactician/agents/researcher.md`. This file is your task.

## Original request (verbatim)

> We're going to get a bit meta here, and point didactician at itself. Think of this almost like a promotional piece for the skillset itself. A reader, presumably a technical claude code or similar agentic coder user, likely familiar already with skills, will see this and it should as quickly as possibly explain how the system works. I'm thinking maybe a scrollytelling of the pipeline process, with visuals for artifacts. Try not to make it overly detailed, just explain at a high-level what the process is, why the skill does what it does. I think it might also be necessary to introduce cognitive load and lean more on the instructional design aspects of this as well, which is truly what makes this tool interactive. Let's aim for something consumable in no more than ~10 minutes (you can aim for less if you identify less is more).

## Root spec

- Brief: `/Users/m/workspace/didactician/explainers/didactician/run/brief.md`
- Skill base directory: `/Users/m/workspace/didactician/skills/didactician`

## Task

Answer research questions q-1 through q-8 in the brief at depth `light`. The topic is the skill itself, so q-1–q-4 and q-7 are answered primarily from the skill's own source files (cite them by repo path and section/line as sources). q-5, q-6 and q-8 are learning-science claims: verify them against primary or authoritative external sources (Sweller and colleagues, Mayer's multimedia principles, review articles), and state evidence status honestly, including known critiques (e.g. of germane load, of learning styles). Note that this is a self-referential piece: where the skill's own reference files make a learning-science claim, check it against an external source rather than citing the skill as evidence for the science.

## Inputs (read these; don't expect them pasted)

- `/Users/m/workspace/didactician/explainers/didactician/run/brief.md`: objectives and research questions
- `/Users/m/workspace/didactician/skills/didactician/SKILL.md`: the orchestrator workflow
- `/Users/m/workspace/didactician/skills/didactician/README.md`: user-facing overview (has uncommitted edits; current working copy is authoritative)
- `/Users/m/workspace/didactician/skills/didactician/DESIGN.md`: design rationale, failure modes, ledgers
- `/Users/m/workspace/didactician/skills/didactician/agents/`: per-role contracts
- `/Users/m/workspace/didactician/skills/didactician/references/learning-science-patterns.md`, `references/cognitive-design-patterns.md`: what the designer is told
- `/Users/m/workspace/didactician/skills/didactician/templates/`: artifact formats (brief, learning-plan, mockup, review, report)
- `/Users/m/workspace/didactician/skills/didactician/templates/research-formats.md`: your output formats

## Outputs (write only these)

- `/Users/m/workspace/didactician/explainers/didactician/run/research/` — files per `agents/researcher.md` and `templates/research-formats.md`
- Your report goes in your final message, in the format of `/Users/m/workspace/didactician/skills/didactician/templates/report.md`.

## Invariants that apply to you (verbatim; only the user can relax them)

- I3: Third-party media is cleared (by licence for the intended use, or by the user) and visibly attributed. (If you propose any media, record licence; intended_use is commercial/promotional. Drawn figures are preferred.)
- I8: Each agent writes only in its namespace. Yours is `run/research/`.

## User decisions that apply (quoted from run/decisions.md)

- none

## Findings to address (revision rounds only)

- none

## Done when

- [ ] Every research question q-1…q-8 is answered or explicitly marked unanswerable with reason
- [ ] Every claim is a single assertion tied to an objective and has a source
- [ ] `python3 /Users/m/workspace/didactician/skills/didactician/scripts/check_research.py /Users/m/workspace/didactician/explainers/didactician/run` passes

## Not your job

- Writing prose, plans, or page content; choosing the page shape; editing the skill's files; anything outside `run/research/`
