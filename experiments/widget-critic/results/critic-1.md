# Critic report: extractor-1.json

8 pointers, 10 manipulations, 11 named elements. 6 errors, 9 warnings, 0 info.

1. **error · sibling**: Service.memory_request is adjustable for storefront, orders, dispatch but not for payments, notifications
   the text asks the reader to change payments in the widget
2. **error · coverage** · k-04: the text asks the reader to change payments memory_request in the widget, which has no control for it
   > the payments team doubles its memory request ... W-02, below, shows how far it goes.
   controls: memory_request for storefront, orders, dispatch; spare switch; reset
3. **error · execute** · k-08: from the default state the widget does not show what the text says (0/1 plausible starts pass)
   > To cut the bill, Morgan suggests halving every service’s memory request. ... Halved requests fit onto fewer nodes, but at the rush several services would use more than they reserved. ... (W-02’s warnings show which services.)
   expected services_over count_gte 2; got services_over = [orders] | states: storefront 4, orders 6, dispatch 2, spare on → storefront 2, orders 3, dispatch 1, spare on
4. **error · execute** · k-09: from the default state the widget does not show what the text says (0/6 plausible starts pass)
   > Raising the request does: each copy reserves more room, and on nodes that are already full, that can mean another node on the bill (try orders at 8 and then 12 GB in W-02).
   expected nodes_for_pods increases state 1 (implied); got nodes_for_pods = 4 (state 1: 4); expected nodes_total increases state 1 (implied); got nodes_total = 5 (state 1: 5) | states: storefront 4, orders 6, dispatch 2, spare on → storefront 4, orders 8, dispatch 2, spare on → storefront 4, orders 12, dispatch 2, spare on
5. **error · execute** · k-04: the pointer needs a setting the widget has no control for
   > The scheduler counts the doubled request in full, so each payments Pod takes twice the room, and on a full cluster that’s another node, or a Pod that waits. W-02, below, shows how far it goes.
   payments has no control: scaling payments is not possible in the widget; applied to the model only where noted
6. **error · execute** · k-04: from the default state the widget does not show what the text says (0/1 plausible starts pass)
   > The scheduler counts the doubled request in full, so each payments Pod takes twice the room, and on a full cluster that’s another node, or a Pod that waits. W-02, below, shows how far it goes.
   expected nodes_for_pods increases state 0 (implied); got nodes_for_pods = 4 (state 0: 4) | states: storefront 4, orders 6, dispatch 2, spare on → storefront 4, orders 6, dispatch 2, spare on
7. **warn · execute** · s-05: passes from the default state but not from 1 state(s) earlier text leaves the reader in
   > Some unused room is therefore insurance ... the spare-node switch in W-02 shows what it costs.
   after p2 (s-04): nodes_total = 4 (state 0: 4)
8. **warn · naming** · s-04: the text calls a widget part "Ari's sizing sheet (W-02 as a whole)", which the widget never prints
   > W-02 is Ari’s sizing sheet.
   nearest printed: "W-02 · Ari’s sizing sheet", "W-02 · Ari’s sizing sheet", "W-02 · Sizing sheet"
9. **warn · naming** · s-03: the text calls a widget part "sizing sheet (W-02 as a whole)", which the widget never prints
   > the sizing sheet in §04, need JavaScript
   nearest printed: "W-02 · Ari’s sizing sheet", "W-02 · Ari’s sizing sheet", "W-02 · Sizing sheet"
10. **warn · naming** · s-04: the text calls a widget part "Pod outline (reservation)", which the widget never prints
   > Each Pod’s outline is what it reserves
   nearest printed: "Nothing over its reservation.", "Over its reservation: {list}.", ", ev.over.indexOf(s) >= 0);
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
    Array.prototype.forEach.call(rootEl.querySelectorAll("
11. **warn · naming** · s-04: the text calls a widget part "solid use fill inside each Pod", which the widget never prints
   > the solid fill inside it is what it used at last Friday’s rush
   nearest printed: " sizes follow the steppers; SizingData itself
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
  function pad2(n) { return n < 10 ? ", ", ev.over.indexOf(s) >= 0);
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
    Array.prototype.forEach.call(rootEl.querySelectorAll(", " + fill(T.usedAt, { use: gb(svc.use) }));
    var meta = mk("
12. **warn · naming** · s-04: the text calls a widget part "spare-node switch", which the widget never prints
   > Switch off the spare node.
   nearest printed: "Spare node {state}. ", ";
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
      /* the count", ";
    /* the drawing: the most nodes any setting needs (every request at its maximum, spare on), and the
       never-placeable bar above it */
    var bigReq = {};
    D.ORDER.forEach(function (s) { bigReq[s] = D.SERVICES[s].adjustable.max; });
    bigReq.orders = D.CAPACITY.memory;
    var big = M.evaluate(D, bigReq, true);
    D.ORDER.forEach(function (s) { RD.SERVICES[s].size = bigReq[s]; });
    R.reset();
    render(big, []);
    drawNever({ never: [{ service: "
13. **warn · naming** · s-05: the text calls a widget part "spare-node switch", which the widget never prints
   > the spare-node switch in W-02
   nearest printed: "Spare node {state}. ", ";
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
      /* the count", ";
    /* the drawing: the most nodes any setting needs (every request at its maximum, spare on), and the
       never-placeable bar above it */
    var bigReq = {};
    D.ORDER.forEach(function (s) { bigReq[s] = D.SERVICES[s].adjustable.max; });
    bigReq.orders = D.CAPACITY.memory;
    var big = M.evaluate(D, bigReq, true);
    D.ORDER.forEach(function (s) { RD.SERVICES[s].size = bigReq[s]; });
    R.reset();
    render(big, []);
    drawNever({ never: [{ service: "
14. **warn · naming** · s-04: the text calls a widget part "idle bar: unreserved-room segment", which the widget never prints
   > The first is room that no Pod has reserved
   nearest printed: ", gb: ev.idle.notReserved, seg: segFree, name: T.idle.notReserved }
    ];
    var x = 0;
    parts.forEach(function (p) {
      p.pct = room ? p.gb / room * 100 : 0;
      p.left = x;
      p.seg.style.width = p.pct + ", "The rented room", "Keep room to lose a node"
15. **warn · naming** · s-04: the text calls a widget part "idle bar: reserved-but-unused segment", which the widget never prints
   > The second is room that Pods have reserved and don’t use
   nearest printed: ", gb: ev.idle.reservedUnused, seg: segRes, name: T.idle.reservedUnused },
      { key: ", ", gb: ev.idle.notReserved, seg: segFree, name: T.idle.notReserved }
    ];
    var x = 0;
    parts.forEach(function (p) {
      p.pct = room ? p.gb / room * 100 : 0;
      p.left = x;
      p.seg.style.width = p.pct + ", "Reserved"
