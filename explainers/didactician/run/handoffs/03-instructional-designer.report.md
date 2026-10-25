status: done_with_concerns

artifacts:
- /Users/m/workspace/didactician/explainers/didactician/run/plan/learning-plan.md — k-03 removed. o-2 checks are now k-01; o-4 checks are now k-04, plus coverage from w-plan2page. s-05, ac-10 and the k-04 feedback are updated ("three questions").
- /Users/m/workspace/didactician/explainers/didactician/run/plan/cut-list.md — new rows: k-03, the word-gate story (x-04 and the history half of c-11), and m-02/m-04 confrontation, each with reason d-03. The `## If it runs long` list is renumbered and the "Not on the list" note updated.
- /Users/m/workspace/didactician/explainers/didactician/run/plan/mockup.html — the Problem 4 block is gone and the remaining checks are labelled Problems 1–3 in order. The objectives panel, the s-05 tags and intent, the Fig. 2 placement, and both cut tables are updated.
- check_plan.py: PASS. It still gives one warning: 4 objectives for 8 minutes, which the user accepted in d-02.

summary: Applied d-03 with the smallest change I could. k-03 is deleted, along with all of the word-gate story and its Solution text. k-03 no longer appears anywhere in learning-plan.md or mockup.html. The ID isn't reused, and k-01, k-02 and k-04 keep their IDs. In s-05, the F-cut card now sits after Problem 3 beside one neutral draft sentence ("the designer sizes the scope by how many ideas fit your time, and lists what it left out; you see that list before anything is built"). The plan explicitly tells the builder not to tell the word-gate story. Objectives, the other segments, the shape and the visual direction are unchanged.

concerns:
- s-05 no longer lists o-2. Its only o-2 content was k-03, and o-2 is still covered by s-03 (k-01 and W1–W4) and s-06. For the same reason I swapped c-05 for c-01 in s-05's claims. c-05 is still cited in s-03.
- c-11 is still cited in s-05, but only for its first half (scope sized in ideas, the cut list), which backs the neutral sentence. Its retired-gate history and x-04 are in the cut list. If the user wants no mention of sizing scope at all, the sentence and F-cut can go: F-cut is already first in the cut order.
- m-02 ("hard rules make agents reliable") and m-04 ("more content is more value") are no longer confronted anywhere. I listed this in the cut list with a way to add them back that doesn't use the word-gate story.
- k-04 is now o-4's only check, so I took it out of the "If it runs long" order.

relaxed:
- none

dispositions:
- d-03: fixed — k-03 removed from the plan (Comprehension items, s-05, Objectives, ac-10) and the mockup (Problem 4 block, objectives panel, cut tables). The word-gate story is cut to the cut list with reason d-03; the only remaining mention of scope is the one neutral sentence in s-05. Problem labels are 1–3 in order.
