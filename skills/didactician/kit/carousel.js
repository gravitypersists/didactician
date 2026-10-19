/* Didactician carousel: numbered pagination (‹ 1 2 3 ›), no reflow, keyboard + aria.
   Classic script. Markup:
     <div class="d-carousel" data-carousel aria-label="Three cases">
       <div class="d-carousel-pages">
         <div data-carousel-page>…</div>
         <div data-carousel-page>…</div>
       </div>
     </div>
   The pager is generated unless the carousel already contains [data-carousel-goto] buttons.
   All pages share one grid cell (components.css), so the container is always as tall as the
   tallest page: switching pages never moves the content below. Use a carousel only for parallel,
   independent cases. Steps the reader must compare side by side don't belong in one (split attention). */
(function () {
  'use strict';
  function init(c) {
    var pages = Array.prototype.slice.call(c.querySelectorAll('[data-carousel-page]'));
    if (pages.length < 2) return;
    c.setAttribute('role', 'region');
    c.setAttribute('aria-roledescription', 'carousel');
    var gotos = Array.prototype.slice.call(c.querySelectorAll('[data-carousel-goto]'));
    var prev = c.querySelector('[data-carousel-prev]'), next = c.querySelector('[data-carousel-next]');
    if (!gotos.length) {
      var pager = document.createElement('div');
      pager.className = 'd-pager';
      pager.setAttribute('aria-label', 'Pages');
      prev = document.createElement('button'); prev.type = 'button'; prev.textContent = '‹';
      prev.setAttribute('aria-label', 'Previous'); prev.setAttribute('data-carousel-prev', '');
      pager.appendChild(prev);
      pages.forEach(function (_, i) {
        var b = document.createElement('button'); b.type = 'button'; b.textContent = String(i + 1);
        b.setAttribute('data-carousel-goto', String(i)); b.setAttribute('aria-label', 'Page ' + (i + 1));
        pager.appendChild(b); gotos.push(b);
      });
      next = document.createElement('button'); next.type = 'button'; next.textContent = '›';
      next.setAttribute('aria-label', 'Next'); next.setAttribute('data-carousel-next', '');
      pager.appendChild(next);
      c.appendChild(pager);
    }
    var cur = 0;
    function show(i) {
      cur = Math.max(0, Math.min(pages.length - 1, i));
      pages.forEach(function (p, j) {
        p.classList.toggle('on', j === cur);
        p.setAttribute('aria-hidden', j === cur ? 'false' : 'true');
        if ('inert' in p) p.inert = j !== cur;
      });
      gotos.forEach(function (b, j) { b.setAttribute('aria-current', j === cur ? 'true' : 'false'); });
      if (prev) prev.disabled = cur === 0;
      if (next) next.disabled = cur === pages.length - 1;
      c.dispatchEvent(new CustomEvent('didactician:page', { detail: { index: cur } }));
    }
    gotos.forEach(function (b) { b.addEventListener('click', function () { show(+b.getAttribute('data-carousel-goto')); }); });
    if (prev) prev.addEventListener('click', function () { show(cur - 1); });
    if (next) next.addEventListener('click', function () { show(cur + 1); });
    c.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { show(cur + 1); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { show(cur - 1); e.preventDefault(); }
    });
    if (!c.hasAttribute('tabindex')) c.setAttribute('tabindex', '0');
    show(0);
  }
  function all() { document.querySelectorAll('[data-carousel]').forEach(init); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', all); else all();
})();
