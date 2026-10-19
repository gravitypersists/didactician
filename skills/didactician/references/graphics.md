# Charts, diagrams, animation

## 1. When a figure earns its place

Draw a figure when the reader has to see **structure** (parts and relations), **change** (a process over time or across a parameter), or **comparison** (two cases differing in one feature). Don't draw one when it would only decorate or restate the prose. A figure that is self-explanatory for the target reader replaces prose. It doesn't sit beside prose that says the same thing (redundancy).

Prefer your own drawn figure to an embedded image: it's exact, labelled, themable, and needs no clearance.

## 2. SVG fundamentals

- **Use a `viewBox`, not fixed sizes:** `<svg class="d-svg" viewBox="0 0 640 360" role="img" aria-label="…">`. The kit's `.d-svg` makes it fluid (`width: 100%; height: auto`).
- **Pick viewBox dimensions in multiples of 8.** Lay out on that grid, and keep ≥ 16 units of padding inside the viewBox for strokes, heads and labels near the edges.
- **Coordinates:** keep connected shapes in one coordinate system. Put transforms on whole groups, not on individual nodes that arrows connect to.
- **Strokes:** 2px default (`--stroke`) and 1px for secondary lines; `stroke-linecap: round` for lines without heads. Use `vector-effect: non-scaling-stroke` when the SVG scales a lot and line weight must stay constant.
- **Text in SVG:** use the kit `.d-label` class (13px sans). Add `.d-halo` when a label crosses lines: a stroke in the surface colour drawn under the fill (`paint-order: stroke`). Set `text-anchor` and `dominant-baseline` explicitly. Never convert text to paths.
- **Colours:** use token variables through `style` or CSS: `style="stroke: var(--c1)"`. Presentation attributes like `stroke="var(--c1)"` don't resolve variables in every engine. Fill areas with the `-soft` variants.

## 3. Arrows (read this before drawing any)

Arrowheads are where hand-drawn diagrams fail most. The common failures:

| Symptom | Cause | Fix |
|---|---|---|
| Head hidden inside the target node | Line drawn centre to centre | End the line on the target's **boundary** minus a gap (4px) |
| Head cut off (flat or partial triangle) | Marker content bigger than its `markerWidth/Height` box, or no `viewBox` on the marker | Give the marker `viewBox="0 0 10 10"` and draw the head inside it; or `overflow="visible"` |
| Head clipped at the figure edge | Arrow ends near the SVG edge; the head extends past the viewBox | Pad the viewBox (≥ 16 units), or shorten the arrow |
| Square line end poking through the tip | Line runs all the way to the tip under the head | Trim the line by the head's length; place the head's base at the line end |
| Head points backwards at the start of a path | `orient="auto"` on `marker-start` | Use `orient="auto-start-reverse"` |
| Heads different sizes on different lines | `markerUnits="strokeWidth"` with varied stroke widths | Intended scaling; otherwise use `markerUnits="userSpaceOnUse"` with fixed size |
| Curved arrow's head misaligned | Head angle taken from the chord, not the curve's tangent | Trim along the curve; let `orient` follow the path's end tangent |

**Use the kit.** `kit/arrow.js` does all of this by construction:

```html
<script src="assets/arrow.js"></script>
<script>
  const svg = document.querySelector('#fig-1 svg');
  Didactician.arrow(svg, document.getElementById('a'), document.getElementById('b'), { color: 'var(--c1)' });
  Didactician.arrow(svg, {cx: 80, cy: 120, r: 30}, {x: 300, y: 40, width: 120, height: 56}, { curve: 0.2 });
  const p = Didactician.arrow(svg, nodeB, nodeC, { both: true, dashed: true });
  Didactician.labelAlong(p, 0.5, 'feedback', { offset: 12 });
</script>
```

Shapes can be circle, ellipse or rect elements, or explicit `{cx,cy,r}`, `{cx,cy,rx,ry}`, `{x,y,width,height}` or `{x,y}`. They must share the arrow's coordinate system.

**Drawing by hand?** Copy this marker exactly:

```html
<marker id="ah" viewBox="0 0 10 10" refX="1" refY="5" markerWidth="5" markerHeight="5"
        markerUnits="strokeWidth" orient="auto-start-reverse">
  <path d="M0,0 L10,5 L0,10 z" style="fill: var(--ink-2)"/>
</marker>
```

Then end the line `0.9 × 5 × stroke-width` short of where the tip should land, which is the target's boundary minus the gap. The gate (`verify.mjs`, I7) fails markers that don't resolve, heads cut off by their marker box, and heads outside the SVG. It can't judge whether a head lands on the right spot, so check your screenshot.

