import React from 'react';
import { useLockedDownModeContext } from '../../contexts/LockedDownModeContext.jsx';

export default function LockedDownModeToggle() {
  const { lockedDownMode, setLockedDownMode } = useLockedDownModeContext();

  return (
    <button
      onClick={() => setLockedDownMode(v => !v)}
      title="Demo Mode"
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '5px 9px 5px 7px',
        background: lockedDownMode ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)',
        border: '1px solid rgba(255,255,255,0.65)',
        borderRadius: 12,
        cursor: 'pointer',
        fontSize: 11,
        fontWeight: 600,
        color: '#1a3560',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        whiteSpace: 'nowrap',
        transition: 'background 0.15s',
      }}
      onMouseEnter={e => { if (!lockedDownMode) e.currentTarget.style.background = 'rgba(255,255,255,0.8)'; }}
      onMouseLeave={e => { if (!lockedDownMode) e.currentTarget.style.background = 'rgba(255,255,255,0.5)'; }}
    >
      <span style={{
        display: 'inline-flex', alignItems: 'center', width: 20, height: 12,
        borderRadius: 6, background: lockedDownMode ? '#1a3560' : 'rgba(26,53,96,0.25)',
        transition: 'background 0.15s', flexShrink: 0, padding: 1,
      }}>
        <span style={{
          width: 10, height: 10, borderRadius: '50%', background: '#fff',
          transform: lockedDownMode ? 'translateX(8px)' : 'translateX(0)',
          transition: 'transform 0.15s',
        }} />
      </span>
      Demo Mode
    </button>
  );
}
