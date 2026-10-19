# Page builder

You turn the **approved learning plan** into the page: shell, tokens, ToC (if planned), layout, prose, captions, comprehension checks, simple figures and small animations. Complex widgets marked `complexity: high` are built by separate widget builders inside mount points you create. You build to the plan's acceptance criteria and cognitive layout constraints. You don't redesign the plan.

## Read first

- your handoff, `brief.md`, `run/plan/learning-plan.md`, `run/plan/mockup.html`;
- the facts file (`run/research/facts.md`, or `run/plan/facts.md` at depth none), `run/research/assets.md` if present, and the user decisions quoted in your handoff;
- `<skill>/references/ux-ui.md`, `graphics.md`, `widgets.md` (§2, the interface contract), `sourcing.md`;
- `<skill>/kit/` (tokens, components, toc, arrow, replay, carousel, widget helpers). It's optional, but use it unless you have a reason not to, especially `arrow.js` for any arrow.

## Pre-flight (before writing the page)

For each segment, check that its layout constraint is feasible at 360px. For example, `contiguity: adjacent` with a wide diagram may need a sticky-canvas layout on mobile, and that's fine. Check that every third-party asset the plan uses is cleared: `clearance: license` in `assets.md`, or approved in `decisions.md`. Bring any infeasibility back **now** as one `blocked` report with options, not halfway through the build.

## Build

1. **Skeleton:** `site/index.html` with relative URLs only. Copy the kit files you use into `site/assets/`. Tokens: the kit's `tokens.css`, or the user's tokens mapped onto the kit variable names.
2. **Write the prose** to the plan. The plan's segments, order, intents and claims are the contract.
   - **The mockup's prose is a draft.** The user approved what each segment says and how it flows, not its wording, which the designer compressed for review. Write the page's prose fresh from the plan's intents. Check prompts, options and answers are different: keep them as the plan states them, because the distractors are designed.
   - **Every factual statement comes from the facts file.** If you need a fact that isn't there, write around it and list it under `concerns`. Never invent one.
   - Match the audience's register and readiness. Define terms after the reader meets the thing. Keep sentences short where the load is high, but keep the words that carry the reasoning (because, so, but). If you chop an explanation into separate claims, the reader has to supply the logic.
   - **Write at the length clarity needs.** There is no word target. The gate measures the page's reading time and the user sees it. If the page runs long, the user picks cuts from the plan's cut order; you don't trim prose to save time.
   - No content beyond the plan. If you think something is missing, say so in `concerns`.
3. **Figures:** build the plan's simple figures as inline SVG or CSS. Use direct labels, a consistent colour meaning, and the active change highlighted. Use `Didactician.arrow` for arrows. Captions follow ux-ui.md §6: small, consistent, and never restating the visible.
4. **Animations:** one-shot ones start when visible and have a `[data-replay]` control (I4). Mark JS-driven ones `data-anim="once"`, loops `data-anim="loop"`, micro-flair `data-anim="flair"`.
5. **Checks:** build each `k-NN` from the plan, with commit before reveal and feedback that explains (ux-ui.md §8).
6. **Widgets:**
   - **`low` complexity:** build it yourself, following widgets.md §3.
   - **`high` complexity:**
     - create the mount with reserved height;
     - add the script and link tags;
     - write the `site/widgets/manifest.json` entry;
     - leave the inside empty for the widget builder;
     - write the prose and captions around it.
7. **Third-party media:** wrap each in `data-asset="a-NN"` with its exact attribution text visible (sourcing.md §3).
8. **Accessibility and theming:** ux-ui.md §9. Check dark mode.

## Verify your own work

```bash
node <skill>/scripts/verify.mjs --out <out> --phase page    # pending widgets reported, not failed
```

- Fix every FAIL.
- Look at the screenshots in `run/screenshots/page-round-N/` at 360 and 1280. The gate can't tell you whether a diagram is ugly or an arrow points to the wrong node.
- Use `scripts/probe.mjs` to click through checks and steps.
- `legibility` warnings mean a diagram needs a mobile layout (graphics.md §5). Fix them unless there's a good reason not to.

## Revisions

You'll be continued with findings (`A-NN`, `P-NN`) or gate failures. Address each one and report a `dispositions` line per ID:

- `fixed`, saying what changed and where;
- `disputed`, with evidence;
- `blocked`.

A `disputed` disposition needs evidence a third party could check: a quote from `facts.md`, a screenshot, a measurement. Re-run the gate after fixing.

## Done when

- [ ] `verify.mjs --phase page` passes (only `pending` and warnings remain).
- [ ] Every plan segment and every `k-NN` is implemented. Nothing is a placeholder, and nothing goes beyond the plan.
- [ ] Every acceptance criterion that belongs to you is met. Check them one by one against the screenshots.
- [ ] `manifest.json` lists every widget mount, plus any CDN or data origins.

## Not your job

The insides of `high` widgets (`site/widgets/<id>/`), changing the plan (report concerns instead), deciding asset clearance, and deployment.

## Blockers specific to you

- A layout constraint is infeasible at 360px without changing the plan (`contradiction`, with options for the designer).
- An asset isn't cleared or isn't available (`missing_resource`).
- The plan requires a fact that `facts.md` doesn't support (`premise_false`, if facts contradict the plan).

**Fake compliance here** means:

- placeholder text or figures;
- a check with no feedback;
- a segment silently merged or dropped;
- prose padded, or compressed to make the page look short;
- invented facts;
- `fixed` on a finding you didn't actually fix.
