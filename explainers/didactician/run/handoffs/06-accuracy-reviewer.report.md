status: done

artifacts:
- /Users/m/workspace/didactician/explainers/didactician/run/review/round-1/accuracy.md — round-1 accuracy review: 0 blocking, 2 should, 1 nit

summary: I checked every factual statement on the page against facts.md, the skill's source (SKILL.md, README.md, DESIGN.md, agents/, references/, findings.py) and the run's own files. The page text covers the prose, the step cards, the specimen cards, Plate III, Plate IV, the cut list and the run tree. I drove w-pipeline in both modes with probe.mjs and looked at the overlay screenshots. I spot-checked c-06, the medium-confidence claim (arXiv 2404.13076: GPT-4 and Llama 2), and it held up. Most claims are accurate, the learning-science claims stay within the evidence, and the excerpts quoted from run files are verbatim. Findings:
- (should, contradicted) Stage 7 and the Rule 1 overlay say both reviewers see the fact base. The pedagogy/UX reviewer gets the plan instead (SKILL.md#L183).
- (should, unsupported) Problem 3's solution credits ICAP with "a wrong guess followed by the real result is what sticks".
- (nit) "Two reviewers" and "each complex widget gets a builder" are not true for pieces of 5 minutes or less, and "anything a machine can check" overstates the gate.

concerns:
- c-06's note in facts.md cites DESIGN.md#L505 for the reviewer-split test. That row is actually about the separate designer agent, and the ledger lists reviewer independence as structural. The page's claim that the split is untested is still supported by DESIGN.md#L84-L90 (single-agent baseline) and the evaluation plan (#L533), so I raised no finding. A future reader of facts.md would follow the wrong line, though.
- In my own probe session, one scroll to the why-mode steps timed out. For those states I used the builder's existing probe screenshots (d1280-why1..4).

relaxed:
- none
