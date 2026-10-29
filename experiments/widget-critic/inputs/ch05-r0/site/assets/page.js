/* Ch 05 page script. Classic script.
   1. Comprehension checks, as in Ch 03 and Ch 04 (Ch 04's assets/page.js is the reference
      implementation), so checks behave the same in every chapter: commit, then reveal; feedback explains
      every option. Every commit dispatches a bubbling CustomEvent from the check card,
        'didactician:check-commit'  detail { id: 'k-03', option: 'A', correct: true }
      and stamps the card with data-committed="<option key>" (kept after TRY AGAIN). Lane F's controller
      (widgets/w-friday-scrolly/, over pool/cluster/lanes.js) listens for it on document to unlock F3–F5,
      and reads [data-committed] at init in case a commit happened before it loaded. The think-then-reveal
      card (k-09) dispatches the same event with option 'reveal'.
   2. f-06: the loop lens table, built from CH05_LOOPS (a copy of Ch 04's CH04_LOOPS with Ch 05's rows).
   3. f-05 and f-07: the charts, drawn at the plate's measured width. Their data (Fennel fiction, plan R2;
      f-07 is an illustration of an engineers' rule of thumb, research x-05) lives here. */
(function () {
  'use strict';

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function commit(card, option, correct) {
    var id = card.getAttribute('data-check');
    card.setAttribute('data-committed', option);
    card.dispatchEvent(new CustomEvent('didactician:check-commit', {
      bubbles: true,
      detail: { id: id, option: option, correct: correct }
    }));
  }

  /* data-after on the card adds one closing line to every outcome (k-01's "The loop that gives each
     new Pod a node is the scheduler, …"), shown once, not repeated in the "why" disclosure. */
  function setupChoice(card) {
    var opts = Array.prototype.slice.call(card.querySelectorAll('.cp-option'));
    var fb = card.querySelector('.cp-feedback');
    var after = card.getAttribute('data-after');
    fb.setAttribute('tabindex', '-1');
    var keyOf = function (b) { return b.querySelector('.cp-option__key').textContent; };

    function reset() {
      opts.forEach(function (b) {
        b.disabled = false;
        b.classList.remove('is-right', 'is-wrong');
        b.querySelector('.cp-option__tag').textContent = '';
      });
      fb.hidden = true; fb.className = 'cp-feedback'; fb.textContent = '';
      opts[0].focus();
    }

    opts.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var ok = btn.hasAttribute('data-ok');
        opts.forEach(function (b) { b.disabled = true; });
        btn.classList.add(ok ? 'is-right' : 'is-wrong');
        btn.querySelector('.cp-option__tag').textContent = ok ? 'CORRECT' : 'YOUR PICK';
        if (!ok) {
          var right = opts.filter(function (b) { return b.hasAttribute('data-ok'); })[0];
          right.classList.add('is-right');
          right.querySelector('.cp-option__tag').textContent = 'ANSWER';
        }
        fb.textContent = '';
        fb.className = 'cp-feedback ' + (ok ? 'is-right' : 'is-wrong');
        var p = el('p');
        p.appendChild(el('b', 'cp-feedback__lead', ok ? 'CORRECT' : 'NOT QUITE'));
        p.appendChild(document.createTextNode(btn.getAttribute('data-fb')));
        if (!ok) {
          var retry = el('button', 'cp-retry', 'TRY AGAIN');
          retry.type = 'button';
          retry.addEventListener('click', reset);
          p.appendChild(retry);
        }
        fb.appendChild(p);
        if (after) fb.appendChild(el('p', null, after));
        var others = opts.filter(function (b) { return b !== btn; });
        var det = el('details', 'cp-why');
        det.appendChild(el('summary', null, ok ? 'Why the other answers miss' : 'What the other answers say'));
        var ul = el('ul');
        others.forEach(function (b) {
          var li = el('li');
          li.appendChild(el('b', null, keyOf(b)));
          li.appendChild(document.createTextNode(b.getAttribute('data-fb')));
          ul.appendChild(li);
        });
        det.appendChild(ul);
        fb.appendChild(det);
        fb.hidden = false;
        fb.focus({ preventScroll: true });
        commit(card, keyOf(btn), ok);
      });
    });
  }

  function setupReveal(card) {
    var btn = card.querySelector('.cp-reveal');
    var ans = card.querySelector('.cp-feedback');
    btn.addEventListener('click', function () {
      ans.hidden = false;
      btn.setAttribute('aria-expanded', 'true');
      btn.disabled = true;
      btn.textContent = 'Answer shown';
      commit(card, 'reveal', true);
    });
  }

  document.querySelectorAll('.cp-check[data-check]').forEach(function (card) {
    if (card.hasAttribute('data-reveal')) setupReveal(card); else setupChoice(card);
  });
})();

