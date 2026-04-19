import React, { useState, useEffect, useRef } from 'react';
import { useEhrField } from './EhrFieldContext.jsx';

// ── Demo data ──────────────────────────────────────────────────────────────────

const OPEN_ITEMS = [
  { id: 0, title: 'Progress Mentioned',              detail: 'Note lacks specific progress documentation or goal indicators.' },
  { id: 1, title: 'Client Response to Intervention', detail: 'No client response documented after intervention.' },
  { id: 2, title: 'Compliant Plan',                  detail: 'Both criteria were not met: no next step or next appointment documented.' },
  { id: 3, title: 'Service Code Match',              detail: 'CPT 90847 (Family Therapy w/patient) listed but requires the partner/family member to be physically (or virtually) in the session. Suggested code is 90837 (60 Minute Individual Therapy).', custom: true },
];

// 7 standard rules that passed
const COMPLETED_ITEMS = [
  { label: 'Completeness',       custom: false },
  { label: 'Uniqueness',         custom: false },
  { label: 'Golden Thread',      custom: false },
  { label: 'Intervention Used',  custom: false },
];

const ALL_CLEAR_ITEMS = [
  { label: 'Completeness',                   custom: false },
  { label: 'Uniqueness',                     custom: false },
  { label: 'Progress Mentioned',             custom: false },
  { label: 'Golden Thread',                  custom: false },
  { label: 'Intervention Used',              custom: false },
  { label: 'Client Response to Intervention',custom: false },
  { label: 'Compliant Plan',                 custom: false },
  { label: 'Service Code Match',             custom: true  },
];

// ── Sub-components ─────────────────────────────────────────────────────────────

function CustomBadge() {
  return (
    <span style={{
      fontSize: 10, fontWeight: 600, color: '#7c3aed', background: '#f3f0ff',
      border: '1px solid #ddd6fe', borderRadius: 4, padding: '2px 6px',
      fontFamily: "'Poppins',sans-serif", letterSpacing: '0.02em', whiteSpace: 'nowrap',
    }}>
      Custom Rule
    </span>
  );
}

function ItemCard({ item, onDismiss }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px 8px', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a', fontFamily: "'Poppins',sans-serif" }}>{item.title}</span>
          {item.custom && <CustomBadge />}
        </div>
        <button
          onClick={() => onDismiss(item.id)}
          style={{ fontSize: 12, fontWeight: 500, color: '#888', background: '#f5f5f5', border: 'none', borderRadius: 6, padding: '3px 9px', cursor: 'pointer', fontFamily: "'Poppins',sans-serif", opacity: hovered ? 1 : 0, transition: 'opacity 0.15s', flexShrink: 0 }}
        >
          Dismiss
        </button>
      </div>
      <div style={{ background: '#eef1ff', margin: '0 10px 10px', borderRadius: 8, padding: '10px 12px' }}>
        <span style={{ fontSize: 13, color: '#555', lineHeight: 1.6, fontFamily: "'Poppins',sans-serif" }}>{item.detail}</span>
      </div>
    </div>
  );
}

