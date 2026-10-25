# Handoff 11 → page-builder (human-site-1)

## Your role

Read and follow `/Users/m/workspace/didactician/skills/didactician/agents/page-builder.md`. This file is your task. You are a fresh agent; the page in `site/` was built by an earlier page builder (handoffs 04 and 08). This is a revision round.

## Original request (verbatim)

See `/Users/m/workspace/didactician/explainers/didactician/run/brief.md` § Original request.

## Root spec

- Brief: `/Users/m/workspace/didactician/explainers/didactician/run/brief.md`
- Skill base directory: `/Users/m/workspace/didactician/skills/didactician`

## Task

The user reviewed the page and left 30 comments, now findings H-01…H-30. The plan has been revised for the comments that change what the page teaches or how it is structured, and the user approved the revision (d-07). Bring `site/` in line with the revised plan, and address every H- finding that belongs to the page.

The main changes:
- s-01 is reframed: the intro, the subtitle, and the two halves.
- s-03 now has three rules, not four.
- s-04 has the code example (F-code), the reworked Diagram III and k-02, and no germane-load aside.
- s-05 is replaced by "The building blocks". The page owns the segment's prose and a mount for the new `w-blocks` widget. Add `w-blocks` to `site/widgets/manifest.json` with a mount contract and sizes, following the plan's w-blocks entry. A separate widget builder will build it after you.
- w-plan2page, k-04 and F-cut are cut: remove them and their assets.
- "Plate" becomes "diagram" everywhere (ac-14).

For each H- finding, do what the user's comment asks. They are quoted verbatim, with what they point at, in `run/review/human-site-1/findings.md`. Where the revised plan already settles a finding, follow the plan. If a comment conflicts with the plan, `facts.md` or an invariant, dispute it with the evidence, and the user decides.

Sources: for s-05, the skill's `references/` files count as sources for the building blocks (d-08). Keep prose length set by clarity; don't compress (d-03). Keep the classical look (d-01).

## Inputs (read these; don't expect them pasted)

- `/Users/m/workspace/didactician/explainers/didactician/run/review/human-site-1/findings.md`: H-01…H-30
- `/Users/m/workspace/didactician/explainers/didactician/run/review/human-site-1/comments.md` and `build/`: the comments and the page as the user saw it
- `/Users/m/workspace/didactician/explainers/didactician/run/handoffs/10-instructional-designer.report.md`: what changed in the plan, per finding
- `/Users/m/workspace/didactician/explainers/didactician/run/plan/learning-plan.md`, `cut-list.md`, `mockup.html`: the revised plan (approved content and flow; the mockup's wording is a draft, but its check prompts, options and answers are final)
- `/Users/m/workspace/didactician/explainers/didactician/run/research/facts.md`, `/Users/m/workspace/didactician/skills/didactician/references/`

## Outputs (write only these)

- `/Users/m/workspace/didactician/explainers/didactician/site/` except files inside `site/widgets/<id>/` folders
- Your report goes in your final message, in the format of `/Users/m/workspace/didactician/skills/didactician/templates/report.md`, with a `dispositions:` line per finding ID.

## Invariants that apply to you (verbatim; only the user can relax them)

- I1: No horizontal overflow at 360px, unless the user confirmed a mobile waiver
- I2: Static only: no runtime data calls (fetch/XHR/WebSocket/beacon) to undeclared origins, and no backend. CDN loads are fine
- I3: Third-party media is cleared (by licence for the intended use, or by the user) and visibly attributed
- I4: Finite animations longer than flair have a replay control
- I6: Carousels don't change height (reflow) between pages
- I7: SVG markers resolve and aren't clipped
- I8: Each agent writes only in its namespace

## User decisions that apply (quoted from run/decisions.md)

- d-01: "…give it a flashy visual design. Something that looks education inspired, maybe a bit scientific (not this newfangled edtech look, something more classical)"
- d-03: "…Crunched prose, imo, is way worse for instructional design than just having something a little longer…" → don't compress prose
- d-05: "Finished" → the 30 comments are the user's decisions on the page
- d-07: "Approve, build" → the revised plan (o-4 reworded, three rules, new s-05)
- d-08: "Use skill references (Recommended)" → the skill's references/ back the s-05 building blocks

## Findings to address (revision rounds only)

All of H-01…H-30 that touch page-owned files. The widget builder for w-pipeline (dispatch 12, running in parallel) owns everything inside `site/widgets/w-pipeline/`: its overlays, its captions, and its three-rule "why" mode. Where a finding is split between you and that widget, do your part and note the split. Also fold in P-01 and P-02 if the revision affects them.

## Done when

- [ ] Each H- finding has a disposition (`fixed`, `disputed` with evidence, `blocked`, or `n/a: widget-owned`)
- [ ] `node /Users/m/workspace/didactician/skills/didactician/scripts/verify.mjs --out /Users/m/workspace/didactician/explainers/didactician --phase page` passes; w-blocks is reported as pending

## Not your job

- Files inside `site/widgets/*/`; the plan; the review
