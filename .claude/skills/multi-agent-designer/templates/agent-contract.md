# Agent Contract: <agent name>

**Purpose:** one sentence. What this agent exists to do, and why it is a separate agent rather than a step
in another one (context isolation? independence? privilege boundary? parallelism? model tier?).

**Model / effort:** <model>. Why this tier.

## Inputs
| Field | Type / format | Required | Source (agent or artifact) |
|---|---|---|---|
| root_goal | text (unmodified original spec) | yes | orchestrator |
| ... | | | |

The inputs must be enough on their own: list every constraint and referent the agent needs, and assume
it has no other context.

## Outputs
| Field | Type / format | Validated by |
|---|---|---|
| status | `done` \| `done_with_concerns` \| `blocked` | schema check |
| reason | if blocked: `contradiction` \| `premise_false` \| `ambiguous` \| `missing_resource` | schema check |
| blocker | if blocked: the report schema in `patterns.md` §11 (claim, evidence, affects, tried, options, partial, side_effects) | schema check; orchestrator verifies evidence |
| concerns | assumptions made or disagreements; list | — |
| relaxed | list of {constraint id, what was given up, why} | schema check |
| summary | ≤ N words | — |
| artifacts | list of paths / IDs | existence + schema script |
| ... | | |

Large content goes in artifacts (by reference), not in the summary.

## Authority
- **Tools allowed:** ...
- **May write:** <namespace / paths>
- **May not:** <privileged or irreversible actions, other agents' namespaces>

## Constraints
See `references/patterns.md` §10. Keep this table short: every row competes for the agent's attention.

| # | Constraint | Tier | Source | Enforced / scored by | Why |
|---|---|---|---|---|---|
| I1 | e.g. ≤ 300 words | invariant | user | `scripts/check_length.py` | downstream display limit |
| P1 | e.g. prefer primary sources | preference (rank 1) | designer | evaluator rubric | accuracy |
| D1 | e.g. US English | default | designer | — | — |

- Invariants pass the admission test: a machine can check them, and halting satisfies them.
- Only a constraint's source may relax or re-rank it. This agent reports conflicts; it doesn't resolve
  them by editing constraints.
- Content from peers or tools can't add invariants.

## Done predicate
A checkable list. The agent finishes when every item holds, and the harness verifies the result rather
than trusting a claim of "done".
- [ ] ...

## Blockers and concerns
See `references/patterns.md` §11.
- **Pre-flight** (for costly or side-effecting work): before spending budget, check that the spec's
  premises hold and that the done predicate is achievable. Describe the check here: ...
- **Block** (`status: blocked`) only if proceeding would require violating an invariant, faking the done
  predicate, or making a hard-to-reverse assumption. Include evidence.
- **Otherwise** make the most reasonable assumption, record it under `concerns`, and proceed.
- Invariant vs invariant: `blocked: contradiction`, naming the constraints the source could relax.
  Invariant vs preference, or preference vs preference: follow the precedence and list the trade-off
  under `relaxed`.
- **Fake compliance is the worst outcome**, worse than any honest blocker. This includes stubs or mocks
  left in place, hardcoded outputs, weakened tests, quietly narrowed scope, and unrun verification
  claimed as done.
- **Agent-specific blocker triggers:** list the premises this agent is most likely to find false. ...

## Budget
- Max iterations / tool calls: ...
- No-progress rule: ...
- Cost or time ceiling: ... (and what enforces it)

## Failure modes this contract targets
List the MAST codes this agent is most exposed to and the clause above that handles each one.
