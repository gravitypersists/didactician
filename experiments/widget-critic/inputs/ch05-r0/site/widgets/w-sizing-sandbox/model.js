/* w-sizing-sandbox/model.js · window.SizingModel: the sizing sheet's model, pure functions, no DOM.
   Kept apart from the drawing (index.js) so later chapters can reuse it without the controls (plan
   w-sizing-sandbox reuse: Ch 8 per time step, Ch 11 per-team totals, Ch 14 billing modes).

   The model (plan ## Widgets w-sizing-sandbox; facts c-02, c-03, c-05):
   - Every Pod is whole on one node; on each node, for memory and for processor separately, the
     requests of the Pods placed there must fit within the node's room for Pods (c-02).
   - Nodes needed = the FEWEST nodes on which every Pod fits, found by an exact search (not a greedy
     heuristic, which can lower the count when a request rises). With the spare-node switch on: one
     more node, kept empty. If a Pod's request is larger than a node's room, there is no answer.
   - Set by: the count with memory requests alone and with processor requests alone, compared with
     the count for both: MEMORY, PROCESSOR or BOTH, whichever forces it.
   - The idle split of the rented room: used at the rush (part of it inside reservations, part above
     them), reserved but not used, and neither reserved nor used. The three add up to the rented room.

   API (amounts in the data's units: GB and cores; `data` is window.SizingData or the same shape):
     SizingModel.pods(data, requests)           → [{ id, service, memory, cpu, use }]
     SizingModel.pack(items, room, opts)        → { count, bins: [[id…]…], steps } or { count: null, never: [id…] }
     SizingModel.evaluate(data, requests, spare) → everything the sheet shows (see evaluate below)
     SizingModel.selfTest(data)                 → { ok, results: [{ name, ok, got, want }], maxSteps }
   `requests` = { storefront: 4, orders: 6, dispatch: 2 } (memory GB per copy; services left out keep
   their data request). Results are memoised per setting. */
