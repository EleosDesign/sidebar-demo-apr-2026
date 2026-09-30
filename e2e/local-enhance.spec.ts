import { expect, test, type Locator, type Page } from '@playwright/test';
import { INITIAL_NOTE_VALUES } from '../src/data/noteDefaults.js';
import { ENHANCE_ERRORS } from '../src/data/enhanceConfig.js';

// Both source and fake model output are existing demo copy, not generated clinical text.
const note = INITIAL_NOTE_VALUES['Data/Goal:'];
const source = 'Reported a difficult week at work';
const output = INITIAL_NOTE_VALUES['Assessment/Level of Participation:'];
const start = note.indexOf(source);
const end = start + source.length;

type ModelControl = {
  availability: string;
  reject: boolean;
  delay: boolean;
  calls: string[];
  availabilityCalls: number;
  createCalls: number;
  destroyed: number;
  cloneCalls: number;
  baseDestroyed: number;
  activeAtCreate: boolean;
  cloneReject: boolean;
  finishPrompt?: () => void;
  finishDownload?: () => void;
  progress?: (loaded: number) => void;
};
declare global {
  interface Window { localEnhanceTest: ModelControl }
}

async function select(field: Locator, from: number, to: number) {
  await field.evaluate((element: HTMLTextAreaElement, range) => {
    element.focus();
    element.setSelectionRange(range.from, range.to);
    document.dispatchEvent(new Event('selectionchange'));
  }, { from, to });
}
const enhance = (page: Page) => page.getByRole('button', { name: 'Enhance text', exact: true });
const use = (page: Page) => page.getByRole('button', { name: 'Use this', exact: true });
const preview = (page: Page) => page.getByRole('status').filter({ hasText: output });

async function continueWelcome(page: Page) {
  if (await page.getByRole('dialog').count()) {
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await expect(page.getByRole('status').filter({ hasText: 'AI ready' })).toBeVisible();
  }
}

async function prepare(page: Page, text = note) {
  await continueWelcome(page);
  const field = page.getByRole('textbox', { name: 'Data', exact: true });
  await field.fill(text);
  await select(field, text === note ? start : 0, text === note ? end : text.length);
  await expect(enhance(page)).toBeVisible();
  return field;
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(({ output }) => {
    const control: ModelControl = window.localEnhanceTest = {
      availability: 'available', reject: false, delay: false, calls: [],
      availabilityCalls: 0, createCalls: 0, destroyed: 0, cloneCalls: 0, baseDestroyed: 0, activeAtCreate: false, cloneReject: false,
    };
    Object.defineProperty(window, 'LanguageModel', { configurable: true, value: {
      async availability() { control.availabilityCalls++; return control.availability; },
      async create(options: { monitor: (monitor: EventTarget) => void }) {
        control.createCalls++;
        control.activeAtCreate = navigator.userActivation.isActive;
        if (control.availability === 'unavailable') throw new Error('unavailable');
        if (control.availability === 'downloadable') {
          const monitor = new EventTarget();
          options.monitor(monitor);
          control.progress = loaded => monitor.dispatchEvent(Object.assign(new Event('downloadprogress'), { loaded }));
          await new Promise<void>(resolve => { control.finishDownload = resolve; });
        }
        return {
          prompt() { throw new Error('Base must never be prompted'); },
          destroy() { control.baseDestroyed++; },
          async clone() {
            control.cloneCalls++;
            if (control.cloneReject) throw new Error('clone failed');
            return {
              async prompt(messages: { content: string }[]) {
                control.calls.push(JSON.parse(messages[0].content).source);
                if (control.reject) throw new Error('Deterministic local model rejection');
                // Deliberately ignore abort: exercise late browser/model completion.
                if (control.delay) await new Promise<void>(resolve => { control.finishPrompt = resolve; });
                return output;
              },
              destroy() { control.destroyed++; },
            };
          },
        };
      },
    } });
  }, { output });
  await page.goto('/clinician');
});

