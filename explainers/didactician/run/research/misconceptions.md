# Misconceptions

### m-01
objective: o-2
misconception: Asking the same agent (or the same context) to review its own output is a good-enough check.
why_tempting: It is cheap, it is the default "now double-check your work" pattern, and the author already has all the context.
counter: c-03, c-06
source: skills/didactician/DESIGN.md#L78 ("Generators over-praise their own work … the builder 'knows what it meant'")

### m-02
objective: o-2
misconception: Hard numeric rules (word limits, mandatory quizzes, fixed segment counts) make agent output more reliable.
why_tempting: Rules are easy to state and easy to check, and engineers trust what a script can verify.
counter: c-05, c-11
source: skills/didactician/DESIGN.md#L332 (word gate retired after it compressed prose) and DESIGN.md#L570 (mandatory checks removed)

### m-03
objective: o-4
misconception: Interactive means engaging means effective: adding a slider or animation makes an explainer teach better.
why_tempting: Interactivity looks like active learning, and a reader who drags a slider is visibly "doing something".
counter: c-12
source: skills/didactician/references/learning-science-patterns.md#L52 and #L91 ("A widget the reader only watches is an animation; one where they set something and are surprised is a lesson.")

### m-04
objective: o-4
misconception: More content is more value, so a good explainer should fit in as much as possible, compressing prose if needed.
why_tempting: Coverage feels like thoroughness, and research produces far more true facts than a reader can use.
counter: c-11, c-07, c-08
source: model (stated by the brief's q-8; the project's own retired word gate, DESIGN.md#L332, is a documented instance of the compression variant)
