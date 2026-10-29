/* pool/cluster/lanes.js · the scrollytelling lane controller over the cluster drawing. Classic script;
   needs pool/widget.js (Didactician.widget) and pool/cluster/cluster.js (ClusterCanvas.create).
   Promoted from Ch 04's w-cluster-scrolly (Ch 03's lane controller, extended); behaviour unchanged,
   except that inline snapshots size their node columns to their own state (pool-02, drawSnaps).

     ClusterCanvas.lanes('w-cluster-scrolly', window.ClusterData);

   Collects the lanes of EVERY mount carrying [data-widget="<id>"] (Didactician.widget hands over only
   the first), fills [data-step-text] and [data-step-snap], activates the step whose top last crossed
   55% of the viewport (IntersectionObserver), restores that step's snapshot on the lane canvas, and
   locks gated steps until the page's checks dispatch 'didactician:check-commit'. Gates never re-lock.
   Where a lane's fitted canvas would still be taller than its budget (50vh under 900px, the viewport
   above), every mount gets data-cs-fit="inline" and each step shows its own snapshot instead
   (cluster.css): decided by measurement, not by device, and per page, so all lanes behave the same
   way on one screen. Lane data: data.CLUSTER_LANES (or data.LANES), keyed by each .cs-lane's
   data-lane; the markup contract is in explainers/_pool/README.md ("Cluster lanes"). */
