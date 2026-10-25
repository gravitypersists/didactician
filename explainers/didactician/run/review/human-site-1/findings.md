# Findings: human review site-1

_Ingested 2026-10-25T15:25:45-04:00 from comments.json on d-05. H- findings are closed only by the user._

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

### H-01 · blocking · open
criterion: human review (site-1, comment #1)
location: block on "Didactician is a Claude Code skill that turns a request like “explain X to Y” into a static explainer page. It plans every page as a lesson: who the reader is, what they should be able to do afterwards, and what to leave out." (selector `#s-01 > div:nth-of-type(3) > p:nth-of-type(1)`)
evidence: The user wrote: "I think this introduction needs to indicate that this is mindful for content with heavy cognitive loads. We also should indicate that it's a multi-agent system and is quite heavy on token usage. As well, we should treat didactician a bit less like an input/output box, and more that it aims to be a pedagogically sound pipeline tool explicitly built for human in the loop reivew processes."
expected_fix: What the user asks for in their comment. If the intent is unclear, ask the user; don't guess.

### H-02 · blocking · open
criterion: human review (site-1, comment #2)
location: block on "Being an Account of a Machine that Plans Its Pages as Lessons" (selector `#s-01 > p:nth-of-type(1)`)
evidence: The user wrote: "Let's indicate that this page was built via the didactician tool"
expected_fix: What the user asks for in their comment. If the intent is unclear, ask the user; don't guess.

### H-03 · blocking · open
criterion: human review (site-1, comment #3)
location: text "The first shows the machinery: eight stages, each handing the next a file, and why the pipeline is built that way. The second opens the stage that makes the output teach rather than merely inform, and the idea from learning science it rests on: cognitive load."
evidence: The user wrote: "Too wordy. Let's just say the first half is about the pipeline process. The second half explains the pedagogical motivations."
expected_fix: What the user asks for in their comment. If the intent is unclear, ask the user; don't guess.

### H-04 · blocking · open
criterion: human review (site-1, comment #4)
location: text "Scroll on: each step opens one stage, and the plate stays in view."
evidence: The user wrote: "Let's get rid of this comment here, maybe a simpler "scroll v" underneath this box might be prudent."
expected_fix: What the user asks for in their comment. If the intent is unclear, ask the user; don't guess.

### H-05 · blocking · open
criterion: human review (site-1, comment #5)
location: text "You type one line."
evidence: The user wrote: "Let's avoid talking about one line - building pages from simple one liners isn't exactly the selling point here. It can do it, sure, but we want to also motivate well-reasoned and thought through input as well."
expected_fix: What the user asks for in their comment. If the intent is unclear, ask the user; don't guess.

### H-06 · blocking · open
criterion: human review (site-1, comment #6)
location: text "For this page it asked none."
evidence: The user wrote: "irrelevant. remove this please."
expected_fix: What the user asks for in their comment. If the intent is unclear, ask the user; don't guess.

### H-07 · blocking · open
criterion: human review (site-1, comment #7)
location: text "It asks you a question"
evidence: The user wrote: "Let's change this to "The orchestrator will ask you a question""
expected_fix: What the user asks for in their comment. If the intent is unclear, ask the user; don't guess.

### H-08 · blocking · open
criterion: human review (site-1, comment #8)
location: text "A researcher"
evidence: The user wrote: ""A fresh researcher agent""
expected_fix: What the user asks for in their comment. If the intent is unclear, ask the user; don't guess.

### H-09 · blocking · open
criterion: human review (site-1, comment #9)
location: block on "A researcher answers the brief’s questions and stops at a cap. Each claim it keeps is tied to an objective and goes into the fact base with a source, a quote and a confidence." (selector `#s-02 > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(3) > p:nth-of-type(2)`)
evidence: The user wrote: "This overall text is a little dry and a bit too tactical. Let's make it a bit more strategic sounding, something along the wording of "The researcher's job is to collect facts and sources to drive the rest of the pipeline from.""
expected_fix: What the user asks for in their comment. If the intent is unclear, ask the user; don't guess.

### H-10 · blocking · open
criterion: human review (site-1, comment #10)
location: text "The card shows one of this page’s real checkpoint answers: the user chose to keep all four of the plan’s objectives."
evidence: The user wrote: "this sentence is confusing, let's remove it"
expected_fix: What the user asks for in their comment. If the intent is unclear, ask the user; don't guess.

### H-11 · blocking · open
criterion: human review (site-1, comment #11)
location: text "Your answer is written down as a decision that later stages must follow"
evidence: The user wrote: ""and which also show up in the audit trail.""
expected_fix: What the user asks for in their comment. If the intent is unclear, ask the user; don't guess.

### H-12 · blocking · open
criterion: human review (site-1, comment #12)
location: text "On a piece of this length, each complex widget, like this plate, gets a builder of its own."
evidence: The user wrote: "This is a bit too passive. Let's say something more along the lines of "This is where we also build widgets. The visualization we are looking at now is one of these widgets. Each widget gets a fresh builder agent.""
expected_fix: What the user asks for in their comment. If the intent is unclear, ask the user; don't guess.

### H-13 · blocking · open
criterion: human review (site-1, comment #13)
location: text "All of them"
evidence: The user wrote: ""Every agent""
expected_fix: What the user asks for in their comment. If the intent is unclear, ask the user; don't guess.

### H-14 · blocking · open
criterion: human review (site-1, comment #14)
location: block on "On a piece of this length, two reviewers, one for accuracy and one for teaching and UX, each start in a fresh context. Both see the brief and the page; the accuracy reviewer also gets the fact base, and the teaching reviewer gets the plan. Neither ever sees the builder’s report." (selector `#s-02 > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(8) > p:nth-of-type(2)`)
evidence: The user wrote: "Let's introduce the review step on it's own rather than "on a piece of this length." Let's just indicate that there are two reviewers and what they check for."
expected_fix: What the user asks for in their comment. If the intent is unclear, ask the user; don't guess.

### H-15 · blocking · open
criterion: human review (site-1, comment #15)
location: text "it"
evidence: The user wrote: ""the pipeline""
expected_fix: What the user asks for in their comment. If the intent is unclear, ask the user; don't guess.

### H-16 · blocking · open
criterion: human review (site-1, comment #16)
location: text "page builder"
evidence: The user wrote: "I think this is the first time we refer to this as "the page builder" and it's easy for a reader to construe this as the full didactician pipeline. Maybe instead something like "After the build step...""
expected_fix: What the user asks for in their comment. If the intent is unclear, ask the user; don't guess.

### H-17 · blocking · open
criterion: human review (site-1, comment #17)
location: text "plate"
evidence: The user wrote: "Let's rename "plate" everywhere to "diagram""
expected_fix: What the user asks for in their comment. If the intent is unclear, ask the user; don't guess.

### H-18 · blocking · open
criterion: human review (site-1, comment #18)
location: block on "That answer is one of four rules that shape the pipeline. The plate below is the same apparatus, with each rule drawn onto the part it governs." (selector `#s-03 > p:nth-of-type(2)`)
evidence: The user wrote: "This sentence makes no sense to me. We're introducing the diagram below, but why? Let's take a fresh stab at this."
expected_fix: What the user asks for in their comment. If the intent is unclear, ask the user; don't guess.

### H-19 · blocking · open
criterion: human review (site-1, comment #19)
location: text "Your main session dispatches agents and records what they return."
evidence: The user wrote: ""Your main session is the orchestrator. It acts as your point of communication, and dispatches agents, recording what they return.""
expected_fix: What the user asks for in their comment. If the intent is unclear, ask the user; don't guess.

### H-20 · blocking · open
criterion: human review (site-1, comment #20)
location: text "So no reviewer is grading work that its own context produced, and the raw research stays out of the context that writes the prose."
evidence: The user wrote: "This writing is a bit confusing, and it's a pretty important point. Let's try and reword it."
expected_fix: What the user asks for in their comment. If the intent is unclear, ask the user; don't guess.

### H-21 · blocking · open
criterion: human review (site-1, comment #21)
location: text "Stages hand each other files, never chat."
evidence: The user wrote: "Stages aren't agents. Agents hand each other files and they never chat with one another. I understand we want to avoid introducing subagents, but we can talk about how the orchestrator will coordinate between the stages with artifacts."
expected_fix: What the user asks for in their comment. If the intent is unclear, ask the user; don't guess.

### H-22 · blocking · open
criterion: human review (site-1, comment #22)
location: text "was told and what it said back"
evidence: The user wrote: "This is confusing, because you just told me "they never chat" and now we're talking about what it said back? Let's introduce that each agent communicates via a strict structure."
expected_fix: What the user asks for in their comment. If the intent is unclear, ask the user; don't guess.

### H-23 · blocking · open
criterion: human review (site-1, comment #23)
location: block on "Rule 3 · Scripts gate what’s checkable" (selector `#s-03 > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(3) > p:nth-of-type(1)`)
evidence: The user wrote: "I'm not understanding the value in communicating this rule, maybe it's how it's worded. but these scripts just enforce the rules of the handoffs. I'm not sure it's worth promoting to the reader here, as it's implementation details that don't really matter (I can be convinced otherwise though)"
expected_fix: What the user asks for in their comment. If the intent is unclear, ask the user; don't guess.

### H-24 · blocking · open
criterion: human review (site-1, comment #24)
location: block on "The skill’s design notes call a wrong premise in the plan the most expensive error in the system, since every later stage builds on it." (selector `#s-03 > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(4) > p:nth-of-type(2)`)
evidence: The user wrote: "This is a little weak, we're referencing the skills design notes? Let's be a bit more authoritative here, it's part of the skill's design philosophy to present a human in the loop check early on to prevent cascading issues through the pipeline. This is a cost and time cutting maneuver."
expected_fix: What the user asks for in their comment. If the intent is unclear, ask the user; don't guess.

### H-25 · blocking · open
criterion: human review (site-1, comment #25)
location: block on "Read this word: characteristics." (selector `#s-04 > p:nth-of-type(1)`)
evidence: The user wrote: "This "characteristics" example is flawed. The example confuses low-level sensory perception with cognitive load in learning or problem-solving, making the mechanism feel artificial rather than intuitive. Instead let's try: Look at this expression: Python total = sum(x for x in values if x > 0) A non-programmer: Must track 10 distinct tokens (total, =, sum, x, for, in, values, if, >, 0), look up their definitions, and mentally simulate how each symbol connects to the next. An experienced developer: Reads it in a fraction of a second as one standard schema: "sum positive numbers." The code does not change. For the novice, tracing the syntax exhausts their working memory before they even determine what the program does. For the developer, long-term memory compresses the entire expression into a single working-memory slot, leaving mental bandwidth free to think about architecture or edge cases."
expected_fix: What the user asks for in their comment. If the intent is unclear, ask the user; don't guess.

### H-26 · blocking · open
criterion: human review (site-1, comment #26)
location: text "For you"
evidence: The user wrote: "we say for you, but this answer probably has a different answer for somebody familiar with subagents than it does somebody who is not. In a sense, I think it can add more cognitive load not to mention subagents because somebody who has already grokked the role of subagents doesn't need to wonder what the page is hinting at."
expected_fix: What the user asks for in their comment. If the intent is unclear, ask the user; don't guess.

### H-27 · blocking · open
criterion: human review (site-1, comment #27)
location: block on "Older accounts of the theory added a third kind, germane load: the effort that builds understanding, which instruction should increase. Critics argued that a theory with a good, a bad and a neutral load can explain any result after the fact, which makes it hard to falsify (de Jong, 2010). The theory’s authors now describe germane load as working memory redirected from extraneous activity toward the content, rather than an extra quantity added to the total (Sweller et al., 2019)." (selector `#s-04 > details:nth-of-type(1) > p:nth-of-type(1)`)
evidence: The user wrote: "not a comment on this section but a comment on the progressive disclosure here, there's no affordance that you can click on this."
expected_fix: What the user asks for in their comment. If the intent is unclear, ask the user; don't guess.

### H-28 · blocking · open
criterion: human review (site-1, comment #28)
location: text "Older accounts of the theory added a third kind, germane load: the effort that builds understanding, which instruction should increase. Critics argued that a theory with a good, a bad and a neutral load can explain any result after the fact, which makes it hard to falsify (de Jong, 2010). The theory’s authors now describe germane load as working memory redirected from extraneous activity toward the content, rather than an extra quantity added to the total (Sweller et al., 2019). So Didactician doesn’t try to add “good” effort. It removes friction from the presentation and points the attention that frees up at the content"
evidence: The user wrote: "I don't understand this, genuinely."
expected_fix: What the user asks for in their comment. If the intent is unclear, ask the user; don't guess.

### H-29 · blocking · open
criterion: human review (site-1, comment #29)
location: block on "§ 5 Stage 3: Where Load Becomes Page Decisions" (selector `#h-s05`)
evidence: The user wrote: "Section 5 is a little confusing, and I'm not sure how valuable it is. It may be worth instead replacing it with all of the building blocks that didactician works with, including progressive reveals, multiple choice, predict then reveal, as simple examples built-in. Impress upon the reader that agents can have the freedom to explore other user interface approaches (hypothesize more interactive elements like embedded socrates or feynman style challenges connecting to live llm driven AIs)."
expected_fix: What the user asks for in their comment. If the intent is unclear, ask the user; don't guess.

### H-30 · blocking · open
criterion: human review (site-1, comment #30)
location: shape on "Plate III. One Machine, Labelled Two Ways Pl. III Which stage writes findings.md? ANumbered, names in a key 1 brief.md 2 facts.md 3 learning-plan.md 4 decisions…" (selector `#plate-3 > div:nth-of-type(1) > div:nth-of-type(1)`; shot review/human-site-1/shots/c1ji7wbi1sfpkmx1ktx7jv.png)
evidence: The user wrote: "Not sure this question is relevant to the diagram"
expected_fix: What the user asks for in their comment. If the intent is unclear, ask the user; don't guess.

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
