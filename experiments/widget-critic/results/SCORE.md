# Pilot E1′ result: Ch 5 rev 0, W-02 (`w-sizing-sandbox`)

Scored 2026-10-29 against `PROTOCOL.md`. Critic frozen before any extractor output was read (`FROZEN.txt`).

## Verdict: falsified, by the pre-registered rule

"Every H0 run catches every target the critic catches": all three H0 runs caught all five targets, including T5, which the critic didn't attempt.

## Per-target hits

| Target | Critic run 1 | 2 | 3 | H0 run 1 | 2 | 3 | Round-1 reviewers |
|---|---|---|---|---|---|---|---|
| T1 k-09 "orders 8 then 12" changes nothing | ✓ | ✓ | ✓ | ✓ #1 | ✓ #1 | ✓ #1 | ✓ A-01, P-03 |
| T2 k-08 "several services" over → one | ✓ | ✓ | ✓ | ✓ #3 | ✓ #3 | ✓ #17 | ✓ A-02, P-07 |
| T3 k-04 sends the reader to change `payments`; no control | ✓ | ✓ | ✓ | ✓ #2 | ✓ #2 | ✓ #2 | ✓ P-10 (nit) |
| T4 "spare-node switch" / "idle bar" not printed | ✓ switch; bar only as segment names | ✓ same | ✓ same | ✓ #9 switch, #7 bar is partial | ✓ #5, #6 | ✓ #13, #14 | ✓ P-09 (nit) |
| T5 "rented room" is 13 GB/node, not 16 | — not attempted | — | — | ✓ #6 | ✓ #4 | ✓ #10 | ✓ A-08 (nit) |
| **Total** | **4/5** | **4/5** | **4/5** | **5/5** | **5/5** | **5/5** | 5/5 |

The critic was perfectly stable: three different extractions produced the same four hits. H0 was also stable, and it had higher recall.

## Cost (harness-reported, per run)

| | Tokens | Wall time |
|---|---|---|
| Extractor + critic | ~77k + 0 | ~65 s + <1 s |
| H0 | ~90–102k | ~155–190 s |

The critic is about 20% cheaper in tokens. That's not a meaningful advantage at this scale.

## Non-target flags

The blind rating sheet in the protocol was **skipped**: with the verdict already decided by recall, precision can't change it. This is a deviation from the protocol. The flags are listed here for whoever wants to rate them.

**Critic.** The naming check is noisy, with 4–9 warnings per run. Most are the extractor naming *visual encodings* ("Pod outline", "solid fill", "idle bar segment: not reserved") rather than printed labels, and in run 1 a parenthetical ("Ari's sizing sheet (W-02 as a whole)") defeated the match. The `s-05` path-dependence warning (spare already off from an earlier prompt) is arguably noise. The `sibling` flag (payments *and* notifications not adjustable) is real but abstract. Known bug: the `index.js` string harvester spans across quotes, so evidence lines show code fragments. It doesn't change any target hit, and it was left unfixed so the scored version stays the frozen one.

**H0** found plausible issues the critic's vocabulary can't express:
- "Set each request" when only 3 of 5 can be set (all 3 runs). The user later added `payments`, #25.
- The page never debriefs the "set by processor" answer it asks for (runs 2 and 3).
- The widget's node numbering collides with the story's nodes 05/06 (all 3 runs).
- The spare switch is always exactly +1 node, so "what does insurance cost?" has a fixed answer (all 3 runs).
- The `orders` use of 5.5 GB contradicts §07's Fig. 05 (run 2).
- Six `dispatch` copies are Friday's number, not the usual one (run 3).

Several of these line up with the user's later human-site-1 comments. None is a scored target.

## What this says about the hypothesis

1. **H0 is the wrong strawman in the doc.** "Ask the LLM to critique it" here meant an LLM with the widget's code and a Node shell, and it ran the model itself: every H0 finding cites `evaluate(...)` output. Executing claims is what the critic was meant to add, and a tool-using LLM does it unprompted. The doc's H0 should be specified as *a tool-using LLM with the same artifacts*, because that's the baseline any real pipeline has.
2. **The critic's vocabulary caps its recall.** It can only find mismatches it has an observable for. T5, and most of H0's extras, are about what a label *means* compared with what a number *is*. Covering that needs a hand-written concept layer, which brings back the authoring cost.
3. **What the critic has that H0 lacks is that its output is executable.** Its pointers are re-runnable tests. A plausible use is as a regression check across revisions, not as a discovery tool. This pilot didn't test that.

## Limits

- n = 1 widget, and an unusually friendly one: a pure, exact model already sitting in `model.js`. Scrollytelling widgets, which are most of k8s-course, have no such model.
- The pilot's author had read the targets before writing the checker. That bias could only *help* the critic, so it doesn't weaken a negative result.
- The H0 prompt was scoped to the same question as the critic. A generic "critique this" prompt might do worse. The round-1 reviewers, with a broad brief, still found all five.
