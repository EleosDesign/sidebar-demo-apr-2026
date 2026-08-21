import { createContext, useContext, useState, useEffect } from 'react';
import { useEhrContext } from './EhrContext.jsx';
import { useNoteTypeContext } from './NoteTypeContext.jsx';
import { CLIENT_LOCK_RULES } from '../data/lockedDownRules.js';

const LockedDownModeContext = createContext({
  lockedDownMode: true,
  setLockedDownMode: () => {},
});

export function LockedDownModeProvider({ children }) {
  const [lockedDownMode, setLockedDownMode] = useState(true);
  const { selectedEhr, clientName } = useEhrContext();
  const { setSelectedNoteType } = useNoteTypeContext();

  useEffect(() => {
    if (!lockedDownMode) return;
    const rule = CLIENT_LOCK_RULES[clientName];
    const noteType = clientName === 'Murphy, Calvin' && selectedEhr === 'calmhsa'
      ? 'ProgressNote'
      : rule?.noteType;
    if (noteType) setSelectedNoteType(noteType);
  }, [lockedDownMode, selectedEhr, clientName]);

  return (
    <LockedDownModeContext.Provider value={{ lockedDownMode, setLockedDownMode }}>
      {children}
    </LockedDownModeContext.Provider>
  );
}

export function useLockedDownModeContext() {
  return useContext(LockedDownModeContext);
}