/* ---- f-06 · the loop lens table ----------------------------------------------------------------
   CH05_LOOPS is the course's loop lens table (CURRICULUM §2.3): Ch 04's CH04_LOOPS copied forward, in
   Ch 04's row order, with this chapter's additions. Later chapters copy this array forward and add rows
   (Ch 6 the Deployment loop; Ch 8 fills in the "loop that adds nodes" row). Row fields:
     loop      the loop's name, as the lanes name it
     per       optional: a short qualifier under the name ("one per node", "Chapter 7")
     wants     what it works towards (the loop lens: which loop · wants · sees · does)
     sees      what it observes, in the record or the cluster
     does      what it does about a gap between the two
     job       the job of Sam's (Ch 03's words) that it took over
     chapter   optional: the chapter that covers this loop; a row with it is drawn dashed (met later)
     added     optional, this chapter only: the fields that are new or changed in this chapter, tagged
               NEW IN CH 5 in their cells (['loop'] tags the whole row, on its name). Drop the tags when
               copying the array forward. */
var CH05_LOOPS = [
  { loop: 'node loop', wants: 'every node reporting in', sees: 'each node’s latest report',
    does: 'marks a silent node unknown; after a wait, marks its Pods for deletion',
    job: 'noticing a dead machine' },
  { loop: 'ReplicaSet loop', wants: 'each ReplicaSet’s number of Pods', sees: 'the Pod records it has',
    does: 'writes new Pod records, or removes extras, including for Pods that were evicted', job: 'replacing',
    added: ['does'] },
  { loop: 'scheduler', wants: 'every Pod on a node with room for its requests',
    sees: 'Pods with no node, and how much memory and processor each node has left unreserved (never how busy it is)',
    does: 'rules out nodes too full for the Pod, picks the emptiest of the rest, spreading copies; if none has room, leaves the Pod pending, records why, and tries again when the cluster changes',
    job: 'placing', added: ['wants', 'sees', 'does'] },
  { loop: 'node agent', per: 'one per node', wants: 'its node’s assigned Pods running, and the node itself healthy',
    sees: 'the containers on its node, and how much memory the node has left',
    does: 'starts and restarts containers (including OOM-killed ones) and reports back; when its node runs short of memory, evicts Pods, those furthest over their requests first',
    job: 'restarting', added: ['wants', 'sees', 'does'] },
  { loop: 'another loop', per: 'Chapter 7', wants: 'callers reaching each service’s Pods',
    sees: 'where each service’s Pods are running',
    does: 'keeps callers’ routes current', job: 'connecting', chapter: 7 },
  { loop: 'a loop that adds nodes', per: 'Chapter 8', wants: 'no Pod waiting for room', sees: 'pending Pods',
    does: 'adds nodes, and removes idle ones', job: 'scaling', chapter: 8, added: ['loop'] }
];

(function () {
  'use strict';
  var body = document.querySelector('[data-loop-lens]');
  if (!body) return;
  var table = body.closest('table');
  var labels = (table.getAttribute('data-labels') || '').split('|');
  var tagText = table.getAttribute('data-new') || 'New in Ch 5';
  var tag = function () {
    var t = document.createElement('span');
    t.className = 'lens__new'; t.textContent = tagText;
    return t;
  };
  body.textContent = '';
  CH05_LOOPS.forEach(function (r) {
    var added = r.added || [];
    var tr = document.createElement('tr');
    if (r.chapter) tr.className = 'is-later';
    var th = document.createElement('th');
    th.scope = 'row';
    var pill = document.createElement('span');
    pill.className = 'cp-loop' + (r.chapter ? ' cp-loop--later' : '');
    var mark = document.createElement('span');
    mark.className = 'cp-loop__mark'; mark.setAttribute('aria-hidden', 'true'); mark.textContent = '↻';
    pill.appendChild(mark);
    pill.appendChild(document.createTextNode(r.loop));
    th.appendChild(pill);
    if (r.per) {
      var per = document.createElement('span');
      per.className = 'lens__per'; per.textContent = r.per;
      th.appendChild(per);
    }
    if (added.indexOf('loop') >= 0) th.appendChild(tag());
    tr.appendChild(th);
    ['wants', 'sees', 'does', 'job'].forEach(function (key, i) {
      var td = document.createElement('td');
      if (labels[i]) td.setAttribute('data-label', labels[i]);
      if (key === 'job') td.className = 'lens__job';
      if (added.indexOf(key) >= 0) td.appendChild(tag());
      td.appendChild(document.createTextNode(r[key]));
      tr.appendChild(td);
    });
    body.appendChild(tr);
  });
})();

