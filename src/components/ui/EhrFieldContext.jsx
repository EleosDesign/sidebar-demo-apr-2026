import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const EhrFieldContext = createContext(null);

export function EhrFieldProvider({ children, sidebarOpen = false }) {
  const [activeField, setActiveField] = useState(null);
  const [fieldValues, setFieldValues] = useState({ data: '', assessment: '', plan: '' });
  const [lqaStatus, setLqaStatus] = useState('idle'); // 'idle' | 'loading' | 'issues'
  const [changedSinceAnalysis, setChangedSinceAnalysis] = useState(false);

  // ── Enhance state ──────────────────────────────────────────────────────────
  const [enhanceActive, setEnhanceActive] = useState(false);
  const [enhanceField, setEnhanceField] = useState(null);  // which field is being enhanced
  const [enhanceLoading, setEnhanceLoading] = useState(false);

  const analyzedSnapshotRef = useRef(null);

  // Mark dirty whenever fieldValues change after analysis completes
  useEffect(() => {
    if (lqaStatus === 'issues' && analyzedSnapshotRef.current !== null) {
      const snap = analyzedSnapshotRef.current;
      const dirty = Object.keys(fieldValues).some(k => fieldValues[k] !== snap[k]);
      if (dirty) setChangedSinceAnalysis(true);
    }
  }, [fieldValues]); // eslint-disable-line

  // When analysis finishes → snapshot values and reset dirty flag
  useEffect(() => {
    if (lqaStatus === 'issues') {
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

  /**
   * Trigger the LQA quality-check flow from anywhere (e.g. after an AI enhance
   * on the Plan field). No-ops if a check is already in flight.
   */
  const triggerQualityCheck = () => {
    if (lqaStatus === 'loading') return;
    setLqaStatus('loading');
    setTimeout(() => setLqaStatus('issues'), 2800);
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
      sidebarOpen,
    }}>
      {children}
    </EhrFieldContext.Provider>
  );
}

export function useEhrField() {
  return useContext(EhrFieldContext);
}
