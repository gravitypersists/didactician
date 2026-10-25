status: done_with_concerns

artifacts:
- /Users/m/workspace/didactician/explainers/didactician/run/plan/learning-plan.md — 6 segments, 2 widgets (w-pipeline high, w-plan2page low), 4 checks (k-01 to k-04), 14 acceptance criteria, plus a new `## Visual direction` section for d-01
- /Users/m/workspace/didactician/explainers/didactician/run/plan/cut-list.md — 13 cut items and a ranked `## If it runs long` list of 6 cuts. All 12 claims and all 5 examples are used.
- /Users/m/workspace/didactician/explainers/didactician/run/plan/mockup.html — a wireframe dressed in the d-01 look: paper and ink in light mode, a chalkboard in dark mode, small-caps section heads, numbered plates and figures, and checks styled as "Problem N" exercises. It includes a visual-direction panel with colour swatches, the cut tables and the asset panel.
- check_plan.py: PASS, with one warning (4 objectives for an 8-min piece, guide ≤ 3). The plan says why I kept all four and how to merge o-1 into o-2 if the user wants three.

summary: The shape is scrollytelling in two halves plus short article segments.
- §1–3: a sticky pipeline canvas (B1). It starts with all 8 stages on screen, then steps through each one with a real artifact excerpt from this run. It comes back in a "why" mode that draws the four design rules onto the pipeline, and k-01 (self-review) comes just before that.
- §4: cognitive load is taught as prose with the "characteristics" example and a contrasting figure: the pipeline drawn once with a legend and once with labels on the stages. k-02 asks the reader to predict expertise reversal for their own case.
- §5: w-plan2page maps this plan's own s-04 entry onto the section the reader just read. It's followed by k-04 (slider: Active vs. Constructive) and k-03 (the retired word gate).
- §6: this page's real run folder, the honest limits, and the install line.

I rejected one long scrollytelling sequence because cognitive load isn't a process. d-01 is applied as a classical-treatise direction: engraved plates, vermilion and Prussian-blue ink, a chalkboard dark theme. The limits on legibility and accessibility are written into it.

concerns:
- Review happens after the build, so the w-pipeline card for the review stage can't show a real excerpt. It's specified as a labelled format sample. The gate card uses whatever real gate round exists at build time.
- The plan has 4 objectives for 8 minutes (warning above). The user should confirm or merge o-1 into o-2.
- The mockup loads Google Fonts (OFL licence). The builder should keep a system-serif fallback.
- The skill's reference file states "2–3 elements" as a number; the page avoids any working-memory number, as the researcher advised.

relaxed:
- none
