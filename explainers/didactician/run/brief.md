# Brief: How Didactician teaches

<!-- Written by the orchestrator. Root spec for the run: every handoff points here.
     Keep the field names exactly; scripts parse `key: value` lines. -->

## Original request

> We're going to get a bit meta here, and point didactician at itself. Think of this almost like a promotional piece for the skillset itself. A reader, presumably a technical claude code or similar agentic coder user, likely familiar already with skills, will see this and it should as quickly as possibly explain how the system works. I'm thinking maybe a scrollytelling of the pipeline process, with visuals for artifacts. Try not to make it overly detailed, just explain at a high-level what the process is, why the skill does what it does. I think it might also be necessary to introduce cognitive load and lean more on the instructional design aspects of this as well, which is truly what makes this tool interactive. Let's aim for something consumable in no more than ~10 minutes (you can aim for less if you identify less is more).

## Audience

audience: Technical users of Claude Code or similar agentic coding tools, already familiar with skills, subagents and prompting; they found this page and are deciding whether the skill is worth installing
readiness: intermediate
readiness_notes: Assume fluency with agents, skills, subagents, context windows, Playwright-style browser testing. Do NOT assume any instructional-design or learning-science background: cognitive load, worked examples, retrieval practice, etc. are new to most of them. They are skimmers by default; the piece must earn attention fast and tell them how the system works within the first minute or two.

## Scope

time_budget_minutes: 8  <!-- user said "no more than ~10, less if less is more"; 8 is a ceiling, shorter is welcome -->
context: standalone
prerequisites: none assumed beyond audience
out_of_scope: installation walkthrough beyond a one-line pointer; script internals (caps arithmetic, namespace diffing details, verify.mjs check list); every invariant enumerated; the full assumption ledger in DESIGN.md. High-level only: what the process is and why it is shaped that way.

## Settings

research_depth: light
intended_use: commercial  <!-- promotional piece for the skill; treat as public/promotional, prefer drawn figures over third-party media -->
design_tokens: custom — user (d-01): "flashy visual design ... education inspired, maybe a bit scientific (not this newfangled edtech look, something more classical)"
mobile: supported
language: en
deployment: none

## Objectives

- o-1: After reading, the reader can explain the pipeline at a high level (intake → bounded research → plan + mockup → human checkpoint → build → deterministic gate → independent review → deliver) and recognise the artifact each stage produces (brief, facts, learning plan/mockup/cut list, site, gate report, findings).
- o-2: After reading, the reader can explain why the pipeline is shaped this way: the orchestrator never authors, so the reviewer stays independent of the writer; everything is a file; scripts gate what can be checked while agents get judgment calls on the rest; and a human approves the plan before anything expensive is built.
- o-3: After reading, the reader can explain what cognitive load is (limited working memory; load that serves learning vs. load imposed by poor presentation) and predict how a design choice in an explainer raises or lowers it.
- o-4: After reading, the reader can explain how the instructional-design stage turns that into concrete page decisions (objectives stated as what the reader can predict/explain/do, scope sized in ideas not words, a cut list, interactive checks and widgets chosen for learning value rather than decoration), which is what makes the output interactive rather than just a styled article.

## Research questions

- q-1 (o-1): What does each stage of the pipeline actually produce, which agent produces it, and where does it live in a run directory? (Source: skills/didactician/SKILL.md, README.md, templates/, agents/.)
- q-2 (o-1): Which steps are deterministic scripts versus agent judgment, and where is the human involved?
- q-3 (o-2): What failure modes is each structural choice designed to prevent (self-review bias, context bloat from research, runaway loops, unauditable runs, plans no one approved)? (Source: skills/didactician/DESIGN.md.)
- q-4 (o-2): What does a technical reader familiar with agents typically assume or get wrong about multi-agent "generate then review" pipelines that this design addresses?
- q-5 (o-3): What does cognitive load theory actually claim (intrinsic / extraneous / germane load; working-memory limits) and what is its current evidence status, including the critiques of the germane-load construct? Cite primary or authoritative sources.
- q-6 (o-3): Which presentation effects with solid evidence are most relevant to web explainers (split-attention, redundancy, segmenting/pacing, signaling, worked examples, expertise reversal), stated carefully?
- q-7 (o-4): Which learning-science patterns does the skill's references (references/learning-science-patterns.md, references/cognitive-design-patterns.md, agents/instructional-designer.md) direct the designer to use, and how do they map to page features (checks, widgets, scrollytelling, cut list)?
- q-8 (o-4): What do readers new to instructional design commonly get wrong (e.g. "interactive = engaging = effective", "more content = more learning", learning styles)?
