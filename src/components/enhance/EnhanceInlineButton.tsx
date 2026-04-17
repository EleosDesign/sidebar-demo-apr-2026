import React from 'react';
import { STARS_VIEWBOX, STARS_PATHS } from './svg-efsgtmmfcy';

interface EnhanceInlineButtonProps {
  onClick?: () => void;
}

/**
 * Lavender sparkle button that appears BELOW a focused textarea.
 * Matches the real Eleos enhance button:
 *   - Background: #eaedfa (lavender)
 *   - Accent/border: #293d87 (navy)
 *   - Stars icon: #F9B534 (gold)
 *   - Positioned absolute left-8px bottom-[-37px] by its parent
 */
export default function EnhanceInlineButton({ onClick }: EnhanceInlineButtonProps) {
  return (
    <button
      aria-label="Enhance text"
      onMouseDown={e => e.preventDefault()}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 12px 6px 10px',
        background: '#eaedfa',
        border: '1.5px solid #293d87',
        borderRadius: 20,
        cursor: 'pointer',
        boxShadow: [
          '0px 7.3px 14.6px 0px rgba(41,61,135,0.14)',
          '0px 25.55px 25.55px 0px rgba(41,61,135,0.12)',
          '0px 58.4px 34.675px 0px rgba(41,61,135,0.07)',
          '0px 102.2px 40.15px 0px rgba(41,61,135,0.02)',
          '0px 160.6px 45.625px 0px rgba(41,61,135,0)',
        ].join(', '),
        transition: 'opacity 0.15s',
        userSelect: 'none',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.9'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
    >
      {/* Gold stars icon */}
      <svg
        width="16"
        height="16"
        viewBox={STARS_VIEWBOX}
        fill="#F9B534"
        style={{ flexShrink: 0 }}
      >
        {STARS_PATHS.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </svg>
      {/* Label */}
      <span style={{
        fontSize: 13,
        fontWeight: 600,
        color: '#293d87',
        letterSpacing: '0.01em',
        fontFamily: 'var(--font-family, inherit)',
      }}>
        Enhance
      </span>
    </button>
  );
}
