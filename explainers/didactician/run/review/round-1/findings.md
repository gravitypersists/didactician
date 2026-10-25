# Findings: round 1

_Ingested 2026-10-25T11:11:18-04:00 from accuracy.md, pedagogy-ux.md._

### A-01 · should · open
criterion: o-1 (artifact/stage accuracy)
location: s-02 Plate I step 7 card ("Stage 7 · Review"); w-pipeline why-mode Rule 1 overlay label (screenshot run/screenshots/probe/d1280-why1.png)
verdict: contradicted
evidence: The page says: "Two reviewers, one for accuracy and one for teaching and UX, each start in a fresh context. They see the brief, the fact base and the page, and never the builder's report." The Rule 1 overlay label says: "fresh context: brief + facts + page, not the builder's reasoning". SKILL.md#L183 says: "Give them the brief, the plan (for the pedagogy-ux reviewer), the facts (for the accuracy reviewer), the site, and the gate's screenshots." agents/pedagogy-ux-reviewer.md "Read first" lists the brief, learning-plan.md, the site and the screenshots, but not facts.md. This run's handoff 07 matches that. The independence point (never the builder's report) is correct; the list of inputs is not.
expected_fix: In the step 7 card, write something like "They see the brief and the page, plus the fact base (accuracy) or the plan (teaching and UX), and never the builder's report." Shorten the Rule 1 label to fit, e.g. "fresh context: brief + page (+ facts or plan), not the builder's reasoning". Problem 1 option B can stay as it is, because it describes the accuracy check.

### A-02 · should · open
criterion: o-4 (learning-science claims must not overstate the evidence)
location: s-05 Problem 3 solution (k-04), first paragraph
verdict: unsupported
evidence: The page says: "Predicting first makes it Constructive, because the reader generates something that isn't on the screen, and a wrong guess followed by the real result is what sticks (the ICAP framework, which its authors frame as a hypothesis)." The parenthetical credits ICAP with the "wrong guess … is what sticks" effect. c-12 supports only the Active/Constructive ranking (Chi & Wylie 2014) and the skill's directive. No claim in facts.md supports the memory effect of a wrong prediction. The only source for it is the skill's own reference (learning-science-patterns.md §5: "creates surprise, which drives attention and memory"), which is a directive, not evidence. "Is what sticks" also states the effect as a certainty.
expected_fix: Move the ICAP citation so it sits after the Active-to-Constructive sentence. Then either soften the second part ("and a wrong guess, once the real result appears, is hard to ignore") without crediting it to ICAP, or drop it. The point the check is making doesn't need it.

### A-03 · nit · open
criterion: o-1
location: s-02 Plate I step 5 card ("Each complex widget … gets a builder of its own"), step 7 card ("Two reviewers"), step 6 card ("fails it on anything a machine can check")
verdict: misleading-simplification
evidence: SKILL.md#L98-L100 (effort scaling): for pieces of 5 minutes or less, the page builder builds the widget and a single merged reviewer runs (DESIGN.md#L507: "already merged for short pieces"). verify.mjs runs a fixed list of checks (README.md#L110-L122), and legibility only produces a warning. "Anything a machine can check" overstates that a little. All three statements are true for this page's 8-minute run. None of them changes the reader's model of independence or gating.
expected_fix: Optional. Add "(on longer pieces)" or "usually" to the step 5 and step 7 cards, and change "anything a machine can check" to "a list of things a machine can check (overflow, broken resources, console errors, …)".

