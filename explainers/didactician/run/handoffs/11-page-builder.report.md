status: done_with_concerns

artifacts:
- /Users/m/workspace/didactician/explainers/didactician/site/index.html — rewritten per the revised plan: s-01 reframed, three rules in s-03, F-code and the reworked Diagram III and k-02 in s-04, new s-05 "The Building Blocks" with the w-blocks mount, k-05 and the "beyond" prose, s-06 updated.
- /Users/m/workspace/didactician/explainers/didactician/site/assets/treatise.css — "plate" renamed to "diagram" in classes and comments; Fig. 1 code figure; Diagram III snake layout; scroll cue; tighter first screen; rail progress fix. The Plate IV/w-plan2page CSS and the germane `.d-more` CSS are removed.
- /Users/m/workspace/didactician/explainers/didactician/site/assets/page.js — adds the Diagram III arrows, drawn with Didactician.arrow and redrawn on resize.
- /Users/m/workspace/didactician/explainers/didactician/site/assets/plan2page.js — deleted, along with its script tag, k-04 and F-cut.
- /Users/m/workspace/didactician/explainers/didactician/site/widgets/manifest.json — w-pipeline "why" is now steps 1…3 = W1…W3. All "Plate" wording is replaced with "Diagram" (0 occurrences left). New `w-blocks` entry with mount contract and sizes.

gate: `verify.mjs --phase page` passes (page-round-10). No failures. The only warning is "pending": w-blocks files and mount are not built yet. Reading time is ~9.9 min (text only), reported, not gated.

summary: Brought `site/` in line with the revised plan and the 30 H- comments. I checked the first screen, Fig. 1 and Diagram III at 1280 and 360 in screenshots. At 1280×800 the title, standfirst, § 1 line, all 8 strip stages, the step-0 card and the scroll cue now fit on the first screen (P-02).

w-blocks handoff: the mount is `<div class="d-wide blocks-mount" data-widget="w-blocks">`, empty. The page links `widgets/w-blocks/index.css` and `index.js`. It reserves min-height 1100px on desktop and 1800px on mobile; the widget builder may want to tune these. The page owns the s-05 opening, k-05 and the "beyond" paragraphs. The manifest contract also asks the widget builder to word the load-reason lines as design directives, not proven effects, because of A-02.

concerns:
- Reading time is ~9.9 min on text alone, and the w-pipeline and w-blocks text is not counted. It is over the ~9 min plan estimate and at the user's ~10 min ceiling. I did not trim. The cut-list "If it runs long" order is available.
- k-01 prompt and options: H-16 changed the prompt to "After the build step, the page is finished…". I kept the options from the earlier P-03 fix (parallel in length, A phrased as a real alternative), not the older strawman wording in the plan. The substance matches the plan. The feedback now ends "it is a hypothesis the design still has to test", with no mention of design notes. Revert the options if the user wants the plan's literal text.
- H-30 follows the designer's reading: Diagram III's filenames sit on the nodes and the key maps number to stage name only, so the reader needs both. I also added arrows and the Diagram I snake order to both panels. This also resolves P-01.
- Facts coverage for s-05: no claims in facts.md exist for the blocks. Per d-08 I relied on the skill's references and wrote the prose as design descriptions. The ICAP citation in k-05 is hedged ("authors frame as hypothesis", c-12).
- "heavy on tokens", "human reviews the page after" and "multi-agent" in the standfirst rest on the user's own wording (H-01) and the skill description. They are not claims in facts.md.
- Step 7 now says what the two reviewers check and drops the input lists. This makes A-01 moot on the page. The widget's W1 label is widget-owned.
- I used "Diag. I/II/III" for the right-hand figure number.
- The s-06 tree adds "incl. your comments" next to `review/`, because the real run folder now has `human-site-1/`.

relaxed: none

