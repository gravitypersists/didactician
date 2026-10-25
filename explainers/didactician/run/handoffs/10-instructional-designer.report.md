status: done_with_concerns

artifacts:
- /Users/m/workspace/didactician/explainers/didactician/run/plan/learning-plan.md — revised plan (6 segments, widgets w-pipeline + new w-blocks, checks k-01, k-02 (reworked), k-05 (new), ac-01…ac-14 rewritten)
- /Users/m/workspace/didactician/explainers/didactician/run/plan/cut-list.md — new H-28/H-29/H-23 cuts, a new "If it runs long" order
- /Users/m/workspace/didactician/explainers/didactician/run/plan/mockup.html — reflects the revision, including the new § 5 specimen gallery

summary: **OBJECTIVE CHANGE (needs the user's confirmation before the build): o-4 is reworded per H-29.** Old: "explain how the instructional-design stage turns load into page decisions (objectives, scope in ideas, cut list, checks and widgets)". New: "recognise the building blocks Didactician composes pages from (progressive reveal, multiple choice, predict-then-reveal, think-then-reveal, step-through, contrasting cases, sandbox), say what each does for the reader's load, and know agents can go beyond them". It is checked by the new k-05, an apply item (a TCP handshake goes to a step-through, and the tempting wrong answer is a sandbox, which confronts m-03). **o-2 also changes, from four rules to three**: I dropped "scripts gate what's checkable" (H-23). The new s-05 is w-blocks: 7 working specimens that reuse the s-04 code line and the pipeline, so no new subject is introduced. The live-LLM Socratic and Feynman elements are only described, never built (I2). The estimate is about 9 min, which is over the 8-min brief and under the user's ~10 ceiling. check_plan passes. Its one warning is 4 objectives (kept per d-02).

concerns:
- facts.md has no claims for several of the s-05 blocks: progressive reveal as a block, sandbox (B2), contrasting cases as a block, and "agents may go beyond these". The c-12 note, x-02 and x-03 cover part of it, and the skill's references (learning-science-patterns §4–§9, #L115; cognitive-design-patterns B1/B2/B4; widgets.md §1) cover the rest. The options are a light researcher fill-in, or telling the accuracy reviewer to accept those reference files as sources.
- F-code is the user's own example (H-25), not one from examples.md. ac-13 names H-25 as an allowed source. "About 10 tokens" counts distinct tokens (x is repeated, and parentheses aren't counted), so the plan says "about".
- H-30: I read "not relevant to the diagram" as "the question can be answered without using the diagram". In version A of Diagram III, artifacts now sit on the nodes and the key maps number → stage name only, so the reader has to use both. This also resolves P-01. If the user meant something else, the task wording may need another pass.
- H-26 is handled by naming subagents plainly once in s-02, with no explainer, and by making k-02 compare two explicit readers.
- Rule 3 was dropped as my judgment call (H-23). The cost point (round caps bound the token spend, c-04) survives as one clause in s-06's honest limits.
- c-05, c-09 and c-11 are now unused and are listed in the cut list. A-01's reviewer-input correction is applied to the W1 label and to k-01's option B.

relaxed:
- time budget — about 9 min against the 8-min brief — w-blocks adds roughly a minute. It stays within the user's ~10 ceiling, and the cut order starts with specimens 7 and 4.

dispositions:
- H-01: fixed — s-01 intent, content_notes and ac-01 now present Didactician as a multi-agent, token-heavy pipeline built around pedagogy and human-in-the-loop review, for high-load material. It is no longer described as an input/output box.
- H-03: fixed — the s-01 orienting paragraph is now "The first half is about the pipeline process. The second half explains the pedagogical motivations."
- H-05: fixed — no wording about one-line requests in s-01, the s-06 recap or Intake. ac-01 forbids it.
- H-17: fixed — "plate" is renamed to "diagram" in the visual direction, the figure titles (Diagram I–III) and the mockup. ac-14 requires that "plate" appear nowhere on the page.
- H-21: fixed — stages are no longer agents. The orchestrator runs the stages and moves their files along (s-02 content_notes; the w-pipeline overview caption replaces "Files, never chat"). ac-02 is updated.
- H-22: fixed — W2 is now "Agents communicate only through files": a handoff prompt in and a report out, in a fixed format, and agents never talk to each other. The "what it said back" wording is banned.
- H-23: fixed (designer's call: dropped) — s-03 and w-pipeline's "why" mode now have three rules. The reason is in s-03's decision_rule3. c-05 and the W3 overlay go to the cut list.
- H-24: fixed — Rule 3 (formerly W4) is stated as part of the design: an early human check stops a wrong premise from cascading, which saves the time and tokens of later stages. It no longer cites the design notes (ac-04).
- H-25: fixed — F-chunk/x-01 is replaced by F-code (Fig. 1) with the user's wording. The figure itself, s-04 mode and ac-07 are updated.
- H-26: fixed — k-02 now asks about two explicit readers (new to agents vs. writes subagents daily), so the answer comes from the page. s-02 names subagents plainly.
- H-28: fixed (cut) — the germane note is removed from s-04 and listed in cut-list.md with the reason "user, human review H-28".
- H-29: fixed — s-05 is replaced by "The building blocks" (w-blocks, 7 working specimens, each with a load line, then a "beyond these" paragraph that describes live-LLM possibilities without building them). o-4 is reworded, and the new k-05 replaces k-04. w-plan2page, k-04, F-cut and the c-11 sentence are cut with the reason "user, human review H-29".
- H-30: fixed — in version A of Diagram III, filenames sit on the nodes and the key maps number → name only. The task is "what is the stage that writes findings.md called?", and the reader now needs both the figure and the key. The task is introduced with a sentence saying why.
