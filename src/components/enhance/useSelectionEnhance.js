import { useLayoutEffect, useRef, useState } from 'react';
import { useEnhance } from '../../contexts/EnhanceContext.jsx';
import { replaceCapturedRange, validateSelection } from './enhanceSelection.js';
import { ENHANCE_ERRORS } from '../../data/enhanceConfig.js';

export function useSelectionEnhance(noteValues, identity, onChange) {
  const ai = useEnhance();
  const [state, setState] = useState(null);
  const active = useRef(null);
  const version = JSON.stringify([identity, noteValues]);
  const latest = useRef(version);
  latest.current = version;

  const dismiss = () => {
    active.current?.controller?.abort();
    active.current = null;
    setState(null);
  };
  const dismissAndFocus = () => {
    const textarea = active.current?.textarea;
    dismiss();
    textarea?.focus();
  };
  useLayoutEffect(() => {
    dismiss();
    return () => {
      active.current?.controller?.abort();
      active.current = null;
    };
  }, [version]);

  const select = (id, textarea) => {
    const { selectionStart: start, selectionEnd: end, value } = textarea;
    const previous = active.current;
    if (previous?.id === id && previous.start === start && previous.end === end && previous.value === value) return;
    dismiss();
    if (start === end) return;
    const capture = { id, start, end, value, version, textarea, phase: 'selected' };
    active.current = capture;
    setState(capture);
  };
  const isCurrent = capture => active.current === capture && latest.current === capture.version;
  const enhance = async () => {
    const capture = active.current;
    if (!ai.ready || !capture || !isCurrent(capture) || capture.controller) return;
    const text = capture.value.slice(capture.start, capture.end);
    const error = validateSelection(text);
    if (error) { setState({ ...capture, phase: 'error', error }); return; }
    capture.controller = new AbortController();
    setState({ ...capture, phase: 'loading' });
    try {
      const result = await ai.enhance(text, { signal: capture.controller.signal });
      if (isCurrent(capture)) setState({ ...capture, phase: 'preview', result });
    } catch (error) {
      if (isCurrent(capture)) setState({ ...capture, phase: 'error', error:
        error.name === 'TimeoutError' ? ENHANCE_ERRORS.timeout :
          Object.values(ENHANCE_ERRORS).includes(error.message) ? error.message : ENHANCE_ERRORS.failed });
    } finally {
      capture.controller = null;
    }
  };
  const apply = () => {
    const capture = active.current;
    if (!capture || !isCurrent(capture) || state?.phase !== 'preview') return;
    const replacement = replaceCapturedRange(noteValues[capture.id] ?? '', capture, state.result);
    if (replacement === null) { dismiss(); return; }
    dismiss();
    onChange(capture.id, replacement);
    capture.textarea.focus();
  };
  return { state: ai.ready && state?.version === version ? state : null, select, enhance, apply, dismiss, dismissAndFocus };
}
