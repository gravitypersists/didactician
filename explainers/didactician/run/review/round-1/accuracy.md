# Accuracy review: round 1

## Summary
I checked about 60 factual statements: the prose, the Plate I and II step cards and overlays, the specimen cards, Plate III, Plate IV (w-plan2page), the cut-list figure, the run tree, and the feedback for all three problems. The claims about the skill match SKILL.md, README.md and DESIGN.md. The claims about the run match run/. The learning-science claims match c-07–c-10 and c-12 and stay within them: no number is given for working memory, germane load is presented as a critique, ICAP is called a hypothesis, and the reviewer split is said to be untested. Nothing is blocking. The most important issue is that Stage 7 and the Rule 1 overlay say both reviewers see the fact base. Only the accuracy reviewer does; the pedagogy/UX reviewer gets the plan. One sentence in Problem 3's solution also attributes the "wrong guess sticks" effect to ICAP.

## Findings

### new
severity: should
criterion: o-1 (artifact/stage accuracy)
location: s-02 Plate I step 7 card ("Stage 7 · Review"); w-pipeline why-mode Rule 1 overlay label (screenshot run/screenshots/probe/d1280-why1.png)
evidence: The page says: "Two reviewers, one for accuracy and one for teaching and UX, each start in a fresh context. They see the brief, the fact base and the page, and never the builder's report." The Rule 1 overlay label says: "fresh context: brief + facts + page, not the builder's reasoning". SKILL.md#L183 says: "Give them the brief, the plan (for the pedagogy-ux reviewer), the facts (for the accuracy reviewer), the site, and the gate's screenshots." agents/pedagogy-ux-reviewer.md "Read first" lists the brief, learning-plan.md, the site and the screenshots, but not facts.md. This run's handoff 07 matches that. The independence point (never the builder's report) is correct; the list of inputs is not.
expected_fix: In the step 7 card, write something like "They see the brief and the page, plus the fact base (accuracy) or the plan (teaching and UX), and never the builder's report." Shorten the Rule 1 label to fit, e.g. "fresh context: brief + page (+ facts or plan), not the builder's reasoning". Problem 1 option B can stay as it is, because it describes the accuracy check.
verdict: contradicted

### new
severity: should
criterion: o-4 (learning-science claims must not overstate the evidence)
location: s-05 Problem 3 solution (k-04), first paragraph
evidence: The page says: "Predicting first makes it Constructive, because the reader generates something that isn't on the screen, and a wrong guess followed by the real result is what sticks (the ICAP framework, which its authors frame as a hypothesis)." The parenthetical credits ICAP with the "wrong guess … is what sticks" effect. c-12 supports only the Active/Constructive ranking (Chi & Wylie 2014) and the skill's directive. No claim in facts.md supports the memory effect of a wrong prediction. The only source for it is the skill's own reference (learning-science-patterns.md §5: "creates surprise, which drives attention and memory"), which is a directive, not evidence. "Is what sticks" also states the effect as a certainty.
expected_fix: Move the ICAP citation so it sits after the Active-to-Constructive sentence. Then either soften the second part ("and a wrong guess, once the real result appears, is hard to ignore") without crediting it to ICAP, or drop it. The point the check is making doesn't need it.
verdict: unsupported

### new
severity: nit
criterion: o-1
location: s-02 Plate I step 5 card ("Each complex widget … gets a builder of its own"), step 7 card ("Two reviewers"), step 6 card ("fails it on anything a machine can check")
evidence: SKILL.md#L98-L100 (effort scaling): for pieces of 5 minutes or less, the page builder builds the widget and a single merged reviewer runs (DESIGN.md#L507: "already merged for short pieces"). verify.mjs runs a fixed list of checks (README.md#L110-L122), and legibility only produces a warning. "Anything a machine can check" overstates that a little. All three statements are true for this page's 8-minute run. None of them changes the reader's model of independence or gating.
expected_fix: Optional. Add "(on longer pieces)" or "usually" to the step 5 and step 7 cards, and change "anything a machine can check" to "a list of things a machine can check (overflow, broken resources, console errors, …)".
verdict: misleading-simplification