/* ---- f-05 and f-07 · charts ---------------------------------------------------------------------
   Each chart is drawn into its plate's <svg class="ch__svg"> at the measured width, so every label stays
   at 13px (graphics.md §5: re-layout, don't scale), and redrawn on resize (also when k-09's reveal makes
   f-07 visible). Direct labels only; colours by role (plan ## Visual grammar): reserved = dashed c4,
   cap = solid ink, used = c1, a kill = ✕ in bad with a word, the band above the reservation = hatched
   warn, order traffic = dashed c6 on c6-soft. Without JS the plates show their aria-label text only. */
var CH05_CHARTS = {
  /* f-05: orders-q2rw's memory on Tuesday, 08:00–22:00 (hours), GB. Fiction (plan R2): kills at about
     12:40, 18:50 and 20:10 at the 7 GB limit; after each, the restarted container starts again low. */
  tuesday: {
    request: 6, limit: 7,
    used: [
      [[8, 4.0], [8.5, 4.05], [9, 4.2], [9.5, 4.35], [10, 4.6], [10.5, 4.9], [11, 5.3], [11.5, 5.75], [12, 6.25], [12.33, 6.65], [12.67, 7.0]],
      [[12.67, 1.5], [13, 1.85], [13.5, 2.3], [14, 2.6], [15, 3.1], [16, 3.6], [17, 4.3], [17.5, 4.8], [18, 5.6], [18.33, 6.2], [18.67, 6.75], [18.83, 7.0]],
      [[18.83, 1.5], [19.17, 2.7], [19.5, 3.9], [19.83, 5.4], [20.17, 7.0]],
      [[20.17, 1.5], [20.5, 2.4], [21, 3.1], [21.5, 3.6], [22, 3.9]]
    ],
    kills: [12.67, 18.83, 20.17],
    labels: {
      used: 'Used', request: 'Reserved · request 6 GB', limit: 'Cap · limit 7 GB',
      band: ['above its reservation:', 'allowed, but first in line', 'if the node runs short (§08)'],
      kill: ['OOMKilled · restart 1', 'Restart 2', 'Restart 3'], killShort: ['1', '2', '3'], gb: 'GB'
    }
  },
  /* f-07: a week of orders' memory, Monday 00:00 to Sunday 24:00 (days), GB, against order traffic
     (unitless, drawn as a band). A rule of thumb, not data (research x-05). */
  week: {
    limit: 7, traffic: function (d) {
      var day = Math.floor(d), h = (d - day) * 24;
      var L = [0.4, 0.4, 0.42, 0.42, 0.5, 0.55, 0.5][Math.min(day, 6)];
      var D = [0.65, 0.65, 0.68, 0.7, 1.0, 0.9, 0.75][Math.min(day, 6)];
      var g = function (mu, s) { return Math.exp(-Math.pow(h - mu, 2) / (2 * s * s)); };
      return 0.03 + L * g(12.5, 1.6) + D * g(18.75, 2.0);
    },
    bandTop: 3.5,
    leak: { start: 2.5, rate: 0.12 * 24, floor: 1.5 },        /* GB per day, whatever the traffic */
    growth: { before: 2.0, after: 3.0, change: 0.625, k: 4.0 }, /* base + k × traffic; change Mon 15:00 */
    labels: { days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], cap: 'Cap', capGb: '7 GB', memory: 'Memory',
      traffic: 'orders per hour', killed: 'Killed', change: 'Change', zero: '0' }
  }
};

