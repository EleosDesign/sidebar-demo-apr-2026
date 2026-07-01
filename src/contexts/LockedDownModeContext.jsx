import { createContext, useContext, useState, useEffect } from 'react';
import { useEhrContext } from './EhrContext.jsx';
import { useNoteTypeContext } from './NoteTypeContext.jsx';
import { CLIENT_LOCK_RULES } from '../data/lockedDownRules.js';

const LockedDownModeContext = createContext({
  lockedDownMode: false,
  setLockedDownMode: () => {},
});

export function LockedDownModeProvider({ children }) {
  const [lockedDownMode, setLockedDownMode] = useState(false);
  const { clientName } = useEhrContext();
  const { setSelectedNoteType } = useNoteTypeContext();

  useEffect(() => {
    if (!lockedDownMode) return;
    const rule = CLIENT_LOCK_RULES[clientName];
    if (rule?.noteType) setSelectedNoteType(rule.noteType);
  }, [lockedDownMode, clientName]);

  return (
    <LockedDownModeContext.Provider value={{ lockedDownMode, setLockedDownMode }}>
      {children}
    </LockedDownModeContext.Provider>
  );
}

export function useLockedDownModeContext() {
  return useContext(LockedDownModeContext);
}
