/**
 * DurationPill — "Suggested: 45 min" animated pill with AI Timeline Analysis dropdown
 * Customised for Ryan Cho's 4:00–4:45 PM session.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useSmartScribeSkin, smartScribeColor, smartScribeRgb } from '../../contexts/EhrContext.jsx';

const SUGGESTED_LABEL = 'Suggested: 45 min';

const TIMELINE_ITEMS = [
  { time: '4:00 PM', label: 'Session Started' },
  { time: '4:06 PM', label: 'Check-In & Status Review' },
  { time: '4:15 PM', label: 'Distress Tolerance (TIPP Technique)' },
  { time: '4:28 PM', label: 'Safety Plan Review' },
  { time: '4:38 PM', label: 'Coping Skills Wrap-Up' },
  { time: '4:45 PM', label: 'Session Ended' },
];

export default function DurationPill() {
  const smartScribeSkin = useSmartScribeSkin();
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

  return (
    <div
      ref={ref}
      style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '8px 16px 0',
        position: 'relative',
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      {/* ── Pill button ── */}
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 18px',
          borderRadius: 20,
          background: 'linear-gradient(135deg, #f0f3ff, #f5f0ff)',
          border: '1.5px solid #c5caf5',
          boxShadow: `0 2px 8px rgba(${smartScribeRgb(smartScribeSkin, '45,76,205')},0.12)`,
          cursor: 'pointer',
        }}
      >
        {/* Animated star cluster */}
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, overflow: 'visible', animation: 'durIconEnter 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both' }}>
          <g style={{ transformOrigin: '12px 10px', animation: 'durStarMain 3s ease-in-out infinite' }}>
            <path d="M12 2L13.8 8.2L20 10L13.8 11.8L12 18L10.2 11.8L4 10L10.2 8.2L12 2Z" fill={smartScribeColor(smartScribeSkin, '#2D4CCD')} />
          </g>
          <g style={{ animation: 'durStarTwinkle1 2s ease-in-out infinite', animationDelay: '0.4s' }}>
            <path d="M19 15L19.9 17.1L22 18L19.9 18.9L19 21L18.1 18.9L16 18L18.1 17.1L19 15Z" fill={smartScribeColor(smartScribeSkin, '#2D4CCD')} opacity="0.6" />
          </g>
          <g style={{ animation: 'durStarTwinkle2 2s ease-in-out infinite', animationDelay: '0.8s' }}>
            <path d="M5 3L5.7 4.8L7.5 5.5L5.7 6.2L5 8L4.3 6.2L2.5 5.5L4.3 4.8L5 3Z" fill={smartScribeColor(smartScribeSkin, '#2D4CCD')} opacity="0.4" />
          </g>
        </svg>

        {/* Shimmer label */}
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            backgroundImage: `linear-gradient(90deg, ${smartScribeColor(smartScribeSkin, '#2D4CCD')} 0%, #7B5CF5 50%, ${smartScribeColor(smartScribeSkin, '#2D4CCD')} 100%)`,
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'shimmerText 2.5s linear infinite',
          }}
        >
          {SUGGESTED_LABEL}
        </span>

        {/* Chevron */}
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          style={{ flexShrink: 0, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <path d="M7 10l5 5 5-5H7z" fill="#7B5CF5" />
        </svg>
      </button>

      {/* ── Dropdown ── */}
      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 270,
            background: '#fff',
            borderRadius: 16,
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            padding: '16px 20px 20px',
            zIndex: 100,
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke={smartScribeColor(smartScribeSkin, '#2D4CCD')} strokeWidth="1.8" />
              <path d="M12 7v5l3 3" stroke={smartScribeColor(smartScribeSkin, '#2D4CCD')} strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a', fontFamily: "'Poppins', sans-serif" }}>
              AI Timeline Analysis
            </span>
          </div>

          {/* Timeline */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {TIMELINE_ITEMS.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, position: 'relative' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: 10 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', border: `2px solid ${smartScribeColor(smartScribeSkin, '#2D4CCD')}`, background: '#fff', flexShrink: 0 }} />
                  {i < TIMELINE_ITEMS.length - 1 && (
                    <div style={{ width: 2, flex: 1, background: '#dde4ff', minHeight: 22 }} />
                  )}
                </div>
                <div style={{ display: 'flex', gap: 10, paddingBottom: i < TIMELINE_ITEMS.length - 1 ? 10 : 0, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: smartScribeColor(smartScribeSkin, '#2D4CCD'), fontFamily: "'Poppins', sans-serif", minWidth: 58 }}>
                    {item.time}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#1a1a1a', fontFamily: "'Poppins', sans-serif" }}>
                    {item.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
