import test, { afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { createEnhancePreparation, enhanceLocally } from './localEnhance.js';
import { validateSelection, replaceCapturedRange } from './enhanceSelection.js';
import { ENHANCE_ERRORS, ENHANCE_MODEL_OPTIONS, ENHANCE_PROMPT, ENHANCE_PREPARATION_TIMEOUT_MS, ENHANCE_TIMEOUT_MS } from '../../data/enhanceConfig.js';
import { INITIAL_NOTE_VALUES } from '../../data/noteDefaults.js';

const source = INITIAL_NOTE_VALUES['Data/Goal:'];
const originalModel = globalThis.LanguageModel;
afterEach(() => {
  if (originalModel === undefined) delete globalThis.LanguageModel;
  else globalThis.LanguageModel = originalModel;
});

test('word-like validation ignores punctuation and accepts five words', () => {
  assert.equal(validateSelection('… — !!!'), ENHANCE_ERRORS.short);
  assert.equal(validateSelection('Client presented on time'), ENHANCE_ERRORS.short);
  assert.equal(validateSelection('Client presented on time and'), null);
  assert.equal(validateSelection(source), null);
});

test('range replacement preserves surroundings and rejects stale or invalid ranges', () => {
  const start = source.indexOf('Reported');
  const end = source.indexOf('States');
  const capture = { value: source, start, end };
  const replacement = source.slice(start, end).trim();
  assert.equal(replaceCapturedRange(source, capture, replacement), source);
  assert.equal(replaceCapturedRange(source + ' ', capture, replacement), null);
  for (const range of [{ start: -1 }, { end: source.length + 1 }, { end: start }, { start: 1.5 }]) {
    assert.equal(replaceCapturedRange(source, { ...capture, ...range }, replacement), null);
  }
});

test('range replacement preserves selected boundary whitespace, not model whitespace', () => {
  const value = `before \t\n${source}\n\t after`;
  const capture = { value, start: 6, end: value.length - 5 };
  const replacement = INITIAL_NOTE_VALUES['Assessment/Level of Participation:'];
  assert.equal(replaceCapturedRange(value, capture, ` ${replacement}\n`), `before \t\n${replacement}\n\t after`);
});

test('unsupported and too-short input never create a model', async () => {
  delete globalThis.LanguageModel;
  await assert.rejects(enhanceLocally(source), { message: ENHANCE_ERRORS.unavailable });
  globalThis.LanguageModel = { availability() { assert.fail('must validate first'); } };
  await assert.rejects(enhanceLocally('Client'), { message: ENHANCE_ERRORS.short });
});

test('activation creates synchronously without waiting for availability; preparation is reused and only clones are prompted', async () => {
  let created = 0, cloned = 0, destroyed = 0, baseDestroyed = 0;
  const states = [];
  globalThis.LanguageModel = {
    availability() { assert.fail('must not wait on availability'); return new Promise(() => {}); },
    create(options) {
      created++;
      assert.deepEqual(options.expectedInputs, ENHANCE_MODEL_OPTIONS.expectedInputs);
      assert.equal(options.initialPrompts[0].content, ENHANCE_PROMPT);
      options.monitor({ addEventListener(name, callback) { callback({ loaded: 0.5 }); } });
      return Promise.resolve({
        prompt() { assert.fail('never prompt base'); },
        async clone() {
          cloned++;
          return {
            async prompt(messages) {
              assert.deepEqual(messages, [{ role: 'user', content: JSON.stringify({ source }) }]);
              return ` ${source} `;
            },
            destroy() { destroyed++; },
          };
        },
        destroy() { baseDestroyed++; },
      });
    },
  };
  const preparation = createEnhancePreparation(state => states.push(state));
  assert.equal(created, 0);
  const pending = preparation.prepare();
  assert.equal(created, 1); // Still in the synchronous click stack.
  assert.equal(preparation.prepare(), pending);
  assert.notEqual(states.at(-1).phase, 'ready');
  await pending;
  assert.equal(states.at(-1).phase, 'ready');
  assert.equal(states[1].progress, 50);
  await preparation.prepare();
  for (let i = 0; i < 2; i++) assert.equal(await preparation.enhance(source), source);
  assert.equal(created, 1);
  assert.equal(cloned, 2);
  assert.equal(destroyed, 2);
  assert.equal(baseDestroyed, 0);
  preparation.dispose();
  assert.equal(baseDestroyed, 1);
});

test('prompt errors and empty output destroy clones', async () => {
  for (const result of [null, '']) {
    let destroyed = false;
    const base = { async clone() { return {
      async prompt() { if (result === null) throw new Error('failure'); return result; },
      destroy() { destroyed = true; },
    }; } };
    await assert.rejects(enhanceLocally(source, { base }));
    assert.equal(destroyed, true);
  }
});

test('generation cancellation destroys its clone, not the prepared base', async () => {
  const controller = new AbortController();
  let destroyed = 0, baseDestroyed = 0, preparationSignal;
  globalThis.LanguageModel = { async create({ signal }) {
    preparationSignal = signal;
    return {
      async clone() { return {
        prompt() { controller.abort(); return new Promise(() => {}); },
        destroy() { destroyed++; },
      }; },
      destroy() { baseDestroyed++; },
    };
  } };
  const preparation = createEnhancePreparation();
  await preparation.prepare();
  await assert.rejects(preparation.enhance(source, { signal: controller.signal }), { name: 'AbortError' });
  assert.equal(destroyed, 1);
  assert.equal(baseDestroyed, 0);
  assert.equal(preparationSignal.aborted, false);
  preparation.dispose();
  assert.equal(baseDestroyed, 1);
});

test('preparation timeout rejects hung create and destroys late session; retry works', async () => {
  let finish, destroyed = 0;
  const states = [];
  globalThis.LanguageModel = { create() { return new Promise(resolve => { finish = resolve; }); } };
  const preparation = createEnhancePreparation(state => states.push(state), { timeoutMs: 10 });
  await assert.rejects(preparation.prepare(), { name: 'TimeoutError' });
  assert.equal(states.at(-1).phase, 'error');
  finish({ destroy() { destroyed++; } });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(destroyed, 1);
  globalThis.LanguageModel.create = async () => ({ destroy() { destroyed++; } });
  await preparation.prepare();
  assert.equal(states.at(-1).phase, 'ready');
  preparation.dispose();
  assert.equal(destroyed, 2);
});

test('dispose during preparation cleans late session and allows StrictMode-style reuse', async () => {
  let finish, destroyed = 0;
  const states = [];
  globalThis.LanguageModel = { create() { return new Promise(resolve => { finish = resolve; }); } };
  const preparation = createEnhancePreparation(state => states.push(state));
  const pending = preparation.prepare();
  preparation.dispose();
  await assert.rejects(pending, { name: 'AbortError' });
  finish({ destroy() { destroyed++; } });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(destroyed, 1);
  assert.equal(states.some(state => state.phase === 'ready'), false);
  globalThis.LanguageModel.create = async () => ({ destroy() { destroyed++; } });
  await preparation.prepare();
  preparation.dispose();
  preparation.dispose();
  assert.equal(destroyed, 2);
});

test('clone failure invalidates base honestly and permits preparation retry', async () => {
  let destroyed = 0;
  const states = [];
  globalThis.LanguageModel = { async create() { return {
    async clone() { throw new Error('clone failed'); }, destroy() { destroyed++; },
  }; } };
  const preparation = createEnhancePreparation(state => states.push(state));
  await preparation.prepare();
  await assert.rejects(preparation.enhance(source), /clone failed/);
  assert.deepEqual(states.at(-1), { phase: 'error', error: ENHANCE_ERRORS.clone });
  assert.equal(destroyed, 1);
  await preparation.prepare();
  assert.equal(states.at(-1).phase, 'ready');
  preparation.dispose();
});

test('generation timeout destroys late clone without destroying base', async () => {
  let finish, destroyed = 0;
  const base = { clone() { return new Promise(resolve => { finish = resolve; }); } };
  await assert.rejects(enhanceLocally(source, { base, timeoutMs: 10 }), { name: 'TimeoutError' });
  finish({ destroy() { destroyed++; } });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(destroyed, 1);
});

test('preparation and generation have distinct timeout budgets', () => {
  assert.ok(ENHANCE_PREPARATION_TIMEOUT_MS >= 10 * 60 * 1000);
  assert.equal(ENHANCE_TIMEOUT_MS, 2 * 60 * 1000);
});

test('lifecycle cleanup cancels a pending clone and destroys its late result', async () => {
  let finish, baseDestroyed = 0, cloneDestroyed = 0;
  globalThis.LanguageModel = { async create() { return {
    clone() { return new Promise(resolve => { finish = resolve; }); },
    destroy() { baseDestroyed++; },
  }; } };
  const preparation = createEnhancePreparation();
  await preparation.prepare();
  const request = preparation.enhance(source);
  preparation.dispose();
  await assert.rejects(request, { name: 'AbortError' });
  finish({ destroy() { cloneDestroyed++; } });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(baseDestroyed, 1);
  assert.equal(cloneDestroyed, 1);
});

test('synchronous clone cancellation still cleans its late session', async () => {
  const controller = new AbortController();
  let destroyed = 0;
  const base = { clone() {
    controller.abort();
    return Promise.resolve({ destroy() { destroyed++; } });
  } };
  await assert.rejects(enhanceLocally(source, { base, signal: controller.signal }), { name: 'AbortError' });
  assert.equal(destroyed, 1);
});

test('pre-aborted request never clones', async () => {
  const base = { clone() { assert.fail(); } };
  await assert.rejects(enhanceLocally(source, { base, signal: AbortSignal.abort() }), { name: 'AbortError' });
});
