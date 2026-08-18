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
    <div ref={ref} style={{ position: 'relative', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
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
          padding: '10px',
          width: 220,
          zIndex: 101,
        }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8, paddingBottom: 7, borderBottom: '1px solid #f0f2f5' }}>
            Note Type
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {NOTE_TYPE_LIST.filter(({ id }) => id !== 'AngerManagementGroup').map(({ id, label }) => {
              const isActive = selectedNoteType === id;
              return (
                <button
                  key={id}
                  onClick={() => { setSelectedNoteType(id); setOpen(false); }}
                  style={{
                    padding: '7px 10px',
                    border: 'none',
                    borderRadius: 6,
                    background: isActive ? '#eef1fb' : 'transparent',
                    color: isActive ? '#1a3560' : '#444',
                    fontSize: 12,
                    fontWeight: isActive ? 600 : 400,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#f5f7fa'; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
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
        title="Switch note type"
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
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6, flexShrink: 0 }}>
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
        <span style={{ fontWeight: 600, letterSpacing: '0.01em' }}>{current?.label ?? 'DAP'}</span>
        <svg width="8" height="8" viewBox="0 0 10 10" fill="none" style={{ opacity: 0.5, flexShrink: 0 }}>
          <path d={open ? 'M2 7l3-3 3 3' : 'M2 3l3 3 3-3'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
}
