import React from 'react';

// Dev-only control, floated at the bottom-left of the screen: fires the same
// window-event pattern as the EhrBackgrounds inline CTAs (eleos:openSidebar /
// eleos:openQuality) so it can reach EleosSidebar's alert state without prop-drilling.
export default function SidebarAlertDevTrigger() {
  return (
    <button
      onClick={() => window.dispatchEvent(new CustomEvent('eleos:showSidebarAlert'))}
      title="Trigger sidebar alert"
      style={{
        display: 'flex', alignItems: 'center', gap: 7,
        padding: '9px 14px 9px 10px',
        background: 'rgba(255,255,255,0.9)',
        border: '1px solid rgba(255,255,255,0.65)',
        borderRadius: 14,
        cursor: 'pointer',
        fontFamily: 'Poppins, sans-serif',
        fontSize: 12,
        fontWeight: 600,
        color: '#1a3560',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        whiteSpace: 'nowrap',
        boxShadow: '0 4px 16px rgba(23,44,55,0.24)',
        transition: 'background 0.15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = '#fff'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.9)'; }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1a3560" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 01-3.46 0" />
      </svg>
      Test Alert
    </button>
  );
}
