# Learning-science patterns

The goal of an explainer is that the reader can **predict, explain, and apply** afterward — not that the reading felt smooth. Fluent reading is weak evidence of learning; it often signals the opposite (see §10). Every pattern here trades a little reading comfort for durable understanding.

For theory, citations, the software-design analogies, and full component blueprints, see `cognitive-design-patterns.md` (same folder).

## 1. The cognitive budget

Working memory can actively process, compare, and combine only **about 2–3 interacting elements at once**. Long-term memory holds **schemas** — learned chunks that let many elements count as one. Learning is building schemas; instruction must not exhaust working memory while doing it.

- **Intrinsic load** = how many elements must be held *together* to understand the material (element interactivity), relative to what the reader has already chunked. Styling can't reduce it; only sequencing can (§2).
- **Extraneous load** = effort spent on the presentation instead of the content: searching for a referent, matching a symbol to a distant legend, decoding notation, filtering redundant text, holding a subgoal stack while problem-solving blind. When intrinsic load is high, extraneous load is fatal. Remove it ruthlessly.
- **Germane processing** isn't a third load to add. It is the working memory freed by removing extraneous load and pointed at the intrinsic relationships. **Don't invent busywork to "increase germane load."** Strip friction, then use prompts (self-explanation, comparison) that aim attention at the deep structure.

### Diagnose before designing (per segment)

| | Low interactivity (elements learnable one by one: terms, isolated facts, flags) | High interactivity (elements only make sense together: a feedback loop, a derivation, a mechanism) |
|---|---|---|
| **Novice** (no sub-schemas; every symbol is a separate element) | pacing + retrieval practice | pre-train or simplify the whole (§2); worked examples (§3); zero extraneous load |
| **Intermediate** (has parts, not their interaction) | brief reminders, retrieval | completion problems; self-explanation at transitions |
| **Advanced** (automated schemas) | reference-style, skimmable | problems first, worked detail on demand (§9) |

Count the **new interacting elements** a segment asks the target reader to hold at its hardest moment. **More than 3 → restructure** before writing.

## 2. Managing high intrinsic load: pre-training vs. whole-task simplification

Two ways to decompose a system that's too interactive to show at once:

1. **Pre-training (bottom-up).** Teach the components' names, states, and isolated behaviors first, so each becomes one chunk; then show them interacting. Use when the components are stable and nameable.
   *Example:* before showing a heat pump cycle, introduce the compressor, condenser, valve, and evaporator one at a time with what each does to the fluid's pressure and temperature.
2. **Whole-task simplification (top-down, 4C/ID).** Show the simplest authentic version of the *whole* system first (few variables, low fidelity), then layer complexity across later segments. Use when the parts don't make sense out of context.
   *Example:* a thermostat-controlled room: first heating with no feedback (temperature climbs), then a switch at a setpoint (overshoot appears), then sensor lag (oscillation). Each step adds one element, and each new element explains a newly visible behavior.

Either way: introduce a term *after* the reader has met the thing it names.

## 3. The guidance continuum

Novices given an open problem fall into **means-ends search**: they hold the current state, the goal, the differences, and a stack of subgoals all at once. That can solve the problem but leaves no capacity for learning from it. **Unassisted problems measure performance; they're poor for first acquisition.** Choose a point on this continuum per segment, moving rightward as the piece progresses:

**a. Goal-free exploration.** Replace "find X" with "change the inputs and see what holds." With no target there's no subgoal stack, so the reader pairs states directly with rules. Good for introducing a new system's dynamics, often as a sandbox widget.
*Example:* "Change the length and the release angle. Which one changes the period, and which barely matters?" rather than "Find the length that gives a 2-second period."

**b. Annotated worked examples.** A complete solution, step by step, with *why* each step is taken in that state, so the reader induces the rule rather than memorizing the sequence. Readers skim passive examples, so **attach a self-explanation prompt or micro-prediction at the key transition** ("Why does this term drop out here?"), and gate the next step on it where the medium allows.

**c. Completion problems and fading.** Give the start, the goal, and a partial solution; the reader fills the missing steps, which forces them to understand the given structure. Fade across examples: one step blank, then most steps blank, then only the setup. Show the worked example *after* an attempt, not beside the blank one.
*Example:* tracing a ball's height under gravity: (1) a full time/velocity/height table with the rule at each row; (2) the last two rows blank; (3) a new launch speed, the reader fills the table.

**d. Varied and interleaved practice.** Once a first schema exists and extraneous load is low: vary surface stories while keeping the deep structure, or mix question types so the reader must first decide *which* idea applies. This feels harder and slower, which is why it transfers better (the transfer paradox). Readers who expect the difficulty are less likely to give up; whether and how to mention it depends on the piece's voice. **Don't introduce variability early**; it overwhelms a reader who has no schema yet.

## 4. Engagement level (ICAP)

