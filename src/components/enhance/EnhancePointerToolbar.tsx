import React from 'react';
import ReactDOM from 'react-dom';
import { SPARKLE_VIEWBOX, SPARKLE_PATHS } from './svg-efsgtmmfcy';
import { WAND_VIEWBOX, WAND_PATHS, WAND_DOT_ACCENTS } from './svg-o7kqsvjwcs';

export type EnhanceAction = 'enhance' | 'expand' | 'shorten' | 'fix-grammar';

interface EnhancePointerToolbarProps {
  anchorRect: DOMRect | null;
  onAction: (action: EnhanceAction) => void;
  onClose: () => void;
  activeAction: EnhanceAction | null;
}

const ACTIONS: Array<{
  id: EnhanceAction;
  label: string;
  description: string;
  icon: React.ReactNode;
}> = [
  {
    id: 'enhance',
    label: 'Enhance',
    description: 'Improve clarity and clinical tone',
    icon: (
      <svg width="13" height="13" viewBox={SPARKLE_VIEWBOX} fill="currentColor">
        {SPARKLE_PATHS.map((d, i) => <path key={i} d={d} />)}
      </svg>
    ),
  },
  {
    id: 'expand',
    label: 'Expand',
    description: 'Add relevant clinical detail',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
      </svg>
    ),
  },
  {
    id: 'shorten',
    label: 'Shorten',
    description: 'Condense to key points',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M21 9l-9 9-9-9" />
        <line x1="3" y1="5" x2="21" y2="5" />
      </svg>
    ),
  },
  {
    id: 'fix-grammar',
    label: 'Fix grammar',
    description: 'Correct spelling & punctuation',
    icon: (
      <svg width="13" height="13" viewBox={WAND_VIEWBOX} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        {WAND_PATHS.map((d, i) => <path key={i} d={d} />)}
        {WAND_DOT_ACCENTS.map((dot, i) => (
          <circle key={i} cx={dot.cx} cy={dot.cy} r={dot.r} fill="currentColor" stroke="none" />
        ))}
      </svg>
    ),
  },
];

/**
 * Floating toolbar that appears when the user clicks the EnhanceInlineButton.
 * Rendered as a portal so it's never clipped by overflow:hidden ancestors.
 * Positioned below (or above) the anchor button.
 */
export default function EnhancePointerToolbar({
  anchorRect,
  onAction,
  onClose,
  activeAction,
}: EnhancePointerToolbarProps) {
  if (!anchorRect) return null;

  const TOOLBAR_WIDTH = 220;
  const TOOLBAR_ITEM_HEIGHT = 44;
  const TOOLBAR_HEIGHT = ACTIONS.length * TOOLBAR_ITEM_HEIGHT + 16;
  const MARGIN = 6;

  const spaceBelow = window.innerHeight - anchorRect.bottom;
  const showAbove = spaceBelow < TOOLBAR_HEIGHT + MARGIN;

  const top = showAbove
    ? anchorRect.top - TOOLBAR_HEIGHT - MARGIN
    : anchorRect.bottom + MARGIN;

  // Align right edge of toolbar with right edge of button
  const left = Math.min(
    anchorRect.right - TOOLBAR_WIDTH,
    window.innerWidth - TOOLBAR_WIDTH - 8,
  );

  const toolbar = (
    <>
      {/* backdrop — closes toolbar on outside click */}
      <div
        style={{ position: 'fixed', inset: 0, zIndex: 9998 }}
        onMouseDown={e => { e.stopPropagation(); onClose(); }}
      />

      {/* toolbar card */}
      <div
        style={{
          position: 'fixed',
          top,
          left: Math.max(8, left),
          width: TOOLBAR_WIDTH,
          background: '#fff',
          borderRadius: 10,
          boxShadow: '0 4px 24px rgba(0,0,0,0.14), 0 1px 4px rgba(0,0,0,0.08)',
          border: '1px solid #e8ecf4',
          zIndex: 9999,
          overflow: 'hidden',
          animation: 'enhanceFadeIn 0.12s ease',
        }}
        onMouseDown={e => e.stopPropagation()}
      >
        {/* header */}
        <div style={{
          padding: '8px 12px 6px',
          borderBottom: '1px solid #f0f2f8',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          <svg width="11" height="11" viewBox={SPARKLE_VIEWBOX} fill="#7c3aed">
            {SPARKLE_PATHS.map((d, i) => <path key={i} d={d} />)}
          </svg>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            AI Enhance
          </span>
        </div>

        {/* actions */}
        {ACTIONS.map(action => {
          const isActive = activeAction === action.id;
          return (
            <button
              key={action.id}
              onMouseDown={e => { e.preventDefault(); e.stopPropagation(); }}
              onClick={() => onAction(action.id)}
              disabled={isActive}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: '8px 12px',
                background: isActive ? '#f4f0ff' : 'transparent',
                border: 'none',
                borderBottom: '1px solid #f5f6fa',
                cursor: isActive ? 'default' : 'pointer',
                textAlign: 'left',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => {
                if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = '#f7f9ff';
              }}
              onMouseLeave={e => {
                if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
              }}
            >
              {/* icon */}
              <span style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 26,
                height: 26,
                borderRadius: 6,
                background: isActive ? '#ede9fe' : '#f0f2f8',
                color: isActive ? '#7c3aed' : '#555',
                flexShrink: 0,
                transition: 'background 0.1s, color 0.1s',
              }}>
                {action.icon}
              </span>
              {/* text */}
              <span style={{ flex: 1 }}>
                <span style={{ display: 'block', fontSize: 12, fontWeight: 600, color: isActive ? '#7c3aed' : '#1a2340' }}>
                  {action.label}
                </span>
                <span style={{ display: 'block', fontSize: 10, color: '#888', marginTop: 1 }}>
                  {action.description}
                </span>
              </span>
              {/* active spinner */}
              {isActive && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round"
                  style={{ animation: 'enhanceSpin 0.8s linear infinite', flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="9" strokeOpacity="0.2" />
                  <path d="M12 3 A9 9 0 0 1 21 12" />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </>
  );

  return ReactDOM.createPortal(toolbar, document.body);
}
