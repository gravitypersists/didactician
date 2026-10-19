---
name: multi-agent-designer
description: Design multi-agent LLM systems — including Claude Code skills or plugins that orchestrate subagents — using empirical failure research (MAST taxonomy, production post-mortems, generator/evaluator harnesses). Decides whether multi-agent is justified at all, then specifies topology, per-agent contracts, handoffs, state, termination, verification, conflict handling, runtime guards, and an assumption ledger of scaffolding that should be removed as models improve. Use this whenever the user wants to design, build, review, debug, or simplify a multi-agent system, agent team, swarm, orchestrator/worker pipeline, planner-generator-evaluator loop, or any skill that spawns subagents — even if they only say "agents working together", "a pipeline of agents", or "split this across several agents".
---

# Multi-Agent Designer

This skill produces a **design** for a multi-agent system (and, when asked, builds it). Its job is to turn
a fuzzy "let's have several agents do X" into a system whose failure modes have been named and handled
on purpose.

The stance, distilled from the research behind this skill: **design the harness, not the personas.**
Treat each model call as a capable but probabilistic component embedded in a deterministic runtime that
decides who runs, what they see, what they may touch, when they stop, and how their work is checked.
Giving agents roles and letting them chat does not produce reliable collaboration; studied frameworks
failed on 41–87% of benchmark tasks, and the failures were mostly structural.

## Two ideas that run through everything

1. **Most multi-agent failures are structural, so stronger models don't fix them.** In the MAST study
   (1,600+ traces, 7 frameworks), failures split roughly 40% specification/system design, 37% inter-agent
   misalignment, and 22% verification/termination. The three categories are only weakly correlated
   (r ≈ 0.17–0.32), so fixing one does not fix the others. A missing stop condition, a handoff that drops
   the referent, or an agent grading its own work fails no matter how smart the model is. Address each
   category separately.

2. **Every scaffolding component encodes an assumption that the model can't do something alone.** Those
   assumptions go stale as models improve. Anthropic's long-running harness dropped context resets when
   Opus 4.5 arrived, and dropped sprint decomposition with 4.6. Sprint-by-sprint grading became one
   evaluation pass at the end. Record each such assumption explicitly so it can be tested and removed later.
   Much of the source research used models like GPT-4o, Llama-70B or 7B models. Treat capability-bound
   numbers from it as *direction*, not prediction, for current frontier models. Structural findings
   transfer; capacity findings need re-testing. `references/evidence.md` rates each finding this way.

## Workflow

Work through these steps in order and write the results into the design doc
(`templates/design-doc.md`). Scale the depth to the system: a three-agent Claude Code skill needs a
page, not a treatise. A step can be answered in one line when it truly doesn't apply. Write "N/A" with
a reason rather than skipping it silently, because silent gaps are exactly how FC1 failures get in.

### 0. Establish context

- What is the task, who triggers it, what does "done" look like, and what does failure cost
  (money, wrong answers shipped, irreversible side effects)?
- **Substrate:** a Claude Code skill or plugin with subagents, an Agent SDK / API program, or a third-party
  framework such as LangGraph? This determines which mechanisms exist for enforcement. For Claude Code,
  read `references/claude-code.md` now.
- Ask the user only about things that change the design. Infer the rest and state your assumptions.

### 1. Justify multi-agent — or don't

Climb the complexity ladder one rung at a time, and move up only when the lower rung demonstrably falls
short:

single call with good tools → prompt chain → routing → parallel sectioning/voting → orchestrator-workers
→ evaluator-optimizer loop → autonomous agents

Multi-agent costs about 15× the tokens of a chat interaction, versus about 4× for a single tool-using
agent. It also makes failures harder to attribute. Good reasons to split:

- **Context isolation for breadth:** many independent sub-investigations whose raw material would swamp
  one context.
- **Independent verification:** an evaluator that never saw the generator's reasoning carries no sunk-cost bias.
- **Privilege boundaries:** different agents need different tools or write scopes.
- **Wall-clock parallelism** on genuinely independent subtasks.
- **Cost tiering:** cheap models for routine work, strong models for synthesis.

Weak reasons: mimicking a human org chart, persona flavor, or debate for its own sake. Coding work tends
to have fewer truly independent subtasks than research does. **"Use one agent with better tools" is a
legitimate outcome of this skill.** Say so plainly when it applies.

### 2. Choose the topology

