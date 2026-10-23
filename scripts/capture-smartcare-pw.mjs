// Capture the SmartCare Psychiatric Note (or our build of it) with Playwright into docs/note-references/<slug>/.
// Usage:
//   node scripts/capture-smartcare-pw.mjs <slug> smartcare "<smartcare url>"   # you log in + open the note in the window it opens
//   node scripts/capture-smartcare-pw.mjs <slug> ours [ehr]                    # our dev server (localhost:5173); ehr = Streamline | CalMHSA SmartCare
// Uses a persistent profile outside the repo so the SmartCare login survives between runs. Use a demo record only (no PII).
import { chromium } from '@playwright/test';
import { readFileSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const [slug, mode = 'smartcare', arg] = process.argv.slice(2);
if (!slug) throw new Error('usage: capture-smartcare-pw.mjs <slug> smartcare <url> | ours [ehr]');
const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, '..', 'docs', 'note-references', slug);
mkdirSync(out, { recursive: true });
const extract = readFileSync(path.join(here, 'smartcare-extract.js'), 'utf8');
const TABS = ['General', 'MSE', 'Medical Decision Making', 'AIMS', 'Diagnosis', 'Psychotherapy'];
const VIEWPORT = { width: 1440, height: 900 }; // same for reference and ours so rects are comparable

const ctx = await chromium.launchPersistentContext(path.join(homedir(), '.cache', 'smartcare-pw-profile'), {
  headless: false, viewport: VIEWPORT, deviceScaleFactor: 1,
});
const page = ctx.pages()[0] ?? await ctx.newPage();

if (mode === 'smartcare') {
  await page.goto(arg);
  console.log('>> In the browser window: log in, open the demo record\'s Psychiatric Note so the General/MSE/... tab strip is visible. Waiting up to 10 min...');
  await page.waitForSelector('#ctl00_ContentPlaceHolderPageContents_ctl00_RadTabStrip1', { timeout: 600_000 });
} else {
  const ehr = arg ?? 'Streamline';
  await page.goto('http://127.0.0.1:5173/');
  await page.getByRole('checkbox', { name: 'Enable Enhance features' }).uncheck();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  for (const [menu, name] of [['Switch EHR background', ehr], ['Switch note type', 'Psychiatric Note']]) {
    await page.locator('.demo-controls-hotzone').hover();
    await page.getByTitle(menu).click();
    await page.getByRole('button', { name, exact: true }).click();
  }
  await page.mouse.move(700, 500);
  await page.getByRole('button', { name: 'Note', exact: true }).click();
  await page.waitForSelector('.psych-tab-btn');
}
await page.waitForTimeout(1500);

const tabLocator = tab => page.locator('a.rtsLink, .psych-tab-btn').filter({ hasText: new RegExp(`^\\s*${tab}\\s*$`) }).first();
// The tallest scrollable element (the note body) - same heuristic as smartcare-extract.js
const scrollerHandle = () => page.evaluateHandle(() =>
  [...document.querySelectorAll('*')].filter(e => e.scrollHeight > e.clientHeight + 20 && /auto|scroll/.test(getComputedStyle(e).overflowY))
    .sort((a, b) => b.clientHeight - a.clientHeight)[0] ?? null);

const only = process.env.TABS?.split(',');
// Wait until SmartCare's "Processing" overlay is gone and the network has settled, then let layout finish.
const settle = async () => {
  await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {});
  await page.getByText('Processing', { exact: true }).first().waitFor({ state: 'hidden', timeout: 30_000 }).catch(() => {});
  await page.waitForTimeout(3000);
};
for (const tab of TABS.filter(t => !only || only.includes(t))) {
  await tabLocator(tab).click();
  await settle();
  const name = tab.replace(/[ /]/g, '_');
  const json = await page.evaluate(extract);
  const data = JSON.parse(json);
  // Sanity check: this must be the note, not a login/other page.
  if (!data.texts.some(t => t.text === tab)) throw new Error(`Tab "${tab}" not visible after click - wrong page? title=${data.title}`);
  mkdirSync(out, { recursive: true });
  (await import('node:fs')).writeFileSync(path.join(out, `${name}.json`), json);
  const sc = await scrollerHandle();
  const el = sc.asElement();
  const max = el ? await el.evaluate(e => e.scrollHeight - e.clientHeight) : 0;
  let n = 0;
  for (let top = 0; ; top += 600, n++) {
    if (el) await el.evaluate((e, t) => { e.scrollTop = t; }, top);
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(out, `${name}-${n}.png`) });
    if (top >= max) break;
  }
  if (el) await el.evaluate(e => { e.scrollTop = 0; });
  console.log(`captured ${tab}: ${n + 1} screenshot(s), scroll height +${Math.round(max)}`);
}
await ctx.close();
console.log('->', out);
