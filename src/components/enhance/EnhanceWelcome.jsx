import { useEffect, useRef, useState } from 'react';
import { ENHANCE_WELCOME as copy } from '../../data/enhanceConfig.js';
import './enhanceWelcome.css';

export default function EnhanceWelcome({ welcome, onContinue }) {
  const dialog = useRef(null);
  const [enabled, setEnabled] = useState(true);
  useEffect(() => {
    const element = dialog.current;
    if (welcome) element.showModal();
    return () => element?.close();
  }, [welcome]);
  return welcome && <dialog ref={dialog} className="enhance-welcome" aria-labelledby="enhance-welcome-title" aria-describedby="enhance-welcome-description" onCancel={event => event.preventDefault()}>
    <h1 id="enhance-welcome-title">{copy.title}</h1>
    <p id="enhance-welcome-description">{copy.description}</p>
    <label><input type="checkbox" checked={enabled} onChange={event => setEnabled(event.target.checked)} autoFocus /> {copy.checkbox}</label>
    <button type="button" onClick={() => onContinue(enabled)}>{copy.continue}</button>
  </dialog>;
}

export function EnhanceStatus({ state, onEnable }) {
  return <aside className="enhance-ai-status" aria-label="Enhance AI">
    <span role="status">{state.phase === 'ready' ? copy.ready : state.phase === 'preparing' ? (state.progress == null ? copy.preparing : copy.progress(state.progress)) : state.phase === 'error' ? state.error : copy.skipped}</span>
    {(state.phase === 'off' || state.phase === 'error') && <button type="button" onClick={onEnable}>{state.phase === 'error' ? copy.retry : copy.enable}</button>}
  </aside>;
}
