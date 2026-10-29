/* w-sizing-sandbox/data.js · window.SizingData: W-02 "Ari's sizing sheet" (Ch 05 §04).
   Fennel's services as the sheet counts them (story facts, plan R2; d-03) and every reader-visible
   string. It is ALSO the data object for the pooled cluster drawing (pool/cluster/cluster.js:
   ClusterCanvas.create(data)), separate from lane F's window.ClusterData, so the two renderers on the
   page don't share state. index.js copies it before changing requests; this file is never mutated.

   Fields the pool reads (explainers/_pool/README.md, "Cluster drawing"): NODES, CAPACITY, UNIT,
   ROOM_UNIT, SERVICES (size = memory request in GB per copy, cpu = processor request in cores,
   label, breaks), LOOPS, PODS, STRINGS.
   Fields the sheet adds: SERVICES[s].copies, .pods (Pod ids), .use (memory used at last Friday's rush,
   GB per copy), .useCpu (processor used, cores; shown nowhere, kept for later chapters), .adjustable
   ({ min, max, step } for the three steppers); ORDER (stepper order); SHEET (the sheet's own strings;
   {name} placeholders are filled by index.js). */
(function () {
  'use strict';

  var SERVICES = {
    storefront:    { size: 4, cpu: 0.5,  use: 2,   useCpu: 0.3, copies: 3, label: 'storefront',    breaks: ['store-', 'front'],
                     adjustable: { min: 0.5, max: 8, step: 0.5 } },
    orders:        { size: 6, cpu: 1,    use: 5.5, useCpu: 0.5, copies: 1, label: 'orders',        breaks: ['orders'],
                     adjustable: { min: 0.5, max: 16, step: 0.5 } },
    dispatch:      { size: 2, cpu: 1,    use: 1,   useCpu: 0.6, copies: 6, label: 'dispatch',      breaks: ['dis-', 'patch'],
                     adjustable: { min: 0.5, max: 6, step: 0.5 } },
    payments:      { size: 2, cpu: 0.25, use: 0.5, useCpu: 0.1, copies: 2, label: 'payments',      breaks: ['pay-', 'ments'] },
    notifications: { size: 2, cpu: 0.25, use: 0.5, useCpu: 0.1, copies: 2, label: 'notifications', breaks: ['notifi-', 'cations'] }
  };
  var PREFIX = { storefront: 'sf', orders: 'or', dispatch: 'di', payments: 'pa', notifications: 'no' };
  var PODS = {};
  Object.keys(SERVICES).forEach(function (s) {
    SERVICES[s].pods = [];
    for (var i = 1; i <= SERVICES[s].copies; i++) {
      var id = PREFIX[s] + i;
      SERVICES[s].pods.push(id);
      PODS[id] = { service: s };
    }
  });

  window.SizingData = {
    NODES: [],
    CAPACITY: { memory: 13, cpu: 3.9 },   /* room for Pods on a 16 GB, 4-core node (c-05; R2) */
    UNIT: 'GB',
    ROOM_UNIT: 2,                          /* one drawn unit = 2 GB, Ch 04's one-unit chip */
    SERVICES: SERVICES,
    ORDER: ['storefront', 'orders', 'dispatch'],
    LOOPS: {},
    PODS: PODS,

    /* the pool drawing's strings (nodes only: no record, loops or header are drawn) */
    STRINGS: {
      widget: 'W-02 · Ari’s sizing sheet', widgetShort: 'W-02', step: 'Step', node: 'Node', free: 'free', down: 'Down',
      status: { running: 'Running', notstarted: 'Not started', starting: 'Starting', lost: 'Lost', crashed: 'Crashed', waiting: 'Waiting' },
      statusBreaks: { notstarted: ['Not', 'started'] },
      nodeStatus: { unknown: 'Unknown' },
      record: { title: 'The cluster’s record', titleShort: 'The record', want: 'WANT', running: 'RUNNING', short: 'SHORT', unknown: 'UNKNOWN', waiting: 'WAITING' },
      loopMark: '↻', agent: 'agent', agents: 'agents',
      lens: { watching: 'Sees', doing: 'Does' },
      cpu: 'CPU',
      spare: 'Spare',
      use: { over: 'Uses more than it reserves', overBreaks: ['Uses more', 'than it', 'reserves'], overShort: 'Over' }
    },

    /* the sheet's own strings */
    SHEET: {
      title: 'W-02 · Ari’s sizing sheet',
      titleShort: 'W-02 · Sizing sheet',
      nodes: 'Nodes',
      nodesSub: 'what Fennel rents, and pays for in standard mode',
      nodesNone: '—',
      nodesSpare: '{n} for the Pods + 1 spare',
      nodesNoSpare: 'all {n} for the Pods, no spare',
      nodesNoneSub: 'no count while a Pod fits on no node',
      setBy: 'Set by',
      setByWord: { memory: 'Memory', processor: 'Processor', both: 'Both', none: '—' },
      setBySub: 'for the Pods, memory alone needs {mem}, processor alone {cpu}',
      setBySubNone: 'no answer while a Pod fits on no node',
      reserved: 'Reserved',
      reservedOf: '{reserved} of {rented} GB',
      reservedNone: '{reserved} GB',
      used: 'Used at the rush',
      usedVal: '{used} GB',
      idle: {
        head: 'The rented room',
        used: ['Used at', 'the rush'],
        reservedUnused: ['Reserved,', 'not used'],
        notReserved: ['Not', 'reserved'],
        amount: '{gb} GB · {pct}%',
        none: 'No count while a Pod fits on no node'
      },
      controlsHead: 'Memory requests, per copy',
      copies: { one: '{n} copy', many: '{n} copies' },
      copiesShort: ' ×{n}',
      rowOver: ' · Over',
      request: 'Request',
      usedAt: 'used {use} GB',
      gb: '{v} GB',
      lower: 'Lower the {svc} memory request',
      raise: 'Raise the {svc} memory request',
      spare: 'Keep room to lose a node',
      spareOn: 'On',
      spareOff: 'Off',
      reset: 'Reset to Fennel’s requests',
      warnHead: 'Warnings',
      warnNone: 'None: every Pod reserves at least what it used',
      warnOver: '{svc} requests {req} GB and used {use} GB at the rush: first in line if a node runs short (§08).',
      warnNever: '{svc} requests {req} GB, more than the {room} GB a node has for Pods: no node can ever take it.',
      drawHead: 'The nodes, packed as tightly as they go',
      drawHeadNone: 'The other Pods, packed as tightly as they go',
      neverHead: 'Never placeable',
      neverBody: '{svc} · {req} GB',
      neverRoom: 'a node’s room for Pods · {room} GB',
      /* the polite live sentence (one per change) */
      live: '{change}{nodes} nodes, set by {setBy}. {reserved} of {rented} GB reserved; {used} GB used at the rush. {warn}',
      liveNone: '{change}No node count: {never}. {warn}',
      liveChange: '{svc} request {v} GB. ',
      liveSpare: 'Spare node {state}. ',
      liveReset: 'Reset to Fennel’s requests. ',
      liveOk: 'Nothing over its reservation.',
      liveOver: 'Over its reservation: {list}.',
      liveNever: '{svc} requests {req} GB and fits on no node',
      and: ' and ',
      comma: ', ',
      tooShort: 'Too short to name on the drawing: {list}',
      tooShortItem: '{svc} ({n} × {gb} GB)'
    }
  };
})();
