status: done

artifacts:
- /Users/m/workspace/didactician/explainers/didactician/site/widgets/w-pipeline/index.js — new Rule 1 label, filename-only W2 note, findings card tag, card metrics in one table, extra height used by the drawing at all grid widths, "why" SVG sized to its content
- /Users/m/workspace/didactician/explainers/didactician/site/widgets/w-pipeline/index.css — mount content centred vertically, card header in two fixed rows (path, then tag), status line wraps to 2 lines, `.wp-status[hidden]` fix
- /Users/m/workspace/didactician/explainers/didactician/run/gate/w-pipeline-round-3.json — `verify.mjs --widget w-pipeline` passes on every check at 360/768/1280. The full-page gate also passes (page-round-5.json).

summary: I fixed all four findings without touching the mount contract. A-01: the Rule 1 label and the live sentence now give the reviewer inputs per SKILL.md#L183. P-04: the card tag gets its own header row, and the status line wraps into a fixed 2-line slot, so the card keeps the same height from step to step. P-08: on the grid layouts, spare mount height now goes into larger nodes and gaps, and what's left is centred instead of pooling at the bottom. P-09: the W2 note is now just the example filenames. I measured the mounts at 360×640, 390×844, 1280×900, 1280×800 and 740×360: content height equals the reserved min-height in every state, document width equals viewport width, and the smallest label is 12px.

concerns:
- P-08: the widget can't make the mount shorter than the min-height the page reserves (treatise.css). On desktop "why" (420px reserved) about 40px of slack remains above and below the centred drawing. If the reviewer wants it gone, the page builder could lower `[data-mode="why"]` min-height to about 380px on desktop. I didn't change the contract.
- At 740×360 landscape the card shrinks to its file path alone, so the findings card's "format example" tag is hidden there. The dashed border still marks it.
- During a run mid-revision I saw a 366px document width at 360 with the page builder's parallel edits in flight. After my `[hidden]` fix the widget gate and the full-page gate both pass with no overflow, and a re-probe shows 360.

relaxed:
- none

dispositions:
- A-01: fixed — the Rule 1 overlay label now reads "fresh context: brief + page (+ facts or plan), not the builder's reasoning", matching SKILL.md#L183 (facts go to the accuracy reviewer, the plan to pedagogy-ux). The aria-live sentence is updated to match. Checked by screenshot at 360 and 1280 (W1).
- P-04: fixed — the findings card tag moved to its own header row, shortened to "format example · this page's real ones: run/review/", with no small caps. It shows in full at 360 and 1280. The status line wraps to 2 lines instead of an ellipsis: at 1280×800 it reads "Stage 3 of 8: Plan, by the instructional designer, an agent. Produces learning-plan.md, mockup.html, cut-list.md." in full.
- P-08: fixed — spare height now goes into the drawing on both mobile and desktop grids, the "why" SVG is sized to its content, and the mount centres what's left. Any remaining slack comes from the page's reserved min-height (see concerns).
- P-09: fixed — the W2 canvas note is now just "03-instructional-designer.prompt.md ↔ .report.md". The rule itself stays in the step text.
