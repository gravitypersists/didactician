/* w-sizing-sandbox/index.js · W-02 "Ari's sizing sheet" (Ch 05 §04, blueprint B2, a goal-free explorer).
   The controls, readouts and live sentence, and the node drawing through the pooled renderer
   (pool/cluster/cluster.js, nodes-only). The model is window.SizingModel (model.js); data and every
   reader-visible string are window.SizingData (data.js). Nothing here decides a count: it asks the
   model and draws the answer. */
Didactician.widget('w-sizing-sandbox', function (el, ctx) {
  'use strict';
  var D = window.SizingData;
  var M = window.SizingModel;
  var T = D.SHEET;
  var C = window.ClusterCanvas;

  /* the renderer's own copy of the data: its SERVICES' sizes follow the steppers; SizingData itself
     is never changed */
  var RD = {};
  Object.keys(D).forEach(function (k) { RD[k] = D[k]; });
  RD.SERVICES = {};
  Object.keys(D.SERVICES).forEach(function (s) {
    var o = {}; Object.keys(D.SERVICES[s]).forEach(function (k) { o[k] = D.SERVICES[s][k]; });
    RD.SERVICES[s] = o;
  });
  var R = C.create(RD);

  var DEFAULT = {};
  D.ORDER.forEach(function (s) { DEFAULT[s] = D.SERVICES[s].size; });
  var req = {};
  D.ORDER.forEach(function (s) { req[s] = DEFAULT[s]; });
  var spare = true;
  var lastChange = null;   /* { svc } | { spare } | { reset } */

  /* ---------- helpers ---------- */
  function fill(tpl, v) { return tpl.replace(/\{(\w+)\}/g, function (m, k) { return v[k] != null ? v[k] : m; }); }
  function gb(x) { var r = Math.round(x * 10) / 10; return (r % 1 === 0 ? r.toFixed(0) : r.toFixed(1)); }
  function pad2(n) { return n < 10 ? '0' + n : String(n); }
  function mk(tag, cls, text) { var e = C.el(tag, cls, text); return e; }
  function copiesText(n) { return fill(n === 1 ? T.copies.one : T.copies.many, { n: n }); }
  var wideMQ = window.matchMedia ? window.matchMedia('(min-width: 600px)') : { matches: true };

  /* ---------- the frame ---------- */
  el.textContent = '';
  var root = mk('div', 'ssw');
  var bar = mk('div', 'ssw__bar');
  var title = mk('span', 'ssw__title', T.title);
  bar.appendChild(title);
  root.appendChild(bar);
  var body = mk('div', 'ssw__body');
  root.appendChild(body);
  var side = mk('div', 'ssw__side');
  var main = mk('div', 'ssw__main');
  body.appendChild(side);
  body.appendChild(main);

  /* readouts */
  var ro = mk('div', 'ssw__ro');
  side.appendChild(ro);
  function readout(label, cls, into) {
    var box = mk('div', 'ssw__r ' + (cls || ''));
    var head = mk('div', 'ssw__rh');
    head.appendChild(mk('span', 'ssw__k', label));
    var val = mk('span', 'ssw__v');
    head.appendChild(val);
    box.appendChild(head);
    var sub = mk('span', 'ssw__sub');
    box.appendChild(sub);
    (into || ro).appendChild(box);
    return { box: box, val: val, sub: sub };
  }
  var rNodes = readout(T.nodes, 'ssw__r--nodes');
  var sub2 = mk('span', 'ssw__sub ssw__sub--2');
  rNodes.box.appendChild(sub2);
  var rSet = readout(T.setBy, 'ssw__r--set');
  var pair = mk('div', 'ssw__pair');
  ro.appendChild(pair);
  var rRes = readout(T.reserved, 'ssw__r--res', pair);
  var rUsed = readout(T.used, 'ssw__r--used', pair);

  /* idle bar */
  var idle = mk('div', 'ssw__idle');
  idle.appendChild(mk('p', 'ssw__head', T.idle.head));
  var ibar = mk('div', 'ssw__ibar');
  var segUsed = mk('i', 'ssw__seg ssw__seg--used');
  var segOver = mk('i', 'ssw__seg-over');
  segUsed.appendChild(segOver);
  var segRes = mk('i', 'ssw__seg ssw__seg--res');
  var segFree = mk('i', 'ssw__seg ssw__seg--free');
  [segUsed, segRes, segFree].forEach(function (s) { s.setAttribute('aria-hidden', 'true'); ibar.appendChild(s); });
  idle.appendChild(ibar);
  var ilabels = mk('div', 'ssw__ilabels');
  idle.appendChild(ilabels);
  var inone = mk('p', 'ssw__inone', T.idle.none);
  idle.appendChild(inone);
  side.appendChild(idle);

  /* controls */
  var ctl = mk('div', 'ssw__ctl');
  ctl.appendChild(mk('p', 'ssw__head', T.controlsHead));
  var rows = {};
  D.ORDER.forEach(function (s) {
    var svc = D.SERVICES[s];
    var row = mk('div', 'ssw__row');
    row.setAttribute('role', 'group');
    var info = mk('div', 'ssw__svc');
    var nm = mk('b', 'ssw__name', svc.label);
    var cp = mk('span', 'ssw__copies', fill(T.copiesShort, { n: svc.copies }));
    cp.setAttribute('aria-hidden', 'true');
    nm.appendChild(cp);
    info.appendChild(nm);
    row.setAttribute('aria-label', svc.label + ', ' + copiesText(svc.copies) + ', ' + fill(T.usedAt, { use: gb(svc.use) }));
    var meta = mk('span', 'ssw__meta', fill(T.usedAt, { use: gb(svc.use) }).replace(/ /g, '\u00a0'));
    var tag = mk('span', 'ssw__over', T.rowOver);
    meta.appendChild(tag);
    info.appendChild(meta);
    row.appendChild(info);
    var st = mk('div', 'ssw__step');
    var minus = mk('button', 'ssw__btn', '−');
    minus.type = 'button';
    minus.setAttribute('aria-label', fill(T.lower, { svc: svc.label }));
    var out = mk('output', 'ssw__val');
    out.id = 'ssw-val-' + s;
    var plus = mk('button', 'ssw__btn', '+');
    plus.type = 'button';
    plus.setAttribute('aria-label', fill(T.raise, { svc: svc.label }));
    minus.setAttribute('aria-describedby', out.id);
    plus.setAttribute('aria-describedby', out.id);
    st.appendChild(minus); st.appendChild(out); st.appendChild(plus);
    row.appendChild(st);
    ctl.appendChild(row);
    function stepBy(dir) {
      var a = svc.adjustable;
      var v = Math.round((req[s] + dir * a.step) * 100) / 100;
      if (v < a.min - 1e-9 || v > a.max + 1e-9) return;
      req[s] = v;
      lastChange = { svc: s };
      update();
    }
    minus.addEventListener('click', function () { stepBy(-1); });
    plus.addEventListener('click', function () { stepBy(1); });
    rows[s] = { row: row, out: out, minus: minus, plus: plus, tag: tag };
  });
  var sw = mk('label', 'ssw__switch');
  var cb = mk('input', 'ssw__cb');
  cb.type = 'checkbox';
  cb.setAttribute('role', 'switch');
  cb.checked = spare;
  sw.appendChild(cb);
  sw.appendChild(mk('span', 'ssw__track'));
  sw.appendChild(mk('span', 'ssw__swl', T.spare));
  var swState = mk('b', 'ssw__sws');
  swState.setAttribute('aria-hidden', 'true');   /* the switch's own checked state says it */
  sw.appendChild(swState);
  cb.addEventListener('change', function () { spare = cb.checked; lastChange = { spare: true }; update(); });
  ctl.appendChild(sw);
  var reset = mk('button', 'ssw__reset', T.reset);
  reset.type = 'button';
  reset.addEventListener('click', function () {
    D.ORDER.forEach(function (s) { req[s] = DEFAULT[s]; });
    spare = true; cb.checked = true;
    lastChange = { reset: true };
    update();
  });
  ctl.appendChild(reset);
  side.appendChild(ctl);

  /* warnings */
  var warn = mk('div', 'ssw__warn');
  warn.appendChild(mk('p', 'ssw__head', T.warnHead));
  var wlist = mk('ul', 'ssw__wlist');
  warn.appendChild(wlist);
  side.appendChild(warn);

  /* the drawing */
  var dhead = mk('p', 'ssw__head ssw__dhead', T.drawHead);
  main.appendChild(dhead);
  var never = mk('div', 'ssw__never');
  main.appendChild(never);
  var draw = mk('div', 'ssw__draw');
  main.appendChild(draw);
  var tooShort = mk('p', 'ssw__short');
  main.appendChild(tooShort);

  var live = mk('p', 'ssw__live');
  live.setAttribute('aria-live', 'polite');
  root.appendChild(live);
  el.appendChild(root);

  /* ---------- what one setting shows ---------- */
  function snapshot(ev) {
    var nodes = {}, use = {}, spareIds = [];
    ev.placement.forEach(function (ids, i) {
      var nid = String(i + 1);
      nodes[nid] = ids.map(function (id) { return id + ':placed'; });
      ids.forEach(function (id) { use[id] = D.SERVICES[D.PODS[id].service].use; });
      if (ev.spare && i === ev.placement.length - 1) spareIds.push(nid);
    });
    return { nodes: nodes, use: use, spare: spareIds };
  }

  function overWarnings(ev) {
    return ev.over.map(function (s) {
      var svc = D.SERVICES[s];
      return fill(T.warnOver, { svc: svc.label, req: gb(req[s] != null ? req[s] : svc.size), use: gb(svc.use) });
    });
  }
  function neverWarnings(ev) {
    return ev.never.map(function (n) {
      return fill(T.warnNever, { svc: D.SERVICES[n.service].label, req: gb(n.request), room: gb(D.CAPACITY.memory) });
    });
  }
  function drawWarnings(lines) {
    wlist.textContent = '';
    if (!lines.length) {
      var ok = mk('li', 'ssw__w ssw__w--none', T.warnNone);
      wlist.appendChild(ok);
      return;
    }
    lines.forEach(function (t) { wlist.appendChild(mk('li', 'ssw__w', t)); });
  }
  function drawNever(ev) {
    never.textContent = '';
    if (!ev.never.length) { never.hidden = true; return; }
    never.hidden = false;
    never.appendChild(mk('p', 'ssw__never-k', T.neverHead));
    ev.never.forEach(function (n) {
      /* the request against a node's room, to one scale: the request overhangs the node */
      var row = mk('div', 'ssw__nv');
      var max = Math.max(n.request, D.CAPACITY.memory);
      var nodeBar = mk('i', 'ssw__nv-room');
      nodeBar.style.width = (D.CAPACITY.memory / max * 100) + '%';
      nodeBar.appendChild(mk('span', null, fill(T.neverRoom, { room: gb(D.CAPACITY.memory) })));
      var podBar = mk('i', 'ssw__nv-pod');
      podBar.style.width = (n.request / max * 100) + '%';
      podBar.appendChild(mk('span', null, fill(T.neverBody, { svc: D.SERVICES[n.service].label, req: gb(n.request) })));
      row.appendChild(podBar);
      row.appendChild(nodeBar);
      never.appendChild(row);
    });
  }

  /* the idle bar's labels: under their segments where they fit side by side (direct labels), else
     one row each, in bar order, with the segment's own fill as the mark */
  function drawIdle(ev) {
    var feasible = ev.feasible;
    idle.classList.toggle('is-none', !feasible);
    ilabels.textContent = '';
    if (!feasible) { [segUsed, segRes, segFree].forEach(function (sg) { sg.style.width = '0'; }); return; }
    var room = ev.rented;
    var parts = [
      { key: 'used', gb: ev.idle.used, seg: segUsed, name: T.idle.used },
      { key: 'res', gb: ev.idle.reservedUnused, seg: segRes, name: T.idle.reservedUnused },
      { key: 'free', gb: ev.idle.notReserved, seg: segFree, name: T.idle.notReserved }
    ];
    var x = 0;
    parts.forEach(function (p) {
      p.pct = room ? p.gb / room * 100 : 0;
      p.left = x;
      p.seg.style.width = p.pct + '%';
      x += p.pct;
    });
    segOver.style.width = ev.idle.used ? (ev.idle.usedOver / ev.idle.used * 100) + '%' : '0';
    var W = ibar.clientWidth || 1;
    ilabels.classList.remove('is-stack');
    var nodesL = parts.map(function (p) {
      var lab = mk('span', 'ssw__il ssw__il--' + p.key);
      lab.appendChild(mk('span', 'ssw__il-mark'));
      p.name.forEach(function (t) { lab.appendChild(mk('span', 'ssw__il-ln', t)); });
      lab.appendChild(mk('span', 'ssw__il-ln ssw__il-amt', fill(T.idle.amount, { gb: gb(p.gb), pct: Math.round(p.pct) })));
      ilabels.appendChild(lab);
      return lab;
    });
    /* place side by side: each at its segment's left edge, pushed right past the one before */
    var gap = 8, edge = 0, okSide = true;
    nodesL.forEach(function (lab, i) {
      var w = lab.offsetWidth;
      var at = Math.max(parts[i].left / 100 * W, edge);
      if (at + w > W + 0.5) okSide = false;
      lab.style.left = at + 'px';
      edge = at + w + gap;
    });
    if (!okSide) {
      ilabels.classList.add('is-stack');
      nodesL.forEach(function (lab) { lab.style.left = ''; });
    }
  }

  function setRow(s, ev) {
    var r = rows[s], a = D.SERVICES[s].adjustable;
    r.out.textContent = fill(T.gb, { v: gb(req[s]) });
    r.minus.setAttribute('aria-disabled', req[s] <= a.min + 1e-9 ? 'true' : 'false');
    r.plus.setAttribute('aria-disabled', req[s] >= a.max - 1e-9 ? 'true' : 'false');
    r.row.classList.toggle('is-over', ev.over.indexOf(s) >= 0);
  }

  var drawW = 0;
  function render(ev, highlight) {
    var w = draw.clientWidth || 320;
    var narrow = w < 440;
    var unit = narrow ? 22 : 28;
    var colW = (w - 12) / 4;
    var opts = { width: w, nodesOnly: true, columns: 4, unit: unit, labels: colW >= 80, highlight: highlight || [], lit: false };
    var rootEl = R.renderCluster(draw, snapshot(ev), opts);
    /* Pods too short for a line of text: no label and no step highlight, 1px edges, so the outline
       and fill still read; a line under the drawing names them */
    var short = {};
    Array.prototype.forEach.call(rootEl.querySelectorAll('.wc-p'), function (p) {
      var svc = D.PODS[p.getAttribute('data-p')].service;
      if (p.offsetHeight < 14) {
        p.classList.add('ssw-tiny');
        p.classList.remove('is-hl');
        Array.prototype.forEach.call(p.querySelectorAll('.is-hl'), function (x) { x.classList.remove('is-hl'); });
        Array.prototype.forEach.call(p.querySelectorAll('.wc-c__ln'), function (ln) { ln.remove(); });
        short[svc] = (short[svc] || 0) + 1;
      } else if (!p.querySelector('.wc-c__ln:not(.wc-st)')) {
        /* the chip kept only its OVER tag: its name didn't fit */
        short[svc] = (short[svc] || 0) + 1;
      }
    });
    var names = Object.keys(D.SERVICES).filter(function (s) { return short[s]; }).map(function (s) {
      return fill(T.tooShortItem, { svc: D.SERVICES[s].label, n: short[s], gb: gb(RD.SERVICES[s].size) });
    });
    tooShort.textContent = opts.labels && names.length ? fill(T.tooShort, { list: list(names) }) : '';
    if (highlight && highlight.length) {
      requestAnimationFrame(function () { rootEl.classList.add('is-lit'); });
    }
    drawW = w;
    return rootEl;
  }

  function list(items) {
    if (items.length < 2) return items.join('');
    return items.slice(0, -1).join(T.comma) + T.and + items[items.length - 1];
  }
  function liveSentence(ev) {
    var change = '';
    if (lastChange && lastChange.svc) change = fill(T.liveChange, { svc: D.SERVICES[lastChange.svc].label, v: gb(req[lastChange.svc]) });
    else if (lastChange && lastChange.spare) change = fill(T.liveSpare, { state: spare ? T.spareOn.toLowerCase() : T.spareOff.toLowerCase() });
    else if (lastChange && lastChange.reset) change = T.liveReset;
    var w = ev.over.length ? fill(T.liveOver, { list: list(ev.over.map(function (s) { return D.SERVICES[s].label; })) }) : T.liveOk;
    if (!ev.feasible) {
      var nv = list(ev.never.map(function (n) { return fill(T.liveNever, { svc: D.SERVICES[n.service].label, req: gb(n.request) }); }));
      return fill(T.liveNone, { change: change, never: nv, warn: w });
    }
    return fill(T.live, {
      change: change, nodes: ev.nodes, setBy: T.setByWord[ev.setBy].toLowerCase(),
      reserved: gb(ev.reserved), rented: gb(ev.rented), used: gb(ev.used), warn: w
    });
  }

  var current = null;
  function update() {
    D.ORDER.forEach(function (s) { RD.SERVICES[s].size = req[s]; });
    R.reset();
    var ev = M.evaluate(D, req, spare);
    current = ev;

    /* readouts */
    rNodes.val.textContent = ev.feasible ? pad2(ev.nodes) : T.nodesNone;
    rNodes.sub.textContent = T.nodesSub;
    sub2.textContent = !ev.feasible ? T.nodesNoneSub : fill(spare ? T.nodesSpare : T.nodesNoSpare, { n: ev.base });
    rSet.val.textContent = ev.feasible ? T.setByWord[ev.setBy] : T.setByWord.none;
    rSet.sub.textContent = ev.feasible ? fill(T.setBySub, { mem: ev.memOnly, cpu: ev.cpuOnly }) : T.setBySubNone;
    rRes.val.textContent = ev.feasible ? fill(T.reservedOf, { reserved: gb(ev.reserved), rented: gb(ev.rented) }) : fill(T.reservedNone, { reserved: gb(ev.reserved) });
    rUsed.val.textContent = fill(T.usedVal, { used: gb(ev.used) });
    if (lastChange) {
      /* the count's box marks a change of count for a moment (word and number change too) */
      if (rNodes.prev != null && rNodes.prev !== rNodes.val.textContent) {
        rNodes.box.classList.remove('is-changed'); void rNodes.box.offsetWidth; rNodes.box.classList.add('is-changed');
      }
    }
    rNodes.prev = rNodes.val.textContent;

    D.ORDER.forEach(function (s) { setRow(s, ev); });
    swState.textContent = spare ? T.spareOn : T.spareOff;
    sw.classList.toggle('is-on', spare);

    drawWarnings(neverWarnings(ev).concat(overWarnings(ev)));
    drawNever(ev);
    dhead.textContent = ev.feasible ? T.drawHead : T.drawHeadNone;
    drawIdle(ev);

    var hl = [];
    if (lastChange && lastChange.svc) D.SERVICES[lastChange.svc].pods.forEach(function (id) { hl.push('p:' + id); });
    if (lastChange && lastChange.spare && spare) hl.push('n:' + ev.placement.length);
    render(ev, hl);

    if (lastChange) live.textContent = liveSentence(ev);
  }

  /* ---------- layout and the height rule ----------
     From 600px (CURRICULUM §8 step 6) the sheet reserves its tallest state: the warnings list at its
     longest and the drawing at two rows of nodes plus the never-placeable bar, so no setting change
     moves the page. Below 600px nothing is reserved; the controls sit above everything that changes
     height, so they never move under the reader's finger. */
  function reserve() {
    warn.style.minHeight = '';
    main.style.minHeight = '';
    if (!wideMQ.matches) return;
    var worst = [
      { over: ['storefront', 'orders', 'dispatch'], never: [] },
      { over: ['storefront', 'dispatch'], never: [{ service: 'orders', request: D.SERVICES.orders.adjustable.max }] }
    ];
    var save = req;
    var wMax = 0;
    worst.forEach(function (wc) {
      req = {};
      D.ORDER.forEach(function (s) { req[s] = D.SERVICES[s].adjustable.min; });
      req.orders = wc.never.length ? D.SERVICES.orders.adjustable.max : D.SERVICES.orders.adjustable.min;
      drawWarnings(neverWarnings({ never: wc.never }).concat(overWarnings({ over: wc.over })));
      wMax = Math.max(wMax, warn.offsetHeight);
    });
    req = save;
    warn.style.minHeight = wMax + 'px';
    /* the drawing: the most nodes any setting needs (every request at its maximum, spare on), and the
       never-placeable bar above it */
    var bigReq = {};
    D.ORDER.forEach(function (s) { bigReq[s] = D.SERVICES[s].adjustable.max; });
    bigReq.orders = D.CAPACITY.memory;
    var big = M.evaluate(D, bigReq, true);
    D.ORDER.forEach(function (s) { RD.SERVICES[s].size = bigReq[s]; });
    R.reset();
    render(big, []);
    drawNever({ never: [{ service: 'orders', request: D.SERVICES.orders.adjustable.max }] });
    dhead.textContent = T.drawHeadNone;
    main.style.minHeight = main.offsetHeight + 'px';
  }

  function layout(width) {
    root.classList.toggle('ssw--wide', width >= 720);
    root.classList.toggle('ssw--narrow', width < 400);
    title.textContent = width < 360 ? T.titleShort : T.title;
    var keep = lastChange;
    lastChange = null;
    reserve();
    update();
    lastChange = keep;
  }

  ctx.onResize(function (w) { layout(w || el.clientWidth); });
  if (wideMQ.addEventListener) wideMQ.addEventListener('change', function () { layout(el.clientWidth); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { layout(el.clientWidth); });
  /* a drawing whose column changed width without the mount changing (fonts, scrollbars) */
  if ('ResizeObserver' in window) {
    new ResizeObserver(function () {
      if (current && Math.abs((draw.clientWidth || 0) - drawW) >= 1) { var k = lastChange; lastChange = null; render(current, []); lastChange = k; }
    }).observe(draw);
  }
});
