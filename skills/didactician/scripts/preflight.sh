#!/usr/bin/env bash
# Ensure Node + a pinned Playwright + Chromium are available for verify.mjs / probe.mjs.
# Installs into a per-user cache (not the host project), so the skill stays drop-in.
#   DIDACTICIAN_CACHE   override the cache dir (default ~/.cache/didactician)
set -euo pipefail

PW_VERSION="1.63.0"
CACHE="${DIDACTICIAN_CACHE:-$HOME/.cache/didactician}"
DIR="$CACHE/playwright-$PW_VERSION"

fail() {
  echo "PREFLIGHT FAILED: $1" >&2
  echo "Fix: $2" >&2
  exit 1
}

command -v node >/dev/null 2>&1 || fail "node not found" "install Node.js ≥ 20 (https://nodejs.org) and re-run"
NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
[ "$NODE_MAJOR" -ge 20 ] || fail "node $NODE_MAJOR is too old" "install Node.js ≥ 20"
command -v npm >/dev/null 2>&1 || fail "npm not found" "install npm (ships with Node.js)"

if [ ! -f "$DIR/node_modules/playwright/package.json" ]; then
  echo "installing playwright@$PW_VERSION into $DIR …"
  mkdir -p "$DIR"
  npm install --prefix "$DIR" --no-audit --no-fund --loglevel=error "playwright@$PW_VERSION" \
    || fail "npm install playwright@$PW_VERSION failed" "check network access, then run: npm install --prefix '$DIR' playwright@$PW_VERSION"
fi

"$DIR/node_modules/.bin/playwright" install chromium >/dev/null \
  || fail "chromium download failed" "run: '$DIR/node_modules/.bin/playwright' install chromium"

DIDACTICIAN_PW_DIR="$DIR" node --input-type=module -e '
import { createRequire } from "node:module";
const require = createRequire(process.env.DIDACTICIAN_PW_DIR + "/node_modules/");
const { chromium } = require("playwright");
const b = await chromium.launch();
const p = await b.newPage();
await p.setContent("<p>ok</p>");
if ((await p.textContent("p")) !== "ok") throw new Error("render check failed");
await b.close();
' || fail "chromium failed to launch" "run: '$DIR/node_modules/.bin/playwright' install --with-deps chromium"

echo "preflight ok: node $(node -v), playwright $PW_VERSION ($DIR)"
