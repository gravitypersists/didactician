#!/usr/bin/env node
// Deterministic critic for one widget: runs an extractor's pointers.json against the widget's own
// data.js / model.js and printed strings. No LLM calls; same input, same output.
//
//   node critic.mjs --site inputs/ch05-r0/site --widget w-sizing-sandbox --pointers runs/extractor-1.json [--out results/critic-1]
//
// Checks (see PROTOCOL.md):
//   sibling   — conceptual model alone: an attribute adjustable on some instances of a type, not others
//   coverage  — every manipulation the text asks for has a control
//   execute   — every pointer's steps, run through the model, meet its expectation, from the default
//               state and from every state an earlier pointer leaves the reader in
//   naming    — every widget part the text names is printed somewhere in the widget
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const args = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, all) => {
  if (v.startsWith('--')) a.push([v.slice(2), all[i + 1]]);
  return a;
}, []));
const site = args.site, wid = args.widget;
const wdir = path.join(site, 'widgets', wid);
const P = JSON.parse(fs.readFileSync(args.pointers, 'utf8'));

// ---- load the widget's data and model in a sandbox (both attach to window) ----
const ctx = { window: {} };
ctx.globalThis = ctx.window;
vm.createContext(ctx);
for (const f of ['data.js', 'model.js']) vm.runInContext(fs.readFileSync(path.join(wdir, f), 'utf8'), ctx, { filename: f });
const D = ctx.window.SizingData, M = ctx.window.SizingModel;

// ---- conceptual model, derived mechanically from data.js ----
const SERVICES = Object.keys(D.SERVICES);
const concept = {
  objects: {
    Service: { instances: SERVICES, attributes: {
      memory_request: Object.fromEntries(SERVICES.map(s => [s, D.SERVICES[s].adjustable || null])),
      cpu_request: Object.fromEntries(SERVICES.map(s => [s, null])),
      copies: Object.fromEntries(SERVICES.map(s => [s, null])),
    } },
  },
  controls: { spare_switch: !!D.SHEET.spare, reset: !!D.SHEET.reset },
};
const adjustable = s => concept.objects.Service.attributes.memory_request[s];