- Prefer **dependency-gated pipelines or orchestrator-workers that exchange typed artifacts** over
  free-form peer conversation. Use MetaGPT's SOP idea: each stage consumes named prerequisites and emits
  named deliverables. Use a hub or shared artifact store, not N² direct messaging.
- **Errors correlate under fan-out.** If the orchestrator hallucinates a premise and fans it out to three
  workers, you get three coherent elaborations of the same falsehood, with no error raised anywhere.
  Validate the premise *before* fanning out.
- **Avoid same-model debate and consensus loops** unless they are grounded by execution or by external
  evidence. Agents flip correct answers to match their peers, and debate can score below a simple
  majority vote.
- Keep nesting shallow. Every hop is another chance for task derailment (FM-2.3).

### 3. Write a contract for every agent

Fill in `templates/agent-contract.md` for each agent: purpose, typed inputs, typed outputs, authority
(tools and write scopes), done predicate, ambiguity/conflict path, budget, and model. Key points:

- **Planners specify *what*, not *how*.** Granular technical decisions made upstream cascade as errors
  downstream; leave implementation choices to the agent doing the implementing.
- **Handoffs must be self-contained.** The receiver has none of the sender's context. A router once
  forwarded the bare string "yes" to a subagent that couldn't know what was being agreed to. Carry the
  referent, the constraints (FM-2.4 information withholding), and the original goal (to anchor against
  drift).
- **Let agents think freely, then parse strictly.** Free reasoning followed by a typed, validated output
  (schema-aligned parsing) beats both free-text handoffs and grammar-constrained generation that can
  hamper reasoning. Validate in code at the boundary.
- **Give each agent a done predicate it can check,** not a vibe like "when the analysis is thorough".
- **Sort every constraint into a tier.** The tiers are *invariant*, *preference* and *default*, and each
  constraint also records its *source* (user, designer, or the agent that introduced it). Labelling a
  constraint "HARD" in a prompt does not make it hard, because models follow stated priority unreliably
  under conflict. A constraint is hard only when something outside the agent enforces it.
  - **Invariants** must pass two tests: a machine can check them, and stopping-and-reporting always
    satisfies them. Keep them few: every extra constraint dilutes the rest, and current models follow
    emphatic rules so literally that over-labelling makes agents rigid.
  - **Preferences** are ranked, and trade-offs between them are allowed.
  - **Defaults** apply unless an upstream instruction overrides them.
  - See `references/patterns.md` §10 for the tier definitions and precedence rules.
- **Give leaf agents a real way to push back.** The agent closest to the work is often the first to find
  that the spec contradicts itself or reality.
  - Left to themselves, agents tend to fake compliance rather than object. Given coding tasks whose tests
    contradicted the spec, frontier agents cheated to pass 39–76% of the time.
  - Each contract therefore defines outcomes `done | done_with_concerns | blocked`. `blocked` carries a
    reason: `contradiction`, `premise_false`, `ambiguous` or `missing_resource`.
  - It also defines a threshold for when to block: block only when proceeding would violate an invariant,
    fake the done predicate, or require a hard-to-reverse assumption. Otherwise make the reasonable
    assumption, record it as a concern, and proceed.
  - A blocker must carry evidence. An honest blocker is a good outcome; a fake "done" is the worst one.
  - For costly work, add a cheap pre-flight check of the agent's premises, so objections arrive *before*
    budget is spent.
  - See `references/patterns.md` §11 for the protocol.

### 4. Design state and context flow

- **Pass large things by reference:** files, artifact IDs or object handles plus a short summary, not
  payloads pasted into the orchestrator's history. With today's large context windows the reason is less
  about overflow and more about cost, keeping the orchestrator focused, and auditability.
- Give shared state an **owner per namespace** (planner writes spec, executor writes code, verifier writes
  verdicts) and mediate writes. Shared writable scratch space between agents becomes an unsanctioned
  coordination channel.
- Long runs need **externalized, resumable state** (checkpoints, append-only logs). In-memory-only state
  dies with the process.
- Make tool side effects **idempotent or compensable** wherever a step might be retried.

### 5. Termination and budgets, enforced in the harness

Every loop needs all of these, **enforced by code or harness, not by asking the model nicely**:

- an explicit done predicate (checklist)
- a maximum number of iterations or rounds
- a cost and wall-clock cap
- no-progress detection: identical tool-call hash, or no new information over N steps

