# Human review: site, round 1

_Submitted 2026-10-25T15:05:06-04:00 · index.html · 30 comment(s). Reviewed on the frozen copy in `build/` (sha256:7f02c200cb073833bab798fe1281c3c8e26385537a04a3c200006343cd44dd75). Each block is the user's own words._

### #1 · open
type: block
on: "Didactician is a Claude Code skill that turns a request like “explain X to Y” into a static explainer page. It plans every page as a lesson: who the reader is, what they should be able to do afterwards, and what to leave out."
selector: `#s-01 > div:nth-of-type(3) > p:nth-of-type(1)`

> I think this introduction needs to indicate that this is mindful for content with heavy cognitive loads. We also should indicate that it's a multi-agent system and is quite heavy on token usage. As well, we should treat didactician a bit less like an input/output box, and more that it aims to be a pedagogically sound pipeline tool explicitly built for human in the loop reivew processes.

### #2 · open
type: block
on: "Being an Account of a Machine that Plans Its Pages as Lessons"
selector: `#s-01 > p:nth-of-type(1)`

> Let's indicate that this page was built via the didactician tool

### #3 · open
type: highlight
quote: "The first shows the machinery: eight stages, each handing the next a file, and why the pipeline is built that way. The second opens the stage that makes the output teach rather than merely inform, and the idea from learning science it rests on: cognitive load."
context: …ave out. § 1.This page comes in two halves. [The first shows the machinery: eight stages, each handing the next a file, and why the pipeline is built that way. The second opens the stage that makes the output teach rather than merely inform, and the idea from learning science it rests on: cognitive load.] How Didactician TeachesContents└§ 2 The…

> Too wordy. Let's just say the first half is about the pipeline process. The second half explains the pedagogical motivations.

### #4 · open
type: highlight
quote: "Scroll on: each step opens one stage, and the plate stays in view."
context: …The whole apparatus [Scroll on: each step opens one stage, and the plate stays in view.] Eight stages take you from a one-li…

> Let's get rid of this comment here, maybe a simpler "scroll v" underneath this box might be prudent.

### #5 · open
type: highlight
quote: "You type one line."
context: …Stage 1 · Intake brief.md [You type one line.] Your own Claude Code session acts as the orches…

> Let's avoid talking about one line - building pages from simple one liners isn't exactly the selling point here. It can do it, sure, but we want to also motivate well-reasoned and thought through input as well.

### #6 · open
type: highlight
quote: "For this page it asked none."
context: …a question only when it can’t infer the answer. [For this page it asked none.] Stage 2 · Res…

> irrelevant. remove this please.

### #7 · open
type: highlight
quote: "It asks you a question"
context: …ey should be able to do afterwards. [It asks you a question] only when it can’t infer the answer. For this pa…

> Let's change this to "The orchestrator will ask you a question"

### #8 · open
type: highlight
quote: "A researcher"
context: …Stage 2 · Research facts.md [A researcher] answers the brief’s questions and stops at a ca…

> "A fresh researcher agent"

### #9 · open
type: block
on: "A researcher answers the brief’s questions and stops at a cap. Each claim it keeps is tied to an objective and goes into the fact base with a source, a quote and a confidence."
selector: `#s-02 > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(3) > p:nth-of-type(2)`

> This overall text is a little dry and a bit too tactical. Let's make it a bit more strategic sounding, something along the wording of "The researcher's job is to collect facts and sources to drive the rest of the pipeline from."

### #10 · open
type: highlight
quote: "The card shows one of this page’s real checkpoint answers: the user chose to keep all four of the plan’s objectives."
context: …wn as a decision that later stages must follow. [The card shows one of this page’s real checkpoint answers: the user chose to keep all four of the plan’s objectives.] Stage 5 · Bui…

> this sentence is confusing, let's remove it

### #11 · open
type: highlight
quote: "Your answer is written down as a decision that later stages must follow"
context: …t, then approve, revise or rescope. [Your answer is written down as a decision that later stages must follow] . The card shows one of this page’s real checkpo…

> "and which also show up in the audit trail."

