# Research file formats

The researcher writes these files under `run/research/`, and `scripts/check_research.py` parses them. Keep the headings and the `key: value` lines exactly as shown. Free prose is fine *between* the entries, but the scripts ignore it.

## facts.md

```markdown
# Facts

## Questions
- q-1: answered — c-01, c-02
- q-2: unresolved — <why; what would resolve it>

## Claims

### c-01
objective: o-1
claim: <ONE assertion, ≤ 40 words, phrased at the audience's level of precision>
source: <URL | repo/path.ext:LINE | model>
quote: "<short supporting quote or code excerpt from the source>"
confidence: <high | medium | low>
note: <optional: caveat, a simplification that is safe for this audience, a conflicting source>
```

- Every question in the brief's "Research questions" appears under `## Questions`.
- One assertion per claim. "X does A and also B under C" is two claims.
- `source: model` is allowed only at depth `none`, or for a claim marked `confidence: low` that you couldn't verify. Say which applies in `note:`.
- When sources disagree, write the claim as the best-supported version, `confidence: medium` or `low`, and name the conflicting source in `note:`.

## misconceptions.md

```markdown
### m-01
objective: o-1
misconception: <what readers at this level wrongly believe, stated fairly>
why_tempting: <what makes it intuitive>
counter: c-03, c-04
source: <where the misconception is documented, or "model">
```

## examples.md

```markdown
### x-01
objective: o-2
example: <a concrete case, analogy, or dataset, with real numbers where possible>
why: <what it makes visible; for an analogy, where it breaks down>
source: <URL | path | model>
```

## assets.md

Only media that an embed would genuinely improve. A drawn figure is usually better.

```markdown
### a-01
url: <direct URL of the media, or embed URL>
kind: <image | video | iframe | audio>
source_page: <page where it's published>
license: <e.g. CC BY-SA 4.0 | public domain | YouTube standard embed | all rights reserved | unclear>
attribution: <exact text to show, e.g. "Photo: Jane Doe / Wikimedia Commons, CC BY-SA 4.0">
for: <objective or idea it serves>
clearance: <license | needs-user>
note: <why that clearance; for needs-user, the question the user must answer>
```

- `clearance: license` only when the licence clearly permits this use, given the brief's `intended_use`. For example, CC BY-NC is *not* clear for `commercial` or `unknown`.
- Everything else gets `needs-user`, including fair use, unclear licences, and "probably fine". You never decide fair use.

## parking-lot.md

One line per item: interesting material outside the objectives. The designer sees only these lines.

```markdown
- <one-liner> (<source>)
```
