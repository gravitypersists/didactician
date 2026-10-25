status: done

summary: w-pipeline now matches the revised plan. "why" mode has three rules, the overview caption and W1 label are reworded, and "plate" no longer appears in the widget. `verify.mjs --phase page` PASSes (round 8), and `verify.mjs --widget w-pipeline` fails only on the missing `w-blocks` files (see concerns).

changes (all in /Users/m/workspace/didactician/explainers/didactician/site/widgets/w-pipeline/index.js and index.css):
- **Three rules.** The old "Scripts gate what's checkable" overlay is gone. That means the Rule 3 bar, the script hexagons, the round_gate badges and the "judged, not gated" note. Old W4 is now W3.
  - Rule 1: "The orchestrator coordinates, never authors". Orchestrator bar with dispatch arrows to Research, Plan, Build and Review. The Review label reads "fresh context: brief + page (+ facts or plan), not the builder's reasoning".
  - Rule 2: "Agents communicate only through files". The Plan dispatch arrow carries "prompt in" going down and "report out" coming back up. Every stage's file chip is lit. The sequence arrows between stages are hidden, so nothing looks like agents handing off to each other. The note reads "fixed format both ways · agents never talk to each other", followed by the example filename pair.
  - Rule 3: "You approve before anything expensive". The Approve checkpoint is lit, Build, Gate and Review are bracketed "expensive: build, gate, review", and a note says "a wrong premise caught here costs nothing downstream".
  - The "Rule n of 3" title strip and the aria-live sentences are updated for three rules.
- **Overview caption.** "Files, never chat" is replaced by "The orchestrator runs the stages and moves their files along". It wraps to two lines in the 2×4 grid and stops short of the snake's turn arrow. The step-0 aria-live sentence uses the same wording.
- **"Plate" removed.** Grepping the widget folder for "plate", "never chat" and "files, never" finds nothing. This includes the "← this diagram" line in the site/ card and the "Diagram I" wording in the title strip.
- **Specimen cards.** These were stale against the revised run files, so I refreshed them.
  - The facts.md card now shows claim c-07, as the plan says. The old c-01 card quoted "Each stage hands the next one files, never chat", which is the sentence H-21 objects to.
  - The learning-plan.md card shows the current s-04 header lines (claims c-07, c-08, c-10; mode with F-code).
  - The gate card is now `page-round-7.json`, round 7. Round 8 now exists, so this card is a snapshot, not the latest.

dispositions:
- H-17: fixed — "plate" is gone from the widget's visible text, card and code comments.
- H-21: fixed — the caption says the orchestrator runs the stages and moves their files along. Rule 2 says agents never talk to each other, and the facts card no longer says stages hand each other files.
- H-22: fixed — Rule 2 is "prompt in · report out, in a fixed format", and "what it said back" appears nowhere.
- H-23: fixed — the scripts rule is removed, so there are three rules.
- H-24: fixed — Rule 3 is stated as part of the design ("a wrong premise caught here costs nothing downstream"), with no reference to the skill's notes.
- A-01: fixed — the W1 label lists the reviewer inputs as "brief + page (+ facts or plan)". The step-7 card is page prose and belongs to the page builder.
- P-04: fixed — checked, no change needed. The card label and the status line both wrap, and neither is cut off at 360 or 1280.
- P-09: fixed — checked, no change needed. The canvas note now carries only the example filename and the new "agents never talk to each other" line. The prose steps hold the rule.
- P-08: not touched (the widget still centres its content inside the frame), and I did not re-check it this round.
- H-19, H-20 and the other H- findings: not in the widget, so they belong to the page builder. I did not touch them.

done-when checks:
- `verify.mjs --out … --phase page`: PASS, round 8, gate/page-round-8.json. Overflow, markers and console are clean at 360, 768 and 1280.
- `verify.mjs --widget w-pipeline`: FAIL, only because `site/widgets/w-blocks/index.{js,css}` return 404. This is the not-yet-built w-blocks widget and none of the failures is in w-pipeline.
- Probes at 360 and 1280:
  - A scratch copy of the page, driven by buttons, showed what-mode steps 0 to 8 and why-mode steps 0 to 3. I looked at the screenshot for each step.
  - On the real page I scrolled to each of the three why steps. `data-state` read W1, W2 and W3 as expected, and the live sentence for W3 matched. Screenshots of what step 0 and the three why steps were taken at 360 and 1280.
  - What step 0 was also checked at 740 wide: the caption fits on one line.
- The widget's own `data-step` values 1 to 3 match the page's `data-step`/`data-rule` W1 to W3. The page is already updated to match.

concerns:
- Manifest (page builder owns it). The w-pipeline entry still says "data-step 1…4 = rules W1…W4", and still says "Plate" in the mobile size line, the plate frame/title contract line and the "Plate III" line. Please change these to "1…3 = W1…W3" and "diagram". I did not edit the file.
- `verify.mjs --widget` writes screenshots and gate JSON into `run/` (`run/gate/w-pipeline-round-4.json`, `run/screenshots/w-pipeline-round-4`) and `run/screenshots/probe/`. That is the tool's own output, but the orchestrator may want to count it against its round caps.
- The gate card says round 7 while the latest page gate is now round 8. If the card must always show the latest, it needs a refresh after the final gate.
- At 360px the format-example card in step 7 and the facts.md source URL are cut with an ellipsis. This is the same truncation the other cards already use.
