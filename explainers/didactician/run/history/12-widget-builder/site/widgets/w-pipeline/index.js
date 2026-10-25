/* w-pipeline: Plate I ("what" mode, s-02) and Plate II ("why" mode, s-03).
   One widget folder, two mounts sharing data-widget="w-pipeline", told apart by data-mode.
   The page owns the scroll steps: assets/page.js sets data-active-step on each mount and
   dispatches "didactician:step" ({ step, mode, rule, el }). This file only draws inside the mounts.

   Model (plan § w-pipeline; facts c-01, c-02, c-04): 8 ordered stages, each with a kind
   (agent = rectangle, script = hexagon, human = rounded pill) and the file it produces.
   Layout is drawn in real pixels from the container width (1 SVG unit = 1 CSS px):
     - container ≥ 620px: one row of 8 (tablet portrait, phone landscape);
     - narrower: a 4 × 2 grid in snake order (row 1 left→right, row 2 right→left).
   Every state is drawn once per layout; steps only toggle classes, so changes cross-fade. */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var ID = 'w-pipeline';

  // ---- model ---------------------------------------------------------------------------
  var STAGES = [
    { name: 'Intake', short: 'Intake', kind: 'agent', chip: 'brief.md', by: 'by the orchestrator (your session)', produces: 'brief.md' },
    { name: 'Research', short: 'Research', kind: 'agent', chip: 'facts.md', by: 'by a research agent', produces: 'facts.md (and parking-lot.md)' },
    { name: 'Plan', short: 'Plan', kind: 'agent', chip: 'learning-plan.md', by: 'by the instructional designer, an agent', produces: 'learning-plan.md, mockup.html, cut-list.md' },
    { name: 'You approve', short: 'Approve', kind: 'human', chip: 'decisions.md', by: 'by you', produces: 'decisions.md' },
    { name: 'Build', short: 'Build', kind: 'agent', chip: 'site/', by: 'by the page builder and widget builders, agents', produces: 'site/' },
    { name: 'Gate', short: 'Gate', kind: 'script', chip: 'page-round-N.json', by: 'by a script, verify.mjs', produces: 'page-round-N.json' },
    { name: 'Review', short: 'Review', kind: 'agent', chip: 'findings.md', by: 'by two reviewers in fresh contexts, agents', produces: 'findings.md' },
    { name: 'Deliver', short: 'Deliver', kind: 'human', chip: 'log.md', by: 'to you', produces: 'site/ and log.md' }
  ];
  var AGENTS_DISPATCHED = [1, 2, 4, 6];           // Research, Plan, Build, Review
  var PAIR_STAGE = 2;                             // W2: the Plan dispatch carries the prompt/report pair

  // Specimen cards: verbatim excerpts from this page's own run/ files ("…" marks a cut).
  // `m` = the ≤ 4 lines kept on narrow screens.
  var CARDS = [
    { path: 'run/', tag: 'this page’s own run', lines: [
        'brief.md            facts.md',
        'learning-plan.md    decisions.md',
        'site/               page-round-N.json',
        'findings.md         log.md'
      ], m: [0, 1, 2, 3] },
    { path: 'run/brief.md', tag: 'specimen · this run', lines: [
        'audience: Technical users of Claude Code or similar agentic coding tools, …',
        'readiness: intermediate',
        'time_budget_minutes: 8',
        'research_depth: light',
        'mobile: supported',
        '- o-1: After reading, the reader can explain the pipeline at a high level …'
      ], m: [0, 1, 2, 5] },
    { path: 'run/research/facts.md', tag: 'specimen · this run', lines: [
        '### c-01',
        'objective: o-1',
        'claim: Every stage hands the next one files, not chat: …',
        'source: skills/didactician/DESIGN.md#L5',
        'quote: "Each stage hands the next one files, never chat."',
        'confidence: high'
      ], m: [0, 2, 3, 5] },
    { path: 'run/plan/learning-plan.md', tag: 'specimen · this run', lines: [
        '### s-04 — The idea underneath: cognitive load',
        'objectives: o-3',
        'claims: c-07, c-08, c-09, c-10',
        'mode: concrete example (x-01) → rule → contrasting cases (x-02) → …',
        'layout:',
        '  contiguity: adjacent — each figure sits beside or directly under …'
      ], m: [0, 1, 3, 5] },
    { path: 'run/decisions.md', tag: 'specimen · this run', lines: [
        '### d-02 · 2026-10-25T09:45:00 · checkpoint',
        'question: 4 objectives for an 8-min piece (guide ≤ 3): keep all four …',
        'answer: "Keep all 4 (Recommended)"',
        'decision: approved',
        'applies_to: plan'
      ], m: [0, 2, 3, 4] },
    { path: 'site/', tag: 'the page you are reading', lines: [
        'site/',
        '├── index.html',
        '├── assets/   tokens.css, treatise.css, page.js, …',
        '└── widgets/w-pipeline/   ← this plate'
      ], m: [0, 1, 2, 3] },
    { path: 'run/gate/page-round-3.json', tag: 'round 3 · page gate', lines: [
        '"round": 3,',
        '"pass": true,',
        '{ "id": "overflow", … "status": "pass" },',
        '{ "id": "markers", … "status": "pass" },',
        '{ "id": "console", … "status": "pass" },',
        '"failing_ids": []'
      ], m: [0, 1, 2, 5] },
    { path: 'run/review/round-N/findings.md', tag: 'format example · this page’s real ones: run/review/', format: true, lines: [
        '### P-<n> · <blocking | should | nit> · open',
        'criterion: <rubric criterion, ac-NN or invariant>',
        'location: <segment / widget / selector>',
        'evidence: <what the reviewer observed>',
        'expected_fix: <specific enough to act on>'
      ], m: [0, 1, 3, 4] },
    { path: 'run/log.md', tag: 'specimen · this run', lines: [
        '### 2026-10-25T09:29:19-04:00 · orchestrator · intake',
        'Inferred audience/scope/depth from request (no intake questions): …',
        '### 2026-10-25T10:48:52-04:00 · verify · gate',
        'Gate (page) round 3: **PASS**. Reading ~9.7 min (brief: ~8 min; …'
      ], m: [0, 1, 2, 3] }
  ];

  // card metrics (must match index.css): head = path row + tag row; status = up to 2 lines
  var M = { wide: { lineH: 20, headH: 47, padV: 14, statusH: 44, max: 6 }, narrow: { lineH: 18, headH: 40, padV: 10, statusH: 0, max: 4 } };
  var CARD_NEED_WIDE = M.wide.headH + M.wide.padV + M.wide.max * M.wide.lineH + 2 + M.wide.statusH + 12;
  var CARD_NEED_NARROW = M.narrow.headH + M.narrow.padV + M.narrow.max * M.narrow.lineH + 2 + 6;

  var RULES = [
    null,
    { n: 1, title: 'The orchestrator never authors' },
    { n: 2, title: 'Everything is a file' },
    { n: 3, title: 'Scripts gate what’s checkable' },
    { n: 4, title: 'You approve before anything expensive' }
  ];

  var LIVE_WHY = [
    'The eight stages of Plate I, before any rule is drawn.',
    'Rule 1 of 4: The orchestrator never authors. An orchestrator bar dispatches the Research, Plan, Build and Review agents. Review is labelled: fresh context: brief + page (+ facts or plan), not the builder’s reasoning.',
    'Rule 2 of 4: Everything is a file. Every stage’s file is lit: brief.md, facts.md, learning-plan.md, decisions.md, site/, page-round-N.json, findings.md, log.md. The dispatch to Plan carries a prompt and a report, both saved under run/handoffs/.',
    'Rule 3 of 4: Scripts gate what’s checkable. check_research.py, check_plan.py, verify.mjs and findings.py sit between their stages, and round_gate.py clears every dispatch. Judged, not gated: page shape, checks, ToC.',
    'Rule 4 of 4: You approve before anything expensive. The You approve checkpoint is lit; Build, Gate and Review are bracketed: expensive.'
  ];

  // ---- small helpers -------------------------------------------------------------------
  function mk(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    if (attrs) for (var k in attrs) if (attrs[k] != null) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function h(tag, cls, parent, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  }
  var mctx = document.createElement('canvas').getContext('2d');
  var FONTS = { serif: 'Georgia, serif', mono: 'monospace' };
  function tw(text, px, mono, weight, italic) {
    mctx.font = (italic ? 'italic ' : '') + (weight || 400) + ' ' + px + 'px ' + (mono ? FONTS.mono : FONTS.serif);
    return mctx.measureText(text).width;
  }
  function segsWidth(segs, px, italic) {
    return segs.reduce(function (s, g) { return s + tw(g.t, g.mono ? px - 1 : px, g.mono, 400, italic && !g.mono); }, 0);
  }
  // Text with optional mono tspans. segs: [{t, mono}]
  function text(parent, x, y, segs, cls, anchor, px) {
    var t = mk('text', { x: x, y: y, 'text-anchor': anchor || 'start', 'dominant-baseline': 'central', 'class': cls }, parent);
    if (px) t.style.fontSize = px + 'px';
    if (typeof segs === 'string') segs = [{ t: segs }];
    segs.forEach(function (g) {
      var s = mk('tspan', g.mono ? { 'class': 'wp-mono' } : null, t);
      if (g.mono && px) s.style.fontSize = (px - 1) + 'px';
      s.textContent = g.t;
    });
    return t;
  }
  // Word-wrap tokens ([{t, mono, join}]) into lines of segs, measured in the real fonts.
  function wrap(tokens, maxW, px, italic) {
    var lines = [], line = [], w = 0, space = tw(' ', px, false, 400, italic);
    tokens.forEach(function (tk) {
      var tw_ = tw(tk.t, tk.mono ? px - 1 : px, tk.mono, 400, italic && !tk.mono);
      var add = line.length && !tk.join ? space : 0;
      if (line.length && w + add + tw_ > maxW && !tk.join) { lines.push(line); line = []; w = 0; add = 0; }
      line.push({ t: (add ? ' ' : '') + tk.t, mono: tk.mono });
      w += add + tw_;
    });
    if (line.length) lines.push(line);
    return lines;
  }
  function words(s) { return s.split(' ').map(function (t) { return { t: t }; }); }

  function hexPoints(x, y, w, hgt, inset) {
    var k = inset == null ? Math.min(10, hgt * 0.32) : inset;
    return [[x + k, y], [x + w - k, y], [x + w, y + hgt / 2], [x + w - k, y + hgt], [x + k, y + hgt], [x, y + hgt / 2]]
      .map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' ');
  }
  function shapeFor(g, s, n, fill, cls) {
    if (s.kind === 'script') return mk('polygon', { points: hexPoints(n.x, n.y, n.w, n.h), 'class': cls, fill: fill }, g);
    return mk('rect', { x: n.x, y: n.y, width: n.w, height: n.h, rx: s.kind === 'human' ? n.h / 2 : 1, 'class': cls, fill: fill }, g);
  }
  function docGlyph(parent, cx, cy, cls) {
    var w = 9, hh = 11, x = cx - w / 2, y = cy - hh / 2, f = 3;
    return mk('path', { d: 'M' + x + ',' + y + 'h' + (w - f) + 'l' + f + ',' + f + 'v' + (hh - f) + 'h' + (-w) + 'z', 'class': cls }, parent);
  }
  function miniHex(parent, cx, cy, w, hgt, cls) {
    return mk('polygon', { points: hexPoints(cx - w / 2, cy - hgt / 2, w, hgt, w * 0.25), 'class': cls }, parent);
  }

  // ---- one mount -----------------------------------------------------------------------
  var count = 0;
  function Pipeline(el) {
    this.el = el;
    this.mode = el.getAttribute('data-mode') === 'why' ? 'why' : 'what';
    this.uid = 'wp' + (++count) + '-' + this.mode;
    this.step = null;
    el.classList.add('wp-mode-' + this.mode);
    this.svgWrap = h('div', 'wp-strip', el);
    if (this.mode === 'what') {
      this.status = h('p', 'wp-status', el);
      this.status.setAttribute('aria-hidden', 'true');
      this.card = h('div', 'wp-card', el);
      var head = h('div', 'wp-card-head', this.card);
      this.cardPath = h('span', 'wp-card-path', head);
      this.cardTag = h('span', 'wp-card-tag', head);
      this.cardBody = h('ol', 'wp-card-body', this.card);
      this.cardBody.setAttribute('aria-label', 'Excerpt');
    }
    this.live = h('p', 'wp-live', el);
    this.live.setAttribute('aria-live', 'polite');
    this.live.setAttribute('role', 'status');
  }

  Pipeline.prototype.avail = function () {
    var mh = parseFloat(getComputedStyle(this.el).minHeight);
    return isFinite(mh) && mh > 0 ? mh : (this.mode === 'what' ? 480 : 420);
  };

  Pipeline.prototype.render = function () {
    var el = this.el, W = Math.floor(el.clientWidth), H = this.avail(), why = this.mode === 'why';
    if (W < 40) return;
    this.W = W; this.H = H;
    var row = W >= 620, narrow = !row && W < 400;
    var pad = narrow ? 4 : 8, gap = row ? 14 : (narrow ? 14 : 16);
    var cols = row ? 8 : 4;
    var nw = (W - 2 * pad - (cols - 1) * gap) / cols;
    var nh = row ? 38 : (narrow ? 34 : 44);
    var fsName = narrow || (row && nw < 84) ? 12 : 13;
    var pitch = nw + gap;

    // chips: file names if they fit their column, else a file glyph
    var chipPx = 11;
    var chipText = STAGES.every(function (s) { return tw(s.chip, chipPx, true) <= pitch - 6; });

    // vertical rhythm
    var titleH = why ? (row ? 20 : (narrow ? 20 : 24)) : 0;
    var band = why ? (row ? 30 : (narrow ? 32 : 34)) : (row ? 18 : (narrow ? 16 : 20));
    var ch = why ? (row ? 48 : (narrow ? 56 : 64)) : (row ? 26 : (narrow ? 30 : 44));
    var noteW = W - 2 * pad, notePx = narrow ? 12 : 13, noteLH = notePx + 5;

    // notes (why): measure the tallest, drop the title line if space is short
    var notes = null, noteNeed = 0;
    if (why) {
      notes = {
        1: wrap(words('fresh context: brief + page (+ facts or plan), not the builder’s reasoning'), noteW, notePx, true),
        2: wrap([{ t: '03-instructional-designer.prompt.md', mono: true }, { t: '↔' }, { t: '.report.md', mono: true }], noteW, notePx, true),
        3: wrap(words('judged, not gated: page shape, checks, ToC'), noteW, notePx, true)
      };
      noteNeed = Math.max(notes[1].length, notes[2].length, notes[3].length) * noteLH + 8;
      var used = function () { return titleH + band + nh + ch + (row ? 0 : nh + band) + 4; };
      if (used() + noteNeed > H) titleH = 0;
      while (used() + noteNeed > H && ch > (row ? 38 : 44)) ch -= 2;
      while (used() + noteNeed > H && band > 24) band -= 2;
      while (used() + noteNeed > H && nh > 30) nh -= 2;
    }

    // spare height (grid): give it to the drawing, not to empty paper; the mount centres the rest
    if (!row) {
      var base = titleH + 2 * band + 2 * nh + ch + 6;
      var need = why ? noteNeed : (narrow ? CARD_NEED_NARROW : CARD_NEED_WIDE);
      var spare = H - base - need;
      if (spare > 16) {
        var gnh = Math.min(narrow ? 6 : 8, spare * 0.18), gch = Math.min(narrow ? 20 : 32, spare * 0.4), gb = Math.min(narrow ? 4 : 6, spare * 0.08);
        nh += Math.round(gnh); ch += Math.round(gch); band += Math.round(gb);

      }
    }

    // labels: full name if it fits on the node, else the short one
    var useShort = STAGES.some(function (s) { return tw(s.name, fsName, false, 600) > nw - (s.kind === 'script' ? 22 : s.kind === 'human' ? nh * 0.45 + 8 : 10); });

    // node boxes
    var nodes = STAGES.map(function (s, k) {
      var r = row ? 0 : (k < 4 ? 0 : 1);
      var c = row ? k : (k < 4 ? k : 7 - k);
      var x = pad + c * pitch, y;
      if (row) y = titleH + ch;
      else y = titleH + band + r * (nh + ch);
      return { k: k, r: r, c: c, x: x, y: y, w: nw, h: nh, cx: x + nw / 2, cy: y + nh / 2,
               outer: (!row && r === 0) ? -1 : 1 };       // -1 = band above, +1 = band below
    });
    var stripBottom = row ? titleH + ch + nh + band : titleH + band + nh + ch + nh + band;
    var svgH = why ? stripBottom + noteNeed : stripBottom + 2;
    var notesTop = stripBottom + 2;
    this.geom = { row: row, narrow: narrow, nodes: nodes, svgH: svgH };
    el.classList.toggle('wp-narrow', narrow);

    // ---- SVG
    this.svgWrap.textContent = '';
    var svg = mk('svg', { 'class': 'wp-svg', viewBox: '0 0 ' + W + ' ' + svgH, width: W, height: svgH, role: 'img',
      'aria-label': 'Eight stages in order: ' + STAGES.map(function (s) {
        return s.name + ' (' + (s.kind === 'script' ? 'script, hexagon' : s.kind === 'human' ? 'you, rounded' : 'agent, rectangle') + ', ' + s.chip + ')';
      }).join(', ') });
    this.svgWrap.appendChild(svg);
    this.svg = svg;
    var defs = mk('defs', null, svg), u = this.uid;
    [['h', 5, 'wp-pat-h'], ['a', 3.2, 'wp-pat-a'], ['s', 5, 'wp-pat-s']].forEach(function (p) {
      var pat = mk('pattern', { id: u + '-' + p[0], width: p[1], height: p[1], patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)', 'class': p[2] }, defs);
      mk('line', { x1: 0, y1: 0, x2: 0, y2: p[1] }, pat);
    });

    var gFlow = mk('g', { 'class': 'wp-flow' }, svg);
    var gOv = mk('g', { 'class': 'wp-overlays' }, svg);
    var gNodes = mk('g', { 'class': 'wp-nodes' }, svg);
    var gChips = mk('g', { 'class': 'wp-chips' }, svg);
    var gTop = mk('g', { 'class': 'wp-top' }, svg);
    var arrow = window.Didactician && window.Didactician.arrow;
    var A = function (from, to, o) {
      o = o || {};
      return arrow(svg, from, to, { color: o.color || 'var(--ink-2)', width: o.width || 1.25, head: o.head || 5, gap: o.gap == null ? 3 : o.gap, parent: o.parent || gFlow, className: o.className });
    };
    var rectOf = function (n) { return { x: n.x, y: n.y, width: n.w, height: n.h }; };

    // flow arrows (sequence)
    var flowGap = gap < 16 ? 2 : 3;
    var fx = null;
    for (var k = 0; k < 7; k++) {
      var a = nodes[k], b = nodes[k + 1];
      if (a.r === b.r) A(rectOf(a), rectOf(b), { gap: flowGap });
      else {       // grid: the snake turns down at column 4 (You approve → Build)
        fx = a.x + a.w * 0.72;
        A({ x: fx, y: a.y + a.h }, { x: fx, y: b.y }, { gap: 3 });
      }
    }

    // nodes
    this.nodeEls = nodes.map(function (n, k) {
      var s = STAGES[k];
      var g = mk('g', { 'class': 'wp-node wp-k-' + s.kind, 'data-stage': k + 1 }, gNodes);
      shapeFor(g, s, n, 'url(#' + u + '-' + (s.kind === 'script' ? 's' : 'h') + ')', 'wp-shape');
      shapeFor(g, s, n, 'url(#' + u + '-a)', 'wp-shape-act');
      shapeFor(g, s, n, 'none', 'wp-outline');
      text(g, n.cx, n.cy, useShort ? s.short : s.name, 'wp-name', 'middle', fsName);
      return g;
    });

    // chips (the file each stage produces), in each node's outer band
    var self = this;
    this.chipEls = nodes.map(function (n, k) {
      var g = mk('g', { 'class': 'wp-chip' }, gChips);
      var cy = n.outer < 0 ? n.y - (why ? 10 : band / 2) : n.y + n.h + (why ? 10 : band / 2);
      if (chipText) text(g, n.cx, cy, [{ t: STAGES[k].chip, mono: true }], 'wp-chip-t', 'middle', chipPx + 1);
      else docGlyph(g, n.cx, cy, 'wp-doc');
      return g;
    });

    // caption for the overview ("what", step 0), in the channel
    if (!why) {
      var capY = row ? ch / 2 : nodes[0].y + nh + ch / 2;
      var capX = row ? W / 2 : (pad + nodes[2].x + nw) / 2;
      this.caption = text(gTop, capX, capY, 'Files, never chat', 'wp-caption', 'middle', narrow ? 13 : 14);
    }

    // ---- "why" overlays
    this.ov = {};
    if (why) {
      var ov = function (name) { var g = mk('g', { 'class': 'wp-ov', 'data-ov': name }, gOv); self.ov[name] = g; return g; };
      // title line
      this.titles = [];
      if (titleH) {
        for (var r = 0; r <= 4; r++) {
          var tg = ov('t' + r);
          var segs = r ? [{ t: 'Rule ' + r + ' of 4 · ' }, { t: RULES[r].title }] : [{ t: 'The same eight stages as Plate I' }];
          if (segsWidth(segs, 12, true) > W - 2 * pad) segs = [{ t: 'Rule ' + r + ' of 4' }];
          text(tg, pad, titleH / 2, segs, 'wp-title', 'start', 12);
        }
      }

      // the orchestrator bar (an agent: rectangle), in the channel
      var barH = narrow ? 20 : 22, bar;
      if (row) bar = { x: pad, y: titleH + 2, width: W - 2 * pad, height: barH };
      else {
        var c3 = nodes[3];
        bar = { x: pad, y: nodes[0].y + nh + (ch - barH) / 2, width: c3.x + c3.w * 0.42 - pad, height: barH };
      }
      var gBar = ov('bar');
      mk('rect', { x: bar.x, y: bar.y, width: bar.width, height: bar.height, rx: 1, 'class': 'wp-bar' }, gBar);
      var barLabels = {
        1: [[{ t: 'Orchestrator (your session): dispatches, never authors' }], [{ t: 'Orchestrator: dispatches, never authors' }], [{ t: 'Orchestrator: never authors' }], [{ t: 'Orchestrator' }]],
        2: [[{ t: 'Orchestrator' }]],
        3: [[{ t: 'Orchestrator: every dispatch cleared by ' }, { t: 'round_gate.py', mono: true }], [{ t: 'every dispatch: ' }, { t: 'round_gate.py', mono: true }], [{ t: 'round_gate.py', mono: true }]]
      };
      [1, 2, 3].forEach(function (r) {
        var g = ov('bar' + r), px = 12;
        var pick = barLabels[r].filter(function (segs) { return segsWidth(segs, px) <= bar.width - 14; })[0] || barLabels[r][barLabels[r].length - 1];
        text(g, bar.x + 8, bar.y + barH / 2, pick, 'wp-bar-t', 'start', px);
      });

      // dispatch arrows: from the bar to each agent it dispatches
      var gDisp = ov('dispatch'), badges = [];
      AGENTS_DISPATCHED.forEach(function (k) {
        var n = nodes[k], x = n.cx, from, to;
        if (!row && k === 4) x = n.x + n.w * 0.24;             // Build sits under the bar's end
        if (row) { from = { x: x, y: bar.y + barH }; to = { x: x, y: n.y }; }
        else if (n.r === 0) { from = { x: x, y: bar.y }; to = { x: x, y: n.y + n.h }; }
        else { from = { x: x, y: bar.y + barH }; to = { x: x, y: n.y }; }
        A(from, to, { parent: gDisp, gap: 2, className: 'wp-disp' });
        badges.push({ x: x, y: (from.y + to.y) / 2 });
      });

      // W1: fresh context on Review
      var g1 = ov('w1'), rv = nodes[6];
      var leaderFrom = rv.outer > 0 ? rv.y + rv.h + 2 : rv.y - 2;
      mk('line', { x1: rv.cx, y1: leaderFrom, x2: rv.cx, y2: notesTop + 2, 'class': 'wp-leader' }, g1);
      notes[1].forEach(function (ln, i) { text(g1, pad, notesTop + 4 + noteLH * (i + 0.5), ln, 'wp-note wp-note-key', 'start', notePx); });

      // W2: the prompt → report pair on the dispatch to Plan
      var g2 = ov('w2'), pn = nodes[PAIR_STAGE], off = 6, yBarEdge, yNode;
      if (row) { yBarEdge = bar.y + barH; yNode = pn.y; } else { yBarEdge = bar.y; yNode = pn.y + pn.h; }
      A({ x: pn.cx - off, y: yBarEdge }, { x: pn.cx - off, y: yNode }, { parent: g2, gap: 2, color: 'var(--ink)' });  // prompt: bar → agent
      A({ x: pn.cx + off, y: yNode }, { x: pn.cx + off, y: yBarEdge }, { parent: g2, gap: 2, color: 'var(--ink)' });  // report: agent → bar
      var my = (yBarEdge + yNode) / 2;
      text(g2, pn.cx - off - 5, my, [{ t: 'prompt.md', mono: true }], 'wp-pair', 'end', 12);
      text(g2, pn.cx + off + 5, my, [{ t: 'report.md', mono: true }], 'wp-pair', 'start', 12);
      notes[2].forEach(function (ln, i) { text(g2, pad, notesTop + 4 + noteLH * (i + 0.5), ln, 'wp-note', 'start', notePx); });

      // W3: script hexagons between their stages, round_gate badges, the side note
      var g3 = ov('w3');
      var scripts = [
        { between: [1, 2], name: 'check_research.py' },
        { between: [2, 3], name: 'check_plan.py' },
        { node: 5, name: 'verify.mjs' },
        { between: [6, 7], name: 'findings.py' }
      ];
      var placed = { '-1': [[], []], '1': [[], []] };
      var lpx = 12;
      scripts.forEach(function (sc) {
        var gx, gy, side, edge;
        if (sc.between) {
          var na = nodes[sc.between[0]], nb = nodes[sc.between[1]];
          gx = (Math.max(na.x, nb.x) + Math.min(na.x + na.w, nb.x + nb.w)) / 2;
          gy = na.cy; side = na.outer; edge = side < 0 ? na.y : na.y + na.h;
          miniHex(g3, gx, gy, Math.min(14, gap + 2), 11, 'wp-script-glyph');
        } else {
          var nn = nodes[sc.node]; gx = nn.cx; gy = null; side = nn.outer; edge = side < 0 ? nn.y : nn.y + nn.h;
        }
        var w = tw(sc.name, lpx - 1, true) + 4;
        var lx = Math.max(pad + w / 2, Math.min(W - pad - w / 2, gx));
        var level = 0;
        var clash = function (lv) { return placed[side][lv].some(function (iv) { return lx - w / 2 < iv[1] + 6 && lx + w / 2 > iv[0] - 6; }); };
        if (clash(0)) level = 1;
        placed[side][level].push([lx - w / 2, lx + w / 2]);
        var ly = edge + side * (level ? 23 : 9);
        if (gy != null) mk('line', { x1: gx, y1: gy + side * 6, x2: gx, y2: ly - side * 5, 'class': 'wp-leader wp-leader-s' }, g3);
        text(g3, lx, ly, [{ t: sc.name, mono: true }], 'wp-script-t', 'middle', lpx);
      });
      var gBadges = ov('badges');
      badges.forEach(function (b) { miniHex(gBadges, b.x, b.y, 12, 10, 'wp-script-glyph'); });
      notes[3].forEach(function (ln, i) { text(g3, pad, notesTop + 4 + noteLH * (i + 0.5), ln, 'wp-note', 'start', notePx); });

      // W4: the bracket over everything after the checkpoint
      var g4 = ov('w4'), b0 = nodes[4], b2 = nodes[6];
      var bx0 = Math.min(b0.x, b2.x), bx1 = Math.max(b0.x + b0.w, b2.x + b2.w);
      var bs = b0.outer, be = bs > 0 ? b0.y + b0.h : b0.y, t0 = be + bs * 4, t1 = be + bs * 10;
      mk('path', { d: 'M' + bx0 + ',' + t0 + 'V' + t1 + 'H' + bx1 + 'V' + t0 + 'M' + ((bx0 + bx1) / 2) + ',' + t1 + 'v' + (bs * 4), 'class': 'wp-bracket' }, g4);
      text(g4, (bx0 + bx1) / 2, be + bs * 22, 'expensive: build, gate, review', 'wp-bracket-t', 'middle', 12);
    }

    this.apply(this.step, true);
  };

  // ---- states -----------------------------------------------------------------------------
  Pipeline.prototype.apply = function (step, silent) {
    this.step = step;
    if (!this.nodeEls) return;
    var why = this.mode === 'why', n = parseInt(step, 10);
    if (!isFinite(n)) n = why ? 0 : 0;
    var nodeState = [], chipsOn = [], chipsShown = true, ovOn = {};
    var i;
    if (!why) {
      for (i = 0; i < 8; i++) {
        nodeState[i] = n === 0 ? '' : (i === n - 1 ? 'is-active' : 'is-dim');
        chipsOn[i] = n === 0 || i === n - 1;
      }
      this.caption.classList.toggle('is-on', n === 0);
    } else {
      chipsShown = n === 2;
      var full = { 1: [1, 2, 4, 6], 2: [], 3: [5], 4: [4, 5, 6] }[n];
      var act = { 1: 6, 3: 5, 4: 3 }[n];
      for (i = 0; i < 8; i++) {
        nodeState[i] = !n ? '' : (i === act ? 'is-active' : (full.indexOf(i) >= 0 ? '' : 'is-dim'));
        chipsOn[i] = n === 2;
      }
      ovOn['t' + n] = 1;
      if (n === 1 || n === 2 || n === 3) { ovOn.bar = 1; ovOn['bar' + n] = 1; }
      if (n === 1 || n === 3) ovOn.dispatch = 1;
      if (n === 3) ovOn.badges = 1;
      if (n) ovOn['w' + n] = 1;
    }
    this.nodeEls.forEach(function (g, k) {
      g.classList.toggle('is-active', nodeState[k] === 'is-active');
      g.classList.toggle('is-dim', nodeState[k] === 'is-dim');
    });
    this.chipEls.forEach(function (g, k) {
      g.classList.toggle('is-hidden', !chipsShown);
      g.classList.toggle('is-lit', chipsShown && chipsOn[k]);
    });
    for (var key in this.ov) this.ov[key].classList.toggle('is-on', !!ovOn[key]);
    if (this.svg) this.svg.querySelector('.wp-flow').classList.toggle('is-dim', why ? n === 2 || n === 4 : n > 0);
    this.el.setAttribute('data-state', why ? (n ? 'W' + n : 'plain') : String(n));

    var msg;
    if (why) msg = LIVE_WHY[n] || LIVE_WHY[0];
    else if (n === 0) msg = 'All 8 stages in order: ' + STAGES.map(function (s) { return s.name; }).join(', ') + '. Each hands the next a file, never chat.';
    else {
      var s = STAGES[n - 1];
      msg = 'Stage ' + n + ' of 8: ' + s.name + ', ' + s.by + '. Produces ' + s.produces + '.';
    }
    if (!why) this.fillCard(n, msg, silent);
    if (this.live.textContent !== msg) this.live.textContent = msg;
  };

  // Fit the card (and the status line) into the height the page reserved for the mount.
  Pipeline.prototype.fillCard = function (n, msg, silent) {
    var g = this.geom, card = CARDS[n] || CARDS[0];
    var stripH = g.svgH, avail = this.H - stripH - 6 - 2;   // flex gap + card borders
    var wide = !g.narrow, mm = wide ? M.wide : M.narrow;
    var lineH = mm.lineH, headH = mm.headH, padV = mm.padV;
    var statusH = 0;
    this.status.hidden = !(wide && avail - mm.statusH - 6 >= headH + padV + 3 * lineH);
    if (!this.status.hidden) { statusH = mm.statusH + 6; this.status.textContent = n > 0 ? msg :' '; }
    var room = avail - statusH - headH - padV;
    var maxLines = Math.max(0, Math.min(mm.max, Math.floor(room / lineH)));
    var lines = wide && card.lines.length <= maxLines ? card.lines : card.m.map(function (i) { return card.lines[i]; });
    lines = lines.slice(0, maxLines);
    this.card.classList.toggle('is-format', !!card.format);
    this.card.classList.toggle('is-collapsed', maxLines === 0);
    this.cardPath.textContent = card.path;
    this.cardTag.textContent = card.tag;
    this.cardBody.textContent = '';
    var self = this;
    lines.forEach(function (ln) { var li = h('li', null, self.cardBody); h('span', null, li, ln); });
    this.cardBody.style.height = maxLines ? (maxLines * lineH + padV) + 'px' : '0px';
    if (!silent) {
      this.card.classList.remove('is-inking');
      void this.card.offsetWidth;
      this.card.classList.add('is-inking');
    }
  };

  function boot(el) {
    if (el.__dInit) return;
    el.__dInit = true;
    try {
      var cs = getComputedStyle(el);
      FONTS.serif = cs.getPropertyValue('--font-serif').trim() || FONTS.serif;
      FONTS.mono = cs.getPropertyValue('--font-mono').trim() || FONTS.mono;
      if (!(window.Didactician && window.Didactician.arrow)) throw new Error('assets/arrow.js is not loaded');
      var p = new Pipeline(el);
      p.step = el.getAttribute('data-active-step') || '';
      p.render();
      var lastW = el.clientWidth, lastH = p.H;
      var rerender = function () {
        var w = el.clientWidth, hh = p.avail();
        if (Math.abs(w - lastW) < 1 && Math.abs(hh - lastH) < 1) return;
        lastW = w; lastH = hh;
        p.render();
      };
      if ('ResizeObserver' in window) new ResizeObserver(rerender).observe(el);
      window.addEventListener('resize', rerender);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { p.render(); });
      el.addEventListener('didactician:step', function (e) {
        var st = e.detail && e.detail.step != null ? e.detail.step : el.getAttribute('data-active-step');
        p.apply(st == null ? '' : String(st));
      });
    } catch (err) {
      console.error('Didactician widget ' + ID + ' failed:', err);
      var msg = document.createElement('p');
      msg.className = 'd-caption';
      msg.textContent = 'This interactive figure failed to load.';
      el.appendChild(msg);
    }
  }

  // kit/widget.js initialises only the first mount, so both are booted here.
  function go() { Array.prototype.forEach.call(document.querySelectorAll('[data-widget="' + ID + '"]'), boot); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
})();
