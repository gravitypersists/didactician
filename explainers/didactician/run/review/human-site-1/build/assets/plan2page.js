/* w-plan2page (Plate IV, complexity low; built by the page builder).
   Four reader-advanced states. Each highlights lines of this page's own s-04 plan entry, outlines
   the region of the § 4 thumbnail they produced, joins the two with an engraved connector, and
   states the load reason. Keyboard: ‹ › buttons, or ←/→ while the plate has focus. */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var root = document.getElementById('w-plan2page');
  if (!root) return;

  var STATES = [
    { reason: '<b>Objective → check.</b> Objectives are written as what the reader can do, so the checks follow from them: o-3 asks the reader to predict, and Problem 2 asks for a prediction.',
      live: 'Step 1 of 4: objective o-3 produced Problem 2, the prediction check.' },
    { reason: '<b>Load → sequence.</b> Working memory is limited, so the reader meets one thing before its name, and no more than a few new things at once: the “characteristics” example comes before any term.',
      live: 'Step 2 of 4: max-elements 3 and the mode line produced the opening example.' },
    { reason: '<b>Labels on the thing, never a legend.</b> Split attention is extraneous load, so the parts carry their own names.',
      live: 'Step 3 of 4: labels written on each node produced version B of Plate III.' },
    { reason: '<b>A prediction at the key idea.</b> Optional depth is hidden for readers who want it, so the target reader isn’t slowed by it.',
      live: 'Step 4 of 4: checks k-02 and the collapsed scaffold produced Problem 2 and the optional note.' },
  ];

  var stage = root.querySelector('.p2p-stage');
  var lines = Array.prototype.slice.call(root.querySelectorAll('.p2p-lines li[data-s]'));
  var regions = Array.prototype.slice.call(root.querySelectorAll('.t-reg[data-r]'));
  var wire = root.querySelector('.p2p-wire');
  var reason = root.querySelector('.p2p-reason');
  var live = root.querySelector('.p2p-live');
  var count = root.querySelector('.p2p-count');
  var prev = root.querySelector('.p2p-prev');
  var next = root.querySelector('.p2p-next');
  var i = 0;

  function rel(el) {
    var a = el.getBoundingClientRect(), b = stage.getBoundingClientRect();
    return { x: a.left - b.left, y: a.top - b.top, w: a.width, h: a.height };
  }

  function drawWire() {
    var W = stage.clientWidth, H = stage.clientHeight;
    wire.setAttribute('width', W); wire.setAttribute('height', H);
    wire.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    while (wire.lastChild) wire.removeChild(wire.lastChild);
    wire.__dMarkers = null;              // markers lived in the removed <defs>
    var on = lines.filter(function (l) { return +l.getAttribute('data-s') === i + 1; });
    var reg = regions.filter(function (r) { return +r.getAttribute('data-r') === i + 1; })[0];
    if (!on.length || !reg) return;
    var first = rel(on[0]), last = rel(on[on.length - 1]);
    var ly = (first.y + last.y + last.h) / 2;
    var r = rel(reg);
    var pad = 3;                                   // the outline sits 3px outside the region
    var sw = 1.5, color = 'var(--accent)';
    var stacked = stage.querySelector('.p2p-thumb').getBoundingClientRect().top >
                  stage.querySelector('.p2p-plan').getBoundingClientRect().bottom - 1;
    var thumb = rel(stage.querySelector('.p2p-thumb'));
    var box = { x: r.x - pad, y: r.y - pad, width: r.w + 2 * pad, height: r.h + 2 * pad };
    // Regions flush with the thumbnail's left edge are entered from the left; others (Plate III's
    // version B, on the right) from above, so the wire never crosses version A.
    var fromTop = r.x - thumb.x > 40;
    var x0, gx, d, from;
    if (!stacked) {
      // side by side: leave the plan column's right edge and turn in the gutter between the columns
      var plan = rel(stage.querySelector('.p2p-plan'));
      x0 = plan.x + plan.w + 4; gx = x0 + (thumb.x - x0) / 2;
    } else {
      // stacked: leave the line on the left and run down the left gutter
      x0 = first.x - 2; gx = 8;
    }
    if (fromTop) {
      var ty = box.y - 12, tx = box.x + Math.min(box.width / 2, 40);
      d = 'M' + x0 + ',' + ly + ' H' + gx + ' V' + ty + ' H' + tx;
      from = { x: tx, y: ty };
    } else {
      var ry = box.y + box.height / 2;
      d = 'M' + x0 + ',' + ly + ' H' + gx + ' V' + ry + ' H' + (box.x - 18);
      from = { x: box.x - 18, y: ry };
    }
    var path = document.createElementNS(NS, 'path');
    path.setAttribute('d', d);
    path.style.stroke = color; path.style.strokeWidth = sw; path.style.fill = 'none';
    path.style.strokeLinejoin = 'round';
    wire.appendChild(path);
    var dot = document.createElementNS(NS, 'circle');
    dot.setAttribute('cx', x0); dot.setAttribute('cy', ly); dot.setAttribute('r', 2.5);
    dot.style.fill = color;
    wire.appendChild(dot);
    // the last short run carries the head; kit/arrow.js lands it on the region's outline
    var target = fromTop ? { x: from.x - 1, y: box.y, width: 2, height: box.height } : box;
    Didactician.arrow(wire, from, target, { color: color, width: sw, gap: 2, head: 5 });
  }

  // Reserve the tallest reason's height so the ‹ › buttons never move between steps.
  function sizeReason() {
    var keep = reason.innerHTML, h = 0;
    reason.style.minHeight = '0px';
    STATES.forEach(function (st) { reason.innerHTML = st.reason; h = Math.max(h, reason.offsetHeight); });
    reason.innerHTML = keep;
    reason.style.minHeight = h + 'px';
  }

  function set(n) {
    i = Math.max(0, Math.min(STATES.length - 1, n));
    lines.forEach(function (l) { l.classList.toggle('on', +l.getAttribute('data-s') === i + 1); });
    regions.forEach(function (r) { r.classList.toggle('on', +r.getAttribute('data-r') === i + 1); });
    reason.innerHTML = STATES[i].reason;
    live.textContent = STATES[i].live;
    count.textContent = (i + 1) + ' of ' + STATES.length;
    prev.disabled = i === 0;
    next.disabled = i === STATES.length - 1;
    drawWire();
  }

  prev.addEventListener('click', function () { set(i - 1); });
  next.addEventListener('click', function () { set(i + 1); });
  root.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { set(i + 1); e.preventDefault(); }
    else if (e.key === 'ArrowLeft') { set(i - 1); e.preventDefault(); }
  });
  var lastW = 0;
  if ('ResizeObserver' in window) new ResizeObserver(function () {
    if (root.clientWidth !== lastW) { lastW = root.clientWidth; sizeReason(); }
    drawWire();
  }).observe(stage);
  window.addEventListener('load', drawWire);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { sizeReason(); drawWire(); });
  set(0);
  sizeReason();
  live.textContent = '';   // don't announce on page load; only on reader action
})();
