/* Didactician ToC: desktop rail (claude.dev blog pattern) + mobile "Contents" disclosure.
   Classic script (works from file:// too). Include after the content, or with `defer`.

   Markup it fills (see components.css for the page skeleton):
     <aside class="d-rail" data-toc data-minutes="12"></aside>
     <details class="d-toc-mobile" data-toc-mobile></details>
   Sources: h2[id] and h3[id] inside main (or [data-toc-source]). h3s show only under the active h2.
   Headings without ids get one from their text. */
(function () {
  'use strict';
  var root = document.querySelector('[data-toc-source]') || document.querySelector('main') || document.body;
  var rail = document.querySelector('[data-toc]');
  var mobile = document.querySelector('[data-toc-mobile]');
  if (!rail && !mobile) return;

  var slug = function (s) { return s.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').slice(0, 60); };
  var heads = Array.prototype.slice.call(root.querySelectorAll('h2, h3')).filter(function (h) {
    return !h.closest('[data-toc-skip], .d-check, figure, [data-widget]');
  });
  heads.forEach(function (h) { if (!h.id) h.id = slug(h.textContent) || 'section'; });
  var tree = [];
  heads.forEach(function (h) {
    if (h.tagName === 'H2' || !tree.length) tree.push({ h: h, subs: [] });
    else tree[tree.length - 1].subs.push(h);
  });
  if (!tree.length) return;

  // Course tweak: h2s carry a mono "§ 01" numeral (.cp-sec); the rail shows the heading text only.
  var headText = function (h) {
    var c = h.cloneNode(true);
    Array.prototype.forEach.call(c.querySelectorAll('.cp-sec'), function (s) { s.remove(); });
    return c.textContent.trim();
  };
  var link = function (h, cls) {
    var a = document.createElement('a');
    a.href = '#' + h.id;
    if (cls) a.className = cls;
    var br = document.createElement('span');
    br.className = 'br'; br.textContent = '└';
    br.setAttribute('aria-hidden', 'true');
    a.appendChild(br);
    a.appendChild(document.createTextNode(headText(h)));
    a.title = headText(h);
    return a;
  };

  var railLinks = [];
  if (rail) {
    var h1 = document.querySelector('h1');
    var title = document.createElement('div');
    title.className = 'd-rail-title';
    title.textContent = h1 ? h1.textContent.trim() : document.title;
    var label = document.createElement('div');
    label.className = 'd-rail-label'; label.textContent = 'Contents';
    var nav = document.createElement('nav');
    nav.setAttribute('aria-label', 'Contents');
    tree.forEach(function (node) {
      var a = link(node.h);
      nav.appendChild(a);
      railLinks.push({ a: a, h: node.h, node: node });
      if (node.subs.length) {
        var subs = document.createElement('div'); subs.className = 'subs';
        var inner = document.createElement('div');
        node.subs.forEach(function (s) {
          var sa = link(s, 'sub'); inner.appendChild(sa);
          railLinks.push({ a: sa, h: s, node: node });
        });
        subs.appendChild(inner); nav.appendChild(subs); node.subsEl = subs;
      }
    });
    var prog = document.createElement('div'); prog.className = 'd-rail-prog'; prog.setAttribute('aria-hidden', 'true');
    rail.textContent = '';
    rail.appendChild(title); rail.appendChild(label); rail.appendChild(nav); rail.appendChild(prog);
    var minutes = rail.getAttribute('data-minutes');
    if (minutes) {
      var t = document.createElement('div'); t.className = 'd-rail-time'; t.textContent = minutes + ' min read';
      rail.appendChild(t);
    }
    if (h1 && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { title.classList.toggle('on', !es[0].isIntersecting); }).observe(h1);
    }
    var N = 24;
    var drawProg = function () {
      var el = document.documentElement;
      var p = Math.max(0, Math.min(1, el.scrollTop / Math.max(1, el.scrollHeight - el.clientHeight)));
      var k = Math.round(p * N);
      prog.innerHTML = '<b>' + '█'.repeat(k) + '</b>' + '░'.repeat(N - k) + '<span class="pct">' + String(Math.round(p * 100)).padStart(2, '0') + '%</span>';
    };
    drawProg();
    window.addEventListener('scroll', drawProg, { passive: true });
  }

  if (mobile) {
    mobile.textContent = '';
    var sum = document.createElement('summary'); sum.textContent = 'Contents';
    var mnav = document.createElement('nav'); mnav.setAttribute('aria-label', 'Contents');
    tree.forEach(function (node) {
      mnav.appendChild(link(node.h));
    });
    mnav.addEventListener('click', function (e) { if (e.target.closest('a')) mobile.open = false; });
    mobile.appendChild(sum); mobile.appendChild(mnav);
  }

  // scrollspy: the active heading is the last one whose top has passed 30% of the viewport
  if (railLinks.length) {
    var active = null;
    var spy = function () {
      var y = window.innerHeight * 0.3, cur = railLinks[0];
      for (var i = 0; i < railLinks.length; i++) {
        if (railLinks[i].h.getBoundingClientRect().top <= y) cur = railLinks[i];
      }
      if (cur === active) return;
      active = cur;
      railLinks.forEach(function (r) { r.a.classList.toggle('on', r === cur || r.h === cur.node.h); });
      tree.forEach(function (node) { if (node.subsEl) node.subsEl.classList.toggle('open', node === cur.node); });
    };
    spy();
    window.addEventListener('scroll', spy, { passive: true });
    window.addEventListener('resize', spy);
  }
})();
