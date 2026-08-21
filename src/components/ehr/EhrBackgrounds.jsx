/**
 * EhrBackgrounds.jsx  —  pixel-accurate EHR chrome for the Eleos demo
 * Each component: position:absolute inset:0, accepts { noteValues, onNoteChange, highlightedField }
 * Patient: Webb, Marcus
 */
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNoteTypeContext, NOTE_TYPE_LIST } from '../../contexts/NoteTypeContext.jsx';
import { useEhrContext, useSmartScribeSkin, smartScribeColor, smartScribeEnhanceShadow } from '../../contexts/EhrContext.jsx';
import { useLockedDownModeContext } from '../../contexts/LockedDownModeContext.jsx';
import { useEhrField } from '../ui/EhrFieldContext.jsx';
import EnhanceInlineButton from '../enhance/EnhanceInlineButton';
import EnhancePointer from '../enhance/EnhancePointer';
import insyncDashboard from '../../assets/insync-dashboard.png';
import insyncNote from '../../assets/insync-note.png';

// ── Shared stacked textarea renderer ─────────────────────────────────────────
// Maps note field IDs to EhrFieldContext keys for dirty-tracking.
// Covers both the NoteTypeContext-derived lowercase IDs ('data', 'assessment', 'plan')
// and the legacy hardcoded fallback IDs used when NoteTypeContext is absent.
const DAP_FIELD_MAP = {
  // NoteTypeContext / note-structures.json IDs (lowercase)
  'data': 'data',
  'assessment': 'assessment',
  'plan': 'plan',
  // Legacy fallback IDs
  'Data/Goal:': 'data',
  'Assessment/Level of Participation:': 'assessment',
  'Plan:': 'plan',
};

// ── Clinical text enhancer (mock AI) ─────────────────────────────────────────
const DEMO_TEXT_SHORTCUT = 'ct challenging relationship w/ partner, affecting recovery.';
const DEMO_TEXT_SHORTCUT_ENHANCED = 'The client is experiencing difficulties in his relationship with his partner, which appears to be impacting his recovery process. He is actively working on establishing and maintaining healthy boundaries to support his recovery and overall well-being.';

function buildEnhancedText(text) {
  let s = text.trim();
  if (!s) return s;

  if (s.includes(DEMO_TEXT_SHORTCUT)) {
    return s.replaceAll(DEMO_TEXT_SHORTCUT, DEMO_TEXT_SHORTCUT_ENHANCED);
  }

  // ① Normalize: capitalize first character, ensure sentence-ending punctuation
  s = s.charAt(0).toUpperCase() + s.slice(1);
  if (!/[.!?]$/.test(s)) s += '.';
  s = s.replace(/([.!?]\s+)([a-z])/g, (m, p1, p2) => p1 + p2.toUpperCase());

  // ② First-person → clinical third-person perspective
  s = s
    .replace(/\bI feel\b/gi, 'Client reports experiencing')
    .replace(/\bI felt\b/gi, 'Client reported experiencing')
    .replace(/\bI am\b/gi, 'Client presents as')
    .replace(/\bI was\b/gi, 'Client reported being')
    .replace(/\bI have\b/gi, 'Client endorses')
    .replace(/\bI had\b/gi, 'Client reported having')
    .replace(/\bI want\b/gi, 'Client expressed desire to')
    .replace(/\bI think\b/gi, 'Client verbalized')
    .replace(/\bwe discussed\b/gi, 'Clinician and client collaboratively explored')
    .replace(/\bwe worked on\b/gi, 'Clinician and client focused on')
    .replace(/\bhe feels\b/gi, 'Client reports experiencing')
    .replace(/\bshe feels\b/gi, 'Client reports experiencing')
    .replace(/\bthey feel\b/gi, 'Client reports experiencing');

  // ③ Casual vocabulary → clinical language
  const casualSubs = [
    [/\bfeeling\b/g, 'experiencing'],
    [/\bfeelings\b/g, 'affective experiences'],
    [/\bemotion(s)?\b/g, 'emotional response'],
    [/\bworried about\b/g, 'expressing heightened concern regarding'],
    [/\banxious\b/g, 'presenting with anxiety-related symptomatology'],
    [/\bdepressed\b/g, 'endorsing depressive symptoms'],
    [/\bproblem(s)?\b/g, 'presenting concern'],
    [/\bstressed\b/g, 'demonstrating elevated stress responses'],
    [/\bsaid\b/g, 'reported'],
    [/\bhard time\b/g, 'significant functional difficulty'],
    [/\bstruggling\b/g, 'demonstrating difficulty with'],
    [/\bhelped\b/g, 'facilitated measurable improvement in'],
    [/\bwill try\b/g, 'verbally committed to attempting'],
    [/\bwants to\b/g, 'expressed motivation to'],
    [/\btalked about\b/g, 'verbally processed'],
    [/\bdiscussed\b/g, 'collaboratively reviewed'],
    [/\bokay\b/g, 'within functional limits'],
    [/\bgood progress\b/g, 'clinically significant progress'],
    [/\bimproving\b/g, 'demonstrating measurable improvement'],
    [/\bcoping\b/g, 'employing adaptive coping strategies'],
    [/\bgoal(s)?\b/g, 'therapeutic objective'],
    [/\bsession\b/g, 'therapeutic encounter'],
    [/\bupset\b/g, 'experiencing emotional dysregulation'],
    [/\bthings\b/g, 'identified areas'],
    [/\bstuff\b/g, 'identified concerns'],
    [/\bnervous\b/g, 'demonstrating heightened arousal'],
    [/\bsad\b/g, 'experiencing low mood'],
    [/\banger\b/g, 'dysregulated affect'],
    [/\bangry\b/g, 'presenting with affective dysregulation'],
    [/\bfocused on\b/g, 'directed clinical attention toward'],
    [/\bworked on\b/g, 'targeted intervention toward'],
  ];
  casualSubs.forEach(([from, to]) => { s = s.replace(from, to); });

  // ④ Elevate already-clinical third-person language
  //    Ordered specific → general so longer phrases match before their constituent words.
  const snapshot = s;
  const clinicalSubs = [
    // Provider label
    [/\b[Tt]he [Tt]herapist\b/g,          'Clinician'],
    [/\b[Tt]herapist\b/g,                  'clinician'],
    // Concern phrasing (specific first)
    [/\bshared concerns? about\b/g,        'expressed clinical concern regarding'],
    [/\bshared concerns?\b/g,              'expressed clinical concern'],
    [/\bconcerns? about\b/g,               'concerns regarding'],
    [/\bconcern about\b/g,                 'concern regarding'],
    // Action verbs
    [/\bemphasized\b/g,                    'reinforced'],
    [/\bhighlighted\b/g,                   'brought clinical attention to'],
    [/\bpointed out\b/g,                   'clinically identified'],
    [/\baddressed\b/g,                     'targeted'],
    [/\bprovided\b/g,                      'delivered'],
    [/\bshared\b/g,                        'communicated'],
    [/\bnoted\b/g,                         'clinically documented'],
    // Importance / significance
    [/\bimportance of\b/g,                 'clinical significance of'],
    [/\bimportant\b/g,                     'clinically significant'],
    // Challenges (specific compound first)
    [/\bchallenges of\b/g,                 'barriers associated with'],
    [/\bchallenges?\b/g,                   'barriers'],
    [/\bdifficulties\b/g,                  'functional impairments'],
    // Support person
    [/\b(his|her|their) partner\b/g,       '$1 identified support person'],
    [/\bpartner\b/g,                       'identified support person'],
    // Recovery phrasing (specific first)
    [/\bearly recovery\b/g,                'the early recovery phase'],
    [/\bindividual recovery\b/g,           'independent recovery trajectory'],
    [/\btheir recovery\b/g,                'their respective recovery trajectories'],
    // Relational / clinical modifiers
    [/\bdynamic\b/g,                       'relational dynamic'],
    [/\bsymptoms\b/g,                      'symptomatology'],
    // Behavior / commitment
    [/\bmaintaining\b/g,                   'sustaining'],
    [/\bmaintain\b/g,                      'sustain'],
    [/\bagreed to\b/g,                     'verbally committed to'],
    [/\bdemonstrated\b/g,                  'exhibited'],
    // Outreach / support
    [/\badditional support\b/g,            'supplemental clinical support'],
    [/\breach out\b/g,                     'initiate contact'],
    [/\bnavigates?\b/g,                    'continues to manage'],
    // Forward-looking language
    [/\bmoving forward\b/g,               'as part of the ongoing treatment plan'],
    [/\bgoing forward\b/g,                'throughout the continued course of treatment'],
    // Depressive language
    [/\bdepressive symptomatology\b/g,    'endorsed depressive symptomatology'],
  ];
  clinicalSubs.forEach(([from, to]) => { s = s.replace(from, to); });

  // ⑤ Fallback: if nothing changed (text was already maximally formal),
  //    wrap with a documentation frame so the card always shows a difference.
  if (s === snapshot) {
    const lower = s.charAt(0).toLowerCase() + s.slice(1);
    s = `Clinician documented that ${lower}`;
  }

  return s;
}

