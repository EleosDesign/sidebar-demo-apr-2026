import React, { createContext, useContext, useState } from 'react';

const EhrContext = createContext({ selectedEhr: 'welligent', setSelectedEhr: () => {}, clientName: 'Webb, Marcus', setClientName: () => {} });

export const useEhrContext = () => useContext(EhrContext);

export function EhrProvider({ children }) {
  const [selectedEhr, setSelectedEhr] = useState('welligent');
  const [clientName, setClientName] = useState('Webb, Marcus');
  return (
    <EhrContext.Provider value={{ selectedEhr, setSelectedEhr, clientName, setClientName }}>
      {children}
    </EhrContext.Provider>
  );
}
