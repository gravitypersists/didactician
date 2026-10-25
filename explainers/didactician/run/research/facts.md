# Facts

Depth `light`. Skill-internal claims (o-1, o-2, o-4) cite the skill's own files by path and line (`#Lnn` anchor, so each file counts once as a source). Learning-science claims (o-3) cite external primary or review sources, not the skill's reference files.

## Questions
- q-1: answered — c-01, c-02
- q-2: answered — c-02, c-04, c-05
- q-3: answered — c-02, c-03, c-04, c-11
- q-4: answered — c-03, c-06 (see also m-01, m-02)
- q-5: answered — c-07, c-08, c-09
- q-6: answered — c-10, c-08 (partly: split-attention is a claim; expertise reversal is in examples x-03; redundancy, segmenting, signalling and worked examples were not given separate claims under the light cap, see parking-lot.md)
- q-7: answered — c-12, c-11, c-05
- q-8: answered — c-12, c-11 (see also m-03, m-04; learning styles parked, see parking-lot.md)

## Claims

### c-01
objective: o-1
claim: Every stage hands the next one files, not chat: brief.md → research files (facts, misconceptions, examples) → learning plan + cut list + mockup → site/ → gate report → review findings.
source: skills/didactician/DESIGN.md#L5
quote: "Each stage hands the next one files, never chat."
confidence: high
note: Per-stage artifacts and paths are in the topology diagram at DESIGN.md#L95-L121 and SKILL.md#L33-L43: research/ (researcher), plan/learning-plan.md, cut-list.md, mockup.html (instructional designer), site/ (page builder + widget builders), run/gate/page-round-N.json (verify.mjs, SKILL.md#L174), run/review/round-N/findings.md (reviewers, IDs assigned by findings.py, SKILL.md#L184). Each handoff prompt and report is also saved under run/handoffs/.

### c-02
objective: o-1
claim: A human always reviews the plan, opened as a wireframe mockup with objectives and cut list, and must approve, revise or rescope it before anything is built.
source: skills/didactician/SKILL.md#L148
quote: "## Checkpoint (always; the human reviews the plan)"
confidence: high
note: Options at SKILL.md#L160 ("approve / revise (notes) / rescope"). Rationale at DESIGN.md#L126: "A wrong premise in the plan is the most expensive error in the system, so the checkpoint is the premise check." The human is involved at five points in total (DESIGN.md#L480): intake clarification, the plan checkpoint, post-approval deltas, blockers whose source is the user, and any cap tripping.