### P-01 · blocking · open
criterion: engagement where intended / o-3 (plan s-04 F-split, x-02); misconception handling
location: s-04, Plate III (#plate-3), both widths; probe x-1280-plate3.png, m390-plate3.png
evidence: Above both panels the page asks "Which stage writes findings.md?" and promises "Here is some extraneous load you can feel." In A, the key lists "7 Review · findings.md" in full, so the reader answers by reading the key alone and never looks at the numbered circles. The circles carry no information the key lacks (no arrows, no artifacts, no order cue beyond the number). There is no shuttling, so the caption's "your eyes shuttle between node and key and you hold the mapping in your head" is not what the reader experiences. A skeptical technical reader may conclude that split attention is overstated, which is the opposite of o-3. This is the page's only felt demonstration of extraneous load. (The flaw comes from the plan's spec, "key mapping number → stage → artifact", but it shows up on the page.)
expected_fix: Split the information so that answering the question requires combining figure and key. For example, in A put each artifact filename on its node next to the number (in the same snake layout and arrows as Plate I) and make the key map number → stage name only. "Which stage writes findings.md?" then means: find findings.md on the figure, read its number, look up the number in the key. Keep B as is, with name and artifact on each node. The caption can then stay as written. Alternatively, keep the key as it is and ask a question whose answer only the diagram's structure gives (e.g. "Which stage comes right after the one that writes site/?"), with arrows drawn in both versions.

### P-02 · blocking · open
criterion: ac-01
location: s-01 hero → s-02 Plate I, desktop 1280×800 (probe x-1280x800-hero.png) and 1280×900 (d1280-hero.png)
evidence: At 1280×800 the w-pipeline mount starts at y=675. The first screen shows the title, standfirst, meta row, § 1 paragraph, § 2 heading and only the top row of stages (Intake, Research, Plan, Approve); Build, Gate, Review and Deliver are below the fold. At 1280×900 the bottom row is visible but its artifact labels are cut off, and the "Scroll on" step card (top ≈ 820) is off-screen, so the first screen has no cue that the plate is interactive. The brief stresses that skimmers need the overview within the first minute or two.
expected_fix: Bring Plate I's full 8-stage strip and the step-0 card above the fold at 1280×800. For example, tighten the frontispiece's vertical spacing (rules, subtitle, meta row margins), set the § 1 paragraph on the narrower measure or shorten it to the two-halves sentence, and/or reduce the space between the § 2 heading and the plate. On desktop, align the step-0 card's top with the plate's top so the "Scroll on" cue is visible next to the overview.

### P-03 · should · open
criterion: misconception handling / engagement (k-01, s-03 intent "confront the belief that self-review is enough")
location: s-03, Problem 1 ([data-check="k-01"]); probe m390-k01pre.png
evidence: Option B ("A fresh reviewer that sees only the brief, the fact base and the page, not the builder's reasoning.") is twice as long as A and C, contains the answer's whole rationale, and repeats almost word for word Stage 7's card a screen earlier ("each start in a fresh context. They see the brief, the fact base and the page, and never the builder's report"). Option A is phrased as a weak strawman. A reader picks B by pattern-matching and never seriously considers A, so the "self-review is enough" belief is never actually put at risk. The feedback itself is good.
expected_fix: Make the options parallel in length and specificity, and make A as tempting as a reader's real practice: e.g. A) "Have the builder re-check every claim against the fact base before finishing." B) "A second agent that reads only the brief, fact base and page." C) "The Playwright gate passes." Keep the current Solution text.

### P-04 · should · open
criterion: ac-03 / clarity of interaction
location: w-pipeline, "what" mode state 7 (findings.md card header), 1280 and 390; probe d1280-what7.png, m390-what7.png
evidence: The label reads "format; this page's real findings ar…" at 1280 and "FORMAT; THIS P…" at 390. It is truncated, so the explanation that this page's real findings live in its run/ is never readable. The dashed border helps, but the label doesn't say what it means. In the same family, the status line under the strip is truncated on desktop ("Stage 3 of 8: … Produces learnin…", "Produces fin…"), which hides mockup.html and cut-list.md for the Plan stage.
expected_fix: Let the card label wrap to a second line, or shorten it to fit (e.g. "format example · real ones in run/review/"). Let the status line wrap instead of ending in an ellipsis.

### P-05 · should · open
criterion: mobile UX (ux-ui §5 "controls and effect visible together"; carousel-like reflow)
location: s-05, w-plan2page at 390px; probe m390-p2p1.png, m390-p2p3.png
evidence: The widget is 922px tall on steps 1–2 and 873px on steps 3–4. It is taller than an 844px viewport, against the plan's ~520px. The ‹ › buttons sit under the variable-length reason line, so they move up ~50px between steps 2 and 3, and a reader tapping › repeatedly can miss. On a 740px-tall phone, the highlighted plan line, the outlined region and the buttons can't all be seen at once.
expected_fix: Reserve a fixed min-height for .p2p-reason (the tallest of the four reasons) so the buttons don't move. Make the stack shorter on mobile: e.g. show only the 3 lines nearest the active one in the plan excerpt, or reduce the thumbnail's line spacing, aiming for the plan's ~520px.

### P-06 · nit · open
criterion: cognitive load fit (terms before the thing they name)
location: s-05, w-plan2page plan excerpt and Fig. 2 cut-list card
evidence: The verbatim excerpts carry internal IDs the reader has never been told about: "s-04", "o-3", "x-01", "x-02", "k-02", "c-10", "w-plan2page". The thumbnail header "§ 4 · Cognitive load" implies that s-04 = § 4, and the reason text says "Problem 2", but nothing says k-02 = Problem 2 or what x-/c- mean.
expected_fix: Add one short gloss under the plan file header, or in the lead-in sentence, e.g. "(s-04 is § 4; k-02 is Problem 2; x- and c- are example and claim IDs from the fact base)". Keep the excerpt verbatim.

### P-07 · nit · open
criterion: visual consistency and polish
location: ToC rail progress line, desktop ≥ 1100px (every d1280-*.png)
evidence: The percentage after the ASCII bar is clipped to one character ("0", "1", "3", "6") by the rail width.
expected_fix: Narrow the bar or let the rail show the full "41%".

### P-08 · nit · open
criterion: visual consistency and polish
location: w-pipeline sticky plate at 390px (m390-what3.png) and Plate I/II at 1280 (d1280-why1.png)
evidence: The plate frame keeps ~90px (mobile) and ~60–110px (desktop) of empty space below the artifact card or overlay. On mobile that is sticky height taken from the step text below.
expected_fix: Size the plate to its content per mode, or vertically centre the content in the frame.

### P-09 · nit · open
criterion: split attention and redundancy
location: s-03, Plate II rule 2 (W2) canvas note vs. step card; probe d1280-why2.png
evidence: The canvas note "Every dispatch's prompt and report are saved as a pair in run/handoffs/, e.g. 03-instructional-designer.prompt.md and .report.md" repeats the step text next to it ("Each agent's prompt and its report are saved as a pair under run/handoffs/").
expected_fix: Keep only the example filename on the canvas (e.g. "03-instructional-designer.prompt.md ↔ .report.md"). The step text already gives the rule.

### P-10 · nit · open
criterion: clarity of interaction
location: s-02 Stage 5 step text, mobile (x-740x360-what5.png)
evidence: "Each complex widget, like the plate beside this text, …". On phones the plate is above the text, not beside it.
expected_fix: "like the plate on this page" (or "this plate").
