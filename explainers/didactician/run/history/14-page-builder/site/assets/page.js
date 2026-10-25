/* Page behaviour: comprehension checks (commit, then reveal) and the scroll-step driver for the
   two sticky diagrams. Classic script; no dependencies.

   Scroll-step contract with the w-pipeline widget (see widgets/manifest.json):
   - each .d-scrolly holds one [data-widget] mount and .d-step[data-step] elements;
   - the active step is the last step whose top has passed the trigger line;
   - on change, the mount gets data-active-step="<step>" ("" = none yet) and receives a
     CustomEvent "didactician:step" with detail { step, mode, rule, el }. */
(function () {
  'use strict';

  // ---- checks ---------------------------------------------------------------------------
  document.querySelectorAll('.d-check[data-check]').forEach(function (card) {
    var opts = Array.prototype.slice.call(card.querySelectorAll('.d-option'));
    var fb = card.querySelector('.d-feedback');
    var hint = card.querySelector('.d-check-hint');
    opts.forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (card.classList.contains('is-answered')) return;
        card.classList.add('is-answered');
        opts.forEach(function (o) {
          var right = o.hasAttribute('data-correct');
          var mine = o === btn;
          o.setAttribute('aria-pressed', String(mine));
          if (right) o.classList.add('is-right');
          if (mine && !right) o.classList.add('is-wrong');
          if (right || mine) {
            var tag = document.createElement('span');
            tag.className = 'tag';
            tag.textContent = right ? (mine ? '✓ your answer, correct' : '✓ correct') : '✗ your answer';
            o.appendChild(tag);
          }
          o.disabled = true;
        });
        if (hint) hint.hidden = true;
        fb.hidden = false;
        try { fb.focus({ preventScroll: true }); } catch (_) { /* old browsers */ }
      });
    });
  });

  // ---- scroll steps -----------------------------------------------------------------------
  var scrollies = Array.prototype.slice.call(document.querySelectorAll('.d-scrolly')).map(function (sc) {
    var mount = sc.querySelector('[data-widget]');
    var steps = Array.prototype.slice.call(sc.querySelectorAll('.d-step[data-step]'));
    var initial = mount ? (mount.getAttribute('data-active-step') || '') : '';
    return { mount: mount, steps: steps, current: initial === '' ? null : initial, initial: initial };
  });

  function trigger() {
    // Desktop: steps sit beside the canvas, so the middle of the viewport.
    // Mobile: the canvas covers the top ~55%, so the step must reach the lower part of the screen.
    return window.innerHeight * (window.innerWidth >= 900 ? 0.6 : 0.82);
  }

  function update() {
    var line = trigger();
    scrollies.forEach(function (s) {
      var active = null;
      s.steps.forEach(function (st) { if (st.getBoundingClientRect().top <= line) active = st; });
      var key = active ? active.getAttribute('data-step') : (s.initial === '' ? null : s.initial);
      s.steps.forEach(function (st) { st.classList.toggle('is-active', st === active || (!active && st.getAttribute('data-step') === key)); });
      if (key === s.current) return;
      s.current = key;
      if (!s.mount) return;
      s.mount.setAttribute('data-active-step', key == null ? '' : key);
      s.mount.dispatchEvent(new CustomEvent('didactician:step', {
        detail: {
          step: key, mode: s.mount.getAttribute('data-mode'),
          rule: active ? active.getAttribute('data-rule') : null, el: active,
        },
      }));
    });
  }

  var queued = false;
  function onScroll() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () { queued = false; update(); });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', update); else update();

  // ---- Diagram III: arrows between consecutive stages, drawn with Didactician.arrow ----------
  // The stages are laid out in snake order by CSS (the same order as Diagram I); this reads the
  // real positions, so it works at any column count, and redraws when the panel is resized.
  function drawFlows() {
    var arrow = window.Didactician && window.Didactician.arrow;
    if (!arrow) return;
    document.querySelectorAll('.flow-wrap').forEach(function (wrap) {
      var svg = wrap.querySelector('svg.flow');
      var items = Array.prototype.slice.call(wrap.querySelectorAll('ol.nodes > li'));
      if (!svg || items.length < 2) return;
      var wr = wrap.getBoundingClientRect();
      svg.setAttribute('width', wr.width); svg.setAttribute('height', wr.height);
      svg.setAttribute('viewBox', '0 0 ' + wr.width + ' ' + wr.height);
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      svg.__dMarkers = null;
      var numbered = wrap.querySelector('ol.nodes.num');
      function box(el) {
        var r = el.getBoundingClientRect();
        return { x: r.left - wr.left, y: r.top - wr.top, width: r.width, height: r.height };
      }
      function target(li) {   // numbered stages: the circle; labelled stages: the whole box
        if (!numbered) return box(li);
        var b = box(li.querySelector('.c'));
        return { cx: b.x + b.width / 2, cy: b.y + b.height / 2, r: b.width / 2 };
      }
      for (var k = 0; k < items.length - 1; k++) {
        var a = items[k], b = items[k + 1];
        var ba = box(a), bb = box(b);
        var sameRow = Math.abs(ba.y - bb.y) < 4;
        var opts = { color: 'var(--ink-2)', width: 1.25, head: 5, gap: 3, parent: svg };
        if (sameRow) arrow(svg, target(a), target(b), opts);
        else {   // turning down to the next row: from under the node (and its file name) to the top of the next
          var cx = ba.x + ba.width / 2;
          var tb = numbered ? target(b) : bb;
          arrow(svg, { x: cx, y: ba.y + ba.height }, numbered ? { cx: tb.cx, cy: tb.cy, r: tb.r } : { x: cx, y: bb.y, width: 0, height: 0 }, opts);
        }
      }
    });
  }
  var flowQueued = false;
  function queueFlows() { if (flowQueued) return; flowQueued = true; requestAnimationFrame(function () { flowQueued = false; drawFlows(); }); }
  document.querySelectorAll('.flow-wrap').forEach(function (w) { if ('ResizeObserver' in window) new ResizeObserver(queueFlows).observe(w); });
  window.addEventListener('load', queueFlows);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(queueFlows);
  queueFlows();
})();
