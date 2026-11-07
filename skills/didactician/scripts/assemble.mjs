// Assemble site/index.html from site/src/ (shell.html + one s-NN.html per segment).
//   node assemble.mjs --out <out> [--force]
// verify.mjs, probe.mjs and human_review.mjs assemble on their own before they render, so builders
// rarely need this directly. --force overwrites an index.html that was edited by hand.
import path from 'node:path';
import { args } from './lib/pw.mjs';
import { assembleOrExit } from './lib/assemble.mjs';

const A = args(process.argv.slice(2));
if (!A.out) { console.error('usage: assemble.mjs --out <out> [--force]'); process.exit(2); }
const r = assembleOrExit(path.join(path.resolve(A.out), 'site'), { force: !!A.force });
console.log(r.mode === 'single'
  ? 'no site/src/shell.html: a single-file page, nothing to assemble'
  : `assembled site/index.html from ${r.segments.length} segments: ${r.segments.join(', ')}`);
