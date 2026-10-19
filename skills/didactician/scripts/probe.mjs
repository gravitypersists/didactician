#!/usr/bin/env node
// Drive a built page's interactions and capture what happens, without writing Playwright code.
// For reviewers (and builders checking their own work).
//
//   node probe.mjs --out <out> [--width 390] [--name <label>] --do "<action>" [--do "<action>"]…
//
// Actions, run in order:
//   shot:<name>                    screenshot of the viewport → run/screenshots/probe/<label>-<name>.png
//   shot:<name>@<selector>         screenshot of one element
//   full:<name>                    full-page screenshot
//   click:<selector>               click (first match)
//   hover:<selector>
//   drag:<selector>:<dx>,<dy>      press on the element's centre, move by dx,dy px, release
//   key:<Key>                      e.g. key:ArrowRight, key:Tab, key:Enter
//   fill:<selector>=<value>        type into an input; for range inputs sets the value and fires input/change
//   scroll:<selector>              scroll the element into view (centre)
//   wait:<ms>
//   text:<selector>                print the element's visible text
//   attr:<selector>@<attribute>    print an attribute (e.g. aria-pressed, value)
//   count:<selector>               print how many elements match
//
// Prints one line per action, plus console errors seen during the session. Exit 1 if an action fails.
import fs from 'node:fs';
import path from 'node:path';
import { args, loadPlaywright, serve } from './lib/pw.mjs';

const A = args(process.argv.slice(2));
if (!A.out || !A.do) {
  console.error('usage: probe.mjs --out <out> [--width 390] [--name label] --do "click:#play" --do "shot:after"');
  process.exit(2);
}
const out = path.resolve(A.out);
const site = path.join(out, 'site');
const width = +(A.width || 390);
const label = String(A.name || `w${width}`).replace(/[^a-z0-9_-]+/gi, '-');
const dir = path.join(out, 'run', 'screenshots', 'probe');
fs.mkdirSync(dir, { recursive: true });
const actions = [].concat(A.do);

const { chromium } = loadPlaywright();
const server = await serve(site);
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1, hasTouch: width < 600 });
const page = await ctx.newPage();
const errors = [];
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
page.on('pageerror', (e) => errors.push(String(e.message || e)));
let failed = false;

try {
  await page.goto(server.base + (A.page || 'index.html'), { waitUntil: 'load' });
  await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
  for (const act of actions) {
    const i = act.indexOf(':');
    const verb = i < 0 ? act : act.slice(0, i);
    const arg = i < 0 ? '' : act.slice(i + 1);
    try {
      switch (verb) {
        case 'shot': case 'full': {
          const [name, sel] = arg.split('@');
          const file = path.join(dir, `${label}-${name || 'shot'}.png`);
          if (sel) await page.locator(sel).first().screenshot({ path: file });
          else await page.screenshot({ path: file, fullPage: verb === 'full' });
          console.log(`${act} → ${file}`);
          break;
        }
        case 'click': await page.locator(arg).first().click(); console.log(`${act} ok`); break;
        case 'hover': await page.locator(arg).first().hover(); console.log(`${act} ok`); break;
        case 'drag': {
          const m = arg.match(/^(.*):(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)$/);
          if (!m) throw new Error('expected drag:<selector>:<dx>,<dy>');
          const box = await page.locator(m[1]).first().boundingBox();
          if (!box) throw new Error('element not visible');
          const x = box.x + box.width / 2, y = box.y + box.height / 2;
          await page.mouse.move(x, y); await page.mouse.down();
          await page.mouse.move(x + +m[2], y + +m[3], { steps: 12 }); await page.mouse.up();
          console.log(`${act} ok`);
          break;
        }
        case 'key': await page.keyboard.press(arg); console.log(`${act} ok`); break;
        case 'fill': {
          const j = arg.indexOf('=');
          const sel = arg.slice(0, j), val = arg.slice(j + 1);
          const loc = page.locator(sel).first();
          const type = await loc.getAttribute('type');
          if (type === 'range') {
            await loc.evaluate((el, v) => { el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); }, val);
          } else await loc.fill(val);
          console.log(`${act} ok`);
          break;
        }
        case 'scroll': await page.locator(arg).first().evaluate((el) => el.scrollIntoView({ block: 'center' })); console.log(`${act} ok`); break;
        case 'wait': await page.waitForTimeout(+arg || 300); console.log(`${act} ok`); break;
        case 'text': console.log(`${act} → ${JSON.stringify((await page.locator(arg).first().innerText()).trim().slice(0, 500))}`); break;
        case 'attr': {
          const [sel, name] = arg.split('@');
          console.log(`${act} → ${JSON.stringify(await page.locator(sel).first().getAttribute(name))}`);
          break;
        }
        case 'count': console.log(`${act} → ${await page.locator(arg).count()}`); break;
        default: throw new Error(`unknown action "${verb}"`);
      }
    } catch (e) {
      failed = true;
      console.log(`${act} FAILED: ${String(e.message || e).split('\n')[0]}`);
    }
  }
} finally {
  await browser.close();
  await server.close();
}
if (errors.length) console.log(`console errors:\n${errors.map((e) => '  - ' + e.slice(0, 300)).join('\n')}`);
process.exit(failed ? 1 : 0);
