import React from 'react';
import { STARS_VIEWBOX, STARS_PATHS } from './svg-efsgtmmfcy';

interface EnhanceInlineButtonProps {
  onClick?: () => void;
  loading?: boolean;
}

/**
 * Lavender sparkle button that appears below a focused textarea (in normal flow).
 * Matches the real Eleos enhance button:
 *   - Background: #eaedfa (lavender)
 *   - Accent/border: #293d87 (navy)
 *   - Stars icon: #F9B534 (gold)
 *   - loading=true shows a spinning icon and "Enhancing…" label
 */
export default function EnhanceInlineButton({ onClick, loading = false }: EnhanceInlineButtonProps) {
  return (
    <>
      <style>{`
        @keyframes enhanceBtnShimmer {
          0%   { background-position: 150% 0; }
          100% { background-position: -150% 0; }
        }
        @keyframes enhanceBtnIn {
          from { opacity: 0; transform: scale(0.85); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    <button
      aria-label="Enhance text"
      onMouseDown={e => e.preventDefault()}
      onClick={loading ? undefined : onClick}
      disabled={loading}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 12px 6px 10px',
        // Shimmer sweep when loading; solid lavender otherwise
        backgroundImage: loading
          ? 'linear-gradient(90deg, #eaedfa 20%, #dde2f8 40%, #c9d0f2 50%, #dde2f8 60%, #eaedfa 80%)'
          : 'none',
        backgroundColor: '#eaedfa',
        backgroundSize: '200% 100%',
        animation: loading
          ? 'enhanceBtnShimmer 1.4s ease-in-out infinite'
          : 'enhanceBtnIn 0.18s cubic-bezier(0.34, 1.56, 0.64, 1) both',
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
        transition: loading ? undefined : 'opacity 0.15s',
        userSelect: 'none',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.opacity = '0.9'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
    >
      {/* Gold stars icon or spinner */}
      {loading ? (
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="#293d87" strokeWidth="2.5" strokeLinecap="round"
          style={{ flexShrink: 0, animation: 'spin 0.9s linear infinite' }}
        >
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
      ) : (
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
      )}
      {/* Label */}
      <span style={{
        fontSize: 13,
        fontWeight: 600,
        color: '#293d87',
        letterSpacing: '0.01em',
        fontFamily: 'var(--font-family, inherit)',
        opacity: loading ? 0.6 : 1,
      }}>
        {loading ? 'Enhancing…' : 'Enhance'}
      </span>
    </button>
    </>
  );
}