(function (root) {
  'use strict';

  var SCALE = 100;   /* amounts as integers (0.01 GB, 0.01 core), so sums are exact */
  function q(x) { return Math.round(x * SCALE); }
  function uq(n) { return n / SCALE; }

  /* the sheet's Pods: each service's copies with its memory request, processor request and use */
  function pods(data, requests) {
    var out = [];
    Object.keys(data.SERVICES).forEach(function (svc) {
      var s = data.SERVICES[svc];
      var mem = requests && requests[svc] != null ? requests[svc] : s.size;
      (s.pods || []).forEach(function (id) {
        out.push({ id: id, service: svc, memory: mem, cpu: s.cpu, use: s.use });
      });
    });
    return out;
  }

  /* Exact bin packing in two dimensions: is there a placement of `items` on k nodes? Depth-first,
     largest Pod first; a Pod is never tried on a second node whose reserved (memory, processor) equals
     one already tried for it (identical nodes give identical subtrees), and a branch stops as soon as
     the remaining requests can't fit in the remaining free room. */
  function feasible(items, k, capM, capC, counter) {
    var n = items.length;
    var usedM = [], usedC = [], bins = [];
    for (var b = 0; b < k; b++) { usedM.push(0); usedC.push(0); bins.push([]); }
    var remM = new Array(n + 1), remC = new Array(n + 1);
    remM[n] = 0; remC[n] = 0;
    for (var i = n - 1; i >= 0; i--) { remM[i] = remM[i + 1] + items[i].m; remC[i] = remC[i + 1] + items[i].c; }
    var placedM = 0, placedC = 0;

    function rec(i) {
      if (i === n) return true;
      counter.steps++;
      if (remM[i] > k * capM - placedM || remC[i] > k * capC - placedC) return false;
      var it = items[i];
      for (var b = 0; b < k; b++) {
        if (usedM[b] + it.m > capM || usedC[b] + it.c > capC) continue;
        var dup = false;
        for (var a = 0; a < b; a++) { if (usedM[a] === usedM[b] && usedC[a] === usedC[b]) { dup = true; break; } }
        if (dup) continue;
        usedM[b] += it.m; usedC[b] += it.c; placedM += it.m; placedC += it.c; bins[b].push(it.id);
        if (rec(i + 1)) return true;
        usedM[b] -= it.m; usedC[b] -= it.c; placedM -= it.m; placedC -= it.c; bins[b].pop();
      }
      return false;
    }
    return rec(0) ? bins : null;
  }

  /* The fewest nodes of `room` ({ memory, cpu }) that hold every item ({ id, memory, cpu }).
     opts.ignore: 'cpu' or 'memory' counts with one resource only. */
  function pack(list, room, opts) {
    opts = opts || {};
    var capM = opts.ignore === 'memory' ? 1 : q(room.memory);
    var capC = opts.ignore === 'cpu' ? 1 : q(room.cpu);
    var items = list.map(function (p) {
      return { id: p.id, m: opts.ignore === 'memory' ? 0 : q(p.memory), c: opts.ignore === 'cpu' ? 0 : q(p.cpu) };
    });
    var never = items.filter(function (it) { return it.m > capM || it.c > capC; }).map(function (it) { return it.id; });
    if (never.length) return { count: null, never: never, bins: null, steps: 0 };
    if (!items.length) return { count: 0, bins: [], steps: 0 };
    /* largest first: by the larger share of a node it takes, then memory, then processor; ties keep
       the data's order, so the drawing is stable */
    items.forEach(function (it, i) { it.k = Math.max(it.m / capM, it.c / capC); it.i = i; });
    items.sort(function (a, b) { return (b.k - a.k) || (b.m - a.m) || (b.c - a.c) || (a.i - b.i); });
    var sumM = 0, sumC = 0;
    items.forEach(function (it) { sumM += it.m; sumC += it.c; });
    var lb = Math.max(1, Math.ceil(sumM / capM - 1e-9), Math.ceil(sumC / capC - 1e-9));
    var counter = { steps: 0 };
    for (var k = lb; k <= items.length; k++) {
      var bins = feasible(items, k, capM, capC, counter);
      if (bins) return { count: k, bins: bins, steps: counter.steps };
    }
    return { count: items.length, bins: items.map(function (it) { return [it.id]; }), steps: counter.steps };   /* unreachable */
  }

  function setByWord(both, memOnly, cpuOnly) {
    if (both == null) return null;
    var m = memOnly === both, c = cpuOnly === both;
    if (m && !c) return 'memory';
    if (c && !m) return 'processor';
    return 'both';   /* both alone reach it, or only the two together do */
  }

  var memo = {};
  function key(data, requests, spare) {
    return Object.keys(data.SERVICES).map(function (s) {
      return requests && requests[s] != null ? requests[s] : data.SERVICES[s].size;
    }).join(',') + (spare ? '+1' : '');
  }

  /* Everything the sheet shows for one setting:
     { feasible, nodes (incl. the spare; null if no answer), base (without the spare), spare (bool),
       setBy ('memory' | 'processor' | 'both' | null), memOnly, cpuOnly,
       placement: [[podId…] per node, the spare last and empty], restNodes (no answer: nodes holding the
       placeable Pods), never: [{ service, request }],
       reserved, rented, used, idle: { used, usedOver, reservedUnused, notReserved } (GB),
       over: [service…] (request below use), steps } */
  function evaluate(data, requests, spare) {
    var k = key(data, requests, spare);
    if (memo[k]) return memo[k];
    var room = data.CAPACITY;
    var list = pods(data, requests);
    var all = pack(list, room);
    var memOnly = pack(list, room, { ignore: 'cpu' }).count;
    var cpuOnly = pack(list, room, { ignore: 'memory' }).count;
    var r = { spare: !!spare, steps: all.steps, memOnly: memOnly, cpuOnly: cpuOnly, never: [] };

    var neverSvc = {};
    if (all.count == null) {
      all.never.forEach(function (id) {
        var p = list.filter(function (x) { return x.id === id; })[0];
        if (!neverSvc[p.service]) { neverSvc[p.service] = true; r.never.push({ service: p.service, request: p.memory }); }
      });
      /* the drawing still packs the Pods that can be placed */
      var rest = pack(list.filter(function (p) { return !neverSvc[p.service]; }), room);
      r.feasible = false;
      r.base = null; r.nodes = null; r.setBy = null;
      r.restNodes = rest.count + (spare ? 1 : 0);
      r.placement = rest.bins.slice();
      r.steps += rest.steps;
    } else {
      r.feasible = true;
      r.base = all.count;
      r.nodes = all.count + (spare ? 1 : 0);
      r.setBy = setByWord(all.count, memOnly, cpuOnly);
      r.placement = all.bins.slice();
    }
    if (spare) r.placement.push([]);

    /* the idle split, in 0.01 GB integers so it adds up exactly */
    var drawn = r.placement.length;
    var rented = drawn * q(room.memory);
    var reserved = 0, used = 0, usedOver = 0, reservedUnused = 0, placedRes = 0;
    var over = {};
    list.forEach(function (p) {
      var m = q(p.memory), u = q(p.use);
      /* reserved and used count every Pod (a never-placeable Pod still has its request); the idle
         split counts the Pods on the drawn nodes */
      reserved += m; used += u;
      if (u > m) over[p.service] = true;
      if (neverSvc[p.service]) return;
      placedRes += m;
      if (u > m) usedOver += u - m; else reservedUnused += m - u;
    });
    var placedUse = 0;
    list.forEach(function (p) { if (!neverSvc[p.service]) placedUse += q(p.use); });
    r.reserved = uq(reserved);
    r.rented = r.feasible ? uq(rented) : null;
    r.drawnRoom = uq(rented);
    r.used = uq(used);
    r.idle = { used: uq(placedUse), usedOver: uq(usedOver), reservedUnused: uq(reservedUnused), notReserved: uq(rented - placedRes - usedOver) };
    r.over = Object.keys(data.SERVICES).filter(function (s) { return over[s]; });
    memo[k] = r;
    return r;
  }

  /* The plan's expected values (ac-08), and the rule that raising a request never lowers the count,
     checked over every setting of the three steppers. Run in a browser console
     (SizingModel.selfTest(SizingData)) or with node selftest.mjs. */
  function selfTest(data) {
    var results = [];
    function check(name, got, want) { results.push({ name: name, ok: got === want, got: got, want: want }); }
    var d = { storefront: 4, orders: 6, dispatch: 2 };
    var e = evaluate(data, d, true);
    check('defaults, spare on: nodes', e.nodes, 5);
    check('defaults, spare on: set by', e.setBy, 'memory');
    check('defaults: reserved GB', e.reserved, 38);
    check('defaults, spare on: rented GB', e.rented, 65);
    check('defaults: used GB', e.used, 19.5);
    check('defaults, spare on: used %', Math.round(e.used / e.rented * 100), 30);
    check('defaults, spare off: nodes', evaluate(data, d, false).nodes, 4);
    var rs = { storefront: 2.5, orders: 6, dispatch: 1.5 };
    check('right-sized (2.5, 6, 1.5), spare off: nodes', evaluate(data, rs, false).nodes, 3);
    check('right-sized (2.5, 6, 1.5): set by', evaluate(data, rs, false).setBy, 'both');
    check('right-sized (2.5, 6, 1.5), spare on: nodes', evaluate(data, rs, true).nodes, 4);
    var at = { storefront: 2, orders: 6, dispatch: 1 };
    check('at use (2, 6, 1), spare off: nodes', evaluate(data, at, false).nodes, 3);
    check('at use (2, 6, 1): set by', evaluate(data, at, false).setBy, 'processor');
    check('at use (2, 6, 1), spare on: nodes', evaluate(data, at, true).nodes, 4);
    check('orders 8, others right-sized, spare off: nodes', evaluate(data, { storefront: 2.5, orders: 8, dispatch: 1.5 }, false).nodes, 3);
    check('orders 12, others right-sized, spare off: nodes', evaluate(data, { storefront: 2.5, orders: 12, dispatch: 1.5 }, false).nodes, 4);
    check('orders 13 placeable', evaluate(data, { storefront: 4, orders: 13, dispatch: 2 }, true).feasible, true);
    var big = evaluate(data, { storefront: 4, orders: 13.5, dispatch: 2 }, true);
    check('orders 13.5: no answer', big.nodes, null);
    check('orders 13.5: orders never placeable', big.never.map(function (x) { return x.service; }).join(), 'orders');
    check('orders 13.5: reserved still counts every request', big.reserved, 45.5);
    check('orders 13.5: used still 19.5', big.used, 19.5);
    check('storefront 1.5: over its reservation', evaluate(data, { storefront: 1.5, orders: 6, dispatch: 2 }, true).over.join(), 'storefront');

    /* monotone: raising any one request by a step never lowers the count (with and without spare),
       and the idle split always adds up to the rented room */
    var adj = Object.keys(data.SERVICES).filter(function (s) { return data.SERVICES[s].adjustable; });
    var ranges = adj.map(function (s) {
      var a = data.SERVICES[s].adjustable, v = [];
      for (var x = a.min; x <= a.max + 1e-9; x += a.step) v.push(Math.round(x * 100) / 100);
      return v;
    });
    var bad = 0, split = 0, maxSteps = 0, settings = 0;
    function walk(i, cur) {
      if (i === adj.length) {
        settings++;
        [false, true].forEach(function (sp) {
          var base = evaluate(data, cur, sp);
          maxSteps = Math.max(maxSteps, base.steps);
          var t = base.idle.used + base.idle.reservedUnused + base.idle.notReserved;   /* used includes the part above reservations */
          if (Math.abs(t - base.drawnRoom) > 1e-6) split++;
          adj.forEach(function (s, j) {
            var v = ranges[j], at2 = v.indexOf(cur[s]);
            if (at2 < v.length - 1) {
              var up = {}; for (var kk in cur) up[kk] = cur[kk];
              up[s] = v[at2 + 1];
              var hi = evaluate(data, up, sp);
              var lo = base.nodes == null ? Infinity : base.nodes, h = hi.nodes == null ? Infinity : hi.nodes;
              if (h < lo) bad++;
            }
          });
        });
        return;
      }
      ranges[i].forEach(function (x) { cur[adj[i]] = x; walk(i + 1, cur); });
      delete cur[adj[i]];
    }
    walk(0, {});
    check('raising a request never lowers the count (' + settings + ' settings × 2)', bad, 0);
    check('idle split adds up to the rented room', split, 0);
    return { ok: results.every(function (x) { return x.ok; }), results: results, maxSteps: maxSteps, settings: settings };
  }

  root.SizingModel = { pods: pods, pack: pack, evaluate: evaluate, selfTest: selfTest };
})(typeof window !== 'undefined' ? window : globalThis);
