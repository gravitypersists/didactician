# Conclusion

Written 2026-10-29, after the pilot in `results/SCORE.md`. This file records what the experiment showed and what to do next, for `../../WIDGET-BUILDER-HYPOTHESIS.md` and for didactician's widgets.

## Short version

On the one widget tested, a conceptual-model critic, which extracts the text's claims about the widget and runs them against the widget's model, did **not** beat asking a tool-using LLM to critique the same files. The critic found 4 of 5 known text ↔ widget mismatches, the same four in every run. The LLM critique found all 5 in every run, plus several plausible problems the critic had no way to express. By the pre-registered rule, H1 is falsified for this setting. I don't recommend running it on the other k8s-course chapters as planned.

## Why the result came out this way

1. **The doc's H0 is a strawman.** "Ask the LLM to critique it" was imagined as a model reading a design and guessing. In practice the baseline had the widget's code and a shell. It loaded `model.js` and ran `evaluate(...)` for every claim, unprompted. Executing claims against the system was meant to be the critic's distinguishing feature, and a tool-using LLM does it anyway. Any future version of this hypothesis should define H0 as *a tool-using LLM with the same artifacts*, since that's the baseline every real pipeline already has.
2. **A typed vocabulary caps recall.** The critic finds only the mismatches it has an observable for: node counts, warnings, controls, printed names. The miss (T5: a bar labelled "rented room" shows room for Pods, not rented room), and most of the LLM's extra findings, are about what a label *means* compared with what a number *is*. Encoding that needs a hand-written concept layer, which is exactly the authoring cost that sank model-based UI the first time.
3. **The test case favoured the critic, and it still lost.** W-02 has a pure, exact model in `model.js`. Most k8s-course widgets are scrollytelling sequences with no such model, so a critic would have even less to run.

## What the critic does have

Its output can be executed. The extracted pointers ("try `orders` at 8, then 12: the count rises") are tests that can be re-run after every revision, deterministically, with no new LLM call. The pilot didn't test regression use, but that's the one place a critic could plausibly earn its keep.

## Recommendations for didactician

These are cheaper than a critic and target the failure the pilot did find, which is check feedback and prose pointing at widget states that don't exist:

1. **Make the designer's pointers executable.** The designer already writes expected model values into the acceptance criteria (Ch 5's ac-08) and the builder already ships a `selftest`. Have every "try X in W-NN and you'll see Y" sentence in the plan's checks and prose appear as a self-test case too. That would have caught T1–T3 at build time, before review, with no extra agent. In keeping with didactician's preference for judgment over hard rules, a failing pointer should warn, not gate.
2. **Consider a narrow "text ↔ widget fit" pass before review.** With a scoped prompt, the fresh LLM in this pilot raised the `payments` gap (T3) and the label mismatch (T4) as substantive findings, where the broad round-1 pedagogy reviewer had filed them as nits. Something like this could be one extra reviewer brief, or a line in the pedagogy-ux reviewer's checklist, rather than a new tool.
3. **Leave conceptual-model machinery out of the widget-builder skill for now.** If widget building becomes a generic skill that didactician references, the conceptual-model schema could still serve as a *spec format* for designers. But no evidence here shows it improves results through a critic.

## What would reopen the question

- A widget class where a tool-using LLM measurably misses things. For example, large action spaces where reachability can't be checked by hand, which is closer to the doc's original collection-manager track.
- Evidence that pointer regression tests catch reintroduced mismatches across revision rounds that reviewers then miss.
- The collection-manager E1 from the hypothesis doc, run against a *tool-using* H0.

## Corrections to the pre-pilot evaluation

Before the pilot I said neither LLM reviewer had flagged the missing `payments` control. That was wrong: the pedagogy-ux reviewer raised it as P-10, a nit, and proposed rewording the text rather than adding the control. The user's human review (#25) escalated it. The round-1 reviewers in fact found all five targets, three of them only as nits.
