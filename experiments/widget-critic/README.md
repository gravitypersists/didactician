# widget-critic: pilot of the conceptual-model critic

This is a pilot of `../../WIDGET-BUILDER-HYPOTHESIS.md` (H1, narrowed to text ↔ widget fit) on one k8s-course widget. **Result: falsified.** See `results/SCORE.md`.

- `PROTOCOL.md`: the pre-registered question, inputs, targets, conditions and thresholds.
- `inputs/ch05-r0/site/`: the frozen build that the round-1 reviewers saw (k8s-course `5af333d`).
- `schema.md`, `prompts/`: what the extractor and H0 agents were given.
- `critic.mjs`: the deterministic checker (sibling asymmetry, coverage, execution, naming).
- `runs/`: raw extractor JSON and H0 reports, 3 of each.
- `results/`: critic reports per run, `FROZEN.txt` (the checker's hash before scoring), `SCORE.md`.

Re-run the critic:

```bash
node critic.mjs --site inputs/ch05-r0/site --widget w-sizing-sandbox --pointers runs/extractor-1.json --out results/critic-1
node critic.mjs --site inputs/ch05-r0/site --widget w-sizing-sandbox --pointers tests/smoke.json   # smoke test
```

`critic.mjs` is specific to `w-sizing-sandbox`'s `SizingData`/`SizingModel`. Generalising it would need each widget to expose its model the same way.
