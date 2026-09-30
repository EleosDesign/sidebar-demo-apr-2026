import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { createEnhancePreparation } from '../components/enhance/localEnhance.js';
import EnhanceWelcome from '../components/enhance/EnhanceWelcome.jsx';

const EnhanceContext = createContext(null);

export function EnhanceProvider({ children }) {
  const [welcome, setWelcome] = useState(true);
  const [state, setState] = useState({ phase: 'off' });
  const preparation = useRef(null);
  if (!preparation.current) preparation.current = createEnhancePreparation(setState);
  useEffect(() => {
    const cleanup = () => preparation.current.dispose();
    const pagehide = () => { cleanup(); setState({ phase: 'off' }); };
    window.addEventListener('pagehide', pagehide);
    return () => { window.removeEventListener('pagehide', pagehide); cleanup(); };
  }, []);
  const enable = () => { preparation.current.prepare().catch(() => {}); };
  const proceed = enabled => {
    if (enabled) enable();
    setWelcome(false);
  };
  return (
    <EnhanceContext.Provider value={{ ready: state.phase === 'ready', enhance: (text, options) => preparation.current.enhance(text, options) }}>
      {children}
      <EnhanceWelcome welcome={welcome} state={state} onContinue={proceed} onEnable={enable} />
    </EnhanceContext.Provider>
  );
}

export function useEnhance() { return useContext(EnhanceContext); }
