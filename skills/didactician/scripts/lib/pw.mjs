// Shared helpers for verify.mjs and probe.mjs: load the pinned Playwright, serve site/ under a
// sub-path (so absolute URLs break the way they would on a sub-path deploy), parse run files.
import { createRequire } from 'node:module';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';

export const PW_VERSION = '1.63.0';
export const PREFIX = '/__didactician/site/';

export function loadPlaywright() {
  const dir = process.env.DIDACTICIAN_PW_DIR ||
    path.join(process.env.DIDACTICIAN_CACHE || path.join(os.homedir(), '.cache', 'didactician'), `playwright-${PW_VERSION}`);
  try {
    return createRequire(path.join(dir, 'node_modules') + '/')('playwright');
  } catch {
    console.error(`playwright not found in ${dir}. Run: bash ${path.resolve(import.meta.dirname, '..', 'preflight.sh')}`);
    process.exit(1);
  }
}

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp',
  '.avif': 'image/avif', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff',
  '.ttf': 'font/ttf', '.mp4': 'video/mp4', '.webm': 'video/webm', '.mp3': 'audio/mpeg',
  '.wasm': 'application/wasm', '.txt': 'text/plain', '.csv': 'text/csv', '.geojson': 'application/json',
};

// Serve `root` at http://127.0.0.1:<port>/__didactician/site/. Requests outside the prefix get 404
// and are recorded: on a sub-path deploy they would break too.
export async function serve(root) {
  const outside = [];
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://x');
    if (!url.pathname.startsWith(PREFIX)) {
      if (url.pathname !== '/favicon.ico') outside.push(url.pathname);
      res.writeHead(404); res.end(); return;
    }
    let rel = decodeURIComponent(url.pathname.slice(PREFIX.length));
    let file = path.join(root, rel);
    if (!file.startsWith(path.resolve(root))) { res.writeHead(403); res.end(); return; }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (!fs.existsSync(file)) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'content-type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const origin = `http://127.0.0.1:${server.address().port}`;
  return { origin, base: origin + PREFIX, outside, close: () => new Promise((r) => server.close(r)) };
}

export function args(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const k = a.slice(2);
      const v = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
      if (out[k] === undefined) out[k] = v;
      else out[k] = [].concat(out[k], v);
    } else out._.push(a);
  }
  return out;
}

export function readIf(p) {
  try { return fs.readFileSync(p, 'utf8'); } catch { return ''; }
}

const stripComments = (t) => t.replace(/<!--[\s\S]*?-->/g, '');

// `### <id>` blocks with `key: value` lines (same convention as scripts/_common.py).
export function blocks(text, idPattern) {
  text = stripComments(text);
  const re = new RegExp(`^###\\s+(${idPattern})\\b.*$`, 'gm');
  const heads = [...text.matchAll(re)];
  return heads.map((m, i) => {
    let body = text.slice(m.index + m[0].length, i + 1 < heads.length ? heads[i + 1].index : text.length);
    const h2 = body.search(/^##\s/m);
    if (h2 >= 0) body = body.slice(0, h2);
    const f = {};
    for (const line of body.split('\n')) {
      const kv = line.match(/^([a-z_][a-z0-9_]*):\s*(.*?)\s*$/);
      if (kv && !(kv[1] in f)) f[kv[1]] = kv[2];
    }
    return { id: m[1], f };
  });
}

export function kv(text) {
  const f = {};
  for (const line of stripComments(text).split('\n')) {
    const m = line.match(/^([a-z_][a-z0-9_]*):\s*(.*?)\s*$/);
    if (m && !(m[1] in f)) f[m[1]] = m[2];
  }
  return f;
}

export function nowIso() {
  const d = new Date();
  const off = -d.getTimezoneOffset();
  const sign = off >= 0 ? '+' : '-';
  const pad = (n) => String(Math.floor(Math.abs(n))).padStart(2, '0');
  const local = new Date(d.getTime() + off * 60000).toISOString().slice(0, 19);
  return `${local}${sign}${pad(off / 60)}:${pad(off % 60)}`;
}

export function logAppend(run, actor, event, summary, links = []) {
  const lines = [`\n### ${nowIso()} · ${actor} · ${event}`, summary.trim()];
  for (const l of links) lines.push(`- [${l}](${l})`);
  fs.appendFileSync(path.join(run, 'log.md'), lines.join('\n') + '\n');
}
