import { ENHANCE_ERRORS, ENHANCE_MODEL_OPTIONS, ENHANCE_PROMPT, ENHANCE_TIMEOUT_MS, ENHANCE_PREPARATION_TIMEOUT_MS } from '../../data/enhanceConfig.js';
import { validateSelection } from './enhanceSelection.js';

// Both browser operations can ignore abort. Race them, and destroy late sessions.
function operation(signal, timeoutMs, message) {
  const controller = new AbortController();
  const abort = () => controller.abort(signal.reason);
  signal?.addEventListener('abort', abort, { once: true });
  if (signal?.aborted) abort();
  const timer = setTimeout(() => controller.abort(new DOMException(message, 'TimeoutError')), timeoutMs);
  let rejectAbort;
  const aborted = new Promise((_, reject) => { rejectAbort = reject; });
  const onAbort = () => rejectAbort(controller.signal.reason);
  controller.signal.addEventListener('abort', onAbort, { once: true });
  // Avoid an unhandled rejection if an API throws synchronously.
  aborted.catch(() => {});
  return {
    signal: controller.signal,
    wait(promise) {
      return Promise.race([promise, controller.signal.aborted ? Promise.reject(controller.signal.reason) : aborted]);
    },
    session(promise) {
      return this.wait(Promise.resolve(promise).then(session => {
        if (controller.signal.aborted) { session.destroy(); throw controller.signal.reason; }
        return session;
      }));
    },
    close() {
      clearTimeout(timer);
      signal?.removeEventListener('abort', abort);
      controller.signal.removeEventListener('abort', onAbort);
    },
  };
}

export function createEnhancePreparation(onState = () => {}, { timeoutMs = ENHANCE_PREPARATION_TIMEOUT_MS } = {}) {
  let base;
  let pending;
  let lifetime = new AbortController();
  const fail = error => ({ phase: 'error', error: error?.name === 'TimeoutError' ? ENHANCE_ERRORS.preparationTimeout : ENHANCE_ERRORS.unavailable });
  return {
    prepare() {
      if (base) return Promise.resolve(base);
      if (pending) return pending;
      const signal = lifetime.signal;
      const task = operation(signal, timeoutMs, ENHANCE_ERRORS.preparationTimeout);
      onState({ phase: 'preparing' });
      // Deliberately call create BEFORE any await/availability: retain click activation.
      let creation;
      let preparing = true;
      try {
        if (!globalThis.LanguageModel?.create) throw new Error(ENHANCE_ERRORS.unavailable);
        creation = task.session(globalThis.LanguageModel.create({
          ...ENHANCE_MODEL_OPTIONS,
          signal: task.signal,
          initialPrompts: [{ role: 'system', content: ENHANCE_PROMPT }],
          monitor(monitor) {
            monitor.addEventListener('downloadprogress', event => {
              if (preparing && !task.signal.aborted && !signal.aborted) onState({ phase: 'preparing', progress: Math.round(Math.min(1, Math.max(0, event.loaded)) * 100) });
            });
          },
        }));
      } catch (error) { creation = Promise.reject(error); }
      pending = creation.then(session => {
        if (signal.aborted) { session.destroy(); throw signal.reason; }
        base = session;
        onState({ phase: 'ready' });
        return session;
      }).catch(error => {
        if (!signal.aborted) onState(fail(error));
        throw error;
      }).finally(() => {
        preparing = false;
        task.close();
        if (lifetime.signal === signal) pending = null;
      });
      return pending;
    },
    async enhance(text, options = {}) {
      if (!base) throw new Error(ENHANCE_ERRORS.unavailable);
      const session = base;
      return enhanceLocally(text, {
        ...options,
        base: session,
        lifetimeSignal: lifetime.signal,
        onCloneError() {
          if (base !== session) return;
          base = null;
          session.destroy();
          onState({ phase: 'error', error: ENHANCE_ERRORS.clone });
        },
      });
    },
    dispose() {
      lifetime.abort();
      lifetime = new AbortController();
      base?.destroy();
      base = null;
      pending = null;
    },
  };
}

// Never prompt the clean base: each selection owns a disposable clone.
export async function enhanceLocally(text, { base, signal, lifetimeSignal, onCloneError, timeoutMs = ENHANCE_TIMEOUT_MS } = {}) {
  const validation = validateSelection(text);
  if (validation) throw new Error(validation);
  const combined = lifetimeSignal && signal ? AbortSignal.any([signal, lifetimeSignal]) : signal || lifetimeSignal;
  const task = operation(combined, timeoutMs, ENHANCE_ERRORS.timeout);
  let session;
  try {
    task.signal.throwIfAborted();
    if (!base) throw new Error(ENHANCE_ERRORS.unavailable);
    try {
      session = await task.session(base.clone({ signal: task.signal }));
    } catch (error) {
      if (!task.signal.aborted || error?.name === 'TimeoutError') onCloneError?.();
      throw error;
    }
    task.signal.throwIfAborted();
    const result = await task.wait(session.prompt([{ role: 'user', content: JSON.stringify({ source: text }) }], { signal: task.signal }));
    if (typeof result !== 'string' || !result.trim()) throw new Error(ENHANCE_ERRORS.failed);
    return result.trim();
  } finally {
    task.close();
    session?.destroy();
  }
}
