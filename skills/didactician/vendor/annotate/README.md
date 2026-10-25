# Vendored: @reviewjs/annotate

`annotate.js` is `@reviewjs/annotate` 1.5.3 (MIT, see `LICENSE`), from
https://github.com/reviewjs/annotate at commit `1748d22081c01e0d2d92d1724a1915e8b48fd4ca`, unmodified.

`scripts/human_review.mjs` injects it into the review browser only. It is never copied into `site/`.
It is vendored rather than loaded from a CDN so a review works offline and the version can't drift.
