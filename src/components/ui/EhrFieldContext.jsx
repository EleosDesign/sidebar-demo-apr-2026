import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const EhrFieldContext = createContext(null);

export function EhrFieldProvider({ children }) {
  const [activeField, setActiveField] = useState(null);
  const [fieldValues, setFieldValues] = useState({ data: '', assessment: '', plan: '' });
  const [lqaStatus, setLqaStatus] = useState('idle'); // 'idle' | 'loading' | 'issues'
  const [changedSinceAnalysis, setChangedSinceAnalysis] = useState(false);

  // ── Enhance mode state ─────────────────────────────────────────────────────
  const [enhanceModeField, setEnhanceModeField] = useState(null);  // fieldId being enhanced
  const [enhanceModeText, setEnhanceModeText] = useState('');       // original text
  const [pendingApply, setPendingApply] = useState(null);           // { fieldId, text } to apply back

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
   * Trigger the LQA quality-check flow from anywhere.
   * No-ops if a check is already in flight.
   */
  const triggerQualityCheck = () => {
    if (lqaStatus === 'loading') return;
    setLqaStatus('loading');
    setTimeout(() => setLqaStatus('issues'), 2800);
  };

  /**
   * Enter AI enhance mode for a specific field.
   * Opens the companion sidebar to the 'enhanced-text' panel.
   */
  const triggerEnhanceMode = (fieldId, text) => {
    setEnhanceModeField(fieldId);
    setEnhanceModeText(text || '');
  };

  /** Exit enhance mode without applying changes. */
  const clearEnhanceMode = () => {
    setEnhanceModeField(null);
    setEnhanceModeText('');
  };

  /**
   * Apply enhanced text back to the originating field.
   * StackedFields watches pendingApply and calls onNoteChange.
   */
  const applyEnhancedText = (fieldId, text) => {
    setPendingApply({ fieldId, text });
    clearEnhanceMode();
  };

  const clearPendingApply = () => setPendingApply(null);

  return (
    <EhrFieldContext.Provider value={{
      activeField, setActiveField,
      fieldValues, setFieldValues,
      appendToField,
      lqaStatus, setLqaStatus,
      changedSinceAnalysis, setChangedSinceAnalysis,
      // enhance mode
      enhanceModeField,
      enhanceModeText,
      pendingApply,
      triggerEnhanceMode,
      clearEnhanceMode,
      applyEnhancedText,
      clearPendingApply,
      triggerQualityCheck,
    }}>
      {children}
    </EhrFieldContext.Provider>
  );
}

export function useEhrField() {
  return useContext(EhrFieldContext);
}
