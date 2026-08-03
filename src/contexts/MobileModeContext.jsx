import { createContext, useContext, useState, useCallback } from 'react';

const MobileModeContext = createContext({
  mobileMode: false,
  sessionKey: 0,
  enterMobileMode: () => {},
  exitMobileMode: () => {},
});

export function MobileModeProvider({ children }) {
  const [mobileMode, setMobileMode] = useState(false);
  const [sessionKey, setSessionKey] = useState(0);

  const enterMobileMode = useCallback(() => {
    setSessionKey(k => k + 1);
    setMobileMode(true);
  }, []);

  const exitMobileMode = useCallback(() => {
    setMobileMode(false);
  }, []);

  return (
    <MobileModeContext.Provider value={{ mobileMode, sessionKey, enterMobileMode, exitMobileMode }}>
      {children}
    </MobileModeContext.Provider>
  );
}

export function useMobileModeContext() {
  return useContext(MobileModeContext);
}
