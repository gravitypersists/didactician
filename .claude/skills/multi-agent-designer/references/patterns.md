# Patterns Reference

Contents:
1. Complexity ladder
2. SOP pipelines and the publish/subscribe artifact pool (MetaGPT)
3. Planner → Generator ⇄ Evaluator with sprint contracts (Anthropic harness)
4. Typed handoffs and schema-aligned parsing (BAML)
5. Pass-by-reference state (NOOA and file-based variants)
6. Reference monitor, namespaces, and credential vaulting
7. Runtime: failure-class routing and circuit breakers
8. Human-in-the-loop escalation and backpressure
9. Agent-computer interface (tool design)
10. Constraint tiers and precedence
11. Blocker protocol (leaf pushback)

Each pattern is labeled **[structural]** (it holds regardless of model strength) or
**[capability-bound]** (it compensates for a model limitation, so re-test it on current models).

---

## 1. Complexity ladder [structural]

From Anthropic's "Building Effective Agents": move up a rung only when evals show the rung below falls short.

1. A single augmented LLM call (retrieval, tools, memory)
2. Prompt chaining: fixed sequential steps, with programmatic gates between them
3. Routing: classify, then dispatch (also useful for model tiering: cheap model for routine work, strong for hard)
4. Parallelization:
   - *sectioning*: independent subtasks, or a guardrail running alongside the main response
   - *voting*: several attempts, then aggregate
5. Orchestrator-workers: dynamic decomposition, where the orchestrator decides the subtasks at runtime
6. Evaluator-optimizer: a generate → critique → revise loop
7. Autonomous agents: open-ended loops with tools

Token economics, from Anthropic's 2025 multi-agent research system: one agent uses about 4× the tokens of
chat, and a multi-agent system about 15×. In browsing evals, token usage alone explained about 80% of the
variance in performance, so part of multi-agent's gain is simply spending more tokens. Check whether a
single agent with a bigger budget closes the gap.

## 2. SOP pipelines and the artifact pool [structural]

MetaGPT (Hong et al., ICLR 2024) encodes a standard operating procedure: *Code = SOP(Team)*. Each stage is
dependency-gated:

PM → **PRD** → Architect (blocked until the PRD exists) → **interfaces, sequence diagrams, file list** →
Project manager → **tasks** → Engineer (implements, runs the code, reads tracebacks, bounded retries) →
QA (tests traced back to the PRD).

Agents publish typed documents to a shared pool and **subscribe only to the artifact types their role
consumes**. This removes N² routing chatter and keeps each context clean.

*How to apply:* name every intermediate deliverable, state which agent produces it and which consume it,
and gate each stage on its inputs existing and validating. A file directory with a naming convention works
as the "pool" in a Claude Code skill.

## 3. Planner → Generator ⇄ Evaluator, with sprint contracts

Source: Anthropic, "Harness design for long-running application development" (Rajasekaran, 2026).

- **Planner [structural]:** expands a 1–4 sentence prompt into an ambitious product spec of 10–20 features.
  It covers *what* to deliver plus high-level design, and avoids granular technical detail so that
  upstream mistakes don't cascade. In the newest version, removing the planner made the generator
  under-scope the work, so the planner stays.
- **Contract negotiation [structural idea; granularity capability-bound]:** before building, the generator
  proposes what it will deliver and how each item will be verified. The evaluator critiques the proposal
  and they iterate until they agree. One sprint's contract had 27 criteria. The two communicate through
  files.
