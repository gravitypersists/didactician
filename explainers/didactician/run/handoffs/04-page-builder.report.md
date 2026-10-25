status: done_with_concerns

artifacts:
- /Users/m/workspace/didactician/explainers/didactician/site/index.html — the full page: frontispiece (s-01), s-02 to s-06 with final prose, Problems 1–3 (k-01, k-02, k-04), Fig. 1–3, Plates III–IV, two w-pipeline mounts
- /Users/m/workspace/didactician/explainers/didactician/site/assets/tokens.css — treatise tokens for paper and chalkboard, mapped onto the kit names. Role tokens: --role-agent, --role-script (= --c1), --role-human (= --c2 = --accent)
- /Users/m/workspace/didactician/explainers/didactician/site/assets/treatise.css — page styles: plates, specimen cards, exercises, scrollytelling, w-plan2page
- /Users/m/workspace/didactician/explainers/didactician/site/assets/page.js — check logic (commit, then reveal) and the scroll-step driver for both plates
- /Users/m/workspace/didactician/explainers/didactician/site/assets/plan2page.js — w-plan2page (low complexity). It has 4 states, ‹ › buttons with 44px targets, ←/→ keys, an aria-live sentence, and a connector drawn with kit/arrow.js
- /Users/m/workspace/didactician/explainers/didactician/site/assets/{components.css,toc.js,arrow.js,widget.js,replay.js} — copied from the kit
- /Users/m/workspace/didactician/explainers/didactician/site/widgets/manifest.json — the w-pipeline entry: both mounts, sizes, and the contract notes for the widget builder

summary: I built every segment to the approved plan. The prose was written fresh from the plan's intents. Check prompts, options and answers are verbatim from the plan. The visual direction is applied: small-caps display heads, § numbering, a vermilion drop initial, engraved plates with hatching only in the frame band, graph-paper specimen cards, "Problem N · Kind" exercises with a "Solution." run-in head, and a chalkboard dark theme. Contrast was checked at 4.5:1 or better in both themes. The page does not mention k-03 or tell the word-gate story. The scroll steps (step prose) belong to the page: page.js sets `data-active-step` on each mount and dispatches a `didactician:step` event. The widget builder draws only inside the mounts. `verify.mjs --phase page` gives PASS (round 3). The only non-pass is the expected warning that w-pipeline is pending. I checked screenshots at 360, 1280, landscape 740×360, and in dark mode.

concerns:
- For the widget builder (ac-07): the brief.md card should not show the o-3 line, and the learning-plan.md card should not show the s-04 `readiness:` line. Both contain "working memory" or "intrinsic vs. extraneous", which would put those terms before § 4's "characteristics" example. On the decisions.md card, d-03's quote mentions crunched prose, so excerpt it with care (d-03) or use d-02.
- The two mounts share `data-widget="w-pipeline"` and differ by `data-mode`. The kit's `Didactician.widget()` only initialises the first match, so index.js has to init both itself. This is noted in the manifest.
- Reading time is about 9.7 min (gate measure). The brief budget is 8 min; the user's ceiling is about 10. The widget's cards will add a little more. The meta line and the rail say "About 10 minutes". If the user wants it shorter, the plan's cut order applies. I didn't trim anything.
- ac-01: at 1280×900 the Plate I mount starts at about 660px, so the strip is visible if the widget draws it first (about 140px). On an 800px-tall screen this is borderline.
- In w-plan2page, state 1 quotes the o-3 objective line from `## Objectives`, not from inside the s-04 entry. State 3 highlights the F-split "B: … written on each node." line instead of `contiguity: adjacent`, because that is the line that produced labels on the nodes.
- Fig. 2 (F-cut): I used the redundancy/signalling row instead of the "working-memory number" row. That row prints "2–3 elements", which would break ac-07's "no numeric capacity anywhere on the page". The caption says "the user saw this list", not "you saw".
- These details come from run files and the README, not facts.md: the install line (README) and "For this page it asked none" at Intake (run/log.md).
- The ToC lists § 2 to § 6. § 1 is the "§ 1." run-in paragraph in the frontispiece.

relaxed:
- none

dispositions:
- none (first build)
