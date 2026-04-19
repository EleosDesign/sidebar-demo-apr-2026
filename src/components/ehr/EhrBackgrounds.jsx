/**
 * EhrBackgrounds.jsx  —  pixel-accurate EHR chrome for the Eleos demo
 * Each component: position:absolute inset:0, accepts { noteValues, onNoteChange, highlightedField }
 * Patient: Webb, Marcus
 */
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNoteTypeContext } from '../../contexts/NoteTypeContext.jsx';
import { useEhrContext } from '../../contexts/EhrContext.jsx';
import { useEhrField } from '../ui/EhrFieldContext.jsx';
import EnhanceInlineButton from '../enhance/EnhanceInlineButton';

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
function buildEnhancedText(text) {
  let s = text.trim();
  if (!s) return s;

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

  // ③ Clinical vocabulary substitutions
  const subs = [
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
  subs.forEach(([from, to]) => { s = s.replace(from, to); });

  return s;
}

// ── Enhance tooltip card — visual extension of the Enhance CTA ───────────────
// Shares the CTA's lavender bg (#eaedfa) + navy border (#293d87).
// Draggable via the header row.
function EnhanceTooltip({ text, onUse, onDismiss }) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef(null);

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
    <div style={{
      // ── CTA visual identity ──────────────────────────────────────
      background: '#eaedfa',
      border: '1.5px solid #293d87',
      borderRadius: 16,
      padding: '10px 12px',
      display: 'flex', flexDirection: 'column', gap: 8,
      boxShadow: [
        '0px 7.3px 14.6px 0px rgba(41,61,135,0.14)',
        '0px 25.55px 25.55px 0px rgba(41,61,135,0.12)',
        '0px 58.4px 34.675px 0px rgba(41,61,135,0.07)',
        '0px 102.2px 40.15px 0px rgba(41,61,135,0.02)',
      ].join(', '),
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
            fontSize: 13, fontWeight: 600, color: '#293d87',
            letterSpacing: '0.01em', whiteSpace: 'nowrap',
            fontFamily: 'var(--font-family, inherit)',
          }}>
            Suggested Enhancement
          </span>
        </div>
        <button
          onMouseDown={e => { e.stopPropagation(); e.preventDefault(); }}
          onClick={onDismiss}
          aria-label="Dismiss"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: 4, color: '#293d87', opacity: 0.5,
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
          fontSize: 13, color: '#293d87', lineHeight: 1.55, margin: 0,
          fontFamily: "'Segoe UI', Arial, sans-serif",
        }}>
          {text}
        </p>
      </div>

      {/* ── Actions ───────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8 }}>
        <button
          onMouseDown={e => e.preventDefault()}
          onClick={onDismiss}
          style={{
            height: 26, padding: '0 10px',
            background: 'none', border: 'none', borderRadius: 20,
            cursor: 'pointer', fontSize: 12, fontWeight: 500,
            color: '#293d87', opacity: 0.6,
            fontFamily: 'var(--font-family, inherit)',
          }}
        >
          Dismiss
        </button>
        <button
          onMouseDown={e => e.preventDefault()}
          onClick={onUse}
          style={{
            height: 26, padding: '0 12px',
            background: '#293d87', border: 'none', borderRadius: 20,
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
  );
}

// ── LQA inline CTA — shown only on the last empty field ──────────────────────
function LqaInlineCta({ onClick }) {
  return (
    <button
      aria-label="Check note quality"
      onMouseDown={e => e.preventDefault()}
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '6px 12px 6px 10px',
        background: '#2d4ccd', border: 'none', borderRadius: 20,
        cursor: 'pointer',
        boxShadow: '0px 2px 8px rgba(45,76,205,0.25)',
        transition: 'opacity 0.15s', whiteSpace: 'nowrap',
      }}
      onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; }}
      onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        style={{ flexShrink: 0 }}
      >
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
      </svg>
      <span style={{
        fontSize: 13, fontWeight: 600, color: '#fff',
        letterSpacing: '0.01em', fontFamily: 'var(--font-family, inherit)',
      }}>
        Check Note Quality
      </span>
    </button>
  );
}

function StackedFields({ noteValues = {}, onNoteChange, highlightedField,
  labelColor = '#555', labelWeight = 500, borderRadius = 4,
  borderColor = '#ccc', minHeight = 150, fontSize = 13,
  fontFamily = "'Segoe UI', Arial, sans-serif", bg = '#fff' }) {
  const noteTypeCtx = useNoteTypeContext();
  const ehrField = useEhrField();
  const setFocusedEhrField = ehrField?.setActiveField ?? (() => {});
  const [focusedField, setFocusedField] = useState(null);
  const [enhancingField, setEnhancingField] = useState(null);
  const [tooltipField, setTooltipField] = useState(null);
  const [tooltipText, setTooltipText] = useState('');
  const sections = noteTypeCtx?.sections ?? [
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
  const lastSectionId = sections[sections.length - 1]?.id ?? null;

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
    onNoteChange?.(id, val);
    // Keep EhrFieldContext.fieldValues in sync so LQA dirty-check works
    const key = DAP_FIELD_MAP[id];
    if (key && ehrField) {
      ehrField.setFieldValues(prev => ({ ...prev, [key]: val }));
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

        // Enhance button: focused, field has text (or loading), but NOT while tooltip is open
        // (the tooltip IS the expanded CTA — they don't coexist)
        const showEnhanceBtn = isFocused && (hasText || isEnhancing) && !isShowingTooltip;
        // LQA CTA: focused on the last field OR last empty field, AND note has some content
        const isLastOrLastEmpty = s.id === lastSectionId || s.id === lastEmptySectionId;
        const showLqaCta = isFocused && isLastOrLastEmpty && noteHasContent;
        // Action strip (in-flow) shows when buttons are visible
        const showStrip = showEnhanceBtn || showLqaCta;

        return (
          <div key={s.id} style={{ marginBottom: 22, position: 'relative' }}>
            <div style={{ fontSize, color: labelColor, marginBottom: 5, fontWeight: labelWeight }}>{s.label}</div>
            <textarea
              value={currentValue}
              onChange={e => handleChange(s.id, e.target.value)}
              onFocus={() => { setFocusedEhrField(s.id); setTimeout(() => setFocusedField(s.id), 300); }}
              onBlur={() => { setFocusedEhrField(null); setTimeout(() => setFocusedField(f => f === s.id ? null : f), 150); }}
              placeholder="Type here or use the cards on the right to build your note"
              style={{
                width: '100%', minHeight, padding: '10px 12px',
                border: `1px solid ${borderColor}`, borderRadius,
                resize: 'vertical', fontSize, color: '#333', fontFamily,
                background: highlightedField === s.id ? '#fffde7' : bg,
                outline: 'none', lineHeight: 1.5, boxSizing: 'border-box',
                transition: 'background 0.3s',
              }}
            />
            {/* Action strip — also the anchor point for the upward-opening tooltip */}
            {(showStrip || isShowingTooltip) && (
              <div style={{ marginTop: 6, position: 'relative' }}>
                {/* Buttons row */}
                {showStrip && (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {showEnhanceBtn && (
                      <EnhanceInlineButton
                        loading={isEnhancing}
                        onClick={() => mockEnhance(s.id, currentValue)}
                      />
                    )}
                    {showLqaCta && (
                      <LqaInlineCta onClick={() => ehrField?.triggerQualityCheck?.()} />
                    )}
                  </div>
                )}
                {/* Tooltip — opens upward, sized by its own content */}
                {isShowingTooltip && (
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    bottom: '100%',
                    marginBottom: 6,
                    zIndex: 9,   // below sidebar (zIndex: 10)
                  }}>
                    <EnhanceTooltip
                      text={tooltipText}
                      onUse={() => applyEnhanced(s.id)}
                      onDismiss={dismissTooltip}
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
  const [activeTab, setActiveTab] = useState('Enter Notes');
  const tabs = ['View/Enter Appointment Details', 'Enter Notes', 'Complete Paperwork', 'Approval/Signatures'];
  const medications = [
    { name: 'Advil 200 mg/1 200MG',     sig: '--',              qty: '--', refills: '0' },
    { name: 'FLONASE 50 ug/1 5',        sig: '--',              qty: '--', refills: '0' },
    { name: 'Lorazepam 0.5 mg/1 .5 mg', sig: '--',              qty: '--', refills: '0' },
    { name: 'PAXIL 12.5 mg/1 1 tablet', sig: 'take medication', qty: '--', refills: '0' },
    { name: 'TYLENOL 500 mg/1 5MG',     sig: 'Take with food',  qty: '--', refills: '0' },
    { name: 'Xanax 0.25 mg/1 1/day',    sig: '--',              qty: '--', refills: '0' },
    { name: 'Vitamin ABC(Outside)',      sig: 'TESTING',         qty: '--', refills: ''  },
  ];
  const allergies = ['Bee Pollens', 'peanut'];
  const diagnoses = [
    { code: 'F60.3', desc: 'Borderline personality disorder(19-aug-2020 to ...)' },
    { code: 'Z60.0', desc: 'Phase of life problem(17-aug-2023 to ...)' },
    { code: 'F33.2', desc: 'Major Depressive Disorder, Recurrent, Severe(21-apr-2021 to ...)' },
  ];
  const sideIcons = [
    <svg key="a" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
    <svg key="b" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
    <svg key="c" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>,
    <svg key="d" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"><rect x="1" y="3" width="15" height="13" rx="1"/><polygon points="16 8 20 8 23 11 23 16 16 16"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
    <svg key="e" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"><circle cx="9" cy="7" r="3.5"/><path d="M2 21c0-3.5 3.1-6 7-6s7 2.5 7 6"/><circle cx="19" cy="7" r="2.5"/><path d="M19 13c2.3 0 4 1.7 4 4"/></svg>,
    <svg key="f" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    <svg key="g" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="3" cy="6" r="1"/><circle cx="3" cy="12" r="1"/><circle cx="3" cy="18" r="1"/></svg>,
    <svg key="h" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>,
    <svg key="i" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>,
    <svg key="j" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"><polygon points="12 2 2 7 12 12 22 7"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
    <svg key="k" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily: 'Arial, sans-serif', fontSize: 13, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#fff' }}>
      {/* App header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '5px 10px', background: '#fff', borderBottom: '1px solid #ccc', flexShrink: 0, gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          {/* Welligent logo: navy W mark + wordmark */}
          <svg width="28" height="28" viewBox="0 0 28 28">
            <rect width="28" height="28" rx="5" fill="#1a3a6b"/>
            <text x="14" y="21" textAnchor="middle" fontFamily="Georgia,serif" fontWeight="900" fontSize="18" fill="#fff">W</text>
          </svg>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
            <span style={{ fontWeight: 800, fontSize: 14, color: '#1a3a6b', letterSpacing: '-0.3px' }}>welligent</span>
            <span style={{ fontSize: 8, color: '#f5a623', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Session Notes</span>
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: '#666' }}>{clientName} — MR#10234</span>
        <button style={{ padding: '3px 11px', border: '1px solid #bbb', borderRadius: 3, background: '#fff', cursor: 'pointer', fontSize: 12, color: '#333' }}>Text Input</button>
        <button style={{ padding: '3px 11px', border: '1px solid #bbb', borderRadius: 3, background: '#f5f5f5', cursor: 'pointer', fontSize: 12, color: '#333', display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ fontWeight: 700, fontSize: 11, color: '#1a3560' }}>eleos</span>
          <span>Eleos Documentation Dashboard</span>
          <span style={{ borderLeft: '1px solid #bbb', paddingLeft: 8, marginLeft: 2 }}>Psychiatry</span>
        </button>
        <button style={{ padding: '3px 11px', border: '1px solid #bbb', borderRadius: 3, background: '#fff', cursor: 'pointer', fontSize: 12, color: '#333' }}>Other »</button>
        <button style={{ padding: '3px 11px', border: '1px solid #bbb', borderRadius: 3, background: '#fff', cursor: 'pointer', fontSize: 12, color: '#333' }}>Print</button>
        <button style={{ padding: '3px 11px', border: '1px solid #bbb', borderRadius: 3, background: '#fff', cursor: 'pointer', fontSize: 12, color: '#333' }}>Close</button>
      </div>
      {/* Tab bar */}
      <div style={{ display: 'flex', background: '#2c5f8a', flexShrink: 0 }}>
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: '8px 22px', border: 'none', cursor: 'pointer', fontSize: 13,
            background: activeTab === tab ? '#3a7eb8' : 'transparent',
            color: '#fff', fontWeight: activeTab === tab ? 600 : 400,
            borderBottom: activeTab === tab ? '3px solid #f5a623' : '3px solid transparent',
            flexShrink: 0,
          }}>{tab}</button>
        ))}
      </div>
      {/* Main area */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left panel */}
        <div style={{ width: 295, borderRight: '1px solid #ccc', overflowY: 'auto', flexShrink: 0, background: '#fff' }}>
          {/* Active Medications */}
          <div style={{ borderBottom: '1px solid #ccc' }}>
            <div style={{ background: '#cfe0ed', padding: '5px 10px', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 12, color: '#1a3a5c', borderBottom: '1px solid #b8cfe0' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1a3a5c" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="12" y1="8" x2="12" y2="16"/></svg>
              Active Medications
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5 }}>
              <thead>
                <tr style={{ background: '#f3f3f3' }}>
                  <th style={{ padding: '4px 8px', textAlign: 'left', fontWeight: 600, color: '#555', borderBottom: '1px solid #ddd' }}>Medication</th>
                  <th style={{ padding: '4px 8px', textAlign: 'left', fontWeight: 600, color: '#555', borderBottom: '1px solid #ddd' }}>Sig</th>
                  <th style={{ padding: '4px 6px', textAlign: 'right', fontWeight: 600, color: '#555', borderBottom: '1px solid #ddd', fontSize: 11, lineHeight: 1.2 }}>Quantity<br/>Refills</th>
                </tr>
              </thead>
              <tbody>
                {medications.map((med, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '5px 6px 5px 8px' }}>
                      <span style={{ fontSize: 10, color: '#666', marginRight: 4, fontStyle: 'italic', fontWeight: 600 }}>Rx</span>
                      {med.name}
                    </td>
                    <td style={{ padding: '5px 6px', color: '#555' }}>{med.sig}</td>
                    <td style={{ padding: '5px 6px', textAlign: 'right', color: '#555', lineHeight: 1.3 }}>{med.qty}<br/>{med.refills}</td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={3} style={{ padding: '5px 8px' }}>
                    <a href="#" onClick={e => e.preventDefault()} style={{ color: '#2a5d8a', textDecoration: 'underline', fontSize: 12 }}>Copy All to the Note</a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* Active Allergies */}
          <div style={{ borderBottom: '1px solid #ccc' }}>
            <div style={{ background: '#cfe0ed', padding: '5px 10px', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 12, color: '#1a3a5c', borderBottom: '1px solid #b8cfe0' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1a3a5c" strokeWidth="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
              Active Allergies
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5 }}>
              <thead>
                <tr style={{ background: '#f3f3f3' }}>
                  <th style={{ padding: '4px 8px', textAlign: 'left', fontWeight: 600, color: '#555', borderBottom: '1px solid #ddd' }}>Allergy</th>
                </tr>
              </thead>
              <tbody>
                {allergies.map((a, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '5px 8px' }}>
                      <span style={{ marginRight: 8, color: '#777', fontSize: 11 }}>◉</span>{a}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Diagnoses */}
          <div>
            <div style={{ background: '#cfe0ed', padding: '5px 10px', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 12, color: '#1a3a5c', borderBottom: '1px solid #b8cfe0' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1a3a5c" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-3.5 3.6-6 8-6s8 2.5 8 6"/></svg>
              Diagnoses
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5 }}>
              <thead>
                <tr style={{ background: '#f3f3f3' }}>
                  <th style={{ padding: '4px 8px', textAlign: 'left', fontWeight: 600, color: '#555', borderBottom: '1px solid #ddd', whiteSpace: 'nowrap' }}>Code</th>
                  <th style={{ padding: '4px 8px', textAlign: 'left', fontWeight: 600, color: '#555', borderBottom: '1px solid #ddd' }}>Description</th>
                </tr>
              </thead>
              <tbody>
                {diagnoses.map((d, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '5px 8px', whiteSpace: 'nowrap', verticalAlign: 'top' }}>
                      <span style={{ marginRight: 5, color: '#777', fontSize: 11 }}>◉</span>{d.code}
                    </td>
                    <td style={{ padding: '5px 8px', color: '#333', lineHeight: 1.4 }}>{d.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Progress Note area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 22px', background: '#fff' }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#222', marginBottom: 18 }}>Progress Note</div>
          <StackedFields noteValues={noteValues} onNoteChange={onNoteChange} highlightedField={highlightedField}
            labelColor='#444' fontSize={13} borderColor='#ccc' minHeight={150} />
        </div>
        {/* Right icon sidebar */}
        <div style={{ width: 38, background: '#162540', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 6, gap: 1, flexShrink: 0 }}>
          {sideIcons.map((icon, i) => (
            <button key={i} style={{ background: 'transparent', border: 'none', cursor: 'pointer', width: 36, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {icon}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#aac', fontSize: 13, padding: '8px 0', marginBottom: 6 }}>«</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. QUALIFACTS (SmartCare)
// ═══════════════════════════════════════════════════════════════════════════════
export function QualifactsBg({ noteValues = {}, onNoteChange, highlightedField }) {
  const { clientName } = useEhrContext();
  const [activeTab, setActiveTab] = useState('Service');
  const [activeNav, setActiveNav] = useState('Client');
  const tabs = ['Service', 'Note', 'Billing Diagnosis', 'Add-On Codes', 'Warnings', 'Disposition'];
  const hBtn = { background: 'none', border: 'none', cursor: 'pointer', padding: '3px 5px', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' };

  const navItems = [
    { badge: <span style={{ display:'inline-flex',alignItems:'center',justifyContent:'center',width:22,height:22,borderRadius:4,background:'#3a8fc1',color:'#fff',fontSize:9,fontWeight:800 }}>CT</span>, label: 'Consent To Share Data', hasArrow: false },
    { badge: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#6b7a90" strokeWidth="1.8" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>, label: 'My Office', hasArrow: true },
    { badge: <span style={{ display:'inline-flex',alignItems:'center',justifyContent:'center',width:22,height:22,borderRadius:4,background:'#1d6aae',color:'#fff',fontSize:9,fontWeight:800 }}>ST</span>, label: 'Shared Treatment Plan', hasArrow: false },
    { badge: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#6b7a90" strokeWidth="1.8" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>, label: 'Client', hasArrow: true },
    { badge: <span style={{ display:'inline-flex',alignItems:'center',justifyContent:'center',width:22,height:22,borderRadius:4,background:'#7a6a5a',color:'#fff',fontSize:9,fontWeight:800 }}>CF</span>, label: 'Client Funds', hasArrow: false },
    { badge: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#6b7a90" strokeWidth="1.8" strokeLinecap="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>, label: 'SmartLinks', hasArrow: false },
  ];

  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: 13, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#e8edf5' }}>
      {/* Top header */}
      <div style={{ background: '#fff', borderBottom: '3px solid #f5a623', display: 'flex', alignItems: 'center', padding: '0 14px', height: 48, gap: 8, flexShrink: 0 }}>
        {/* Hamburger */}
        <button style={hBtn}><svg width="18" height="14" viewBox="0 0 18 14"><line x1="0" y1="1" x2="18" y2="1" stroke="#333" strokeWidth="2"/><line x1="0" y1="7" x2="18" y2="7" stroke="#333" strokeWidth="2"/><line x1="0" y1="13" x2="18" y2="13" stroke="#333" strokeWidth="2"/></svg></button>
        {/* SmartCare wordmark */}
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1, marginRight: 8 }}>
          <span style={{ fontWeight: 800, fontSize: 16, color: '#1a3a6b', fontStyle: 'italic' }}>SmartCare<sup style={{ fontSize: 9, fontWeight: 400 }}>™</sup></span>
          <span style={{ fontSize: 7, color: '#888', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 500 }}>Behavioral Health EHR</span>
        </div>
        {/* Icon buttons */}
        <button style={hBtn}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></button>
        <button style={hBtn}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></button>
        <button style={hBtn}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg></button>
        <button style={hBtn}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></button>
        {/* Patient bar */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, color: '#222' }}>
            <span>{clientName} (1099)</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {[
                <svg key="cam" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.8"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
                <svg key="q" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
                <svg key="sm" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>,
                <svg key="br" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.8"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
              ].map((ic, i) => <button key={i} style={hBtn}>{ic}</button>)}
              <button style={hBtn}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg></button>
              <button style={{ ...hBtn, color: '#1d6aae', fontWeight: 700, fontSize: 18 }}>+</button>
              <button style={{ ...hBtn, color: '#aaa', fontSize: 18 }}>✕</button>
            </div>
          </div>
        </div>
      </div>
      {/* Body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <div style={{ width: 338, background: '#fff', borderRight: '1px solid #dde1e7', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #eee', padding: '6px 12px 0' }}>
            {[
              <svg key="u" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1d6aae" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
              <svg key="h" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>,
              <svg key="g" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
              <svg key="m" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
            ].map((ic, i) => (
              <button key={i} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 10px 6px', borderBottom: i === 0 ? '2px solid #1d6aae' : '2px solid transparent' }}>{ic}</button>
            ))}
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {navItems.map(item => {
              const isActive = activeNav === item.label;
              return (
                <button key={item.label} onClick={() => setActiveNav(item.label)} style={{
                  display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 14px',
                  border: 'none', background: isActive ? '#e8f2fc' : 'transparent', cursor: 'pointer',
                  textAlign: 'left', fontSize: 13, color: isActive ? '#1d6aae' : '#333',
                  borderLeft: isActive ? '3px solid #1d6aae' : '3px solid transparent',
                  fontWeight: isActive ? 600 : 400,
                }}>
                  <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24 }}>{item.badge}</span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.hasArrow && <svg width="7" height="11" viewBox="0 0 7 11"><polyline points="1 1 6 5.5 1 10" fill="none" stroke="#bbb" strokeWidth="1.5"/></svg>}
                </button>
              );
            })}
          </div>
        </div>
        {/* Main */}
        <div style={{ flex: 1, overflowY: 'auto', background: '#e8edf5', padding: '14px 20px' }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a2b4a', margin: '0 0 10px' }}>Progress Note</h1>
          <div style={{ background: '#fff', border: '1px solid #dde4ee', borderRadius: 4, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderBottom: '1px solid #eee' }}>
              <label style={{ fontSize: 12, color: '#555' }}>Effective</label>
              <input defaultValue="04/10/2026" style={{ border: '1px solid #bbb', borderRadius: 3, padding: '4px 8px', fontSize: 12, width: 100 }} readOnly />
              <label style={{ fontSize: 12, color: '#555', marginLeft: 12 }}>Status</label>
              <input defaultValue="New" style={{ border: '1px solid #bbb', borderRadius: 3, padding: '4px 8px', fontSize: 12, width: 120 }} readOnly />
              <label style={{ fontSize: 12, color: '#555', marginLeft: 12 }}>Author</label>
              <input defaultValue="Eleos Clinician" style={{ border: '1px solid #bbb', borderRadius: 3, padding: '4px 8px', fontSize: 12, flex: 1 }} readOnly />
            </div>
            <div style={{ display: 'flex', borderBottom: '2px solid #e0e4ea', padding: '0 14px' }}>
              {tabs.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: '9px 14px',
                  fontSize: 12, fontWeight: activeTab === tab ? 600 : 400,
                  color: activeTab === tab ? '#1d6aae' : '#555',
                  borderBottom: activeTab === tab ? '2px solid #1d6aae' : '2px solid transparent',
                  marginBottom: '-2px', whiteSpace: 'nowrap',
                }}>{tab}</button>
              ))}
            </div>
            <div style={{ padding: '16px 14px' }}>
              {activeTab === 'Note' ? (
                <StackedFields noteValues={noteValues} onNoteChange={onNoteChange} highlightedField={highlightedField} labelColor='#444' fontSize={12} borderColor='#ccc' minHeight={140} />
              ) : activeTab === 'Service' ? (
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1a2b4a', marginBottom: 14 }}>Service</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 40px' }}>
                    <div>
                      {[['Status','Show'],['Program',''],['Location',''],['Mode Of Delivery',''],['Cancel Reason',''],['Transportation Service','No']].map(([lbl,val]) => (
                        <div key={lbl} style={{ display: 'flex', alignItems: 'center', marginBottom: 10, gap: 6 }}>
                          <label style={{ width: 130, flexShrink: 0, fontSize: 12, color: '#444' }}>{lbl}</label>
                          <input defaultValue={val} style={{ flex: 1, border: '1px solid #bbb', borderRadius: 3, padding: '4px 8px', fontSize: 12 }} readOnly />
                        </div>
                      ))}
                    </div>
                    <div>
                      {[['Start Date','04/10/2026'],['Start Time',''],['Travel Time',''],['Documentation Time',''],['Service Time',''],['Attending','']].map(([lbl,val]) => (
                        <div key={lbl} style={{ display: 'flex', alignItems: 'center', marginBottom: 10, gap: 6 }}>
                          <label style={{ width: 140, flexShrink: 0, fontSize: 12, color: '#444' }}>{lbl}</label>
                          <input defaultValue={val} style={{ flex: 1, border: '1px solid #bbb', borderRadius: 3, padding: '4px 8px', fontSize: 12 }} readOnly />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '30px', textAlign: 'center', color: '#aaa', fontSize: 13 }}>{activeTab} content</div>
              )}
            </div>
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
  const [activeNav, setActiveNav] = useState('Clients');
  const SIDEBAR = '#3d5a73';
  const SIDEBAR_ACTIVE = '#2c4860';
  const navItems = [
    { label: 'Clients',     paths: [<path key="a" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>, <path key="b" d="M9 7a4 4 0 100 8 4 4 0 000-8z"/>, <path key="c" d="M23 21v-2a4 4 0 00-3-3.87"/>, <path key="d" d="M16 3.13a4 4 0 010 7.75"/>] },
    { label: 'Scheduling',  paths: [<rect key="a" x="3" y="4" width="18" height="18" rx="2"/>, <line key="b" x1="16" y1="2" x2="16" y2="6"/>, <line key="c" x1="8" y1="2" x2="8" y2="6"/>, <line key="d" x1="3" y1="10" x2="21" y2="10"/>] },
    { label: 'Foster Care', paths: [<path key="a" d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>] },
    { label: 'Reporting',   paths: [<line key="a" x1="18" y1="20" x2="18" y2="10"/>, <line key="b" x1="12" y1="20" x2="12" y2="4"/>, <line key="c" x1="6" y1="20" x2="6" y2="14"/>] },
    { label: 'RX',          paths: [<path key="a" d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>, <path key="b" d="M14 2v6h6"/>, <line key="c" x1="16" y1="13" x2="8" y2="13"/>, <line key="d" x1="16" y1="17" x2="8" y2="17"/>] },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif", fontSize: 13, display: 'flex', overflow: 'hidden' }}>
      {/* Sidebar */}
      <div style={{ width: 215, background: SIDEBAR, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        {/* Logo */}
        <div style={{ padding: '18px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>Arize</span>
            <svg width="22" height="22" viewBox="0 0 24 24"><path d="M13 2L4 14h7l-1 8 10-12h-7z" fill="#f5c518" stroke="#f5c518" strokeWidth="0.5" strokeLinejoin="round"/></svg>
          </div>
        </div>
        {/* Profile section */}
        <div style={{ padding: '12px 18px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ marginBottom: 10 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.6" strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ background: '#27ae60', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10 }}>Active:</span>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.7" strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
        </div>
        {/* Nav */}
        <nav style={{ flex: 1, overflowY: 'auto', paddingTop: 4 }}>
          {navItems.map(item => {
            const isActive = activeNav === item.label;
            return (
              <button key={item.label} onClick={() => setActiveNav(item.label)} style={{
                display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '11px 20px',
                border: 'none', borderLeft: isActive ? '3px solid #f5c518' : '3px solid transparent',
                background: isActive ? SIDEBAR_ACTIVE : 'transparent', cursor: 'pointer', textAlign: 'left',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.78)', fontSize: 15, fontWeight: isActive ? 600 : 400,
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: isActive ? 1 : 0.8, flexShrink: 0 }}>
                  {item.paths}
                </svg>
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#fff' }}>
        {/* Top bar */}
        <div style={{ background: '#fff', borderBottom: '1px solid #e2e6ea', display: 'flex', alignItems: 'center', height: 50, flexShrink: 0, padding: '0 16px', gap: 10 }}>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: SIDEBAR, padding: '4px 2px', display: 'flex', alignItems: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cdd3da', borderRadius: 5, overflow: 'hidden', flex: '0 0 400px' }}>
            <input placeholder="Global Search...." style={{ flex: 1, border: 'none', outline: 'none', padding: '8px 14px', fontSize: 14, color: '#333', background: '#fff' }} />
            <button style={{ background: SIDEBAR, border: 'none', cursor: 'pointer', padding: '8px 14px', display: 'flex', alignItems: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </button>
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {/* Calendar */}
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px', borderRadius: 4, display: 'flex', alignItems: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.7" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </button>
            {/* Email + badge */}
            <div style={{ position: 'relative' }}>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px', borderRadius: 4, display: 'flex', alignItems: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.7" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </button>
              <span style={{ position: 'absolute', top: 1, right: 1, background: '#e53e3e', color: '#fff', fontSize: 9, fontWeight: 700, borderRadius: '50%', width: 13, height: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, pointerEvents: 'none' }}>5</span>
            </div>
            {/* List */}
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px', borderRadius: 4, display: 'flex', alignItems: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.7" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
            </button>
            {/* Users + badge */}
            <div style={{ position: 'relative' }}>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px', borderRadius: 4, display: 'flex', alignItems: 'center' }}>
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.7" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
              </button>
              <span style={{ position: 'absolute', top: 1, right: 1, background: '#e53e3e', color: '#fff', fontSize: 9, fontWeight: 700, borderRadius: '50%', width: 13, height: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, pointerEvents: 'none' }}>5</span>
            </div>
            {/* User */}
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px', borderRadius: 4, display: 'flex', alignItems: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.7" strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </button>
          </div>
        </div>
        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '22px 30px 80px', background: '#fff' }}>
          <div style={{ fontSize: 13, color: '#888', marginBottom: 20 }}>{clientName} · Individual Therapy · {new Date().toLocaleDateString()}</div>
          <StackedFields noteValues={noteValues} onNoteChange={onNoteChange} highlightedField={highlightedField} labelColor='#444' fontSize={13} borderColor='#d0d7de' minHeight={165} borderRadius={6} />
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, paddingTop: 4 }}>
            <button style={{ padding: '9px 28px', fontSize: 13, fontWeight: 500, border: '1px solid #cdd3da', borderRadius: 5, background: '#fff', color: '#444', cursor: 'pointer' }}>Clear Fields</button>
            <button style={{ padding: '9px 28px', fontSize: 13, fontWeight: 600, border: 'none', borderRadius: 5, background: SIDEBAR, color: '#fff', cursor: 'pointer' }}>Submit Note</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. ECHO (echoVantage)
// ═══════════════════════════════════════════════════════════════════════════════
export function EchoBg({ noteValues = {}, onNoteChange, highlightedField }) {
  const { clientName } = useEhrContext();
  const [activeTab, setActiveTab] = useState('DATA/INTERVENTION');
  const tabs = ['GOALS/OBJECTIVES', 'DATA/INTERVENTION'];
  const sideIcons = [
    <><rect key="a" x="3" y="3" width="7" height="7"/><rect key="b" x="14" y="3" width="7" height="7"/><rect key="c" x="3" y="14" width="7" height="7"/><rect key="d" x="14" y="14" width="7" height="7"/></>,
    <><path key="a" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><path key="b" d="M9 7a4 4 0 100 8 4 4 0 000-8z"/><path key="c" d="M23 21v-2a4 4 0 00-3-3.87"/><path key="d" d="M16 3.13a4 4 0 010 7.75"/></>,
    <><path key="a" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle key="b" cx="12" cy="7" r="4"/></>,
    <><path key="a" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><path key="b" d="M9 7a4 4 0 100 8 4 4 0 000-8z"/></>,
    <><rect key="a" x="3" y="3" width="18" height="18" rx="1"/><line key="b" x1="3" y1="9" x2="21" y2="9"/><line key="c" x1="9" y1="21" x2="9" y2="9"/></>,
    <><line key="a" x1="18" y1="20" x2="18" y2="10"/><line key="b" x1="12" y1="20" x2="12" y2="4"/><line key="c" x1="6" y1="20" x2="6" y2="14"/></>,
    <><circle key="a" cx="12" cy="12" r="3"/><path key="b" d="M19.07 4.93a10 10 0 010 14.14"/><path key="c" d="M4.93 4.93a10 10 0 000 14.14"/></>,
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif", fontSize: 13, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Dark brown header */}
      <div style={{ background: '#3a3028', display: 'flex', alignItems: 'center', height: 42, flexShrink: 0, padding: '0 14px 0 10px', gap: 10, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 24, height: 24, borderRadius: 4, background: '#c8a96e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="13" height="13" viewBox="0 0 14 14"><path d="M7 1L13 7L7 13L1 7Z" fill="#3a3028"/></svg>
          </div>
          <span style={{ color: '#e8ddd0', fontSize: 14, fontWeight: 600, letterSpacing: '0.02em' }}>echoVantage</span>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {[
            <path key="u" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 7a4 4 0 100 8 4 4 0 000-8z"/>,
            <><path key="a" d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path key="b" d="M13.73 21a2 2 0 01-3.46 0"/></>,
            <><path key="a" d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline key="b" points="22 6 12 13 2 6"/></>,
            <><rect key="a" x="2" y="3" width="20" height="14"/><line key="b" x1="8" y1="21" x2="16" y2="21"/><line key="c" x1="12" y1="17" x2="12" y2="21"/></>,
            <><circle key="a" cx="12" cy="12" r="10"/><path key="b" d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line key="c" x1="12" y1="17" x2="12.01" y2="17"/></>,
          ].map((p, i) => (
            <button key={i} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '3px 6px', display: 'flex', alignItems: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{p}</svg>
            </button>
          ))}
          <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginLeft: 4 }}>Elana Scribe</span>
          <div style={{ background: '#2255a4', color: '#fff', borderRadius: 3, padding: '2px 9px', fontSize: 12, fontWeight: 700, marginLeft: 6 }}>37</div>
        </div>
      </div>
      {/* Body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Icon sidebar */}
        <div style={{ width: 44, background: '#4a3e34', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 8, gap: 2, flexShrink: 0 }}>
          {sideIcons.map((icon, i) => (
            <button key={i} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.55)', padding: '8px 0', width: '100%', display: 'flex', justifyContent: 'center' }}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{icon}</svg>
            </button>
          ))}
        </div>
        {/* Dark bg + white panel */}
        <div style={{ flex: 1, background: '#5c4f45', overflowY: 'auto', position: 'relative', display: 'flex' }}>
          <div style={{ flex: 1, background: '#fff', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* SIGN / SEND / X row */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 20, padding: '13px 24px 12px', flexShrink: 0 }}>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, color: '#555', fontSize: 13, fontWeight: 500 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#777" strokeWidth="2.2" strokeLinecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                SIGN
              </button>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, color: '#2255a4', fontSize: 13, fontWeight: 500 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2255a4" strokeWidth="2.2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                SEND
              </button>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e05c2a', fontSize: 22, lineHeight: 1, padding: 0 }}>✕</button>
            </div>
            {/* Patient info */}
            <div style={{ padding: '4px 24px 12px' }}>
              <div style={{ fontSize: 19, fontWeight: 700, color: '#1a1a1a', marginBottom: 2 }}>00032414 {clientName}</div>
              <div style={{ fontSize: 12, color: '#888' }}>Individual Progress Note</div>
            </div>
            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #e0e0e0', padding: '0 24px' }}>
              {tabs.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: '9px 16px',
                  fontSize: 12, fontWeight: 600, letterSpacing: '0.05em',
                  color: activeTab === tab ? '#1a2fbe' : '#999',
                  borderBottom: activeTab === tab ? '2px solid #1a2fbe' : '2px solid transparent',
                  marginBottom: '-1px',
                }}>{tab}</button>
              ))}
            </div>
            {/* Note fields */}
            <div style={{ padding: '22px 24px 60px', flex: 1 }}>
              <StackedFields noteValues={noteValues} onNoteChange={onNoteChange} highlightedField={highlightedField} labelColor='#333' fontSize={13} borderColor='#ccc' minHeight={170} borderRadius={5} />
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
  const [activeIndex, setActiveIndex] = useState('Narrative');
  const leftLinks = [
    { icon: '🗒️', label: 'Chart Documents' },
    { icon: '💳', label: 'Eligibility/Insurance' },
    { icon: '❤️', label: 'Health/PHCP Info' },
    { icon: '📄', label: 'Latest Clinical Documents' },
    { icon: '📊', label: 'Quality Measures' },
  ];
  const rightLinks = [
    { icon: '🔴', label: '1 Alert' },
    { icon: '🔬', label: 'Diagnosis' },
    { icon: '💡', label: 'Clinical Decision Supports' },
    { icon: '📌', label: 'Assignments' },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily: "Arial,sans-serif", fontSize: 13, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#fff' }}>
      {/* Nav bar */}
      <div style={{ background: '#f5f0e8', borderBottom: '2px solid #cc6600', display: 'flex', alignItems: 'center', padding: '5px 8px', gap: 3, flexShrink: 0 }}>
        {['Back', 'Home', 'Logout', 'Help'].map(label => (
          <button key={label} style={{
            background: 'linear-gradient(to bottom,#f7aa50,#df7a18)', border: '1px solid #a85800',
            borderRadius: 3, color: '#fff', fontWeight: 700, fontSize: 12, padding: '4px 14px',
            cursor: 'pointer', textShadow: '0 1px 1px rgba(0,0,0,0.25)', boxShadow: '0 1px 2px rgba(0,0,0,0.15)', flexShrink: 0,
          }}>{label}</button>
        ))}
        <button style={{ background: '#fff', border: '1px solid #aaa', borderRadius: 2, padding: '3px 7px', cursor: 'pointer', fontSize: 14, marginLeft: 2, flexShrink: 0 }}>✉</button>
        <div style={{ flex: 1, textAlign: 'right', paddingRight: 8 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#111', whiteSpace: 'nowrap' }}>Change Behavioral Health Progress Note</span>
        </div>
      </div>
      {/* Case info bar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #ccc', display: 'flex', alignItems: 'center', padding: '5px 14px', gap: 40, flexShrink: 0, fontSize: 13 }}>
        <span><b style={{ color: '#333' }}>Client: </b>{clientName}</span>
        <span><b style={{ color: '#333' }}>Case #: </b><a href="#" style={{ color: '#1a5cb5', textDecoration: 'none' }} onClick={e => e.preventDefault()}>000002</a></span>
        <span><b style={{ color: '#333' }}>LOC/Grid: </b>None</span>
        <span><b style={{ color: '#333' }}>Case: </b><span style={{ color: '#cc6600', fontWeight: 700 }}>Open</span></span>
      </div>
      {/* Patient info table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', borderBottom: '1px solid #ddd', fontSize: 12, tableLayout: 'fixed', flexShrink: 0 }}>
        <colgroup><col style={{ width: '22%' }}/><col style={{ width: '28%' }}/><col style={{ width: '50%' }}/></colgroup>
        <tbody>
          <tr style={{ verticalAlign: 'top' }}>
            <td style={{ padding: '8px 12px' }}>
              <div style={{ display: 'flex', gap: 16, marginBottom: 5 }}>
                <span style={{ fontWeight: 600, color: '#444' }}>Date of Birth</span>
                <span style={{ fontWeight: 600, color: '#444' }}>Home Phone</span>
              </div>
              <div><span style={{ fontWeight: 600, color: '#444' }}>Address</span></div>
            </td>
            <td style={{ padding: '8px 8px' }}>
              <table style={{ width: '100%', border: '1px solid #aaa', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr><td style={{ background: '#c0d0e0', borderBottom: '1px solid #aaa', padding: '3px 8px', fontWeight: 700, textAlign: 'center', color: '#222' }}>Current Admission</td></tr>
                  {['Primary Org:', 'Primary Program:', 'Case Holder:'].map(f => (
                    <tr key={f}><td style={{ padding: '3px 8px', fontWeight: 600, color: '#333' }}>{f}</td></tr>
                  ))}
                </tbody>
              </table>
            </td>
            <td style={{ padding: '8px 12px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody><tr>
                  <td style={{ verticalAlign: 'top', paddingRight: 8 }}>
                    {leftLinks.map(l => (
                      <div key={l.label} style={{ marginBottom: 3 }}>
                        <a href="#" onClick={e => e.preventDefault()} style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#1a5cb5', textDecoration: 'none' }}>
                          <span>{l.icon}</span><span style={{ textDecoration: 'underline' }}>{l.label}</span>
                        </a>
                      </div>
                    ))}
                  </td>
                  <td style={{ verticalAlign: 'top' }}>
                    {rightLinks.map(l => (
                      <div key={l.label} style={{ marginBottom: 3 }}>
                        <a href="#" onClick={e => e.preventDefault()} style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#1a5cb5', textDecoration: 'none' }}>
                          <span>{l.icon}</span><span style={{ textDecoration: 'underline' }}>{l.label}</span>
                        </a>
                      </div>
                    ))}
                  </td>
                </tr></tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
      {/* Index + Note sections */}
      <div style={{ display: 'flex', padding: '12px 14px', gap: 14, flex: 1, overflowY: 'auto' }}>
        {/* Left: Index sidebar */}
        <div style={{ flex: '0 0 155px', alignSelf: 'start' }}>
          <div style={{ border: '1px solid #aaa', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ background: '#6699cc', color: '#fff', fontWeight: 700, fontSize: 12, padding: '4px 8px', textAlign: 'center' }}>Index</div>
            {[{ num: 1, label: 'Narrative' }, { num: 2, label: 'Send Copy To' }, { num: 3, label: 'Signatures' }].map(item => (
              <div key={item.label} onClick={() => setActiveIndex(item.label)} style={{
                padding: '6px 8px', fontSize: 12, cursor: 'pointer', borderBottom: '1px solid #ddd',
                background: activeIndex === item.label ? '#f5a830' : '#fff',
                color: activeIndex === item.label ? '#fff' : '#1a5cb5',
                fontWeight: activeIndex === item.label ? 700 : 400,
                textDecoration: activeIndex === item.label ? 'none' : 'underline',
              }}>{item.num}. {item.label}</div>
            ))}
          </div>
        </div>
        {/* Note sections */}
        <div style={{ flex: 1 }}>
          <StackedFields noteValues={noteValues} onNoteChange={onNoteChange} highlightedField={highlightedField} labelColor='#222' fontSize={13} borderColor='#bbb' minHeight={165} borderRadius={3} />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. INSYNC
// ═══════════════════════════════════════════════════════════════════════════════
export function InsyncBg({ noteValues = {}, onNoteChange, highlightedField }) {
  const { clientName } = useEhrContext();
  const [activeTab, setActiveTab] = useState('Session Progress Note');
  const sideIcons = [
    <svg key="a" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#5a6a84" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    <svg key="b" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#5a6a84" strokeWidth="1.8" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="12" y2="17"/></svg>,
    <svg key="c" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#5a6a84" strokeWidth="1.8" strokeLinecap="round"><circle cx="9" cy="7" r="3"/><path d="M2 20c0-3 3-5 7-5s7 2 7 5"/><circle cx="19" cy="9" r="2"/><path d="M19 14c2 0 4 1.5 4 3"/></svg>,
    <svg key="d" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#5a6a84" strokeWidth="1.8" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    <svg key="e" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#5a6a84" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
    <svg key="f" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#5a6a84" strokeWidth="1.8" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
    <svg key="g" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#5a6a84" strokeWidth="1.8" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
    <svg key="h" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#5a6a84" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/><line x1="19" y1="14" x2="19" y2="20"/><line x1="16" y1="17" x2="22" y2="17"/></svg>,
    <svg key="i" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#5a6a84" strokeWidth="1.8" strokeLinecap="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>,
    <svg key="j" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#5a6a84" strokeWidth="1.8" strokeLinecap="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  ];
  const toolbarIcons = [
    { bg: '#4a9fd4', icon: 'bookmark' }, { bg: '#4a9fd4', icon: 'print' },
    { bg: '#e87c3e', icon: 'attach' },   { bg: '#3aad6e', icon: 'cal' },
    { bg: '#4a9fd4', icon: 'person' },   { bg: '#e84a4a', icon: 'flag' },
    { bg: '#7a6aad', icon: 'shield' },   { bg: '#7a8a9a', icon: 'person' },
    { bg: '#3ab8d4', icon: 'cam' },      { bg: '#7a8a9a', icon: 'refresh' },
    { bg: '#3aad6e', icon: 'down' },     { bg: '#4a9fd4', icon: 'up' },
    { bg: '#7a8a9a', icon: 'list' },     { bg: '#3ab8d4', icon: 'grid' },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily: "'Segoe UI', Arial, sans-serif", fontSize: 13, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#fff' }}>
      {/* Purple accent bar */}
      <div style={{ height: 6, background: '#4a1278', flexShrink: 0 }} />
      {/* Main header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '8px 16px', background: '#fff', borderBottom: '1px solid #e8e8e8', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#1c2e72', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ color: '#fff', fontWeight: 900, fontSize: 17, fontFamily: 'Georgia,serif', lineHeight: 1 }}>Q</span>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 13.5, color: '#1c2e72', letterSpacing: '0.06em' }}>QUALIFACTS</div>
            <div style={{ fontSize: 12, color: '#3a9fd4', fontWeight: 600, letterSpacing: '0.02em' }}>insync</div>
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.8" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, border: '1px solid #ddd', borderRadius: 5, padding: '5px 10px', cursor: 'pointer' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
            <span style={{ fontSize: 12.5, color: '#333' }}>Test Provider (Prescri...</span>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2.2"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.8" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </div>
      </div>
      {/* Sub-header: Note of Session */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '6px 14px', background: '#fff', borderBottom: '1px solid #e2e8f0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, background: '#3a6fc4', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: 14, color: '#1a2540' }}>Note of Session</span>
          <div style={{ width: 22, height: 22, borderRadius: 3, background: '#f0f4f8', border: '1px solid #dde4ee', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {toolbarIcons.map((ic, i) => (
            <div key={i} style={{ width: 22, height: 22, borderRadius: 3, background: ic.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                {ic.icon === 'bookmark' && <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>}
                {ic.icon === 'print' && <><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></>}
                {ic.icon === 'attach' && <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>}
                {ic.icon === 'cal' && <><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>}
                {ic.icon === 'person' && <><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></>}
                {ic.icon === 'flag' && <><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></>}
                {ic.icon === 'shield' && <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>}
                {ic.icon === 'cam' && <><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></>}
                {ic.icon === 'refresh' && <><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></>}
                {ic.icon === 'down' && <polyline points="6 9 12 15 18 9"/>}
                {ic.icon === 'up' && <polyline points="18 15 12 9 6 15"/>}
                {ic.icon === 'list' && <><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/></>}
                {ic.icon === 'grid' && <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></>}
              </svg>
            </div>
          ))}
        </div>
      </div>
      {/* Content row */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left icon sidebar */}
        <div style={{ width: 44, background: '#fff', borderRight: '1px solid #e8edf5', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 8, gap: 1, flexShrink: 0 }}>
          {sideIcons.map((icon, i) => (
            <button key={i} style={{ background: 'transparent', border: 'none', cursor: 'pointer', width: 40, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 5 }}>
              {icon}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#888', fontSize: 13, padding: '8px 0', marginBottom: 8 }}>»</button>
        </div>
        {/* Main content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Patient bar */}
          <div style={{ background: '#fffde7', borderBottom: '1px solid #e8e4c0', padding: '5px 14px', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
            <div style={{ flex: '0 0 340px', height: 22, background: '#fff', border: '1px solid #ddd', borderRadius: 3, fontSize: 12, color: '#333', display: 'flex', alignItems: 'center', padding: '0 8px' }}>{clientName}</div>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.8"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3l-4 4-4-4"/></svg>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            <div style={{ flex: 1 }} />
            <div style={{ width: 28, height: 28, background: '#3aafd4', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            </div>
            <div style={{ flex: 1 }} />
            <div style={{ width: 28, height: 28, background: '#f0f4f8', border: '1px solid #ddd', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            </div>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2.2"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
          {/* Notes area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, cursor: 'pointer' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2.2"><polyline points="6 9 12 15 18 9"/></svg>
              <span style={{ fontWeight: 600, fontSize: 13, color: '#222' }}>General Notes</span>
            </div>
            {/* Tabs row */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16, gap: 0 }}>
              <button style={{ padding: '4px 7px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#777', fontSize: 14 }}>‹</button>
              {['Session Progress Note', 'Service'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{
                  padding: '5px 14px', cursor: 'pointer', fontSize: 13, marginRight: 3,
                  background: activeTab === tab ? '#fff' : 'transparent',
                  color: activeTab === tab ? '#1a2540' : '#666',
                  fontWeight: activeTab === tab ? 600 : 400,
                  border: activeTab === tab ? '1px solid #d0dae8' : '1px solid transparent',
                  borderRadius: 4, boxShadow: activeTab === tab ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                }}>{tab}</button>
              ))}
              <button style={{ padding: '4px 7px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#777', fontSize: 14 }}>›</button>
              <div style={{ flex: 1 }} />
              <button style={{ background: '#fff', border: '1px solid #d0dae8', borderRadius: 3, padding: '4px 7px', cursor: 'pointer', marginLeft: 4 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              </button>
              <button style={{ background: '#fff', border: '1px solid #d0dae8', borderRadius: 3, padding: '4px 7px', cursor: 'pointer', marginLeft: 4 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              </button>
            </div>
            {/* Note fields + divider */}
            <div style={{ display: 'flex', gap: 0, minHeight: 500 }}>
              <div style={{ flex: '0 0 53%', paddingRight: 22 }}>
                <StackedFields noteValues={noteValues} onNoteChange={onNoteChange} highlightedField={highlightedField}
                  labelColor='#555' labelWeight={500} fontSize={13} borderColor='#d0d8e4' minHeight={175} borderRadius={5} />
              </div>
              <div style={{ width: 1, background: '#d8e0ea', flexShrink: 0 }} />
              <div style={{ flex: 1 }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 7. CARELOGIC
// ═══════════════════════════════════════════════════════════════════════════════
export function CarlogicBg({ noteValues = {}, onNoteChange, highlightedField }) {
  const [activeNav, setActiveNav] = useState('Favorites');
  const [activeSide, setActiveSide] = useState('Individual Behavioral Health Counseling Note');
  const navItems = ['Favorites', 'Schedule', 'Front Desk', 'Point of Entry', 'Client', 'Employee', 'Administration', 'Billing/AR', 'BI', 'MY ALERTS'];
  const sideItems = ['Treatment Diagnosis', 'Goals Addressed', 'Individual Behavioral Health Counseling Note', 'Signatures'];

  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily: "'Segoe UI', Arial, sans-serif", fontSize: 13, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#fff' }}>
      {/* Thin purple bar */}
      <div style={{ height: 5, background: '#4a1278', flexShrink: 0 }} />
      {/* Header */}
      <div style={{ background: '#8aacc8', display: 'flex', alignItems: 'center', padding: '8px 16px', gap: 14, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <svg width="40" height="40" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="18" fill="#3db882"/>
            <circle cx="20" cy="20" r="10" fill="none" stroke="#fff" strokeWidth="3"/>
            <circle cx="20" cy="20" r="4" fill="#fff"/>
            <circle cx="28" cy="12" r="5" fill="#3db882" stroke="#fff" strokeWidth="2.5"/>
          </svg>
          <div>
            <div style={{ fontWeight: 400, fontSize: 13.5, color: '#fff' }}>QUALI<strong>FACTS</strong>™</div>
            <div style={{ fontSize: 12, color: '#d0eee8', fontWeight: 500 }}>carelogic</div>
          </div>
        </div>
        <div style={{ position: 'relative', flex: '0 0 270px' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2.2" style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input placeholder="Client Search" style={{ width: '100%', padding: '7px 10px 7px 30px', border: 'none', borderRadius: 4, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Bell */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1a2b5e" strokeWidth="1.8" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          {/* Home */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1a2b5e" strokeWidth="1.8" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          {/* Email */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1a2b5e" strokeWidth="1.8" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22 6 12 13 2 6"/></svg>
          {/* Logout */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1a2b5e" strokeWidth="1.8" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
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
            fontWeight: activeNav === item ? 600 : 400,
            color: item === 'MY ALERTS' ? '#c83800' : '#1a2b5e',
            borderBottom: activeNav === item ? '3px solid #1a2b5e' : '3px solid transparent',
            whiteSpace: 'nowrap', flexShrink: 0,
          }}>{item}</button>
        ))}
        <div style={{ flex: 1 }} />
        <button style={{ background: '#1a2b5e', color: '#fff', border: 'none', cursor: 'pointer', padding: '0 18px', fontSize: 13, fontWeight: 600, flexShrink: 0 }}>Return to Schedule</button>
      </div>
      {/* Content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left sidebar */}
        <div style={{ width: 196, background: '#b4c8d8', borderRight: '1px solid #8aacc8', flexShrink: 0, overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', padding: '9px 10px', borderBottom: '1px solid #9ab4c8' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1a2b5e" strokeWidth="2.5" style={{ marginRight: 6 }}><polyline points="15 18 9 12 15 6"/></svg>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: '#1a2b5e', lineHeight: 1.3 }}>Clinical Progress Note (OBH)</span>
          </div>
          {sideItems.map(item => (
            <div key={item} onClick={() => setActiveSide(item)} style={{
              padding: '9px 10px 9px 18px', fontSize: 13, color: '#1a2b5e', cursor: 'pointer',
              background: activeSide === item ? 'rgba(26,43,94,0.1)' : 'transparent',
              borderBottom: '1px solid rgba(255,255,255,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span>{item}</span>
              {activeSide === item && <span style={{ fontSize: 9, color: '#1a2b5e' }}>▶</span>}
            </div>
          ))}
          <div style={{ height: 8 }} />
          <div style={{ padding: '8px 10px 6px 18px', borderTop: '1px solid #9ab4c8' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#1a2b5e' }}>Document List</span>
          </div>
        </div>
        {/* Note + right panel */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <div style={{ flex: '0 0 60%', overflowY: 'auto', padding: '16px 22px', background: '#fff' }}>
            <StackedFields noteValues={noteValues} onNoteChange={onNoteChange} highlightedField={highlightedField} labelColor='#888' fontSize={13} borderColor='#ccc' minHeight={180} borderRadius={5} />
          </div>
          <div style={{ width: 1, background: '#d8d8d8', flexShrink: 0 }} />
          <div style={{ flex: 1, background: '#fff' }} />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 8. MYEVOLV
// ═══════════════════════════════════════════════════════════════════════════════
export function MyEvolvBg({ noteValues = {}, onNoteChange, highlightedField }) {
  const [activeSide, setActiveSide] = useState('Therapy');
  const sideItems = ['Telehealth Confirmations', 'Therapy', 'Assessment Launch', 'Internal Tasks', 'Additional Information', 'Referral to Another Agency', 'Tasks/Schedules', 'Service Related Encounter Information'];
  const actionBtns = ['Save', 'Cancel', 'Delete', 'Print ▾', 'Send Alert', 'History', 'Refresh', 'Copy Test', 'Form Info', 'Save Draft'];
  const navTabs = ['myEvolv', 'Taskbar', 'Referral', 'Program', 'Client', 'People', 'Family', 'Incidents', 'Outreach', 'Groups', 'Resource', 'Finance', 'Agency', 'State', 'Reports', 'Setup'];

  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily: "'Segoe UI', Arial, sans-serif", fontSize: 13, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#e0e0e0' }}>
      {/* App header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', padding: '6px 16px', flexShrink: 0, gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Netsmart myEvolv logo */}
          <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
            <rect width="30" height="30" rx="4" fill="#0076a8"/>
            <text x="15" y="21" textAnchor="middle" fontFamily="Arial,sans-serif" fontWeight="700" fontSize="13" fill="#fff">my</text>
          </svg>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
            <span style={{ fontWeight: 400, fontSize: 13, color: '#0076a8', letterSpacing: '0px' }}>
              <span style={{ fontWeight: 300 }}>my</span><span style={{ fontWeight: 800 }}>Evolv</span>
            </span>
            <span style={{ fontSize: 8, color: '#888', letterSpacing: '0.06em', textTransform: 'uppercase' }}>by Netsmart</span>
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {[
            { label: 'Presenter Notes', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><rect x="3" y="4" width="18" height="16" rx="2"/><line x1="7" y1="9" x2="17" y2="9"/><line x1="7" y1="13" x2="17" y2="13"/></svg> },
            { label: 'Edit', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/></svg> },
            { label: 'Create Demos', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg> },
          ].map(b => (
            <button key={b.label} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 12, color: '#555', display: 'flex', alignItems: 'center', gap: 4 }}>{b.icon}{b.label}</button>
          ))}
          <button style={{ background: '#7c3aed', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: 6, padding: '5px 14px', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            Share
          </button>
        </div>
      </div>
      {/* Module nav bar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #ddd', display: 'flex', alignItems: 'stretch', flexShrink: 0, overflowX: 'auto' }}>
        {navTabs.map((tab, i) => (
          <button key={i} style={{ padding: '7px 12px', background: 'transparent', border: 'none', borderBottom: '3px solid transparent', cursor: 'pointer', fontSize: 12, color: '#555', whiteSpace: 'nowrap', flexShrink: 0 }}>{tab}</button>
        ))}
      </div>
      {/* Content: background + modal */}
      <div style={{ flex: 1, background: '#d8d8d8', overflow: 'hidden', display: 'flex', padding: '6px 6px 6px 44px' }}>
        <div style={{ background: '#fff', border: '1px solid #bbb', boxShadow: '2px 4px 16px rgba(0,0,0,0.18)', display: 'flex', flexDirection: 'column', flex: 1, height: '100%' }}>
          {/* Modal title bar */}
          <div style={{ background: '#f0f0f0', borderBottom: '1px solid #ddd', display: 'flex', alignItems: 'center', padding: '4px 8px', flexShrink: 0 }}>
            <span style={{ fontSize: 13, color: '#333', flex: 1 }}>Therapy (Individual and Family)</span>
            <div style={{ display: 'flex', gap: 2 }}>
              {['−', '□', '×'].map(c => (
                <button key={c} style={{ width: 20, height: 20, background: '#e8e8e8', border: '1px solid #ccc', borderRadius: 2, fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>{c}</button>
              ))}
            </div>
          </div>
          {/* Action buttons */}
          <div style={{ padding: '8px 12px', borderBottom: '1px solid #e8e8e8', display: 'flex', flexWrap: 'wrap', gap: 5, flexShrink: 0 }}>
            {actionBtns.map(b => (
              <button key={b} style={{ padding: '5px 16px', background: '#1f7068', color: '#fff', border: 'none', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }}>{b}</button>
            ))}
          </div>
          {/* Sidebar + note */}
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            <div style={{ width: 162, borderRight: '1px solid #e8e8e8', flexShrink: 0, overflowY: 'auto' }}>
              <div style={{ padding: '8px 12px 4px', fontWeight: 700, fontSize: 12, color: '#333' }}>Information</div>
              {sideItems.map(item => (
                <div key={item} onClick={() => setActiveSide(item)} style={{
                  padding: '6px 10px 6px 18px', fontSize: 12, cursor: 'pointer',
                  color: activeSide === item ? '#1f7068' : '#444',
                  fontWeight: activeSide === item ? 600 : 400,
                  background: activeSide === item ? '#f0faf9' : 'transparent',
                  borderLeft: activeSide === item ? '3px solid #1f7068' : '3px solid transparent',
                }}>{item}</div>
              ))}
            </div>
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
              <div style={{ flex: '0 0 58%', overflowY: 'auto', padding: '16px 20px' }}>
                <StackedFields noteValues={noteValues} onNoteChange={onNoteChange} highlightedField={highlightedField} labelColor='#666' fontSize={13} borderColor='#ccc' minHeight={170} borderRadius={4} />
              </div>
              <div style={{ width: 1, background: '#ddd', flexShrink: 0 }} />
              <div style={{ flex: 1 }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 9. MYAVATAR
// ═══════════════════════════════════════════════════════════════════════════════
export function MyAvatarBg({ noteValues = {}, onNoteChange, highlightedField }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('myDay');
  const topTabs = ['myDay', 'BH Documentation Viewer', 'Client Overview Medical', 'BH Compliance View', 'TRR View', 'CC INBOX', 'Widget Playground (Client)'];

  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily: "'Segoe UI', Arial, sans-serif", fontSize: 13, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#f4f6f8' }}>
      {/* Top nav */}
      <div style={{ background: '#fff', borderBottom: '1px solid #dde4ee', display: 'flex', alignItems: 'stretch', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 16px', borderRight: '1px solid #dde4ee', flexShrink: 0 }}>
          <svg width="26" height="26" viewBox="0 0 26 26">
            <polygon points="13,2 24,8 24,18 13,24 2,18 2,8" fill="#2ab090" opacity="0.15"/>
            <polygon points="13,4 22,9 22,17 13,22 4,17 4,9" fill="none" stroke="#2ab090" strokeWidth="2"/>
            <polygon points="13,8 18,11 18,15 13,18 8,15 8,11" fill="#2ab090"/>
          </svg>
          <div>
            <span style={{ fontSize: 13, fontWeight: 400, color: '#445' }}>my</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#2ab090' }}>Avatar</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', background: '#445', borderRadius: 3, padding: '1px 4px', marginLeft: 4 }}>NX</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'stretch', overflowX: 'auto', flex: 1 }}>
          {topTabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: '0 16px', border: 'none', cursor: 'pointer', fontSize: 13, whiteSpace: 'nowrap', flexShrink: 0,
              background: activeTab === tab ? '#1e3a5a' : 'transparent',
              color: activeTab === tab ? '#fff' : '#555',
              fontWeight: activeTab === tab ? 600 : 400,
            }}>{tab}</button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px', flexShrink: 0 }}>
          <span style={{ fontSize: 12, color: '#888' }}>Customize</span>
          <div style={{ background: '#ddd', borderRadius: 10, padding: '2px 6px', fontSize: 11, color: '#888' }}>OFF</div>
          <div style={{ position: 'relative' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.8"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
            <div style={{ position: 'absolute', top: -4, right: -4, background: '#e84040', color: '#fff', borderRadius: '50%', width: 14, height: 14, fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>4</div>
          </div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
        </div>
      </div>
      {/* Content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left sidebar */}
        {sidebarOpen && (
          <div style={{ width: 188, background: '#1e3a5a', flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '6px 8px', borderBottom: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
              <button onClick={() => setSidebarOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#aac', fontSize: 13, padding: '2px 4px' }}>◄</button>
            </div>
            <div style={{ padding: '10px 10px 4px', flexShrink: 0 }}>
              <div style={{ position: 'relative' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input placeholder="What can I help you find?" style={{ width: '100%', padding: '6px 8px 6px 26px', background: '#fff', border: 'none', borderRadius: 4, fontSize: 11, color: '#333', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <a href="#" onClick={e => e.preventDefault()} style={{ display: 'block', fontSize: 11, color: '#2ab090', textDecoration: 'underline', marginTop: 5, paddingLeft: 2 }}>Advanced Client Search</a>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
              {[{ label: 'My Clients', arrow: false }, { label: 'My Forms', arrow: true }, { label: 'My Favorites', arrow: true }, { label: 'Recent Forms', arrow: true }].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', cursor: 'pointer', color: '#cce0f0', fontSize: 13, fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span>{item.label}</span>
                  {item.arrow && <span style={{ fontSize: 10, color: '#7aa8c8' }}>▶</span>}
                </div>
              ))}
              <div style={{ padding: '10px 14px 4px', fontSize: 11, fontWeight: 700, color: '#7aa8c8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Control Panel</div>
              <div style={{ display: 'flex', gap: 10, padding: '4px 14px 10px' }}>
                {[
                  <svg key="i" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aac0d8" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="0.5" fill="#aac0d8"/></svg>,
                  <svg key="l" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aac0d8" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
                  <svg key="c" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aac0d8" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
                  <svg key="p" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aac0d8" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
                  <svg key="u" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aac0d8" strokeWidth="1.8"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
                ].map((icon, i) => (
                  <button key={i} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>{icon}</button>
                ))}
              </div>
              <div style={{ display: 'flex', margin: '0 10px' }}>
                <button style={{ flex: 1, padding: '6px', background: '#1a2b4e', color: '#fff', border: 'none', borderRadius: '3px 0 0 3px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>My Clients</button>
                <button style={{ flex: 1, padding: '6px', background: '#2a4a70', color: '#aac0d8', border: 'none', borderRadius: '0 3px 3px 0', fontSize: 12, cursor: 'pointer' }}>Site</button>
              </div>
            </div>
          </div>
        )}
        {!sidebarOpen && (
          <div style={{ width: 20, background: '#1e3a5a', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 10, cursor: 'pointer' }} onClick={() => setSidebarOpen(true)}>
            <span style={{ color: '#aac', fontSize: 11 }}>►</span>
          </div>
        )}
        {/* Main */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <div style={{ flex: '0 0 67%', overflowY: 'auto', padding: '20px 24px', background: '#fff' }}>
            <StackedFields noteValues={noteValues} onNoteChange={onNoteChange} highlightedField={highlightedField} labelColor='#666' fontSize={13} borderColor='#ccc' minHeight={185} borderRadius={5} />
          </div>
          <div style={{ width: 1, background: '#ddd', flexShrink: 0 }} />
          <div style={{ flex: 1, background: '#fff' }} />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 10. KIPU
// ═══════════════════════════════════════════════════════════════════════════════
export function KipuBg({ noteValues = {}, onNoteChange, highlightedField }) {
  const [activeNav, setActiveNav] = useState('Clients');
  const navItems = ['Dashboard', 'Clients', 'Occupancy', 'Schedules', 'Shifts', 'Contacts', 'Labs', 'Reports', 'Inventory', 'Help'];

  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily: "'Segoe UI', Arial, sans-serif", fontSize: 13, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#fff' }}>
      {/* Purple header */}
      <div style={{ background: '#7a30b8', display: 'flex', alignItems: 'center', padding: '8px 18px', gap: 16, flexShrink: 0 }}>
        {/* Kipu Health logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="5" fill="rgba(255,255,255,0.18)"/>
            <text x="14" y="20" textAnchor="middle" fontFamily="Arial,sans-serif" fontWeight="900" fontSize="16" fill="#fff">k</text>
          </svg>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
            <span style={{ fontWeight: 700, fontSize: 16, color: '#fff', letterSpacing: '0.02em' }}>kipu</span>
            <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Health</span>
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ position: 'relative', flex: '0 0 240px' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2.2" style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)' }}><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input placeholder="Search Client" style={{ width: '100%', padding: '7px 10px 7px 30px', border: 'none', borderRadius: 20, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ position: 'relative' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
            <div style={{ position: 'absolute', top: -5, right: -5, background: '#fff', color: '#7a30b8', borderRadius: '50%', width: 14, height: 14, fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>A</div>
          </div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22 6 12 13 2 6"/></svg>
        </div>
      </div>
      {/* White nav bar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e8e8e8', display: 'flex', alignItems: 'stretch', flexShrink: 0 }}>
        {navItems.map(item => (
          <button key={item} onClick={() => setActiveNav(item)} style={{
            padding: '10px 16px', border: 'none', cursor: 'pointer', fontSize: 13, background: 'transparent', whiteSpace: 'nowrap',
            color: activeNav === item ? '#7a30b8' : '#444',
            fontWeight: activeNav === item ? 600 : 400,
            borderBottom: activeNav === item ? '2px solid #7a30b8' : '2px solid transparent',
            display: 'flex', alignItems: 'center', gap: 5,
          }}>
            {item}
            {item === 'Labs' && <span style={{ background: '#e8e8e8', color: '#666', borderRadius: '50%', width: 16, height: 16, fontSize: 9, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>A</span>}
          </button>
        ))}
      </div>
      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Patient / discharge section */}
        <div style={{ background: '#dce8f8', borderBottom: '1px solid #c0d4ec', padding: '14px 20px', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 0, marginBottom: 14, borderBottom: '1px solid #c0d4ec', paddingBottom: 10, overflowX: 'auto' }}>
            {['Patient Info', 'Insurance', 'Medical', 'Treatment', 'Care Team', 'Vitals', 'Lab Results', 'Forms'].map((t, i) => (
              <button key={t} style={{ padding: '5px 12px', background: i === 4 ? 'rgba(255,255,255,0.5)' : 'transparent', border: 'none', cursor: 'pointer', fontSize: 12, color: '#1a3a6a', fontWeight: i === 4 ? 600 : 400, whiteSpace: 'nowrap', flexShrink: 0 }}>{t}</button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1a3a6a' }}>Anticipated Discharge Date:</span>
              <input style={{ padding: '4px 8px', border: '1px solid #aac4e0', borderRadius: 3, fontSize: 13, width: 160, background: '#fff', outline: 'none' }} placeholder="Select date..." />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1a3a6a' }}>Golden Thread</span>
              <button style={{ background: '#2db564', color: '#fff', border: 'none', borderRadius: 4, padding: '5px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                Golden Thread
              </button>
            </div>
          </div>
        </div>
        {/* Note area */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <div style={{ flex: '0 0 52%', overflowY: 'auto', padding: '18px 22px', background: '#fff' }}>
            <StackedFields noteValues={noteValues} onNoteChange={onNoteChange} highlightedField={highlightedField} labelColor='#666' fontSize={13} borderColor='#ccc' minHeight={180} borderRadius={5} />
          </div>
          <div style={{ width: 1, background: '#ddd', flexShrink: 0 }} />
          <div style={{ flex: 1, background: '#fff' }} />
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
  const navItems = [
    { label: 'Search Client', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b8c8d8" strokeWidth="1.8"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> },
    { label: 'Home', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b8c8d8" strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
    { label: 'Favorites', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b8c8d8" strokeWidth="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
    { label: 'Census', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b8c8d8" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/></svg> },
    { label: 'Charts', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b8c8d8" strokeWidth="1.8"><circle cx="9" cy="7" r="3"/><path d="M2 20c0-3 3-5 7-5s7 2 7 5"/><circle cx="19" cy="9" r="2"/><path d="M19 14c2 0 4 1.5 4 3"/></svg> },
    { label: 'Administration', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b8c8d8" strokeWidth="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/><circle cx="19" cy="8" r="2.5"/><path d="M23 8a2.5 2.5 0 0 0-2.5-2.5"/></svg> },
    { label: 'Reports', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b8c8d8" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="12" y2="17"/></svg> },
    { label: 'Print', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b8c8d8" strokeWidth="1.8"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg> },
  ];

  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily: "'Segoe UI', Arial, sans-serif", fontSize: 13, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#fff' }}>
      {/* Dark header */}
      <div style={{ background: '#162030', padding: '10px 18px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        <svg width="36" height="28" viewBox="0 0 36 28">
          <rect x="0" y="2" width="36" height="5" rx="2.5" fill="#fff"/>
          <rect x="0" y="11" width="28" height="5" rx="2.5" fill="#fff"/>
          <rect x="0" y="20" width="20" height="5" rx="2.5" fill="#fff"/>
        </svg>
      </div>
      {/* Content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left sidebar */}
        <div style={{ width: 240, background: '#1e2d40', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {navItems.map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 20px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.06)', color: '#c8dae8' }}>
                {item.icon}
                <span style={{ fontSize: 14 }}>{item.label}</span>
              </div>
            ))}
          </div>
          <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: 11, color: '#6a8aa8', lineHeight: 1.5 }}>04/10/2026 9:17 AM EST</div>
            <div style={{ fontSize: 11, color: '#6a8aa8' }}>Foothold © 2026</div>
          </div>
        </div>
        {/* Main */}
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
          <div style={{ border: '1px solid #e0e8f0', borderRadius: 8, overflow: 'hidden', marginTop: 16 }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #e0e8f0', fontWeight: 600, fontSize: 14, color: '#1a2a3a' }}>Progress Note — {clientName}</div>
            <div style={{ padding: '16px' }}>
              <StackedFields noteValues={noteValues} onNoteChange={onNoteChange} highlightedField={highlightedField} labelColor='#555' fontSize={13} borderColor='#d0dae8' minHeight={150} borderRadius={5} />
            </div>
          </div>
        </div>
      </div>
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
  ];
  const pageTabs = ['PAGE 1', 'CO-SIGNERS', 'DIAGNOSIS', 'PROBLEM LIST', 'CARE PLAN CYCLES'];

  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily: "'Segoe UI', Arial, sans-serif", fontSize: 13, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#f5f5f5' }}>
      {/* Dark header */}
      <div style={{ background: '#2e3540', display: 'flex', alignItems: 'center', padding: '8px 16px', flexShrink: 0, gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontWeight: 800, fontSize: 18, color: '#fff', letterSpacing: '-0.5px' }}>Exym</span>
          <span style={{ fontSize: 12, color: '#9aabb8', borderLeft: '1px solid #4a5568', paddingLeft: 10 }}>Edit a Note</span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', borderLeft: '1px solid #4a5568', paddingLeft: 10 }}>{clientName} — Progress Note</span>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #4a5568', borderRadius: 4, overflow: 'hidden' }}>
          <input placeholder="Client Search" style={{ padding: '6px 10px', background: 'transparent', border: 'none', fontSize: 13, color: '#fff', outline: 'none', width: 180 }} />
          <button style={{ background: '#4a5568', border: 'none', cursor: 'pointer', padding: '6px 10px' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2.2"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9aabb8" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9aabb8" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9aabb8" strokeWidth="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
        </div>
      </div>
      {/* Nav bar */}
      <div style={{ background: '#3a4254', display: 'flex', alignItems: 'stretch', flexShrink: 0, overflowX: 'auto' }}>
        {navItems.map((item, i) => (
          <button key={i} style={{ padding: '8px 13px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 12.5, color: '#c8d4e0', whiteSpace: 'nowrap', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 3 }}>
            {item.label}{item.drop && <span style={{ fontSize: 10 }}>▾</span>}
          </button>
        ))}
      </div>
      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#fff' }}>
        {/* Form meta */}
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
        {/* Page tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #ddd', flexShrink: 0 }}>
          {pageTabs.map(tab => (
            <button key={tab} onClick={() => setActivePageTab(tab)} style={{
              flex: tab === 'PAGE 1' ? '0 0 200px' : 1,
              padding: '10px 12px', border: 'none', cursor: 'pointer', fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap',
              background: activePageTab === tab ? '#1e3a6e' : '#f0f2f5',
              color: activePageTab === tab ? '#fff' : '#555',
              borderRight: '1px solid #ddd',
            }}>{tab}</button>
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
          <div style={{ flex: 1 }} />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 13. NETSMART (myEvolv full-window view)
// ═══════════════════════════════════════════════════════════════════════════════
export function NetsmartBg({ noteValues = {}, onNoteChange, highlightedField }) {
  const [activeSide, setActiveSide] = useState('Therapy');
  const sideItems = ['Telehealth Confirmations', 'Therapy', 'Assessment Launch', 'Internal Tasks', 'Additional Information', 'Referral to Another Agency', 'Tasks/Schedules', 'Service Related Encounter Information'];
  const actionBtns = ['Save', 'Cancel', 'Delete', 'Print ▾', 'Send Alert', 'History', 'Refresh', 'Copy Test', 'Form Info', 'Save Draft'];
  const navTabs = ['myEvolv', 'Taskbar', 'Referral', 'Program', 'Client', 'People', 'Family', 'Incidents', 'Outreach', 'Groups', 'Resource', 'Finance', 'Agency', 'State', 'Reports', 'Setup'];

  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily: "'Segoe UI', Arial, sans-serif", fontSize: 13, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#e0e0e0' }}>
      {/* App header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', padding: '6px 16px', flexShrink: 0, gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, background: '#1a2b5e', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontWeight: 900, fontSize: 15, fontFamily: 'Georgia,serif' }}>W</span>
          </div>
          <span style={{ fontWeight: 700, fontSize: 14, color: '#222' }}>MyEvolv</span>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {[
            { label: 'Presenter Notes', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><rect x="3" y="4" width="18" height="16" rx="2"/><line x1="7" y1="9" x2="17" y2="9"/><line x1="7" y1="13" x2="17" y2="13"/></svg> },
            { label: 'Edit', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/></svg> },
            { label: 'Create Demos', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg> },
          ].map(b => (
            <button key={b.label} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 12, color: '#555', display: 'flex', alignItems: 'center', gap: 4 }}>{b.icon}{b.label}</button>
          ))}
          <button style={{ background: '#7c3aed', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: 6, padding: '5px 14px', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            Share
          </button>
        </div>
      </div>
      {/* Module nav bar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #ddd', display: 'flex', alignItems: 'stretch', flexShrink: 0, overflowX: 'auto' }}>
        {navTabs.map((tab, i) => (
          <button key={i} style={{ padding: '7px 12px', background: 'transparent', border: 'none', borderBottom: '3px solid transparent', cursor: 'pointer', fontSize: 12, color: '#555', whiteSpace: 'nowrap', flexShrink: 0 }}>{tab}</button>
        ))}
      </div>
      {/* Content: grey bg + modal */}
      <div style={{ flex: 1, background: '#d8d8d8', overflow: 'hidden', display: 'flex', padding: '6px 6px 6px 44px' }}>
        <div style={{ background: '#fff', border: '1px solid #bbb', boxShadow: '2px 4px 16px rgba(0,0,0,0.18)', display: 'flex', flexDirection: 'column', flex: 1, height: '100%' }}>
          <div style={{ background: '#f0f0f0', borderBottom: '1px solid #ddd', display: 'flex', alignItems: 'center', padding: '4px 8px', flexShrink: 0 }}>
            <span style={{ fontSize: 13, color: '#333', flex: 1 }}>Therapy (Individual and Family)</span>
            <div style={{ display: 'flex', gap: 2 }}>
              {['−', '□', '×'].map(c => (
                <button key={c} style={{ width: 20, height: 20, background: '#e8e8e8', border: '1px solid #ccc', borderRadius: 2, fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>{c}</button>
              ))}
            </div>
          </div>
          <div style={{ padding: '8px 12px', borderBottom: '1px solid #e8e8e8', display: 'flex', flexWrap: 'wrap', gap: 5, flexShrink: 0 }}>
            {actionBtns.map(b => (
              <button key={b} style={{ padding: '5px 16px', background: '#1f7068', color: '#fff', border: 'none', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }}>{b}</button>
            ))}
          </div>
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            <div style={{ width: 162, borderRight: '1px solid #e8e8e8', flexShrink: 0, overflowY: 'auto' }}>
              <div style={{ padding: '8px 12px 4px', fontWeight: 700, fontSize: 12, color: '#333' }}>Information</div>
              {sideItems.map(item => (
                <div key={item} onClick={() => setActiveSide(item)} style={{
                  padding: '6px 10px 6px 18px', fontSize: 12, cursor: 'pointer',
                  color: activeSide === item ? '#1f7068' : '#444',
                  fontWeight: activeSide === item ? 600 : 400,
                  background: activeSide === item ? '#f0faf9' : 'transparent',
                  borderLeft: activeSide === item ? '3px solid #1f7068' : '3px solid transparent',
                }}>{item}</div>
              ))}
            </div>
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
              <div style={{ flex: '0 0 58%', overflowY: 'auto', padding: '16px 20px' }}>
                <StackedFields noteValues={noteValues} onNoteChange={onNoteChange} highlightedField={highlightedField} labelColor='#666' fontSize={13} borderColor='#ccc' minHeight={170} borderRadius={4} />
              </div>
              <div style={{ width: 1, background: '#ddd', flexShrink: 0 }} />
              <div style={{ flex: 1 }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 14. PCE
// ═══════════════════════════════════════════════════════════════════════════════
export function PCEBg({ noteValues = {}, onNoteChange, highlightedField }) {
  const [activeIndex, setActiveIndex] = useState('Narrative');

  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily: 'Arial, sans-serif', fontSize: 13, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#fff' }}>
      {/* Top bar */}
      <div style={{ background: '#fff', borderBottom: '2px solid #cc3300', display: 'flex', alignItems: 'center', padding: '5px 10px', flexShrink: 0, gap: 4 }}>
        {['Back', 'Home', 'Logout', 'Help'].map(label => (
          <button key={label} style={{ background: '#cc3300', color: '#fff', border: 'none', borderRadius: 3, padding: '4px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>{label}</button>
        ))}
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.8"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22 6 12 13 2 6"/></svg>
        </button>
        <div style={{ flex: 1 }} />
        <span style={{ fontWeight: 700, fontSize: 14, color: '#222' }}>Change Behavioral Health Progress Note</span>
        <div style={{ flex: 1 }} />
      </div>
      {/* Patient info bar */}
      <div style={{ background: '#f5f5f5', borderBottom: '1px solid #ccc', display: 'flex', alignItems: 'stretch', padding: '8px 14px', gap: 16, flexShrink: 0, fontSize: 12 }}>
        {/* Left: DOB/Address */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 140 }}>
          <span style={{ color: '#333' }}><strong>Date of Birth</strong></span>
          <span style={{ color: '#333' }}><strong>Home Phone</strong></span>
          <span style={{ color: '#333' }}><strong>Address</strong></span>
        </div>
        {/* Current Admission box */}
        <div style={{ border: '1px solid #aaa', padding: '6px 10px', background: '#fff', minWidth: 200 }}>
          <div style={{ background: '#a8c4d8', fontWeight: 700, fontSize: 11, padding: '2px 6px', marginBottom: 6, textAlign: 'center' }}>Current Admission</div>
          {['Primary Org:', 'Primary Program:', 'Case Holder:'].map(label => (
            <div key={label} style={{ fontSize: 12, color: '#333', marginBottom: 2 }}><strong>{label}</strong></div>
          ))}
        </div>
        {/* Links */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px 24px', alignContent: 'start' }}>
          {[
            { label: 'Chart Documents', icon: '🗂️', color: '#2255aa' },
            { label: '1 Alert', icon: '⚠️', color: '#cc0000' },
            { label: 'Eligibility/Insurance', icon: '🧾', color: '#2255aa' },
            { label: 'Diagnosis', icon: '🔬', color: '#2255aa' },
            { label: 'Health/PHCP Info', icon: '❤️', color: '#2255aa' },
            { label: 'Clinical Decision Supports', icon: '💡', color: '#2255aa' },
            { label: 'Latest Clinical Documents', icon: '📋', color: '#2255aa' },
            { label: 'Assignments', icon: '📌', color: '#2255aa' },
            { label: 'Quality Measures', icon: '📊', color: '#2255aa' },
          ].map(item => (
            <a key={item.label} href="#" onClick={e => e.preventDefault()} style={{ fontSize: 12, color: item.color, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 11 }}>{item.icon}</span>{item.label}
            </a>
          ))}
        </div>
        {/* Case info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginLeft: 'auto', textAlign: 'right', minWidth: 180 }}>
          <span style={{ fontSize: 12, color: '#333' }}><strong>Case #:</strong> 000002</span>
          <span style={{ fontSize: 12, color: '#333' }}><strong>LOC/Grid:</strong> None</span>
          <span style={{ fontSize: 12 }}><strong>Case:</strong> <span style={{ color: '#2a7a2a', fontWeight: 700 }}>Open</span></span>
        </div>
      </div>
      {/* Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Index sidebar */}
        <div style={{ width: 160, flexShrink: 0, padding: '10px 8px' }}>
          <div style={{ border: '1px solid #888', overflow: 'hidden', borderRadius: 2 }}>
            <div style={{ background: '#5b8ab8', color: '#fff', fontWeight: 700, fontSize: 12, padding: '4px 8px', textAlign: 'center' }}>Index</div>
            {[
              { num: '1.', label: 'Narrative', link: false },
              { num: '2.', label: 'Send Copy To', link: true },
              { num: '3.', label: 'Signatures', link: true },
            ].map(item => (
              <div key={item.label} onClick={() => setActiveIndex(item.label)} style={{ padding: '5px 8px', background: activeIndex === item.label ? '#e8d8a0' : '#fff', cursor: 'pointer', fontSize: 12, borderTop: '1px solid #ddd', display: 'flex', gap: 4 }}>
                <span style={{ color: '#555' }}>{item.num}</span>
                {item.link ? <a href="#" onClick={e => e.preventDefault()} style={{ color: '#2255aa' }}>{item.label}</a> : <span style={{ color: '#333', fontWeight: 600 }}>{item.label}</span>}
              </div>
            ))}
          </div>
        </div>
        {/* Note area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', background: '#fff' }}>
          <StackedFields noteValues={noteValues} onNoteChange={onNoteChange} highlightedField={highlightedField} labelColor='#555' fontSize={13} borderColor='#ccc' minHeight={175} borderRadius={3} />
        </div>
        <div style={{ width: 1, background: '#ddd', flexShrink: 0 }} />
        <div style={{ flex: 1, background: '#fff' }} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 15. ELEOS LITE
// ═══════════════════════════════════════════════════════════════════════════════
export function EleosLiteBg({ noteValues = {}, onNoteChange, highlightedField }) {
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
                <div style={{ fontWeight: 700, fontSize: 13, color: '#1a2a3a' }}>Jacob Rosen</div>
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
export function StreamlineBg({ noteValues = {}, onNoteChange, highlightedField }) {
  const navItems = [
    { badge: 'AA', label: 'Access Assessment', arrow: false },
    { badge: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>, label: 'Psych/Med Documents', arrow: true },
    { badge: 'QO', label: 'Quick Orders', arrow: false },
    { badge: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>, label: 'Assessment/Screening Tools', arrow: true },
    { badge: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>, label: 'Clinical Documents', arrow: true },
    { badge: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>, label: 'Client Dashboard', arrow: false },
    { badge: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>, label: 'Client Chart', arrow: true },
    { badge: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>, label: 'Flow Sheet (Vitals)', arrow: false },
    { badge: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>, label: 'Consents', arrow: true },
    { badge: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><circle cx="12" cy="13" r="3"/></svg>, label: 'Medication Management (Rx)', arrow: false },
    { badge: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 9.81 19.79 19.79 0 0 1 1.61 1.18 2 2 0 0 1 3.6 0h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 7.91a16 16 0 0 0 6 6l.94-.94a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 15.18z"/></svg>, label: 'Referrals', arrow: true },
    { badge: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>, label: 'Releases and Disclosures', arrow: true },
    { badge: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3h18v18H3z"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>, label: 'Flags/Protocols/Events', arrow: true },
    { badge: 'B', label: 'Billing', arrow: true },
    { badge: 'D', label: 'Documents', arrow: true },
    { badge: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>, label: 'Inpatient/Residential', arrow: true },
    { badge: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>, label: 'Orders', arrow: true },
    { badge: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>, label: 'Primary Care', arrow: true },
    { badge: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>, label: 'SmartLinks', arrow: false },
  ];

  const actionIcons = [
    <svg key="more" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>,
    <svg key="check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>,
    <svg key="person" width="14" height="14" viewBox="0 0 24 24" fill="#1a3560" stroke="none"><circle cx="12" cy="8" r="5" fill="#1a3560"/><path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" fill="#1a3560"/></svg>,
    <svg key="star1" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    <svg key="star2" width="14" height="14" viewBox="0 0 24 24" fill="#f0c040" stroke="#f0c040" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    <svg key="cal1" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    <svg key="cal2" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="12" y1="14" x2="12" y2="18"/></svg>,
    <svg key="book" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
    <svg key="q" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    <svg key="info" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
    <svg key="trash" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
    <svg key="print" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>,
    <svg key="doc" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  ];

  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily: "'Segoe UI', Arial, sans-serif", fontSize: 13, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#fff' }}>
      {/* Top header bar */}
      <div style={{ background: '#fff', borderBottom: '2px solid #2ecc5a', display: 'flex', alignItems: 'center', padding: '0 12px', height: 38, flexShrink: 0, gap: 10 }}>
        {/* Hamburger */}
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#1a3560', display: 'flex', flexDirection: 'column', gap: 3 }}>
          {[0,1,2].map(i => <div key={i} style={{ width: 16, height: 2, background: '#1a3560', borderRadius: 1 }} />)}
        </button>
        {/* SmartCare logo */}
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1, marginRight: 8 }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: '#1a3560', letterSpacing: '-0.01em' }}>
            SmartCare<span style={{ color: '#2ecc5a', fontSize: 10 }}>™</span>
          </span>
          <span style={{ fontSize: 7.5, color: '#888', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Behavioral Health EHR</span>
        </div>
        {/* Search, star, person */}
        {[
          <svg key="s" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
          <svg key="st" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
          <svg key="p" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
        ].map((icon, i) => (
          <button key={i} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', display: 'flex', alignItems: 'center' }}>{icon}</button>
        ))}
        {/* Patient tab */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f0f4f8', border: '1px solid #dde4ee', borderRadius: 4, padding: '3px 10px', fontSize: 12.5, color: '#1a3560', fontWeight: 500 }}>
          <span>(1026)</span>
          <span style={{ background: '#2ecc5a', color: '#fff', borderRadius: 3, padding: '1px 5px', fontSize: 10, fontWeight: 700 }}>ASAM</span>
          {['T','T','T'].map((t,i) => <span key={i} style={{ fontSize: 11, fontWeight: 700, color: '#1a3560', marginLeft: 2 }}>{t}</span>)}
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </div>
        <div style={{ flex: 1 }} />
        {/* Right icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {[
            <div key="n1" style={{ position: 'relative' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.8"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
              <div style={{ position: 'absolute', top: -4, right: -4, background: '#e84040', color: '#fff', borderRadius: '50%', width: 13, height: 13, fontSize: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>3</div>
            </div>,
            <div key="n2" style={{ position: 'relative' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.8"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <div style={{ position: 'absolute', top: -4, right: -4, background: '#e84040', color: '#fff', borderRadius: '50%', width: 13, height: 13, fontSize: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>5</div>
            </div>,
            <svg key="clk" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
            <svg key="help" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
            <svg key="pwr" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.8"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>,
          ].map((icon, i) => (
            <button key={i} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}>{icon}</button>
          ))}
        </div>
      </div>
      {/* Action toolbar */}
      <div style={{ background: '#f0f4f8', borderBottom: '1px solid #dde4ee', display: 'flex', alignItems: 'center', padding: '3px 10px', height: 32, flexShrink: 0, gap: 6 }}>
        <span style={{ fontSize: 11, color: '#555', fontWeight: 600, marginRight: 2 }}>GoTo</span>
        {actionIcons.map((icon, i) => (
          <button key={i} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 3px', display: 'flex', alignItems: 'center' }}>{icon}</button>
        ))}
        <div style={{ flex: 1 }} />
        <button style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#1a3560', color: '#fff', border: 'none', borderRadius: 3, padding: '4px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
          Save
        </button>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px', fontSize: 14, color: '#888' }}>×</button>
      </div>
      {/* Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left sidebar */}
        <div style={{ width: 220, background: '#fff', borderRight: '1px solid #dde4ee', flexShrink: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {/* Tab icons */}
          <div style={{ display: 'flex', borderBottom: '1px solid #dde4ee', padding: '6px 12px', gap: 14 }}>
            {[
              <svg key="p" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1a3560" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
              <svg key="g" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
              <svg key="l" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
            ].map((icon, i) => <button key={i} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}>{icon}</button>)}
          </div>
          {/* Nav items */}
          {navItems.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 12px', borderBottom: '1px solid #f0f2f5', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f5f8ff'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 22, color: '#1a3560', fontSize: 11, fontWeight: 700 }}>{item.badge}</span>
              <span style={{ flex: 1, fontSize: 12.5, color: '#1a3560' }}>{item.label}</span>
              {item.arrow && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>}
            </div>
          ))}
        </div>
        {/* Note area */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <div style={{ flex: '0 0 60%', overflowY: 'auto', padding: '20px 24px', background: '#fff' }}>
            <StackedFields noteValues={noteValues} onNoteChange={onNoteChange} highlightedField={highlightedField} labelColor='#555' fontSize={13} borderColor='#dde4ee' minHeight={175} borderRadius={4} />
          </div>
          <div style={{ width: 1, background: '#dde4ee', flexShrink: 0 }} />
          <div style={{ flex: 1, background: '#fff' }} />
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
  qualifacts:   QualifactsBg,
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
  netsmart:     NetsmartBg,
  pce:          PCEBg,
  'eleos-lite': EleosLiteBg,
  streamline:   StreamlineBg,
};

export const EHR_LABELS = {
  welligent:    'Welligent',
  qualifacts:   'Qualifacts',
  arize:        'Arize',
  echo:         'Echo',
  credible:     'Credible',
  insync:       'Insync',
  carlogic:     'Carelogic',
  myevolve:     'myEvolv',
  myavatar:     'myAvatar',
  kipu:         'Kipu',
  foothold:     'Foothold',
  exym:         'Exym',
  netsmart:     'Netsmart',
  pce:          'PCE',
  'eleos-lite': 'Eleos Lite',
  streamline:   'Streamline',
};