(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  function s(tag, attrs, parent, text) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) if (attrs[k] != null) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  }
  function clear(svg) { while (svg.firstChild) svg.removeChild(svg.firstChild); }
  function hatch(svg, id) {
    var defs = s('defs', {}, svg);
    var p = s('pattern', { id: id, width: 6, height: 6, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, defs);
    s('line', { x1: 0, y1: 0, x2: 0, y2: 6, 'class': 'p-hatch' }, p);
  }
  function cross(g, x, y, r) {
    s('line', { x1: x - r, y1: y - r, x2: x + r, y2: y + r, 'class': 'm-kill' }, g);
    s('line', { x1: x - r, y1: y + r, x2: x + r, y2: y - r, 'class': 'm-kill' }, g);
  }
  function poly(pts, X, Y) {
    return pts.map(function (p, i) { return (i ? 'L' : 'M') + X(p[0]).toFixed(1) + ',' + Y(p[1]).toFixed(1); }).join('');
  }
  var measure = (function () {
    var c = document.createElement('canvas').getContext('2d');
    return function (text, font) { c.font = font; return c.measureText(text).width; };
  })();
  var MONO = '700 13px "Space Mono", Menlo, monospace';
  var monoW = function (t) { return measure(t.toUpperCase(), MONO) + t.length * 0.78; };   /* + letter-spacing .06em */

  /* ---- f-05 ---- */
  function drawTuesday(host) {
    var svg = host.querySelector('svg'), D = CH05_CHARTS.tuesday, L = D.labels;
    var W = Math.floor(host.querySelector('.ch__area').getBoundingClientRect().width);
    if (W < 40) return;
    var narrow = W < 560;
    narrow ? host.setAttribute('data-narrow', '') : host.removeAttribute('data-narrow');
    var m = narrow ? { l: 46, r: 12, t: 24, b: 28 } : { l: 52, r: Math.ceil(monoW(L.request)) + 14, t: 48, b: 28 };
    var H = narrow ? 240 : 300;
    var pw = W - m.l - m.r, ph = H - m.t - m.b;
    var X = function (t) { return m.l + (t - 8) / 14 * pw; };
    var Y = function (gb) { return m.t + (1 - gb / 8) * ph; };
    clear(svg);
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('width', W); svg.setAttribute('height', H);
    hatch(svg, 'ch-hatch-f05');
    /* the band between reservation and cap, then the reference lines */
    s('rect', { x: X(8), y: Y(D.limit), width: pw, height: Y(D.request) - Y(D.limit), 'class': 'a-band', style: 'fill: url(#ch-hatch-f05)' }, svg);
    s('line', { x1: X(8), y1: Y(0), x2: X(22), y2: Y(0), 'class': 'l-axis' }, svg);
    s('line', { x1: X(8), y1: Y(D.request), x2: X(22), y2: Y(D.request), 'class': 'l-req' }, svg);
    s('line', { x1: X(8), y1: Y(D.limit), x2: X(22), y2: Y(D.limit), 'class': 'l-cap' }, svg);
    /* x ticks: every 2 hours when there's room, else every 4 */
    var step = pw / 7 >= 48 ? 2 : 4;
    for (var t = 8; t <= 22; t += step) {
      s('line', { x1: X(t), y1: Y(0), x2: X(t), y2: Y(0) + 4, 'class': 'l-tick' }, svg);
      s('text', { x: X(t), y: H - 8, 'text-anchor': t === 22 && step === 4 ? 'end' : 'middle', 'class': 't-tick' }, svg, (t < 10 ? '0' : '') + t + ':00');
    }
    if (step === 4) {
      s('line', { x1: X(22), y1: Y(0), x2: X(22), y2: Y(0) + 4, 'class': 'l-tick' }, svg);
    }
    /* y ticks: 0, 6 and 7 GB only */
    [[0, '0'], [D.request, '6 ' + L.gb], [D.limit, '7 ' + L.gb]].forEach(function (v) {
      s('text', { x: m.l - 6, y: Y(v[0]) + 4, 'text-anchor': 'end', 'class': 't-tick' }, svg, v[1]);
    });
    /* used */
    var path = D.used.map(function (seg, i) {
      var d = poly(seg, X, Y);
      return i ? d.replace(/^M/, 'L') : d;
    }).join('');
    s('path', { d: path, 'class': 'l-used' }, svg);
    /* kills */
    var g = s('g', {}, svg);
    D.kills.forEach(function (t, i) {
      cross(g, X(t), Y(D.limit), 5);
      if (narrow) s('text', { x: X(t), y: Y(D.limit) - 10, 'text-anchor': 'middle', 'class': 't-mono t-bad' }, svg, L.killShort[i]);
    });
    if (!narrow) {
      /* kill labels above the plot, with leaders: restart 1 in the lower row, centred and kept inside
         the plot; restarts 2 and 3 in the upper row, either side of their markers */
      var rowA = 18, rowB = 38;
      var w1 = monoW(L.kill[0]), c1 = Math.min(Math.max(X(D.kills[0]), m.l + w1 / 2), m.l + pw - w1 / 2);
      s('text', { x: c1, y: rowB, 'text-anchor': 'middle', 'class': 't-mono t-bad' }, svg, L.kill[0].toUpperCase());
      s('line', { x1: X(D.kills[0]), y1: rowB + 4, x2: X(D.kills[0]), y2: Y(D.limit) - 7, 'class': 'l-lead' }, svg);
      s('text', { x: X(D.kills[1]) - 2, y: rowA, 'text-anchor': 'end', 'class': 't-mono t-bad' }, svg, L.kill[1].toUpperCase());
      s('line', { x1: X(D.kills[1]), y1: rowA - 12, x2: X(D.kills[1]), y2: Y(D.limit) - 7, 'class': 'l-lead' }, svg);
      s('text', { x: X(D.kills[2]) + 2, y: rowA, 'class': 't-mono t-bad' }, svg, L.kill[2].toUpperCase());
      s('line', { x1: X(D.kills[2]), y1: rowA - 12, x2: X(D.kills[2]), y2: Y(D.limit) - 7, 'class': 'l-lead' }, svg);
      /* line labels at the right end; the band's note under them, with a swatch of its hatch */
      var rx = X(22) + 8;
      s('text', { x: rx, y: Y(D.limit) + 4, 'class': 't-mono t-ink' }, svg, L.limit.toUpperCase());
      s('text', { x: rx, y: Y(D.request) + 4, 'class': 't-mono t-ink' }, svg, L.request.toUpperCase());
      var by = Y(D.request) + 28;
      s('rect', { x: rx, y: by - 10, width: 10, height: 10, style: 'fill: url(#ch-hatch-f05)', 'class': 'a-band' }, svg);
      L.band.forEach(function (line, i) { s('text', { x: rx + (i ? 0 : 16), y: by + i * 17, 'class': '' }, svg, line); });
      /* the used line is labelled at its start */
      s('text', { x: X(8) + 4, y: Y(D.used[0][0][1]) - 10, 'class': 't-mono t-c1 t-halo' }, svg, L.used.toUpperCase());
    }
  }

  /* ---- f-07 ---- */
  function weekSeries(kind) {
    var D = CH05_CHARTS.week, pts = [], kills = [];
    if (kind === 'leak') {
      var v = D.leak.start;
      for (var d = 0; d <= 7.0001; d += 1 / 48) {
        if (d > 0) v += D.leak.rate / 48;
        if (v >= D.limit) { pts.push([d, D.limit]); kills.push(d); pts.push([d, D.leak.floor]); v = D.leak.floor; continue; }
        pts.push([d, Math.min(D.limit, v + 0.05 * Math.sin(d * 37))]);   /* a small wobble that ignores traffic */
      }
    } else {
      var G = D.growth;
      for (var e = 0; e <= 7.0001; e += 1 / 48) {
        var base = G.before + (G.after - G.before) / (1 + Math.exp(-(e - G.change) * 40));
        var mem = Math.min(D.limit, base + G.k * D.traffic(e));
        pts.push([e, mem]);
      }
      /* the busiest peak touches the cap: mark it */
      var top = pts.reduce(function (a, p) { return p[1] > a[1] ? p : a; }, [0, 0]);
      if (top[1] >= D.limit - 0.01) kills.push(top[0]);
    }
    return { pts: pts, kills: kills };
  }
  function drawWeek(host) {
    var svg = host.querySelector('svg'), D = CH05_CHARTS.week, L = D.labels, kind = host.getAttribute('data-chart');
    var W = Math.floor(host.querySelector('.ch__area').getBoundingClientRect().width);
    if (W < 40) return;
    var gut = Math.ceil(Math.max(monoW(L.memory), monoW(L.capGb))) + 10;
    var m = { l: gut, r: 6, t: 22, b: 24 }, H = 188;
    var pw = W - m.l - m.r, ph = H - m.t - m.b;
    var X = function (d) { return m.l + d / 7 * pw; };
    var Y = function (gb) { return m.t + (1 - gb / 8) * ph; };
    clear(svg);
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('width', W); svg.setAttribute('height', H);
    /* traffic band */
    var band = [[0, 0]];
    for (var d = 0; d <= 7.0001; d += 1 / 48) band.push([d, D.traffic(d) * D.bandTop]);
    band.push([7, 0]);
    s('path', { d: poly(band, X, Y) + 'Z', 'class': 'a-traffic' }, svg);
    s('line', { x1: X(0), y1: Y(0), x2: X(7), y2: Y(0), 'class': 'l-axis' }, svg);
    s('line', { x1: X(0), y1: Y(D.limit), x2: X(7), y2: Y(D.limit), 'class': 'l-cap' }, svg);
    for (var i = 0; i < 7; i++) {
      s('line', { x1: X(i), y1: Y(0), x2: X(i), y2: Y(0) + 4, 'class': 'l-tick' }, svg);
      s('text', { x: X(i + 0.5), y: H - 6, 'text-anchor': 'middle', 'class': 't-tick' }, svg, L.days[i].toUpperCase());
    }
    var series = weekSeries(kind);
    s('path', { d: poly(series.pts, X, Y), 'class': 'l-used' }, svg);
    series.kills.forEach(function (k) { cross(svg, X(k), Y(D.limit), 4); });
    if (series.kills.length) {
      var kx = Math.min(Math.max(X(series.kills[0]), m.l + monoW(L.killed) / 2), m.l + pw - monoW(L.killed) / 2);
      s('text', { x: kx, y: m.t - 8, 'text-anchor': 'middle', 'class': 't-mono t-bad' }, svg, L.killed.toUpperCase());
    }
    if (kind === 'growth') {
      var cx = X(D.growth.change);
      s('line', { x1: cx, y1: m.t - 4, x2: cx, y2: Y(0), 'class': 'l-lead', 'stroke-dasharray': '2 3' }, svg);
      s('text', { x: Math.max(cx - 2, m.l), y: m.t - 8, 'class': 't-mono t-ink' }, svg, L.change.toUpperCase());
    }
    /* direct labels at the left ends of the lines */
    s('text', { x: m.l - 6, y: Y(D.limit) + 4, 'text-anchor': 'end', 'class': 't-mono t-ink' }, svg, L.cap.toUpperCase());
    s('text', { x: m.l - 6, y: Y(D.limit) + 20, 'text-anchor': 'end', 'class': 't-mono t-ink' }, svg, L.capGb.toUpperCase());
    s('text', { x: m.l - 6, y: Y(series.pts[0][1]) + 4, 'text-anchor': 'end', 'class': 't-mono t-c1' }, svg, L.memory.toUpperCase());
    s('text', { x: m.l - 6, y: Y(0) + 4, 'text-anchor': 'end', 'class': 't-tick' }, svg, L.zero);
    if (kind === 'leak') s('text', { x: X(0) + 4, y: Y(0) - 5, 'class': 't-halo', 'font-style': 'italic' }, svg, L.traffic);
  }

  var hosts = Array.prototype.slice.call(document.querySelectorAll('.ch[data-chart]'));
  if (!hosts.length) return;
  function draw(host) {
    var kind = host.getAttribute('data-chart');
    if (kind === 'tuesday') drawTuesday(host); else drawWeek(host);
  }
  function drawAll() { hosts.forEach(draw); }
  var queued = false;
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () { queued = false; drawAll(); });
  }
  drawAll();
  if ('ResizeObserver' in window) {
    var ro = new ResizeObserver(schedule);
    hosts.forEach(function (h) { ro.observe(h.querySelector('.ch__area')); });
  } else window.addEventListener('resize', schedule);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(schedule);
})();
