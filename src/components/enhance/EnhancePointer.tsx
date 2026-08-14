import React, { useEffect, useState } from 'react';
import {
  SHIELD_VIEWBOX, SHIELD_PATH, SHIELD_CHECK,
  ARC_VIEWBOX, ARC_PATH,
} from './svg-o7kqsvjwcs';
import { smartScribeColor, smartScribeEnhanceShadow } from '../../contexts/EhrContext.jsx';

interface EnhancePointerProps {
  /** Number of outstanding quality items to show on the badge. */
  outstandingCount?: number;
  /** Whether to show the badge (only after first quality check). */
  showBadge?: boolean;
  /** Called when the user clicks the shield to check note quality. */
  onCheckQuality?: () => void;
  /** Tooltip text. */
  tooltip?: string;
  /** SmartScribe skin active (Streamline/CalMHSA) — swaps the navy accent to #254A67. */
  skin?: boolean;
}

/**
 * The quality-check shield icon used inside EnhancePointerToolbar.
 *
 * Visual:
 *   - Outer lavender circle (#afbbec), 44×44px
 *   - Inner navy circle (#293d87) with white shield icon
 *   - Spinning arc overlay for 3s on mount
 *   - Optional badge showing outstanding item count (#8194e1)
 *   - Tooltip "Check Note Quality" on hover
 */
export default function EnhancePointer({
  outstandingCount = 0,
  showBadge = false,
  onCheckQuality,
  tooltip = 'Check Note Quality',
  skin = false,
}: EnhancePointerProps) {
  const [spinning, setSpinning] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);
  const navy = smartScribeColor(skin, '#293d87');

  // Spin for 3 seconds on mount, then stop
  useEffect(() => {
    const t = setTimeout(() => setSpinning(false), 3000);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <style>{`
        @keyframes enhance-arc-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes enhance-badge-in {
          from { opacity: 0; transform: scale(0.6); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <div style={{ position: 'relative', display: 'inline-flex' }}>
        {/* Tooltip */}
        {showTooltip && (
          <div style={{
            position: 'absolute',
            bottom: 'calc(100% + 8px)',
            left: 0,
            background: 'rgba(30,35,60,0.92)',
            color: '#fff',
            fontSize: 11,
            fontWeight: 500,
            padding: '4px 8px',
            borderRadius: 5,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            zIndex: 10,
          }}>
            {tooltip}
          </div>
        )}

        {/* Main circle button */}
        <button
          aria-label={tooltip}
          onMouseDown={e => e.preventDefault()}
          onClick={onCheckQuality}
          style={{
            position: 'relative',
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: '#afbbec',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            transition: 'background 0.15s',
            boxShadow: smartScribeEnhanceShadow(skin),
          }}
          onMouseEnter={e => {
            setShowTooltip(true);
            (e.currentTarget as HTMLButtonElement).style.background = '#9baade';
          }}
          onMouseLeave={e => {
            setShowTooltip(false);
            (e.currentTarget as HTMLButtonElement).style.background = '#afbbec';
          }}
        >
          {/* Inner navy disc with shield */}
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: navy,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg
              width="18"
              height="18"
              viewBox={SHIELD_VIEWBOX}
              fill="none"
            >
              <path d={SHIELD_PATH} fill="rgba(255,255,255,0.15)" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
              <path d={SHIELD_CHECK} stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {/* Spinning arc overlay */}
          {spinning && (
            <svg
              width="44"
              height="44"
              viewBox={ARC_VIEWBOX}
              fill="none"
              style={{
                position: 'absolute',
                inset: 0,
                animation: 'enhance-arc-spin 1s linear infinite',
                pointerEvents: 'none',
              }}
            >
              <path
                d={ARC_PATH}
                stroke={navy}
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          )}
        </button>

        {/* Badge */}
        {showBadge && outstandingCount > 0 && (
          <div style={{
            position: 'absolute',
            top: -4,
            right: -4,
            minWidth: 18,
            height: 18,
            background: '#8194e1',
            borderRadius: 9,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 10,
            fontWeight: 700,
            color: '#fff',
            padding: '0 4px',
            boxSizing: 'border-box',
            animation: 'enhance-badge-in 0.2s ease',
            border: '1.5px solid #fff',
          }}>
            {outstandingCount}
          </div>
        )}
      </div>
    </>
  );
}
