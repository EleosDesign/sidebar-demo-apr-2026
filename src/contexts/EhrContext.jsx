import React, { createContext, useContext, useState } from 'react';

const EhrContext = createContext({ selectedEhr: 'welligent', setSelectedEhr: () => {}, clientName: 'Webb, Marcus', setClientName: () => {} });

export const useEhrContext = () => useContext(EhrContext);

// EHR backgrounds that render the same underlying SmartCare product (ADR-0005) and
// share the Companion Sidebar's navy "SmartScribe skin" (ADR-0006).
const SMARTSCRIBE_SKIN_EHRS = new Set(['streamline', 'calmhsa']);

export const useSmartScribeSkin = () => {
  const { selectedEhr } = useEhrContext();
  return SMARTSCRIBE_SKIN_EHRS.has(selectedEhr);
};

export function EhrProvider({ children }) {
  const [selectedEhr, setSelectedEhr] = useState('welligent');
  const [clientName, setClientName] = useState('Webb, Marcus');
  return (
    <EhrContext.Provider value={{ selectedEhr, setSelectedEhr, clientName, setClientName }}>
      {children}
    </EhrContext.Provider>
  );
}
