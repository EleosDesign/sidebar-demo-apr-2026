import React, { useState, useRef, useEffect } from 'react';
import { useNoteTypeContext, NOTE_TYPE_LIST } from '../../contexts/NoteTypeContext.jsx';

export default function NoteTypeSelector() {
  const { selectedNoteType, setSelectedNoteType } = useNoteTypeContext();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const current = NOTE_TYPE_LIST.find(n => n.id === selectedNoteType);

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed',
        top: 12,
        right: 210,   // sits left of EhrSelector
        zIndex: 50,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* Popover */}
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          background: '#fff',
          border: '1px solid #e0e4e8',
          borderRadius: 10,
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          padding: '12px',
          width: 300,
          zIndex: 51,
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid #f0f0f0' }}>
            Select Note Type
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {NOTE_TYPE_LIST.map(({ id, label }) => {
              const isActive = selectedNoteType === id;
              return (
                <button
                  key={id}
                  onClick={() => { setSelectedNoteType(id); setOpen(false); }}
                  style={{
                    padding: '8px 12px',
                    border: isActive ? '1.5px solid #1a3560' : '1px solid #e0e4e8',
                    borderRadius: 6,
                    background: isActive ? '#1a3560' : '#f8f9fb',
                    color: isActive ? '#fff' : '#333',
                    fontSize: 12,
                    fontWeight: isActive ? 600 : 400,
                    cursor: 'pointer',
                    textAlign: 'left',
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
          whiteSpace: 'nowrap',
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8a9aaa" strokeWidth="2" strokeLinecap="round">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
        <span style={{ color: '#666', marginRight: 2 }}>Note:</span>
        <span style={{ color: '#1a3560', fontWeight: 600 }}>{current?.label ?? 'DAP'}</span>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ marginLeft: 2 }}>
          <path d={open ? 'M2 7l3-3 3 3' : 'M2 3l3 3 3-3'} stroke="#888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
}
