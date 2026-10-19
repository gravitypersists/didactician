# Review file format

Reviewers write `run/review/round-N/<accuracy|pedagogy-ux>.md` in this format. `scripts/findings.py` parses it.

```markdown
# <Accuracy | Pedagogy & UX> review: round N

## Summary
<≤ 120 words: overall judgment and the most important issue>

## Scores                       <!-- pedagogy-ux only: one line per rubric criterion -->
- <criterion>: <1–5> — <one-line reason>

## Findings

### new                         <!-- "new" for a new finding; the existing ID (P-03) in closure rounds -->
severity: <blocking | should | nit>
criterion: <rubric criterion or acceptance-criterion ID (ac-NN) or invariant>
location: <segment s-NN / widget w-id / CSS selector / screenshot path>
evidence: <what you observed: quote the text, describe the screenshot, give the probe step>
expected_fix: <what would resolve it, specific enough to act on>
verdict: <accuracy only: unsupported | contradicted | misleading-simplification | ok-but-uncited>
status: <closure rounds only: closed | still-open | dispute-upheld>
```

**Severity:**

- `blocking`: the piece teaches something false, fails an acceptance criterion, or a reader in the target audience would likely fail to get an objective.
- `should`: a clear improvement at a reasonable cost.
- `nit`: polish.

**Bounded:** every finding names a criterion, evidence, a location and an expected fix. "Could be more engaging" or "needs more depth" isn't a finding.
