import React, { createContext, useContext, useState } from 'react';

const EhrContext = createContext({ selectedEhr: 'welligent', setSelectedEhr: () => {} });

export const useEhrContext = () => useContext(EhrContext);

export function EhrProvider({ children }) {
  const [selectedEhr, setSelectedEhr] = useState('welligent');
  return (
    <EhrContext.Provider value={{ selectedEhr, setSelectedEhr }}>
      {children}
    </EhrContext.Provider>
  );
}