test('welcome creates only on Continue; focus and selections do not create more sessions', async ({ page }) => {
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('checkbox', { name: 'Enable Enhance features' })).toBeChecked();
  await expect(page.getByRole('checkbox', { name: 'Enable Enhance features' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Continue', exact: true })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(page.getByRole('checkbox', { name: 'Enable Enhance features' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeVisible();
  expect(await page.evaluate(() => window.localEnhanceTest.createCalls)).toBe(0);
  await continueWelcome(page);
  expect(await page.evaluate(() => window.localEnhanceTest.activeAtCreate)).toBe(true);
  expect(await page.evaluate(() => window.localEnhanceTest.createCalls)).toBe(1);
  const field = page.getByRole('textbox', { name: 'Data', exact: true });
  await field.fill(note);
  await expect(field).toBeFocused();
  await expect(enhance(page)).toHaveCount(0);
  await select(field, start, end);
  await expect(enhance(page)).toBeVisible();
  expect(await page.evaluate(() => window.localEnhanceTest.availabilityCalls)).toBe(0);
  await select(field, end, end);
  await expect(enhance(page)).toHaveCount(0);
});

test('four words are rejected locally; five words reach the model', async ({ page }) => {
  const field = await prepare(page, 'one two three four');
  await enhance(page).click();
  await expect(page.getByRole('alert')).toHaveText(ENHANCE_ERRORS.short);
  expect(await page.evaluate(() => window.localEnhanceTest.availabilityCalls)).toBe(0);
  await field.fill('one two three four five');
  await select(field, 0, 'one two three four five'.length);
  await enhance(page).click();
  await expect(preview(page)).toBeVisible();
  expect(await page.evaluate(() => window.localEnhanceTest.calls)).toEqual(['one two three four five']);
});

test('sends exactly the selected range; preview is inert until Use replaces only that range', async ({ page }) => {
  const field = await prepare(page);
  await enhance(page).click();
  await expect(preview(page)).toHaveText(output);
  expect(await page.evaluate(() => window.localEnhanceTest.calls)).toEqual([source]);
  await expect(field).toHaveValue(note);
  await use(page).click();
  await expect(field).toHaveValue(note.slice(0, start) + output + note.slice(end));
  await expect(use(page)).toHaveCount(0);
});

for (const action of ['Dismiss', 'Escape'] as const) {
  test(`${action} leaves the note unchanged and restores textarea focus`, async ({ page }) => {
    const field = await prepare(page);
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await expect(preview(page)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Dismiss', exact: true }).first()).toBeFocused();
    if (action === 'Dismiss') await page.getByRole('button', { name: 'Dismiss', exact: true }).last().click();
    else await page.keyboard.press('Escape');
    await expect(field).toHaveValue(note);
    await expect(use(page)).toHaveCount(0);
    await expect(field).toBeFocused();
  });
}

test('replacement preserves spaces, tabs and newlines at selected boundaries', async ({ page }) => {
  const text = `before \t\n${source}\n\t after`;
  const field = await prepare(page, text);
  await select(field, 6, text.length - 5);
  await enhance(page).click();
  await expect(preview(page)).toBeVisible();
  await use(page).click();
  await expect(field).toHaveValue(`before \t\n${output}\n\t after`);
});

test('keyboard pending field switch cancels without stealing focus', async ({ page }) => {
  await page.evaluate(() => { window.localEnhanceTest.delay = true; });
  const field = await prepare(page);
  const other = page.getByRole('textbox', { name: 'Assessment', exact: true });
  const otherBefore = await other.inputValue();
  await page.keyboard.press('Tab');
  await expect(enhance(page)).toBeFocused();
  await page.keyboard.press('Enter');
  await expect.poll(() => page.evaluate(() => window.localEnhanceTest.calls)).toEqual([source]);
  await expect(enhance(page)).toBeFocused();
  await expect(enhance(page)).toHaveAttribute('aria-disabled', 'true');
  await page.keyboard.press('Enter');
  expect(await page.evaluate(() => window.localEnhanceTest.createCalls)).toBe(1);
  await page.keyboard.press('Tab');
  await expect(other).toBeFocused();
  await expect(enhance(page)).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => window.localEnhanceTest.destroyed)).toBe(1);
  await page.evaluate(async () => {
    window.localEnhanceTest.finishPrompt!();
    await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  });
  await expect(preview(page)).toHaveCount(0);
  await expect(use(page)).toHaveCount(0);
  await expect(other).toBeFocused();
  await expect(field).toHaveValue(note);
  await expect(other).toHaveValue(otherBefore);
});

test('keyboard Tab reaches Enhance and preserves focus into preview Use', async ({ page }) => {
  const field = await prepare(page);
  await page.keyboard.press('Tab');
  await expect(enhance(page)).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(preview(page)).toBeVisible();
  // Never focus() here: that would conceal lost focus when Enhance unmounts.
  await expect(page.getByRole('button', { name: 'Dismiss', exact: true }).first()).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Dismiss', exact: true }).last()).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(use(page)).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(field).toHaveValue(note.slice(0, start) + output + note.slice(end));
  await expect(field).toBeFocused();
});

for (const change of ['edit', 'field switch'] as const) {
  test(`discards delayed output after ${change}`, async ({ page }) => {
    await page.evaluate(() => { window.localEnhanceTest.delay = true; });
    const field = await prepare(page);
    const other = page.getByRole('textbox', { name: 'Assessment', exact: true });
    const otherBefore = await other.inputValue();
    await enhance(page).click();
    await expect.poll(() => page.evaluate(() => window.localEnhanceTest.calls)).toEqual([source]);
    if (change === 'edit') await field.fill(note + '::');
    else await other.focus();
    await expect(enhance(page)).toHaveCount(0);
    await page.evaluate(async () => {
      window.localEnhanceTest.finishPrompt!();
      // Flush the deferred model promise and React's scheduled render, not a timed sleep.
      await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    });
    await expect(use(page)).toHaveCount(0);
    await expect(preview(page)).toHaveCount(0);
    await expect(field).toHaveValue(change === 'edit' ? note + '::' : note);
    await expect(other).toHaveValue(otherBefore);
    expect(await page.evaluate(() => window.localEnhanceTest.destroyed)).toBe(1);
  });
}

test('download progress leaves demo usable; selection Enhance waits for readiness', async ({ page }) => {
  await page.evaluate(() => { window.localEnhanceTest.availability = 'downloadable'; });
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  const field = page.getByRole('textbox', { name: 'Data', exact: true });
  await field.fill(note);
  await select(field, start, end);
  await expect(enhance(page)).toHaveCount(0);
  await expect(page.getByRole('status').filter({ hasText: 'AI preparing' })).toBeVisible();
  await page.evaluate(() => window.localEnhanceTest.progress!(0.42));
  await expect(page.getByRole('status').filter({ hasText: '42%' })).toBeVisible();
  await expect(field).toHaveValue(note);
  expect(await page.evaluate(() => window.localEnhanceTest.calls)).toEqual([]);
  await page.evaluate(() => { window.localEnhanceTest.progress!(1); window.localEnhanceTest.finishDownload!(); });
  await expect(page.getByRole('status').filter({ hasText: 'AI ready' })).toBeVisible();
  await select(field, start, end);
  await enhance(page).click();
  await expect(preview(page)).toBeVisible();
  await expect(field).toHaveValue(note);
});

for (const failure of ['missing API', 'unavailable', 'rejection'] as const) {
  test(`${failure} reports a recoverable error without changing the note`, async ({ page }) => {
    await page.evaluate(failure => {
      if (failure === 'missing API') Reflect.deleteProperty(window, 'LanguageModel');
      else if (failure === 'unavailable') window.localEnhanceTest.availability = 'unavailable';
      else window.localEnhanceTest.reject = true;
    }, failure);
    if (failure === 'rejection') {
      const field = await prepare(page);
      await enhance(page).click();
      await expect(page.getByRole('alert')).toHaveText(ENHANCE_ERRORS.failed);
      await expect(field).toHaveValue(note);
      await expect(enhance(page)).toBeEnabled();
    } else {
      await page.getByRole('button', { name: 'Continue', exact: true }).click();
      await expect(page.getByRole('status')).toHaveText(ENHANCE_ERRORS.unavailable);
      await expect(page.getByRole('button', { name: 'Retry AI preparation' })).toBeVisible();
      const field = page.getByRole('textbox', { name: 'Data', exact: true });
      await field.fill(note);
      await select(field, start, end);
      await expect(field).toHaveValue(note);
      await expect(enhance(page)).toHaveCount(0);
      if (failure === 'unavailable') {
        await page.evaluate(() => { window.localEnhanceTest.availability = 'available'; });
        await page.getByRole('button', { name: 'Retry AI preparation' }).click();
        await expect(page.getByRole('status')).toHaveText('AI ready');
      }
    }
    await expect(use(page)).toHaveCount(0);
  });
}

test(':: remains literal text and does not trigger enhancement', async ({ page }) => {
  await continueWelcome(page);
  const field = page.getByRole('textbox', { name: 'Data', exact: true });
  await field.fill(note);
  await field.press('End');
  await field.pressSequentially('::');
  await expect(field).toHaveValue(note + '::');
  await expect(enhance(page)).toHaveCount(0);
  expect(await page.evaluate(() => window.localEnhanceTest.availabilityCalls)).toBe(0);
  await select(field, 0, note.length + 2);
  await enhance(page).click();
  await expect(preview(page)).toBeVisible();
  expect(await page.evaluate(() => window.localEnhanceTest.calls)).toEqual([note + '::']);
});

test('skipping never creates; explicit enable prepares once and subsequent requests clone', async ({ page }) => {
  await page.getByRole('checkbox', { name: 'Enable Enhance features' }).uncheck();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  const field = page.getByRole('textbox', { name: 'Data', exact: true });
  await field.fill(note);
  await select(field, start, end);
  await expect(enhance(page)).toHaveCount(0);
  expect(await page.evaluate(() => window.localEnhanceTest.createCalls)).toBe(0);
  await page.getByRole('button', { name: 'Enable Enhance', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('AI ready');
  for (let i = 0; i < 2; i++) {
    await select(field, start, end);
    await enhance(page).click();
    await expect(preview(page)).toBeVisible();
    await page.keyboard.press('Escape');
  }
  expect(await page.evaluate(() => window.localEnhanceTest.createCalls)).toBe(1);
  expect(await page.evaluate(() => window.localEnhanceTest.cloneCalls)).toBe(2);
  expect(await page.evaluate(() => window.localEnhanceTest.baseDestroyed)).toBe(0);
  await page.reload();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('checkbox', { name: 'Enable Enhance features' })).toBeChecked();
  expect(await page.evaluate(() => window.localEnhanceTest.createCalls)).toBe(0);
});

test('clone failure requires explicit preparation retry; page lifecycle releases base', async ({ page }) => {
  const field = await prepare(page);
  await page.evaluate(() => { window.localEnhanceTest.cloneReject = true; });
  await enhance(page).click();
  await expect(page.getByRole('status')).toHaveText(ENHANCE_ERRORS.clone);
  await expect(field).toHaveValue(note);
  await page.evaluate(() => { window.localEnhanceTest.cloneReject = false; });
  await page.getByRole('button', { name: 'Retry AI preparation' }).click();
  await expect(page.getByRole('status')).toHaveText('AI ready');
  await page.evaluate(() => window.dispatchEvent(new Event('pagehide')));
  expect(await page.evaluate(() => window.localEnhanceTest.baseDestroyed)).toBe(2);
  await expect(page.getByRole('button', { name: 'Enable Enhance', exact: true })).toBeVisible();
});
