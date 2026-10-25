status: done_with_concerns

artifacts:
- /Users/m/workspace/didactician/explainers/didactician/site/widgets/w-blocks/index.js: seven specimens, vanilla JS and SVG, no libraries
- /Users/m/workspace/didactician/explainers/didactician/site/widgets/w-blocks/index.css: all rules scoped to [data-widget="w-blocks"], tokens only

summary: Built the seven specimens inside the existing mount. Each is a card with a small-caps head, the working example, and a "Directive." line under it. The directive lines are worded as what the skill's references tell the designer to do, not as proven effects. Specimen 7 names ICAP as a hypothesis its authors framed (A-02). Every disclosure is a bordered button with a turning caret and a "Show…/Hide…" label (H-27). Feedback is in place in aria-live regions. Examples use only the § 4 line or the pipeline. Layout is one column below 800px of container width, otherwise two columns with specimen 7 spanning both. verify.mjs --widget w-blocks passes at 360/768/1280 (rounds 1–3). The one earlier legibility warning (chart text 10px at 360) is fixed.

concerns:
- The page's reserved heights are too small. Measured mount heights: 1908px at 1280 (page reserves 1100), 2982px at 768 and 3565px at 360 (page reserves 1800 for under 900px). Please set min-height to about 1900px for 900px and wider and about 3600px below 900px. The mobile card heights are about 8 × 450px, not the 7 × 300px the manifest assumed. At 360, specimens 6 and 7 are the tall ones, about 900 and 1090px once their feedback is open. As built, the section grows when the widget loads, so the page will jump once on load. The numbers need updating in the manifest `size` too.
- Specimen 6 uses invented, labelled-illustrative data (Series P and Q over Jan–Apr). The plan didn't specify the data, and using real skill numbers would have created unsourced claims.
- Specimen 7 locks the slider until the reader commits a prediction (t = 1–5 chips), and "Check my prediction" enables only after the slider has also moved. That makes the gate real. It departs from the plan's "slider available, Check after drag" by also locking the slider.
- Specimen 2's wrong-answer text for the brief and the page ("reviewers do get the brief"; "the page is what they review") rests on c-03 plus the plan's wording "brief + page (+ facts or plan)". Specimen 4's model answer cites c-06 (GPT-4 and Llama 2) and says the reviewer split is untested.
- Specimens 1 and 4 leave blank space inside their card before the directive when closed, because grid rows stretch to match the tallest neighbour. The opened panel fills that space on desktop.
- The directive lines say "Diagrams I and II" and "Diagram III are the full-size version"; the page does use those names.

relaxed:
- Cards ≤ 360px tall on mobile — dropped — specimens 3, 5, 6 and 7 are about 780–1090px with feedback open, because the charts and the stacked sandbox won't fit in less.

dispositions:
- H-29: fixed — § 5 is now seven working building-block specimens: progressive reveal, multiple choice, predict-then-reveal, think-then-reveal, step-through, contrasting cases, and sandbox with prediction first. The page builder's "beyond these" paragraph, not this widget, carries the point that agents can explore other approaches such as Socratic or Feynman-style live-LLM elements. Nothing in the widget calls a model.
- H-27: fixed — every disclosure is a bordered, underlined button with a ▸/▾ caret and a verb label, and nothing is hover-only.

Libraries: none, so nothing to add to the manifest `cdn`.

Acceptance checks (probe.mjs, run at 1280 and 360 with identical results; screenshots read at both widths):
- ac-08, all seven specimens work:
  - 1: aria-expanded went false→true and the panel text appeared.
  - 2: clicking A gave "Not quite…The answer is C: the report carries the builder's reasoning…".
  - 3: `.wb-reveal` count was 0 before the click. Choosing 8 gave the 8 explanation, the keep/drop row (−1 and 0 dropped) and 3 + 4 = 7.
  - 4: the model answer appeared on click.
  - 5: counter "Step 1 of 3" through "Step 3 of 3"; work row 3 + 4 = 7, then total = 7.
  - 6: choosing Q gave feedback and a March marker with 7 and 6 on both charts.
  - 7: slider disabled before the prediction and enabled after; t=2 gave total 7 and t=3 gave total 4 (matches the facts); Check gave "Correct. … t = 3, total = 4".
- ac-09: controls are native buttons or a native range input, with 44px targets and a 44px slider thumb. At 360 the cards stack in one column and the gate's overflow check passes at 360, 768 and 1280. I did not test keyboard operation (Tab, Enter, arrow keys) with a probe.
