/* pool/cluster/cluster.js · the course's cluster drawing (renderCluster). Classic script, no libraries,
   no network. Promoted from Ch 04's w-cluster-scrolly (itself Ch 03's renderFleet, extended); the snapshot
   format and every option are documented in explainers/_pool/README.md ("Cluster drawing").

     var R = ClusterCanvas.create(data);        // data = a chapter's ClusterData (data.js)
     R.renderCluster(target, state, opts);      // draws ONE complete snapshot into `target`
     R.laneLayout(width, states, header, opts); // width choices shared by every state of a lane
     R.measureReserve(target, states, opts);    // per-block heights, so a lane never changes height

   The drawing: a figure plate with a mono header bar (widget, lane, clock kicker, STEP n / N); the
   cluster's record (c4 on c4-soft, computed Pod marks and row words); the loop pills (c3, ↻) and the
   acting loop's lens line; an optional WAITING strip; the node frames (NODE · NN, the agent pill and the
   record's view of the node on the bar, optional NEW tag and scheduler verdicts), whose bodies hold the
   node's room, Pods (a chip inside an inset ink ring, height = size) and "N FREE", with an optional
   processor footer; and note lines. Every reader-visible string comes from data.STRINGS; colours are
   course tokens (cluster.css). The lane controller is pool/cluster/lanes.js. */
