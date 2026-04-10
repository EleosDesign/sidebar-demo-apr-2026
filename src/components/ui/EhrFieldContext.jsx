import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const EhrFieldContext = createContext(null);

export function EhrFieldProvider({ children }) {
  const [activeField, setActiveField] = useState(null);
  const [fieldValues, setFieldValues] = useState({ data: '', assessment: '', plan: '' });
  const [lqaStatus, setLqaStatus] = useState('idle'); // 'idle' | 'loading' | 'issues'
  const [changedSinceAnalysis, setChangedSinceAnalysis] = useState(false);

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

  return (
    <EhrFieldContext.Provider value={{
      activeField, setActiveField,
      fieldValues, setFieldValues,
      appendToField,
      lqaStatus, setLqaStatus,
      changedSinceAnalysis, setChangedSinceAnalysis,
    }}>
      {children}
    </EhrFieldContext.Provider>
  );
}

export function useEhrField() {
  return useContext(EhrFieldContext);
}