// ---- the strings the widget prints ----
function strings(v, out = []) {
  if (typeof v === 'string') out.push(v);
  else if (Array.isArray(v)) { out.push(v.join(' ')); v.forEach(x => strings(x, out)); }
  else if (v && typeof v === 'object') Object.values(v).forEach(x => strings(x, out));
  return out;
}
const printed = strings({ S: D.STRINGS, H: D.SHEET, L: SERVICES });
const js = fs.readFileSync(path.join(wdir, 'index.js'), 'utf8');
for (const m of js.matchAll(/'((?:[^'\\]|\\.){3,})'/g)) if (/[A-Za-z]{3}/.test(m[1]) && !/^[\w.-]+$/.test(m[1])) printed.push(m[1]);
const norm = t => t.toLowerCase().replace(/\{[^}]*\}/g, ' ').replace(/[’'`]/g, "'").replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ').trim();
const printedN = printed.map(norm);

// ---- page text, for reading order ----
const page = norm(fs.readFileSync(path.join(site, 'index.html'), 'utf8').replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/g, ' '));
const pos = q => { const n = norm(q || ''); for (const len of [n.length, 60, 30]) { const i = page.indexOf(n.slice(0, len)); if (i >= 0) return i; } return Infinity; };

const flags = [];
const flag = (check, severity, item, message, evidence) =>
  flags.push({ check, severity, where: item?.where ?? null, quote: item?.quote ?? null, message, evidence });

// ---- sibling asymmetry ----
for (const [type, o] of Object.entries(concept.objects)) for (const [attr, per] of Object.entries(o.attributes)) {
  const on = o.instances.filter(i => per[i]), off = o.instances.filter(i => !per[i]);
  if (on.length && off.length) flag('sibling', 'warn', null,
    `${type}.${attr} is adjustable for ${on.join(', ')} but not for ${off.join(', ')}`,
    'Deliberate, or a gap? Escalated to error below if the text asks the reader to change one of them.');
}

// ---- coverage ----
const controlFor = (svc, attr) => {
  if (attr === 'memory_request') return svc ? !!adjustable(svc) : SERVICES.some(adjustable);
  if (attr === 'spare_switch' || attr === 'reset') return concept.controls[attr];
  if (attr === 'cpu_request' || attr === 'copies') return false;
  return undefined;   // other:… — can't be decided from the model
};
for (const m of P.manipulations || []) {
  const ok = controlFor(m.service, m.attribute);
  if (ok === false) flag('coverage', 'error', m, `the text asks the reader to change ${m.service ?? ''} ${m.attribute} in the widget, which has no control for it`,
    `controls: memory_request for ${SERVICES.filter(adjustable).join(', ')}; spare switch; reset`);
  else if (ok === undefined) flag('coverage', 'info', m, `unverifiable manipulation "${m.attribute}"`, 'not in the model vocabulary');
}

// ---- execution ----
const DEFAULT = () => ({ req: Object.fromEntries(SERVICES.map(s => [s, D.SERVICES[s].size])), spare: true });
const clone = st => ({ req: { ...st.req }, spare: st.spare });
const svcList = v => (v === 'all' || v == null) ? SERVICES : v;

function apply(st, step, notes) {
  const s = clone(st);
  const setReq = (svc, val, why) => {
    const a = adjustable(svc);
    if (!a) { notes.add(`${svc} has no control: ${why} not possible in the widget; applied to the model only where noted`); return; }
    let v = Math.min(a.max, Math.max(a.min, Math.round(val / a.step) * a.step));
    if (v !== val) notes.add(`${svc} ${val} GB is not a setting the stepper offers (range ${a.min}–${a.max}, step ${a.step}); used ${v}`);
    s.req[svc] = v;
  };
  if (step.reset) return DEFAULT();
  if ('spare' in step) s.spare = !!step.spare;
  if (step.set) for (const [k, v] of Object.entries(step.set)) setReq(k, v, `setting ${k} to ${v} GB is`);
  if (step.set_to_use) for (const k of svcList(step.set_to_use)) {
    if (step.set_to_use === 'all' && !adjustable(k)) continue;
    setReq(k, D.SERVICES[k].use, `setting ${k} to its use is`);
  }
  if (step.scale) for (const k of svcList(step.scale.services)) {
    if (step.scale.services === 'all' && !adjustable(k)) continue;
    setReq(k, st.req[k] * step.scale.factor, `scaling ${k} is`);
  }
  if ((step.set_to_use === 'all' || step.scale?.services === 'all') && SERVICES.some(k => !adjustable(k)))
    notes.add(`"all" covers only the services with a control (${SERVICES.filter(adjustable).join(', ')})`);
  return s;
}

function observe(st, o) {
  const r = M.evaluate(D, st.req, st.spare);
  return { nodes_for_pods: r.base, nodes_total: r.nodes, set_by: r.setBy, services_over: r.over,
           services_never_placeable: r.never.map(x => x.service), reserved_gb: r.reserved, used_gb: r.used }[o];
}
const show = v => Array.isArray(v) ? `[${v.join(', ')}]` : String(v);
function holds(e, states) {
  const at = e.at ?? states.length - 1;
  if (at >= states.length) return { ok: false, got: `state ${at} does not exist` };
  const v = observe(states[at], e.observable);
  const rel = e.relative_to != null ? observe(states[e.relative_to], e.observable) : undefined;
  const n = Array.isArray(v) ? v.length : null;
  const ok = {
    eq: () => JSON.stringify(v) === JSON.stringify(e.value), ne: () => JSON.stringify(v) !== JSON.stringify(e.value),
    gt: () => v != null && v > e.value, gte: () => v != null && v >= e.value,
    lt: () => v != null && v < e.value, lte: () => v != null && v <= e.value,
    count_eq: () => n === e.value, count_gte: () => n >= e.value, count_lte: () => n <= e.value,
    includes: () => (v || []).includes(e.value), excludes: () => !(v || []).includes(e.value),
    increases: () => v != null && rel != null && v > rel, decreases: () => v != null && rel != null && v < rel,
    unchanged: () => JSON.stringify(v) === JSON.stringify(rel),
  }[e.op]?.();
  return { ok: !!ok, got: `${e.observable} = ${show(v)}${rel !== undefined ? ` (state ${e.relative_to}: ${show(rel)})` : ''}`, known: ok !== undefined };
}
const describe = st => SERVICES.filter(adjustable).map(s => `${s} ${st.req[s]}`).join(', ') + `, spare ${st.spare ? 'on' : 'off'}`;

const pointers = (P.pointers || []).map((p, i) => ({ ...p, _i: i, _pos: pos(p.quote) }))
  .sort((a, b) => (a._pos - b._pos) || (a._i - b._i));
const ends = [];   // states earlier pointers leave the reader in
for (const p of pointers) {
  const notes = new Set();
  let starts;
  if (p.start && typeof p.start === 'object') starts = [{ label: 'the start the text names', st: apply(DEFAULT(), p.start, notes) }];
  else if (p.start === 'default') starts = [{ label: 'default', st: DEFAULT() }];
  else starts = [{ label: 'default', st: DEFAULT() }, ...ends.map(e => ({ label: `after ${e.id} (${e.where})`, st: e.st }))];

  let firstEnd = null;
  const results = starts.map(({ label, st }) => {
    const states = [st];
    for (const step of p.steps || []) states.push(apply(states.at(-1), step, notes));
    if (!firstEnd) firstEnd = states.at(-1);
    const checks = (p.expect || []).map(e => ({ e, ...holds(e, states) }));
    return { label, states, checks, ok: checks.every(c => c.ok) };
  });
  if (firstEnd) ends.push({ id: p.id, where: p.where, st: firstEnd });

  const unreachable = [...notes].filter(n => n.includes('has no control'));
  if (unreachable.length) flag('execute', 'error', p, 'the pointer needs a setting the widget has no control for', unreachable.join('; '));
  const bad = results.filter(r => !r.ok);
  const unknownOp = results.some(r => r.checks.some(c => !c.known));
  if (unknownOp) flag('execute', 'info', p, 'expectation uses an op the checker does not know', JSON.stringify(p.expect));
  else if (bad.length && bad[0].label === 'default') {
    const r = bad[0];
    flag('execute', 'error', p, `from the default state the widget does not show what the text says (${results.length - bad.length}/${results.length} plausible starts pass)`,
      r.checks.filter(c => !c.ok).map(c => `expected ${c.e.observable} ${c.e.op} ${show(c.e.value ?? `state ${c.e.relative_to}`)}${c.e.implied ? ' (implied)' : ''}; got ${c.got}`).join('; ')
      + ` | states: ${r.states.map(describe).join(' → ')}`
      + (results.some(x => x.ok) ? ` | passes from: ${results.filter(x => x.ok).map(x => x.label).join('; ')}` : ''));
  } else if (bad.length) {
    flag('execute', 'warn', p, `passes from the default state but not from ${bad.length} state(s) earlier text leaves the reader in`,
      bad.map(r => `${r.label}: ${r.checks.filter(c => !c.ok).map(c => c.got).join('; ')}`).join(' | '));
  }
  const offGrid = [...notes].filter(n => n.includes('not a setting'));
  if (offGrid.length) flag('execute', 'warn', p, 'the pointer names a value the stepper cannot reach', offGrid.join('; '));
}

// ---- naming ----
const GENERIC = /^(the |this |that )?(w ?0?2|widget|sheet|sandbox|the widget|ari's sizing sheet|sizing sheet)('s)?$/;
for (const n of P.named_elements || []) {
  const name = norm(n.name).replace(/^(the|w 02's|w 02|w02's)\s+/, '');
  if (!name || GENERIC.test(name)) continue;
  if (printedN.some(t => t.includes(name))) continue;
  const words = name.split(' ').filter(w => w.length > 3);
  const near = printed.map((t, i) => [t, words.filter(w => printedN[i].includes(w)).length]).filter(x => x[1]).sort((a, b) => b[1] - a[1]).slice(0, 3).map(x => `"${x[0]}"`);
  flag('naming', 'warn', n, `the text calls a widget part "${n.name}", which the widget never prints`, near.length ? `nearest printed: ${near.join(', ')}` : 'no printed string shares a word');
}

// ---- escalate sibling gaps the text relies on ----
const textNeeds = new Set((P.manipulations || []).filter(m => m.attribute === 'memory_request' && m.service && !adjustable(m.service)).map(m => m.service));
for (const p of P.pointers || []) for (const st of p.steps || []) for (const k of Object.keys(st.set || {})) if (!adjustable(k)) textNeeds.add(k);
for (const f of flags.filter(f => f.check === 'sibling')) if (textNeeds.size) {
  f.severity = 'error';
  f.evidence = `the text asks the reader to change ${[...textNeeds].join(', ')} in the widget`;
}

// ---- report ----
const order = { error: 0, warn: 1, info: 2 };
flags.sort((a, b) => order[a.severity] - order[b.severity]);
const md = [`# Critic report: ${path.basename(args.pointers)}`, '',
  `${(P.pointers || []).length} pointers, ${(P.manipulations || []).length} manipulations, ${(P.named_elements || []).length} named elements. ` +
  `${flags.filter(f => f.severity === 'error').length} errors, ${flags.filter(f => f.severity === 'warn').length} warnings, ${flags.filter(f => f.severity === 'info').length} info.`, '',
  ...flags.map((f, i) => `${i + 1}. **${f.severity} · ${f.check}**${f.where ? ` · ${f.where}` : ''}: ${f.message}${f.quote ? `\n   > ${f.quote}` : ''}\n   ${f.evidence}`)].join('\n');
if (args.out) {
  fs.writeFileSync(args.out + '.md', md + '\n');
  fs.writeFileSync(args.out + '.json', JSON.stringify(flags, null, 2) + '\n');
}
console.log(md);
