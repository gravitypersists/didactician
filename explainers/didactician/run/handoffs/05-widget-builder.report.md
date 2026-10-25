status: done_with_concerns

artifacts:
- /Users/m/workspace/didactician/explainers/didactician/site/widgets/w-pipeline/index.js — both modes. It boots every `[data-widget="w-pipeline"]` mount itself, reads `data-active-step` at start, and listens for `didactician:step`.
- /Users/m/workspace/didactician/explainers/didactician/site/widgets/w-pipeline/index.css — scoped to the mounts, uses tokens only (no literal colours), engraved-plate styling.
- /Users/m/workspace/didactician/explainers/didactician/run/gate/w-pipeline-round-2.json — gate result: PASS on every check at 360, 768 and 1280.

summary: Plain JS and SVG with kit/arrow.js; no libraries and no CDN loads. One row of 8 stages at ≥620px containers, 4×2 snake grid narrower; card shrinks to the reserved height. Active stage vermilion hatching; others 35% with legible labels. "why" overlays cross-fade (instant under reduced motion). aria-live sentence per plan. ac-02..ac-05 checked by probe/screenshots at 1280×900, 768×1024, 360×640, 740×360, dark 1280. Card text verbatim from run/ files; findings card is a labelled format sample. No claim the reviewer split is proven (c-06).

concerns:
- facts.md card: the plan asked for claim c-07, but c-07's text contains "working memory", which the handoff forbids before § 4. Used c-01 instead.
- decisions.md card shows d-02. The step-4 prose says "the user asked for one change and approved the rest", which describes d-03, so card and prose don't quite match. Page builder may adjust the prose.
- On narrow containers the "You approve" node uses the short label "Approve".
- Under ~620px wide, file chips show as glyphs rather than names; on mobile W2 lights glyphs.
- Long excerpt lines end with "…" where the card is too narrow.
- The run/ overview card (state 0) lists the eight artifact names, overlapping a little with the s-06 tree.
- Probe screenshots are under run/screenshots/probe/ and scratchpad; gate screenshots in run/screenshots/w-pipeline-round-2/.

relaxed:
- none

dispositions:
- none (first build)
