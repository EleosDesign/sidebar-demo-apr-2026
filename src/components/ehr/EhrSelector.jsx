/**
 * EhrSelector.jsx
 * Floating bottom-left pill button that lets the user switch the EHR background.
 * Rendered only for clinician-skin scenes (see Shell.jsx).
 */
import React, { useState, useRef, useEffect } from 'react';
import { useEhrContext } from '../../contexts/EhrContext.jsx';
import { EHR_LABELS } from './EhrBackgrounds.jsx';

const EHR_LIST = [
  { id: 'welligent',    label: 'Welligent' },
  { id: 'qualifacts',   label: 'Qualifacts' },
  { id: 'arize',        label: 'Arize' },
  { id: 'echo',         label: 'Echo' },
  { id: 'credible',     label: 'Credible' },
  { id: 'insync',       label: 'Insync' },
  { id: 'carlogic',     label: 'Carelogic' },
  { id: 'myevolve',     label: 'myEvolv' },
  { id: 'myavatar',     label: 'myAvatar' },
  { id: 'kipu',         label: 'Kipu' },
  { id: 'foothold',     label: 'Foothold' },
  { id: 'exym',         label: 'Exym' },
  { id: 'netsmart',     label: 'Netsmart' },
  { id: 'pce',          label: 'PCE' },
  { id: 'eleos-lite',   label: 'Eleos Lite' },
  { id: 'streamline',   label: 'Streamline' },
];

export default function EhrSelector() {
  const { selectedEhr, setSelectedEhr } = useEhrContext();
  const [open, setOpen] = useState(false);
  const popoverRef = useRef(null);

  // Close popover when clicking outside
  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const currentLabel = EHR_LABELS[selectedEhr] ?? 'EHR';

  return (
    <div
      ref={popoverRef}
      style={{
        position: 'fixed',
        top: 12,
        right: 16,
        zIndex: 50,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* Popover grid */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            background: '#fff',
            border: '1px solid #e0e4e8',
            borderRadius: 10,
            boxShadow: '0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.1)',
            padding: '12px',
            width: 280,
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid #f0f0f0' }}>
            Select EHR Background
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
            {EHR_LIST.map(({ id, label }) => {
              const isActive = selectedEhr === id;
              return (
                <button
                  key={id}
                  onClick={() => { setSelectedEhr(id); setOpen(false); }}
                  style={{
                    padding: '7px 4px',
                    border: isActive ? '1.5px solid #1a3560' : '1px solid #e0e4e8',
                    borderRadius: 6,
                    background: isActive ? '#1a3560' : '#f8f9fb',
                    color: isActive ? '#fff' : '#333',
                    fontSize: 11,
                    fontWeight: isActive ? 600 : 400,
                    cursor: 'pointer',
                    textAlign: 'center',
                    lineHeight: 1.3,
                    transition: 'all 0.15s',
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Trigger pill */}
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '7px 14px 7px 10px',
          background: 'rgba(255,255,255,0.92)',
          border: '1px solid #d0d8e4',
          borderRadius: 20,
          boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          cursor: 'pointer',
          fontSize: 12,
          fontWeight: 500,
          color: '#333',
          backdropFilter: 'blur(8px)',
          transition: 'box-shadow 0.15s',
        }}
      >
        {/* Grid icon */}
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
          <rect x="0" y="0" width="6" height="6" rx="1" fill="#8a9aaa"/>
          <rect x="8" y="0" width="6" height="6" rx="1" fill="#8a9aaa"/>
          <rect x="0" y="8" width="6" height="6" rx="1" fill="#8a9aaa"/>
          <rect x="8" y="8" width="6" height="6" rx="1" fill="#8a9aaa"/>
        </svg>
        <span style={{ color: '#666', marginRight: 2 }}>EHR:</span>
        <span style={{ color: '#1a3560', fontWeight: 600 }}>{currentLabel}</span>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ marginLeft: 2 }}>
          <path d={open ? 'M2 7l3-3 3 3' : 'M2 3l3 3 3-3'} stroke="#888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
}
