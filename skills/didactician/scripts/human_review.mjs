#!/usr/bin/env node
// Human review: open the mockup or the built page in a visible browser with an annotation layer
// (vendored @reviewjs/annotate) and collect what the user marks up. Nothing is written into plan/ or
// site/: Playwright injects the layer, and a route catches "Send feedback", so no server is needed.
//
//   node human_review.mjs --out <out> --target plan|site [--note "<what to look at>"] [--round N]
//                         [--width 1280] [--height 900] [--headless] [--max-minutes 180] [--rewrite]
//
// Writes run/review/human-<target>-<N>/:
//   build/          a frozen copy of plan/ or site/ taken when the round opens; the review runs on it
//   comments.json   the annotate export (schema 2), saved every few seconds while the window is open,
//                   plus `didactician`: the text of each noted element, and the shots taken
//   comments.md     one `### #N` block per comment (the badge number in the browser)
//   shots/<id>.png  the screen at the moment a shape or pin was saved (text marks need no picture)
//   meta.json       round state, and the hash of build/
// The comments anchor to build/, so they stay meaningful after site/ is rebuilt, and any round can be
// reopened later exactly as it was reviewed. Ends when the user clicks "Send feedback" or closes the
// window. Without --round, an unsubmitted round is reopened with its comments in place; otherwise a
// new round starts. --rewrite regenerates comments.md for a saved round (the latest unless --round)
// without opening a window. Exit 0 if there are comments, 3 if there are none.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { args, loadPlaywright, logAppend, nowIso, serve } from './lib/pw.mjs';

const A = args(process.argv.slice(2));
if (!A.out || !['plan', 'site'].includes(A.target)) {
  console.error('usage: human_review.mjs --out <out> --target plan|site [--note "…"] [--round N] [--headless] [--rewrite]');
  process.exit(2);
}
const rewrite = !!A.rewrite;
const out = path.resolve(A.out);
const run = path.join(out, 'run');
const target = A.target;
const live = target === 'plan' ? path.join(run, 'plan') : path.join(out, 'site');
const entry = target === 'plan' ? 'mockup.html' : 'index.html';
const width = +(A.width || 1280);
const height = +(A.height || 900);
const maxMs = +(A['max-minutes'] || 180) * 60000;
const POST_URL = 'https://didactician.invalid/feedback';
const PROJECT = 'didactician';
const LAYER = fs.readFileSync(path.resolve(import.meta.dirname, '..', 'vendor', 'annotate', 'annotate.js'), 'utf8');

// Pick the round: explicit, else reopen the latest one that was never submitted, else the next.
const reviewDir = path.join(run, 'review');
const rounds = fs.existsSync(reviewDir)
  ? fs.readdirSync(reviewDir).map((d) => d.match(new RegExp(`^human-${target}-(\\d+)$`))).filter(Boolean).map((m) => +m[1])
  : [];
const latest = rounds.length ? Math.max(...rounds) : 0;
const readJson = (p) => { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; } };
const latestMeta = latest ? readJson(path.join(reviewDir, `human-${target}-${latest}`, 'meta.json')) : null;
const round = A.round ? +A.round : latest && (rewrite || !latestMeta?.submitted) ? latest : latest + 1;
const dir = path.join(reviewDir, `human-${target}-${round}`);
const build = path.join(dir, 'build');
const rel = (p) => path.relative(run, p);

// Hash of a directory's files, so a later stage can tell whether site/ moved on since the review.
function hashDir(root) {
  const h = crypto.createHash('sha256');
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name)).forEach((e) => {
    const p = path.join(d, e.name);
    if (e.isDirectory()) return walk(p);
    h.update(path.relative(root, p) + '\0').update(fs.readFileSync(p)).update('\0');
  });
  walk(root);
  return 'sha256:' + h.digest('hex');
}

if (rewrite && !fs.existsSync(path.join(dir, 'comments.json'))) {
  console.error(`nothing to rewrite: ${rel(dir)}/comments.json does not exist`);
  process.exit(2);
}
const meta = readJson(path.join(dir, 'meta.json')) || { target, round, started: nowIso() };
// Freeze what is under review the first time the round opens; every reopen serves the same copy.
if (!fs.existsSync(path.join(build, entry))) {
  if (!fs.existsSync(path.join(live, entry))) {
    console.error(`nothing to review: ${path.join(live, entry)} does not exist`);
    process.exit(2);
  }
  fs.mkdirSync(dir, { recursive: true });
  fs.cpSync(live, build, { recursive: true });
  meta.build = hashDir(build);
  meta.snapshotted = nowIso();
}
fs.mkdirSync(path.join(dir, 'shots'), { recursive: true });
const drifted = fs.existsSync(path.join(live, entry)) && hashDir(live) !== meta.build;

