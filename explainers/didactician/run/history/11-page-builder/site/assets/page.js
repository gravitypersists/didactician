/* Page behaviour: comprehension checks (commit, then reveal) and the scroll-step driver for the
   two sticky plates. Classic script; no dependencies.

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
})();