### #12 · open
type: highlight
quote: "On a piece of this length, each complex widget, like this plate, gets a builder of its own."
context: …page: the prose, the figures and the exercises. [On a piece of this length, each complex widget, like this plate, gets a builder of its own.] All of them work from the approved…

> This is a bit too passive. Let's say something more along the lines of "This is where we also build widgets. The visualization we are looking at now is one of these widgets. Each widget gets a fresh builder agent."

### #13 · open
type: highlight
quote: "All of them"
context: …s plate, gets a builder of its own. [All of them] work from the approved plan and the fact base, n…

> "Every agent"

### #14 · open
type: block
on: "On a piece of this length, two reviewers, one for accuracy and one for teaching and UX, each start in a fresh context. Both see the brief and the page; the accuracy reviewer also gets the fact base, and the teaching reviewer gets the plan. Neither ever sees the builder’s report."
selector: `#s-02 > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(8) > p:nth-of-type(2)`

> Let's introduce the review step on it's own rather than "on a piece of this length." Let's just indicate that there are two reviewers and what they check for.

### #15 · open
type: highlight
quote: "it"
context: …wn. What matters is the shape, and each part of [it] exists to prevent a failure you have probably m…

> "the pipeline"

### #16 · open
type: highlight
quote: "page builder"
context: …Problem 1 · Predict The [page builder] has finished the page. Before it ships, which c…

> I think this is the first time we refer to this as "the page builder" and it's easy for a reader to construe this as the full didactician pipeline. Maybe instead something like "After the build step..."

### #17 · open
type: highlight
quote: "plate"
context: …one of four rules that shape the pipeline. The [plate] below is the same apparatus, with each rule dra…

> Let's rename "plate" everywhere to "diagram"

### #18 · open
type: block
on: "That answer is one of four rules that shape the pipeline. The plate below is the same apparatus, with each rule drawn onto the part it governs."
selector: `#s-03 > p:nth-of-type(2)`

> This sentence makes no sense to me. We're introducing the diagram below, but why? Let's take a fresh stab at this.

### #19 · open
type: highlight
quote: "Your main session dispatches agents and records what they return."
context: …1 · The orchestrator never authors [Your main session dispatches agents and records what they return.] It never writes the content, the plan, the site…

> "Your main session is the orchestrator. It acts as your point of communication, and dispatches agents, recording what they return."

### #20 · open
type: highlight
quote: "So no reviewer is grading work that its own context produced, and the raw research stays out of the context that writes the prose."
context: …the site code or a review verdict. [So no reviewer is grading work that its own context produced, and the raw research stays out of the context that writes the prose.] Rule 2 · Ever…

> This writing is a bit confusing, and it's a pretty important point. Let's try and reword it.

### #21 · open
type: highlight
quote: "Stages hand each other files, never chat."
context: …Rule 2 · Everything is a file [Stages hand each other files, never chat.] Each agent’s prompt and its report are saved as…

> Stages aren't agents. Agents hand each other files and they never chat with one another. I understand we want to avoid introducing subagents, but we can talk about how the orchestrator will coordinate between the stages with artifacts.

### #22 · open
type: highlight
quote: "was told and what it said back"
context: …fterwards you can read exactly what every agent [was told and what it said back] . Rule 3 · Scr…

> This is confusing, because you just told me "they never chat" and now we're talking about what it said back? Let's introduce that each agent communicates via a strict structure.

### #23 · open
type: block
on: "Rule 3 · Scripts gate what’s checkable"
selector: `#s-03 > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(3) > p:nth-of-type(1)`

> I'm not understanding the value in communicating this rule, maybe it's how it's worded. but these scripts just enforce the rules of the handoffs. I'm not sure it's worth promoting to the reader here, as it's implementation details that don't really matter (I can be convinced otherwise though)

### #24 · open
type: block
on: "The skill’s design notes call a wrong premise in the plan the most expensive error in the system, since every later stage builds on it."
selector: `#s-03 > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(4) > p:nth-of-type(2)`

