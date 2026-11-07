// Assemble site/index.html from per-segment fragments.
//
// Source layout (written by the page builder):
//   site/src/shell.html     the page around the segments: <head>, header, ToC, footer, scripts.
//                           Each segment's place is a marker comment: <!-- segment s-03 -->
//   site/src/s-03.html      one fragment per marker, inlined at that marker. Its URLs resolve
//                           from site/, because that is where it ends up.
// Output:
//   site/index.html         assembled; never edited by hand. Line 2 is a banner with a hash of
//                           what was written, so a hand edit is caught on the next assembly
//                           instead of silently overwritten.
//   site/src/segments.json  segment order and files, for a host site that embeds the fragments.
//
// A site without src/shell.html is a single-file page: nothing is assembled.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const MARKER = /<!--\s*segment\s+(s-[A-Za-z0-9_-]+)\s*-->/g;
const BANNER = /^<!-- assembled by didactician assemble\.mjs from src\/; edit src\/, not this file · sha256:([0-9a-f]{16}) -->\n/m;

const hash = (s) => crypto.createHash('sha256').update(s).digest('hex').slice(0, 16);

export function assemble(site, { force = false } = {}) {
  const src = path.join(site, 'src');
  const shellPath = path.join(src, 'shell.html');
  if (!fs.existsSync(shellPath)) return { mode: 'single', errors: [] };
  const errors = [];
  const shell = fs.readFileSync(shellPath, 'utf8');
  const ids = [...shell.matchAll(MARKER)].map((m) => m[1]);
  const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (!ids.length) errors.push('src/shell.html has no <!-- segment s-NN --> markers');
  if (dup.length) errors.push(`src/shell.html places ${[...new Set(dup)].join(', ')} more than once`);
  const files = fs.readdirSync(src).filter((f) => /^s-[A-Za-z0-9_-]+\.html$/.test(f));
  for (const id of ids) if (!files.includes(`${id}.html`)) errors.push(`src/shell.html places ${id}, but src/${id}.html doesn't exist`);
  for (const f of files) if (!ids.includes(f.slice(0, -5))) errors.push(`src/${f} is not placed: add <!-- segment ${f.slice(0, -5)} --> to src/shell.html, or delete the file`);

  const indexPath = path.join(site, 'index.html');
  if (fs.existsSync(indexPath) && !force) {
    const cur = fs.readFileSync(indexPath, 'utf8');
    const m = cur.match(BANNER);
    if (!m) errors.push('index.html was not written by the assembler. Move its content into src/ (shell.html + one s-NN.html per segment), delete index.html, and assemble again');
    else if (hash(cur.replace(BANNER, '')) !== m[1]) errors.push('index.html was edited by hand since it was assembled. Make the change in src/ (see the begin/end comments in index.html for which file), then assemble again');
  }
  if (errors.length) return { mode: 'fragments', errors };

  const body = shell.replace(MARKER, (_, id) => {
    const frag = fs.readFileSync(path.join(src, `${id}.html`), 'utf8').replace(/\s+$/, '');
    return `<!-- begin ${id} · src/${id}.html -->\n${frag}\n<!-- end ${id} -->`;
  });
  // The banner goes on line 2, after the doctype, so the page stays in standards mode.
  const nl = body.indexOf('\n');
  const head = /^\s*<!doctype/i.test(body) ? body.slice(0, nl + 1) : '';
  const rest = head ? body.slice(nl + 1) : body;
  const content = head + rest;
  const out = head + `<!-- assembled by didactician assemble.mjs from src/; edit src/, not this file · sha256:${hash(content)} -->\n` + rest;
  fs.writeFileSync(indexPath, out);
  fs.writeFileSync(path.join(src, 'segments.json'),
    JSON.stringify({ shell: 'src/shell.html', segments: ids.map((id) => ({ id, file: `src/${id}.html` })) }, null, 2) + '\n');
  return { mode: 'fragments', errors: [], segments: ids };
}

// For verify/probe/human_review: assemble, or exit with the errors.
export function assembleOrExit(site, opts) {
  const r = assemble(site, opts);
  if (r.errors.length) {
    console.error(`assemble: ${path.join(site, 'src')}\n` + r.errors.map((e) => `  ERROR ${e}`).join('\n'));
    process.exit(2);
  }
  return r;
}
