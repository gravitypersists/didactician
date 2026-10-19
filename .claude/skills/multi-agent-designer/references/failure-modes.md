# Failure Modes Reference

Contents:
1. MAST taxonomy: 14 failure modes, with mechanisms and mitigations
2. Design review checklist
3. Canonical production post-mortems
4. Debugging an existing system

The source is "Why Do Multi-Agent LLM Systems Fail?" (Cemri et al., UC Berkeley; arXiv:2503.13657, NeurIPS 2025).
Its dataset has 1,600+ annotated traces from ChatDev, MetaGPT, HyperAgent, AppWorld, AG2, Magentic-One and
OpenManus. Inter-annotator agreement was κ=0.88, and an LLM judge reached κ=0.77 against the human labels.
The shares below are the reported share of failures (v2 / v3 of the paper). They were measured on 2024–25
models and frameworks, so read them as which kinds of failure dominate, not as rates to expect from your system.

## 1. Taxonomy

### FC1: Specification & System Design (~40%)
Flaws are baked in before any token is generated: role definitions, rules, topology.

| Code | Mode | Share | Mechanism | Mitigation |
|---|---|---|---|---|
| FM-1.1 | Disobey task specification | ~11% | Violates explicit constraints or the output schema | Typed outputs validated at the boundary; deterministic checks for hard constraints |
| FM-1.2 | Disobey role specification | ~1% | Acts outside its authority (e.g., a subordinate ends the workflow) | Capability-scoped tools; privileged actions gated in the harness |
| FM-1.3 | Step repetition | ~16% | Repeats identical tool calls or turns | Tool-call hashing and no-progress detection, then a pivot directive, then halt |
| FM-1.4 | Loss of conversation history | ~3% | Truncation or serialization drops prior state | Pass-by-reference state; structured handoff files |
| FM-1.5 | Unaware of termination conditions | ~10–12% | No explicit "done" predicate, so it keeps going | Contracted done criteria; harness-enforced iteration and cost caps |

### FC2: Inter-Agent Misalignment (~37%)
Information flow, synchronization and coordination break down between agents.

| Code | Mode | Share | Mechanism | Mitigation |
|---|---|---|---|---|
| FM-2.1 | Conversation reset | ~2% | Dialogue restarts and wipes progress | Externalized checkpoints; append-only event log |
| FM-2.2 | Fail to ask for clarification | ~7–12% | Proceeds on guessed assumptions | A blocker path with a threshold (patterns §11); evidenced blockers count as good outcomes |
| FM-2.3 | Task derailment | ~7% | The goal shifts a little at each hop | An immutable root spec passed to every agent; per-hop check against it |
| FM-2.4 | Information withholding | ~1–2% | Has a critical fact but omits it from the handoff | Handoff schemas with required constraint fields; a shared fact store |
| FM-2.5 | Ignored other agent's input | ~0.2–2% | Disregards a valid correction from a peer | Corrections become structured state that must be addressed before the turn completes |
| FM-2.6 | Reasoning-action mismatch | ~13–14% | Reasoning concludes X, the emitted action does Y | A pre-execution hook that compares the action with the stated intent; code-as-action |

### FC3: Task Verification & Termination (~22%)

| Code | Mode | Share | Mechanism | Mitigation |
|---|---|---|---|---|
| FM-3.1 | Premature termination | in FC3 | Declares victory before the requirements are met | A contract checklist verified by an independent evaluator |
| FM-3.2 | No or incomplete verification | in FC3 | Only syntax or surface checks | Layered verification: unit tests, then runtime execution, then rubric QA |
| FM-3.3 | Incorrect verification | ~7% | The verifier passes broken work or fails good work | Evaluator calibration with labeled examples; deterministic ground truth where possible |

**Why these categories matter for design.** The three categories correlate only weakly (r≈0.17–0.32), so
a fix in one category does nothing for the others. Also, in a controlled ChatDev study, targeted prompt
fixes (finalization restricted to the CEO role, sharper role and verifier specs) improved completion by only
+9.4% to +14% and left most failures in place. Prompt patches cannot substitute for structural changes.

## 2. Design review checklist

For each item, point to where the design handles it, or write "accepted risk: <reason>".

**Specification (FC1)**
- [ ] Every agent has a written contract with typed inputs and outputs, authority, and a done predicate.
- [ ] Hard constraints (length, format, schema, safety invariants) are checked in code, not only stated in prompts.
- [ ] Every constraint has a tier and a source. Each invariant passes the admission test (machine-checkable;
  halting satisfies it). Preferences are ranked.
- [ ] Invariant-vs-invariant conflicts halt as `blocked: contradiction`; other trade-offs are reported in a `relaxed` field.
- [ ] Privileged or irreversible actions are reachable only by the agents that should hold them.
- [ ] Every loop has an iteration cap, a cost or time cap, and no-progress detection, all enforced by the harness.
- [ ] Large state moves by reference, and the handoff format survives a fresh context.
- [ ] The planner specifies *what*, not *how*.