## 4. Diagram craft

- **Direct labels**, placed at the end of a line, inside a region, or beside a node. No legends (split attention). Label the thing the prose talks about, using the same words.
- **Show the active change:** in step-through figures, full ink for the 2–3 elements changing in this step and `opacity: .35` for the context. Name the step on the canvas itself, e.g. "Step 2: the valve opens".
- **Put values on the canvas.** When the reader needs a number (a force, a probability, a count), print it on or beside the element it belongs to, live.
- **Consistent visual grammar:**
  - the same shape for the same kind of thing;
  - the same colour for the same role across all figures;
  - arrows mean one thing per figure (flow *or* causation *or* sequence; say which in the caption if it's ambiguous).
- **Align to the grid.** Nodes share baselines and centres. Equal gaps (multiples of 8). Misalignment reads as meaning.

## 5. Mobile diagrams

A 640-wide diagram scaled into a 328px column renders 13px labels at about 6.7px. The gate warns below 11px. Options, best first:

1. **Re-layout for narrow containers.** Draw from JS using the container width (`ResizeObserver` on the figure), switching to a vertical arrangement under ~520px. Arrows from the kit re-route automatically when you redraw.
2. **Two SVGs** (`.only-wide` / `.only-narrow`) with the same content laid out differently, toggled by container queries or media queries. Simple and robust for static figures.
3. **HTML labels over the SVG:** absolutely positioned `<span>`s placed from the SVG's coordinates. They keep a real 13px size at any scale.
4. **Simplify:** drop secondary detail on narrow screens and move it into a caption or a `<details>`.

## 6. Charts

- **Choose by the question:** change over time → line; parts of a whole (few parts) → stacked bar or simple labelled segments (avoid pie charts beyond 3 slices); comparison → bars sorted by value; distribution → histogram or dot plot; relationship → scatter.
- **Direct-label series at their line ends.** Use minimal axes with units in the axis label. Light gridlines, or none.
- **Annotate the point that matters:** the crossover, the outlier, the threshold the text discusses.
- **Tools (lightest first):** hand-rolled SVG with `d3-scale` + `d3-shape` (a few KB), Observable Plot (fast to write, ~50KB), then full d3, Chart.js or Vega-Lite (heavier). Pick by need, not habit.

## 7. Animation

**Animate to convey what a static figure can't:** change over time, cause and effect, the order of steps in a process, a transformation between two representations. Don't animate for decoration, except subtle flair (≤ ~1.5s, e.g. a figure easing in), which is welcome in moderation.

- **One-shot animations get a replay control** (gated, I4). They **start when visible**, not on page load: with the kit, add `data-anim-autoplay="visible"` and key the CSS animation off `.is-playing`.
- **Process animations usually want step controls rather than playback**, so the reader controls the pace (segmenting). Offer ▶ play plus ‹ step ›, and a visible step counter.
- **Loops** are for continuous phenomena (a pendulum, a wave). Anything moving longer than 5 seconds on its own needs a pause control.
- **Timing:** UI transitions 150–300ms; conceptual transitions 400–900ms; a full process demo as long as needed, with controls. Use ease-out for things arriving and ease-in-out for things moving between states.
- **Reduced motion:** honour `prefers-reduced-motion` (the kit does globally). Jump to end states, and keep the replay/step controls working.
- **Markup conventions** (the gate reads them):

  | Attribute | Meaning |
  |---|---|
  | `data-anim="once"` | JS-, canvas- or SMIL-driven one-shot animation; the gate requires a `[data-replay]` control nearby |
  | `data-anim="loop"` | Loops by design; no replay needed (pause still needed if > 5s) |
  | `data-anim="flair"` | Decorative micro-animation; no replay needed |

  "Nearby" means inside the closest `[data-anim-scope]`, `figure`, `[data-widget]` or `section`.
- `kit/replay.js` handles `[data-replay]` clicks. It restarts CSS/Web Animations and SMIL in the scope and fires `didactician:replay` on the scope for JS-driven animations: `Didactician.onReplay(scope, restart)`.

## 8. Canvas and WebGL

Use canvas when there are many moving elements (more than ~500 SVG nodes, particles, fields) and WebGL only for real 3D or very large point counts.

- Keep **labels and controls in HTML** over the canvas, for legibility and accessibility.
- Handle `devicePixelRatio` for crispness.
- Pause the animation loop when the canvas is off-screen (IntersectionObserver).
- Describe the state in text for screen readers.