(function () {
  'use strict';

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  /* ---------- text measurement (13px mono chrome; widths decide label breaks and fallbacks) ---------- */
  var mctx = document.createElement('canvas').getContext('2d');
  var monoFamily = null;
  function family() {
    if (!monoFamily) {
      monoFamily = (getComputedStyle(document.documentElement).getPropertyValue('--font-mono') || '').trim() || 'monospace';
    }
    return monoFamily;
  }
  /* ls = letter-spacing in em */
  function textW(s, weight, ls) {
    mctx.font = (weight || 700) + ' 13px ' + family();
    return mctx.measureText(s).width + (ls || 0) * 13 * s.length;
  }

  /* numbers: at most `maxDec` decimals, at least `minDec` (2.75, 2.0, 3) */
  function fmt(x, minDec, maxDec) {
    var s = (Math.round(x * 100) / 100).toFixed(maxDec == null ? 2 : maxDec);
    if (s.indexOf('.') >= 0) {
      s = s.replace(/0+$/, '');
      var dec = s.length - s.indexOf('.') - 1;
      while (dec < (minDec || 0)) { s += '0'; dec++; }
      s = s.replace(/\.$/, '');
    }
    return s === '-0' ? '0' : s;
  }

  function has(list, x) { return (list || []).indexOf(x) >= 0; }
  function parseEntry(entry) {
    var i = entry.indexOf(':');
    return i < 0 ? { id: entry, status: 'running' } : { id: entry.slice(0, i), status: entry.slice(i + 1) };
  }
  function wordText(parts) { return parts.map(function (p) { return p.t; }).join(' · '); }
  function compactWord(parts) {
    return [parts.reduce(function (a, b) { return b.rank > a.rank ? b : a; })];
  }

  var BORDER = 1.5, LAMP = 12, MARK = 10, MARKGAP = 4, MARK_T = 8, MARKGAP_T = 2, NARROW_LS = -0.02, EPS = 1e-6;
  /* the least height that shows a 13px mono line's glyphs (caps and digits, about 9.5px) whole: a chip's text
     room, or a free-room box's inside, below this draws no label */
  var CHIP_TEXT_MIN = 10, FREE_TEXT_MIN = 10;
  /* statuses drawn without a lamp: only a record (notstarted), no node yet (waiting) */
  var NO_LAMP = { notstarted: 1, waiting: 1 };

  /* ================================ one renderer per chapter data ================================ */
  function create(D) {
    var S = D.STRINGS;
    var RU = D.ROOM_UNIT || 1;           /* how many UNITs one drawn unit of room is (Ch 05: 2 GB) */
    var UNIT = D.UNIT || '';              /* '' (Ch 04's room units) or 'GB' */
    var widestOneLine = null;             /* the widest label a one-unit chip must show on one line */
    var warned = {};

    /* a string the chapter must supply for a feature it uses */
    function str(path) {
      var v = path.split('.').reduce(function (o, k) { return o == null ? o : o[k]; }, S);
      if (v == null && !warned[path]) { warned[path] = true; console.error('ClusterCanvas: STRINGS.' + path + ' missing'); }
      return v == null ? '' : v;
    }

    /* ---------- the snapshot model ---------- */
    function nodeIds(state) {
      var ids = Object.keys(state.nodes || {});
      (D.NODES || []).forEach(function (n) { if (ids.indexOf(n) < 0) ids.push(n); });
      return ids.sort();
    }
    function podInfo(id) { return D.PODS[id]; }
    function podService(id) { return D.PODS[id].service; }
    function podSize(id) { var p = D.PODS[id]; return p.size != null ? p.size : D.SERVICES[p.service].size; }
    function podCpu(id) { var p = D.PODS[id]; return p.cpu != null ? p.cpu : (D.SERVICES[p.service].cpu || 0); }
    /* a node's room: CAPACITY (a number: Ch 04's room units; or { memory, cpu }), per-node override in
       state.capacity */
    function cap(state, n) {
      var c = (state.capacity || {})[n] || D.CAPACITY;
      return typeof c === 'number' ? { memory: c, cpu: null } : { memory: c.memory, cpu: c.cpu == null ? null : c.cpu };
    }
    function usedRoom(state, n) {
      return (state.nodes[n] || []).reduce(function (t, entry) { return t + podSize(parseEntry(entry).id); }, 0);
    }
    function usedCpu(state, n) {
      return (state.nodes[n] || []).reduce(function (t, entry) { return t + podCpu(parseEntry(entry).id); }, 0);
    }
    function waitingList(state) { return (state.waiting || []).map(parseEntry); }
    /* where each Pod is, and its status, from `nodes` */
    function podIndex(state) {
      var idx = {};
      nodeIds(state).forEach(function (n) {
        (state.nodes[n] || []).forEach(function (entry) {
          var p = parseEntry(entry);
          idx[p.id] = { node: n, status: p.status };
        });
      });
      return idx;
    }
    /* The record's marks and row word, computed (README "Cluster drawing"). */
    function recordRows(state) {
      var rec = state.record || { rows: [], want: {}, pods: {} };
      var idx = podIndex(state);
      var unknown = state.nodeStatus || {};
      var waitIds = waitingList(state).map(function (w) { return w.id; });
      return rec.rows.map(function (svc) {
        var pods = rec.pods[svc] || [];
        var want = rec.want[svc] || 0;
        var marks = pods.map(function (id) {
          var at = idx[id];
          if (!at) return 'rec';
          if (unknown[at.node] === 'unknown') return 'unk';
          return (at.status === 'running' || at.status === 'lost') ? 'run' : 'rec';
        });
        /* records marked for deletion: still in the record, drawn struck through, not counted */
        ((rec.deleting || {})[svc] || []).forEach(function () { marks.push('del'); });
        var run = marks.filter(function (m) { return m === 'run'; }).length;
        var unk = marks.filter(function (m) { return m === 'unk'; }).length;
        var wait = pods.filter(function (id) { return has(waitIds, id); }).length;
        var word;
        if (pods.length < want) word = [{ t: S.record.short + ' ' + (want - pods.length), tone: 'warn', rank: 3 }];
        else {
          word = [{ t: run + ' ' + S.record.running, tone: run >= want ? 'good' : 'mute', rank: 1 }];
          if (unk) word.push({ t: unk + ' ' + S.record.unknown, tone: 'warn', rank: 2 });
          if (wait) word.push({ t: wait + ' ' + str('record.waiting'), tone: 'warn', rank: 2.5 });
        }
        return { svc: svc, want: want, marks: marks, word: word };
      });
    }

    /* ---------- layout ---------- */
    function geometry(width, n, unit) {
      var narrow = width < 440;   /* phone column: tighter chrome */
      var g = {
        width: width, narrow: narrow, n: n || 4,
        pad: narrow ? 3 : 6,          /* plate padding */
        gapM: narrow ? (width < 340 ? 2 : 3) : 8,   /* between node frames */
        bodyPad: narrow ? 1 : 3,
        ringPad: narrow ? 1 : 2,      /* the Pod ring's inset */
        chipPadX: narrow ? 1 : 3,
        lh: narrow ? 14 : 16,         /* chip line height (text stays 13px) */
        gapU: narrow ? 3 : 4,         /* between stacked units of room */
        row: narrow ? 3 : 6,          /* between the plate's blocks */
        barPadX: narrow ? 2 : 4,
        pillPadX: narrow ? 3 : 6,
        recPadX: narrow ? 4 : 8,
        recGap: narrow ? 6 : 12,
        chipLs: narrow ? NARROW_LS : 0,
        bw: BORDER                    /* the Pod ring's and chip's stroke */
      };
      /* small units (fitting a canvas into 50vh): 1px Pod strokes and no ring inset, so a one-unit Pod
         still holds one 13px line (CSS: .wc--thin) */
      if (unit && unit < (narrow ? 20 : 22)) { g.bw = 1; g.ringPad = 0; g.thin = true; }
      if (narrow) { g.gapU = unit && unit < 20 ? 2 : 3; }
      g.inner = width - 2 * BORDER - 2 * g.pad;
      g.colW = (g.inner - (g.n - 1) * g.gapM) / g.n;
      var text = function () { return g.colW - 2 * BORDER - 2 * g.bodyPad - 4 * g.bw - 2 * g.ringPad - 2 * g.chipPadX; };
      g.chipTextW = text();
      /* give up the ring's inset before a one-line label (a one-unit Pod's name) has to be cut: the
         narrowest columns (an inline snapshot on a phone), and, since pool-02, wide canvases whose
         columns miss such a label by a little (Ch 05's five columns at 460px). Measured in the
         chrome's own letter-spacing; where every one-line label fits, nothing changes. */
      var ls = narrow ? NARROW_LS : 0;
      if (widestOneLine == null) widestOneLine = {};
      if (widestOneLine[ls] == null) {
        widestOneLine[ls] = [];
        Object.keys(D.SERVICES).forEach(function (k) {
          if (D.SERVICES[k].size / RU <= 1) widestOneLine[ls].push(textW(D.SERVICES[k].label, 700, ls));
        });
      }
      var oneLine = widestOneLine[ls];
      var missed = oneLine.some(function (w) { return g.chipTextW + 0.5 < w; });
      if (g.ringPad && missed) {
        var without = g.chipTextW + 2 * g.ringPad;
        /* narrow: always (as in Ch 04); wide: only where it saves a label, so the ring stays elsewhere */
        if (narrow || oneLine.some(function (w) { return g.chipTextW + 0.5 < w && w <= without + 0.5; })) { g.ringPad = 0; g.chipTextW = text(); }
      }
      g.barTextW = g.colW - 2 * BORDER - 2 * g.barPadX;
      g.recInner = g.inner - 2 * BORDER - 2 * g.recPadX;
      return g;
    }
    function pillW(g, label) { return textW(S.loopMark + ' ' + label, 700) + 2 * g.pillPadX + 2 * BORDER; }
    /* the node's id on its bar: NODE · 01 (wide), NODE 01 (narrow, or a wide column too slim for the
       first), or the bare 01 where even that doesn't fit every node of the lane (laneLayout, idForm) */
    var ID_FORMS = 3;
    function barId(g, n, form) {
      if (form == null) form = g.narrow ? 1 : 0;
      return [S.node + ' · ' + n, S.node + ' ' + n, String(n)][form];
    }
    /* the id's inked width: its box less the trailing letter-spacing and the last glyph's side bearing
       (1px), so an id whose ink fits isn't counted as cut */
    function barIdW(g, n, form) { return textW(barId(g, n, form).toUpperCase(), 700, 0.04) - 0.04 * 13 - 1; }
    /* the node bar's second part: the agent pill, the record's status word, or both if they fit */
    function barRowW(g, ns, agentW) {
      if (!ns) return { pill: true, w: agentW };
      var stW = textW(S.nodeStatus[ns], 700, 0.04);
      return agentW + 4 + stW <= g.barTextW ? { pill: true, w: agentW + 4 + stW } : { pill: false, w: stW };
    }
    function agentsLabel(nodes) { return S.agents + ' · ' + nodes.join(', '); }
    var TAG_PAD = 4;   /* NEW tag: 0 4px padding (cluster.css .wc-tag) */
    function tagW(t) { return textW(t.toUpperCase(), 700, 0.04) + 2 * TAG_PAD; }

    /* greedy line packing of unbreakable atoms ({ t, cls }), joined by spaces; the bar's text is
       uppercase with 0.04em letter-spacing */
    function pack(atoms, maxW) {
      var lines = [], cur = null;
      atoms.forEach(function (a) {
        var w = textW(a.t.toUpperCase(), a.w || 700, 0.04);
        if (cur && cur.w + textW(' ', 700, 0.04) + w <= maxW + 0.5) { cur.atoms.push(a); cur.w += textW(' ', 700, 0.04) + w; }
        else { cur = { atoms: [a], w: w }; lines.push(cur); }
      });
      return lines;
    }
    /* the scheduler's verdict on a node: 'fits' | 'mem' | 'cpu' | 'mem cpu', or
       { verdict, memory?, cpu? } (free amounts at the moment of the check; computed from the drawn
       state when omitted) */
    function verdictOf(state, n) {
      var v = (state.verdicts || {})[n];
      if (v == null) return null;
      var o = typeof v === 'string' ? { verdict: v } : v;
      var c = cap(state, n);
      return {
        parts: String(o.verdict).split(/\s+/).filter(Boolean),
        memory: o.memory != null ? o.memory : c.memory - usedRoom(state, n),
        cpu: o.cpu != null ? o.cpu : (c.cpu == null ? null : c.cpu - usedCpu(state, n))
      };
    }
    function verdictAtoms(vd, form) {
      var atoms = [];
      var fits = has(vd.parts, 'fits');
      var tone = fits ? 'good' : 'warn';
      if (form === 'narrow') {
        (fits ? ['fits'] : vd.parts).forEach(function (p) { atoms.push({ t: str('verdict.short.' + p), cls: 'wc-tone--' + tone }); });
        return atoms;
      }
      var words = (fits ? ['fits'] : vd.parts).map(function (p) { return str('verdict.' + p); });
      words.forEach(function (w, i) { atoms.push({ t: w + (i < words.length - 1 ? ' ·' : ''), cls: 'wc-tone--' + tone }); });
      atoms.push({ br: true });
      var free = [fmt(vd.memory) + (UNIT ? ' ' + UNIT : '')];
      if (vd.cpu != null) free.push(fmt(vd.cpu, 0) + ' ' + str('verdict.cores'));
      free.forEach(function (f, i) { atoms.push({ t: f + (i < free.length - 1 ? ' ·' : ''), cls: 'wc-n__vfree', w: 400 }); });
      atoms.push({ t: str('verdict.free'), cls: 'wc-n__vfree', w: 400 });
      return atoms;
    }
    function verdictLines(vd, form, maxW) {
      var atoms = verdictAtoms(vd, form), lines = [], run = [];
      atoms.concat([{ br: true }]).forEach(function (a) {
        if (a.br) { if (run.length) lines = lines.concat(pack(run, maxW)); run = []; }
        else run.push(a);
      });
      return lines;
    }
    /* the processor footer: reserved / room, in the lane-wide form that fits every node */
    var FOOT_FORMS = 4;
    function footLines(form, used, room) {
      var u = fmt(used, 1), r = room == null ? null : fmt(room, 1);
      var label = str('cpu');
      if (r == null) return [label + ' ' + u];
      return [[label + ' ' + u + ' / ' + r], [label + ' ' + u + '/' + r], [label, u + '/' + r], [label, u]][form];
    }

    /* Choices that depend on the canvas width and must hold for EVERY state of a lane, so all of a
       lane's states read alike and share one height: header title, record title and row words, which
       loop pills to draw, whether note tails fit, the number of node columns. opts (optional):
       { columns, nodesOnly } as for renderCluster. */
    function laneLayout(width, states, header, o) {
      o = o || {};
      var maxN = Math.max.apply(null, states.map(function (s) { return nodeIds(s).length; }));
      var cols = o.columns || maxN;
      var g = geometry(width, cols);
      var L = { width: width, narrow: g.narrow, columns: cols };
      var noStep = o.nodesOnly || (header && header.n == null);

      /* header bar: [title] … [clock] [step] */
      var barInner = width - 2 * BORDER - 16;
      var clocks = states.map(function (s) { return s.clock || ''; });
      var clockW = Math.max.apply(null, clocks.map(function (c) { return c ? textW(c.toUpperCase(), 700, 0.08) : 0; }));
      var total = header ? header.total : states.length;
      var stepFull = (S.step + ' ' + total + ' / ' + total).toUpperCase();
      var stepShort = total + ' / ' + total;
      var lane = header && header.lane ? header.lane.toUpperCase() : '';
      var titles = [
        (S.widget + ' · ' + lane).toUpperCase(),
        (S.widgetShort + ' · ' + lane).toUpperCase(),
        S.widgetShort.toUpperCase()
      ];
      if (!lane) titles = [S.widget.toUpperCase(), S.widgetShort.toUpperCase(), S.widgetShort.toUpperCase()];
      var tries = [[0, 0], [1, 0], [1, 1], [2, 0], [2, 1]];
      L.title = 2; L.stepShort = true;
      for (var k = 0; k < tries.length; k++) {
        var tw = textW(titles[tries[k][0]], 700, 0.08) + 8;
        var sw = noStep ? 0 : textW(tries[k][1] ? stepShort : stepFull, 700, 0.08);
        var cw = clockW ? clockW + 12 : 0;
        if (tw + cw + sw <= barInner) { L.title = tries[k][0]; L.stepShort = !!tries[k][1]; break; }
      }
      L.hasClock = clockW > 0;
      L.titles = titles;

      /* record: title, column widths, full or compact row words */
      L.recTitle = textW(S.record.title.toUpperCase(), 700, 0.06) <= g.recInner ? S.record.title : S.record.titleShort;
      var rows = [], maxMarks = 0;
      states.forEach(function (s) {
        recordRows(s).forEach(function (r) { rows.push(r); maxMarks = Math.max(maxMarks, r.marks.length, r.want); });
      });
      var nameW = 0, wantW = 0, fullW = 0, compW = 0;
      rows.forEach(function (r) {
        nameW = Math.max(nameW, textW(r.svc, 700));
        wantW = Math.max(wantW, textW(S.record.want + ' ' + r.want, 400));
        fullW = Math.max(fullW, textW(wordText(r.word), 700));
        compW = Math.max(compW, textW(wordText(compactWord(r.word)), 700));
      });
      var marksW = Math.max(1, maxMarks) * (MARK + MARKGAP) - MARKGAP;
      var fixed = nameW + wantW + marksW + 3 * g.recGap;
      L.cols = { name: Math.ceil(nameW), want: Math.ceil(wantW), marks: Math.ceil(marksW), gap: g.recGap };
      L.fullWord = fixed + fullW <= g.recInner;
      /* where even the compact word doesn't fit beside the marks (pool-02), it would overlap them:
         first draw the marks smaller (8px squares, 2px apart, columns 4px apart); where that still
         isn't enough, the word takes a line of its own under its row (full where that line holds it) */
      if (fixed + compW > g.recInner + 0.5) {
        var tMarksW = Math.max(1, maxMarks) * (MARK_T + MARKGAP_T) - MARKGAP_T;
        /* the columns keep their own gap where the smaller marks alone make room, else 4px */
        var tGap = nameW + wantW + tMarksW + 3 * g.recGap + compW <= g.recInner + 0.5 ? g.recGap : Math.min(g.recGap, 4);
        var tFixed = nameW + wantW + tMarksW + 3 * tGap;
        if (tFixed + compW <= g.recInner + 0.5) {
          L.marksTight = true;
          L.cols = { name: Math.ceil(nameW), want: Math.ceil(wantW), marks: Math.ceil(tMarksW), gap: tGap };
          L.fullWord = tFixed + fullW <= g.recInner;
        } else {
          L.wordBelow = true;
          if (fixed - g.recGap > g.recInner + 0.5) {
            L.marksTight = true;
            L.cols = { name: Math.ceil(nameW), want: Math.ceil(wantW), marks: Math.ceil(tMarksW), gap: tGap };
          }
          L.fullWord = fullW <= g.recInner;
        }
      }
      L.maxRows = Math.max.apply(null, states.map(function (s) { return (s.record || { rows: [] }).rows.length; }));

      /* loop pills: on a wide canvas all of them, dimmed unless acting, wherever a state's pills fit
         one row (renderCluster checks per state); on a narrow canvas only the acting one */
      L.pills = g.narrow ? 'active' : 'fit';

      /* the extra node-bar lines (NEW tag, verdicts) and the processor footer */
      L.hasVerdicts = states.some(function (s) { return Object.keys(s.verdicts || {}).length; });
      L.hasNew = states.some(function (s) { return (s.newNodes || []).length; });
      L.hasCpu = states.some(function (s) { return nodeIds(s).some(function (n) { return cap(s, n).cpu != null; }); });
      L.hasWaiting = states.some(function (s) { return (s.waiting || []).length; });

      /* node bar on one row (NODE · 01, then the agent pill and/or UNKNOWN) where that fits for every
         node in every state, and no state adds lines to the bar; else two rows */
      /* node ids: the chrome's form where it fits every node of every state; else NODE 01; else the
         bare id for all nodes alike, so 01, 02 and 04 never read as the same clipped "NODE 0" */
      L.idForm = g.narrow ? 1 : 0;
      while (L.idForm < ID_FORMS - 1 && !states.every(function (s) {
        return nodeIds(s).every(function (n) { return barIdW(g, n, L.idForm) <= g.barTextW + 0.5; });
      })) L.idForm++;
      var agentW = o.nodesOnly ? 0 : pillW(g, S.agent);
      L.barOneRow = !L.hasVerdicts && !L.hasNew && states.every(function (s) {
        return nodeIds(s).every(function (n) {
          return textW(barId(g, n, L.idForm), 700, 0.04) + 6 + barRowW(g, (s.nodeStatus || {})[n], agentW).w <= g.barTextW;
        });
      });

      /* verdicts: the wide form (words and free amounts) on a wide canvas where every verdict wraps to
         at most 3 lines; else the narrow form (✓ FITS, ✕ MEM, ✕ CPU) */
      if (L.hasVerdicts) {
        L.verdictForm = !g.narrow && states.every(function (s) {
          return Object.keys(s.verdicts || {}).every(function (n) {
            return verdictLines(verdictOf(s, n), 'wide', g.barTextW).length <= 3;
          });
        }) ? 'wide' : 'narrow';
      }
      if (L.hasCpu) {
        var footW = g.colW - 2 * BORDER - 2 * g.barPadX;
        L.footForm = FOOT_FORMS - 1;
        for (var f = 0; f < FOOT_FORMS; f++) {
          var ok = states.every(function (s) {
            return nodeIds(s).every(function (n) {
              var c = cap(s, n);
              if (c.cpu == null) return true;
              return footLines(f, usedCpu(s, n), c.cpu).every(function (ln) { return textW(ln.toUpperCase(), 400, 0.04) <= footW + 0.5; });
            });
          });
          if (ok) { L.footForm = f; break; }
        }
      }

      /* notes: the ink-3 tail on a wide canvas (it may wrap); dropped on a narrow one */
      L.noteSub = !g.narrow;
      L.hasNotes = states.some(function (s) { return (s.notes || []).length; });
      L.hasBanner = states.some(function (s) { return !!s.banner; });
      L.hasStatus = states.some(function (s) { return Object.keys(s.nodeStatus || {}).length; });
      return L;
    }

    /* ---------- chip label lines ----------
       Full label: name (broken as data.js allows when too wide), version, restarts, status word with a
       lamp. When the chip is too short for all of it: an abnormal chip keeps its status word (and its
       name if there's room; the step text names the service); a RUNNING chip keeps its name and is left
       unmarked, so colour is never the only signal. `placed` (a Pod in a what-if packing) has no status
       word. `over` (optional): the overuse tag, drawn in place of the status word. */
    function chipLines(pod, status, restarts, g, maxLines, over) {
      if (maxLines < 1) return [];   /* too short for a line: outline and fill only */
      var svc = D.SERVICES[pod.service];
      var fits = function (s, extra) { return textW(s, 700, g.chipLs) + (extra || 0) <= g.chipTextW + 0.5; };
      var name = fits(svc.label) ? [svc.label] : svc.breaks.slice();
      var nameLines = name.map(function (t) { return { t: t }; });
      var body = nameLines.slice();
      var extras = [];
      if (pod.version) extras.push(pod.version);
      if (restarts) extras.push(S.loopMark + ' ' + restarts);
      extras.forEach(function (x) {
        var last = body[body.length - 1];
        if (fits(last.t + ' ' + x)) body[body.length - 1] = { t: last.t + ' ' + x };
        else body.push({ t: x });
      });
      if (over) {
        /* the overuse tag: whole, broken, or short, whichever fits the room left */
        var forms = [[S.use.over]];
        if (S.use.overBreaks) forms.push(S.use.overBreaks);
        if (S.use.overShort) forms.push([S.use.overShort]);
        forms = forms.map(function (f) { return f.map(function (t) { return t.toUpperCase(); }); });
        var tagLines = null;
        for (var k = 0; k < forms.length && !tagLines; k++) {
          if (forms[k].every(function (t) { return fits(t); }) && body.length + forms[k].length <= maxLines) tagLines = forms[k];
        }
        if (!tagLines) {
          var shortest = forms[forms.length - 1];
          tagLines = shortest.length <= maxLines ? shortest : shortest.slice(0, maxLines);
          var room = maxLines - tagLines.length;
          body = body.length <= room ? body : (nameLines.length <= room ? nameLines : []);
        }
        return body.concat(tagLines.map(function (t) { return { st: 'over', t: t, lamp: false }; }));
      }
      if (status === 'placed') return body.length <= maxLines ? body : nameLines.slice(0, Math.max(1, maxLines));
      var word = S.status[status];
      var stLines;
      if (fits(word, NO_LAMP[status] ? 0 : LAMP) || !S.statusBreaks[status]) {
        stLines = [{ st: status, t: word, lamp: !NO_LAMP[status] && fits(word, LAMP) }];
      } else {
        stLines = S.statusBreaks[status].map(function (t) { return { st: status, t: t, lamp: false }; });
      }
      if (body.length + stLines.length <= maxLines) return body.concat(stLines);
      if (status !== 'running') {
        if (stLines.length > maxLines) {
          /* one line, and the word doesn't fit there: a NOT STARTED Pod keeps its name, since its dashed,
             unfilled outline already says "only a record" (the canvas aria-label says it in words);
             other statuses keep their word, as in Ch 03 */
          if (status === 'notstarted' && !fits(word)) return nameLines.slice(0, 1);
          stLines = [{ st: status, t: word, lamp: false }];
        }
        var room2 = maxLines - stLines.length;
        var keep = body.length <= room2 ? body : (nameLines.length <= room2 ? nameLines : []);
        return keep.concat(stLines);
      }
      /* RUNNING is the normal state: with no room for its word, it stays unmarked (no colour-only lamp) */
      return body.length <= maxLines ? body : nameLines.slice(0, Math.max(1, maxLines));
    }

    /* ---------- renderCluster ---------- */
    /* opts: { width, unit, layout (laneLayout), reserve (measureReserve), highlight: [keys], lit: bool,
               header: { lane: 'Moving day', n: 2, total: 5 }, bleed: bool,
               nodesOnly: bool, columns: n, labels: bool } — all optional.
       `width` must be the width the plate will have (bleed: the target's width plus its bleed). */
    function renderCluster(target, state, opts) {
      opts = opts || {};
      var width = opts.width || target.clientWidth || 320;
      var L = opts.layout || laneLayout(width, [state], opts.header, opts);
      var u = opts.unit || (L.narrow ? 22 : 32);
      var ids = nodeIds(state);
      var g = geometry(width, Math.max(L.columns || ids.length, 1), u);
      var R = opts.reserve || {};
      var hl = {};
      (opts.highlight || []).forEach(function (h) { hl[h] = true; });
      var mark = function (node, key) { if (hl[key]) node.classList.add('is-hl'); return node; };
      /* height of x units of room (x may be fractional): units plus the gaps between them */
      var unitsH = function (x) { return Math.max(3, x * u + (x - 1) * g.gapU); };
      var roomH = function (amount) { return unitsH(amount / RU); };
      var minH = function (node, h) { if (h) node.style.minHeight = h + 'px'; return node; };
      var loops = state.loops || { shown: [], active: [], agents: [] };
      var agents = loops.agents || [];
      var nodesOnly = !!opts.nodesOnly;
      var labels = opts.labels !== false;
      var use = state.use || {};

      var root = el('div', 'wc' + (g.narrow ? ' wc--narrow' : '') + (g.thin ? ' wc--thin' : '') + (opts.bleed ? ' wc--bleed' : '') + (opts.lit === false ? '' : ' is-lit'));
      root.setAttribute('data-unit', u);
      [['pad', g.pad], ['gapm', g.gapM], ['bodypad', g.bodyPad], ['ringpad', g.ringPad], ['chippad', g.chipPadX],
       ['row', g.row], ['gapu', g.gapU], ['barpad', g.barPadX], ['pillpad', g.pillPadX], ['recpad', g.recPadX]
      ].forEach(function (v) { root.style.setProperty('--wc-' + v[0], v[1] + 'px'); });

      /* header bar: "W-01 · THE CLUSTER · SATURDAY, 03:04" … "~03:04:50" "STEP 2 / 6" */
      if (opts.header) {
        var bar = el('div', 'wc__bar');
        var h = opts.header;
        var title = (L.titles || [])[L.title] || S.widgetShort.toUpperCase();
        bar.appendChild(el('span', 'wc__title', title));
        if (L.hasClock) bar.appendChild(el('span', 'wc__clock', (state.clock || '').toUpperCase()));
        if (!nodesOnly && h.n != null) {
          bar.appendChild(el('span', 'wc__step', L.stepShort ? h.n + ' / ' + h.total : (S.step + ' ' + h.n + ' / ' + h.total).toUpperCase()));
        }
        root.appendChild(bar);
      }

      var ground = el('div', 'wc__ground');
      root.appendChild(ground);

      if (L.hasBanner) {
        var ban = minH(el('p', 'wc__banner'), R.banner);
        if (state.banner) ban.appendChild(mark(el('span', 'wc__banner-t', state.banner), 'banner'));
        ground.appendChild(ban);
      }

      if (!nodesOnly) {
        /* the cluster's record: a written intention (c4 on c4-soft) */
        var rec = minH(el('div', 'wc-rec' + (L.marksTight ? ' wc-rec--tight' : '') + (L.wordBelow ? ' wc-rec--below' : '')), R.rec);
        rec.style.setProperty('--wc-cols', L.cols.name + 'px ' + L.cols.want + 'px ' + L.cols.marks + 'px' + (L.wordBelow ? '' : ' minmax(0, 1fr)'));
        rec.style.setProperty('--wc-recgap', L.cols.gap + 'px');
        rec.appendChild(el('p', 'wc-rec__head', L.recTitle));
        var rowsEl = el('div', 'wc-rec__rows');
        recordRows(state).forEach(function (r) {
          var row = mark(el('div', 'wc-rec__row'), 'row:' + r.svc);
          row.setAttribute('data-row', r.svc);
          row.appendChild(el('span', 'wc-rec__name', r.svc));
          row.appendChild(el('span', 'wc-rec__want', S.record.want + ' ' + r.want));
          var mk = el('span', 'wc-rec__marks');
          r.marks.forEach(function (m) {
            var s = el('i', 'wc-mark wc-mark--' + m, m === 'unk' ? '?' : null);
            mk.appendChild(s);
          });
          row.appendChild(mk);
          var word = el('span', 'wc-rec__word');
          (L.fullWord ? r.word : compactWord(r.word)).forEach(function (p, i) {
            if (i) word.appendChild(el('span', 'wc-rec__sep', ' · '));
            word.appendChild(el('span', 'wc-tone--' + p.tone, p.t));
          });
          row.appendChild(word);
          rowsEl.appendChild(row);
        });
        rec.appendChild(rowsEl);
        ground.appendChild(rec);

        /* loops: pills (an actor: c3, ↻) and the acting loop's lens line */
        var lp = minH(el('div', 'wc-loops'), R.loops);
        var pills = el('div', 'wc-loops__pills');
        var acting = (loops.active || []).length || agents.length;
        var pillList = (loops.shown || []).map(function (id) {
          return { key: 'loop:' + id, label: D.LOOPS[id].label, on: has(loops.active, id) };
        });
        var rowW = function () { return pillList.reduce(function (t, p) { return t + pillW(g, p.label) + 6; }, -6); };
        if (agents.length) {
          var ag0 = { key: 'agents', label: agentsLabel(agents), on: true,
            hl: agents.some(function (n) { return hl['agent:' + n]; }) };
          pillList.push(ag0);
          /* the nodes are named by the lit agent pills on their bars; drop them here if the row is full */
          if (L.pills !== 'active' && rowW() > g.inner - 4) ag0.label = S.agents;
        }
        var onlyActive = L.pills === 'active';
        pillList.forEach(function (p) {
          if (onlyActive && acting && !p.on) return;
          var pill = el('span', 'wc-pill' + (p.on ? ' is-on' : ''));
          if (hl[p.key] || p.hl) pill.classList.add('is-hl');
          pill.appendChild(el('span', 'wc-pill__mark', S.loopMark));
          pill.appendChild(el('span', 'wc-pill__name', p.label));
          pills.appendChild(pill);
        });
        lp.appendChild(pills);
        if (loops.lens) {
          var lens = mark(el('div', 'wc-lens'), 'lens');
          [['watching', loops.lens.watching], ['doing', loops.lens.doing]].forEach(function (x) {
            var line = el('p', 'wc-lens__line');
            line.appendChild(el('b', 'wc-lens__k', S.lens[x[0]]));
            line.appendChild(document.createTextNode(' · ' + x[1]));
            lens.appendChild(line);
          });
          lp.appendChild(lens);
        }
        ground.appendChild(lp);
      }

      var cols = 'repeat(' + Math.max(L.columns || ids.length, 1) + ', minmax(0, 1fr))';
      var chipLinesMax = function (size) {
        var text = roomH(size) - 4 * g.bw - 2 * g.ringPad;
        /* a chip shorter than one line's glyphs (pool-02): no label at all, rather than a clipped
           line; a chip from that height up to a full line holds one tight line, as before */
        if (text < CHIP_TEXT_MIN) return 0;
        return Math.max(1, Math.floor((text - 2) / g.lh));
      };

      /* one Pod: the ring (height = its size) holding the chip; `top` = its offset in the node body,
         the room an overflowing use fill may rise into */
      function drawPod(c, top) {
        var info = podInfo(c.id);
        var size = podSize(c.id);
        var pod = mark(el('div', 'wc-p wc-p--' + c.status), 'p:' + c.id);
        pod.setAttribute('data-p', c.id);
        pod.style.height = roomH(size) + 'px';
        var chip = el('div', 'wc-c');
        var uval = use[c.id] != null ? use[c.id] : info.use;
        var over = uval != null && uval > size + EPS;
        if (labels) {
          var lines = chipLines(info, c.status, (state.restarts || {})[c.id], g, chipLinesMax(size), over);
          if (lines.length === 1 && roomH(size) - 4 * g.bw - 2 * g.ringPad < g.lh + 2) chip.classList.add('wc-c--tight');
          lines.forEach(function (ln) {
            var span = el('span', 'wc-c__ln' + (ln.st ? ' wc-st wc-st--' + ln.st : ''));
            if (ln.st && ln.lamp) { var lmp = el('i', 'wc-lamp'); lmp.setAttribute('aria-hidden', 'true'); span.appendChild(lmp); }
            span.appendChild(document.createTextNode(ln.t));
            chip.appendChild(span);
          });
        }
        if (uval != null) {
          /* what the Pod used: a solid c1 fill from the chip's bottom; above its reservation, hatched */
          chip.classList.add('wc-c--use');
          var fill = mark(el('i', 'wc-use'), 'use:' + c.id);
          fill.setAttribute('aria-hidden', 'true');
          fill.style.height = (Math.min(uval, size) / size * 100) + '%';
          chip.appendChild(fill);
          if (over) {
            pod.classList.add('is-over');
            var px = ((uval - size) / RU) * (u + g.gapU);
            var room = Math.max(0, top + g.ringPad + g.bw);
            var ov = mark(el('i', 'wc-over' + (px > room + 0.5 ? ' is-clipped' : '')), 'use:' + c.id);
            ov.setAttribute('aria-hidden', 'true');
            ov.style.height = Math.min(px, room) + 'px';
            pod.appendChild(ov);
          }
        }
        pod.appendChild(chip);
        return pod;
      }

      /* WAITING: Pods no node has room for, in a strip above the nodes (warn header) */
      if (L.hasWaiting) {
        var wl = waitingList(state);
        var ws = mark(minH(el('div', 'wc-wait'), R.wait), 'waiting');
        if (wl.length) {
          ws.appendChild(el('p', 'wc-wait__head wc-tone--warn', str('waiting')));
          var wrow = el('div', 'wc-wait__pods');
          wrow.style.gridTemplateColumns = cols;
          wl.forEach(function (w) { wrow.appendChild(drawPod({ id: w.id, status: w.status === 'running' ? 'waiting' : w.status }, 0)); });
          ws.appendChild(wrow);
        }
        ground.appendChild(ws);
      }

      /* nodes */
      var row = el('div', 'wc__nodes');
      row.style.gridTemplateColumns = cols;
      var agentW = nodesOnly ? 0 : pillW(g, S.agent);   /* nodes only: no agent pills either */
      ids.forEach(function (n) {
        var down = has(state.down, n);
        var spare = has(state.spare, n);
        var isNew = has(state.newNodes, n);
        var ns = (state.nodeStatus || {})[n];
        var c = cap(state, n);
        var f = mark(el('div', 'wc-n' + (down ? ' is-down' : '') + (spare ? ' is-spare' : '')), 'n:' + n);
        f.setAttribute('data-n', n);
        var nb = minH(el('div', 'wc-n__bar' + (L.barOneRow ? ' wc-n__bar--row' : '')), R.bar);
        var idEl = el('span', 'wc-n__id', barId(g, n, L.idForm));
        nb.appendChild(idEl);
        var r2 = el('span', 'wc-n__row');
        var rowW2 = 0;
        if (!nodesOnly && barRowW(g, ns, agentW).pill) {
          var ag = el('span', 'wc-pill wc-pill--agent' + (has(agents, n) ? ' is-on' : ''));
          mark(ag, 'agent:' + n);
          ag.appendChild(el('span', 'wc-pill__mark', S.loopMark));
          ag.appendChild(el('span', 'wc-pill__name', S.agent));
          r2.appendChild(ag);
        }
        rowW2 = barRowW(g, ns, agentW).w;
        if (ns) r2.appendChild(mark(el('b', 'wc-n__st wc-tone--warn', S.nodeStatus[ns]), 'status:' + n));
        nb.appendChild(r2);
        if (isNew) {
          /* NEW: a node added in this step; on the id line, the pill row or a line of its own */
          var tagText = str('newNode');
          var tag = mark(el('span', 'wc-tag', tagText), 'new:' + n);
          var tw = tagW(tagText);
          if (textW(barId(g, n, L.idForm), 700, 0.04) + 6 + tw <= g.barTextW) { idEl.appendChild(document.createTextNode(' ')); idEl.appendChild(tag); }
          else if (rowW2 + 4 + tw <= g.barTextW) r2.appendChild(tag);
          else { var tl = el('span', 'wc-n__tags'); tl.appendChild(tag); nb.appendChild(tl); }
        }
        var vd = verdictOf(state, n);
        if (vd) {
          var vb = mark(el('span', 'wc-n__verdict' + (L.verdictForm === 'narrow' ? ' wc-n__verdict--narrow' : '')), 'verdict:' + n);
          verdictLines(vd, L.verdictForm || 'wide', g.barTextW).forEach(function (ln) {
            var line = el('span', 'wc-n__vln');
            ln.atoms.forEach(function (a, i) {
              if (i) line.appendChild(document.createTextNode(' '));
              line.appendChild(el('span', a.cls, a.t));
            });
            vb.appendChild(line);
          });
          nb.appendChild(vb);
        }
        f.appendChild(nb);

        var body = el('div', 'wc-n__body');
        body.style.height = (roomH(c.memory) + 2 * g.bodyPad) + 'px';
        var top = 0;
        (state.nodes[n] || []).forEach(function (entry) {
          var pc = parseEntry(entry);
          body.appendChild(drawPod(pc, top));
          top += roomH(podSize(pc.id)) + g.gapU;
        });
        var free = c.memory - usedRoom(state, n);
        if (free > EPS) {
          if (down) {
            /* reality: the machine is dead. What the record believes about it is on the bar. */
            var dn = el('div', 'wc-down', S.down);
            dn.style.height = roomH(free) + 'px';
            body.appendChild(dn);
          } else if (spare) {
            /* a spare node: rented, kept empty in case one is lost */
            var sp = mark(el('div', 'wc-free wc-free--spare', str('spare')), 'free:' + n);
            sp.style.height = roomH(free) + 'px';
            body.appendChild(sp);
          } else {
            var amount = fmt(free) + (UNIT ? ' ' + UNIT : '');
            var full = amount + ' ' + S.free;
            var fr = mark(el('div', 'wc-free'), 'free:' + n);
            fr.style.height = roomH(free) + 'px';
            /* less than a line of room: the label overflows the dashed box, centred on it */
            var shortBox = roomH(free) < 16;
            if (shortBox) fr.classList.add('wc-free--short');
            var freeW = g.colW - 4 * BORDER - 2 * g.bodyPad;
            /* too thin for any label: under 8px, or (pool-02) a box shorter than a line whose inside
               can't hold the glyphs; a box shorter than a line shows the amount alone ("1 GB") */
            if (roomH(free) < 8 || (shortBox && roomH(free) - 2 * BORDER < FREE_TEXT_MIN)) fr.classList.add('wc-free--sliver');
            else if (shortBox) fr.textContent = amount;
            else if (textW(full.toUpperCase(), 400, 0.04) <= freeW + 0.5) fr.textContent = full;
            else if (roomH(free) >= 34) { fr.appendChild(el('span', 'wc-free__ln', amount)); fr.appendChild(el('span', 'wc-free__ln', S.free)); fr.classList.add('wc-free--2'); }
            else fr.textContent = amount;
            body.appendChild(fr);
          }
        }
        f.appendChild(body);

        if (c.cpu != null) {
          /* the processor: a second count, printed (reserved / room for Pods) */
          var ft = mark(minH(el('div', 'wc-n__foot'), R.foot), 'cpu:' + n);
          footLines(L.footForm || 0, usedCpu(state, n), c.cpu).forEach(function (t) { ft.appendChild(el('span', 'wc-n__fln', t)); });
          f.appendChild(ft);
        }
        row.appendChild(f);
      });
      ground.appendChild(row);

      /* note lines: what customers experience, the connection line, the scheduler's recorded reason */
      if (L.hasNotes) {
        var notes = minH(el('div', 'wc__notes'), R.notes);
        (state.notes || []).forEach(function (nt) {
          var p = mark(el('p', 'wc-note' + (nt.type ? ' wc-note--' + nt.type : '')), 'note:' + nt.id);
          p.setAttribute('data-note', nt.id);
          var label = nt.label || (nt.type === 'scheduler' ? str('scheduler') : null);
          if (label) { p.appendChild(el('b', 'wc-note__k', label)); p.appendChild(document.createTextNode(' · ')); }
          p.appendChild(el('span', nt.tone ? 'wc-tone--' + nt.tone : null, nt.text));
          if (nt.sub && L.noteSub) {
            p.appendChild(document.createTextNode(' · '));
            p.appendChild(el('span', 'wc-tone--mute', nt.sub));
          }
          notes.appendChild(p);
        });
        ground.appendChild(notes);
      }

      target.textContent = '';
      target.appendChild(root);
      return root;
    }

    /* Render every state of a lane into `target` at this width and take each block's tallest height,
       so that every state reserves the same rows and the lane's canvas never changes height. */
    function measureReserve(target, states, opts) {
      var R = { rec: 0, loops: 0, notes: 0, banner: 0, bar: 0, wait: 0, foot: 0 };
      var pick = function (root, sel, key, all) {
        var nodes = all ? root.querySelectorAll(sel) : [root.querySelector(sel)];
        Array.prototype.forEach.call(nodes, function (n) { if (n) R[key] = Math.max(R[key], n.offsetHeight); });
      };
      states.forEach(function (st) {
        var o = {};
        for (var k in opts) o[k] = opts[k];
        o.reserve = null; o.highlight = []; o.lit = false;
        var root = renderCluster(target, st, o);
        pick(root, '.wc-rec', 'rec');
        pick(root, '.wc-loops', 'loops');
        pick(root, '.wc__notes', 'notes');
        pick(root, '.wc__banner', 'banner');
        pick(root, '.wc-n__bar', 'bar', true);
        pick(root, '.wc-wait', 'wait');
        pick(root, '.wc-n__foot', 'foot', true);
      });
      /* min-height is a border-box height here (box-sizing in cluster.css) */
      return R;
    }

    return {
      data: D,
      renderCluster: renderCluster, laneLayout: laneLayout, measureReserve: measureReserve,
      recordRows: recordRows, geometry: geometry, nodeIds: nodeIds,
      usedRoom: usedRoom, usedCpu: usedCpu, capacity: cap, fmt: fmt,
      /* after web fonts load: forget cached text measurements */
      reset: function () { monoFamily = null; widestOneLine = null; }
    };
  }

  window.ClusterCanvas = window.ClusterCanvas || {};
  window.ClusterCanvas.create = create;
  window.ClusterCanvas.el = el;
  window.ClusterCanvas.fmt = fmt;
})();
