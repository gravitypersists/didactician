# Learning plan: How Didactician teaches

## Shape

A short scrollytelling piece in two halves, with ordinary article segments around them. The first half is the machinery: a sticky pipeline canvas (blueprint B1) that the reader steps through stage by stage, with each stage's real artifact shown as a file card. The same canvas comes back in a "why" mode, where each step overlays one design rule on the pipeline the reader has just learned. The second half is the teaching part. It is a plain article segment on cognitive load, with one contrastive figure, then a short step-through that maps a real entry from this page's own learning plan onto the segment the reader has just read. The pipeline is a process with a fixed order and one artifact per step, and a process maps onto a step-locked canvas. Cognitive load is a small set of distinctions, which suits prose, a contrasting pair and predictions better than a sandbox.

Rejected: one long scrollytelling sequence covering everything, as the user suggested. Cognitive load isn't a process, so forcing it into canvas steps would make the reader scroll through an animation instead of predicting. A full-page explorable was also rejected: these readers are deciding whether to install the skill and need the overview within the first minute, not a sandbox.

The self-reference is used as the worked example, not as a running joke. The artifact cards show excerpts from this page's own run, and s-05 dissects this page's own plan entry for s-04. Apart from those two places, the piece doesn't comment on itself.

toc: yes — six sections and about 7–8 minutes. Skimmers deciding whether to install will want to jump straight to the instructional-design half, and the kit's mobile "Contents" disclosure costs nothing.
tokens: custom — classical scientific-treatise direction per user decision d-01 (see ## Visual direction). Map the values onto the kit's variable names so the components and widgets keep working.
mobile: supported. The pipeline canvas becomes a 2×4 grid of stages (snake order) with the artifact card below it, both sticky (≤ 55vh), and the steps scroll underneath. The contrast figure in s-04 stacks vertically. The w-plan2page step-through stacks the plan excerpt above the page thumbnail.

## Visual direction

<!-- From user decision d-01: "give it a flashy visual design. Something that looks education inspired, maybe a bit scientific (not this newfangled edtech look, something more classical)". The page builder owns the execution; this is the direction and its limits. -->

The concept is **a page from a 19th-century natural-philosophy treatise, explaining a modern machine**. It should be striking at first glance and calm to read. Use one main metaphor (the treatise and its engraved plates) and keep the other two in their own places: the lab notebook only on the artifact cards, the chalkboard only in the dark theme. Don't mix all three on one surface.

- **Ground and ink (light):** warm laid-paper ivory (around #f4ecd8) with a very faint, even paper grain that is never behind body text at a strength that lowers contrast. The ink is a brown-black (around #231a12). There are two accent inks, as in old printed textbooks: a **rubric vermilion** (around #b03a1e) for the active element, initials, exercise labels and the highlighted plan line, and a **Prussian blue** (around #1f3a5f) for scripts and gates. Agents use plain ink and the human checkpoint uses vermilion, so each role keeps one ink across every figure.
- **Dark theme = chalkboard:** a slate green-black ground (around #1d2620), chalk-white ink (around #ece6d6), chalk vermilion and chalk blue accents raised in lightness until they reach ≥ 4.5:1 for text and ≥ 3:1 for strokes. The figures switch from engraving hairlines to slightly thicker chalk strokes. It's the same layout with a different medium; no hand-drawn wobble on text.
- **Type:** headings and the title use a classical display serif with true small caps (e.g. Cormorant Garamond SC or IM Fell English SC, at ≥ 28px only). Body text uses a sturdy book serif built for screens (e.g. Source Serif 4 or Crimson Pro, at the kit's 18/28 size). Labels, file names and excerpts use a mono typeface. The decorative face never appears below 24px or in UI controls.
- **Treatise furniture, used for structure:** sections numbered "§ 1 … § 6" in small caps; a vermilion drop initial on the hero's first paragraph only; double hairline rules (thick-thin) under section heads; figures framed as engraved **plates** ("PLATE I. The Apparatus, in Eight Stages"), with a hairline border and a plate number top right; captions set as "Fig. 2." in italic small caps. On desktop ≥ 1100px, captions and short asides may sit as **marginal notes** beside their figure, keeping them adjacent and not pushing them away.
- **Figures in engraved-plate style:** line work in ink, with crosshatch or line-hatch SVG patterns for fills (an active stage is solid-hatched in vermilion, inactive ones carry light hatching at about 35% opacity). The stage nodes look like apparatus components in a lettered diagram, but they carry their **names written on them**, not "A, B, C" with a key (the lettered-key look is exactly the split-attention case s-04 warns against). Arrows are fine engraved lines with small solid heads (use kit/arrow.js). Hatching sits only inside shapes, never under labels; labels get a paper-coloured halo.
- **The artifact cards are lab-notebook specimens:** an off-white card with faint graph-paper ruling, a typed mono header (the file path) like a specimen label, and the excerpt in mono. These are flat with a hairline border: no rounded corners beyond 2px and no soft drop shadows.
- **Checks are textbook exercises:** labelled "Problem 1.", "Problem 2." … in vermilion small caps with the kind label after it ("Problem 1 · Predict"). Options sit in ruled boxes. The revealed feedback is set off by a "Solution." run-in head, in the manner of a textbook's worked answer.
- **Hero (the flashy moment):** a frontispiece. The title is large in small caps, centred, between thick-thin rules. A subtitle sits in italic ("Being an Account of a Machine that Plans Its Pages as Lessons"), with a short meta line below it in mono. Below that the w-pipeline overview is set as **Plate I**. One restrained flourish (a printer's ornament or fleuron between the rules) is the only ornament on the page.
- **Avoid:** pastel palettes, rounded cards, soft shadows, gradient blobs, emoji, illustrated mascots, glassmorphism, pill-shaped buttons for options, and faux-aged textures that are stained or torn. "Classical" means typographic discipline and engraved line work, not grunge.
- **Legibility and accessibility outrank the look** (user's ordering): body contrast ≥ 4.5:1 and UI/strokes ≥ 3:1 in both themes; paper texture and hatching never behind running text or labels; colour is never the only channel (role is also carried by shape, as in w-pipeline); `prefers-reduced-motion` respected; SVG labels ≥ 12px at 360px. If a decorative choice fails any of these, drop the decoration.
- **Motion:** sparing and print-like. State changes in the canvases cross-fade or ink in (150–250ms). No bouncing or parallax.
- **Fonts** load from Google Fonts with a system serif fallback that keeps the layout intact if they fail.

## Objectives

- o-1: Explain the pipeline at a high level and recognise the artifact each stage produces. — checks: none — the step-locked canvas keeps the whole pipeline visible with each artifact on screen, and it returns in s-03 and s-06. A recall quiz on stage names would test vocabulary, not understanding, and adds friction for a skimmer deciding whether to install. k-01 also needs the reader to know which stage sees what.
- o-2: Explain why the pipeline is shaped this way (orchestrator never authors; everything is a file; scripts gate what's checkable, agents judge the rest; human approves the plan first). — checks: k-01, k-03
- o-3: Explain what cognitive load is (limited working memory; intrinsic vs. extraneous) and predict how a design choice raises or lowers it. — checks: k-02
- o-4: Explain how the instructional-design stage turns that into concrete page decisions (objectives as what the reader can do, scope in ideas, cut list, checks and widgets chosen for learning value). — checks: k-03, k-04

On check_plan's warning (4 objectives against a guide of ≤ 3 for 8 minutes): I kept all four because the brief fixes them and the user asked for both the pipeline and the instructional design. For this audience o-1 and o-2 are low-load, since they share one canvas. If you want three, merge o-1 into o-2: the canvas still teaches the stages, and the stages stop being a separate objective.

Load diagnosis: these readers already hold agents, subagents, context windows, files and Playwright as chunks, so the pipeline's elements are low-load for them, and the canvas can introduce one stage per step. Everything from learning science is new. The hardest moment is s-05, where the reader has to hold four things at once: the working-memory limit, the intrinsic/extraneous split, a plan field, and the page feature it produces. That's more than this reader can manage cold, so the plan uses pre-training. s-04 teaches the load concepts first, each with its own concrete case and prediction, so that by s-05 they're one chunk ("load"). Then s-05's step-through shows a single plan field and its page feature per step (max-elements 2–3).

## Segments

### s-01 — How Didactician teaches
intent: In the first screen, tell the reader what the skill is, what it produces, and that the page has two halves: the machinery, and the part that makes the output teach.
objectives: o-1
claims: c-01, c-02
readiness: intermediate · interactivity: low (skill → static page) · max-elements: 2
mode: hero + standfirst → orienting paragraph · blueprint: none
layout:
  contiguity: n/a (no figure; the w-pipeline canvas begins directly below the hero, so its overview state is visible on the first screen at desktop)
  pacing: continuous
  redundancy: the standfirst doesn't list the stages; the canvas shows them
  scaffold: none
ux: Read only. Hero with title, a one-sentence standfirst, a meta row ("~8 min · for Claude Code users"), and one short paragraph. At 360px the hero is a single column and the canvas's first state begins within about one scroll.
figure: none
widget: none
checks: none

### s-02 — The pipeline, one stage at a time
intent: Give the reader the whole pipeline as one picture, then open each stage in turn with the file it produces, so that by the end they can name the stages in order and recognise each artifact.
objectives: o-1
claims: c-01, c-02, c-04
readiness: intermediate · interactivity: low (one stage + its artifact per step; the order is the only relation) · max-elements: 2
mode: whole-task first (overview state) → step-through · blueprint: B1
layout:
  contiguity: sticky — the canvas stays while the steps scroll; the stage name sits on its node and the artifact card sits directly under the strip, not in a legend
  pacing: step-revealed by scroll (9 states: overview + 8 stages); not gated
  redundancy: step text says what the card can't (why this stage exists, what is bounded); it doesn't read the excerpt aloud
  scaffold: none — agent concepts are this reader's home ground (expertise reversal: no "what is a subagent" explainer)
ux: The reader scrolls. Each step highlights one stage node at full ink (the others at ~35% opacity) and swaps the artifact card. At 360px the strip becomes a 2×4 grid with short labels, the card shows ≤ 4 excerpt lines, and the steps scroll below the sticky area.
figure: none beyond the widget
widget: w-pipeline (complexity: high) — sticky pipeline canvas, "what" mode: overview + 8 stage steps, each with its real artifact card
checks: none

### s-03 — Why it's built this way
intent: Show that each structural choice prevents a specific failure the reader will recognise from their own agent work, and confront the belief that self-review is enough.
objectives: o-2
claims: c-03, c-06, c-01, c-04, c-05, c-02
readiness: intermediate · interactivity: low (one rule + the part of the pipeline it touches, per step) · max-elements: 2
mode: predict-then-reveal (k-01) → step-through of four rules on the familiar canvas · blueprint: B1
layout:
  contiguity: sticky — the same canvas, now in "why" mode; each rule's label is drawn on the part of the pipeline it governs (e.g. "fresh context" on the review node)
  pacing: k-01 sits just before the first "why" step, so the reader commits before the answer is shown; then 4 scroll steps; not gated
  redundancy: one sentence of failure-prevented per step; no restating the overlay labels
  scaffold: none
ux: The reader answers k-01 (one tap; feedback appears in place without moving the page), then scrolls through 4 steps on the canvas. Mobile: the same as s-02.
figure: none beyond the widget
widget: w-pipeline (complexity: high) — second mount, "why" mode: 4 rule overlays
checks: k-01

### s-04 — The idea underneath: cognitive load
intent: Teach just enough cognitive load theory (a limited working memory; load from the material vs. load from the presentation) that the reader can predict whether a design choice adds or removes load for a given reader.
objectives: o-3
claims: c-07, c-08, c-09, c-10
readiness: novice (in learning science) · interactivity: high (working-memory limit, chunks in long-term memory, intrinsic vs. extraneous) · max-elements: 3
mode: concrete example (x-01) → rule → contrasting cases (x-02) → predict (k-02, expertise reversal x-03) · blueprint: B4 (for the contrast figure)
layout:
  contiguity: adjacent — each figure sits beside or directly under the paragraph that refers to it; the contrast pair is side by side on desktop with a shared lookup question printed above both
  pacing: continuous; k-02 sits immediately after the contrast figure
  redundancy: captions give the takeaway only; no prose describing what the two panels look like
  scaffold: collapsed "Why not a third, 'good' kind of load?" for curious readers (germane-load critique, c-09); the target reader doesn't need it
ux: The reader reads and looks; the contrast figure poses a lookup task ("which stage writes findings.md?") that the reader does in both panels and notices the difference in eye travel; then answers k-02. At 360px the two contrast panels stack, each a 2×4 grid, the legend panel with its key directly below it (still separated from the nodes, which is the point).
figure: (F-chunk) Two small panels side by side. Left, "Fluent reader": the word characteristics drawn as one rounded block labelled "1 chunk". Right, "Learning to read English": the same word split into 15 separate letter boxes, labelled "15 pieces to hold". Caption: "Load depends on what the reader already knows, not just on the material." (x-01, c-07). (F-split) Contrasting pair built from the pipeline the reader now knows. A: 8 stages as numbered circles (1–8), with a separate key block underneath mapping number → stage → artifact. B: the same 8 stages with the stage name and artifact written on each node. Above both, the question: "Which stage writes findings.md?" Caption: "Same information. In A your eyes shuttle between node and key and you hold the mapping in your head; that work is extraneous load (split attention)." (x-02, c-10)
widget: none
checks: k-02

### s-05 — Stage 3: where load becomes page decisions
intent: Show, using this page's own plan as a worked example, how the instructional designer turns load into concrete decisions (objectives, layout constraints, Constructive checks, scope in ideas with a cut list), and confront "interactive = effective" and "more rules/more content = better".
objectives: o-4, o-2
claims: c-11, c-12, c-05
readiness: novice (in instructional design), now holding "load" as a chunk · interactivity: high (plan field ↔ page feature ↔ the load reason) · max-elements: 3
mode: worked example (w-plan2page, concrete: this page's own s-04 entry) → predict (k-04, m-03) → predict (k-03, m-02/m-04) → rule · blueprint: B1
layout:
  contiguity: inline — in w-plan2page the active plan line and the region of the page thumbnail it produced are highlighted together and joined by a connector; the reason for each sits on the canvas beside them
  pacing: step-revealed (4 steps, reader-advanced with ‹ step ›); k-04 then k-03 follow in the prose after the widget, not gated
  redundancy: the prose doesn't re-list the plan fields the widget shows
  scaffold: none
ux: The reader steps through 4 states of w-plan2page using buttons or arrow keys (44px targets), then answers two one-tap predictions. At 360px the plan excerpt sits above the page thumbnail, with the connector drawn vertically.
figure: (F-cut) A small file card showing 3 real rows of this page's own cut-list.md (what, why it's out, cost to add back), placed beside the k-03 feedback once it is revealed. Caption: "What a reader of this page doesn't get, and why; you saw this list before anything was built."
widget: w-plan2page (complexity: low) — 4-step mapping from this plan's s-04 entry to the s-04 segment the reader just read
checks: k-04, k-03

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
figure: (F-tree) A monospace directory tree of this page's real explainers/didactician/ folder: site/ (labelled "← this page"), run/log.md ("start here"), brief.md, decisions.md, research/, plan/, handoffs/NN-role.prompt.md/.report.md, history/, gate/, review/round-N/. Labels sit on the lines they describe. Taken from the final run folder at build time.
widget: none
checks: none

## Widgets

### w-pipeline
segment: s-02
complexity: high
blueprint: B1
model: An ordered list of 8 stages, each with {label, short_label (≤ 8 chars for mobile), kind: agent | script | human, artifact: {path, excerpt lines}}: 1 Intake (agent: orchestrator) → run/brief.md; 2 Research (agent) → research/facts.md (+ parking-lot.md); 3 Plan (agent: instructional designer) → plan/learning-plan.md, mockup.html, cut-list.md; 4 You approve (human) → decisions.md; 5 Build (agents: page builder + widget builders) → site/; 6 Gate (script: verify.mjs, Playwright at 360/768/1280) → gate/page-round-N.json; 7 Review (agents: accuracy ∥ pedagogy/UX, fresh context) → review/round-N/findings.md; 8 Deliver (human-facing) → site/ + log.md (c-01, c-02, c-04). Shape grammar as in the skill's README: agent = rectangle, script = hexagon, human = rounded pill. Two modes on separate mounts. "what" (s-02): state 0 = all 8 at full ink with one caption line "Files, never chat"; states 1–8 = one stage active. "why" (s-03): 4 states, each an overlay: W1 "The orchestrator never authors" — an orchestrator bar above the strip with dispatch arrows down to each agent, and on the review node the label "fresh context: brief + facts + page, not the builder's reasoning" (c-03; hedge per c-06). W2 "Everything is a file" — every stage's artifact chip lit, plus a handoffs/ prompt→report pair drawn on one dispatch arrow (c-01). W3 "Scripts gate what's checkable" — hexagons for check_research.py, check_plan.py, verify.mjs, findings.py appear between their stages, and round_gate.py as a small badge on every dispatch arrow; a side note on the canvas: "judged, not gated: page shape, checks, ToC" (c-04, c-05). W4 "You approve before anything expensive" — the checkpoint node is lit, and everything to its right is bracketed "expensive: build, gate, review" (c-02).
reader_does: Scrolls; each step's text card enters and the canvas switches state. No other controls. Previous/next keyboard support comes free from scrolling. Reduced motion: state changes are instant.
shows: Every stage name on its node at all times (direct labels; never a numbered key). The active stage at full ink, the rest at ~35%. The artifact card under the strip: monospace filename header plus ≤ 6 excerpt lines (≤ 4 on mobile) taken verbatim from this run's real files at build time: brief.md (the audience line, `time_budget_minutes: 8`, the o-3 line); facts.md (claim c-07: claim/source/confidence); learning-plan.md (this plan's s-04 header lines); decisions.md (the user's real checkpoint decision); site/ (a 4-line tree); gate JSON (the latest real page-gate result's pass lines; label it with its round); findings.md (the review template's format, labelled "format; this page's real findings are in its run/" because review happens after the build); log.md (2 real entries). An aria-live sentence: "Stage 3 of 8: Plan. Produces learning-plan.md, mockup.html, cut-list.md."
size: desktop (≥ 900px): .d-wide; canvas left ~60%, sticky, ~480px tall (strip ~140px + card ~300px), steps in the right column. Mobile: full width; sticky area ≤ 55vh (2×4 strip ~130px + card ~200px), steps scroll below; labels ≥ 12px; check landscape 740×360 (card collapses to its filename only if needed).
acceptance: ac-02, ac-03, ac-04, ac-05

### w-plan2page
segment: s-05
complexity: low
blueprint: B1
model: 4 states, each pairing one field of this plan's real s-04 entry with the part of s-04 it produced and the load reason. 1 objective line (o-3 "…predict how a design choice raises or lowers it") ↔ the k-02 prediction card: "Objectives are written as what the reader can do, so the checks follow from them." 2 `max-elements: 3` + mode "concrete example → rule" ↔ the F-chunk figure opening the segment before any terms: "Working memory is limited; meet one thing before its name, and no more than a few new things at once" (c-07). 3 `contiguity: adjacent` / labels on nodes ↔ the F-split figure's labelled version: "Labels on the thing, never a legend: split attention is extraneous load" (c-10). 4 `checks: k-02` + `scaffold: collapsed …` ↔ the k-02 card and the collapsed germane note: "A prediction at the key idea; optional depth hidden for those who want it" (c-12, expertise reversal x-03). Plan text quoted verbatim from the final learning-plan.md.
reader_does: Presses ‹ / › (or arrow keys) to move through the 4 states; a counter reads "2 of 4". Starts on state 1. No prediction inside the widget: the checks follow it.
shows: Left: the plan excerpt in monospace, the active line highlighted, the others dimmed. Right: a schematic thumbnail of s-04 (grey blocks for paragraphs, a mini F-chunk, a mini F-split pair, a k-02 card, a collapsed bar) with the produced region outlined in the accent colour. A connector joins the highlighted line to the outlined region. The one-line reason sits under the pair. aria-live: "Step 2 of 4: max-elements 3 produced the opening example."
size: desktop: .d-wide, ~360px tall, plan excerpt left 50% / thumbnail right 50%. Mobile: full width, plan excerpt (≤ 6 lines) above, thumbnail below, ~520px tall, ‹ › buttons under both.
acceptance: ac-08, ac-09

## Comprehension items

### k-01
segment: s-03
objective: o-2
type: predict
prompt: The page builder has finished the page. Before it ships, which check would you trust most to catch a claim it got subtly wrong?
options: A) Ask the builder to re-read its page and double-check its claims. B) A fresh reviewer that sees only the brief, the fact base and the page, not the builder's reasoning. (correct) C) The Playwright gate: if it passes, the page is fine.
feedback: B. Option A is cheap and tempting, but the builder knows what it meant and reads that intent back into the text. Studies of LLM judges also find they rate their own outputs higher than human annotators do (shown on GPT-4 and Llama 2). C only checks what a machine can check, such as overflow, broken arrowheads and console errors, never whether a sentence is true. Didactician runs C, then B. Whether that split beats one agent reviewing itself hasn't been measured; the skill's own design notes list it as a hypothesis to test.

### k-02
segment: s-04
objective: o-3
type: predict
prompt: This page never explained what a subagent or a context window is. For you, would adding a step-by-step explanation of them have raised or lowered your cognitive load?
options: A) Lowered: more explanation always makes things easier. B) Raised: you'd spend effort checking it against what you already know. (correct) C) No effect: it's only a few paragraphs.
feedback: B. To you, "subagent" is already one chunk. Walking through it piece by piece gives you nothing to learn, but you still have to process it and cross-check it against what you know, and that is extraneous load. For a reader new to agents the same paragraphs would lower load. This is the expertise reversal effect: guidance that helps novices can be counterproductive as expertise grows. That's why Didactician fixes one audience per page, and why this page moves quickly through the agent material and slowly through the learning science.

### k-03
segment: s-05
objective: o-4
type: predict
prompt: An earlier version of Didactician had a script gate: the plan's estimated word count had to fit the reader's time budget (within 15%). What do you predict happened?
options: A) Pages got shorter and tighter, as intended. B) The designer planned compressed prose to pass, the builder copied it, and the pages got harder to follow. (correct) C) The agents ignored the gate.
feedback: B. Every check counted content items and none counted the connectives (the "because", "so" and "which means" that let a reader follow). The length pressure was paid for in clarity. The gate was retired. Now the designer sizes the scope in ideas, cuts whole ideas into a cut list you see before anything is built, and ranks what to drop if the page runs long. A word count is easy for a script to check; whether a page is easy to follow isn't. That is the rule behind what's gated and what's judged. (This is the project's own account of its history, from its design notes.)

