# Widgets: interactive pieces

## 1. When a widget earns its place

Build a widget when the reader learns by **manipulating** the system:

- discovering a relationship (goal-free sandbox, blueprint B2);
- testing a prediction;
- stepping through a process at their own pace (B1);
- completing a partial solution (B3).

If the reader would only *watch*, it's an animation (graphics.md §7). If nothing changes when they act, it's a figure. A widget the reader only watches feeds the illusion of understanding (learning-science-patterns §10). Pair it with a prediction or a question the reader explores.

## 2. The interface contract (page builder ↔ widget builder)

The page builder owns `index.html`. A widget builder owns only `site/widgets/<id>/`.

**Page builder:**

- Places the mount where the plan puts the widget. Reserve its height so nothing jumps when it loads:

  ```html
  <div data-widget="w-pendulum" class="d-wide" style="min-height: 420px"></div>
  ```

  Use `.d-wide` or `.d-full` per the plan's `size:`. Add `aria-label` if the widget has no visible heading.
- Includes, once, near the end of `<body>`:

  ```html
  <script src="assets/widget.js"></script>            <!-- kit helper -->
  <link rel="stylesheet" href="widgets/w-pendulum/index.css">
  <script src="widgets/w-pendulum/index.js"></script>
  ```

- Writes `site/widgets/manifest.json`:

  ```json
  { "data_origins": [],
    "widgets": { "w-pendulum": { "segment": "s-02", "mount": "[data-widget=\"w-pendulum\"]",
                                  "size": { "desktop": "960×420", "mobile": "100%×520, controls below" },
                                  "files": ["index.js", "index.css"], "cdn": [], "data_origins": [] } } }
  ```

**Widget builder:**

