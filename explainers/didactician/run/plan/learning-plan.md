# Learning plan: How Didactician teaches

<!-- Revised after human review site-1 (handoff 10). Objective o-4 changed per H-29; see ## Objectives. -->

## Shape

A scrollytelling piece in two halves, with ordinary article segments around them. The first half is **the pipeline process**: a sticky pipeline canvas (blueprint B1) that the reader steps through stage by stage, with each stage's real artifact shown as a file card, and the same canvas coming back in a "why" mode that overlays three design rules. The second half is **the pedagogical motivations**: a plain article segment on cognitive load built around one code example and one contrasting pair, then a gallery of the building blocks the pipeline composes pages from, each a small working example the reader can use on the spot. The pipeline is a process with a fixed order and one artifact per step, and a process maps onto a step-locked canvas. Cognitive load is a small set of distinctions, which suits prose, a contrasting pair and predictions. The building blocks are a set of separate, individually learnable elements (low interactivity), so a gallery of working specimens fits better than any single explorable.

Rejected: one long scrollytelling sequence covering everything. Cognitive load isn't a process, so forcing it into canvas steps would make the reader watch instead of predict. A full-page explorable was also rejected: these readers are deciding whether to install the skill and need the overview within the first minute, not a sandbox. Rejected for s-05 specifically: keeping the earlier worked example (this plan's own s-04 entry mapped onto the page, w-plan2page). The user found it confusing and of doubtful value (H-29); showing the blocks themselves gives the reader something they can use, and it needs no plan vocabulary.

The self-reference is used as the worked example, not as a running joke. The artifact cards show excerpts from this page's own run, and the hero says the page was built by Didactician (H-02). Elsewhere the piece doesn't comment on itself.

