/* Didactician widget helpers. Classic script; exposes window.Didactician.widget / .load / .loadCss.

   A widget lives in site/widgets/<id>/ (index.js, optional index.css) and mounts into
   <div data-widget="<id>"> which the page builder placed. In index.js:

     Didactician.widget('w-pendulum', async (el, ctx) => {
       await Didactician.load('https://cdn.jsdelivr.net/npm/d3-scale@4.0.2/dist/d3-scale.min.js');
       … build inside `el` only …
       ctx.onResize((width) => relayout(width));   // container width, not window width
       ctx.onReplay(() => restart());               // [data-replay] inside the widget
       ctx.onVisible((v) => v ? start() : pause()); // pause work while off-screen
       if (ctx.reducedMotion) …
     });

   The helper waits for the DOM, finds the mount, guards against double init, and reports init
   errors in the mount (and the console) instead of failing silently. */
(function () {
  'use strict';
  var loaded = {};

  function load(src) {
    if (loaded[src]) return loaded[src];
    return (loaded[src] = new Promise(function (res, rej) {
      var s = document.createElement('script');
      s.src = src; s.async = true; s.crossOrigin = 'anonymous';
      s.onload = function () { res(); };
      s.onerror = function () { rej(new Error('failed to load ' + src)); };
      document.head.appendChild(s);
    }));
  }

  function loadCss(href) {
    if (loaded[href]) return loaded[href];
    return (loaded[href] = new Promise(function (res, rej) {
      var l = document.createElement('link');
      l.rel = 'stylesheet'; l.href = href;
      l.onload = function () { res(); };
      l.onerror = function () { rej(new Error('failed to load ' + href)); };
      document.head.appendChild(l);
    }));
  }

  function widget(id, init) {
    function go() {
      var el = document.querySelector('[data-widget="' + id + '"]');
      if (!el) { console.error('Didactician: no mount [data-widget="' + id + '"]'); return; }
      if (el.__dInit) return;
      el.__dInit = true;
      var resizeFns = [], visFns = [];
      var ctx = {
        id: id,
        reducedMotion: !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches),
        onResize: function (fn) { resizeFns.push(fn); fn(el.clientWidth); },
        onReplay: function (fn) { el.addEventListener('didactician:replay', fn); },
        onVisible: function (fn) { visFns.push(fn); },
      };
      if ('ResizeObserver' in window) {
        var last = el.clientWidth;
        new ResizeObserver(function () {
          var w = el.clientWidth;
          if (Math.abs(w - last) < 1) return;
          last = w;
          resizeFns.forEach(function (fn) { fn(w); });
        }).observe(el);
      }
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (es) {
          visFns.forEach(function (fn) { fn(es[0].isIntersecting); });
        }).observe(el);
      }
      Promise.resolve().then(function () { return init(el, ctx); }).catch(function (e) {
        console.error('Didactician widget ' + id + ' failed:', e);
        var msg = document.createElement('p');
        msg.className = 'd-caption';
        msg.textContent = 'This interactive figure failed to load.';
        el.appendChild(msg);
      });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
  }

  window.Didactician = Object.assign(window.Didactician || {}, { widget: widget, load: load, loadCss: loadCss });
})();
