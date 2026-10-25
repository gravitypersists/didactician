/* Didactician SVG arrows: correct arrowheads by construction.
   Classic script; exposes window.Didactician.arrow / .label / .labelAlong.

   Why this exists: hand-placed arrowheads routinely (a) overlap or hide inside the target shape,
   (b) get clipped by a marker box that's smaller than the head, (c) show the line's square end
   poking through the tip, or (d) point the wrong way on reversed paths. This helper:
     - ends the arrow on the target's BOUNDARY (circle, ellipse, rect, or point), minus a gap
     - trims the line by the head's length, so the stroke stops under the head's base
     - uses one marker per colour/size: viewBox 0 0 10 10, orient auto-start-reverse, sized in stroke widths
     - supports gentle curves (quadratic), trimmed along the curve

   Usage:
     const svg = document.querySelector('#fig svg');
     Didactician.arrow(svg, {cx: 60, cy: 50, r: 20}, {x: 200, y: 30, width: 80, height: 40}, {color: 'var(--c1)'});
     Didactician.arrow(svg, nodeA, nodeB, {curve: 0.25, both: true});  // SVG elements: uses getBBox (or circle/ellipse geometry)
     Didactician.label(svg, 130, 20, 'flow', {anchor: 'middle'});
   Shapes passed as SVG elements must live in the same user coordinate system as the arrow
   (no transforms between them). Otherwise pass explicit shapes.
   Options: color (CSS value, default var(--ink-2)), width (stroke, default 2), head (size in stroke
   widths, default 5), gap (px from boundary, default 4), curve (−0.5…0.5, bend as a fraction of
   length), both (head at both ends), dashed, parent (element to append to), className. */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';

  function shapeOf(s) {
    if (s && typeof s.getBBox === 'function') {
      var tag = s.tagName.toLowerCase();
      if (tag === 'circle') return { k: 'circle', cx: s.cx.baseVal.value, cy: s.cy.baseVal.value, r: s.r.baseVal.value };
      if (tag === 'ellipse') return { k: 'ellipse', cx: s.cx.baseVal.value, cy: s.cy.baseVal.value, rx: s.rx.baseVal.value, ry: s.ry.baseVal.value };
      var b = s.getBBox();
      return { k: 'rect', cx: b.x + b.width / 2, cy: b.y + b.height / 2, w: b.width, h: b.height };
    }
    if ('r' in s) return { k: 'circle', cx: s.cx, cy: s.cy, r: s.r };
    if ('rx' in s && 'ry' in s) return { k: 'ellipse', cx: s.cx, cy: s.cy, rx: s.rx, ry: s.ry };
    if ('width' in s) return { k: 'rect', cx: s.x + s.width / 2, cy: s.y + s.height / 2, w: s.width, h: s.height };
    return { k: 'point', cx: s.x, cy: s.y };
  }

  // Point on the shape's boundary (expanded by pad) along the ray from its centre toward `p`.
  function boundary(sh, p, pad) {
    var dx = p.x - sh.cx, dy = p.y - sh.cy, d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d, t;
    if (sh.k === 'circle') t = sh.r + pad;
    else if (sh.k === 'ellipse') t = 1 / Math.sqrt(Math.pow(ux / (sh.rx + pad), 2) + Math.pow(uy / (sh.ry + pad), 2));
    else if (sh.k === 'rect') {
      var hw = sh.w / 2 + pad, hh = sh.h / 2 + pad;
      t = Math.min(ux ? hw / Math.abs(ux) : Infinity, uy ? hh / Math.abs(uy) : Infinity);
    } else t = pad;
    return { x: sh.cx + ux * t, y: sh.cy + uy * t };
  }

  function marker(svg, color, head) {
    svg.__dMarkers = svg.__dMarkers || {};
    var key = color + '|' + head;
    if (svg.__dMarkers[key]) return svg.__dMarkers[key];
    var defs = svg.querySelector('defs') || svg.insertBefore(document.createElementNS(NS, 'defs'), svg.firstChild);
    var id = 'd-ah-' + Math.random().toString(36).slice(2, 8);
    var m = document.createElementNS(NS, 'marker');
    m.setAttribute('id', id);
    m.setAttribute('viewBox', '0 0 10 10');
    m.setAttribute('refX', '1');            // base of the head sits 1/10 behind the line end (no hairline gap)
    m.setAttribute('refY', '5');
    m.setAttribute('markerWidth', head);
    m.setAttribute('markerHeight', head);
    m.setAttribute('markerUnits', 'strokeWidth');
    m.setAttribute('orient', 'auto-start-reverse');
    var tri = document.createElementNS(NS, 'path');
    tri.setAttribute('d', 'M0,0 L10,5 L0,10 z');
    tri.style.fill = color;
    m.appendChild(tri);
    defs.appendChild(m);
    return (svg.__dMarkers[key] = id);
  }

  function quad(p0, p1, p2, t) {
    var a = (1 - t) * (1 - t), b = 2 * (1 - t) * t, c = t * t;
    return { x: a * p0.x + b * p1.x + c * p2.x, y: a * p0.y + b * p1.y + c * p2.y };
  }
  // Control point of the sub-curve [a, b] of a quadratic Bézier (blossom).
  function blossom(p0, p1, p2, a, b) {
    var w0 = (1 - a) * (1 - b), w1 = (1 - a) * b + a * (1 - b), w2 = a * b;
    return { x: w0 * p0.x + w1 * p1.x + w2 * p2.x, y: w0 * p0.y + w1 * p1.y + w2 * p2.y };
  }
  // Parameter t at which the remaining arc length to the end (fromEnd) or from the start equals len.
  function tAtLength(p0, p1, p2, len, fromEnd) {
    var N = 96, pts = [], acc = [0];
    for (var i = 0; i <= N; i++) pts.push(quad(p0, p1, p2, i / N));
    for (i = 1; i <= N; i++) acc.push(acc[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
    var total = acc[N], target = fromEnd ? total - len : len;
    for (i = 1; i <= N; i++) if (acc[i] >= target) {
      var f = (target - acc[i - 1]) / ((acc[i] - acc[i - 1]) || 1);
      return (i - 1 + f) / N;
    }
    return fromEnd ? 1 : 0;
  }

  function arrow(svg, from, to, o) {
    o = o || {};
    var color = o.color || 'var(--ink-2)', sw = o.width || 2, head = o.head || 5;
    var gap = o.gap == null ? 4 : o.gap, curve = o.curve || 0, both = !!o.both;
    var A0 = shapeOf(from), B0 = shapeOf(to);
    var ca = { x: A0.cx, y: A0.cy }, cb = { x: B0.cx, y: B0.cy };
    var dist = Math.hypot(cb.x - ca.x, cb.y - ca.y) || 1;
    var ctrl = null;
    if (curve) {
      var mx = (ca.x + cb.x) / 2, my = (ca.y + cb.y) / 2;
      ctrl = { x: mx - (cb.y - ca.y) / dist * curve * dist, y: my + (cb.x - ca.x) / dist * curve * dist };
    }
    var A = boundary(A0, ctrl || cb, gap), B = boundary(B0, ctrl || ca, gap);
    var L = 0.9 * head * sw;                // the part of the head ahead of the line end
    var p = document.createElementNS(NS, 'path'), d;
    if (!ctrl) {
      var len = Math.hypot(B.x - A.x, B.y - A.y) || 1, ux = (B.x - A.x) / len, uy = (B.y - A.y) / len;
      var trimE = Math.min(L, len / (both ? 3 : 2)), trimS = both ? trimE : 0;
      d = 'M' + (A.x + ux * trimS).toFixed(2) + ',' + (A.y + uy * trimS).toFixed(2) +
          'L' + (B.x - ux * trimE).toFixed(2) + ',' + (B.y - uy * trimE).toFixed(2);
    } else {
      var t1 = tAtLength(A, ctrl, B, L, true), t0 = both ? tAtLength(A, ctrl, B, L, false) : 0;
      var s = quad(A, ctrl, B, t0), e = quad(A, ctrl, B, t1), c = blossom(A, ctrl, B, t0, t1);
      d = 'M' + s.x.toFixed(2) + ',' + s.y.toFixed(2) + 'Q' + c.x.toFixed(2) + ',' + c.y.toFixed(2) + ' ' + e.x.toFixed(2) + ',' + e.y.toFixed(2);
    }
    p.setAttribute('d', d);
    p.setAttribute('fill', 'none');
    p.style.stroke = color;
    p.style.strokeWidth = sw;
    p.style.strokeLinecap = 'butt';
    if (o.dashed) p.style.strokeDasharray = (sw * 3) + ' ' + (sw * 2.5);
    if (o.className) p.setAttribute('class', o.className);
    var id = marker(svg, color, head);
    p.setAttribute('marker-end', 'url(#' + id + ')');
    if (both) p.setAttribute('marker-start', 'url(#' + id + ')');
    (o.parent || svg).appendChild(p);
    return p;
  }

  function label(svg, x, y, text, o) {
    o = o || {};
    var t = document.createElementNS(NS, 'text');
    t.setAttribute('x', x); t.setAttribute('y', y);
    t.setAttribute('text-anchor', o.anchor || 'middle');
    t.setAttribute('dominant-baseline', o.baseline || 'middle');
    t.setAttribute('class', 'd-label d-halo' + (o.strong ? ' d-label-strong' : '') + (o.className ? ' ' + o.className : ''));
    if (o.color) t.style.fill = o.color;
    t.textContent = text;
    (o.parent || svg).appendChild(t);
    return t;
  }

  // Label a path at fraction f of its length, offset along the normal (positive = left of travel).
  function labelAlong(path, f, text, o) {
    o = o || {};
    var L = path.getTotalLength(), p = path.getPointAtLength(L * f), q = path.getPointAtLength(Math.min(L, L * f + 1));
    var dx = q.x - p.x, dy = q.y - p.y, n = Math.hypot(dx, dy) || 1, off = o.offset == null ? 10 : o.offset;
    return label(path.ownerSVGElement, p.x - dy / n * off, p.y + dx / n * off, text, o);
  }

  window.Didactician = Object.assign(window.Didactician || {}, { arrow: arrow, label: label, labelAlong: labelAlong });
})();
