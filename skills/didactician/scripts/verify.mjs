#!/usr/bin/env node
// Didactician invariant gate. Renders site/ in headless Chromium at several widths and checks what a
// machine can check. Pedagogy, accuracy and taste are the reviewers' job, not this script's.
//
//   node verify.mjs --out <out> [--widget <id>] [--phase page] [--widths 360,768,1280] [--round N]
//
// --phase page: for the page builder before widget builders have run. Widgets whose
//   site/widgets/<id>/ directory doesn't exist yet are "pending": their 404s and empty mounts
//   are reported as info, not failures. Never use it for the final gate.
//
// Writes run/gate/<page|widget-id>-round-N.json, screenshots in run/screenshots/<scope>-round-N/,
// appends to run/log.md and state.json's gate_history (for round_gate's no-progress rule).
// Exit 0 = all gated checks pass; 1 = at least one fails; 2 = usage/setup error.
//
// Checks (fail = gated):
//   overflow     I1  no horizontal overflow (widths < 1024 skipped if the brief records a mobile waiver)
//   static       I2  no fetch/XHR/WebSocket/EventSource/beacon to origins not declared in widgets/manifest.json
//   media        I3  third-party media is cleared (licence, or approved in decisions.md) and attributed visibly
//   replay       I4  finite animations ≥ 1.5s (or marked data-anim="once") have a [data-replay] control nearby
//   carousel     I6  [data-carousel] keeps the same height across pages
//   markers      I7  SVG markers resolve, aren't clipped by their own marker box, and stay inside the SVG
//   relative     —   no root-absolute URLs (the folder must work under any sub-path)
//   console      —   no console errors or uncaught exceptions
//   resources    —   every requested resource loads
//   placeholders —   no TODO/lorem/[placeholder] text, no empty widget mount points
//   legibility   —   (warn only) SVG text rendered below 11px, typically a desktop viewBox scaled onto a phone
//   report       —   (info) reading time, page weight, request count
import fs from 'node:fs';
import path from 'node:path';
import { args, blocks, kv, loadPlaywright, logAppend, readIf, serve } from './lib/pw.mjs';

