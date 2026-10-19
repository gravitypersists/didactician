# UX and UI for explainers

UX is cross-cutting. The designer decides what the reader *does* in each segment and how it behaves on a phone. The builders make it obvious, fast and comfortable. The reviewers check it on the rendered page. Everything here is a **default**: override it with a stated reason when the piece calls for it. Only the invariants in SKILL.md are gated.

## 1. The reader's experience, start to finish

- **The first screen answers three questions:** what this is, who it's for, and how long it takes. Use the title, a one-sentence standfirst, and a meta row (reading time, audience). No "In this article we will…".
- **Show the payoff early.** Open with a concrete case, a striking result, or a question the reader wants answered. Withhold the formalism until it's needed (concrete → abstract → concrete; see learning-science-patterns §11).
- **One idea per screenful** in the core segments. When a figure needs the text beside it, keep them in the same viewport: side by side on desktop, sticky canvas plus scrolling steps on mobile.
- **Every interactive element signals that it's interactive:** a visible control, a cursor change, a short inline cue ("drag the weight"). The reader shouldn't have to discover interactivity by accident.
- **Immediate feedback.** A control's effect appears in under 100ms, right next to the control. No apply buttons for continuous parameters.
- **Sensible starting states.** Each widget loads showing the interesting case, not a blank or degenerate one. There's always a way back: a reset control, or the state is easy to restore.
- **No dead ends.** End with a short recap or next step: what to explore next, where this sits in the course. Don't end on a quiz with no closure.

## 2. Layout: 8px grid and tokens

- **Spacing, sizes and line heights are multiples of 8px**, from the kit tokens (`--sp-1` = 8px … `--sp-12` = 96px). Use 4px half-steps only inside tight UI such as chips and captions.
- **Tokens:** use `kit/tokens.css` unless the user supplied tokens. If they did, map their values onto the kit's variable names rather than inventing new ones, so components and widgets keep working. Never hard-code colours or sizes in a widget.
- **Widths:**
  - prose measure: ~66ch;
  - `.d-wide`: ≤ 960px, for figures that need room;
  - `.d-full`: edge to edge, for full-page widgets.

  Figures may be wider than the prose. Text never is.
- **Breakpoints:**
  - 360 (smallest supported phone);
  - 600 (large phone / small tablet);
  - 900 (scrollytelling goes side by side);
  - 1100 (ToC rail appears).
- **Gutters:** 16px on phones, growing with the viewport. Content never touches the screen edge.
- **Page skeleton:** see the comment at the top of `kit/components.css`. Hero, then a page grid with an optional rail, then main.

## 3. Typography

- Body: 18/28 desktop, 17/26 mobile, serif (kit default) or the user's choice. Headings in sans, tight letter-spacing, `text-wrap: balance`.
- Captions and labels: 13px sans in a muted ink. UI chrome (rail, kicker, meta): mono, small caps-style uppercase with letter-spacing.
- Numbers that change (widget outputs): tabular monospace, so they don't jitter.
- Maths: KaTeX (render at build time if possible, or the auto-render CDN). Inline maths only for short expressions. Display maths gets its own line, and its symbols are introduced *before* the equation.

## 4. Table of contents (when the designer chooses one)

The default pattern is distilled from the claude.dev blog and implemented by `kit/toc.js` + `components.css`:

- **Desktop (≥ 1100px):** a sticky left rail in a mono, small type.
  - The article title fades into the rail only once the H1 has scrolled out of view.
  - A muted "CONTENTS" label sits above the links.
  - One link per h2, prefixed with a muted `└` glyph, truncated with an ellipsis.
  - The active section (scrollspy) turns full ink.
  - h3 links appear (expanding with a grid-rows transition) **only under the active h2**, which keeps the rail short.
  - Below the links: an ASCII progress line `█████░░░░ 41%`, then "N MIN READ".
- **Mobile:** no rail. A collapsed **Contents** disclosure at the top of main. It closes after a jump.
- **When:** the designer's call, recorded in the plan. As a rule of thumb, a ToC helps when there are more than ~4 sections or the piece takes more than ~5 minutes. A single-screen piece or a full-page widget usually needs none.

## 5. Mobile (supported unless the user waived it)