### k-04
segment: s-05
objective: o-4
type: compare
prompt: A widget lets the reader drag a slider and watch a value change. Which change does most to make it teach?
options: A) Smoother animation and instant feedback. B) Ask the reader to predict the result before they move the slider. (correct) C) Add two more sliders so there's more to explore.
feedback: B. Dragging is Active: the reader does something but doesn't have to think. Predicting first makes it Constructive, because the reader generates something that isn't on the screen, and a wrong guess followed by the real result is what sticks (the ICAP framework, which its authors frame as a hypothesis). A is good UX but doesn't change what the reader thinks about. C adds interacting elements, so it adds load. Didactician's designer is told to put Constructive moments at the key ideas and known misconceptions, not in every section. That's why this page asks four questions, not one per section.

## Acceptance criteria

- ac-01 (s-01): On a 1280px screen the title, standfirst, meta row and the top of the w-pipeline overview (all 8 stages) are visible without scrolling. At 360px the overview begins within one scroll.
- ac-02 (w-pipeline): The overview state shows all 8 stages in order, each with its name written on its node (no numbered key anywhere). Agent, script and human stages are told apart by shape and name, not by colour alone.
- ac-03 (w-pipeline): In "what" mode, exactly one stage is at full ink per step, and its artifact card shows a real excerpt from this run's files (path in the card header). The findings.md card is visibly labelled as a format example.
- ac-04 (w-pipeline): In "why" mode, each of the 4 rules is drawn on the part of the pipeline it governs (orchestrator bar and fresh-context label on review; file chips; script hexagons and round_gate badges; the checkpoint with the "expensive" bracket).
- ac-05 (w-pipeline): At 360px there's no horizontal overflow; the strip is a 2×4 grid with readable labels (≥ 12px); the sticky area is ≤ 55vh and doesn't trap the reader in landscape (740×360).
- ac-06 (k-01): The answer and the "why" steps aren't visible before the reader commits (k-01 sits above the first "why" step). The feedback names self-review bias and states that the reviewer split is untested against a single-agent baseline.
- ac-07 (s-04): The reader meets the concrete "characteristics" case before the terms "working memory", "intrinsic" and "extraneous" appear. No numeric working-memory capacity is stated anywhere on the page. Germane load is not presented as a third quantity to increase; it appears only in the collapsed note, framed as contested.
- ac-08 (w-plan2page): Each of the 4 states highlights one verbatim line from this plan's s-04 entry and outlines the region of the s-04 thumbnail it produced, with a one-line load reason. The reader can tie each plan decision to a page feature they have already used.
- ac-09 (w-plan2page): Works by keyboard and with 44px buttons. At 360px the excerpt and thumbnail stack with the connector still joining them, and nothing is hover-only.
- ac-10 (k-03, k-04): Each is a one-tap commit with feedback revealed in place (the page doesn't jump). Feedback explains why the tempting option is wrong: k-03 names compression paid for in clarity and the gated vs. judged rule; k-04 names Active vs. Constructive and that more sliders add load.
- ac-11 (k-02): The feedback lets the reader predict the reverse case (the same paragraphs lower load for a reader new to agents), not just name the effect.
- ac-12 (s-06): The page's real run folder tree is shown with log.md marked as the starting point; the honest limits (reviewer split untested; caps hold only if the orchestrator follows SKILL.md) are stated in one or two sentences; the install pointer is a single line.
- ac-13 (whole page): Every factual statement about the skill or learning science traces to a claim in facts.md or an example in examples.md; nothing from the cut list appears.
- ac-14 (whole page, d-01): The page reads as a classical treatise (small-caps section heads, numbered plates, engraved-style figures, exercises headed "Problem N."), not modern edtech (no pastel rounded cards or soft shadows). Its decoration never lowers legibility: contrast holds in the paper and chalkboard themes, and there's no texture or hatching under text.