toc: yes — six sections and about 9 minutes. Skimmers deciding whether to install will want to jump straight to the second half, and the kit's mobile "Contents" disclosure costs nothing.
tokens: custom — classical scientific-treatise direction per user decision d-01 (see ## Visual direction). Map the values onto the kit's variable names so the components and widgets keep working.
mobile: supported. The pipeline canvas becomes a 2×4 grid of stages (snake order) with the artifact card below it, both sticky (≤ 55vh), and the steps scroll underneath. The contrast figure in s-04 stacks vertically. The building-block gallery in s-05 becomes a single column of specimen cards (no carousel: the reader should be able to scroll back to compare).

## Visual direction

<!-- From user decision d-01: "give it a flashy visual design. Something that looks education inspired, maybe a bit scientific (not this newfangled edtech look, something more classical)". The page builder owns the execution; this is the direction and its limits. -->

The concept is **a page from a 19th-century natural-philosophy treatise, explaining a modern machine**. It should be striking at first glance and calm to read. Use one main metaphor (the treatise and its engraved diagrams) and keep the other two in their own places: the lab notebook only on the artifact cards, the chalkboard only in the dark theme. Don't mix all three on one surface.

- **Ground and ink (light):** warm laid-paper ivory (around #f4ecd8) with a very faint, even paper grain that is never behind body text at a strength that lowers contrast. The ink is a brown-black (around #231a12). There are two accent inks, as in old printed textbooks: a **rubric vermilion** (around #b03a1e) for the active element, initials, exercise labels and the highlighted plan line, and a **Prussian blue** (around #1f3a5f) for scripts and gates. Agents use plain ink and the human checkpoint uses vermilion, so each role keeps one ink across every figure.
- **Dark theme = chalkboard:** a slate green-black ground (around #1d2620), chalk-white ink (around #ece6d6), chalk vermilion and chalk blue accents raised in lightness until they reach ≥ 4.5:1 for text and ≥ 3:1 for strokes. The figures switch from engraving hairlines to slightly thicker chalk strokes. It's the same layout with a different medium; no hand-drawn wobble on text.
- **Type:** headings and the title use a classical display serif with true small caps (e.g. Cormorant Garamond SC or IM Fell English SC, at ≥ 28px only). Body text uses a sturdy book serif built for screens (e.g. Source Serif 4 or Crimson Pro, at the kit's 18/28 size). Labels, file names and excerpts use a mono typeface. The decorative face never appears below 24px or in UI controls.
- **Treatise furniture, used for structure:** sections numbered "§ 1 … § 6" in small caps; a vermilion drop initial on the hero's first paragraph only; double hairline rules (thick-thin) under section heads; figures framed as engraved **diagrams** ("DIAGRAM I. The Apparatus, in Eight Stages"; the word "plate" is not used anywhere on the page, per H-17), with a hairline border and a diagram number top right; captions set as "Fig. 2." in italic small caps. On desktop ≥ 1100px, captions and short asides may sit as **marginal notes** beside their figure, keeping them adjacent and not pushing them away.
- **Figures in engraved style:** line work in ink, with crosshatch or line-hatch SVG patterns for fills (an active stage is solid-hatched in vermilion, inactive ones carry light hatching at about 35% opacity). The stage nodes look like apparatus components in a lettered diagram, but they carry their **names written on them**, not "A, B, C" with a key (the lettered-key look is exactly the split-attention case s-04 warns against). Arrows are fine engraved lines with small solid heads (use kit/arrow.js). Hatching sits only inside shapes, never under labels; labels get a paper-coloured halo.
- **The artifact cards are lab-notebook specimens:** an off-white card with faint graph-paper ruling, a typed mono header (the file path) like a specimen label, and the excerpt in mono. These are flat with a hairline border: no rounded corners beyond 2px and no soft drop shadows.
- **Checks are textbook exercises:** labelled "Problem 1.", "Problem 2." … in vermilion small caps with the kind label after it ("Problem 1 · Predict"). Options sit in ruled boxes. The revealed feedback is set off by a "Solution." run-in head, in the manner of a textbook's worked answer.
- **Hero (the flashy moment):** a frontispiece. The title is large in small caps, centred, between thick-thin rules. A subtitle sits in italic ("Being an Account of a Machine that Plans Its Pages as Lessons"), with a short meta line below it in mono. Below that the w-pipeline overview is set as **Diagram I**. One restrained flourish (a printer's ornament or fleuron between the rules) is the only ornament on the page.
- **Avoid:** pastel palettes, rounded cards, soft shadows, gradient blobs, emoji, illustrated mascots, glassmorphism, pill-shaped buttons for options, and faux-aged textures that are stained or torn. "Classical" means typographic discipline and engraved line work, not grunge.
- **Legibility and accessibility outrank the look** (user's ordering): body contrast ≥ 4.5:1 and UI/strokes ≥ 3:1 in both themes; paper texture and hatching never behind running text or labels; colour is never the only channel (role is also carried by shape, as in w-pipeline); `prefers-reduced-motion` respected; SVG labels ≥ 12px at 360px. If a decorative choice fails any of these, drop the decoration.
- **Motion:** sparing and print-like. State changes in the canvases cross-fade or ink in (150–250ms). No bouncing or parallax.
- **Fonts** load from Google Fonts with a system serif fallback that keeps the layout intact if they fail.

## Objectives

- o-1: Explain the pipeline at a high level and recognise the artifact each stage produces. — checks: none — the step-locked canvas keeps the whole pipeline visible with each artifact on screen, and it returns in s-03 and s-06. A recall quiz on stage names would test vocabulary, not understanding, and adds friction for a skimmer deciding whether to install. k-01 also needs the reader to know which stage sees what.
- o-2: Explain why the pipeline is shaped this way (the orchestrator coordinates and never authors; agents communicate only through files in a fixed structure; a human approves the plan before anything expensive). — checks: k-01
- o-3: Explain what cognitive load is (limited working memory; intrinsic vs. extraneous) and predict how a design choice raises or lowers it for a given reader. — checks: k-02
- o-4: **(changed per H-29; needs the user's confirmation)** Recognise the interactive building blocks Didactician composes pages from (progressive reveal, multiple choice, predict-then-reveal, think-then-reveal, step-through, contrasting cases, sandbox), say what each does for the reader's load or engagement, and know that agents are free to go beyond them. — checks: k-05

Previous o-4 (d-02 kept it): "Explain how the instructional-design stage turns that into concrete page decisions (objectives as what the reader can do, scope in ideas, cut list, checks and widgets chosen for learning value)." The user's H-29 replaces the segment that taught it. The part about "checks and widgets chosen for learning value" survives in the new o-4; objectives-as-abilities, scope in ideas and the cut list leave the page (cut-list.md).

On o-2: it now names three rules, not four. "Scripts gate what's checkable; agents judge the rest" is dropped as a rule (H-23, see s-03); the one consequence a reader cares about, that a script caps the rounds a run may spend, moves to s-06's honest-limits sentence.

On check_plan's warning (4 objectives against a guide of ≤ 3 for this time): kept per d-02. For this audience o-1 and o-2 share one canvas and are low-load, and the new o-4 is low-interactivity (each block is learnable on its own, and the reader already knows most of the controls).

Load diagnosis: these readers already hold agents, subagents, context windows, files and Playwright as chunks, so the pipeline's elements are low-load for them, and the canvas can introduce one stage per step. Everything from learning science is new. The hardest moment is now in s-04: working memory, chunks, and the intrinsic/extraneous split arrive together. The code example carries it: the reader meets the effect on themselves (one schema vs. ten tokens) before any term, then each term is attached to something already seen. s-05 is lighter than before: one block per card, each with a working example and one line of load reason (max-elements 2), and it reuses s-04's code expression so no new domain arrives.

## Segments

### s-01 — How Didactician teaches
intent: In the first screen, tell the reader what the skill is: a multi-agent pipeline built around pedagogy and human-in-the-loop review, meant for material with a heavy cognitive load, heavy on tokens; and that the page has two halves, the pipeline process and the pedagogical motivations.
objectives: o-1
claims: c-01, c-02, c-03
readiness: intermediate · interactivity: low (what it is + the two halves) · max-elements: 2
mode: hero + standfirst → orienting paragraph · blueprint: none
layout:
  contiguity: n/a (no figure; the w-pipeline canvas begins directly below the hero, so its overview state is visible on the first screen at desktop)
  pacing: continuous
  redundancy: the standfirst doesn't list the stages; the canvas shows them
  scaffold: none
ux: Read only. Hero with title, a standfirst, a meta row ("~9 min · for Claude Code users · built with Didactician"), and one short paragraph. At 360px the hero is a single column and the canvas's first state begins within about one scroll.
figure: none
widget: none
checks: none
content_notes: Standfirst, in substance: Didactician is a Claude Code skill: a pipeline of agents that plans an explainer page as a lesson, for material that is hard to hold in your head, with a human reviewing the plan before anything is built and the page after. Say plainly that it is multi-agent and spends a lot of tokens (a fresh agent per stage, two reviewers). Do not describe it as "one line in, page out", and don't mention one-line requests (H-05): the point is that well-thought-through input gives better pages. The orienting paragraph names the two halves simply: "The first half is about the pipeline process. The second half explains the pedagogical motivations." (H-03)

### s-02 — The pipeline, one stage at a time
intent: Give the reader the whole pipeline as one picture, then open each stage in turn with the file it produces, so that by the end they can name the stages in order and recognise each artifact.
objectives: o-1
claims: c-01, c-02, c-03, c-04
readiness: intermediate · interactivity: low (one stage + its artifact per step; the order is the only relation) · max-elements: 2
mode: whole-task first (overview state) → step-through · blueprint: B1
layout:
  contiguity: sticky — the canvas stays while the steps scroll; the stage name sits on its node and the artifact card sits directly under the strip, not in a legend
  pacing: step-revealed by scroll (9 states: overview + 8 stages); not gated
  redundancy: step text says what the card can't (why this stage exists, what is bounded); it doesn't read the excerpt aloud
  scaffold: none — agent concepts are this reader's home ground (expertise reversal). Call the agents subagents in one plain clause, so a reader who knows subagents isn't left guessing what the page hints at (H-26); no subagent explainer.
ux: The reader scrolls. Each step highlights one stage node at full ink (the others at ~35% opacity) and swaps the artifact card. At 360px the strip becomes a 2×4 grid with short labels, the card shows ≤ 4 excerpt lines, and the steps scroll below the sticky area.
figure: none beyond the widget
widget: w-pipeline (complexity: high) — sticky pipeline canvas, "what" mode: overview + 8 stage steps, each with its real artifact card
checks: none
content_notes: Stages are not agents (H-21). The overview step says, in substance: your main session is the orchestrator; it runs the eight stages in order and moves each stage's files on to the next. Stages that do work by agent get a fresh subagent; one stage is a script and one is you.

### s-03 — Why it's built this way
intent: Show that each structural choice prevents a specific failure the reader will recognise from their own agent work, and confront the belief that self-review is enough.
objectives: o-2
claims: c-03, c-06, c-01, c-02
readiness: intermediate · interactivity: low (one rule + the part of the pipeline it touches, per step) · max-elements: 2
mode: predict-then-reveal (k-01) → step-through of three rules on the familiar canvas · blueprint: B1
layout:
  contiguity: sticky — the same canvas, now in "why" mode; each rule's label is drawn on the part of the pipeline it governs (e.g. "fresh context" on the review node)
  pacing: k-01 sits just before the first "why" step, so the reader commits before the answer is shown; then 3 scroll steps; not gated
  redundancy: one sentence of failure-prevented per step; no restating the overlay labels
  scaffold: none
ux: The reader answers k-01 (one tap; feedback appears in place without moving the page), then scrolls through 3 steps on the canvas. Mobile: the same as s-02.
figure: none beyond the widget
widget: w-pipeline (complexity: high) — second mount, "why" mode: 3 rule overlays
checks: k-01
content_notes: The three rules. (1) The orchestrator coordinates and never authors: it dispatches agents and records what they return; each agent starts in a fresh context. (2) Agents communicate only through files, in a fixed structure: each gets a handoff prompt in and returns a report out in a set format, and no two agents ever talk to each other (H-21, H-22: don't say "what it said back"; say "the report it returned"). Every prompt and report is kept, so a run can be audited and resumed. (3) You approve the plan before anything expensive: stated with authority as part of the design (H-24), not attributed to "the skill's design notes". A human checks the plan early so that a wrong premise can't cascade through the build, the gate and the review; catching it there saves the time and tokens of every later stage (c-02).
decision_rule3 (H-23): dropped. "Scripts gate what's checkable" is real, but what it buys the reader is already carried elsewhere: the Gate stage in s-02 shows that a machine checks rendering, k-01's option C makes the point that a gate can't judge truth, and the cost consequence (round caps) gets one clause in s-06. As a rule of its own it asks the reader to hold a mechanism they don't need to decide whether to install. c-05 goes to the cut list.

### s-04 — The idea underneath: cognitive load
intent: Teach just enough cognitive load theory (a limited working memory; load from the material vs. load from the presentation) that the reader can predict whether a design choice adds or removes load for a given reader.
objectives: o-3
claims: c-07, c-08, c-10
readiness: novice (in learning science) · interactivity: high (working-memory limit, chunks in long-term memory, intrinsic vs. extraneous) · max-elements: 3
mode: concrete example (F-code, user-supplied in H-25) → rule → contrasting cases (x-02) → predict (k-02, expertise reversal x-03) · blueprint: B4 (for the contrast figure)
layout:
  contiguity: adjacent — each figure sits beside or directly under the paragraph that refers to it; the contrast pair is side by side on desktop with its task printed above both
  pacing: continuous; k-02 sits immediately after the contrast figure
  redundancy: captions give the takeaway only; no prose describing what the two panels look like
  scaffold: none (the collapsed germane-load note is cut, H-28)
ux: The reader reads the code line and notices they read it as one thing; reads the rule; does the same lookup in both panels of Diagram III and feels the difference; then answers k-02. At 360px the two contrast panels stack, each a 2×4 grid, panel A with its key directly below it (still separated from the nodes, which is the point).
figure: (F-code, Fig. 1) The expression `total = sum(x for x in values if x > 0)` set large in mono, with two readings beneath it side by side (stacked on mobile). Left, "A non-programmer": the same line broken into separate boxed tokens (total, =, sum, x, for, in, values, if, >, 0), labelled "about 10 separate pieces to look up and connect". Right, "An experienced developer": the whole line under one bracket, labelled "one schema: sum the positive numbers". Caption: "The code doesn't change. What the reader already knows does." The paragraph beside it follows the user's wording in H-25: for the novice, tracing the syntax uses up working memory before they work out what the line does; for the developer, long-term memory compresses the line into one chunk, leaving room to think about edge cases. Only after this do the terms working memory, intrinsic and extraneous appear. (c-07; example from the user, H-25.) (F-split, Diagram III) Contrasting pair built from the pipeline the reader now knows, both in the same snake layout with arrows as Diagram I. A: 8 stages as numbered circles, each circle with only its artifact filename beside it (brief.md, facts.md, learning-plan.md, decisions.md, site/, page-round-N.json, findings.md, log.md); a separate key block underneath maps number → stage name only. B: the same 8 stages with stage name and artifact written on each node. Above both, the task: "Try it in A, then in B: what is the stage that writes findings.md called?" In A this needs both sources: find findings.md on the figure, read its number, then look the number up in the key. In B it's one glance. Caption: "Same information. In A your eyes go back and forth and you hold the number in your head while you search the key; that work is extraneous load (split attention)." (x-02, c-10)
widget: none
checks: k-02
content_notes: Introduce the task above Diagram III with one sentence saying why: "Here is extraneous load you can feel: do the same lookup in both versions." (H-30: the task must be one the diagram is needed for.) No numeric working-memory capacity anywhere.

### s-05 — The building blocks
intent: Show the reader the interactive building blocks the pipeline composes pages from, each as a small working example they can use right there, with one line on what it does for their load or engagement; then make clear agents may go beyond these, including (as possibilities only) live-LLM challenges.
objectives: o-4
claims: c-12, c-10, c-08
readiness: novice (in instructional design), now holding "load" as a chunk · interactivity: low (each block is learnable on its own; reader knows the controls already) · max-elements: 2
mode: gallery of specimens (w-blocks) → apply (k-05, confronts m-03 "interactive = effective") → "beyond these" paragraph · blueprint: none (the step-through specimen is a miniature B1, the contrast specimen a miniature B4, the sandbox specimen a miniature B2)
layout:
  contiguity: inline — each specimen's name and its one-line load reason sit on the specimen card itself, directly above or below the working example
  pacing: continuous; the reader uses each specimen at their own pace; k-05 follows the gallery
  redundancy: the card's line says what the block does for load; no prose paragraph re-describing the cards
  scaffold: none
ux: The reader scrolls through 7 specimen cards in a 2-column grid (desktop) or one column (360px) and uses each (tap an option, open a disclosure, press ‹ ›, drag a slider). Then answers k-05, then reads a short paragraph on going beyond the blocks.
figure: none beyond the widget
widget: w-blocks (complexity: high) — a gallery of 7 small working specimens, all built on the s-04 code expression or the pipeline the reader already knows
checks: k-05
content_notes: Opening, in substance: "Section 4 was the reason; these are the tools. The designer builds every page from blocks like these, and picks each one for what it does to the reader's load, not for decoration." After k-05, the "beyond these" paragraph: these are the blocks the skill's references describe, not a fixed menu; the designer chooses the page's shape freely and builders can make any widget the plan calls for (other blocks in the references, e.g. completion problems where the reader fills a blanked step, are named in one clause). Then name, clearly as possibilities rather than features, interactive elements driven by a live LLM: a Socratic tutor that questions the reader's answer, or a Feynman-style challenge where the reader explains the idea back in their own words and gets it critiqued. Say in one sentence why this page doesn't have them: Didactician's pages are static files with no backend, so a live model would be a different kind of page. Don't build or mock up a working LLM element (I2).

### s-06 — What you get
intent: Close the loop: the pipeline once more in one line, the real run folder of this page as proof that everything is a file, the honest limits, and a one-line install pointer.
objectives: o-1, o-2
claims: c-01, c-06, c-04
readiness: intermediate · interactivity: low · max-elements: 2
mode: recap → next step · blueprint: none
layout:
  contiguity: adjacent — the tree figure sits next to the paragraph naming log.md as the entry point
  pacing: continuous
  redundancy: the recap is one sentence plus the compact strip; it doesn't re-explain the stages
  scaffold: none
ux: Read only. The tree is a monospace block, horizontally contained (overflow-x: auto) on narrow screens, with short paths so it rarely needs to scroll. The install line is a copyable code block.
figure: (F-tree, Fig. 2) A monospace directory tree of this page's real explainers/didactician/ folder: site/ (labelled "← this page"), run/log.md ("start here"), brief.md, decisions.md, research/, plan/, handoffs/NN-role.prompt.md/.report.md, history/, gate/, review/. Labels sit on the lines they describe. Taken from the final run folder at build time.
widget: none
checks: none
content_notes: Honest limits, one or two sentences: whether separate reviewers beat one agent checking itself is untested (c-06); a script caps how many rounds and agents a run may use, which bounds the token spend, but the caps hold only as long as the orchestrator follows the skill's instructions (c-04).

## Widgets

### w-pipeline
segment: s-02
complexity: high
blueprint: B1
model: An ordered list of 8 stages, each with {label, short_label (≤ 8 chars for mobile), kind: agent | script | human, artifact: {path, excerpt lines}}: 1 Intake (orchestrator) → run/brief.md; 2 Research (agent) → research/facts.md (+ parking-lot.md); 3 Plan (agent: instructional designer) → plan/learning-plan.md, mockup.html, cut-list.md; 4 You approve (human) → decisions.md; 5 Build (agents: page builder + widget builders) → site/; 6 Gate (script: verify.mjs, Playwright at 360/768/1280) → gate/page-round-N.json; 7 Review (agents: accuracy ∥ pedagogy/UX, fresh context) → review/round-N/findings.md; 8 Deliver → site/ + log.md (c-01, c-02, c-04). Shape grammar as in the skill's README: agent = rectangle, script = hexagon, human = rounded pill. Two modes on separate mounts. "what" (s-02): state 0 = all 8 at full ink with an orchestrator bar above the strip and one caption line "The orchestrator runs the stages and moves their files along" (replaces "Files, never chat", H-21); states 1–8 = one stage active. "why" (s-03): 3 states, each an overlay: W1 "The orchestrator coordinates, never authors" — the orchestrator bar with dispatch arrows down to each agent stage, and on the review node the label "fresh context: brief + page (+ facts or plan), not the builder's reasoning" (c-03; hedge per c-06; inputs per A-01). W2 "Agents communicate only through files" — on one dispatch arrow, a handoff-prompt chip going down and a report chip coming back up, labelled "prompt in · report out (fixed format)"; every stage's artifact chip lit; no arrows between agents, and a small note "agents never talk to each other" (c-01; H-21, H-22). W3 "You approve before anything expensive" — the checkpoint node is lit, and everything to its right is bracketed "expensive: build, gate, review"; a short label on the bracket: "a wrong premise caught here costs nothing downstream" (c-02; H-24). The former W3 (scripts gate what's checkable) is removed (H-23).
reader_does: Scrolls; each step's text card enters and the canvas switches state. No other controls. Reduced motion: state changes are instant.
shows: Every stage name on its node at all times (direct labels; never a numbered key). The active stage at full ink, the rest at ~35%. The artifact card under the strip: monospace filename header plus ≤ 6 excerpt lines (≤ 4 on mobile) taken verbatim from this run's real files at build time: brief.md (the audience line, `time_budget_minutes`, the o-3 line); facts.md (claim c-07: claim/source/confidence); learning-plan.md (this plan's s-04 header lines); decisions.md (a real checkpoint decision); site/ (a 4-line tree); gate JSON (the latest real page-gate result's pass lines; label it with its round); findings.md (a real H- or A- finding from this run's review/, or the template format labelled as such); log.md (2 real entries). An aria-live sentence: "Stage 3 of 8: Plan. Produces learning-plan.md, mockup.html, cut-list.md."
size: desktop (≥ 900px): .d-wide; canvas left ~60%, sticky, ~480px tall (strip ~140px + card ~300px), steps in the right column. Mobile: full width; sticky area ≤ 55vh (2×4 strip ~130px + card ~200px), steps scroll below; labels ≥ 12px; check landscape 740×360 (card collapses to its filename only if needed).
acceptance: ac-02, ac-03, ac-04, ac-05

### w-blocks
segment: s-05
complexity: high
blueprint: none
model: 7 independent specimen cards, each {name, what the reader does, one-line load reason, working example}. All examples use content the reader already has (the s-04 expression with values = [3, -1, 4, 0], or the pipeline), so no new domain arrives. (1) Progressive reveal — a disclosure with a visible affordance (▸ and the words "Show what's in a handoff prompt"; H-27) that opens to 4 lines: role, task, inputs, outputs. Reason: "Optional depth stays out of your working memory until you ask for it. Never hide what every reader needs." (x-03, expertise reversal; c-01 for the content). (2) Multiple choice — "Which of these does a reviewer never see?" A) the brief B) the page C) the builder's report (correct). One-tap commit, feedback in place explaining why. Reason: "Recalling beats rereading; the explanation of the wrong answer is the payoff." (c-03 for the content). (3) Predict, then reveal — "values = [3, -1, 4, 0]. What is total?" A) 6 B) 7 (correct) C) 8. The reveal shows the filter dropping -1 and 0. Reason: "Committing first means a wrong guess surprises you, and surprise is what sticks." (c-12). (4) Think, then reveal — "Why might the agent that wrote a page miss its own mistakes?" with a "Show a model answer" button; no text box. Reason: "You generate the answer in your head; no typing, no grading." (c-12, c-06 for the content). (5) Step-through — the expression evaluated in 3 steps with ‹ › and "Step 2 of 3": filter (keep 3, 4), sum (3 + 4), assign (total = 7); only the active part is highlighted. Reason: "One change at a time, with the rest dimmed. Diagrams I and II are the full-size version." (c-12 note, B1). (6) Contrasting cases — two tiny line charts of the same two series, one with a legend box, one with labels on the lines, and the question "Which series is higher in March?" above both. Reason: "Two cases that differ in one feature show what matters. Diagram III is the full-size version." (c-10, x-02). (7) Sandbox, with a prediction first — a slider for the threshold t in `if x > t` (range 0…5, integer, starting at 0) over values [3, -1, 4, 0], with total updating live; above it, a toggle-free prompt "Before you drag: as t rises from 0, at what value does total first drop below 7?" and a "Check" reveal after the reader drags (answer: t = 3, total = 4). Reason: "Dragging alone is Active. Predicting first makes it Constructive." (c-12).
reader_does: Uses each card independently, in any order: taps an option, opens the disclosure, presses ‹ ›, drags the slider. Nothing is gated.
shows: Each card: the block's name as a small-caps head ("Specimen 3 · Predict, then reveal"), the working example, and the one-line load reason directly under it. Feedback and reveals appear in place without moving the page. aria-live on each reveal.
size: desktop: .d-wide, 2-column grid of cards, each ~220–320px tall. Mobile: one column, full width, each card ≤ 360px tall, 44px targets, slider thumb ≥ 44px.
acceptance: ac-08, ac-09, ac-10

## Comprehension items

### k-01
segment: s-03
objective: o-2
type: predict
prompt: The page is built. Before it ships, which check would you trust most to catch a claim it got subtly wrong?
options: A) Ask the builder to re-read its page and double-check its claims. B) A fresh reviewer that sees only the brief, the page and the fact base, not the builder's reasoning. (correct) C) The Playwright gate: if it passes, the page is fine.
feedback: B. Option A is cheap and tempting, but the builder knows what it meant and reads that intent back into the text. Studies of LLM judges also find they rate their own outputs higher than human annotators do (shown on GPT-4 and Llama 2). C only checks what a machine can check, such as overflow, broken arrowheads and console errors, never whether a sentence is true. Didactician runs C, then B. Whether that split beats one agent reviewing itself hasn't been measured; it is a hypothesis the design still has to test.

### k-02
segment: s-04
objective: o-3
type: predict
prompt: Suppose this page stopped to explain, step by step, what a subagent is. Reader 1 has never used an AI coding agent. Reader 2 writes subagents every day. What happens to each reader's cognitive load?
options: A) Lower for both: more explanation always makes things easier. B) Lower for Reader 1, higher for Reader 2. (correct) C) Higher for both: it's extra paragraphs to read.
feedback: B. It's the code line again. For Reader 2, "subagent" is already one chunk, like the expression is for the developer; walking through it gives them nothing new, but they still have to read it and check it against what they know, and that is extraneous load. For Reader 1 the same paragraphs build the chunk they lack, so they lower load. Guidance that helps a novice can get in an expert's way (the expertise reversal effect). That's why Didactician fixes one audience per page, and why this page names subagents without explaining them.

