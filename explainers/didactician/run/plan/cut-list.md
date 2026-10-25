# Cut list: How Didactician teaches

Researched or available, and deliberately left out. Every item can come back; the cost is listed.

| What | Why it's out | Cost to add back |
|---|---|---|
| A precise working-memory number ("about 2–3 interacting elements", parking lot) | Not verified: Sweller et al. 2019 gives no number (c-07 note). The page says "limited" and shows it with the code example (F-code) | Needs a verified source first (researcher fill-in), then one sentence in s-04 |
| Redundancy, signalling, segmenting and worked-example effects (parking lot) | One presentation effect (split attention, c-10) is enough to make "extraneous load" predictable. Each extra effect is another new idea for readers new to learning science | Each is a paragraph plus a small contrasting figure in s-04 (~30–45 s each); worked examples could also become a w-plan2page step |
| Learning styles debunk (parking lot) | A popular misconception, but not one this audience brings to this page, and it isn't needed for any objective | A short aside in s-04 (~20 s) |
| Effect sizes (Ginns 2006) and the ICAP evidence base (parking lot) | Not verified against the originals; numbers would add precision the claims can't support | Needs a researcher fill-in, then a caption line |
| Research depth levels (none/light/standard/deep) and claim/source caps | Operational detail, useful once installed (README), not for deciding to install | One line on the Research step card in w-pipeline |
| Namespace writes, history/ snapshots, and their honest limit (prompt-level privilege, detected after the fact; parking lot) | Supports "everything is a file" but adds a mechanism. The tree in s-06 shows history/ without explaining it | One sentence and a label on F-tree |
| The planner/builder split as the weakest justification (DESIGN.md, parking lot) | s-06 already states the honest limit that matters (the reviewer split is untested); this is a maintainer's nuance | One sentence in s-06 |
| Intake questions, post-approval deltas, escalations (when else the user is asked) | o-2 needs only the plan checkpoint; the other touchpoints are rare | One line on the Intake and Checkpoint step cards |
| Installation walkthrough and preflight (Playwright download, Node/Python versions) | Out of scope per the brief: a one-line pointer only | A short "Setup" disclosure in s-06 |
| Check k-03 ("Problem 4 · Predict": what happened under the retired word-count gate) | User removed at checkpoint (d-03): crunched prose is a problem the user is still fixing, not a feature to showcase | Not to be added back without the user's say-so. ID k-03 stays retired and is not reused |
| The retired word-gate story (x-04; the history half of c-11: the I5 gate, compressed prose, retirement) | User removed at checkpoint (d-03). c-11 is still cited in s-05 for its first half only (scope sized in ideas, cut list), in one neutral sentence | User decision required; was one check plus its feedback in s-05 |
| The collapsed germane-load note in s-04 (c-09: the critique, and the 2019 redefinition) | User, human review H-28: the note couldn't be understood on its own. No objective depends on it, and ac-07 now keeps germane load off the page | Rewrite as a plain two-sentence aside ("older accounts added a third, 'good' load; its authors now say it's just freed attention aimed at the content") with a visible disclosure affordance (~20 s) |
| Old s-05: the worked example mapping this plan's s-04 entry onto the page (w-plan2page, 4 steps) | User, human review H-29: replaced by the building-blocks gallery | A low-complexity widget and ~1.5 min; would need plan vocabulary (fields, max-elements) introduced first |
| Check k-04 ("Problem 3 · Compare": slider widget, Active vs. Constructive) | User, human review H-29: went with old s-05. Its point (dragging is Active; predicting first is Constructive, c-12) now lives on the sandbox specimen in w-blocks, and k-05 confronts m-03. ID k-04 is retired, not reused | One check card (~30 s) |
| F-cut (the card with 3 real rows of this cut list) and the sentence on sizing scope in ideas with a cut list the user sees (c-11, first half) | User, human review H-29: the old o-4 named scope and the cut list; the new o-4 doesn't. c-11 is now unused | One sentence plus a small card in s-05 or s-06 (~20 s) |
| Objectives written as what the reader can do (part of old o-4) | User, human review H-29: dropped from o-4 with the segment that taught it | One sentence in s-05 |
| Rule 3, "Scripts gate what's checkable; agents judge the rest" (c-05; the W3 overlay with check_research.py, check_plan.py, verify.mjs, findings.py and round_gate badges) | Designer's call on H-23 (user leaned toward dropping it): an implementation detail for this reader. The Gate stage in s-02 and k-01's option C already show that a machine checks rendering but not truth, and the cost point (round caps bound token spend, c-04) is one clause in s-06 | Restore W3 as a fourth "why" step (~30 s) and add it back to o-2 |
| The invariant list I1–I8, verify.mjs's check list, round_gate caps arithmetic, the no-progress rule | Out of scope per the brief | A "what the gate checks" disclosure on the Gate step (~30 s) |
| Guidance continuum, 4C/ID placement, desirable difficulties, faded completion (B3) as a working specimen | Each is a framework rather than a block the reader can try in seconds; completion problems are named in one clause in s-05's "beyond" paragraph | An eighth w-blocks specimen (a code line with one step blanked, ~30 s) |
| A working live-LLM element (Socratic tutor, Feynman explain-back) | I2: pages are static with no backend. s-05 describes these as possibilities only | Not possible within I2; would need the user to relax it and a backend |
| Confronting m-02 ("hard numeric rules make agents reliable") and m-04 ("more content is more value") | Only the removed k-03 confronted them (d-03), and Rule 3 is now gone too | A think-then-reveal in s-03 that doesn't use the word-gate story (~30 s) |

Claims c-05, c-09 and c-11 are no longer used (see the rows above). Examples x-02, x-03 and x-05 are used; x-01 is replaced by the user's code example (H-25); x-04 is cut (d-03).

## If it runs long

Parts in the plan now, ranked by what to cut first. You pick; the builder doesn't cut on its own. Estimated length after this revision is about 9 minutes (over the 8-minute brief, under your ~10 ceiling): the w-blocks gallery adds about a minute over the old s-05; the germane note and Rule 3 leaving give some back.

1. **The sandbox specimen (w-blocks #7).** The reader loses the Active vs. Constructive point shown live; predict-then-reveal (#3) still makes the idea of committing first.
2. **The think-then-reveal specimen (w-blocks #4).** The reader loses the no-text-box variant; multiple choice and predict-then-reveal still show commit-then-explain.
3. **The step-through and contrasting-cases specimens (#5, #6) shrunk to one-line pointers back to Diagrams I–II and III.** The reader loses the miniature, but already used the full-size versions.
4. **F-tree in s-06** (shrink to a one-line pointer to run/log.md). The reader loses the closing proof that everything is a file; W2 in s-03 still makes the point.
5. **The live-LLM possibilities in s-05 down to one sentence.** The reader loses the concrete Socratic and Feynman examples; "agents can go beyond these" stays.

Not on the list: the w-pipeline "what" mode (o-1), k-01 and the W1–W3 overlays (o-2), F-code, Diagram III and k-02 (o-3), and w-blocks specimens #1–#3 with k-05 (o-4). Cutting any of these drops an objective or the blocks the user asked for by name (H-29).
