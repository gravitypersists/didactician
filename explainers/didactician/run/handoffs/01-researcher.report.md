status: done_with_concerns

artifacts:
- /Users/m/workspace/didactician/explainers/didactician/run/research/facts.md: 12 claims (6 sources); q-1 to q-8 all answered
- /Users/m/workspace/didactician/explainers/didactician/run/research/misconceptions.md: 4 entries (self-review is enough; hard rules make agents reliable; interactive = effective; more content = more value)
- /Users/m/workspace/didactician/explainers/didactician/run/research/examples.md: 5 entries ("characteristics" word / element interactivity; legend vs direct labels for split attention; expertise reversal; the retired word-gate story; this run's own directory as artifact visuals)
- /Users/m/workspace/didactician/explainers/didactician/run/research/parking-lot.md: 9 one-liners (learning styles, redundancy, worked examples, Ginns effect sizes, ICAP evidence base, the unverified "2–3 elements" figure, and others)
- No assets.md. No third-party media was proposed, so drawn figures are assumed.

summary: The check_research.py check passes (claims 12/12, sources 6/8, examples 5/5, misconceptions 4/4, nothing unresolved). For o-1, o-2 and o-4 I read SKILL.md, DESIGN.md, README.md, the designer contract and both learning-science references. For o-3 I used full texts I actually read: Sweller, van Merriënboer & Paas 2019 and de Jong 2010. Self-preference comes from the Panickssery et al. 2024 abstract, and ICAP and learning styles from the Chi & Wylie 2014 and Pashler 2008 abstracts. Three facts likely to surprise the designer:
1. A word-count gate was retired because agents met it by compressing prose until the page was hard to follow (c-11).
2. LLM judges score their own outputs higher than humans would (c-06).
3. Germane load is contested: critics say it lets any result be explained after the fact, and its own authors have redefined it as not an additive load (c-09).

concerns:
- The skill's reference says working memory handles "about 2–3 interacting elements" (learning-science-patterns.md#L9). This is not verified: Sweller 2019 gives no number. The page should not state a precise number unless that is verified. This touches the skill's own reference, so the user may want to fix it.
- check_research.py counts each distinct `path:LINE` as a separate source. Citing several lines of one file would hit the source cap, so I cited the skill files as `path#Lnn`, which the script strips to one source per file. This is a script quirk worth fixing in a later change.
- q-6 is only partly covered as claims. Split attention is c-10 and expertise reversal is example x-03. Redundancy, segmenting, signalling and worked examples went to the parking lot because of the light cap of 12 claims. I did not separately verify Mayer's multimedia principles; split attention is sourced from Sweller 2019.
- c-06 (self-preference) is marked medium: it was tested on GPT-4 and Llama 2, not current Claude models. The skill's own design (DESIGN.md#L505) says the benefit of the reviewer split is untested, so the page should not claim it is proven.
- c-08 sets intrinsic load against extraneous load in one claim. I kept it as a single contrast, not two claims.

relaxed:
- none
