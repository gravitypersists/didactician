/* Didactician motion helpers: start one-shot animations when they're visible; replay them.
   Classic script; also exposes window.Didactician.replay(scope) and .onReplay(scope, fn).

   Markup conventions (verify.mjs checks these):
     <figure data-anim-scope>                       the replay scope (figure / [data-widget] / section also work)
       <div class="bar" data-anim-autoplay="visible"></div>   gets .is-playing the first time it's 40% visible
       <button class="d-replay" data-replay type="button">Replay</button>
     </figure>
   - data-anim="once"   on a JS/canvas-driven one-shot animation: verify.mjs then requires a [data-replay]
   - data-anim="loop"   looping by design (no replay needed)
   - data-anim="flair"  decorative micro-animation (no replay needed; keep it under ~1.5s)
   Replay restarts every CSS/Web Animation in the scope, rewinds SMIL, re-adds .is-playing, and
   fires a `didactician:replay` event on the scope for JS-driven animations to restart themselves. */
(function () {
  'use strict';
  var SCOPE = '[data-anim-scope], figure, [data-widget], section, article';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function play(el) {
    el.classList.remove('is-playing');
    void el.offsetWidth;          // restart CSS animations keyed off .is-playing
    el.classList.add('is-playing');
  }

  function replay(scope) {
    scope.querySelectorAll('[data-anim-autoplay]').forEach(play);
    if (scope.getAnimations) {
      scope.getAnimations({ subtree: true }).forEach(function (a) {
        if (a.constructor && a.constructor.name === 'CSSTransition') return;
        try { a.cancel(); a.play(); } catch (_) {}
      });
    }
    scope.querySelectorAll('svg').forEach(function (svg) {
      if (svg.setCurrentTime) {
        svg.setCurrentTime(0);
        svg.querySelectorAll('animate, animateTransform, animateMotion, set').forEach(function (a) { try { a.beginElement(); } catch (_) {} });
      }
    });
    scope.dispatchEvent(new CustomEvent('didactician:replay', { bubbles: false }));
  }

  function onReplay(scope, fn) { scope.addEventListener('didactician:replay', fn); }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('[data-replay]');
    if (!btn) return;
    var scope = btn.closest(SCOPE) || document.body;
    replay(scope);
  });

  function arm() {
    var els = document.querySelectorAll('[data-anim-autoplay="visible"]');
    if (reduce || !('IntersectionObserver' in window)) { els.forEach(function (el) { el.classList.add('is-playing'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-playing'); io.unobserve(en.target); }
      });
    }, { threshold: 0.4 });
    els.forEach(function (el) { io.observe(el); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arm); else arm();

  window.Didactician = Object.assign(window.Didactician || {}, { replay: replay, onReplay: onReplay });
})();