function CheckItem({ label, custom }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: '1px solid #e8e8e8', borderRadius: 10, padding: '12px 14px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#e8f8ee', border: '1.5px solid #4caf50', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M5 13l4 4L19 7" stroke="#4caf50" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <span style={{ fontSize: 14, color: '#333', fontFamily: "'Poppins',sans-serif", flex: 1 }}>{label}</span>
      {custom && <CustomBadge />}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function LQAReview({ onAdvance, clientName = 'Larry Quinn', sessionLabel = 'Apr 15, 2026, 9:00 – 9:45 AM', autoRunAnalysis = false, onAutoRunConsumed }) {
  const ehrCtx = useEhrField();
  const lqaStatus = ehrCtx?.lqaStatus ?? 'idle';
  const changedSinceAnalysis = ehrCtx?.changedSinceAnalysis ?? false;
  const fieldValues = ehrCtx?.fieldValues ?? { data: '', assessment: '', plan: '' };

  const filledCount = Object.values(fieldValues).filter(v => v.trim()).length;
  const mostFilled = filledCount >= 2;

  // If opened via the inline LQA CTA, start straight in 'progress'; otherwise derive from saved status
  const [state, setState] = useState(() => {
    if (autoRunAnalysis) return 'progress';
    if (lqaStatus === 'issues') return 'results';
    if (lqaStatus === 'loading') return 'progress';
    return 'idle';
  });

  const [resultsVariant, setResultsVariant] = useState('issues');
  const [dismissed, setDismissed] = useState([]);
  const [openExpanded, setOpenExpanded] = useState(true);
  const [completedExpanded, setCompletedExpanded] = useState(false);
  const timerRef = useRef(null);

  // If opened via the inline CTA, kick off analysis immediately on mount
  useEffect(() => {
    if (autoRunAnalysis) {
      runAnalysis();
      onAutoRunConsumed?.();
    }
  }, []); // eslint-disable-line — intentional: run only once on mount

  // Sync if lqaStatus changes while panel is open
  useEffect(() => {
    if (lqaStatus === 'issues' && state !== 'results') setState('results');
    if (lqaStatus === 'loading' && state === 'idle') setState('progress');
  }, [lqaStatus]); // eslint-disable-line

  const visibleItems = OPEN_ITEMS.filter(item => !dismissed.includes(item.id));

  function runAnalysis() {
    setState('progress');
    if (ehrCtx) ehrCtx.setLqaStatus('loading');
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setState('results');
      setResultsVariant('issues');
      if (ehrCtx) ehrCtx.setLqaStatus('issues');
    }, 3400);
  }

  function reRunAnalysis() {
    setState('progress');
    if (ehrCtx) ehrCtx.setLqaStatus('loading');
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setState('results');
      setResultsVariant('allClear');
      if (ehrCtx) ehrCtx.setLqaStatus('idle');
    }, 2800);
  }

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: "'Poppins',sans-serif", background: '#fff', overflow: 'hidden' }}>
      <style>{`@keyframes lqaSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>

      {/* ── Header ── */}
      <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid #f0f0f0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <button
            onClick={onAdvance}
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', flexShrink: 0 }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="#212121" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <span style={{ fontSize: 18, fontWeight: 500, color: 'rgba(0,0,0,0.87)', fontFamily: "'Poppins',sans-serif", flex: 1, textAlign: 'center' }}>Note Quality</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'default', flexShrink: 0 }}>
            <svg width="25" height="24" viewBox="0 0 25 24" fill="none">
              <rect width="24" height="24" rx="12" fill="#EAEDFA"/>
              <path fillRule="evenodd" clipRule="evenodd" d="M12 6.66683C10.5272 6.66683 9.33333 7.86074 9.33333 9.3335C9.33333 10.8063 10.5272 12.0002 12 12.0002C13.4728 12.0002 14.6667 10.8063 14.6667 9.3335C14.6667 7.86074 13.4728 6.66683 12 6.66683ZM8 9.3335C8 7.12436 9.79086 5.3335 12 5.3335C14.2091 5.3335 16 7.12436 16 9.3335C16 11.5426 14.2091 13.3335 12 13.3335C9.79086 13.3335 8 11.5426 8 9.3335Z" fill="#2D4CCD"/>
              <path fillRule="evenodd" clipRule="evenodd" d="M7.75736 13.7574C8.88258 12.6321 10.4087 12 12 12C13.5913 12 15.1174 12.6321 16.2426 13.7574C17.3679 14.8826 18 16.4087 18 18C18 18.3682 17.7015 18.6667 17.3333 18.6667C16.9651 18.6667 16.6667 18.3682 16.6667 18C16.6667 16.7623 16.175 15.5753 15.2998 14.7002C14.4247 13.825 13.2377 13.3333 12 13.3333C10.7623 13.3333 9.57534 13.825 8.70017 14.7002C7.825 15.5753 7.33333 16.7623 7.33333 18C7.33333 18.3682 7.03486 18.6667 6.66667 18.6667C6.29848 18.6667 6 18.3682 6 18C6 16.4087 6.63214 14.8826 7.75736 13.7574Z" fill="#2D4CCD"/>
              <circle cx="22" cy="4" r="3" fill="#46BC9E"/>
            </svg>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2.5 4.5l3.5 3.5 3.5-3.5" stroke="#424242" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: '#888', fontFamily: "'Poppins',sans-serif" }}>{clientName}</div>
          <div style={{ fontSize: 13, color: '#aaa', fontFamily: "'Poppins',sans-serif" }}>{sessionLabel}</div>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ flex: 1, overflowY: 'auto' }}>

        {/* IDLE — few fields filled */}
        {state === 'idle' && !mostFilled && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '40px 24px', gap: 18, textAlign: 'center' }}>
            <div style={{ width: 84, height: 84, borderRadius: '50%', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="42" height="42" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L4 6v5c0 4.8 3.6 9.2 8 10.3C16.4 20.2 20 15.8 20 11V6l-8-4z" fill="#2D4CCD" opacity="0.15" />
                <path d="M12 2L4 6v5c0 4.8 3.6 9.2 8 10.3C16.4 20.2 20 15.8 20 11V6l-8-4z" stroke="#2D4CCD" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M9 12l2 2 4-4" stroke="#2D4CCD" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div style={{ fontSize: 19, fontWeight: 700, color: '#1a1a1a', fontFamily: "'Poppins',sans-serif" }}>Analyze your Note</div>
            <div style={{ fontSize: 14, color: '#888', fontFamily: "'Poppins',sans-serif", lineHeight: 1.6, maxWidth: 240 }}>
              Click "Check Note Quality" to start the analysis.
            </div>
          </div>
        )}

        {/* IDLE — most fields filled */}
        {state === 'idle' && mostFilled && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '40px 24px', gap: 18, textAlign: 'center' }}>
            <div style={{ width: 84, height: 84, borderRadius: '50%', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="42" height="42" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L4 6v5c0 4.8 3.6 9.2 8 10.3C16.4 20.2 20 15.8 20 11V6l-8-4z" fill="#2D4CCD" opacity="0.3" />
                <path d="M12 2L4 6v5c0 4.8 3.6 9.2 8 10.3C16.4 20.2 20 15.8 20 11V6l-8-4z" stroke="#2D4CCD" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M9 12l2 2 4-4" stroke="#2D4CCD" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div style={{ fontSize: 19, fontWeight: 700, color: '#1a1a1a', fontFamily: "'Poppins',sans-serif" }}>Note Ready</div>
            <div style={{ fontSize: 14, color: '#888', fontFamily: "'Poppins',sans-serif", lineHeight: 1.6, maxWidth: 240 }}>
              Your note looks good. Run quality analysis to check for any issues before submitting.
            </div>
          </div>
        )}

        {/* PROGRESS */}
        {state === 'progress' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '32px 20px', gap: 22, textAlign: 'center' }}>
            <div style={{ position: 'relative', width: 80, height: 80 }}>
              <svg width="80" height="80" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="32" fill="none" stroke="#e8edf8" strokeWidth="6" />
                <circle cx="40" cy="40" r="32" fill="none" stroke="#2D4CCD" strokeWidth="6"
                  strokeLinecap="round" strokeDasharray="55 146"
                  style={{ transformOrigin: 'center', animation: 'lqaSpin 1.3s linear infinite' }} />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L4 6v5c0 4.8 3.6 9.2 8 10.3C16.4 20.2 20 15.8 20 11V6l-8-4z" fill="#2D4CCD" />
                  <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 700, color: '#1a1a1a', fontFamily: "'Poppins',sans-serif", marginBottom: 6 }}>Analyzing your note...</div>
              <div style={{ fontSize: 13, color: '#888', fontFamily: "'Poppins',sans-serif" }}>This usually takes a few seconds</div>
            </div>
          </div>
        )}

        {/* RESULTS — issues */}
        {state === 'results' && resultsVariant === 'issues' && (
          <div>
            <div style={{ borderBottom: '1px solid #f0f0f0' }}>
              <div onClick={() => setOpenExpanded(!openExpanded)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', cursor: 'pointer' }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a', fontFamily: "'Poppins',sans-serif" }}>
                  Open Items <span>({visibleItems.length})</span>
                </span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ transform: openExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s', flexShrink: 0 }}>
                  <path d="M6 9l6 6 6-6" stroke="rgba(0,0,0,0.54)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              {openExpanded && (
                <div style={{ padding: '4px 14px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {visibleItems.length === 0
                    ? <div style={{ textAlign: 'center', fontSize: 14, color: '#888', fontFamily: "'Poppins',sans-serif", padding: '16px 0' }}>All items resolved!</div>
                    : visibleItems.map(item => <ItemCard key={item.id} item={item} onDismiss={id => setDismissed(d => [...d, id])} />)
                  }
                </div>
              )}
            </div>
            <div>
              <div onClick={() => setCompletedExpanded(!completedExpanded)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', cursor: 'pointer', borderBottom: completedExpanded ? '1px solid #f0f0f0' : 'none' }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a', fontFamily: "'Poppins',sans-serif" }}>
                  Completed <span>({COMPLETED_ITEMS.length})</span>
                </span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ transform: completedExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s', flexShrink: 0 }}>
                  <path d="M6 9l6 6 6-6" stroke="rgba(0,0,0,0.54)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              {completedExpanded && (
                <div style={{ padding: '4px 14px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {COMPLETED_ITEMS.map((item, i) => <CheckItem key={i} label={item.label} custom={item.custom} />)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* RESULTS — all clear */}
        {state === 'results' && resultsVariant === 'allClear' && (
          <div>
            <div style={{ borderBottom: '1px solid #f0f0f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px' }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a', fontFamily: "'Poppins',sans-serif" }}>Open Items <span>(0)</span></span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                  <path d="M6 9l6 6 6-6" stroke="rgba(0,0,0,0.54)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div style={{ padding: '0 14px 14px' }}>
                <div style={{ textAlign: 'center', fontSize: 14, color: '#888', fontFamily: "'Poppins',sans-serif", padding: '12px 0' }}>All items resolved!</div>
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #f0f0f0' }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a', fontFamily: "'Poppins',sans-serif" }}>Completed <span>({ALL_CLEAR_ITEMS.length})</span></span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ transform: 'rotate(180deg)', flexShrink: 0 }}>
                  <path d="M6 9l6 6 6-6" stroke="rgba(0,0,0,0.54)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div style={{ padding: '4px 14px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {ALL_CLEAR_ITEMS.map((item, i) => <CheckItem key={i} label={item.label} custom={item.custom} />)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div style={{ padding: '12px 16px 16px', borderTop: '1px solid #f0f0f0', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {state === 'results' && (
          <div style={{ width: '100%', height: 3, background: '#e0e4f7', borderRadius: 2, overflow: 'hidden', marginBottom: 2 }}>
            <div style={{
              height: '100%', borderRadius: 2,
              background: resultsVariant === 'allClear' ? 'linear-gradient(90deg, #16a34a, #4ade80)' : 'linear-gradient(90deg, #2D4CCD, #7B8EE8)',
              width: resultsVariant === 'allClear' ? '100%' : `${Math.round(COMPLETED_ITEMS.length / (COMPLETED_ITEMS.length + OPEN_ITEMS.length) * 100)}%`,
              transition: 'width 0.5s ease, background 0.5s ease',
            }} />
          </div>
        )}
        {state === 'idle' && (
          <button onClick={runAnalysis}
            style={{ width: '100%', height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#2d4ccd', border: 'none', borderRadius: 4, cursor: 'pointer', boxShadow: '0px 1px 5px rgba(0,0,0,0.12), 0px 2px 2px rgba(0,0,0,0.14), 0px 3px 1px -2px rgba(0,0,0,0.2)', fontFamily: "'Poppins',sans-serif", fontSize: 13, fontWeight: 500, color: 'white', letterSpacing: '0.46px' }}>
            Check Note Quality
          </button>
        )}
        {state === 'progress' && (
          <button disabled
            style={{ width: '100%', height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#2d4ccd', border: 'none', borderRadius: 4, cursor: 'not-allowed', opacity: 0.5, fontFamily: "'Poppins',sans-serif", fontSize: 13, fontWeight: 500, color: 'white', letterSpacing: '0.46px' }}>
            Analyzing...
          </button>
        )}
        {state === 'results' && resultsVariant === 'issues' && (
          <>
            <button
              onClick={changedSinceAnalysis ? reRunAnalysis : undefined}
              disabled={!changedSinceAnalysis}
              style={{
                width: '100%', height: 30, border: 'none', borderRadius: 4,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                fontFamily: "'Poppins',sans-serif", fontSize: 13, fontWeight: 500, letterSpacing: '0.46px',
                transition: 'background 0.2s, color 0.2s',
                ...(changedSinceAnalysis
                  ? { background: '#2d4ccd', color: 'white', cursor: 'pointer', boxShadow: '0px 1px 5px rgba(0,0,0,0.12), 0px 2px 2px rgba(0,0,0,0.14), 0px 3px 1px -2px rgba(0,0,0,0.2)' }
                  : { background: 'rgba(45,76,205,0.12)', color: '#2d4ccd', cursor: 'not-allowed' }
                ),
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                <path d="M4 4v5h5M20 20v-5h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4.93 14.94A8 8 0 1 0 6.34 6.34L4 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Re-Run Analysis
            </button>
            {!changedSinceAnalysis && (
              <div style={{ fontSize: 12, color: '#aaa', textAlign: 'center', fontFamily: "'Poppins',sans-serif" }}>
                Edit your note to enable re-analysis
              </div>
            )}
          </>
        )}
        {state === 'results' && resultsVariant === 'allClear' && (
          <button onClick={onAdvance}
            style={{ width: '100%', height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#2d4ccd', border: 'none', borderRadius: 4, cursor: 'pointer', boxShadow: '0px 1px 5px rgba(0,0,0,0.12), 0px 2px 2px rgba(0,0,0,0.14), 0px 3px 1px -2px rgba(0,0,0,0.2)', fontFamily: "'Poppins',sans-serif", fontSize: 13, fontWeight: 500, color: 'white', letterSpacing: '0.46px' }}>
            Mark as Submitted
          </button>
        )}
      </div>
    </div>
  );
}
