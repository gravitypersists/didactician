# Critic report: extractor-2.json

8 pointers, 10 manipulations, 10 named elements. 6 errors, 5 warnings, 0 info.

1. **error · sibling**: Service.memory_request is adjustable for storefront, orders, dispatch but not for payments, notifications
   the text asks the reader to change payments in the widget
2. **error · coverage** · k-04: the text asks the reader to change payments memory_request in the widget, which has no control for it
   > the payments team doubles its memory request … W-02, below, shows how far it goes.
   controls: memory_request for storefront, orders, dispatch; spare switch; reset
3. **error · execute** · k-09: from the default state the widget does not show what the text says (0/6 plausible starts pass)
   > on nodes that are already full, that can mean another node on the bill (try orders at 8 and then 12 GB in W-02)
   expected nodes_total increases state 1 (implied); got nodes_total = 5 (state 1: 5) | states: storefront 4, orders 6, dispatch 2, spare on → storefront 4, orders 8, dispatch 2, spare on → storefront 4, orders 12, dispatch 2, spare on
4. **error · execute** · k-04: the pointer needs a setting the widget has no control for
   > each payments Pod takes twice the room, and on a full cluster that’s another node, or a Pod that waits. W-02, below, shows how far it goes.
   payments has no control: scaling payments is not possible in the widget; applied to the model only where noted
5. **error · execute** · k-04: from the default state the widget does not show what the text says (0/1 plausible starts pass)
   > each payments Pod takes twice the room, and on a full cluster that’s another node, or a Pod that waits. W-02, below, shows how far it goes.
   expected reserved_gb increases state 0 (implied); got reserved_gb = 38 (state 0: 38); expected nodes_total increases state 0 (implied); got nodes_total = 5 (state 0: 5) | states: storefront 4, orders 6, dispatch 2, spare on → storefront 4, orders 6, dispatch 2, spare on
6. **error · execute** · k-08: from the default state the widget does not show what the text says (0/1 plausible starts pass)
   > Halved requests fit onto fewer nodes, but at the rush several services would use more than they reserved. … (W-02’s warnings show which services.)
   expected services_over count_gte 2; got services_over = [orders] | states: storefront 4, orders 6, dispatch 2, spare on → storefront 2, orders 3, dispatch 1, spare on
7. **warn · naming** · s-04: the text calls a widget part "Pod outline (reserved)", which the widget never prints
   > Each Pod’s outline is what it reserves
   nearest printed: "Reserved", "Reserved, not used", "Reserved,"
8. **warn · naming** · s-04: the text calls a widget part "Pod solid fill (used at the rush)", which the widget never prints
   > the solid fill inside it is what it used at last Friday’s rush
   nearest printed: "Used at the rush", "Used at the rush", "{svc} requests {req} GB and used {use} GB at the rush: first in line if a node runs short (§08)."
9. **warn · naming** · s-04: the text calls a widget part "idle bar: room no Pod has reserved", which the widget never prints
   > The first is room that no Pod has reserved
   nearest printed: ", gb: ev.idle.notReserved, seg: segFree, name: T.idle.notReserved }
    ];
    var x = 0;
    parts.forEach(function (p) {
      p.pct = room ? p.gb / room * 100 : 0;
      p.left = x;
      p.seg.style.width = p.pct + ", ", gb: ev.idle.reservedUnused, seg: segRes, name: T.idle.reservedUnused },
      { key: ", "Reserved"
10. **warn · naming** · s-04: the text calls a widget part "idle bar: reserved, not used", which the widget never prints
   > The second is room that Pods have reserved and don’t use
   nearest printed: ", gb: ev.idle.reservedUnused, seg: segRes, name: T.idle.reservedUnused },
      { key: ", "Reserved, not used", "{change}{nodes} nodes, set by {setBy}. {reserved} of {rented} GB reserved; {used} GB used at the rush. {warn}"
11. **warn · naming** · s-05: the text calls a widget part "spare-node switch", which the widget never prints
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
