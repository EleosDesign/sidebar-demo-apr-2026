import React from 'react';
import { SPARKLE_VIEWBOX, SPARKLE_PATHS } from './svg-efsgtmmfcy';

interface EnhanceInlineButtonProps {
  visible: boolean;
  loading: boolean;
  onClick: (e: React.MouseEvent) => void;
}

/**
 * Small sparkle pill button that appears in the top-right corner of a note
 * field when it has content and is hovered or focused. Clicking it opens the
 * EnhancePointerToolbar.
 */
export default function EnhanceInlineButton({
  visible,
  loading,
  onClick,
}: EnhanceInlineButtonProps) {
  return (
    <button
      onMouseDown={e => e.preventDefault()} // keep textarea focus
      onClick={onClick}
      aria-label="AI Enhance"
      style={{
        position: 'absolute',
        top: 5,
        right: 28, // sits left of the character counter
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: '3px 8px 3px 6px',
        background: loading
          ? 'linear-gradient(90deg, #2d4ccd, #7c3aed, #2d4ccd)'
          : 'linear-gradient(135deg, #2d4ccd 0%, #7c3aed 100%)',
        backgroundSize: loading ? '200% 100%' : '100% 100%',
        border: 'none',
        borderRadius: 20,
        cursor: loading ? 'default' : 'pointer',
        fontSize: 10,
        fontWeight: 600,
        color: '#fff',
        lineHeight: 1,
        boxShadow: '0 1px 6px rgba(44,76,205,0.35)',
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
        transition: 'opacity 0.15s ease, transform 0.15s ease',
        transform: visible ? 'translateY(0)' : 'translateY(-3px)',
        whiteSpace: 'nowrap',
        zIndex: 10,
        animation: loading ? 'enhanceShimmer 1.2s linear infinite' : 'none',
      }}
    >
      {loading ? (
        /* spinner ring */
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fff"
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{ animation: 'enhanceSpin 0.8s linear infinite', flexShrink: 0 }}
        >
          <circle cx="12" cy="12" r="9" strokeOpacity="0.25" />
          <path d="M12 3 A9 9 0 0 1 21 12" />
        </svg>
      ) : (
        /* sparkle icon */
        <svg
          width="11"
          height="11"
          viewBox={SPARKLE_VIEWBOX}
          fill="#fff"
          style={{ flexShrink: 0 }}
        >
          {SPARKLE_PATHS.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </svg>
      )}
      {loading ? 'Enhancing…' : 'Enhance'}
    </button>
  );
}
