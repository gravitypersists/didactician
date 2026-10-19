# <System Name>: Multi-Agent Design

## Recommendation
One paragraph: the architecture chosen, where it sits on the complexity ladder, and why. If the answer is
"single agent" or "prompt chain", say so here and keep the rest short.

## Context
- **Task and trigger:**
- **Definition of done (system-level):**
- **Cost of failure:** (wrong output, money, irreversible side effects, user trust)
- **Substrate:** (Claude Code skill/plugin, Agent SDK, API program, framework)
- **Assumptions made without asking:**

## Why multi-agent (step 1)
- Which justification applies (context isolation, independent verification, privilege boundary,
  parallelism, cost tiering) and the evidence for it.
- What the single-agent baseline would be, and what it is expected to get wrong.
- Expected token or cost multiple, and why it's worth paying.

## Topology (step 2)
A diagram (ASCII or mermaid) of agents, artifacts, and the gates between stages. For each stage: who
runs, what it consumes, what it emits, and what gates the next stage.

Where fan-out happens, say how the premise is validated before fanning out.

## Agents (step 3)
One contract per agent (`agent-contract.md`), inline or linked.

## State and handoffs (step 4)
- Artifact store location and naming.
- Namespace ownership (who writes where).
- Handoff formats and their required fields.
- Persistence and resume strategy; idempotency of side effects.

## Termination and budgets (step 5)
| Loop | Done predicate | Max rounds | No-progress rule | Cost/time cap | Enforced by |
|---|---|---|---|---|---|

## Verification (step 6)
- Acceptance criteria, and when and how they are agreed.
- Evaluator independence (what it can and cannot see).
- What is executed to verify, and which checks are deterministic.
- Calibration examples and how leniency is tested.
- Rubric weights and the reasoning behind them.

## Constraints and conflicts (step 7)
System-wide constraint ledger. Per-agent tables in each contract inherit from it.

| ID | Constraint | Tier | Source | Enforced / scored by | Agents bound | Why |
|---|---|---|---|---|---|---|

- Invariants that failed the admission test, and what each became instead.
- The precedence among preferences, and who can relax what.
- The conflict/clarification path.
- How peer and tool output is sanitized and treated as data.
- Prompt-injection exposure and the privilege limits that contain it.

## Runtime resilience (step 8)
Retry layer, failure classes, breakers, credential handling — or, for Claude Code, the caps and hooks used.

## Blocker handling (steps 3, 7)
- Per agent: its pre-flight check, and the premises most likely to be false.
- Routing table: blocker reason and affected constraint source → who decides.
- Containment: which workers share premises, and so need pausing on `premise_false`.
- How concerns are collected and surfaced.
- Re-plan cap.

## Escalation (step 9)
Escalation triggers, the artifact contents, the decision options, and the throttling.

## Assumption ledger (step 10)
| Component | Assumes the model can't… | Evidence | Removal test | Status |
|---|---|---|---|---|

**Structural (keep regardless of model):** list them.

## Evaluation plan (step 11)
- The task set: size, sources, and should and should-not cases.
- The baseline configuration.
- Metrics: quality, tokens, cost, wall-clock.
- Trace persistence and MAST tagging.

## Failure-mode review (step 12)
| MAST code | Mitigation (section ref) or accepted risk + reason |
|---|---|
| FM-1.1 | |
| FM-1.2 | |
| FM-1.3 | |
| FM-1.4 | |
| FM-1.5 | |
| FM-2.1 | |
| FM-2.2 | |
| FM-2.3 | |
| FM-2.4 | |
| FM-2.5 | |
| FM-2.6 | |
| FM-3.1 | |
| FM-3.2 | |
| FM-3.3 | |

## Open questions