(function () {
  'use strict';

  function lanes(ID, D) {
    var CC = window.ClusterCanvas;
    if (!D || !window.Didactician || !CC || !CC.create) { console.error(ID + ': ClusterData, Didactician or ClusterCanvas missing'); return; }
    var R = CC.create(D);
    var el = CC.el;
    var renderCluster = R.renderCluster, laneLayout = R.laneLayout, measureReserve = R.measureReserve;
    var LANES = D.CLUSTER_LANES || D.LANES || {};

    Didactician.widget(ID, function (first, ctx) {
      /* Didactician.widget hands over only the first mount; a chapter may have several (one per section) */
      var mounts = Array.prototype.slice.call(document.querySelectorAll('[data-widget="' + ID + '"]'));
      mounts.forEach(function (m) { m.__dInit = true; });

      var committed = {};
      document.querySelectorAll('.cp-check[data-committed]').forEach(function (c) {
        committed[c.getAttribute('data-check')] = true;
      });

      var lanes = [];
      mounts.forEach(function (mount) {
        Array.prototype.forEach.call(mount.querySelectorAll('.cs-lane'), function (laneEl) {
          var data = LANES[laneEl.getAttribute('data-lane')];
          if (!data) { console.error(ID + ': no data for lane ' + laneEl.getAttribute('data-lane')); return; }
          var lane = { mount: mount, el: laneEl, data: data, canvas: laneEl.querySelector('[data-canvas]'), steps: [], active: -1, shown: -1 };
          Array.prototype.forEach.call(laneEl.querySelectorAll('.cs-step'), function (li) {
            var id = li.getAttribute('data-step');
            var sd = data.steps.filter(function (s) { return s.id === id; })[0];
            if (!sd) { console.error(ID + ': no data for step ' + id); return; }
            var attr = li.getAttribute('data-gate');
            lane.steps.push({
              li: li, id: id, data: sd,
              gate: attr != null ? attr.split(/\s+/).filter(Boolean) : (sd.gate || []),
              snap: li.querySelector('[data-step-snap]'),
              text: li.querySelector('[data-step-text]')
            });
          });
          lane.states = lane.steps.map(function (s) { return s.data.state; });
          if (lane.steps.length) lanes.push(lane);
        });
      });

      var isOpen = function (step) { return step.gate.every(function (id) { return committed[id]; }); };

      /* step text (SLOT 3), with any clock kicker */
      lanes.forEach(function (lane) {
        lane.steps.forEach(function (step) {
          if (!step.text) return;
          step.text.textContent = '';
          if (step.data.kicker) step.text.appendChild(el('p', 'wc-kicker', step.data.kicker));
          step.data.text.forEach(function (para) {
            var p = el('p');
            para.split('`').forEach(function (part, i) {
              p.appendChild(i % 2 ? el('code', null, part) : document.createTextNode(part));
            });
            step.text.appendChild(p);
          });
          if (!isOpen(step)) step.li.classList.add('is-locked');
        });
      });

      /* sizes: one unit per lane, fitted so the canvas stays within its budget */
      function budget(width) {
        var vw = window.innerWidth, vh = window.innerHeight;
        if (vw >= 900) return { maxH: vh - 48, maxU: 32, minU: 24 };
        /* under 900px the drawing itself stays within 50vh (mount contract, Heights) */
        return { maxH: Math.floor(vh * 0.5), maxU: width < 440 ? 22 : 32, minU: width < 440 ? 18 : 20 };
      }
      function header(lane, i) { return { lane: lane.data.name, n: i + 1, total: lane.steps.length }; }
      function baseOpts(lane, i, width, layout, reserve, unit, bleed) {
        return { width: width, layout: layout, reserve: reserve, unit: unit, header: header(lane, i), highlight: lane.steps[i].data.highlight, bleed: !!bleed };
      }
      /* lay out one target (canvas or snapshot) for a lane: layout choices, reserve, unit */
      function plan(lane, target, width, b, bleed) {
        var layout = laneLayout(width, lane.states, header(lane, 0));
        var measurable = target.offsetParent !== null;
        var reserve = measurable ? measureReserve(target, lane.states, baseOpts(lane, 0, width, layout, null, b.maxU, bleed)) : null;
        var u = b.maxU, h = 0;
        for (var k = 0; k < 6; k++) {
          var root = renderCluster(target, lane.states[0], baseOpts(lane, 0, width, layout, reserve, u, bleed));
          h = root.offsetHeight;
          if (!h || h <= b.maxH || u <= b.minU) break;
          u = Math.max(b.minU, u - Math.ceil((h - b.maxH) / 6));
        }
        return { layout: layout, reserve: reserve, unit: u, height: h };
      }
      function label(target, step) {
        target.setAttribute('role', 'img');
        target.setAttribute('aria-label', step.data.ariaLabel);
      }

      function drawCanvas(lane, animate) {
        if (!lane.canvas || !lane.fit) return;
        var i = Math.max(lane.active, 0);
        var step = lane.steps[i];
        var o = baseOpts(lane, i, lane.width, lane.fit.layout, lane.fit.reserve, lane.fit.unit);
        o.lit = !animate;
        var root = renderCluster(lane.canvas, step.data.state, o);
        label(lane.canvas, step);
        lane.shown = i;
        if (animate) {
          /* the step highlight eases in (CSS transition, dur-2 ≤ 300ms; instant under reduced motion) */
          requestAnimationFrame(function () { requestAnimationFrame(function () { root.classList.add('is-lit'); }); });
        }
      }
      function drawSnaps(lane) {
        var vh = window.innerHeight;
        var snaps = lane.steps.filter(function (s) { return s.snap; });
        if (!snaps.length) return;
        var probe = snaps[0].snap;
        var w = probe.clientWidth || (snaps[0].text && snaps[0].text.clientWidth) || lane.width;
        /* on a phone the step card's padding leaves too little room for four node columns: the snapshot
           bleeds into that padding (cluster.css, .wc--bleed) */
        var bleed = w < 340 ? 10 : 0;
        w += 2 * bleed;
        var fit = plan(lane, probe, w, { maxH: Math.max(240, Math.floor(vh * 0.8)), maxU: w < 440 ? 22 : 28, minU: 20 }, bleed);
        /* per-state columns (pool-02): each inline snapshot sizes its node columns to its own state's
           node count, not the lane's largest (the sticky canvas keeps the lane-wide reservation, so
           switching steps never moves it). Each step has its own snapshot, so nothing reflows. The
           lane's other choices are still made over every state, at that column width; steps with the
           same node count share one layout and reserve, and the unit stays the lane's. A lane whose
           states all have the same node count draws exactly as before. Lane option snapColumns:
           'lane' keeps the lane-wide columns in the snapshots too. */
        var perState = lane.data.snapColumns !== 'lane';
        var byCols = {};
        function snapFit(state) {
          var n = Math.max(1, R.nodeIds(state).length);
          if (!perState || n === fit.layout.columns) return fit;
          if (!byCols[n]) {
            var lo = laneLayout(w, lane.states, header(lane, 0), { columns: n });
            var o = baseOpts(lane, 0, w, lo, null, fit.unit, bleed);
            o.columns = n;
            byCols[n] = { layout: lo, reserve: probe.offsetParent !== null ? measureReserve(probe, lane.states, o) : null };
          }
          return byCols[n];
        }
        lane.steps.forEach(function (step, i) {
          if (!step.snap) return;
          var f = snapFit(step.data.state);
          renderCluster(step.snap, step.data.state, baseOpts(lane, i, w, f.layout, f.reserve, fit.unit, bleed));
          label(step.snap, step);
        });
      }
      function layout() {
        var inline = false;
        lanes.forEach(function (lane) {
          lane.mount.removeAttribute('data-cs-fit');
          var w = (lane.canvas && lane.canvas.clientWidth) || lane.mount.clientWidth || 320;
          lane.width = w;
          if (lane.canvas && lane.canvas.offsetParent !== null) {
            var b = budget(w);
            lane.fit = plan(lane, lane.canvas, w, b);
            /* still too tall at the smallest unit: show each step's own snapshot instead */
            if (lane.fit.height > b.maxH) inline = true;
          } else {
            /* hidden by the page's short-viewport rule: keep drawing it, unmeasured */
            lane.fit = { layout: laneLayout(w, lane.states, header(lane, 0)), reserve: null, unit: w < 440 ? 22 : 28 };
          }
        });
        /* decided per page, not per lane: on a given screen all lanes behave the same way */
        lanes.forEach(function (lane) {
          if (inline) lane.mount.setAttribute('data-cs-fit', 'inline');
          drawCanvas(lane, false);
          drawSnaps(lane);
        });
      }

      /* activation: the last unlocked step whose top has crossed 55% of the viewport height */
      function update() {
        var line = window.innerHeight * 0.55;
        lanes.forEach(function (lane) {
          var idx = -1;
          for (var i = 0; i < lane.steps.length; i++) {
            var s = lane.steps[i];
            if (!isOpen(s)) break;                 /* a locked step can't become active */
            if (s.li.getBoundingClientRect().top <= line) idx = i;
          }
          if (idx === lane.active) return;
          lane.steps.forEach(function (s, j) { s.li.classList.toggle('is-active', j === idx); });
          lane.active = idx;
          if (Math.max(idx, 0) !== lane.shown) drawCanvas(lane, true);
        });
      }
      var queued = false;
      function schedule() {
        if (queued) return;
        queued = true;
        requestAnimationFrame(function () { queued = false; update(); });
      }

      /* gates: unlock on the page's commit event; never re-lock */
      document.addEventListener('didactician:check-commit', function (e) {
        var id = e.detail && e.detail.id;
        if (!id || committed[id]) return;
        committed[id] = true;
        lanes.forEach(function (lane) {
          lane.steps.forEach(function (s) {
            if (s.li.classList.contains('is-locked') && isOpen(s)) {
              s.li.classList.remove('is-locked');
              s.li.classList.add('is-unlocked');
            }
          });
        });
        schedule();
      });

      layout();
      update();

      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(schedule, { rootMargin: '0px 0px -45% 0px', threshold: 0 });
        lanes.forEach(function (lane) { lane.steps.forEach(function (s) { io.observe(s.li); }); });
      }
      window.addEventListener('scroll', schedule, { passive: true });

      var lastW = window.innerWidth, lastH = window.innerHeight;
      function relayout() { layout(); schedule(); }
      var firstCall = true;   /* ctx.onResize calls back once at registration; layout() has just run */
      ctx.onResize(function () { if (firstCall) { firstCall = false; return; } relayout(); });
      window.addEventListener('resize', function () {
        var w = window.innerWidth, h = window.innerHeight;
        /* ignore the small height changes of a phone's collapsing address bar */
        if (w === lastW && Math.abs(h - lastH) < 80 && (h < 560) === (lastH < 560)) return;
        lastW = w; lastH = h;
        relayout();
      });
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { R.reset(); relayout(); });
    });
  }

  window.ClusterCanvas = window.ClusterCanvas || {};
  window.ClusterCanvas.lanes = lanes;
})();
