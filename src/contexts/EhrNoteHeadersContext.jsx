import { createContext, useContext, useState } from 'react';

const EhrNoteHeadersContext = createContext({
  useEhrNoteHeaders: false,
  setUseEhrNoteHeaders: () => {},
});

export function EhrNoteHeadersProvider({ children }) {
  const [useEhrNoteHeaders, setUseEhrNoteHeaders] = useState(false);
  return (
    <EhrNoteHeadersContext.Provider value={{ useEhrNoteHeaders, setUseEhrNoteHeaders }}>
      {children}
    </EhrNoteHeadersContext.Provider>
  );
}

export function useEhrNoteHeadersContext() {
  return useContext(EhrNoteHeadersContext);
}
