/* w-friday-scrolly · data. Ch 05, §03 "Friday, 17:45: a Pod with nowhere to go" (lane F, steps F1–F5).
   Classic script; defines window.ClusterData (the pool's default name; W-02 uses window.SizingData).
   Every reader-visible string of the lane (canvas and step text) lives in this file. Fennel's nodes,
   requests, Pod names, times and the Friday story are fiction (plan R2, d-03); the scheduler's recorded
   reason follows the documented format and is illustrative (facts c-20, x-06), which the caption under
   the lane says. Mechanism: the ReplicaSet loop writes Pod records (Ch 04 c-12); the scheduler takes Pods
   with no node one at a time, rules out every node where reserved + request exceeds the room for Pods in
   memory OR processor (c-01, c-02), and among the rest prefers, by default, the node with more room left
   unreserved and fewer copies of the same service (c-06, c-07), choosing at random between ties (c-01);
   a Pod that no node passes stays WAITING and the scheduler records why (c-20) and retries when the
   cluster changes, such as a node joining (c-21); running Pods never move (Ch 04).

   The drawing and the lane controller are the course pool's: pool/cluster/cluster.js and
   pool/cluster/lanes.js. The snapshot format, the step fields and the highlight keys are documented in
   explainers/_pool/README.md ("Cluster drawing", "Cluster lanes"). Each step's `state` is a COMPLETE
   snapshot, not a diff, so any step can be drawn on its own and scrolling back restores it exactly.

   Ch 05 fields this lane uses (on top of Ch 04's format; each is optional in the pool and off when absent):
   - CAPACITY { memory: 13, cpu: 3.9 }: room for Pods per node, in GB and cores (16 GB, 4-core machines,
     part kept back for the system: c-05). UNIT 'GB' prints memory amounts as "3 GB FREE".
   - ROOM_UNIT 2: one drawn unit of room is 2 GB, so chip height = memory request and Ch 04's proportions
     hold (one Ch 04 room unit was 2 GB of memory request).
   - SERVICES[s].cpu: the per-copy processor request, in cores, beside `size` (the memory request, GB).
     Each node's footer "CPU 2.75 / 3.9" is COMPUTED from the Pods' cpu, never written here.
   - state.waiting: ['di7']: Pods with no node, drawn in the WAITING · NO ROOM strip (not in any node's
     list); the record's row word gains "· n WAITING" (computed).
   - state.verdicts: { node: 'fits' | 'mem' | 'cpu' | 'mem cpu' | { verdict, memory, cpu } }: the
     scheduler's verdict on each node's bar. The object form gives the free amounts at the moment of
     the check, when that check happened before the drawn placement (F2's second check, F5).
   - notes[].type 'scheduler': the recorded reason, labelled SCHEDULER (STRINGS.scheduler).
   - state.newNodes: ['05', '06']: the NEW tag on nodes added in that step.

   Numbers (option (b), d-04; corrected by the orchestrator for F3): requests per copy, memory · processor:
   storefront 4 GB · 0.5, orders 6 · 1, payments 2 · 0.25, dispatch 2 · 1, notifications 2 · 0.25.
     17:45   01: payments, storefront, dispatch, notifications   10 GB (3 free)  CPU 2.0  (1.9 free)
             02: dispatch, dispatch, storefront, notifications   10 GB (3 free)  CPU 2.75 (1.15 free)
             04: payments, storefront, orders                    12 GB (1 free)  CPU 1.75 (2.15 free)
     F2      1st new Pod: 01 fits, 02 fits, 04 no memory → 01 (more processor unreserved, fewer dispatch
             copies). 01 is then 12 GB, CPU 3.0 (1 GB, 0.9 free). 2nd: 01 no memory AND no processor,
             02 fits, 04 no memory → 02 (12 GB, CPU 3.75: 1 GB, 0.15 free). The canvas shows the 2nd check.
     F3      3rd: 01 mem cpu, 02 mem cpu, 04 mem → waits. "0/3 nodes are available: 2 Insufficient cpu,
             3 Insufficient memory." (§03's prose quotes the same string.)
     F5      05 and 06 join empty (13 GB, 3.9 cores free each): both fit, a tie → 05; 06 stays empty.

   Pod ids continue Ch 04's (its end state after 03:04, as edited at Ch 05 d-04): or2 is the replacement
   orders Pod (orders-q2rw, the Pod of §07's Tuesday) and di4 the replacement dispatch Pod on 01;
   notifications (no1, no2) is new in the story (R2); di5–di7 are Friday's three new dispatch Pods. */
