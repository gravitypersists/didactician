# Report format (every agent's final message)

Your final message is the only thing that returns to the orchestrator, so it must follow this format. Put the status block first. Large content goes in your artifact files. Don't paste it here.

```
status: done | done_with_concerns | blocked
reason: <only if blocked: contradiction | premise_false | ambiguous | missing_resource>

artifacts:
- <abs path> — <one line>

summary: <≤ 120 words: what you did and the key choices, with their reasons>

concerns:
- <assumption you made, or disagreement, and why> (or "none")

relaxed:
- <constraint id or preference> — <what was given up> — <why> (or "none")

dispositions:            # revision rounds only: one line per finding ID you were given
- <ID>: fixed — <what changed, where>
- <ID>: disputed — <evidence it is not a problem / the fix would break X>
- <ID>: blocked — <why>
```

## When blocked

Block only when proceeding would require one of these:

1. violating an invariant;
2. faking the done predicate;
3. making a hard-to-reverse assumption that later work would build on.

For anything else, make the most reasonable assumption, list it under `concerns`, and finish. A blocker without evidence is a concern.

```
status: blocked
reason: premise_false | contradiction | ambiguous | missing_resource
claim: <one sentence: what can't be done as specified>
evidence: <reproducible: quote + source, failing command output, measurement, counterexample>
affects: <invariant / brief field / plan segment IDs> (source: user | designer | brief)
tried: <what you attempted>
options:
- <option 1, incl. which constraint the source could relax>
- <option 2>
partial: <paths of usable partial work>
side_effects: <clean | what you changed that needs cleanup>
```

## Fake compliance is the worst outcome

It is worse than any honest blocker. Never report `done` with any of these:

- placeholders, stubs or lorem ipsum left in;
- a "widget" that is a static image;
- a check with no feedback;
- verification you didn't actually run;
- scope quietly narrowed;
- content added beyond your spec;
- a finding marked `fixed` that is still visible.