### c-03
objective: o-2
claim: The orchestrator (the user's main session) never writes content, plans, site code or review verdicts, so reviewers stay independent of the author and raw research stays out of the context that writes the prose.
source: skills/didactician/SKILL.md#L8
quote: "You do not write content, plans, site code, or review verdicts yourself. Subagents do that, so the reviewer stays independent of the author and research material stays out of the context that writes the prose."
confidence: high
note: Reviewers are dispatched fresh and are "Never" given builder reports or orchestrator commentary (SKILL.md#L183). DESIGN.md#L9-L10 names independent verification and context isolation as the two justifications that "carry most of the weight".

### c-04
objective: o-2
claim: A script (round_gate.py) must authorise every agent dispatch and refuses when a cap is reached, a loop repeats the same failure, or the previous report is missing, so loops cannot run away.
source: skills/didactician/DESIGN.md#L351
quote: "`round_gate.py` refuses to authorise the next spawn while any of these is outstanding … This makes the bookkeeping a precondition, not a courtesy."
confidence: high
note: Simplification safe for this audience. Per-loop round caps are in DESIGN.md#L338-L344; run-level spawn and wall-clock caps at #L346-L348. Honest caveat (DESIGN.md#L455): caps are "Enforced if the orchestrator follows SKILL.md"; a skipped gate call shows up in the log rather than being impossible. Other deterministic scripts: check_research.py, check_plan.py, verify.mjs (Playwright gate at 360/768/1280px), findings.py.

### c-05
objective: o-2
claim: Only rules a script can check are hard gates; pedagogical calls such as page shape, whether to include checks, or a table of contents are agent judgment calls with a stated rationale, judged by reviewers.
source: skills/didactician/DESIGN.md#L441
quote: "A rule becomes an invariant only when the user's notes require it *and* a script can check it. Pedagogical choices (whether to have checks, a ToC, which modality) and technical choices (frameworks, CDNs) are judgment calls."
confidence: high
note: Accuracy is deliberately not an invariant "because no machine can check it" (DESIGN.md#L443); it is the top-ranked preference and blocks delivery through the review loop instead. Mandatory comprehension checks were an invariant once and were removed (DESIGN.md#L570).

### c-06
objective: o-2
claim: LLM evaluators show self-preference: they score their own outputs higher than others' that human annotators rate as equal quality.
source: https://arxiv.org/abs/2404.13076
quote: "One such bias is self-preference, where an LLM evaluator scores its own outputs higher than others' while human annotators consider them of equal quality."
confidence: medium
note: Panickssery, Bowman & Feng (2024), tested on GPT-4 and Llama 2; the bias is well documented there, but its size for current Claude models is not established by this source, hence medium. Didactician's own claim is milder and untested (DESIGN.md#L78: "Generators over-praise their own work"); the page should not present the skill's reviewer split as empirically proven better (DESIGN.md#L12, #L505 lists the baseline comparison as "test first").

### c-07
objective: o-3
claim: Cognitive load theory rests on the premise that new information must pass through a working memory limited in capacity and duration, while knowledge already stored in long-term memory escapes those limits.
source: https://doi.org/10.1007/s10648-019-09465-5
quote: "all novel information first is processed by a capacity and duration limited working memory and then stored in an unlimited long-term memory for later use. Once information is stored in long-term memory, the capacity and duration limits of working memory disappear"
confidence: high
note: Sweller, van Merriënboer & Paas (2019), Educational Psychology Review 31:261–292 (open access; full text read). This paper gives no numeric element limit. The skill's reference says "about 2–3 interacting elements" (learning-science-patterns.md#L9); that figure is NOT verified here. Avoid stating a precise number on the page, or say "only a handful" (Miller 1956 and later work are cited in the paper only for the existence of limits).

### c-08
objective: o-3
claim: Intrinsic load comes from the material's interacting elements relative to what the learner already knows; extraneous load comes from how it is presented and what the task demands, which is the part instruction can change.
source: https://doi.org/10.1007/s10648-019-09465-5
quote: "Extraneous cognitive load is not determined by the intrinsic complexity of the information but rather, how the information is presented and what the learner is required to do by the instructional procedure. Unlike intrinsic cognitive load, it can be changed by changing instructional procedures."
confidence: high
note: Same paper: "intrinsic cognitive load only can be changed by changing what needs to be learned or changing the expertise of the learner" and "The vast bulk of the instructional effects reported below are due to variations in extraneous cognitive load." So sequencing/pre-training (changing what is learned at once) is the lever for intrinsic load; layout is the lever for extraneous.

### c-09
objective: o-3
claim: Critics argue the germane-load construct makes cognitive load theory hard to falsify: splitting load into good, bad and neutral types lets any learning outcome be explained after the fact.
source: https://doi.org/10.1007/s11251-009-9110-0
quote: "the fact that cognitive load is composed of three different elements that are ''good'' (germane), ''bad'' (extraneous), or just there (intrinsic) means that every outcome fits within the theory post-hoc."
confidence: high
note: de Jong (2010), Instructional Science 38:105–134 (full text read; "hard or even impossible to falsify"). The redefinition is in Sweller et al. 2019 (c-07 source): "rather than contributing to the total load, germane cognitive load redistributes working memory resources from extraneous activities to activities directly relevant to learning." Safe page framing: two loads (intrinsic, extraneous) plus "free capacity aimed at the content"; do not present germane load as a third quantity to increase. This matches the skill's own guidance (learning-science-patterns.md#L13).

### c-10
objective: o-3
claim: Split attention, having to mentally integrate a diagram with text placed elsewhere, raises cognitive load and hurts learning; physically integrating the two removes the effect.
source: https://doi.org/10.1007/s10648-019-09465-5
quote: "Learners must mentally integrate the two sources of information in order to understand the solution, a process that yields a high cognitive load and hampers learning. This split-attention effect can be prevented by physically integrating the diagram and the solution statements"
confidence: high
note: Applies only when the two sources are needed together; if each is self-contained, adding the second is redundancy instead (same paper, Redundancy Effect section). The effect also has a temporal form (narration must be synchronised with animation). For web explainers: direct labels instead of legends, captions next to their figures, values on the diagram. Reported meta-analytic effect sizes (Ginns 2006) were seen only in secondary sources and are not used.

### c-11
objective: o-4
claim: Didactician sizes a plan in ideas, not words: an earlier word-estimate gate was retired because agents met it by compressing prose, which made the page hard to follow.
source: skills/didactician/DESIGN.md#L332
quote: "The designer passed it by planning compressed prose, the builder copied that prose, and the page became hard to follow. Every check counted content items and none counted the connectives, so the length pressure was paid in clarity."
confidence: high
note: Retired invariant I5 (≤ 1.15× budget) at DESIGN.md#L427. Instead the designer cuts whole ideas into cut-list.md, with an "## If it runs long" ranked cut order that the user picks from (DESIGN.md#L333). Reading time is reported, never gated.

### c-12
objective: o-4
claim: The designer is told to put Constructive moments (predict, explain, compare) at the key ideas and known misconceptions rather than in every segment; moving a slider alone counts only as Active.
source: skills/didactician/references/learning-science-patterns.md#L52
quote: "Put Constructive moments where the key ideas are, not mechanically in every segment. Moving a slider is only *Active*; asking \"predict, then move the slider\" makes it *Constructive*."
confidence: high
note: This claim is about what the skill directs, not the science. External check: Chi & Wylie (2014), Educational Psychologist 49(4), https://doi.org/10.1080/00461520.2014.965823, state ICAP as a hypothesis: "as students become more engaged with the learning materials, from passive to active to constructive to interactive, their learning will increase", validated mainly on note taking, concept mapping and self-explaining. The slider example is the skill's application, not from Chi & Wylie. Other directives that map to page features: predict-then-reveal (§5), misconception confrontation (§8), retrieval checks hidden until commit (§7), think-then-reveal instead of free-text boxes (#L115), step-locked scrollytelling blueprint B1 (cognitive-design-patterns.md#L39).
