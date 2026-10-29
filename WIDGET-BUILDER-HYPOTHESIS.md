# Computable UI: Conceptual-Model Critic — Hypothesis Doc

Oct 29, 2026 · @Michael Silveira

## Summary

Thesis: once a widget's conceptual model is written down as objects, attributes, relations and actions, a small set of computable checks can find real design problems that an LLM working alone misses. Those checks are completeness, path cost and consistency.

The prototype is a **critic, not a generator**. An LLM proposes the conceptual model and candidate designs; deterministic analysis scores them and says why. The scope is one widget, a "collection manager" (a list of things you filter, select and act on), not a whole product.

Out of scope: visual design, layout solving, aesthetics, and any claim that the math can produce a good design by itself.

The experiment that matters most is the baseline. Every hypothesis is tested against "just ask the LLM to critique it." If the critic doesn't beat that, the project stops.

## Background and prior work

This is not a new field. Model-based UI generation was tried for two decades and mostly stalled; the bet here is that LLMs remove its main bottleneck.

| Line of work                                                           | What it contributes here                                                             | Why it didn't take over                            |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------- |
| Model-based UI development (ConcurTaskTrees, CAMELEON, UsiXML, TERESA) | Task and domain models compiled down to abstract, then concrete UI                   | Writing the model cost as much as designing the UI |
| SUPPLE (Gajos and Weld)                                                | UI generation as optimization over predicted user effort                             | Optimized motor cost well; output felt mechanical  |
| Computational interaction (Oulasvirta et al.)                          | Fitts, Hick-Hyman, visual search and combinatorial optimization as design objectives | Strong on layout and menus, thin on concepts       |
| GOMS / KLM, CogTool                                                    | Task-time prediction from operator sequences over a UI                               | Models skilled, error-free users, not learners     |
| OOUX (Sophia Prater)                                                   | Practitioner method: objects, relationships, CTAs, attributes → IA                   | Manual; no analysis layer on top                   |
| Formal concept analysis                                                | Lattice of objects × properties; exposes implied but missing concepts                | Rarely applied to UI                               |
| Norman, Johnson and Henderson                                          | Designer's conceptual model vs. system image vs. user's mental model                 | Framing, not method                                |

**What changes with LLMs:** they can draft a conceptual model from a description or an existing product in minutes, and they already encode strong priors about common IAs and affordances. That removes the authoring cost.

What they still don't do reliably is guarantee anything. They don't reliably notice an unreachable action, a concept rendered three different ways, or a common task that takes eleven steps. That's the gap this project targets.

References are from memory, not freshly checked; verify citations before publishing anything.

## Core framing

The framing commits to two representations and one stance. The two representations are a conceptual model, which is what the user must learn, and a widget spec, which is what the UI teaches. The stance is that analysis judges and the LLM proposes.

**Conceptual model (what must be learned).** It is a typed graph, deliberately constrained:

- **Objects:** the nouns, such as Issue, Label and Person.
- **Attributes:** typed properties, such as status (enum), due (date) and title (text).
- **Relations:** typed edges with cardinality, such as Issue _has many_ Labels and Issue _assigned to_ Person.
- **Actions:** verbs applied to objects or relations, with arity (one vs. many) and reversibility.
- **Tasks:** user goals expressed as target states, such as "all overdue issues assigned to me are closed."

The types matter. "Everything is associated" is too loose to compute on. If the representation turns out to be too rigid, that's a finding, not a failure.

**Widget spec (what the UI teaches).** It is a statechart: states, the affordances visible in each state, and the transitions those affordances trigger, each tagged with the conceptual action it performs. XState is a natural fit for the TypeScript stack.

**The mapping between them is where the measurements live:**

- **Coverage:** does every conceptual action have at least one affordance?
- **Cost:** how expensive is the cheapest path for each task?
- **Consistency:** is the same concept rendered the same way everywhere?
- **Completeness:** does the conceptual model itself have holes the design should fill?

The teaching analogy enters through cost. Pure KLM models an expert. To model a learner, each affordance also carries a _familiarity_ term: how conventional is this control for this action? That prior can come from an LLM or from a small catalogue of common widget patterns. This is the most speculative part of the design and is tested separately in H3.

## Why a widget, and which one

Recommended pick: a **collection manager**. That's a list of one primary object with filter, sort, multi-select, bulk actions and a detail peek, plus one or two related objects.

