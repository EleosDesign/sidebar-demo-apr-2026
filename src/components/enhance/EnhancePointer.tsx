import React, { useState, useRef, useCallback } from 'react';
import EnhanceInlineButton from './EnhanceInlineButton';
import EnhancePointerToolbar, { EnhanceAction } from './EnhancePointerToolbar';

// ── Demo AI transforms ────────────────────────────────────────────────────────

const ENHANCE_SUFFIXES: Record<string, string> = {
  data:        ' Client demonstrated adequate insight into presenting concerns and engaged actively in skill practice throughout the session.',
  assessment:  ' Overall functional status remains consistent with treatment goals. Client is responding appropriately to current therapeutic interventions.',
  plan:        ' Continue weekly individual therapy sessions. Client to practice identified coping strategies and log usage prior to next appointment.',
  intervention:' Therapist utilized evidence-based techniques to address presenting concerns. Client verbalized understanding and expressed motivation to implement strategies.',
  default:     ' Clinical documentation has been reviewed and updated to reflect session content accurately.',
};

function applyEnhance(value: string, fieldKey: string): string {
  const trimmed = value.trimEnd();
  const endsWithPunct = /[.!?]$/.test(trimmed);
  const base = endsWithPunct ? trimmed : trimmed + '.';
  const suffix = ENHANCE_SUFFIXES[fieldKey] ?? ENHANCE_SUFFIXES.default;
  return base + suffix;
}

function applyExpand(value: string): string {
  const trimmed = value.trimEnd();
  const endsWithPunct = /[.!?]$/.test(trimmed);
  const base = endsWithPunct ? trimmed : trimmed + '.';
  return (
    base +
    '\n\nAdditional clinical observations: Client reported improvements since the previous session and expressed motivation to continue with the established treatment plan. No safety concerns identified at this time.'
  );
}

function applyShorten(value: string): string {
  const sentences = value
    .replace(/\n+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean);
  const half = Math.max(1, Math.ceil(sentences.length / 2));
  return sentences.slice(0, half).join(' ');
}

function applyFixGrammar(value: string): string {
  let result = value.trimEnd();
  // Capitalize first character
  result = result.charAt(0).toUpperCase() + result.slice(1);
  // Collapse multiple spaces
  result = result.replace(/ {2,}/g, ' ');
  // Ensure ends with period
  if (result && !/[.!?]$/.test(result)) result += '.';
  return result;
}

function applyAction(action: EnhanceAction, value: string, fieldKey: string): string {
  switch (action) {
    case 'enhance':    return applyEnhance(value, fieldKey);
    case 'expand':     return applyExpand(value);
    case 'shorten':    return applyShorten(value);
    case 'fix-grammar': return applyFixGrammar(value);
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

interface EnhancePointerProps {
  /** Current textarea value — button only appears when non-empty. */
  value: string;
  /** Logical field key (e.g. 'plan', 'data', 'assessment'). */
  fieldKey?: string;
  /** Called with the new value after an enhance action completes. */
  onApply: (newValue: string) => void;
  /**
   * Optional callback triggered after an enhance completes.
   * Wire this to `triggerQualityCheck()` for the Plan field.
   */
  onQualityCheck?: () => void;
  children: React.ReactNode;
}

/**
 * Wrapper component that adds AI-enhance affordances to any textarea field.
 *
 * - Shows an EnhanceInlineButton when the field is hovered/focused with content.
 * - Clicking the button opens the EnhancePointerToolbar (portal) with 4 actions.
 * - Selected action runs a simulated AI transform, then calls onApply.
 * - If onQualityCheck is provided (Plan field), it fires after every enhance.
 */
export default function EnhancePointer({
  value,
  fieldKey = 'default',
  onApply,
  onQualityCheck,
  children,
}: EnhancePointerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [toolbarOpen, setToolbarOpen] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const [activeAction, setActiveAction] = useState<EnhanceAction | null>(null);

  const hasContent = value.trim().length > 0;
  const buttonVisible = (hovered || focused || toolbarOpen) && hasContent;

  const handleButtonClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const btn = (e.currentTarget as HTMLElement);
    setAnchorRect(btn.getBoundingClientRect());
    setToolbarOpen(prev => !prev);
  }, []);

  const handleAction = useCallback(
    (action: EnhanceAction) => {
      if (activeAction) return; // already processing
      setActiveAction(action);
      setToolbarOpen(false);

      setTimeout(() => {
        const newValue = applyAction(action, value, fieldKey);
        onApply(newValue);
        setActiveAction(null);

        // Fire quality-check hook (e.g. on Plan field)
        if (action === 'enhance' || action === 'expand') {
          onQualityCheck?.();
        }
      }, 1500);
    },
    [activeAction, value, fieldKey, onApply, onQualityCheck],
  );

  return (
    <>
      {/* Inject keyframe animations once */}
      <style>{`
        @keyframes enhanceSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes enhanceFadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes enhanceShimmer {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
      `}</style>

      <div
        ref={containerRef}
        style={{ position: 'relative', display: 'contents' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocusCapture={() => setFocused(true)}
        onBlurCapture={() => setTimeout(() => setFocused(false), 150)}
      >
        {children}

        {/* Loading shimmer overlay — shown while an action is processing */}
        {activeAction && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 2,
              background: 'linear-gradient(90deg, transparent 0%, rgba(124,58,237,0.06) 50%, transparent 100%)',
              backgroundSize: '200% 100%',
              animation: 'enhanceShimmer 1.2s linear infinite',
              pointerEvents: 'none',
              zIndex: 8,
            }}
          />
        )}

        <EnhanceInlineButton
          visible={buttonVisible}
          loading={activeAction !== null}
          onClick={handleButtonClick}
        />
      </div>

      {toolbarOpen && (
        <EnhancePointerToolbar
          anchorRect={anchorRect}
          onAction={handleAction}
          onClose={() => setToolbarOpen(false)}
          activeAction={activeAction}
        />
      )}
    </>
  );
}
