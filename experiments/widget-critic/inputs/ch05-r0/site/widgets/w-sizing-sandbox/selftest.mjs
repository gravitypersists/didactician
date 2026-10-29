// Node self-test for the sizing sheet's model (not loaded by the page or the gate).
//   node selftest.mjs
// Loads data.js and model.js into one context, runs SizingModel.selfTest (the plan's ac-08 values,
// monotonicity over every stepper setting, the idle split) and prints the results.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const here = dirname(fileURLToPath(import.meta.url));
const ctx = { console };
ctx.window = ctx;
ctx.globalThis = ctx;
vm.createContext(ctx);
for (const f of ['data.js', 'model.js']) vm.runInContext(readFileSync(join(here, f), 'utf8'), ctx, { filename: f });
const t0 = Date.now();
const r = ctx.SizingModel.selfTest(ctx.SizingData);
const ms = Date.now() - t0;
for (const x of r.results) console.log((x.ok ? 'ok   ' : 'FAIL ') + x.name + ' → ' + JSON.stringify(x.got) + (x.ok ? '' : ' (want ' + JSON.stringify(x.want) + ')'));
console.log(`settings: ${r.settings} × 2 · max search steps for one setting: ${r.maxSteps} · ${ms} ms`);
console.log(r.ok ? 'SELFTEST PASS' : 'SELFTEST FAIL');
process.exit(r.ok ? 0 : 1);
