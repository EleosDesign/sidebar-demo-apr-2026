import { createContext, useContext, useState, useEffect } from 'react';
import { useEhrContext, supportsSmartScribeBranding } from './EhrContext.jsx';
import { useNoteTypeContext } from './NoteTypeContext.jsx';
import { CLIENT_LOCK_RULES } from '../data/lockedDownRules.js';
import { groupNoteForEhr, supportsGroupGO } from '../data/groupGoNote.js';
import { supportsPsychiatricNote } from '../data/psychiatricNote.js';

const LockedDownModeContext = createContext({
  lockedDownMode: true,
  setLockedDownMode: () => {},
});

export function LockedDownModeProvider({ children }) {
  const [lockedDownMode, setLockedDownMode] = useState(true);
  const { selectedEhr, clientName } = useEhrContext();
  const { selectedNoteType, setSelectedNoteType } = useNoteTypeContext();
  const coreNoteAllowed = supportsSmartScribeBranding(selectedEhr);

  useEffect(() => {
    if (!lockedDownMode) return;
    if (selectedNoteType === 'PsychiatricNote' && supportsPsychiatricNote(selectedEhr)) return;
    if (selectedNoteType === 'GroupGONote' && supportsGroupGO(selectedEhr)) return;
    const rule = CLIENT_LOCK_RULES[clientName];
    if (rule?.noteType === 'GroupNote' && supportsGroupGO(selectedEhr)) {
      setSelectedNoteType(groupNoteForEhr(selectedEhr));
      return;
    }
    if ((clientName === 'Oviedo, Marlene' || clientName === 'Marlene Oviedo') && supportsPsychiatricNote(selectedEhr)) {
      setSelectedNoteType('PsychiatricNote');
      return;
    }
    if (selectedNoteType === 'IndividualServiceNote' && coreNoteAllowed) return;
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