(function () {
  'use strict';

  var NODES = ['01', '02', '04'];          /* 05 and 06 join in F5; the lane reserves five columns from F1 */
  var CAPACITY = { memory: 13, cpu: 3.9 }; /* room for Pods per node */
  var UNIT = 'GB';
  var ROOM_UNIT = 2;                       /* one drawn unit of room = 2 GB (Ch 04's unit) */

  /* size = memory request in GB, cpu = processor request in cores (per copy, R2); chip label, and
     where the label may break on a narrow chip. A 2 GB Pod is a one-line chip in this lane, which
     shows only the first break, so the one-line services keep their whole name: where it doesn't fit,
     the chip cuts it with an ellipsis ("dispa…"), which reads as cut, where "dis-" would read as a
     word. (storefront, 4 GB, has two lines.) */
  var SERVICES = {
    storefront:    { size: 4, cpu: 0.5,  label: 'storefront',    breaks: ['store-', 'front'] },
    orders:        { size: 6, cpu: 1,    label: 'orders',        breaks: ['orders'] },
    payments:      { size: 2, cpu: 0.25, label: 'payments',      breaks: ['payments'] },
    dispatch:      { size: 2, cpu: 1,    label: 'dispatch',      breaks: ['dispatch'] },
    notifications: { size: 2, cpu: 0.25, label: 'notifications', breaks: ['notifications'] }
  };

  /* the loops drawn as pills. The node agent is one per node, drawn on each node bar. */
  var LOOPS = {
    rs:    { label: 'ReplicaSet loop' },
    sched: { label: 'scheduler' }
  };

  var PODS = {
    pa1: { service: 'payments' },
    pa2: { service: 'payments' },
    sf1: { service: 'storefront' },
    sf2: { service: 'storefront' },
    sf3: { service: 'storefront' },
    di1: { service: 'dispatch' },
    di2: { service: 'dispatch' },
    di4: { service: 'dispatch' },                     /* Ch 04's replacement dispatch Pod, on 01 since 03:04 */
    or2: { service: 'orders', name: 'orders-q2rw' },  /* Ch 04's replacement orders Pod, on 04 since 03:04 */
    no1: { service: 'notifications' },
    no2: { service: 'notifications' },
    di5: { service: 'dispatch' },                     /* Friday's three new dispatch Pods */
    di6: { service: 'dispatch' },
    di7: { service: 'dispatch' }
  };

  var STRINGS = {
    widget: 'W-01 · The cluster',
    widgetShort: 'W-01',
    step: 'Step',
    node: 'Node',
    free: 'free',
    down: 'DOWN',
    status: {
      running: 'RUNNING', notstarted: 'NOT STARTED', starting: 'STARTING', lost: 'LOST',
      crashed: 'CRASHED', waiting: 'WAITING'
    },
    /* where a status word may break when it doesn't fit on one chip line */
    statusBreaks: { notstarted: ['NOT', 'STARTED'] },
    nodeStatus: { unknown: 'UNKNOWN' },
    record: {
      title: 'The cluster’s record · API server',
      titleShort: 'The record · API server',
      want: 'WANT', running: 'RUNNING', short: 'SHORT', unknown: 'UNKNOWN', waiting: 'WAITING'
    },
    loopMark: '↻',
    agent: 'agent',
    agents: 'agents',
    lens: { watching: 'Sees', doing: 'Does' },     /* the chapter's SEES / DOES labels (Ch 04's) */
    /* Ch 05's optional features */
    cpu: 'CPU',
    waiting: 'Waiting · no room',
    verdict: {
      fits: 'Fits', mem: 'No memory', cpu: 'No processor', cores: 'cores', free: 'free',
      short: { fits: '✓ Fits', mem: '✕ Mem', cpu: '✕ CPU' }
    },
    scheduler: 'Scheduler',
    newNode: 'New',
    lanes: { F: 'Friday, 17:45' }
  };

  /* ---- reused pieces of snapshots (each step below still lists its full state) ---- */
  var ROWS = ['orders', 'payments', 'dispatch', 'storefront', 'notifications'];
  var WANT6 = { orders: 1, payments: 2, dispatch: 6, storefront: 3, notifications: 2 };
  var PODS6 = {
    orders: ['or2'], payments: ['pa1', 'pa2'], dispatch: ['di1', 'di2', 'di4', 'di5', 'di6', 'di7'],
    storefront: ['sf1', 'sf2', 'sf3'], notifications: ['no1', 'no2']
  };
  var SHOWN = ['rs', 'sched'];
  /* the three nodes once F2's two Pods run (F3, F4, and F5's first three columns) */
  var N01 = ['pa1', 'sf1', 'di4', 'no1', 'di5'];
  var N02 = ['di1', 'di2', 'sf3', 'no2', 'di6'];
  var N04 = ['pa2', 'sf2', 'or2'];
  var REASON = { id: 'reason', type: 'scheduler', text: '0/3 nodes are available: 2 Insufficient cpu, 3 Insufficient memory.' };

  var CLUSTER_LANES = {
    F: {
      name: STRINGS.lanes.F,
      steps: [
        {
          id: 'F1',
          kicker: '17:45',
          state: {
            nodes: { '01': ['pa1', 'sf1', 'di4', 'no1'], '02': ['di1', 'di2', 'sf3', 'no2'], '04': ['pa2', 'sf2', 'or2'] },
            down: [], nodeStatus: {},
            record: { rows: ROWS, want: WANT6, pods: PODS6 },
            loops: { shown: SHOWN, active: ['rs'], agents: [], lens: { watching: 'dispatch: 6 wanted, 3 Pods', doing: 'writes 3 new Pod records' } },
            notes: [],
            clock: '17:45'
          },
          text: [
            'At 17:45 the dispatch team changes `dispatch`’s manifest from three copies to six and applies it, so the cluster’s record now wants six `dispatch` Pods while only three exist.',
            'Within seconds the ReplicaSet loop notices the gap and writes three new Pod records, as it did on moving day. None of the three has a node yet, so nothing new is running.'
          ],
          ariaLabel: '17:45. The ReplicaSet loop is acting. Seeing dispatch with 6 Pods wanted and 3 existing, it writes 3 new Pod records, which have no node yet; the dispatch line reads 3 running. Node 01 runs payments, storefront, dispatch and notifications: 10 of 13 GB reserved, 3 GB free, processor 2 of 3.9 cores reserved. Node 02 runs two dispatch Pods, storefront and notifications: 10 GB reserved, 3 GB free, processor 2.75 of 3.9. Node 04 runs payments, storefront and orders: 12 GB reserved, 1 GB free, processor 1.75 of 3.9.',
          highlight: ['row:dispatch', 'loop:rs', 'lens']
        },
        {
          id: 'F2',
          kicker: 'Seconds later',
          state: {
            nodes: { '01': ['pa1', 'sf1', 'di4', 'no1', 'di5:notstarted'], '02': ['di1', 'di2', 'sf3', 'no2', 'di6:notstarted'], '04': ['pa2', 'sf2', 'or2'] },
            down: [], nodeStatus: {},
            /* the second new Pod's check: 01 after the first placement, 02 before the second */
            verdicts: {
              '01': { verdict: 'mem cpu', memory: 1, cpu: 0.9 },
              '02': { verdict: 'fits', memory: 3, cpu: 1.15 },
              '04': { verdict: 'mem', memory: 1, cpu: 2.15 }
            },
            record: { rows: ROWS, want: WANT6, pods: PODS6 },
            loops: { shown: SHOWN, active: ['sched'], agents: [], lens: { watching: '3 Pods with no node', doing: 'places 2: dispatch → 01, dispatch → 02' } },
            /* says whose check the verdicts are: with both new Pods drawn, 01's verdict would otherwise
               read as wrong for the Pod it has just taken */
            notes: [{ id: 'check', label: 'Verdicts', text: 'for the second new dispatch Pod: 2 GB, 1 core', tone: 'mute' }],
            clock: 'Seconds later'
          },
          text: [
            'The scheduler takes the new Pods one at a time. Each one needs 2 GB of memory and a whole processor core, so the scheduler first rules out every node that doesn’t have both free.',
            'For the first Pod, node 01 (3 GB and 1.9 cores free) and node 02 (3 GB and 1.15 cores free) both pass, while node 04, with only 1 GB of memory free, is ruled out. With default settings the scheduler prefers 01, because it has more processor left unreserved and fewer `dispatch` copies than 02.',
            'The second Pod is checked against what is left. Node 01 now has only 1 GB and 0.9 cores free, short of both, so 02 is the only node that passes, and the Pod goes there. Both Pods now have a node in their records, but neither has started yet.'
          ],
          ariaLabel: 'Seconds later. The scheduler is acting. Seeing 3 Pods with no node, it places 2: one new dispatch Pod on node 01 and one on node 02, both not started yet. The third has no node yet. The verdicts are for the second new Pod, which needs 2 GB and 1 core: node 01, no memory and no processor, with 1 GB and 0.9 cores free; node 02 fits, with 3 GB and 1.15 cores free before the Pod was placed; node 04, no memory, with 1 GB free. Each of the three nodes now has 1 GB free. Processor reserved: node 01, 3 of 3.9 cores; node 02, 3.75; node 04, 1.75.',
          highlight: ['loop:sched', 'lens', 'p:di5', 'p:di6', 'verdict:01', 'verdict:02', 'verdict:04', 'note:check']
        },
        {
          id: 'F3',
          kicker: 'Seconds later',
          state: {
            nodes: { '01': N01, '02': N02, '04': N04 },
            waiting: ['di7'],
            down: [], nodeStatus: {},
            verdicts: { '01': 'mem cpu', '02': 'mem cpu', '04': 'mem' },
            record: { rows: ROWS, want: WANT6, pods: PODS6 },
            loops: { shown: SHOWN, active: ['sched'], agents: [], lens: { watching: '1 Pod with no node; no node with room', doing: 'leaves it unplaced; records why' } },
            notes: [REASON],
            clock: 'Seconds later'
          },
          text: [
            'Meanwhile the node agents on 01 and 02 have started the two placed Pods. The scheduler checks the third Pod, and this time no node passes: each of the three has only 1 GB of memory free, and nodes 01 and 02 are also short of a whole core.',
            'Between them the nodes have 3 GB free, more than the Pod needs, but in 1 GB pieces, and a Pod has to fit whole on one node. So the scheduler leaves the Pod without a node and records why, in a line in the format engineers see; its exact wording varies between Kubernetes versions.'
          ],
          ariaLabel: 'Seconds later. The two placed dispatch Pods are running. The scheduler is acting. Seeing 1 Pod with no node and no node with room, it leaves the Pod unplaced and records why. The third new dispatch Pod waits in the strip above the nodes, headed waiting, no room. Node 01: no memory and no processor, 1 GB and 0.9 cores free. Node 02: no memory and no processor, 1 GB and 0.15 cores free. Node 04: no memory, 1 GB and 2.15 cores free. The record reads dispatch, 6 wanted, 5 running, 1 waiting. The scheduler’s recorded reason: 0/3 nodes are available: 2 Insufficient cpu, 3 Insufficient memory.',
          highlight: ['lens', 'waiting', 'p:di7', 'row:dispatch', 'verdict:01', 'verdict:02', 'verdict:04', 'note:reason']
        },
        {
          id: 'F4',
          kicker: '18:00–18:40',
          state: {
            nodes: { '01': N01, '02': N02, '04': N04 },
            waiting: ['di7'],
            down: [], nodeStatus: {},
            record: { rows: ROWS, want: WANT6, pods: PODS6 },
            loops: { shown: SHOWN, active: ['sched'], agents: [], lens: { watching: '1 Pod with no node', doing: 'tries again whenever the cluster changes' } },
            notes: [REASON, { id: 'dispatch', label: 'Dispatch', text: '5 of 6 copies running at the rush', tone: 'warn' }],
            clock: '18:00–18:40'
          },
          text: [
            'Nothing has failed, and nobody has to resubmit anything: the scheduler keeps the Pod and tries again whenever the cluster changes. But nothing in Fennel’s cluster adds room by itself, so every try finds the same three nodes without room for it.',
            'For the busiest part of the evening, `dispatch` runs five copies instead of the six the dispatch team asked for.'
          ],
          ariaLabel: '18:00 to 18:40. The dispatch Pod is still waiting, with no room. The scheduler is acting: seeing 1 Pod with no node, it tries again whenever the cluster changes. Nodes 01, 02 and 04 are unchanged, each with 1 GB free. The recorded reason is unchanged: 0/3 nodes are available: 2 Insufficient cpu, 3 Insufficient memory. Dispatch: 5 of 6 copies running at the rush.',
          highlight: ['lens', 'note:dispatch']
        },
        {
          id: 'F5',
          kicker: '~18:40',
          state: {
            nodes: { '01': N01, '02': N02, '04': N04, '05': ['di7'], '06': [] },
            newNodes: ['05', '06'],
            down: [], nodeStatus: {},
            /* checked while both new nodes were still empty */
            verdicts: {
              '05': { verdict: 'fits', memory: 13, cpu: 3.9 },
              '06': { verdict: 'fits', memory: 13, cpu: 3.9 }
            },
            record: { rows: ROWS, want: WANT6, pods: PODS6 },
            loops: { shown: SHOWN, active: ['sched'], agents: ['05'], lens: { watching: '1 Pod with no node; two new nodes', doing: 'dispatch → 05' } },
            notes: [],
            clock: '~18:40'
          },
          text: [
            'At about 18:40 Ari’s team rents two more machines and adds them to the cluster by hand, as nodes 05 and 06. The scheduler notices the change and checks the waiting Pod again. Both new nodes are empty, so both pass, and with default settings they get the same score; the scheduler breaks the tie at random and picks 05. Within seconds node 05’s agent starts the Pod, and `dispatch` has its six copies.',
            'Fennel now pays for five nodes. The scheduler places only Pods that have no node and never moves running ones, so node 06 stays empty.'
          ],
          ariaLabel: 'About 18:40. Two new nodes, 05 and 06, have been added by Ari’s team, each empty with 13 GB and 3.9 cores of room for Pods. The scheduler is acting: seeing 1 Pod with no node and two new nodes, it finds that both fit and places the dispatch Pod on node 05, whose agent starts it. Node 05 now has 11 GB free, processor 1 of 3.9 cores reserved; node 06 has 13 GB free. The record reads dispatch, 6 wanted, 6 running. Nothing is waiting. Nodes 01, 02 and 04 are unchanged.',
          highlight: ['lens', 'new:05', 'new:06', 'p:di7', 'agent:05', 'verdict:05', 'verdict:06', 'row:dispatch']
        }
      ]
    }
  };

  window.ClusterData = {
    NODES: NODES,
    CAPACITY: CAPACITY,
    UNIT: UNIT,
    ROOM_UNIT: ROOM_UNIT,
    SERVICES: SERVICES,
    LOOPS: LOOPS,
    PODS: PODS,
    STRINGS: STRINGS,
    CLUSTER_LANES: CLUSTER_LANES
  };
})();