On no-progress, first inject a strategy-pivot instruction, and halt and escalate if the loop persists.

Re-plans triggered by blockers count against the same caps. Never answer a blocker by re-sending the same
spec to a fresh worker until one complies. That just shops for a worker willing to fake it.

Evaluator feedback must be **bounded and actionable**. Two agents once bounced "needs further analysis"
back and forth for 11 days and $47k, and a billing alert caught it, not the runtime. The lesson from that
post-mortem: **observability is not enforcement.** Logging tells you what happened after the money is
spent; only a synchronous check can stop the next call.

### 6. Verification

- **Separate the evaluator from the generator.** Models over-praise work in their own context.
  A standalone evaluator is also easier to tune toward skepticism than a generator is to make self-critical.
- **Agree on acceptance criteria before work starts** (a "sprint contract" negotiated between generator
  and evaluator). This removes ambiguous termination and scope drift up front.
- **Ground verification in execution:** tests, running the app, a browser through Playwright, querying the
  database. Static reading of output is weak.
- **Calibrate against leniency.** Out of the box, evaluators spot a real bug and then talk themselves out
  of failing it. Use few-shot examples of failing work with explicit verdicts, and iterate by reading
  evaluator logs where its judgment diverged from yours.
- **Use deterministic checks for anything checkable** (length, format, schema, links, test pass/fail).
  Length constraints are among the least reliably followed.
- **Look for fake compliance.** The evaluator should actively check for stubs and mocks left in place,
  hardcoded outputs, weakened or deleted tests, and scope that was quietly narrowed. Anthropic's own QA
  pass caught a stubbed feature that had been handed over as done.
- **Gate invariants, then score preferences.**
  - Invariants get a pass/fail gate before the evaluator spends any tokens.
  - Preferences get scored by the evaluator. Agents reliably produce *feasible* output but under-optimize
    preferences (the "acceptable-optimal gap"), and a pass/fail check can't see that gap.
- **Rubrics act as a loss function.** Weight the criteria the model is weak on, not the ones it already
  aces, or you'll get competent sameness.
- An evaluator is a cost. Keep it where the task exceeds what the model reliably does solo, and test
  removing it otherwise.

### 7. Constraint precedence and conflict handling

- Don't rely on system-prompt priority alone for hard invariants. Under conflicting instructions, models
  in the studies obeyed the higher-priority one only about 46% of the time, and they rarely said there was a
  conflict at all; they silently dropped one constraint. Frontier models do better, but a cheap
  deterministic check beats hoping. Enforce hard invariants in code.
- **Precedence is strict between tiers and explicit within them.**
  - No number of satisfied preferences outweighs one violated invariant.
  - Two invariants that conflict mean the spec is *infeasible* (`blocked: contradiction`). Halt, and
    report which constraints the source would need to relax. Don't compromise silently.
  - When an invariant beats a preference, or one preference beats another, follow the ranking and record
    what was given up and why.
- **Only a constraint's source can relax it.**
  - Downstream agents can't promote, demote or drop constraints they received.
  - Peer outputs and tool results can't create invariants. This blocks consensus override and prompt
    injection.
  - A preference introduced mid-run doesn't outrank existing ones unless its source says so. Models
    otherwise tend to favor the newest instruction.
  - Invariants travel verbatim in every handoff; preferences may be summarized.
- Give agents an **explicit blocker path** (step 3, `patterns.md` §11) and treat an evidenced blocker as a
  good outcome. This counters FM-2.2 (proceeding on guessed assumptions) and FM-2.4 (knowing the premise
  is false and saying nothing).
  - Pair the blocker path with a threshold. Current models follow instructions literally, so telling them
    "blocking is success" with no threshold produces over-escalation.