- Writes exactly `site/widgets/<id>/index.js` (required) and `index.css` (optional; write an empty file with a comment if there's no CSS, since the page links it), plus any assets it needs inside that folder.
- Uses the kit's `Didactician.widget(id, init)` (see `kit/widget.js`): DOM-ready, mount lookup, double-init guard, resize/visibility/replay hooks, and a visible error state.
- **Scopes all CSS** under `[data-widget="<id>"]`. No global selectors, no `body`/`html` rules, no `!important` wars. Uses **tokens** (`var(--c1)`, `var(--sp-2)`…), never literal colours.
- Lays out from the **container width** (`ctx.onResize`), not `window.innerWidth`. The same widget may sit in a 680px column or full width.
- Loads libraries with `Didactician.load(url)` from a CDN, with exact versions (e.g. `d3-scale@4.0.2`). Lists them in its report so the page builder can add them to the manifest's `cdn`. Never fetches runtime data from third-party APIs unless the user asked for live data (gated, I2). Vendors data into the widget folder as JSON or JS instead.
- If a library is needed by several widgets, says so in its report. The page builder can then load it once.

**Ownership boundaries:** prose around the widget, captions outside the mount, and the ToC belong to the page builder. If the widget needs different surrounding text, the widget builder says so in its report (`concerns`) rather than editing `index.html`.

## 3. Interaction design that teaches

- **Start in the interesting state.** Defaults show the phenomenon, not a degenerate case.
- **Few controls.** Expose only the variables the segment is about (≤ 3 at once for novices; the plan's `max-elements`). Constrain ranges to the meaningful region and show units.
- **State is visible where it happens.**
  - Live values sit next to the control and on the canvas element they affect.
  - Changes animate briefly (150–300ms), so the reader can see *what* changed.
- **Immediate, continuous feedback.** Update on `input`, not `change`. No apply buttons. Keep frame times under 16ms (§5).
- **Prediction first, where the plan asks for it:**
  - lock or hide the outcome until the reader commits (a choice, or a "set your guess" marker);
  - then reveal;
  - then explain why, naming the misconception.
- **Step-through for processes:** ‹ step › controls, a visible counter ("Step 3 of 7"), only the active change highlighted, and the step's explanation *on the canvas* or directly beside it. Gate a key step on a prompt when the plan says `pacing: gated on k-NN`.
- **Reset** for sandboxes. **Replay** for one-shot animations (`data-replay`, gated I4).
- **Mobile:**
  - controls below the canvas, with the canvas sticky if the controls scroll;
  - touch targets ≥ 44px;
  - drag handles big enough for a thumb;
  - no hover-only affordances.
- **Keyboard and screen readers:**
  - native inputs where possible;
  - arrow keys for custom draggables;
  - an `aria-live="polite"` sentence describing the current state ("Period: 2.0 s, length 1.0 m"), updated on change.

## 4. Choosing tools (lowest cost first)

Choose by what the widget needs, not by habit. Bandwidth and compute are a ranked preference (P4), so a heavier library needs a reason in your report.

| Need | Default | Heavier options (justify) |
|---|---|---|
| Diagrams, sliders, small simulations | Vanilla JS + SVG + kit helpers | — |
| Scales, shapes, axes | `d3-scale`, `d3-shape`, `d3-axis` (individual modules, a few KB each) | full `d3` (~90KB) |
| Charts | Observable Plot | Vega-Lite, Chart.js |
| Many moving elements (particles, fields, cellular automata) | Canvas 2D | PixiJS; WebGL via regl |
| Physics | Hand-rolled integrator (often 20 lines) | matter.js, planck.js |
| 3D | Avoid unless the idea is inherently 3D | three.js |
| Maths typesetting | KaTeX | MathJax |
| Code display and highlighting | `<pre><code>` + small CSS; Prism with only the needed languages | Shiki |
| Scrollytelling | IntersectionObserver (kit `.d-scrolly` styles) | Scrollama |
| Reactive documents (inline adjustable numbers, Tangle-style) | Small vanilla binding: `<span data-var="n">` updated on input | Idyll (a full document language; usually more than one page needs) |
| Draggable maths/graphics | Pointer events + SVG | g9 (auto-derives interactive graphics from a draw function) |
| Tweak panels for parameters | Native inputs styled with tokens | lil-gui (the maintained successor to dat.gui) |

**The explorabl.es toolset** (Idyll, Tangle, Apparatus, g9, LOOPY, Joy.js, dat.gui, Observable, Kinetic Graphs, Emoji Simulator) is good inspiration for interaction patterns. Two caveats:

- Several are standalone authoring apps, not libraries you embed: Apparatus, LOOPY, Observable, Emoji Simulator. Others are unmaintained: Tangle (2011), dat.gui (use lil-gui).
- Borrow the *patterns* freely:
  - Tangle's draggable inline numbers;
  - LOOPY's causal-loop diagrams;
  - Kinetic Graphs' draggable economics curves;
  - g9's "drag any point and the constraints follow".

**CDN rules:**

- Prefer jsDelivr or cdnjs, with an exact version and a release at least a couple of weeks old.
- Load only what's used (individual d3 modules, KaTeX without unused fonts where possible).
- If the brief says the piece must work offline, vendor files into `site/assets/vendor/` instead.

## 5. Performance

- Animate with `requestAnimationFrame`. **Pause when off-screen** (`ctx.onVisible`) and when the tab is hidden.
- Avoid layout thrash. Batch DOM reads before writes, and animate `transform`/`opacity`, not layout properties.
- SVG is fine up to a few hundred elements. Beyond that, use canvas, with labels in HTML.
- Canvas: size it by `devicePixelRatio` and redraw on resize.
- Budget: the whole page should feel instant on a mid-range phone. The gate reports page weight; reviewers judge it against what the widget teaches.

## 6. Checking your own widget

```bash
node <skill>/scripts/verify.mjs --out <out> --widget <id>          # gate, scoped to your mount
node <skill>/scripts/probe.mjs --out <out> --width 390 \
  --do "scroll:[data-widget=<id>]" --do "shot:start@[data-widget=<id>]" \
  --do "fill:#len=2" --do "text:[data-widget=<id>] output" --do "shot:after@[data-widget=<id>]"
```

Look at the screenshots at 360 and 1280. A passing gate doesn't mean the widget teaches. Check it against the plan's acceptance criteria one by one before reporting `done`.