const A = args(process.argv.slice(2));
if (!A.out) { console.error('usage: verify.mjs --out <out> [--widget <id>] [--widths 360,768,1280]'); process.exit(2); }
const out = path.resolve(A.out);
const site = path.join(out, 'site');
const run = path.join(out, 'run');
if (!fs.existsSync(path.join(site, 'index.html'))) { console.error(`no ${site}/index.html`); process.exit(2); }
const widget = typeof A.widget === 'string' ? A.widget : null;
const scopeKey = widget || 'page';
const scopeSel = widget ? `[data-widget="${widget}"]` : 'body';
const pagePhase = A.phase === 'page';
const isPending = (id) => pagePhase && !fs.existsSync(path.join(site, 'widgets', id));
const pendingUrl = (u) => { const m = String(u).match(/\/widgets\/(w-[^/]+)\//); return !!(m && isPending(m[1])); };
const widths = String(A.widths || '360,768,1280').split(',').map(Number);
const WPM = 230;
const FLAIR_MS = 1500;

const gateDir = path.join(run, 'gate');
fs.mkdirSync(gateDir, { recursive: true });
const prior = fs.readdirSync(gateDir).map((f) => f.match(new RegExp(`^${scopeKey}-round-(\\d+)\\.json$`))).filter(Boolean).map((m) => +m[1]);
const round = A.round ? +A.round : (prior.length ? Math.max(...prior) + 1 : 1);
const shotDir = path.join(run, 'screenshots', `${scopeKey}-round-${round}`);
fs.mkdirSync(shotDir, { recursive: true });

// ---- run files ------------------------------------------------------------------------------
const brief = kv(readIf(path.join(run, 'brief.md')));
const mobileWaived = /^waived/i.test(brief.mobile || '');
const budget = parseFloat(brief.time_budget_minutes) || null;
let manifest = {};
try { manifest = JSON.parse(readIf(path.join(site, 'widgets', 'manifest.json')) || '{}'); } catch (e) {
  manifest = { _error: e.message };
}
const toOrigin = (u) => { try { return new URL(u).origin; } catch { return u; } };
const dataOrigins = new Set([
  ...(manifest.data_origins || []),
  ...Object.values(manifest.widgets || {}).flatMap((w) => w.data_origins || []),
].map(toOrigin));
const assets = blocks(readIf(path.join(run, 'research', 'assets.md')), 'a-\\d+');
const decisions = blocks(readIf(path.join(run, 'decisions.md')), 'd-\\d+');
const assetDecision = {};
for (const { f } of decisions) {
  const m = (f.applies_to || '').match(/asset\s+(a-\d+)/);
  if (m) assetDecision[m[1]] = (f.decision || '').trim();
}

// ---- results --------------------------------------------------------------------------------
const checks = {};
const def = (id, invariant, title) => (checks[id] = { id, invariant, title, status: 'pass', details: [] });
def('overflow', 'I1', 'No horizontal overflow');
def('static', 'I2', 'Static only: no runtime calls to undeclared origins');
def('media', 'I3', 'Third-party media cleared and attributed');
def('replay', 'I4', 'Finite animations have replay');
def('carousel', 'I6', 'Carousels do not reflow');
def('markers', 'I7', 'SVG markers resolve and are not clipped');
def('relative', '—', 'Relative URLs only');
def('console', '—', 'No console errors');
def('resources', '—', 'All resources load');
def('placeholders', '—', 'No placeholders or empty mounts');
def('legibility', '—', 'SVG/canvas text readable at this width (warn only)');
def('pending', '—', 'Widgets not built yet (page phase only)');
// Identical issues seen at several widths collapse into one line: "[360, 768px] …".
const seen = {};
const add = (id, d) => {
  const m = d.match(/^\[(\d+)px\]\s*/);
  const key = `${id}|${m ? d.slice(m[0].length) : d}`;
  if (seen[key]) {
    if (m && !seen[key].w.includes(m[1])) seen[key].w.push(m[1]);
    const i = checks[id].details.indexOf(seen[key].text);
    seen[key].text = (seen[key].w.length ? `[${seen[key].w.join(', ')}px] ` : '') + seen[key].body;
    checks[id].details[i] = seen[key].text;
    return;
  }
  const body = (m ? d.slice(m[0].length) : d).replace(/\s+/g, ' ');
  seen[key] = { w: m ? [m[1]] : [], body, text: (m ? `[${m[1]}px] ` : '') + body };
  checks[id].details.push(seen[key].text);
};
const fail = (id, d) => { checks[id].status = 'fail'; add(id, d); };
const warn = (id, d) => { if (checks[id].status === 'pass') checks[id].status = 'warn'; add(id, d); };
const report = { widths, reading_minutes: null, budget_minutes: budget, weight_kb: null, requests: null };
if (manifest._error) fail('resources', `site/widgets/manifest.json is not valid JSON: ${manifest._error}`);

// ---- static scan: root-absolute URLs ----------------------------------------------------------
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? (e.name === 'node_modules' ? [] : walk(path.join(dir, e.name))) : [path.join(dir, e.name)]);
}
const absPatterns = {
  '.html': /\b(?:src|href|poster|action|data|srcset)\s*=\s*["']\/(?!\/)/g,
  '.css': /url\(\s*["']?\/(?!\/)/g,
  '.js': /(?:\bfrom\s*|\bimport\s*\(\s*|\bfetch\s*\(\s*)["'`]\/(?!\/)/g,
  '.mjs': /(?:\bfrom\s*|\bimport\s*\(\s*|\bfetch\s*\(\s*)["'`]\/(?!\/)/g,
};
for (const file of walk(widget ? path.join(site, 'widgets', widget) : site)) {
  const re = absPatterns[path.extname(file)];
  if (!re) continue;
  const text = fs.readFileSync(file, 'utf8');
  for (const m of text.matchAll(re)) {
    const line = text.slice(0, m.index).split('\n').length;
    fail('relative', `${path.relative(out, file)}:${line} root-absolute URL (${text.slice(m.index, m.index + 40).split('\n')[0].trim()}…); use a relative path`);
  }
}

// ---- in-page probes ---------------------------------------------------------------------------
const INIT = `
(() => {
  const sel = (el, depth = 0) => {
    if (!el || !el.tagName) return '';
    if (el.id) return '#' + el.id;
    let s = el.tagName.toLowerCase();
    const cls = el.getAttribute && el.getAttribute('class');
    if (cls) s += '.' + cls.trim().split(/\\s+/).slice(0, 2).join('.');
    const p = el.parentElement;
    if (p && depth < 3 && p !== document.body) {
      const i = [...p.children].indexOf(el) + 1;
      return sel(p, depth + 1) + ' > ' + s + ':nth-child(' + i + ')';
    }
    return s;
  };
  window.__didSel = sel;
  window.__didAnims = new Map();
  const poll = () => {
    try {
      for (const a of document.getAnimations()) {
        if (a.constructor.name === 'CSSTransition' || window.__didAnims.has(a)) continue;
        const e = a.effect; if (!e || !e.getComputedTiming) continue;
        const t = e.getComputedTiming();
        window.__didAnims.set(a, { iterations: t.iterations, active: t.activeDuration, name: a.animationName || a.id || '', target: e.target || null });
      }
    } catch (_) {}
  };
  setInterval(poll, 100);
  document.addEventListener('DOMContentLoaded', poll);
})();`;

function pageOverflow(scope) {
  const vw = window.innerWidth;
  const doc = document.documentElement.scrollWidth > vw + 1;
  const clipped = (el) => {
    for (let p = el.parentElement; p && p !== document.body && p !== document.documentElement; p = p.parentElement) {
      const ox = getComputedStyle(p).overflowX;
      if (ox !== 'visible') return true;
    }
    return false;
  };
  const root = document.querySelector(scope) || document.body;
  const offenders = [];
  if (doc || scope !== 'body') {
    for (const el of root.querySelectorAll('*')) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if ((r.right > vw + 1 || r.left < -1) && !clipped(el)) offenders.push({ sel: window.__didSel(el), right: Math.round(r.right), left: Math.round(r.left) });
    }
  }
  const leaves = offenders.filter((o, i) => !offenders.some((p, j) => j > i && p.sel.startsWith(o.sel + ' >')));
  return { doc, scrollWidth: document.documentElement.scrollWidth, vw, offenders: leaves.slice(0, 6) };
}

function markerIssues(scope) {
  const root = document.querySelector(scope) || document;
  const issues = [];
  const endpoint = (el, start) => {
    const tag = el.tagName.toLowerCase();
    let p0, p1;
    if (tag === 'path') {
      const L = el.getTotalLength();
      if (!(L > 0)) return null;
      if (start) { p0 = el.getPointAtLength(0); p1 = el.getPointAtLength(Math.min(0.5, L)); return { x: p0.x, y: p0.y, a: Math.atan2(p1.y - p0.y, p1.x - p0.x) }; }
      p0 = el.getPointAtLength(Math.max(L - 0.5, 0)); p1 = el.getPointAtLength(L);
      return { x: p1.x, y: p1.y, a: Math.atan2(p1.y - p0.y, p1.x - p0.x) };
    }
    if (tag === 'line') {
      const x1 = el.x1.baseVal.value, y1 = el.y1.baseVal.value, x2 = el.x2.baseVal.value, y2 = el.y2.baseVal.value;
      const a = Math.atan2(y2 - y1, x2 - x1);
      return start ? { x: x1, y: y1, a } : { x: x2, y: y2, a };
    }
    if (tag === 'polyline' || tag === 'polygon') {
      const pts = el.points; const n = pts.numberOfItems; if (n < 2) return null;
      const g = (i) => pts.getItem(i);
      if (start) { const a = g(0), b = g(1); return { x: a.x, y: a.y, a: Math.atan2(b.y - a.y, b.x - a.x) }; }
      const a = g(n - 2), b = g(n - 1); return { x: b.x, y: b.y, a: Math.atan2(b.y - a.y, b.x - a.x) };
    }
    return null;
  };
  for (const el of root.querySelectorAll('path, line, polyline, polygon')) {
    if (el.closest('marker, defs, symbol, clipPath, mask, pattern')) continue;
    const cs = getComputedStyle(el);
    for (const prop of ['marker-start', 'marker-mid', 'marker-end']) {
      const v = cs.getPropertyValue(prop);
      if (!v || v === 'none') continue;
      const m = v.match(/url\(\s*["']?(?:[^#"')]*)#([^"')]+)["']?\s*\)/);
      const mk = m && document.getElementById(m[1]);
      if (!mk || mk.tagName.toLowerCase() !== 'marker') { issues.push(`${window.__didSel(el)}: ${prop} → ${v} does not resolve to a <marker>`); continue; }
      if (prop === 'marker-mid') continue;
      const start = prop === 'marker-start';
      const g = endpoint(el, start);
      const svg = el.ownerSVGElement; const ctm = el.getScreenCTM();
      if (!g || !svg || !ctm) continue;
      const sw = parseFloat(cs.strokeWidth) || 1;
      const unitScale = (mk.getAttribute('markerUnits') || 'strokeWidth') === 'strokeWidth' ? sw : 1;
      const mw = mk.markerWidth.baseVal.value, mh = mk.markerHeight.baseVal.value;
      const vb = mk.viewBox && mk.viewBox.baseVal;
      const hasVB = vb && vb.width > 0 && vb.height > 0;
      const s = hasVB ? Math.min(mw / vb.width, mh / vb.height) : 1;
      const refX = mk.refX.baseVal.value, refY = mk.refY.baseVal.value;
      let bb = null;
      for (const c of mk.children) {
        try { const b = c.getBBox(); if (!b.width && !b.height) continue;
          bb = bb ? { x1: Math.min(bb.x1, b.x), y1: Math.min(bb.y1, b.y), x2: Math.max(bb.x2, b.x + b.width), y2: Math.max(bb.y2, b.y + b.height) }
                  : { x1: b.x, y1: b.y, x2: b.x + b.width, y2: b.y + b.height }; } catch (_) {}
      }
      if (!bb) continue;
      const clip = hasVB ? { x1: vb.x, y1: vb.y, x2: vb.x + vb.width, y2: vb.y + vb.height } : { x1: 0, y1: 0, x2: mw, y2: mh };
      const ov = (mk.getAttribute('overflow') || getComputedStyle(mk).overflow || '').includes('visible');
      const name = `${window.__didSel(el)} ${prop} #${m[1]}`;
      if (!ov && (bb.x1 < clip.x1 - 0.5 || bb.y1 < clip.y1 - 0.5 || bb.x2 > clip.x2 + 0.5 || bb.y2 > clip.y2 + 0.5)) {
        issues.push(`${name}: marker content (${bb.x1.toFixed(1)},${bb.y1.toFixed(1)})–(${bb.x2.toFixed(1)},${bb.y2.toFixed(1)}) exceeds its ${hasVB ? 'viewBox' : 'markerWidth/Height box'} (${clip.x1},${clip.y1})–(${clip.x2},${clip.y2}); the arrowhead is cut off. Fit viewBox to the shape or set overflow="visible"`);
      }
      const orient = mk.getAttribute('orient') || '0';
      let ang = orient === 'auto' ? g.a : orient === 'auto-start-reverse' ? (start ? g.a + Math.PI : g.a) : (parseFloat(orient) || 0) * Math.PI / 180;
      const draw = ov ? bb : { x1: Math.max(bb.x1, clip.x1), y1: Math.max(bb.y1, clip.y1), x2: Math.min(bb.x2, clip.x2), y2: Math.min(bb.y2, clip.y2) };
      const sr = svg.getBoundingClientRect();
      if (getComputedStyle(svg).overflow.includes('visible') && svg !== document.documentElement) continue;
      const cos = Math.cos(ang), sin = Math.sin(ang);
      let worst = 0;
      for (const [px, py] of [[draw.x1, draw.y1], [draw.x2, draw.y1], [draw.x1, draw.y2], [draw.x2, draw.y2]]) {
        const lx = (px - refX) * s * unitScale, ly = (py - refY) * s * unitScale;
        const ux = g.x + lx * cos - ly * sin, uy = g.y + lx * sin + ly * cos;
        const sx = ctm.a * ux + ctm.c * uy + ctm.e, sy = ctm.b * ux + ctm.d * uy + ctm.f;
        worst = Math.max(worst, sr.left - sx, sx - sr.right, sr.top - sy, sy - sr.bottom);
      }
      if (worst > 1) issues.push(`${name}: arrowhead extends ${worst.toFixed(1)}px outside the <svg> box (clipped). Pad the viewBox or shorten the path`);
    }
  }
  return issues;
}

function replayIssues(scope) {
  const root = document.querySelector(scope) || document.body;
  const needs = [];
  for (const info of window.__didAnims.values()) {
    const t = info.target;
    if (!t || !root.contains(t) || !Number.isFinite(info.iterations)) continue;
    if (t.closest('[data-anim="flair"], [data-anim="loop"]')) continue;
    if (info.active >= 1500) needs.push({ el: t, why: `${info.name || 'animation'} runs ${Math.round(info.active)}ms once` });
  }
  for (const el of root.querySelectorAll('animate, animateTransform, animateMotion, set')) {
    const rc = el.getAttribute('repeatCount'); const rd = el.getAttribute('repeatDur');
    if (rc === 'indefinite' || rd === 'indefinite') continue;
    const dur = parseFloat(el.getAttribute('dur') || '0') * (/(ms)$/.test(el.getAttribute('dur') || '') ? 1 : 1000);
    if (dur * (parseFloat(rc) || 1) >= 1500 && !el.closest('[data-anim="flair"], [data-anim="loop"]')) needs.push({ el: el.parentElement, why: `SMIL <${el.tagName}> ${Math.round(dur)}ms` });
  }
  for (const el of root.querySelectorAll('[data-anim="once"]')) needs.push({ el, why: 'data-anim="once"' });
  const seen = new Set(); const issues = [];
  for (const { el, why } of needs) {
    const box = el.closest('[data-anim-scope], figure, [data-widget], section, article') || document.body;
    if (seen.has(box)) continue; seen.add(box);
    const ctl = box.querySelector('[data-replay]');
    const visible = ctl && (ctl.offsetParent !== null || getComputedStyle(ctl).position === 'fixed');
    if (!visible) issues.push(`${window.__didSel(el)} (${why}): no visible [data-replay] control within ${window.__didSel(box)}`);
  }
  return issues;
}

function tinyText(scope) {
  const root = document.querySelector(scope) || document.body;
  const out = [];
  for (const svg of root.querySelectorAll('svg')) {
    const r = svg.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    let min = Infinity, sample = '';
    for (const t of svg.querySelectorAll('text')) {
      if (!t.textContent.trim() || !t.getClientRects().length) continue;
      const m = t.getScreenCTM(); if (!m) continue;
      const px = parseFloat(getComputedStyle(t).fontSize) * Math.hypot(m.a, m.b);
      if (px < min) { min = px; sample = t.textContent.trim().slice(0, 24); }
    }
    if (min < 11) out.push(`${window.__didSel(svg)}: text renders at ${min.toFixed(1)}px ("${sample}"); re-layout for narrow screens (graphics.md "Mobile diagrams")`);
  }
  return out;
}

async function carouselResults(scope) {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const root = document.querySelector(scope) || document;
  const res = [];
  for (const c of root.querySelectorAll('[data-carousel]')) {
    const name = window.__didSel(c);
    const n = c.querySelectorAll('[data-carousel-page]').length;
    if (n < 2) continue;
    const gotos = [...c.querySelectorAll('[data-carousel-goto]')];
    const next = c.querySelector('[data-carousel-next]');
    c.scrollIntoView({ block: 'center' }); await wait(250);
    const hs = [c.getBoundingClientRect().height];
    if (gotos.length >= n) { for (let i = 1; i < n; i++) { gotos[i].click(); await wait(450); hs.push(c.getBoundingClientRect().height); } gotos[0].click(); }
    else if (next) { for (let i = 1; i < n; i++) { next.click(); await wait(450); hs.push(c.getBoundingClientRect().height); } }
    else { res.push({ name, kind: 'no-controls', n }); continue; }
    await wait(300);
    const spread = Math.max(...hs) - Math.min(...hs);
    res.push({ name, kind: spread > 1 ? 'reflow' : 'ok', n, heights: hs.map(Math.round), numbered: gotos.length >= n });
  }
  return res;
}

function contentProbe(scope) {
  const root = document.querySelector(scope) || document.body;
  const text = root.innerText || '';
  const hits = [];
  for (const re of [/\bTODO\b/, /\bTBD\b/, /\bFIXME\b/, /lorem ipsum/i, /\[placeholder\]/i, /\bPLACEHOLDER\b/]) {
    const m = text.match(re);
    if (m) hits.push(`"${text.slice(Math.max(0, m.index - 30), m.index + 40).replace(/\s+/g, ' ').trim()}"`);
  }
  const empty = [...root.querySelectorAll('[data-widget]')].filter((w) => !w.childElementCount && !w.shadowRoot && !w.textContent.trim()).map((w) => w.getAttribute('data-widget'));
  if (root.matches && root.matches('[data-widget]') && !root.childElementCount && !root.shadowRoot) empty.push(root.getAttribute('data-widget'));
  const media = [];
  for (const el of root.querySelectorAll('img, video, audio, iframe, source, embed, object, image')) {
    const url = el.currentSrc || el.getAttribute('src') || el.getAttribute('data') || el.getAttribute('href') || el.getAttribute('xlink:href') || (el.getAttribute('srcset') || '').split(/[\s,]/)[0] || el.getAttribute('poster') || '';
    if (!url || /^(data|blob):/.test(url)) continue;
    let abs; try { abs = new URL(url, location.href).href; } catch { abs = url; }
    media.push({ tag: el.tagName.toLowerCase(), url: abs, asset: el.closest('[data-asset]')?.getAttribute('data-asset') || null, sel: window.__didSel(el) });
  }
  for (const el of root.querySelectorAll('[data-asset]')) {
    if (!el.matches('img, video, audio, iframe, source, embed, object, image') && !el.querySelector('img, video, audio, iframe, source, embed, object, image'))
      media.push({ tag: el.tagName.toLowerCase(), url: null, asset: el.getAttribute('data-asset'), sel: window.__didSel(el) });
  }
  const main = document.querySelector('main') || document.querySelector('article') || document.body;
  const words = (main.innerText || '').split(/\s+/).filter(Boolean).length;
  return { hits, empty, media, words, pageText: document.body.innerText || '', mounted: !!document.querySelector(scope) };
}

// ---- run the browser --------------------------------------------------------------------------
const { chromium } = loadPlaywright();
const server = await serve(site);
const browser = await chromium.launch();
let totalBytes = 0, requestCount = 0, lastContent = null;

try {
  for (const width of widths) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
    await ctx.addInitScript(INIT);
    const page = await ctx.newPage();
    const measure = width === Math.max(...widths);
    page.on('console', (m) => {
      if (m.type() !== 'error') return;
      if (pagePhase && (/status of 404/.test(m.text()) || /no mount|widgets\/w-/.test(m.text())) && pendingUrl(m.location()?.url || '')) return;
      fail('console', `[${width}px] ${m.text().slice(0, 300)}`);
    });
    page.on('pageerror', (e) => fail('console', `[${width}px] uncaught: ${String(e.message || e).slice(0, 300)}`));
    page.on('requestfailed', (r) => pendingUrl(r.url()) ? warn('pending', `${r.url()} not built yet`) : fail('resources', `[${width}px] ${r.url()} (${r.failure()?.errorText || 'failed'})`));
    const checkData = (type, url) => {
      const o = toOrigin(url);
      if (o !== server.origin && !dataOrigins.has(o))
        fail('static', `[${width}px] ${type} ${url}: runtime data call to an undeclared origin. Declare it in site/widgets/manifest.json "data_origins" only if the user asked for live data; otherwise vendor the data into site/`);
    };
    page.on('request', (r) => {
      if (measure) requestCount++;
      const t = r.resourceType();
      if (['fetch', 'xhr', 'eventsource', 'websocket', 'ping'].includes(t)) checkData(t, r.url());
    });
    page.on('websocket', (ws) => checkData('websocket', ws.url()));
    page.on('response', async (r) => {
      if (r.status() >= 400) pendingUrl(r.url()) ? warn('pending', `${r.url()} not built yet`) : fail('resources', `[${width}px] ${r.url()} → HTTP ${r.status()}`);
      if (measure) { try { totalBytes += (await r.body()).length; } catch (_) {} }
    });

    await page.goto(server.base + 'index.html', { waitUntil: 'load', timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
    await page.evaluate(async () => {
      const wait = (ms) => new Promise((r) => setTimeout(r, ms));
      const h = document.documentElement.scrollHeight;
      for (let y = 0; y < h; y += Math.round(innerHeight * 0.7)) { scrollTo(0, y); await wait(200); }
      scrollTo(0, document.documentElement.scrollHeight); await wait(300);
      scrollTo(0, 0); await wait(300);
    });

    if (widget && !(await page.evaluate((s) => !!document.querySelector(s), scopeSel))) {
      fail('placeholders', `no element ${scopeSel} on index.html; the page builder must create the mount point`);
      await ctx.close();
      continue;
    }

    const ov = await page.evaluate(pageOverflow, scopeSel);
    const waived = mobileWaived && width < 1024;
    if (ov.doc || (widget && ov.offenders.length)) {
      const msg = `[${width}px] ${ov.doc ? `page scrollWidth ${ov.scrollWidth} > viewport ${ov.vw}` : 'widget extends past the viewport'}; offenders: ${ov.offenders.map((o) => `${o.sel} (right ${o.right})`).join('; ') || 'n/a'}`;
      waived ? warn('overflow', msg + ' (mobile waived)') : fail('overflow', msg);
    }
    for (const i of await page.evaluate(markerIssues, scopeSel)) fail('markers', `[${width}px] ${i}`);
    for (const i of await page.evaluate(replayIssues, scopeSel)) fail('replay', `[${width}px] ${i}`);
    for (const i of await page.evaluate(tinyText, scopeSel)) warn('legibility', `[${width}px] ${i}`);
    for (const c of await page.evaluate(carouselResults, scopeSel)) {
      if (c.kind === 'reflow') fail('carousel', `[${width}px] ${c.name}: height changes across ${c.n} pages ${JSON.stringify(c.heights)}; reserve the tallest page's height`);
      if (c.kind === 'no-controls') warn('carousel', `[${width}px] ${c.name}: ${c.n} pages but no [data-carousel-goto] / [data-carousel-next] controls found`);
      if (c.kind === 'ok' && !c.numbered) warn('carousel', `[${width}px] ${c.name}: no numbered page controls (default: ‹ 1 2 3 ›)`);
    }
    const content = await page.evaluate(contentProbe, scopeSel);
    lastContent = content;

    const shot = path.join(shotDir, `${widget ? widget + '-' : ''}w${width}.png`);
    if (widget) await page.locator(scopeSel).first().screenshot({ path: shot }).catch(() => {});
    else await page.screenshot({ path: shot, fullPage: true });
    await ctx.close();
  }
} finally {
  await browser.close();
  await server.close();
}

// ---- post-render checks (from the widest run) ---------------------------------------------------
for (const p of new Set(server.outside)) fail('relative', `request to ${p} outside the site folder: a root-absolute URL, which breaks on sub-path hosting`);
if (lastContent) {
  for (const h of lastContent.hits) fail('placeholders', `placeholder text ${h}`);
  for (const e of lastContent.empty) isPending(e) ? warn('pending', `mount [data-widget="${e}"] awaits its widget builder`) : fail('placeholders', `empty widget mount point [data-widget="${e}"]`);
  const norm = (s) => (s || '').toLowerCase().replace(/\s+/g, ' ').trim();
  const pageText = norm(lastContent.pageText);
  for (const m of lastContent.media) {
    const thirdParty = m.url && toOrigin(m.url) !== server.origin;
    let entry = m.asset ? assets.find((a) => a.id === m.asset) : null;
    if (!entry && m.url) entry = assets.find((a) => a.f.url && (m.url === a.f.url || m.url.startsWith(a.f.url) || a.f.url.startsWith(m.url)));
    if (!entry) {
      if (thirdParty) fail('media', `${m.sel} loads third-party ${m.tag} ${m.url} with no entry in run/research/assets.md (add data-asset="a-NN")`);
      else if (m.asset) fail('media', `${m.sel} has data-asset="${m.asset}" but assets.md has no ${m.asset}`);
      continue;
    }
    const cl = (entry.f.clearance || '').trim();
    const dec = assetDecision[entry.id];
    if (dec === 'rejected') fail('media', `${m.sel} uses ${entry.id}, which the user rejected (decisions.md)`);
    else if (cl !== 'license' && dec !== 'approved') fail('media', `${m.sel} uses ${entry.id} (clearance: ${cl || 'none'}) without a user approval in decisions.md`);
    if (entry.f.attribution && !pageText.includes(norm(entry.f.attribution)))
      fail('media', `${entry.id}: attribution "${entry.f.attribution}" is not visible on the page`);
  }
  report.reading_minutes = +(lastContent.words / WPM).toFixed(1);
}
report.weight_kb = Math.round(totalBytes / 1024);
report.requests = requestCount;

// ---- output -----------------------------------------------------------------------------------
const list = Object.values(checks);
const failing = list.filter((c) => c.status === 'fail');
const result = {
  scope: scopeKey, round, when: new Date().toISOString(), pass: failing.length === 0,
  checks: list, report,
  failing_ids: failing.map((c) => `${c.id}: ${c.details[0]?.replace(/\[\d+px\]\s*/, '').slice(0, 120)}`).sort(),
};
const jsonPath = path.join(gateDir, `${scopeKey}-round-${round}.json`);
fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2) + '\n');

const statePath = path.join(run, 'state.json');
if (fs.existsSync(statePath)) {
  const st = JSON.parse(fs.readFileSync(statePath, 'utf8'));
  const key = `gate:${scopeKey}`;
  (st.gate_history[key] ||= []).push(result.failing_ids);
  fs.writeFileSync(statePath, JSON.stringify(st, null, 2) + '\n');
}

const rel = (p) => path.relative(run, p);
const budgetNote = budget ? ` (brief: ~${budget} min; reported, not gated)` : '';
logAppend(run, 'verify', 'gate',
  `Gate (${scopeKey}) round ${round}: **${result.pass ? 'PASS' : 'FAIL'}**` +
  (failing.length ? ` (${failing.map((c) => `${c.id}${c.invariant !== '—' ? '/' + c.invariant : ''}`).join(', ')})` : '') +
  `. Reading ~${report.reading_minutes ?? '?'} min${budgetNote}; ${report.weight_kb} KB, ${report.requests} requests.`,
  [rel(jsonPath), rel(shotDir)]);

for (const c of list) {
  const mark = { pass: 'PASS', warn: 'warn', fail: 'FAIL' }[c.status];
  console.log(`${mark.padEnd(4)} ${c.id.padEnd(12)} ${c.invariant.padEnd(3)} ${c.title}`);
  for (const d of c.details.slice(0, 8)) console.log(`       - ${d}`);
  if (c.details.length > 8) console.log(`       … ${c.details.length - 8} more in ${jsonPath}`);
}
console.log(`info reading ~${report.reading_minutes ?? '?'} min (text only, ${WPM} wpm)${budgetNote} · ${report.weight_kb} KB · ${report.requests} requests`);
console.log(`screenshots: ${shotDir}`);
console.log(`RESULT: ${result.pass ? 'PASS' : 'FAIL'}  (${jsonPath})`);
process.exit(result.pass ? 0 : 1);
