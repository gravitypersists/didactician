status: done_with_concerns

artifacts:
- /Users/m/workspace/didactician/explainers/didactician/run/review/round-1/pedagogy-ux.md — round-1 pedagogy and UX review: 8 scores, 10 findings (2 blocking, 3 should, 5 nit)
- /Users/m/workspace/didactician/explainers/didactician/run/screenshots/probe/ — evidence screenshots. `d1280-*` and `m390-*` came from probe.mjs. `x-*` came from my own Playwright script, used for viewport heights, landscape 740×360 and dark mode, which probe.mjs can't set.

summary: I drove every interaction at 1280 and 390: all 9 "what" states, all 4 "why" states, every Problem (picking the tempting wrong answer, and the answer can't be changed afterwards), all 4 w-plan2page steps by button and arrow keys, the collapsed note, dark mode at both widths, and landscape 740×360. 12 of 13 page acceptance criteria are met. Answering a Problem doesn't move the page (scrollY unchanged). The visual direction (d-01) comes through strongly in both themes.

The 2–3 most important issues:
1. **(blocking)** Plate III doesn't make the reader feel extraneous load. In version A the key says "7 Review · findings.md" in full, so the question "Which stage writes findings.md?" can be answered from the key alone, with no looking back and forth between figure and key. Suggested fix: put the artifact names on A's nodes and only the stage names in the key. The flaw comes from the plan's own spec for this figure.
2. **(blocking, ac-01)** At 1280×800 the first screen shows only the top 4 stages of Plate I, and the "Scroll on" cue is below the fold.
3. **(should)** In Problem 1, the correct option B is twice as long as the others and repeats the Stage 7 card almost word for word, so "self-review is enough" is never really tested. A smaller should: the "format" label on the findings card is cut off at both widths (ac-03).

concerns:
- I marked the Plate III issue blocking even though the plan specified that design, because it is the page's only felt demonstration of o-3. The orchestrator may want to route it to the designer as well as the builder.
- I marked ac-01 blocking because an unmet criterion normally is, even though the fix is cheap layout tightening.
- Reading time is 10.1 min against the brief's 8 (user ceiling ~10). I noted it for information only and didn't make it a finding (d-03).

relaxed:
- none