- **No horizontal page scroll** at 360px (gated). Intentional horizontal scrollers, such as a wide table or a timeline, are contained in an `overflow-x: auto` element and visibly cut off at the edge, so the scroll affordance shows.
- **Controls and their effect are visible at the same time.** On a phone that usually means the canvas is sticky at the top (≤ 55vh) and the controls or steps sit below it. Never put a slider two screens away from what it changes.
- **Touch targets ≥ 44×44px.** Nothing depends on hover: no hover-only labels or tooltips that carry required information.
- **Re-layout, don't shrink.** A desktop diagram scaled to 360px makes its text unreadable (the gate warns below 11px). Stack it vertically, simplify it, or use a mobile-specific viewBox (see graphics.md "Mobile diagrams").
- **Check landscape phone (~740×360)** when sticky canvases are involved. A sticky element taller than the viewport traps the reader.

## 6. Figures, captions, labels

- **Captions:** one consistent style (`figcaption` / `.d-caption`: 13px, muted, directly under the figure).
  - A caption says what the figure *can't*: the takeaway, the condition, units, a source.
  - It never restates what's visible ("A blue circle with an arrow…").
  - Optionally lead with a bold "Figure N." Keep captions to 1–2 lines.
- **Direct labels, not legends.** Put the label on or beside the thing: the line end, the region, the node.
  - A legend makes the eye travel and hold a mapping in memory (split attention).
  - If space is truly too tight, use a colour-matched inline key *in the sentence* that refers to the figure.
- **Colour carries meaning, consistently.** If `--c1` means "the input" in figure 1, it means the input everywhere. Never use colour as the only channel: pair it with a label, position or pattern.
- **Highlight only what changes.** In multi-step figures, dim the unchanged context and emphasise the 2–3 elements that change in this step.

## 7. Carousels

Use one only for **parallel, independent** items, such as three cases of one rule, where seeing one at a time is fine. Content the reader must compare side by side belongs in a grid or a contrastive matrix. Hiding it in panels forces the reader to hold the hidden one in memory (temporal split attention).

- Use numbered pagination `‹ 1 2 3 ›` (the `kit/carousel.js` default), not dots.
- **No reflow** (gated): all pages occupy the same box at the tallest page's height, so switching pages never moves the content below.
- Arrow keys work, the current page is announced (`aria-current`), and hidden pages are `inert`.

## 8. Comprehension checks (when the designer includes them)

- **Commit, then reveal.** The reader picks or predicts *before* seeing the answer. Feedback explains *why*, especially why the tempting answer is wrong (name the misconception).
- **Open prompts are think-then-reveal:** "Think about it, then show the answer". No free-text boxes by default; readers skip them.
- **Place checks right after the idea they test**, not in a quiz at the end. At the end, interleave items from earlier segments if the plan calls for it.
- **Visual:** `.d-check` card with a kind label (PREDICT / EXPLAIN / APPLY), the prompt, options as large buttons, and feedback in place. Never move the page on reveal.
- **Low stakes:** no scores or "wrong!" in red capitals. A neutral tone and an explanation are what help.

## 9. Accessibility (part of UX, not an afterthought)

- **Contrast:** body ≥ 4.5:1, large text and UI ≥ 3:1. Kit tokens meet this in both themes.
- **Text alternatives:**
  - every figure has an accessible name (`role="img"` + `aria-label`, or `<title>`);
  - informative images have `alt`, decorative ones `alt=""`;
  - widgets describe their current state in text, for example a live `<output>` or an `aria-live="polite"` region updated on change, at a sensible rate.
- **Keyboard:** every control is reachable and operable. Sliders are native `<input type=range>`, or have arrow-key handling. Focus is visible.
- **Motion:** respect `prefers-reduced-motion`. Animations jump to their end state, and replay still works on request. Anything that moves for more than 5 seconds by itself has a pause control.
- **Theme:** support light and dark through the tokens (`prefers-color-scheme`). Check that diagrams don't hard-code white backgrounds.

## 10. Cognitive layout constraint vocabulary

The designer writes these per segment in `learning-plan.md` (see `cognitive-design-patterns.md` §4). Builders must satisfy them, not reinterpret them.

| Field | Values (examples) | What the builder does |
|---|---|---|
| `contiguity` | `inline` (labels on the referent) · `adjacent` (text beside its figure, same viewport) · `sticky` (canvas stays while steps scroll) | Puts the text and the thing it refers to in one place, at every breakpoint |
| `pacing` | `continuous` · `step-revealed` (reader advances) · `gated on k-NN` (next step after a commit) | Implements step controls or scroll steps; gated steps don't reveal until the commit |
| `redundancy` | `no prose restating <figure>` · `captions add condition/takeaway only` | Cuts duplicate text; a caption doesn't narrate the visible |
| `scaffold` | `none` · `collapsed "<label>" for readers who …` · `toggle term definitions` | Builds the reader-controlled `<details class="d-more">`; never hides what the target reader needs |
| `max-elements` | integer | Shows at most this many new interacting elements at once; dims the rest |