A widget keeps the conceptual model small enough to hand-check (roughly 3 objects, 10–20 actions, 5–8 tasks). It also keeps the state graph small enough that A\* is trivial. The constraint is that the widget still needs real conceptual structure, or H1 has nothing to find.

| Candidate                                 | Conceptual richness                               | Real-world exemplars to compare                              | Fit                  |
| ----------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------ | -------------------- |
| Collection manager (issues, files, email) | High: objects, relations, single vs. bulk actions | Many: Gmail, Linear, GitHub Issues, Finder, Notion databases | Best                 |
| Permissions / sharing dialog              | High: people, roles, inheritance                  | Several: Google Drive, Figma, Notion                         | Good second          |
| Notification settings panel               | Medium: channels × events matrix                  | Many                                                         | Good for H1 only     |
| Date-range picker                         | Low: mostly interaction mechanics                 | Many                                                         | Poor; already solved |
| File uploader                             | Low                                               | Many                                                         | Poor                 |

The collection manager also has well-known holes that make good ground truth. Examples: bulk actions that exist for one attribute but not its siblings, a filter on a relation with no matching sort, and undo for single edits but not bulk edits. Use Linear issues or Gmail as the first hand-encoded model.

## Hypotheses

There are four hypotheses, each against the same null. **H0:** an LLM asked directly ("critique this design" or "what's missing") finds the same problems. Each threshold below is a starting guess, set before running so it can't drift.

| #   | Hypothesis                                                                                                 | Prediction                                                      | Supported if                                                                                                  | Falsified if                                        |
| --- | ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| H1  | **Completeness.** Asymmetries in the object × action × attribute structure point to real missing features. | Flagged holes are mostly ones designers agree are gaps.         | ≥ 60% of flagged holes rated real by 2 of 3 designers, **and** ≥ 30% of real holes not found by the H0 prompt | < 30% rated real, or H0 finds ≥ 90% of the same set |
| H2  | **Cost.** Planner path cost over the statechart ranks variants the way measured task time does.            | Cheaper predicted paths are faster in practice.                 | Spearman ρ ≥ 0.6 between predicted and measured task time across variants                                     | ρ < 0.3, or LLM-estimated effort ranks equally well |
| H3  | **Familiarity.** Adding a familiarity (learnability) term improves first-use prediction over pure KLM.     | Unconventional affordances cost more for novices than KLM says. | First-attempt success correlates better with cost + familiarity than with cost alone                          | No improvement over KLM alone                       |
| H4  | **Critic loop.** Generator + critic yields variants experts prefer over generator alone.                   | Ranking and revising by the scores improves output.             | > 60% win rate in blind pairwise comparison                                                                   | ≤ 50% win rate                                      |

H1 is the cheapest to test and the most distinctive, so it gates the rest. If H1 fails, H2–H4 are still testable but the project loses most of what makes it more than CogTool with an LLM attached.

H3 is the riskiest. It's where the "UI as teaching" idea lives, and it's the hardest to measure honestly with a small sample.

## Prototype design

The LLM handles the two creative steps. Everything inside the critic is plain TypeScript, so its output is reproducible and explainable.

&#91;embedded content: prototype pipeline · 2 LLM steps, 4 deterministic checks, 1 revision loop\]

The hole finder only needs the conceptual model, so E1 can run before any widget exists.

**Representations**

- **Conceptual model:** a JSON schema (Zod) for objects, attributes, relations, actions and tasks; tasks are goal predicates over conceptual state.
- **Widget spec:** an XState statechart. Each transition records the conceptual action it performs, the affordance type (button, menu item, inline edit, shortcut) and whether it is visible in that state.

**Checks**

- **Completeness (rules first, lattice later):** an action exists for one attribute but not its same-typed siblings; a relation is traversable in one direction only; a single-item action lacks a bulk form, or the reverse; a create has no delete or undo; a filter has no matching sort.
- **Cost:** A\* over (UI state × conceptual state) to each task's goal. Edge weight is the KLM operators for that affordance (mental prep, point, click, keystrokes), plus a familiarity penalty in novice mode.
- **Coverage:** every conceptual action reachable from the initial state.
- **Consistency:** the same action uses the same affordance type across states, and the same attribute uses the same control.

The report gives per-task expert and novice cost, the list of holes and inconsistencies, and a one-line reason for each, so a person or the generator can act on it.

## Experiments and evaluation

There are three experiments. Each is small enough for a few weekends, and each runs the H0 baseline beside the critic.

