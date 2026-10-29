# Pilot E1′: a conceptual-model critic for one teaching widget

Pre-registered 2026-10-29, before any condition was run. The hypothesis is in `../../WIDGET-BUILDER-HYPOTHESIS.md`. This pilot tests a narrowed version of H1 on one didactician widget, not the collection-manager track.

## Question

The text around a teaching widget makes claims about it: "try X and you'll see Y", "W-02's warnings show which services", "the idle bar". Can an LLM that only extracts those claims into a typed form, plus a deterministic checker that runs them against the widget's own model and strings, find the text ↔ widget mismatches that reviewers and the user found? And does it find them more reliably than a fresh LLM asked to critique the same thing?

## Inputs (frozen)

`inputs/ch05-r0/site/` is a copy of `k8s-course/explainers/ch-05-scheduling/run/history/08-page-builder/site/` (k8s-course commit `5af333d`). That is the build that the round-1 accuracy and pedagogy-ux reviewers and the user's first site review (`human-site-1`) saw. The widget under test is `w-sizing-sandbox` (W-02). W-01 (`w-friday-scrolly`) is out of scope for this pilot.

Agents in every condition are told to read only `inputs/`. They never see `k8s-course/…/review/`, the plan, or this file's ground-truth section.

## Ground truth (from round-1 reviewer findings and human-site-1 comments)

In scope: a mismatch between what the text tells the reader to do, expect or look at in W-02, and what W-02 affords, produces or prints.

| Target | Source IDs | Defect |
|---|---|---|
| T1 | A-01, P-03 | k-09 reveal: "try `orders` at 8 and then 12 GB in W-02" implies the node count rises. From the default or reset state it doesn't change |
| T2 | A-02, P-07 | k-08 feedback: halving requests means "several services" go over, "W-02's warnings show which". W-02 at half shows one (`orders`) |
| T3 | P-10 (nit), human #25 | k-04 feedback sends the reader to W-02 about `payments`' request, but `payments` has no control in W-02 |
| T4 | P-09 (nit) | The prose names "idle bar" and "spare-node switch"; the widget prints "The rented room" and "Keep room to lose a node" |
| T5 | A-08 (nit) | The bar is headed "The rented room" but shows room for Pods (13 GB per node), not the rented 16 GB per node |

T5 needs a conceptual model that defines "rented" vs "room for Pods". The author of this pilot had already read A-08 before writing the model, so encoding that distinction would leak the answer. **T5 is not attempted by the critic and counts as a miss.**

Out of scope, listed so no one counts them: human #23, #24, #26, #27, #29, #30 (layout and visual encoding), #28, #31 (prose), P-02 (check design), A-07, A-09 (prose facts).

Note that the round-1 reviewers, an H0 with a broad brief and deep effort, found all five targets, two of them only as nits. So this pilot can't show "the critic finds what LLMs miss" on this chapter. What it can show is reliability, cost, and whether the cheap critic gets there without a full review.

## Conditions

- **C, the critic.** (1) A fresh LLM *extractor* reads only `site/index.html` and emits `pointers.json` against `schema.md`. It doesn't see the widget's code, so it can't fit the text to what the widget allows. (2) `critic.mjs`, deterministic, loads the widget's `data.js` and `model.js` and runs four checks: **coverage** (each manipulation the text asks for has a control), **execution** (each pointer's steps, run through `SizingModel.evaluate`, meet its expectation, from the default state and from every state an earlier pointer leaves the reader in), **naming** (each widget part the text names is printed in the widget), and **sibling asymmetry** (from the conceptual model alone: an attribute adjustable on some instances of an object type but not on others). The extractor runs 3 times, independently. The checker is frozen (sha recorded in `results/`) before any extractor output is read.
- **H0, the fresh critique.** A fresh LLM reads the same `inputs/` (page and widget code, free to run node or a browser) with a prompt scoped to the same question (`prompts/h0.md`). It runs 3 times, independently.
- **H0-review.** The original round-1 reviewers, for reference only: 5/5 targets.

## Matching rule

A flag matches a target when it names the same text location (or the same quoted sentence) **and** the same mismatch. A flag that names the location but a different problem doesn't match. Raw outputs are kept in `runs/`, so anyone can re-score.

## Thresholds

- **Supported (go on to Ch 3, 4, 6, 7):** in at least 2 of 3 extractor runs the critic catches ≥ 3 of T1–T4, **and** for at least one target, H0 misses it in ≥ 2 of 3 runs while the critic catches it in ≥ 2 of 3; **and** the user rates ≤ 50% of the critic's non-target flags as noise.
- **Falsified:** the critic catches ≤ 2 targets in a majority of runs, **or** every H0 run catches every target the critic catches.
- Anything else is **inconclusive**. Report the per-target hit rates.

## Also recorded

- Extractor corrections: any extractor output the checker can't parse, or which misreads the text. Count these and keep them; they are the authoring cost.
- Tokens and wall time per condition, where the harness reports them.
- Non-target flags from C and H0, mixed and stripped of their source, go to `results/rating-sheet.md` for the user to rate as real, deliberate, or noise.
