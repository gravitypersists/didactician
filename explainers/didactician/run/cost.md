# Cost: didactician

**This run cost 13.6M tokens (run in progress, stage: build).** The biggest share went to orchestrator (29%).

## Where it went

    Orchestrator         ████████████████████████████████   3.9M   29%
    Build                ████████████████████████████░░░░   3.4M   25%
    Fixes (gate)         ███████████████████████████░░░░░   3.2M   24%
    Review               ████████░░░░░░░░░░░░░░░░░░░░░░░░   953k    7%
    Plan                 ██████░░░░░░░░░░░░░░░░░░░░░░░░░░   780k    6%
    Research             ██████░░░░░░░░░░░░░░░░░░░░░░░░░░   706k    5%
    Replan               █████░░░░░░░░░░░░░░░░░░░░░░░░░░░   634k    5%

## The three biggest costs

1. **Agents continued for more rounds, carrying their earlier work: ≈1.4M (10%)**
4 continuations, mostly 04 page-builder and 05 widget-builder w-pipeline, started with a median of 198k of context already loaded, and every turn re-read it. 4 of them started after the cache had expired, so that context was written again from scratch first.

2. **Reading big files whole: ≈444k (3%)**
9 whole reads of files over 20 KB. Most read: (a large tool output Claude Code saved to a file) (46 KB) 5× by 4 agents; run/plan/learning-plan.md (37 KB) 2× by 2 agents.

3. **Screenshots: ≈339k (3%)**
109 images went into agent contexts (07 pedagogy-ux-reviewer took in 31, orchestrator (main session) took in 20). Each one stays in context and is re-read on every later turn.

## Most expensive agents

    orchestrator (main session)         ████████████████████████   3.9M   29%
    04 page-builder                     ██████████████░░░░░░░░░░   2.3M   17%  + 1 continuation
    05 widget-builder w-pipeline        ███████████░░░░░░░░░░░░░   1.8M   13%  + 1 continuation
    11 page-builder                     ████████░░░░░░░░░░░░░░░░   1.3M   10%  + 1 continuation
    02 instructional-designer           █████░░░░░░░░░░░░░░░░░░░   780k    6%  + 1 continuation
    01 researcher                       ████░░░░░░░░░░░░░░░░░░░░   706k    5%
    13 widget-builder w-blocks          ████░░░░░░░░░░░░░░░░░░░░   607k    4%
    12 widget-builder w-pipeline        ████░░░░░░░░░░░░░░░░░░░░   576k    4%
    + 4 more                                                       1.6M   12%

---

<details>
<summary>Every dispatch and round (17 rows)</summary>

| who | round | stage | turns | context first → peak | started cold | cost | images |
|---|---|---|---:|---|:-:|---:|---:|
| orchestrator (main session) | orchestrator | Orchestrator | 51 | 64k → 153k |  | 923k | 5 |
| 01 researcher | spawn | Research | 40 | 33k → 137k |  | 706k |  |
| 02 instructional-designer | spawn | Plan | 15 | 33k → 127k |  | 465k |  |
| 03 instructional-designer | continue | Plan | 8 | 128k → 145k | yes | 315k |  |
| 04 page-builder | spawn | Build | 49 | 33k → 233k |  | 1.5M | 12 |
| 05 widget-builder w-pipeline | spawn | Build | 45 | 33k → 197k |  | 1.2M | 12 |
| 06 accuracy-reviewer | spawn | Review | 25 | 33k → 115k |  | 390k | 3 |
| 07 pedagogy-ux-reviewer | spawn | Review | 34 | 33k → 133k |  | 564k | 31 |
| 08 page-builder | continue | Fixes (gate) | 16 | 235k → 263k | yes | 761k | 3 |
| 09 widget-builder w-pipeline | continue | Fixes (gate) | 14 | 199k → 223k | yes | 594k | 1 |
| orchestrator (main session) | orchestrator | Orchestrator | 139 | 48k → 240k |  | 3.0M | 15 |
| 10 instructional-designer | spawn | Replan | 8 | 33k → 88k |  | 157k |  |
| 10 instructional-designer | spawn | Replan | 20 | 33k → 129k |  | 477k |  |
| 11 page-builder | spawn | Fixes (gate) | 40 | 33k → 194k |  | 1.0M | 9 |
| 12 widget-builder w-pipeline | spawn | Fixes (gate) | 27 | 33k → 133k |  | 576k | 14 |
| 13 widget-builder w-blocks | spawn | Build | 22 | 33k → 146k |  | 607k | 4 |
| 14 page-builder | continue | Fixes (gate) | 3 | 197k → 200k | yes | 276k |  |

</details>

<details>
<summary>How cost is counted</summary>

Cost is in input-equivalent tokens: each kind of token is weighted by its price relative to normal input, so cache reads count 0.1, cache writes 1.25 (2 for 1-hour writes) and output 5. That keeps runs comparable when prices or models change. Raw counts are in `cost.json`, and per-turn data is in `usage/`.

The biggest costs are estimates (≈) and overlap, so they don't add up to the total:

- **Carried earlier work:** for each continuation, the context it started with beyond what the agent started with when first spawned, times the turns it was re-read, plus the re-write when the cache had expired. It doesn't count the turns a fresh agent would spend getting its bearings.
- **Screenshots:** each image's estimated tokens (pixels / 750 after the API's downscaling), written once and re-read on every later turn of the same agent.
- **Big files read whole:** files of 20 KB or more read with no line range, at about 4 bytes per token, held the same way.

Orchestrator turns are those between its first and last command touching this run, so a session that did other work in between is counted in full.

</details>