> This is a little weak, we're referencing the skills design notes? Let's be a bit more authoritative here, it's part of the skill's design philosophy to present a human in the loop check early on to prevent cascading issues through the pipeline. This is a cost and time cutting maneuver.

### #25 · open
type: block
on: "Read this word: characteristics."
selector: `#s-04 > p:nth-of-type(1)`

> This "characteristics" example is flawed. The example confuses low-level sensory perception with cognitive load in learning or problem-solving, making the mechanism feel artificial rather than intuitive. Instead let's try:
> 
> Look at this expression:
> 
> Python
> total = sum(x for x in values if x > 0)
> A non-programmer: Must track 10 distinct tokens (total, =, sum, x, for, in, values, if, >, 0), look up their definitions, and mentally simulate how each symbol connects to the next.
> 
> An experienced developer: Reads it in a fraction of a second as one standard schema: "sum positive numbers."
> 
> The code does not change. For the novice, tracing the syntax exhausts their working memory before they even determine what the program does. For the developer, long-term memory compresses the entire expression into a single working-memory slot, leaving mental bandwidth free to think about architecture or edge cases.

### #26 · open
type: highlight
quote: "For you"
context: …plained what a subagent or a context window is. [For you] , would adding a step-by-step explanation of the…

> we say for you, but this answer probably has a different answer for somebody familiar with subagents than it does somebody who is not. In a sense, I think it can add more cognitive load not to mention subagents because somebody who has already grokked the role of subagents doesn't need to wonder what the page is hinting at.

### #27 · open
type: block
on: "Older accounts of the theory added a third kind, germane load: the effort that builds understanding, which instruction should increase. Critics argued that a theory with a good, a bad and a neutral load can explain any result after the fact, which makes it hard to falsify (de Jong, 2010). The theory’s authors now describe germane load as working memory redirected from extraneous activity toward the content, rather than an extra quantity added to the total (Sweller et al., 2019)."
selector: `#s-04 > details:nth-of-type(1) > p:nth-of-type(1)`

> not a comment on this section but a comment on the progressive disclosure here, there's no affordance that you can click on this.

### #28 · open
type: highlight
quote: "Older accounts of the theory added a third kind, germane load: the effort that builds understanding, which instruction should increase. Critics argued that a theory with a good, a bad and a neutral load can explain any result after the fact, which makes it hard to falsify (de Jong, 2010). The theory’s authors now describe germane load as working memory redirected from extraneous activity toward the content, rather than an extra quantity added to the total (Sweller et al., 2019). So Didactician doesn’t try to add “good” effort. It removes friction from the presentation and points the attention that frees up at the content"
context: …Why not a third, “good” kind of load? [Older accounts of the theory added a third kind, germane load: the effort that builds understanding, which instruction should increase. Critics argued that a theory with a good, a bad and a neutral load can explain any result after the fact, which makes it hard to falsify (de Jong, 2010). The theory’s authors now describe germane load as working memory redirected from extraneous activity toward the content, rather than an extra quantity added to the total (Sweller et al., 2019). So Didactician doesn’t try to add “good” effort. It removes friction from the presentation and points the attention that frees up at the content] . § 5 Stage 3: Wher…

> I don't understand this, genuinely.

### #29 · open
type: block
on: "§ 5 Stage 3: Where Load Becomes Page Decisions"
selector: `#h-s05`

> Section 5 is a little confusing, and I'm not sure how valuable it is. It may be worth instead replacing it with all of the building blocks that didactician works with, including progressive reveals, multiple choice, predict then reveal, as simple examples built-in. Impress upon the reader that agents can have the freedom to explore other user interface approaches (hypothesize more interactive elements like embedded socrates or feynman style challenges connecting to live llm driven AIs).

### #30 · open
type: shape (rect)
on: "Plate III. One Machine, Labelled Two Ways Pl. III Which stage writes findings.md? ANumbered, names in a key 1 brief.md 2 facts.md 3 learning-plan.md 4 decisions…"
selector: `#plate-3 > div:nth-of-type(1) > div:nth-of-type(1)`
shot: shots/c1ji7wbi1sfpkmx1ktx7jv.png

> Not sure this question is relevant to the diagram