Rank what the reader is *doing*: **Interactive** (co-constructing, debating) > **Constructive** (generating something beyond what's given: explaining, predicting, comparing) > **Active** (manipulating, selecting, highlighting) > **Passive** (reading, watching). A published explainer can reliably reach Constructive. Put Constructive moments where the key ideas are, not mechanically in every segment. Moving a slider is only *Active*; asking "predict, then move the slider" makes it *Constructive*.

## 5. Predict, then reveal

Ask the reader to commit to a prediction before showing the outcome. A wrong prediction followed by the truth creates surprise, which drives attention and memory; a right one confirms the model.

**How.** Make the commitment concrete and cheap: multiple choice, set a slider, "sketch the curve." Include the misconception's answer as an option. Reveal, then explain *why the tempting answer was wrong*; that explanation is the payoff. Most valuable right before a widget or a key result.

*Example:* "A heavy and a light pendulum of equal length are released together. Which completes a swing first?" Options: heavy, light, same.

## 6. Contrasting cases

Cases that differ in exactly one critical feature, side by side, so the reader notices what matters. Two variants:
- **Same surface, different structure:** a near-miss that looks like it qualifies but doesn't.
- **Different surface, same structure:** two stories solved by the same rule, with the shared structure visually linked (same color or callout) so the reader abstracts the rule instead of the story. Also correct vs. flawed reasoning, side by side.

Ask "what's different, and why does it matter?" before telling.

*Example:* two identical cups of coffee cooling, one stirred and one not; then two identical cups, one with a lid. Each pair isolates one heat-loss mechanism.

## 7. Retrieval practice

Recalling strengthens memory far more than re-reading. Short, low-stakes checks *during* the piece beat a quiz at the end.

**How.** Where a segment introduces something the reader must keep (not necessarily every segment), one to three items requiring the reader to *produce* an answer (not recognize it on the page above), and hidden until a commit action, with feedback that explains. Prefer predict, explain, or apply-to-a-new-case items over recalling definitions. Near the end, mix items from earlier segments (interleaving, §3d). Every objective needs at least one item.

## 8. Confronting misconceptions directly

Readers arrive with intuitive models. Ignored, those models absorb the new material and survive. **(1)** State the misconception fairly where the reader would have it. **(2)** Show a case where it predicts wrongly, ideally through predict-then-reveal. **(3)** Give the correct model. **(4)** Show the correct model also handles the cases the misconception got right. State the misconception once, clearly; don't keep repeating it.

## 9. Expertise reversal

Supports that help novices (integrated explanations, step-by-step examples, pre-training) become redundant, then harmful, for readers who already hold the schema. They waste effort cross-checking what they know against what's shown. The brief fixes one target audience, so design for it. Where the audience is mixed:
- put novice scaffolding in collapsible "show the steps" or "what does this term mean?" elements the reader controls,
- offer a short check at the start of a segment that lets a confident reader skip the worked detail,
- never hide what the *target* reader needs behind a toggle.

## 10. The illusion of explanatory depth

People think they understand a mechanism much better than they do, until asked to explain it step by step. Passive explainers feed the illusion: smooth prose, an animation played *at* the reader. The reader follows each step and concludes they understand the whole, yet can't predict what happens when one parameter changes. Counter it by making the reader generate (predictions, explanations, new applications) and by putting retrieval checks right after the satisfying parts. A widget the reader only watches is an animation; one where they set something and are surprised is a lesson.

## 11. Concrete before abstract, then back

A specific instance with real numbers → a diagram that keeps the structure and drops the details → the rule → a new instance where the reader applies it ("concreteness fading").

## 12. Where information goes (4C/ID placement)

- **Supportive information** (the mental model, *how the domain works*) comes **before** the task or segment that needs it, or sits in a reference the reader can open. It never interrupts an action.
- **Procedural information** (the exact rule or how-to for a step) appears **just in time, right where it's used**, and fades once used.

## Audit checklist (per segment, before handing off)

- [ ] At its hardest moment, does the target reader hold ≤ 3 unchunked interacting elements? If not, pre-train or segment.
- [ ] Does the reader ever have to scroll, hover, or scan to match a label or symbol to its referent? If so, put the label on the referent.
- [ ] Is there prose that only restates a self-explanatory figure, equation, or widget state? If so, cut it.
- [ ] Does every worked example carry a completion step or self-explanation prompt?
- [ ] Does the piece have Constructive moments at its key ideas, and a retrieval item for each objective?
- [ ] Is the chosen point on the guidance continuum right for where the reader is now?

## Using these patterns

- Fit the pattern to the obstacle: an unfamiliar procedure → worked examples, then completion; a new system → goal-free exploration; counterintuitive behavior → predict-then-reveal; a fine distinction → contrasting cases; a known wrong intuition → misconception confrontation.
- Not every segment needs a challenge. Put activities where they earn their place (the core mechanism, a misconception, a transfer case); connective or short segments can just explain. A well-chosen question in prose is an active moment.
- **Open-ended prompts are think-then-reveal**: the reader thinks of an answer, then clicks to see the model answer. No free-text boxes by default; readers find them annoying and skip them.
- Name the pattern and the continuum point in the learning plan so reviewers can check it was carried out, not just intended.
- **A clean-looking screen is not the same as low load.** Hiding essential labels behind hover tooltips or toggles creates temporal split attention. The reader has to hold one tooltip in mind while hovering over the next. Everything the target reader must compare at once stays visible at once. Toggles are for *optional* scaffolding (§9).