const saved = readJson(path.join(dir, 'comments.json'));
let comments = saved?.comments || [];
let exportMeta = saved || null;
// Ours, kept beside the export: the text of each element a note or shape points at, and the shots.
const extra = { targets: {}, shots: {}, ...(saved?.didactician || {}) };
const resumed = comments.length > 0;
// The session rewrites comments.json as it goes; keep what was there in case the reopen goes wrong.
if (resumed && !rewrite) fs.copyFileSync(path.join(dir, 'comments.json'), path.join(dir, 'comments.before-reopen.json'));

const note = A.note || (target === 'plan'
  ? 'This is the plan, not the finished page: check the objectives, the order of ideas, what is cut, and the check questions. The wording is a draft.'
  : 'Mark anything that is wrong, unclear, or not what you asked for. Highlight text, or circle a part of a figure or widget.') +
  ' Comments save as you go. "Send feedback" (or closing the window) ends the session; nothing moves on until you confirm you are finished.';

// Runs before the page's own scripts on every load: config, saved comments (first load only), the layer.
function initScript({ layer, config, seed, key }) {
  try { if (seed && !localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify({ comments: seed })); } catch {}
  window.AnnotateConfig = config;
  (0, eval)(layer);
}
const initArg = {
  layer: LAYER,
  key: `annotate:${PROJECT}`,
  seed: comments,
  config: { project: PROJECT, page: target, startOpen: true, note, postUrl: POST_URL, position: 'bottom-right' },
};

const { chromium } = loadPlaywright();
const server = await serve(build);
const url = server.base + entry;

function write() {
  const exp = { ...(exportMeta || {}), kind: 'annotate-export', schema: 2, page: target, comments, didactician: extra };
  fs.writeFileSync(path.join(dir, 'comments.json'), JSON.stringify(exp, null, 2) + '\n');
  fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify({ ...meta, count: comments.length }, null, 2) + '\n');
}

// Text of the elements that notes and shapes point at, read from the page while it is open.
// A selector alone means nothing to an agent; the words do.
const MAX_TARGET = 600;
async function readTargets(page) {
  const want = comments.filter((c) => c.geom?.selector && !(c.id in extra.targets));
  if (!want.length) return false;
  // A shape is drawn on part of an element, often a large one, and has its shot; a short excerpt is enough.
  const found = await page.evaluate((want) => Object.fromEntries(want.map(({ id, selector, max }) => {
    let el = null;
    try { el = document.querySelector(selector); } catch {}
    const t = el ? (el.innerText || el.getAttribute('aria-label') || el.textContent || '').replace(/\s+/g, ' ').trim() : null;
    return [id, t == null ? null : t.length > max ? t.slice(0, max) + '…' : t];
  })), want.map((c) => ({ id: c.id, selector: c.geom.selector, max: c.type === 'block' ? MAX_TARGET : 160 }))).catch(() => null);
  if (!found) return false;
  Object.assign(extra.targets, found);
  return true;
}

// ---- 1. The headed session ---------------------------------------------------------------------
let how = meta.how;
if (!rewrite) {
  let finish;
  const finished = new Promise((r) => { finish = r; });
  const browser = await chromium.launch({ headless: !!A.headless, args: A.headless ? [] : [`--window-size=${width},${height + 90}`] });
  browser.on('disconnected', () => finish('window closed'));
  const ctx = await browser.newContext({ viewport: A.headless ? { width, height } : null });
  await ctx.addInitScript(initScript, initArg);
  await ctx.route(POST_URL, async (route) => {
    try {
      const body = JSON.parse(route.request().postData() || '{}');
      if (Array.isArray(body.comments)) { comments = body.comments; exportMeta = body; }
    } catch {}
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
    finish('submitted');
  });
  const page = await ctx.newPage();
  page.on('close', () => finish('window closed'));
  await page.goto(url, { waitUntil: 'load' });
  if (resumed) {
    const loaded = await page.evaluate(() => window.Annotate?.comments?.().length ?? 0).catch(() => 0);
    if (loaded < comments.length)
      console.warn(`WARNING: only ${loaded} of ${comments.length} saved comment(s) loaded; the originals are in ${rel(dir)}/comments.before-reopen.json`);
  }

  console.log(`human review: ${target} round ${round}${resumed ? ` (reopened with ${comments.length} comment(s))` : ''}`);
  console.log(`  build:  ${rel(build)} (${meta.build.slice(0, 19)}…)${drifted ? `; ${target === 'plan' ? 'plan/' : 'site/'} has changed since, this is the copy that was reviewed` : ''}`);
  console.log(`  page:   ${url}`);
  console.log(`  saving: ${rel(dir)}/comments.json`);
  console.log('  ends when the user clicks "Send feedback" in the comments panel, or closes the window');

  // Save as the user goes, so closing the window loses nothing. A new shape or pin gets a picture of
  // the screen right then: the page is in the state the user drew on, so nothing has to be rebuilt.
  let busy = false;
  const poll = setInterval(async () => {
    if (busy) return;
    busy = true;
    try {
      const now = await page.evaluate(() => window.Annotate?.comments?.() ?? null);
      if (Array.isArray(now) && JSON.stringify(now) !== JSON.stringify(comments)) {
        comments = now;
        for (const c of comments) {
          if (!c.geom || c.type === 'block' || extra.shots[c.id]) continue;
          const shot = `shots/${c.id}.png`;
          // Hide the toolbar and panel for the shot; the marks are drawn outside them and stay.
          await page.evaluate(() => { const ui = document.getElementById('__an_root'); if (ui) ui.style.visibility = 'hidden'; });
          await page.screenshot({ path: path.join(dir, shot) }).finally(() =>
            page.evaluate(() => { const ui = document.getElementById('__an_root'); if (ui) ui.style.visibility = ''; }).catch(() => {}));
          extra.shots[c.id] = shot;
        }
        await readTargets(page);
        write();
      }
    } catch {}
    busy = false;
  }, 2000);
  const timer = setTimeout(() => finish(`timed out after ${A['max-minutes'] || 180} min`), maxMs);

  how = await finished;
  clearInterval(poll);
  clearTimeout(timer);
  if (how === 'submitted') {
    await readTargets(page);
    await new Promise((r) => setTimeout(r, 1200)); // let the "Feedback sent" toast show
  }
  await browser.close().catch(() => {});
  if (meta.submitted) {
    // A submitted round stays submitted; reopening it to add or answer comments is recorded beside it.
    (meta.reopened ||= []).push({ at: nowIso(), how });
    if (how === 'submitted') meta.ended = nowIso();
  } else {
    meta.ended = nowIso();
    meta.how = how;
    meta.submitted = how === 'submitted';
  }
}

