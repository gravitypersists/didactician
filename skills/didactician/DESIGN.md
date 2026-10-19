# Didactician: Multi-Agent Design

## Recommendation

**A dependency-gated pipeline that moves typed artifacts through stages, with a human checkpoint and independent verification. Agents do not talk to each other freely.** On the complexity ladder this is orchestrator-workers plus an evaluator-optimizer loop at the end. The main session (SKILL.md) is the orchestrator. It runs five stages: **Intake → Research → Learning plan + mockup → [human checkpoint] → Build → Verify/revise**. Each stage hands the next one files, never chat. Six subagent roles exist. A small run might spawn only four (researcher, designer, page builder, one reviewer pass), because widget builders and the second reviewer are effort-scaled.

Two justifications carry most of the weight:

1. **Independent verification.** A reviewer that never saw the builder's reasoning catches what the builder rationalised.
2. **Context isolation.** Research material and complex widget code would swamp the context that writes the prose and holds the instructional plan.

The planner/builder split is weaker, and it is the first thing to test against the single-agent baseline (see the assumption ledger).

## Context

- **Task and trigger:** a user in a coding agent asks for an explanation of a concept, e.g. "/didactician explain how CRDTs converge, for HN readers". The concept may be general or specific to their codebase.
- **Done (system-level):** a static site folder (`index.html` + `assets/`) with no backend and only relative paths, so it works from any static host or subpath (GitHub/Cloudflare Pages, S3, a blog's `/explainers/x/`). It must pass the invariant gate, have no open blocking findings from either reviewer, and come with a run log a human can audit. The system knows nothing about where the piece is deployed. It deploys only when the original request includes deployment instructions.
- **Cost of failure:**
  - _Wrong explanations shipped confidently_ is the worst case, because readers trust explainers.
  - Bloated, unconverged pieces that nobody finishes.
  - Broken layouts on mobile.
  - Embedded media used without clearance.
  - Token cost. A full run is plausibly 10–20× a chat.
- **Substrate:** a Claude Code skill. It is a self-contained folder that a project drops into `.claude/skills/`. It can't ship hooks or `.claude/agents/` definitions on its own, so:
  - agents are **prompt files inside the skill**, run as general-purpose subagents;
  - caps are enforced by **script gates** the orchestrator must call;
  - see "Soft vs. enforced" below for what that does and doesn't guarantee.
- **Assumptions made without asking:**
  - Node is available. Intake runs a Playwright pre-flight (`scripts/preflight.sh`: installs a pinned Playwright (1.63.0) into `~/.cache/didactician`, not the host project, then launches Chromium). If it fails, the run blocks with `missing_resource` and gives the user the install command. The user chose Playwright, so there is no static-only fallback.
  - The output folder defaults to `./explainers/<slug>/`.
  - Each run targets one piece. A piece can declare that it is part of a course.
  - English by default.

## Skill layout

The skill is self-contained. Everything a run needs ships inside the folder, and nothing depends on the repo's other skills or on ASK.md or INSTRUCTION-DESIGN.md, which will be deleted.

```
didactician/
├── SKILL.md                    # orchestrator workflow: stages, gates, caps, escalation
├── DESIGN.md                   # this doc + assumption ledger
├── agents/                     # one prompt file per role (contract + calibration examples)
│   ├── researcher.md  instructional-designer.md  page-builder.md
│   ├── widget-builder.md  accuracy-reviewer.md  pedagogy-ux-reviewer.md
├── references/
│   ├── learning-science-patterns.md  # core instructional design (moved in from the former
│   │                           #   learning-science-patterns skill; INSTRUCTION-DESIGN.md merged):
│   │                           #   cognitive budget, guidance continuum, ICAP, audit checklist
│   ├── cognitive-design-patterns.md  # theory + citations, blueprints B1–B4, plan field format
│   ├── ux-ui.md                # tokens, 8px grid, typography, mobile, ToC (claude.dev pattern,
│   │                           #   distilled so builders needn't browse), captions, carousels, a11y
│   ├── graphics.md             # SVG arrows (geometry + marker rules), diagrams, charts,
│   │                           #   direct labels, animation policy + replay
│   ├── widgets.md              # widget interface contract, toolsets (explorabl.es list + others),
│   │                           #   cost guidance
│   └── sourcing.md             # media clearance, attribution format, embedding
├── kit/                        # optional runtime helpers copied into site/assets/ (classic scripts)
│   ├── tokens.css  components.css   # 8px-grid tokens (light/dark) + layout, rail, figures, checks…
│   ├── toc.js                  # scrollspy rail (claude.dev pattern) + mobile "Contents" disclosure
│   ├── arrow.js                # boundary-to-boundary arrows, trimmed lines, curve support, labels
│   ├── replay.js               # start-when-visible + [data-replay] for one-shot animations
│   ├── carousel.js             # numbered pager, no reflow, keyboard/aria
│   └── widget.js               # widget mount/resize/visibility/replay helper + CDN loader
├── templates/                  # brief, decisions, handoff, report, research-formats,
│                               #   learning-plan, review, mockup.html
├── scripts/                    # preflight.sh, init_run, log, round_gate (dispatch bookkeeping:
│                               #   caps, snapshots, namespace check), check_research, check_plan,
│                               #   findings (stable IDs), verify.mjs (gate), probe.mjs, lib/pw.mjs
└── tests/                      # run.sh self-test + fixtures (bad / good / kit demo)
```

The kit is optional: a builder may write its own implementation when the piece calls for it. The kit exists to make the common cases correct by default, arrows especially.

## Why multi-agent

| Justification | Applies? | Evidence / reasoning |
|---|---|---|
| Independent verification | **Strong** | Generators over-praise their own work. Accuracy and pedagogy failures are exactly the ones a self-review misses: the builder "knows what it meant". |
| Context isolation | **Strong** at standard/deep research and for complex widgets | Raw sources (pages, papers, code) and widget implementation details have nothing to do with writing the prose. |
| Parallelism | Medium | Widgets are genuinely independent once the shell and tokens exist. Deep research splits by objective. |
| Privilege boundary | Weak on this substrate | Intended: reviewers don't edit, builders don't browse, each builder writes one namespace. Prompt-level only, plus a post-hoc check (see "Soft vs. enforced"). |
| Cost tiering | Mild | Research extraction can run on a cheaper model through the Agent `model` parameter. Synthesis and review stay on the strongest one. |

**Single-agent baseline:** one session with SKILL.md and all the references doing every stage itself, still with the deterministic gate and the human checkpoint. We expect it to:

- self-approve inaccuracies;
- let research bulk leak into the prose (the divergence problem);
- degrade on pieces with three or more widgets as its context fills.

The multi-agent design has to beat this baseline on accuracy findings and reader-time adherence by a margin that justifies roughly 2–3× its tokens.

## Topology

```
 user ──► [0 INTAKE · orchestrator] ──► brief.md   (+ preflight.sh)
                │  ask user if audience / scope / depth not confidently inferable
                ▼
          [1 RESEARCH · researcher ×1–3]  (skipped if depth=none)
                │  question-driven, capped per depth; off-objective → parking-lot
                ▼   research/{facts,misconceptions,examples,assets,parking-lot}.md
          gate: check_research.py
          [2 PLAN · instructional-designer]
                │  converge: scope sized in ideas, cut-list + cut order, acceptance criteria
                ▼   plan/{learning-plan.md, cut-list.md, mockup.html}
          gate: check_plan.py  (structure fails; scope and traceability warn)
                ▼
          ◆ HUMAN CHECKPOINT: approve │ revise(notes) │ rescope; asset decisions  (≤3 rounds)
                ▼
          [3a BUILD · page-builder] pre-flight → shell + tokens + prose + simple figures
                ▼   site/index.html, site/assets/, site/widgets/manifest.json
          [3b BUILD · widget-builder ×0–N, parallel] one per complex widget
                ▼   site/widgets/<id>/
          gate: verify.mjs (Playwright invariant gate) ── fail ─► owning builder
                ▼ pass
          [4 REVIEW · accuracy-reviewer ∥ pedagogy-ux-reviewer] fresh, no site edits
                ▼   review/round-N/{accuracy,pedagogy-ux}.md  (orchestrator assigns stable IDs)
          blocking findings? ─► route to owning builder ─► gate ─► closure review
                │  (≤2 revise rounds; round_gate.py)
                ▼
          [5 DELIVER · orchestrator] final report, concerns, built-page reading time
                                     (deploy only if the request asked, confirmed with user)
```

- **Premise validation before fan-out:**
  - Widget builders fan out only after three things have happened: the human approved the plan, `check_plan.py` passed, and the page builder has produced `tokens.css` and the mount-point contract.
  - A wrong premise in the plan is the most expensive error in the system, so the checkpoint is the premise check.
  - Research fan-out (deep only) splits by objective, and objectives come from the brief.

## The brief

`brief.md` is the root spec that every handoff points to. It is written from `templates/brief.md`. Fields:

- **Audience:** who they are, plus their **readiness** (novice, intermediate or advanced) for this topic.
- **Scope:**
  - target reader time;
  - standalone or part of a course;
  - if part of a course: what the reader already knows (assumed prerequisites) and what comes next (deliberately out of scope).
- **Objectives:** a draft written by the orchestrator. What the reader should be able to predict, explain or do afterward. Guidance is about one objective per 3–5 minutes. More than that produces a `check_plan` warning, not a failure.
- **Research depth:** see the table below.
- **Design tokens:** user-provided (a path or values) or `default`.
- **Mobile:** supported (the default) or waived. A waiver is only valid when the user confirmed it.
- **intended_use**, if stated: commercial, personal or internal. Clearance decisions depend on it.
- **Language.**
- **Deployment instructions**, if the request included any.
- **Original request:** verbatim.

The orchestrator asks the user only for fields it can't infer confidently: audience, scope and depth almost always; tokens only if the request hints at a brand or site. It does this in one batched question round. Objectives are shown to the user in that round if the user is asked anything at all, and always at the checkpoint.

## Agents (contract summaries)

Full prompts live in `agents/*.md`. Every agent returns a report from `templates/report.md`. It **starts with** `status: done | done_with_concerns | blocked` (and a `reason` when blocked), followed by:

- artifact paths;
- `concerns`;
- `relaxed`: constraint id, what was given up, and why;
- `dispositions`: in revision rounds, one entry per finding ID, either `fixed`, `disputed` with evidence, or `blocked`.

Blockers use the §11 schema. **Fake compliance is the worst outcome.** Each prompt names its forms (see Verification).

### Orchestrator (main session, SKILL.md)

- **Owns:**
  - intake and `brief.md`;
  - `run/decisions.md`: every user decision (checkpoint notes, asset approvals, waivers, rescopes), timestamped;
  - `run/log.md` (sole writer), `run/handoffs/`, `run/history/`, `run/state.json` (through scripts);
  - every user interaction, all routing, and assigning finding IDs;
  - deployment, when the request included it: the only irreversible action, done by the orchestrator alone after confirming the target with the user.
- **On every blocker:** re-checks the evidence where that's cheap, routes the blocker to the constraint's source, and logs the disposition. It never re-sends the same spec to a fresh agent hoping for compliance.
- **Doesn't:** write content, plans, site code or verdicts. If it starts doing a worker's job, that is a bug.
- **Done:** a final report is delivered, _or_ an escalation artifact is delivered.

### Researcher

- **Purpose:** produce a bounded, cited fact base for the objectives. Its role is accuracy, not content expansion. It exists for context isolation: raw sources never reach the designer.
- **In:**
  - `brief.md`;
  - research questions (orchestrator-derived, 2–4 per objective);
  - the depth budget;
  - for codebase topics, the paths to read.
- **Out:**
  - `facts.md`: claim IDs `c-NN`, each **one assertion of ≤ 40 words**, with its objective, source (URL or `file:line`), a short quote, and a confidence rating;
  - `misconceptions.md` (capped);
  - `examples.md`: candidate concrete cases and analogies (capped);
  - `assets.md`: candidate media, each with source, licence, attribution and a `clearance` field. `license` means the licence clearly permits this use, given the brief's `intended_use`. `needs-user` covers everything else, including fair-use excerpts and unclear licences. The researcher never decides fair use. User approvals are recorded in `decisions.md`, not here, so this file keeps a single writer;
  - `parking-lot.md`: one-liners for interesting material off-objective.
- **Authority (intended):** WebSearch/WebFetch, Read/Grep, and writes to `run/research/` only.
- **Pre-flight:** before researching, check that the brief's premise holds (e.g. that "why X causes Y" is really true).
- **Done:** `check_research.py` passes. It checks the caps, that every claim has a source and an objective, the per-claim length, and that every question is answered or marked unresolved.
- **Blocker triggers:**
  - the premise in the brief is false;
  - sources conflict on a core claim.

### Instructional designer

- **Purpose:** converge brief and research into a learning plan scoped to the reader's time, plus a reviewable mockup. It specifies _what_ each segment must achieve, its cognitive layout constraints, and its UX intent, not _how_ it is rendered.
- **In:** `brief.md`, all research files except `parking-lot.md` (it gets that file's headings only), `references/learning-science-patterns.md` (+ `cognitive-design-patterns.md`), and `references/ux-ui.md`.
- **Out:**
  - `learning-plan.md`. Per segment:
    - objectives and claims;
    - readiness, interactivity and max elements;
    - mode and blueprint;
    - **cognitive layout constraints** (contiguity, pacing, redundancy, scaffold; vocabulary from `references/cognitive-design-patterns.md` §4 and `ux-ui.md`);
    - **UX intent**: what the reader does, and how the segment behaves on mobile;
    - widget `complexity`;
    - comprehension items, where the designer judges they earn their place. A piece whose goal is light exposure or a reference overview, such as a quick tour of chess openings, may have none, and the plan states why in one line.

    The overall shape (article, scrollytelling, full-page widget, or a mix) is chosen and justified here, as are the ToC decision and the token approach.
  - `cut-list.md`: what was left out and why, plus `## If it runs long`, the parts in the plan ranked by what to cut first.
  - `mockup.html`: a low-fidelity local wireframe the user opens in a browser. It shows:
    - real headings and segment intents;
    - placeholder figures with written descriptions;
    - any comprehension items;
    - a mobile/desktop layout toggle for segments whose layout changes;
    - an **asset panel** that lists each candidate third-party asset with its licence and clearance.
  - **Acceptance criteria** in the plan, which builders and reviewers both use. This is the sprint contract.
- **Authority (intended):** writes to `run/plan/` only.
- **Done:** `check_plan.py` passes.
- **Blocker triggers:**
  - the scope can't be met at the target depth. It reports `contradiction` and offers rescoping options.
  - research has an unresolved conflict on a core claim.

### Page builder

- **Purpose:** turn the approved plan into the page: shell, design tokens, ToC, layout, prose, captions, comprehension checks, and simple figures (static SVG, small animations).
- **In:**
  - the approved `learning-plan.md`;
  - `facts.md`;
  - `assets.md` together with the asset decisions from `decisions.md`;
  - `references/{ux-ui,graphics,widgets,sourcing}.md` and `kit/`;
  - `brief.md`.
- **Out:**
  - `site/index.html` and `site/assets/*`;
  - `site/widgets/manifest.json`: for each widget, its mount point, size contract and declared CDN origins.
- **Authority (intended):** writes to `site/` except `site/widgets/<id>/`.
- **Pre-flight:** before building, check each segment's layout constraint against 360px and confirm that every asset the plan uses is cleared. Infeasibilities go back as one early blocker, not mid-build.
- **Done:** `verify.mjs` passes on its parts, and every plan segment is implemented (no placeholders, no content beyond the plan).
- **Blocker triggers:**
  - a layout constraint is infeasible at mobile width;
  - an asset is uncleared or unavailable.

### Widget builder (0–N, parallel)

- **Purpose:** one complex interactive piece in isolation, e.g. a simulation, a sandbox, or a step-locked canvas.
- **In:**
  - the widget's segment spec, blueprint and acceptance criteria;
  - the mount and size contract;
  - `tokens.css`;
  - the relevant facts;
  - `references/{graphics,widgets}.md` and `kit/`;
  - an explicit "not your job" list (prose, other widgets, global CSS).
- **Out:** `site/widgets/<id>/`, as a self-contained module that mounts into `[data-widget=id]`, uses tokens only, and leaks no global CSS. It also declares its CDN origins in the manifest entry, which the page builder created.
- **Authority (intended):** writes to `site/widgets/<id>/` only.
- **Pre-flight:** before building, confirm that the spec's model of the phenomenon is consistent with the facts it cites.
- **Done:** it passes `verify.mjs --widget <id>` at 360/768/1280 widths, and all its acceptance criteria are met.
- **Effort scaling (guidance, not a cap):**
  - spawn a widget builder only for widgets the plan marks `complexity: high`;
  - the page builder handles simple ones;
  - more than about 4 suggests the plan is too big for its budget, so check that first.

### Accuracy reviewer (fresh, no site edits)

- **Purpose:** check every factual claim on the rendered page against `facts.md` and, where cheap, against the source.
- **In:** `brief.md`, `facts.md`, the built `site/`, and `scripts/probe.mjs`. It does **not** see builder reports or the plan's reasoning.
- **At depth `none`:** `facts.md` is model-sourced, so a same-model reviewer could share its errors. In that case the reviewer **web-verifies the core claims itself** (those tied to objectives), up to about 10.
- **Out:** `review/round-N/accuracy.md`, a list of findings. Each finding has a location, the claim, a verdict (`unsupported` / `contradicted` / `misleading-simplification` / `ok-but-uncited`), evidence, and a severity (`blocking` / `should` / `nit`).
- **Calibrated with:** labelled pass and fail examples in its prompt. One example is a simplification that's fine for the audience; another is one that teaches something false.

### Pedagogy & UX reviewer (fresh, no site edits)

- **Purpose:** judge the rendered piece against the plan's acceptance criteria and intent, the instructional-design audit checklist, and the UX rules. It works from `verify.mjs` screenshots at three widths and drives the interactions with `scripts/probe.mjs`: click, drag, step through, screenshot.
- **In:** `brief.md`, `learning-plan.md` (acceptance criteria and intent), the built `site/`, and the screenshots.
- **Out:** `review/round-N/pedagogy-ux.md`, with per-criterion scores and findings in the same format as the accuracy reviewer.
- **Calibrated with:** labelled pass and fail examples in `agents/pedagogy-ux-reviewer.md`. Fail examples: a legend instead of direct labels, a widget with no prediction prompt where the plan called for one, prose that restates a figure. Pass example: a check-free overview whose plan justified it.
- **Effort scaling:** for short pieces (≤5 min, ≤1 widget), the two reviewers merge into one agent with both rubrics.

## State and handoffs

```
explainers/<slug>/
├── site/                     # deployable; nothing else is published
│   ├── index.html
│   ├── assets/ (tokens.css, kit helpers, images, vendored libs if not CDN)
│   └── widgets/<id>/ + manifest.json
└── run/                      # audit trail; never deployed
    ├── log.md                # human-readable timeline (orchestrator only)
    ├── decisions.md          # every user decision (orchestrator only)
    ├── state.json            # stage, counters, spawn count, timestamps (scripts only)
    ├── brief.md
    ├── research/ plan/ review/round-N/ screenshots/round-N/
    ├── handoffs/NN-<agent>.prompt.md   # exact prompt sent
    ├── handoffs/NN-<agent>.report.md   # exact report returned
    └── history/NNN-<label>/            # snapshot before any spawn that may mutate
```

- **Namespace ownership:** each directory has exactly one writer (see the contracts). Reviewers never edit `site/`. User decisions live in `decisions.md`, so no agent-owned file is edited by anyone else.
- **Handoffs are self-contained:** the orchestrator writes every subagent prompt to `handoffs/` _before_ spawning, using `templates/handoff.md`. The fields:
  - the root request verbatim;
  - brief path;
  - invariants verbatim;
  - **relevant user decisions** (checkpoint notes, asset approvals, waivers), quoted from `decisions.md`;
  - inputs by path;
  - output paths;
  - done predicate;
  - not-your-job list;
  - in revision rounds, the findings to address, by ID.
- **Versioning:**
  - Before each dispatch, `round_gate.py dispatch` copies the target namespaces into `history/NN-<role>/` and records a file manifest. `round_gate.py receive` diffs against it.
  - The log entry links the snapshot, the handoff, the report and the findings that caused the change.
  - A human can follow any change from log line to diff without forensics.
- **Log format:** one entry per event (stage start/end, spawn, report, gate result, user decision). Each entry has a timestamp, the actor, a one-line summary, links, and decisions with their reasons. `scripts/log.py` appends entries so the format stays consistent.
- **Resume:** `state.json` records the current stage. Rerunning the skill on an existing run directory resumes from the last completed stage.
  - Within a session, revisions continue the same builder.
  - In a new session that's impossible, so the builder is respawned with its prior report, the findings, and the current artifacts. The log notes that it is a respawn.

## Research depth and convergence (the divergence problem)

The user picks a depth at intake. The orchestrator proposes one based on the topic.

| Depth | When | Researchers | Caps (checked by `check_research.py` from the files) |
|---|---|---|---|
| `none` | well-trodden topic, model knowledge suffices | 0 | claims marked `source: model`; accuracy reviewer web-verifies core claims |
| `light` (default for ≤10 min) | verify key claims, find misconceptions | 1 | ≤12 claims, ≤8 sources, ≤5 examples, ≤4 misconceptions |
| `standard` (default for longer) | niche or recent topics, codebase topics | 1 | ≤25 claims, ≤15 sources, ≤8 examples, ≤6 misconceptions |
| `deep` | contested, technical, or high-stakes | 2–3 split by objective | ≤40 claims, ≤25 sources, ≤12 examples, ≤8 misconceptions (totals) |

The optional fill-in round for unresolved questions counts inside the same caps. Tool-call budgets appear in the researcher's prompt as guidance only, because a script can't see a subagent's tool calls. The run-level spawn and time caps (below) are what actually bound cost.

Convergence is enforced at five points:

1. **Research is question-driven.** Researchers get questions derived from the objectives, not "the topic". Each claim must name the objective it serves. Each claim is a single assertion, which blocks mega-claims that dodge the count. Anything off-objective goes to `parking-lot.md`, and the designer sees only its headings.
2. **Objectives are few and visible.** The brief targets about one objective per 3–5 minutes (`check_plan` warns beyond that). The user sees the objectives at the checkpoint, so broad objectives that would let anything count as on-objective are caught there.
3. **Scope is sized in ideas, not words.** The designer judges how many ideas fit the reader's time and cuts whole ideas when there are too many. There are no word estimates anywhere in the pipeline. An earlier version gated the plan's word estimate (invariant I5, ≤ 1.15× the budget). The designer passed it by planning compressed prose, the builder copied that prose, and the page became hard to follow. Every check counted content items and none counted the connectives, so the length pressure was paid in clarity. The built page's measured reading time is *reported* to the reviewer and in the final report, never gated. If it runs long, the user (or a top-level agent) picks cuts from the plan's ranked cut order.
4. **There is a cut list.** The designer must say what it left out. The human sees the cut list next to the mockup and can pull items back in, which then means cutting something else or accepting a longer piece. Its `## If it runs long` section ranks the parts still in the plan, so cuts after the build are the user's choice, not the builder's.
5. **Drift is surfaced.** `check_plan.py` warns about any segment that maps to no objective, and about any objective that has no comprehension item and no stated reason. Build-time creep counts as fake compliance: content not in the plan is a review finding, and the accuracy reviewer flags claims missing from `facts.md` as `unsupported`.

## Termination and budgets

| Loop | Done predicate | Max rounds | No-progress rule | Enforced by |
|---|---|---|---|---|
| Intake clarification | brief fields complete | 2 question rounds | — | SKILL.md |
| Research | `check_research.py` passes | 1 (+1 fill-in, same caps) | same unresolved set → stop and record | `round_gate.py research` |
| Plan ↔ human | user approves | 3 | identical user notes twice → escalate with options | `round_gate.py checkpoint` |
| Build ↔ gate | `verify.mjs` passes | 3 per builder | same failing check IDs twice → pivot instruction, then block | `round_gate.py gate` |
| Review ↔ revise | no open `blocking` findings | 2 | a finding stays open across both rounds → escalate | `round_gate.py review` |

- **Run-level caps** (in `round_gate.py`, checked before *every* spawn):
  - total spawn count, scaled by depth and size (e.g. light/≤10 min: 8; deep/long: 20);
  - wall-clock since run start, from `state.json` timestamps (default 90 minutes of agent time, excluding time spent waiting on the user).

  Either cap tripping escalates to the user with the option to extend.
- **`round_gate.py` refuses** to authorise the next spawn while any of these is outstanding:
  - the previous spawn's report file is missing;
  - the previous dispatch wrote outside its namespace and that hasn't been acknowledged (`ack`);
  - a cap has been reached.

  This makes the bookkeeping a precondition, not a courtesy.
- **Stable findings across review rounds:**
  - The orchestrator assigns IDs (`A-03`, `P-07`) when it ingests a review.
  - Round-2 reviewers are fresh, but they receive the round-1 findings and the builder's dispositions. Their job is to **verify closure**: each finding becomes `closed`, `still open`, or `dispute upheld`.
  - They may raise *new* findings only at `blocking` severity.

  This keeps "no progress" detectable and stops each fresh reviewer from moving the goalposts.
- **Post-approval plan changes:**
  - If a blocker forces a change that alters objectives, segments, the overall shape or the assets, the designer is respawned with the blocker and current plan. The user then sees a short **delta** (batched where possible), not the whole checkpoint again.
  - Changes that leave all of those the same, such as an alternative mobile layout for the same segment, are logged and listed in the final report.
  - Re-plans count against the caps.

## Verification

**Gate first (deterministic, `scripts/verify.mjs` via Playwright).** It runs at widths 360, 768 and 1280, and saves screenshots for the reviewers. Checks:

- no horizontal overflow (unless the brief records a confirmed mobile waiver);
- no console errors;
- all resources load;
- **static only:** no fetch, XHR, WebSocket or beacon calls to origins not declared in the manifest. Script, style, font and media loads from any CDN are allowed;
- SVG markers: every `marker-start`/`marker-mid`/`marker-end` reference resolves, and each rendered marker sits inside its SVG's viewport, so none is clipped;
- **finite animations have replay:** any animation found through `document.getAnimations()` with finite iterations, plus any element marked `data-anim="once"` for JS-driven or canvas animations, must have a reachable `[data-replay]` control. The `data-anim` convention is documented in `references/graphics.md` and covered by the kit;
- carousels (`[data-carousel]`) keep the same container height across pages, so there is no reflow;
- every third-party `<img>`, `<video>` and `<iframe>` has an entry in `assets.md` with `clearance: license`, or an approval in `decisions.md`, and its attribution is visible;
- all internal URLs are relative, so the folder deploys to any host or subpath;
- no leftover placeholders (`TODO`, `lorem`, `[placeholder]`, empty mount points);
- **reported, not gated:** built reading time, page weight, number of requests.

`scripts/probe.mjs` is a small CLI that reviewers and builders use to drive interactions without writing Playwright code: `--do click:<sel>`, `drag:<sel>:dx,dy`, `fill:<sel>=v`, `key:`, `text:`, `attr:`, `shot:`.

`verify.mjs --phase page` is for the page builder before the widgets exist. Unbuilt widgets are reported as pending, not failed. The orchestrator's gate never uses it.

**Warn-only:** `legibility` flags SVG text that renders below 11px at a width (usually a desktop diagram scaled onto a phone), and a carousel without numbered controls. Reviewers judge these. They aren't gated, because the user's requirements don't make them invariants.

**Then the reviewers** score what the gate can't check. They run on the rendered page, not just the source. Their rubrics weight the criteria models are _weak_ on, not the ones they ace:

- **Accuracy:** unsupported claims, or simplifications that are misleading for this audience.
- **Pedagogy:** judged against the plan's own stated intent, not a fixed checklist.
  - Where the plan calls for engagement, are the Constructive moments at the key ideas?
  - Where it names a misconception, is it actually confronted?
  - Is there split attention, such as legends or captions far from their figures?
  - Is there prose that restates a figure?
  - Does the element count fit the audience?

  If the plan deliberately omits checks, the reviewer judges whether that call was reasonable for the brief and doesn't penalise the omission itself.
- **UX:**
  - whether interaction affordances are obvious;
  - whether the widget teaches or only animates;
  - mobile usability beyond overflow (tap targets, whether the reader can see both the controls and their effect);
  - captions and labels.

**Fake compliance the reviewers look for:**

- placeholder figures labelled done;
- widgets that are a static image;
- comprehension checks with no feedback (when checks exist);
- claims dropped from the plan without a cut-list entry;
- **content added beyond the plan;**
- a mockup-only segment left in the final page;
- a disposition marked `fixed` when the issue is still visible.

**Feedback is bounded:** each finding names a criterion, evidence, a location, and the fix it expects. "Needs more depth" is not a valid finding.

## Constraints

| ID | Constraint | Tier | Source | Enforced by |
|---|---|---|---|---|
| I1 | No horizontal overflow at 360px (unless a confirmed waiver is recorded) | invariant | user | verify.mjs |
| I2 | Static only: no runtime data calls to undeclared origins; no backend | invariant | user | verify.mjs |
| I3 | Third-party media is shown with attribution and is cleared by licence for the intended use, or approved by the user case by case | invariant | user | verify.mjs + assets.md + decisions.md |
| I4 | Finite animations have a replay control | invariant | user | verify.mjs |
| I5 | *Retired.* Was: the plan's word/time estimate within 1.15× of the budget. Removed because it pushed agents to compress prose (see Convergence, point 3) | — | — | — |
| I6 | Carousels don't reflow the page between pages | invariant | user | verify.mjs |
| I7 | SVG markers resolve and aren't clipped | invariant | user | verify.mjs |
| I8 | Agents write only in their namespace | invariant (soft; see below) | designer | round_gate.py receive (manifest diff), gated on the next dispatch |
| P1 | Factual accuracy, including faithful simplification | preference #1 | user | accuracy reviewer |
| P2 | Instructional effectiveness (judged against the plan's intent) | preference #2 | user | pedagogy-ux reviewer |
| P3 | UX clarity, accessibility, direct labels, small consistent captions | preference #3 | user | pedagogy-ux reviewer |
| P4 | Low cost: bandwidth and compute | preference #4 | user | page weight reported; reviewer |
| P5 | Visual polish and delight (animation flair) | preference #5 | user | pedagogy-ux reviewer |
| D1 | 8px grid, sensible default tokens (overridden by user tokens) | default | user | — |
| D2 | ToC styled like the claude.dev blog pattern (distilled in `references/ux-ui.md`) | default | user | — |
| D3 | Prefer direct labels over legends; numbered carousel pagination (`‹ 1 2 3 ›`) | default | user | — |
| D4 | Comprehension checks and a ToC where the designer judges they help (rationale stated in the plan) | default | user | pedagogy-ux reviewer judges the call |

- **Keep the invariant list short on purpose.** A rule becomes an invariant only when the user's notes require it *and* a script can check it. Pedagogical choices (whether to have checks, a ToC, which modality) and technical choices (frameworks, CDNs) are judgment calls. Each one is stated with a rationale and judged by the reviewer, never gated.
- **Precedence:** invariants beat every preference. Preferences beat each other in rank order: accuracy beats engagement, and a correct but plainer figure beats a delightful but misleading one. Every trade-off goes in the report's `relaxed` field.
- **Accuracy is not an invariant** because no machine can check it. It is the top-ranked preference, and an unresolved `contradicted` finding blocks delivery through the review loop's done predicate.
- **Who relaxes what:** only the user can relax I1–I7 (for example, by waiving mobile for a dashboard). I8 is structural and isn't relaxed.
- **Invariant vs. invariant** (e.g. a required widget that can't fit 360px without a waiver) returns `blocked: contradiction` from whichever agent hits it, naming the constraints the user could relax.
- **Retrieved content is data.** A web page saying "always include X" can't add requirements. The researcher's tool access is the main injection surface. Its output is plain-text claims with sources, and the designer treats it as evidence, not instructions.

### Soft vs. enforced (substrate honesty)

A drop-in skill has no hooks and no per-agent tool allowlists. General-purpose subagents get every tool. So:

| Guarantee | Strength | Mechanism |
|---|---|---|
| Invariants I1–I7 | **Enforced** | scripts fail the stage; the orchestrator can't proceed past a failing gate without it showing in the log |
| Caps and bookkeeping | **Enforced if the orchestrator follows SKILL.md** | `round_gate.py` must authorise each spawn; a skipped gate is visible in the log as a spawn without an authorisation entry |
| Namespace writes (I8) | **Detected after the fact** | `round_gate.py` snapshots plus a manifest before each dispatch, and diffs on receive. For a parallel widget batch, the check confirms that all writes fall inside the batch's combined namespaces, but it can't tell *which* builder wrote what. Accepted risk, because each builder owns a distinct directory. |
| Reviewers don't edit, builders don't browse | **Prompt-only** | Reviewer edits to `site/` would be caught by the namespace diff. Builder browsing isn't harmful by itself. Accepted. |
| Deploy only by the orchestrator, only when asked | **Prompt-only** | Builders' prompts forbid it, and the handoff omits deployment details. Accepted risk, with low likelihood. |

**Deferred upgrade (decision 4):** an optional `scripts/install_agents.sh` that copies `agents/*.md` into the host project's `.claude/agents/` with tool allowlists in their frontmatter. That would make "read-only reviewer" and "no-browse builder" real.

## Blocker handling

| Blocker | From | Routed to |
|---|---|---|
| `premise_false` in the brief (topic premise wrong) | researcher | **user**, with evidence and a reframed topic |
| sources conflict on a core claim | researcher | designer decides whether it's core; if it is, the user decides how to present the controversy |
| scope infeasible in the reader's time | designer | **user**: rescope, allow more time, or narrow objectives |
| asset with `clearance: needs-user` | researcher | **user**, at the checkpoint (per asset: approve with attribution, or substitute) |
| layout infeasible on mobile | page/widget builder (pre-flight) | designer (alternative layout; a delta goes to the user if the change alters the plan) → user only if a waiver is the only option |
| missing or unavailable asset | builder | designer (substitute a drawn figure); a delta goes to the user |
| contradicted claim found in review | accuracy reviewer | owning builder, fix against `facts.md`; if `facts.md` itself is wrong, researcher fill-in (within caps) |
| `disputed` finding disposition | builder | the closure reviewer judges the evidence; if still split, the user decides |

- **Siblings on `premise_false`:** running subagents can be stopped but not paused. If a widget's underlying model turns out to be wrong, the orchestrator stops the sibling widget builders that cite the same claims. Once the claims are fixed, it respawns them with their partial work and the correction.
- Concerns are deduplicated into the final report.

## Escalation

The human is involved at five points:

1. intake clarification;
2. the plan checkpoint (always);
3. post-approval plan deltas;
4. blockers whose source is the user;
5. any cap tripping.

The escalation artifact is `run/escalation.md`. It holds what failed, which constraint or contract item, what was tried (with links into `history/`), and 2–3 options. The question is presented through AskUserQuestion. Many per-asset decisions are batched (several per question, up to four questions per call). Long lists are presented as a numbered list in the mockup's asset panel, and the user answers in one reply.

The checkpoint itself shows:

- the local mockup path, opened in the browser;
- the objectives;
- a summary of the plan;
- the cut list;
- `check_plan` warnings;
- any `needs-user` assets.

The options are approve, revise with notes, or rescope. Media clearance is decided per case because the right answer depends on the piece's use: a commercial course and a personal blog differ. Intake records `intended_use` when the request states it. When it doesn't, the question is asked at the checkpoint, and only if a `needs-user` asset exists.

## Assumption ledger

| Component | Assumes the model can't… | Evidence | Removal test | Status |
|---|---|---|---|---|
| Separate designer agent | hold the plan and build the page in one context without the plan eroding | expected; untested | baseline vs pipeline on 10 tasks: compare plan-adherence findings | test first |
| Widget builders | build ≥2 complex widgets plus prose in one context | context pressure | page builder does all widgets; compare gate failures and review findings | keep for `high` widgets |
| Two reviewers instead of one | apply accuracy and pedagogy rubrics together without one crowding out the other | rubric dilution | merged reviewer on the eval set | already merged for short pieces |
| Research at `light` | recall common facts accurately | hallucination on niche specifics | compare `none` vs `light` accuracy findings on common topics | test |
| Accuracy reviewer web-verifying at `none` | catch its own model's errors without external evidence | same-model correlated errors | compare findings with and without web verification | keep |
| Builder pre-flight | notice infeasibility before spending budget | ImpossibleBench-style fake compliance | count pre-flight blockers vs. mid-build blockers | test |
| `kit/arrow.js` | place SVG arrowheads correctly unaided | prior iteration failed consistently (user) | builds without the kit; count marker/visual findings | keep until tested |
| ~~`check_plan` time estimate~~ | converge without a numeric budget | divergence concern (user) | — | removed: word estimates pushed agents to compress prose; scope is sized in ideas, and a slightly long page goes to the user to cut |
| Pivot-instruction on no-progress | escape repeated gate failures alone | general | count pivot successes | keep |

**Structural (keep regardless of model):**

- the human checkpoint;
- the deterministic gate;
- reviewer independence;
- namespace ownership;
- round and run caps;
- handoff and log persistence;
- typed status reports with dispositions;
- `decisions.md` as the single record of user authority.

## Evaluation plan

- **Task set:** ~24 topics:
  - 3 audiences (HS student, HN reader, upper-level major) × 4 sizes (3-min, 10-min, 30-min, full-page widget);
  - plus 4 codebase-specific topics;
  - plus 4 should-ask cases: ambiguous audience, false premise ("explain why heavier objects fall faster"), infeasible scope, a request needing a mobile waiver;
  - plus 2 should-*not*-check cases, such as the chess-openings overview, to confirm that the designer doesn't bolt on checks mechanically.
- **Baseline:** one agent, same references, kit and gate, no subagents.
- **Metrics:**
  - blocking accuracy findings, from an external reviewer on a different model or a human spot check;
  - instructional-design checklist pass rate;
  - built reading time vs the brief's time;
  - gate failures per round;
  - tokens, cost and wall-clock;
  - human checkpoint revision rounds.
- **Traces:** `run/` is the trace. Failures are tagged with MAST codes in `evals/results.md`.

## Failure-mode review

Reviewed by a fresh agent on 2026-10-19. Its findings are incorporated above.

| MAST | Mitigation |
|---|---|
| FM-1.1 disobey task spec | invariants in the gate; acceptance criteria in the plan; reviewers check against them |
| FM-1.2 disobey role | one writer per namespace; namespace diff on every receive, gated on the next dispatch; orchestrator told not to author (soft; see "Soft vs. enforced") |
| FM-1.3 step repetition | round_gate counters; stable finding IDs; no-progress rules |
| FM-1.4 loss of history | everything on disk; `state.json` resume; handoffs and reports paired (round_gate checks) |
| FM-1.5 unaware of stop | done predicates per agent; per-loop and run-level caps in `round_gate.py` |
| FM-2.1 conversation reset | continue builders within a session; respawn with prior report + findings across sessions |
| FM-2.2 no clarification | intake asks for what can't be inferred; pre-flights; blocker path with threshold |
| FM-2.3 task derailment | root request verbatim in every handoff; objectives visible at checkpoint; content-beyond-plan finding |
| FM-2.4 info withholding | handoff template carries invariants verbatim, user decisions, and the not-your-job list |
| FM-2.5 ignored input | per-finding dispositions required; orchestrator logs each blocker's routing |
| FM-2.6 reasoning-action mismatch | reviewers judge the rendered page, not builder claims; closure review checks `fixed` dispositions |
| FM-3.1 premature termination | done predicates checked by scripts, not trusted |
| FM-3.2 incomplete verification | Playwright gate + probe-driven interaction review + accuracy review |
| FM-3.3 incorrect verification | calibrated pass and fail examples; web verification at depth `none`; human checkpoint on the plan |

## Decisions log

| # | Question | Decision (user, 2026-10-19) | Where applied |
|---|---|---|---|
| 1 | Publish the mockup as a shareable link? | No. The mockup is a local file. The system is deployment-agnostic: it produces an easy-to-deploy static folder and deploys only when the original request includes instructions. | Context (Done), mockup, Deliver, verify (relative URLs) |
| 2 | Strict-licence media only, or fair use too? | Per case, because commercial and personal use differ. | Researcher `clearance` field, I3, `decisions.md`, checkpoint asset panel, blocker routing |
| 3 | Must every piece carry comprehension checks (old I6)? | No. Avoid artificial constraints; the designer or orchestrator makes the judgment call. | I6 removed (now carousel reflow); D4; check_plan warns instead of failing; reviewer judges against the plan's intent |
| 4 | Ship `install_agents.sh` for real tool allowlists? | Not now. Privilege boundaries stay prompt-only and are detected after the fact (see "Soft vs. enforced"). | Soft vs. enforced |

## Open questions

None currently.