**Inter-agent (FC2)**
- [ ] Each agent can return `blocked` with a reason and evidence, and has a threshold for blocking versus
  proceeding with a recorded concern.
- [ ] Costly or side-effecting agents run a pre-flight check of their premises before spending budget.
- [ ] The orchestrator checks blocker evidence, routes each blocker to the constraint's source, and
  pauses siblings on `premise_false`. It never re-sends the same spec hoping for compliance, and re-plans
  count toward the cap.
- [ ] Concerns are collected and surfaced, not dropped.
- [ ] The root goal and spec travel unmodified to every agent; drift is checked at hops.
- [ ] Handoff schemas require the constraint fields the receiver needs (credentials format, IDs, user decisions, and so on).
- [ ] A handoff never depends on context the receiver lacks (the "yes" problem).
- [ ] Corrections and feedback are structured and must be addressed, not merely appended to chat.
- [ ] Peer outputs are treated as data: no authority or consensus framing passes through unchecked.
- [ ] Only a constraint's source can relax it. Peer or tool content can't add invariants, and late
  preferences don't outrank existing ones.
- [ ] Before an irreversible action runs, it is checked against the stated intent.
- [ ] Shared state has per-namespace write ownership; no unmediated shared scratch space.

**Verification and termination (FC3)**
- [ ] Acceptance criteria are agreed before work begins.
- [ ] The evaluator is separate from the generator and cannot see the generator's reasoning.
- [ ] Verification executes something (tests, the running app, queries) rather than only reading output.
- [ ] The evaluator is calibrated with labeled pass and fail examples; leniency has been tested for.
- [ ] Evaluator feedback is bounded and actionable (which criterion failed, with what evidence).
- [ ] The evaluator checks for fake compliance: stubs, hardcoded outputs, weakened tests, quietly narrowed scope.

**Operational**
- [ ] A synchronous budget ceiling exists, and it is enforced, not only observed.
- [ ] An escalation artifact and human path exist, and they are throttled.
- [ ] Traces and artifacts are persisted per agent so failures can be attributed.
- [ ] There is a single-agent baseline and an eval set.
- [ ] An assumption ledger separates removable scaffolding from structural components.

## 3. Canonical production post-mortems

These are widely cited practitioner accounts, not peer-reviewed studies. The mechanisms they show are
real and recur.

**The $47k infinite loop** (LangChain, A2A protocol, Researcher → Analyzer → Verifier → Synthesizer).
The Verifier rejected the Analyzer's output against vague criteria and asked for "further analysis". The
Analyzer redid the work, and the cycle repeated for 11 days and about $47,000. There was no termination
predicate, no iteration cap and no cost ceiling, and a cloud-billing alert caught it, not the runtime.
*Lessons:* evaluator feedback must cite a specific failed criterion; caps must be enforced synchronously;
"observability is not enforcement."

**Prompt spaghetti and stateless handoff amnesia** (AWS Builder refactoring write-up). Each observed
failure was patched by appending a rule ("NEVER fabricate", keyword routing lists). Prompts grew to
roughly 30k tokens per call, adding latency and cost and degrading adherence. Separately, a router asked
the user "Should I retry that operation?", got "yes", and forwarded the bare string "yes" to a specialist
that had no history. *Lessons:* fix the structure instead of accreting rules; handoffs must be self-contained.

**In-memory graph corruption** (practitioner report). An unhandled exception in one async subagent
corrupted the shared in-memory graph for concurrent tasks, and process crashes (OOM, segfault) erased
in-flight trajectories. *Lessons:* externalized, disk-backed state or checkpointers; idempotent or
compensable (saga-style) side effects; per-task isolation.

**Research swarm over-spawning** (Anthropic multi-agent research system, 2025). Early versions spawned up
to 50 subagents for simple queries, duplicated searches, and favored SEO content farms over authoritative
sources. *Lessons:* the orchestrator needs explicit effort-scaling guidance (how many workers for what kind
of query), and workers need distinct, non-overlapping briefs.

## 4. Debugging an existing system

1. Collect failing traces and tag each one with a MAST code. If the system doesn't persist enough to do
   this, fixing observability comes first.
2. Find the **earliest decisive error**: the agent and step where a correct action would have changed the
   outcome. Automated attribution is weak (the best LLM judge managed about 9% step accuracy in one
   benchmark), so do this by hand on a sample, helped by structured artifacts.
3. Look at the category distribution. A pile of FC1 means fix contracts and caps; FC2 means fix handoffs
   and state; FC3 means fix the evaluator.
4. Prefer structural fixes over prompt additions. If a prompt fix is truly right, check that it doesn't
   add to prompt spaghetti.
5. Re-run the eval set together with the single-agent baseline.