// Notes whose element text wasn't read live (window closed first, or an older round): read it from
// the frozen build. That copy is what the user saw, so its selectors still point at the same element.
if (comments.some((c) => c.geom?.selector && !(c.id in extra.targets))) {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto(url, { waitUntil: 'load' }).catch(() => {});
  await readTargets(page);
  await browser.close();
}
await server.close();
// Drop shots of comments the user deleted.
for (const id of Object.keys(extra.shots)) {
  if (comments.some((c) => c.id === id)) continue;
  fs.rmSync(path.join(dir, extra.shots[id]), { force: true });
  delete extra.shots[id];
}
write();

// ---- 2. comments.md -------------------------------------------------------------------------------
// #N matches the numbered badges in the browser; findings.py gives each one an H- ID when it is ingested.
const ids = new Map(comments.map((c, i) => [c.id, `#${i + 1}`]));
const oneLine = (s) => String(s || '').replace(/\s+/g, ' ').trim();
const quoteBlock = (s) => String(s || '').trim().split('\n').map((l) => `> ${l}`).join('\n');
const md = [
  `# Human review: ${target}, round ${round}`,
  '',
  `_${meta.submitted ? 'Submitted' : `Ended (${how})`} ${meta.ended} · ${entry} · ${comments.length} comment(s). ` +
    `Reviewed on the frozen copy in \`build/\` (${meta.build}). Each block is the user's own words._`,
  '',
];
for (const c of comments) {
  md.push(`### ${ids.get(c.id)} · ${c.resolved ? 'resolved' : 'open'}`);
  md.push(`type: ${c.type}${c.geom?.kind && c.geom.kind !== c.type ? ` (${c.geom.kind})` : ''}`);
  if (c.anchor) {
    md.push(`quote: "${oneLine(c.anchor.exact)}"`);
    md.push(`context: …${oneLine(c.anchor.prefix)} [${oneLine(c.anchor.exact)}] ${oneLine(c.anchor.suffix)}…`);
  }
  if (c.geom?.selector) {
    const t = extra.targets[c.id];
    md.push(`on: ${t ? `"${t}"` : t === '' ? '(an element with no text)' : '(element not found in build/)'}`);
    md.push(`selector: \`${c.geom.selector}\``);
  }
  if (extra.shots[c.id]) md.push(`shot: ${extra.shots[c.id]}`);
  md.push('', c.text ? quoteBlock(c.text) : '> (no text; ask the user what this mark means)');
  for (const r of c.replies || []) md.push('', `reply (${r.author || 'reviewer'}):`, quoteBlock(r.text));
  md.push('');
}
fs.writeFileSync(path.join(dir, 'comments.md'), md.join('\n').trimEnd() + '\n');

const summary = `Human review of ${target} (round ${round}): ${comments.length} comment(s), ${meta.submitted ? 'submitted' : how}.`;
if (!rewrite) logAppend(run, 'user', 'human-review', summary, [rel(path.join(dir, 'comments.md')), rel(path.join(dir, 'comments.json'))]);
console.log(summary);
console.log(`  ${rel(path.join(dir, 'comments.md'))}`);
if (!rewrite) {
  console.log(`  to add more: ${['node', path.relative(process.cwd(), process.argv[1]), '--out', A.out, '--target', target, '--round', round].join(' ')}`);
  console.log('  not acted on until the user confirms they are finished with this round');
}
process.exit(comments.length ? 0 : 3);
