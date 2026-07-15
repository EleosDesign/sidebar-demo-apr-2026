import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const EhrFieldContext = createContext(null);

export function EhrFieldProvider({ children, sidebarOpen = false }) {
  const [activeField, setActiveField] = useState(null);
  const [fieldValues, setFieldValues] = useState({ data: '', assessment: '', plan: '' });
  const [lqaStatus, setLqaStatus] = useState('idle'); // 'idle' | 'loading' | 'issues'
  const [changedSinceAnalysis, setChangedSinceAnalysis] = useState(false);
  const [noteHasContent, setNoteHasContent] = useState(false);

  // ── Enhance state ──────────────────────────────────────────────────────────
  const [enhanceActive, setEnhanceActive] = useState(false);
  const [enhanceField, setEnhanceField] = useState(null);  // which field is being enhanced
  const [enhanceLoading, setEnhanceLoading] = useState(false);

  const analyzedSnapshotRef = useRef(null);

  const analysisComplete = lqaStatus === 'issues' || lqaStatus === 'success' || lqaStatus === 'error';

  // Mark dirty whenever fieldValues change after analysis completes
  useEffect(() => {
    if (analysisComplete && analyzedSnapshotRef.current !== null) {
      const snap = analyzedSnapshotRef.current;
      const dirty = Object.keys(fieldValues).some(k => fieldValues[k] !== snap[k]);
      if (dirty) setChangedSinceAnalysis(true);
    }
  }, [fieldValues]); // eslint-disable-line

  // When analysis finishes → snapshot values and reset dirty flag
  useEffect(() => {
    if (analysisComplete) {
      analyzedSnapshotRef.current = { ...fieldValues };
      setChangedSinceAnalysis(false);
    }
    if (lqaStatus === 'loading') {
      setChangedSinceAnalysis(false);
    }
  }, [lqaStatus]); // eslint-disable-line

  const appendToField = (field, text) => {
    setFieldValues(prev => ({
      ...prev,
      [field]: prev[field] ? prev[field] + '\n' + text : text,
    }));
  };

  const analysisTimerRef = useRef(null);

  useEffect(() => () => clearTimeout(analysisTimerRef.current), []);

  // Run a quality check and resolve to `finalStatus` after `duration` ms.
  const triggerQualityCheck = ({ duration = 2800, finalStatus = 'issues' } = {}) => {
    clearTimeout(analysisTimerRef.current);
    setLqaStatus('loading');
    analysisTimerRef.current = setTimeout(() => setLqaStatus(finalStatus), duration);
  };

  const notifyNoteChange = () => {
    if (analysisComplete) setChangedSinceAnalysis(true);
  };

  return (
    <EhrFieldContext.Provider value={{
      activeField, setActiveField,
      fieldValues, setFieldValues,
      appendToField,
      lqaStatus, setLqaStatus,
      changedSinceAnalysis, setChangedSinceAnalysis,
      // enhance
      enhanceActive, setEnhanceActive,
      enhanceField, setEnhanceField,
      enhanceLoading, setEnhanceLoading,
      triggerQualityCheck,
      notifyNoteChange,
      noteHasContent, setNoteHasContent,
      sidebarOpen,
    }}>
      {children}
    </EhrFieldContext.Provider>
  );
}

export function useEhrField() {
  return useContext(EhrFieldContext);
}