// ── Enhance tooltip card — visual extension of the Enhance CTA ───────────────
// Shares the CTA's lavender bg (#eaedfa) + navy border (#293d87).
// Draggable via the header row.
// Animated entrance (spring scale-in from button origin) and exit (fold-away).
function EnhanceTooltip({ text, onUse, onDismiss, skin = false }) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [closing, setClosing] = useState(false);
  const dragRef = useRef(null);
  const navy = smartScribeColor(skin, '#293d87');

  // Trigger exit animation first, then call the real callback after it completes
  const handleDismiss = () => { setClosing(true); setTimeout(onDismiss, 210); };
  const handleUse    = () => { setClosing(true); setTimeout(onUse,    210); };

  const startDrag = (e) => {
    // Don't start a drag on the dismiss button
    if (e.target.closest('button')) return;
    e.preventDefault();
    dragRef.current = { mx: e.clientX, my: e.clientY, ox: offset.x, oy: offset.y };
    const onMove = (ev) => {
      setOffset({
        x: dragRef.current.ox + ev.clientX - dragRef.current.mx,
        y: dragRef.current.oy + ev.clientY - dragRef.current.my,
      });
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      dragRef.current = null;
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  return (
    <>
      <style>{`
        /* Card springs in from the Enhance button's top-left corner */
        @keyframes enhanceCardIn {
          0%   { opacity: 0; transform: scale(0.7) translateY(-10px); filter: blur(4px); }
          60%  { filter: blur(0); }
          100% { opacity: 1; transform: scale(1) translateY(0);      filter: blur(0); }
        }
        /* Card folds back toward the button on dismiss/use */
        @keyframes enhanceCardOut {
          0%   { opacity: 1; transform: scale(1)    translateY(0);   filter: blur(0); }
          100% { opacity: 0; transform: scale(0.82) translateY(-6px); filter: blur(2px); }
        }
      `}</style>

      {/*
        ── Two-layer structure:
        •  Outer div  → entrance / exit animation  (transform-origin: top left = button position)
        •  Inner div  → drag translate + card visuals  (never fights with animation keyframes)
      */}
      <div style={{
        transformOrigin: 'top left',
        animation: closing
          ? 'enhanceCardOut 0.21s cubic-bezier(0.4, 0, 0.8, 0.6) both'
          : 'enhanceCardIn  0.40s cubic-bezier(0.34, 1.56, 0.64, 1) both',
      }}>
        <div style={{
          // ── CTA visual identity ──────────────────────────────────────
          background: '#eaedfa',
          border: `1.5px solid ${navy}`,
          borderRadius: 16,
          padding: '10px 12px',
          display: 'flex', flexDirection: 'column', gap: 8,
          boxShadow: smartScribeEnhanceShadow(skin, { includeOuterFade: false }),
          // ── Sizing — wide enough for title on one line ───────────────
          width: 'max-content',
          minWidth: 260,
          maxWidth: 420,
          // ── Drag transform ───────────────────────────────────────────
          transform: `translate(${offset.x}px, ${offset.y}px)`,
          userSelect: 'none',
        }}>
          {/* ── Drag handle header ─────────────────────────────────────── */}
          <div
            onMouseDown={startDrag}
            style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', gap: 8,
              cursor: dragRef.current ? 'grabbing' : 'grab',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#F9B534" style={{ flexShrink: 0 }}>
                <path d="M12 2l2.09 6.26H21l-5.47 3.97 2.09 6.26L12 14.52l-5.62 3.97 2.09-6.26L3 8.26h6.91L12 2z" />
              </svg>
              <span style={{
                fontSize: 13, fontWeight: 600, color: navy,
                letterSpacing: '0.01em', whiteSpace: 'nowrap',
                fontFamily: 'var(--font-family, inherit)',
              }}>
                Suggested Enhancement
              </span>
            </div>
            <button
              onMouseDown={e => { e.stopPropagation(); e.preventDefault(); }}
              onClick={handleDismiss}
              aria-label="Dismiss"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: 4, color: navy, opacity: 0.5,
                display: 'flex', alignItems: 'center', flexShrink: 0,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* ── Enhanced text ─────────────────────────────────────────── */}
          <div style={{
            background: 'rgba(255,255,255,0.55)',
            borderRadius: 10, padding: '8px 10px',
          }}>
            <p style={{
              fontSize: 13, color: navy, lineHeight: 1.55, margin: 0,
              fontFamily: "'Segoe UI', Arial, sans-serif",
            }}>
              {text}
            </p>
          </div>

          {/* ── Actions ───────────────────────────────────────────────── */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8 }}>
            <button
              onMouseDown={e => e.preventDefault()}
              onClick={handleDismiss}
              style={{
                height: 26, padding: '0 10px',
                background: 'none', border: 'none', borderRadius: 20,
                cursor: 'pointer', fontSize: 12, fontWeight: 500,
                color: navy, opacity: 0.6,
                fontFamily: 'var(--font-family, inherit)',
              }}
            >
              Dismiss
            </button>
            <button
              onMouseDown={e => e.preventDefault()}
              onClick={handleUse}
              style={{
                height: 26, padding: '0 12px',
                background: navy, border: 'none', borderRadius: 20,
                cursor: 'pointer', fontSize: 12, fontWeight: 600,
                color: '#eaedfa',
                fontFamily: 'var(--font-family, inherit)',
                display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              Use this
            </button>
          </div>
        </div>
      </div>
    </>
  );
}


// ── Inline launch button — shown on the last field when it's empty but the rest
// of the note has content (i.e. the clinician has started writing but hasn't
// filled the last section yet). Hidden when the entire note is blank.
function InlineLaunchButton({ skin = false }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const navy = smartScribeColor(skin, '#293d87');
  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      {showTooltip && (
        <div style={{
          position: 'absolute', bottom: 'calc(100% + 8px)', left: 0,
          background: 'rgba(30,35,60,0.92)', color: '#fff',
          fontSize: 11, fontWeight: 500, padding: '4px 8px',
          borderRadius: 5, whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 9,
        }}>
          Open Eleos
        </div>
      )}
      <button
        aria-label="Open Eleos"
        onMouseDown={e => e.preventDefault()}
        onClick={() => window.dispatchEvent(new CustomEvent('eleos:openSidebar'))}
        onMouseEnter={e => { setShowTooltip(true); (e.currentTarget).style.background = '#9baade'; }}
        onMouseLeave={e => { setShowTooltip(false); (e.currentTarget).style.background = '#afbbec'; }}
        style={{
          width: 44, height: 44, borderRadius: '50%',
          background: '#afbbec', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 0, transition: 'background 0.15s',
          boxShadow: smartScribeEnhanceShadow(skin),
        }}
      >
        <div style={{
          width: 32, height: 32, borderRadius: '50%', background: navy,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        </div>
      </button>
    </div>
  );
}

function StackedFields({ noteValues = {}, onNoteChange, highlightedField, sections: sectionsOverride,
  hideLabels = false, lastSectionId: lastSectionIdOverride,
  labelColor = '#555', labelWeight = 500, borderRadius = 4,
  borderColor = '#ccc', minHeight = 150, fontSize = 13,
  fontFamily = "'Segoe UI', Arial, sans-serif", bg = '#fff', resize = 'vertical',
  placeholder = 'Type here or use the cards on the right to build your note' }) {
  const noteTypeCtx = useNoteTypeContext();
  const ehrField = useEhrField();
  const smartScribeSkin = useSmartScribeSkin();
  const setFocusedEhrField = ehrField?.setActiveField ?? (() => {});
  const sidebarOpen = ehrField?.sidebarOpen ?? false;
  const [focusedField, setFocusedField] = useState(null);
  const [enhancingField, setEnhancingField] = useState(null);
  const [tooltipField, setTooltipField] = useState(null);
  const [tooltipText, setTooltipText] = useState('');
  const sections = sectionsOverride ?? noteTypeCtx?.sections ?? [
    { id: 'Data/Goal:',                         label: 'Data' },
    { id: 'Intervention/Response:',             label: 'Intervention/Response' },
    { id: 'Assessment/Level of Participation:', label: 'Assessment' },
    { id: 'Plan:',                              label: 'Plan' },
  ];

  // Whether any field has content (LQA CTA requires at least some note content)
  const noteHasContent = useMemo(() =>
    sections.some(s => (noteValues[s.id] ?? '').trim().length > 0),
  [sections, noteValues]); // eslint-disable-line

  // ID of the very last section in the list
  const lastSectionId = lastSectionIdOverride ?? sections[sections.length - 1]?.id ?? null;

  // ID of the last (bottom-most) section that still has no content
  const lastEmptySectionId = useMemo(() => {
    const found = [...sections].slice().reverse().find(s => !(noteValues[s.id] ?? '').trim());
    return found?.id ?? null;
  }, [sections, noteValues]); // eslint-disable-line

  // Seed fieldValues with existing note content on mount so the LQA snapshot
  // captures real text (not empty strings) when analysis first runs.
  useEffect(() => {
    if (!ehrField) return;
    ehrField.setFieldValues(prev => {
      const next = { ...prev };
      Object.entries(DAP_FIELD_MAP).forEach(([noteKey, ctxKey]) => {
        const val = noteValues[noteKey];
        if (val !== undefined) next[ctxKey] = val;
      });
      return next;
    });
  }, []); // eslint-disable-line

  const handleChange = (id, val) => {
    const nextVal = val.replaceAll('::', DEMO_TEXT_SHORTCUT);
    onNoteChange?.(id, nextVal);
    // Keep EhrFieldContext.fieldValues in sync so LQA dirty-check works
    const key = DAP_FIELD_MAP[id];
    if (key && ehrField) {
      ehrField.setFieldValues(prev => ({ ...prev, [key]: nextVal }));
    }
  };

  const mockEnhance = (id, originalText) => {
    setEnhancingField(id);
    setTooltipField(null);
    setTimeout(() => {
      setEnhancingField(null);
      setTooltipField(id);
      setTooltipText(buildEnhancedText(originalText));
    }, 1400);
  };

  const dismissTooltip = () => { setTooltipField(null); setTooltipText(''); };
  const applyEnhanced = (id) => { handleChange(id, tooltipText); dismissTooltip(); };

  return (
    <>
      {sections.map(s => {
        const currentValue = noteValues[s.id] ?? '';
        const isFocused = focusedField === s.id;
        const hasText = currentValue.trim().length > 0;
        const isEnhancing = enhancingField === s.id;
        const isShowingTooltip = tooltipField === s.id;

        // Enhance button: focused, field has text (or loading), NOT while tooltip is open
        const showEnhanceBtn = isFocused && (hasText || isEnhancing) && !isShowingTooltip;
        // LQA CTA: focused on the LAST section AND user has typed something in it
        const showLqaCta = isFocused && s.id === lastSectionId && hasText;
        // Launch button: last field is empty BUT at least one other field has content
        // (hides when the entire note is blank — nothing to help with yet).
        // Only makes sense while the sidebar isn't already open — its sole job is opening it.
        const noteHasSomeContent = Object.values(noteValues).some(v => (v ?? '').trim().length > 0);
        const showLaunchBtn = isFocused && s.id === lastSectionId && !hasText && noteHasSomeContent && !sidebarOpen;
        // Action strip shows when any button is visible. Enhance/LQA are independent of
        // sidebarOpen — see docs/adr/0002-inline-ehr-ctas-visible-while-sidebar-open.md
        const showStrip = showEnhanceBtn || showLqaCta || showLaunchBtn;

        return (
          <div key={s.id} style={{ marginBottom: 22, position: 'relative' }}>
            {!hideLabels && <div style={{ fontSize, color: labelColor, marginBottom: 5, fontWeight: labelWeight }}>{s.label}</div>}
            <textarea
              aria-label={s.label}
              value={currentValue}
              onChange={e => handleChange(s.id, e.target.value)}
              onFocus={() => { setFocusedEhrField(s.id); setTimeout(() => setFocusedField(s.id), 300); }}
              onBlur={() => { setFocusedEhrField(null); setTimeout(() => setFocusedField(f => f === s.id ? null : f), 150); }}
              placeholder={placeholder}
              style={{
                width: '100%', minHeight, padding: '10px 12px',
                border: `1px solid ${borderColor}`, borderRadius,
                resize, fontSize, color: '#333', fontFamily,
                background: highlightedField === s.id ? '#fffde7' : bg,
                outline: 'none', lineHeight: 1.5, boxSizing: 'border-box',
                transition: 'background 0.3s',
              }}
            />
            {/* Action strip — single flex row. Enhance/LQA no longer depend on sidebarOpen
                (see docs/adr/0002-inline-ehr-ctas-visible-while-sidebar-open.md); zIndex here
                must stay above the Companion Sidebar's zIndex:10 so an overlapping open
                sidebar never renders on top of these. */}
            {(showStrip || isShowingTooltip) && (
              <div style={{
                position: 'relative',
                zIndex: 11,
                marginTop: 6,
                display: 'flex',
                gap: 8,
                alignItems: 'flex-start',
              }}>
                {showLqaCta && (
                  <EnhancePointer
                    onCheckQuality={() => window.dispatchEvent(new CustomEvent('eleos:openQuality'))}
                    skin={smartScribeSkin}
                  />
                )}
                {showEnhanceBtn && (
                  <EnhanceInlineButton
                    loading={isEnhancing}
                    onClick={() => mockEnhance(s.id, currentValue)}
                    skin={smartScribeSkin}
                  />
                )}
                {showLaunchBtn && <InlineLaunchButton skin={smartScribeSkin} />}
                {/* Tooltip card — sits in the same row as the LQA circle */}
                {isShowingTooltip && (
                  <div style={{ zIndex: 9 }}>
                    <EnhanceTooltip
                      text={tooltipText}
                      onUse={() => applyEnhanced(s.id)}
                      onDismiss={dismissTooltip}
                      skin={smartScribeSkin}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. WELLIGENT
// ═══════════════════════════════════════════════════════════════════════════════
export function WelligentBg({ noteValues = {}, onNoteChange, highlightedField }) {
  const { clientName } = useEhrContext();
  const { selectedNoteType } = useNoteTypeContext();
  const noteTypeLabel = NOTE_TYPE_LIST.find(t => t.id === selectedNoteType)?.label ?? 'Progress Note';
  const tabs = ['View/Enter Appointment Details', 'Enter Notes', 'Complete Paperwork', 'Approval/Signatures'];
  const topButtonStyle = { font: 'italic 12px Verdana', background: '#efebe7', border: '1px solid #777', marginRight: 7, padding: '2px 10px' };
  const serviceDate = new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-');
  const fieldRow = (label, value, extra) => (
    <tr>
      <td style={{ background: '#fff', height: 29, padding: '3px 6px', border: '1px solid #d8d8d8', width: '45%', whiteSpace: 'nowrap' }}>{label}</td>
      <td style={{ background: '#fff', height: 29, padding: '3px 6px', border: '1px solid #d8d8d8' }}>{value}{extra}</td>
    </tr>
  );

  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily: '"Open Sans", Arial, sans-serif', fontSize: 12, overflow: 'hidden', background: '#f5f5f5', color: '#111' }}>
      <div style={{ height: '100%', padding: 8, boxSizing: 'border-box' }}>
        <div style={{ height: '100%', border: '1px solid #a0cf67', background: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>
          <div style={{ height: 30, background: '#0063ba', color: '#fff', display: 'flex', alignItems: 'center' }}>
            <div style={{ flex: 1, paddingLeft: 8, fontWeight: 700 }}>
              <img src="/welligent-unlock.gif" alt="" width="15" style={{ verticalAlign: 'middle', marginRight: 8 }} />
              Session Notes - ELEOS
            </div>
            {['Other »', 'Delete', 'Save', 'Print', 'Close'].map(label => <input key={label} type="button" value={label} style={topButtonStyle} />)}
          </div>

          <div style={{ background: '#0063ba', borderTop: '1px solid #fff', borderRadius: '0 0 7px 7px', alignSelf: 'center', display: 'flex', marginBottom: 18 }}>
            {tabs.map(tab => (
              <div key={tab} style={{ padding: '5px 15px', color: '#fff', borderLeft: tab === tabs[0] ? 'none' : '1px solid #fff', background: tab === 'Enter Notes' ? '#e87800' : '#0063ba' }}>{tab}</div>
            ))}
          </div>

          <div style={{ flex: 1, overflow: 'auto', padding: '0 16px 14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '29% 1% 50%', minWidth: 980, gap: 0 }}>
              <div>
                <div style={{ background: 'gray', padding: 1, marginBottom: 14 }}>
                  <div style={{ background: 'ButtonFace', padding: '4px 6px' }}>0 Items Displayed</div>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', background: '#000' }}>
                  <tbody>
                    <tr><td colSpan="2" style={{ background: '#0063ba', color: '#fff', height: 35, padding: '0 8px', fontSize: 14 }}>Event Details</td></tr>
                    {fieldRow('Date of Service:', serviceDate, <><img src="/welligent-clock.gif" alt="" style={{ marginLeft: 8, verticalAlign: 'middle' }} /><b style={{ color: 'red' }}> *</b></>)}
                    {fieldRow('Scheduled/Start Time:', '07:00am', <b style={{ color: 'red' }}> *</b>)}
                    {fieldRow('Appointment Duration (Face to Face):', '15 (Minutes)')}
                    {fieldRow('Other Time (Not Face-to-Face):', '0 (Minutes)')}
                    {fieldRow('Client:', clientName || 'Webb, Marcus')}
                    {fieldRow('Provider:', 'Eleos')}
                    {fieldRow('Event Status:', 'Pending Completion')}
                    {fieldRow('Primary Action:', 'Individual', <b style={{ color: 'red' }}> *</b>)}
                  </tbody>
                </table>
              </div>

              <div />

              <div>
                <table style={{ width: '100%', height: '100%', borderCollapse: 'separate', borderSpacing: 1, background: 'gray' }}>
                  <tbody>
                    <tr><td style={{ height: 22, background: '#0063ba', color: '#fff', fontWeight: 700, paddingLeft: 6 }}>{noteTypeLabel}</td></tr>
                    <tr>
                      <td style={{ background: '#fff', verticalAlign: 'top', padding: 5 }}>
                        <div style={{ border: '1px solid #000', padding: 8, background: '#fff' }}>
                          <StackedFields noteValues={noteValues} onNoteChange={onNoteChange} highlightedField={highlightedField}
                            labelColor='#111' fontSize={12} borderColor='#999' minHeight={84} borderRadius={0} fontFamily='Arial, sans-serif' />
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div style={{ height: 25, background: '#0063ba', borderTop: '1px solid #0063ba', color: '#fff', display: 'flex', alignItems: 'center', paddingLeft: 8, fontWeight: 700, flexShrink: 0 }}>
            Note: This record was last modified by Eleos Bh Test on Thursday June 25, 2026 at 10:35 am&nbsp;&nbsp;<u>(View Audit Log)</u>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. ARIZE
// ═══════════════════════════════════════════════════════════════════════════════
export function ArizeBg({ noteValues = {}, onNoteChange, highlightedField }) {
  const { clientName } = useEhrContext();
  const [hoveredNav, setHoveredNav] = useState(null);
  const [hoveredIcon, setHoveredIcon] = useState(null);

  const SIDEBAR = '#2d4b64';
  const SIDEBAR_ACTIVE = '#385e7e';

  const navItems = [
    { label: 'Clients',      paths: [<path key="a" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>, <path key="b" d="M9 7a4 4 0 100 8 4 4 0 000-8z"/>, <path key="c" d="M23 21v-2a4 4 0 00-3-3.87"/>, <path key="d" d="M16 3.13a4 4 0 010 7.75"/>] },
    { label: 'Scheduling',   paths: [<rect key="a" x="3" y="4" width="18" height="18" rx="2"/>, <line key="b" x1="16" y1="2" x2="16" y2="6"/>, <line key="c" x1="8" y1="2" x2="8" y2="6"/>, <line key="d" x1="3" y1="10" x2="21" y2="10"/>] },
    { label: 'Foster Care',  paths: [<path key="a" d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>] },
    { label: 'Reporting',    paths: [<line key="a" x1="18" y1="20" x2="18" y2="10"/>, <line key="b" x1="12" y1="20" x2="12" y2="4"/>, <line key="c" x1="6" y1="20" x2="6" y2="14"/>] },
    { label: 'RX',           paths: [<path key="a" d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>, <path key="b" d="M14 2v6h6"/>, <line key="c" x1="16" y1="13" x2="8" y2="13"/>, <line key="d" x1="16" y1="17" x2="8" y2="17"/>] },
  ];

  const rightIcons = [
    { key: 'calendar', badge: null,  paths: [<rect key="a" x="3" y="4" width="18" height="18" rx="2"/>, <line key="b" x1="16" y1="2" x2="16" y2="6"/>, <line key="c" x1="8" y1="2" x2="8" y2="6"/>, <line key="d" x1="3" y1="10" x2="21" y2="10"/>] },
    { key: 'grid',     badge: null,  paths: [<rect key="a" x="3" y="3" width="7" height="7"/>, <rect key="b" x="14" y="3" width="7" height="7"/>, <rect key="c" x="3" y="14" width="7" height="7"/>, <rect key="d" x="14" y="14" width="7" height="7"/>] },
    { key: 'list',     badge: null,  paths: [<line key="a" x1="8" y1="6" x2="21" y2="6"/>, <line key="b" x1="8" y1="12" x2="21" y2="12"/>, <line key="c" x1="8" y1="18" x2="21" y2="18"/>, <line key="d" x1="3" y1="6" x2="3.01" y2="6"/>, <line key="e" x1="3" y1="12" x2="3.01" y2="12"/>, <line key="f" x1="3" y1="18" x2="3.01" y2="18"/>] },
    { key: 'users',    badge: '5',   paths: [<path key="a" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>, <circle key="b" cx="9" cy="7" r="4"/>, <path key="c" d="M23 21v-2a4 4 0 00-3-3.87"/>, <path key="d" d="M16 3.13a4 4 0 010 7.75"/>] },
    { key: 'person',   badge: null,  paths: [<path key="a" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>, <circle key="b" cx="12" cy="7" r="4"/>] },
  ];

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', overflow: 'hidden', fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif", fontSize: 13 }}>

      {/* ── Sidebar ── */}
      <div style={{ width: 195, background: SIDEBAR, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>

        {/* Logo */}
        <div style={{ height: 52, display: 'flex', alignItems: 'center', padding: '0 16px', gap: 8, borderBottom: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
          <span style={{ color: '#fff', fontSize: 20, fontWeight: 700, letterSpacing: '-0.3px' }}>Arize</span>
          {/* Stylised bird mark */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white" style={{ opacity: 0.92 }}>
            <path d="M22 3C19 2.5 15 4.5 13 8C10.5 6 7.5 5.5 5 6.5C7.5 8.5 9.5 11.5 9 15C11 14 14 12.5 16 9C16.5 12 16 15 14.5 17.5C17.5 15.5 20.5 12 22 3Z"/>
          </svg>
        </div>

        {/* Clinician avatar (no name) + active client */}
        <div style={{ padding: '10px 16px 12px', borderBottom: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
          <div style={{ marginBottom: 8, opacity: 0.6 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div style={{ marginBottom: 5 }}>
            <span style={{ background: '#27ae60', color: '#fff', fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10 }}>Active</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.88)', fontSize: 13 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" style={{ flexShrink: 0 }}>
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{clientName}</span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, paddingTop: 2 }}>
          {navItems.map((item) => {
            const isActive = item.label === 'Clients';
            const isHovered = hoveredNav === item.label;
            return (
              <div
                key={item.label}
                onMouseEnter={() => setHoveredNav(item.label)}
                onMouseLeave={() => setHoveredNav(null)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 11,
                  padding: '10px 16px 10px 13px',
                  borderLeft: isActive ? '3px solid rgba(255,255,255,0.7)' : '3px solid transparent',
                  background: isActive ? SIDEBAR_ACTIVE : isHovered ? 'rgba(255,255,255,0.09)' : 'transparent',
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.78)',
                  fontSize: 14, fontWeight: isActive ? 500 : 400,
                  cursor: 'default',
                  transition: 'background 0.14s ease',
                  userSelect: 'none',
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  {item.paths}
                </svg>
                {item.label}
              </div>
            );
          })}
        </nav>
      </div>

      {/* ── Main area ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Top bar */}
        <div style={{ height: 50, background: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', padding: '0 14px', gap: 10, flexShrink: 0 }}>
          {/* Back button */}
          <div
            onMouseEnter={() => setHoveredIcon('back')}
            onMouseLeave={() => setHoveredIcon(null)}
            style={{ width: 30, height: 30, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', background: hoveredIcon === 'back' ? '#edf2f7' : 'transparent', cursor: 'default', flexShrink: 0, transition: 'background 0.14s' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
          </div>

          {/* Search */}
          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e0', borderRadius: 4, overflow: 'hidden', flex: '0 0 310px' }}>
            <input
              placeholder="Global Search..."
              readOnly
              style={{ flex: 1, border: 'none', outline: 'none', padding: '7px 12px', fontSize: 13, color: '#666', background: '#fff', cursor: 'default' }}
            />
            <div style={{ background: SIDEBAR, padding: '7px 11px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
          </div>

          <div style={{ flex: 1 }} />

          {/* Right icon buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {rightIcons.map(icon => (
              <div key={icon.key} style={{ position: 'relative' }}>
                <div
                  onMouseEnter={() => setHoveredIcon(icon.key)}
                  onMouseLeave={() => setHoveredIcon(null)}
                  style={{ width: 32, height: 32, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', background: hoveredIcon === icon.key ? '#edf2f7' : 'transparent', cursor: 'default', transition: 'background 0.14s' }}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    {icon.paths}
                  </svg>
                </div>
                {icon.badge && (
                  <span style={{ position: 'absolute', top: 3, right: 3, background: '#e53e3e', color: '#fff', fontSize: 9, fontWeight: 700, borderRadius: '50%', width: 13, height: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, pointerEvents: 'none' }}>{icon.badge}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Note content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '22px 30px 80px', background: '#fff' }}>
          <div style={{ maxWidth: '55%' }}>
          <div style={{ fontSize: 13, color: '#888', marginBottom: 20 }}>{clientName} · Individual Therapy · {new Date().toLocaleDateString()}</div>
          <StackedFields noteValues={noteValues} onNoteChange={onNoteChange} highlightedField={highlightedField} labelColor='#444' fontSize={13} borderColor='#d0d7de' minHeight={165} borderRadius={6} />
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, paddingTop: 4 }}>
            <button style={{ padding: '9px 28px', fontSize: 13, fontWeight: 500, border: '1px solid #cdd3da', borderRadius: 5, background: '#fff', color: '#444', cursor: 'pointer' }}>Clear Fields</button>
            <button style={{ padding: '9px 28px', fontSize: 13, fontWeight: 600, border: 'none', borderRadius: 5, background: SIDEBAR, color: '#fff', cursor: 'pointer' }}>Submit Note</button>
          </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. ECHO (echoVantage)
// ═══════════════════════════════════════════════════════════════════════════════
const ECHO_NAV_ITEMS = [
  {
    label: 'Vantage Point', active: false,
    icon: <path key="a" d="M14 6l-1-2H5v17h2v-7h5l1 2h7V6h-6zm4 8h-4l-1-2H7V6h5l1 2h5v6z"/>,
  },
  {
    label: 'Clients', active: true,
    icon: <path key="a" d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>,
  },
  {
    label: 'Families', active: false,
    icon: <><path key="a" d="M9 11.3C10.4 11.3 11.5 10.1 11.5 8.6S10.4 6 9 6 6.5 7.2 6.5 8.6 7.6 11.3 9 11.3zM9 13c-2.3 0-7 1.2-7 3.5V18h14v-1.5c0-2.3-4.7-3.5-7-3.5zm6.5-2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm1.5 2.1c-.5-.1-1-.2-1.5-.2-.7 0-1.4.1-2 .3.9.8 1.5 1.8 1.5 3.3V18H23v-1.5c0-2-3.1-3.1-6-3.4z"/></>,
  },
  {
    label: 'Labs', active: false,
    icon: <path key="a" d="M19.8 18.4L14 10.67V6.5l1.35-1.69c.26-.33.03-.81-.39-.81H9.05c-.42 0-.65.48-.39.81L10 6.5v4.17L4.2 18.4c-.49.66-.02 1.6.8 1.6h14c.82 0 1.29-.94.8-1.6zM8 16l3.5-4.86V6h1v5.14L16 16H8z"/>,
  },
  {
    label: 'Groups', active: false,
    icon: <path key="a" d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>,
  },
  {
    label: 'Eligibility', active: false,
    icon: <path key="a" d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>,
  },
  {
    label: 'Services', active: false,
    icon: <path key="a" d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/>,
  },
  {
    label: 'Client Payments', active: false,
    icon: <path key="a" d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>,
  },
  {
    label: 'Forms', active: false,
    icon: <path key="a" d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>,
  },
];

export function EchoBg({ noteValues = {}, onNoteChange, highlightedField }) {
  const { clientName } = useEhrContext();
  const { selectedNoteType } = useNoteTypeContext();
  const noteTypeLabel = useMemo(() => NOTE_TYPE_LIST.find(t => t.id === selectedNoteType)?.label ?? selectedNoteType, [selectedNoteType]);
  const sessionDate = useMemo(() => new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), []);
  const [hoveredNav, setHoveredNav] = useState(null);
  const [hoveredIcon, setHoveredIcon] = useState(null);

  const SIDEBAR_BG  = '#323333';
  const ICON_BLUE   = '#4aabf7';
  const ORANGE      = '#ff680d';
  const ACTIVE_BG   = 'rgba(255,255,255,0.165)';
  const HEADER_BG   = '#eff0f0';
  const HEADER_BORD = '#d7d8d8';
  const LABEL_BLUE  = '#015595';
  const BODY_TEXT   = '#323333';
  const AVATAR_BLUE = '#1f74b4';

  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily: "'Open Sans', Verdana, Arial, sans-serif", fontSize: 13, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* ── Orange top header ── */}
      <div style={{ height: 50, background: ORANGE, display: 'flex', alignItems: 'center', padding: '0 8px', flexShrink: 0 }}>
        <img src="/echovantage-logo.png" style={{ height: 28, objectFit: 'contain', objectPosition: 'left center', flexShrink: 0, marginLeft: 4 }} alt="echoVantage" draggable={false} />
        <div style={{ flex: 1 }} />
        {[
          { key: 'alerts',  vb: '0 0 24 24', d: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 16.5c-.83 0-1.5-.67-1.5-1.5h3c0 .83-.67 1.5-1.5 1.5zm5-2.5H7v-1l1-1v-2.61C8 9.27 9.03 7.47 11 7v-.5c0-.57.43-1 1-1s1 .43 1 1V7c1.97.47 3 2.28 3 4.39V14l1 1v1z' },
          { key: 'reports', vb: '0 0 20 20', d: 'M10 20c5.523 0 10-4.477 10-10S15.523 0 10 0 0 4.477 0 10s4.477 10 10 10zm5-9.019V15h-2.009v-4.019H15zM10.981 5v10H9.019V5h1.962zM7.009 15V7.991H5V15h2.009z' },
          { key: 'help',    vb: '0 0 20 20', d: 'M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm1 17H9v-2h2v2zm2.07-7.75l-.9.92C11.45 10.9 11 11.5 11 13H9v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H6c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z' },
        ].map(({ key, vb, d }) => (
          <div key={key}
            onMouseEnter={() => setHoveredIcon(key)}
            onMouseLeave={() => setHoveredIcon(null)}
            style={{ width: 34, height: 34, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', background: hoveredIcon === key ? 'rgba(0,0,0,0.15)' : 'transparent', cursor: 'default', transition: 'background 0.14s ease' }}
          >
            <svg width="20" height="20" viewBox={vb} fill="white"><path fillRule="nonzero" d={d}/></svg>
          </div>
        ))}
        {/* User chip */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '0 4px', borderRadius: 16, background: 'rgba(255,255,255,0.18)', padding: '0 10px 0 0', height: 32, cursor: 'default' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: AVATAR_BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 7, flexShrink: 0 }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="white"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
          </div>
          <span style={{ fontSize: 13, color: '#fff', fontWeight: 500, whiteSpace: 'nowrap' }}>Eleos Service</span>
        </div>
        {/* Logout */}
        <div
          onMouseEnter={() => setHoveredIcon('logout')}
          onMouseLeave={() => setHoveredIcon(null)}
          style={{ width: 34, height: 34, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', background: hoveredIcon === 'logout' ? 'rgba(0,0,0,0.15)' : 'transparent', cursor: 'default', transition: 'background 0.14s ease' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </div>
      </div>

      {/* ── Main row: sidebar + content ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ── Left navigation sidebar ── */}
        <div style={{ width: 175, background: SIDEBAR_BG, display: 'flex', flexDirection: 'column', flexShrink: 0, overflowX: 'hidden', overflowY: 'auto' }}>
          {ECHO_NAV_ITEMS.map(item => {
            const isHovered = hoveredNav === item.label;
            return (
              <div
                key={item.label}
                onMouseEnter={() => setHoveredNav(item.label)}
                onMouseLeave={() => setHoveredNav(null)}
                style={{
                  display: 'flex', alignItems: 'center', minHeight: 50, minWidth: 175,
                  background: item.active || isHovered ? ACTIVE_BG : 'transparent',
                  cursor: 'default', transition: 'background 0.14s ease', userSelect: 'none',
                }}
              >
                <div style={{ width: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill={item.active ? ORANGE : ICON_BLUE}>
                    {item.icon}
                  </svg>
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{item.label}</span>
              </div>
            );
          })}
        </div>

        {/* ── Content area ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Breadcrumb bar */}
          <div style={{ background: HEADER_BG, borderBottom: `1px solid ${HEADER_BORD}`, height: 50, display: 'flex', alignItems: 'center', padding: '0 15px', flexShrink: 0, gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={LABEL_BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            <span style={{ color: LABEL_BLUE, fontSize: 13 }}>Clients</span>
            <span style={{ color: '#888', fontSize: 13 }}>/</span>
            <span style={{ color: LABEL_BLUE, fontSize: 13, fontWeight: 600 }}>{clientName}</span>
            <span style={{ color: '#888', fontSize: 13 }}>/</span>
            <span style={{ color: BODY_TEXT, fontSize: 13 }}>Encounters</span>
          </div>

          {/* Note form area */}
          <div style={{ flex: 1, overflowY: 'auto', background: '#fff', display: 'flex', flexDirection: 'column' }}>

            {/* Form header — orange left-border accent */}
            <div style={{
              padding: '12px 15px 12px 10px', background: HEADER_BG,
              display: 'flex', alignItems: 'center',
              borderBottom: `1px solid ${HEADER_BORD}`,
              borderLeft: `5px solid ${ORANGE}`,
              flexShrink: 0,
            }}>
              <div>
                <div style={{ fontSize: 17, fontWeight: 400, color: BODY_TEXT, margin: 0 }}>{noteTypeLabel}</div>
                <div style={{ fontSize: 11, color: '#676868', marginTop: 2 }}>{clientName} · Individual Therapy · {sessionDate}</div>
              </div>
              <div style={{ flex: 1 }} />
              <div style={{ display: 'flex', gap: 6 }}>
                {[
                  { k: 'save',   label: 'Save',   stroke: '#555', icon: <polyline key="a" points="20 6 9 17 4 12"/> },
                  { k: 'cancel', label: 'Cancel', stroke: '#888', icon: <><line key="a" x1="18" y1="6" x2="6" y2="18"/><line key="b" x1="6" y1="6" x2="18" y2="18"/></> },
                  { k: 'delete', label: 'Delete', stroke: '#888', icon: <><polyline key="a" points="3 6 5 6 21 6"/><path key="b" d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></> },
                ].map(({ k, label, stroke, icon }) => (
                  <button key={k}
                    onMouseEnter={() => setHoveredIcon(k)}
                    onMouseLeave={() => setHoveredIcon(null)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px',
                      background: hoveredIcon === k ? '#e4e5e5' : HEADER_BG,
                      border: `1px solid ${HEADER_BORD}`, borderRadius: 3,
                      fontSize: 11, fontWeight: 600, color: '#555',
                      cursor: 'default', transition: 'background 0.14s ease',
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{icon}</svg>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Note fields */}
            <div style={{ padding: '18px 24px 80px', flex: 1, width: '62%' }}>
              <StackedFields noteValues={noteValues} onNoteChange={onNoteChange} highlightedField={highlightedField} labelColor={LABEL_BLUE} fontSize={13} borderColor={HEADER_BORD} minHeight={165} borderRadius={3} />
            </div>

            {/* Bottom action bar */}
            <div style={{ position: 'sticky', bottom: 0, background: '#fff', borderTop: `1px solid ${HEADER_BORD}`, minHeight: 48, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 24px', gap: 12, flexShrink: 0 }}>
              <button style={{ padding: '7px 20px', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', border: `1px solid ${HEADER_BORD}`, borderRadius: 3, background: '#fff', color: '#555', cursor: 'pointer', letterSpacing: '0.03em' }}>Clear Fields</button>
              <button style={{ padding: '7px 20px', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', border: 'none', borderRadius: 3, background: ORANGE, color: '#fff', cursor: 'pointer', letterSpacing: '0.03em' }}>Submit Note</button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. CREDIBLE
// ═══════════════════════════════════════════════════════════════════════════════
export function CredibleBg({ noteValues = {}, onNoteChange, highlightedField }) {
  const { clientName } = useEhrContext();
  const [hoveredNav, setHoveredNav] = useState(null);
  const [hoveredTab, setHoveredTab] = useState(null);
  const [hoveredIcon, setHoveredIcon] = useState(null);

  const BRAND_PURPLE = '#3d2b8e';
  const TOP_STRIP    = '#1a0848';
  const HOVER_BG     = 'rgba(61,43,142,0.08)';

  const navTabs = ['Home', 'Client', 'Employee', 'Schedule', 'Service', 'Inpatient', 'Admin', 'Billing', 'Reports', 'Forms'];

  // Each item: label + inline SVG children
  const sidebarItems = [
    { label: 'Claims',        paths: [<path key="a" d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>, <polyline key="b" points="14 2 14 8 20 8"/>, <line key="c" x1="16" y1="13" x2="8" y2="13"/>, <line key="d" x1="16" y1="17" x2="8" y2="17"/>] },
    { label: 'Bed Assign',    paths: [<rect key="a" x="2" y="9" width="20" height="11" rx="2"/>, <path key="b" d="M2 14h20"/>, <path key="c" d="M6 9V7a1 1 0 011-1h3a1 1 0 011 1v2"/>] },
    { label: 'Amendments',    paths: [<path key="a" d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>, <path key="b" d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>] },
    { label: 'Credible Plan', paths: [<path key="a" d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/>, <rect key="b" x="8" y="2" width="8" height="4" rx="1"/>] },
    { label: 'Tx Plus',       paths: [<path key="a" d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>, <polyline key="b" points="14 2 14 8 20 8"/>, <line key="c" x1="12" y1="18" x2="12" y2="12"/>, <line key="d" x1="9" y1="15" x2="15" y2="15"/>] },
    { label: 'Allergy',       paths: [<path key="a" d="M18 11V6a2 2 0 00-2-2v0a2 2 0 00-2 2v0M14 10V4a2 2 0 00-2-2v0a2 2 0 00-2 2v2M10 10.5V6a2 2 0 00-2-2v0a2 2 0 00-2 2v8"/>, <path key="b" d="M18 8a2 2 0 114 0v6a8 8 0 01-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 012.83-2.82L7 15"/>] },
    { label: 'Attatchments',  paths: [<path key="a" d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>] },
    { label: 'Authorization', paths: [<path key="a" d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>, <circle key="b" cx="8.5" cy="7" r="4"/>, <polyline key="c" points="17 11 19 13 23 9"/>] },
    { label: 'Service List',  paths: [<line key="a" x1="8" y1="6" x2="21" y2="6"/>, <line key="b" x1="8" y1="12" x2="21" y2="12"/>, <line key="c" x1="8" y1="18" x2="21" y2="18"/>, <line key="d" x1="3" y1="6" x2="3.01" y2="6"/>, <line key="e" x1="3" y1="12" x2="3.01" y2="12"/>, <line key="f" x1="3" y1="18" x2="3.01" y2="18"/>] },
    { label: 'Add Service',   paths: [<circle key="a" cx="12" cy="12" r="10"/>, <line key="b" x1="12" y1="8" x2="12" y2="16"/>, <line key="c" x1="8" y1="12" x2="16" y2="12"/>] },
    { label: 'Overview',      paths: [<rect key="a" x="3" y="3" width="7" height="7"/>, <rect key="b" x="14" y="3" width="7" height="7"/>, <rect key="c" x="3" y="14" width="7" height="7"/>, <rect key="d" x="14" y="14" width="7" height="7"/>] },
    { label: 'Contacts',      paths: [<path key="a" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>, <circle key="b" cx="9" cy="7" r="4"/>, <path key="c" d="M23 21v-2a4 4 0 00-3-3.87"/>, <path key="d" d="M16 3.13a4 4 0 010 7.75"/>] },
    { label: 'Client Ext',    paths: [<path key="a" d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>, <polyline key="b" points="15 3 21 3 21 9"/>, <line key="c" x1="10" y1="14" x2="21" y2="3"/>] },
    { label: 'Client Links',  paths: [<path key="a" d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>, <path key="b" d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>] },
    { label: 'Dashboard',     paths: [<line key="a" x1="18" y1="20" x2="18" y2="10"/>, <line key="b" x1="12" y1="20" x2="12" y2="4"/>, <line key="c" x1="6" y1="20" x2="6" y2="14"/>] },
    { label: 'Diagnosis',     paths: [<polyline key="a" points="22 12 18 12 15 21 9 3 6 12 2 12"/>] },
    { label: 'Employee',      paths: [<path key="a" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>, <circle key="b" cx="12" cy="7" r="4"/>] },
  ];

  const headerIcons = [
    { key: 'account', paths: [<path key="a" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>, <circle key="b" cx="12" cy="7" r="4"/>, <circle key="c" cx="19" cy="19" r="3"/>, <line key="d" x1="19" y1="16" x2="19" y2="22"/>, <line key="e" x1="16" y1="19" x2="22" y2="19"/>] },
    { key: 'help',    paths: [<circle key="a" cx="12" cy="12" r="10"/>, <path key="b" d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/>, <line key="c" x1="12" y1="17" x2="12.01" y2="17"/>] },
    { key: 'mail',    paths: [<path key="a" d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>, <polyline key="b" points="22,6 12,13 2,6"/>] },
    { key: 'logout',  paths: [<path key="a" d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>, <polyline key="b" points="16 17 21 12 16 7"/>, <line key="c" x1="21" y1="12" x2="9" y2="12"/>] },
  ];

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif", fontSize: 13 }}>

      {/* ── Thin brand strip ── */}
      <div style={{ height: 4, background: TOP_STRIP, flexShrink: 0 }} />

      {/* ── Header ── */}
      <div style={{ height: 65, background: '#fff', borderBottom: '1px solid #e8e8e8', display: 'flex', alignItems: 'center', padding: '0 20px', flexShrink: 0 }}>
        <img src="/qualifacts-credible-logo.png" style={{ height: 44, objectFit: 'contain', objectPosition: 'left center' }} alt="Qualifacts Credible" draggable={false} />
        <div style={{ flex: 1 }} />
        {/* User section */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px solid #d0d0d0', borderRadius: 3, padding: '4px 12px', fontSize: 13, color: '#333' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.8" strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span style={{ color: '#444', fontSize: 13 }}>Demo Clinician</span>
          </div>
          <div style={{ display: 'flex', gap: 2 }}>
            {headerIcons.map(icon => (
              <div
                key={icon.key}
                onMouseEnter={() => setHoveredIcon(icon.key)}
                onMouseLeave={() => setHoveredIcon(null)}
                style={{ width: 28, height: 28, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', background: hoveredIcon === icon.key ? HOVER_BG : 'transparent', cursor: 'default', transition: 'background 0.14s' }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  {icon.paths}
                </svg>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Horizontal nav tabs ── */}
      <div style={{ height: 42, background: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 2, flexShrink: 0 }}>
        {navTabs.map(tab => {
          const isActive  = tab === 'Service';
          const isHovered = hoveredTab === tab && !isActive;
          return (
            <div
              key={tab}
              onMouseEnter={() => setHoveredTab(tab)}
              onMouseLeave={() => setHoveredTab(null)}
              style={{
                padding: '5px 14px', borderRadius: 4,
                background: isActive ? BRAND_PURPLE : isHovered ? HOVER_BG : 'transparent',
                color: isActive ? '#fff' : '#444',
                fontSize: 14, fontWeight: isActive ? 500 : 400,
                cursor: 'default', transition: 'background 0.14s', userSelect: 'none',
              }}
            >
              {tab}
            </div>
          );
        })}
      </div>

      {/* ── Body ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Left sidebar */}
        <div style={{ width: 158, background: '#fff', borderRight: '1px solid #e8e8e8', flexShrink: 0, overflowY: 'auto' }}>
          {sidebarItems.map(item => {
            const isActive  = false;
            const isHovered = hoveredNav === item.label && !isActive;
            return (
              <div
                key={item.label}
                onMouseEnter={() => setHoveredNav(item.label)}
                onMouseLeave={() => setHoveredNav(null)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 9,
                  padding: '8px 12px',
                  background: isActive ? BRAND_PURPLE : isHovered ? HOVER_BG : 'transparent',
                  color: isActive ? '#fff' : '#444',
                  fontSize: 13, cursor: 'default',
                  transition: 'background 0.14s', userSelect: 'none',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: isActive ? 1 : 0.65 }}>
                  {item.paths}
                </svg>
                {item.label}
              </div>
            );
          })}
        </div>

        {/* Note content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '22px 30px 80px', background: '#fff' }}>
          <div style={{ maxWidth: '55%' }}>
          <div style={{ fontSize: 13, color: '#888', marginBottom: 20 }}>{clientName} · Individual Therapy · {new Date().toLocaleDateString()}</div>
          <StackedFields noteValues={noteValues} onNoteChange={onNoteChange} highlightedField={highlightedField} labelColor='#444' fontSize={13} borderColor='#d0d7de' minHeight={165} borderRadius={6} />
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, paddingTop: 4 }}>
            <button style={{ padding: '9px 28px', fontSize: 13, fontWeight: 500, border: '1px solid #cdd3da', borderRadius: 5, background: '#fff', color: '#444', cursor: 'pointer' }}>Clear Fields</button>
            <button style={{ padding: '9px 28px', fontSize: 13, fontWeight: 600, border: 'none', borderRadius: 5, background: BRAND_PURPLE, color: '#fff', cursor: 'pointer' }}>Submit Note</button>
          </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. INSYNC
// ═══════════════════════════════════════════════════════════════════════════════
export function InsyncBg({ noteValues = {}, onNoteChange, highlightedField }) {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#f5f5f5' }}>

      {/* Layer 1 — Dashboard background (ref: 1771×942px) */}
      <img
        src={insyncDashboard}
        alt=""
        style={{
          position: 'absolute',
          top: '-9.02%', left: '-0.28%',
          width: '100.56%', height: '109.02%',
          objectFit: 'fill', pointerEvents: 'none', userSelect: 'none',
        }}
      />

      {/* Purple header bar patches */}
      <div style={{ position: 'absolute', left: 0, top: '0.85%', width: '18.01%', height: '2.65%', background: '#382866' }} />
      <div style={{ position: 'absolute', left: '91.13%', top: '0.74%', width: '8.75%', height: '2.65%', background: '#382866' }} />

      {/* Layer 2 — Note of Session overlay */}
      <div style={{ position: 'absolute', left: '2.88%', top: '10.83%', width: '96.72%', height: '85.77%', overflow: 'hidden' }}>
        <img
          src={insyncNote}
          alt=""
          style={{
            position: 'absolute',
            top: '-5.74%', left: 0,
            width: '100%', height: '110.73%',
            objectFit: 'fill', pointerEvents: 'none', userSelect: 'none',
          }}
        />
      </div>

      {/* Tab bar patches */}
      <div style={{ position: 'absolute', left: '7.17%', top: '15.60%', width: '13.21%', height: '2.34%', background: '#fff5dd' }} />
      <div style={{ position: 'absolute', left: '19.31%', top: '15.60%', width: '1.75%', height: '2.34%', background: '#fff5dd' }} />
      <div style={{ position: 'absolute', left: '39.07%', top: '15.60%', width: '7.85%', height: '2.02%', background: '#e8e8f2' }} />

      {/* Three yellow dots decoration */}
      <div style={{ position: 'absolute', top: '29.52%', right: '2.5%', bottom: '68.16%', left: '97.12%' }}>
        <svg style={{ display: 'block', width: '100%', height: '100%' }} fill="none" viewBox="0 0 6.66675 23.7731">
          <ellipse cx="3.33334" cy="3.05655" fill="#F6CF7E" rx="3.33333" ry="3.05655" />
          <ellipse cx="3.33341" cy="11.8866" fill="#F6CF7E" rx="3.33333" ry="3.05655" />
          <ellipse cx="3.33341" cy="20.7166" fill="#F6CF7E" rx="3.33333" ry="3.05655" />
        </svg>
      </div>

      {/* White note canvas — covers the note form area */}
      <div style={{ position: 'absolute', left: '4.01%', top: '29.83%', width: '95.09%', height: '70.17%', background: '#fff' }} />

      {/* StackedFields — sits within the white canvas */}
      <div style={{
        position: 'absolute',
        left: '4.01%', top: '29.83%',
        width: '58%', height: '70.17%',
        overflowY: 'auto',
        padding: '18px 24px',
        boxSizing: 'border-box',
      }}>
        <StackedFields
          noteValues={noteValues}
          onNoteChange={onNoteChange}
          highlightedField={highlightedField}
          labelColor='#555'
          fontSize={13}
          borderColor='#d0d8e4'
          minHeight={160}
          borderRadius={5}
        />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 7. CARELOGIC
// ═══════════════════════════════════════════════════════════════════════════════
export function CarlogicBg({ noteValues = {}, onNoteChange, highlightedField }) {
  const { clientName } = useEhrContext();
  const [activeNav, setActiveNav] = useState('Favorites');
  const [activeSide, setActiveSide] = useState('Individual Behavioral Health Counseling Note');
  const navItems = ['Favorites', 'Schedule', 'Front Desk', 'Point of Entry', 'Client', 'Employee', 'Administration', 'Billing/AR', 'BI', 'MY ALERTS'];
  const sideItems = ['Treatment Diagnosis', 'Goals Addressed', 'Individual Behavioral Health Counseling Note', 'Signatures'];

  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily: "'Segoe UI', Arial, sans-serif", fontSize: 13, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#fff' }}>
      {/* Thin purple bar */}
      <div style={{ height: 5, background: '#4a1278', flexShrink: 0 }} />

      {/* Header */}
      <div style={{ background: '#8aacc8', display: 'flex', alignItems: 'center', padding: '6px 16px', gap: 14, flexShrink: 0, minHeight: 56 }}>
        {/* Logo — white background panel so the PNG renders correctly against the blue-gray header */}
        <img src="/qualifacts-carelogic-logo.png" alt="Qualifacts Carelogic" style={{ height: 34, width: 'auto', display: 'block', mixBlendMode: 'multiply' }} />
        {/* Client search */}
        <div style={{ position: 'relative', flex: '0 0 260px' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2.2" style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input placeholder="Client Search" style={{ width: '100%', padding: '7px 10px 7px 30px', border: 'none', borderRadius: 4, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} readOnly />
        </div>
        <div style={{ flex: 1 }} />
        {/* Right-side icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, color: '#1a2b5e' }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22 6 12 13 2 6"/></svg>
          <span style={{ fontSize: 12, color: '#fff', fontWeight: 500 }}>Training, Eleos (25291)</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
          <div style={{ background: '#c0392b', color: '#fff', borderRadius: 3, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>PRODUCTION</div>
        </div>
      </div>

      {/* Nav bar */}
      <div style={{ background: '#a8bfd4', display: 'flex', alignItems: 'stretch', flexShrink: 0, borderBottom: '1px solid #8aacc8' }}>
        <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0 10px', display: 'flex', alignItems: 'center' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1a2b5e" strokeWidth="2.2"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </button>
        {navItems.map(item => (
          <button key={item} onClick={() => setActiveNav(item)} style={{
            background: 'transparent', border: 'none', cursor: 'pointer', padding: '9px 13px', fontSize: 13,
            fontWeight: activeNav === item ? 700 : 400,
            color: item === 'MY ALERTS' ? '#c0392b' : '#1a2b5e',
            borderBottom: activeNav === item ? '3px solid #1a2b5e' : '3px solid transparent',
            whiteSpace: 'nowrap', flexShrink: 0,
          }}>{item}</button>
        ))}
        <div style={{ flex: 1 }} />
        <button style={{ background: '#1a2b5e', color: '#fff', border: 'none', cursor: 'pointer', padding: '0 18px', fontSize: 13, fontWeight: 600, flexShrink: 0 }}>Return to Schedule</button>
      </div>

      {/* Body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left sidebar */}
        <div style={{ width: 200, background: '#b4c8d8', borderRight: '1px solid #8aacc8', flexShrink: 0, overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', padding: '9px 10px', borderBottom: '1px solid #9ab4c8', gap: 5 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1a2b5e" strokeWidth="2.5" style={{ marginTop: 2, flexShrink: 0 }}><polyline points="15 18 9 12 15 6"/></svg>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#1a2b5e', lineHeight: 1.3 }}>Clinical Progress Note (OBH)</span>
          </div>
          <div style={{ padding: '6px 10px 4px', fontSize: 11.5, color: '#1a2b5e', borderBottom: '1px solid #9ab4c8' }}>
            {clientName}<br />
            <span style={{ color: '#3a5a80' }}>5/25/2009</span>
          </div>
          {sideItems.map(item => (
            <div key={item} onClick={() => setActiveSide(item)} style={{
              padding: '9px 10px 9px 16px', fontSize: 13, color: '#1a2b5e', cursor: 'pointer',
              background: activeSide === item ? 'rgba(26,43,94,0.12)' : 'transparent',
              borderBottom: '1px solid rgba(255,255,255,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              fontWeight: activeSide === item ? 600 : 400,
            }}>
              <span>{item}</span>
              {activeSide === item && <svg width="8" height="12" viewBox="0 0 8 12"><polyline points="1 1 7 6 1 11" fill="none" stroke="#1a2b5e" strokeWidth="1.8"/></svg>}
            </div>
          ))}
          <div style={{ borderTop: '1px solid #9ab4c8', marginTop: 4 }}>
            <div style={{ padding: '8px 10px 4px 16px', fontSize: 13, fontWeight: 700, color: '#1a2b5e' }}>Document List</div>
          </div>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Note area */}
          <div style={{ flex: '0 0 62%', overflowY: 'auto', padding: '18px 24px', background: '#fff' }}>
            <StackedFields noteValues={noteValues} onNoteChange={onNoteChange} highlightedField={highlightedField}
              labelColor='#555' fontSize={13} borderColor='#ccc' minHeight={170} borderRadius={4} />
          </div>
          <div style={{ width: 1, background: '#dde1e7', flexShrink: 0 }} />
          {/* Right panel placeholder */}
          <div style={{ flex: 1, background: '#f0f4f8' }} />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 8. MYEVOLV
// ═══════════════════════════════════════════════════════════════════════════════
export function MyEvolvBg({ noteValues = {}, onNoteChange, highlightedField }) {
  const { clientName } = useEhrContext();
  const [activeNav, setActiveNav] = useState('My Progress Notes');
  const topTabs = ['Taskbar', 'Referral', 'Program\nReferrals', 'Client', 'People\nSearch', 'Incidents', 'Groups', 'Agency', 'Reports'];
  const sections = [
    ['Taskbar', 'Homeview', 'Front Desk Daily Check In', 'Front Desk NX'],
    ['Client', 'My Client', 'Enrollment Information', 'Planning', 'OASAS Goals', 'Service Entry', 'Placement Disruptions', 'Immunizations', 'Visits', 'Demographics', 'My Progress Notes', 'Problems/Needs', 'Strengths'],
  ];
  const pill = { background: '#124061', color: '#fff', border: '1px solid #8aa0ad', borderRadius: 18, height: 34, padding: '0 36px', fontSize: 18, lineHeight: '30px', boxShadow: 'inset 0 1px rgba(255,255,255,0.25)', cursor: 'pointer', fontFamily: 'inherit' };

  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily: "'Segoe UI', Arial, Helvetica, sans-serif", fontSize: 14, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#b6b7bc', color: '#222' }}>
      <div style={{ height: 66, background: '#f2f2f2', borderTop: '1px solid #222', display: 'flex', alignItems: 'stretch', flexShrink: 0 }}>
        <div style={{ width: 114, display: 'flex', alignItems: 'center', paddingLeft: 14, borderRight: '1px solid #aaa', boxSizing: 'border-box' }}>
          <span style={{ color: '#0c3d61', fontWeight: 800, fontStyle: 'italic', fontSize: 20, letterSpacing: '-1px' }}>myEvolv</span>
        </div>
        {topTabs.map(tab => (
          <button key={tab} style={{ whiteSpace: 'pre-line', background: 'transparent', border: 'none', padding: '0 22px', fontSize: 19, lineHeight: 1.1, fontWeight: 700, color: '#333', cursor: 'pointer', fontFamily: 'inherit' }}>{tab}</button>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '0 16px', borderLeft: '1px solid #aaa', color: '#666' }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          <svg width="31" height="31" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
          <span style={{ fontSize: 18 }}>⌄</span>
        </div>
      </div>
      <div style={{ height: 40, background: '#124061', display: 'flex', alignItems: 'center', flexShrink: 0, color: '#fff', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
        {['Client', 'Case Management', 'Progress Notes', 'My Progress Notes'].map(item => (
          <button key={item} style={{ height: '100%', padding: '0 18px', minWidth: item === 'Client' ? 120 : 210, background: '#124061', border: 'none', color: '#fff', fontSize: 19, textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}>{item}<span style={{ float: 'right', fontSize: 18 }}>›</span></button>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ position: 'relative', width: 280, marginRight: 18 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" style={{ position: 'absolute', left: 8, top: 7 }}><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input placeholder="Search..." style={{ width: '100%', height: 28, boxSizing: 'border-box', padding: '2px 10px 2px 38px', border: '2px solid #6d7378', fontSize: 20, background: '#fff', color: '#666' }} />
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', paddingTop: 16 }}>
        <aside style={{ width: 340, margin: '0 18px 18px 16px', background: '#fff', overflowY: 'auto', flexShrink: 0 }}>
          <div style={{ display: 'flex', height: 66, borderBottom: '1px solid #ddd', alignItems: 'center', justifyContent: 'space-around', color: '#999' }}>
            <button style={{ width: 100, height: 50, background: '#d8d8d8', border: '1px solid #aaa', borderRadius: 5, color: '#000', cursor: 'pointer' }}><svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="7" r="4"/><path d="M3 21c0-5 4-8 9-8s9 3 9 8"/></svg></button>
            <span style={{ fontSize: 45 }}>★</span>
            <span style={{ fontSize: 44 }}>↺</span>
          </div>
          <div style={{ padding: '8px 12px 24px' }}>
            <div style={{ color: '#27749f', fontSize: 26, fontWeight: 700, marginBottom: 6 }}>myNavigation</div>
            {sections.map(([heading, ...items]) => (
              <div key={heading}>
                <div style={{ background: '#e7e7e7', padding: '8px', fontSize: 24, fontWeight: 800, borderRadius: '4px 4px 0 0' }}>{heading}</div>
                {items.map(item => (
                  <button key={item} onClick={() => setActiveNav(item)} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 6px 8px 14px', border: 'none', background: activeNav === item ? '#f3f7fa' : '#fff', color: '#000', fontSize: 20, lineHeight: 1.35, cursor: 'pointer', fontFamily: 'inherit' }}>{item}</button>
                ))}
              </div>
            ))}
          </div>
        </aside>
        <main style={{ flex: 1, background: '#fff', overflowY: 'auto' }}>
          <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ minHeight: 126, display: 'flex', alignItems: 'flex-start', padding: '8px 10px 10px', borderBottom: '1px solid #e0e6eb', boxSizing: 'border-box' }}>
              <div style={{ width: 60, height: 68, border: '1px solid #ddd', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc', marginRight: 8 }}><svg width="48" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="12" cy="7" r="4"/><path d="M3 21c0-5 4-8 9-8s9 3 9 8"/></svg></div>
              <div style={{ fontSize: 18, lineHeight: 1.45, color: '#666', flex: 1 }}>
                <strong style={{ color: '#2670a6' }}>{clientName || 'TEST, ELEOS2'}</strong>
                <span style={{ marginLeft: 10 }}>| <strong>ID#</strong> 00105651</span>
                <span style={{ marginLeft: 24 }}><strong>DOB</strong> 07/01/2000</span>
                <span style={{ marginLeft: 24 }}><strong>Intake</strong> 03/16/2026</span>
                <span style={{ marginLeft: 24 }}><strong>Location</strong> 123 Main Street, MOUNT VERNON, NY 10553</span>
                <div style={{ fontWeight: 800, fontSize: 16, marginTop: 14 }}>25 Yrs M</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginLeft: 20 }}>
                <button style={{ ...pill, minWidth: 178, height: 34, padding: '0 20px' }}>Select Client</button>
                <select defaultValue="Actions" style={{ minWidth: 164, height: 34, borderRadius: 16, border: '1px solid #aaa', background: '#e7e7e7', padding: '0 28px', fontSize: 20, color: '#111' }}><option>Actions</option></select>
              </div>
            </div>
            <div style={{ padding: '10px 10px 12px', borderBottom: '1px solid #e0e6eb', display: 'flex', gap: 18, alignItems: 'center' }}>
              <button style={{ ...pill, marginRight: 0 }}>Select Note</button>
              <button style={{ ...pill }}>Send Alert</button>
              <button style={{ ...pill }}>Refresh</button>
              <button style={{ ...pill }}>Form Info</button>
            </div>
            <div style={{ height: 48, background: '#124061', color: '#fff', display: 'flex', alignItems: 'center', fontSize: 28, fontWeight: 800, padding: '0 20px', gap: 12 }}><span style={{ fontSize: 20 }}>⌃</span>Group 1</div>
            <div style={{ padding: '28px 28px 80px', maxWidth: '55%' }}>
              <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Note</div>
              <div style={{ border: '1px solid #c9c9c9', borderRadius: 5, overflow: 'hidden', marginBottom: 18, background: '#eee' }}>
                <div style={{ height: 58, display: 'flex', alignItems: 'center', gap: 0, padding: '0 8px', borderBottom: '1px solid #d2d2d2' }}>
                  {['B', 'I', 'U', '◼', 'S', 'x²', 'x₂', '14⌄', 'A', '≡', '1≡', '☷', 'T⌄', '▦', '◷'].map((item, i) => (
                    <button key={`${item}-${i}`} disabled={i !== 8} style={{ minWidth: i === 7 || i === 12 ? 66 : 44, height: 40, border: '1px solid #aaa', background: i === 8 ? '#b4b4b4' : '#a9a9a9', color: i === 8 ? '#fffb57' : '#909090', fontSize: 20, fontWeight: 800, cursor: i === 8 ? 'pointer' : 'default' }}>{item}</button>
                  ))}
                </div>
              </div>
              <StackedFields noteValues={noteValues} onNoteChange={onNoteChange} highlightedField={highlightedField} labelColor='#333' labelWeight={700} fontSize={14} borderColor='#c9c9c9' minHeight={150} borderRadius={4} bg='#fff' />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 9. MYAVATAR
// ═══════════════════════════════════════════════════════════════════════════════
export function MyAvatarBg({ noteValues = {}, onNoteChange, highlightedField }) {
  const { clientName } = useEhrContext();
  const [hoveredNav, setHoveredNav] = useState(null);
  const tabs = ['myDay', 'BH Documentation Viewer', 'Client Overview Medical', 'BH Compliance View', 'TRR View', 'CC INBOX', 'Widget Playground (Client)'];
  const navItems = ['My Clients', 'My Forms', 'My Favorites', 'Recent Forms'];
  const sections = ['Service Info', 'Clinical Information', 'Summary of Activities', 'Progress Towards Recovery'];
  const fieldNav = ['BH CBT Note', 'Service Info', 'Clinical Information', 'Summary of Activities', 'Progress Towards Recovery', 'Plan to Continue Recovery', 'Encounter Data'];

  function navStyle(label) {
    const hovered = hoveredNav === label;
    return {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 8px',
      cursor: 'pointer',
      color: '#003f5c',
      background: hovered ? '#e6e6e6' : 'transparent',
      fontWeight: 700,
    };
  }

  const panelTitle = (title) => (
    <div style={{ background: '#004866', color: '#fff', padding: '6px 10px', fontWeight: 700, borderRadius: '3px 3px 0 0', display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 18, lineHeight: 1 }}>›</span>
      {title}
    </div>
  );

  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily: 'Roboto, Arial, sans-serif', fontSize: 14, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#ccc', color: '#111' }}>
      <div style={{ height: 42, background: '#f2f2f2', borderTop: '2px solid #1e5b2a', borderBottom: '1px solid #a4b7c1', display: 'flex', alignItems: 'stretch', flexShrink: 0 }}>
        <div style={{ width: 156, display: 'flex', alignItems: 'center', paddingLeft: 2, background: '#fff', flexShrink: 0 }}>
          <img src="/myavatar-nx-logo.png" alt="myAvatar NX" style={{ width: 150, height: 'auto', display: 'block' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'stretch', overflowX: 'auto', flex: 1 }}>
          {tabs.map(tab => (
            <button key={tab} style={{
              padding: '0 14px', border: 'none', borderRight: tab === 'myDay' ? '1px solid #a4b7c1' : 'none', borderLeft: tab === 'myDay' ? '1px solid #a4b7c1' : 'none',
              background: tab === 'myDay' ? '#e6e6e6' : 'transparent',
              color: tab === 'myDay' ? '#111' : '#555',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: tab === 'myDay' ? 700 : 400,
              whiteSpace: 'nowrap',
            }}>{tab}</button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '0 9px', color: '#333', fontSize: 12, flexShrink: 0 }}>
          <span style={{ color: '#0076a8', fontWeight: 700 }}>Customize</span>
          <span style={{ border: '1px solid #8aa0aa', borderRadius: 10, padding: '1px 7px', background: '#fff', fontSize: 11 }}>OFF</span>
          <span style={{ fontSize: 20 }}>✉</span>
          <span style={{ fontSize: 20 }}>☰</span>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#333" aria-label="User">
            <circle cx="12" cy="7" r="5" />
            <path d="M3 22c0-5.5 4-9 9-9s9 3.5 9 9" />
          </svg>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#39b54a', display: 'inline-block' }} />
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <div style={{ width: 244, background: '#f4f6f6', borderRight: '1px solid #a4b7c1', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ height: 42, background: '#d0d0d0', borderBottom: '1px solid #a4b7c1', position: 'relative' }}>
            <button style={{ position: 'absolute', right: 11, top: 9, border: 'none', background: 'transparent', color: '#004866', cursor: 'pointer', fontSize: 20 }}>‹</button>
          </div>
          <div style={{ padding: '10px 8px 7px', borderBottom: '2px solid #20b34a' }}>
            <div style={{ color: '#536c79', fontSize: 10, marginBottom: 3 }}>LOGGED IN AS</div>
            <div style={{ color: '#003f5c', fontWeight: 700, marginBottom: 12 }}>Eleos TestOne</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: '#536c79', fontSize: 20 }}>⌕</span>
              <input placeholder="What can I help you find?" style={{ width: '100%', boxSizing: 'border-box', padding: '6px 8px', border: '3px solid #c2cfd6', borderRadius: 8, fontSize: 13, fontStyle: 'italic', background: '#fff' }} />
            </div>
            <a href="#" onClick={e => e.preventDefault()} style={{ display: 'block', margin: '6px 0 0 19px', color: '#0076a8', fontSize: 12 }}>Advanced Client Search</a>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {navItems.map(label => (
              <div key={label} style={navStyle(label)} onMouseEnter={() => setHoveredNav(label)} onMouseLeave={() => setHoveredNav(null)}>
                {label}
                <span style={{ fontSize: 15 }}>{label === 'My Clients' ? '☷' : '›'}</span>
              </div>
            ))}
            <div style={{ marginTop: 8, borderTop: '1px solid #d0d0d0', padding: '10px 8px' }}>
              <div style={{ color: '#003f5c', fontWeight: 700, marginBottom: 8 }}>Control Panel</div>
              <div style={{ display: 'flex', gap: 10, color: '#004866' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v10"/><path d="M18.4 6.6a9 9 0 1 1-12.8 0"/></svg>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="5" width="16" height="14" rx="2"/></svg>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="10" r="1.5"/><path d="M21 16l-5-5L5 19"/></svg>
              </div>
            </div>
            <div style={{ display: 'flex', margin: '4px 8px', border: '1px solid #333', borderRadius: 3, overflow: 'hidden' }}>
              <button style={{ flex: 1, background: '#004866', color: '#fff', border: 'none', padding: '7px 0' }}>My Clients</button>
              <button style={{ flex: 1, background: '#fff', color: '#004866', border: 'none', padding: '7px 0' }}>Site</button>
            </div>
            {[['TEST, CLIENT', '4444']].map(([name, id]) => (
              <div key={id} style={{ color: '#ff6b00', padding: '7px 8px', fontSize: 12, lineHeight: 1.35 }}>
                <div>› {name}</div>
                <div style={{ paddingLeft: 12 }}>ID#: {id}</div>
              </div>
            ))}
          </div>
          <div style={{ padding: '8px 10px', borderTop: '1px solid #a4b7c1', color: '#536c79', fontSize: 11 }}>
            AVPM-LUX[TRADE] ELEOS1
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ height: 42, background: '#d0d0d0', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <div style={{ marginLeft: 10, height: 28, width: 190, background: '#f4f4f4', borderLeft: '3px solid #004866', display: 'flex', alignItems: 'center', paddingLeft: 8, color: '#004866', fontSize: 13 }}>▣ BH CBT Note</div>
          </div>
          <div style={{ height: 20, background: '#fff', borderBottom: '1px solid #a4b7c1', position: 'relative', flexShrink: 0 }}>
            <span style={{ position: 'absolute', left: 8, top: -3, color: '#004866', fontSize: 23 }}>▴</span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', background: '#ccc' }}>
            <div style={{ height: 136, display: 'flex', background: '#fff', borderBottom: '1px solid #a4b7c1' }}>
              <div style={{ width: 120, marginLeft: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="82" height="82" viewBox="0 0 82 82" fill="#004866"><circle cx="41" cy="22" r="18"/><path d="M12 74c0-22 13-35 29-35s29 13 29 35c0 4-3 7-7 7H19c-4 0-7-3-7-7z"/></svg>
              </div>
              <div style={{ flex: 1, background: '#004866' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', background: '#fff', padding: '10px 8px 16px', gap: 16 }}>
              <div style={{ width: 260, flexShrink: 0 }}>
                <h2 style={{ color: '#0076a8', fontSize: 19, margin: 0 }}>BH CBT NOTE</h2>
              </div>
              <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', gap: 14 }}>
                {['Submit', 'Backup', 'Discard', 'Add to Favorites'].map((label, i) => (
                  <button key={label} style={{ minWidth: 65, border: 'none', borderRadius: 18, padding: '3px 9px', background: i === 0 ? '#b9c6d1' : '#004866', color: '#fff', cursor: 'pointer', fontSize: 11, lineHeight: 1.15 }}>{label}</button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', padding: '10px 8px 0', gap: 16 }}>
              <div style={{ width: 260, flexShrink: 0 }}>
                <div style={{ background: '#fff', padding: 8 }}>
                  {fieldNav.map((item, i) => (
                    <div key={item} style={{ padding: '3px 20px', background: i === 0 ? '#c2cfd6' : 'transparent', borderRadius: 2, color: '#111', fontSize: 14 }}>{item}</div>
                  ))}
                </div>
              </div>

              <div style={{ flex: 1, minWidth: 520 }}>
                {panelTitle(sections[0])}
                {panelTitle(sections[1])}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ background: '#004866', color: '#fff', padding: '7px 10px', fontWeight: 700 }}>⌄ Summary of Activities</div>
                  <div style={{ background: '#f5f6f6', padding: 22, border: '1px solid #c2cfd6', borderTop: 'none' }}>
                    <StackedFields noteValues={noteValues} onNoteChange={onNoteChange} highlightedField={highlightedField} labelColor='#cc0000' fontSize={13} borderColor='#b8c8d1' minHeight={92} borderRadius={0} />
                  </div>
                </div>
                {panelTitle(sections[3])}
              </div>

              <div style={{ width: 460, flexShrink: 0 }}>
                {['PN AUTH END', 'PN DX WIDGET', 'PN PCRP DATES'].map((title, i) => (
                  <div key={title} style={{ height: i === 1 ? 190 : 180, background: '#f5f6f6', marginBottom: 12, borderTop: '10px solid #c2cfd6' }}>
                    <div style={{ background: '#004866', color: '#fff', padding: '8px 10px' }}>{title}<span style={{ float: 'right' }}>↗ ↻</span></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 10. KIPU
// ═══════════════════════════════════════════════════════════════════════════════
const KIPU_PURPLE = '#6C18C9';
const KIPU_CHART_TABS = [
  'Information', 'Pre-Admission', 'Admission', 'Releases', 'Nursing Intake', 'Financial Intake', 'Clinical Assessments', 'Treatment Plans', 'Clinical Progress Notes', 'Wiley HW', 'Completed Group Sessions', 'ASAM/Transfer',
  'Case Management', 'Medical', 'Recurring Assessments', "Doctor's Orders", 'MAR', 'Nursing', 'Labs', 'Discharge Planning', 'Disclosure Log', 'Rounds', 'Patient Ledger', 'Patient Assessments', 'Flags', 'Vitals',
  'Documents', 'Lab Orders', 'Lab Requisitions', 'Lab Reports', 'Attendance', 'Chart Summary',
];

export function KipuBg({ noteValues = {}, onNoteChange, highlightedField }) {
  const { clientName } = useEhrContext();
  const [hoveredNav, setHoveredNav] = useState(null);
  const [hoveredIcon, setHoveredIcon] = useState(null);
  const [hoveredTab, setHoveredTab] = useState(null);
  const navItems = ['Dashboard', 'Clients', 'Occupancy', 'Schedules', 'Shifts', 'Contacts', 'Labs', 'Reports', 'Templates', 'Inventory', 'Help'];

  const chartTabs = (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {KIPU_CHART_TABS.map(item => {
        const isActive = item === 'Clinical Progress Notes';
        const isHovered = hoveredTab === item;
        return (
          <span key={item} onMouseEnter={() => setHoveredTab(item)} onMouseLeave={() => setHoveredTab(null)} style={{
            padding: '5px 10px', fontSize: 12, whiteSpace: 'nowrap', cursor: 'default', borderRadius: 3,
            color: isActive ? KIPU_PURPLE : '#3a4a5c',
            fontWeight: isActive ? 700 : 400,
            background: isActive ? '#fff' : isHovered ? '#b8d3fb' : '#cadffe',
            border: isActive ? '1px solid #6fa4e8' : '1px solid transparent',
            borderBottom: isActive ? '1px solid #fff' : '1px solid transparent',
          }}>{item}</span>
        );
      })}
    </div>
  );

  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily: "'Segoe UI', Arial, sans-serif", fontSize: 13, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#fff' }}>
      {/* Purple header */}
      <div style={{ background: KIPU_PURPLE, display: 'flex', alignItems: 'center', padding: '8px 18px', gap: 16, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect width="24" height="24" rx="5" fill="rgba(255,255,255,0.18)"/>
            <text x="12" y="17" textAnchor="middle" fontFamily="Arial,sans-serif" fontWeight="900" fontSize="14" fill="#fff">K</text>
          </svg>
          <span style={{ fontWeight: 700, fontSize: 16, color: '#fff', letterSpacing: '0.01em' }}>Kipu EMR</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'rgba(255,255,255,0.85)', fontSize: 12, cursor: 'default' }}>
          All Locations
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        <div style={{ flex: 1 }} />
        <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12 }}>{new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {[
            { key: 'search', paths: <><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></> },
            { key: 'bell', badge: 2, paths: <><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></> },
            { key: 'download', paths: <><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></> },
            { key: 'mail', paths: <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22 6 12 13 2 6"/></> },
          ].map(icon => (
            <div key={icon.key} onMouseEnter={() => setHoveredIcon(icon.key)} onMouseLeave={() => setHoveredIcon(null)} style={{ position: 'relative', width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: hoveredIcon === icon.key ? 'rgba(255,255,255,0.16)' : 'transparent', transition: 'background 0.14s ease' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9">{icon.paths}</svg>
              {icon.badge && <span style={{ position: 'absolute', top: -1, right: -1, background: '#fff', color: KIPU_PURPLE, borderRadius: '50%', width: 13, height: 13, fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{icon.badge}</span>}
            </div>
          ))}
          <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 4 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
        </div>
      </div>
      {/* White nav bar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e8e8e8', display: 'flex', alignItems: 'stretch', flexShrink: 0, overflowX: 'auto' }}>
        {navItems.map(item => {
          const isActive = item === 'Clients';
          const isHovered = hoveredNav === item;
          return (
            <div key={item} onMouseEnter={() => setHoveredNav(item)} onMouseLeave={() => setHoveredNav(null)} style={{
              padding: '10px 14px', cursor: 'default', fontSize: 13, whiteSpace: 'nowrap',
              color: isActive ? KIPU_PURPLE : '#444',
              fontWeight: isActive ? 600 : 400,
              borderBottom: isActive ? `2px solid ${KIPU_PURPLE}` : '2px solid transparent',
              background: !isActive && isHovered ? '#f7f2fb' : 'transparent',
              transition: 'background 0.14s ease',
            }}>
              {item}
            </div>
          );
        })}
      </div>
      {/* Patient info bar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 18, flexShrink: 0, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#222' }}>{clientName}</span>
        <div style={{ width: 1, height: 18, background: '#e2e8f0' }} />
        <span style={{ fontSize: 12, color: '#444' }}><b>MR#:</b> ——</span>
        <span style={{ fontSize: 12, color: '#444' }}><b>DOB:</b> ——/——/——</span>
        <div style={{ width: 3, height: 18, background: '#8fd19e', borderRadius: 2 }} />
        <span style={{ fontSize: 12, color: '#444' }}><b>Location:</b> — <b style={{ marginLeft: 8 }}>LoC:</b> —</span>
        <span style={{ fontSize: 12, color: '#444' }}>No known allergies</span>
        <div style={{ flex: 1 }} />
        <div style={{ width: 24, height: 24, borderRadius: 4, background: '#eee', color: '#666', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>P</div>
        <button style={{ background: '#fff', border: '1px solid #aac4e0', borderRadius: 4, padding: '5px 12px', fontSize: 12, fontWeight: 600, color: '#337ab7', cursor: 'default', display: 'flex', alignItems: 'center', gap: 5 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#337ab7" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          SCHEDULER
        </button>
        <div style={{ width: 22, height: 24, border: '1px solid #d0d7de', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="3"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
      </div>
      {/* Chart section tabs */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '10px 20px', flexShrink: 0 }}>
        {chartTabs}
      </div>
      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '18px 24px 60px', background: '#fff' }}>
        <div style={{ maxWidth: 700, marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 2 }}>← Clinical Progress Notes</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#222', marginBottom: 12 }}>Individual Progress Note</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button style={{ padding: '9px 20px', fontSize: 13, border: '1px solid #ccc', borderRadius: 20, background: '#eee', color: '#444', cursor: 'default' }}>Add signers</button>
            <button style={{ padding: '10px 22px', fontSize: 12, fontWeight: 700, letterSpacing: '0.03em', border: 'none', borderRadius: 22, background: '#274a78', color: '#fff', cursor: 'default' }}>ADD COMMENTS / PRINT PREVIEW</button>
          </div>
        </div>

        <div style={{ background: '#cadffe', borderRadius: 4, padding: '16px 20px', marginBottom: 14, maxWidth: 700 }}>
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-end', flexWrap: 'wrap', paddingBottom: 16, borderBottom: '2px solid #fff' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#222', flex: '0 0 100px' }}>Date of Service:</div>
            {['Start time', 'Duration', 'Unit', 'End time'].map(f => (
              <div key={f}>
                <div style={{ fontSize: 11, color: '#555', marginBottom: 4 }}>{f}</div>
                {f === 'Unit' ? (
                  <select style={{ padding: '5px 8px', fontSize: 12, border: '1px solid #b8c9e0', borderRadius: 3, background: '#fff' }}><option>Minute</option><option>Hour</option></select>
                ) : (
                  <input style={{ padding: '5px 8px', fontSize: 12, border: '1px solid #b8c9e0', borderRadius: 3, width: 130 }} placeholder={f === 'Start time' ? '' : '—'} />
                )}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap', padding: '16px 0', borderBottom: '2px solid #fff' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#222' }}>Level of Care:</span>
            {['DETOX', 'MH RESIDENTIAL', 'RESIDENTIAL', 'MH PHP', 'PHP', 'IOP'].map(lvl => (
              <label key={lvl} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#333', cursor: 'default' }}>
                <input type="radio" name="kipu-loc" readOnly checked={false} /> {lvl}
              </label>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 0', borderBottom: '2px solid #fff' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#222' }}>Treatment Objectives Addressed</span>
            <button style={{ background: 'linear-gradient(to bottom, #fcfcfc, #e2e2e2)', color: '#333', border: '1px solid #adadad', borderRadius: 4, padding: '5px 14px 5px 8px', fontSize: 12, fontWeight: 600, cursor: 'default', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 1px 1px rgba(0,0,0,0.08)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#3fae4a" stroke="#2e8b3a" strokeWidth="1"/><line x1="12" y1="7" x2="12" y2="17" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/><line x1="7" y1="12" x2="17" y2="12" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/></svg>
              Golden Thread
            </button>
          </div>

          <div style={{ paddingTop: 16 }}>
            <StackedFields noteValues={noteValues} onNoteChange={onNoteChange} highlightedField={highlightedField} labelColor='#222' labelWeight={700} fontSize={13} borderColor='#b8c9e0' minHeight={100} borderRadius={4} bg='#fff' />
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#333', marginBottom: 6 }}>Annotations</div>
          <div style={{ fontSize: 12, color: '#888', fontStyle: 'italic' }}>No Annotations found</div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
          <button style={{ padding: '8px 16px', fontSize: 12, border: 'none', borderRadius: 4, background: '#e8e8e8', color: '#999', cursor: 'default' }}>Update</button>
          <button style={{ padding: '8px 16px', fontSize: 12, border: '1px solid #ccc', borderRadius: 4, background: '#fff', color: '#444', cursor: 'default' }}>Validate assessment</button>
          <button style={{ padding: '8px 16px', fontSize: 12, border: '1px solid #ccc', borderRadius: 4, background: '#fff', color: '#444', cursor: 'default' }}>Sign & Submit</button>
          <button style={{ padding: '8px 16px', fontSize: 12, border: '1px solid #ccc', borderRadius: 4, background: '#fff', color: '#444', cursor: 'default' }}>Add signers</button>
          <button style={{ padding: '8px 16px', fontSize: 12, border: '1px solid #ccc', borderRadius: 4, background: '#fff', color: '#444', cursor: 'default' }}>Preview/print view</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 11. FOOTHOLD (AWARDS)
// ═══════════════════════════════════════════════════════════════════════════════
export function FootholdBg({ noteValues = {}, onNoteChange, highlightedField }) {
  const { clientName } = useEhrContext();
  const [hoveredNav, setHoveredNav] = React.useState(null);
  const activeNav = 'Charts';

  const initials = clientName
    ? clientName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'CT';

  const navItems = [
    { label: 'Home',           icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
    { label: 'Favorites',      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>, arrow: true },
    { label: 'Census',         icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, arrow: true },
    { label: 'Charts',         icon: <svg width="16" height="16" viewBox="0 0 20 19" fill="currentColor"><path fillRule="evenodd" clipRule="evenodd" d="M2 0a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V5.154a2 2 0 0 0-2-2h-6.142a2 2 0 0 1-1.45-.622L8.592.622A2 2 0 0 0 7.142 0H2Zm5.5 6.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm3.5 2a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm.883 3.5c.413.46.734 1.01.931 1.626l.196.61A2.477 2.477 0 0 1 12.92 16h2.708a1 1 0 0 0 .952-1.305l-.195-.611A3 3 0 0 0 13.529 12h-1.646Zm-8.269 2.084A3 3 0 0 1 6.471 12H8.53a3 3 0 0 1 2.857 2.084l.196.61A1 1 0 0 1 10.629 16H4.371a1 1 0 0 1-.952-1.305l.195-.611Z"/></svg>, arrow: true },
    { label: 'Administration', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>, arrow: true },
    { label: 'Reports',        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="12" y2="17"/></svg> },
  ];

  const printItem = { label: 'Print', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg> };

  function navStyle(label) {
    const isActive = label === activeNav;
    const isHovered = hoveredNav === label;
    return {
      display: 'flex', alignItems: 'center', gap: 16,
      padding: '10px 16px 10px 20px',
      cursor: 'pointer', fontSize: 14, userSelect: 'none',
      borderLeft: isActive ? '4px solid #63e5cd' : '4px solid transparent',
      color: isActive ? '#63e5cd' : (isHovered ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.65)'),
      fontWeight: isActive ? 500 : 400,
      background: isActive && isHovered ? 'rgba(99,229,205,0.1)' : (isHovered && !isActive ? 'rgba(255,255,255,0.07)' : 'transparent'),
      transition: 'background 0.15s, color 0.15s',
    };
  }

  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily: "'Segoe UI', Arial, sans-serif", fontSize: 13, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#fff' }}>
      {/* Header — 52px, #0f2e40 matching source */}
      <div style={{ background: '#0f2e40', height: 52, display: 'flex', alignItems: 'center', flexShrink: 0, padding: '0 0 0 0' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px', height: '100%' }}>
          <img src="/foothold-logo.png" alt="Foothold" height="21" width="66" style={{ display: 'block' }} />
        </div>
        <div style={{ flex: 1 }} />
        {/* Right nav */}
        <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          {/* Calendar */}
          <button style={{ background: 'none', border: 'none', color: '#fff', padding: '0 16px', height: '100%', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          </button>
          {/* Messages with badge */}
          <button style={{ background: 'none', border: 'none', color: '#fff', padding: '0 16px', height: '100%', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, position: 'relative' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <span style={{ background: '#f65152', color: '#fff', fontSize: 11, fontWeight: 600, borderRadius: 10, padding: '1px 5px', lineHeight: 1.4 }}>2</span>
          </button>
          {/* Help */}
          <button style={{ background: 'none', border: 'none', color: '#fff', padding: '0 16px', height: '100%', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <span>Help</span>
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2.5 4.5l3.5 3.5 3.5-3.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
          {/* Separator */}
          <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.3)', margin: '0 4px' }} />
          {/* User */}
          <button style={{ background: 'none', border: 'none', color: '#fff', padding: '0 16px', height: '100%', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#b33771', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: '#fff', flexShrink: 0 }}>TC</div>
            <span>Tal Cohen</span>
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2.5 4.5l3.5 3.5 3.5-3.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        </div>
      </div>
      {/* Content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left sidebar — #0f2e40 to match header */}
        <div style={{ width: 240, background: '#0f2e40', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          {/* Search button */}
          <button
            style={{ display: 'flex', alignItems: 'center', gap: 8, width: 'calc(100% - 16px)', margin: '10px 8px 6px', padding: '8px 12px', background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: 4, color: 'rgba(255,255,255,0.65)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.13)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <span style={{ flex: 1, textAlign: 'left' }}>Search Client</span>
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M4.5 2.5l3.5 3.5-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
          {/* Nav items */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {navItems.map(item => (
              <div
                key={item.label}
                style={navStyle(item.label)}
                onMouseEnter={() => setHoveredNav(item.label)}
                onMouseLeave={() => setHoveredNav(null)}
              >
                {item.icon}
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.arrow && (
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M4.5 2.5l3.5 3.5-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                )}
              </div>
            ))}
          </div>
          {/* Bottom: Print + footer */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div
              style={navStyle(printItem.label)}
              onMouseEnter={() => setHoveredNav(printItem.label)}
              onMouseLeave={() => setHoveredNav(null)}
            >
              {printItem.icon}
              <span>{printItem.label}</span>
            </div>
            <div style={{ padding: '8px 20px 14px', fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>
              <div>04/10/2026 9:17 AM EST</div>
              <div>Foothold Technology © 2026</div>
            </div>
          </div>
        </div>
        {/* Right column: client nav + breadcrumbs + main */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Client nav bar */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '8px 24px', borderBottom: '1px solid #e8e8e8', background: '#fff', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#2f7bed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: '#fff', flexShrink: 0 }}>{initials}</div>
              <span style={{ fontSize: 18, fontWeight: 600, color: '#0f2e40' }}>{clientName || 'Select a Client'}</span>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex' }}>
              <button style={{ background: '#fff', border: '1px solid #c3cbcf', padding: '6px 16px', fontSize: 13, cursor: 'pointer', borderRadius: '4px 0 0 4px', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit', color: '#0f2e40' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#009e8b" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                Client Info
              </button>
              <button style={{ background: '#fff', border: '1px solid #c3cbcf', borderLeft: 'none', padding: '6px 16px', fontSize: 13, cursor: 'pointer', borderRadius: '0 4px 4px 0', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit', color: '#0f2e40' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#009e8b" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                Go To
              </button>
            </div>
          </div>
          {/* Breadcrumbs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 24px', borderBottom: '1px solid #e8e8e8', background: '#fff', fontSize: 12, flexShrink: 0 }}>
            <a href="#" onClick={e => e.preventDefault()} style={{ color: '#0f2e40', textDecoration: 'none' }}>Home</a>
            <span style={{ fontSize: 10, color: '#0f2e40' }}>›</span>
            <a href="#" onClick={e => e.preventDefault()} style={{ color: '#0f2e40', textDecoration: 'none' }}>Charts</a>
            <span style={{ fontSize: 10, color: '#0f2e40' }}>›</span>
            <a href="#" onClick={e => e.preventDefault()} style={{ color: '#009e8b', fontWeight: 500, textDecoration: 'none' }}>Progress Note</a>
          </div>
          {/* Main content — unchanged */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px', background: '#fff' }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1a2a3a', margin: '0 0 16px 0' }}>Hi Eleos!</h1>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#1e3a6e', color: '#fff', borderRadius: 6, padding: '6px 14px', marginBottom: 24, fontSize: 13, fontWeight: 600 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            FRI, APR 10
          </div>
          {/* Cards row */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
            <div style={{ flex: 1, border: '1px solid #e0e8f0', borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #e0e8f0', display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e07030" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
                <span style={{ fontWeight: 600, fontSize: 14, color: '#1a2a3a' }}>Useful Links</span>
              </div>
              <div style={{ padding: '32px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#c0c8d0', minHeight: 140 }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#d0d8e0" strokeWidth="1.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                <span style={{ fontSize: 13, marginTop: 10 }}>No Useful Links.</span>
              </div>
            </div>
            <div style={{ flex: 1, border: '1px solid #c8e4ee', borderRadius: 8, overflow: 'hidden', background: '#e8f6fa' }}>
              <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid #c8e4ee' }}>
                <div style={{ width: 32, height: 32, background: '#fff', border: '1px solid #c8e4ee', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 26 26"><rect x="0" y="2" width="26" height="4" rx="2" fill="#8aacc8"/><rect x="0" y="9" width="20" height="4" rx="2" fill="#8aacc8"/><rect x="0" y="16" width="14" height="4" rx="2" fill="#8aacc8"/></svg>
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1a2a3a' }}>Scheduled AWARDS Maintenance</div>
                  <div style={{ fontSize: 11, color: '#6a8aa8' }}>Friday, April 10 @ 9PM ET</div>
                </div>
              </div>
              <div style={{ padding: '12px 14px' }}>
                <p style={{ fontSize: 13, color: '#334', margin: '0 0 8px 0', lineHeight: 1.5 }}>AWARDS will be offline for scheduled maintenance on Friday, April 10, from 9:00 PM EST to...</p>
                <a href="#" onClick={e => e.preventDefault()} style={{ fontSize: 13, color: '#2a7ab8', textDecoration: 'none' }}>More</a>
              </div>
            </div>
          </div>
          {/* Note area (scrollable below fold) */}
          <div style={{ border: '1px solid #e0e8f0', borderRadius: 8, overflow: 'hidden', marginTop: 16, maxWidth: '60%' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #e0e8f0', fontWeight: 600, fontSize: 14, color: '#1a2a3a' }}>Progress Note — {clientName}</div>
            <div style={{ padding: '16px' }}>
              <StackedFields noteValues={noteValues} onNoteChange={onNoteChange} highlightedField={highlightedField} labelColor='#555' fontSize={13} borderColor='#d0dae8' minHeight={150} borderRadius={5} />
            </div>
          </div>
          </div>{/* end main content */}
        </div>{/* end right column */}
      </div>{/* end content row */}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 12. EXYM
// ═══════════════════════════════════════════════════════════════════════════════
export function ExymBg({ noteValues = {}, onNoteChange, highlightedField }) {
  const { clientName } = useEhrContext();
  const [activePageTab, setActivePageTab] = useState('PAGE 1');
  const navItems = [
    { label: 'Home', drop: true }, { label: 'Clients', drop: true }, { label: 'Activities', drop: false },
    { label: 'Group Activities', drop: true }, { label: 'Documents', drop: true }, { label: 'Support', drop: false },
    { label: 'Payers', drop: true }, { label: 'Reports', drop: false }, { label: 'CalAIM Reports', drop: false },
    { label: 'Accounting', drop: true }, { label: 'CalAIM Billing', drop: true }, { label: 'Admin', drop: true },
    { label: 'My Forms', drop: false },
  ];
  const pageTabs = ['PAGE 1', 'CO-SIGNERS', 'DIAGNOSIS', 'PROBLEM LIST', 'CARE PLAN CYCLES'];

  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily: "'Segoe UI', Arial, sans-serif", fontSize: 13, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#fafafa' }}>
      {/* App bar — matches Exym mdc-top-app-bar */}
      <div style={{ background: '#537799', display: 'flex', alignItems: 'center', padding: '8px 16px', flexShrink: 0, gap: 12 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        <svg width="105" height="28" viewBox="0 0 181.7 76" style={{ flexShrink: 0 }}>
          <path fill="#fff" d="M34.1,1.7v9.6H13.3V25h17.8v9.6H13.3v15.6h21.6v9.6H1.6V1.7H34.1z"/>
          <path fill="#C2A266" d="M61.5,16h11.7L61.8,37.3l11.9,22.6H62l-6.5-14.3L49,59.8H37.2l11.9-22.6L37.7,16h11.7l6,13.2L61.5,16z"/>
          <path fill="#fff" d="M79,65.8C80,66,81,66,82,66c4.2,0,5.7-2.3,6-6.2L75.7,16h11.7l6.5,30.3h0.2L99.8,16H111l-10.6,40.9 C96.5,72.1,94,74.2,83.6,74.2H79L79,65.8L79,65.8z"/>
          <path fill="#fff" d="M114.2,16h10.7v4.5h0.2c2.8-4,6.4-5.6,11.1-5.6c5.1,0,8.9,2.5,10.1,7h0.2c1.7-4.6,5.8-7,11.1-7 c7.4,0,10.9,4.6,10.9,13.1v31.8h-11.2V29.2c0-3.7-1.2-5.7-4.4-5.7c-3.6,0-5.9,2.4-5.9,7.5v28.8h-11.2V29.2c0-3.7-1.2-5.7-4.4-5.7 c-3.6,0-5.9,2.4-5.9,7.5v28.8h-11.2L114.2,16L114.2,16z"/>
        </svg>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', borderLeft: '1px solid rgba(255,255,255,0.3)', paddingLeft: 12 }}>Edit a Note</span>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', borderLeft: '1px solid rgba(255,255,255,0.3)', paddingLeft: 12 }}>{clientName} — Progress Note</span>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 4, overflow: 'hidden' }}>
          <input placeholder="Client Search" style={{ padding: '5px 10px', background: 'transparent', border: 'none', fontSize: 12.5, color: '#fff', outline: 'none', width: 170 }} />
          <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '5px 10px', color: 'rgba(255,255,255,0.6)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </button>
        </div>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      </div>
      {/* Nav bar — same blue as header, shadow separates the two rows */}
      <div style={{ background: '#537799', display: 'flex', alignItems: 'stretch', flexShrink: 0, overflowX: 'auto', boxShadow: 'inset 0 1px 0 rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.1)' }}>
        {navItems.map((item, i) => (
          <button key={i} style={{ padding: '8px 13px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 12.5, color: '#c8d4e0', whiteSpace: 'nowrap', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 3 }}>
            {item.label}{item.drop && <span style={{ fontSize: 10 }}>▾</span>}
          </button>
        ))}
      </div>
      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#fff' }}>
        <div style={{ padding: '10px 16px', background: '#fff', borderBottom: '1px solid #e8e8e8', flexShrink: 0, fontSize: 13, color: '#444' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ fontWeight: 600 }}>No Show:</span>
            <input type="checkbox" style={{ margin: 0 }} />
            <span style={{ color: '#888', marginLeft: 8 }}>Reason: — Client Absent</span>
          </label>
          <div style={{ marginTop: 6 }}>
            <span style={{ fontWeight: 600 }}>Note Status:</span>
            <span style={{ marginLeft: 8 }}>In progress</span>
          </div>
        </div>
        {/* Page tabs — matches Exym reference exactly */}
        <div style={{ display: 'flex', flexShrink: 0, padding: '12px 16px 0', background: '#fafafa', borderBottom: '1px solid #d8dee4' }}>
          {pageTabs.map((tab, idx) => (
            <button
              key={tab}
              onClick={() => setActivePageTab(tab)}
              style={{
                flex: 1,
                marginRight: idx === pageTabs.length - 1 ? 0 : 6,
                padding: '10px 12px',
                cursor: 'pointer',
                fontSize: 12.5,
                fontWeight: 600,
                letterSpacing: '0.03em',
                whiteSpace: 'nowrap',
                background: '#fff',
                color: activePageTab === tab ? '#537799' : '#556c8d',
                border: '1px solid #c8d4e0',
                borderBottom: activePageTab === tab ? '2px solid #537799' : '1px solid #c8d4e0',
                borderTopLeftRadius: 4,
                borderTopRightRadius: 4,
                transition: 'all 0.1s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 36,
              }}
            >
              {tab}
            </button>
          ))}
        </div>
        {/* Action buttons */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '8px 16px', borderBottom: '1px solid #e8e8e8', gap: 8, flexShrink: 0 }}>
          <button style={{ padding: '6px 14px', background: '#fff', border: '1px solid #ccc', borderRadius: 3, fontSize: 12.5, cursor: 'pointer', color: '#333' }}>VIEW FORMATTED NOTE</button>
          <button style={{ padding: '6px 14px', background: '#fff', border: '1px solid #ccc', borderRadius: 3, fontSize: 12.5, cursor: 'pointer', color: '#333' }}>SAVE CHANGES</button>
          <button style={{ padding: '6px 14px', background: '#1e3a6e', border: 'none', borderRadius: 3, fontSize: 12.5, cursor: 'pointer', color: '#fff', fontWeight: 600 }}>--SUBMIT--</button>
          <div style={{ flex: 1 }} />
          <a href="#" onClick={e => e.preventDefault()} style={{ fontSize: 12, color: '#2a7ab8', textDecoration: 'none' }}>XML Export</a>
        </div>
        {/* Note area */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <div style={{ flex: '0 0 52%', overflowY: 'auto', padding: '16px 20px' }}>
            <StackedFields noteValues={noteValues} onNoteChange={onNoteChange} highlightedField={highlightedField} labelColor='#555' fontSize={13} borderColor='#ccc' minHeight={175} borderRadius={4} />
          </div>
          <div style={{ width: 1, background: '#ccc', flexShrink: 0 }} />
          <div style={{ flex: 1, background: '#fafafa' }} />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 14. PCE
// ═══════════════════════════════════════════════════════════════════════════════
export function PCEBg({ noteValues = {}, onNoteChange, highlightedField }) {
  const { clientName } = useEhrContext();
  const [activeIndex, setActiveIndex] = useState('Note');

  const pceInput = { border: '1px solid #888', fontSize: 12, height: 20, boxSizing: 'border-box', fontFamily: 'Arial, sans-serif' };
  const indexItems = ['Note', 'Mental Status Exam', 'Risk Assessment', 'Diagnosis', 'Send Copy To', 'Signatures'];
  const shellLinks = [
    ['Chart Documents', 'chartblue'], ['Eligibility/Insurance', 'eligibility'], ['Health/PHCP Info', 'health'], ['Client Appointments', 'calendar'],
    ['1 Alert', 'alert'], ['Diagnosis', 'dx'], ['Authorizations', 'auths'], ['Education Portal', 'education'],
  ];
  const selectStyle = { ...pceInput, background: '#fff', minWidth: 150 };

  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily: 'Arial, Tahoma, Helvetica, sans-serif', fontSize: 12, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#fff', color: '#000' }}>
      <div style={{ height: 93, flexShrink: 0, position: 'relative', background: '#fff' }}>
        <div style={{ height: 4 }} />
        <div style={{ width: 960, height: 87, position: 'relative', padding: 1, background: 'linear-gradient(90deg, #ffffff 0%, #f3fbfb 45%, #d6efef 100%)' }}>
          <div style={{ position: 'absolute', top: 20, left: 10, color: '#55360e', font: 'bold 12px Calibri, Arial' }}>PCE Care Management</div>
          <div style={{ position: 'absolute', top: 66, left: 7, height: 15, display: 'flex', alignItems: 'center', gap: 5 }}>
            <img src="/pce-backButtonTeal.png" alt="Back" />
            <img src="/pce-homeButtonTeal.png" alt="Home" />
            <span style={{ width: 8 }} />
            <img src="/pce-message1.png" alt="Messages" />
            <button type="button" style={{ height: 35, display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12 }}>Login</button>
          </div>
          <div title="Add Progress Note" style={{ position: 'absolute', top: 70, left: 550, width: 400, textAlign: 'right', font: '14px Calibri, Arial' }}><b>Add Progress Note</b></div>
          <div style={{ position: 'absolute', top: 6, left: 790, width: 160, textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: 5 }}>
            <img src="/pce-logoutButtonTeal.png" alt="Logout" />
            <img src="/pce-helpButtonTeal.png" alt="Help" />
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>
        <div style={{ width: 960 }}>
          <div style={{ paddingBottom: 3 }}>
            <div style={{ display: 'flex', gap: 10, marginLeft: 10, marginBottom: 0 }}>
              <button style={{ border: 0, background: '#dc0000', color: '#fff', fontWeight: 700, fontSize: 12, padding: '2px 10px' }}>Adverse Reactions/Allergies</button>
              <button style={{ border: 0, background: '#0060dc', color: '#fff', fontWeight: 700, fontSize: 12, padding: '2px 10px' }}>Access Notes</button>
              <button style={{ border: 0, background: '#ffff00', color: '#000', fontWeight: 700, fontSize: 12, padding: '2px 10px' }}>Clinical Notes</button>
            </div>
            <div style={{ border: '2px solid #0060dc', padding: 3, background: '#edf5ff', marginTop: 0 }}>
              <table style={{ width: '98%', fontSize: 12 }}><tbody>
                <tr><td style={{ width: 74 }}>02/06/25</td><td>Admitted: Demo Hospital</td></tr>
                <tr><td>01/22/24</td><td>THIS IS A TEST CHART</td></tr>
                <tr><td>02/27/17</td><td>This is the note that shows at the top of the chart</td></tr>
              </tbody></table>
            </div>
          </div>

          <div style={{ background: '#d5d5d5', padding: 1 }}>
            <div style={{ background: '#f7f7f7', border: '1px solid #aaa' }}>
              <div style={{ background: '#ddd', padding: 2, display: 'grid', gridTemplateColumns: '30% 20% 1fr auto', gap: 8 }}>
                <span><b style={{ color: '#2b3b4c' }}>Name:&nbsp;</b><b>{clientName || 'Demo, Client'}</b>&nbsp;&nbsp;(9/M)</span>
                <span><b style={{ color: '#2b3b4c' }}>Case #:&nbsp;</b><b>DEMO-0001</b></span>
                <span><b style={{ color: '#2b3b4c' }}>Current LOC:&nbsp;</b><b>SED - Level 4 - High</b>&nbsp;&nbsp;<b style={{ color: '#2b3b4c' }}>IH LOC:&nbsp;</b><b>None</b></span>
                <span><b style={{ color: '#2b3b4c' }}>Case:&nbsp;</b><b style={{ color: '#109030' }}>Open</b></span>
              </div>
              <div style={{ padding: 1, background: '#f00' }}><div style={{ background: '#fff', textAlign: 'center', border: '1px solid red' }}><b>Reading Assistance,&nbsp;&nbsp;GUARDIAN</b></div></div>
              <div style={{ display: 'grid', gridTemplateColumns: '28% 40% 1fr', gap: 6, padding: 2 }}>
                <div style={{ fontSize: 11, padding: 2 }}>
                  <b style={{ color: '#2b3b4c' }}>Date of Birth</b><br />01/01/2000<br /><br />
                  <b style={{ color: '#2b3b4c' }}>Address</b><br />123 Demo St<br />Demo City, ST 00000<br /><br />
                  <b style={{ color: '#2b3b4c' }}>Email Address:</b><br /><b>demo.client@example.com</b>
                </div>
                <div>
                  <div style={{ border: '1px solid #aaa', marginBottom: 5 }}>
                    <div style={{ background: '#cededc', textAlign: 'center', fontWeight: 700, fontSize: 10 }}>Current Admission:</div>
                    <div style={{ padding: 3 }}><b style={{ color: '#2b3b4c' }}>Primary Program:&nbsp;</b>MIC Outpatient</div>
                    <div style={{ padding: 3 }}><b style={{ color: '#2b3b4c' }}>Case Holder:&nbsp;</b>Unassigned</div>
                  </div>
                  <div style={{ border: '1px solid #ddd' }}>
                    <div style={{ background: '#cededc', textAlign: 'center', fontWeight: 700, fontSize: 10 }}>Current Funding</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: 3, gap: 3, fontSize: 11 }}>
                      <span><b>Medicaid:</b> Not Eligible</span><span><b>CCBHC State Funding:</b> Yes</span>
                      <span><b>CWP:</b> No</span><span><b>SED Waiver:</b> No</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'center', color: '#f00', fontWeight: 700, fontSize: 11, marginTop: 6 }}>*** NON-MEDICAID CLIENT ***<br />*** SUICIDE WARNING ALERT ***</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 18px', alignContent: 'start', padding: '2px 0 0 12px' }}>
                  {shellLinks.map(([label, cls]) => (
                    <a key={label} href="#" onClick={e => e.preventDefault()} style={{ color: '#184ab6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                      <span style={{ width: 14, height: 14, border: '1px solid #9aa', background: cls === 'alert' ? '#c00' : '#e8eef5', display: 'inline-block' }} />{label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '165px 1fr', alignItems: 'start', marginTop: 5 }}>
            <div style={{ width: 165 }}>
              <div style={{ background: '#23a1b9', color: '#fff', fontWeight: 700, textAlign: 'center', padding: 3 }}>Index</div>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, borderLeft: '1px solid #23a1b9', borderRight: '1px solid #23a1b9', borderBottom: '1px solid #23a1b9' }}>
                {indexItems.map((label, i) => (
                  <li key={label} onClick={() => setActiveIndex(label)} style={{ display: 'flex', gap: 4, padding: '3px 4px', background: activeIndex === label ? '#e5e5e5' : '#fff', cursor: 'pointer', fontSize: 12 }}>
                    <span style={{ width: 18, textAlign: 'right' }}>{i + 1}.</span>
                    {activeIndex === label ? <span>{label}</span> : <a href="#" onClick={e => e.preventDefault()} style={{ color: '#184ab6' }}>{label}</a>}
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ width: 780, paddingLeft: 5 }}>
              {activeIndex === 'Note' ? (
                <>
                  <div style={{ border: '1px solid #999', background: '#fbfbfe', padding: 5, marginBottom: 8 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '110px 110px 1fr', gap: 12, marginBottom: 8 }}>
                      <label><b style={{ color: '#2b3b4c' }}>Date</b><br /><input defaultValue="06/30/2026" style={{ ...pceInput, width: 90 }} /></label>
                      <label><b style={{ color: '#2b3b4c' }}>Begin Time</b><br /><input defaultValue="02:21" style={{ ...pceInput, width: 42 }} /> <select defaultValue="PM" style={{ ...pceInput, width: 48 }}><option>AM</option><option>PM</option></select></label>
                      <label><b style={{ color: '#2b3b4c' }}>Staff</b><br /><span>Demo Clinician</span></label>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                      <label><b style={{ color: '#2b3b4c' }}>Contact Type</b><br /><select style={selectStyle}><option>* Select Contact Type</option><option>Face to Face</option><option>Telephone</option></select></label>
                      <label><b style={{ color: '#2b3b4c' }}>Attendance</b><br /><select style={selectStyle}><option>* Select Attendance</option><option>Client Present</option><option>No-Show</option></select></label>
                      <label><b style={{ color: '#2b3b4c' }}>Place Of Contact</b><br /><select style={selectStyle}><option>* Select Place Of Contact</option><option>Office</option><option>Home</option><option>Telemed Video-Client at Home</option></select></label>
                    </div>
                    <label style={{ display: 'block', marginTop: 8 }}><input type="checkbox" /> Flag this note as critical information for prescriber to view during medical review <img src="/pce-red-flag.png" alt="" style={{ verticalAlign: 'middle' }} /></label>
                  </div>

                  <StackedFields noteValues={noteValues} onNoteChange={onNoteChange} highlightedField={highlightedField} labelColor='#2b3b4c' labelWeight={700} fontSize={12} borderColor='#888' minHeight={116} borderRadius={0} fontFamily='Arial, Tahoma, Helvetica, sans-serif' />

                  <div style={{ border: '2px solid #c00', background: '#fff', padding: 4, marginTop: 8 }}><b>REMINDER:</b><br />Update Health &amp; Safety Warnings as applicable</div>
                  <div style={{ marginTop: 8, borderTop: '1px solid #888', paddingTop: 5, display: 'flex', gap: 4 }}>
                    <input type="button" value="Save and Continue to Mental Status Exam" />
                    <input type="button" value="Save" />
                    <input type="button" value="Cancel" />
                  </div>
                </>
              ) : (
                <div style={{ border: '1px solid #999', background: '#fbfbfe', minHeight: 420, padding: 12 }}>
                  <h3 style={{ margin: '0 0 8px', fontSize: 14, color: '#2b3b4c' }}>{activeIndex}</h3>
                  <p style={{ margin: 0 }}>This page is listed in the exported PCE index. Note fields are only shown on the Note page.</p>
                </div>
              )}
            </div>
          </div>

          <div style={{ borderTop: '1px solid #888', marginTop: 5, padding: '3px 0', display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
            <span>Tuesday, June 30, 2026 2:21 PM Eastern Time</span>
            <span>Demo Clinician</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', font: 'normal 10px Verdana, Arial, Helvetica, sans-serif', color: '#707070' }}>
            <b>PCE Care Management 9.4 Copyright 1999, 2026 PCE Systems Inc. All rights reserved.</b>
            <span>TIME-OUT IN: 58 Minutes, 33 Seconds</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 15. ELEOS LITE
// ═══════════════════════════════════════════════════════════════════════════════
export function EleosLiteBg({ noteValues = {}, onNoteChange, highlightedField }) {
  const { clientName } = useEhrContext();
  const [activeNav, setActiveNav] = useState('Progress Notes');
  const clinicalModules = ['Overview', 'Vitals', 'Demographics', 'Progress Notes', 'Appointments', 'History'];

  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: 13, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#f7f8fa' }}>
      {/* Top nav */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e8ecf0', display: 'flex', alignItems: 'center', padding: '0 20px', height: 52, flexShrink: 0, gap: 4 }}>
        {/* Hamburger */}
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', marginRight: 4, display: 'flex', flexDirection: 'column', gap: 3.5 }}>
          {[0,1,2].map(i => <div key={i} style={{ width: 18, height: 2, background: '#444', borderRadius: 1 }} />)}
        </button>
        {/* Eleos logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 24 }}>
          <svg width="28" height="28" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="18" fill="#1a3560"/>
            <path d="M11 18 Q18 8 25 18 Q18 28 11 18Z" fill="#f0c040" opacity="0.9"/>
            <circle cx="18" cy="18" r="4" fill="#fff"/>
          </svg>
          <span style={{ fontWeight: 700, fontSize: 16, color: '#1a3560' }}>eleos</span>
        </div>
        {/* Nav items */}
        {['Patients', 'Schedule', 'Tasks', 'Reports'].map(item => (
          <button key={item} style={{
            padding: '6px 14px', border: 'none', cursor: 'pointer', fontSize: 13, borderRadius: 6, fontWeight: item === 'Patients' ? 600 : 400,
            background: item === 'Patients' ? '#1a3560' : 'transparent',
            color: item === 'Patients' ? '#fff' : '#555',
          }}>{item}</button>
        ))}
        <div style={{ flex: 1 }} />
        {/* Search */}
        <div style={{ position: 'relative', width: 280 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input placeholder="Search by patient name, DOB, or MRN..." style={{ width: '100%', padding: '8px 12px 8px 32px', border: '1px solid #e0e4ea', borderRadius: 8, fontSize: 12, color: '#333', outline: 'none', background: '#f7f8fa', boxSizing: 'border-box' }} />
        </div>
        {/* Icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 16 }}>
          <div style={{ position: 'relative' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.8"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
            <div style={{ position: 'absolute', top: -4, right: -4, background: '#e84040', color: '#fff', borderRadius: '50%', width: 13, height: 13, fontSize: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>1</div>
          </div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          {/* User avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#222' }}>Dr. Sarah Johnson</div>
              <div style={{ fontSize: 10, color: '#888' }}>Psychiatrist, MD</div>
            </div>
            <div style={{ width: 32, height: 32, background: '#1a3560', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 12 }}>SJ</div>
          </div>
        </div>
      </div>
      {/* Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left sidebar */}
        <div style={{ width: 200, background: '#fff', borderRight: '1px solid #e8ecf0', flexShrink: 0, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          {/* Current Patient */}
          <div style={{ padding: '14px 14px 8px', borderBottom: '1px solid #e8ecf0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Current Patient</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f5f7fa', border: '1px solid #e8ecf0', borderRadius: 8, padding: '8px 10px' }}>
              <div style={{ width: 32, height: 32, background: '#e0e6f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6080a0" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#1a2a3a' }}>{clientName}</div>
                <div style={{ fontSize: 10, color: '#888' }}>MRN: 8829-102</div>
              </div>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
          </div>
          {/* Clinical Modules */}
          <div style={{ padding: '12px 14px 4px' }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Clinical Modules</span>
          </div>
          {clinicalModules.map(item => (
            <div key={item} onClick={() => setActiveNav(item)} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', cursor: 'pointer', borderRadius: 0,
              background: activeNav === item ? '#1a3560' : 'transparent',
            }}
            onMouseEnter={e => { if (activeNav !== item) e.currentTarget.style.background = '#f5f7fa'; }}
            onMouseLeave={e => { if (activeNav !== item) e.currentTarget.style.background = 'transparent'; }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={activeNav === item ? '#fff' : '#6080a0'} strokeWidth="1.8">
                {item === 'Overview' && <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></>}
                {item === 'Vitals' && <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>}
                {item === 'Demographics' && <><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></>}
                {item === 'Progress Notes' && <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></>}
                {item === 'Appointments' && <><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>}
                {item === 'History' && <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>}
              </svg>
              <span style={{ fontSize: 13, color: activeNav === item ? '#fff' : '#334', fontWeight: activeNav === item ? 600 : 400, flex: 1 }}>{item}</span>
              {activeNav === item && <div style={{ width: 6, height: 6, background: '#4a9eff', borderRadius: '50%' }} />}
            </div>
          ))}
          {/* System */}
          <div style={{ padding: '12px 14px 4px', marginTop: 4 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.07em' }}>System</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.background = '#f5f7fa'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6080a0" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            <span style={{ fontSize: 13, color: '#334' }}>Configuration</span>
          </div>
          {/* System Status */}
          <div style={{ margin: '10px 10px 14px', background: '#f5f7fa', border: '1px solid #e8ecf0', borderRadius: 8, padding: '10px 12px', marginTop: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <div style={{ width: 8, height: 8, background: '#2ecc71', borderRadius: '50%' }} />
              <span style={{ fontWeight: 600, fontSize: 12, color: '#222' }}>System Status</span>
            </div>
            <div style={{ fontSize: 11, color: '#888' }}>All systems operational. Last synced 2 mins ago.</div>
          </div>
        </div>
        {/* Main content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Encounter header */}
          <div style={{ background: '#fff', borderBottom: '1px solid #e8ecf0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', flexShrink: 0 }}>
            <span style={{ fontSize: 13, color: '#666' }}>
              Encounter #29384 &nbsp;·&nbsp; Outpatient Visit &nbsp;·&nbsp; 4/14/2026
            </span>
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={{ background: '#fff', border: '1px solid #ccd0d8', borderRadius: 6, padding: '7px 16px', fontSize: 13, cursor: 'pointer', color: '#333', fontWeight: 500 }}>Save Draft</button>
              <button style={{ background: '#2255cc', border: 'none', borderRadius: 6, padding: '7px 16px', fontSize: 13, cursor: 'pointer', color: '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                Sign &amp; Finalize
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
            </div>
          </div>
          {/* Note area */}
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            <div style={{ flex: '0 0 62%', overflowY: 'auto', padding: '20px 28px', background: '#fff' }}>
              <StackedFields noteValues={noteValues} onNoteChange={onNoteChange} highlightedField={highlightedField} labelColor='#555' fontSize={13} borderColor='#dde4ee' minHeight={180} borderRadius={6} />
            </div>
            <div style={{ width: 1, background: '#e8ecf0', flexShrink: 0 }} />
            <div style={{ flex: 1, background: '#f7f8fa' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
export function StreamlineBg({ noteValues = {}, onNoteChange, highlightedField, activitySelectionSeq }) {
  const { clientName } = useEhrContext();
  const { lockedDownMode } = useLockedDownModeContext();
  const [activeTab, setActiveTab] = useState('Service');
  useEffect(() => {
    // activitySelectionSeq starts at 0 and only increments on a real activity
    // selection, so this deliberately does nothing on mount (seq === 0).
    if (activitySelectionSeq && lockedDownMode) setActiveTab('Note');
  }, [activitySelectionSeq]); // eslint-disable-line react-hooks/exhaustive-deps -- only an activity selection should trigger this, not lockedDownMode toggling alone
  const [serviceValues, setServiceValues] = useState({
    status: 'Show',
    program: '',
    procedure: 'Assessment LPHA',
    location: '',
    modeOfDelivery: '',
    evidenceBasedPractices: '',
    transportationService: 'No',
    attending: '',
    referring: '',
  });
  const patientLabel = clientName ? clientName.replace(/^(.*)\s+(\S+)$/, '$2, $1') : 'Test, Client (1099)';
  const serviceOptions = {
    status: ['Show', 'In Progress', 'New', 'Complete', 'Cancelled'],
    program: ['', 'Adult Services', 'Crisis Services', 'Outpatient Services', 'Residential Services'],
    procedure: ['', 'Assessment LPHA', 'Group Therapy', 'Therapy - Group', 'Individual Therapy', 'Case Management'],
    location: ['', 'Office', 'Home', 'In Community', 'School', 'Telehealth'],
    modeOfDelivery: ['', 'Face To Face', 'Telehealth', 'Phone', 'Collateral'],
    evidenceBasedPractices: ['', 'CBT', 'DBT', 'MI', 'Seeking Safety'],
    transportationService: ['No', 'From Client Location', 'To Client Location'],
    attending: ['', 'Admin, David', 'Young, Tim', 'Campbell, Brian'],
    referring: ['', 'Referring 1', 'Referring 2'],
  };
  const navItems = [
    ['badge:CT', 'Consent To Share Data', false],
    ['door', 'My Office', true],
    ['badge:ST', 'Shared Treatment Plan', false],
    ['user', 'Client', true],
    ['badge:CF', 'Client Funds', false],
    ['external', 'SmartLinks', false],
  ];
  const selectStyle = {
    width: 230,
    height: 25,
    border: '1px solid #cfcfcf',
    background: '#fff',
    color: '#111',
    fontSize: 13,
    fontFamily: 'inherit',
  };
  const fieldBoxStyle = {
    width: 230,
    height: 25,
    border: '1px solid #cfcfcf',
    background: '#fff',
    display: 'flex',
    alignItems: 'center',
    padding: '0 6px',
    fontSize: 13,
    boxSizing: 'border-box',
  };
  const setServiceValue = (field, value) => setServiceValues(prev => ({ ...prev, [field]: value }));
  const formRow = (label, field, required = false) => (
    <div style={{ display: 'grid', gridTemplateColumns: '148px 232px', alignItems: 'center', gap: 8, minHeight: 31 }}>
      <label style={{ fontSize: 13, color: '#111' }}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {required && <span style={{ color: '#ff4050', fontSize: 19, fontWeight: 700 }}>*</span>}
        {serviceOptions[field] ? (
          <select value={serviceValues[field]} onChange={e => setServiceValue(field, e.target.value)} style={selectStyle}>
            {serviceOptions[field].map(option => <option key={option || 'blank'} value={option}>{option}</option>)}
          </select>
        ) : (
          <div style={{ ...fieldBoxStyle, background: field === 'cancelReason' ? '#f6f6f6' : '#fff' }} />
        )}
      </div>
    </div>
  );
  const rightRow = (label, field, required = false, suffix = '') => (
    <div style={{ display: 'grid', gridTemplateColumns: '140px 168px 64px', alignItems: 'center', gap: 8, minHeight: 31 }}>
      <label style={{ fontSize: 13, color: '#111' }}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {required && <span style={{ color: '#ff4050', fontSize: 19, fontWeight: 700 }}>*</span>}
        {serviceOptions[field] ? (
          <select value={serviceValues[field]} onChange={e => setServiceValue(field, e.target.value)} style={{ ...selectStyle, width: 150 }}>
            {serviceOptions[field].map(option => <option key={option || 'blank'} value={option}>{option}</option>)}
          </select>
        ) : (
          <input value={field === 'startDate' ? '02/09/2026' : ''} onChange={() => {}} style={{ width: 72, height: 25, border: '1px solid #cfcfcf', background: '#fff', padding: '0 4px', fontSize: 13, boxSizing: 'border-box' }} />
        )}
      </div>
      <span style={{ fontSize: 13 }}>{suffix}</span>
    </div>
  );
  const Icon = ({ name, size = 24, color = '#254a67', fill = 'none' }) => {
    const common = { width: size, height: size, viewBox: '0 0 24 24', fill, stroke: color, strokeWidth: 2.4, strokeLinecap: 'round', strokeLinejoin: 'round', style: { display: 'block' } };
    switch (name) {
      case 'menu': return <svg width={size} height={size} viewBox="0 0 448 512" fill={color} style={{ display: 'block' }}><path d="M16 132h416c8.837 0 16-7.163 16-16V76c0-8.837-7.163-16-16-16H16C7.163 60 0 67.163 0 76v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16z" /></svg>;
      case 'search': return <svg width={size} height={size} viewBox="0 0 512 512" fill={color} style={{ display: 'block' }}><path d="M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z" /></svg>;
      case 'star': return <svg width={size} height={size} viewBox="0 0 576 512" fill={color} style={{ display: 'block' }}><path d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z" /></svg>;
      case 'home-user': return <svg width={size} height={size} viewBox="0 0 576 512" fill={color} style={{ display: 'block' }}><path d="M570.69,236.27,512,184.44V48a16,16,0,0,0-16-16H432a16,16,0,0,0-16,16V99.67L314.78,10.3C308.5,4.61,296.53,0,288,0s-20.46,4.61-26.74,10.3l-256,226A18.27,18.27,0,0,0,0,248.2a18.64,18.64,0,0,0,4.09,10.71L25.5,282.7a21.14,21.14,0,0,0,12,5.3,21.67,21.67,0,0,0,10.69-4.11l15.9-14V480a32,32,0,0,0,32,32H480a32,32,0,0,0,32-32V269.88l15.91,14A21.94,21.94,0,0,0,538.63,288a20.89,20.89,0,0,0,11.87-5.31l21.41-23.81A21.64,21.64,0,0,0,576,248.19,21,21,0,0,0,570.69,236.27ZM288,176a64,64,0,1,1-64,64A64,64,0,0,1,288,176ZM400,448H176a16,16,0,0,1-16-16,96,96,0,0,1,96-96h64a96,96,0,0,1,96,96A16,16,0,0,1,400,448Z" /></svg>;
      case 'user': return <svg width={size} height={size} viewBox="0 0 448 512" fill={color} style={{ display: 'block' }}><path d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4z" /></svg>;
      case 'money': return <svg {...common} fill="none"><rect x="3" y="7" width="18" height="10" rx="1.3" /><circle cx="12" cy="12" r="2.5" /><path d="M6 10v4M18 10v4" /></svg>;
      case 'question': return <svg width={size} height={size} viewBox="0 0 384 512" fill={color} style={{ display: 'block' }}><path d="M202.021 0C122.202 0 70.503 32.703 29.914 91.026c-7.363 10.58-5.093 25.086 5.178 32.874l43.138 32.709c10.373 7.865 25.132 6.026 33.253-4.148 25.049-31.381 43.63-49.449 82.757-49.449 30.764 0 68.816 19.799 68.816 49.631 0 22.552-18.617 34.134-48.993 51.164-35.423 19.86-82.299 44.576-82.299 106.405V320c0 13.255 10.745 24 24 24h72.471c13.255 0 24-10.745 24-24v-5.773c0-42.86 125.268-44.645 125.268-160.627C377.504 66.256 286.902 0 202.021 0zM192 373.459c-38.196 0-69.271 31.075-69.271 69.271 0 38.195 31.075 69.27 69.271 69.27s69.271-31.075 69.271-69.271-31.075-69.27-69.271-69.27z" /></svg>;
      case 'smile': return <svg width={size} height={size} viewBox="0 0 496 512" fill={color} style={{ display: 'block' }}><path d="M248 8C111 8 0 119 0 256s111 248 248 248 248-111 248-248S385 8 248 8zm80 168c17.7 0 32 14.3 32 32s-14.3 32-32 32-32-14.3-32-32 14.3-32 32-32zm-160 0c17.7 0 32 14.3 32 32s-14.3 32-32 32-32-14.3-32-32 14.3-32 32-32zm194.8 170.2C334.3 380.4 292.5 400 248 400s-86.3-19.6-114.8-53.8c-13.6-16.3 11-36.7 24.6-20.5 22.4 26.9 55.2 42.2 90.2 42.2s67.8-15.4 90.2-42.2c13.4-16.2 38.1 4.2 24.6 20.5z" /></svg>;
      case 'medical': return <svg {...common} fill="none"><rect x="4" y="5" width="16" height="15" rx="1.5" /><path d="M9 3v4M15 3v4M12 10v6M9 13h6" /></svg>;
      case 'briefcase': return <svg width={size} height={size} viewBox="0 0 512 512" fill={color} style={{ display: 'block' }}><path d="M320 336c0 8.84-7.16 16-16 16h-96c-8.84 0-16-7.16-16-16v-48H0v144c0 25.6 22.4 48 48 48h416c25.6 0 48-22.4 48-48V288H320v48zm144-208h-80V80c0-25.6-22.4-48-48-48H176c-25.6 0-48 22.4-48 48v48H48c-25.6 0-48 22.4-48 48v80h512v-80c0-25.6-22.4-48-48-48zm-144 0H192V96h128v32z" /></svg>;
      case 'bell': return <svg width={size} height={size} viewBox="0 0 448 512" fill={color} style={{ display: 'block' }}><path d="M224 512c35.32 0 63.97-28.65 63.97-64H160.03c0 35.35 28.65 64 63.97 64zm215.39-149.71c-19.32-20.76-55.47-51.99-55.47-154.29 0-77.7-54.48-139.9-127.94-155.16V32c0-17.67-14.32-32-31.98-32s-31.98 14.33-31.98 32v20.84C118.56 68.1 64.08 130.3 64.08 208c0 102.3-36.15 133.53-55.47 154.29-6 6.45-8.66 14.16-8.61 21.71.11 16.4 12.98 32 32.1 32h383.8c19.12 0 32-15.6 32.1-32 .05-7.55-2.61-15.27-8.61-21.71z" /></svg>;
      case 'history': return <svg width={size} height={size} viewBox="0 0 512 512" fill={color} style={{ display: 'block' }}><path d="M504 255.531c.253 136.64-111.18 248.372-247.82 248.468-59.015.042-113.223-20.53-155.822-54.911-11.077-8.94-11.905-25.541-1.839-35.607l11.267-11.267c8.609-8.609 22.353-9.551 31.891-1.984C173.062 425.135 212.781 440 256 440c101.705 0 184-82.311 184-184 0-101.705-82.311-184-184-184-48.814 0-93.149 18.969-126.068 49.932l50.754 50.754c10.08 10.08 2.941 27.314-11.313 27.314H24c-8.837 0-16-7.163-16-16V38.627c0-14.254 17.234-21.393 27.314-11.314l49.372 49.372C129.209 34.136 189.552 8 256 8c136.81 0 247.747 110.78 248 247.531zm-180.912 78.784l9.823-12.63c8.138-10.463 6.253-25.542-4.21-33.679L288 256.349V152c0-13.255-10.745-24-24-24h-16c-13.255 0-24 10.745-24 24v135.651l65.409 50.874c10.463 8.137 25.541 6.253 33.679-4.21z" /></svg>;
      case 'power': return <svg width={size} height={size} viewBox="0 0 512 512" fill={color} style={{ display: 'block' }}><path d="M400 54.1c63 45 104 118.6 104 201.9 0 136.8-110.8 247.7-247.5 248C120 504.3 8.2 393 8 256.4 7.9 173.1 48.9 99.3 111.8 54.2c11.7-8.3 28-4.8 35 7.7L162.6 90c5.9 10.5 3.1 23.8-6.6 31-41.5 30.8-68 79.6-68 134.9-.1 92.3 74.5 168.1 168 168.1 91.6 0 168.6-74.2 168-169.1-.3-51.8-24.7-101.8-68.1-134-9.7-7.2-12.4-20.5-6.5-30.9l15.8-28.1c7-12.4 23.2-16.1 34.8-7.8zM296 264V24c0-13.3-10.7-24-24-24h-32c-13.3 0-24 10.7-24 24v240c0 13.3 10.7 24 24 24h32c13.3 0 24-10.7 24-24z" /></svg>;
      case 'building': return <svg width={size} height={size} viewBox="0 0 448 512" fill={color} style={{ display: 'block' }}><path d="M436 480h-20V24c0-13.255-10.745-24-24-24H56C42.745 0 32 10.745 32 24v456H12c-6.627 0-12 5.373-12 12v20h448v-20c0-6.627-5.373-12-12-12zM128 76c0-6.627 5.373-12 12-12h40c6.627 0 12 5.373 12 12v40c0 6.627-5.373 12-12 12h-40c-6.627 0-12-5.373-12-12V76zm0 96c0-6.627 5.373-12 12-12h40c6.627 0 12 5.373 12 12v40c0 6.627-5.373 12-12 12h-40c-6.627 0-12-5.373-12-12v-40zm52 148h-40c-6.627 0-12-5.373-12-12v-40c0-6.627 5.373-12 12-12h40c6.627 0 12 5.373 12 12v40c0 6.627-5.373 12-12 12zm76 160h-64v-84c0-6.627 5.373-12 12-12h40c6.627 0 12 5.373 12 12v84zm64-172c0 6.627-5.373 12-12 12h-40c-6.627 0-12-5.373-12-12v-40c0-6.627 5.373-12 12-12h40c6.627 0 12 5.373 12 12v40zm0-96c0 6.627-5.373 12-12 12h-40c-6.627 0-12-5.373-12-12v-40c0-6.627 5.373-12 12-12h40c6.627 0 12 5.373 12 12v40zm0-96c0 6.627-5.373 12-12 12h-40c-6.627 0-12-5.373-12-12V76c0-6.627 5.373-12 12-12h40c6.627 0 12 5.373 12 12v40z" /></svg>;
      case 'list': return <svg width={size} height={size} viewBox="0 0 512 512" fill={color} style={{ display: 'block' }}><path d="M48 48a48 48 0 1 0 48 48 48 48 0 0 0-48-48zm0 160a48 48 0 1 0 48 48 48 48 0 0 0-48-48zm0 160a48 48 0 1 0 48 48 48 48 0 0 0-48-48zm448 16H176a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h320a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16zm0-320H176a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h320a16 16 0 0 0 16-16V80a16 16 0 0 0-16-16zm0 160H176a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h320a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16z" /></svg>;
      case 'door': return <svg width={size} height={size} viewBox="0 0 640 512" fill={color} style={{ display: 'block' }}><path d="M624 448h-80V113.45C544 86.19 522.47 64 496 64H384v64h96v384h144c8.84 0 16-7.16 16-16v-32c0-8.84-7.16-16-16-16zM312.24 1.01l-192 49.74C105.99 54.44 96 67.7 96 82.92V448H16c-8.84 0-16 7.16-16 16v32c0 8.84 7.16 16 16 16h336V33.18c0-21.58-19.56-37.41-39.76-32.17zM264 288c-13.25 0-24-14.33-24-32s10.75-32 24-32 24 14.33 24 32-10.75 32-24 32z" /></svg>;
      case 'external': return <svg width={size} height={size} viewBox="0 0 512 512" fill={color} style={{ display: 'block' }}><path d="M432,320H400a16,16,0,0,0-16,16V448H64V128H208a16,16,0,0,0,16-16V80a16,16,0,0,0-16-16H48A48,48,0,0,0,0,112V464a48,48,0,0,0,48,48H400a48,48,0,0,0,48-48V336A16,16,0,0,0,432,320ZM488,0h-128c-21.37,0-32.05,25.91-17,41l35.73,35.73L135,320.37a24,24,0,0,0,0,34L157.67,377a24,24,0,0,0,34,0L435.28,133.32,471,169c15,15,41,4.5,41-17V24A24,24,0,0,0,488,0Z" /></svg>;
      case 'chevron': return <svg {...common} width={14} height={14} viewBox="0 0 24 24"><path d="m9 6 6 6-6 6" /></svg>;
      case 'calendar': return <svg width={size} height={size} viewBox="0 0 448 512" fill={color} style={{ display: 'block' }}><path d="M0 464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V192H0v272zm320-196c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12v-40zm0 128c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12v-40zM192 268c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12v-40zm0 128c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12v-40zM64 268c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12H76c-6.6 0-12-5.4-12-12v-40zm0 128c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12H76c-6.6 0-12-5.4-12-12v-40zM400 64h-48V16c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v48H160V16c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v48H48C21.5 64 0 85.5 0 112v48h448v-48c0-26.5-21.5-48-48-48z" /></svg>;
      case 'caret-down': return <svg width={size} height={size} viewBox="0 0 320 512" fill={color} style={{ display: 'block' }}><path d="M31.3 192h257.3c17.8 0 26.7 21.5 14.1 34.1L174.1 354.8c-7.8 7.8-20.5 7.8-28.3 0L17.2 226.1C4.6 213.5 13.5 192 31.3 192z" /></svg>;
      case 'plus': return <svg width={size} height={size} viewBox="0 0 448 512" fill={color} style={{ display: 'block' }}><path d="M416 208H272V64c0-17.67-14.33-32-32-32h-32c-17.67 0-32 14.33-32 32v144H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h144v144c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32V304h144c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z" /></svg>;
      case 'times': return <svg width={size} height={size} viewBox="0 0 352 512" fill={color} style={{ display: 'block' }}><path d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z" /></svg>;
      case 'handshake': return <svg width={size} height={size} viewBox="0 0 640 512" fill={color} style={{ display: 'block' }}><path d="M434.7 64h-85.9c-8 0-15.7 3-21.6 8.4l-98.3 90c-.1.1-.2.3-.3.4-16.6 15.6-16.3 40.5-2.1 56 12.7 13.9 39.4 17.6 56.1 2.7.1-.1.3-.1.4-.2l79.9-73.2c6.5-5.9 16.7-5.5 22.6 1 6 6.5 5.5 16.6-1 22.6l-26.1 23.9L504 313.8c2.9 2.4 5.5 5 7.9 7.7V128l-54.6-54.6c-5.9-6-14.1-9.4-22.6-9.4zM544 128.2v223.9c0 17.7 14.3 32 32 32h64V128.2h-96zm48 223.9c-8.8 0-16-7.2-16-16s7.2-16 16-16 16 7.2 16 16-7.2 16-16 16zM0 384h64c17.7 0 32-14.3 32-32V128.2H0V384zm48-63.9c8.8 0 16 7.2 16 16s-7.2 16-16 16-16-7.2-16-16c0-8.9 7.2-16 16-16zm435.9 18.6L334.6 217.5l-30 27.5c-29.7 27.1-75.2 24.5-101.7-4.4-26.9-29.4-24.8-74.9 4.4-101.7L289.1 64h-83.8c-8.5 0-16.6 3.4-22.6 9.4L128 128v223.9h18.3l90.5 81.9c27.4 22.3 67.7 18.1 90-9.3l.2-.2 17.9 15.5c15.9 13 39.4 10.5 52.3-5.4l31.4-38.6 5.4 4.4c13.7 11.1 33.9 9.1 45-4.7l9.5-11.7c11.2-13.8 9.1-33.9-4.6-45.1z" /></svg>;
      case 'file': return <svg width={size} height={size} viewBox="0 0 384 512" fill={color} style={{ display: 'block' }}><path d="M224 136V0H24C10.7 0 0 10.7 0 24v464c0 13.3 10.7 24 24 24h336c13.3 0 24-10.7 24-24V160H248c-13.2 0-24-10.8-24-24zm64 236c0 6.6-5.4 12-12 12H108c-6.6 0-12-5.4-12-12v-8c0-6.6 5.4-12 12-12h168c6.6 0 12 5.4 12 12v8zm0-64c0 6.6-5.4 12-12 12H108c-6.6 0-12-5.4-12-12v-8c0-6.6 5.4-12 12-12h168c6.6 0 12 5.4 12 12v8zm0-72v8c0 6.6-5.4 12-12 12H108c-6.6 0-12-5.4-12-12v-8c0-6.6 5.4-12 12-12h168c6.6 0 12 5.4 12 12zm96-114.1v6.1H256V0h6.1c6.4 0 12.5 2.5 17 7l97.9 98c4.5 4.5 7 10.6 7 16.9z" /></svg>;
      case 'dots-vertical': return <svg width={size} height={size} viewBox="0 0 192 512" fill={color} style={{ display: 'block' }}><path d="M96 184c39.8 0 72 32.2 72 72s-32.2 72-72 72-72-32.2-72-72 32.2-72 72-72zM24 80c0 39.8 32.2 72 72 72s72-32.2 72-72S135.8 8 96 8 24 40.2 24 80zm0 352c0 39.8 32.2 72 72 72s72-32.2 72-72-32.2-72-72-72-72 32.2-72 72z" /></svg>;
      case 'clipboard-check': return <svg width={size} height={size} viewBox="0 0 384 512" fill={color} style={{ display: 'block' }}><path d="M336 64h-80c0-35.3-28.7-64-64-64s-64 28.7-64 64H48C21.5 64 0 85.5 0 112v352c0 26.5 21.5 48 48 48h288c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48zM192 40c13.3 0 24 10.7 24 24s-10.7 24-24 24-24-10.7-24-24 10.7-24 24-24zm121.2 231.8l-143 141.8c-4.7 4.7-12.3 4.6-17-.1l-82.6-83.3c-4.7-4.7-4.6-12.3.1-17L99.1 285c4.7-4.7 12.3-4.6 17 .1l46 46.4 106-105.2c4.7-4.7 12.3-4.6 17 .1l28.2 28.4c4.7 4.8 4.6 12.3-.1 17z" /></svg>;
      case 'user-circle': return <svg width={size} height={size} viewBox="0 0 496 512" fill={color} style={{ display: 'block' }}><path d="M248 8C111 8 0 119 0 256s111 248 248 248 248-111 248-248S385 8 248 8zm0 96c48.6 0 88 39.4 88 88s-39.4 88-88 88-88-39.4-88-88 39.4-88 88-88zm0 344c-58.7 0-111.3-26.6-146.5-68.2 18.8-35.4 55.6-59.8 98.5-59.8 2.4 0 4.8.4 7.1 1.1 13 4.2 26.6 6.9 40.9 6.9 14.3 0 28-2.7 40.9-6.9 2.3-.7 4.7-1.1 7.1-1.1 42.9 0 79.7 24.4 98.5 59.8C359.3 421.4 306.7 448 248 448z" /></svg>;
      case 'star-outline': return <svg {...common} fill="none"><path d="m12 2.8 2.8 5.7 6.3.9-4.6 4.4 1.1 6.3-5.6-3-5.6 3 1.1-6.3-4.6-4.4 6.3-.9L12 2.8Z" /></svg>;
      case 'book': return <svg width={size} height={size} viewBox="0 0 576 512" fill={color} style={{ display: 'block' }}><path d="M542.22 32.05c-54.8 3.11-163.72 14.43-230.96 55.59-4.64 2.84-7.27 7.89-7.27 13.17v363.87c0 11.55 12.63 18.85 23.28 13.49 69.18-34.82 169.23-44.32 218.7-46.92 16.89-.89 30.02-14.43 30.02-30.66V62.75c.01-17.71-15.35-31.74-33.77-30.7zM264.73 87.64C197.5 46.48 88.58 35.17 33.78 32.05 15.36 31.01 0 45.04 0 62.75V400.6c0 16.24 13.13 29.78 30.02 30.66 49.49 2.6 149.59 12.11 218.77 46.95 10.62 5.35 23.21-1.94 23.21-13.46V100.63c0-5.29-2.62-10.14-7.27-12.99z" /></svg>;
      case 'info': return <svg width={size} height={size} viewBox="0 0 192 512" fill={color} style={{ display: 'block' }}><path d="M20 424.229h20V279.771H20c-11.046 0-20-8.954-20-20V212c0-11.046 8.954-20 20-20h112c11.046 0 20 8.954 20 20v212.229h20c11.046 0 20 8.954 20 20V492c0 11.046-8.954 20-20 20H20c-11.046 0-20-8.954-20-20v-47.771c0-11.046 8.954-20 20-20zM96 0C56.235 0 24 32.235 24 72s32.235 72 72 72 72-32.235 72-72S135.764 0 96 0z" /></svg>;
      case 'trash': return <svg width={size} height={size} viewBox="0 0 448 512" fill={color} style={{ display: 'block' }}><path d="M32 464a48 48 0 0 0 48 48h288a48 48 0 0 0 48-48V128H32zm272-256a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zm-96 0a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zm-96 0a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zM432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.72 23.72 0 0 0-21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16z" /></svg>;
      default: return null;
    }
  };
  const HeaderIcon = ({ children }) => <span style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{children}</span>;
  const Badge = ({ value }) => <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#254a67', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>{value}</span>;
  const ToolbarIcon = ({ name, disabled = false, size = 20 }) => (
    <span className={`streamline-toolbar-icon${disabled ? ' is-disabled' : ''}`}>
      <Icon name={name} size={size} color={disabled ? '#7e99a9' : '#254a67'} />
    </span>
  );
  const ToolbarStarPlus = () => (
    <span className="streamline-toolbar-icon" style={{ position: 'relative' }}>
      <Icon name="star" size={21} color="#254a67" />
      <span style={{ position: 'absolute', right: 1, top: 1, width: 10, height: 10, borderRadius: '50%', background: '#254a67', color: '#edf4f9', fontSize: 10, lineHeight: '10px', textAlign: 'center', fontWeight: 700 }}>+</span>
    </span>
  );

  return (
    <div data-ehr="streamline" style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', fontFamily: "Arial, 'Helvetica Neue', sans-serif", background: '#e9f0fb', color: '#254a67', overflow: 'hidden' }}>
      <style>{`
        .streamline-toolbar-icon {
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border-radius: 2px;
          color: #254a67;
        }
        .streamline-toolbar-icon:hover { background: #d9eaf5; }
        .streamline-toolbar-icon.is-disabled {
          color: #7e99a9;
          opacity: 0.6;
          cursor: default;
          pointer-events: none;
        }
      `}</style>
      <div data-smartcare-header style={{ height: 52, background: '#fff', borderBottom: '3px solid #f5a800', display: 'flex', alignItems: 'center', gap: 14, padding: '0 12px', boxSizing: 'border-box', overflow: 'hidden' }}>
        <HeaderIcon><Icon name="menu" size={22} /></HeaderIcon>
        <img src="/streamline-smartcare-logo.png" alt="SmartCare" style={{ height: 44, width: 'auto', display: 'block', marginRight: 24 }} />
        <HeaderIcon><Icon name="search" size={22} /></HeaderIcon>
        <HeaderIcon><Icon name="star" size={22} /></HeaderIcon>
        <HeaderIcon><Icon name="home-user" size={22} /></HeaderIcon>
        <HeaderIcon><Icon name="user" size={22} /></HeaderIcon>
        <div style={{ color: '#000', fontSize: 16, borderBottom: '3px solid #254a67', minWidth: 320, height: 34, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span>{patientLabel}</span>
          <span style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
            <Icon name="money" size={17} /><Icon name="question" size={17} /><Icon name="smile" size={17} /><Icon name="medical" size={17} /><Icon name="briefcase" size={17} />
            <Icon name="dots-vertical" size={14} /><Icon name="plus" size={14} /><Icon name="times" size={14} />
          </span>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
          <Icon name="briefcase" size={20} /><Icon name="bell" size={20} /><Icon name="history" size={20} /><Icon name="question" size={20} /><Icon name="power" size={20} />
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden' }}>
        <div data-smartcare-rail style={{ width: 240, background: '#efefef', borderRight: '1px solid #cfcfcf', flexShrink: 0 }}>
          <div style={{ height: 42, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderBottom: '1px solid #cfcfcf' }}>
            {['user', 'home-user', 'building', 'list'].map((icon, i) => <div key={icon} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: i === 0 ? '3px solid #254a67' : 0 }}><Icon name={icon} size={18} /></div>)}
          </div>
          {navItems.map(([icon, label, arrow], i) => (
            <div key={label} style={{ height: i === 0 ? 42 : 41, borderBottom: '1px solid #cfcfcf', display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px', boxSizing: 'border-box', fontSize: 13 }}>
              {icon.startsWith('badge:') ? <Badge value={icon.slice(6)} /> : <span style={{ width: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={icon} size={18} /></span>}
              <span style={{ flex: 1 }}>{label}</span>
              {arrow && <Icon name="chevron" size={13} />}
            </div>
          ))}
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0 }}>
          <div style={{ height: 42, background: '#edf4f9', borderBottom: '1px solid #c7c7c7', display: 'flex', alignItems: 'center', padding: '0 10px', boxSizing: 'border-box' }}>
            <div data-smartcare-title style={{ color: '#000', fontSize: 20, flex: 1 }}>Progress Note</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#254a67' }}>
              <ToolbarIcon name="handshake" size={21} />
              <ToolbarIcon name="file" size={18} />
              <ToolbarIcon name="dots-vertical" size={16} />
              <ToolbarIcon name="clipboard-check" disabled size={18} />
              <ToolbarIcon name="user-circle" size={22} />
              <span className="streamline-toolbar-icon" style={{ width: 30, fontSize: 12 }}>GoTo</span>
              <ToolbarStarPlus />
              <ToolbarIcon name="star" size={21} />
              <ToolbarIcon name="book" size={21} />
              <ToolbarIcon name="question" size={21} />
              <ToolbarIcon name="trash" disabled size={18} />
            </div>
          </div>
          <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: '6px 6px 20px', boxSizing: 'border-box' }}>
            <div style={{ width: 940, minHeight: activeTab === 'Service' ? 896 : '100%', background: '#fff', boxShadow: 'inset 0 0 0 1px #d8d8d8', padding: '16px 12px 45px', boxSizing: 'border-box' }}>
              <div style={{ height: 39, display: 'grid', gridTemplateColumns: '200px 250px 250px 150px', gap: 6, alignItems: 'center', padding: '0 8px', boxShadow: '0 2px 9px rgba(0,0,0,.25)', marginBottom: 13 }}>
                <div style={{ display: 'flex', height: 25, alignItems: 'center' }}><span style={{ background: '#eee', padding: '5px 6px', fontSize: 13 }}>Effective</span><span style={{ padding: '5px 6px', fontSize: 13 }}>02/09/2026</span><Icon name="calendar" size={17} /><Icon name="caret-down" size={11} /></div>
                <div style={{ display: 'flex', height: 25 }}><span style={{ background: '#eee', padding: '5px 14px', fontSize: 13 }}>Status</span><span style={{ padding: '5px 6px', fontSize: 13 }}>New</span></div>
                <div style={{ display: 'flex', height: 25 }}><span style={{ background: '#eee', padding: '5px 14px', fontSize: 13 }}>Author</span><span style={{ padding: '5px 6px', fontSize: 13 }}>Eleos</span></div>
                <div style={{ fontSize: 13 }}>10/14/2025</div>
              </div>
              <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #111', marginBottom: 13, fontSize: 14 }}>
                {['Service', 'Note', 'Billing Diagnosis', 'Add-On Codes', 'Warnings', 'Disposition'].map(tab => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    style={{ padding: '6px 16px', background: activeTab === tab ? '#d7e9f6' : '#fff', border: 0, borderBottom: activeTab === tab ? '3px solid #254a67' : '3px solid transparent', font: 'inherit', cursor: 'pointer' }}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              {activeTab === 'Service' ? (
                <>
                  <h2 style={{ margin: '0 0 12px 10px', fontSize: 19, fontWeight: 400, color: '#111' }}>Service</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: '476px 400px', gap: 36, padding: '0 10px', color: '#111' }}>
                    <div>
                      {formRow('Status', 'status')}
                      {formRow('Program', 'program', true)}
                      {formRow('Procedure', 'procedure')}
                      {formRow('Location', 'location', true)}
                      <div style={{ display: 'grid', gridTemplateColumns: '148px 232px', alignItems: 'center', gap: 8, minHeight: 31 }}>
                        <label style={{ fontSize: 13, color: '#111' }}>Clinician</label>
                        <div style={fieldBoxStyle}>Eleos</div>
                      </div>
                      {formRow('Mode Of Delivery', 'modeOfDelivery')}
                      {formRow('Cancel Reason', 'cancelReason')}
                      <div style={{ height: 22 }} />
                      {formRow('Evidence Based Practices', 'evidenceBasedPractices')}
                      {formRow('Transportation Service', 'transportationService')}
                    </div>
                    <div>
                      {rightRow('Start Date', 'startDate')}
                      {rightRow('Start Time', 'startTime', true)}
                      {rightRow('Travel Time', 'travelTime', true, 'Minutes')}
                      <div style={{ height: 31 }} />
                      {rightRow('Documentation Time', 'documentationTime', true, 'Minutes')}
                      {rightRow('Service Time', 'serviceTime', true, 'Minutes')}
                      {rightRow('Attending', 'attending')}
                      {rightRow('Referring', 'referring')}
                      <div style={{ height: 32 }} />
                      <label style={{ fontSize: 13 }}><span style={{ display: 'inline-block', width: 14, height: 14, border: '1px solid #aaa', verticalAlign: 'middle', marginRight: 5 }} />Interpreter Services Needed</label>
                    </div>
                  </div>
                  <div style={{ borderTop: '1px solid #cfcfcf', marginTop: 22, paddingTop: 40 }}>
                    <h2 style={{ margin: '0 0 18px 6px', fontSize: 18, fontWeight: 400, color: '#111' }}>Custom Fields</h2>
                    <div style={{ borderTop: '1px solid #cfcfcf', padding: '6px 18px' }}>
                      <h3 style={{ margin: 0, fontSize: 18, fontWeight: 400, color: '#111' }}>Interpreter/Bilingual Service Information</h3>
                    </div>
                  </div>
                </>
              ) : activeTab === 'Note' ? (
                <div style={{ padding: '0 10px 20px', maxWidth: '50%' }}>
                  <StackedFields noteValues={noteValues} onNoteChange={onNoteChange} highlightedField={highlightedField} labelColor='#333' fontSize={13} borderColor='#cfcfcf' minHeight={112} borderRadius={0} />
                </div>
              ) : (
                <div style={{ padding: '22px 10px', color: '#666', fontSize: 13 }}>{activeTab} content is not available in this demo.</div>
              )}
            </div>
          </div>
          <div style={{ height: 6, flexShrink: 0, borderTop: '1px solid #d6d6d6', background: 'linear-gradient(90deg, #efefef 0%, #efefef 25%, orange 50%, #efefef 75%, #efefef 100%)' }} />
        </div>
      </div>
    </div>
  );
}

function CalmhsaNoteSection({ title, action, children, hideTitleRightBorder = false }) {
  return (
    <section style={{ marginTop: 10, color: '#000' }}>
      <div style={{ height: 27, display: 'flex', alignItems: 'stretch' }}>
        <h3 style={{ margin: 0, padding: '4px 9px', border: '1px solid #d6d6d6', borderRight: hideTitleRightBorder ? 0 : undefined, borderBottom: 0, fontSize: 14, fontWeight: 400, lineHeight: '18px', background: '#fff' }}>{title}</h3>
        <div style={{ flex: 1, borderTop: '1px solid #d6d6d6' }} />
        {action}
      </div>
      <div style={{ border: '1px solid #d6d6d6', padding: '10px 10px 20px', background: '#fff' }}>
        {children}
      </div>
    </section>
  );
}

function CalmhsaProgressNote({ noteValues, onNoteChange, highlightedField, sections }) {
  const information = sections.find(section => section.id === 'information') ?? { id: 'information', label: 'Information' };
  const carePlan = sections.find(section => section.id === 'carePlan') ?? { id: 'carePlan', label: 'Care Plan' };
  const buttonStyle = { minWidth: 67, height: 20, padding: '0 10px', border: 0, background: '#254a67', color: '#fff', font: 'inherit', fontSize: 13 };
  const inputStyle = { height: 22, border: '1px solid #d6d6d6', background: '#fff', padding: '1px 4px', boxSizing: 'border-box', font: 'inherit', fontSize: 13 };
  const tableColumns = '24px 24px 34px 65px 65px 70px 130px 100px 130px 128px';
  const tableCell = { minHeight: 25, padding: '5px 7px', borderRight: '1px solid #d6d6d6', borderBottom: '1px solid #d6d6d6', boxSizing: 'border-box', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' };
  const fieldProps = { noteValues, onNoteChange, highlightedField, hideLabels: true, lastSectionId: 'carePlan', labelColor: '#000', fontSize: 13, borderColor: '#d6d6d6', minHeight: 223, borderRadius: 0, resize: 'none', placeholder: '' };

  return (
    <div style={{ width: 846, paddingBottom: 20, color: '#000', fontFamily: "'IBM Plex Sans', Arial, sans-serif", fontSize: 13 }}>
      <div style={{ width: 63, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#c6dff0', borderBottom: '2px solid #254a67', fontSize: 11 }}>General</div>

      <CalmhsaNoteSection title="Problem Details">
        <div style={{ display: 'grid', gridTemplateColumns: '38px 74px 72px 1fr 28px', gap: 6, alignItems: 'center' }}>
          <span style={{ color: '#254a67', fontSize: 18, textAlign: 'center' }}>*</span>
          <label htmlFor="calmhsa-problem-code">Code</label>
          <input id="calmhsa-problem-code" aria-label="Problem code search" readOnly placeholder="Search" style={{ ...inputStyle, width: 61 }} />
          <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr 24px 24px', gap: 6, alignItems: 'center' }}>
            <label htmlFor="calmhsa-problem-description">Description</label>
            <input id="calmhsa-problem-description" aria-label="Problem description search" readOnly placeholder="Search" style={{ ...inputStyle, width: '100%' }} />
            <svg aria-hidden="true" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#254a67" strokeWidth="1.8">
              <circle cx="7" cy="7" r="4.5" />
              <path d="m10.5 10.5 3 3" />
            </svg>
            <span aria-hidden="true" style={{ color: '#254a67', fontSize: 16 }}>*</span>
          </div>
          <span />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '9px 0 8px 14px' }}>
          <label htmlFor="calmhsa-problem-start">Start Date:</label>
          <input id="calmhsa-problem-start" readOnly value="02/05/2026" style={{ ...inputStyle, width: 78 }} />
          <label htmlFor="calmhsa-problem-end" style={{ marginLeft: 14 }}>End Date:</label>
          <input id="calmhsa-problem-end" readOnly value="" style={{ ...inputStyle, width: 78 }} />
          <label htmlFor="calmhsa-problem-program" style={{ marginLeft: 90 }}>Program</label>
          <select id="calmhsa-problem-program" defaultValue="" aria-label="Problem program" style={{ ...inputStyle, width: 115 }}><option value="" /></select>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <button type="button" style={buttonStyle}>Insert</button>
          <button type="button" style={buttonStyle}>Clear</button>
        </div>

        <div style={{ marginTop: 14 }}>
          <div style={{ display: 'flex', height: 27 }}>
            <h4 style={{ margin: 0, padding: '4px 8px', border: '1px solid #d6d6d6', borderBottom: 0, fontSize: 14, fontWeight: 400 }}>Problem List</h4>
            <div style={{ flex: 1, borderTop: '1px solid #d6d6d6' }} />
          </div>
          <div style={{ overflowX: 'auto', borderTop: '1px solid #254a67' }}>
            <div style={{ display: 'grid', gridTemplateColumns: tableColumns, width: 770, background: '#efefef', borderLeft: '1px solid #d6d6d6', borderTop: '1px solid #d6d6d6' }}>
              {['', '', '', 'Start Date', 'End Date', 'ICD 10 Code', 'ICD 10 Description', 'SNOMED CT Code', 'SNOMED Description', 'Program'].map((value, index) => <div key={`${value}-${index}`} style={tableCell}>{value}</div>)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: tableColumns, width: 770, borderLeft: '1px solid #d6d6d6' }}>
              {['x', 'o', 'i', '11/20/2...', '', 'F19.10', 'Other psychoactive su...', '1264080008', 'Fetal disorder caused ...', 'MH Adult Outpatient'].map((value, index) => <div key={`${value}-${index}`} style={{ ...tableCell, color: index < 3 ? '#254a67' : '#000', textAlign: index < 3 ? 'center' : 'left' }}>{value}</div>)}
            </div>
          </div>
        </div>
      </CalmhsaNoteSection>

      <CalmhsaNoteSection title="Problems addressed during this session" action={<button type="button" style={buttonStyle}>Refresh</button>}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 4, paddingLeft: 10 }}>
          <input type="checkbox" checked={false} onChange={() => {}} />
          Other psychoactive substance abuse, uncomplicated
        </label>
      </CalmhsaNoteSection>

      <CalmhsaNoteSection title="Information" hideTitleRightBorder>
        <p style={{ margin: '0 0 4px 2px', lineHeight: 1.35 }}>{information.description}</p>
        <StackedFields {...fieldProps} sections={[information]} />
      </CalmhsaNoteSection>

      <CalmhsaNoteSection title="Care Plan" hideTitleRightBorder>
        <p style={{ margin: '0 0 4px 2px', lineHeight: 1.35 }}>{carePlan.description}</p>
        <StackedFields {...fieldProps} sections={[carePlan]} />
      </CalmhsaNoteSection>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 15. CALMHSA SMARTCARE
// Duplicate of StreamlineBg (see docs/adr/0005-calmhsa-smartcare-background-starts-as-a-streamline-duplicate.md)
// ═══════════════════════════════════════════════════════════════════════════════
export function CalmhsaBg({ noteValues = {}, onNoteChange, highlightedField, activitySelectionSeq }) {
  const { clientName } = useEhrContext();
  const { selectedNoteType, sections } = useNoteTypeContext();
  const { lockedDownMode } = useLockedDownModeContext();
  const [activeTab, setActiveTab] = useState('Service');
  useEffect(() => {
    // activitySelectionSeq starts at 0 and only increments on a real activity
    // selection, so this deliberately does nothing on mount (seq === 0).
    if (activitySelectionSeq && lockedDownMode) setActiveTab('Note');
  }, [activitySelectionSeq]); // eslint-disable-line react-hooks/exhaustive-deps -- only an activity selection should trigger this, not lockedDownMode toggling alone
  const [serviceValues, setServiceValues] = useState({
    status: 'Show',
    program: '',
    procedure: 'Assessment LPHA',
    location: '',
    modeOfDelivery: '',
    evidenceBasedPractices: '',
    transportationService: 'No',
    attending: '',
    referring: '',
  });
  const patientLabel = clientName ? clientName.replace(/^(.*)\s+(\S+)$/, '$2, $1') : 'Test, Client (1099)';
  const serviceOptions = {
    status: ['Show', 'In Progress', 'New', 'Complete', 'Cancelled'],
    program: ['', 'Adult Services', 'Crisis Services', 'Outpatient Services', 'Residential Services'],
    procedure: ['', 'Assessment LPHA', 'Group Therapy', 'Therapy - Group', 'Individual Therapy', 'Case Management'],
    location: ['', 'Office', 'Home', 'In Community', 'School', 'Telehealth'],
    modeOfDelivery: ['', 'Face To Face', 'Telehealth', 'Phone', 'Collateral'],
    evidenceBasedPractices: ['', 'CBT', 'DBT', 'MI', 'Seeking Safety'],
    transportationService: ['No', 'From Client Location', 'To Client Location'],
    attending: ['', 'Admin, David', 'Young, Tim', 'Campbell, Brian'],
    referring: ['', 'Referring 1', 'Referring 2'],
  };
  const navItems = [
    ['badge:CT', 'Consent To Share Data', false],
    ['door', 'My Office', true],
    ['badge:ST', 'Shared Treatment Plan', false],
    ['user', 'Client', true],
    ['badge:CF', 'Client Funds', false],
    ['external', 'SmartLinks', false],
  ];
  const selectStyle = {
    width: 230,
    height: 25,
    border: '1px solid #cfcfcf',
    background: '#fff',
    color: '#111',
    fontSize: 13,
    fontFamily: 'inherit',
  };
  const fieldBoxStyle = {
    width: 230,
    height: 25,
    border: '1px solid #cfcfcf',
    background: '#fff',
    display: 'flex',
    alignItems: 'center',
    padding: '0 6px',
    fontSize: 13,
    boxSizing: 'border-box',
  };
  const setServiceValue = (field, value) => setServiceValues(prev => ({ ...prev, [field]: value }));
  const formRow = (label, field, required = false) => (
    <div style={{ display: 'grid', gridTemplateColumns: '148px 232px', alignItems: 'center', gap: 8, minHeight: 31 }}>
      <label style={{ fontSize: 13, color: '#111' }}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {required && <span style={{ color: '#ff4050', fontSize: 19, fontWeight: 700 }}>*</span>}
        {serviceOptions[field] ? (
          <select value={serviceValues[field]} onChange={e => setServiceValue(field, e.target.value)} style={selectStyle}>
            {serviceOptions[field].map(option => <option key={option || 'blank'} value={option}>{option}</option>)}
          </select>
        ) : (
          <div style={{ ...fieldBoxStyle, background: field === 'cancelReason' ? '#f6f6f6' : '#fff' }} />
        )}
      </div>
    </div>
  );
  const rightRow = (label, field, required = false, suffix = '') => (
    <div style={{ display: 'grid', gridTemplateColumns: '140px 168px 64px', alignItems: 'center', gap: 8, minHeight: 31 }}>
      <label style={{ fontSize: 13, color: '#111' }}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {required && <span style={{ color: '#ff4050', fontSize: 19, fontWeight: 700 }}>*</span>}
        {serviceOptions[field] ? (
          <select value={serviceValues[field]} onChange={e => setServiceValue(field, e.target.value)} style={{ ...selectStyle, width: 150 }}>
            {serviceOptions[field].map(option => <option key={option || 'blank'} value={option}>{option}</option>)}
          </select>
        ) : (
          <input value={field === 'startDate' ? '02/09/2026' : ''} onChange={() => {}} style={{ width: 72, height: 25, border: '1px solid #cfcfcf', background: '#fff', padding: '0 4px', fontSize: 13, boxSizing: 'border-box' }} />
        )}
      </div>
      <span style={{ fontSize: 13 }}>{suffix}</span>
    </div>
  );
  const Icon = ({ name, size = 24, color = '#254a67', fill = 'none' }) => {
    const common = { width: size, height: size, viewBox: '0 0 24 24', fill, stroke: color, strokeWidth: 2.4, strokeLinecap: 'round', strokeLinejoin: 'round', style: { display: 'block' } };
    switch (name) {
      case 'menu': return <svg width={size} height={size} viewBox="0 0 448 512" fill={color} style={{ display: 'block' }}><path d="M16 132h416c8.837 0 16-7.163 16-16V76c0-8.837-7.163-16-16-16H16C7.163 60 0 67.163 0 76v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16z" /></svg>;
      case 'search': return <svg width={size} height={size} viewBox="0 0 512 512" fill={color} style={{ display: 'block' }}><path d="M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z" /></svg>;
      case 'star': return <svg width={size} height={size} viewBox="0 0 576 512" fill={color} style={{ display: 'block' }}><path d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z" /></svg>;
      case 'home-user': return <svg width={size} height={size} viewBox="0 0 576 512" fill={color} style={{ display: 'block' }}><path d="M570.69,236.27,512,184.44V48a16,16,0,0,0-16-16H432a16,16,0,0,0-16,16V99.67L314.78,10.3C308.5,4.61,296.53,0,288,0s-20.46,4.61-26.74,10.3l-256,226A18.27,18.27,0,0,0,0,248.2a18.64,18.64,0,0,0,4.09,10.71L25.5,282.7a21.14,21.14,0,0,0,12,5.3,21.67,21.67,0,0,0,10.69-4.11l15.9-14V480a32,32,0,0,0,32,32H480a32,32,0,0,0,32-32V269.88l15.91,14A21.94,21.94,0,0,0,538.63,288a20.89,20.89,0,0,0,11.87-5.31l21.41-23.81A21.64,21.64,0,0,0,576,248.19,21,21,0,0,0,570.69,236.27ZM288,176a64,64,0,1,1-64,64A64,64,0,0,1,288,176ZM400,448H176a16,16,0,0,1-16-16,96,96,0,0,1,96-96h64a96,96,0,0,1,96,96A16,16,0,0,1,400,448Z" /></svg>;
      case 'user': return <svg width={size} height={size} viewBox="0 0 448 512" fill={color} style={{ display: 'block' }}><path d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4z" /></svg>;
      case 'money': return <svg {...common} fill="none"><rect x="3" y="7" width="18" height="10" rx="1.3" /><circle cx="12" cy="12" r="2.5" /><path d="M6 10v4M18 10v4" /></svg>;
      case 'question': return <svg width={size} height={size} viewBox="0 0 384 512" fill={color} style={{ display: 'block' }}><path d="M202.021 0C122.202 0 70.503 32.703 29.914 91.026c-7.363 10.58-5.093 25.086 5.178 32.874l43.138 32.709c10.373 7.865 25.132 6.026 33.253-4.148 25.049-31.381 43.63-49.449 82.757-49.449 30.764 0 68.816 19.799 68.816 49.631 0 22.552-18.617 34.134-48.993 51.164-35.423 19.86-82.299 44.576-82.299 106.405V320c0 13.255 10.745 24 24 24h72.471c13.255 0 24-10.745 24-24v-5.773c0-42.86 125.268-44.645 125.268-160.627C377.504 66.256 286.902 0 202.021 0zM192 373.459c-38.196 0-69.271 31.075-69.271 69.271 0 38.195 31.075 69.27 69.271 69.27s69.271-31.075 69.271-69.271-31.075-69.27-69.271-69.27z" /></svg>;
      case 'smile': return <svg width={size} height={size} viewBox="0 0 496 512" fill={color} style={{ display: 'block' }}><path d="M248 8C111 8 0 119 0 256s111 248 248 248 248-111 248-248S385 8 248 8zm80 168c17.7 0 32 14.3 32 32s-14.3 32-32 32-32-14.3-32-32 14.3-32 32-32zm-160 0c17.7 0 32 14.3 32 32s-14.3 32-32 32-32-14.3-32-32 14.3-32 32-32zm194.8 170.2C334.3 380.4 292.5 400 248 400s-86.3-19.6-114.8-53.8c-13.6-16.3 11-36.7 24.6-20.5 22.4 26.9 55.2 42.2 90.2 42.2s67.8-15.4 90.2-42.2c13.4-16.2 38.1 4.2 24.6 20.5z" /></svg>;
      case 'medical': return <svg {...common} fill="none"><rect x="4" y="5" width="16" height="15" rx="1.5" /><path d="M9 3v4M15 3v4M12 10v6M9 13h6" /></svg>;
      case 'briefcase': return <svg width={size} height={size} viewBox="0 0 512 512" fill={color} style={{ display: 'block' }}><path d="M320 336c0 8.84-7.16 16-16 16h-96c-8.84 0-16-7.16-16-16v-48H0v144c0 25.6 22.4 48 48 48h416c25.6 0 48-22.4 48-48V288H320v48zm144-208h-80V80c0-25.6-22.4-48-48-48H176c-25.6 0-48 22.4-48 48v48H48c-25.6 0-48 22.4-48 48v80h512v-80c0-25.6-22.4-48-48-48zm-144 0H192V96h128v32z" /></svg>;
      case 'bell': return <svg width={size} height={size} viewBox="0 0 448 512" fill={color} style={{ display: 'block' }}><path d="M224 512c35.32 0 63.97-28.65 63.97-64H160.03c0 35.35 28.65 64 63.97 64zm215.39-149.71c-19.32-20.76-55.47-51.99-55.47-154.29 0-77.7-54.48-139.9-127.94-155.16V32c0-17.67-14.32-32-31.98-32s-31.98 14.33-31.98 32v20.84C118.56 68.1 64.08 130.3 64.08 208c0 102.3-36.15 133.53-55.47 154.29-6 6.45-8.66 14.16-8.61 21.71.11 16.4 12.98 32 32.1 32h383.8c19.12 0 32-15.6 32.1-32 .05-7.55-2.61-15.27-8.61-21.71z" /></svg>;
      case 'history': return <svg width={size} height={size} viewBox="0 0 512 512" fill={color} style={{ display: 'block' }}><path d="M504 255.531c.253 136.64-111.18 248.372-247.82 248.468-59.015.042-113.223-20.53-155.822-54.911-11.077-8.94-11.905-25.541-1.839-35.607l11.267-11.267c8.609-8.609 22.353-9.551 31.891-1.984C173.062 425.135 212.781 440 256 440c101.705 0 184-82.311 184-184 0-101.705-82.311-184-184-184-48.814 0-93.149 18.969-126.068 49.932l50.754 50.754c10.08 10.08 2.941 27.314-11.313 27.314H24c-8.837 0-16-7.163-16-16V38.627c0-14.254 17.234-21.393 27.314-11.314l49.372 49.372C129.209 34.136 189.552 8 256 8c136.81 0 247.747 110.78 248 247.531zm-180.912 78.784l9.823-12.63c8.138-10.463 6.253-25.542-4.21-33.679L288 256.349V152c0-13.255-10.745-24-24-24h-16c-13.255 0-24 10.745-24 24v135.651l65.409 50.874c10.463 8.137 25.541 6.253 33.679-4.21z" /></svg>;
      case 'power': return <svg width={size} height={size} viewBox="0 0 512 512" fill={color} style={{ display: 'block' }}><path d="M400 54.1c63 45 104 118.6 104 201.9 0 136.8-110.8 247.7-247.5 248C120 504.3 8.2 393 8 256.4 7.9 173.1 48.9 99.3 111.8 54.2c11.7-8.3 28-4.8 35 7.7L162.6 90c5.9 10.5 3.1 23.8-6.6 31-41.5 30.8-68 79.6-68 134.9-.1 92.3 74.5 168.1 168 168.1 91.6 0 168.6-74.2 168-169.1-.3-51.8-24.7-101.8-68.1-134-9.7-7.2-12.4-20.5-6.5-30.9l15.8-28.1c7-12.4 23.2-16.1 34.8-7.8zM296 264V24c0-13.3-10.7-24-24-24h-32c-13.3 0-24 10.7-24 24v240c0 13.3 10.7 24 24 24h32c13.3 0 24-10.7 24-24z" /></svg>;
      case 'building': return <svg width={size} height={size} viewBox="0 0 448 512" fill={color} style={{ display: 'block' }}><path d="M436 480h-20V24c0-13.255-10.745-24-24-24H56C42.745 0 32 10.745 32 24v456H12c-6.627 0-12 5.373-12 12v20h448v-20c0-6.627-5.373-12-12-12zM128 76c0-6.627 5.373-12 12-12h40c6.627 0 12 5.373 12 12v40c0 6.627-5.373 12-12 12h-40c-6.627 0-12-5.373-12-12V76zm0 96c0-6.627 5.373-12 12-12h40c6.627 0 12 5.373 12 12v40c0 6.627-5.373 12-12 12h-40c-6.627 0-12-5.373-12-12v-40zm52 148h-40c-6.627 0-12-5.373-12-12v-40c0-6.627 5.373-12 12-12h40c6.627 0 12 5.373 12 12v40c0 6.627-5.373 12-12 12zm76 160h-64v-84c0-6.627 5.373-12 12-12h40c6.627 0 12 5.373 12 12v84zm64-172c0 6.627-5.373 12-12 12h-40c-6.627 0-12-5.373-12-12v-40c0-6.627 5.373-12 12-12h40c6.627 0 12 5.373 12 12v40zm0-96c0 6.627-5.373 12-12 12h-40c-6.627 0-12-5.373-12-12v-40c0-6.627 5.373-12 12-12h40c6.627 0 12 5.373 12 12v40zm0-96c0 6.627-5.373 12-12 12h-40c-6.627 0-12-5.373-12-12V76c0-6.627 5.373-12 12-12h40c6.627 0 12 5.373 12 12v40z" /></svg>;
      case 'list': return <svg width={size} height={size} viewBox="0 0 512 512" fill={color} style={{ display: 'block' }}><path d="M48 48a48 48 0 1 0 48 48 48 48 0 0 0-48-48zm0 160a48 48 0 1 0 48 48 48 48 0 0 0-48-48zm0 160a48 48 0 1 0 48 48 48 48 0 0 0-48-48zm448 16H176a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h320a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16zm0-320H176a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h320a16 16 0 0 0 16-16V80a16 16 0 0 0-16-16zm0 160H176a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h320a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16z" /></svg>;
      case 'door': return <svg width={size} height={size} viewBox="0 0 640 512" fill={color} style={{ display: 'block' }}><path d="M624 448h-80V113.45C544 86.19 522.47 64 496 64H384v64h96v384h144c8.84 0 16-7.16 16-16v-32c0-8.84-7.16-16-16-16zM312.24 1.01l-192 49.74C105.99 54.44 96 67.7 96 82.92V448H16c-8.84 0-16 7.16-16 16v32c0 8.84 7.16 16 16 16h336V33.18c0-21.58-19.56-37.41-39.76-32.17zM264 288c-13.25 0-24-14.33-24-32s10.75-32 24-32 24 14.33 24 32-10.75 32-24 32z" /></svg>;
      case 'external': return <svg width={size} height={size} viewBox="0 0 512 512" fill={color} style={{ display: 'block' }}><path d="M432,320H400a16,16,0,0,0-16,16V448H64V128H208a16,16,0,0,0,16-16V80a16,16,0,0,0-16-16H48A48,48,0,0,0,0,112V464a48,48,0,0,0,48,48H400a48,48,0,0,0,48-48V336A16,16,0,0,0,432,320ZM488,0h-128c-21.37,0-32.05,25.91-17,41l35.73,35.73L135,320.37a24,24,0,0,0,0,34L157.67,377a24,24,0,0,0,34,0L435.28,133.32,471,169c15,15,41,4.5,41-17V24A24,24,0,0,0,488,0Z" /></svg>;
      case 'chevron': return <svg {...common} width={14} height={14} viewBox="0 0 24 24"><path d="m9 6 6 6-6 6" /></svg>;
      case 'calendar': return <svg width={size} height={size} viewBox="0 0 448 512" fill={color} style={{ display: 'block' }}><path d="M0 464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V192H0v272zm320-196c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12v-40zm0 128c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12v-40zM192 268c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12v-40zm0 128c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12v-40zM64 268c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12H76c-6.6 0-12-5.4-12-12v-40zm0 128c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12H76c-6.6 0-12-5.4-12-12v-40zM400 64h-48V16c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v48H160V16c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v48H48C21.5 64 0 85.5 0 112v48h448v-48c0-26.5-21.5-48-48-48z" /></svg>;
      case 'caret-down': return <svg width={size} height={size} viewBox="0 0 320 512" fill={color} style={{ display: 'block' }}><path d="M31.3 192h257.3c17.8 0 26.7 21.5 14.1 34.1L174.1 354.8c-7.8 7.8-20.5 7.8-28.3 0L17.2 226.1C4.6 213.5 13.5 192 31.3 192z" /></svg>;
      case 'plus': return <svg width={size} height={size} viewBox="0 0 448 512" fill={color} style={{ display: 'block' }}><path d="M416 208H272V64c0-17.67-14.33-32-32-32h-32c-17.67 0-32 14.33-32 32v144H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h144v144c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32V304h144c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z" /></svg>;
      case 'times': return <svg width={size} height={size} viewBox="0 0 352 512" fill={color} style={{ display: 'block' }}><path d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z" /></svg>;
      case 'handshake': return <svg width={size} height={size} viewBox="0 0 640 512" fill={color} style={{ display: 'block' }}><path d="M434.7 64h-85.9c-8 0-15.7 3-21.6 8.4l-98.3 90c-.1.1-.2.3-.3.4-16.6 15.6-16.3 40.5-2.1 56 12.7 13.9 39.4 17.6 56.1 2.7.1-.1.3-.1.4-.2l79.9-73.2c6.5-5.9 16.7-5.5 22.6 1 6 6.5 5.5 16.6-1 22.6l-26.1 23.9L504 313.8c2.9 2.4 5.5 5 7.9 7.7V128l-54.6-54.6c-5.9-6-14.1-9.4-22.6-9.4zM544 128.2v223.9c0 17.7 14.3 32 32 32h64V128.2h-96zm48 223.9c-8.8 0-16-7.2-16-16s7.2-16 16-16 16 7.2 16 16-7.2 16-16 16zM0 384h64c17.7 0 32-14.3 32-32V128.2H0V384zm48-63.9c8.8 0 16 7.2 16 16s-7.2 16-16 16-16-7.2-16-16c0-8.9 7.2-16 16-16zm435.9 18.6L334.6 217.5l-30 27.5c-29.7 27.1-75.2 24.5-101.7-4.4-26.9-29.4-24.8-74.9 4.4-101.7L289.1 64h-83.8c-8.5 0-16.6 3.4-22.6 9.4L128 128v223.9h18.3l90.5 81.9c27.4 22.3 67.7 18.1 90-9.3l.2-.2 17.9 15.5c15.9 13 39.4 10.5 52.3-5.4l31.4-38.6 5.4 4.4c13.7 11.1 33.9 9.1 45-4.7l9.5-11.7c11.2-13.8 9.1-33.9-4.6-45.1z" /></svg>;
      case 'file': return <svg width={size} height={size} viewBox="0 0 384 512" fill={color} style={{ display: 'block' }}><path d="M224 136V0H24C10.7 0 0 10.7 0 24v464c0 13.3 10.7 24 24 24h336c13.3 0 24-10.7 24-24V160H248c-13.2 0-24-10.8-24-24zm64 236c0 6.6-5.4 12-12 12H108c-6.6 0-12-5.4-12-12v-8c0-6.6 5.4-12 12-12h168c6.6 0 12 5.4 12 12v8zm0-64c0 6.6-5.4 12-12 12H108c-6.6 0-12-5.4-12-12v-8c0-6.6 5.4-12 12-12h168c6.6 0 12 5.4 12 12v8zm0-72v8c0 6.6-5.4 12-12 12H108c-6.6 0-12-5.4-12-12v-8c0-6.6 5.4-12 12-12h168c6.6 0 12 5.4 12 12zm96-114.1v6.1H256V0h6.1c6.4 0 12.5 2.5 17 7l97.9 98c4.5 4.5 7 10.6 7 16.9z" /></svg>;
      case 'dots-vertical': return <svg width={size} height={size} viewBox="0 0 192 512" fill={color} style={{ display: 'block' }}><path d="M96 184c39.8 0 72 32.2 72 72s-32.2 72-72 72-72-32.2-72-72 32.2-72 72-72zM24 80c0 39.8 32.2 72 72 72s72-32.2 72-72S135.8 8 96 8 24 40.2 24 80zm0 352c0 39.8 32.2 72 72 72s72-32.2 72-72-32.2-72-72-72-72 32.2-72 72z" /></svg>;
      case 'clipboard-check': return <svg width={size} height={size} viewBox="0 0 384 512" fill={color} style={{ display: 'block' }}><path d="M336 64h-80c0-35.3-28.7-64-64-64s-64 28.7-64 64H48C21.5 64 0 85.5 0 112v352c0 26.5 21.5 48 48 48h288c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48zM192 40c13.3 0 24 10.7 24 24s-10.7 24-24 24-24-10.7-24-24 10.7-24 24-24zm121.2 231.8l-143 141.8c-4.7 4.7-12.3 4.6-17-.1l-82.6-83.3c-4.7-4.7-4.6-12.3.1-17L99.1 285c4.7-4.7 12.3-4.6 17 .1l46 46.4 106-105.2c4.7-4.7 12.3-4.6 17 .1l28.2 28.4c4.7 4.8 4.6 12.3-.1 17z" /></svg>;
      case 'user-circle': return <svg width={size} height={size} viewBox="0 0 496 512" fill={color} style={{ display: 'block' }}><path d="M248 8C111 8 0 119 0 256s111 248 248 248 248-111 248-248S385 8 248 8zm0 96c48.6 0 88 39.4 88 88s-39.4 88-88 88-88-39.4-88-88 39.4-88 88-88zm0 344c-58.7 0-111.3-26.6-146.5-68.2 18.8-35.4 55.6-59.8 98.5-59.8 2.4 0 4.8.4 7.1 1.1 13 4.2 26.6 6.9 40.9 6.9 14.3 0 28-2.7 40.9-6.9 2.3-.7 4.7-1.1 7.1-1.1 42.9 0 79.7 24.4 98.5 59.8C359.3 421.4 306.7 448 248 448z" /></svg>;
      case 'star-outline': return <svg {...common} fill="none"><path d="m12 2.8 2.8 5.7 6.3.9-4.6 4.4 1.1 6.3-5.6-3-5.6 3 1.1-6.3-4.6-4.4 6.3-.9L12 2.8Z" /></svg>;
      case 'book': return <svg width={size} height={size} viewBox="0 0 576 512" fill={color} style={{ display: 'block' }}><path d="M542.22 32.05c-54.8 3.11-163.72 14.43-230.96 55.59-4.64 2.84-7.27 7.89-7.27 13.17v363.87c0 11.55 12.63 18.85 23.28 13.49 69.18-34.82 169.23-44.32 218.7-46.92 16.89-.89 30.02-14.43 30.02-30.66V62.75c.01-17.71-15.35-31.74-33.77-30.7zM264.73 87.64C197.5 46.48 88.58 35.17 33.78 32.05 15.36 31.01 0 45.04 0 62.75V400.6c0 16.24 13.13 29.78 30.02 30.66 49.49 2.6 149.59 12.11 218.77 46.95 10.62 5.35 23.21-1.94 23.21-13.46V100.63c0-5.29-2.62-10.14-7.27-12.99z" /></svg>;
      case 'info': return <svg width={size} height={size} viewBox="0 0 192 512" fill={color} style={{ display: 'block' }}><path d="M20 424.229h20V279.771H20c-11.046 0-20-8.954-20-20V212c0-11.046 8.954-20 20-20h112c11.046 0 20 8.954 20 20v212.229h20c11.046 0 20 8.954 20 20V492c0 11.046-8.954 20-20 20H20c-11.046 0-20-8.954-20-20v-47.771c0-11.046 8.954-20-20-20zM96 0C56.235 0 24 32.235 24 72s32.235 72 72 72 72-32.235 72-72S135.764 0 96 0z" /></svg>;
      case 'trash': return <svg width={size} height={size} viewBox="0 0 448 512" fill={color} style={{ display: 'block' }}><path d="M32 464a48 48 0 0 0 48 48h288a48 48 0 0 0 48-48V128H32zm272-256a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zm-96 0a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zm-96 0a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zM432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.72 23.72 0 0 0-21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16z" /></svg>;
      default: return null;
    }
  };
  const HeaderIcon = ({ children }) => <span style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{children}</span>;
  const Badge = ({ value }) => <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#254a67', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>{value}</span>;
  const ToolbarIcon = ({ name, disabled = false, size = 20 }) => (
    <span className={`streamline-toolbar-icon${disabled ? ' is-disabled' : ''}`}>
      <Icon name={name} size={size} color={disabled ? '#7e99a9' : '#254a67'} />
    </span>
  );
  const ToolbarStarPlus = () => (
    <span className="streamline-toolbar-icon" style={{ position: 'relative' }}>
      <Icon name="star" size={21} color="#254a67" />
      <span style={{ position: 'absolute', right: 1, top: 1, width: 10, height: 10, borderRadius: '50%', background: '#254a67', color: '#edf4f9', fontSize: 10, lineHeight: '10px', textAlign: 'center', fontWeight: 700 }}>+</span>
    </span>
  );

  return (
    <div data-ehr="calmhsa" style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', fontFamily: "Arial, 'Helvetica Neue', sans-serif", background: '#e9f0fb', color: '#254a67', overflow: 'hidden' }}>
      <style>{`
        .streamline-toolbar-icon {
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border-radius: 2px;
          color: #254a67;
        }
        .streamline-toolbar-icon:hover { background: #d9eaf5; }
        .streamline-toolbar-icon.is-disabled {
          color: #7e99a9;
          opacity: 0.6;
          cursor: default;
          pointer-events: none;
        }
      `}</style>
      <div data-smartcare-header style={{ height: 52, background: '#fff', borderBottom: '3px solid #f5a800', display: 'flex', alignItems: 'center', gap: 14, padding: '0 12px', boxSizing: 'border-box', overflow: 'hidden' }}>
        <HeaderIcon><Icon name="menu" size={22} /></HeaderIcon>
        <img src="/calmhsa-smartcare-logo.png" alt="SmartCare" style={{ height: 44, width: 'auto', display: 'block', marginRight: 24 }} />
        <HeaderIcon><Icon name="search" size={22} /></HeaderIcon>
        <HeaderIcon><Icon name="star" size={22} /></HeaderIcon>
        <HeaderIcon><Icon name="home-user" size={22} /></HeaderIcon>
        <HeaderIcon><Icon name="user" size={22} /></HeaderIcon>
        <div style={{ color: '#000', fontSize: 16, borderBottom: '3px solid #254a67', minWidth: 320, height: 34, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span>{patientLabel}</span>
          <span style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
            <Icon name="money" size={17} /><Icon name="question" size={17} /><Icon name="smile" size={17} /><Icon name="medical" size={17} /><Icon name="briefcase" size={17} />
            <Icon name="dots-vertical" size={14} /><Icon name="plus" size={14} /><Icon name="times" size={14} />
          </span>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
          <Icon name="briefcase" size={20} /><Icon name="bell" size={20} /><Icon name="history" size={20} /><Icon name="question" size={20} /><Icon name="power" size={20} />
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden' }}>
        <div data-smartcare-rail style={{ width: 240, background: '#efefef', borderRight: '1px solid #cfcfcf', flexShrink: 0 }}>
          <div style={{ height: 42, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderBottom: '1px solid #cfcfcf' }}>
            {['user', 'home-user', 'building', 'list'].map((icon, i) => <div key={icon} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: i === 0 ? '3px solid #254a67' : 0 }}><Icon name={icon} size={18} /></div>)}
          </div>
          {navItems.map(([icon, label, arrow], i) => (
            <div key={label} style={{ height: i === 0 ? 42 : 41, borderBottom: '1px solid #cfcfcf', display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px', boxSizing: 'border-box', fontSize: 13 }}>
              {icon.startsWith('badge:') ? <Badge value={icon.slice(6)} /> : <span style={{ width: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={icon} size={18} /></span>}
              <span style={{ flex: 1 }}>{label}</span>
              {arrow && <Icon name="chevron" size={13} />}
            </div>
          ))}
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0 }}>
          <div style={{ height: 42, background: '#edf4f9', borderBottom: '1px solid #c7c7c7', display: 'flex', alignItems: 'center', padding: '0 10px', boxSizing: 'border-box' }}>
            <div data-smartcare-title style={{ color: '#000', fontSize: 20, flex: 1 }}>Progress Note</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#254a67' }}>
              <ToolbarIcon name="handshake" size={21} />
              <ToolbarIcon name="file" size={18} />
              <ToolbarIcon name="dots-vertical" size={16} />
              <ToolbarIcon name="clipboard-check" disabled size={18} />
              <ToolbarIcon name="user-circle" size={22} />
              <span className="streamline-toolbar-icon" style={{ width: 30, fontSize: 12 }}>GoTo</span>
              <ToolbarStarPlus />
              <ToolbarIcon name="star" size={21} />
              <ToolbarIcon name="book" size={21} />
              <ToolbarIcon name="question" size={21} />
              <ToolbarIcon name="trash" disabled size={18} />
            </div>
          </div>
          <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: '6px 6px 20px', boxSizing: 'border-box' }}>
            <div style={{ width: 940, minHeight: activeTab === 'Service' ? 896 : '100%', background: '#fff', boxShadow: 'inset 0 0 0 1px #d8d8d8', padding: '16px 12px 45px', boxSizing: 'border-box' }}>
              <div style={{ height: 39, display: 'grid', gridTemplateColumns: '200px 250px 250px 150px', gap: 6, alignItems: 'center', padding: '0 8px', boxShadow: '0 2px 9px rgba(0,0,0,.25)', marginBottom: 13 }}>
                <div style={{ display: 'flex', height: 25, alignItems: 'center' }}><span style={{ background: '#eee', padding: '5px 6px', fontSize: 13 }}>Effective</span><span style={{ padding: '5px 6px', fontSize: 13 }}>02/09/2026</span><Icon name="calendar" size={17} /><Icon name="caret-down" size={11} /></div>
                <div style={{ display: 'flex', height: 25 }}><span style={{ background: '#eee', padding: '5px 14px', fontSize: 13 }}>Status</span><span style={{ padding: '5px 6px', fontSize: 13 }}>New</span></div>
                <div style={{ display: 'flex', height: 25 }}><span style={{ background: '#eee', padding: '5px 14px', fontSize: 13 }}>Author</span><span style={{ padding: '5px 6px', fontSize: 13 }}>Eleos</span></div>
                <div style={{ fontSize: 13 }}>10/14/2025</div>
              </div>
              <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #111', marginBottom: 13, fontSize: 14 }}>
                {['Service', 'Note', 'Billing Diagnosis', 'Add-On Codes', 'Warnings', 'Disposition'].map(tab => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    style={{ padding: '6px 16px', background: activeTab === tab ? '#d7e9f6' : '#fff', border: 0, borderBottom: activeTab === tab ? '3px solid #254a67' : '3px solid transparent', font: 'inherit', cursor: 'pointer' }}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              {activeTab === 'Service' ? (
                <>
                  <h2 style={{ margin: '0 0 12px 10px', fontSize: 19, fontWeight: 400, color: '#111' }}>Service</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: '476px 400px', gap: 36, padding: '0 10px', color: '#111' }}>
                    <div>
                      {formRow('Status', 'status')}
                      {formRow('Program', 'program', true)}
                      {formRow('Procedure', 'procedure')}
                      {formRow('Location', 'location', true)}
                      <div style={{ display: 'grid', gridTemplateColumns: '148px 232px', alignItems: 'center', gap: 8, minHeight: 31 }}>
                        <label style={{ fontSize: 13, color: '#111' }}>Clinician</label>
                        <div style={fieldBoxStyle}>Eleos</div>
                      </div>
                      {formRow('Mode Of Delivery', 'modeOfDelivery')}
                      {formRow('Cancel Reason', 'cancelReason')}
                      <div style={{ height: 22 }} />
                      {formRow('Evidence Based Practices', 'evidenceBasedPractices')}
                      {formRow('Transportation Service', 'transportationService')}
                    </div>
                    <div>
                      {rightRow('Start Date', 'startDate')}
                      {rightRow('Start Time', 'startTime', true)}
                      {rightRow('Travel Time', 'travelTime', true, 'Minutes')}
                      <div style={{ height: 31 }} />
                      {rightRow('Documentation Time', 'documentationTime', true, 'Minutes')}
                      {rightRow('Service Time', 'serviceTime', true, 'Minutes')}
                      {rightRow('Attending', 'attending')}
                      {rightRow('Referring', 'referring')}
                      <div style={{ height: 32 }} />
                      <label style={{ fontSize: 13 }}><span style={{ display: 'inline-block', width: 14, height: 14, border: '1px solid #aaa', verticalAlign: 'middle', marginRight: 5 }} />Interpreter Services Needed</label>
                    </div>
                  </div>
                  <div style={{ borderTop: '1px solid #cfcfcf', marginTop: 22, paddingTop: 40 }}>
                    <h2 style={{ margin: '0 0 18px 6px', fontSize: 18, fontWeight: 400, color: '#111' }}>Custom Fields</h2>
                    <div style={{ borderTop: '1px solid #cfcfcf', padding: '6px 18px' }}>
                      <h3 style={{ margin: 0, fontSize: 18, fontWeight: 400, color: '#111' }}>Interpreter/Bilingual Service Information</h3>
                    </div>
                  </div>
                </>
              ) : activeTab === 'Note' ? (
                <div style={{ padding: '0 10px 20px', maxWidth: selectedNoteType === 'ProgressNote' ? 'none' : '50%' }}>
                  {selectedNoteType === 'ProgressNote' ? (
                    <CalmhsaProgressNote noteValues={noteValues} onNoteChange={onNoteChange} highlightedField={highlightedField} sections={sections} />
                  ) : (
                    <StackedFields noteValues={noteValues} onNoteChange={onNoteChange} highlightedField={highlightedField} labelColor='#333' fontSize={13} borderColor='#cfcfcf' minHeight={112} borderRadius={0} />
                  )}
                </div>
              ) : (
                <div style={{ padding: '22px 10px', color: '#666', fontSize: 13 }}>{activeTab} content is not available in this demo.</div>
              )}
            </div>
          </div>
          <div style={{ height: 6, flexShrink: 0, borderTop: '1px solid #d6d6d6', background: 'linear-gradient(90deg, #efefef 0%, #efefef 25%, orange 50%, #efefef 75%, #efefef 100%)' }} />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// REGISTRY
// ═══════════════════════════════════════════════════════════════════════════════
export const EHR_BACKGROUNDS = {
  welligent:    WelligentBg,
  arize:        ArizeBg,
  echo:         EchoBg,
  credible:     CredibleBg,
  insync:       InsyncBg,
  carlogic:     CarlogicBg,
  myevolve:     MyEvolvBg,
  myavatar:     MyAvatarBg,
  kipu:         KipuBg,
  foothold:     FootholdBg,
  exym:         ExymBg,
  pce:          PCEBg,
  'eleos-lite': EleosLiteBg,
  streamline:   StreamlineBg,
  calmhsa:      CalmhsaBg,
};

export const EHR_LABELS = {
  welligent:    'Welligent',
  arize:        'Arize',
  echo:         'Echo',
  credible:     'Qualifacts Credible',
  insync:       'Qualifacts Insync',
  carlogic:     'Qualifacts Carelogic',
  myevolve:     'myEvolv',
  myavatar:     'myAvatar',
  kipu:         'Kipu',
  foothold:     'Foothold',
  exym:         'Exym',
  pce:          'PCE',
  'eleos-lite': 'Eleos Lite',
  streamline:   'Streamline',
  calmhsa:      'CalMHSA SmartCare',
};