### k-05
segment: s-05
objective: o-4
type: apply
prompt: You want to teach new backend developers what happens during a TCP connection handshake: a fixed sequence of messages, each depending on the last. Which building block should carry it?
options: A) A sandbox with sliders for every parameter, so there's lots to explore. B) A step-through, one message at a time, with a prediction before the step that surprises people. (correct) C) A multiple-choice quiz at the end of a page of prose.
feedback: B. A fixed sequence is a process, and a process maps onto a step-through: one change per step, the rest dimmed, so the reader holds only what just changed. Adding a prediction at the step people get wrong makes it Constructive rather than just clicking "next". A is tempting because it's the most interactive, but more controls are more elements to hold, and a sandbox suits a system whose behaviour you discover, not a sequence you follow; interactive is not the same as effective. C checks recall afterwards but leaves the hard part, following the sequence, to prose.

## Acceptance criteria

- ac-01 (s-01): On a 1280px screen the title, standfirst, meta row and the top of the w-pipeline overview (all 8 stages) are visible without scrolling. At 360px the overview begins within one scroll. The standfirst presents Didactician as a multi-agent, token-heavy pipeline built around pedagogy and human review, for high-load material; it never describes a one-line request producing a page.
- ac-02 (w-pipeline): The overview state shows all 8 stages in order, each with its name written on its node (no numbered key anywhere in Diagrams I–II). Agent, script and human stages are told apart by shape and name, not by colour alone. Nothing on the page says or implies that stages talk to each other; the orchestrator is shown moving files between stages.
- ac-03 (w-pipeline): In "what" mode, exactly one stage is at full ink per step, and its artifact card shows a real excerpt from this run's files (path in the card header).
- ac-04 (w-pipeline): In "why" mode, each of the 3 rules is drawn on the part of the pipeline it governs (orchestrator bar and fresh-context label on review; prompt-in/report-out chips on a dispatch arrow; the checkpoint with the "expensive" bracket). Rule 3 is stated as part of the design, with no reference to design notes.
- ac-05 (w-pipeline): At 360px there's no horizontal overflow; the strip is a 2×4 grid with readable labels (≥ 12px); the sticky area is ≤ 55vh and doesn't trap the reader in landscape (740×360).
- ac-06 (k-01): The answer and the "why" steps aren't visible before the reader commits (k-01 sits above the first "why" step). The feedback names self-review bias and states that the reviewer split is untested against a single-agent baseline.
- ac-07 (s-04): The reader meets the code expression and its two readings before the terms "working memory", "intrinsic" and "extraneous" appear. No numeric working-memory capacity is stated anywhere on the page. Germane load doesn't appear.
- ac-08 (w-blocks): All 7 specimens work: each one responds to the reader (a choice, a disclosure, a step, a drag) and shows its one-line load reason on its own card. Every example uses the s-04 expression or the pipeline; no new subject matter.
- ac-09 (w-blocks): Every disclosure has a visible affordance (an arrow and an action label), every control is keyboard-operable with 44px targets, feedback appears in place without the page jumping, and nothing is hover-only. At 360px the cards stack in one column with no horizontal overflow.
- ac-10 (s-05): Live-LLM elements (Socratic, Feynman-style) are described as possibilities, not as features of the skill, and nothing on the page calls a model or any undeclared origin (I2). The page says agents can go beyond the listed blocks.
- ac-11 (k-02, k-05): Each check's answer can be reasoned out from the page alone. k-02's feedback ties back to the code example and states both readers' outcomes; k-05's feedback explains why the most interactive option is the wrong one.
- ac-12 (s-06): The page's real run folder tree is shown with log.md marked as the starting point; the honest limits (reviewer split untested; round caps bound token spend only if the orchestrator follows the skill) are stated in one or two sentences; the install pointer is a single line.
- ac-13 (whole page): Every factual statement about the skill or learning science traces to a claim in facts.md, an example in examples.md, or the user's own wording in H-25; nothing from the cut list appears.
- ac-14 (whole page, d-01): The page reads as a classical treatise (small-caps section heads, numbered diagrams, engraved-style figures, exercises headed "Problem N."), not modern edtech (no pastel rounded cards or soft shadows). The word "plate" appears nowhere (H-17). Decoration never lowers legibility: contrast holds in the paper and chalkboard themes, and there's no texture or hatching under text.
