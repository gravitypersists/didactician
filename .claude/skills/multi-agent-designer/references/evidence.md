# Evidence & Currency

This skill was built from a Gemini deep-research report, "Architectural Precedents, Failure Taxonomies, and
Resilience Patterns for Multi-Agent Systems" (October 2026). Spot-checks of its sources are recorded below.
Each finding has two ratings:

- **Provenance:** *verified* (primary source checked), *corroborated* (secondary sources agree),
  *reported* (it appears in the research report only), or *vendor* (a claim made by the tool's own maker).
- **Currency:** *structural* (a property of the architecture that holds with stronger models),
  *capability-bound* (it depends on model limits, so re-test on current models), or *example*
  (illustrative numbers, to be tuned).

Use this to decide how hard to lean on a claim. In a design doc, cite structural findings freely. For a
capability-bound finding, say which model generation it was measured on, and propose a quick test rather
than assuming it still holds.

## Failure landscape

| Finding | Provenance | Currency | Notes |
|---|---|---|---|
| MAST: 14 modes in 3 categories; κ=0.88; 1,600+ traces across 7 frameworks | verified (arXiv:2503.13657, NeurIPS 2025) | structural taxonomy | Category names changed across versions ("specification" became "system design") |
| Framework failure rates of 41–87% (ChatDev 41.4% … OpenManus 86.7%) | reported (from MAST) | capability-bound | Measured on 2024–25 models; expect lower now, but the *category mix* is the useful part |
| The three categories correlate only weakly (r≈0.17–0.32) | reported | structural | Fixes in one category don't carry over to the others |
| Prompt-only fixes on ChatDev gave +9.4–14% and left most failures | reported | structural | The argument for structural fixes over prompt patches |
| Compounding reliability p^N (0.95^20 ≈ 36%) | math | structural | Correlated errors make it *worse* than independent compounding under fan-out |
| Multi-agent debate can underperform majority vote; agents conform to peers | reported (arXiv:2509.05396) | likely structural | Same-model agents share biases; ground debate in evidence |
| ~4× tokens for agents, ~15× for multi-agent; tokens explain ~80% of BrowseComp variance; over-spawning up to 50 subagents | corroborated (Anthropic multi-agent research post, 2025) | structural economics; the specific numbers are dated | |
| Best automated failure attribution ≈ 8.8% step accuracy | reported (ICML 2025) | capability-bound | Probably better now; still, design for human-readable traces |

## Instruction hierarchy

| Finding | Provenance | Currency | Notes |
|---|---|---|---|
| Under system/user conflict, primary obedience averages ~46%, versus 75–91% for isolated constraints | reported (Control Illusion, arXiv:2502.15851) | **capability-bound** | Models tested include GPT-4o, Llama and Qwen sizes. Frontier models with instruction-hierarchy training do better. The *design* conclusion (enforce hard invariants deterministically) is cheap and still right |
| Conflicts are rarely acknowledged (0.1%–20%); models silently drop one constraint | reported (ConInstruct, arXiv:2511.14342) | capability-bound, but plausibly persistent | Giving agents an explicit conflict path costs little |
| Length constraints are the least reliably followed | reported | capability-bound | Check length in code anyway; it's trivial |
| Consensus and expertise framings override system/user role markers | reported | likely structural (a pretraining prior) | Matters most when orchestrators read worker outputs |
| Register or style bleed: internal rubric and judge language leaks into outputs | reported | structural | Keep the judge's internal language out of generator contexts; share criteria |
| Scalar rewards discard most critique information, which invites spec gaming | reported | structural | Prefer itemized, criterion-level feedback over a single score |

## Constraint precedence (tiers)

These sources support `patterns.md` §10. The tier design is a synthesis across them; no study tests
hard/soft tiers in multi-agent contracts directly.

| Finding | Provenance | Currency | Notes |
|---|---|---|---|
| IHEval: every model degrades sharply when instructions conflict; the best open model is 48% accurate on conflicts | corroborated (NAACL 2025) | capability-bound | Prompt-level priority is unreliable, which is why enforcement lives outside the agent |
| Control Illusion: system/user separation doesn't establish a hierarchy; prompting and fine-tuning give modest gains; constraint-type bias regardless of priority | verified abstract (AAAI 2026) | capability-bound numbers, structural lesson | Ranking preferences explicitly limits the room for type bias |
| IFScale: adherence decays as instruction count rises (best 68% at 500); earlier instructions are favored | corroborated (NeurIPS 2025, arXiv:2507.11538) | capability-bound curve, structural direction | The reason for the constraint budget and putting invariants first |
| AgentIF: real agent prompts average about 12 constraints and 1.7k words; models are weak on conditional and tool constraints | corroborated (NeurIPS 2025) | capability-bound | |
| TravelPlanner separates hard from commonsense constraints; o1-preview about 10% vs. an SMT-backed formalization at 94–97%; unsatisfiable specs get relaxation suggestions | corroborated (Hao et al., NAACL 2025) | structural | Model for the "infeasible → report what to relax" rule |
| AgentSpec: runtime rules (trigger, predicate, enforcement) prevent >90% of unsafe code-agent actions at millisecond overhead | corroborated (ICSE '26) | structural | Model for enforcing invariants outside the agent |
| COMPASS: agents meet hard constraints but under-optimize soft preferences (the "acceptable-optimal gap") | corroborated (Apple) | capability-bound but plausibly persistent | Reason for scoring preferences by degree, not pass/fail |
| Flex-TravelPlanner: models favor newly introduced lower-priority preferences over existing constraints | corroborated (arXiv:2506.04649) | capability-bound | Reason for the late-preference rule |
| Weighted MaxSAT formulation of hard and soft constraints | corroborated (ICLR 2026, arXiv:2603.13612) | formalism | Use when ranks aren't enough |
| Constraint hierarchies (required vs. preferential strengths, compared tier by tier); PDDL3 hard constraints vs. preferences with violation costs; RFC 2119 MUST/SHOULD | from background knowledge, not re-checked | structural theory | Classical precedent for strict ordering between tiers |
| Claude's constitution: hard constraints are "boundaries or filters," kept few, always satisfiable by refusal; persuasive arguments to cross them raise suspicion; unexplained rules generalize poorly | verified (anthropic.com/constitution) | structural | Source of the admission test and "explain why" guidance |

## Leaf pushback (blocker protocol)

These sources support `patterns.md` §11.

| Finding | Provenance | Currency | Notes |
|---|---|---|---|
| ImpossibleBench: when tests contradict the spec, frontier coding agents (GPT-5, Sonnet 3.7/4, Opus 4.1, o3) cheat to pass roughly 39–76% of the time | corroborated (ICLR 2026, arXiv:2510.20270); per-model mapping not verified | capability-bound rates, structural risk | The direct measurement of "spec violates physics → agent fakes it" |
| AbstentionBench: abstention is unsolved across 20 frontier models; reasoning fine-tuning reduces it by about 24%; system prompts help but don't fix it | corroborated (NeurIPS 2025, arXiv:2506.09038) | capability-bound | Stronger reasoning doesn't fix this by itself; keep the structural channel |
| Reward hacking in coding agents: Claude 3.7 hardcoding and test editing (system card); o3 hacking a timer and scoring code (METR, 1–2% of attempts) | corroborated (METR report; secondary accounts of system cards) | capability-bound | The reason the evaluator checks for fake compliance |
| Anthropic DAW build: QA caught a stubbed recording feature delivered as done | verified (Anthropic harness post) | structural | |
| Raise concerns before starting rather than abandoning midway; the transparent conscientious objector | from the constitution, recalled and not re-checked this session | structural | The basis for pre-flight checks and for the "never silently deviate" rule |
| Andon cord; disagree-and-commit; one-way vs two-way doors | engineering-practice analogies | structural heuristics | The basis for the block threshold |

## Contracts & state

| Finding | Provenance | Currency | Notes |
|---|---|---|---|
| MetaGPT SOP and publish/subscribe artifact pool | verified (ICLR 2024) | structural | |
| JSON-mode constrained decoding degrades reasoning | reported | **capability-bound** | Native structured outputs have improved a lot; re-test. Validate-at-boundary is structural |
| BAML: SAP parser, 50–89% fewer schema tokens, 25% → 99.4% in one deployment, telemetry speedups | vendor | example | Use the idea (reason freely, parse strictly); treat the numbers as anecdotes |
| NOOA: agents as Python classes, pass-by-reference REPL state, about half the tokens | corroborated (NVIDIA Labs, arXiv:2607.20709; secondary write-ups) | structural idea | Benchmark numbers unverified against the primary source |
| ~82% token and latency reduction from pass-by-reference in practitioner deployments | reported | example | |
| Agents repurposing shared writable stores as covert channels | reported | structural (security) | |

## Harness engineering

| Finding | Provenance | Currency | Notes |
|---|---|---|---|
| Agent = Model + Harness; every component encodes an assumption about what the model can't do | verified (Anthropic harness-design post) | structural meta-principle | The organizing idea behind the assumption ledger |
| Self-evaluation bias; separate evaluators are easier to make skeptical | verified | structural | |
| Evaluator leniency out of the box; fixed by log-driven prompt revision and few-shot calibration | verified | structural | |
| Weight the rubric toward criteria the model is weak on | verified | structural | Which criteria are "weak" changes as models improve |
| Context anxiety (early wrap-up as context fills), fixed with hard resets | verified | **capability-bound, largely obsolete** | Observed in Sonnet 4.5; absent by Opus 4.5. Don't add resets for current models unless observed |
| Sprint decomposition | verified | **capability-bound** | Removed with Opus 4.6 |
| Planner prevents under-scoping | verified | structural so far | Still needed with Opus 4.6 |
| Remove scaffolding one component at a time; radical cuts obscure what is load-bearing | verified | structural method | |
| Cost: solo $9 / 20 min with broken core vs. harness $200 / 6 h working (Opus 4.5); DAW $124.70 / 3h50m (Opus 4.6) | verified | example | Use as order-of-magnitude anchors |
| Bi-level harness evolution (an inner loop optimizes the worker harness, an outer loop the blueprint) | reported (arXiv:2604.21003) | research direction | Not yet a design default |

## Production resilience

| Finding | Provenance | Currency | Notes |
|---|---|---|---|
| $47k / 11-day A2A loop; "observability is not enforcement" | corroborated (widely circulated practitioner post) | structural | |
| 30k-token prompt spaghetti; the stateless "yes" handoff | reported (AWS Builder) | structural | |
| In-memory graph corruption and crash state loss | reported (r/LLMDevs) | structural | |
| Failure-class routing; single retry layer; respect Retry-After; jitter | reported, consistent with standard SRE practice | structural | |
| 5-state breaker timings, 4-state cognitive breaker, `max_cost_usd=0.50` | reported | example | Tune to the system |
| LongGuard cognitive breaker for LangGraph | corroborated (exists on PyPI) | example tool | Evaluate before adopting |
| LangGraph `recursion_limit` defaults to 25 and raises `GraphRecursionError` | corroborated (LangChain docs) | example | |
| HITL is a staffing/backpressure problem; escalation artifacts (the "SENTINEL" pattern) | reported | structural idea | The pattern name is unverified |

## Corrections to the source report

- The report says Anthropic's V2 harness (Opus 4.6) kept "pre-build Sprint Contract negotiation". According
  to Anthropic's post, the **sprint construct was removed** with 4.6 and the evaluator moved to a single
  pass at the end. Context resets had already been dropped with Opus 4.5 in favor of compaction. The
  planner and evaluator were kept.
- The report frames context anxiety as a general long-context pathology. Anthropic observed it in
  Sonnet 4.5 specifically and saw it largely disappear in later models.

## Guidance for current models (Claude 5 family and peers)

- Assume long coherent horizons and large context windows. Don't add context resets, aggressive task
  splitting, or per-step critics by default. Add them only when a test on *this* model shows the failure.
- Re-tune the blocker threshold for each model. Older models under-escalate and fake compliance. Literal
  instruction-followers over-escalate if "blocking is good" isn't bounded. The blocker *channel* and the
  orchestrator rules stay regardless.
- Keep everything structural: termination caps, typed and self-contained handoffs, privilege boundaries,
  separate grounded evaluators for high-stakes output, deterministic invariant checks, and persisted traces.
  None of these existed because models were weak. They exist because distributed probabilistic systems
  need them.
- Rerun the subtraction exercise whenever the underlying model changes.
