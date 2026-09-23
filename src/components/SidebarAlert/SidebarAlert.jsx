import React from 'react';

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// Fixed banner shown above the sidebar's per-screen header. Rendered as the first
// child of the content column so the header card that follows (zIndex 2, no top
// offset within its own panel root) naturally overlaps its bottom edge — the
// bottom padding here is what keeps the title/icon/actions from being covered.
// `open`/`transitionMs` drive a pure-CSS fade + slide for enter/exit; the parent
// keeps this mounted for `transitionMs` after `open` goes false so the exit plays out.
export default function SidebarAlert({
  eyebrow = 'Right now',
  title,
  primaryLabel = 'On my way',
  secondaryLabel = "Can't, reassign",
  onPrimary,
  onSecondary,
  onDismiss,
  accentColor = '#2D4CCD',
  open = true,
  transitionMs = 320,
  easing = 'ease-in-out',
  borderRadius = 16,
  paddingTop = 18,
  paddingSides = 18,
  paddingBottom = 40,
}) {
  const dismiss = (handler) => () => {
    handler?.();
    onDismiss?.();
  };

  return (
    <div style={{
      background: accentColor,
      // Top corners only: the header renders in front and always covers the alert's
      // bottom edge, so rounding the bottom corners too just leaves both layers'
      // curves cutting away the same corner with nothing behind — a visible notch
      // of the outer background peeking through, worse the shallower the overlap is.
      borderRadius: `${borderRadius}px ${borderRadius}px 0 0`,
      padding: `${paddingTop}px ${paddingSides}px ${paddingBottom}px`,
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      flexShrink: 0,
      opacity: open ? 1 : 0,
      transform: open ? 'translateY(0)' : 'translateY(-14px)',
      transition: `opacity ${transitionMs}ms ${easing}, transform ${transitionMs}ms ${easing}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.7)' }}>
            {eyebrow}
          </span>
          <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 16, fontWeight: 600, color: '#fff', lineHeight: 1.3 }}>
            {title}
          </span>
        </div>
        <div style={{ position: 'relative', flexShrink: 0, marginTop: 2 }}>
          <BellIcon />
          <span style={{ position: 'absolute', top: -1, right: -1, width: 8, height: 8, borderRadius: '50%', background: '#ef4444', border: `1.5px solid ${accentColor}` }} />
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          onClick={dismiss(onPrimary)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 14px',
            background: 'rgba(255,255,255,0.16)',
            border: 'none',
            borderRadius: 10,
            cursor: 'pointer',
            fontFamily: 'Poppins, sans-serif',
            fontSize: 13,
            fontWeight: 600,
            color: '#fff',
          }}
        >
          <CheckIcon />
          {primaryLabel}
        </button>
        <button
          onClick={dismiss(onSecondary)}
          style={{
            padding: '8px 6px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'Poppins, sans-serif',
            fontSize: 13,
            fontWeight: 600,
            color: 'rgba(255,255,255,0.85)',
          }}
        >
          {secondaryLabel}
        </button>
      </div>
    </div>
  );
}