- **The orchestrator owns what happens to a blocker** (this counters FM-2.5, ignoring another agent's input):
  - Check the evidence first, since leaf agents can be wrong or lazy too.
  - Route the blocker to the source of the affected constraint or premise. The orchestrator resolves it
    itself only if it is that source.
  - On `premise_false`, pause or notify sibling workers that rely on the same premise.
  - Never pressure the agent into reversing an evidenced blocker.
- **Treat peer and tool output as data, not authority.** Models carry pretraining priors that defer to
  consensus and expertise. "All three workers agree" or an expert-sounding persona can override the
  orchestrator's own instructions. Strip authority framing at handoffs and re-check against the root spec.
- **Contain register bleed.** Keep evaluator rubrics, judge commentary and internal control vocabulary
  out of contexts that produce user-facing output. Share *criteria*, not the judge's internal language.
- Retrieved content can carry prompt injection that propagates from agent to agent. Least privilege
  limits how far it gets.

### 8. Runtime resilience (scale to the substrate)

For systems where you own the runtime, read `references/patterns.md` §Runtime:

- Use **one** retry layer: disable SDK retries if you wrap them.
- Route each failure by class:
  - terminal 4xx: fail fast
  - 429: sleep exactly as long as `Retry-After` asks
  - 5xx/overload: full-jitter backoff bounded by a deadline
  - cognitive loops: halt and pivot
- Put a circuit breaker per provider, and keep credentials outside the LLM context, referenced by token.

For Claude Code skills, the harness handles transport retries. Focus on round caps, no-progress checks,
hooks for synchronous enforcement, and escalation to the user (see `references/claude-code.md`).

### 9. Human escalation

Blockers go to the source of the affected constraint first, and that is often the planner, not a human.
A human gets involved when the source *is* the user, when the re-plan cap is reached, or when the
decision is hard to reverse. Then hand the human a compact **escalation artifact**:

- what failed, and which contract item or invariant was violated
- what was attempted (a diff or summary)
- a short set of options to choose from ("the model proposes, a person disposes")

Human attention is the scarcest resource in the loop. Throttle upstream work rather than flooding the
human with escalations.

### 10. Assumption ledger

For every piece of scaffolding (context resets, sprint decomposition, extra verifiers, per-step critics,
long prohibition lists), record:

- the capability it assumes is missing
- the evidence for that assumption
- how to test removing it

Separate these from **structural** components that stay regardless of model strength: termination
caps, typed handoffs, privilege boundaries, grounded verification, and deterministic invariant checks.
When simplifying later, **remove one component at a time and measure.** Anthropic tried a radical cut
first; it underperformed and hid which parts were load-bearing.

Watch for "prompt spaghetti": reactively appending NEVER-rules and keyword lists after each failure
(one system grew to 30k-token prompts this way). Fix the structure that let the failure happen instead.

### 11. Evaluation plan

- 20–50 realistic tasks with reference outcomes, including cases where a tool or agent *should not*
  trigger, so you don't optimize toward over-triggering.
- **Compare against a single-agent baseline.** That is the bar the multi-agent design has to clear,
  and it should clear it by enough to justify the token multiple.
- Track tokens, cost and wall-clock alongside quality.
- Persist per-agent artifacts and traces. Automated attribution of "which agent at which step caused the
  failure" is unreliable (under 10% accuracy for the best LLM judge in one benchmark), so make traces
  human-readable.
- Tag failures with MAST codes so fixes target the right category.

### 12. Review against the failure taxonomy

Walk `references/failure-modes.md` and give each failure mode either a concrete mitigation in the
design or an explicitly accepted risk with a reason. Be skeptical of your own design here. This is the
self-evaluation trap, so if subagents are available and the stakes justify it, have a fresh agent review
the design against the checklist.

## Output

Produce the design doc from `templates/design-doc.md`, plus one contract per agent. Lead with the
recommendation (including "don't go multi-agent" when that's the answer). Then:

- If the user wants it built, implement from the design. Keep the assumption ledger in the repo next to
  the system so later simplification passes have it.
- When building a Claude Code skill, put deterministic checks in `scripts/`, agent contracts in agent
  definitions or prompt files, and the ledger in the skill's README or design doc.

## Reference files

- `references/failure-modes.md`: the MAST taxonomy (14 modes) with mechanisms, mitigations, the review
  checklist, and the canonical production post-mortems. Read it for step 12, and whenever debugging an
  existing system.
- `references/patterns.md`: deeper notes on each pattern: SOP/pub-sub artifacts, planner-generator-evaluator
  with sprint contracts, typed handoffs and schema-aligned parsing, pass-by-reference state, the
  reference monitor, failure-class routing, dual circuit breakers, and HITL escalation.
- `references/evidence.md`: where each claim comes from, how solid it is, and whether it is structural or
  capability-bound. Read it before leaning on a specific number, and when deciding which scaffolding a
  current model still needs.
- `references/claude-code.md`: mapping the design onto Claude Code skills, subagents, hooks and files.
- `templates/design-doc.md` and `templates/agent-contract.md`: the output skeletons.