| Exp                               | Tests  | Setup                                                                                                                                                                                                | Ground truth                                                                                                                               | Metric                                                          |
| --------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| E1: Reverse-engineer real widgets | H1     | Encode the conceptual model of 4–5 real collection managers (Linear, Gmail, GitHub Issues, Finder, a Notion database). Do one by hand, the rest LLM-drafted and hand-corrected. Run the hole finder. | 2–3 designers (or you plus 2 peers) rate each flagged hole as a real gap, a deliberate omission, or noise, blind to source (critic vs. H0) | Precision; unique-find rate vs. H0                              |
| E2: Predicted vs. measured cost   | H2, H3 | 6–8 variants of one collection manager, built as clickable React prototypes from the statecharts, 5 fixed tasks                                                                                      | Unmoderated task timing and first-attempt success, 8–12 participants                                                                       | Spearman ρ (H2); fit improvement with the familiarity term (H3) |
| E3: Critic in the loop            | H4     | Same brief, 10 runs: generator alone vs. generator + 2 critic revision rounds                                                                                                                        | Blind pairwise preference by 3 raters                                                                                                      | Win rate                                                        |

E1 needs no participants and can run first. E2 is the expensive one; 8–12 people is enough to see a strong effect and not enough to see a weak one, so treat a null there as "unclear," not "false."

To keep it honest:

- Fix the task list and thresholds before generating any variants.
- Hand-correct the LLM-drafted models, but log every correction. That log is itself data on how much authoring cost remains.
- Raters never see which pipeline produced an item.

## Risks and kill criteria

The biggest risk is the one that killed model-based UI before: authoring cost. It may have moved rather than disappeared.

| Risk                     | Why it bites                                                                                          | Mitigation                                                                      |
| ------------------------ | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Authoring cost persists  | If LLM-drafted models need heavy correction, the old bottleneck is back                               | Log corrections per model (E1); track minutes per model                         |
| Circularity              | If the LLM writes both the model and the design, holes may reflect the LLM's model, not the product's | Hand-encode at least one model; compare holes found from hand vs. LLM models    |
| KLM models experts       | Cost ignores discovery and learning, the part the teaching framing cares about                        | H3's familiarity term; report expert and novice cost separately                 |
| Measuring the easy 30%   | Completeness and path cost may only catch trivia                                                      | E1 rates noise explicitly; the H0 comparison exposes it                         |
| Goodhart in the loop     | The generator learns to satisfy the critic, not users                                                 | E3 judged by humans only, never by critic scores                                |
| Small samples            | 8–12 participants can't detect weak effects                                                           | Pre-register thresholds; report nulls as inconclusive                           |
| Representation too rigid | Real concepts may not fit objects / relations / actions                                               | Record what didn't fit; that's a finding about the "universal grammar" question |

**Kill criteria:** stop if any one of these holds.

- H1 fails against H0. The critic finds nothing an LLM prompt doesn't.
- Hand-correcting an LLM-drafted model takes longer than designing the widget directly.
- After E1, raters call more than half of the flagged holes noise.

## Plan and open questions

The plan runs in four phases. The only hard gate is after phase 1: H1 must hold before building the planner.

1. **Schema and one hand-encoded model.** Define the conceptual-model JSON schema and the statechart conventions. Hand-encode Linear's issue list end to end. _Output: a schema you trust and one ground-truth model._
2. **Hole finder and E1.** Implement the completeness checks, LLM-draft the remaining 3–4 models, and run E1 against H0. _Gate: H1 passes, or stop._
3. **Planner and E2.** Compile statecharts to graphs, add the A\* / KLM cost model and the familiarity term, build 6–8 clickable variants, and run E2.
4. **Critic loop and E3.** Wire the scores back into generation, then run the blind comparison.

**Open questions:**

- Which completeness checks are principled rather than ad hoc? Is a symmetry heuristic over the action × attribute tensor enough, or is the formal concept lattice worth the complexity?
- Where does the familiarity prior come from: an LLM rating, a hand-built pattern catalogue, or usage frequency scraped from design systems?
- Should the statechart describe _visible_ affordances only, or also hidden ones (keyboard shortcuts, context menus)? This decision changes both cost and coverage.
- Can tasks be written as target states the planner understands, without hand-writing a goal predicate for each?
- Is the deliverable a tool, a write-up, or both? A clear E1 result alone is already a credible post.
