import React, { useState, useRef, useEffect } from 'react';
import { useEhrContext } from '../../contexts/EhrContext.jsx';
import { EHR_LABELS } from './EhrBackgrounds.jsx';

const EHR_LIST = [
  { id: 'welligent',  label: 'Welligent' },
  { id: 'arize',      label: 'Arize' },
  { id: 'echo',       label: 'Echo' },
  { id: 'credible',   label: 'Qualifacts Credible' },
  { id: 'insync',     label: 'Qualifacts Insync' },
  { id: 'carlogic',   label: 'Qualifacts Carelogic' },
  { id: 'myevolve',   label: 'myEvolv' },
  { id: 'myavatar',   label: 'myAvatar' },
  { id: 'kipu',       label: 'Kipu' },
  { id: 'foothold',   label: 'Foothold' },
  { id: 'exym',       label: 'Exym' },
  { id: 'pce',        label: 'PCE' },
  { id: 'eleos-lite', label: 'Eleos Lite' },
  { id: 'streamline', label: 'Streamline' },
];

export default function EhrSelector() {
  const { selectedEhr, setSelectedEhr } = useEhrContext();
  const [open, setOpen] = useState(false);
  const popoverRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const currentLabel = EHR_LABELS[selectedEhr] ?? 'EHR';

  return (
    <div ref={popoverRef} style={{ position: 'relative', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      {/* Popover — opens upward */}
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 10px)',
          left: 0,
          background: '#fff',
          border: '1px solid #e4e8ee',
          borderRadius: 12,
          boxShadow: '0 4px 24px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
          padding: '12px',
          width: 'max-content',
          minWidth: 280,
          zIndex: 101,
        }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8, paddingBottom: 7, borderBottom: '1px solid #f0f2f5' }}>
            EHR Background
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(64px, 1fr))', gap: 5 }}>
            {EHR_LIST.map(({ id, label }) => {
              const isActive = selectedEhr === id;
              return (
                <button
                  key={id}
                  onClick={() => { setSelectedEhr(id); setOpen(false); }}
                  style={{
                    padding: '6px 4px',
                    border: 'none',
                    borderRadius: 6,
                    background: isActive ? '#1a3560' : '#f5f7fa',
                    color: isActive ? '#fff' : '#444',
                    fontSize: 11,
                    fontWeight: isActive ? 600 : 400,
                    cursor: 'pointer',
                    textAlign: 'center',
                    lineHeight: 1.3,
                    transition: 'background 0.1s',
                    outline: isActive ? 'none' : undefined,
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#eaecf2'; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = '#f5f7fa'; }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Trigger */}
      <button
        onClick={() => setOpen(v => !v)}
        title="Switch EHR background"
        style={{
          display: 'flex', alignItems: 'center', gap: 4,
          padding: '5px 9px 5px 7px',
          background: open ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)',
          border: '1px solid rgba(255,255,255,0.65)',
          borderRadius: 12,
          cursor: 'pointer',
          fontSize: 11,
          fontWeight: 500,
          color: '#1a3560',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          whiteSpace: 'nowrap',
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => { if (!open) e.currentTarget.style.background = 'rgba(255,255,255,0.8)'; }}
        onMouseLeave={e => { if (!open) e.currentTarget.style.background = 'rgba(255,255,255,0.5)'; }}
      >
        <svg width="11" height="11" viewBox="0 0 16 16" fill="none" style={{ opacity: 0.6, flexShrink: 0 }}>
          <rect x="0" y="0" width="6" height="6" rx="1" fill="currentColor"/>
          <rect x="8" y="0" width="6" height="6" rx="1" fill="currentColor"/>
          <rect x="0" y="8" width="6" height="6" rx="1" fill="currentColor"/>
          <rect x="8" y="8" width="6" height="6" rx="1" fill="currentColor"/>
        </svg>
        <span style={{ fontWeight: 600, letterSpacing: '0.01em' }}>{currentLabel}</span>
        <svg width="8" height="8" viewBox="0 0 10 10" fill="none" style={{ opacity: 0.5, flexShrink: 0 }}>
          <path d={open ? 'M2 7l3-3 3 3' : 'M2 3l3 3 3-3'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
}
