status: done

artifacts:
- /Users/m/workspace/didactician/explainers/didactician/site/assets/treatise.css — `.blocks-mount` now reserves min-height 1900px at ≥ 900px. Below 900px it reserves `clamp(2900px, calc(3550px - (100vw - 360px) * 1.43), 3550px)`. That is about 2970px at 768 and 3550px at 360, following the measured 2982px and 3565px, and it stays within the measurements so there's no large gap at 768.
- /Users/m/workspace/didactician/explainers/didactician/site/widgets/manifest.json — the w-blocks `size.desktop` and `size.mobile` now state the measured heights and the reserved values.

gate: `verify.mjs --phase page` passes (page-round-11). No warnings are left, and the w-blocks "pending" check now passes because the widget is built. Text-only reading time is now ~12.4 min, because the widget's text is counted. It is reported, not gated, and it is over the ~10 min ceiling, so the user will need to pick cuts from the cut list's "If it runs long" order.

concerns:
- I did not re-measure the actual w-blocks mount heights after the change; I used the measured values from the handoff. The clamp's lower bound of 2900px is a guess for widths between 768 and 899px, where I had no measurement. If the widget is shorter there, the page will show a small gap.

dispositions: none (no findings in this handoff).
