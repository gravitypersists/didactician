status: done_with_concerns

artifacts:
- /Users/m/workspace/didactician/explainers/didactician/site/index.html — revised: Stage 4/5/6/7 step prose, the k-01 options, the k-04 Solution, Plate III version A, the ID glosses
- /Users/m/workspace/didactician/explainers/didactician/site/assets/treatise.css — revised: tighter frontispiece, step-0 card aligned with the plate, new Plate III A layout, shorter w-plan2page on mobile, ToC rail progress line, option layout
- /Users/m/workspace/didactician/explainers/didactician/site/assets/plan2page.js — the reason line's height is now fixed at the tallest of the four reasons, so the ‹ › buttons stay in place

summary: I fixed all ten findings that belong to the page, and the widget builder's step-4 mismatch. `verify.mjs --phase page` passes (round 6). w-pipeline is now built, so nothing is reported as pending. I checked the result in screenshots at 1280×800, 1280×900 and 390, and probed the k-01 commit and the w-plan2page states.
- **Step-4 mismatch:** the Stage 4 prose now matches the d-02 card: "the user chose to keep all four of the plan's objectives". It doesn't quote or describe d-03.
- **Prose length:** I didn't compress anything to save time. The § 1 paragraph lost about ten words of wording in the P-02 fix, and all its connectives are still there. The new glosses and fuller step prose add a little text.

concerns:
- Reading time is now about 10.4 min by the gate's measure, which includes the widget's card text. The brief's budget is 8 min, and the user's ceiling was about 10. The meta line still says "About 10 minutes". If the user wants it shorter, the plan's cut order applies.
- P-05: w-plan2page is now 698px tall at 390 (it was 922). The plan asked for about 520. Getting there would mean dropping plan lines or thumbnail parts, which goes against "keep the excerpt verbatim". The buttons no longer move between steps.
- A-01 also has a part in the Rule 1 overlay label, which belongs to the widget builder. I only changed the step 7 prose.

relaxed:
- k-01 options — the plan marked them as final wording. They were reworded for parallel length, as handoff 08 approved. B is still the correct answer and the Solution text is unchanged.

dispositions:
- A-01: fixed — Stage 7 step: "Both see the brief and the page; the accuracy reviewer also gets the fact base, and the teaching reviewer gets the plan. Neither ever sees the builder's report."
- A-02: fixed — ICAP citation after the Active→Constructive sentence; wrong-guess point softened and no longer credited to ICAP.
- A-03: fixed — Stage 5/7 "On a piece of this length, …"; Stage 6 "a fixed list of things a machine can check, such as …".
- P-01: fixed — Plate III A: filenames on numbered circles, key maps numbers to stage names only.
- P-02: fixed — at 1280×800 the full 8-stage strip ends at y=777; step-0 card at y=492.
- P-03: fixed — options reworded to parallel length; Solution unchanged.
- P-05: fixed (partly) — buttons fixed; 922→698px at 390.
- P-06: fixed — ID gloss in s-05 lead-in and Fig. 2.
- P-07: fixed — rail progress shows full percentage.
- P-10: fixed — "like this plate".
