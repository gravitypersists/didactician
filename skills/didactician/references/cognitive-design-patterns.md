# Cognitive design patterns: reference

Deeper grounding for `learning-science-patterns.md`. Load it when you need the theory behind a decision, a citation, or a full component blueprint.

## 1. Theory beyond the 1998 core

Sweller, van Merriënboer & Paas (1998) set out the architecture: limited working memory, unlimited long-term memory of schemas, element interactivity, and the classic effects (worked example, split attention, redundancy, modality, goal-free, completion, variability). Five later developments matter for design:

**A. Germane load reconceptualized (Sweller, van Merriënboer & Paas, 2019).** Germane processing is not a separate additive load. It is working memory redirected to the intrinsic elements once extraneous load is gone. *Implication:* don't add activities to "raise germane load." Remove friction, and aim prompts at the domain's real relationships.

**B. Expertise reversal (Kalyuga, Ayres, Chandler & Sweller, 2003; foreshadowed by Kalyuga, Chandler & Sweller, 1998, and McNamara et al., 1996).** Techniques that help novices (integrated text, step-by-step examples, pre-training) lose value and then hurt as expertise grows, because the reader has to cross-check their own schema against redundant external guidance. *Explainer pattern:* design for the brief's audience; where it's mixed, make novice scaffolding collapsible and reader-controlled.

**C. ICAP (Chi & Wylie, 2014).** Interactive > Constructive > Active > Passive. Readers skim passive worked examples. Raise them to Constructive with self-explanation checkpoints (state the rule behind a step before the next is revealed) and contrastive examples (two solutions side by side; find the structural difference).

**D. 4C/ID (van Merriënboer & Kirschner, *Ten Steps to Complex Learning*, 3rd ed., 2018).** Four components:
1. *Learning tasks:* whole, authentic tasks in classes of rising complexity; within a class, support fades from worked example to completion to conventional problem.
2. *Supportive information:* mental models and strategies, given before a task class or in an openable reference, never mid-action.
3. *Procedural information:* just-in-time, step-level how-to, placed exactly where the action happens, faded as the reader automates it.
4. *Part-task practice:* drills for skills that must become automatic. **Rarely appropriate in a published explainer.** Mention it as a next step rather than building it.

**E. Desirable difficulties (Bjork & Bjork, 2011).** Conditions that maximize performance during learning (blocked practice, massed repetition, immediate hints) often fail to produce durable, transferable learning. Once a first schema exists, add interleaving, spaced retrieval, and generation before instruction (always followed by immediate worked feedback).

**Modality and narration.** Audio narration paired with a complex visual can relieve the visual channel, but only when the visual must be inspected while the explanation runs, and narration must never read on-screen text aloud. Static explainers rarely need it; for an animation, prefer short captions placed on the visual itself.

## 2. Software-design analogies (a mental check)

| Software principle | Cognitive equivalent | On the page |
|---|---|---|
| Locality of reference | Split-attention elimination (spatial/temporal contiguity) | Annotations and values sit on the diagram or line they describe, never in a distant legend |
| Single responsibility, well-named functions | Chunking / pre-training | Name sub-models first so the reader reasons with 2–3 chunks instead of a dozen raw variables |
| No obvious comments (`i++ // increment i`) | Redundancy effect | Cut prose that restates a self-explanatory figure or widget state |
| Scaffolding / starter templates | Completion effect | Give a working skeleton; the reader supplies only the target step |
| REPL / interactive debugger | Goal-free effect | Let the reader change inputs and inspect states before asking for a specific target |

## 3. Component blueprints

Each blueprint has a target problem, the mechanics, and hard constraints. The instructional designer names a blueprint in a segment or widget spec; the page builder or a widget builder implements it; reviewers check the constraints.

### B1. Step-locked worked example (scrollytelling)
- **Target problem:** high element interactivity plus split attention in a multi-step process or derivation.
- **Mechanics:** a fixed canvas (diagram, simulation, code, equation) on one side; discrete steps advance its state.
- **Constraints:** highlight only the active change (the 2–3 elements changing in this step) and dim unchanged context; put state values on the canvas nodes themselves; gate at least one critical step behind a Constructive prompt ("Which constraint fails if X increases?").

### B2. Goal-free state explorer (sandbox)
- **Target problem:** premature means-ends search overloading novices.
- **Mechanics:** a system with adjustable inputs; the reader is asked to discover relationships, not hit a target.
- **Constraints:** live state changes shown right next to the controls; optionally an "observed rules" list where the reader records what they found, with an expert answer revealed after they commit; then a prediction prompt that tests the rule.

### B3. Faded completion workbench
- **Target problem:** the jump from reading a solution to solving from a blank page.
- **Mechanics:** three stages in one interface: (1) a full solution with one key step blanked; (2) the structure given, the reader supplies the core steps; (3) only the setup, with the stage-1 example available *after* an attempt (not beside it, which would split attention between problem and example).

### B4. Contrastive schema matrix
- **Target problem:** readers memorizing surface features (the story, the names) instead of the structure.
- **Mechanics:** two worked examples side by side, with different surfaces and the same structure, or the same surface needing different structures (Quilici & Mayer, 1996).
- **Constraints:** color-link or connect the shared invariants across both so the reader doesn't have to search for the correspondence.

## 4. Handoff: design constraints travel with the plan

The instructional designer owns load budgeting, prerequisite chunking, choice of mode and blueprint, and the **cognitive layout constraints** for each segment. The page builder and widget builders own visual hierarchy, typography, color, responsive mechanics, and micro-interactions, and must satisfy those constraints rather than reinterpret them. The constraint vocabulary is in `ux-ui.md` ("Layout constraints"). Write constraints as light Markdown fields in `learning-plan.md`, not as a typed schema:

```markdown
### s-03 — Why the swing slows at large angles
objectives: o-02 · claims: c-02, c-05
readiness: novice · interactivity: high (angle, restoring force, period) · max-elements: 3
mode: annotated worked example → completion · blueprint: B1
layout:
  contiguity: inline — force values labeled on the diagram, not in a legend
  pacing: step-revealed; step 3 gated on q-04
  redundancy: no prose restating the step annotations
  scaffold: "show the derivation" collapsed for readers who pass q-03
```

## References

- Bjork, E. L., & Bjork, R. A. (2011). Making things hard on yourself, but in a good way: Creating desirable difficulties to enhance learning.
- Chi, M. T. H., & Wylie, R. (2014). The ICAP framework. *Educational Psychologist*, 49(4).
- Kalyuga, S., Ayres, P., Chandler, P., & Sweller, J. (2003). The expertise reversal effect. *Educational Psychologist*, 38(1).
- Mayer, R. E. (2021). *Multimedia Learning* (3rd ed.).
- Quilici, J. L., & Mayer, R. E. (1996). Role of examples in how students learn to categorize statistics word problems. *J. Educational Psychology*, 88(1).
- Sweller, J., van Merriënboer, J. J. G., & Paas, F. (1998). Cognitive architecture and instructional design. *Educational Psychology Review*, 10(3).
- Sweller, J., van Merriënboer, J. J. G., & Paas, F. (2019). Cognitive architecture and instructional design: 20 years later. *Educational Psychology Review*, 31(2).
- van Merriënboer, J. J. G., & Kirschner, P. A. (2018). *Ten Steps to Complex Learning* (3rd ed.).