dispositions:
- H-01: fixed — the standfirst presents a multi-agent, token-heavy pipeline for hard-to-hold material, with a human reviewing the plan and the page. It is no longer an input/output box.
- H-02: fixed — the meta line reads "built with Didactician", and the standfirst ends "This page was built with it."
- H-03: fixed — § 1 now reads "The first half is about the pipeline process. The second half explains the pedagogical motivations."
- H-04: fixed — the "Scroll on…" cue is removed. A small "Scroll ↓" sits under the step-0 card.
- H-05: fixed — "one line" appears nowhere. Intake says a well-reasoned request pays off.
- H-06: fixed — "For this page it asked none" is removed.
- H-07: fixed — "The orchestrator will ask you a question only when it can't infer the answer."
- H-08: fixed — "A fresh researcher agent".
- H-09: fixed — the Research step leads with "one job: to collect the facts and sources that the rest of the pipeline is driven from."
- H-10: fixed — the sentence about the card showing the user's answer is removed.
- H-11: fixed — "…decisions that later stages must follow, and which also show up in the audit trail."
- H-12: fixed — "This is where we also build widgets. The visualization you are looking at now is one of these widgets. Each widget gets a fresh builder agent." This also settles P-10.
- H-13: fixed — "Every agent works from the approved plan and the fact base…"
- H-14: fixed — the review step stands on its own: two reviewers, fresh contexts, one for accuracy and one for teaching and UX, with what each checks.
- H-15: fixed — "each part of the pipeline".
- H-16: fixed — k-01 reads "After the build step, the page is finished…". "Page builder" is first introduced at stage 5.
- H-17: fixed — "plate" appears nowhere on the page. It is now Diagram I–III, with classes and aria-labels renamed.
- H-18: fixed — the bridge sentence now explains why Diagram II is there: it brings back the apparatus with each rule drawn on the part it protects.
- H-19: fixed — "Your main session is the orchestrator. It acts as your point of communication, and it dispatches agents, recording what they return." The same idea opens step 0.
- H-20: fixed — Rule 1's last paragraph is reworded: the reviewer is never the author, and the raw research stays with the researcher.
- H-21: fixed — stages are not agents. The orchestrator runs the stages and moves their files. Rule 2 says agents never talk to each other. The widget overview caption is widget-owned.
- H-22: fixed — Rule 2 says each agent gets a prompt file and returns a report file in a fixed structure; "what it said back" is gone.
- H-23: fixed — Rule 3 dropped. There are three rules, with steps W1–W3 and the manifest updated.
- H-24: fixed — Rule 3 is stated as part of the design (a wrong premise is the most expensive error, so check the plan early to save time and tokens), with no design-notes reference. The s-06 limits sentence and k-01's feedback also no longer cite "design notes".
- H-25: fixed — Fig. 1 is the code line with the user's two readings (ten tokens vs one schema) and the user's wording. The terms working memory and chunk come after the figure.
- H-26: fixed — "subagent" is named once, plainly, in step 0, with no explainer. k-02 now compares Reader 1 and Reader 2 as in the plan.
- H-27: fixed — the disclosure is removed with the germane note. Its affordance requirement is passed to w-blocks in the manifest contract.
- H-28: fixed — the germane note is cut, per the plan and cut list.
- H-29: fixed — s-05 is replaced by "The Building Blocks": the w-blocks mount, k-05, completion problems named in one clause, and live-LLM Socratic and Feynman-style elements described as possibilities with the static-page reason. w-plan2page, k-04, F-cut and plan2page.js are removed.
- H-30: fixed — the question is now "what is the stage that writes findings.md called?", introduced as "Here is extraneous load you can feel". Both versions are needed, and arrows are added (see concerns).
- A-01: fixed on the page — step 7 no longer lists reviewer inputs, and k-01's option B is accurate. The W1 label is widget-owned.
- A-02: n/a — k-04 was removed. k-05 places ICAP after the Constructive sentence and hedges it.
- A-03: n/a — optional nit; the claims are true for this page's 8-minute run.
- P-01: fixed — see H-30.
- P-02: fixed — first screen at 1280×800 shows the title, standfirst, § 1, the full 8-stage strip, the step-0 card and the scroll cue (title and standfirst tightened).
- P-03: fixed — k-01 options kept parallel (see concerns).
- P-04: n/a: widget-owned
- P-05: n/a — w-plan2page removed.
- P-06: n/a — w-plan2page removed.
- P-07: fixed — the rail progress label is no longer clipped ("00%" now fully visible).
- P-08: n/a: widget-owned
- P-09: n/a: widget-owned
- P-10: fixed — see H-12.