- **Generator:** builds, uses git, and self-checks before handing off.
- **Evaluator [structural, but test whether it's still needed per task]:** has no access to the generator's
  reasoning. It drives the *running* app through Playwright MCP (UI, API endpoints, database state). Each
  criterion has a hard threshold, and any miss fails the round with specific feedback. The loop ran 5–15
  rounds.
- **Evaluator calibration [structural]:** out of the box the evaluator found real bugs and then excused
  them, and it tested superficially. The fix was to read its logs, find where its judgment diverged from
  the human's, and revise its prompt; add few-shot examples with detailed score breakdowns.
- **Rubric as a loss function [structural]:** the four criteria were design quality, originality, craft and
  functionality. The first two were weighted up because the model already does craft and functionality
  well, and the up-weighting pushed it away from template-like output.

**How it evolved, which is the main lesson:**
- *Sonnet 4.5 era:* "context anxiety" (wrapping up early as the context fills) meant hard **context resets**
  between sprints, with structured handoff files [capability-bound].
- *Opus 4.5:* context anxiety was largely gone. Resets were removed and SDK compaction was enough.
- *Opus 4.6:* the **sprint construct was removed**. The generator built continuously for 2+ hours, and the
  evaluator moved from per-sprint grading to **one pass at the end**. The planner and evaluator stayed.
  A complete DAW app took about 3h50m and cost $124.70.
- *Method:* a radical cut was tried first; it underperformed and made it impossible to tell which parts
  were load-bearing. Removing **one component at a time** worked.
- *Cost reference (Opus 4.5):* a solo agent took 20 min and $9, and the core feature was broken. The full
  harness took 6 h and $200 and produced a working, richer app. The harness is worth it only when the task
  exceeds what one agent does reliably.

## 4. Typed handoffs and schema-aligned parsing [structural]

The problem: free-text handoffs drop constraints (FM-2.4) and violate schemas (FM-1.1). Strict
grammar-constrained JSON generation fixes syntax, but it can reduce reasoning quality, adds verbose schema
text to the prompt, and still lets semantically wrong values through.

BAML's approach treats each LLM call as a typed function `Name(input: T) -> R`. The model reasons freely in
prose, then a fault-tolerant parser repairs and coerces the output to the target type: it strips preamble,
fixes quoting, and turns "five" into 5. There are no `any` types or unchecked casts, so invalid states fail
at the boundary. Compact type notation also uses fewer prompt tokens than JSON Schema. Vendor-reported
numbers include 50–89% fewer schema tokens and, in one GraphRAG deployment, 25% → 99.4% end-to-end success.
Treat these as illustrative.

*How to apply, whatever the tooling:*
- Define every handoff as a type or schema with **required** fields for the constraints the receiver needs.
- Let the agent think first, then emit the structured block; parse and validate it in code; on failure,
  re-ask with the specific validation error.
- Native structured-output features on current models are much better than the grammar-masking the
  research critiques. The "constrained decoding hurts reasoning" result is [capability-bound], so re-test
  before designing around it. The validate-at-the-boundary principle is structural.

## 5. Pass-by-reference state [structural]

The problem: pass-by-value. N workers return large payloads that get serialized into the orchestrator's
history, bloating cost, diluting attention, and eventually causing truncation (FM-1.4).

- **NOOA** (NVIDIA Labs, 2026; arXiv:2607.20709): agents are Python classes. Fields are state, docstrings
  are prompts, methods are actions, and type annotations are contracts enforced at runtime. A method body
  of `...` is filled in by the LLM loop at runtime; normal method bodies run as deterministic Python. The
  model manipulates **live objects in a REPL by reference**, seeing only bounded previews (type, length,
  head and tail). Reported results are strong on SWE-bench Verified at roughly half the tokens of
  comparable harnesses, with no compaction needed. These are secondary reports; verify before quoting.
- **File-based variant** (works anywhere, including Claude Code): workers write full results to files and
  return a short summary plus the path. The orchestrator reads a file only when it needs to.

## 6. Reference monitor, namespaces, credential vaulting [structural]

Hazards of shared writable state:
- **State clobbering:** one agent overwrites another's work.
- **Covert coordination:** in documented incidents, agents turned a writable shared store into an
  unsanctioned channel to get around restrictions (Lampson's confinement problem).
- **Lateral prompt injection:** injected content in retrieved documents spreads through shared boards.

The design response follows Saltzer and Schroeder: complete mediation, fail-safe defaults, least privilege.
- All inter-agent reads and writes go through one small, deterministic mediator that validates schema and
  access-control lists. Content filtering is the weakest guard; structure and access control come first.
- Namespaces have owners. For example, the planner writes `spec/`, the executor writes `work/`, and the
  verifier writes `verdicts/`. No agent writes to another's namespace.
- **Credential vaulting:** secrets and PII are swapped for opaque tokens at ingress, and deterministic code
  performs the sensitive operation outside the LLM's context. Compliance then comes from the architecture,
  not from a "never reveal" instruction.

## 7. Runtime: failure-class routing and circuit breakers [structural]

LLM calls are stateful, non-idempotent and billed per input token, so the retry habits of microservices
backfire.

**Anti-patterns:**
- A blanket exponential-backoff decorator stacked on SDK retries. Load multiplies (3 SDK × 5 graph = 15×),
  and terminal errors get billed again and again.
- Ignoring `Retry-After`.
- Backoff without jitter, which makes the fleet retry in lockstep and creates a metastable trap.

**Failure-class routing:** set `max_retries=0` on the SDK, keep a single retry layer, and use a custom
exception hierarchy that carries trace IDs.

| Class | Triggers | Policy | Breaker | Fallback |
|---|---|---|---|---|
| Terminal | 400 (incl. context length exceeded), 401, 403, refusal, schema error | No retry | Doesn't trip | Context length → trim or reset; schema error → local repair or parse |
| Pacing | 429 | Sleep exactly as `Retry-After` asks, within the deadline | Only if sustained past the deadline | Spill over to another tier or region |
| Systemic | 500/502/503/504/529, timeouts | Full-jitter backoff bounded by a deadline (not an attempt count) | Counts toward OPEN, per provider | Return a partial or cached result |
| Cognitive | Repeated tool-call hash, drift, no progress, budget exhausted | Halt this trajectory | Cognitive breaker → REFLECTING or OPEN | Pivot directive, or checkpoint and escalate |

**Infrastructure breaker** (per provider). A 3-state breaker can flap: it probes, succeeds during a lull,
then the swarm returns and collapses the provider again. Production variants add extended-cooldown states
(CLOSED → OPEN → HALF_OPEN → OPEN_EXTENDED → HALF_OPEN_EXTENDED) and **ramp concurrency back gradually**
after recovery. Example defaults: trip after 3–5 failures in 5 minutes, a 5-minute cooldown, then
15 minutes extended. Tune these.

**Cognitive breaker** (per agent loop). States run CLOSED → REFLECTING → HALF_OPEN → OPEN.
- Detection: a hash of tool name plus arguments over a sliding window catches exact repeats; observation
  novelty and thought novelty catch near-repeats (for example, paging through empty results).
- On detection, inject a pivot directive: "You've called X 3 times with no new information; change
  strategy." If the agent pivots, reset; if it keeps looping, open the breaker, checkpoint, and write an
  audit report.
- Gate the breaker on validated payloads rather than the model's self-reported confidence, or it flaps.
- Also enforce a hard cost ceiling per run, counting reasoning tokens, that blocks the call that would
  exceed it.
- Framework built-ins such as LangGraph's `recursion_limit` (default 25, raises `GraphRecursionError`) are
  last-resort crash guards, not designed exits. LongGuard (PyPI) is one off-the-shelf cognitive breaker
  for LangGraph.

## 8. HITL escalation and backpressure [structural]

Human review is a **staffing and backpressure problem**: agents produce escalations far faster than people
can clear them.

- **Escalation artifact:** the active agents' role cards, the exact contract item or invariant that failed,
  a diff or summary of what was attempted, and a constrained decision (approve / reject / pick option A, B
  or C). The model proposes and the person disposes.
- **Adaptive backpressure:** pause upstream intake when the verifier or human queues pass a threshold.
- In interactive tools like Claude Code, "escalate" usually means stopping and asking the user a crisp
  question with options. Batch questions rather than drip-feeding them.

## 9. Agent-computer interface [structural]

Design tools with the same care as a human UI:
- Write docstrings of the quality you'd give a junior developer, with examples and boundary cases.
- Remove formatting overhead, such as making the model count lines or escape large blocks of code.
- Mistake-proof parameters so that ambiguous calls are rejected by the schema.
- Test tool triggering in both directions: when it should fire, and when it shouldn't.

## 10. Constraint tiers and precedence [structural]

This pattern is a synthesis. No study tests hard/soft tiers in multi-agent contracts directly. The design
below combines instruction-hierarchy benchmarks, instruction-density studies, runtime-enforcement and
solver-backed planning results, classical constraint hierarchies, and Anthropic's constitution.
`evidence.md` §Constraint precedence lists the sources.

### Tiers

| Tier | Meaning | Enforced by | On conflict |
|---|---|---|---|
| **Invariant** | Violating it makes the output invalid | Something outside the agent: validator script, hook, tool permission, schema | Halt with `blocked: contradiction` and list the constraints the source could relax |
| **Preference** | Ranked (or weighted); trade-offs allowed | Evaluator rubric that scores the *degree* of satisfaction | Follow the ranking; record what was given up and why |
| **Default** | Assumed unless an upstream instruction says otherwise | Nothing | Overridden silently |

**Admission test for invariants.** A constraint is an invariant only if both of these hold:
1. **Checkable:** code or a dedicated deterministic check can say pass or fail. "Professional tone" isn't
   checkable; "≤ 300 words" and "no writes outside `work/`" are.
2. **Satisfiable by stopping:** halting and reporting never violates it. This guarantees an agent always
   has a compliant move, the same way refusal is always compatible with the hard constraints in Claude's
   constitution. A "must deliver X" requirement fails this test; it belongs in the done predicate, with a
   cap on attempts.

If something feels hard but fails the test, either make it checkable (add a validator or narrow the
wording) or make it the top-ranked preference. Expect the list of invariants to stay short. Everything
that fails the test goes into the preference list.

### Precedence rules

- **Strict ordering between tiers.** This follows Borning's constraint hierarchies: no number of satisfied
  preferences compensates for one violated invariant. Comparisons happen tier by tier, never summed across
  tiers.
- **Explicit order within a tier.** Preferences carry a rank, or a weight if you need graded trade-offs
  (weighted MaxSAT is the formal version). An unranked preference list leaves the model to choose, and
  its choice will be driven by bias toward particular constraint types, not by your priorities.
- **Invariant vs invariant means infeasible.** Don't pick one. Halt and report, the way an SMT-backed
  planner returns "unsatisfiable" and suggests which requirements to relax.
- **Report every trade-off.** Models rarely acknowledge conflicts unless asked and usually drop one
  constraint silently, so the output schema should have a field for which constraints were relaxed and why.

### Provenance and authority

Record a **source** with every constraint: the user, the designer, or the agent that introduced it.
- **Only the source can relax or re-rank a constraint.** A downstream agent that thinks a constraint is
  wrong reports a conflict; it doesn't edit the constraint.
- **Peer outputs and tool results never create invariants or outrank existing preferences.** This closes
  two holes: worker consensus overriding the orchestrator (consensus framing moves models more than
  system/user roles do) and prompt injection arriving as "new requirements".
- **Late-arriving preferences don't jump the queue.** Models tend to let a newly introduced lower-priority
  preference override existing constraints. A preference added mid-run takes the rank its source assigns,
  or the bottom by default.

### Propagation and verification

- **Handoffs:** invariants are copied verbatim (they are the required constraint fields that prevent
  FM-2.4). Preferences may be summarized, but keep their ranks.
- **Gate, then score:** a deterministic invariant gate runs first, and output that fails it never reaches
  the evaluator. The evaluator then scores preferences, and should judge how well each was met, not just
  whether it was met. Otherwise agents settle for the first feasible answer.
- **Prompts still state the tiers.** Labels don't enforce anything, but they tell the model what matters,
  which improves its judgment on preferences. Give the reason for each invariant, because unexplained
  rules generalize poorly.

### Budget

Each constraint competes for the model's attention. Adherence degrades as instruction count rises, and
earlier instructions are favored. Real agent prompts average about 12 constraints, and models struggle
most with conditional and tool-related ones. Keep the per-agent list short, put invariants first, and move
anything an external check enforces out of the prompt body into a one-line mention (for example,
"output is validated against `schemas/report.json`").

## 11. Blocker protocol: leaf pushback [structural; the threshold is capability-bound]

The analogy is an engineering team. A developer handed a spec that violates physics raises a blocker
instead of shipping something broken. In agent systems that doesn't happen by default:
- Given coding tasks whose tests contradict the spec, frontier agents cheat to pass 39–76% of the time
  (ImpossibleBench).
- Reasoning fine-tuning *reduces* abstention on false-premise and unanswerable questions (AbstentionBench).
- Even Anthropic's harness shipped a stubbed feature labelled done, which only QA caught.

So the leaf agent needs a protocol, and the orchestrator needs rules for what to do when a blocker arrives.

### Outcomes

| Status | Meaning | Org analogy |
|---|---|---|
| `done` | The done predicate is met for real | Shipped |
| `done_with_concerns` | Done, but the agent made assumptions or disagrees with something; listed under `concerns` | Disagree and commit |
| `blocked` | Can't proceed honestly; carries a `reason` | Pulling the andon cord |

The `reason` values are machine-readable, because routing depends on them:
- `contradiction`: the spec conflicts with itself (for example, invariant vs invariant; see §10).
- `premise_false`: the spec conflicts with reality, such as an API that doesn't exist, data that says
  otherwise, or a target that is physically or computationally out of reach.
- `ambiguous`: there are several readings, and choosing wrong would be costly or hard to undo.
- `missing_resource`: access, a tool, a permission, or budget is missing.

### When to block

Block only when proceeding would require one of:
1. violating an invariant,
2. faking the done predicate, or
3. making an assumption that is hard to reverse (a one-way door: irreversible side effects, a choice many
   later steps will build on).

Everything else is a two-way door: make the most reasonable assumption, record it under `concerns`, and
proceed. This threshold matters in both directions. Without a blocker path, agents fake compliance.
Without a threshold, current models (which follow instructions literally) escalate trivia and swamp the
orchestrator or human. Re-tune the threshold when the model changes.

### What counts as fake compliance

Fake compliance is the worst outcome, worse than any honest blocker. Name these in the leaf's prompt and
have the evaluator look for them:
- stubs, mocks or placeholder data left in delivered work
- hardcoded or special-cased outputs that make checks pass
- tests weakened, skipped or deleted, or checks edited
- scope quietly narrowed ("implemented the easy 80%") while reporting `done`
- claims of verification that wasn't run

### Blocker report schema

```
status: blocked
reason: premise_false | contradiction | ambiguous | missing_resource
claim: one sentence — what can't be done as specified
evidence: reproducible — error output, doc quote, failed probe, counterexample
affects: [constraint/premise IDs] and their sources
tried: what was attempted
options: 2–3 ways to unblock (incl. which constraint the source could relax, or a revised premise)
partial: artifact paths of usable partial work
side_effects: state of anything changed (clean / rolled back / needs cleanup)
```

A blocker with no evidence is a hunch and goes under `concerns`. The specificity requirement also keeps
pushback from becoming its own loop: vague upward feedback is the same failure as the "$47k further
analysis" loop, running in the other direction.

### Pre-flight check: object early

Anthropic's constitution asks Claude to raise concerns before starting a task rather than abandoning it
halfway, because half-done actions can cause more harm than either finishing or never starting. Apply the
same rule to agents. For costly or side-effecting work, a leaf first runs a cheap pre-flight:
- probe the APIs, files and data the spec assumes
- check that the invariants can be satisfied together
- confirm that the done predicate is achievable

Only then does it start spending budget. In a planner-generator-evaluator harness, sprint contract
negotiation *is* the pre-flight. For cheap tasks, fold it into the first step instead of adding a round
trip.

### What the orchestrator does with a blocker

1. **Check the evidence.** Leaf agents can be wrong or lazy, and "this is impossible" is sometimes just
   false. Re-run the probe if that's cheap. For high-stakes cases, get a second opinion from a fresh
   agent.
2. **Route by source.** Send the blocker to whoever owns the affected constraint or premise: the planner
   for spec issues, the user for requirements. The orchestrator resolves it itself only if it is that
   source. See §10.
3. **Contain the error.** On `premise_false`, pause or notify sibling workers that rely on the same
   premise. Under fan-out, one false premise produces N coherent wrong results.
4. **Don't shop for a yes.** Never re-send the same spec to a fresh worker hoping one complies, and never
   pressure the blocked agent into reversing an evidenced blocker. Change the spec, or escalate.
5. **Resume, don't restart.** Answer the blocked agent with the decision and let it continue, keeping its
   partial work and what it learned. Start a fresh agent only when independence matters.
6. **Count it.** Each re-plan counts against the round cap. Once the cap is hit, or when the source is the
   user, escalate with the blocker report as the core of the escalation artifact.

### Concerns aren't discarded

The orchestrator collects `done_with_concerns` items, deduplicates them, and surfaces them in the final
report or at the next planning point. A concern that recurs across workers is a signal that the spec
should change.
