import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import DurationPill from '../../components/ui/DurationPill.jsx';
import '../../components/ui/DurationPill.css';
import { EhrFieldProvider, useEhrField } from '../../components/ui/EhrFieldContext.jsx';
import EnhancePointerToolbar from '../../components/enhance/EnhancePointerToolbar';
import LQAReview from '../../components/ui/LQAReview.jsx';
import { useEhrContext } from '../../contexts/EhrContext.jsx';
import { EHR_BACKGROUNDS } from '../../components/ehr/EhrBackgrounds.jsx';
import EhrSelector from '../../components/ehr/EhrSelector.jsx';
import NoteTypeSelector from '../../components/ehr/NoteTypeSelector.jsx';
import { useNoteTypeContext } from '../../contexts/NoteTypeContext.jsx';

const BAR_DELAYS = [0, 0.18, 0.09, 0.27, 0.36];

const DEMO_PROVIDER = { name: 'Tal Cohen', firstName: 'Tal' };

const BTN_W = 80; // grip(24) + circle(56)
const BTN_H = 56;

// ── Date helpers ──────────────────────────────────────────────────────────────
const MONTH_ABBREVS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return { month: MONTH_ABBREVS[d.getMonth()], day: String(d.getDate()) };
}

// Sessions shown in the "My Sessions" list
// New clients (today–4 days ago) appear first; existing clients follow (5–8 days ago)
const SESSION_LIST = [
  // ── New clients ──────────────────────────────────────────────────────────────
  { id: 'jake',      ...daysAgo(0), name: 'Jake Carol',             time: '10:00 – 10:45 AM',   type: 'individual', sessionType: 'audio',  noteType: 'Individual Audio',                  isActive: false, summary: 'Client discussed ongoing difficulties with interpersonal conflict at home. Identified triggers for reactive anger. Worked on pause-and-plan technique. Homework: log three instances of using the technique before next session.' },
  { id: 'jacob',     ...daysAgo(0), name: 'Jacob Rosen',            time: '2:00 – 2:45 PM',     type: 'individual', sessionType: 'text',  noteType: 'Progress Note',                       isActive: false, summary: 'Session addressed depressive symptoms and low motivation. Client reported minimal engagement in previously enjoyed activities. Behavioral activation plan updated — added two low-effort pleasant activities for the week.' },
  { id: 'larry',     ...daysAgo(1), name: 'Larry Quinn',            time: '9:00 – 9:45 AM',     type: 'individual', sessionType: 'audio', liveQA: true,  noteType: 'Individual Audio',           isActive: false, summary: 'Client presented with elevated anxiety related to upcoming retirement transition. Explored identity concerns and loss of structure. Began values clarification exercise; client to complete worksheet before next session.' },
  { id: 'calvin',    ...daysAgo(1), name: 'Calvin Murphy',          time: '11:00 – 11:45 AM',   type: 'individual', sessionType: 'text',  noteType: 'Case Management',                     isActive: false, summary: 'Follow-up on substance use triggers. Client reported one high-risk situation navigated successfully using HALT framework. Relapse prevention plan reinforced. Discussed building sober support network.' },
  { id: 'trisha',    ...daysAgo(2), name: 'Trisha Platts',          time: '1:00 – 1:45 PM',     type: 'individual', sessionType: 'text',  noteType: 'Treatment Plan',                      isActive: false, summary: 'Client discussed grief process following loss of mother six months ago. Complicated grief indicators present. Introduced dual process model. Client receptive — agreed to alternate between loss-oriented and restoration-oriented coping strategies.' },
  { id: 'anger-grp', ...daysAgo(2), name: 'Anger Management Group', time: '3:00 – 4:00 PM',     type: 'group',      sessionType: 'audio', groupSuggestions: 'single', noteType: 'Anger Management Group', isActive: false, summary: '7 members present. Reviewed cognitive restructuring techniques for anger triggers. Role-played de-escalation scenarios. Two members shared successful use of time-out strategy since last session. Group cohesion strong.' },
  { id: 'jacob-audio', ...daysAgo(3), name: 'Jacob Rosen',          time: '2:00 – 2:45 PM',     type: 'individual', sessionType: 'audio', noteType: 'Individual Audio',                     isActive: false, summary: 'Client discussed his relationship with his partner and the possibility of her moving back in. Explored codependency concerns in early recovery. Boundary setting and family therapy were discussed as next steps.' },
  { id: 'sud-grp',   ...daysAgo(3), name: 'SUD Group',              time: '10:00 – 11:00 AM',   type: 'group',      sessionType: 'audio', groupSuggestions: 'multiple', includesASAM: true, noteType: 'SUD Group', isActive: false, summary: '5 of 6 members attended. Topic: managing cravings in social settings. Members shared strategies including urge surfing and exit planning. One member disclosed a slip — group responded with support and non-judgment. Safety plan reviewed.' },
  { id: 'patricia',  ...daysAgo(3), name: 'Patricia Rodriguez',     time: '1:00 – 1:45 PM',     type: 'individual', sessionType: 'audio', specialty: 'psychiatry', noteType: 'Med Management', isActive: false, summary: 'Client reported increased anxiety following medication adjustment. Discussed somatic symptoms and their relationship to health anxiety. Introduced interoceptive exposure rationale. Client hesitant but willing to try graduated approach.' },
  { id: 'ashlyn',    ...daysAgo(4), name: 'Ashlyn Rivera',          time: '10:30 – 11:15 AM',   type: 'individual', sessionType: 'audio', noteType: 'Assessment',                          isActive: false, summary: 'Client discussed trauma-related avoidance. Identified two avoided situations linked to past trauma. Using CPT framework, began challenging stuck points around self-blame. Client tolerated emotional content well; no dissociation noted.' },
  // ── Existing clients ─────────────────────────────────────────────────────────
  { id: 'marcus',    ...daysAgo(5), name: 'Marcus Webb',            time: '10:00 – 10:45 AM',   type: 'individual', sessionType: 'text',                                                    isActive: true,  summary: 'Client reported significant work-related stress and anxiety around manager conflict. Avoidance patterns discussed; behavioral activation task assigned for the week.' },
  { id: 'priya',     ...daysAgo(6), name: 'Priya Nair',             time: '2:00 – 2:45 PM',     type: 'individual', sessionType: 'audio',                                                   isActive: false, summary: 'Reviewed progress on sleep hygiene goals. Client reports improvement — averaging 7 hrs/night. Discussed upcoming family visit as potential stressor. Coping strategies reviewed.' },
  { id: 'ryan',      ...daysAgo(6), name: 'Ryan Cho',               time: '4:00 – 4:45 PM',     type: 'individual', sessionType: 'text',                                                    isActive: false, summary: 'Session focused on distress tolerance skills. Client practiced TIPP technique in session. Reported two episodes of self-harm urges this week; safety plan reviewed and updated.' },
  { id: 'carmen',    ...daysAgo(7), name: 'Carmen Vega',            time: '1:30 – 2:15 PM',     type: 'individual', sessionType: 'text',                                                    isActive: false, summary: 'Follow-up on exposure hierarchy progress. Client completed 3 of 5 planned exposures. Reported SUDS peak of 65, returning to 20 within 15 min. Strong progress noted.' },
  { id: 'group-thu', ...daysAgo(8), name: 'Thursday AM Group',      time: '9:00 – 10:00 AM',    type: 'group',      sessionType: 'audio',                                                   isActive: false, summary: 'Group focused on interpersonal effectiveness. 6 of 8 members present. Discussion on boundary-setting in workplace relationships. Homework: identify one boundary to practice this week.' },
  { id: 'aisha',     ...daysAgo(8), name: 'Aisha Monroe',           time: '11:00 – 11:45 AM',   type: 'individual', sessionType: 'audio',                                                   isActive: false, summary: 'Initial assessment session. Client presenting with moderate depression following recent job loss. PHQ-9 score: 14. Treatment goals established. Weekly CBT sessions recommended.' },
];

// ── Root ─────────────────────────────────────────────────────────────────────

const SECTION_TO_NOTE_FIELD = { 'Data': 'Data/Goal:', 'Assessment': 'Assessment/Level of Participation:', 'Plan': 'Plan:' };
const INITIAL_NOTE_VALUES = {
  'Data/Goal:': "Client presented on time and appeared mildly anxious. Reported a difficult week at work — ongoing conflict with supervisor related to performance review. States he has been avoiding responding to manager's emails for 3 days. Identified this as a pattern consistent with prior sessions. Sleep disrupted, averaging 5 hrs/night. Denied SI/HI.",
  'Intervention/Response:': 'Utilized cognitive restructuring to examine evidence for/against belief that "any confrontation will end badly." Client was able to generate two alternative outcomes with prompting. Introduced behavioral activation — scheduled a 10-min draft email task for Wednesday.',
  'Assessment/Level of Participation:': 'Client engaged and motivated. Good insight into avoidance pattern. Moderate anxiety, improving from last session.',
  'Plan:': '',
};

export default function ClinicianScene({ step, onNext }) {
  const [sidebarOpen, setSidebarOpen] = useState(step > 0);
  const [isClosing, setIsClosing] = useState(false);
  const [btnPos, setBtnPos] = useState(() => ({ x: 16, y: window.innerHeight - BTN_H - 32 }));
  const [isRecording, setIsRecording] = useState(false);
  const [highlightedField, setHighlightedField] = useState(null);
  const sidebarSavedState = useRef(
    (() => { try { return JSON.parse(localStorage.getItem('eleos-sidebar-state') ?? 'null'); } catch { return null; } })()
  );
  const [sidebarStartTab, setSidebarStartTab] = useState(null);
  const noteTypeCtx = useNoteTypeContext();
  const noteValues = noteTypeCtx?.noteValues ?? INITIAL_NOTE_VALUES;
  const setNoteValues = (updater) => {
    if (!noteTypeCtx) return;
    const next = typeof updater === 'function' ? updater(noteTypeCtx.noteValues) : updater;
    Object.entries(next).forEach(([k, v]) => {
      if (noteTypeCtx.noteValues[k] !== v) noteTypeCtx.updateNoteValue(k, v);
    });
  };

  const handleAddToNote = (section, content, cardField) => {
    // Direct label/id match first
    let directSection = noteTypeCtx?.sections?.find(s => s.label === section || s.id === section);
    // Secondary: try the card's own field label (used when section is a group name like 'Progress Note')
    if (!directSection && cardField) {
      directSection = noteTypeCtx?.sections?.find(s => s.label === cardField || s.id === cardField);
    }
    // Fallback: eleosMapping translates generic 'Data','Assessment','Plan' → note-type-specific ids
    if (!directSection && noteTypeCtx?.eleosMapping?.[section]) {
      const mappedId = noteTypeCtx.eleosMapping[section];
      directSection = noteTypeCtx.sections.find(s => s.id === mappedId);
    }
    const field = directSection?.id ?? SECTION_TO_NOTE_FIELD[section];
    if (!field) return;
    noteTypeCtx.updateNoteValue(field, prev => prev ? prev + '\n\n' + content : content);
    setHighlightedField(field);
    setTimeout(() => setHighlightedField(null), 1800);
  };

  useEffect(() => { if (step > 0) setSidebarOpen(true); }, [step]);

  const handleCollapse = () => setIsClosing(true);
  const handleExitDone = () => { setIsClosing(false); setSidebarOpen(false); };
  const handleLaunch   = () => { if (step === 0) onNext(); setSidebarOpen(true); };

  const handleOpenQuality = () => {
    setSidebarStartTab('quality');
    if (step === 0) onNext();
    setSidebarOpen(true);
  };

  // Keep refs so event listeners always call the latest handler (avoids stale closure)
  const handleLaunchRef       = useRef(handleLaunch);
  const handleOpenQualityRef  = useRef(handleOpenQuality);
  useEffect(() => { handleLaunchRef.current = handleLaunch; });
  useEffect(() => { handleOpenQualityRef.current = handleOpenQuality; });

  // Listen for inline CTA events dispatched from EhrBackgrounds
  useEffect(() => {
    const onOpenQuality = () => handleOpenQualityRef.current();
    const onOpenSidebar = () => handleLaunchRef.current();
    window.addEventListener('eleos:openQuality', onOpenQuality);
    window.addEventListener('eleos:openSidebar', onOpenSidebar);
    return () => {
      window.removeEventListener('eleos:openQuality', onOpenQuality);
      window.removeEventListener('eleos:openSidebar', onOpenSidebar);
    };
  }, []); // eslint-disable-line

  // Sidebar bloom origin = center of the logo circle on screen
  const dotsOnRight = btnPos.x + 40 > window.innerWidth / 2;
  const originX = dotsOnRight ? btnPos.x + 28 : btnPos.x + 52;
  const originY = btnPos.y + 28;
  const sidebarOrigin = `${originX}px ${originY}px`;

  const sidebarWrapper = (anim, onEnd) => (
    // zIndex:10 is critical: the animation keeps transform:scale(1) applied via fill-mode:both,
    // which creates a stacking context. Without an explicit z-index that context sits at z=auto(0)
    // and loses to the portalled EnhancePointerToolbar (position:fixed, z=9 at root level).
    // Setting zIndex:10 here explicitly lifts the entire sidebar above all EHR-level floats.
    <div style={{ position: 'absolute', inset: 0, transformOrigin: sidebarOrigin, animation: anim, pointerEvents: 'none', zIndex: 10 }} onAnimationEnd={onEnd}>
      <EleosSidebar step={step} onNext={onNext} onCollapse={handleCollapse} initialPos={btnPos}
        savedState={sidebarSavedState.current}
        onSaveState={s => { sidebarSavedState.current = s; try { localStorage.setItem('eleos-sidebar-state', JSON.stringify(s)); } catch {} }}
        onRecordingChange={setIsRecording}
        onAddToNote={handleAddToNote}
        startTab={sidebarStartTab}
        onStartTabConsumed={() => setSidebarStartTab(null)} />
    </div>
  );

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <style>{`
        @keyframes lbPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(41,61,135,0.55), 0 4px 16px rgba(41,61,135,0.4); }
          50%       { box-shadow: 0 0 0 10px rgba(41,61,135,0), 0 4px 16px rgba(41,61,135,0.4); }
        }
        @keyframes lbFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-5px); }
        }
        @keyframes sidebarFromButton {
          from { transform: scale(0.04); opacity: 0; filter: blur(8px); }
          to   { transform: scale(1);    opacity: 1; filter: blur(0px); }
        }
        @keyframes sidebarToButton {
          from { transform: scale(1);    opacity: 1; filter: blur(0px); }
          to   { transform: scale(0.04); opacity: 0; filter: blur(8px); }
        }
      `}</style>
      <EhrFieldProvider sidebarOpen={sidebarOpen}>
        <EHRBackground noteValues={noteValues} onNoteChange={(field, val) => setNoteValues(prev => ({ ...prev, [field]: val }))} highlightedField={highlightedField} sidebarOpen={sidebarOpen} />
        {/* EnhancePointerToolbarWrapper removed — inline CTAs in StackedFields
            (Enhance button + LqaInlineCta) now cover the same functionality
            and the global toolbar was colliding with them visually */}
        {/* Demo controls tray — bottom-right, discrete but accessible */}
        <div style={{
          position: 'fixed', bottom: 20, right: 56, zIndex: 9,
          display: 'flex', gap: 4, alignItems: 'center',
          padding: '3px 4px',
          background: 'rgba(15,25,60,0.07)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderRadius: 16,
          border: '1px solid rgba(255,255,255,0.35)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        }}>
          <NoteTypeSelector />
          <div style={{ width: 1, height: 14, background: 'rgba(0,0,0,0.12)', borderRadius: 1 }} />
          <EhrSelector />
        </div>
        {(!sidebarOpen || step === 0) && !isClosing
          ? <CompanionLaunchButton pos={btnPos} onPosChange={setBtnPos} onNext={handleLaunch} onOpenQuality={handleOpenQuality} isRecording={isRecording} />
          : isClosing
            ? sidebarWrapper('sidebarToButton 0.5s cubic-bezier(0.4, 0, 1, 1) both', handleExitDone)
            : sidebarWrapper('sidebarFromButton 0.65s cubic-bezier(0.16, 1, 0.3, 1) both', null)
        }
      </EhrFieldProvider>
    </div>
  );
}

// ── Companion Launch Button (step 0) ─────────────────────────────────────────

function CompanionLaunchButton({ pos, onPosChange, onNext, onOpenQuality, isRecording }) {
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef(null);
  const dotsOnRight = pos.x + BTN_W / 2 > window.innerWidth / 2;
  const ehrCtx = useEhrField();
  const lqaStatus = ehrCtx?.lqaStatus ?? 'idle';

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y, moved: false };
    setIsDragging(true);
    e.preventDefault();
  };

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e) => {
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) dragRef.current.moved = true;
      onPosChange({
        x: Math.max(0, Math.min(window.innerWidth  - BTN_W, dragRef.current.origX + dx)),
        y: Math.max(0, Math.min(window.innerHeight - BTN_H, dragRef.current.origY + dy)),
      });
    };
    const onUp = () => {
      setIsDragging(false);
      if (!dragRef.current.moved) {
        if ((lqaStatus === 'loading' || lqaStatus === 'issues') && onOpenQuality) {
          onOpenQuality();
        } else {
          onNext();
        }
      }
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
  }, [isDragging, onPosChange, onNext, lqaStatus, onOpenQuality]);

  // ── LQA Pill (shown when analysis is loading or issues found) ─────────────────
  if (lqaStatus === 'loading' || lqaStatus === 'issues') {
    const pillY = Math.min(pos.y, window.innerHeight - 136 - 16);
    return (
      <div
        onMouseDown={handleMouseDown}
        style={{ position: 'absolute', left: pos.x, top: pillY, cursor: isDragging ? 'grabbing' : 'grab', userSelect: 'none' }}
      >
        <style>{`
          @keyframes lqaPillSpin { to { transform: rotate(360deg); } }
          @keyframes shieldPulse {
            0%, 100% { transform: scale(1);   opacity: 1; }
            50%       { transform: scale(1.18); opacity: 0.6; }
          }
        `}</style>
        {/* Dark navy pill */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 0, width: 68, height: 140, backgroundColor: '#293D87', borderRadius: 34,
          boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
          padding: '14px 0', boxSizing: 'border-box',
        }}>
          {/* Shield icon */}
          <div style={{ position: 'relative', width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.12)', animation: 'shieldPulse 2.2s ease-in-out infinite' }} />
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" style={{ position: 'relative', zIndex: 1 }}>
              <path d="M12 2L4 6V12C4 16.418 7.582 20 12 22C16.418 20 20 16.418 20 12V6L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 12L11 14L15 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {lqaStatus === 'loading' && (
              <div style={{ position: 'absolute', inset: -3, borderRadius: '50%', border: '2.5px solid rgba(255,255,255,0.15)', borderTopColor: 'rgba(255,255,255,0.8)', animation: 'lqaPillSpin 0.9s linear infinite', zIndex: 3 }} />
            )}
            <div style={{ position: 'absolute', top: 0, right: 0, width: 20, height: 20, borderRadius: '50%', background: '#ef4444', border: '2px solid #293D87', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4 }}>
              {lqaStatus === 'loading' ? (
                <>
                  <style>{`@keyframes lqaBadgePulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.7)} }`}</style>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'white', animation: 'lqaBadgePulse 1s ease-in-out infinite' }} />
                </>
              ) : (
                <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 10, fontWeight: 600, color: 'white', letterSpacing: 0 }}>4</span>
              )}
            </div>
          </div>
          {/* Divider */}
          <div style={{ width: 32, height: 1, backgroundColor: 'rgba(255,255,255,0.2)', margin: '12px 0' }} />
          {/* Eleos logo */}
          <div style={{ width: 52, height: 52, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative' }}>
            <div style={{ position: 'absolute', left: 10, top: 10, width: 32, height: 32, overflow: 'hidden' }}>
              <div style={{ position: 'absolute', left: 3.5, top: 8.22, width: 28, height: 23.6, transform: 'scale(0.92)', transformOrigin: 'top left' }}>
                <svg preserveAspectRatio="none" width="100%" height="100%" viewBox="0 0 30.5033 25.7853" fill="none">
                  <path d="M27.9823 0C28.4694 5.88909 25.3054 9.42663 22.7081 10.2626C16.7903 12.1669 13.7901 7.83483 9.17403 7.26932C1.30763 6.30559 -3.54613 16.2766 3.1921 21.9918C10.0791 27.8333 20.0077 26.3223 24.9222 21.5595C29.5399 17.4385 33.1218 8.53285 27.9823 0Z" fill="#FFC04C"/>
                </svg>
              </div>
              <div style={{ position: 'absolute', top: 0, left: 0, width: 31.53, height: 18.96, transform: 'scale(0.92)', transformOrigin: 'top left' }}>
                <svg preserveAspectRatio="none" width="100%" height="100%" viewBox="0 0 31.5283 18.9584" fill="none">
                  <path d="M10.7891 0.0561599C15.6169 -0.0632679 20.4725 -0.183465 24.4893 1.86573C26.9986 2.98914 30.1444 5.66978 31.4785 8.21827C31.9381 13.7921 29.1276 17.2593 26.623 18.3218C26.5899 18.3358 26.556 18.3493 26.5225 18.3628C26.4157 18.4056 26.3094 18.444 26.2041 18.478C25.3534 18.7518 24.563 18.8963 23.8193 18.9419C23.7044 18.9486 23.5878 18.9536 23.4697 18.9566C23.0252 18.9658 22.5969 18.9395 22.1826 18.8853C25.9545 14.634 22.7166 10.3872 18.8164 10.3872H8.5625C8.24862 10.3872 7.91718 10.2807 7.69043 10.0327C7.48118 9.80237 7.35938 9.48344 7.35938 9.16456C7.35939 8.8457 7.48119 8.52662 7.69043 8.29639C7.91713 8.06608 8.21355 7.92457 8.52734 7.90675H18.3281C18.5199 7.90674 18.6943 7.83542 18.8164 7.71143C18.9384 7.56983 19.0078 7.41013 19.0078 7.21534C19.0077 7.02073 18.9383 6.84313 18.8164 6.71925C18.6769 6.59534 18.5024 6.52492 18.3281 6.52491H11.0391C10.7078 6.50707 10.4104 6.36561 10.2012 6.13526C9.99195 5.90512 9.87013 5.58579 9.87012 5.2671C9.87012 4.94842 9.97462 4.62928 10.2012 4.39893C10.4279 4.1687 10.7252 4.02695 11.0391 4.00928H14.9277C15.1195 4.00923 15.294 3.9379 15.416 3.81397C15.5379 3.6724 15.6074 3.51263 15.6074 3.31788C15.6073 3.12346 15.5378 2.94664 15.416 2.82276C15.2765 2.69878 15.1021 2.62751 14.9277 2.62745H7.41113C7.23682 2.64506 7.06214 2.60926 6.90527 2.55616C6.74847 2.50302 6.59164 2.41439 6.46973 2.29053C6.34772 2.18435 6.26003 2.0428 6.17285 1.86573C6.10306 1.70626 6.06836 1.52911 6.06836 1.36964C6.06836 1.21017 6.10314 1.03295 6.17285 0.873543C6.24257 0.714152 6.34767 0.572694 6.46973 0.448738C6.59178 0.324802 6.74838 0.235386 6.90527 0.182137C7.0622 0.129094 7.23682 0.0940988 7.41113 0.111824C8.52796 0.111819 9.65805 0.0841381 10.7891 0.0561599ZM4.5 7.89698C5.18361 7.89712 5.73814 8.46038 5.73828 9.15479C5.73828 9.84932 5.18369 10.4125 4.5 10.4126C3.81611 10.4126 3.26172 9.84947 3.26172 9.15479C3.26186 8.46023 3.81626 7.89698 4.5 7.89698ZM1.23828 0.112801C1.92203 0.112881 2.47656 0.676044 2.47656 1.37061C2.47651 2.06513 1.922 2.62835 1.23828 2.62843C0.554438 2.62843 5.68931e-05 2.06524 0 1.37061C0 0.675936 0.55446 0.112801 1.23828 0.112801Z" fill="white"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Regular button (idle) ─────────────────────────────────────────────────────
  return (
    <div
      onMouseDown={handleMouseDown}
      style={{
        position: 'absolute',
        left: pos.x,
        top: pos.y,
        display: 'flex',
        flexDirection: dotsOnRight ? 'row-reverse' : 'row',
        alignItems: 'center',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
      }}
    >
      {/* Grip dots — exact Figma paths (10×18 viewBox, 2×3 navy circles) */}
      <div style={{ width: 24, height: 24, position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
        <div style={{ position: 'absolute', top: '16.67%', right: '33.33%', bottom: '16.67%', left: '33.33%' }}>
          <div style={{ position: 'absolute', top: '-6.25%', right: '-12.5%', bottom: '-6.25%', left: '-12.5%' }}>
            <svg preserveAspectRatio="none" width="100%" height="100%" overflow="visible" viewBox="0 0 10 18" fill="none">
              <path d="M2 10C2.55228 10 3 9.55228 3 9C3 8.44772 2.55228 8 2 8C1.44772 8 1 8.44772 1 9C1 9.55228 1.44772 10 2 10Z" stroke="#293D87" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 3C2.55228 3 3 2.55228 3 2C3 1.44772 2.55228 1 2 1C1.44772 1 1 1.44772 1 2C1 2.55228 1.44772 3 2 3Z" stroke="#293D87" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17C2.55228 17 3 16.5523 3 16C3 15.4477 2.55228 15 2 15C1.44772 15 1 15.4477 1 16C1 16.5523 1.44772 17 2 17Z" stroke="#293D87" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 10C8.55228 10 9 9.55228 9 9C9 8.44772 8.55228 8 8 8C7.44772 8 7 8.44772 7 9C7 9.55228 7.44772 10 8 10Z" stroke="#293D87" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 3C8.55228 3 9 2.55228 9 2C9 1.44772 8.55228 1 8 1C7.44772 1 7 1.44772 7 2C7 2.55228 7.44772 3 8 3Z" stroke="#293D87" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 17C8.55228 17 9 16.5523 9 16C9 15.4477 8.55228 15 8 15C7.44772 15 7 15.4477 7 16C7 16.5523 7.44772 17 8 17Z" stroke="#293D87" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Logo circle — 56×56 navy with inner shadow + exact logo overlay */}
      <div style={{ width: 56, height: 56, position: 'relative', flexShrink: 0, marginRight: -2, borderRadius: '50%', animation: 'lbFloat 3s ease-in-out infinite, lbPulse 3s ease-in-out infinite' }}>
        {/* Background circle with Figma inner shadow (dy:-4, opacity:0.25) */}
        <svg width="56" height="56" viewBox="0 0 56 56" fill="none" style={{ position: 'absolute', top: 0, left: 0 }}>
          <defs>
            <filter id="lbInnerShadow" x="0" y="0" width="56" height="56" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix"/>
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
              <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
              <feOffset dy="-4"/>
              <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
              <feBlend mode="normal" in2="shape" result="effect1_innerShadow"/>
            </filter>
          </defs>
          <circle cx="28" cy="28" r="28" fill="#293D87" filter="url(#lbInnerShadow)"/>
        </svg>

        {isRecording ? (
          /* Green waveform bars — 5 bars bouncing at staggered delays */
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
            <style>{`
              @keyframes lbWave {
                0%, 100% { transform: scaleY(0.25); }
                50%       { transform: scaleY(1); }
              }
            `}</style>
            {[0, 0.18, 0.36, 0.18, 0].map((delay, i) => (
              <div key={i} style={{
                width: 3, height: 16, borderRadius: 2,
                background: 'rgba(255,255,255,0.7)',
                transformOrigin: 'center',
                animation: `lbWave 1.1s ease-in-out ${delay}s infinite`,
              }} />
            ))}
          </div>
        ) : (
          /* _CTA Logo: 34×34 container, centered at x=11, y=13 of 56×56 circle */
          <div style={{ position: 'absolute', left: 11, top: 13, width: 34, height: 34, overflow: 'hidden' }}>
            {/* Flame (gold #FFC04C) — 30.503×25.785, left=3.5, top=8.22 */}
            <div style={{ position: 'absolute', left: 3.5, top: 8.22, width: 30.503, height: 25.785 }}>
              <svg preserveAspectRatio="none" width="100%" height="100%" viewBox="0 0 30.5033 25.7853" fill="none">
                <path d="M27.9823 0C28.4694 5.88909 25.3054 9.42663 22.7081 10.2626C16.7903 12.1669 13.7901 7.83483 9.17403 7.26932C1.30763 6.30559 -3.54613 16.2766 3.1921 21.9918C10.0791 27.8333 20.0077 26.3223 24.9222 21.5595C29.5399 17.4385 33.1218 8.53285 27.9823 0Z" fill="#FFC04C"/>
              </svg>
            </div>
            {/* Union (white Eleos mark) — top:0 left:0, 31.53×18.96 */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: 31.53, height: 18.96 }}>
              <svg preserveAspectRatio="none" width="100%" height="100%" viewBox="0 0 31.5283 18.9584" fill="none">
                <path d="M10.7891 0.0561599C15.6169 -0.0632679 20.4725 -0.183465 24.4893 1.86573C26.9986 2.98914 30.1444 5.66978 31.4785 8.21827C31.9381 13.7921 29.1276 17.2593 26.623 18.3218C26.5899 18.3358 26.556 18.3493 26.5225 18.3628C26.4157 18.4056 26.3094 18.444 26.2041 18.478C25.3534 18.7518 24.563 18.8963 23.8193 18.9419C23.7044 18.9486 23.5878 18.9536 23.4697 18.9566C23.0252 18.9658 22.5969 18.9395 22.1826 18.8853C25.9545 14.634 22.7166 10.3872 18.8164 10.3872H8.5625C8.24862 10.3872 7.91718 10.2807 7.69043 10.0327C7.48118 9.80237 7.35938 9.48344 7.35938 9.16456C7.35939 8.8457 7.48119 8.52662 7.69043 8.29639C7.91713 8.06608 8.21355 7.92457 8.52734 7.90675H18.3281C18.5199 7.90674 18.6943 7.83542 18.8164 7.71143C18.9384 7.56983 19.0078 7.41013 19.0078 7.21534C19.0077 7.02073 18.9383 6.84313 18.8164 6.71925C18.6769 6.59534 18.5024 6.52492 18.3281 6.52491H11.0391C10.7078 6.50707 10.4104 6.36561 10.2012 6.13526C9.99195 5.90512 9.87013 5.58579 9.87012 5.2671C9.87012 4.94842 9.97462 4.62928 10.2012 4.39893C10.4279 4.1687 10.7252 4.02695 11.0391 4.00928H14.9277C15.1195 4.00923 15.294 3.9379 15.416 3.81397C15.5379 3.6724 15.6074 3.51263 15.6074 3.31788C15.6073 3.12346 15.5378 2.94664 15.416 2.82276C15.2765 2.69878 15.1021 2.62751 14.9277 2.62745H7.41113C7.23682 2.64506 7.06214 2.60926 6.90527 2.55616C6.74847 2.50302 6.59164 2.41439 6.46973 2.29053C6.34772 2.18435 6.26003 2.0428 6.17285 1.86573C6.10306 1.70626 6.06836 1.52911 6.06836 1.36964C6.06836 1.21017 6.10314 1.03295 6.17285 0.873543C6.24257 0.714152 6.34767 0.572694 6.46973 0.448738C6.59178 0.324802 6.74838 0.235386 6.90527 0.182137C7.0622 0.129094 7.23682 0.0940988 7.41113 0.111824C8.52796 0.111819 9.65805 0.0841381 10.7891 0.0561599ZM4.5 7.89698C5.18361 7.89712 5.73814 8.46038 5.73828 9.15479C5.73828 9.84932 5.18369 10.4125 4.5 10.4126C3.81611 10.4126 3.26172 9.84947 3.26172 9.15479C3.26186 8.46023 3.81626 7.89698 4.5 7.89698ZM1.23828 0.112801C1.92203 0.112881 2.47656 0.676044 2.47656 1.37061C2.47651 2.06513 1.922 2.62835 1.23828 2.62843C0.554438 2.62843 5.68931e-05 2.06524 0 1.37061C0 0.675936 0.55446 0.112801 1.23828 0.112801Z" fill="white"/>
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── EnhancePointerToolbar — global quality-check shield ──────────────────────

function EnhancePointerToolbarWrapper() {
  const { selectedEhr } = useEhrContext();
  const ehrCtx = useEhrField();
  return (
    <EnhancePointerToolbar
      selectedEhr={selectedEhr}
      onCheckQuality={() => ehrCtx?.triggerQualityCheck?.()}
      outstandingCount={ehrCtx?.lqaStatus === 'issues' ? 3 : 0}
      showBadge={ehrCtx?.lqaStatus === 'issues'}
    />
  );
}

// ── EHR Background — context-driven dispatcher ───────────────────────────────

function EHRBackground({ noteValues = INITIAL_NOTE_VALUES, onNoteChange, highlightedField, sidebarOpen }) {
  const { selectedEhr } = useEhrContext();
  const Bg = EHR_BACKGROUNDS[selectedEhr] ?? EHR_BACKGROUNDS.welligent;
  return <Bg noteValues={noteValues} onNoteChange={onNoteChange} highlightedField={highlightedField} sidebarOpen={sidebarOpen} />;
}

function EHRDropdownGrid() {
  const FIELDS = ['Suicidal Ideation Present:', 'Homicidal Ideation Present:', 'Safety Concerns Present:'];
  const [values, setValues] = useState({ 'Suicidal Ideation Present:': 'No', 'Homicidal Ideation Present:': 'No', 'Safety Concerns Present:': 'No' });
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderTop: '1px solid #ddd', marginTop: 4 }}>
      {FIELDS.map(label => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', padding: '6px 8px', borderBottom: '1px solid #ddd', borderRight: '1px solid #ddd' }}>
          <span style={{ flex: 1, color: '#333', fontSize: 11 }}>{label}</span>
          <select
            value={values[label]}
            onChange={e => setValues(prev => ({ ...prev, [label]: e.target.value }))}
            style={{ border: '1px solid #aaa', borderRadius: 2, padding: '1px 4px', background: '#fff', fontSize: 11, color: values[label] === 'Yes' ? '#c0392b' : '#333', cursor: 'pointer', outline: 'none', fontFamily: 'Arial, sans-serif' }}
          >
            <option value="No">No</option>
            <option value="Yes">Yes</option>
            <option value="Unknown">Unknown</option>
          </select>
        </div>
      ))}
    </div>
  );
}

function EHRSection({ title, icon, children }) {
  return (
    <div style={{ borderBottom: '1px solid #bbb' }}>
      <div style={{ background: '#d6eaf8', padding: '4px 8px', fontWeight: 'bold', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, borderBottom: '1px solid #bbb' }}>
        <span style={{ fontSize: 10 }}>{icon}</span> {title}
      </div>
      {children}
    </div>
  );
}

// Field key mapping: long label → short context key (DAP only)
const DAP_FIELD_MAP = {
  'Data/Goal:': 'data',
  'Assessment/Level of Participation:': 'assessment',
  'Plan:': 'plan',
};

function NoteSection({ noteValues, onNoteChange, highlightedField }) {
  const ehrCtx = useEhrField();

  const handleFocus = (label) => {
    if (!ehrCtx) return;
    const key = DAP_FIELD_MAP[label];
    if (!key) return;
    const dapValues = {
      data: noteValues['Data/Goal:'] || '',
      assessment: noteValues['Assessment/Level of Participation:'] || '',
      plan: noteValues['Plan:'] || '',
    };
    const emptyKeys = Object.keys(dapValues).filter(k => !dapValues[k].trim());
    if (emptyKeys.length === 1 && emptyKeys[0] === key && ehrCtx.lqaStatus === 'idle') {
      ehrCtx.setLqaStatus('loading');
      setTimeout(() => ehrCtx.setLqaStatus('issues'), 2800);
    }
  };

  // Sync DAP fields into EhrFieldContext so the dirty-check can detect edits
  const handleChange = (label, val) => {
    onNoteChange?.(label, val);
    const key = DAP_FIELD_MAP[label];
    if (key && ehrCtx) {
      ehrCtx.setFieldValues(prev => ({ ...prev, [key]: val }));
    }
  };

  return (
    <div style={{ padding: '0 10px 12px' }}>
      <NoteField label="Data/Goal:" fieldKey="data" height={80} value={noteValues['Data/Goal:']} onChange={v => handleChange('Data/Goal:', v)} onFocus={() => handleFocus('Data/Goal:')} highlighted={highlightedField === 'Data/Goal:'} />
      <NoteField label="Intervention/Response:" fieldKey="intervention" height={72} value={noteValues['Intervention/Response:']} onChange={v => onNoteChange?.('Intervention/Response:', v)} highlighted={highlightedField === 'Intervention/Response:'} />
      <NoteField label="Assessment/Level of Participation:" fieldKey="assessment" height={60} value={noteValues['Assessment/Level of Participation:']} onChange={v => handleChange('Assessment/Level of Participation:', v)} onFocus={() => handleFocus('Assessment/Level of Participation:')} highlighted={highlightedField === 'Assessment/Level of Participation:'} />
      <EHRDropdownGrid />
      <NoteField label="Plan:" fieldKey="plan" height={56} value={noteValues['Plan:']} onChange={v => handleChange('Plan:', v)} onFocus={() => handleFocus('Plan:')} highlighted={highlightedField === 'Plan:'} placeholder="Continue weekly individual therapy. Client to complete behavioral activation task before next session..." />
    </div>
  );
}

function NoteField({ label, height, value = '', onChange, onFocus, placeholder, highlighted }) {
  const remaining = 30000 - value.length;

  return (
    <div style={{ borderBottom: '1px solid #ddd', display: 'flex', transition: 'background 0.3s', background: highlighted ? '#fffde7' : 'transparent' }}>
      <div style={{ width: 200, padding: '6px 8px', color: '#333', borderRight: '1px solid #ddd', flexShrink: 0, fontSize: 11 }}>{label}</div>
      <div style={{ flex: 1, position: 'relative' }}>
        <textarea
          value={value}
          onChange={e => onChange?.(e.target.value)}
          onFocus={onFocus}
          placeholder={placeholder || ''}
          style={{ width: '100%', height, padding: '5px 6px', fontSize: 11, color: '#111', lineHeight: 1.5, resize: 'none', border: 'none', outline: 'none', background: 'transparent', fontFamily: 'Arial, sans-serif', boxSizing: 'border-box' }}
        />
        <div style={{ position: 'absolute', bottom: 2, right: 6, color: '#e74c3c', fontSize: 10, pointerEvents: 'none' }}>* {remaining.toLocaleString()} Characters Left</div>
      </div>
    </div>
  );
}

// ── Eleos Sidebar (main) ──────────────────────────────────────────────────────

const SIDEBAR_BOTTOM_GAP = 16;

function EleosSidebar({ step, onNext, onCollapse, initialPos, savedState, onSaveState, onRecordingChange, onAddToNote, startTab, onStartTabConsumed }) {
  const ehrCtx = useEhrField();
  const noteTypeCtx = useNoteTypeContext();
  const { setClientName } = useEhrContext();

  // Bridge: when noteValues change after analysis completes, mark as dirty so Re-Run Analysis enables
  useEffect(() => {
    if (ehrCtx?.lqaStatus === 'issues') {
      ehrCtx.setChangedSinceAnalysis(true);
    }
  }, [noteTypeCtx?.noteValues]); // eslint-disable-line

  const [navTab, setNavTab] = useState(() => startTab ?? savedState?.navTab ?? 'activities'); // active nav rail tab
  const [phase, setPhase] = useState(() => savedState?.phase ?? 'sessions');     // sub-phase within activities
  const [ending, setEnding] = useState(false);
  const [capturePhase, setCapturePhase] = useState(() => savedState?.capturePhase ?? null); // null | 'recording' | 'done'
  const [captureSession, setCaptureSession] = useState(() => savedState?.captureSession ?? { name: 'James Edwards', dateTime: 'Apr 2, 2026, 10:30 AM' });
  const [activitiesSession, setActivitiesSession] = useState(null); // session selected for suggestions in activities flow
  // Lifted from MySessionsPanel so CTA in AddSummary can move a session to Marked as Done
  const [doneIds, setDoneIds] = useState(INITIAL_DONE_IDS);
  const [activitiesInitialTab, setActivitiesInitialTab] = useState('ehr'); // which tab MySessionsPanel opens on
  const [autoRunQuality, setAutoRunQuality] = useState(false); // triggers immediate analysis when Quality tab opens
  // Sessions dynamically added from the Add Summary flow
  const [addedSessions, setAddedSessions] = useState([]);
  // Session currently being worked on in Add Summary (set when suggestions phase is reached)
  const [pendingEHRSession, setPendingEHRSession] = useState(null);

  // ── Drag & resize state ─────────────────────────────────────────────────────
  const G = SIDEBAR_BOTTOM_GAP; // uniform edge gap: top / right / bottom / left
  const SIDEBAR_W_MIN = 320;
  const SIDEBAR_W_MAX = 600;
  const [sidebarW, setSidebarW] = useState(() => savedState?.sidebarW ?? 467);
  const [posX, setPosX] = useState(() => {
    if (savedState?.posX != null) return savedState.posX;
    if (!initialPos) return G;
    return Math.max(G, Math.min(window.innerWidth - (savedState?.sidebarW ?? 467) - G, initialPos.x));
  });
  const [posY, setPosY] = useState(() => {
    if (savedState?.posY != null) return savedState.posY;
    const initH = savedState?.sidebarH ?? Math.round(window.innerHeight * 0.7);
    if (!initialPos) return window.innerHeight - initH - G;
    return Math.max(G, Math.min(window.innerHeight - initH - G, initialPos.y));
  });
  const [side, setSide] = useState(() => {
    if (savedState?.side) return savedState.side;
    const x = initialPos ? Math.max(G, Math.min(window.innerWidth - (savedState?.sidebarW ?? 467) - G, initialPos.x)) : G;
    return (x + (savedState?.sidebarW ?? 467) / 2) < window.innerWidth / 2 ? 'left' : 'right';
  });
  const [sidebarH, setSidebarH] = useState(() => savedState?.sidebarH ?? Math.round(window.innerHeight * 0.7));
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isWidthResizing, setIsWidthResizing] = useState(false);
  const [showOverflow, setShowOverflow] = useState(false);
  const dragRef = useRef(null);
  const resizeRef = useRef(null);
  const widthResizeRef = useRef(null);
  const posXRef = useRef(posX);
  const posYRef = useRef(posY);
  const sidebarHRef = useRef(sidebarH);
  const sidebarWRef = useRef(sidebarW);
  posXRef.current = posX;
  posYRef.current = posY;
  sidebarHRef.current = sidebarH;
  sidebarWRef.current = sidebarW;

  // ── Nav overflow calculation ─────────────────────────────────────────────────
  // With labels: item≈64px, fixed≈267px. Without labels: item≈40px, fixed≈220px.
  const compactMode = sidebarW < 380;
  const showNavLabels = sidebarH >= 480 && !compactMode;
  const ITEM_H = showNavLabels ? 64 : 40;
  const RAIL_FIXED_H = showNavLabels ? 267 : 220;
  const ALL_NAV_KEYS = ['activities', 'summary', 'capture', 'clients', 'quality'];
  const maxVisible = Math.min(ALL_NAV_KEYS.length, Math.max(0, Math.floor((sidebarH - RAIL_FIXED_H) / ITEM_H)));
  const visibleNavItems = ALL_NAV_KEYS.slice(0, maxVisible);
  const overflowNavItems = ALL_NAV_KEYS.slice(maxVisible);

  useEffect(() => {
    const onMove = (e) => {
      if (dragRef.current) {
        const dx = e.clientX - dragRef.current.startMouseX;
        const dy = e.clientY - dragRef.current.startMouseY;
        const newX = Math.max(G, Math.min(window.innerWidth - sidebarWRef.current - G, dragRef.current.origX + dx));
        const newY = Math.max(G, Math.min(window.innerHeight - sidebarHRef.current - G, dragRef.current.origY + dy));
        setPosX(newX);
        setPosY(newY);
        setSide((newX + sidebarWRef.current / 2) < window.innerWidth / 2 ? 'left' : 'right');
      }
      if (resizeRef.current) {
        // dragging up → negative dy → increase height; keep bottom edge fixed
        const dy = e.clientY - resizeRef.current.startMouseY;
        const newH = Math.max(200, Math.min(window.innerHeight - G - G, resizeRef.current.origH - dy));
        const bottomEdge = resizeRef.current.origY + resizeRef.current.origH;
        setSidebarH(newH);
        setPosY(Math.max(G, bottomEdge - newH));
      }
      if (widthResizeRef.current) {
        const { edge, startMouseX, origW, origX } = widthResizeRef.current;
        const dx = e.clientX - startMouseX;
        if (edge === 'left') {
          // Right edge fixed → dragging left widens
          const newW = Math.max(SIDEBAR_W_MIN, Math.min(SIDEBAR_W_MAX, origW - dx));
          const rightEdge = origX + origW;
          const newX = Math.max(G, Math.min(window.innerWidth - SIDEBAR_W_MIN - G, rightEdge - newW));
          setSidebarW(newW);
          setPosX(newX);
        } else {
          // Left edge fixed → dragging right widens
          const newW = Math.max(SIDEBAR_W_MIN, Math.min(SIDEBAR_W_MAX, origW + dx));
          setSidebarW(newW);
          const clampedX = Math.max(G, Math.min(window.innerWidth - newW - G, posXRef.current));
          setPosX(clampedX);
        }
      }
    };
    const onUp = () => {
      if (dragRef.current)       { dragRef.current = null;       setIsDragging(false); }
      if (resizeRef.current)     { resizeRef.current = null;     setIsResizing(false); }
      if (widthResizeRef.current){ widthResizeRef.current = null; setIsWidthResizing(false); }
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, []);

  const handleMouseDown = (e) => {
    // Don't start drag when clicking on any interactive element
    let el = e.target;
    while (el && el !== e.currentTarget) {
      if (['BUTTON', 'INPUT', 'A', 'SELECT', 'TEXTAREA'].includes(el.tagName)) return;
      if (el.style && el.style.cursor === 'pointer') return;
      if (el.dataset && el.dataset.resizeHandle) return;
      el = el.parentElement;
    }
    dragRef.current = { startMouseX: e.clientX, startMouseY: e.clientY, origX: posXRef.current, origY: posYRef.current };
    setIsDragging(true);
    e.preventDefault();
  };

  const handleResizeMouseDown = (e) => {
    e.stopPropagation();
    resizeRef.current = { startMouseY: e.clientY, origH: sidebarHRef.current, origY: posYRef.current };
    setIsResizing(true);
    e.preventDefault();
  };

  const handleLeftResizeMouseDown = (e) => {
    e.stopPropagation(); e.preventDefault();
    widthResizeRef.current = { edge: 'left', startMouseX: e.clientX, origW: sidebarWRef.current, origX: posXRef.current };
    setIsWidthResizing(true);
  };

  const handleRightResizeMouseDown = (e) => {
    e.stopPropagation(); e.preventDefault();
    widthResizeRef.current = { edge: 'right', startMouseX: e.clientX, origW: sidebarWRef.current, origX: posXRef.current };
    setIsWidthResizing(true);
  };

  // ── State persistence ────────────────────────────────────────────────────────
  const stateRef = useRef(null);
  stateRef.current = { navTab, phase, capturePhase, captureSession, sidebarW, posX: posXRef.current, posY: posYRef.current, sidebarH: sidebarHRef.current, side };
  // Save state to parent on unmount so it survives close→reopen
  useEffect(() => () => { onSaveState?.(stateRef.current); }, []);
  // Bubble recording status to parent (for launch button indicator)
  useEffect(() => { onRecordingChange?.(capturePhase === 'recording'); }, [capturePhase]);

  // ── Existing logic ──────────────────────────────────────────────────────────

  // Reset to activities/sessions when we advance to step=1 from a different step
  const prevStepRef = useRef(null);
  useEffect(() => {
    const prevStep = prevStepRef.current;
    prevStepRef.current = step;
    // Only reset when step transitions TO 1 (not on initial mount from saved state)
    if (step === 1 && prevStep !== null && prevStep !== step) {
      setNavTab('activities'); setPhase('sessions'); setEnding(false);
      setCapturePhase(null); setCaptureSession({ name: 'James Edwards', dateTime: 'Apr 2, 2026, 10:30 AM' });
    }
  }, [step]);

  // Auto-advance 1.5s after "End Session" clicked
  useEffect(() => {
    if (!ending) return;
    const t = setTimeout(onNext, 1500);
    return () => clearTimeout(t);
  }, [ending, onNext]);

  const handleNavClick = (tab) => {
    // Leaving Add Summary while suggestions are pending → add entry to "Add to EHR"
    if (navTab === 'summary' && tab !== 'summary' && pendingEHRSession) {
      setAddedSessions(prev => [pendingEHRSession, ...prev]);
      setPendingEHRSession(null);
      setActivitiesInitialTab('ehr');
    }
    if (tab === 'capture') {
      setNavTab('capture');
      // Don't reset to form if recording is active — go back to the in-progress view
      if (capturePhase !== 'recording') setPhase('form');
    } else {
      // Manual nav to Activities always opens on Add to EHR (CTA nav sets 'done' programmatically)
      if (tab === 'activities') setActivitiesInitialTab('ehr');
      setNavTab(tab);
      setPhase('sessions');
    }
    // Clicking quality tab auto-triggers analysis if not already running
    if (tab === 'quality' && ehrCtx && ehrCtx.lqaStatus === 'idle') {
      ehrCtx.setLqaStatus('loading');
      setTimeout(() => ehrCtx.setLqaStatus('issues'), 2800);
    }
  };

  // Consume startTab prop — navigate to it once then clear
  useEffect(() => {
    if (startTab) {
      setNavTab(startTab);
      if (startTab === 'quality') {
        setAutoRunQuality(true); // signal LQAReview to enter analyzing state immediately
        ehrCtx?.triggerQualityCheck?.();  // update lqaStatus in context (drives badge + pill)
      }
      onStartTabConsumed?.();
    }
  }, [startTab]); // eslint-disable-line

  // Determine active nav icon
  const activeNav = navTab;

  const renderPanel = () => {
    // Capture flow screens — only override when the user is on the capture tab
    if (navTab === 'capture' && capturePhase === 'recording') return (
      <SessionInProgressPanel
        clientName={captureSession.name}
        dateTime={captureSession.dateTime}
        startedAt={captureSession.recordingStartedAt}
        onBack={() => { setCapturePhase(null); setPhase('form'); }}
        onEndSession={() => {
          // Build an activity entry for the captured session and add to Add to EHR
          const startT = captureSession.dateTime?.split(', ').at(-1) ?? '10:30 AM';
          const [tPart, ap] = startT.split(' ');
          const [hh, mm] = tPart.split(':').map(Number);
          const endMin = mm + 45, endH = hh + Math.floor(endMin / 60), endM = endMin % 60;
          const endAp = endH >= 12 ? 'PM' : 'AM';
          const dispH = endH > 12 ? endH - 12 : endH || 12;
          const endT = `${dispH}:${String(endM).padStart(2,'0')} ${endAp}`;
          const audioSession = {
            id: `audio-${Date.now()}`,
            ...daysAgo(0),
            name: captureSession.name,
            time: `${startT} – ${endT}`,
            type: 'individual',
            sessionType: 'audio',
            isActive: false,
            summary: 'Audio session captured and transcribed. AI-generated suggestions are ready for EHR review.',
            suggestionsKey: 'audio',
          };
          setAddedSessions(prev => [audioSession, ...prev]);
          setCapturePhase('done');
        }}
      />
    );
    if (navTab === 'capture' && capturePhase === 'done') return (
      <SessionEndPanel
        clientName={captureSession.name}
        dateTime={captureSession.dateTime}
        onBack={() => { setCapturePhase(null); setPhase('form'); }}
        onGoToActivities={() => { setCapturePhase(null); setActivitiesInitialTab('ehr'); setNavTab('activities'); setPhase('sessions'); }}
        onStartNew={() => { setCapturePhase(null); setPhase('form'); setCaptureSession({ name: '', dateTime: '' }); }}
        compactMode={compactMode}
      />
    );

    if (navTab === 'capture') {
      return <CaptureSessionPanel key={captureSession.name || 'new'} initialClient={captureSession.name} onBack={() => { setNavTab('activities'); setPhase('sessions'); }} onCapture={(name, dt) => { setCaptureSession({ name, dateTime: dt, recordingStartedAt: Date.now() }); setCapturePhase('recording'); }} compactMode={compactMode} />;
    }
    if (navTab === 'activities') {
      if (phase === 'form') return <CaptureSessionPanel key={captureSession.name || 'new'} initialClient={captureSession.name} onBack={() => setPhase('sessions')} onCapture={(name, dt) => { setCaptureSession({ name, dateTime: dt, recordingStartedAt: Date.now() }); setCapturePhase('recording'); }} compactMode={compactMode} />;
      if (phase === 'suggestions' && activitiesSession) return <SuggestionsPanel
        clientName={activitiesSession.name}
        sessionSubtitle={`${activitiesSession.month} ${activitiesSession.day}, 2026, ${activitiesSession.time}`}
        onBack={() => { setActivitiesSession(null); setPhase('sessions'); setClientName('Webb, Marcus'); }}
        onAddToNote={onAddToNote}
        session={activitiesSession}
        isIndividualAudio={activitiesSession.type === 'individual' && activitiesSession.sessionType === 'audio'}
        compactMode={compactMode}
        sidebarW={sidebarW}
        onAddedToEHR={() => {
          setDoneIds(prev => new Set([...prev, activitiesSession.id]));
          setActivitiesInitialTab('done');
          setActivitiesSession(null);
          setPhase('sessions');
          setClientName('Webb, Marcus');
        }}
      />;
      return <MySessionsPanel
        initialTab={activitiesInitialTab}
        doneIds={doneIds}
        extraSessions={addedSessions}
        onMarkDone={id => { setDoneIds(prev => new Set([...prev, id])); }}
        onUndoDone={id => { setDoneIds(prev => { const n = new Set(prev); n.delete(id); return n; }); }}
        compactMode={compactMode}
        onSelectSession={(session) => {
          setActivitiesSession(session);
          setPhase('suggestions');
          if (session?.name) {
            const parts = session.name.trim().split(/\s+/);
            const formatted = parts.length >= 2 ? `${parts[parts.length - 1]}, ${parts.slice(0, -1).join(' ')}` : session.name;
            setClientName(formatted);
          }
          // Switch EHR note type to match the session
          const NOTE_TYPE_KEY_MAP = {
            'Individual Audio':      'IndividualAudio',
            'Progress Note':         'ProgressNote',
            'Case Management':       'CaseManagement',
            'Treatment Plan':        'TreatmentPlan',
            'Med Management':        'PsychiatricMedical',
            'Assessment':            'Assessment',
            'Anger Management Group': 'AngerManagementGroup',
            'SUD Group':              'SUDGroup',
          };
          const noteTypeKey = NOTE_TYPE_KEY_MAP[session?.noteType] ?? 'DAP';
          noteTypeCtx?.setSelectedNoteType(noteTypeKey);
        }}
      />;
    }
    if (navTab === 'clients') return <ClientsPanel sidebarW={sidebarW} />;
    if (navTab === 'quality')  return <LQAReview clientName="Larry Quinn" sessionLabel="Apr 15, 2026, 9:00 – 9:45 AM" onAdvance={() => handleNavClick('activities')} autoRunAnalysis={autoRunQuality} onAutoRunConsumed={() => setAutoRunQuality(false)} />;
    if (navTab === 'summary') return <AddSummaryPanel
      initialClient={captureSession.name || 'Marcus Webb'}
      suggestionsData={noteTypeCtx?.suggestionsData ?? SUGGESTIONS_DATA}
      onAddToNote={onAddToNote}
      compactMode={compactMode}
      onSuggestionsReached={(name) => {
        // Update EHR client name
        if (name) {
          const parts = name.trim().split(/\s+/);
          const formatted = parts.length >= 2 ? `${parts[parts.length - 1]}, ${parts.slice(0, -1).join(' ')}` : name;
          setClientName(formatted);
        }
        // Build the session entry the moment suggestions are shown
        setPendingEHRSession({
          id: `summary-${Date.now()}`,
          ...daysAgo(0),
          name,
          time: '10:00 – 10:45 AM',
          type: 'individual',
          sessionType: 'text',
          isActive: true,
          summary: 'Session notes drafted via Add Summary — pending EHR submission.',
        });
      }}
      onSuggestionsLeft={() => { setPendingEHRSession(null); setClientName('Webb, Marcus'); }}
      onAddedToEHR={() => {
        // Commit pending session as Done and jump to Activities → Marked as Done
        if (pendingEHRSession) {
          setAddedSessions(prev => [pendingEHRSession, ...prev]);
          setDoneIds(prev => new Set([...prev, pendingEHRSession.id]));
          setPendingEHRSession(null);
        }
        setActivitiesInitialTab('done');
        setNavTab('activities');
        setPhase('sessions');
      }}
    />;
    return <PlaceholderPanel tab={navTab} />;
  };

  // ── Layout helpers ──────────────────────────────────────────────────────────
  const isLeft = side === 'left';
  const boxShadow = isLeft
    ? '4px 0 20px rgba(23,44,55,0.18)'
    : '-4px 0 20px rgba(23,44,55,0.18)';
  const topPos = posY;

  return (
    // Outer: positioning context only — no overflow clipping, so overflow menu can escape
    <div
      style={{
        position: 'fixed',
        left: posX,
        top: topPos,
        width: sidebarW,
        height: sidebarH,
        zIndex: 10,
        cursor: isDragging ? 'grabbing' : isResizing ? 'ns-resize' : isWidthResizing ? 'ew-resize' : 'grab',
        userSelect: (isDragging || isResizing || isWidthResizing) ? 'none' : 'auto',
        pointerEvents: 'auto',
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Left-edge width resize handle */}
      <div
        data-resizeHandle="true"
        onMouseDown={handleLeftResizeMouseDown}
        style={{ position: 'absolute', left: -4, top: 0, width: 10, height: '100%', cursor: 'ew-resize', zIndex: 20 }}
      />
      {/* Right-edge width resize handle */}
      <div
        data-resizeHandle="true"
        onMouseDown={handleRightResizeMouseDown}
        style={{ position: 'absolute', right: -4, top: 0, width: 10, height: '100%', cursor: 'ew-resize', zIndex: 20 }}
      />
      {/* Inner: visual container that clips border-radius */}
      <div style={{
        position: 'absolute',
        inset: 0,
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow,
        display: 'flex',
        flexDirection: isLeft ? 'row' : 'row-reverse',
      }}>
        <EleosNavRail
          activeItem={activeNav}
          onNavClick={handleNavClick}
          side={side}
          visibleItems={visibleNavItems}
          hasOverflow={overflowNavItems.length > 0}
          overflowActive={overflowNavItems.includes(activeNav)}
          onMoreClick={(e) => { e.stopPropagation(); setShowOverflow(s => !s); }}
          showMore={showOverflow}
          onResizeMouseDown={handleResizeMouseDown}
          showLabels={showNavLabels}
          isCapturing={capturePhase === 'recording'}
          onCollapse={onCollapse}
          compactMode={compactMode}
        />
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', background: 'var(--eleos-content-bg)' }}>
          <div key={`${navTab}-${phase}-${capturePhase}-${step}`} style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {renderPanel()}
          </div>
        </div>
      </div>

      {/* Overflow menu — sibling of inner box, not clipped */}
      {showOverflow && overflowNavItems.length > 0 && (
        <div
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            [isLeft ? 'left' : 'right']: 82,
            bottom: 140,
            background: '#1e2e6e',
            borderRadius: 12,
            padding: '6px 0',
            zIndex: 20,
            minWidth: 164,
            boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
          }}
        >
          {overflowNavItems.map(key => (
            <div
              key={key}
              onClick={() => { handleNavClick(key); setShowOverflow(false); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 16px', cursor: 'pointer',
                background: activeNav === key ? 'rgba(255,255,255,0.15)' : 'transparent',
              }}
            >
              <NavRailIcon navKey={key} active={activeNav === key} />
              <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, fontWeight: activeNav === key ? 500 : 400, color: 'white' }}>
                {NAV_ITEM_LABELS[key]}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Clients Panel ─────────────────────────────────────────────────────────────

const CLIENTS_LIST = [
  { id: 1,  name: "Jacob Doe" },
  { id: 2,  name: "David Chen" },
  { id: 3,  name: "Maria Garcia" },
  { id: 4,  name: "Liam O'Connor" },
  { id: 5,  name: "Kenji Tanaka" },
  { id: 6,  name: "Chloe Dubois" },
  { id: 7,  name: "Anya Sharma" },
  { id: 8,  name: "Mateo Rossi" },
  { id: 9,  name: "Chloe Jacobson" },
  { id: 10, name: "Samuel Wright" },
];

function ClientsPanel({ sidebarW = 467 }) {
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const P = { fontFamily: 'Poppins, sans-serif' };
  const compactMode = sidebarW < 380;

  if (selectedClient) {
    return <ClientDetailPanelV2 client={selectedClient} onBack={() => setSelectedClient(null)} sidebarW={sidebarW} />;
  }

  const filtered = CLIENTS_LIST.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--eleos-content-bg)', gap: 8 }}>

      {/* ── Sticky header (elevation/4, pt:24 pb:16 px:16) ── */}
      <div style={{
        background: 'white',
        borderRadius: 16,
        overflow: 'hidden',
        paddingTop: compactMode ? 16 : 24, paddingBottom: compactMode ? 10 : 16, paddingLeft: compactMode ? 10 : 16, paddingRight: compactMode ? 10 : 16,
        boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 10px 0px rgba(0,0,0,0.1), 0px 1px 10px 0px rgba(0,0,0,0.1)',
        flexShrink: 0,
        zIndex: 2,
      }}>
        {/* Top row: back arrow | "Working offline" | user avatar + chevron */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Back arrow */}
          <button style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="#212121" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Center spacer */}
          <div style={{ flex: 1 }} />

          {/* User avatar + chevron — shared component */}
          <FigmaUserAvatar />
        </div>

        {/* Bottom row: "My Clients" centered */}
        <div style={{ padding: 10, textAlign: 'center' }}>
          <span style={{ ...P, fontSize: compactMode ? 15 : 18, fontWeight: 600, color: '#212121', lineHeight: 1.57, letterSpacing: '0.018px' }}>
            My Clients
          </span>
        </div>
      </div>

      {/* ── Scrollable content ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: compactMode ? '0 10px 16px' : '0 16px 20px' }}>
        {/* Sticky top spacer */}
        <div style={{ position: 'sticky', top: 0, height: 24, background: 'var(--eleos-content-bg)', zIndex: 5, marginLeft: -16, marginRight: -16 }} />
        {/* Search row + cards in a flex-column with 24px gap */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Search + sort */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Search input — 321px fixed */}
            <div style={{ position: 'relative', width: '100%' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                <circle cx="11" cy="11" r="7" stroke="rgba(33,33,33,0.42)" strokeWidth="1.8"/>
                <path d="M16.5 16.5L21 21" stroke="rgba(33,33,33,0.42)" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search for a client"
                style={{
                  width: '100%',
                  height: compactMode ? 38 : 47,
                  borderRadius: 8,
                  border: '1px solid rgba(33,33,33,0.42)',
                  background: 'white',
                  paddingLeft: 40,
                  paddingRight: search ? 36 : 16,
                  ...P, fontSize: compactMode ? 13 : 14, color: '#212121',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              {search && (
                <svg onClick={() => setSearch('')} width="16" height="16" viewBox="0 0 16 16" fill="none"
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }}>
                  <path d="M4 4l8 8M12 4l-8 8" stroke="rgba(33,33,33,0.54)" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              )}
            </div>
            {/* Sort icon — plain 24×24, no box */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ cursor: 'pointer', flexShrink: 0 }}>
              <path d="M8 16l-3-3m3 3l3-3m-3 3V8M16 8l3 3m-3-3l-3 3m3-3v8" stroke="#212121" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          {/* Client cards — 8px gap */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map(client => (
              <div key={client.id} onClick={() => setSelectedClient(client)} style={{
                background: 'white',
                borderRadius: 8,
                boxShadow: '0px 1px 3px 0px rgba(0,0,0,0.12), 0px 1px 1px 0px rgba(0,0,0,0.05)',
                padding: compactMode ? '10px 12px' : 16,
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
              }}>
                <span style={{ ...P, fontSize: compactMode ? 13 : 16, fontWeight: 500, color: '#212121', flex: 1, lineHeight: 1.57, letterSpacing: '0.1px' }}>
                  {client.name}
                </span>
                {/* Right icons: person + chevron, gap scales with mode */}
                <div style={{ display: 'flex', alignItems: 'center', gap: compactMode ? 10 : 16, flexShrink: 0 }}>
                  {/* Person icon */}
                  <svg width={compactMode ? 18 : 24} height={compactMode ? 18 : 24} viewBox="0 0 24 24" fill="none">
                    <path d="M19.2862 17.5546C18.8849 16.6039 18.3024 15.7403 17.5714 15.012C16.8425 14.2816 15.9791 13.6993 15.0288 13.2972C15.0203 13.2929 15.0118 13.2908 15.0033 13.2865C16.3288 12.3291 17.1905 10.7695 17.1905 9.00996C17.1905 6.09508 14.8288 3.7334 11.9139 3.7334C8.99907 3.7334 6.63738 6.09508 6.63738 9.00996C6.63738 10.7695 7.49908 12.3291 8.8246 13.2887C8.81609 13.2929 8.80758 13.295 8.79907 13.2993C7.84588 13.7014 6.99057 14.278 6.25653 15.0142C5.52613 15.743 4.94378 16.6064 4.54165 17.5567C4.14659 18.487 3.93353 19.4845 3.91399 20.495C3.91343 20.5177 3.91741 20.5403 3.92571 20.5614C3.93401 20.5826 3.94646 20.6018 3.96232 20.6181C3.97818 20.6344 3.99714 20.6473 4.01807 20.6561C4.039 20.6649 4.06149 20.6695 4.08421 20.6695H5.36079C5.45441 20.6695 5.52888 20.595 5.531 20.5035C5.57356 18.861 6.23313 17.3227 7.39908 16.1567C8.60545 14.9503 10.2076 14.2865 11.9139 14.2865C13.6203 14.2865 15.2224 14.9503 16.4288 16.1567C17.5948 17.3227 18.2543 18.861 18.2969 20.5035C18.299 20.5971 18.3735 20.6695 18.4671 20.6695H19.7437C19.7664 20.6695 19.7889 20.6649 19.8098 20.6561C19.8307 20.6473 19.8497 20.6344 19.8656 20.6181C19.8814 20.6018 19.8939 20.5826 19.9022 20.5614C19.9105 20.5403 19.9145 20.5177 19.9139 20.495C19.8926 19.478 19.682 18.4886 19.2862 17.5546ZM11.9139 12.6695C10.9374 12.6695 10.0182 12.2887 9.32672 11.5972C8.63524 10.9057 8.25439 9.98655 8.25439 9.00996C8.25439 8.03337 8.63524 7.11423 9.32672 6.42274C10.0182 5.73126 10.9374 5.35041 11.9139 5.35041C12.8905 5.35041 13.8097 5.73126 14.5012 6.42274C15.1926 7.11423 15.5735 8.03337 15.5735 9.00996C15.5735 9.98655 15.1926 10.9057 14.5012 11.5972C13.8097 12.2887 12.8905 12.6695 11.9139 12.6695Z" fill="#212121"/>
                  </svg>
                  {/* Chevron pointing right */}
                  <svg width={compactMode ? 18 : 24} height={compactMode ? 18 : 24} viewBox="0 0 24 24" fill="none" style={{ transform: 'rotate(-90deg)' }}>
                    <path d="M6 9L12 15L18 9" stroke="#212121" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

// ── Client Detail Panel ───────────────────────────────────────────────────────
// V1 components below are commented out — replaced by ClientDetailPanelV2

// ── V1 functions kept below for reference (renamed so they're not called) ──

// eslint-disable-next-line no-unused-vars
const SHADOW_EL4_V1 = '0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 10px 0px rgba(0,0,0,0.1), 0px 1px 10px 0px rgba(0,0,0,0.1)';
// eslint-disable-next-line no-unused-vars
const SHADOW_EL1_V1 = '0px 1px 3px 0px rgba(0,0,0,0.12), 0px 1px 1px 0px rgba(0,0,0,0.05)';

// eslint-disable-next-line no-unused-vars
function ClientDetailPanel_V1({ client, onBack }) {
  const [tab, setTab] = useState('overview');
  const P = { fontFamily: 'Poppins, sans-serif' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#EAEDFA', gap: 8 }}>
      {/* ── Header ── */}
      <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', paddingTop: 24, paddingBottom: 16, paddingLeft: 16, paddingRight: 16, boxShadow: SHADOW_EL4_V1, flexShrink: 0, zIndex: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="#212121" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div style={{ flex: 1 }} />
          <FigmaUserAvatar />
        </div>
        <div style={{ padding: 10, textAlign: 'center' }}>
          <div style={{ ...P, fontSize: 18, fontWeight: 600, color: '#212121', lineHeight: 1.57, letterSpacing: '0.018px' }}>
            {client.name}
          </div>
          <div style={{ ...P, fontSize: 14, lineHeight: 1.43, letterSpacing: '0.17px', marginTop: 2 }}>
            <span style={{ color: 'rgba(0,0,0,0.6)' }}>Client ID</span>
            {' '}<span style={{ color: '#212121' }}>CL{String(client.id).padStart(6, '0')}</span>
          </div>
        </div>
      </div>

      {/* ── Tab bar ── */}
      <div style={{ background: 'white', borderBottom: '1px solid rgba(0,0,0,0.12)', display: 'flex', alignItems: 'stretch', paddingTop: 24, paddingLeft: 16, paddingRight: 16, flexShrink: 0 }}>
        {['overview', 'activities'].map(t => {
          const active = tab === t;
          return (
            <div key={t} onClick={() => setTab(t)}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', position: 'relative' }}>
              <div style={{ padding: '9px 8px' }}>
                <span style={{ ...P, fontSize: 14, fontWeight: active ? 500 : 400, color: active ? '#2d4ccd' : 'rgba(33,33,33,0.8)', letterSpacing: '0.4px', lineHeight: '24px', whiteSpace: 'nowrap' }}>
                  {t === 'overview' ? 'Overview' : 'Activities'}
                </span>
              </div>
              {active && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: '#2d4ccd', borderRadius: '2px 2px 0 0' }} />}
            </div>
          );
        })}
      </div>

      {/* ── Content ── */}
      <div style={{ flex: 1, overflowY: 'auto', background: 'white', padding: '0 16px' }}>
        {/* Sticky top spacer */}
        <div style={{ position: 'sticky', top: 0, height: 20, background: 'white', zIndex: 5, marginLeft: -16, marginRight: -16 }} />
        {tab === 'overview' ? <ClientOverviewTab client={client} /> : <ClientActivitiesTab client={client} />}
      </div>
    </div>
  );
}

// ── Client Overview Tab ─────────────────────────────────────────────

// eslint-disable-next-line no-unused-vars
function ClientOverviewTab_V1({ client }) {
  const [themeView, setThemeView] = useState('graph');
  const P = { fontFamily: 'Poppins, sans-serif' };

  // Section header helper
  const SectionHeader = ({ title }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
      <span style={{ ...P, fontSize: 18, fontWeight: 500, color: 'rgba(0,0,0,0.87)', lineHeight: 1.57, letterSpacing: '0.018px' }}>{title}</span>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="rgba(0,0,0,0.54)" strokeWidth="1.5"/>
        <path d="M12 8v.5M12 11v5" stroke="rgba(0,0,0,0.54)" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    </div>
  );

  // Bar chart data
  const sessions = [
    { label: '9/10', alcohol: 100, anxiety: 85, subUse: 90 },
    { label: '9/17', alcohol: 40, anxiety: 83, subUse: 57 },
    { label: '9/23', alcohol: 90, anxiety: 57, subUse: 120 },
    { label: '10/7', alcohol: 100, anxiety: 57, subUse: 57 },
  ];
  const maxBar = 120;

  // Attendance data
  const attendance = [
    { label: '9/10', attended: true },
    { label: '9/17', attended: false },
    { label: '9/23', attended: true },
    { label: '9/30', attended: true },
    { label: '10/7', attended: true },
  ];

  return (
    <div style={{ padding: '24px 16px 32px' }}>
      {/* ─── Last Activity Summary ─── */}
      <div style={{ marginBottom: 40 }}>
        <SectionHeader title="Last Activity Summary" />
        <div style={{ background: '#e5f6fd', borderRadius: 8, padding: '16px 24px 16px 16px', position: 'relative' }}>
          {/* Top row: label + date */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ ...P, fontSize: 14, fontWeight: 500, color: 'rgba(0,0,0,0.87)', letterSpacing: '0.15px' }}>Catch up on last activity</span>
            <span style={{ ...P, fontSize: 14, fontWeight: 500, color: 'rgba(0,0,0,0.38)', letterSpacing: '0.15px' }}>Feb 1, 2025</span>
          </div>
          {/* Icon + bullets */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 16 }}>
            {/* Evidence-based care illustration */}
            <div style={{ width: 60, height: 60, flexShrink: 0 }}>
              <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#info_clip)">
                  <path d="M30.0972 60.102C46.6765 60.102 60.1167 46.6477 60.1167 30.051C60.1167 13.4543 46.6765 0 30.0972 0C13.5178 0 0.0776367 13.4543 0.0776367 30.051C0.0776367 46.6477 13.5178 60.102 30.0972 60.102Z" fill="url(#info_grad)"/>
                  <path d="M24.2144 53.2959C24.827 53.2959 25.3236 53.793 25.3237 54.4062C25.3237 55.0196 24.827 55.5166 24.2144 55.5166C23.6017 55.5166 23.105 55.0196 23.105 54.4062C23.1051 53.793 23.6017 53.2959 24.2144 53.2959ZM27.8433 53.6787C28.2447 53.6787 28.5708 54.0044 28.5708 54.4062C28.5708 54.8081 28.2447 55.1338 27.8433 55.1338C27.442 55.1336 27.1167 54.808 27.1167 54.4062C27.1167 54.0045 27.442 53.6789 27.8433 53.6787ZM41.9448 52.5684C42.3462 52.5684 42.6723 52.8941 42.6724 53.2959C42.6724 53.6978 42.3463 54.0234 41.9448 54.0234C41.5435 54.0233 41.2183 53.6977 41.2183 53.2959C41.2183 52.8942 41.5436 52.5685 41.9448 52.5684ZM14.5269 43.8662C14.6204 44.868 14.8599 46.0673 15.1099 46.457C15.3418 46.8175 15.7701 47.1264 16.7222 47.3066C15.7915 47.4428 15.3269 47.7177 15.146 48.0537C14.7372 48.8155 14.6586 49.6193 14.5493 50.8926C14.4581 49.5974 14.3572 48.7823 13.9917 48.1221C13.8062 47.7884 13.2616 47.5105 12.3315 47.3066C13.2836 47.1264 13.7117 46.8175 13.9429 46.457C14.1929 46.0674 14.4813 44.8012 14.5269 43.8662ZM43.4878 49.209C43.9384 49.2092 44.3032 49.5743 44.3032 50.0254C44.3032 50.4765 43.9384 50.8426 43.4878 50.8428C43.0371 50.8428 42.6714 50.4766 42.6714 50.0254C42.6714 49.5742 43.0371 49.209 43.4878 49.209ZM17.4243 49.21C17.8116 49.2102 18.1255 49.5243 18.1255 49.9121C18.1254 50.2998 17.8116 50.614 17.4243 50.6143C17.0368 50.6143 16.7223 50.3 16.7222 49.9121C16.7222 49.5242 17.0368 49.21 17.4243 49.21ZM50.7837 45.6113C51.2382 45.6114 51.6068 45.9796 51.6069 46.4346C51.6069 46.8896 51.2383 47.2588 50.7837 47.2588C50.3291 47.2588 49.9604 46.8897 49.9604 46.4346C49.9606 45.9796 50.3292 45.6113 50.7837 45.6113ZM10.3989 44.7764C10.8564 44.7766 11.2271 45.1475 11.2271 45.6055C11.227 46.0635 10.8564 46.4343 10.3989 46.4346C9.94127 46.4346 9.56985 46.0636 9.56982 45.6055C9.56982 45.1473 9.94126 44.7764 10.3989 44.7764ZM10.0044 40.6826C10.6027 40.6826 11.0884 41.1686 11.0884 41.7676C11.0882 42.3664 10.6026 42.8516 10.0044 42.8516C9.40636 42.8513 8.92161 42.3662 8.92139 41.7676C8.92139 41.1687 9.40623 40.6828 10.0044 40.6826ZM49.0591 26.9834C49.1707 28.1821 49.4578 29.6181 49.7573 30.084C50.0341 30.5151 50.5463 30.884 51.686 31.0996C50.5729 31.2625 50.0166 31.5921 49.8003 31.9941C49.3113 32.9055 49.2177 33.8679 49.0864 35.3916C48.9779 33.8411 48.8574 32.8654 48.4194 32.0752C48.1975 31.6756 47.5459 31.3435 46.4331 31.0996C47.5713 30.884 48.084 30.5151 48.3608 30.084C48.6604 29.6181 49.0048 28.1018 49.0591 26.9834ZM53.9507 32.6582C54.5618 32.6584 55.057 33.1539 55.0571 33.7656C55.0571 34.3775 54.5619 34.8738 53.9507 34.874C53.3393 34.874 52.8433 34.3776 52.8433 33.7656C52.8434 33.1537 53.3394 32.6582 53.9507 32.6582ZM41.9458 26.7588C42.4273 26.7589 42.8179 27.1498 42.8179 27.6318C42.8178 28.1137 42.4272 28.5048 41.9458 28.5049C41.4643 28.5049 41.0738 28.1138 41.0737 27.6318C41.0737 27.1498 41.4643 26.7588 41.9458 26.7588ZM11.0894 13.6572C11.2026 14.8692 11.4928 16.3206 11.7954 16.792C12.0754 17.2278 12.5934 17.6008 13.7446 17.8203C12.6181 17.9848 12.0569 18.3177 11.8384 18.7246C11.3439 19.6462 11.2496 20.619 11.1167 22.1592C11.0066 20.5915 10.8844 19.6055 10.4419 18.8066C10.2178 18.4021 9.55898 18.0657 8.43311 17.8193C9.58477 17.6006 10.1034 17.2279 10.3833 16.792C10.686 16.3206 11.0342 14.7882 11.0894 13.6572ZM19.0796 18.8027C19.7169 18.8028 20.2338 19.32 20.2339 19.958C20.2339 20.5961 19.717 21.1132 19.0796 21.1133C18.4422 21.1133 17.9253 20.5961 17.9253 19.958C17.9254 19.32 18.4422 18.8027 19.0796 18.8027ZM50.5112 14.0391C51.1173 14.0391 51.6088 14.531 51.6089 15.1377C51.6089 15.7445 51.1174 16.2363 50.5112 16.2363C49.9051 16.2363 49.4136 15.7445 49.4136 15.1377C49.4136 14.5309 49.9051 14.0391 50.5112 14.0391ZM44.9048 7.9668C44.9936 8.91834 45.222 10.0578 45.4595 10.4277C45.6788 10.7701 46.085 11.0628 46.9897 11.2344C46.1054 11.3635 45.6641 11.6248 45.4927 11.9443C45.1043 12.6676 45.03 13.4311 44.9263 14.6406C44.8398 13.4107 44.7445 12.636 44.397 12.0088C44.2207 11.6917 43.7033 11.4279 42.8198 11.2344C43.7239 11.0628 44.1309 10.7701 44.3511 10.4277C44.5885 10.0574 44.8616 8.85432 44.9048 7.9668ZM14.5952 9.25781C15.0668 9.25781 15.4497 9.64025 15.4497 10.1123C15.4496 10.5842 15.0667 10.9668 14.5952 10.9668C14.1239 10.9666 13.7418 10.5841 13.7417 10.1123C13.7417 9.64036 14.1238 9.25799 14.5952 9.25781ZM26.1216 7.11523C26.562 7.11533 26.9193 7.47222 26.9194 7.91309C26.9194 8.35403 26.562 8.71181 26.1216 8.71191C25.681 8.71191 25.3237 8.35409 25.3237 7.91309C25.3238 7.47216 25.6811 7.11523 26.1216 7.11523ZM29.6138 4.70312C30.2789 4.70312 30.8187 5.24335 30.8188 5.90918C30.8188 6.5751 30.279 7.11523 29.6138 7.11523C28.9487 7.11502 28.4097 6.57497 28.4097 5.90918C28.4098 5.24348 28.9488 4.70334 29.6138 4.70312Z" fill="white"/>
                  <path d="M35.7983 26.4282C41.003 26.4285 45.2222 30.6483 45.2222 35.853C45.2219 41.0575 41.0028 45.2766 35.7983 45.2769C30.5936 45.2769 26.3738 41.0577 26.3735 35.853C26.3735 30.6482 30.5935 26.4282 35.7983 26.4282Z" fill="#93C7C7" stroke="#294355" strokeWidth="0.951462"/>
                  <circle cx="24.7524" cy="30.4404" r="11.7146" fill="#FFF4D7" stroke="#294355" strokeWidth="0.951462"/>
                  <mask id="info_m1" fill="white">
                    <path d="M36.0884 25.96C36.6374 27.3475 36.9428 28.8585 36.9429 30.4414C36.9429 35.9923 33.2315 40.6731 28.1558 42.1465C26.7454 40.4358 25.898 38.2437 25.8979 35.8535C25.8979 30.3859 30.3307 25.9531 35.7983 25.9531C35.8954 25.9531 35.992 25.9572 36.0884 25.96Z"/>
                  </mask>
                  <path d="M36.0884 25.96C36.6374 27.3475 36.9428 28.8585 36.9429 30.4414C36.9429 35.9923 33.2315 40.6731 28.1558 42.1465C26.7454 40.4358 25.898 38.2437 25.8979 35.8535C25.8979 30.3859 30.3307 25.9531 35.7983 25.9531C35.8954 25.9531 35.992 25.9572 36.0884 25.96Z" fill="white"/>
                  <path d="M36.0884 25.96L36.9731 25.6099L36.7424 25.027L36.1158 25.0089L36.0884 25.96ZM36.9429 30.4414H37.8943V30.4414L36.9429 30.4414ZM28.1558 42.1465L27.4216 42.7517L27.8198 43.2347L28.421 43.0602L28.1558 42.1465ZM25.8979 35.8535H24.9465V35.8535L25.8979 35.8535ZM35.7983 25.9531L35.7984 25.0017H35.7983V25.9531ZM36.0884 25.96L35.2037 26.31C35.71 27.5895 35.9914 28.982 35.9914 30.4414L36.9429 30.4414L37.8943 30.4414C37.8943 28.7351 37.5649 27.1055 36.9731 25.6099L36.0884 25.96ZM36.9429 30.4414H35.9914C35.9914 35.5572 32.5712 39.8741 27.8905 41.2327L28.1558 42.1465L28.421 43.0602C33.8918 41.4722 37.8943 36.4274 37.8943 30.4414H36.9429ZM28.1558 42.1465L28.8899 41.5412C27.6148 39.9946 26.8495 38.0147 26.8494 35.8535L25.8979 35.8535L24.9465 35.8535C24.9466 38.4727 25.876 40.877 27.4216 42.7517L28.1558 42.1465ZM25.8979 35.8535H26.8494C26.8494 30.9114 30.8562 26.9046 35.7983 26.9046V25.9531V25.0017C29.8053 25.0017 24.9465 29.8604 24.9465 35.8535H25.8979ZM35.7983 25.9531L35.7983 26.9046C35.8771 26.9046 35.948 26.9078 36.061 26.911L36.0884 25.96L36.1158 25.0089C36.036 25.0066 35.9136 25.0017 35.7984 25.0017L35.7983 25.9531Z" fill="#294355" mask="url(#info_m1)"/>
                  <path d="M35.7983 19.9502C39.504 19.9502 42.5083 22.9545 42.5083 26.6602C42.5083 30.3658 39.504 33.3701 35.7983 33.3701C32.0927 33.3701 29.0884 30.3658 29.0884 26.6602C29.0884 22.9545 32.0926 19.9502 35.7983 19.9502Z" fill="#FF97A4" stroke="#294355" strokeWidth="0.951462"/>
                  <mask id="info_m2" fill="white">
                    <path d="M31.9419 20.5972C34.9729 22.8148 36.9427 26.3967 36.9429 30.4399C36.9429 31.6103 36.7742 32.7416 36.4663 33.813C36.2463 33.8333 36.0236 33.8452 35.7983 33.8452C31.8299 33.8452 28.6128 30.6281 28.6128 26.6597C28.6128 24.1107 29.9408 21.8728 31.9419 20.5972Z"/>
                  </mask>
                  <path d="M31.9419 20.5972C34.9729 22.8148 36.9427 26.3967 36.9429 30.4399C36.9429 31.6103 36.7742 32.7416 36.4663 33.813C36.2463 33.8333 36.0236 33.8452 35.7983 33.8452C31.8299 33.8452 28.6128 30.6281 28.6128 26.6597C28.6128 24.1107 29.9408 21.8728 31.9419 20.5972Z" fill="white"/>
                  <path d="M31.9419 20.5972L32.5037 19.8293L31.9789 19.4453L31.4305 19.7948L31.9419 20.5972ZM36.9429 30.4399H37.8943V30.4399L36.9429 30.4399ZM36.4663 33.813L36.5537 34.7604L37.2012 34.7007L37.3808 34.0758L36.4663 33.813ZM35.7983 33.8452V34.7967H35.7983L35.7983 33.8452ZM28.6128 26.6597H27.6613V26.6597L28.6128 26.6597ZM31.9419 20.5972L31.3801 21.365C34.177 23.4114 35.9913 26.7133 35.9914 30.44L36.9429 30.4399L37.8943 30.4399C37.8942 26.08 35.7687 22.2181 32.5037 19.8293L31.9419 20.5972ZM36.9429 30.4399H35.9914C35.9914 31.5185 35.8361 32.5613 35.5519 33.5502L36.4663 33.813L37.3808 34.0758C37.7124 32.9219 37.8943 31.7022 37.8943 30.4399H36.9429ZM36.4663 33.813L36.3789 32.8655C36.1833 32.8836 35.9901 32.8938 35.7983 32.8938L35.7983 33.8452L35.7983 34.7967C36.0571 34.7967 36.3093 34.783 36.5537 34.7604L36.4663 33.813ZM35.7983 33.8452V32.8938C32.3554 32.8938 29.5643 30.1026 29.5643 26.6597L28.6128 26.6597L27.6613 26.6597C27.6614 31.1535 31.3044 34.7967 35.7983 34.7967V33.8452ZM28.6128 26.6597H29.5643C29.5643 24.4496 30.7144 22.5079 32.4533 21.3995L31.9419 20.5972L31.4305 19.7948C29.1671 21.2376 27.6613 23.7718 27.6613 26.6597H28.6128Z" fill="#294355" mask="url(#info_m2)"/>
                  <mask id="info_m3" fill="white">
                    <path d="M35.7983 25.9531C38.4718 25.9532 40.896 27.0149 42.6772 28.7373C41.7863 31.6932 39.0446 33.8466 35.7983 33.8467C32.5516 33.8467 29.809 31.6928 28.9185 28.7363C30.6998 27.0141 33.1249 25.9531 35.7983 25.9531Z"/>
                  </mask>
                  <path d="M35.7983 25.9531C38.4718 25.9532 40.896 27.0149 42.6772 28.7373C41.7863 31.6932 39.0446 33.8466 35.7983 33.8467C32.5516 33.8467 29.809 31.6928 28.9185 28.7363C30.6998 27.0141 33.1249 25.9531 35.7983 25.9531Z" fill="white"/>
                  <path d="M35.7983 25.9531L35.7984 25.0017H35.7983V25.9531ZM42.6772 28.7373L43.5882 29.0119L43.7556 28.4565L43.3386 28.0533L42.6772 28.7373ZM35.7983 33.8467V34.7981H35.7983L35.7983 33.8467ZM28.9185 28.7363L28.2571 28.0523L27.8402 28.4554L28.0074 29.0108L28.9185 28.7363ZM35.7983 25.9531L35.7983 26.9046C38.2146 26.9047 40.4044 27.8631 42.0158 29.4213L42.6772 28.7373L43.3386 28.0533C41.3876 26.1667 38.7291 25.0018 35.7984 25.0017L35.7983 25.9531ZM42.6772 28.7373L41.7663 28.4627C40.993 31.0283 38.6129 32.8952 35.7983 32.8952L35.7983 33.8467L35.7983 34.7981C39.4764 34.7981 42.5797 32.358 43.5882 29.0119L42.6772 28.7373ZM35.7983 33.8467V32.8952C32.9832 32.8952 30.6024 31.0279 29.8295 28.4619L28.9185 28.7363L28.0074 29.0108C29.0156 32.3577 32.12 34.7981 35.7983 34.7981V33.8467ZM28.9185 28.7363L29.5798 29.4204C31.1911 27.8624 33.3819 26.9046 35.7983 26.9046V25.9531V25.0017C32.868 25.0017 30.2084 26.1657 28.2571 28.0523L28.9185 28.7363Z" fill="#294355" mask="url(#info_m3)"/>
                  <mask id="info_m4" fill="white">
                    <path d="M36.0884 25.96C36.6374 27.3475 36.9428 28.8585 36.9429 30.4414C36.9429 31.6118 36.7742 32.7431 36.4663 33.8145C36.2463 33.8347 36.0236 33.8467 35.7983 33.8467C32.5516 33.8467 29.809 31.6928 28.9185 28.7363C30.6998 27.0141 33.1249 25.9531 35.7983 25.9531C35.8954 25.9531 35.992 25.9572 36.0884 25.96Z"/>
                  </mask>
                  <path d="M36.0884 25.96C36.6374 27.3475 36.9428 28.8585 36.9429 30.4414C36.9429 31.6118 36.7742 32.7431 36.4663 33.8145C36.2463 33.8347 36.0236 33.8467 35.7983 33.8467C32.5516 33.8467 29.809 31.6928 28.9185 28.7363C30.6998 27.0141 33.1249 25.9531 35.7983 25.9531C35.8954 25.9531 35.992 25.9572 36.0884 25.96Z" fill="#FFC14C"/>
                  <path d="M36.0884 25.96L36.9731 25.6099L36.7424 25.027L36.1158 25.0089L36.0884 25.96ZM36.9429 30.4414H37.8943V30.4414L36.9429 30.4414ZM36.4663 33.8145L36.5537 34.7619L37.2012 34.7022L37.3808 34.0773L36.4663 33.8145ZM35.7983 33.8467V34.7981H35.7983L35.7983 33.8467ZM28.9185 28.7363L28.2571 28.0523L27.8402 28.4554L28.0074 29.0108L28.9185 28.7363ZM35.7983 25.9531L35.7984 25.0017H35.7983V25.9531ZM36.0884 25.96L35.2037 26.31C35.71 27.5895 35.9914 28.982 35.9914 30.4414L36.9429 30.4414L37.8943 30.4414C37.8943 28.7351 37.5649 27.1055 36.9731 25.6099L36.0884 25.96ZM36.9429 30.4414H35.9914C35.9914 31.5199 35.8361 32.5628 35.5519 33.5516L36.4663 33.8145L37.3808 34.0773C37.7124 32.9234 37.8943 31.7037 37.8943 30.4414H36.9429ZM36.4663 33.8145L36.3789 32.867C36.1833 32.885 35.9901 32.8952 35.7983 32.8952L35.7983 33.8467L35.7983 34.7981C36.0571 34.7981 36.3093 34.7844 36.5537 34.7619L36.4663 33.8145ZM35.7983 33.8467V32.8952C32.9832 32.8952 30.6024 31.0279 29.8295 28.4619L28.9185 28.7363L28.0074 29.0108C29.0156 32.3577 32.12 34.7981 35.7983 34.7981V33.8467ZM28.9185 28.7363L29.5798 29.4204C31.1911 27.8624 33.3819 26.9046 35.7983 26.9046V25.9531V25.0017C32.868 25.0017 30.2084 26.1657 28.2571 28.0523L28.9185 28.7363ZM35.7983 25.9531L35.7983 26.9046C35.8771 26.9046 35.948 26.9078 36.061 26.911L36.0884 25.96L36.1158 25.0089C36.036 25.0066 35.9137 25.0017 35.7984 25.0017L35.7983 25.9531Z" fill="#294355" mask="url(#info_m4)"/>
                </g>
                <defs>
                  <radialGradient id="info_grad" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(30.0968 30.0512) scale(87.4758 87.5674)">
                    <stop stopColor="#FFC054"/>
                    <stop offset="1" stopColor="white"/>
                  </radialGradient>
                  <clipPath id="info_clip">
                    <rect width="60" height="60" fill="white"/>
                  </clipPath>
                </defs>
              </svg>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#212121', marginTop: 8, flexShrink: 0 }} />
                <span style={{ ...P, fontSize: 14, color: '#212121', lineHeight: 1.43, letterSpacing: '0.17px' }}>Continue CBT breathing<br/>exercise daily</span>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#212121', flexShrink: 0 }} />
                <span style={{ ...P, fontSize: 14, color: '#212121', lineHeight: 1.43, letterSpacing: '0.17px' }}>Review mood journal together</span>
              </div>
            </div>
          </div>
          {/* View Activity button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ background: '#2d4ccd', color: 'white', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', boxShadow: '0px 1px 5px rgba(0,0,0,0.12),0px 2px 2px rgba(0,0,0,0.14),0px 3px 1px -2px rgba(0,0,0,0.2)' }}>
              <span style={{ ...P, fontSize: 13, fontWeight: 500, letterSpacing: '0.46px', lineHeight: '22px' }}>View Activity</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Theme Trends by Session ─── */}
      <div style={{ marginBottom: 40 }}>
        <SectionHeader title="Theme Trends by Session" />
        <div style={{ background: 'white', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 8, padding: 24 }}>
          {/* Graph/Tags toggle */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <div style={{ display: 'flex', background: '#eee', borderRadius: 37, overflow: 'hidden' }}>
              {['graph', 'tags'].map(view => {
                const active = themeView === view;
                return (
                  <div key={view} onClick={() => setThemeView(view)} style={{
                    background: active ? '#2d4ccd' : 'transparent',
                    width: 98, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: 37, cursor: 'pointer',
                  }}>
                    <span style={{ ...P, fontSize: 14, fontWeight: active ? 500 : 400, color: active ? '#eee' : 'rgba(0,0,0,0.6)', letterSpacing: active ? '0.15px' : '0.17px' }}>
                      {view === 'graph' ? 'Graph' : 'Tags'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          {/* Most frequent row — same in both views */}
          <div style={{ background: '#fafafa', borderRadius: 8, padding: '8px 16px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="rgba(33,33,33,0.8)" strokeWidth="1.5"/>
              <circle cx="12" cy="12" r="6" stroke="rgba(33,33,33,0.8)" strokeWidth="1.5"/>
              <circle cx="12" cy="12" r="2" stroke="rgba(33,33,33,0.8)" strokeWidth="1.5"/>
            </svg>
            <span style={{ ...P, fontSize: 14, fontWeight: 500, color: 'rgba(33,33,33,0.38)', lineHeight: '24px' }}>Most Frequent:</span>
            <span style={{ ...P, fontSize: 14, fontWeight: 500, color: '#212121', lineHeight: '24px' }}>Alcohol (15)</span>
          </div>

          {themeView === 'graph' ? (
            <>
              {/* Bar chart */}
              <div style={{ display: 'flex', gap: 0, alignItems: 'flex-end', position: 'relative', paddingLeft: 34 }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end', width: 28 }}>
                  {[15, 10, 5, 0].map(n => (
                    <span key={n} style={{ ...P, fontSize: 12, fontWeight: 500, color: 'rgba(33,33,33,0.8)', lineHeight: '14px' }}>{n}</span>
                  ))}
                </div>
                <div style={{ flex: 1, display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', borderLeft: '1px solid #eee', paddingLeft: 8 }}>
                  {sessions.map((s, i) => {
                    const scale = 100 / maxBar;
                    return (
                      <div key={s.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2 }}>
                          <div style={{ width: 8, height: Math.round(s.alcohol * scale), background: i === 3 ? '#8194e1' : '#03a9f4', borderRadius: 4 }} />
                          <div style={{ width: 8, height: Math.round(s.anxiety * scale), background: '#95ecd3', borderRadius: 4 }} />
                          <div style={{ width: 8, height: Math.round(s.subUse * scale), background: '#ff5722', borderRadius: 4 }} />
                        </div>
                        <span style={{ ...P, fontSize: 14, fontWeight: 500, color: '#212121', lineHeight: '24px' }}>{s.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              {/* Legend */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 27, marginTop: 16 }}>
                {[['#03a9f4','Alcohol'], ['#95ecd3','Anxiety'], ['#ff5722','Sub. Use']].map(([color, label]) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                    <span style={{ ...P, fontSize: 14, fontWeight: 500, color: '#212121', lineHeight: '24px' }}>{label}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            /* Tags view */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                { label: '9/10', tags: ['Alcohol (11)', 'Anxiety (9)', 'Sub. Use (10)'] },
                { label: '9/17', tags: ['Alcohol (4)',  'Anxiety (9)', 'Sub. Use (7)']  },
                { label: '9/23', tags: ['Alcohol (9)',  'Anxiety (9)', 'Sub. Use (7)']  },
                { label: '10/7', tags: ['Alcohol (9)',  'Anxiety (9)', 'Sub. Use (7)']  },
              ].map((row, i, arr) => (
                <div key={row.label}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 16 }}>
                    <span style={{ ...P, fontSize: 14, fontWeight: 500, color: 'rgba(0,0,0,0.87)', letterSpacing: '0.15px', lineHeight: 1.43 }}>{row.label}</span>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {row.tags.map(tag => (
                        <div key={tag} style={{ border: '1px solid #2d4ccd', borderRadius: 4, padding: '3px 6px', display: 'inline-flex', alignItems: 'center' }}>
                          <span style={{ ...P, fontSize: 12, fontWeight: 500, color: '#2d4ccd', lineHeight: '18px', whiteSpace: 'nowrap' }}>{tag}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {i < arr.length - 1 && (
                    <div style={{ height: 1, background: 'rgba(0,0,0,0.12)', marginBottom: 16 }} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── Session Attendes ─── */}
      <div>
        <SectionHeader title="Session Attendes" />
        <div style={{ background: 'white', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 8, padding: 24 }}>
          {/* Date boxes */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            {attendance.map(({ label, attended }) => (
              <div key={label} style={{
                width: 54, height: 64, borderRadius: 16,
                background: attended ? 'rgba(46,125,50,0.08)' : '#f5f5f5',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, padding: 8,
              }}>
                {attended ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12l5 5L19 7" stroke="#2e7d32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" fill="#9e9e9e" fillOpacity="0.3"/>
                    <path d="M9 9l6 6M15 9l-6 6" stroke="#9e9e9e" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                )}
                <span style={{ ...P, fontSize: 14, fontWeight: 500, color: attended ? '#2e7d32' : 'rgba(33,33,33,0.38)', lineHeight: '24px', textAlign: 'center' }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
          {/* Legend */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 27 }}>
            {[['#2e7d32','Attended'], ['#9e9e9e','Missed']].map(([color, label]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                <span style={{ ...P, fontSize: 14, fontWeight: 500, color: 'rgba(0,0,0,0.87)', letterSpacing: '0.15px' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Client Activities Tab ────────────────────────────────────────────

// eslint-disable-next-line no-unused-vars
function ClientActivitiesTab_V1({ client }) {
  const [activeFilter, setActiveFilter] = useState('14 Days');
  const P = { fontFamily: 'Poppins, sans-serif' };

  // All activities ordered newest → oldest, spread across time ranges
  // so each filter chip shows a meaningfully different result.
  // daysBack is relative to the demo's "today" of 2026-04-01.
  const ACTIVITY_DEFS = [
    { id: 0,  daysBack: 3,   type: 'Individual Therapy' },
    { id: 1,  daysBack: 7,   type: 'Case Management' },
    { id: 2,  daysBack: 17,  type: 'Individual Therapy' },
    { id: 3,  daysBack: 24,  type: 'Case Management' },
    { id: 4,  daysBack: 38,  type: 'Individual Therapy' },
    { id: 5,  daysBack: 45,  type: 'Case Management' },
    { id: 6,  daysBack: 52,  type: 'Individual Therapy' },
    { id: 7,  daysBack: 60,  type: 'Case Management' },
    { id: 8,  daysBack: 75,  type: 'Individual Therapy' },
    { id: 9,  daysBack: 84,  type: 'Case Management' },
    { id: 10, daysBack: 105, type: 'Individual Therapy' },
    { id: 11, daysBack: 128, type: 'Case Management' },
  ];

  const allActivities = ACTIVITY_DEFS.map(({ id, daysBack, type }) => {
    const d = new Date('2026-04-01');
    d.setDate(d.getDate() - daysBack);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const yy = String(d.getFullYear()).slice(2);
    return { id, daysBack, date: `${mm}/${dd}/${yy}`, type };
  });

  const FILTER_DAYS = { '14 Days': 14, '30 Days': 30, '90 Days': 90, 'All': Infinity };
  const activities = allActivities.filter(a => a.daysBack <= FILTER_DAYS[activeFilter]);

  const filters = ['14 Days', '30 Days', '90 Days', 'All'];

  return (
    <div style={{ padding: '0 16px 32px' }}>
      {/* Sticky tab content header — Activities + sort icon */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 24, marginBottom: 16 }}>
        <span style={{ ...P, fontSize: 18, fontWeight: 500, color: 'rgba(0,0,0,0.87)', lineHeight: 1.57, letterSpacing: '0.018px' }}>Activities</span>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ cursor: 'pointer' }}>
          <path d="M8 16l-3-3m3 3l3-3m-3 3V8M16 8l3 3m-3-3l-3 3m3-3v8" stroke="#212121" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {/* Filter chips */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {filters.map(f => {
          const active = f === activeFilter;
          return (
            <div key={f} onClick={() => setActiveFilter(f)} style={{
              padding: '4px 12px', borderRadius: 100, cursor: 'pointer',
              background: active ? '#5770d7' : 'white',
              border: active ? 'none' : '1px solid #bdbdbd',
              display: 'inline-flex', alignItems: 'center',
            }}>
              <span style={{ ...P, fontSize: 12, fontWeight: 500, color: active ? 'white' : '#212121', lineHeight: '18px', letterSpacing: '0.16px', whiteSpace: 'nowrap' }}>
                {f}
              </span>
            </div>
          );
        })}
      </div>

      {/* Session cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {activities.map(activity => (
          <div key={activity.id} style={{
            background: 'white',
            borderRadius: 8,
            boxShadow: SHADOW_EL1_V1,
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ ...P, fontSize: 14, color: 'rgba(33,33,33,0.8)', lineHeight: 1.43, letterSpacing: '0.17px' }}>{activity.type}</span>
              <span style={{ ...P, fontSize: 16, fontWeight: 500, color: '#212121', lineHeight: 1.57, letterSpacing: '0.1px' }}>{activity.date}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              {/* Person icon 24×24 */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M19.2862 17.5546C18.8849 16.6039 18.3024 15.7403 17.5714 15.012C16.8425 14.2816 15.9791 13.6993 15.0288 13.2972C15.0203 13.2929 15.0118 13.2908 15.0033 13.2865C16.3288 12.3291 17.1905 10.7695 17.1905 9.00996C17.1905 6.09508 14.8288 3.7334 11.9139 3.7334C8.99907 3.7334 6.63738 6.09508 6.63738 9.00996C6.63738 10.7695 7.49908 12.3291 8.8246 13.2887C8.81609 13.2929 8.80758 13.295 8.79907 13.2993C7.84588 13.7014 6.99057 14.278 6.25653 15.0142C5.52613 15.743 4.94378 16.6064 4.54165 17.5567C4.14659 18.487 3.93353 19.4845 3.91399 20.495C3.91343 20.5177 3.91741 20.5403 3.92571 20.5614C3.93401 20.5826 3.94646 20.6018 3.96232 20.6181C3.97818 20.6344 3.99714 20.6473 4.01807 20.6561C4.039 20.6649 4.06149 20.6695 4.08421 20.6695H5.36079C5.45441 20.6695 5.52888 20.595 5.531 20.5035C5.57356 18.861 6.23313 17.3227 7.39908 16.1567C8.60545 14.9503 10.2076 14.2865 11.9139 14.2865C13.6203 14.2865 15.2224 14.9503 16.4288 16.1567C17.5948 17.3227 18.2543 18.861 18.2969 20.5035C18.299 20.5971 18.3735 20.6695 18.4671 20.6695H19.7437C19.7664 20.6695 19.7889 20.6649 19.8098 20.6561C19.8307 20.6473 19.8497 20.6344 19.8656 20.6181C19.8814 20.6018 19.8939 20.5826 19.9022 20.5614C19.9105 20.5403 19.9145 20.5177 19.9139 20.495C19.8926 19.478 19.682 18.4886 19.2862 17.5546ZM11.9139 12.6695C10.9374 12.6695 10.0182 12.2887 9.32672 11.5972C8.63524 10.9057 8.25439 9.98655 8.25439 9.00996C8.25439 8.03337 8.63524 7.11423 9.32672 6.42274C10.0182 5.73126 10.9374 5.35041 11.9139 5.35041C12.8905 5.35041 13.8097 5.73126 14.5012 6.42274C15.1926 7.11423 15.5735 8.03337 15.5735 9.00996C15.5735 9.98655 15.1926 10.9057 14.5012 11.5972C13.8097 12.2887 12.8905 12.6695 11.9139 12.6695Z" fill="#212121"/>
              </svg>
              {/* Doc icon 24×24 */}
              <CardDocIcon />
              {/* Chevron right */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ transform: 'rotate(-90deg)' }}>
                <path d="M6 9L12 15L18 9" stroke="#212121" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── V1 END ──

// ── Client Detail Panel V2 ────────────────────────────────────────────────────

// Shared constants for all V2 sub-screens
const V2_SHADOW_EL4 = '0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 10px 0px rgba(0,0,0,0.1), 0px 1px 10px 0px rgba(0,0,0,0.1)';
const V2_SHADOW_CARD = '0px 1px 3px 0px rgba(0,0,0,0.12), 0px 1px 1px 0px rgba(0,0,0,0.05)';

// Shared header shell used by all V2 detail screens
function V2Shell({ title, subtitle, onBack, client, children, sidebarW = 467 }) {
  const P = { fontFamily: 'Poppins, sans-serif' };
  const compactMode = sidebarW < 380;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#EAEDFA', gap: 8, overflow: 'hidden' }}>
      <div style={{ background: 'white', borderRadius: 16, padding: compactMode ? '14px 10px 10px' : '24px 16px 16px', boxShadow: V2_SHADOW_EL4, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M15 18L9 12L15 6" stroke="#212121" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <FigmaUserAvatar />
        </div>
        <div style={{ textAlign: 'center', padding: '0 10px' }}>
          {client ? (
            <>
              {/* Client name as primary heading */}
              <div style={{ ...P, fontSize: compactMode ? 15 : 18, fontWeight: 600, color: '#212121', lineHeight: 1.57, letterSpacing: '0.018px' }}>{client.name}</div>
              {/* Client ID · session subtitle on one compact line */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, marginTop: 2 }}>
                <span style={{ ...P, fontSize: compactMode ? 11 : 12, fontWeight: 400, color: 'rgba(0,0,0,0.6)', letterSpacing: '0.4px' }}>CL{String(client.id).padStart(6, '0')}</span>
                {subtitle && (
                  <>
                    <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(0,0,0,0.38)', flexShrink: 0, display: 'inline-block' }} />
                    <span style={{ ...P, fontSize: compactMode ? 11 : 12, fontWeight: 400, color: 'rgba(0,0,0,0.6)', letterSpacing: '0.4px' }}>{subtitle}</span>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <div style={{ ...P, fontSize: compactMode ? 15 : 18, fontWeight: 600, color: '#212121', lineHeight: 1.57, letterSpacing: '0.018px' }}>{title}</div>
              {subtitle && <div style={{ ...P, fontSize: compactMode ? 12 : 14, fontWeight: 400, color: 'rgba(0,0,0,0.6)', lineHeight: 1.43, letterSpacing: '0.17px', marginTop: 2 }}>{subtitle}</div>}
            </>
          )}
        </div>
      </div>
      <div style={{ flex: 1, background: 'white', borderRadius: '16px 16px 0 0', boxShadow: '0px 6px 30px 5px rgba(0,0,0,0.12)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </div>
  );
}

// Shared toggle pill (Circles/Heatmap, By Status/Timeline, etc.)
function V2Toggle({ options, value, onChange }) {
  const P = { fontFamily: 'Poppins, sans-serif' };
  return (
    <div style={{ display: 'flex', background: '#f5f5f5', borderRadius: 9999, padding: 2 }}>
      {options.map(opt => {
        const active = value === opt;
        return (
          <button key={opt} onClick={() => onChange(opt)} style={{
            ...P, fontSize: 13, fontWeight: active ? 500 : 400,
            color: active ? 'white' : 'rgba(0,0,0,0.6)',
            background: active ? '#2d4ccd' : 'transparent',
            border: 'none', borderRadius: 9999, padding: '4px 16px',
            cursor: 'pointer', letterSpacing: '0.16px', transition: 'background 0.18s ease, color 0.18s ease',
          }}>{opt}</button>
        );
      })}
    </div>
  );
}

// ── Screen 2: Last Activity Summary ───────────────────────────────────────────
function V2LastActivity({ onBack, client, sidebarW = 467 }) {
  const P = { fontFamily: 'Poppins, sans-serif' };
  const compactMode = sidebarW < 380;
  const Chip = ({ label, grey }) => (
    <div style={{ background: grey ? '#f1f5f9' : '#eaedfa', borderRadius: 9999, padding: '3px 10px', display: 'inline-flex' }}>
      <span style={{ ...P, fontSize: 12, fontWeight: 500, color: grey ? '#45556c' : '#2d4ccd', lineHeight: 'normal' }}>{label}</span>
    </div>
  );
  const sessionBullets = [
    'Continued CBT work on challenging negative automatic thoughts related to work performance',
    'Patient reported improved sleep using progressive muscle relaxation technique from last session',
    'Introduced thought record worksheet to track anxiety triggers and responses',
    'Discussed upcoming work presentation (March 18) and anxiety management strategies',
    'Successfully used thought records during work presentation preparation',
  ];
  const followUps = [
    { text: 'Review completed thought record worksheets', due: 'Due: Next session' },
    { text: 'Check in on work presentation (scheduled for 03/18)', due: 'Due: Next session' },
    { text: 'Assess readiness for exposure hierarchy work', due: 'Due: Soon' },
  ];
  const tasks = [
    { title: 'Complete thought record daily', sub: 'Track 1-2 anxiety episodes per day', due: 'Due: Next session' },
    { title: 'Practice PMR before bed', sub: '5 nights minimum', due: 'Due: Next session' },
    { title: 'Prepare presentation notes', sub: null, due: 'Due: March 17, 2026', grey: true },
  ];
  return (
    <V2Shell title="Last Activity Summary" subtitle="Session 18 • March 12, 2026" onBack={onBack} client={client} sidebarW={sidebarW}>
      <div style={{ flex: 1, overflowY: 'auto', padding: compactMode ? '0 16px 24px' : '0 24px 32px' }}>
        <div style={{ position: 'sticky', top: 0, height: 20, background: 'white', zIndex: 5, marginLeft: compactMode ? -16 : -24, marginRight: compactMode ? -16 : -24 }} />

        {/* Session Plan */}
        <p style={{ ...P, fontSize: compactMode ? 15 : 18, fontWeight: 500, color: 'rgba(0,0,0,0.87)', letterSpacing: '0.018px', lineHeight: 1.57, marginBottom: compactMode ? 10 : 16 }}>Session Plan &amp; Key Points</p>
        <div style={{ border: '1px solid rgba(0,0,0,0.12)', borderRadius: 16, padding: 16, marginBottom: 32, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {sessionBullets.map((b, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ ...P, fontSize: 16, fontWeight: 500, color: '#212121', lineHeight: '24px', flexShrink: 0, marginTop: 4 }}>•</span>
              <span style={{ ...P, fontSize: 14, fontWeight: 400, color: '#212121', lineHeight: 1.43, letterSpacing: '0.17px' }}>{b}</span>
            </div>
          ))}
          <button style={{ alignSelf: 'flex-end', display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <span style={{ ...P, fontSize: 14, fontWeight: 500, color: '#2d4ccd', letterSpacing: '0.46px', lineHeight: '26px' }}>View Full Session</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 18L15 12L9 6" stroke="#2d4ccd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>

        {/* Follow-Ups */}
        <p style={{ ...P, fontSize: compactMode ? 15 : 18, fontWeight: 500, color: 'rgba(0,0,0,0.87)', letterSpacing: '0.018px', lineHeight: 1.57, marginBottom: compactMode ? 10 : 16 }}>Follow-Ups to Revisit</p>
        <div style={{ border: '1px solid rgba(0,0,0,0.12)', borderRadius: 8, overflow: 'hidden', marginBottom: 32 }}>
          {followUps.map((f, i) => (
            <React.Fragment key={i}>
              {i > 0 && <div style={{ height: 1, background: '#e2e8f0' }} />}
              <div style={{ padding: '16px 16px 12px' }}>
                <p style={{ ...P, fontSize: 14, fontWeight: 400, color: '#212121', lineHeight: 1.43, letterSpacing: '0.17px', marginBottom: 8 }}>{f.text}</p>
                <Chip label={f.due} />
              </div>
            </React.Fragment>
          ))}
        </div>

        {/* Tasks & Homework */}
        <p style={{ ...P, fontSize: compactMode ? 15 : 18, fontWeight: 500, color: 'rgba(0,0,0,0.87)', letterSpacing: '0.018px', lineHeight: 1.57, marginBottom: compactMode ? 10 : 16 }}>Tasks &amp; Homework Assigned</p>
        <div style={{ border: '1px solid rgba(0,0,0,0.12)', borderRadius: 8, overflow: 'hidden' }}>
          {tasks.map((t, i) => (
            <React.Fragment key={i}>
              {i > 0 && <div style={{ height: 1, background: '#e2e8f0' }} />}
              <div style={{ padding: '16px 16px 12px', display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
                <div>
                  <p style={{ ...P, fontSize: 14, fontWeight: 400, color: '#212121', lineHeight: 1.43, letterSpacing: '0.17px', marginBottom: t.sub ? 3 : 0 }}>{t.title}</p>
                  {t.sub && <p style={{ ...P, fontSize: 12, fontWeight: 400, color: 'rgba(0,0,0,0.6)', lineHeight: 1.66, letterSpacing: '0.4px' }}>{t.sub}</p>}
                </div>
                <Chip label={t.due} grey={!!t.grey} />
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </V2Shell>
  );
}

// ── Screen 3 & 4: Most Frequent Themes (Circles + Heatmap) ───────────────────
function V2MostFrequentThemes({ onBack, client, sidebarW = 467 }) {
  const P = { fontFamily: 'Poppins, sans-serif' };
  const [view, setView] = useState('Circles');

  const trendInsights = [
    { up: true,  text: 'Anxiety mentions increased 12% in the last 4 sessions' },
    { up: false, text: 'Work stress mentions decreased 8% recently' },
    { up: false, text: 'Sleep issues mentions decreased 15% in recent sessions' },
  ];

  // Heatmap data: 5 themes × 18 sessions
  const heatThemes = [
    { label: 'Anxiety',               total: 42, vals: [3,2,3,2,3,3,2,3,2,3,2,3,2,2,3,2,2,3] },
    { label: 'Self-esteem',            total: 28, vals: [2,1,2,1,2,2,1,2,1,2,1,2,1,1,2,1,1,2] },
    { label: 'Work stress',            total: 24, vals: [3,3,2,1,0,2,1,2,2,1,0,1,1,0,2,0,0,3] },
    { label: 'Sleep issues',           total: 18, vals: [3,3,2,2,1,1,0,0,1,0,1,0,0,0,1,0,0,2] },
    { label: 'Relationship concerns',  total: 12, vals: [0,0,1,0,1,1,2,0,1,0,2,0,2,0,1,0,0,3] },
  ];
  const heatColor = (v) => ['#e8ecf8','#b3c0ee','#3d5bd4','#1a3ab8'][v] ?? '#e8ecf8';

  return (
    <V2Shell title="Most Frequent Themes" subtitle="Patterns across 18 sessions" onBack={onBack} client={client} sidebarW={sidebarW}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px 32px' }}>
        <div style={{ position: 'sticky', top: 0, height: 16, background: 'white', zIndex: 5, marginLeft: -24, marginRight: -24 }} />

        {/* Toggle */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <V2Toggle options={['Circles', 'Heatmap']} value={view} onChange={setView} />
        </div>

        {/* Main chart card */}
        <div style={{ border: '1px solid rgba(0,0,0,0.12)', borderRadius: 12, padding: '20px 16px 16px', marginBottom: 24 }}>
          {view === 'Circles' ? (
            /* Bubble chart */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
              {/* Depression — top centre */}
              <div style={{ width: 130, height: 130, borderRadius: '50%', background: '#29b6f6', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: -12 }}>
                <span style={{ ...P, fontSize: 24, fontWeight: 600, color: 'white', lineHeight: 1 }}>15</span>
                <span style={{ ...P, fontSize: 13, fontWeight: 400, color: 'white', letterSpacing: '0.17px' }}>Depression</span>
              </div>
              {/* Substance Use + Anxiety — side by side */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <div style={{ width: 108, height: 108, borderRadius: '50%', background: '#ffa726', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ ...P, fontSize: 20, fontWeight: 600, color: 'white', lineHeight: 1 }}>11</span>
                  <span style={{ ...P, fontSize: 12, fontWeight: 400, color: 'white', letterSpacing: '0.17px', textAlign: 'center', lineHeight: 1.3 }}>Substance{'\n'}Use</span>
                </div>
                <div style={{ width: 108, height: 108, borderRadius: '50%', background: '#ec407a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ ...P, fontSize: 20, fontWeight: 600, color: 'white', lineHeight: 1 }}>11</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    <span style={{ ...P, fontSize: 12, fontWeight: 400, color: 'white', letterSpacing: '0.17px' }}>Anxiety</span>
                  </div>
                </div>
              </div>
              {/* Zoom controls */}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', width: '100%', marginTop: 12 }}>
                {['+','−'].map(s => (
                  <button key={s} style={{ width: 28, height: 28, border: '1px solid rgba(0,0,0,0.2)', borderRadius: '50%', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', ...P, fontSize: 16, color: 'rgba(0,0,0,0.6)' }}>{s}</button>
                ))}
              </div>
            </div>
          ) : (
            /* Heatmap */
            <div>
              <p style={{ ...P, fontSize: 12, fontWeight: 400, color: 'rgba(0,0,0,0.6)', letterSpacing: '0.4px', lineHeight: 1.66, marginBottom: 12 }}>Darker colors = more mentions in that session</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {heatThemes.map(th => (
                  <div key={th.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ ...P, fontSize: 14, fontWeight: 500, color: 'rgba(0,0,0,0.87)', letterSpacing: '0.17px' }}>{th.label}</span>
                      <span style={{ ...P, fontSize: 12, fontWeight: 400, color: 'rgba(0,0,0,0.6)', letterSpacing: '0.4px' }}>{th.total} total</span>
                    </div>
                    <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                      {th.vals.map((v, i) => (
                        <div key={i} style={{ width: 16, height: 16, borderRadius: 3, background: heatColor(v) }} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {/* Legend */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16 }}>
                {[['#e8ecf8','None'],['#b3c0ee','Low'],['#3d5bd4','Med'],['#1a3ab8','High']].map(([bg,label]) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 14, height: 14, borderRadius: 3, background: bg }} />
                    <span style={{ ...P, fontSize: 11, fontWeight: 400, color: 'rgba(0,0,0,0.6)', letterSpacing: '0.4px' }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Trend Insights */}
        <p style={{ ...P, fontSize: 16, fontWeight: 500, color: 'rgba(0,0,0,0.87)', letterSpacing: '0.15px', marginBottom: 12 }}>Trend Insights</p>
        <div style={{ border: '1px solid rgba(0,0,0,0.12)', borderRadius: 8, overflow: 'hidden' }}>
          {trendInsights.map((t, i) => (
            <React.Fragment key={i}>
              {i > 0 && <div style={{ height: 1, background: 'rgba(0,0,0,0.08)', marginLeft: 16 }} />}
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '12px 16px' }}>
                <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{t.up ? '↗' : '↘'}</span>
                <span style={{ ...P, fontSize: 13, fontWeight: 400, color: 'rgba(0,0,0,0.87)', lineHeight: 1.43, letterSpacing: '0.17px' }}>{t.text}</span>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </V2Shell>
  );
}

// ── Screen 5: Themes by Session ───────────────────────────────────────────────
function V2ThemesBySession({ onBack, client, sidebarW = 467 }) {
  const P = { fontFamily: 'Poppins, sans-serif' };
  const [expanded, setExpanded] = useState(new Set([0]));
  const sessions = [
    { label: 'Session 18 • Mar 12, 2026', themes: ['Anxiety','Self-esteem','Work stress'], extra: ['Sleep issues'] },
    { label: 'Session 17 • Mar 5, 2026',  themes: ['Anxiety','Self-esteem','Relationship concerns'] },
    { label: 'Session 16 • Feb 26, 2026', themes: ['Anxiety','Work stress','Boundaries'] },
    { label: 'Session 15 • Feb 19, 2026', themes: ['Anxiety','Self-esteem','Relationship concerns'] },
    { label: 'Session 14 • Feb 12, 2026', themes: ['Anxiety','Sleep issues','Work stress'] },
    { label: 'Session 13 • Feb 5, 2026',  themes: ['Self-esteem','Relationship concerns','Communication'] },
    { label: 'Session 12 • Jan 29, 2026', themes: ['Self-esteem','Work stress','Sleep issues'], extra: ['Anxiety'] },
    { label: 'Session 11 • Jan 22, 2026', themes: ['Relationship concerns','Emotional regulation','Boundaries'] },
    { label: 'Session 10 • Jan 15, 2026', themes: ['Work stress','Sleep issues','Self-care'] },
    { label: 'Session 9 • Jan 8, 2026',   themes: ['Anxiety','Work stress'] },
    { label: 'Session 8 • Jan 1, 2026',   themes: ['Sleep issues','Stress management','Mindfulness'] },
    { label: 'Session 7 • Dec 18, 2025',  themes: ['Anxiety','Family dynamics','Holiday stress'] },
  ];
  const ThemeChip = ({ label }) => (
    <div style={{ background: '#eaedfa', borderRadius: 4, padding: '2px 8px' }}>
      <span style={{ ...P, fontSize: 12, fontWeight: 500, color: '#2d4ccd', lineHeight: 'normal' }}>{label}</span>
    </div>
  );
  return (
    <V2Shell title="Themes by Session" subtitle="Patterns across 18 sessions" onBack={onBack} client={client} sidebarW={sidebarW}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px 32px' }}>
        <div style={{ position: 'sticky', top: 0, height: 20, background: 'white', zIndex: 5, marginLeft: -24, marginRight: -24 }} />
        <div style={{ border: '1px solid rgba(0,0,0,0.12)', borderRadius: 12, overflow: 'hidden' }}>
          {sessions.map((s, i) => {
            const isExp = expanded.has(i);
            const allThemes = s.themes.concat(s.extra || []);
            const shown = isExp ? allThemes : s.themes;
            const hasMore = (s.extra || []).length > 0;
            return (
              <React.Fragment key={i}>
                {i > 0 && <div style={{ height: 1, background: 'rgba(0,0,0,0.08)' }} />}
                <div style={{ padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2d4ccd', flexShrink: 0, marginTop: 6 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ ...P, fontSize: 14, fontWeight: 600, color: 'rgba(0,0,0,0.87)', letterSpacing: '0.17px' }}>{s.label}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                        <span style={{ ...P, fontSize: 12, fontWeight: 400, color: 'rgba(0,0,0,0.6)', letterSpacing: '0.4px' }}>{`${allThemes.length} themes`}</span>
                        {/* Always render chevron so the count label stays aligned; hide it when nothing to expand */}
                        <button
                          onClick={hasMore ? () => setExpanded(prev => { const n = new Set(prev); isExp ? n.delete(i) : n.add(i); return n; }) : undefined}
                          style={{ background: 'none', border: 'none', padding: 0, cursor: hasMore ? 'pointer' : 'default', display: 'flex', alignItems: 'center', opacity: hasMore ? 1 : 0, pointerEvents: hasMore ? 'auto' : 'none' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ transform: isExp ? 'rotate(180deg)' : 'none', transition: 'transform 0.18s ease' }}>
                            <path d="M6 9L12 15L18 9" stroke="rgba(0,0,0,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {shown.map(t => <ThemeChip key={t} label={t} />)}
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </V2Shell>
  );
}

// ── Screen 6 & 7: Treatment Goals (By Status + Timeline) ─────────────────────
function V2TreatmentGoals({ onBack, client, sidebarW = 467 }) {
  const P = { fontFamily: 'Poppins, sans-serif' };
  const [view, setView] = useState('By Status');

  const goals = [
    { title: 'Reduce anxiety symptoms to manageable levels', set: 'Nov 2025', target: 'May 2026', status: 'in-progress', pct: 65,
      milestones: [{ text: 'Learn 3 grounding techniques', done: true }, { text: 'Practice daily thought records', done: true }, { text: 'Reduce avoidance behaviors', done: false }] },
    { title: 'Improve sleep quality and duration', set: 'Nov 2025', target: 'Feb 2026', status: 'met',
      milestones: [{ text: 'Establish sleep hygiene routine', done: true }, { text: 'Reduce sleep latency to <30 min', done: true }, { text: 'Achieve 7+ hours consistently', done: true }] },
    { title: 'Develop assertiveness skills at work', set: 'Dec 2025', target: 'Jun 2026', status: 'in-progress', pct: 40, milestones: [] },
    { title: 'Build self-compassion practices', set: 'Jan 2026', target: 'Jul 2026', status: 'in-progress', pct: 55, milestones: [] },
    { title: 'Strengthen social connections', set: 'Feb 2026', target: 'Aug 2026', status: 'not-started', milestones: [] },
  ];
  const met = goals.filter(g => g.status === 'met');
  const inProgress = goals.filter(g => g.status === 'in-progress');
  const notStarted = goals.filter(g => g.status === 'not-started');

  const statusDot = (s) => ({ met: '#00a63e', 'in-progress': '#2d4ccd', 'not-started': '#cfd8dc' }[s] || '#cfd8dc');
  const statusLabel = (s) => ({ met: 'Met', 'in-progress': 'In Progress', 'not-started': 'Not Started' }[s]);

  const ProgressBar = ({ pct, color = '#2d4ccd' }) => (
    <div style={{ height: 6, background: '#e8ecf8', borderRadius: 9999, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 9999, transition: 'width 0.3s ease' }} />
    </div>
  );

  const GoalCard = ({ g, showMilestones }) => (
    <div style={{ background: 'white', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 8, padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ ...P, fontSize: 14, fontWeight: 600, color: 'rgba(0,0,0,0.87)', lineHeight: 1.43, letterSpacing: '0.17px', flex: 1 }}>{g.title}</span>
        {g.pct != null && <span style={{ ...P, fontSize: 13, fontWeight: 600, color: 'rgba(0,0,0,0.87)', letterSpacing: '0.16px', flexShrink: 0 }}>{g.pct}%</span>}
      </div>
      <span style={{ ...P, fontSize: 12, fontWeight: 400, color: 'rgba(0,0,0,0.6)', letterSpacing: '0.4px' }}>Set {g.set} • Target {g.target}</span>
      {g.pct != null && <ProgressBar pct={g.pct} />}
      {showMilestones && g.milestones.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
          {g.milestones.map((m, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                {m.done
                  ? <><circle cx="12" cy="12" r="9" stroke="#2d4ccd" strokeWidth="1.5"/><path d="M8 12l3 3 5-5" stroke="#2d4ccd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></>
                  : <circle cx="12" cy="12" r="9" stroke="rgba(0,0,0,0.28)" strokeWidth="1.5"/>
                }
              </svg>
              <span style={{ ...P, fontSize: 13, fontWeight: 400, color: m.done ? 'rgba(0,0,0,0.38)' : 'rgba(0,0,0,0.87)', letterSpacing: '0.17px', textDecoration: m.done ? 'line-through' : 'none' }}>{m.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <V2Shell title="Treatment Goals" subtitle="5 goals tracked • 1 met" onBack={onBack} client={client} sidebarW={sidebarW}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px 32px' }}>
        <div style={{ position: 'sticky', top: 0, height: 16, background: 'white', zIndex: 5, marginLeft: -24, marginRight: -24 }} />

        {/* Toggle */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <V2Toggle options={['By Status','Timeline']} value={view} onChange={setView} />
        </div>

        {view === 'By Status' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Stats row */}
            <div style={{ display: 'flex', gap: 8 }}>
              {[{ n: 1, label: 'Met', color: '#00a63e' }, { n: 3, label: 'In Progress', color: '#2d4ccd' }, { n: 1, label: 'Not Started', color: 'rgba(0,0,0,0.38)' }].map(s => (
                <div key={s.label} style={{ flex: 1, border: '1px solid rgba(0,0,0,0.12)', borderRadius: 8, padding: '12px 8px', textAlign: 'center' }}>
                  <div style={{ ...P, fontSize: 22, fontWeight: 600, color: s.color, letterSpacing: '0.018px', lineHeight: 1.2 }}>{s.n}</div>
                  <div style={{ ...P, fontSize: 12, fontWeight: 400, color: 'rgba(0,0,0,0.6)', letterSpacing: '0.4px', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Met */}
            <div>
              <p style={{ ...P, fontSize: 16, fontWeight: 500, color: 'rgba(0,0,0,0.87)', letterSpacing: '0.15px', marginBottom: 12 }}>Met ({met.length})</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{met.map((g, i) => <GoalCard key={i} g={g} showMilestones />)}</div>
            </div>

            {/* In Progress */}
            <div>
              <p style={{ ...P, fontSize: 16, fontWeight: 500, color: 'rgba(0,0,0,0.87)', letterSpacing: '0.15px', marginBottom: 12 }}>In Progress ({inProgress.length})</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{inProgress.map((g, i) => <GoalCard key={i} g={g} showMilestones />)}</div>
            </div>

            {/* Not Started */}
            <div>
              <p style={{ ...P, fontSize: 16, fontWeight: 500, color: 'rgba(0,0,0,0.87)', letterSpacing: '0.15px', marginBottom: 12 }}>Not Started ({notStarted.length})</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{notStarted.map((g, i) => <GoalCard key={i} g={g} showMilestones={false} />)}</div>
            </div>
          </div>
        ) : (
          /* Timeline view */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {goals.map((g, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, paddingBottom: 20 }}>
                {/* Dot + line */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: statusDot(g.status), marginTop: 4, flexShrink: 0 }} />
                  {i < goals.length - 1 && <div style={{ width: 2, flex: 1, background: 'rgba(0,0,0,0.1)', marginTop: 4 }} />}
                </div>
                {/* Content */}
                <div style={{ flex: 1, paddingBottom: 4 }}>
                  <span style={{ ...P, fontSize: 14, fontWeight: 600, color: 'rgba(0,0,0,0.87)', lineHeight: 1.43, letterSpacing: '0.17px' }}>{g.title}</span>
                  <p style={{ ...P, fontSize: 12, fontWeight: 400, color: 'rgba(0,0,0,0.6)', letterSpacing: '0.4px', margin: '3px 0 8px' }}>{g.set} – {g.target} • {statusLabel(g.status)}</p>
                  {g.pct != null && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ flex: 1 }}><ProgressBar pct={g.pct} /></div>
                      <span style={{ ...P, fontSize: 13, fontWeight: 600, color: 'rgba(0,0,0,0.87)', letterSpacing: '0.16px', flexShrink: 0 }}>{g.pct}%</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {/* Not Started section */}
            <div style={{ borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: 20, marginTop: 4 }}>
              <p style={{ ...P, fontSize: 16, fontWeight: 500, color: 'rgba(0,0,0,0.87)', letterSpacing: '0.15px', marginBottom: 12 }}>Not Started (1)</p>
              {notStarted.map((g, i) => <GoalCard key={i} g={g} showMilestones={false} />)}
            </div>
          </div>
        )}
      </div>
    </V2Shell>
  );
}

// ── Main client detail panel — routes to sub-screens ─────────────────────────
function ClientDetailPanelV2({ client, onBack, sidebarW = 467 }) {
  const P = { fontFamily: 'Poppins, sans-serif' };
  const compactMode = sidebarW < 380;
  const SHADOW_EL4 = V2_SHADOW_EL4;
  const SHADOW_CARD = V2_SHADOW_CARD;
  const [detailView, setDetailView] = useState(null); // null | 'activity' | 'themes' | 'themes-by-session' | 'goals'
  const [askOpen, setAskOpen] = useState(false);

  // Route to detail screens
  if (detailView === 'activity')          return <V2LastActivity onBack={() => setDetailView(null)} client={client} sidebarW={sidebarW} />;
  if (detailView === 'themes')            return <V2MostFrequentThemes onBack={() => setDetailView(null)} client={client} sidebarW={sidebarW} />;
  if (detailView === 'themes-by-session') return <V2ThemesBySession onBack={() => setDetailView(null)} client={client} sidebarW={sidebarW} />;
  if (detailView === 'goals')             return <V2TreatmentGoals onBack={() => setDetailView(null)} client={client} sidebarW={sidebarW} />;

  const bullets = [
    'Continued CBT work on negative thought patterns',
    'Patient reports improved sleep with PMR technique',
    'Successfully used thought records during work presentation',
  ];
  const themeChips = ['Anxiety · 12x', 'Self-esteem · 8x', 'Work stress · 10x'];
  const goalLegend = [
    { color: '#00a63e', label: '1 Done' },
    { color: '#2d4ccd', label: '5 In Progress' },
    { color: '#cfd8dc', label: '1 Not Started' },
  ];

  const InfoIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="rgba(0,0,0,0.54)" strokeWidth="1.5"/>
      <path d="M12 8.5h.01M12 11v5" stroke="rgba(0,0,0,0.54)" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );

  const SectionHeader = ({ title }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: compactMode ? 10 : 16 }}>
      <span style={{ ...P, fontSize: compactMode ? 15 : 18, fontWeight: 500, color: 'rgba(0,0,0,0.87)', lineHeight: 1.57, letterSpacing: '0.018px' }}>{title}</span>
      <InfoIcon />
    </div>
  );

  const SignalCard = ({ icon, title, children, onClick }) => (
    <div onClick={onClick} style={{ background: 'white', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 8, padding: compactMode ? '10px 12px' : 16, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: compactMode ? 7 : 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: compactMode ? 6 : 8 }}>
          {icon}
          <span style={{ ...P, fontSize: compactMode ? 13 : 16, fontWeight: 600, color: 'rgba(0,0,0,0.87)', letterSpacing: '0.15px', lineHeight: 1.5 }}>{title}</span>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M9 18L15 12L9 6" stroke="rgba(0,0,0,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      {children}
    </div>
  );

  // Brain icon (Most Frequent Themes)
  const BrainIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M9.5 2C7 2 5 4 5 6.5c0 .83.24 1.6.65 2.25C4.67 9.3 4 10.33 4 11.5c0 1.38.88 2.56 2.1 3.03C6.04 14.83 6 15.16 6 15.5c0 1.93 1.57 3.5 3.5 3.5h5c1.93 0 3.5-1.57 3.5-3.5 0-.34-.04-.67-.1-.97C19.12 14.06 20 12.88 20 11.5c0-1.17-.67-2.2-1.65-2.75.41-.65.65-1.42.65-2.25C19 4 17 2 14.5 2c-1 0-1.92.34-2.65.9A4.48 4.48 0 009.5 2z" stroke="rgba(0,0,0,0.87)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 2v17M9 8h1.5M13.5 8H15M9 12h1.5M13.5 12H15" stroke="rgba(0,0,0,0.87)" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );

  // Layers icon (Themes by Session)
  const LayersIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="rgba(0,0,0,0.87)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 17l10 5 10-5" stroke="rgba(0,0,0,0.87)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 12l10 5 10-5" stroke="rgba(0,0,0,0.87)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  // Goal / target icon (Treatment Goals)
  const GoalIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="rgba(0,0,0,0.87)" strokeWidth="1.5"/>
      <circle cx="12" cy="12" r="5" stroke="rgba(0,0,0,0.87)" strokeWidth="1.5"/>
      <circle cx="12" cy="12" r="1.5" fill="rgba(0,0,0,0.87)"/>
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3" stroke="rgba(0,0,0,0.87)" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#EAEDFA', gap: 8, overflow: 'hidden' }}>
      {/* ── Header ── */}
      <div style={{ background: 'white', borderRadius: 16, paddingTop: compactMode ? 14 : 24, paddingBottom: compactMode ? 10 : 16, paddingLeft: compactMode ? 10 : 16, paddingRight: compactMode ? 10 : 16, boxShadow: SHADOW_EL4, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="#212121" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <FigmaUserAvatar />
        </div>
        <div style={{ textAlign: 'center', padding: '0 10px' }}>
          <div style={{ ...P, fontSize: compactMode ? 15 : 18, fontWeight: 600, color: '#212121', lineHeight: 1.57, letterSpacing: '0.018px' }}>{client.name}</div>
          <div style={{ ...P, fontSize: compactMode ? 12 : 14, lineHeight: 1.43, letterSpacing: '0.17px', marginTop: 2 }}>
            <span style={{ color: 'rgba(0,0,0,0.6)' }}>Client ID</span>
            {' '}<span style={{ color: '#212121' }}>CL{String(client.id).padStart(6, '0')}</span>
          </div>
        </div>
      </div>

      {/* ── Content + Ask Eleos ── */}
      <div style={{ flex: 1, background: 'white', borderRadius: '16px 16px 0 0', boxShadow: '0px 6px 30px 5px rgba(0,0,0,0.12)', overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column' }}>
        {/* Scrollable area */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingBottom: 80 }}>
          {/* Sticky spacer */}
          <div style={{ position: 'sticky', top: 0, height: 20, background: 'white', zIndex: 5, marginLeft: -24, marginRight: -24 }} />

          <div style={{ padding: compactMode ? '0 16px 16px' : '0 24px 24px' }}>
            {/* Stats banner */}
            <div style={{ background: '#fafafa', borderRadius: 8, padding: compactMode ? '10px 12px 8px' : '16px 16px 12px', marginBottom: compactMode ? 20 : 32 }}>
              <p style={{ ...P, fontSize: compactMode ? 12 : 14, fontWeight: 400, color: 'rgba(0,0,0,0.87)', lineHeight: 1.43, letterSpacing: '0.17px', margin: '0 0 4px' }}>
                38 activities documented · Since Aug 2024
              </p>
              <p style={{ ...P, fontSize: compactMode ? 11 : 12, fontWeight: 400, color: 'rgba(0,0,0,0.6)', lineHeight: 1.66, letterSpacing: '0.4px', margin: 0 }}>
                Last session: Mar 12, 2026
              </p>
            </div>

            {/* ── Prep & Follow-Ups ── */}
            <div style={{ marginBottom: compactMode ? 20 : 32 }}>
              <SectionHeader title="Prep & Follow-Ups" />
              <div style={{ background: 'white', borderRadius: 8, boxShadow: SHADOW_CARD, padding: compactMode ? '10px 12px' : 16, display: 'flex', flexDirection: 'column', gap: compactMode ? 6 : 8 }}>
                {/* Title row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="#294355" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M14 2v6h6M9 13h6M9 17h4" stroke="#294355" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    <span style={{ ...P, fontSize: compactMode ? 13 : 16, fontWeight: 600, color: 'rgba(0,0,0,0.87)', letterSpacing: '0.15px', lineHeight: 1.5 }}>Activity Overview</span>
                  </div>
                  <button onClick={() => setDetailView('activity')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2, padding: '4px 0' }}>
                    <span style={{ ...P, fontSize: compactMode ? 12 : 14, fontWeight: 500, color: '#2d4ccd', letterSpacing: '0.46px', lineHeight: '26px' }}>{compactMode ? 'View' : 'View Note'}</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M9 18L15 12L9 6" stroke="#2d4ccd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
                {/* Date */}
                <p style={{ ...P, fontSize: 12, fontWeight: 400, color: 'rgba(0,0,0,0.6)', lineHeight: 1.66, letterSpacing: '0.4px', margin: 0 }}>
                  March 12, 2026 • Session 18
                </p>
                {/* Bullets */}
                <div style={{ background: '#fafafa', borderRadius: 10, padding: compactMode ? '10px 12px' : '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {bullets.map((b, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                        <span style={{ ...P, fontSize: compactMode ? 13 : 16, fontWeight: 500, color: 'rgba(0,0,0,0.87)', lineHeight: '24px', flexShrink: 0 }}>•</span>
                        <span style={{ ...P, fontSize: compactMode ? 12 : 14, fontWeight: 400, color: '#212121', lineHeight: 1.43, letterSpacing: '0.17px' }}>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Clinical Signals ── */}
            <div style={{ marginBottom: compactMode ? 20 : 32 }}>
              <SectionHeader title="Clinical Signals" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <SignalCard icon={<BrainIcon />} title="Most Frequent Themes" onClick={() => setDetailView('themes')}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <span style={{ ...P, fontSize: 12, fontWeight: 400, color: 'rgba(0,0,0,0.6)', letterSpacing: '0.4px', lineHeight: 1.66 }}>Top Themes</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {themeChips.map(chip => (
                        <div key={chip} style={{ background: '#eaedfa', borderRadius: 4, padding: '3px 6px 3px 4px' }}>
                          <span style={{ ...P, fontSize: 12, fontWeight: 500, color: '#2d4ccd', lineHeight: 'normal' }}>{chip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </SignalCard>
                <SignalCard icon={<LayersIcon />} title="Themes by Session" onClick={() => setDetailView('themes-by-session')}>
                  <span style={{ ...P, fontSize: 12, fontWeight: 400, color: 'rgba(0,0,0,0.6)', letterSpacing: '0.4px', lineHeight: 1.66 }}>Total themes: 23</span>
                </SignalCard>
              </div>
            </div>

            {/* ── Engagement & Progress ── */}
            <div>
              <SectionHeader title="Engagement & Progress" />
              <SignalCard icon={<GoalIcon />} title="Treatment Goals" onClick={() => setDetailView('goals')}>
                {/* Legend dots */}
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                  {goalLegend.map(({ color, label }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
                      <span style={{ ...P, fontSize: 12, fontWeight: 400, color: 'rgba(0,0,0,0.6)', letterSpacing: '0.4px', lineHeight: 1.66 }}>{label}</span>
                    </div>
                  ))}
                </div>
                {/* Progress bar */}
                <div style={{ background: '#fafafa', borderRadius: 10, padding: 8 }}>
                  <p style={{ ...P, fontSize: 12, fontWeight: 400, color: 'rgba(0,0,0,0.87)', letterSpacing: '0.4px', textAlign: 'right', margin: '0 0 2px' }}>65%</p>
                  <div style={{ height: 8, borderRadius: 9999, overflow: 'hidden', display: 'flex' }}>
                    <div style={{ background: '#00a63e', width: '13.3%' }} />
                    <div style={{ background: '#2d4ccd', width: '72%' }} />
                    <div style={{ background: '#cfd8dc', flex: 1 }} />
                  </div>
                </div>
              </SignalCard>
            </div>
          </div>
        </div>

        {/* ── Ask Eleos bar ── */}
        <AskEleosBar onOpen={() => setAskOpen(true)} P={P} />

        {/* ── Ask Eleos Drawer ── */}
        {askOpen && <AskEleosDrawer onClose={() => setAskOpen(false)} client={client} P={P} compactMode={compactMode} />}
      </div>
    </div>
  );
}

// ── Ask Eleos bar (reused in both the panel and the drawer) ───────────────────
function AskEleosBar({ onOpen, P }) {
  return (
    <div
      onClick={onOpen}
      style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#eaedfa', padding: '13px 20px', boxShadow: '0px 1px 14px 0px rgba(0,0,0,0.12), 0px 5px 8px 0px rgba(0,0,0,0.14), 0px 3px 5px 0px rgba(0,0,0,0.2)', cursor: 'pointer' }}
    >
      <div style={{ background: 'white', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 9999, padding: '1px 13px 1px 17px', height: 58, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ ...P, flex: 1, fontSize: 14, fontWeight: 500, color: 'rgba(0,0,0,0.6)', lineHeight: '20px' }}>Ask Eleos…</span>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#2d4ccd', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 20V4M12 4L6 10M12 4L18 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
}

// ── Ask Eleos Drawer ──────────────────────────────────────────────────────────
const ASK_ELEOS_ACTIONS = [
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke="rgba(0,0,0,0.87)" strokeWidth="1.5" strokeLinecap="round"/>
        <rect x="9" y="3" width="6" height="4" rx="1" stroke="rgba(0,0,0,0.87)" strokeWidth="1.5"/>
        <path d="M9 14l2 2 4-4" stroke="rgba(0,0,0,0.87)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Prepare for Activity',
    desc: 'Get ready with key context and next steps',
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke="rgba(0,0,0,0.87)" strokeWidth="1.5" strokeLinecap="round"/>
        <rect x="9" y="3" width="6" height="4" rx="1" stroke="rgba(0,0,0,0.87)" strokeWidth="1.5"/>
        <path d="M9 12h6M9 16h4" stroke="rgba(0,0,0,0.87)" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Discharge Summary',
    desc: 'Generate Discharge Summary based on the clients notes',
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="rgba(0,0,0,0.87)" strokeWidth="1.5"/>
        <circle cx="12" cy="12" r="4" stroke="rgba(0,0,0,0.87)" strokeWidth="1.5"/>
        <circle cx="12" cy="12" r="1.5" fill="rgba(0,0,0,0.87)"/>
      </svg>
    ),
    title: 'Treatment Plan',
    desc: 'Plan, monitor, and update treatment goals',
  },
];

const SOURCE_DETAILS = {
  'Session 11 · Mar 26': {
    title: 'Session Note — March 26, 2026',
    subtitle: 'Behavioral activation homework partially completed. Client reports using breathing techniques during stressful work meetings.',
  },
  'Session 10 · Mar 19': {
    title: 'Session Note — March 19, 2026',
    subtitle: 'Anxiety spike observed ahead of performance review. Sleep log shows improvement on nights following grounding practice.',
  },
  'Session 9 · Mar 12': {
    title: 'Session Note — March 12, 2026',
    subtitle: 'Introduced behavioral activation plan. Client expressed ambivalence. Continued CBT focus on workplace cognitions.',
  },
  'Session 8 · Feb 19': {
    title: 'Session Note — February 19, 2026',
    subtitle: 'Safety screening completed — no SI/HI reported. Avoidance patterns around manager conflict clearly identified.',
  },
  'Session 1 · Aug 2024': {
    title: 'Intake Session — August 14, 2024',
    subtitle: 'GAD-7 score: 16 (severe). Primary concerns: workplace anxiety, sleep difficulties, and conflict avoidance with manager.',
  },
  'Treatment Plan · Feb 2026': {
    title: 'Treatment Plan — February 2026',
    subtitle: 'Primary diagnosis: GAD (F41.1). Active goals: reduce anxiety, improve conflict management, build sleep routine.',
  },
};

function SourceChip({ label, P, compactMode = false }) {
  const [hovered, setHovered] = useState(false);
  const isOverflow = label.startsWith('+');
  const detail = SOURCE_DETAILS[label];

  return (
    <div
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => !isOverflow && detail && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: hovered ? '#dce1f7' : '#eaedfa', borderRadius: 4, padding: '3px 7px 3px 5px', cursor: detail ? 'pointer' : 'default', transition: 'background 0.15s ease' }}>
        {!isOverflow && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="#2d4ccd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="#2d4ccd" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        )}
        <span style={{ ...P, fontSize: 11, fontWeight: 500, color: '#2d4ccd', letterSpacing: '0.16px', lineHeight: '16px', whiteSpace: 'nowrap' }}>{label}</span>
      </div>

      {hovered && detail && (
        <div style={{
          position: 'absolute',
          bottom: 'calc(100% + 8px)',
          /* In compact mode anchor to right edge so tooltip doesn't spill past sidebar */
          ...(compactMode ? { right: 0, left: 'auto' } : { left: 0 }),
          background: '#fff',
          borderRadius: compactMode ? 12 : 16,
          boxShadow: '0px 6px 30px 5px rgba(0,0,0,0.12), 0px 16px 24px 1px rgba(0,0,0,0.10), 0px 8px 10px -5px rgba(0,0,0,0.20)',
          padding: compactMode ? '12px 14px' : '16px 20px',
          width: compactMode ? 210 : 280,
          zIndex: 200,
          pointerEvents: 'none',
        }}>
          <div style={{ display: 'flex', gap: compactMode ? 8 : 10, alignItems: 'flex-start' }}>
            <div style={{ width: compactMode ? 26 : 32, height: compactMode ? 26 : 32, borderRadius: '50%', background: '#eaedfa', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="#2d4ccd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="#2d4ccd" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
              <div style={{ ...P, fontSize: compactMode ? 12 : 14, fontWeight: 500, color: '#2d4ccd', lineHeight: '20px', letterSpacing: '0.4px' }}>{detail.title}</div>
              <div style={{ ...P, fontSize: compactMode ? 11 : 12, fontWeight: 400, color: 'rgba(33,33,33,0.6)', lineHeight: 1.5, letterSpacing: '0.4px' }}>{detail.subtitle}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AskEleosDrawer({ onClose, client, P, compactMode = false }) {
  const [expanded, setExpanded] = useState(false);
  const [chatAction, setChatAction] = useState(null);
  const [messages, setMessages] = useState([]); // { role:'user'|'assistant', type:'text'|'card', text }
  const [inputText, setInputText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [replyCount, setReplyCount] = useState(0);
  const [loaderTextIdx, setLoaderTextIdx] = useState(0);
  const chatBottomRef = useRef(null);

  const LOADER_TEXTS = ['Thinking...', 'Checking relevant info...', 'Reviewing session context...', 'Almost there...'];

  useEffect(() => {
    if (!isReplying) { setLoaderTextIdx(0); return; }
    const iv = setInterval(() => setLoaderTextIdx(i => (i + 1) % LOADER_TEXTS.length), 1800);
    return () => clearInterval(iv);
  }, [isReplying]);

  const EXTRA_ACTIONS = [
    {
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke="rgba(0,0,0,0.87)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      title: 'Progress Summary',
      desc: 'Summary of progress based on documented notes',
    },
    {
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L4 6v6c0 5.1 3.4 9.9 8 11 4.6-1.1 8-5.9 8-11V6l-8-4z" stroke="rgba(0,0,0,0.87)" strokeWidth="1.5" strokeLinejoin="round"/>
          <path d="M9 12l2 2 4-4" stroke="rgba(0,0,0,0.87)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      title: 'Prior Auth Letter',
      desc: 'Medical necessity summary for authorization',
    },
    {
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M9 6l2 2 4-4" stroke="rgba(0,0,0,0.87)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 12l2 2 4-4" stroke="rgba(0,0,0,0.87)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 18l2 2 4-4" stroke="rgba(0,0,0,0.87)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      title: 'Supervision Review',
      desc: 'Supervision-ready summary of key decisions',
    },
  ];

  const allActions = expanded ? [...ASK_ELEOS_ACTIONS, ...EXTRA_ACTIONS] : ASK_ELEOS_ACTIONS;

  const CHAT_PROMPTS = {
    'Prepare for Activity': 'Create a pre-session brief for this client based on the most recent documented notes and trends.',
    'Discharge Summary': 'Generate a discharge summary based on all documented sessions for this client.',
    'Treatment Plan': 'Generate an updated treatment plan based on current goals and progress.',
    'Progress Summary': 'Summarize clinical progress across all documented sessions.',
    'Prior Auth Letter': 'Generate a prior authorization letter summarizing medical necessity.',
    'Supervision Review': 'Prepare a supervision-ready summary of key clinical decisions.',
  };

  const clientName = client?.name ?? 'Client';
  const sessionNum = client?.sessionCount ?? 12;

  const PREPARE_SECTIONS = [
    {
      heading: 'Recent Trends',
      items: [
        'Work-related anxiety increased across last 4 sessions — remains primary focus',
        'Sleep difficulties correlating with workplace stress — tracking via sleep log',
        'Avoidance patterns identified around conflict conversations with manager',
      ],
      sources: ['Session 11 · Mar 26', 'Session 10 · Mar 19', '+2'],
    },
    {
      heading: 'Key Updates Since Last Session',
      items: [
        'Behavioral activation homework partially completed — review barriers',
        'Client reports using breathing techniques during stressful work meetings',
        'Continued CBT work on negative thought patterns around performance',
      ],
      sources: ['Session 11 · Mar 26'],
    },
    {
      heading: 'Active Goals',
      items: [
        'Reduce anxiety symptoms — 50% progress',
        'Improve conflict management at work — 35% progress',
        'Build consistent sleep routine — 45% progress',
      ],
      sources: ['Treatment Plan · Feb 2026'],
    },
    {
      heading: 'Suggested Focus Areas',
      items: [
        'Follow up on behavioral activation homework completion',
        'Explore cognitive distortions around manager relationship',
        'Review sleep log and reinforce sleep hygiene strategies',
      ],
      sources: ['Session 11 · Mar 26', 'Treatment Plan · Feb 2026'],
    },
  ];

  const getFollowUpReply = (userText) => {
    const q = userText.toLowerCase();
    if (/cognitiv|restructur|thought|cbt|distort/.test(q))
      return `${clientName}'s CBT progress has been steady. Cognitive restructuring is being applied mainly to performance-related thoughts at work. The most recurrent distortions are catastrophising ("I'll lose my job") and mind-reading ("My manager thinks I'm incompetent"). These would be good targets to revisit with a thought record this session.`;
    if (/sleep|insomnia|rest|fatigue|tired/.test(q))
      return `The sleep log shows ${clientName} is averaging 5.5 hours on workday nights versus 7 hours on weekends — a clear stress-linked pattern. Grounding exercises before bed correlated with better sleep on 8 of the last 12 logged nights. Reinforcing that connection explicitly could strengthen motivation to keep practicing.`;
    if (/homework|task|compli|activat/.test(q))
      return `Homework completion has been partial — approximately 65% across recent sessions. The main barrier reported is low motivation after work. It may help to reduce the task complexity temporarily (e.g., 5-minute check-ins instead of full thought records) to rebuild the habit, then re-escalate once momentum returns.`;
    if (/goal|progress|target|measur/.test(q))
      return `Current goal progress:\n\n• **Reduce anxiety symptoms** — 50% (GAD-7 down from 16 to 9)\n• **Improve conflict management at work** — 35% (slowest-moving goal)\n• **Build consistent sleep routine** — 45%\n\nThe conflict management goal is the most behind. Breaking it into concrete micro-experiments — like one low-stakes assertive comment per week — could help accelerate it.`;
    if (/risk|safe|suicid|harm|crisis/.test(q))
      return `No active risk indicators documented. Most recent safety screening was conducted in session 11 — no SI or HI reported. ${clientName} has a current safety plan on file, last reviewed session 8. Plan includes two identified support contacts and a crisis line. Recommend re-reviewing the plan this session given the elevated stress period.`;
    if (/medic|prescri|psychiatr|drug|medication/.test(q))
      return `No psychiatric medication is currently documented for ${clientName}. There is a note from session 6 indicating ${clientName} expressed interest in exploring medication as an adjunct — this was discussed but not pursued. If anxiety levels remain elevated, a referral to a prescriber for evaluation may be worth revisiting.`;
    if (/manager|work|conflict|boss|colleague|job/.test(q))
      return `The workplace conflict remains one of the most active stressors. ${clientName} has continued to avoid direct conversations with their manager, which is reinforcing the anxiety cycle. A graduated exposure plan starting with low-stakes assertiveness (e.g., disagreeing in a small group setting) could be a practical next step before addressing the manager directly.`;
    if (/family|relationship|partner|spouse|social/.test(q))
      return `Social support appears limited — ${clientName} has mentioned feeling isolated outside of work. There's a reference in session 9 notes to tension with a sibling that was not fully explored. No partner or close relationship documented. Exploring social support more deliberately could be a useful addition to the treatment focus.`;
    if (/session|next|plan|today|this week/.test(q))
      return `For this session, the documented priorities are: review of behavioral activation homework, continued cognitive restructuring around workplace performance, and a check-in on the sleep log. Given the partial homework completion, starting with a brief barrier assessment before moving to new content would likely be most productive.`;
    // fallback — rotate a few general contextual replies
    const fallbacks = [
      `Based on the documented history, ${clientName} is making gradual progress. The primary area still needing attention is the avoidance pattern around direct conflict — this is the clearest blocker to the work performance goal.`,
      `${clientName} has strong verbal insight and responds well to Socratic questioning. If engagement feels lower than usual this session, a values-clarification exercise could help re-anchor motivation.`,
      `It's worth noting that anxiety levels tend to spike for ${clientName} around performance review periods. Check whether any upcoming evaluations at work might be contributing to current presentation.`,
    ];
    return fallbacks[replyCount % fallbacks.length];
  };

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isReplying]);

  const INITIAL_RESPONSES = {
    'Prepare for Activity': null, // rendered as card
    'Discharge Summary': `Here's a discharge summary for ${clientName}:\n\n**Reason for Discharge:** Client completed the agreed course of 16 CBT sessions and has met primary treatment goals.\n\n**Clinical Progress:** ${clientName} demonstrated significant reduction in anxiety symptoms (GAD-7 score improved from 16 to 7). Developed effective coping strategies for workplace conflict and sleep difficulties. Behavioral activation goals largely achieved.\n\n**Recommendations:** Step down to monthly check-ins for 3 months. Referral to community support group for ongoing peer connection. Client has strong self-management skills and a written relapse prevention plan in place.`,
    'Treatment Plan': `Here's the updated treatment plan for ${clientName}:\n\n**Primary Diagnosis:** Generalized Anxiety Disorder (F41.1)\n\n**Goals & Progress:**\n• Reduce anxiety symptoms to manageable levels — 50% achieved (GAD-7: 16 → 9)\n• Improve conflict management at work — 35% achieved\n• Build consistent sleep routine — 45% achieved\n\n**Interventions:** Continue weekly CBT focusing on cognitive restructuring around workplace conflict. Introduce exposure hierarchy for avoided conversations. Maintain sleep log and review hygiene strategies each session.\n\n**Next Review:** Progress reassessment in 4 sessions. Consider stepping down frequency if GAD-7 reaches ≤7.`,
    'Progress Summary': `Here's a clinical progress summary for ${clientName} across ${sessionNum} documented sessions:\n\n**Overall Trajectory:** Gradual improvement with periodic stress-related setbacks. Client engagement is consistently high — attends regularly and completes homework approximately 65% of the time.\n\n**Key Milestones:** Identified core avoidance patterns in session 4. Introduced behavioral activation in session 7 with moderate uptake. Sleep log started session 9 — showing positive correlation with grounding practice.\n\n**Areas of Concern:** Workplace conflict with manager remains unresolved. Anxiety spikes observed around performance review periods. Recommend continued focus on cognitive restructuring before next review cycle.`,
    'Prior Auth Letter': `**Prior Authorization Letter — Medical Necessity Summary**\n\nPatient: ${clientName} | DOB: 03/14/1989 | Insurance ID: BCA-4471-09\n\nTo Whom It May Concern,\n\nI am writing to request continued authorization for individual psychotherapy services (CPT 90837) for the above-named patient. ${clientName} presents with a primary diagnosis of Generalized Anxiety Disorder (F41.1) and secondary diagnosis of Adjustment Disorder with Anxious Mood (F43.23).\n\nClinical necessity is supported by a GAD-7 score of 9 (moderate severity), documented functional impairment in occupational settings, and partial response to treatment indicating continued need for weekly sessions. Discharge at this stage would risk clinical deterioration.\n\nRequesting authorization for 12 additional sessions. Please contact me for any further documentation.`,
    'Supervision Review': `Here's a supervision-ready summary for ${clientName}:\n\n**Clinical Decision Points:**\n• Maintained weekly frequency despite client request to reduce — rationale: GAD-7 remains elevated, avoidance patterns not yet resolved\n• Chose not to introduce EMDR given insufficient trauma history clarity — deferred pending further assessment\n• Safety screening conducted at sessions 8 and 12 — no SI/HI reported, safety plan reviewed and updated\n\n**Ethical Considerations:** Client disclosed work colleague is also a current patient — managed via consultation, no dual relationship identified.\n\n**Countertransference Notes:** Clinician noted personal resonance with client's workplace dynamics — reviewed in peer consultation on 03/18.\n\n**Recommended Supervision Focus:** Case conceptualization around avoidance and the manager relationship; pacing of exposure work.`,
  };

  const handleSelectAction = (action) => {
    setChatAction(action);
    const prompt = CHAT_PROMPTS[action.title] ?? action.desc;
    setMessages([{ role: 'user', text: prompt }]);
    setIsReplying(true);
    setTimeout(() => {
      setIsReplying(false);
      const isCard = action.title === 'Prepare for Activity';
      const responseText = INITIAL_RESPONSES[action.title] ?? `Here's the information for ${clientName} based on documented session history.`;
      const responseSources = {
        'Discharge Summary':   ['Session 11 · Mar 26', 'Session 10 · Mar 19', '+9'],
        'Treatment Plan':      ['Treatment Plan · Feb 2026', 'Session 9 · Mar 12'],
        'Progress Summary':    ['Session 11 · Mar 26', 'Session 1 · Aug 2024', '+9'],
        'Prior Auth Letter':   ['Treatment Plan · Feb 2026', 'Session 11 · Mar 26'],
        'Supervision Review':  ['Session 11 · Mar 26', 'Session 8 · Feb 19', '+3'],
      }[action.title];
      setMessages(prev => [...prev, {
        role: 'assistant',
        type: isCard ? 'card' : 'text',
        text: responseText,
        sources: responseSources,
      }]);
    }, 4000);
  };

  const handleBack = () => {
    setChatAction(null);
    setMessages([]);
    setInputText('');
    setIsReplying(false);
  };

  const handleSend = () => {
    const text = inputText.trim();
    if (!text || isReplying) return;
    setInputText('');
    if (!chatAction) {
      setChatAction({ title: 'Ask Eleos', desc: text, icon: null });
    }
    setMessages(prev => [...prev, { role: 'user', text }]);
    setIsReplying(true);
    const delay = 3000 + Math.random() * 1500;
    setTimeout(() => {
      setIsReplying(false);
      const reply = getFollowUpReply(text);
      setMessages(prev => [...prev, { role: 'assistant', type: 'text', text: reply }]);
      setReplyCount(c => c + 1);
    }, delay);
  };

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 20, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <style>{`
        @keyframes askDrawerIn {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes askOverlayIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes askChatIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes askDot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40%            { transform: scale(1);   opacity: 1; }
        }
        .ask-action-card {
          transition: background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease, transform 0.1s ease;
        }
        .ask-action-card:hover {
          background: #f4f6ff !important;
          border-color: #2d4ccd !important;
          box-shadow: 0 2px 8px rgba(45,76,205,0.12) !important;
          transform: translateY(-1px);
        }
        .ask-action-card:active {
          background: #eaedfa !important;
          transform: translateY(0);
          box-shadow: none !important;
        }
        .ask-dot { width: 7px; height: 7px; border-radius: 50%; background: rgba(0,0,0,0.35); animation: askDot 1.4s infinite ease-in-out; }
        .ask-dot:nth-child(1) { animation-delay: 0s; }
        .ask-dot:nth-child(2) { animation-delay: 0.2s; }
        .ask-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes loaderTextFade { 0% { opacity: 0; transform: translateY(4px); } 15% { opacity: 1; transform: translateY(0); } 80% { opacity: 1; transform: translateY(0); } 100% { opacity: 0; transform: translateY(-3px); } }
        .ask-loader-text { animation: loaderTextFade 1.8s ease both; }
      `}</style>

      {/* Scrim */}
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', animation: 'askOverlayIn 0.25s ease both' }}
      />

      {/* Drawer */}
      <div style={{
        position: 'relative', background: 'white',
        borderRadius: '16px 16px 0 0',
        display: 'flex', flexDirection: 'column',
        animation: 'askDrawerIn 0.32s cubic-bezier(0.16,1,0.3,1) both',
        overflow: 'hidden',
        maxHeight: '90vh',
      }}>
        {/* Header */}
        <div style={{ padding: compactMode ? '12px 14px 0' : '16px 20px 0', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {chatAction ? (
            <button onClick={handleBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="rgba(0,0,0,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          ) : <div style={{ width: 28 }} />}
          <span style={{ ...P, flex: 1, textAlign: 'center', fontSize: compactMode ? 13 : 14, fontWeight: 600, color: 'rgba(0,0,0,0.87)', letterSpacing: '0.17px' }}>
            {chatAction ? chatAction.title : 'Ask Eleos'}
          </span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="rgba(0,0,0,0.54)" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {chatAction ? (
          /* ── Chat view ── */
          <div style={{ flex: 1, overflowY: 'auto', padding: compactMode ? '10px 10px 8px' : '16px 16px 12px', display: 'flex', flexDirection: 'column', gap: compactMode ? 10 : 16, minHeight: 0 }}>
            {messages.map((msg, i) => {
              if (msg.role === 'user') {
                return (
                  <div key={i} style={{ display: 'flex', justifyContent: 'flex-end', paddingLeft: compactMode ? 24 : 40 }}>
                    <div style={{ background: '#2d4ccd', borderRadius: '16px 16px 4px 16px', padding: compactMode ? '8px 12px' : '12px 16px' }}>
                      <p style={{ ...P, fontSize: compactMode ? 12 : 14, fontWeight: 400, color: 'white', letterSpacing: '0.17px', lineHeight: 1.43, margin: 0 }}>
                        {msg.text}
                      </p>
                    </div>
                  </div>
                );
              }
              /* Assistant message */
              const AiAvatar = () => (
                <div style={{ width: compactMode ? 22 : 28, height: compactMode ? 22 : 28, borderRadius: '50%', background: '#eaedfa', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L9.5 9.5L2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z" fill="#2d4ccd"/>
                  </svg>
                </div>
              );
              if (msg.type === 'card') {
                return (
                  <div key={i} style={{ animation: 'askChatIn 0.35s ease both', display: 'flex', alignItems: 'flex-start', gap: compactMode ? 6 : 10 }}>
                    <AiAvatar />
                    <div style={{ flex: 1, background: '#fafafa', borderRadius: 12, padding: compactMode ? '10px 12px' : 16, display: 'flex', flexDirection: 'column', gap: compactMode ? 16 : 24 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <div style={{ ...P, fontSize: compactMode ? 14 : 18, fontWeight: 600, color: '#212121', letterSpacing: '0.018px', lineHeight: 1.57 }}>
                          Pre-Session Brief — {clientName}
                        </div>
                        <div style={{ ...P, fontSize: compactMode ? 11 : 12, fontWeight: 400, color: 'rgba(0,0,0,0.6)', letterSpacing: '0.4px', lineHeight: 1.66 }}>
                          Session {sessionNum} · Scheduled: Apr 8, 2026
                        </div>
                      </div>
                      {PREPARE_SECTIONS.map((section) => (
                        <div key={section.heading} style={{ display: 'flex', flexDirection: 'column', gap: compactMode ? 5 : 8 }}>
                          <div style={{ ...P, fontSize: compactMode ? 13 : 16, fontWeight: 600, color: '#212121', letterSpacing: '0.15px', lineHeight: '24px' }}>
                            {section.heading}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: compactMode ? 5 : 8 }}>
                            {section.items.map((item, j) => (
                              <p key={j} style={{ ...P, fontSize: compactMode ? 12 : 14, fontWeight: 400, color: '#212121', letterSpacing: '0.17px', lineHeight: 1.43, margin: 0 }}>• {item}</p>
                            ))}
                          </div>
                          {section.sources && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 2 }}>
                              {section.sources.map((src, si) => (
                                <SourceChip key={si} label={src} P={P} compactMode={compactMode} />
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                      <div style={{ borderTop: '1px solid rgba(0,0,0,0.12)', paddingTop: 9 }}>
                        <p style={{ ...P, fontSize: 12, fontWeight: 400, color: 'rgba(0,0,0,0.6)', letterSpacing: '0.4px', lineHeight: 1.66, margin: 0 }}>
                          Based on {sessionNum} documented sessions · Aug 2024 – Apr 2026
                        </p>
                      </div>
                    </div>
                  </div>
                );
              }
              return (
                <div key={i} style={{ animation: 'askChatIn 0.35s ease both', display: 'flex', alignItems: 'flex-start', gap: compactMode ? 6 : 10 }}>
                  <AiAvatar />
                  <div style={{ flex: 1, background: '#fafafa', borderRadius: 12, padding: compactMode ? '8px 12px' : '12px 16px', display: 'flex', flexDirection: 'column', gap: compactMode ? 5 : 8 }}>
                    {msg.text.split('\n\n').map((para, pi) => (
                      <p key={pi} style={{ ...P, fontSize: compactMode ? 12 : 14, fontWeight: 400, color: '#212121', letterSpacing: '0.17px', lineHeight: 1.57, margin: 0 }}>
                        {para.split(/(\*\*[^*]+\*\*)/).map((chunk, ci) =>
                          chunk.startsWith('**') && chunk.endsWith('**')
                            ? <strong key={ci} style={{ fontWeight: 600 }}>{chunk.slice(2, -2)}</strong>
                            : chunk
                        )}
                      </p>
                    ))}
                    {msg.sources && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, paddingTop: 4, borderTop: '1px solid rgba(0,0,0,0.08)', marginTop: 4 }}>
                        {msg.sources.map((src, si) => (
                          <SourceChip key={si} label={src} P={P} compactMode={compactMode} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {isReplying && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#eaedfa', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L9.5 9.5L2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z" fill="#2d4ccd"/>
                  </svg>
                </div>
                <div style={{ background: '#fafafa', borderRadius: 12, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                    <div className="ask-dot" /><div className="ask-dot" /><div className="ask-dot" />
                  </div>
                  <span key={loaderTextIdx} className="ask-loader-text" style={{ ...P, fontSize: 12, fontWeight: 400, color: 'rgba(0,0,0,0.45)', letterSpacing: '0.4px', lineHeight: 1.5 }}>
                    {LOADER_TEXTS[loaderTextIdx]}
                  </span>
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>
        ) : (
          /* ── Home view ── */
          <>
            {/* Greeting */}
            <div style={{ padding: compactMode ? '6px 16px 18px' : '8px 24px 28px', textAlign: 'center' }}>
              <div style={{ ...P, fontSize: compactMode ? 15 : 18, fontWeight: 500, color: 'rgba(0,0,0,0.87)', letterSpacing: '0.018px', lineHeight: 1.57 }}>
                Hello {DEMO_PROVIDER.firstName}
              </div>
              <div style={{ ...P, fontSize: compactMode ? 15 : 18, fontWeight: 500, color: 'rgba(0,0,0,0.87)', letterSpacing: '0.018px', lineHeight: 1.57 }}>
                How can I help you today?
              </div>
            </div>

            {/* Action cards */}
            <div style={{ padding: compactMode ? '8px 16px 0' : '12px 24px 0', display: 'flex', flexDirection: 'column', gap: compactMode ? 8 : 12, overflowY: 'auto', maxHeight: '55vh' }}>
              {allActions.map((action, i) => (
                <button
                  key={i}
                  className="ask-action-card"
                  onClick={() => handleSelectAction(action)}
                  style={{ background: 'white', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 8, padding: compactMode ? '10px 12px' : 16, textAlign: 'left', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: compactMode ? 4 : 8, width: '100%' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: compactMode ? 8 : 12 }}>
                    <div style={{ flexShrink: 0 }}>{action.icon}</div>
                    <span style={{ ...P, fontSize: compactMode ? 13 : 16, fontWeight: 600, color: 'rgba(0,0,0,0.87)', letterSpacing: '0.15px', lineHeight: 1.5 }}>{action.title}</span>
                  </div>
                  <p style={{ ...P, fontSize: compactMode ? 12 : 14, fontWeight: 400, color: 'rgba(0,0,0,0.87)', letterSpacing: '0.17px', lineHeight: 1.43, margin: 0 }}>{action.desc}</p>
                </button>
              ))}
            </div>

            {/* Expand more */}
            <div style={{ padding: compactMode ? '8px 16px 4px' : '12px 24px 4px' }}>
              <button
                onClick={() => setExpanded(e => !e)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, padding: 0 }}
              >
                <span style={{ ...P, fontSize: 14, fontWeight: 600, color: '#2d4ccd', letterSpacing: '0', lineHeight: '21px' }}>
                  {expanded ? 'Show less' : 'Expand more'}
                </span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'none' }}>
                  <path d="M6 9l6 6 6-6" stroke="#2d4ccd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </>
        )}

        {/* Bottom bar — always visible */}
        <div style={{ background: '#eaedfa', padding: '13px 20px', marginTop: 4, flexShrink: 0, boxShadow: '0px 1px 14px 0px rgba(0,0,0,0.12), 0px 5px 8px 0px rgba(0,0,0,0.14), 0px 3px 5px 0px rgba(0,0,0,0.2)' }}>
          <div style={{ background: 'white', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 9999, padding: '1px 13px 1px 17px', height: 58, display: 'flex', alignItems: 'center', gap: 12 }}>
            <input
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
              placeholder="Ask Eleos…"
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', ...P, fontSize: 14, fontWeight: 400, color: 'rgba(0,0,0,0.87)', lineHeight: '20px' }}
            />
            <button
              onClick={handleSend}
              disabled={!inputText.trim() || isReplying}
              style={{ width: 32, height: 32, borderRadius: '50%', background: inputText.trim() && !isReplying ? '#2d4ccd' : 'rgba(0,0,0,0.12)', border: 'none', cursor: inputText.trim() && !isReplying ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.15s ease' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 20V4M12 4L6 10M12 4L18 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Add Summary Panel ─────────────────────────────────────────────────────────

// Tag options per category (full list)
const TAG_OPTIONS = {
  Data: ['Session attended', 'Client engaged', 'Client resistant', 'Homework reviewed', 'Homework not completed', 'Psychoeducation provided', 'Skills practice', 'Self-report: mood improved', 'Self-report: mood declined'],
  Assessment: ['Progress noted', 'Goals on track', 'Risk assessed – low', 'Risk assessed – moderate', 'Safety plan reviewed', 'Substance use discussed', 'Mood stabilizing', 'Insight improving', 'Barriers identified'],
  Plan: ['Continue weekly sessions', 'Follow-up in 2 weeks', 'Homework assigned', 'Safety plan updated', 'Referral submitted', 'Consult psychiatry', 'Review at next session', 'Increase session frequency'],
};

// Filter chips per category — null tags means show all
const TAG_FILTERS = {
  Data: [
    { label: 'All',        tags: null },
    { label: 'Engagement', tags: ['Session attended', 'Client engaged', 'Client resistant'] },
    { label: 'Homework',   tags: ['Homework reviewed', 'Homework not completed'] },
    { label: 'Skills',     tags: ['Psychoeducation provided', 'Skills practice'] },
    { label: 'Mood',       tags: ['Self-report: mood improved', 'Self-report: mood declined'] },
  ],
  Assessment: [
    { label: 'All',      tags: null },
    { label: 'Progress', tags: ['Progress noted', 'Goals on track', 'Insight improving'] },
    { label: 'Risk',     tags: ['Risk assessed – low', 'Risk assessed – moderate', 'Safety plan reviewed'] },
    { label: 'Mood',     tags: ['Mood stabilizing', 'Substance use discussed'] },
    { label: 'Barriers', tags: ['Barriers identified'] },
  ],
  Plan: [
    { label: 'All',      tags: null },
    { label: 'Sessions', tags: ['Continue weekly sessions', 'Follow-up in 2 weeks', 'Review at next session', 'Increase session frequency'] },
    { label: 'Homework', tags: ['Homework assigned'] },
    { label: 'Safety',   tags: ['Safety plan updated', 'Referral submitted'] },
    { label: 'Clinical', tags: ['Consult psychiatry'] },
  ],
};

// Helper: format ISO date to display string
function formatDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[parseInt(m,10)-1]} ${parseInt(d,10)}, ${y}`;
}

// Helper: format HH:MM to 12h display
function formatTime(t) {
  if (!t) return '';
  const [hStr, mStr] = t.split(':');
  let h = parseInt(hStr, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${mStr} ${ampm}`;
}

// Tag picker field — filter chips + floating dropdown
function TagField({ label, selected, onChange }) {
  const P = { fontFamily: 'Poppins, sans-serif' };
  const [open, setOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [counterHovered, setCounterHovered] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const filters = TAG_FILTERS[label] || [{ label: 'All', tags: null }];
  const allOpts = TAG_OPTIONS[label] || [];
  const activeFilterObj = filters.find(f => f.label === activeFilter) || filters[0];
  const visibleOpts = activeFilterObj.tags ? allOpts.filter(o => activeFilterObj.tags.includes(o)) : allOpts;
  const toggle = (tag) => onChange(selected.includes(tag) ? selected.filter(t => t !== tag) : [...selected, tag]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Reset filter when closed
  useEffect(() => { if (!open) setActiveFilter('All'); }, [open]);

  // Track trigger position for fixed dropdown — recompute on scroll too
  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const update = () => {
      const r = triggerRef.current.getBoundingClientRect();
      setDropdownPos({ top: r.bottom + 4, left: r.left, width: r.width });
    };
    update();
    window.addEventListener('scroll', update, true);
    return () => window.removeEventListener('scroll', update, true);
  }, [open]);

  return (
    <div ref={containerRef} style={{ marginBottom: 16, position: 'relative' }}>
      <span style={{ ...P, fontSize: 16, fontWeight: 500, color: '#212121', lineHeight: 1.57, letterSpacing: '0.1px', display: 'block', marginBottom: 8 }}>{label}</span>

      {/* Trigger — chips live inside */}
      <div
        ref={triggerRef}
        onClick={() => setOpen(v => !v)}
        style={{ background: 'white', border: `1px solid ${open ? '#2d4ccd' : selected.length > 0 ? 'rgba(45,76,205,0.5)' : 'rgba(33,33,33,0.23)'}`, borderRadius: 8, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', userSelect: 'none', minHeight: 40 }}
      >
        {selected.length === 0 ? (
          <span style={{ ...P, flex: 1, fontSize: 16, color: 'rgba(33,33,33,0.38)', lineHeight: '24px', letterSpacing: '0.15px' }}>Add Suggestions</span>
        ) : (
          <>
            {/* Visible chips — max 2 */}
            <div style={{ display: 'flex', gap: 4, flex: 1, minWidth: 0, alignItems: 'center', overflow: 'hidden' }}>
              {selected.slice(0, 2).map(tag => (
                <span key={tag} style={{ ...P, display: 'inline-flex', alignItems: 'center', gap: 2, background: 'rgba(45,76,205,0.06)', color: '#2d4ccd', fontSize: 12, fontWeight: 500, borderRadius: 4, padding: '3px 4px', lineHeight: '18px', letterSpacing: '0.16px', flex: '0 1 auto', minWidth: 0, maxWidth: 120 }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>{tag}</span>
                  <span onMouseDown={e => { e.preventDefault(); e.stopPropagation(); toggle(tag); }} style={{ opacity: 0.7, cursor: 'pointer', fontSize: 13, lineHeight: 1, flexShrink: 0, marginLeft: 1 }}>×</span>
                </span>
              ))}
            </div>
            {/* Overflow counter — lives outside the chips container so tooltip isn't clipped */}
            {selected.length > 2 && (
              <span
                style={{ position: 'relative', flexShrink: 0 }}
                onMouseEnter={() => setCounterHovered(true)}
                onMouseLeave={() => setCounterHovered(false)}
              >
                {/* Counter pill */}
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 24, minHeight: 24, maxHeight: 24, border: '1px solid #2d4ccd', borderRadius: 100, padding: '3px 4px', cursor: 'default' }}>
                  <span style={{ ...P, fontSize: 12, fontWeight: 500, color: '#2d4ccd', lineHeight: '18px', letterSpacing: '0.16px', padding: '0 6px' }}>+{selected.length - 2}</span>
                </span>
                {/* Tooltip */}
                {counterHovered && (
                  <div style={{ position: 'absolute', bottom: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)', zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'none' }}>
                    <div style={{ background: 'white', borderRadius: 4, padding: 8, boxShadow: '0 1px 10px rgba(0,0,0,0.1), 0 4px 10px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: 6, whiteSpace: 'nowrap' }}>
                      {selected.slice(2).map(tag => (
                        <span key={tag} style={{ ...P, display: 'inline-flex', alignItems: 'center', background: 'rgba(45,76,205,0.06)', color: '#2d4ccd', fontSize: 12, fontWeight: 500, borderRadius: 4, padding: '3px 8px', lineHeight: '18px', letterSpacing: '0.16px' }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div style={{ width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '6px solid white', filter: 'drop-shadow(0 2px 1px rgba(0,0,0,0.08))' }} />
                  </div>
                )}
              </span>
            )}
            {/* Clear-all */}
            <span onMouseDown={e => { e.preventDefault(); e.stopPropagation(); onChange([]); }} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', flexShrink: 0, color: 'rgba(33,33,33,0.54)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
            </span>
          </>
        )}
        {/* Chevron */}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s', flexShrink: 0 }}>
          <path d="M6 9l6 6 6-6" stroke={open ? '#2d4ccd' : 'rgba(33,33,33,0.54)'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {/* Floating dropdown — position:fixed so it's never clipped by overflow:auto ancestors */}
      {open && (
        <div style={{ position: 'fixed', top: dropdownPos.top, left: dropdownPos.left, width: dropdownPos.width, background: 'white', borderRadius: 8, boxShadow: '0 2px 1px -1px rgba(0,0,0,0.2), 0 1px 1px 0 rgba(0,0,0,0.05), 0 4px 10px 0 rgba(0,0,0,0.1)', zIndex: 300, overflow: 'hidden' }}>

          {/* Filter chip row */}
          <div style={{ display: 'flex', gap: 6, padding: '12px 12px 10px', overflowX: 'auto', scrollbarWidth: 'none' }}>
            <style>{`.tag-chips::-webkit-scrollbar{display:none}`}</style>
            {filters.map(f => {
              const isActive = f.label === activeFilter;
              return (
                <div
                  key={f.label}
                  onMouseDown={e => { e.preventDefault(); setActiveFilter(f.label); }}
                  style={{ flexShrink: 0, padding: '3px 10px', borderRadius: 4, border: `1px solid ${isActive ? '#2d4ccd' : '#bdbdbd'}`, background: isActive ? 'rgba(45,76,205,0.08)' : 'white', cursor: 'pointer', ...P, fontSize: 12, fontWeight: 500, color: isActive ? '#293d87' : '#212121', lineHeight: '18px', letterSpacing: '0.16px', whiteSpace: 'nowrap' }}
                >
                  {f.label}
                </div>
              );
            })}
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'rgba(0,0,0,0.12)', marginBottom: 4 }} />

          {/* Items list — grouped with headers when "All" is active */}
          <div style={{ maxHeight: 196, overflowY: 'auto' }}>
            {activeFilter === 'All' ? (
              // Grouped view: each non-All filter becomes a section header
              filters.filter(f => f.label !== 'All').map(group => {
                const groupOpts = allOpts.filter(o => group.tags && group.tags.includes(o));
                if (groupOpts.length === 0) return null;
                return (
                  <div key={group.label}>
                    {/* Section header — greyed, non-selectable */}
                    <div style={{ padding: '8px 16px 4px', ...P, fontSize: 12, fontWeight: 500, color: 'rgba(33,33,33,0.38)', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                      {group.label}
                    </div>
                    {groupOpts.map((opt, i) => {
                      const checked = selected.includes(opt);
                      return (
                        <div
                          key={opt}
                          onMouseDown={e => { e.preventDefault(); toggle(opt); }}
                          style={{ padding: '9px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', borderBottom: i < groupOpts.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none', background: checked ? 'rgba(45,76,205,0.06)' : 'white' }}
                          onMouseEnter={e => { if (!checked) e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = checked ? 'rgba(45,76,205,0.06)' : 'white'; }}
                        >
                          <span style={{ ...P, fontSize: 15, color: checked ? '#2d4ccd' : 'rgba(0,0,0,0.87)', lineHeight: 1.57, letterSpacing: '0.15px', fontWeight: checked ? 500 : 400 }}>{opt}</span>
                          {checked && (
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginLeft: 8 }}>
                              <path d="M2.5 8l4 4 7-7" stroke="#2d4ccd" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </div>
                      );
                    })}
                    {/* Group separator */}
                    <div style={{ height: 1, background: 'rgba(0,0,0,0.08)', margin: '4px 0' }} />
                  </div>
                );
              })
            ) : (
              // Filtered view: flat list, no headers
              visibleOpts.map((opt, i) => {
                const checked = selected.includes(opt);
                return (
                  <div
                    key={opt}
                    onMouseDown={e => { e.preventDefault(); toggle(opt); }}
                    style={{ padding: '9px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', borderBottom: i < visibleOpts.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none', background: checked ? 'rgba(45,76,205,0.06)' : 'white' }}
                    onMouseEnter={e => { if (!checked) e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = checked ? 'rgba(45,76,205,0.06)' : 'white'; }}
                  >
                    <span style={{ ...P, fontSize: 15, color: checked ? '#2d4ccd' : 'rgba(0,0,0,0.87)', lineHeight: 1.57, letterSpacing: '0.15px', fontWeight: checked ? 500 : 400 }}>{opt}</span>
                    {checked && (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginLeft: 8 }}>
                        <path d="M2.5 8l4 4 7-7" stroke="#2d4ccd" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const TEXT_SUMMARY_BULLETS = [
  '• Client attended and engaged in individual therapy session focused on coping strategies and emotional regulation.',
  '• Therapist applied CBT techniques to identify and challenge negative thought patterns and cognitive distortions.',
  '• Client demonstrated openness to exploring core beliefs contributing to current distress.',
  '• Meaningful progress noted toward treatment goal of improving emotional regulation and reducing anxiety symptoms.',
  '• Safety assessment completed — client denied suicidal or homicidal ideation and remains committed to safety plan.',
  '• Plan to continue weekly individual sessions; client will practice mindfulness and journaling exercises between sessions.',
];

function AddSummaryPanel({ initialClient = 'Marcus Webb', suggestionsData = SUGGESTIONS_DATA, onAddToNote, onAddedToEHR, onSuggestionsReached, onSuggestionsLeft, compactMode = false }) {
  const P = { fontFamily: 'Poppins, sans-serif' };
  const [phase, setPhase] = useState('info'); // 'info' | 'voice' | 'text' | 'suggestions'
  const [showCaptureDrawer, setShowCaptureDrawer] = useState(false);
  const [voiceRecording, setVoiceRecording] = useState(false);
  const [voicePaused, setVoicePaused] = useState(false);
  const [voiceSeconds, setVoiceSeconds] = useState(0);
  const voiceTimerRef = useRef(null);
  const [notes, setNotes] = useState('');
  const [animating, setAnimating] = useState(false);
  const animTimeoutsRef = useRef([]);
  const [generating, setGenerating] = useState(false);

  // Clean up bullet animation timeouts on unmount
  useEffect(() => () => animTimeoutsRef.current.forEach(clearTimeout), []);

  const handleTextareaKeyDown = (e) => {
    if (e.key === 'Enter' && notes.trim() === '' && !animating) {
      e.preventDefault();
      setAnimating(true);
      animTimeoutsRef.current.forEach(clearTimeout);
      animTimeoutsRef.current = [];
      let accumulated = '';
      TEXT_SUMMARY_BULLETS.forEach((bullet, i) => {
        const t = setTimeout(() => {
          accumulated += (i === 0 ? '' : '\n') + bullet;
          setNotes(accumulated);
          if (i === TEXT_SUMMARY_BULLETS.length - 1) setAnimating(false);
        }, (i + 1) * 420);
        animTimeoutsRef.current.push(t);
      });
    }
  };
  const SHADOW_EL4 = '0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 10px 0px rgba(0,0,0,0.1), 0px 1px 10px 0px rgba(0,0,0,0.1)';
  const SHADOW_EL16 = '0px 8px 10px -5px rgba(0,0,0,0.2), 0px 16px 24px 1px rgba(0,0,0,0.1), 0px 6px 30px 5px rgba(0,0,0,0.12)';

  // ── Form field state ──────────────────────────────────────────────────────
  const [clientName, setClientName] = useState(initialClient);
  const [clientQuery, setClientQuery] = useState(initialClient);
  const [clientDropOpen, setClientDropOpen] = useState(false);
  const clientInputRef = useRef(null);
  const dateRef = useRef(null);
  const startTimeRef = useRef(null);
  const endTimeRef = useRef(null);
  const [date, setDate] = useState('2026-04-02');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('10:45');
  const [tags, setTags] = useState({ Data: [], Assessment: [], Plan: [] });

  // Notify parent when entering/leaving the suggestions phase
  useEffect(() => {
    if (phase === 'suggestions') onSuggestionsReached?.(clientName);
    else                        onSuggestionsLeft?.();
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredClients = clientQuery.trim()
    ? CLIENT_OPTIONS.filter(c => c.toLowerCase().includes(clientQuery.toLowerCase()))
    : CLIENT_OPTIONS;

  function selectClientOpt(name) { setClientName(name); setClientQuery(name); setClientDropOpen(false); }
  function clearClientField() { setClientName(''); setClientQuery(''); setClientDropOpen(false); setTimeout(() => clientInputRef.current?.focus(), 0); }

  const displayDate = formatDate(date);
  const displayStart = formatTime(startTime);
  const displayEnd = formatTime(endTime);
  const sessionHeader = clientName || '—';
  const sessionSubtitle = `${displayDate}${displayStart && displayEnd ? `, ${displayStart} – ${displayEnd}` : ''}`;

  // ── Phase 1: info form ────────────────────────────────────────────────────
  if (phase === 'info') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#EAEDFA', gap: 8, position: 'relative' }}>

        {/* Header card */}
        <div style={{ background: 'white', borderRadius: 16, boxShadow: SHADOW_EL4, flexShrink: 0, padding: '20px 16px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 8 }}>
            <FigmaUserAvatar />
          </div>
          <div style={{ textAlign: 'center', paddingBottom: 6 }}>
            <span style={{ ...P, fontSize: compactMode ? 15 : 18, fontWeight: 600, color: '#212121', lineHeight: 1.57, letterSpacing: '0.018px' }}>
              Add activity
            </span>
          </div>
        </div>

        {/* Scrollable form */}
        <div style={{ flex: 1, background: 'white', borderRadius: '16px 16px 0 0', boxShadow: SHADOW_EL16, overflowY: 'auto', padding: '0 24px 96px' }}>
          {/* Sticky top spacer */}
          <div style={{ position: 'sticky', top: 0, height: 24, background: 'white', zIndex: 5, marginLeft: -24, marginRight: -24, borderRadius: '16px 16px 0 0' }} />

          <p style={{ ...P, fontSize: compactMode ? 14 : 16, fontWeight: 500, color: '#212121', lineHeight: 1.57, letterSpacing: '0.1px', marginBottom: 24, marginTop: 0 }}>
            First, add info about the activity
          </p>

          {/* Client — autocomplete */}
          <div style={{ marginBottom: 16 }}>
            <span style={{ ...P, fontSize: compactMode ? 14 : 16, fontWeight: 500, color: '#212121', lineHeight: 1.57, letterSpacing: '0.1px', display: 'block', marginBottom: 8 }}>Client:</span>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <div
                  onClick={() => { setClientDropOpen(true); clientInputRef.current?.focus(); }}
                  style={{ background: 'white', border: `1px solid ${clientDropOpen ? '#2d4ccd' : 'rgba(33,33,33,0.23)'}`, borderRadius: clientDropOpen && filteredClients.length > 0 ? '8px 8px 0 0' : 8, padding: '8px 12px', display: 'flex', alignItems: 'center', cursor: 'text' }}
                >
                  <input
                    ref={clientInputRef}
                    value={clientQuery}
                    onChange={e => { setClientQuery(e.target.value); setClientName(''); setClientDropOpen(true); }}
                    onFocus={() => setClientDropOpen(true)}
                    onBlur={() => setTimeout(() => setClientDropOpen(false), 150)}
                    placeholder="Select client or group"
                    style={{ ...P, flex: 1, fontSize: compactMode ? 14 : 16, color: 'rgba(0,0,0,0.87)', letterSpacing: '0.15px', lineHeight: '24px', border: 'none', outline: 'none', background: 'transparent', width: '100%' }}
                  />
                  {clientQuery && (
                    <svg onMouseDown={e => { e.preventDefault(); clearClientField(); }} width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ cursor: 'pointer', flexShrink: 0 }}>
                      <path d="M4 4l8 8M12 4l-8 8" stroke="rgba(33,33,33,0.54)" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  )}
                </div>
                {clientDropOpen && filteredClients.length > 0 && (
                  <div style={{ position: 'absolute', left: 0, right: 0, top: '100%', background: 'white', border: '1px solid #2d4ccd', borderTop: 'none', borderRadius: '0 0 8px 8px', boxShadow: '0 4px 12px rgba(0,0,0,0.12)', zIndex: 100, maxHeight: 200, overflowY: 'auto' }}>
                    {filteredClients.map((name, i) => (
                      <div key={name} onMouseDown={e => { e.preventDefault(); selectClientOpt(name); }}
                        style={{ ...P, padding: '9px 12px', fontSize: 14, color: 'rgba(0,0,0,0.87)', cursor: 'pointer', borderBottom: i < filteredClients.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none', background: 'white' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#F4F6FD'}
                        onMouseLeave={e => e.currentTarget.style.background = 'white'}
                      >{name}</div>
                    ))}
                  </div>
                )}
              </div>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, cursor: 'pointer' }}>
                <path fillRule="evenodd" clipRule="evenodd" d="M11.0419 14.0775C9.70971 13.877 8.34793 14.0651 7.12002 14.6194C5.89211 15.1737 4.85024 16.0705 4.11943 17.2023C3.38862 18.3341 2.99993 19.6527 3 20.9999C3.00003 21.5522 2.55234 21.9999 2.00005 22C1.44777 22 1.00003 21.5523 1 21C0.999905 19.2679 1.49965 17.5725 2.43926 16.1174C3.37888 14.6622 4.71843 13.5092 6.29717 12.7965C7.87592 12.0839 9.62677 11.842 11.3396 12.0998C13.0524 12.3576 14.6545 13.1042 15.9535 14.25C16.3677 14.6153 16.4073 15.2473 16.0419 15.6615C15.6766 16.0756 15.0447 16.1152 14.6305 15.7499C13.6202 14.8587 12.3741 14.278 11.0419 14.0775Z" fill="#2D4BC6"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M10 4C7.79086 4 6 5.79086 6 8C6 10.2091 7.79086 12 10 12C12.2091 12 14 10.2091 14 8C14 5.79086 12.2091 4 10 4ZM4 8C4 4.68629 6.68629 2 10 2C13.3137 2 16 4.68629 16 8C16 11.3137 13.3137 14 10 14C6.68629 14 4 11.3137 4 8Z" fill="#2D4BC6"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M19 15C19.5523 15 20 15.4477 20 16V22C20 22.5523 19.5523 23 19 23C18.4477 23 18 22.5523 18 22V16C18 15.4477 18.4477 15 19 15Z" fill="#2D4BC6"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M15 19C15 18.4477 15.4477 18 16 18H22C22.5523 18 23 18.4477 23 19C23 19.5523 22.5523 20 22 20H16C15.4477 20 15 19.5523 15 19Z" fill="#2D4BC6"/>
              </svg>
            </div>
          </div>

          {/* Activity Type */}
          <AcFormField label="Activity Type:" defaultValue="Individual Therapy" options={['Individual Therapy', 'Group Therapy', 'Family Therapy', 'Crisis Intervention', 'Case Management']} compactMode={compactMode} />

          {/* Population */}
          <AcFormField label="Population:" defaultValue="Adult" options={['Adult', 'Child/Adolescent', 'Older Adult', 'Couple', 'Family']} compactMode={compactMode} />

          {/* Note Type */}
          <AcFormField label="Note Type:" defaultValue="DAP Note" options={['DAP Note', 'SOAP Note', 'Progress Note', 'Treatment Plan', 'Intake Note']} compactMode={compactMode} />

          {/* Date — native input, custom display */}
          <div style={{ marginBottom: 16 }}>
            <span style={{ ...P, fontSize: compactMode ? 14 : 16, fontWeight: 500, color: '#212121', lineHeight: 1.57, letterSpacing: '0.1px', display: 'block', marginBottom: 8 }}>Date:</span>
            <div onClick={() => dateRef.current?.showPicker()} style={{ background: 'white', border: '1px solid rgba(33,33,33,0.23)', borderRadius: 8, padding: '8px 12px', display: 'flex', alignItems: 'center', cursor: 'pointer', position: 'relative' }}>
              <span style={{ ...P, flex: 1, fontSize: compactMode ? 14 : 16, color: 'rgba(0,0,0,0.87)', lineHeight: '24px', letterSpacing: '0.15px' }}>{displayDate}</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="4" width="18" height="18" rx="2" stroke="rgba(33,33,33,0.54)" strokeWidth="1.5"/>
                <path d="M3 9h18M8 2v4M16 2v4" stroke="rgba(33,33,33,0.54)" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <input ref={dateRef} type="date" value={date} onChange={e => setDate(e.target.value)}
                style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }} />
            </div>
          </div>

          {/* Start Time */}
          <div style={{ marginBottom: 16 }}>
            <span style={{ ...P, fontSize: compactMode ? 14 : 16, fontWeight: 500, color: '#212121', lineHeight: 1.57, letterSpacing: '0.1px', display: 'block', marginBottom: 8 }}>Start Time:</span>
            <div onClick={() => startTimeRef.current?.showPicker()} style={{ background: 'white', border: '1px solid rgba(33,33,33,0.23)', borderRadius: 8, padding: '8px 12px', display: 'flex', alignItems: 'center', cursor: 'pointer', position: 'relative' }}>
              <span style={{ ...P, flex: 1, fontSize: compactMode ? 14 : 16, color: startTime ? 'rgba(0,0,0,0.87)' : 'rgba(33,33,33,0.38)', lineHeight: '24px', letterSpacing: '0.15px' }}>{displayStart || 'hh:mm AM'}</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="rgba(33,33,33,0.54)" strokeWidth="1.5"/>
                <path d="M12 7v5l3 3" stroke="rgba(33,33,33,0.54)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input ref={startTimeRef} type="time" value={startTime} onChange={e => setStartTime(e.target.value)}
                style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }} />
            </div>
          </div>

          {/* End Time */}
          <div style={{ marginBottom: 8 }}>
            <span style={{ ...P, fontSize: 16, fontWeight: 500, color: '#212121', lineHeight: 1.57, letterSpacing: '0.1px', display: 'block', marginBottom: 8 }}>End Time:</span>
            <div onClick={() => endTimeRef.current?.showPicker()} style={{ background: 'white', border: '1px solid rgba(33,33,33,0.23)', borderRadius: 8, padding: '8px 12px', display: 'flex', alignItems: 'center', cursor: 'pointer', position: 'relative' }}>
              <span style={{ ...P, flex: 1, fontSize: 16, color: endTime ? 'rgba(0,0,0,0.87)' : 'rgba(33,33,33,0.38)', lineHeight: '24px', letterSpacing: '0.15px' }}>{displayEnd || 'hh:mm AM'}</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="rgba(33,33,33,0.54)" strokeWidth="1.5"/>
                <path d="M12 7v5l3 3" stroke="rgba(33,33,33,0.54)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input ref={endTimeRef} type="time" value={endTime} onChange={e => setEndTime(e.target.value)}
                style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }} />
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#EAEDFA', padding: '16px 24px 28px', boxShadow: '0px -1px 3px rgba(0,0,0,0.12),0px -1px 1px rgba(0,0,0,0.05)' }}>
          <button
            onClick={() => setShowCaptureDrawer(true)}
            style={{ width: '100%', padding: '8px 22px', background: '#2d4ccd', color: 'white', ...P, fontWeight: 500, fontSize: 15, border: 'none', borderRadius: 4, cursor: 'pointer', letterSpacing: '0.46px', lineHeight: '26px', boxShadow: '0px 1px 5px rgba(0,0,0,0.12),0px 2px 2px rgba(0,0,0,0.14),0px 3px 1px -2px rgba(0,0,0,0.2)' }}
          >
            Next
          </button>
        </div>

        {/* Capture New Session drawer */}
        {showCaptureDrawer && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 30, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
            <style>{`
              @keyframes captureDrawerIn {
                from { transform: translateY(100%); }
                to   { transform: translateY(0); }
              }
              @keyframes captureOverlayIn {
                from { opacity: 0; }
                to   { opacity: 1; }
              }
              .capture-menu-row {
                transition: background 0.15s ease;
                border-radius: 8px;
              }
              .capture-menu-row:hover { background: #f4f6ff; }
              .capture-menu-row:active { background: #eaedfa; }
            `}</style>

            {/* Backdrop */}
            <div
              onClick={() => setShowCaptureDrawer(false)}
              style={{ position: 'absolute', inset: 0, background: 'rgba(34,54,72,0.8)', animation: 'captureOverlayIn 0.2s ease both', borderRadius: '0 0 16px 16px' }}
            />

            {/* Sheet */}
            <div style={{
              position: 'relative', background: 'white', borderRadius: '16px 16px 0 0',
              padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 16,
              animation: 'captureDrawerIn 0.3s cubic-bezier(0.16,1,0.3,1) both',
            }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', paddingRight: 20 }}>
                <button
                  onClick={() => setShowCaptureDrawer(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="rgba(0,0,0,0.87)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <span style={{ flex: 1, textAlign: 'center', ...P, fontSize: 16, fontWeight: 600, color: 'rgba(0,0,0,0.87)', letterSpacing: '0.15px', lineHeight: 1.5 }}>
                  Capture New Session
                </span>
              </div>

              {/* Menu items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Voice summary */}
                <button
                  className="capture-menu-row"
                  onClick={() => { setShowCaptureDrawer(false); setVoiceRecording(false); setVoiceSeconds(0); setPhase('voice'); }}
                  style={{ background: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', width: '100%', textAlign: 'left' }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                        <line x1="2" y1="12" x2="2" y2="12" stroke="rgba(0,0,0,0.87)" strokeWidth="1.5" strokeLinecap="round"/>
                        <line x1="6" y1="9" x2="6" y2="15" stroke="rgba(0,0,0,0.87)" strokeWidth="1.5" strokeLinecap="round"/>
                        <line x1="10" y1="6" x2="10" y2="18" stroke="rgba(0,0,0,0.87)" strokeWidth="1.5" strokeLinecap="round"/>
                        <line x1="14" y1="9" x2="14" y2="15" stroke="rgba(0,0,0,0.87)" strokeWidth="1.5" strokeLinecap="round"/>
                        <line x1="18" y1="11" x2="18" y2="13" stroke="rgba(0,0,0,0.87)" strokeWidth="1.5" strokeLinecap="round"/>
                        <line x1="22" y1="12" x2="22" y2="12" stroke="rgba(0,0,0,0.87)" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      <span style={{ ...P, fontSize: 16, fontWeight: 500, color: 'rgba(0,0,0,0.87)', letterSpacing: '0.1px', lineHeight: 1.57, flex: 1 }}>Voice summary</span>
                    </div>
                    <span style={{ ...P, fontSize: 14, fontWeight: 400, color: 'rgba(0,0,0,0.6)', letterSpacing: '0.17px', lineHeight: 1.43, paddingLeft: 36 }}>Speak freely about the activity for up to 20 minutes</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                    <span style={{ ...P, fontSize: 14, fontWeight: 500, color: '#2d4ccd', letterSpacing: '0.46px', lineHeight: '26px' }}>Start</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M9 18l6-6-6-6" stroke="#2d4ccd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </button>

                {/* Divider */}
                <div style={{ height: 1, background: 'rgba(0,0,0,0.12)', marginLeft: -16, marginRight: -16 }} />

                {/* Text Summary */}
                <button
                  className="capture-menu-row"
                  onClick={() => { setShowCaptureDrawer(false); setPhase('text'); }}
                  style={{ background: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', width: '100%', textAlign: 'left' }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                        <g clipPath="url(#tsClip)">
                          <path fillRule="evenodd" clipRule="evenodd" d="M3.87868 1.87868C4.44129 1.31607 5.20435 1 6 1H13.4C13.9523 1 14.4 1.44772 14.4 2C14.4 2.55228 13.9523 3 13.4 3H6C5.73478 3 5.48043 3.10536 5.29289 3.29289C5.10536 3.48043 5 3.73478 5 4V20C5 20.2652 5.10536 20.5196 5.29289 20.7071C5.48043 20.8946 5.73478 21 6 21H18C18.2652 21 18.5196 20.8946 18.7071 20.7071C18.8946 20.5196 19 20.2652 19 20V12.6C19 12.0477 19.4477 11.6 20 11.6C20.5523 11.6 21 12.0477 21 12.6V20C21 20.7957 20.6839 21.5587 20.1213 22.1213C19.5587 22.6839 18.7957 23 18 23H6C5.20435 23 4.44129 22.6839 3.87868 22.1213C3.31607 21.5587 3 20.7956 3 20V4C3 3.20435 3.31607 2.44129 3.87868 1.87868Z" fill="black" fillOpacity="0.6"/>
                          <path fillRule="evenodd" clipRule="evenodd" d="M1 6C1 5.44772 1.44772 5 2 5H6C6.55228 5 7 5.44772 7 6C7 6.55228 6.55228 7 6 7H2C1.44772 7 1 6.55228 1 6Z" fill="black" fillOpacity="0.6"/>
                          <path fillRule="evenodd" clipRule="evenodd" d="M1 10C1 9.44772 1.44772 9 2 9H6C6.55228 9 7 9.44772 7 10C7 10.5523 6.55228 11 6 11H2C1.44772 11 1 10.5523 1 10Z" fill="black" fillOpacity="0.6"/>
                          <path fillRule="evenodd" clipRule="evenodd" d="M1 14C1 13.4477 1.44772 13 2 13H6C6.55228 13 7 13.4477 7 14C7 14.5523 6.55228 15 6 15H2C1.44772 15 1 14.5523 1 14Z" fill="black" fillOpacity="0.6"/>
                          <path fillRule="evenodd" clipRule="evenodd" d="M1 18C1 17.4477 1.44772 17 2 17H6C6.55228 17 7 17.4477 7 18C7 18.5523 6.55228 19 6 19H2C1.44772 19 1 18.5523 1 18Z" fill="black" fillOpacity="0.6"/>
                          <path fillRule="evenodd" clipRule="evenodd" d="M17.6669 1.91486C18.2528 1.32897 19.0474 0.999817 19.876 0.999817C20.7046 0.999817 21.4992 1.32897 22.0851 1.91486C22.671 2.50075 23.0001 3.29539 23.0001 4.12397C23.0001 4.95254 22.671 5.74718 22.0851 6.33307L17.0723 11.3419C17.0723 11.3419 17.0722 11.3419 17.0722 11.3419C16.7158 11.6985 16.2752 11.9596 15.7913 12.1009L12.921 12.938C12.921 12.938 12.921 12.938 12.921 12.938C12.6628 13.0133 12.3892 13.0178 12.1287 12.951C11.8682 12.8843 11.6305 12.7488 11.4403 12.5586C11.2502 12.3685 11.1146 12.1307 11.0479 11.8702C10.9812 11.6098 10.9857 11.3361 11.061 11.078C11.061 11.078 11.061 11.078 11.061 11.078L11.8981 8.20766C12.0394 7.72382 12.3003 7.28337 12.6567 6.927C12.6568 6.92689 12.657 6.92678 12.6571 6.92666L17.6667 1.915L18.3739 2.62188L17.6669 1.91486ZM19.0812 3.32893C19.0812 3.32898 19.0811 3.32903 19.0811 3.32907L14.0709 8.34127C13.9521 8.46 13.8651 8.60674 13.818 8.76794C13.818 8.76797 13.818 8.76801 13.818 8.76804C13.8179 8.76812 13.8179 8.76819 13.8179 8.76827L13.2362 10.7627L15.2307 10.1811C15.392 10.1339 15.5389 10.0469 15.6577 9.92805L20.6709 4.91886C20.671 4.91876 20.6711 4.91867 20.6712 4.91858C20.8818 4.70778 21.0001 4.42198 21.0001 4.12397C21.0001 3.82582 20.8817 3.53989 20.6709 3.32907C20.4601 3.11825 20.1741 2.99982 19.876 2.99982C19.5779 2.99982 19.292 3.1182 19.0812 3.32893Z" fill="black" fillOpacity="0.6"/>
                        </g>
                        <defs><clipPath id="tsClip"><rect width="24" height="24" fill="white"/></clipPath></defs>
                      </svg>
                      <span style={{ ...P, fontSize: 16, fontWeight: 500, color: 'rgba(0,0,0,0.87)', letterSpacing: '0.1px', lineHeight: 1.57, flex: 1 }}>Text Summary</span>
                    </div>
                    <span style={{ ...P, fontSize: 14, fontWeight: 400, color: 'rgba(0,0,0,0.6)', letterSpacing: '0.17px', lineHeight: 1.43, paddingLeft: 36 }}>Add key details about activity in your own words</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                    <span style={{ ...P, fontSize: 14, fontWeight: 500, color: '#2d4ccd', letterSpacing: '0.46px', lineHeight: '26px' }}>Start</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M9 18l6-6-6-6" stroke="#2d4ccd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Phase 3: suggestions ─────────────────────────────────────────────────
  if (phase === 'suggestions') return <SuggestionsPanel clientName={clientName} sessionSubtitle={sessionSubtitle} onBack={() => setPhase('text')} onAddToNote={onAddToNote} onAddedToEHR={onAddedToEHR} suggestionsData={suggestionsData} compactMode={compactMode} sidebarW={467} />;

  // ── Phase 1b: voice capture ───────────────────────────────────────────────
  if (phase === 'voice') {
    const MAX_SECS = 240; // 4 min

    const startCountdown = () => {
      setVoicePaused(false);
      setVoiceSeconds(0);
      setVoiceRecording(false);
      let count = 3;
      setVoiceSeconds(-count);
      const tick = () => {
        count -= 1;
        if (count > 0) {
          setVoiceSeconds(-count);
          setTimeout(tick, 1000);
        } else {
          setVoiceSeconds(0);
          setVoiceRecording(true);
          const interval = setInterval(() => setVoiceSeconds(s => {
            if (s + 1 >= MAX_SECS) { clearInterval(interval); setVoiceRecording(false); setVoicePaused(true); return MAX_SECS; }
            return s + 1;
          }), 1000);
          voiceTimerRef.current = interval;
        }
      };
      setTimeout(tick, 1000);
    };

    const pauseRecording = () => {
      clearInterval(voiceTimerRef.current);
      setVoiceRecording(false);
      setVoicePaused(true);
    };

    const resumeRecording = () => {
      setVoicePaused(false);
      setVoiceRecording(true);
      const interval = setInterval(() => setVoiceSeconds(s => {
        if (s + 1 >= MAX_SECS) { clearInterval(interval); setVoiceRecording(false); setVoicePaused(true); return MAX_SECS; }
        return s + 1;
      }), 1000);
      voiceTimerRef.current = interval;
    };

    const cancelRecording = () => {
      clearInterval(voiceTimerRef.current);
      setVoiceRecording(false);
      setVoicePaused(false);
      setVoiceSeconds(0);
    };

    const isCountingDown = !voiceRecording && !voicePaused && voiceSeconds < 0;
    const countdown = isCountingDown ? Math.abs(voiceSeconds) : null;
    const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
    const progress = Math.min(voiceSeconds / MAX_SECS, 1);
    const R = 57;
    const circ = 2 * Math.PI * R;

    // Shared bottom audio capture panel
    const AudioCapturePanel = ({ nextEnabled }) => (
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#EAEDFA', borderRadius: '16px 16px 0 0', boxShadow: '0px -4px 10px rgba(0,0,0,0.1), 0px 4px 10px rgba(0,0,0,0.1)', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Timer + waveform */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, height: 28, padding: 4 }}>
          <span style={{ ...P, fontSize: 14, fontWeight: 400, color: 'rgba(0,0,0,0.87)', letterSpacing: '0.17px', lineHeight: 1.43, flexShrink: 0 }}>
            {fmt(voiceSeconds)} / 04:00
          </span>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 3, overflow: 'hidden', height: 12 }}>
            {[4,4,4,8,4,4,4,4,4,12,12,12,12,4,4,4,8,4,4,12,12,12,4,4,4,8,4,4,12,12,12,12,12,12,12,12,12,12,12,12,12,8,8,8,12,12,12,6,6,6,10,10,10,12,12,12].map((h, i) => (
              <div key={i} style={{ width: 2, height: h, borderRadius: 1, background: 'rgba(33,33,33,0.56)', flexShrink: 0, animation: voiceRecording ? `voiceWave ${0.5 + (i % 5) * 0.12}s ease-in-out ${i * 0.04}s infinite` : 'none' }} />
            ))}
          </div>
        </div>
        {/* Controls */}
        <div style={{ background: 'white', borderRadius: 38, padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Cancel */}
          <button onClick={cancelRecording} style={{ background: '#ffebee', borderRadius: 909, width: 104, height: 40, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="#e02d3c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{ ...P, fontSize: 13, fontWeight: 500, color: '#e02d3c', letterSpacing: '0.46px', lineHeight: '22px' }}>Cancel</span>
          </button>
          {/* Next */}
          <button
            onClick={nextEnabled ? () => { cancelRecording(); setGenerating(true); setTimeout(() => { setGenerating(false); setPhase('suggestions'); }, 3000); } : undefined}
            style={{ background: nextEnabled ? '#eaedfa' : 'transparent', borderRadius: 999, width: 104, height: 40, border: 'none', cursor: nextEnabled ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 0.2s ease' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M4 12l5 5L20 7" stroke={nextEnabled ? '#2d4ccd' : 'rgba(45,76,205,0.38)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{ ...P, fontSize: 13, fontWeight: 500, color: nextEnabled ? '#2d4ccd' : 'rgba(45,76,205,0.38)', letterSpacing: '0.46px', lineHeight: '22px' }}>Next</span>
          </button>
        </div>
      </div>
    );

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'white', position: 'relative' }}>
        <style>{`
          @keyframes voicePulse {
            0%   { box-shadow: 0 0 0 0 rgba(45,76,205,0.45); }
            70%  { box-shadow: 0 0 0 20px rgba(45,76,205,0); }
            100% { box-shadow: 0 0 0 0 rgba(45,76,205,0); }
          }
          @keyframes voiceWave {
            0%, 100% { transform: scaleY(0.4); }
            50%       { transform: scaleY(1); }
          }
          @keyframes countIn {
            0%   { transform: scale(0.78); opacity: 0; }
            60%  { transform: scale(1.04); opacity: 1; }
            100% { transform: scale(1);    opacity: 1; }
          }
          @keyframes countRing {
            0%   { transform: scale(1);   opacity: 0.35; }
            100% { transform: scale(1.7); opacity: 0; }
          }
          @keyframes countTextIn {
            0%   { opacity: 0; transform: translateY(6px); }
            100% { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        {/* Header */}
        <div style={{ background: 'white', borderBottom: '1px solid rgba(0,0,0,0.12)', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <button onClick={() => { clearInterval(voiceTimerRef.current); setVoiceRecording(false); setVoicePaused(false); setVoiceSeconds(0); setPhase('info'); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="rgba(0,0,0,0.87)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <span style={{ ...P, fontSize: compactMode ? 15 : 18, fontWeight: 600, color: 'rgba(0,0,0,0.87)', letterSpacing: '0.018px', lineHeight: 1.57 }}>{clientName}</span>
            <span style={{ ...P, fontSize: 12, fontWeight: 400, color: 'rgba(0,0,0,0.6)', letterSpacing: '0.4px', lineHeight: 1.66 }}>{sessionSubtitle}</span>
          </div>
          <FigmaUserAvatar />
        </div>

        {/* Main content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28, padding: '0 24px', paddingBottom: (voiceRecording || voicePaused) ? 120 : 0 }}>
          {isCountingDown ? (
            /* ── Countdown state ── */
            <>
              <span style={{ ...P, fontSize: compactMode ? 15 : 18, fontWeight: 500, color: 'rgba(0,0,0,0.87)', letterSpacing: '0.018px', textAlign: 'center', animation: 'countTextIn 0.5s ease both' }}>
                Capture will start in
              </span>
              <div style={{ position: 'relative', width: 124, height: 124, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {/* Expanding ring */}
                <div
                  key={`ring-${countdown}`}
                  style={{ position: 'absolute', width: 124, height: 124, borderRadius: '50%', border: '3px solid #2d4ccd', animation: 'countRing 0.9s cubic-bezier(0.2,0.6,0.4,1) both' }}
                />
                {/* Circle + number */}
                <div
                  key={`num-${countdown}`}
                  style={{ width: 124, height: 124, borderRadius: '50%', background: '#2d4ccd', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'countIn 0.5s cubic-bezier(0.34,1.26,0.64,1) both' }}
                >
                  <span style={{ ...P, fontSize: 34, fontWeight: 500, color: 'white', letterSpacing: '0.25px', lineHeight: 1.235 }}>{countdown}</span>
                </div>
              </div>
            </>
          ) : voiceRecording ? (
            /* ── Active recording state ── */
            <>
              <span style={{ ...P, fontSize: compactMode ? 15 : 18, fontWeight: 500, color: 'rgba(0,0,0,0.87)', letterSpacing: '0.018px', textAlign: 'center', lineHeight: 1.57 }}>
                Describe the activity<br/>in your own words
              </span>
              {/* Stop button with progress arc */}
              <div style={{ position: 'relative', width: 124, height: 124 }}>
                <svg style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }} width="124" height="124" viewBox="0 0 124 124">
                  <circle cx="62" cy="62" r={R} fill="none" stroke="rgba(45,76,205,0.12)" strokeWidth="3"/>
                  <circle cx="62" cy="62" r={R} fill="none" stroke="#2d4ccd" strokeWidth="3"
                    strokeDasharray={circ}
                    strokeDashoffset={circ * (1 - progress)}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1s linear' }}
                  />
                </svg>
                <button
                  onClick={pauseRecording}
                  style={{ position: 'absolute', inset: 0, width: 124, height: 124, borderRadius: '50%', background: 'rgba(45,76,205,0.12)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <div style={{ width: 32, height: 32, background: '#2d4ccd', borderRadius: 4 }} />
                </button>
              </div>
            </>
          ) : voicePaused ? (
            /* ── Paused state ── */
            <button
              onClick={resumeRecording}
              style={{ background: '#eaedfa', border: 'none', cursor: 'pointer', borderRadius: 99, width: 209, height: 124, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <rect x="9" y="1" width="6" height="13" rx="3" stroke="#2d4ccd" strokeWidth="1.5"/>
                <path d="M5 11a7 7 0 0014 0" stroke="#2d4ccd" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="12" y1="18" x2="12" y2="22" stroke="#2d4ccd" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="8" y1="22" x2="16" y2="22" stroke="#2d4ccd" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span style={{ ...P, fontSize: 20, fontWeight: 600, color: '#2d4ccd', letterSpacing: 0, lineHeight: 1.6 }}>Resume</span>
            </button>
          ) : (
            /* ── Idle state ── */
            <>
              <span style={{ ...P, fontSize: compactMode ? 15 : 18, fontWeight: 500, color: 'rgba(0,0,0,0.87)', letterSpacing: '0.018px', textAlign: 'center' }}>Press to start capturing</span>
              <button
                onClick={startCountdown}
                style={{ width: 124, height: 124, borderRadius: '50%', background: '#2d4ccd', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                  <rect x="9" y="2" width="6" height="12" rx="3" fill="white"/>
                  <path d="M5 10a7 7 0 0014 0" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="12" y1="19" x2="12" y2="22" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="9" y1="22" x2="15" y2="22" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Bottom — info banner (idle/countdown) or audio capture panel (recording/paused) */}
        {(voiceRecording || voicePaused) ? (
          <AudioCapturePanel nextEnabled={voiceSeconds >= 15} />
        ) : (
          <div style={{ padding: '0 24px 32px', flexShrink: 0 }}>
            <div style={{ background: '#eaedfa', borderRadius: 8, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ position: 'relative', flexShrink: 0, width: 24, height: 24 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'white', position: 'absolute' }} />
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ position: 'absolute', top: 2, left: 2 }}>
                  <circle cx="12" cy="12" r="9" stroke="#2d4ccd" strokeWidth="1.5"/>
                  <line x1="12" y1="8" x2="12" y2="8" stroke="#2d4ccd" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="12" y1="11" x2="12" y2="16" stroke="#2d4ccd" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <span style={{ ...P, fontSize: 16, fontWeight: 400, color: 'rgba(0,0,0,0.87)', letterSpacing: '0.15px', lineHeight: 1.5 }}>Maximum capture time is 4 min.</span>
            </div>
          </div>
        )}

        {/* ── Generating loader overlay ── */}
        {generating && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(34,54,72,0.82)', borderRadius: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 42, zIndex: 50 }}>
            <style>{`
              @keyframes starSpin { 0%,100% { transform: scale(1) rotate(0deg); opacity: 1; } 25% { transform: scale(1.25) rotate(15deg); opacity: 0.7; } 50% { transform: scale(0.85) rotate(-10deg); opacity: 1; } 75% { transform: scale(1.15) rotate(8deg); opacity: 0.8; } }
              @keyframes starPop  { 0%,100% { transform: scale(1); opacity: 0.6; } 50% { transform: scale(1.4); opacity: 1; } }
            `}</style>
            <div style={{ position: 'relative', width: 56, height: 56 }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" style={{ position: 'absolute', bottom: 0, left: 0, animation: 'starSpin 2s ease-in-out infinite' }}>
                <path d="M12 2L13.8 8.2L20 10L13.8 11.8L12 18L10.2 11.8L4 10L10.2 8.2L12 2Z" fill="#F6C53E"/>
              </svg>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ position: 'absolute', top: 0, right: 0, animation: 'starPop 1.6s ease-in-out 0.3s infinite' }}>
                <path d="M12 2L13.8 8.2L20 10L13.8 11.8L12 18L10.2 11.8L4 10L10.2 8.2L12 2Z" fill="#F6C53E"/>
              </svg>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ position: 'absolute', top: 4, left: 10, animation: 'starPop 1.6s ease-in-out 0.8s infinite' }}>
                <path d="M12 2L13.8 8.2L20 10L13.8 11.8L12 18L10.2 11.8L4 10L10.2 8.2L12 2Z" fill="#F6C53E"/>
              </svg>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: 'white', textAlign: 'center', width: '100%', maxWidth: 280 }}>
              <span style={{ ...P, fontSize: 24, fontWeight: 500, lineHeight: 1.334, color: 'white' }}>Generating suggestions</span>
              <span style={{ ...P, fontSize: 16, fontWeight: 400, lineHeight: 1.5, letterSpacing: '0.15px', color: 'white', opacity: 0.8 }}>They will be ready soon</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Phase 2: text entry ───────────────────────────────────────────────────
  const hasEnoughText = notes.trim().length >= 40;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#EAEDFA', gap: 8, position: 'relative' }}>

      {/* Header card */}
      <div style={{ background: 'white', borderRadius: 16, boxShadow: SHADOW_EL4, flexShrink: 0, padding: '16px 16px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <button onClick={() => setPhase('info')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', color: 'rgba(0,0,0,0.54)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <FigmaUserAvatar />
        </div>
        <div style={{ textAlign: 'center', paddingBottom: 4 }}>
          <div style={{ ...P, fontSize: compactMode ? 15 : 18, fontWeight: 600, color: '#212121', lineHeight: 1.57, letterSpacing: '0.018px' }}>{sessionHeader}</div>
          <div style={{ ...P, fontSize: 14, color: 'rgba(0,0,0,0.6)', lineHeight: 1.43, letterSpacing: '0.15px' }}>{sessionSubtitle}</div>
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, background: 'white', borderRadius: '16px 16px 0 0', boxShadow: SHADOW_EL16, overflowY: 'auto', padding: '0 24px 110px' }}>
        {/* Sticky top spacer */}
        <div style={{ position: 'sticky', top: 0, height: 24, background: 'white', zIndex: 5, marginLeft: -24, marginRight: -24, borderRadius: '16px 16px 0 0' }} />

        {/* Text area section */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ ...P, fontSize: 16, fontWeight: 500, color: '#212121', letterSpacing: '0.1px', marginBottom: 14, marginTop: 0 }}>
            Describe activity in your own words
          </p>
          <textarea
            value={notes}
            onChange={e => { if (!animating) setNotes(e.target.value); }}
            onKeyDown={handleTextareaKeyDown}
            readOnly={animating}
            placeholder={'Add info about the activity, like\n\nWhat you did with your client\nWhat their response was\nYour plans until and for your next activity'}
            style={{ ...P, width: '100%', minHeight: 220, border: `2px solid ${notes.length > 0 ? '#2d4ccd' : 'rgba(33,33,33,0.23)'}`, borderRadius: 8, padding: compactMode ? '12px' : '16px', fontSize: compactMode ? 13 : 16, color: notes.length > 0 ? 'rgba(0,0,0,0.87)' : 'rgba(33,33,33,0.6)', lineHeight: 1.5, letterSpacing: '0.15px', resize: 'vertical', outline: 'none', boxSizing: 'border-box', background: animating ? '#fafbff' : 'white', transition: 'border-color 0.15s, background 0.2s' }}
          />
          <p style={{ ...P, fontSize: 14, color: hasEnoughText ? '#3e9987' : 'rgba(33,33,33,0.38)', marginTop: 8, lineHeight: 1.57, letterSpacing: '0.1px', transition: 'color 0.2s' }}>
            {hasEnoughText ? 'Ready to generate suggestions.' : 'Add more info to generate suggestions.'}
          </p>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(0,0,0,0.12)', marginLeft: -24, marginRight: -24, marginBottom: 20 }} />

        {/* Select Tags */}
        <div>
          <p style={{ ...P, fontSize: 16, fontWeight: 500, color: '#212121', lineHeight: 1.57, letterSpacing: '0.1px', marginBottom: 16, marginTop: 0 }}>Select Tags</p>
          {['Data', 'Assessment', 'Plan'].map(label => (
            <TagField
              key={label}
              label={label}
              selected={tags[label]}
              onChange={sel => setTags(t => ({ ...t, [label]: sel }))}
            />
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#EAEDFA', padding: '16px 24px 12px', boxShadow: '0px -1px 3px rgba(0,0,0,0.12),0px -1px 1px rgba(0,0,0,0.05)' }}>
        <button
          disabled={!hasEnoughText}
          onClick={() => { if (hasEnoughText) { setGenerating(true); setTimeout(() => { setGenerating(false); setPhase('suggestions'); }, 3000); } }}
          style={{ width: '100%', padding: '8px 22px', background: hasEnoughText ? '#2d4ccd' : 'rgba(45,76,205,0.12)', color: hasEnoughText ? 'white' : 'rgba(45,76,205,0.38)', ...P, fontWeight: 500, fontSize: 15, border: 'none', borderRadius: 4, cursor: hasEnoughText ? 'pointer' : 'default', letterSpacing: '0.46px', lineHeight: '26px', transition: 'background 0.2s, color 0.2s', boxShadow: hasEnoughText ? '0px 1px 5px rgba(0,0,0,0.12),0px 2px 2px rgba(0,0,0,0.14),0px 3px 1px -2px rgba(0,0,0,0.2)' : 'none' }}
        >
          {compactMode ? 'Generate' : 'Generate Suggestions'}
        </button>
        <div style={{ textAlign: 'center', marginTop: 10, marginBottom: 4 }}>
          <span style={{ ...P, fontSize: 13, fontWeight: 500, color: '#2d4ccd', letterSpacing: '0.46px', lineHeight: '22px', cursor: 'pointer' }}>
            What should I write?
          </span>
        </div>
      </div>

      {/* ── Generating loader overlay ── */}
      {generating && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(34,54,72,0.82)', borderRadius: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 42, zIndex: 50 }}>
          <style>{`
            @keyframes starSpin { 0%,100% { transform: scale(1) rotate(0deg); opacity: 1; } 25% { transform: scale(1.25) rotate(15deg); opacity: 0.7; } 50% { transform: scale(0.85) rotate(-10deg); opacity: 1; } 75% { transform: scale(1.15) rotate(8deg); opacity: 0.8; } }
            @keyframes starPop  { 0%,100% { transform: scale(1); opacity: 0.6; } 50% { transform: scale(1.4); opacity: 1; } }
          `}</style>
          {/* Stars */}
          <div style={{ position: 'relative', width: 56, height: 56 }}>
            {/* Big star */}
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" style={{ position: 'absolute', bottom: 0, left: 0, animation: 'starSpin 2s ease-in-out infinite' }}>
              <path d="M12 2L13.8 8.2L20 10L13.8 11.8L12 18L10.2 11.8L4 10L10.2 8.2L12 2Z" fill="#F6C53E"/>
            </svg>
            {/* Small top-right star */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ position: 'absolute', top: 0, right: 0, animation: 'starPop 1.6s ease-in-out 0.3s infinite' }}>
              <path d="M12 2L13.8 8.2L20 10L13.8 11.8L12 18L10.2 11.8L4 10L10.2 8.2L12 2Z" fill="#F6C53E"/>
            </svg>
            {/* Tiny top-left star */}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ position: 'absolute', top: 4, left: 10, animation: 'starPop 1.6s ease-in-out 0.8s infinite' }}>
              <path d="M12 2L13.8 8.2L20 10L13.8 11.8L12 18L10.2 11.8L4 10L10.2 8.2L12 2Z" fill="#F6C53E"/>
            </svg>
          </div>
          {/* Text */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: 'white', textAlign: 'center', width: '100%', maxWidth: 280 }}>
            <span style={{ ...P, fontSize: 24, fontWeight: 500, lineHeight: 1.334, color: 'white' }}>Generating suggestions</span>
            <span style={{ ...P, fontSize: 16, fontWeight: 400, lineHeight: 1.5, letterSpacing: '0.15px', color: 'white', opacity: 0.8 }}>They will be ready soon</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Suggestions data ─────────────────────────────────────────────────────────

const SUGGESTIONS_DATA = [
  { section: 'Data', cards: [
    { field: 'Session Focus', content: 'Client presented concerns about ongoing conflict with manager at work. Reported difficulty sleeping and elevated anxiety. Behavioral activation homework was reviewed and partially completed.', type: 'text', showActions: true },
    { field: 'Client Engagement', chips: ['Engaged', 'Motivated', 'Verbally expressive'], type: 'chips' },
    { field: 'Homework Compliance', content: 'Partial — completed 3 of 5 planned exposures.', type: 'text' },
  ]},
  { section: 'Assessment', cards: [
    { field: 'Progress', content: 'Client demonstrated improved insight into avoidance patterns. GAD symptoms remain present but client reports using coping strategies more consistently.', type: 'text', showActions: true },
    { field: 'Risk', chips: ['No SI/HI reported', 'Safety plan reviewed'], type: 'chips' },
    { field: 'Mood', content: 'Anxious, improving', type: 'text' },
  ]},
  { section: 'Plan', cards: [
    { field: 'Next Steps', content: 'Continue weekly CBT sessions. Focus on cognitive restructuring around workplace conflict. Review sleep hygiene strategies at next session.', type: 'text', showActions: true },
    { field: 'Homework', chips: ['Thought record ×3/week', 'Sleep log'], type: 'chips' },
    { field: 'Follow-up', content: 'Schedule in 1 week', type: 'text' },
  ]},
];

// ── Individual audio (Psych) session suggestions ─────────────────────────────

const PSYCH_SUGGESTIONS_DATA = [
  { section: 'Chief Complaint', cards: [
    { field: 'Chief Complaint', content: 'Routine follow-up for medication management and to address ongoing stressors.', type: 'text', showActions: true },
  ]},
  { section: 'History of Illness', cards: [
    { field: 'History of Illness', content: 'Patient is a female who presents for a follow-up visit. She reports significant ongoing stress since the last visit. She was unable to find new housing due to high costs, describing the situation as "real expensive." Work remains "pretty stressful" as new hires are still in training and have not yet alleviated her workload. Her husband has returned from deployment, and the family is adjusting to having him home. The children are on summer break, which she describes as "super crazy." Patient reports her depression is a 6/10 and her anxiety is a 7/10. She identifies her anxiety as a trigger for smoking and reports it is exacerbated by her children screaming and by criticism from her boss, which causes her to "shut down" and engage in excessive worry. She continues to use marijuana a few times per week for stress and sleep, finding it calming. She avoids her prescribed sleep medication because it makes her feel "some kind of way." She reports sleeping 7-8 hours but still feels tired. The patient also reports recent use of non-prescribed pain medication for back pain, with use increasing from weekly to near-daily. Patient denies any suicidal or homicidal ideation, psychosis (seeing or hearing things), chest pain, shortness of breath, or nausea/vomiting.', type: 'text', showActions: true },
  ]},
  { section: 'Medication History and Side Effects', cards: [
    { field: 'Medication History and Side Effects', content: 'Current medications discussed: Unspecified sleep medication (reported non-adherence), Sertraline (to be discontinued), non-prescribed pain medication (brought home by husband), marijuana. Medical issues discussed: Back pain. Patient reports that her unspecified sleep medication makes her feel "some kind of way," leading to non-adherence. She denies other adverse effects from current medications.', type: 'text', showActions: true },
  ]},
  { section: 'Family and Social History', cards: [
    { field: 'Family and Social History', content: 'Patient reports ongoing stress related to being unable to find affordable housing. She is employed, but finds her job stressful. Her husband recently returned from deployment, and she notes it is good to have his help with their children, who are currently home for summer break.', type: 'text', showActions: true },
  ]},
  { section: 'Mental Status', cards: [
    { field: 'Mental Status', content: 'Behavior: Cooperative with the interview, maintains good eye contact. No psychomotor agitation or retardation noted. Speech: Normal rate, rhythm, and volume. Coherent and articulate. Mood: Reports feeling "not too depressed" and "anxious." Rates depression a 6/10 and anxiety a 7/10. Affect: Congruent with reported mood, though somewhat constricted and notable for worry. Thought Process: Linear, logical, and goal-directed. Thought Content: Preoccupied with psychosocial stressors (housing, work, family). Reports excessive worry, particularly after negative interactions at work. Denies suicidal ideation, homicidal ideation, delusions, or paranoia. Insight/Judgment: Insight into stressors is fair. Judgment is impaired regarding her use of non-prescribed pain medication and other substances as coping mechanisms.', type: 'text', showActions: true },
  ]},
  { section: 'Interventions', cards: [
    { field: 'Interventions', content: 'Psychoeducation was provided on the risks of using non-prescribed pain medication, including dependence and potential withdrawal, with strong recommendation to see her PCP. The various options for nicotine replacement therapy were discussed, with specific instructions on the proper use of nicotine gum (chew and park method). The psychiatrist also provided information on the potential side effects (nausea, headache) of the new antidepressant. Brief counseling on nutrition, including meal prepping and adequate hydration, was offered.', type: 'text', showActions: true },
  ]},
  { section: 'Therapeutic Interventions', cards: [
    { field: 'Therapeutic Interventions', content: 'The psychiatrist utilized supportive psychotherapy to explore the patient\'s feelings about current life stressors. Motivational interviewing techniques were employed to assess her readiness to change her smoking habits and to address her use of non-prescribed pain medication. The patient engaged well in the discussion.', type: 'text', showActions: true },
  ]},
  { section: 'Summary', cards: [
    { field: 'Summary', content: 'The patient continues to manage multiple psychosocial stressors, including housing instability, work pressure, and family adjustments following her husband\'s return from deployment. She reports significant anxiety, which appears to be a primary driver for her continued use of tobacco, marijuana, and alcohol, as well as recent escalating use of non-prescribed opioid pain medication. The treatment plan was adjusted to better target anxiety symptoms by switching her primary antidepressant and providing a PRN anxiolytic. Nicotine replacement therapy was initiated to support smoking cessation efforts, and she was strongly counseled to see her PCP for her back pain.', type: 'text', showActions: true },
  ]},
  { section: 'Plan', cards: [
    { field: 'Plan', content: '1. Discontinue Sertraline. 2. Start Citalopram 20 mg by mouth once daily to better target symptoms of anxiety and depression. 3. Start Hydroxyzine (Vistaril) 25 mg, take 1 to 2 tablets by mouth every 6 hours as needed for anxiety. 4. Start Nicotine gum 4 mg, chew 1 piece every hour as needed for cravings. Do not exceed 20 pieces in 24 hours. 5. Patient was strongly counseled to schedule an appointment with her primary care provider for evaluation of her back pain and to discontinue use of non-prescribed pain medication. She was advised of the risk of withdrawal. 6. Return to clinic in 4-6 weeks for follow-up to assess medication efficacy and tolerability.', type: 'text', showActions: true },
  ]},
];

// ── Audio-session suggestions (James Edwards capture flow) ────────────────────

const AUDIO_SUGGESTIONS_DATA = [
  { section: 'Data', cards: [
    { field: 'Session Focus', content: 'Client discussed a recent relapse following a stressful family gathering. Reported increased depressive symptoms and substance cravings over the past week. High-risk triggers were identified from session transcript and reviewed together.', type: 'text', showActions: true },
    { field: 'Client Engagement', chips: ['Initially resistant', 'Opened up mid-session', 'Motivated toward end'], type: 'chips' },
    { field: 'Homework Compliance', content: 'Partial — maintained sobriety log but did not contact sponsor as planned.', type: 'text' },
  ]},
  { section: 'Assessment', cards: [
    { field: 'Progress', content: 'Client remains in early recovery with significant ambivalence. PHQ-9 score: 12 (moderate). Recent relapse is a setback; continued engagement in treatment is a positive indicator. Coping skill use is inconsistent.', type: 'text', showActions: true },
    { field: 'Risk', chips: ['No SI/HI reported', 'Substance use risk elevated', 'Safety plan reviewed and updated'], type: 'chips' },
    { field: 'Mood', content: 'Discouraged, intermittently hopeful', type: 'text' },
  ]},
  { section: 'Plan', cards: [
    { field: 'Next Steps', content: 'Increase session frequency to twice weekly for the next month. Coordinate with prescribing physician regarding medication adjustment. Address family dynamics contributing to relapse risk in upcoming sessions.', type: 'text', showActions: true },
    { field: 'Homework', chips: ['Daily mood log', 'Call sponsor ×3/week', 'Practice grounding technique daily'], type: 'chips' },
    { field: 'Follow-up', content: 'Schedule in 3 days', type: 'text' },
  ]},
];

// ── Case Management suggestions ──────────────────────────────────────────────

const CASE_MGMT_SUGGESTIONS_DATA = [
  { section: 'Subjective', cards: [
    { field: 'Subjective', content: 'Client stated, "It has been hard to leave the house." He shared a history of experiencing these feelings during this season.', type: 'text', showActions: true },
  ]},
  { section: 'Objective', cards: [
    { field: 'Objective', content: 'The session took place at the client\'s home, where he appeared receptive to discussion about his difficulties.', type: 'text', showActions: true },
  ]},
  { section: 'Assessment', cards: [
    { field: 'Assessment', content: 'Client is struggling with feelings of depression, particularly during the current season, but he denied any desire to harm himself.', type: 'text', showActions: true },
  ]},
  { section: 'Plan', cards: [
    { field: 'Plan', content: 'Case Manager will refer client to a virtual support group for individuals struggling with depression. The case manager will follow up with the client next week to evaluate if he was able to start attending the group.', type: 'text', showActions: true },
  ]},
];

// ── Treatment Plan suggestions ────────────────────────────────────────────────

const TREATMENT_PLAN_SUGGESTIONS_DATA = [
  { section: 'Presenting Problems', cards: [
    { field: 'Substance Use', content: 'The client reports a history of substance use that is interfering with her ability to regain custody of her son. She expresses ambivalence about change, stating she doesn\'t believe it is a \'big issue,\' but acknowledges she needs to work on it. She identifies her friends and her partner, Justin, as triggers for use.', type: 'text', showActions: true },
    { field: 'Educational And Vocational Barriers', content: 'The client has obtained her GED but expresses a desire for further education to \'get a better job\' upon release and provide for her son. She identifies financial cost and time management, particularly balancing work, school, and parenting, as significant barriers.', type: 'text', showActions: true },
    { field: 'Parenting Stress', content: 'The client reports feeling \'really overwhelmed taking care of\' her son, Jake, and indicates there is \'a lot of stress around that\' for her.', type: 'text', showActions: true },
    { field: 'Antisocial Peer Associations', content: 'The client\'s social network, including her friends and partner, appear to be connected to her substance use and \'offending\' behavior. The client states that when she is around them, she uses substances.', type: 'text', showActions: true },
  ]},
  { section: 'Treatment Goals', cards: [
    { field: 'Achieve Higher Education', content: 'The client\'s long-term goal is to obtain a two-year associate\'s degree to secure a career that is both fulfilling (\'help people\') and provides sufficient income to independently support her son, Jake.', type: 'text', showActions: true },
    { field: 'Reduce Harm From Substance Use', content: 'The client and provider agreed on the goal to \'significantly reduce\' substance use. While the client is not committed to abstinence, she is willing to work towards this goal to improve her chances of regaining custody of her son.', type: 'text', showActions: true },
  ]},
  { section: 'Interventions or Services', cards: [
    { field: 'Educational Case Management', content: 'Provider will assist the client by researching college entrance exam requirements, providing a pass for extra computer time for research, and offering support in completing college applications.', type: 'text', showActions: true },
    { field: 'Motivational Interviewing', content: 'Provider will use motivational interviewing techniques, including a cost-benefit analysis and exploring the client\'s self-rated motivation (5/10), to address ambivalence and build intrinsic motivation for reducing substance use.', type: 'text', showActions: true },
    { field: 'Referral To On-Site Programming', content: 'Provider will provide information about on-site substance use support groups and will explore options for the client to participate in the facility\'s substance abuse treatment wing.', type: 'text', showActions: true },
    { field: 'Accountability And Progress Monitoring', content: 'Provider will follow up on the client\'s completion of assigned tasks and will verify attendance at support group meetings by checking in with the group facilitator.', type: 'text', showActions: true },
  ]},
  { section: 'Measurable Objectives', cards: [
    { field: 'Explore Educational Options', content: 'By the next session, the client will use approved computer time to research potential college options, including a local community college, to identify programs of interest.', type: 'text', showActions: true },
    { field: 'Prepare For College Entrance', content: 'Within the next 30 days, the client will work with provider to identify and prepare for a college entrance or placement exam.', type: 'text', showActions: true },
    { field: 'Increase Motivation For Change', content: 'By the next session, the client will complete a cost-benefit analysis worksheet, focusing on identifying the positive outcomes of changing her substance use and the negative consequences of continuing her use.', type: 'text', showActions: true },
    { field: 'Engage In Sober Support', content: 'Before the next weekly session, the client will attend two on-site support group meetings to begin building a pro-social support network.', type: 'text', showActions: true },
  ]},
];

// ── Assessment suggestions ────────────────────────────────────────────────────

const ASSESSMENT_SUGGESTIONS_DATA = [
  { section: 'Presenting Problem', cards: [
    { field: 'Presenting Problem', content: 'The client is a 23-year-old female university student presenting for an initial assessment due to concerns about anxiety and alcohol use. She reports that her anxiety, which she describes as "nervousness," has been a long-standing issue since her early teens and is now impacting multiple areas of her life, including academics. She also identifies a pattern of drinking alcohol to cope with social anxiety, which has led to negative consequences such as blackouts and poor academic performance. The client states she is seeking help now because things have "not been fantastic" and she is worried they will "get worse."', type: 'text', showActions: true },
  ]},
  { section: 'Anxiety Symptoms And History', cards: [
    { field: 'Anxiety Symptoms And History', content: 'The client reports experiencing symptoms of anxiety since approximately age 13 or 14. She describes these symptoms as a persistent "nervousness" related to various life stressors, including social situations, school, work, and graduating college. She currently rates her anxiety as a 6 out of 10. She reports the most recent peak in anxiety (10/10) occurred last weekend. When her anxiety is high, she sometimes experiences a low or "down" mood. The client feels her anxiety is "trickling into every area of her life now."', type: 'text', showActions: true },
  ]},
  { section: 'Previous Mental Health Treatment', cards: [
    { field: 'Previous Mental Health Treatment', content: 'The client has a history of brief mental health treatment. A few years ago, she saw a counselor for approximately five or six sessions and a psychiatrist once or twice. She states she was told she had "some sort of anxiety disorder," possibly a general one. The client reports that she was not "on board with the whole therapy thing at that point" and did not believe it would help, so she discontinued treatment. She now feels she is in a different state of mind and is ready to engage in and commit to therapy, stating, "I want the help now."', type: 'text', showActions: true },
  ]},
  { section: 'Alcohol Use History And Pattern', cards: [
    { field: 'Alcohol Use History And Pattern', content: 'The client reports first using alcohol at age 14. Her use has progressed from social experimentation to a primary coping mechanism for anxiety. She states she drinks when going out with friends, and while it helps her "relax" and "have fun," she is concerned because she sometimes drinks more than intended, leading to negative consequences. These consequences include making "bad decisions," experiencing hangovers that impact her ability to attend or perform in her college classes, and occasional blackouts. The last reported blackout occurred approximately one month ago. She states that her drinking is more frequent now than when she was younger and is used as a "tool to get through the anxiety."', type: 'text', showActions: true },
  ]},
  { section: 'Dimension 1: Acute Intoxication And/Or Withdrawal Potential', cards: [
    { field: 'Dimension 1: Acute Intoxication And/Or Withdrawal Potential', content: 'Substance(s) used: Alcohol. Date & time of most-recent use: Not specified. Route of administration: Oral. Typical quantity/pattern: Reports drinking when going out, sometimes to excess, resulting in hangovers and occasional blackouts. Current signs of intoxication: None observed during the interview. History of withdrawal symptoms: Not assessed. Prior detox/withdrawal complications: Not assessed.', type: 'text', showActions: true },
  ]},
  { section: 'Dimension 2: Biomedical Conditions & Complications', cards: [
    { field: 'Dimension 2: Biomedical Conditions & Complications', content: 'Current medical conditions: None reported. Acute medical complaints: None reported. Chronic illnesses impacting care: None reported. Surgeries/hospitalizations: History of appendectomy. Infectious disease status (HIV/HBV/HCV): Not assessed. Pain issues: None reported. Pregnancy status: Not pregnant; the client reports using oral contraceptives.', type: 'text', showActions: true },
  ]},
  { section: 'Dimension 3: Emotional, Behavioral, Or Cognitive Conditions & Complications', cards: [
    { field: 'Dimension 3: Emotional, Behavioral, Or Cognitive Conditions & Complications', content: 'Active psychological / behavioral / emotional / cognitive conditions: the client reports significant anxiety, describing it as nervousness that impacts her functioning. Past psychiatric diagnoses: Reports being told she had "some sort of anxiety disorder" by a previous counselor. Reported or observed cognitive functioning: Appears intact; thought process is linear and organized. Reported self-harm or homicidal thoughts/behaviors: Denies any history of suicidal or homicidal ideation. Psychotropic medications & response: None currently or historically reported. Stabilizing factors: Reports a supportive boyfriend. Reported or observed management of ADLs: Appears to be managing ADLs without difficulty. Stated connection between current signs/symptoms and SUD: the client explicitly states she uses alcohol to manage her social anxiety symptoms, saying it helps her "relax and have fun."', type: 'text', showActions: true },
  ]},
  { section: 'Dimension 4: Readiness To Change', cards: [
    { field: 'Dimension 4: Readiness To Change', content: 'Internal motivation statements: "I realize now that I\'m not handling it as well as I thought I was," "It\'s affecting other areas of my life," and "I want the help now." External pressures (legal, family, work): University professors have confronted her about poor academic performance and showing up to class with a hangover. Change goals voiced by the client: To lessen her anxiety and to reduce her alcohol consumption. Confidence in the ability to change (0-10): Not explicitly rated. Importance of change (0-10): Not explicitly rated, but the client contrasts her current motivation with her past lack of readiness for treatment.', type: 'text', showActions: true },
  ]},
  { section: 'Dimension 5: Relapse, Continued Use, Or Continued Problem Potential', cards: [
    { field: 'Dimension 5: Relapse, Continued Use, Or Continued Problem Potential', content: 'Longest period of abstinence: Not specified, but reports periods of being "off and on" with her anxiety and drinking. The client\'s description of recent cravings or triggers: Identifies social situations and feelings of anxiety as primary triggers for drinking. Coping skills the client reports using: Primarily uses alcohol to cope with anxiety. Situations the client identifies as difficult or that precede use: Reports that when she tries to go out without drinking, she feels "uncomfortable," "tense," and "confused." The client\'s reported history of overdose or relapse: No overdose history reported; reports occasional blackouts, with the last one about a month ago. Consequences of use mentioned by the client (medical, legal, social): Poor academic performance, being confronted by professors, making "bad decisions," and hangovers. What the client says she knows about her personal triggers: Identifies social situations and anxiety as triggers.', type: 'text', showActions: true },
  ]},
  { section: 'Dimension 6: Recovery/Living Environment', cards: [
    { field: 'Dimension 6: Recovery/Living Environment', content: 'Current living situation: Lives in a university dorm on campus and returns to her parents\' home most weekends. Supportive household members: Parents are aware of her anxiety and provide financial support. The client reports a supportive boyfriend of six months. Evidence of peer/social supports (sober or using): Reports having two close college friends she can rely on. Other social contacts are part of the "going out" and drinking environment. Employment/financial stability: Not currently employed consistently; is financially supported by her parents. Transportation access: Appears to have adequate transportation, traveling between campus and home regularly. Threats to safety: Reports a history of emotional abuse from her father, which causes distress.', type: 'text', showActions: true },
  ]},
  { section: 'Risk To Self And Others', cards: [
    { field: 'Risk To Self And Others', content: 'The client explicitly denies any history of suicidal ideation, plans, or intent, stating "never" when asked. She also denies any history of homicidal ideation, stating she is a "nice person." No history of suicide attempts was reported. No self-harm behaviors were discussed. Protective factors include future-oriented goals (graduating, getting a job) and a supportive relationship with her boyfriend.', type: 'text', showActions: true },
  ]},
  { section: 'Relationships And Social Support', cards: [
    { field: 'Relationships And Social Support', content: 'The client has been in a relationship with her boyfriend for six months, whom she describes as supportive and aware of her struggles with anxiety. She identifies two close friends from college whom she feels she can rely on. Her broader social circle is associated with a university party culture. Her relationship with her older sister is distant, described as a "Merry Christmas, Happy Easter kind of relationship."', type: 'text', showActions: true },
  ]},
  { section: 'Spiritual Beliefs', cards: [
    { field: 'Spiritual Beliefs', content: 'The client identifies as Catholic and reports a belief in God. She does not consider herself to be actively practicing but states that her faith is "there." She identifies prayer as a potential resource she could draw upon for strength during treatment.', type: 'text', showActions: true },
  ]},
  { section: 'Family Composition And Dynamics', cards: [
    { field: 'Family Composition And Dynamics', content: 'The client\'s immediate family consists of her mother, father, and one older sister. She resides on campus during the week and returns to her parents\' home on weekends. The relationship with her parents is strained, particularly with her father. Her relationship with her sister, a successful doctor, is described as distant and superficial. She reports a dynamic of being unfavorably compared to her sister by her father.', type: 'text', showActions: true },
  ]},
  { section: 'History Of Emotional Abuse', cards: [
    { field: 'History Of Emotional Abuse', content: 'The client reports a history of significant emotional abuse from her father. She provided examples of harsh and invalidating statements he has made, such as "I can\'t believe you\'re my daughter" and telling her not to identify herself as her daughter in public. She states that this constant comparison to her "ideal" sister has been a source of significant distress and does not "foster a great relationship." She reports she has become "numb" to these comments over time, but they still feel "annoying" and painful.', type: 'text', showActions: true },
  ]},
  { section: 'Education And Employment', cards: [
    { field: 'Education And Employment', content: 'The client is a senior in college pursuing a degree in education with the goal of becoming a teacher. Her academic performance is currently a source of stress, as her anxiety and the consequences of her alcohol use (e.g., hangovers, missing class) are negatively impacting her grades. She reports that her professors have begun to confront her about her performance. She has past work experience in babysitting and retail but is not working much currently due to her academic commitments.', type: 'text', showActions: true },
  ]},
  { section: 'Legal History', cards: [
    { field: 'Legal History', content: 'The client reports one past incident of legal involvement at age 14 or 15. She was caught shoplifting with friends while under the influence of alcohol. The incident involved the police and her parents being called. She believes she may have a criminal record as a result of this event but reports no subsequent legal issues.', type: 'text', showActions: true },
  ]},
  { section: 'Mental Status Examination', cards: [
    { field: 'Mental Status Examination', content: 'The client was cooperative and engaged throughout the interview. Mood appeared euthymic with underlying anxiety. Affect was congruent with the topics discussed and appropriate in range, though it became more constricted and she appeared sad when discussing her father\'s comments. Speech was clear, with a normal rate, rhythm, and volume. Thought process was consistently linear, logical, and goal-directed. There was no evidence of delusions, hallucinations, or other perceptual disturbances. Insight is assessed as fair to good; she demonstrates an awareness of her anxiety and problematic alcohol use and expresses a clear motivation for change. Judgment appears to be impaired when under the influence of alcohol, as evidenced by her reports of making "bad decisions," but was intact during the session.', type: 'text', showActions: true },
  ]},
  { section: 'Client Strengths', cards: [
    { field: 'Client Strengths', content: 'The client demonstrates significant strengths, including being articulate, intelligent, and insightful about her presenting problems. She is highly motivated for treatment at this time, stating, "I\'m ready now." She identifies herself as a "hard worker" and has a supportive boyfriend and two close friends. She is future-oriented, with clear goals of graduating college and becoming a teacher.', type: 'text', showActions: true },
  ]},
  { section: 'Barriers To Treatment', cards: [
    { field: 'Barriers To Treatment', content: 'Potential barriers include a long-standing pattern of using alcohol as a primary coping mechanism for anxiety. The history of emotional abuse and invalidation from her father may present challenges in developing self-worth and trust. Her distant relationship with her family may limit her sources of familial support.', type: 'text', showActions: true },
  ]},
  { section: 'Client Goals For Treatment', cards: [
    { field: 'Client Goals For Treatment', content: 'The client identified three primary goals for treatment: 1) To lessen the symptoms and impact of her anxiety. 2) To reduce her alcohol consumption and develop healthier coping strategies. 3) To successfully navigate her final year of college and graduate.', type: 'text', showActions: true },
  ]},
  { section: 'Interpretive Summary', cards: [
    { field: 'Interpretive Summary', content: 'The client is a 23-year-old female college senior presenting with symptoms of long-standing anxiety and a pattern of maladaptive alcohol use, which she identifies as a coping mechanism for social distress. These interconnected issues are causing significant impairment in her academic functioning and personal well-being, prompting her to seek services. A key contributing factor to her distress appears to be a history of paternal emotional invalidation and unfavorable comparisons to her sibling, which has likely impacted her self-concept. Although a previous, brief course of therapy was unsuccessful due to a stated lack of readiness, the client now presents as highly motivated and ready to engage in treatment. Her strengths include strong self-awareness, intelligence, and a supportive network that includes her boyfriend and close friends. Her stated goals are to reduce anxiety, moderate her drinking, and successfully complete her education. The focus of treatment will be to address these goals by developing healthier coping skills, exploring the function of her alcohol use, and processing the impact of her family dynamics on her current mental health.', type: 'text', showActions: true },
  ]},
];

// ── Group session — single suggestion per member ──────────────────────────────

// ── Anger Management Group suggestions ───────────────────────────────────────

const ANGER_GROUP_SUGGESTIONS_DATA = [
  { section: 'Overall Summary', cards: [
    { field: 'Overall Summary', content: 'The anger management support group session, facilitated by this writer, began with introductions and a brief overview of group rules, emphasizing confidentiality and respectful communication. This writer then initiated a check-in activity, asking participants to identify with an animal and explain their choice. This transitioned into a discussion of the reasons for attending the group, with participants disclosing their anger management related concerns. A common theme emerged around the impact of emotions on personal well-being, relationships, and family dynamics, particularly for those with children. This writer validated the participants\' disclosures, acknowledged their vulnerability, and highlighted the courage it takes to seek support. The session concluded with this writer prompting participants to reflect on their personal goals for the group.', type: 'text', showActions: true },
  ]},
  { section: 'Tyler', cards: [
    { field: 'Tyler', content: 'Tyler chose a turtle during the check-in activity, expressing feelings of boredom and slowness. When asked to elaborate on why he was attending the group, he disclosed that his wife had been frustrating him. When the writer asked him to clarify what he meant by "bored," Tyler reiterated that those were his wife\'s words and explained that his daily routine involved caring for his children. He also expressed that it wasn\'t necessarily wrong for him to be angry, and acknowledged that it is probably better to figure out why he was lashing out and address that issue. Later, when it was mentioned that children can serve as a motivating factor to remain in the group, Tyler expressed that his motivation was rooted in his desire for a brighter future, and better emotional regulation.', type: 'text', showActions: true },
  ]},
  { section: 'Connor', cards: [
    { field: 'Connor', content: 'Connor chose his cat, Bella, because of her constant happiness, a state he desired for himself. He shared that he joined the group to stop lashing out at family, explaining that although he doesn\'t believe he drinks excessively, he has been unable to stop when he has tried which leads to outburst of anger. He expressed having two daughters whose mother passed away a few years prior and felt a need to invest more energy in them. Connor described drinking as his "me time" after his daughters go to bed and acknowledged that this habit might be indicative of a deeper emotional need. He stated that his drinking affects his energy levels and contributes to poor sleep and fatigue. Connor also said that his kids are a motivator for him to be a better father and example. He also wanted to commit to raising his children correctly and is trying to do so by participating in treatment. This writer pointed out to the group that Connor and another group member both have children and asked how they feel being in treatment while also caring for and modeling behavior for their children.', type: 'text', showActions: true },
  ]},
  { section: 'Jeff', cards: [
    { field: 'Jeff', content: 'Jeff chose a shark, stating his love for the ocean and sharks. When asked why he was in the group, he did not immediately respond. Later in the group session, this writer observed that Jeff appeared somewhat hesitant about being in the group and asked him how he felt. Jeff confirmed that his husband wanted him to attend treatment because he recognized he had a problem. While Jeff acknowledged that taking the outburst of anger were probably not the best and that figuring out the root cause may be beneficial, he said he did not believe that his anger had negatively impacted him or put his children in danger.', type: 'text', showActions: true },
  ]},
  { section: 'Allison', cards: [
    { field: 'Allison', content: 'Allison chose a jellyfish during the check-in, appreciating their beauty and the ocean environment. She identified feelings of fear as her primary concern, explaining it leads to anger and other emotions she can\'t control. Allison recognized that caffeine use wasn\'t healthy and expressed a goal of cutting back or eliminating it from her life. She agreed with another group participant about taking a step towards growth by attending group therapy. She appreciated how addressing her fear and anger brought awareness to the underlying issues, which motivated her to seek help now. Allison also expressed gratitude for the group environment. This writer commended another participant for her self-awareness in recognizing a potential problem early on and for taking steps to address it. This intervention resonated with Allison.', type: 'text', showActions: true },
  ]},
  { section: 'Participant 1', cards: [
    { field: 'Participant 1', content: 'Participant 1 shared an animal in response to the icebreaker prompt but did not elaborate beyond a brief statement. They did not verbally contribute to the remainder of the group discussion and did not respond to follow-up prompts.', type: 'text', showActions: true },
  ]},
];

// ── Group session — single suggestion per member ──────────────────────────────

const GROUP_SINGLE_SUGGESTIONS_DATA = [
  { section: 'Data', cards: [
    { field: 'Group Process', content: 'Group session focused on anger recognition and de-escalation strategies. 7 of 8 members present and engaged. Facilitated structured discussion on identifying physiological and cognitive early warning signs of anger escalation.', type: 'text', showActions: true },
    { field: 'Member Participation', chips: ['Active participation: 5 members', 'Observer role: 2 members', 'Homework reviewed collectively'], type: 'chips' },
    { field: 'Session Content', content: 'Introduced pause-and-plan technique with group practice via role-play. One member shared a successful real-world application since last session; group reinforced with positive feedback. Psychoeducation on amygdala hijack and window of tolerance provided.', type: 'text' },
  ]},
  { section: 'Assessment', cards: [
    { field: 'Group Dynamics', content: 'Group cohesion remains strong. Therapeutic alliance developing well across members. Two members continue to demonstrate leadership behaviors supportive of group norms. One new member integrated smoothly into group process.', type: 'text', showActions: true },
    { field: 'Progress Indicators', chips: ['Skill practice improving', 'Self-disclosure increasing', 'Homework compliance: 70%'], type: 'chips' },
    { field: 'Individual Progress Note', content: 'Each group member to receive individual progress note reflecting personal engagement level, skill acquisition, and goal progress within group context. Single-note format per member. See attached individual summaries.', type: 'text' },
  ]},
  { section: 'Plan', cards: [
    { field: 'Next Session Focus', content: 'Session 8: Communication and assertiveness skills. Members to practice assertive communication in low-stakes scenarios before next session. Review homework from session 7 as group warm-up activity.', type: 'text', showActions: true },
    { field: 'Homework Assigned', chips: ['Anger log ×3 this week', 'Practice pause-and-plan in one real situation', 'Rate trigger intensity 0–10'], type: 'chips' },
    { field: 'Individual Follow-up', content: 'One member flagged for individual check-in prior to next group session to address elevated distress observed today. Remaining members continue group-only contact as scheduled.', type: 'text' },
  ]},
];

// ── SUD Group suggestions ─────────────────────────────────────────────────────

const SUD_GROUP_SUGGESTIONS_DATA = [
  { section: 'Group Summary', cards: [
    { field: 'Group Summary', content: 'Therapist facilitated the first session of an 8-week substance abuse support group. The stated purpose was to provide a confidential space for members to address substance use issues. Therapist established group norms, including confidentiality and respectful communication. Interventions included using an icebreaker question to build rapport, psychoeducation on group logistics, and direct questioning to explore members\' reasons for attending and their motivations for change. Therapist also utilized normalization by commending participants for attending and sharing her own recovery status to foster connection. The session concluded with a directive for participants to reflect on their personal goals for the group.', type: 'text', showActions: true },
  ]},
  { section: 'Lisette', cards: [
    { field: 'Client Response to Intervention(s)', content: 'The patient was engaged and responsive. She identified as a turtle in an icebreaker, stating she feels tired and slow. She reported that her drinking escalated recreationally after a breakup and moving away from her family, and it has now become a daily craving she cannot control. She stated she wants to get better for herself and to have a brighter future.', type: 'text', showActions: true },
    { field: 'ASAM-Relevant Disclosures', content: 'The patient reported escalating alcohol use to the point of daily cravings and an inability to go for long periods without drinking (Dimension 1). She identified external stressors, such as a breakup and isolation from family, as triggers for her initial increased use (Dimension 6). Her stated motivation is internal, wanting a \'brighter\' future for herself (Dimension 4).', type: 'text', showActions: true },
    { field: 'Significant Peer Interactions', content: 'The patient affirmed another participant\'s statement, agreeing that seeking help was a significant step forward rather than pretending to have her drinking under control.', type: 'text', showActions: true },
    { field: 'Explicitly Stated Plans For Next Steps', content: 'No next steps were discussed.', type: 'text', showActions: true },
  ]},
  { section: 'Bethany', cards: [
    { field: 'Client Response to Intervention(s)', content: 'The patient was engaged and actively participated. She responded to the icebreaker, stating she would be a jellyfish. She identified her presenting issue as an addiction to caffeine that began in college and which she now recognizes as unhealthy. She expressed a desire to regain a sense of control over her life as her primary motivation for change.', type: 'text', showActions: true },
    { field: 'ASAM-Relevant Disclosures', content: 'The patient reported a compulsive use of caffeine that she feels she is no longer in control of (Dimension 1). She expressed a strong desire to cut back or quit, citing a need to feel in control as her motivation (Dimension 4). She also demonstrated insight by acknowledging her concern that this pattern could lead to addiction to other substances, such as alcohol, in the future (Dimension 5).', type: 'text', showActions: true },
    { field: 'Significant Peer Interactions', content: 'The patient agreed with another participant, stating that addressing her caffeine use now could prevent a more harmful addiction from developing later.', type: 'text', showActions: true },
    { field: 'Explicitly Stated Plans for Next Steps', content: 'The patient stated a plan to \'cut back on it or try to cut it out\' of her life.', type: 'text', showActions: true },
  ]},
  { section: 'Tara', cards: [
    { field: 'Client Response to Intervention(s)', content: 'The patient participated in all activities but appeared ambivalent about treatment. She stated she was present because her husband discovered her using his pain medication. She relayed her husband\'s belief that she uses due to boredom as a stay-at-home mother. When questioned by therapist, the patient conceded it was best to address why she was using the pills. She also identified not wanting her children to witness her substance use as a motivating factor.', type: 'text', showActions: true },
    { field: 'ASAM-Relevant Disclosures', content: 'The patient disclosed non-prescribed use of her husband\'s pain medication (Dimension 1). Her presence in treatment is due to external pressure from her spouse, although she also identified an internal motivation to be a good parent (Dimension 4). She reported \'boredom\' as a potential driver for her use, suggesting a possible underlying issue related to life satisfaction (Dimension 3). Her recovery environment includes her husband, who prompted her treatment, and her children, whom she does not want to be aware of her use (Dimension 6).', type: 'text', showActions: true },
    { field: 'Significant Peer Interactions', content: 'No significant peer interactions were noted.', type: 'text', showActions: true },
    { field: 'Explicitly Stated Plans for Next Steps', content: 'The patient stated she should \'figure out why I was taking them and address that\'.', type: 'text', showActions: true },
  ]},
  { section: 'John', cards: [
    { field: 'Client Response to Intervention(s)', content: 'The patient was open and engaged. He shared that he wants to stop drinking alcohol but finds himself unable to stop on his own. He is a widower with two daughters and stated his primary motivation is to have more energy for them. He described a nightly drinking pattern that leads to poor sleep and fatigue, which he characterized as a \'sad little me time\'.', type: 'text', showActions: true },
    { field: 'ASAM-Relevant Disclosures', content: 'The patient reported an inability to control his alcohol consumption and has been unsuccessful in attempts to quit on his own (Dimension 1). His use results in fatigue, which impacts his functioning (Dimension 2). The patient is a widower, indicating potential co-occurring grief (Dimension 3). He expressed strong motivation for change centered on his desire to be a more present and energetic father for his two daughters (Dimension 4). His recovery environment includes being the sole parent to two children (Dimension 6).', type: 'text', showActions: true },
    { field: 'Significant Peer Interactions', content: 'In response to a group question about parenting, the patient stated that his children are a primary reason for his being in treatment.', type: 'text', showActions: true },
    { field: 'Explicitly Stated Next Steps', content: 'No next steps were discussed.', type: 'text', showActions: true },
  ]},
  { section: 'Participant 1', cards: [
    { field: 'Client Response to Intervention(s)', content: 'Participant 1 participated in the icebreaker activity and provided a brief response to the prompt but did not elaborate further. They did not verbally engage in subsequent group discussion and did not respond to questions regarding substance use history or motivation for treatment. No additional information was shared during this session.', type: 'text', showActions: true },
    { field: 'ASAM-Relevant Disclosures', content: 'No ASAM-relevant disclosures were made.', type: 'text', showActions: true },
    { field: 'Significant Peer Interactions', content: 'No significant peer interactions were reported.', type: 'text', showActions: true },
    { field: 'Explicitly Stated Plans for Next Steps', content: 'No next steps were discussed or identified by the participant.', type: 'text', showActions: true },
  ]},
];

// ── Group session — multiple suggestions per member + ASAM ───────────────────

const GROUP_ASAM_SUGGESTIONS_DATA = [
  { section: 'Data', cards: [
    { field: 'Group Process', content: 'SUD group session focused on craving management and social triggers. 5 of 6 members present. One member disclosed a slip since last session; group responded with support and non-judgment. Motivational enhancement techniques used to reinforce ambivalence exploration.', type: 'text', showActions: true },
    { field: 'ASAM Dimensions', chips: ['D1: Acute intoxication — none reported', 'D2: Biomedical — stable', 'D3: Emotional/Behavioral — moderate', 'D4: Readiness — contemplation–preparation', 'D5: Relapse potential — moderate-high', 'D6: Recovery environment — limited support'], type: 'chips' },
    { field: 'Session Content', content: 'Reviewed urge surfing and HALT framework. Role-played refusal skills for social scenarios. Discussed building sober support networks. One member identified a sponsor; group celebrated milestone. Psychoeducation on the neurobiological basis of craving provided.', type: 'text' },
  ]},
  { section: 'Assessment', cards: [
    { field: 'Clinical Status', content: 'Group continues to demonstrate recovery-oriented engagement. ASAM Level of Care reassessment indicates continued appropriateness of current IOP level for most members. One member presenting with elevated relapse risk warrants increased monitoring and possible step-up evaluation.', type: 'text', showActions: true },
    { field: 'Member Progress', chips: ['Sustained abstinence: 3 members', 'Single slip — re-engaged: 1 member', 'Active use — safety planning: 1 member', 'Absent: 1 member'], type: 'chips' },
    { field: 'ASAM Level of Care', content: 'Majority of members appropriate for ASAM Level 2.1 (Intensive Outpatient). One member to be referred for Level 2.5 (Partial Hospitalization) evaluation based on elevated D5 (relapse potential) and D6 (recovery environment) scores.', type: 'text' },
  ]},
  { section: 'Plan', cards: [
    { field: 'Group Plan', content: 'Continue ASAM-informed IOP group twice weekly. Next session: relapse prevention planning and building recovery capital. Schedule ASAM reassessment for member at elevated risk. Coordinate with prescribers regarding MAT status for two members.', type: 'text', showActions: true },
    { field: 'Individual Suggestions', chips: ['Multiple per-member notes generated', 'ASAM dimension scores documented individually', 'Step-up referral initiated for 1 member', 'MAT coordination for 2 members'], type: 'chips' },
    { field: 'Follow-up', content: 'Group meets again in 3 days. Individual case reviews scheduled with each member\'s primary counselor this week. ASAM reassessment forms distributed for completion prior to next clinical team meeting.', type: 'text' },
  ]},
];

// ── Jake Carol suggestions ────────────────────────────────────────────────────

const JAKE_CAROL_SUGGESTIONS_DATA = [
  { section: 'Key Moments', cards: [
    { field: 'Relationship & Living Situation', content: 'The therapist and client discussed the client\'s relationship with his partner, including their current living situation and the possibility of her moving back in.', type: 'text', showActions: true },
    { field: 'Codependency & Early Recovery', content: 'The therapist shared concerns about the potential challenges of a codependent dynamic, especially during early recovery, and emphasized the importance of both the client and his partner maintaining their individual recovery.', type: 'text', showActions: true },
  ]},
  { section: 'Interventions', cards: [
    { field: 'Boundary Setting', content: 'Client was encouraged to establish clear boundaries with his partner and explored what those boundaries might look like in practice, highlighting their importance for both his own well-being and that of his family.', type: 'text', showActions: true },
    { field: 'Motivational Interviewing', content: 'Motivational interviewing techniques were used to strengthen the client\'s commitment to recovery and to support him in taking actionable steps toward his goals.', type: 'text', showActions: true },
    { field: 'Psychoeducation', content: 'The therapist provided psychoeducation on the benefits of family sessions for couples in recovery, particularly in improving communication and relationship functioning.', type: 'text', showActions: true },
  ]},
  { section: 'Assessment', cards: [
    { field: 'Engagement & Receptivity', content: 'The client appeared engaged, open, and receptive throughout the session. He demonstrated a clear commitment to his recovery and a willingness to take necessary steps to support both himself and his family.', type: 'text', showActions: true },
    { field: 'Insight', content: 'The client showed insight into the importance of setting boundaries, particularly within his relationship, as a way to foster a more stable and healthy environment.', type: 'text', showActions: true },
  ]},
  { section: 'Plan', cards: [
    { field: 'Treatment & Sobriety', content: 'The client will continue participating in his current treatment and maintaining sobriety.', type: 'text', showActions: true },
    { field: 'Boundaries', content: 'He will establish and uphold clear boundaries regarding his partner\'s potential move-in, with an emphasis on her commitment to treatment and sobriety.', type: 'text', showActions: true },
    { field: 'Family Therapy', content: 'Additionally, the client will consider participating in family therapy sessions to further strengthen relationship dynamics and communication.', type: 'text', showActions: true },
  ]},
];

// ── Progress Note suggestions (Jacob Rosen) ───────────────────────────────────

const PROGRESS_NOTE_SUGGESTIONS_DATA = [
  { section: 'Progress Note', cards: [
    { field: 'Note Addresses Which Objective', content: 'The purpose of this session was to evaluate the client\'s mental status, support him in managing depressive symptoms, and discuss coping strategies.', type: 'text', showActions: true },
    { field: 'Describe Details of the Case Management Service', content: 'The session took place at a local park near the client\'s home. The client expressed symptoms of increased depression, stating, "It has been hard to leave the house." He shared a history of seasonal mood shifts, particularly during winter. The discussion included utilizing the DBT Wise Mind approach to assist him in accessing both intuitive and rational thinking when making decisions.', type: 'text', showActions: true },
    { field: 'Explain Linkage to Services', content: 'The Wise Mind technique is integral in helping the client balance emotional responses with logical reasoning, which can enhance his decision-making and problem-solving capabilities.', type: 'text', showActions: true },
    { field: 'Clinical Observations', content: 'During the mental status exam, the client\'s mood was noted to be depressed. Nevertheless, he denied any suicidal ideation (SI) and agreed to a safety plan.', type: 'text', showActions: true },
    { field: 'Client Responses', content: 'The client demonstrated willingness to reach out for support as needed, indicating a degree of proactive engagement in his treatment process.', type: 'text', showActions: true },
    { field: 'Progress Towards Recovery Plan Objectives', content: 'Despite ongoing struggles with depression, the client has shown progress by being open about his feelings and agreeing to utilize coping strategies, including the safety planning discussed during the session.', type: 'text', showActions: true },
    { field: 'Timelines for Next Service', content: 'The client agreed to reach out for additional support as he navigates his depressive symptoms moving forward.', type: 'text', showActions: true },
  ]},
];

// ── Jacob Rosen audio session suggestions ────────────────────────────────────

const JACOB_AUDIO_SUGGESTIONS_DATA = [
  { section: 'Key Moments', cards: [
    { field: 'Relationship & Living Situation', content: 'The therapist and client discussed the client\'s relationship with his partner, including their current living situation and the possibility of her moving back in.', type: 'text', showActions: true },
    { field: 'Codependency & Early Recovery', content: 'The therapist shared concerns about the potential challenges of a codependent dynamic, especially during early recovery, and emphasized the importance of both the client and his partner maintaining their individual recovery.', type: 'text', showActions: true },
  ]},
  { section: 'Interventions', cards: [
    { field: 'Boundary Setting', content: 'Client was encouraged to establish clear boundaries with his partner and explored what those boundaries might look like in practice, highlighting their importance for both his own well-being and that of his family.', type: 'text', showActions: true },
    { field: 'Motivational Interviewing', content: 'Motivational interviewing techniques were used to strengthen the client\'s commitment to recovery and to support him in taking actionable steps toward his goals.', type: 'text', showActions: true },
    { field: 'Psychoeducation', content: 'The therapist provided psychoeducation on the benefits of family sessions for couples in recovery, particularly in improving communication and relationship functioning.', type: 'text', showActions: true },
  ]},
  { section: 'Assessment', cards: [
    { field: 'Engagement & Receptivity', content: 'The client appeared engaged, open, and receptive throughout the session. He demonstrated a clear commitment to his recovery and a willingness to take necessary steps to support both himself and his family.', type: 'text', showActions: true },
    { field: 'Insight', content: 'The client showed insight into the importance of setting boundaries, particularly within his relationship, as a way to foster a more stable and healthy environment.', type: 'text', showActions: true },
  ]},
  { section: 'Plan', cards: [
    { field: 'Treatment & Sobriety', content: 'The client will continue participating in his current treatment and maintaining sobriety.', type: 'text', showActions: true },
    { field: 'Boundaries', content: 'He will establish and uphold clear boundaries regarding his partner\'s potential move-in, with an emphasis on her commitment to treatment and sobriety.', type: 'text', showActions: true },
    { field: 'Family Therapy', content: 'Additionally, the client will consider participating in family therapy sessions to further strengthen relationship dynamics and communication.', type: 'text', showActions: true },
  ]},
];

// ── Suggestions Panel ─────────────────────────────────────────────────────────

function SuggestionsPanel({ clientName, sessionSubtitle, onBack, onAddToNote, onAddedToEHR, suggestionsData, session = null, isIndividualAudio = false, compactMode = false, sidebarW = 467 }) {
  const P = { fontFamily: 'Poppins, sans-serif' };
  const focusedEhrField = useEhrField()?.activeField ?? null;

  // Resolve which dataset to use — NoteTypeContext override takes priority,
  // then session-based selection, then default.
  const resolvedData = (() => {
    if (suggestionsData) return suggestionsData;
    if (!session) return SUGGESTIONS_DATA;
    if (session.id === 'jake' || session.id === 'larry') return JAKE_CAROL_SUGGESTIONS_DATA;
    if (session.id === 'jacob-audio') return JACOB_AUDIO_SUGGESTIONS_DATA;
    if (session.id === 'anger-grp') return ANGER_GROUP_SUGGESTIONS_DATA;
    if (session.id === 'sud-grp') return SUD_GROUP_SUGGESTIONS_DATA;
    if (session.specialty === 'psychiatry' || session.noteType === 'Med Management') return PSYCH_SUGGESTIONS_DATA;
    if (session.noteType === 'Assessment') return ASSESSMENT_SUGGESTIONS_DATA;
    if (session.noteType === 'Case Management') return CASE_MGMT_SUGGESTIONS_DATA;
    if (session.noteType === 'Treatment Plan') return TREATMENT_PLAN_SUGGESTIONS_DATA;
    if (session.noteType === 'Progress Note') return PROGRESS_NOTE_SUGGESTIONS_DATA;
    if (session.type === 'group' && session.includesASAM) return GROUP_ASAM_SUGGESTIONS_DATA;
    if (session.type === 'group') return GROUP_SINGLE_SUGGESTIONS_DATA;
    return SUGGESTIONS_DATA;
  })();
  const data = resolvedData;
  const SHADOW_EL4 = '0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 10px 0px rgba(0,0,0,0.1), 0px 1px 10px 0px rgba(0,0,0,0.1)';
  const SHADOW_EL16 = '0px 8px 10px -5px rgba(0,0,0,0.2), 0px 16px 24px 1px rgba(0,0,0,0.1), 0px 6px 30px 5px rgba(0,0,0,0.12)';

  const isTextSession = session?.sessionType === 'text';
  // Tabs: coding tab only shown for individual audio sessions
  const TABS = isIndividualAudio ? ['suggestions', 'coding', 'insights'] : ['suggestions', 'insights'];
  const TAB_LABELS = { suggestions: 'Suggestions', insights: 'Insights', coding: 'Codes' };
  const CPT_COUNT = 3;

  const [activeTab, setActiveTab] = useState('suggestions'); // 'suggestions' | 'insights' | 'coding'
  const [activeSectionIdx, setActiveSectionIdx] = useState(0);
  const [activeCardIdx, setActiveCardIdx] = useState(0);
  const [openSections, setOpenSections] = useState(new Set(data.map(s => s.section)));
  const [excluded, setExcluded] = useState(new Set());
  const [added, setAdded] = useState(new Set()); // tracks cards whose content was added to EHR
  const [copied, setCopied] = useState(new Set()); // tracks cards whose content was copied
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  // ── Edit-suggestion state ──────────────────────────────────────────────────
  const [editingKey, setEditingKey] = useState(null);        // excludeKey of card being edited
  const [editDraft, setEditDraft] = useState('');             // live textarea value
  const [editedContent, setEditedContent] = useState({});    // key → saved override text
  const [hoveredEditKey, setHoveredEditKey] = useState(null); // for icon-button hover state

  const getCardContent = (key, original) => editedContent[key] ?? original;

  const startEdit = (key, content) => {
    setEditingKey(key);
    setEditDraft(getCardContent(key, content));
  };
  const cancelEdit = () => { setEditingKey(null); setEditDraft(''); };
  const confirmEdit = (key) => {
    if (editDraft.trim()) setEditedContent(prev => ({ ...prev, [key]: editDraft.trim() }));
    setEditingKey(null);
    setEditDraft('');
  };
  const scrollRef = useRef(null);
  const sectionRefs = useRef({});
  const cardRefs = useRef({});

  // Single-section datasets navigate card-by-card instead of section-by-section
  const isSingleSection = data.length === 1;
  const flatCards = isSingleSection ? data[0].cards : [];

  const scrollToSection = (idx) => {
    const section = data[idx]?.section;
    const el = sectionRefs.current[section];
    if (el && scrollRef.current) {
      scrollRef.current.scrollTo({ top: el.offsetTop - scrollRef.current.offsetTop, behavior: 'smooth' });
    }
  };

  const scrollToCard = (idx) => {
    const field = flatCards[idx]?.field;
    const el = cardRefs.current[field];
    if (el && scrollRef.current) {
      scrollRef.current.scrollTo({ top: el.offsetTop - scrollRef.current.offsetTop - 8, behavior: 'smooth' });
    }
  };

  const checkScrollBottom = () => {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 8) {
      setHasScrolledToBottom(true);
    }
  };

  useEffect(() => {
    // Check on mount in case content fits without scrolling
    checkScrollBottom();
  }, []);

  const totalSuggestions = data.reduce((acc, s) => acc + s.cards.length, 0);
  const activeCount = totalSuggestions - excluded.size;

  const toggleSection = (name) => setOpenSections(prev => {
    const next = new Set(prev);
    next.has(name) ? next.delete(name) : next.add(name);
    return next;
  });

  const toggleExclude = (key) => setExcluded(prev => {
    const next = new Set(prev);
    next.has(key) ? next.delete(key) : next.add(key);
    return next;
  });

  const currentSection = data[activeSectionIdx];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#EAEDFA', gap: 8 }}>

      {/* Header */}
      <div style={{ background: 'white', borderRadius: 16, boxShadow: SHADOW_EL4, flexShrink: 0, padding: compactMode ? '10px 10px 8px' : '16px 16px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', color: 'rgba(0,0,0,0.54)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <span style={{ ...P, fontSize: compactMode ? 15 : 18, fontWeight: 600, color: 'rgba(0,0,0,0.87)', lineHeight: 1.57, letterSpacing: '0.018px' }}>{clientName}</span>
            <span style={{ ...P, fontSize: 12, fontWeight: 400, color: 'rgba(0,0,0,0.6)', lineHeight: 1.66, letterSpacing: '0.4px' }}>{sessionSubtitle}</span>
          </div>
          <FigmaUserAvatar />
        </div>
        {clientName === 'Ryan Cho' && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
            <DurationPill />
          </div>
        )}
      </div>

      {/* Main card */}
      <div style={{ flex: 1, background: 'white', borderRadius: '16px 16px 0 0', boxShadow: SHADOW_EL16, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>

        {/* Tabs */}
        <div style={{ display: isTextSession ? 'none' : 'flex', flexShrink: 0, height: compactMode ? 34 : 42, borderBottom: '1px solid rgba(0,0,0,0.12)', background: 'white' }}>
          {TABS.map(tab => (
            <div key={tab} onClick={() => setActiveTab(tab)}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ ...P, fontSize: compactMode ? 13 : 14, fontWeight: activeTab === tab ? 500 : 400, color: activeTab === tab ? '#2d4ccd' : 'rgba(0,0,0,0.6)', letterSpacing: '0.4px' }}>{TAB_LABELS[tab]}</span>
                {tab === 'coding' && (
                  <span style={{ background: '#2d4ccd', borderRadius: 9999, padding: '1px 6px', fontSize: 12, fontWeight: 500, color: 'white', fontFamily: 'Poppins, sans-serif', letterSpacing: '0.16px', lineHeight: '18px' }}>{CPT_COUNT}</span>
                )}
              </div>
              {activeTab === tab && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: '#2d4ccd', borderRadius: '2px 2px 0 0' }} />}
            </div>
          ))}
        </div>

        {/* Insights tab content */}
        {activeTab === 'insights' && <InsightsPanel sidebarW={sidebarW} />}

        {/* Coding tab content — individual audio sessions only */}
        {activeTab === 'coding' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 28px' }}>
            <div style={{ position: 'sticky', top: 0, height: 16, background: 'white', zIndex: 5, marginLeft: -16, marginRight: -16 }} />
            <CptCardList compactMode={compactMode} />
          </div>
        )}

        {/* Nav bar — Suggestions tab only */}
        {activeTab === 'suggestions' && <div style={{ flexShrink: 0, height: 48, background: '#EAEDFA', borderBottom: '1px solid rgba(33,33,33,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px' }}>
          {isSingleSection ? (
            /* Card-level nav for single-section datasets */
            <>
              <div style={{ display: 'flex', gap: 2, alignItems: 'center', minWidth: 0, flex: 1, marginRight: 8 }}>
                <span style={{ ...P, fontSize: 12, fontWeight: 400, color: 'rgba(0,0,0,0.6)', letterSpacing: '0.17px', flexShrink: 0 }}>{activeCardIdx + 1} of {flatCards.length}:</span>
                <span style={{ ...P, fontSize: 12, fontWeight: 600, color: 'rgba(0,0,0,0.87)', letterSpacing: '0.17px', marginLeft: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{flatCards[activeCardIdx]?.field}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                <button onClick={() => { const next = Math.max(0, activeCardIdx - 1); setActiveCardIdx(next); scrollToCard(next); }} disabled={activeCardIdx === 0}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, height: 24, padding: 6, background: 'rgba(255,255,255,0.5)', border: 'none', borderRadius: 4, cursor: activeCardIdx === 0 ? 'default' : 'pointer', ...P, fontSize: 12, fontWeight: 500, color: activeCardIdx === 0 ? 'rgba(33,33,33,0.38)' : 'rgba(0,0,0,0.87)', letterSpacing: '0.16px' }}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Prev
                </button>
                <button onClick={() => { const next = Math.min(flatCards.length - 1, activeCardIdx + 1); setActiveCardIdx(next); scrollToCard(next); }} disabled={activeCardIdx === flatCards.length - 1}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, height: 24, padding: 6, background: 'rgba(255,255,255,0.7)', border: 'none', borderRadius: 4, cursor: activeCardIdx === flatCards.length - 1 ? 'default' : 'pointer', ...P, fontSize: 12, fontWeight: 500, color: activeCardIdx === flatCards.length - 1 ? 'rgba(33,33,33,0.38)' : 'rgba(0,0,0,0.87)', letterSpacing: '0.16px' }}>
                  Next
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
            </>
          ) : (
            /* Section-level nav for multi-section datasets */
            <>
              <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <span style={{ ...P, fontSize: 12, fontWeight: 400, color: 'rgba(0,0,0,0.6)', letterSpacing: '0.17px' }}>{activeSectionIdx + 1} of {data.length}:</span>
                <span style={{ ...P, fontSize: 12, fontWeight: 600, color: 'rgba(0,0,0,0.87)', letterSpacing: '0.17px', marginLeft: 3 }}>{currentSection.section}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button onClick={() => { const next = Math.max(0, activeSectionIdx - 1); setActiveSectionIdx(next); scrollToSection(next); }} disabled={activeSectionIdx === 0}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, height: 24, padding: 6, background: 'rgba(255,255,255,0.5)', border: 'none', borderRadius: 4, cursor: activeSectionIdx === 0 ? 'default' : 'pointer', ...P, fontSize: 12, fontWeight: 500, color: activeSectionIdx === 0 ? 'rgba(33,33,33,0.38)' : 'rgba(0,0,0,0.87)', letterSpacing: '0.16px' }}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Prev
                </button>
                <button onClick={() => { const next = Math.min(data.length - 1, activeSectionIdx + 1); setActiveSectionIdx(next); scrollToSection(next); }} disabled={activeSectionIdx === data.length - 1}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, height: 24, padding: 6, background: 'rgba(255,255,255,0.7)', border: 'none', borderRadius: 4, cursor: activeSectionIdx === data.length - 1 ? 'default' : 'pointer', ...P, fontSize: 12, fontWeight: 500, color: activeSectionIdx === data.length - 1 ? 'rgba(33,33,33,0.38)' : 'rgba(0,0,0,0.87)', letterSpacing: '0.16px' }}>
                  Next
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
            </>
          )}
        </div>}

        {/* Scrollable sections — Suggestions tab only */}
        {activeTab === 'suggestions' && <div ref={scrollRef} onScroll={checkScrollBottom} style={{ flex: 1, overflowY: 'auto', paddingBottom: 82 }}>
          <div style={{ position: 'sticky', top: 0, height: 0, background: 'white', zIndex: 5 }} />
          {data.map(({ section, cards }) => {
            const isOpen = openSections.has(section);
            return (
              <div key={section} ref={el => { sectionRefs.current[section] = el; }}>
                {/* Section header */}
                <div onClick={() => toggleSection(section)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'white', borderTop: '1px solid rgba(0,0,0,0.12)', borderBottom: '1px solid rgba(0,0,0,0.12)', cursor: 'pointer' }}>
                  <span style={{ ...P, fontSize: 14, fontWeight: 500, color: 'rgba(0,0,0,0.87)', letterSpacing: '0.17px' }}>{section}</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s', flexShrink: 0 }}>
                    <path d="M6 9l6 6 6-6" stroke="rgba(0,0,0,0.54)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>

                {/* Section body */}
                {isOpen && (
                  <div style={{ background: '#eceff1', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {cards.map((card) => {
                      const excludeKey = `${section}-${card.field}`;
                      const isExcluded = excluded.has(excludeKey);
                      const isEditing  = editingKey === excludeKey;
                      const isEdited   = !!editedContent[excludeKey];
                      const displayContent = getCardContent(excludeKey, card.content);
                      const originalContent = card.content;
                      return (
                        <div
                          key={card.field}
                          ref={isSingleSection ? el => { cardRefs.current[card.field] = el; } : null}
                          style={{ background: 'white', border: '1px solid rgba(33,33,33,0.23)', borderRadius: 8, padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}
                        >
                          {/* Row 1: label + Exclude (always visible; disabled while editing) */}
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                            <span style={{ ...P, flex: 1, fontSize: 14, fontWeight: 500, color: 'rgba(0,0,0,0.87)', lineHeight: 1.334, letterSpacing: '0.17px' }}>
                              {card.field}
                              {isEdited && !isEditing && (
                                <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 600, color: '#2d4ccd', background: '#eaedfa', borderRadius: 4, padding: '1px 5px', letterSpacing: '0.3px', verticalAlign: 'middle' }}>Edited</span>
                              )}
                            </span>
                            {!isExcluded && (
                              <button
                                onClick={isEditing ? undefined : () => toggleExclude(excludeKey)}
                                disabled={isEditing}
                                style={{ display: 'flex', alignItems: 'center', gap: 4, height: 24, padding: '0 6px', background: 'none', border: 'none', borderRadius: 4, cursor: isEditing ? 'default' : 'pointer', flexShrink: 0, ...P, fontSize: 12, fontWeight: 500, color: isEditing ? 'rgba(0,0,0,0.26)' : 'rgba(0,0,0,0.87)', letterSpacing: '0.16px' }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8"/><path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                                Exclude
                              </button>
                            )}
                          </div>

                          {/* Row 2: content box — textarea when editing, styled box when reading */}
                          {isEditing ? (
                            /* ── Edit mode: blue border only on this wrapper ── */
                            <div style={{ position: 'relative', border: '1.5px solid #2d4ccd', borderRadius: 8, padding: 8 }}>
                              <textarea
                                autoFocus
                                ref={el => { if (el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; } }}
                                value={editDraft}
                                onChange={e => {
                                  setEditDraft(e.target.value);
                                  e.target.style.height = 'auto';
                                  e.target.style.height = e.target.scrollHeight + 'px';
                                }}
                                rows={1}
                                style={{ width: '100%', boxSizing: 'border-box', resize: 'none', overflow: 'hidden', background: 'transparent', border: 'none', borderRadius: 0, padding: '0 24px 0 0', ...P, fontSize: 14, fontWeight: 400, color: 'rgba(0,0,0,0.87)', lineHeight: 1.43, letterSpacing: '0.17px', outline: 'none' }}
                              />
                              <div style={{ position: 'absolute', top: 0, right: 0, width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(0,0,0,0.26)', pointerEvents: 'none' }}>
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M3 10.917V13H5.08304L11.2266 6.85641L9.14359 4.77336L3 10.917ZM12.8375 5.24552C13.0542 5.02888 13.0542 4.67893 12.8375 4.4623L11.5377 3.16248C11.3211 2.94584 10.9711 2.94584 10.7545 3.16248L9.73795 4.179L11.821 6.26205L12.8375 5.24552Z" fill="currentColor" fillOpacity="0.87"/>
                                </svg>
                              </div>
                            </div>
                          ) : (
                            /* ── Normal / read-only mode ── */
                            <>
                              {card.type === 'text' && (
                                <div style={{ position: 'relative', background: isExcluded ? '#f5f5f5' : '#f4f6ff', borderRadius: 8, padding: 8 }}>
                                  <p style={{ ...P, fontSize: 14, fontWeight: 400, color: isExcluded ? 'rgba(0,0,0,0.38)' : 'rgba(0,0,0,0.87)', lineHeight: 1.43, letterSpacing: '0.17px', margin: 0, textDecoration: isExcluded ? 'line-through' : 'none', paddingRight: isExcluded ? 0 : 28 }}>{displayContent}</p>
                                  {!isExcluded && (
                                    <button
                                      onClick={() => startEdit(excludeKey, originalContent)}
                                      onMouseEnter={() => setHoveredEditKey(excludeKey)}
                                      onMouseLeave={() => setHoveredEditKey(null)}
                                      title="Edit suggestion"
                                      style={{ position: 'absolute', top: 6, right: 6, width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', background: hoveredEditKey === excludeKey ? 'rgba(45,76,205,0.12)' : 'transparent', border: 'none', borderRadius: 4, cursor: 'pointer', color: '#2d4ccd', transition: 'background 0.12s', padding: 0, flexShrink: 0 }}>
                                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M3 10.917V13H5.08304L11.2266 6.85641L9.14359 4.77336L3 10.917ZM12.8375 5.24552C13.0542 5.02888 13.0542 4.67893 12.8375 4.4623L11.5377 3.16248C11.3211 2.94584 10.9711 2.94584 10.7545 3.16248L9.73795 4.179L11.821 6.26205L12.8375 5.24552Z" fill="currentColor" fillOpacity="0.87"/>
                                      </svg>
                                    </button>
                                  )}
                                </div>
                              )}
                              {card.type === 'chips' && (
                                <div style={{ background: isExcluded ? '#f5f5f5' : '#f4f6ff', borderRadius: 8, padding: 8, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 0 }}>
                                  {card.chips.map((chip, ci) => (
                                    <React.Fragment key={chip}>
                                      <span style={{ ...P, fontSize: 14, fontWeight: 400, color: isExcluded ? 'rgba(0,0,0,0.38)' : 'rgba(0,0,0,0.87)', lineHeight: 1.43, letterSpacing: '0.17px', textDecoration: isExcluded ? 'line-through' : 'none' }}>{chip}</span>
                                      {ci < card.chips.length - 1 && (
                                        <span style={{ display: 'inline-block', width: 1, height: 16, background: 'rgba(0,0,0,0.12)', margin: '0 8px', verticalAlign: 'middle' }} />
                                      )}
                                    </React.Fragment>
                                  ))}
                                </div>
                              )}

                              {/* Row 3: Copy/Add actions OR Undo Exclusion */}
                              {isExcluded ? (
                                <button onClick={() => toggleExclude(excludeKey)}
                                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, width: '100%', height: 24, padding: 6, background: '#eaedfa', border: 'none', borderRadius: 4, cursor: 'pointer', ...P, fontSize: 12, fontWeight: 500, color: '#2d4ccd', letterSpacing: '0.16px' }}>
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M3 7v6h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                  Undo Exclusion
                                </button>
                              ) : card.showActions && (
                                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8 }}>
                                  {/* Copy button */}
                                  <button onClick={() => {
                                    navigator.clipboard.writeText(displayContent).catch(() => {});
                                    setCopied(prev => new Set(prev).add(excludeKey));
                                    setTimeout(() => setCopied(prev => { const n = new Set(prev); n.delete(excludeKey); return n; }), 1800);
                                  }} style={{ display: 'flex', alignItems: 'center', gap: 4, height: 24, padding: 6, background: 'none', border: 'none', borderRadius: 4, cursor: 'pointer', ...P, fontSize: 12, fontWeight: 500, color: '#2d4ccd', letterSpacing: '0.16px' }}>
                                    {copied.has(excludeKey) ? (
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                    ) : (
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.8"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                                    )}
                                    <span style={{ color: copied.has(excludeKey) ? '#22c55e' : '#2d4ccd' }}>{copied.has(excludeKey) ? 'Copied!' : 'Copy'}</span>
                                  </button>
                                  <span style={{ width: 1, height: 12, background: 'rgba(0,0,0,0.12)', display: 'inline-block' }} />
                                  {/* Add to EHR button */}
                                  {(() => {
                                    const isAdded = added.has(excludeKey);
                                    const canAdd = isAdded || !!focusedEhrField;
                                    return (
                                      <button
                                        onMouseDown={e => e.preventDefault()}
                                        onClick={() => {
                                          if (!canAdd) return;
                                          onAddToNote?.(focusedEhrField ?? section, displayContent, card.field);
                                          setAdded(prev => new Set(prev).add(excludeKey));
                                          setTimeout(() => setAdded(prev => { const n = new Set(prev); n.delete(excludeKey); return n; }), 1800);
                                        }}
                                        style={{ display: 'flex', alignItems: 'center', gap: 4, height: 24, padding: 6, background: 'none', border: 'none', borderRadius: 4, cursor: canAdd ? 'pointer' : 'default', ...P, fontSize: 12, fontWeight: 500, color: isAdded ? '#22c55e' : canAdd ? '#2d4ccd' : '#bbb', letterSpacing: '0.16px', transition: 'color 0.15s' }}
                                      >
                                        {isAdded ? (
                                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                        ) : (
                                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                                        )}
                                        {isAdded ? 'Added!' : 'Add to EHR'}
                                      </button>
                                    );
                                  })()}
                                </div>
                              )}
                            </>
                          )}

                          {/* Row 3 (edit mode only): Cancel / Update — outside the content area */}
                          {isEditing && (
                            <>
                              {editDraft.trim() === '' && (
                                <p style={{ ...P, fontSize: 12, color: '#e53935', margin: 0, letterSpacing: '0.17px' }}>Content cannot be empty — changes won't be saved.</p>
                              )}
                              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8 }}>
                                <button onClick={cancelEdit}
                                  style={{ ...P, fontSize: 14, fontWeight: 500, color: 'rgba(0,0,0,0.87)', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.1px', padding: '0 4px' }}>
                                  Cancel
                                </button>
                                <span style={{ width: 1, height: 14, background: 'rgba(0,0,0,0.2)', display: 'inline-block' }} />
                                <button onClick={() => confirmEdit(excludeKey)}
                                  disabled={!editDraft.trim() || editDraft.trim() === displayContent.trim()}
                                  style={{ display: 'flex', alignItems: 'center', gap: 4, ...P, fontSize: 14, fontWeight: 500, color: (editDraft.trim() && editDraft.trim() !== displayContent.trim()) ? '#2d4ccd' : '#bbb', background: 'none', border: 'none', cursor: (editDraft.trim() && editDraft.trim() !== displayContent.trim()) ? 'pointer' : 'default', letterSpacing: '0.1px', padding: '0 4px' }}>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                  Update
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>}

        {/* Bottom CTA bar — Suggestions tab only */}
        {activeTab === 'suggestions' && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#EAEDFA', padding: '16px 24px 24px', boxShadow: '0px -1px 10px 0px rgba(0,0,0,0.1), 0px -4px 10px 0px rgba(0,0,0,0.1)' }}>
          {hasScrolledToBottom ? (
            <button
              onClick={() => {
                data.forEach(({ section, cards }) => {
                  cards.forEach(card => {
                    if (card.type === 'text' && card.showActions && !excluded.has(`${section}-${card.field}`)) {
                      onAddToNote?.(section, card.content, card.field);
                    }
                  });
                });
                onAddedToEHR?.();
              }}
              style={{ width: '100%', height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#2d4ccd', border: 'none', borderRadius: 4, cursor: 'pointer', boxShadow: '0px 1px 5px rgba(0,0,0,0.12), 0px 2px 2px rgba(0,0,0,0.14), 0px 3px 1px -2px rgba(0,0,0,0.2)', ...P, fontSize: 13, fontWeight: 500, color: 'white', letterSpacing: '0.46px' }}>
              {compactMode ? `Add ${activeCount} to EHR` : `Add ${activeCount} suggestion${activeCount !== 1 ? 's' : ''} to EHR`}
            </button>
          ) : (
            <button style={{ width: '100%', height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'rgba(45,76,205,0.12)', border: 'none', borderRadius: 4, cursor: 'default', ...P, fontSize: 13, fontWeight: 500, color: '#2d4ccd', letterSpacing: '0.46px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M6 7l6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 13l6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Scroll down to add all
            </button>
          )}
        </div>}
      </div>
    </div>
  );
}

// ── Insights Panel ────────────────────────────────────────────────────────────

function InsightsPanel({ sidebarW = 467 }) {
  const P = { fontFamily: 'Poppins, sans-serif' };
  const compactMode = sidebarW < 380;
  // Compute how wide the arc chart can actually be:
  // nav rail + InsightsPanel outer padding (20×2) + card inner padding (12×2 default, 8×2 compact)
  const navRailW = compactMode ? 54 : 74;
  const cardPadH = compactMode ? 16 : 24; // 8×2 or 12×2
  const contentW = sidebarW - navRailW - 40 - cardPadH; // full card content width
  const chartW = Math.min(240, contentW);
  const chartR = chartW / 240; // scale ratio 0–1
  const bubbleScale = Math.min(1, contentW / 260); // bubble chart design width = 260px
  const [themesView, setThemesView] = useState('graph'); // 'graph' | 'tags'
  const [selectedTheme, setSelectedTheme] = useState(null); // null | theme label
  const [themeZoom, setThemeZoom] = useState(1);
  // Reset zoom whenever the user switches to a different theme
  useEffect(() => { setThemeZoom(1); }, [selectedTheme]);

  // SVG arc helpers — open horseshoe (240° span, 120° gap at bottom)
  const R = 96, CX = 120, CY = 120, SW = 16;
  const C = 2 * Math.PI * R; // ≈ 603.19
  const ARC_START = 150; // degrees from east, clockwise → starts at bottom-left
  const GAP_DEG = 16;    // each inter-segment gap (rounded caps extend ~6.6°, so ~3° visible gap)
  const USABLE_DEG = 240 - 2 * GAP_DEG; // 208° usable arc for segments
  const arcSegs = [
    { label: 'Patient',  pct: 60, color: '#7ecfc4' },  // soft mint
    { label: 'Silence',  pct: 10, color: '#8da8ba' },  // muted blue-grey
    { label: 'Provider', pct: 30, color: '#8a9be0' },  // soft periwinkle
  ];
  let _angle = ARC_START;
  const arcs = arcSegs.map((seg, i) => {
    const spanDeg = (seg.pct / 100) * USABLE_DEG;
    const dash = (spanDeg / 360) * C;
    const gap  = C - dash;
    const rotate = _angle;
    _angle += spanDeg + (i < arcSegs.length - 1 ? GAP_DEG : 0);
    return { ...seg, dash, gap, rotate };
  });

  // Themes data
  // Bubble sizes: diameter ∝ sqrt(count) so area ∝ count
  // Depression r=52, Substance Use / Anxiety r=44.5 → 12px gap between every pair
  // Triangle layout: Depression top-centre, two smaller below, no overlap
  const bubbles = [
    { label: 'Depression',    count: 15, color: '#29b6f6', size: 104, top: 0,   left: 78  },
    { label: 'Substance Use', count: 11, color: '#ffa726', size: 89,  top: 104, left: 35  },
    { label: 'Anxiety',       count: 11, color: '#ec407a', size: 89,  top: 104, left: 136 },
  ];
  const tags = [
    { theme: 'Depression',    words: ['Death (5)', 'Cry (3)', 'Fault (3)', 'Hurt (1)', 'Loss (1)'], star: false },
    { theme: 'Anxiety',       words: ['Threatened (5)', 'Scream (3)', 'Fear (3)'],                  star: true  },
    { theme: 'Substance Use', words: ['Bar (5)', 'Alcohol (6)'],                                    star: false },
  ];

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 24px' }}>
      {/* ── Listening Ratio ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ ...P, fontSize: 14, fontWeight: 500, color: 'rgba(0,0,0,0.87)', letterSpacing: '0.17px' }}>Listening Ratio</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="rgba(0,0,0,0.38)" strokeWidth="1.5"/><path d="M12 8h.01M12 11v5" stroke="rgba(0,0,0,0.38)" strokeWidth="1.5" strokeLinecap="round"/></svg>
      </div>

      <div style={{ background: 'white', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 12, padding: compactMode ? '12px 8px 10px' : '16px 12px 12px', marginBottom: 20 }}>
        {/* Arc chart */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
          <div style={{ position: 'relative', width: chartW, height: Math.round(218 * chartR), overflow: 'hidden' }}>
            <svg width={chartW} height={chartW} viewBox="0 0 240 240" style={{ position: 'absolute', top: 0, left: 0 }}>
              {/* Open horseshoe segments — no track */}
              {arcs.map(a => (
                <circle key={a.label} cx={CX} cy={CY} r={R} fill="none"
                  stroke={a.color} strokeWidth={SW}
                  strokeDasharray={`${a.dash} ${a.gap}`}
                  strokeLinecap="round"
                  style={{ transform: `rotate(${a.rotate}deg)`, transformOrigin: `${CX}px ${CY}px` }}
                />
              ))}
            </svg>
            {/* Center content — paddingTop and illustration scale with chartR */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: Math.round(62 * chartR), gap: 2 }}>
              <svg width={Math.round(104 * chartR)} height={Math.round(104 * chartR)} viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: 4 }}>
                <path d="M45 90C69.8528 90 90 69.8528 90 45C90 20.1472 69.8528 0 45 0C20.1472 0 0 20.1472 0 45C0 69.8528 20.1472 90 45 90Z" fill="url(#paint0_radial_2613_35556)"/>
                <path d="M33.9268 79.0997C34.8277 79.0999 35.5576 79.8316 35.5576 80.7335C35.5575 81.6353 34.8276 82.3662 33.9268 82.3663C33.0258 82.3663 32.2951 81.6354 32.2949 80.7335C32.2949 79.8315 33.0257 79.0997 33.9268 79.0997ZM39.2695 79.6642C39.8594 79.6644 40.3378 80.143 40.3379 80.7335C40.3379 81.3241 39.8594 81.8026 39.2695 81.8029C38.6794 81.8029 38.2012 81.3242 38.2012 80.7335C38.2013 80.1429 38.6795 79.6642 39.2695 79.6642ZM60.002 78.0314C60.592 78.0315 61.0703 78.5101 61.0703 79.1007C61.0702 79.6913 60.5919 80.17 60.002 80.17C59.4119 80.17 58.9337 79.6913 58.9336 79.1007C58.9336 78.51 59.4119 78.0314 60.002 78.0314ZM19.6768 65.2316C19.8144 66.705 20.1675 68.4691 20.5352 69.0421C20.8763 69.5723 21.505 70.0261 22.9053 70.2911C21.5365 70.4913 20.854 70.8966 20.5879 71.3907C19.9866 72.5112 19.8707 73.6936 19.71 75.5665C19.5758 73.6612 19.4283 72.4615 18.8906 71.4904C18.6176 70.9996 17.816 70.5909 16.4482 70.2911C17.8485 70.0261 18.4784 69.5723 18.8184 69.0421C19.186 68.469 19.6097 66.6066 19.6768 65.2316ZM62.2803 73.089C62.943 73.0892 63.4805 73.6277 63.4805 74.2911C63.4803 74.9545 62.9429 75.4921 62.2803 75.4923C61.6175 75.4923 61.0802 74.9546 61.0801 74.2911C61.0801 73.6276 61.6174 73.089 62.2803 73.089ZM23.9385 73.0909C24.5081 73.091 24.9697 73.5529 24.9697 74.1232C24.9696 74.6933 24.508 75.1554 23.9385 75.1554C23.3689 75.1554 22.9073 74.6933 22.9072 74.1232C22.9072 73.5529 23.3688 73.0909 23.9385 73.0909ZM73.0049 67.798C73.6735 67.798 74.2158 68.3406 74.2158 69.0099C74.2157 69.6791 73.6735 70.2218 73.0049 70.2218C72.3364 70.2217 71.795 69.6791 71.7949 69.0099C71.7949 68.3406 72.3363 67.7981 73.0049 67.798ZM13.6084 66.5704C14.2813 66.5707 14.8271 67.1165 14.8271 67.7902C14.8271 68.4638 14.2813 69.0096 13.6084 69.0099C12.9353 69.0099 12.3897 68.4639 12.3896 67.7902C12.3896 67.1164 12.9353 66.5704 13.6084 66.5704ZM13.0215 60.5499C13.9015 60.55 14.6152 61.2637 14.6152 62.1447C14.6152 63.0256 13.9015 63.7393 13.0215 63.7394C12.1415 63.7394 11.4277 63.0256 11.4277 62.1447C11.4277 61.2637 12.1415 60.5499 13.0215 60.5499ZM70.4717 40.4015C70.6359 42.1644 71.0585 44.2758 71.499 44.9611C71.9061 45.5952 72.6587 46.1381 74.335 46.4552C72.6976 46.6948 71.8805 47.1801 71.5625 47.7716C70.8434 49.1119 70.7048 50.526 70.5117 52.7667C70.3522 50.4867 70.1752 49.0528 69.5312 47.8907C69.2052 47.3027 68.2467 46.814 66.6094 46.4552C68.2837 46.138 69.0383 45.5954 69.4453 44.9611C69.8858 44.2758 70.3918 42.0463 70.4717 40.4015ZM77.6631 48.7472C78.562 48.7474 79.2909 49.4772 79.291 50.3771C79.291 51.2771 78.5621 52.0068 77.6631 52.007C76.7639 52.007 76.0352 51.2772 76.0352 50.3771C76.0353 49.4771 76.764 48.7472 77.6631 48.7472ZM60.0049 40.0714C60.7131 40.0715 61.2871 40.6467 61.2871 41.3556C61.287 42.0644 60.713 42.6387 60.0049 42.6388C59.2968 42.6388 58.7228 42.0644 58.7227 41.3556C58.7227 40.6466 59.2967 40.0714 60.0049 40.0714ZM14.6162 20.8019C14.7827 22.5842 15.2092 24.7186 15.6543 25.4122C16.0659 26.0535 16.8285 26.603 18.5225 26.9259C16.8657 27.1678 16.0393 27.6567 15.7178 28.255C14.9905 29.6104 14.8517 31.0416 14.6562 33.3068C14.4944 31.0011 14.315 29.551 13.6641 28.3761C13.3345 27.7811 12.3658 27.2863 10.71 26.924C12.4039 26.6022 13.1665 26.0535 13.5781 25.4122C14.0232 24.7183 14.5353 22.4649 14.6162 20.8019ZM26.3779 28.3702C27.3153 28.3702 28.075 29.1312 28.0752 30.0695C28.0752 31.0079 27.3154 31.7687 26.3779 31.7687C25.4405 31.7686 24.6807 31.0079 24.6807 30.0695C24.6809 29.1312 25.4407 28.3704 26.3779 28.3702ZM72.5986 21.3644C73.4901 21.3644 74.2129 22.0881 74.2129 22.9806C74.2129 23.873 73.4901 24.5968 72.5986 24.5968C71.7073 24.5966 70.9854 23.8729 70.9854 22.9806C70.9854 22.0883 71.7073 21.3646 72.5986 21.3644ZM64.3564 12.4337C64.4871 13.8331 64.8227 15.5089 65.1719 16.0529C65.4945 16.5563 66.0921 16.987 67.4229 17.2394C66.1224 17.4292 65.4738 17.8135 65.2217 18.2833C64.6505 19.3471 64.5403 20.47 64.3877 22.2491C64.2605 20.4399 64.1205 19.3006 63.6094 18.3781C63.3502 17.9117 62.5894 17.5241 61.29 17.2394C62.6197 16.9871 63.2172 16.5563 63.541 16.0529C63.8902 15.5089 64.2928 13.7394 64.3564 12.4337ZM19.7812 14.3312C20.4746 14.3314 21.037 14.894 21.0371 15.588C21.0371 16.2822 20.4746 16.8456 19.7812 16.8458C19.0877 16.8458 18.5254 16.2823 18.5254 15.588C18.5255 14.8939 19.0878 14.3312 19.7812 14.3312ZM36.7295 11.1808C37.3771 11.1808 37.9023 11.7064 37.9023 12.3546C37.9023 13.0028 37.377 13.5284 36.7295 13.5284C36.082 13.5284 35.5576 13.0028 35.5576 12.3546C35.5576 11.7064 36.082 11.1809 36.7295 11.1808ZM41.8721 7.63391C42.8502 7.63417 43.6436 8.42812 43.6436 9.40735C43.6435 10.3865 42.8502 11.1805 41.8721 11.1808C40.8937 11.1808 40.1006 10.3867 40.1006 9.40735C40.1006 8.42796 40.8937 7.63391 41.8721 7.63391Z" fill="white"/>
                <path d="M19.9558 22.1125H48.9373C50.3991 22.1125 51.5846 23.2972 51.5847 24.759V48.0286C51.5847 49.4905 50.3992 50.676 48.9373 50.676H32.4607C32.1385 50.6761 31.8292 50.7943 31.5906 51.0061L31.4929 51.1028L25.1326 58.0686V51.9866C25.1324 51.2626 24.546 50.6761 23.822 50.676H19.9558C18.4939 50.6759 17.3093 49.4905 17.3093 48.0286V24.759C17.3094 23.2972 18.494 22.1126 19.9558 22.1125Z" fill="white" stroke="#294355" strokeWidth="1.4913"/>
                <path d="M30.8354 43.72C31.2471 43.7202 31.5806 44.0544 31.5806 44.4661C31.5804 44.8776 31.247 45.212 30.8354 45.2122H23.271C22.8594 45.212 22.5251 44.8777 22.5249 44.4661C22.5249 44.0543 22.8593 43.7201 23.271 43.72H30.8354ZM45.6255 38.0735C46.037 38.0737 46.3705 38.408 46.3706 38.8196C46.3706 39.2313 46.0371 39.5655 45.6255 39.5657H23.271C22.8593 39.5655 22.5249 39.2313 22.5249 38.8196C22.525 38.408 22.8594 38.0736 23.271 38.0735H45.6255ZM45.6255 32.425C46.0371 32.4253 46.3706 32.7595 46.3706 33.1711C46.3704 33.5827 46.037 33.917 45.6255 33.9172H23.271C22.8594 33.9171 22.5251 33.5827 22.5249 33.1711C22.5249 32.7594 22.8593 32.4252 23.271 32.425H45.6255ZM41.1538 26.7776C41.5656 26.7776 41.8999 27.1119 41.8999 27.5237C41.8999 27.9355 41.5656 28.2698 41.1538 28.2698H23.271C22.8593 28.2696 22.5249 27.9354 22.5249 27.5237C22.5249 27.112 22.8593 26.7777 23.271 26.7776H41.1538Z" fill="#294355"/>
                <path d="M70.5488 37.3922H41.5674C40.1055 37.3922 38.92 38.5768 38.9199 40.0387V63.0914C38.92 64.5533 40.1055 65.7379 41.5674 65.7379H58.0439C58.3662 65.7379 58.6754 65.8571 58.9141 66.069L59.0117 66.1656L65.3721 73.1315V67.0494C65.3721 66.3254 65.9586 65.738 66.6826 65.7379H70.5488C72.0106 65.7378 73.1952 64.5532 73.1953 63.0914V40.0387C73.1952 38.5769 72.0106 37.3923 70.5488 37.3922Z" fill="#FFF4D7" stroke="#294355" strokeWidth="1.4913"/>
                <path d="M57.5552 56.3186C57.9667 56.319 58.3003 56.6531 58.3003 57.0647C58.3002 57.4762 57.9666 57.8104 57.5552 57.8108H47.4966C47.0849 57.8108 46.7506 57.4764 46.7505 57.0647C46.7505 56.6529 47.0848 56.3186 47.4966 56.3186H57.5552ZM66.7231 51.8C67.1348 51.8002 67.4691 52.1345 67.4692 52.5461C67.4692 52.9579 67.1348 53.2921 66.7231 53.2922H47.4966C47.0848 53.2922 46.7505 52.958 46.7505 52.5461C46.7506 52.1344 47.0848 51.8 47.4966 51.8H66.7231ZM67.2319 47.2834C67.6434 47.2838 67.9771 47.618 67.9771 48.0295C67.977 48.4411 67.6434 48.7753 67.2319 48.7756H44.8774C44.4657 48.7756 44.1314 48.4413 44.1313 48.0295C44.1313 47.6177 44.4656 47.2834 44.8774 47.2834H67.2319ZM67.2319 42.7639C67.6434 42.7643 67.9771 43.0984 67.9771 43.51C67.9769 43.9214 67.6433 44.2557 67.2319 44.2561H44.8774C44.4658 44.2561 44.1315 43.9217 44.1313 43.51C44.1313 43.0982 44.4656 42.7639 44.8774 42.7639H67.2319Z" fill="#294355"/>
                <defs>
                  <radialGradient id="paint0_radial_2613_35556" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(44.9994 45.0003) scale(131.128)">
                    <stop stopColor="#FFC054"/>
                    <stop offset="1" stopColor="white"/>
                  </radialGradient>
                </defs>
              </svg>
              <span style={{ ...P, fontSize: Math.round(12 * chartR), fontWeight: 400, color: 'rgba(0,0,0,0.54)', letterSpacing: '0.4px', lineHeight: 1.4 }}>Session Time</span>
              <span style={{ ...P, fontSize: Math.round(13 * chartR), fontWeight: 600, color: 'rgba(0,0,0,0.87)', letterSpacing: '0.16px' }}>60 min</span>
            </div>
          </div>
        </div>
        {/* Legend — bordered card, order: Patient | Provider | Silence */}
        {(() => {
          const legendSegs = [arcSegs[0], arcSegs[2], arcSegs[1]];
          return compactMode ? (
            /* Compact: vertical rows — label left, pct right */
            <div style={{ border: '1px solid rgba(0,0,0,0.12)', borderRadius: 8, overflow: 'hidden' }}>
              {legendSegs.map((s, i) => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', borderTop: i > 0 ? '1px solid rgba(0,0,0,0.12)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                    <span style={{ ...P, fontSize: 13, fontWeight: 500, color: 'rgba(0,0,0,0.75)', letterSpacing: '0.16px' }}>{s.label}</span>
                  </div>
                  <span style={{ ...P, fontSize: 14, fontWeight: 700, color: 'rgba(0,0,0,0.87)', letterSpacing: '0.17px' }}>{s.pct}%</span>
                </div>
              ))}
            </div>
          ) : (
            /* Default: 3 columns horizontal */
            <div style={{ border: '1px solid rgba(0,0,0,0.12)', borderRadius: 8, display: 'flex', overflow: 'hidden' }}>
              {legendSegs.map((s, i) => (
                <div key={s.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 8px', gap: 4, borderLeft: i > 0 ? '1px solid rgba(0,0,0,0.12)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                    <span style={{ ...P, fontSize: 12, fontWeight: 400, color: 'rgba(0,0,0,0.6)', letterSpacing: '0.4px' }}>{s.label}</span>
                  </div>
                  <span style={{ ...P, fontSize: 14, fontWeight: 600, color: 'rgba(0,0,0,0.87)', letterSpacing: '0.17px' }}>{s.pct}%</span>
                </div>
              ))}
            </div>
          );
        })()}
      </div>

      {/* ── Session Themes ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ ...P, fontSize: 14, fontWeight: 500, color: 'rgba(0,0,0,0.87)', letterSpacing: '0.17px' }}>Session Themes</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="rgba(0,0,0,0.38)" strokeWidth="1.5"/><path d="M12 8h.01M12 11v5" stroke="rgba(0,0,0,0.38)" strokeWidth="1.5" strokeLinecap="round"/></svg>
      </div>

      <div style={{ background: 'white', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 12, padding: '12px 12px 16px' }}>
        <style>{`
          @keyframes themeFadeIn {
            from { opacity: 0; transform: translateY(10px) scale(0.96); }
            to   { opacity: 1; transform: translateY(0)    scale(1);    }
          }
        `}</style>
        {/* Header row: back button (detail mode) + Graph/Tags toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          {selectedTheme ? (
            <button onClick={() => setSelectedTheme(null)}
              style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M15 18l-6-6 6-6" stroke="#2d4ccd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{ ...P, fontSize: 13, fontWeight: 500, color: '#2d4ccd', letterSpacing: '0.16px' }}>Back</span>
            </button>
          ) : <div />}
          <div style={{ display: 'flex', background: '#f0f0f0', borderRadius: 20, padding: 2 }}>
            {['graph', 'tags'].map(v => (
              <button key={v} onClick={() => setThemesView(v)}
                style={{ padding: '3px 14px', borderRadius: 18, border: 'none', cursor: 'pointer', ...P, fontSize: 12, fontWeight: 500, letterSpacing: '0.16px',
                  background: themesView === v ? '#2d4ccd' : 'transparent',
                  color: themesView === v ? 'white' : 'rgba(0,0,0,0.54)',
                  transition: 'background 0.2s ease, color 0.2s ease, transform 0.15s ease',
                  transform: themesView === v ? 'scale(1.04)' : 'scale(1)',
                }}>
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div key={`${selectedTheme ?? 'overview'}-${themesView}`}
          style={{ animation: 'themeFadeIn 0.22s cubic-bezier(0.34,1.2,0.64,1) both' }}>
        {selectedTheme ? (
          /* ── Theme detail view ── */
          (() => {
            const themeOrder = ['Depression', 'Anxiety', 'Substance Use'];
            const themeColors = { Depression: '#29b6f6', Anxiety: '#ec407a', 'Substance Use': '#ffa726' };
            const idx = themeOrder.indexOf(selectedTheme);
            const tData = tags.find(t => t.theme === selectedTheme);
            const color = themeColors[selectedTheme];
            return (
              <div>
                {/* Theme name with prev / next navigation */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 4 }}>
                  <button onClick={() => setSelectedTheme(themeOrder[(idx - 1 + 3) % 3])}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M15 18l-6-6 6-6" stroke="rgba(0,0,0,0.38)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <span style={{ ...P, fontSize: 14, fontWeight: 500, color: 'rgba(0,0,0,0.87)', letterSpacing: '0.17px' }}>{selectedTheme}</span>
                  <button onClick={() => setSelectedTheme(themeOrder[(idx + 1) % 3])}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M9 18l6-6-6-6" stroke="rgba(0,0,0,0.38)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>

                {themesView === 'graph' ? (
                  /* Word bubble SVG — proportional sizing, radial layout */
                  (() => {
                    const parseW = w => { const m = w.match(/^(.+)\s\((\d+)\)$/); return { word: m[1], count: parseInt(m[2]) }; };
                    const parsed = tData.words.map(parseW);
                    const maxCount = Math.max(...parsed.map(p => p.count));
                    // Fixed geometry: cx/cy chosen so nothing clips in 250×280 viewBox
                    const cx = 122, cy = 140;
                    const centerR = 32;  // dashed centre ring radius
                    const ringR = 92;    // bubble centres sit here; always > centerR + maxBubbleR so rays are visible
                    const n = parsed.length;
                    const wBubs = parsed.map((p, i) => {
                      const r = Math.round(26 + 16 * Math.sqrt(p.count / maxCount));
                      const angle = (-90 + (360 / n) * i) * Math.PI / 180;
                      return { ...p, r, angle };
                    });
                    const bPos = wBubs.map(b => ({ ...b, x: cx + ringR * Math.cos(b.angle), y: cy + ringR * Math.sin(b.angle) }));
                    const SVG_H = 280;
                    return (
                      <div>
                        {/* Zoom container — height grows with scale so nothing is clipped */}
                        <div style={{ overflow: 'hidden', height: SVG_H * themeZoom, transition: 'height 0.25s ease', display: 'flex', justifyContent: 'center' }}>
                          <svg width="250" height={SVG_H} viewBox="0 0 250 280"
                            style={{ flexShrink: 0, transformOrigin: 'top center',
                              transform: `scale(${themeZoom})`,
                              transition: 'transform 0.28s cubic-bezier(0.34,1.2,0.64,1)' }}>
                            {/* Dotted rays — from dashed ring edge to bubble near-edge */}
                            {bPos.map((b, i) => (
                              <line key={i}
                                x1={cx + centerR * Math.cos(b.angle)} y1={cy + centerR * Math.sin(b.angle)}
                                x2={b.x - b.r * Math.cos(b.angle)}    y2={b.y - b.r * Math.sin(b.angle)}
                                stroke={color} strokeWidth="1.5" strokeDasharray="3 4" strokeLinecap="round" opacity="0.55"/>
                            ))}
                            {/* Dashed centre ring */}
                            <circle cx={cx} cy={cy} r={centerR} fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="4 4" opacity="0.55"/>
                            {/* Centre label (multi-word themes split across lines) */}
                            {selectedTheme.split(' ').map((word, i, arr) => (
                              <text key={i} x={cx} y={cy + (i - (arr.length - 1) / 2) * 14 + 5}
                                textAnchor="middle" fontFamily="Poppins, sans-serif" fontSize="10" fill={color} fontWeight="500">
                                {word}
                              </text>
                            ))}
                            {/* Word bubbles */}
                            {bPos.map((b, i) => (
                              <g key={i}>
                                <circle cx={b.x} cy={b.y} r={b.r} fill={color}/>
                                <text x={b.x} y={b.y - 3} textAnchor="middle"
                                  fontFamily="Poppins, sans-serif" fontSize={b.r >= 36 ? 11 : 10} fill="white" fontWeight="500">
                                  {b.word}
                                </text>
                                <text x={b.x} y={b.y + 10} textAnchor="middle"
                                  fontFamily="Poppins, sans-serif" fontSize={b.r >= 36 ? 12 : 10} fill="white" fontWeight="600">
                                  {b.count}
                                </text>
                              </g>
                            ))}
                          </svg>
                        </div>

                        {/* Zoom controls pill — sticky so it stays visible while scrolling */}
                        <div style={{ position: 'sticky', bottom: 0, display: 'flex', justifyContent: 'center', padding: '8px 0 2px', background: 'white', zIndex: 4 }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(0,0,0,0.06)', borderRadius: 20, padding: '2px 4px', gap: 2 }}>
                            {/* Zoom out */}
                            <button onClick={() => setThemeZoom(z => Math.max(0.75, +(z - 0.25).toFixed(2)))}
                              disabled={themeZoom <= 0.75}
                              style={{ width: 28, height: 28, borderRadius: 14, border: 'none', background: 'none',
                                cursor: themeZoom <= 0.75 ? 'default' : 'pointer',
                                opacity: themeZoom <= 0.75 ? 0.3 : 1,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'opacity 0.15s' }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <circle cx="11" cy="11" r="7" stroke="rgba(0,0,0,0.6)" strokeWidth="1.8"/>
                                <line x1="8" y1="11" x2="14" y2="11" stroke="rgba(0,0,0,0.6)" strokeWidth="1.8" strokeLinecap="round"/>
                                <path d="M16.5 16.5L21 21" stroke="rgba(0,0,0,0.6)" strokeWidth="1.8" strokeLinecap="round"/>
                              </svg>
                            </button>

                            {/* Percentage readout */}
                            <span style={{ ...P, fontSize: 11, fontWeight: 500, color: 'rgba(0,0,0,0.6)', letterSpacing: '0.4px', minWidth: 34, textAlign: 'center',
                              transition: 'color 0.15s' }}>
                              {Math.round(themeZoom * 100)}%
                            </span>

                            {/* Zoom in */}
                            <button onClick={() => setThemeZoom(z => Math.min(2, +(z + 0.25).toFixed(2)))}
                              disabled={themeZoom >= 2}
                              style={{ width: 28, height: 28, borderRadius: 14, border: 'none', background: 'none',
                                cursor: themeZoom >= 2 ? 'default' : 'pointer',
                                opacity: themeZoom >= 2 ? 0.3 : 1,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'opacity 0.15s' }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <circle cx="11" cy="11" r="7" stroke="rgba(0,0,0,0.6)" strokeWidth="1.8"/>
                                <line x1="11" y1="8" x2="11" y2="14" stroke="rgba(0,0,0,0.6)" strokeWidth="1.8" strokeLinecap="round"/>
                                <line x1="8" y1="11" x2="14" y2="11" stroke="rgba(0,0,0,0.6)" strokeWidth="1.8" strokeLinecap="round"/>
                                <path d="M16.5 16.5L21 21" stroke="rgba(0,0,0,0.6)" strokeWidth="1.8" strokeLinecap="round"/>
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  /* Tags view for the selected theme */
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '8px 0' }}>
                    {tData.words.map(w => (
                      <span key={w} style={{ ...P, fontSize: 12, fontWeight: 400, color: '#2d4ccd', border: '1px solid rgba(45,76,205,0.5)', borderRadius: 4, padding: '2px 8px', letterSpacing: '0.16px' }}>{w}</span>
                    ))}
                  </div>
                )}
              </div>
            );
          })()
        ) : (
          /* ── Overview mode ── */
          themesView === 'graph' ? (
            /* Bubble chart — click to drill down */
            <div style={{ position: 'relative', height: Math.round(200 * bubbleScale), margin: '0 auto', maxWidth: Math.round(260 * bubbleScale) }}>
              {bubbles.map(b => {
                const bw = Math.round(b.size * bubbleScale);
                const countFs = Math.round((b.size > 100 ? 20 : 16) * bubbleScale);
                const labelFs = Math.round(12 * bubbleScale);
                return (
                  <div key={b.label} onClick={() => setSelectedTheme(b.label)} style={{
                    position: 'absolute',
                    top: Math.round(b.top * bubbleScale),
                    left: Math.round(b.left * bubbleScale),
                    width: bw, height: bw, borderRadius: '50%',
                    background: b.color, cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ ...P, fontSize: countFs, fontWeight: 600, color: 'white', lineHeight: 1, letterSpacing: '0.17px' }}>{b.count}</span>
                    <span style={{ ...P, fontSize: labelFs, fontWeight: 500, color: 'white', textAlign: 'center', padding: `0 ${Math.round(8 * bubbleScale)}px`, lineHeight: 1.3, letterSpacing: '0.16px' }}>{b.label}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Tags list */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {tags.map(t => (
                <div key={t.theme}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                    {t.star && <span style={{ fontSize: 12, color: '#ffa726', lineHeight: 1 }}>☆</span>}
                    <span style={{ ...P, fontSize: 14, fontWeight: 500, color: 'rgba(0,0,0,0.87)', letterSpacing: '0.17px' }}>{t.theme}</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {t.words.map(w => (
                      <span key={w} style={{ ...P, fontSize: 12, fontWeight: 400, color: '#2d4ccd', border: '1px solid rgba(45,76,205,0.5)', borderRadius: 4, padding: '2px 8px', letterSpacing: '0.16px' }}>{w}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
        </div>{/* end animated content wrapper */}
      </div>
    </div>
  );
}

// ── Placeholder panel for tabs without specs yet ──────────────────────────────

const NAV_LABELS = { summary: 'Add Summary', clients: 'Clients', support: 'Support' };

// ── Coding Panel (CPT codes) ──────────────────────────────────────────────────

// Inline icon components — 16×16 per Figma spec
const IconUser = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconMapPin = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const IconLayers = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
  </svg>
);
const IconPencil = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const IconClock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

// ── Shared CPT card primitives ────────────────────────────────────────────────
const P_CPT = { fontFamily: 'Poppins, sans-serif' };
// Inner blue panel
const cptPanel = { background: '#f4f6ff', borderRadius: 8, padding: 8 };
// Row label: 14/400/rgba(0,0,0,0.6)/0.4px
const cptLabel = { display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 400, color: 'rgba(0,0,0,0.6)', fontFamily: 'Poppins, sans-serif', letterSpacing: '0.4px', marginBottom: 4 };
// Row value: 14/400/rgba(0,0,0,0.87)/0.17px lh 1.43
const cptValue = { fontSize: 14, fontWeight: 400, color: 'rgba(0,0,0,0.87)', lineHeight: 1.43, fontFamily: 'Poppins, sans-serif', letterSpacing: '0.17px' };
// Card container
const cptCard = { background: '#fff', border: '1px solid rgba(33,33,33,0.23)', borderRadius: 8, padding: 12, display: 'flex', flexDirection: 'column', gap: 8 };
// Code label: 14/500
const cptCodeLabel = { fontFamily: 'Poppins, sans-serif', fontSize: 14, fontWeight: 500, color: 'rgba(0,0,0,0.87)', letterSpacing: '0.17px' };
// Chip: selected uses #5770d7 bg; unselected uses white bg + #bdbdbd border
const cptChipBase = { padding: '3px 10px', borderRadius: 9999, border: '1px solid #bdbdbd', background: '#fff', fontSize: 12, fontWeight: 400, color: 'rgba(0,0,0,0.87)', cursor: 'pointer', fontFamily: 'Poppins, sans-serif', letterSpacing: '0.16px' };
const cptChipActive = { background: '#5770d7', color: '#fff', border: '1px solid #5770d7', fontWeight: 500 };
// Edit / Cancel / Confirm buttons
const cptEditBtn = { fontSize: 12, fontWeight: 500, color: '#2d4ccd', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Poppins, sans-serif', letterSpacing: '0.16px', alignSelf: 'flex-end', display: 'flex', alignItems: 'center', gap: 4 };
const cptDivider = { height: 1, background: 'rgba(0,0,0,0.12)', margin: '8px 0' };

// Primary CPT badge: #e3f2fd bg, #2d4ccd text
const BadgePrimary = ({ compactMode = false }) => (
  <div style={{ background: '#e3f2fd', borderRadius: 4, padding: '2px 6px', display: 'flex', alignItems: 'center', gap: 4 }}>
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2d4ccd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
    <span style={{ fontSize: 12, fontWeight: 500, color: '#2d4ccd', fontFamily: 'Poppins, sans-serif', letterSpacing: '0.46px' }}>{compactMode ? 'Primary' : 'Primary CPT Code'}</span>
  </div>
);

/// Add-on CPT badge: #ede7f6 bg, #6d3fcc text
const BadgeAddOn = ({ compactMode = false }) => (
  <div style={{ background: '#ede7f6', borderRadius: 4, padding: '2px 6px', display: 'flex', alignItems: 'center', gap: 4 }}>
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6d3fcc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
    <span style={{ fontSize: 12, fontWeight: 500, color: '#6d3fcc', fontFamily: 'Poppins, sans-serif', letterSpacing: '0.46px' }}>{compactMode ? 'Add-On' : 'Add-On CPT Code'}</span>
  </div>
);

function PrimaryCptCard({ compactMode = false }) {
  const [patient, setPatient] = useState('Established');
  const [location, setLocation] = useState('Outpatient/Office');
  const [complexity, setComplexity] = useState('Moderate');
  const [confirmed, setConfirmed] = useState(true);

  const getCptCode = () => {
    if (complexity === 'Extensive')    return '99215';
    if (complexity === 'Moderate')     return '99214';
    if (complexity === 'Limited')      return '99213';
    return '99212';
  };

  const complexityText = {
    Moderate:       'Moderate medical decision-making complexity. Patient presented for ongoing anxiety management and CBT work.',
    Extensive:      'High complexity with extensive medical decision-making. Multiple chronic conditions requiring active management.',
    Limited:        'Limited complexity. Amount and/or complexity of data reviewed and analyzed is limited.',
    'Minimal/None': 'Minimal complexity with straightforward medical decision making.',
  };

  return (
    <div style={cptCard}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={cptCodeLabel}>Code {getCptCode()}</span>
        <BadgePrimary compactMode={compactMode} />
      </div>

      {confirmed ? (
        <>
          <div style={{ ...cptPanel, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <div style={cptLabel}><IconUser />Patient</div>
              <span style={cptValue}>{patient === 'Established' ? 'Patient is established and not new to the practice.' : 'Patient is new to the practice.'}</span>
            </div>
            <div style={cptDivider} />
            <div>
              <div style={cptLabel}><IconMapPin />Location</div>
              <span style={cptValue}>Service was provided in an {location === 'Outpatient/Office' ? 'outpatient/office' : 'home/residential'} setting.</span>
            </div>
            <div style={cptDivider} />
            <div>
              <div style={cptLabel}><IconLayers />Complexity</div>
              <span style={cptValue}>{complexityText[complexity]}</span>
            </div>
          </div>
          <button style={cptEditBtn} onClick={() => setConfirmed(false)}><IconPencil />Edit Data</button>
        </>
      ) : (
        <>
          <div style={{ ...cptPanel, display: 'flex', flexDirection: 'column', gap: 0 }}>
            {/* Patient */}
            <div>
              <div style={{ ...cptLabel, marginBottom: 8 }}><IconUser />Patient</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                {['Established', 'New'].map(opt => (
                  <button key={opt} onClick={() => setPatient(opt)} style={{ ...cptChipBase, ...(patient === opt ? cptChipActive : {}) }}>{opt}</button>
                ))}
              </div>
            </div>
            <div style={cptDivider} />
            {/* Location */}
            <div style={{ marginTop: 12 }}>
              <div style={{ ...cptLabel, marginBottom: 8 }}><IconMapPin />Location</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                {['Home/Residential', 'Outpatient/Office'].map(opt => (
                  <button key={opt} onClick={() => setLocation(opt)} style={{ ...cptChipBase, ...(location === opt ? cptChipActive : {}) }}>{opt}</button>
                ))}
              </div>
            </div>
            <div style={cptDivider} />
            {/* Complexity */}
            <div style={{ marginTop: 12 }}>
              <div style={{ ...cptLabel, marginBottom: 4 }}><IconLayers />Complexity</div>
              <p style={{ ...P_CPT, fontSize: 12, fontWeight: 400, color: 'rgba(0,0,0,0.6)', letterSpacing: '0.4px', margin: '0 0 8px' }}>What level of data was reviewed and analyzed?</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {['Minimal/None', 'Limited', 'Moderate', 'Extensive'].map(opt => (
                  <button key={opt} onClick={() => setComplexity(opt)} style={{ ...cptChipBase, ...(complexity === opt ? cptChipActive : {}) }}>{opt}</button>
                ))}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, paddingTop: 4 }}>
            <button style={{ ...cptEditBtn, color: '#8194e1' }} onClick={() => setConfirmed(true)}>Cancel</button>
            <span style={{ width: 1, height: 12, background: 'rgba(0,0,0,0.12)', display: 'inline-block' }} />
            <button style={cptEditBtn} onClick={() => setConfirmed(true)}>Confirm</button>
          </div>
        </>
      )}
    </div>
  );
}

function AddOnCptCard({ compactMode = false }) {
  const [start, setStart]       = useState('10:00 A.M.');
  const [end, setEnd]           = useState('10:30 A.M.');
  const [confirmed, setConfirmed] = useState(true);

  const START_OPTS = ['9:00 A.M.', '9:30 A.M.', '10:00 A.M.', '10:30 A.M.', '11:00 A.M.'];
  const END_OPTS   = ['9:30 A.M.', '10:00 A.M.', '10:30 A.M.', '11:00 A.M.', '11:30 A.M.'];

  const timeToMin = { '9:00 A.M.': 540, '9:30 A.M.': 570, '10:00 A.M.': 600, '10:30 A.M.': 630, '11:00 A.M.': 660, '11:30 A.M.': 690 };
  const diffMin   = Math.max(0, (timeToMin[end] ?? 630) - (timeToMin[start] ?? 600));
  const duration  = diffMin ? `${diffMin} min` : '—';

  const columns = [['Start', start], ['End', end], ['Duration', duration]];

  const TimeRow = () => compactMode ? (
    <div style={{ ...cptPanel, display: 'flex', flexDirection: 'column', gap: 0 }}>
      {columns.map(([label, val], i) => (
        <React.Fragment key={label}>
          {i > 0 && <div style={{ height: 1, background: 'rgba(0,0,0,0.12)', margin: '6px 0' }} />}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ ...cptLabel, marginBottom: 0 }}><IconClock />{label}</div>
            <p style={{ margin: 0, ...P_CPT, fontSize: 13, fontWeight: 600, color: 'rgba(0,0,0,0.87)', letterSpacing: '0.16px' }}>{val}</p>
          </div>
        </React.Fragment>
      ))}
    </div>
  ) : (
    <div style={{ ...cptPanel, display: 'flex', flexDirection: 'row', alignItems: 'stretch' }}>
      {columns.map(([label, val], i) => (
        <React.Fragment key={label}>
          {i > 0 && <div style={{ width: 1, background: 'rgba(0,0,0,0.12)', margin: '0 12px', flexShrink: 0 }} />}
          <div style={{ flex: 1 }}>
            <div style={{ ...cptLabel, marginBottom: 6 }}><IconClock />{label}</div>
            <p style={{ margin: 0, ...P_CPT, fontSize: 13, fontWeight: 600, color: 'rgba(0,0,0,0.87)', letterSpacing: '0.16px' }}>{val}</p>
          </div>
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div style={cptCard}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={cptCodeLabel}>Code 90833</span>
        <BadgeAddOn compactMode={compactMode} />
      </div>

      {confirmed ? (
        <>
          <TimeRow />
          <button style={cptEditBtn} onClick={() => setConfirmed(false)}><IconPencil />Edit Data</button>
        </>
      ) : (
        <>
          <div style={{ ...cptPanel, display: 'flex', flexDirection: 'column', gap: 0 }}>
            {/* Start time */}
            <div>
              <div style={{ ...cptLabel, marginBottom: 8 }}><IconClock />Start Time</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                {START_OPTS.map(opt => (
                  <button key={opt} onClick={() => setStart(opt)} style={{ ...cptChipBase, ...(start === opt ? cptChipActive : {}) }}>{opt}</button>
                ))}
              </div>
            </div>
            <div style={cptDivider} />
            {/* End time */}
            <div style={{ marginTop: 12 }}>
              <div style={{ ...cptLabel, marginBottom: 8 }}><IconClock />End Time</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                {END_OPTS.map(opt => (
                  <button key={opt} onClick={() => setEnd(opt)} style={{ ...cptChipBase, ...(end === opt ? cptChipActive : {}) }}>{opt}</button>
                ))}
              </div>
            </div>
            <div style={cptDivider} />
            {/* Derived duration */}
            <div style={{ marginTop: 12 }}>
              <div style={{ ...cptLabel, marginBottom: 4 }}><IconClock />Duration</div>
              <p style={{ ...P_CPT, fontSize: 13, fontWeight: 600, color: 'rgba(0,0,0,0.87)', margin: 0 }}>{duration}</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, paddingTop: 4 }}>
            <button style={{ ...cptEditBtn, color: '#8194e1' }} onClick={() => setConfirmed(true)}>Cancel</button>
            <span style={{ width: 1, height: 12, background: 'rgba(0,0,0,0.12)', display: 'inline-block' }} />
            <button style={cptEditBtn} onClick={() => setConfirmed(true)}>Confirm</button>
          </div>
        </>
      )}
    </div>
  );
}

const IC_DEFAULT = 'Patient experiencing significant anxiety with co-occurring sleep disturbance and work-related stressors. Required coordination of care communication, management of treatment complications, and explanation of complex treatment plan. Interactive complexity added due to engagement of family member and need for cognitive reframing of treatment goals.';

function InteractiveComplexityCptCard({ compactMode = false }) {
  const [confirmed, setConfirmed] = useState(true);
  const [narrative, setNarrative] = useState(IC_DEFAULT);
  const [draft, setDraft]         = useState(IC_DEFAULT);

  return (
    <div style={cptCard}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={cptCodeLabel}>Code 90833</span>
        <BadgeAddOn compactMode={compactMode} />
      </div>

      {confirmed ? (
        <>
          <div style={{ ...cptPanel, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={cptLabel}><IconLayers />Interactive Complexity</div>
            <p style={{ ...cptValue, margin: 0 }}>{narrative}</p>
          </div>
          <button style={cptEditBtn} onClick={() => setConfirmed(false)}><IconPencil />Edit Data</button>
        </>
      ) : (
        <>
          <div style={{ ...cptPanel }}>
            <div style={{ ...cptLabel, marginBottom: 8 }}><IconLayers />Interactive Complexity</div>
            <textarea
              value={draft}
              onChange={e => setDraft(e.target.value)}
              rows={6}
              style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical', border: '1px solid rgba(33,33,33,0.23)', borderRadius: 6, padding: '8px 10px', fontFamily: 'Poppins, sans-serif', fontSize: 13, fontWeight: 400, color: 'rgba(0,0,0,0.87)', lineHeight: 1.5, letterSpacing: '0.17px', outline: 'none' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, paddingTop: 4 }}>
            <button style={{ ...cptEditBtn, color: '#8194e1' }} onClick={() => { setDraft(narrative); setConfirmed(true); }}>Cancel</button>
            <span style={{ width: 1, height: 12, background: 'rgba(0,0,0,0.12)', display: 'inline-block' }} />
            <button style={cptEditBtn} onClick={() => { setNarrative(draft); setConfirmed(true); }}>Confirm</button>
          </div>
        </>
      )}
    </div>
  );
}

// Shared card list — used by both CodingPanel and the coding tab in SuggestionsPanel
function CptCardList({ compactMode = false }) {
  const P = { fontFamily: 'Poppins, sans-serif' };
  return (
    <>
      <div style={{ marginBottom: 8 }}>
        <span style={{ ...P, fontSize: 14, fontWeight: 500, color: 'rgba(0,0,0,0.87)', letterSpacing: '0.17px' }}>CPT Codes</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <PrimaryCptCard compactMode={compactMode} />
        <AddOnCptCard compactMode={compactMode} />
        <InteractiveComplexityCptCard compactMode={compactMode} />
      </div>
    </>
  );
}

function CodingPanel() {
  const P = { fontFamily: 'Poppins, sans-serif' };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--eleos-content-bg)', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ background: 'white', padding: '20px 16px 14px', flexShrink: 0, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
        <span style={{ ...P, fontSize: 18, fontWeight: 600, color: 'rgba(0,0,0,0.87)', letterSpacing: '0.018px' }}>CPT Coding</span>
      </div>
      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 28px' }}>
        <div style={{ position: 'sticky', top: 0, height: 16, background: 'var(--eleos-content-bg)', zIndex: 5, marginLeft: -16, marginRight: -16 }} />
        <CptCardList />
      </div>
    </div>
  );
}

function PlaceholderPanel({ tab }) {
  const P = { fontFamily: 'Poppins, sans-serif' };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, padding: 32 }}>
      <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(45,76,205,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="18" height="18" rx="3" stroke="#2D4CCD" strokeWidth="1.8"/>
          <path d="M8 12h8M12 8v8" stroke="#2D4CCD" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      </div>
      <span style={{ ...P, fontSize: 18, fontWeight: 500, color: '#212121' }}>{NAV_LABELS[tab] ?? tab}</span>
      <span style={{ ...P, fontSize: 13, color: 'rgba(33,33,33,0.55)', textAlign: 'center', lineHeight: 1.6 }}>
        Design specs coming soon.
      </span>
    </div>
  );
}

// ── Nav item metadata ─────────────────────────────────────────────────────────

const NAV_ITEM_LABELS = {
  activities: 'Activities',
  summary: 'Add Summary',
  capture: 'Capture Audio',
  clients: 'Clients',
  quality: 'Quality',
};

// Reusable icon renderer (used both in rail and overflow menu)
function NavRailIcon({ navKey, active, size = 24 }) {
  const c = active ? '#293D87' : 'white';
  switch (navKey) {
    case 'activities':
      return (
        <svg width={size} height={size} viewBox="27 150 20 21" fill="none">
          <path d="M39 152.63H46M39 157.63H46M39 163.63H46M39 168.63H46M29 151.63H34C34.5523 151.63 35 152.078 35 152.63V157.63C35 158.183 34.5523 158.63 34 158.63H29C28.4477 158.63 28 158.183 28 157.63V152.63C28 152.078 28.4477 151.63 29 151.63ZM29 162.63H34C34.5523 162.63 35 163.078 35 163.63V168.63C35 169.183 34.5523 169.63 34 169.63H29C28.4477 169.63 28 169.183 28 168.63V163.63C28 163.078 28.4477 162.63 29 162.63Z"
            stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case 'summary':
      return (
        <svg width={size} height={size} viewBox="26 249 22 22" fill="none">
          <path d="M36 253.331H29.7778C29.3063 253.331 28.8541 253.519 28.5207 253.852C28.1873 254.186 28 254.638 28 255.109V267.554C28 268.025 28.1873 268.477 28.5207 268.811C28.8541 269.144 29.3063 269.331 29.7778 269.331H42.2222C42.6937 269.331 43.1459 269.144 43.4793 268.811C43.8127 268.477 44 268.025 44 267.554V261.331M42.6667 251.998C43.0203 251.644 43.4999 251.446 44 251.446C44.5001 251.446 44.9797 251.644 45.3333 251.998C45.687 252.352 45.8856 252.831 45.8856 253.331C45.8856 253.832 45.687 254.311 45.3333 254.665L36.8889 263.109L33.3333 263.998L34.2222 260.443L42.6667 251.998Z"
            stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case 'capture':
      return (
        <svg width={size} height={size} viewBox="17 4 24 24" fill="none">
          <path fillRule="evenodd" clipRule="evenodd"
            d="M33.6924 20.6926C32.3593 22.0258 30.5518 22.7757 28.6665 22.7778C26.7811 22.7757 24.9736 22.0258 23.6405 20.6926C22.3073 19.3595 21.5575 17.552 21.5553 15.6667V12.1111C21.5553 10.2251 22.3045 8.41639 23.6381 7.0828C24.9717 5.7492 26.7805 5 28.6665 5C30.5524 5 32.3612 5.7492 33.6948 7.0828C35.0284 8.41639 35.7776 10.2251 35.7776 12.1111V15.6667C35.7754 17.552 35.0256 19.3595 33.6924 20.6926ZM32.1047 8.04071C31.1434 7.22744 29.9256 6.78012 28.6665 6.77778C27.4073 6.78012 26.1895 7.22744 25.2282 8.04071C24.2669 8.85398 23.624 9.98085 23.4131 11.2222H25.9998C26.2355 11.2222 26.4616 11.3159 26.6283 11.4826C26.795 11.6493 26.8887 11.8754 26.8887 12.1111C26.8887 12.3469 26.795 12.573 26.6283 12.7397C26.4616 12.9063 26.2355 13 25.9998 13H23.3331V14.7778H25.9998C26.2355 14.7778 26.4616 14.8714 26.6283 15.0381C26.795 15.2048 26.8887 15.4309 26.8887 15.6667C26.8887 15.9024 26.795 16.1285 26.6283 16.2952C26.4616 16.4619 26.2355 16.5556 25.9998 16.5556H23.4131C23.622 17.7978 24.2644 18.9258 25.2261 19.7393C26.1879 20.5528 27.4068 20.9992 28.6665 20.9992C29.9261 20.9992 31.145 20.5528 32.1068 19.7393C33.0685 18.9258 33.7109 17.7978 33.9198 16.5556H31.3331C31.0974 16.5556 30.8713 16.4619 30.7046 16.2952C30.5379 16.1285 30.4442 15.9024 30.4442 15.6667C30.4442 15.4309 30.5379 15.2048 30.7046 15.0381C30.8713 14.8714 31.0974 14.7778 31.3331 14.7778H33.9998V13H31.3331C31.0974 13 30.8713 12.9063 30.7046 12.7397C30.5379 12.573 30.4442 12.3469 30.4442 12.1111C30.4442 11.8754 30.5379 11.6493 30.7046 11.4826C30.8713 11.3159 31.0974 11.2222 31.3331 11.2222H33.9198C33.7089 9.98085 33.066 8.85398 32.1047 8.04071ZM37.8159 15.927C37.9826 15.7603 38.2087 15.6667 38.4444 15.6667C38.6802 15.6667 38.9063 15.7603 39.073 15.927C39.2397 16.0937 39.3333 16.3198 39.3333 16.5556C39.3303 19.1478 38.2991 21.6331 36.4661 23.4661C34.6331 25.2991 32.1478 26.3303 29.5556 26.3333H27.7778C25.1855 26.3303 22.7002 25.2991 20.8672 23.4661C19.0342 21.6331 18.0031 19.1478 18 16.5556C18 16.3198 18.0937 16.0937 18.2603 15.927C18.427 15.7603 18.6531 15.6667 18.8889 15.6667C19.1246 15.6667 19.3507 15.7603 19.5174 15.927C19.6841 16.0937 19.7778 16.3198 19.7778 16.5556C19.7804 18.6765 20.6241 20.7098 22.1238 22.2096C23.6235 23.7093 25.6568 24.553 27.7778 24.5556H29.5556C31.6766 24.5532 33.71 23.7096 35.2098 22.2098C36.7096 20.71 37.5532 18.6766 37.5556 16.5556C37.5556 16.3198 37.6492 16.0937 37.8159 15.927Z"
            fill={c}/>
        </svg>
      );
    case 'clients':
      return (
        <svg width={size} height={size} viewBox="25 490 23 23" fill="none">
          <path fillRule="evenodd" clipRule="evenodd" d="M28.546 502.032C29.7985 500.78 31.4973 500.076 33.2687 500.076C35.04 500.076 36.7388 500.78 37.9913 502.032C39.2438 503.285 39.9475 504.984 39.9475 506.755C39.9475 507.282 39.5203 507.709 38.9933 507.709C38.4664 507.709 38.0392 507.282 38.0392 506.755C38.0392 505.49 37.5366 504.276 36.642 503.382C35.7473 502.487 34.5339 501.984 33.2687 501.984C32.0035 501.984 30.7901 502.487 29.8954 503.382C29.0008 504.276 28.4982 505.49 28.4982 506.755C28.4982 507.282 28.071 507.709 27.5441 507.709C27.0171 507.709 26.59 507.282 26.59 506.755C26.59 504.984 27.2937 503.285 28.546 502.032Z" fill={c}/>
          <path fillRule="evenodd" clipRule="evenodd" d="M33.2684 494.352C31.6875 494.352 30.406 495.633 30.406 497.214C30.406 498.795 31.6875 500.076 33.2684 500.076C34.8492 500.076 36.1307 498.795 36.1307 497.214C36.1307 495.633 34.8492 494.352 33.2684 494.352ZM28.4978 497.214C28.4978 494.579 30.6337 492.443 33.2684 492.443C35.9031 492.443 38.039 494.579 38.039 497.214C38.039 499.849 35.9031 501.985 33.2684 501.985C30.6337 501.985 28.4978 499.849 28.4978 497.214Z" fill={c}/>
          <path fillRule="evenodd" clipRule="evenodd" d="M39.9473 495.306C39.9473 494.779 40.3744 494.352 40.9014 494.352H46.4549C46.9818 494.352 47.409 494.779 47.409 495.306C47.409 495.833 46.9818 496.26 46.4549 496.26H40.9014C40.3744 496.26 39.9473 495.833 39.9473 495.306Z" fill={c}/>
          <path fillRule="evenodd" clipRule="evenodd" d="M40.9014 499.122C40.9014 498.595 41.3285 498.168 41.8555 498.168H46.4549C46.9818 498.168 47.409 498.595 47.409 499.122C47.409 499.649 46.9818 500.076 46.4549 500.076H41.8555C41.3285 500.076 40.9014 499.649 40.9014 499.122Z" fill={c}/>
          <path fillRule="evenodd" clipRule="evenodd" d="M41.8555 502.938C41.8555 502.412 42.2826 501.984 42.8096 501.984H46.4548C46.9818 501.984 47.409 502.412 47.409 502.938C47.409 503.465 46.9818 503.893 46.4548 503.893H42.8096C42.2826 503.893 41.8555 503.465 41.8555 502.938Z" fill={c}/>
        </svg>
      );
    case 'quality':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path d="M12 2L4 6V12C4 16.418 7.582 20 12 22C16.418 20 20 16.418 20 12V6L12 2Z"
            stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 12L11 14L15 10" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    default: return null;
  }
}

// ── Nav Rail — exact Figma paths ─────────────────────────────────────────────

function IconTooltip({ label, children }) {
  const ref = useRef(null);
  const [coords, setCoords] = useState(null);

  const show = () => {
    if (ref.current) {
      const r = ref.current.getBoundingClientRect();
      setCoords({ top: r.top - 8, cx: r.left + r.width / 2 });
    }
  };
  const hide = () => setCoords(null);

  return (
    <div ref={ref} style={{ display: 'inline-flex' }}
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      {children}
      {coords && ReactDOM.createPortal(
        <div style={{
          position: 'fixed',
          top: coords.top,
          left: coords.cx,
          transform: 'translate(-50%, -100%)',
          background: 'rgba(25,35,80,0.93)', color: 'white',
          fontSize: 11, fontWeight: 500, fontFamily: 'Poppins, sans-serif',
          padding: '4px 8px', borderRadius: 5, whiteSpace: 'nowrap',
          zIndex: 99999, pointerEvents: 'none',
          boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
        }}>
          {label}
        </div>,
        document.body
      )}
    </div>
  );
}

function NavTooltip({ label, show, children }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div style={{ position: 'relative' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
      {show && hovered && (
        <div style={{
          position: 'absolute', left: 'calc(100% + 10px)', top: '50%',
          transform: 'translateY(-50%)',
          background: 'rgba(25,35,80,0.93)', color: 'white',
          fontSize: 12, fontWeight: 500, fontFamily: 'Poppins, sans-serif',
          padding: '5px 10px', borderRadius: 6, whiteSpace: 'nowrap',
          zIndex: 9999, pointerEvents: 'none',
          boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
        }}>
          {label}
        </div>
      )}
    </div>
  );
}

function EleosNavRail({ activeItem, onNavClick, side, visibleItems, hasOverflow, overflowActive, onMoreClick, showMore, onResizeMouseDown, showLabels, isCapturing, onCollapse, compactMode = false }) {
  const nav = (tab) => () => onNavClick(tab);
  const isActive = (key) => activeItem === key;
  const ehrCtx = useEhrField();

  const iconSize = compactMode ? 18 : 24;
  const iconBg = (active) => ({
    borderRadius: 6,
    background: active ? 'white' : 'transparent',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: compactMode ? 2 : 4, flexShrink: 0,
  });

  const lbl = (text, active) => showLabels ? (
    <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 12, fontWeight: 400, color: active ? 'white' : 'rgba(255,255,255,0.65)', marginTop: 4, textAlign: 'center', lineHeight: 1.33, letterSpacing: '0.4px', display: 'block' }}>
      {text}
    </span>
  ) : null;
  const lbl2 = (line1, line2, active) => showLabels ? (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 4 }}>
      <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 12, fontWeight: 400, color: active ? 'white' : 'rgba(255,255,255,0.65)', textAlign: 'center', lineHeight: 1.2, letterSpacing: '0.4px' }}>{line1}</span>
      <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 12, fontWeight: 400, color: active ? 'white' : 'rgba(255,255,255,0.65)', textAlign: 'center', lineHeight: 1.2, letterSpacing: '0.4px' }}>{line2}</span>
    </div>
  ) : null;

  const renderItem = (key) => {
    switch (key) {
      case 'activities':
        return (
          <NavTooltip key="activities" label="Activities" show={!showLabels}>
            <div onClick={nav('activities')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: compactMode ? 20 : 14, marginTop: compactMode ? 10 : 12, cursor: 'pointer' }}>
              <div style={iconBg(isActive('activities'))}><NavRailIcon navKey="activities" active={isActive('activities')} size={iconSize} /></div>
              {lbl('Activities', isActive('activities'))}
            </div>
          </NavTooltip>
        );
      case 'summary':
        return (
          <NavTooltip key="summary" label="Add Summary" show={!showLabels}>
            <div onClick={nav('summary')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: compactMode ? 20 : 14, cursor: 'pointer' }}>
              <div style={iconBg(isActive('summary'))}><NavRailIcon navKey="summary" active={isActive('summary')} size={iconSize} /></div>
              {lbl2('Add', 'Summary', isActive('summary'))}
            </div>
          </NavTooltip>
        );
      case 'capture':
        return (
          <NavTooltip key="capture" label="Capture Audio" show={!showLabels}>
            <div onClick={nav('capture')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: compactMode ? 20 : 14, cursor: 'pointer' }}>
              <div style={{ position: 'relative' }}>
                <div style={iconBg(isActive('capture'))}><NavRailIcon navKey="capture" active={isActive('capture')} size={iconSize} /></div>
                {isCapturing && (
                  <>
                    <style>{`@keyframes capturePing { 0% { transform: scale(1); opacity: 0.8; } 100% { transform: scale(2.4); opacity: 0; } } @keyframes captureGlow { 0%,100% { opacity: 1; } 50% { opacity: 0.45; } }`}</style>
                    <span style={{ position: 'absolute', top: 2, right: 2, width: 9, height: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#22c55e', animation: 'capturePing 1.6s ease-out infinite' }} />
                      <span style={{ position: 'relative', width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'captureGlow 1.6s ease-in-out infinite', boxShadow: '0 0 4px rgba(34,197,94,0.7)' }} />
                    </span>
                  </>
                )}
              </div>
              {lbl2('Capture', 'Audio', isActive('capture'))}
            </div>
          </NavTooltip>
        );
      case 'clients':
        return (
          <NavTooltip key="clients" label="Clients" show={!showLabels}>
            <div onClick={nav('clients')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: compactMode ? 20 : 14, cursor: 'pointer' }}>
              <div style={iconBg(isActive('clients'))}><NavRailIcon navKey="clients" active={isActive('clients')} size={iconSize} /></div>
              {lbl('Clients', isActive('clients'))}
            </div>
          </NavTooltip>
        );
      case 'quality': {
        const lqaStatus = ehrCtx?.lqaStatus ?? 'idle';
        return (
          <NavTooltip key="quality" label="Note Quality" show={!showLabels}>
            <div onClick={nav('quality')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: compactMode ? 20 : 14, cursor: 'pointer' }}>
              <div style={{ position: 'relative' }}>
                <div style={iconBg(isActive('quality'))}><NavRailIcon navKey="quality" active={isActive('quality')} size={iconSize} /></div>
                {lqaStatus === 'loading' && (
                  <>
                    <style>{`@keyframes lqaSpin { to { transform: rotate(360deg); } }`}</style>
                    <span style={{ position: 'absolute', top: 0, right: 0, width: 12, height: 12, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', animation: 'lqaSpin 0.8s linear infinite', background: 'transparent' }} />
                  </>
                )}
                {lqaStatus === 'issues' && (
                  <span style={{ position: 'absolute', top: -2, right: -2, width: 16, height: 16, borderRadius: '50%', background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 10, fontWeight: 600, color: 'white', letterSpacing: 0 }}>4</span>
                  </span>
                )}
              </div>
              {lbl('Quality', isActive('quality'))}
            </div>
          </NavTooltip>
        );
      }
      default: return null;
    }
  };

  const moreActive = showMore || overflowActive;

  return (
    <div style={{ width: compactMode ? 54 : 74, flexShrink: 0, background: '#293D87', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 24, paddingBottom: 24, position: 'relative' }}>

      {/* ── Resize handle — same color as rail, pill indicates drag target ── */}
      <div
        data-resize-handle="true"
        onMouseDown={onResizeMouseDown}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 20, cursor: 'ns-resize', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, background: '#293D87' }}
      >
        <div style={{ width: 28, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.45)' }} />
      </div>

      {/* Close panel icon */}
      <svg onClick={onCollapse} width={compactMode ? 18 : 24} height={compactMode ? 18 : 24} viewBox="5 5 22 22" fill="none" style={{ marginBottom: 4, flexShrink: 0, cursor: 'pointer' }}>
        <path d="M13 7V25M20 19L17 16L20 13M9 7H23C24.1046 7 25 7.89543 25 9V23C25 24.1046 24.1046 25 23 25H9C7.89543 25 7 24.1046 7 23V9C7 7.89543 7.89543 7 9 7Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>

      {/* Divider */}
      <div style={{ width: compactMode ? 36 : 52, height: 1, background: 'white', opacity: 0.3, margin: compactMode ? '4px 0 6px' : '6px 0 10px' }} />

      {/* Visible nav items */}
      {(visibleItems || ['activities', 'summary', 'capture', 'clients']).map(key => renderItem(key))}

      {/* "More" button when items overflow */}
      {hasOverflow && (
        <div onClick={onMoreClick} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: compactMode ? 20 : 14, cursor: 'pointer' }}>
          <div style={iconBg(moreActive)}>
            <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
              <circle cx="5" cy="12" r="2" fill={moreActive ? '#293D87' : 'white'}/>
              <circle cx="12" cy="12" r="2" fill={moreActive ? '#293D87' : 'white'}/>
              <circle cx="19" cy="12" r="2" fill={moreActive ? '#293D87' : 'white'}/>
            </svg>
          </div>
          {showLabels && lbl('More', moreActive)}
        </div>
      )}

      <div style={{ flex: 1 }} />



      <div style={{ flex: 1 }} />

      {/* Support */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 14 }}>
        <div style={iconBg(isActive('support'))}>
          <svg width="22" height="22" viewBox="25 663 24 25" fill="none">
            <path d="M34.09 672.707C34.3251 672.038 34.7892 671.475 35.4 671.116C36.0108 670.757 36.7289 670.625 37.4272 670.745C38.1255 670.865 38.7588 671.228 39.2151 671.77C39.6713 672.312 39.9211 672.998 39.92 673.707C39.92 675.707 36.92 676.707 36.92 676.707M37 680.707H37.01M47 675.707C47 681.229 42.5228 685.707 37 685.707C31.4772 685.707 27 681.229 27 675.707C27 670.184 31.4772 665.707 37 665.707C42.5228 665.707 47 670.184 47 675.707Z"
              stroke={isActive('support') ? '#293D87' : 'white'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        {showLabels && lbl('Support', isActive('support'))}
      </div>

      {/* Eleos logo */}
      <EleosNavLogo />
    </div>
  );
}

// ── Marked as Done list ───────────────────────────────────────────────────────

const MARKED_DONE_LIST = [
  { id: 'done-sarah',  ...daysAgo(4),  name: 'Sarah Smith',        time: '11:00 – 11:45 AM', type: 'individual', sessionType: 'audio', summary: 'Client reported PTSD symptoms, including feeling more on edge, agitated, and upset with the staff. Discussed grounding techniques and reviewed safety plan. Progress on exposure work noted.' },
  { id: 'done-james',  ...daysAgo(6),  name: 'James Okafor',       time: '9:00 – 9:50 AM',   type: 'individual', sessionType: 'text',  summary: 'Session centered on medication adherence and mood tracking. Client missed two doses this week. Psychoeducation provided. PHQ-9 score improved from 16 to 11 since last session.' },
  { id: 'done-group2', ...daysAgo(6),  name: 'Tuesday PM Group',   time: '3:00 – 4:00 PM',   type: 'group',      sessionType: 'audio', summary: 'DBT skills group — emotion regulation module. 7 members present. Role-play exercises on opposite action. Group cohesion strong; members supported one another through check-in.' },
  { id: 'done-elena',  ...daysAgo(8),  name: 'Elena Torres',       time: '1:00 – 1:45 PM',   type: 'individual', sessionType: 'text',  summary: 'Continued work on cognitive restructuring around perfectionism. Client identified three automatic thoughts and successfully reframed two. Homework assigned: thought record for work situations.' },
  { id: 'done-david',  ...daysAgo(9),  name: 'David Nguyen',       time: '2:30 – 3:15 PM',   type: 'individual', sessionType: 'audio', summary: 'Relapse prevention session. Client has 60 days sobriety — celebrated milestone. Reviewed high-risk situations for upcoming holiday weekend. Coping plan updated collaboratively.' },
  { id: 'done-fatima', ...daysAgo(9),  name: 'Fatima Al-Rashid',   time: '4:00 – 4:45 PM',   type: 'individual', sessionType: 'text',  summary: 'Initial intake session. Presenting concerns: generalized anxiety, difficulty concentrating at work. GAD-7 score: 18. Client oriented to CBT model. Weekly sessions scheduled.' },
  { id: 'done-group3', ...daysAgo(11), name: 'Monday Wellness Grp',time: '10:00 – 11:00 AM', type: 'group',      sessionType: 'audio', summary: 'Mindfulness-based stress reduction group. 5 members. Guided body scan practice, followed by psychoeducation on stress response. Members reported reduced tension post-practice.' },
  { id: 'done-carlos', ...daysAgo(11), name: 'Carlos Rivera',      time: '2:00 – 2:45 PM',   type: 'individual', sessionType: 'audio', summary: 'Follow-up on anger management skills. Client used time-out technique twice this week — successful de-escalation both times. Partner reported positive changes at home.' },
  { id: 'done-linda',  ...daysAgo(14), name: 'Linda Park',         time: '11:00 – 11:50 AM', type: 'individual', sessionType: 'text',  summary: 'Session focused on grief processing following loss of mother. Client moved through avoidance into initial engagement with bereavement. Referred to grief support group as adjunct.' },
  { id: 'done-tony',   ...daysAgo(14), name: 'Tony Marchetti',     time: '3:30 – 4:15 PM',   type: 'individual', sessionType: 'audio', summary: 'Trauma-focused CBT session, phase 2. Narrative exposure work initiated. SUDS peaked at 72, returned to 28 by session end. Client reported sense of accomplishment afterward.' },
];

// ── Combined session pool (EHR + Done) ───────────────────────────────────────

const ALL_SESSIONS = [
  ...SESSION_LIST,
  ...MARKED_DONE_LIST,
];

// IDs that start in "Marked as Done"
const INITIAL_DONE_IDS = new Set(MARKED_DONE_LIST.map(s => s.id));

// ── My Sessions Panel (step 1, phase = 'sessions') ───────────────────────────

const MONTH_FULL = { Jan:'January', Feb:'February', Mar:'March', Apr:'April', May:'May', Jun:'June', Jul:'July', Aug:'August', Sep:'September', Oct:'October', Nov:'November', Dec:'December' };

function MySessionsPanel({ onSelectSession, initialTab = 'ehr', doneIds = INITIAL_DONE_IDS, extraSessions = [], onMarkDone, onUndoDone, compactMode = false }) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'ehr' | 'done'
  const [expanded, setExpanded] = useState(null);
  const [search, setSearch] = useState('');
  const P = { fontFamily: 'Poppins, sans-serif' };

  const toggle = (id) => setExpanded(prev => prev === id ? null : id);
  const switchTab = (tab) => { setActiveTab(tab); setExpanded(null); };

  const markDone = (id) => {
    onMarkDone?.(id);
    setExpanded(null);
    setActiveTab('done');
  };

  const undoDone = (id) => {
    onUndoDone?.(id);
    setExpanded(null);
    setActiveTab('ehr');
  };

  // Merge dynamically added sessions (from Add Summary flow) at the top
  const allSessions = [...extraSessions, ...ALL_SESSIONS];
  const ehrList  = allSessions.filter(s => !doneIds.has(s.id));
  const doneList = allSessions.filter(s =>  doneIds.has(s.id));
  const filterBySearch = (list) => search.trim()
    ? list.filter(s => s.name.toLowerCase().includes(search.trim().toLowerCase()))
    : list;
  const currentList = filterBySearch(activeTab === 'ehr' ? ehrList : doneList);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#EAEDFA', gap: 8 }}>

      {/* ── Sticky Header — elevation/4, border-radius 16px ── */}
      <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 2px 4px -1px rgba(0,0,0,.20), 0 4px 10px 0 rgba(0,0,0,.10), 0 1px 10px 0 rgba(0,0,0,.10)', zIndex: 2, position: 'relative', overflow: 'hidden' }}>

        {/* Top bar: empty left (online) + user avatar right */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '24px 16px 0' }}>
          <FigmaUserAvatar />
        </div>

        {/* Panel title — centered, 18px SemiBold */}
        <div style={{ textAlign: 'center', padding: '10px 16px' }}>
          <span style={{ ...P, fontSize: compactMode ? 15 : 18, fontWeight: 500, color: 'rgba(0,0,0,0.87)', letterSpacing: '0.018px' }}>My Activities</span>
        </div>

        {/* Search field — 47px tall, 12px padding, 20px icon, 8px gap */}
        <div style={{ margin: '0 16px', position: 'relative' }}>
          <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}>
            <FigmaSearchIcon size={20} />
          </div>
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setExpanded(null); }}
            placeholder="Filter by client name"
            style={{ height: compactMode ? 38 : 47, width: '100%', boxSizing: 'border-box', background: 'white', border: '1px solid rgba(33,33,33,0.42)', borderRadius: 8, paddingLeft: 40, paddingRight: 16, ...P, fontSize: 14, color: '#212121', letterSpacing: '0.17px', outline: 'none' }}
          />
        </div>

        {/* Tab bar — full width, no outer padding */}
        <div style={{ display: 'flex', marginTop: 8 }}>
          {/* Add to EHR tab */}
          <div onClick={() => switchTab('ehr')} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '9px 16px', borderBottom: activeTab === 'ehr' ? '2px solid #2D4CCD' : '2px solid transparent', cursor: 'pointer' }}>
            <span style={{ ...P, fontSize: compactMode ? 13 : 14, fontWeight: activeTab === 'ehr' ? 500 : 400, color: activeTab === 'ehr' ? '#2D4CCD' : 'rgba(33,33,33,0.80)', letterSpacing: '0.4px' }}>Add to EHR</span>
            <span style={{ background: activeTab === 'ehr' ? '#E02D3C' : '#F5F5F5', color: activeTab === 'ehr' ? 'white' : 'rgba(33,33,33,0.80)', borderRadius: 24, padding: '0 8px', fontSize: 12, fontWeight: activeTab === 'ehr' ? 500 : 400, ...P, lineHeight: '20px', letterSpacing: '0.14px' }}>{ehrList.length}</span>
          </div>
          {/* Marked as Done tab */}
          <div onClick={() => switchTab('done')} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '9px 16px', borderBottom: activeTab === 'done' ? '2px solid #2D4CCD' : '2px solid transparent', cursor: 'pointer' }}>
            <span style={{ ...P, fontSize: compactMode ? 13 : 14, fontWeight: activeTab === 'done' ? 500 : 400, color: activeTab === 'done' ? '#2D4CCD' : 'rgba(33,33,33,0.80)', letterSpacing: '0.4px' }}>{compactMode ? 'Done' : 'Marked as Done'}</span>
            <span style={{ background: activeTab === 'done' ? '#E02D3C' : '#F5F5F5', color: activeTab === 'done' ? 'white' : 'rgba(33,33,33,0.80)', borderRadius: 24, padding: '0 8px', fontSize: 12, fontWeight: activeTab === 'done' ? 500 : 400, ...P, lineHeight: '20px', letterSpacing: '0.14px' }}>{doneList.length}</span>
          </div>
        </div>
        {/* Full-width divider */}
        <div style={{ height: 1, background: 'rgba(33,33,33,0.12)' }} />
      </div>

      {/* ── Session list — scrollable ── */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'clip', paddingTop: 0, paddingBottom: 16 }}>
        {/* Sticky top spacer */}
        <div style={{ position: 'sticky', top: 0, height: 10, background: '#EAEDFA', zIndex: 5 }} />
        {(() => {
          // Track which sessions are "first in their date group" for date column display
          const seen = new Set();
          let prevMonth = null;
          const currentMonthAbbrev = MONTH_ABBREVS[new Date().getMonth()];

          return currentList.map((session, idx) => {
            const dateKey = `${session.month}-${session.day}`;
            const isFirstInGroup = !seen.has(dateKey);
            const showMonthHeader = isFirstInGroup && session.month !== prevMonth && session.month !== currentMonthAbbrev;
            if (isFirstInGroup) seen.add(dateKey);
            if (showMonthHeader) prevMonth = session.month;

            const isExpanded = expanded === session.id;
            // Gap: 8px between sessions in same date group, 12px when date changes
            const marginBottom = 8;

            return (
              <React.Fragment key={idx}>
                {/* Month header — full-width lavender band */}
                {showMonthHeader && (
                  <div style={{ padding: '8px 16px 6px' }}>
                    <span style={{ ...P, fontSize: 12, fontWeight: 500, color: '#2D4CCD', letterSpacing: '0.14px' }}>{MONTH_FULL[session.month] ?? session.month}</span>
                  </div>
                )}

                {/* Session row: [date col on lavender] + [individual white card] */}
                <div style={{ display: 'flex', alignItems: 'stretch', marginBottom, paddingLeft: 8, paddingRight: 8 }}>

                  {/* Date column — shows only for first session in date group, aligns to top */}
                  <div style={{ width: compactMode ? 38 : 50, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    {isFirstInGroup ? (
                      <>
                        <div style={{ ...P, fontSize: compactMode ? 11 : 12, fontWeight: 500, color: 'rgba(33,33,33,0.80)', textTransform: 'uppercase', lineHeight: 1.66, letterSpacing: '0.4px' }}>{session.month}</div>
                        <div style={{ ...P, fontSize: compactMode ? 16 : 20, fontWeight: 600, color: '#212121', lineHeight: 1.2 }}>{session.day}</div>
                      </>
                    ) : null}
                  </div>

                  {/* Individual card per session — #E5F6FD bg when expanded, white when collapsed */}
                  <div
                    onClick={() => toggle(session.id)}
                    style={{ flex: 1, background: isExpanded ? '#E5F6FD' : 'white', borderRadius: 8, border: '1px solid #ECEFF1', boxShadow: '0 2px 1px -1px rgba(0,0,0,.20), 0 1px 1px 0 rgba(0,0,0,.05), 0 1px 3px 0 rgba(0,0,0,.12)', overflow: 'hidden', display: 'flex', cursor: 'pointer', transition: 'background 150ms ease' }}>

                    {/* Left strip — teal for EHR, navy for Done */}
                    <div style={{ width: 6, flexShrink: 0, background: activeTab === 'done' ? '#293D87' : '#01579B' }} />

                    {/* Card content */}
                    <div style={{ flex: 1, minWidth: 0, padding: compactMode ? '8px 8px 8px 10px' : '12px 12px 12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', minWidth: 0 }}>
                        <div style={{ flex: 1, minWidth: 0, marginRight: 8 }}>
                          <div style={{ ...P, fontWeight: 500, fontSize: compactMode ? 14 : 16, color: '#212121', lineHeight: 1.57, letterSpacing: '0.1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{session.name}</div>
                          <div style={{ ...P, fontSize: compactMode ? 11 : 14, fontWeight: 400, color: 'rgba(33,33,33,0.80)', marginTop: 2, letterSpacing: '0.17px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{session.time}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, paddingTop: 2 }}>
                          <IconTooltip label={session.type === 'group' ? 'Group session' : 'Individual session'}>
                            {session.type === 'group' ? <CardGroupIcon /> : <CardPersonIcon />}
                          </IconTooltip>
                          <IconTooltip label={session.sessionType === 'audio' ? 'Audio session' : 'Progress note'}>
                            {session.sessionType === 'audio' ? <CardAudioIcon /> : <CardDocIcon />}
                          </IconTooltip>
                          <CardChevron open={isExpanded} />
                        </div>
                      </div>
                      {isExpanded && (
                        <div style={{ marginTop: 12 }}>
                          {activeTab === 'done' ? (
                            /* Marked as Done: truncated summary + "see more" + "Undo Submission" */
                            <>
                              <p style={{ ...P, fontSize: 13, color: '#212121', lineHeight: 1.6, margin: '0 0 12px' }}>
                                {session.summary.length > 100 ? session.summary.slice(0, 100) + '… ' : session.summary}
                                {session.summary.length > 100 && (
                                  <span style={{ color: '#2D4CCD', cursor: 'pointer' }} onClick={e => e.stopPropagation()}>see more</span>
                                )}
                              </p>
                              <span
                                style={{ ...P, fontSize: 13, fontWeight: 400, color: '#2D4CCD', textDecoration: 'underline', cursor: 'pointer' }}
                                onClick={e => { e.stopPropagation(); undoDone(session.id); }}
                              >
                                Undo Submission
                              </span>
                            </>
                          ) : (
                            /* Add to EHR: full summary + "Mark as submitted" + "Select session" button */
                            <>
                              <p style={{ ...P, fontSize: 13, color: '#212121', lineHeight: 1.6, margin: '0 0 14px' }}>
                                {session.summary}
                              </p>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'nowrap' }}>
                                <span
                                  style={{ ...P, fontSize: compactMode ? 12 : 13, fontWeight: 400, color: '#2D4CCD', textDecoration: 'underline', cursor: 'pointer', whiteSpace: 'nowrap' }}
                                  onClick={e => { e.stopPropagation(); markDone(session.id); }}
                                >
                                  {compactMode ? 'Mark submitted' : 'Mark as submitted'}
                                </span>
                                <button
                                  onClick={e => { e.stopPropagation(); onSelectSession(session); }}
                                  style={{ padding: compactMode ? '5px 10px' : '7px 18px', background: '#2D4CCD', color: 'white', ...P, fontSize: compactMode ? 12 : 13, fontWeight: 500, border: 'none', borderRadius: 4, cursor: 'pointer', letterSpacing: '0.1px', whiteSpace: 'nowrap' }}
                                >
                                  {compactMode ? 'Select' : 'Select session'}
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          });
        })()}
      </div>
    </div>
  );
}

// ── Capture Session Panel (step 1) ────────────────────────────────────────────

const CLIENT_OPTIONS = [
  'Marcus Webb', 'Aisha Monroe', 'Tom Reilly', 'Carmen Vega', 'David Park',
  'Priya Nair', 'James Osei', 'Linda Torres', 'Ryan Cho', 'Thursday AM Group',
  'Jake Carol', 'Jacob Rosen', 'Larry Quinn', 'Calvin Murphy', 'Trisha Platts',
  'Anger Management Group', 'SUD Group', 'Patricia Rodriguez', 'Ashlyn Rivera',
];

function CaptureSessionPanel({ onCapture, onBack, initialClient = 'James Edwards', compactMode = false }) {
  const P = { fontFamily: 'Poppins, sans-serif' };
  const SHADOW_EL4 = '0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 10px 0px rgba(0,0,0,0.1), 0px 1px 10px 0px rgba(0,0,0,0.1)';
  const SHADOW_EL16 = '0px 8px 10px -5px rgba(0,0,0,0.2), 0px 16px 24px 1px rgba(0,0,0,0.1), 0px 6px 30px 5px rgba(0,0,0,0.12)';
  const [clientName, setClientName] = useState(initialClient);
  const [query, setQuery] = useState(initialClient);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [planExpanded, setPlanExpanded] = useState(false);
  const [planHover, setPlanHover] = useState(false);
  const inputRef = useRef(null);

  const filtered = query.trim()
    ? CLIENT_OPTIONS.filter(c => c.toLowerCase().includes(query.toLowerCase()))
    : CLIENT_OPTIONS;

  function selectClient(name) {
    setClientName(name);
    setQuery(name);
    setDropdownOpen(false);
  }

  function clearClient() {
    setClientName('');
    setQuery('');
    setDropdownOpen(false);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  const isGroup = clientName.toLowerCase().includes('group');

  const PLAN_ITEMS = isGroup ? [
    'Practice interpersonal effectiveness skills: each member to identify one boundary to set this week',
    'Continue DBT emotion regulation module — review opposite action technique in next session',
    'Group homework: complete daily mood tracking log and bring to next session',
    'Encourage peer support check-ins between sessions using group messaging channel',
  ] : [
    'Learn stress management techniques to address work-related anxiety and apply them in daily situations',
    'Practice mindfulness exercises for 10 minutes daily to improve emotional regulation',
    'Complete behavioral activation task: schedule one enjoyable activity per day this week',
    'Review and reinforce boundary-setting strategies discussed in previous session',
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#EAEDFA', gap: 8, position: 'relative' }}>

      {/* ── Header card ── */}
      <div style={{ background: 'white', borderRadius: 16, boxShadow: SHADOW_EL4, flexShrink: 0, padding: '24px 16px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          {/* invisible placeholder to center title */}
          <div style={{ width: 24, opacity: 0 }} />
          <div style={{ flex: 1 }} />
          <FigmaUserAvatar />
        </div>
        <div style={{ textAlign: 'center', padding: '0 10px 10px' }}>
          <span style={{ ...P, fontSize: compactMode ? 15 : 18, fontWeight: 500, color: 'rgba(0,0,0,0.87)', lineHeight: 1.57, letterSpacing: '0.018px' }}>
            Audio Capture
          </span>
        </div>
      </div>

      {/* ── Scrollable content ── */}
      <div style={{ flex: 1, background: 'white', borderRadius: '16px 16px 0 0', boxShadow: SHADOW_EL16, overflowY: 'auto', padding: '0 24px 96px' }}>

        {/* Sticky top spacer — keeps content from touching the card edge while scrolling */}
        <div style={{ position: 'sticky', top: 0, height: 24, background: 'white', zIndex: 5, marginLeft: -24, marginRight: -24, borderRadius: '16px 16px 0 0' }} />

        {/* Client row */}
        <div style={{ marginBottom: 16 }}>
          <span style={{ ...P, fontSize: 16, fontWeight: 500, color: '#212121', lineHeight: 1.57, letterSpacing: '0.1px', display: 'block', marginBottom: 8 }}>Client:</span>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            {/* Client autocomplete input */}
            <div style={{ flex: 1, position: 'relative' }}>
              <div style={{ background: 'white', border: `1px solid ${dropdownOpen ? '#2d4ccd' : 'rgba(33,33,33,0.23)'}`, borderRadius: dropdownOpen && filtered.length > 0 ? '8px 8px 0 0' : 8, padding: '12px', display: 'flex', alignItems: 'center', cursor: 'text' }}
                onClick={() => { setDropdownOpen(true); inputRef.current?.focus(); }}>
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => { setQuery(e.target.value); setClientName(''); setDropdownOpen(true); }}
                  onFocus={() => setDropdownOpen(true)}
                  onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
                  placeholder="Select client or group"
                  style={{ ...P, flex: 1, fontSize: 16, color: 'rgba(0,0,0,0.87)', letterSpacing: '0.15px', lineHeight: '24px', border: 'none', outline: 'none', background: 'transparent', width: '100%' }}
                />
                {query && (
                  <svg onMouseDown={e => { e.preventDefault(); clearClient(); }} width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ cursor: 'pointer', flexShrink: 0 }}>
                    <path d="M4 4l8 8M12 4l-8 8" stroke="rgba(33,33,33,0.54)" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                )}
              </div>
              {/* Dropdown */}
              {dropdownOpen && filtered.length > 0 && (
                <div style={{ position: 'absolute', left: 0, right: 0, top: '100%', background: 'white', border: '1px solid #2d4ccd', borderTop: 'none', borderRadius: '0 0 8px 8px', boxShadow: '0 4px 12px rgba(0,0,0,0.12)', zIndex: 100, maxHeight: 220, overflowY: 'auto' }}>
                  {filtered.map((name, i) => (
                    <div key={name}
                      onMouseDown={e => { e.preventDefault(); selectClient(name); }}
                      style={{ ...P, padding: '10px 12px', fontSize: 14, color: 'rgba(0,0,0,0.87)', cursor: 'pointer', borderBottom: i < filtered.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none', background: 'white' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#F4F6FD'}
                      onMouseLeave={e => e.currentTarget.style.background = 'white'}
                    >
                      {name}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Add person button */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, cursor: 'pointer' }}>
              <path fillRule="evenodd" clipRule="evenodd" d="M11.0419 14.0775C9.70971 13.877 8.34793 14.0651 7.12002 14.6194C5.89211 15.1737 4.85024 16.0705 4.11943 17.2023C3.38862 18.3341 2.99993 19.6527 3 20.9999C3.00003 21.5522 2.55234 21.9999 2.00005 22C1.44777 22 1.00003 21.5523 1 21C0.999905 19.2679 1.49965 17.5725 2.43926 16.1174C3.37888 14.6622 4.71843 13.5092 6.29717 12.7965C7.87592 12.0839 9.62677 11.842 11.3396 12.0998C13.0524 12.3576 14.6545 13.1042 15.9535 14.25C16.3677 14.6153 16.4073 15.2473 16.0419 15.6615C15.6766 16.0756 15.0447 16.1152 14.6305 15.7499C13.6202 14.8587 12.3741 14.278 11.0419 14.0775Z" fill="#2D4BC6"/>
              <path fillRule="evenodd" clipRule="evenodd" d="M10 4C7.79086 4 6 5.79086 6 8C6 10.2091 7.79086 12 10 12C12.2091 12 14 10.2091 14 8C14 5.79086 12.2091 4 10 4ZM4 8C4 4.68629 6.68629 2 10 2C13.3137 2 16 4.68629 16 8C16 11.3137 13.3137 14 10 14C6.68629 14 4 11.3137 4 8Z" fill="#2D4BC6"/>
              <path fillRule="evenodd" clipRule="evenodd" d="M19 15C19.5523 15 20 15.4477 20 16V22C20 22.5523 19.5523 23 19 23C18.4477 23 18 22.5523 18 22V16C18 15.4477 18.4477 15 19 15Z" fill="#2D4BC6"/>
              <path fillRule="evenodd" clipRule="evenodd" d="M15 19C15 18.4477 15.4477 18 16 18H22C22.5523 18 23 18.4477 23 19C23 19.5523 22.5523 20 22 20H16C15.4477 20 15 19.5523 15 19Z" fill="#2D4BC6"/>
            </svg>
          </div>
          {/* Pronouns + Edit Client */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, width: '100%' }}>
            <span style={{ ...P, fontSize: 14, color: 'rgba(33,33,33,0.8)', letterSpacing: '0.15px', lineHeight: '24px' }}>Pronouns: He/Him</span>
            <span style={{ ...P, fontSize: 14, fontWeight: 500, color: '#2d4ccd', letterSpacing: '0.15px', lineHeight: '24px', cursor: 'pointer' }}>Edit Client</span>
          </div>
        </div>

        {/* Last Live Session Plan banner — only when a client is selected */}
        {clientName && <>
        <div
          style={{ position: 'relative', background: '#EAEDFA', borderRadius: planExpanded ? '8px 8px 0 0' : 8, padding: '12px 16px', marginBottom: planExpanded ? 0 : 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
          onMouseEnter={() => setPlanHover(true)}
          onMouseLeave={() => setPlanHover(false)}
          onClick={() => setPlanExpanded(v => !v)}
        >
          {/* Tooltip */}
          {planHover && !planExpanded && (
            <div style={{ position: 'absolute', top: -36, left: '50%', transform: 'translateX(-50%)', background: 'rgba(33,33,33,0.9)', color: 'white', ...P, fontSize: 12, fontWeight: 400, letterSpacing: '0.4px', padding: '4px 10px', borderRadius: 4, whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 10 }}>
              Expand to view recap
              <div style={{ position: 'absolute', bottom: -4, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '5px solid rgba(33,33,33,0.9)' }} />
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* icon: info when collapsed, green check when expanded */}
            <div style={{ position: 'relative', width: 24, height: 24, flexShrink: 0 }}>
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: planExpanded ? 'rgba(46,160,67,0.15)' : 'rgba(45,76,205,0.15)' }} />
              {planExpanded ? (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ position: 'absolute', top: 2, left: 2 }}>
                  <circle cx="10" cy="10" r="9" stroke="#2ea043" strokeWidth="1.5"/>
                  <path d="M6 10.5l3 3 5-6" stroke="#2ea043" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ position: 'absolute', top: 2, left: 2 }}>
                  <circle cx="10" cy="10" r="9" stroke="#2d4ccd" strokeWidth="1.5"/>
                  <path d="M10 9v5M10 7v.5" stroke="#2d4ccd" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ ...P, fontSize: 14, fontWeight: 500, color: 'rgba(0,0,0,0.87)', letterSpacing: '0.17px', lineHeight: 1.43 }}>Last Live Session Plan</span>
              <span style={{ ...P, fontSize: 12, color: 'rgba(0,0,0,0.6)', letterSpacing: '0.4px', lineHeight: 1.66 }}>01.01.2026</span>
            </div>
          </div>
          {/* View / Hide button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ ...P, fontSize: 13, fontWeight: 500, color: '#2d4ccd', letterSpacing: '0.46px', lineHeight: '22px' }}>{planExpanded ? 'Hide' : 'View'}</span>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ transform: planExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
              <path d="M4.5 6.75L9 11.25L13.5 6.75" stroke="#2d4ccd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* Expanded plan content */}
        {planExpanded && (
          <div style={{ background: '#F4F6FD', borderRadius: '0 0 8px 8px', padding: '12px 16px 16px', marginBottom: 16, borderTop: '1px solid rgba(45,76,205,0.12)' }}>
            {PLAN_ITEMS.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, marginBottom: i < PLAN_ITEMS.length - 1 ? 10 : 0 }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
                  <circle cx="9" cy="9" r="8.25" stroke="#2ea043" strokeWidth="1.5"/>
                  <path d="M5.5 9.5l2.5 2.5 4.5-5.5" stroke="#2ea043" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span style={{ ...P, fontSize: 13, color: 'rgba(0,0,0,0.87)', letterSpacing: '0.17px', lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </div>
        )}
        </>}

        {/* Session Type */}
        <AcFormField key={isGroup ? 'group' : 'individual'} label="Session Type:" defaultValue={isGroup ? 'Group Therapy' : 'Individual Therapy'} options={['Individual Therapy', 'Group Therapy', 'Family Therapy', 'Couples Therapy']} compactMode={compactMode} />

        {/* Setting */}
        <AcFormField label="Setting:" defaultValue="In Person" options={['In Person', 'Telehealth', 'Hybrid']} compactMode={compactMode} />

        {/* Note Type */}
        <AcFormField label="Note Type:" defaultValue="DAP Note" options={['DAP Note', 'SOAP Note', 'Progress Note', 'Treatment Plan']} compactMode={compactMode} />

        {/* Audio Input */}
        <div style={{ marginBottom: 8 }}>
          <span style={{ ...P, fontSize: compactMode ? 14 : 16, fontWeight: 500, color: 'rgba(0,0,0,0.87)', lineHeight: 1.334, display: 'block', marginBottom: 8 }}>Audio Input:</span>
          <AcFormField label={null} defaultValue="MacBook Pro Microphone (Built In)" options={['MacBook Pro Microphone (Built In)', 'External Microphone', 'AirPods Pro', 'iPhone Microphone']} compactMode={compactMode} />
        </div>

        {/* Sound check */}
        <span style={{ ...P, fontSize: 12, color: '#212121', letterSpacing: '0.4px', lineHeight: 1.66, display: 'block', marginBottom: 4 }}>
          Speak into the microphone to check audio output:
        </span>
        <AudioMeter />
      </div>

      {/* ── Bottom CTA ── */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#EAEDFA', padding: '16px 16px 24px', boxShadow: '0px -1px 3px rgba(0,0,0,0.12),0px -1px 1px rgba(0,0,0,0.05)' }}>
        <button
          onClick={() => {
            const now = new Date();
            const dt = now.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
            onCapture(clientName, dt);
          }}
          style={{ width: '100%', padding: '8px 16px', background: '#2d4ccd', color: 'white', ...P, fontWeight: 500, fontSize: 14, border: 'none', borderRadius: 4, cursor: 'pointer', letterSpacing: '0.46px', lineHeight: '26px', boxShadow: '0px 1px 5px rgba(0,0,0,0.12),0px 2px 2px rgba(0,0,0,0.14),0px 3px 1px -2px rgba(0,0,0,0.2)' }}
        >
          Capture Session
        </button>
      </div>
    </div>
  );
}

function AcFormField({ label, defaultValue, options = [], compactMode = false }) {
  const P = { fontFamily: 'Poppins, sans-serif' };
  const [selected, setSelected] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom: 16, position: 'relative' }}>
      {label && (
        <span style={{ ...P, fontSize: compactMode ? 14 : 16, fontWeight: 500, color: '#212121', lineHeight: 1.57, letterSpacing: '0.1px', display: 'block', marginBottom: 8 }}>{label}</span>
      )}
      <div
        onClick={() => setOpen(v => !v)}
        style={{ background: 'white', border: `1px solid ${open ? '#2d4ccd' : 'rgba(33,33,33,0.23)'}`, borderRadius: open ? '8px 8px 0 0' : 8, padding: '12px', display: 'flex', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
      >
        <span style={{ ...P, flex: 1, fontSize: compactMode ? 14 : 16, color: 'rgba(0,0,0,0.87)', letterSpacing: '0.15px', lineHeight: '24px' }}>{selected}</span>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
          <path d="M5 7.5L10 12.5L15 7.5" stroke={open ? '#2d4ccd' : 'rgba(33,33,33,0.54)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      {open && (
        <div style={{ position: 'absolute', left: 0, right: 0, background: 'white', border: '1px solid #2d4ccd', borderTop: 'none', borderRadius: '0 0 8px 8px', zIndex: 20, boxShadow: '0px 4px 10px rgba(0,0,0,0.12)' }}>
          {options.map((opt, i) => (
            <div
              key={opt}
              onClick={() => { setSelected(opt); setOpen(false); }}
              style={{ padding: '10px 12px', ...P, fontSize: 15, color: opt === selected ? '#2d4ccd' : 'rgba(0,0,0,0.87)', background: opt === selected ? 'rgba(45,76,205,0.06)' : 'white', cursor: 'pointer', borderBottom: i < options.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none', borderRadius: i === options.length - 1 ? '0 0 8px 8px' : 0, fontWeight: opt === selected ? 500 : 400 }}
              onMouseEnter={e => { if (opt !== selected) e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = opt === selected ? 'rgba(45,76,205,0.06)' : 'white'; }}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AudioMeter() {
  const [level, setLevel] = useState(0);
  const rafRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    let ctx, source;
    navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      .then(stream => {
        streamRef.current = stream;
        ctx = new AudioContext();
        source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.6;
        source.connect(analyser);
        analyserRef.current = analyser;
        const data = new Uint8Array(analyser.frequencyBinCount);
        const tick = () => {
          analyser.getByteFrequencyData(data);
          const sorted = Array.from(data).sort((a, b) => b - a);
          const top = sorted.slice(0, Math.floor(data.length / 4));
          const peak = top.reduce((a, b) => a + b, 0) / top.length / 255;
          // Apply noise floor: ignore anything below 15% — only real speech registers
          const NOISE_FLOOR = 0.50;
          setLevel(Math.min(1, Math.max(0, (peak - NOISE_FLOOR) / (1 - NOISE_FLOOR)) * 2.5));
          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      })
      .catch(() => {
        // Permission denied — fall back to animated demo
        const t = setInterval(() => {
          setLevel(prev => Math.min(0.75, Math.max(0.05, prev + (Math.random() - 0.48) * 0.12)));
        }, 120);
        return () => clearInterval(t);
      });
    return () => {
      cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach(t => t.stop());
      ctx?.close();
    };
  }, []);

  const BARS = 29;
  const active = Math.round(level * BARS);

  return (
    <div style={{ display: 'flex', gap: 3, alignItems: 'center', height: 21, marginBottom: 4 }}>
      {Array.from({ length: BARS }, (_, i) => (
        <div key={i} style={{ flex: 1, height: 21, borderRadius: 2, background: i >= active ? '#d9d9d9' : i < BARS * 0.2 ? '#f44336' : i < BARS * 0.5 ? '#f9b534' : '#46bc9e', transition: 'background 0.08s' }} />
      ))}
    </div>
  );
}

// ── Session In Progress Panel ─────────────────────────────────────────────────

function EqBars({ activeCount, total, animOffset }) {
  return (
    <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          style={{
            width: 3,
            height: 8,
            borderRadius: 1,
            background: i < activeCount ? '#2d4ccd' : 'rgba(45,76,205,0.38)',
            animation: i < activeCount
              ? `eqBounce ${0.55 + (i % 5) * 0.12}s ease-in-out ${(i * 40 + animOffset) % 400}ms infinite alternate`
              : 'none',
            transformOrigin: 'bottom',
            display: 'inline-block',
          }}
        />
      ))}
    </div>
  );
}

function SessionInProgressPanel({ clientName, dateTime, startedAt, onBack, onEndSession }) {
  const P = { fontFamily: 'Poppins, sans-serif' };
  const getElapsed = () => startedAt ? Math.floor((Date.now() - startedAt) / 1000) : 0;
  const [seconds, setSeconds] = useState(getElapsed);
  const containerRef = useRef(null);
  const [panelH, setPanelH] = useState(600);

  useEffect(() => {
    const t = setInterval(() => setSeconds(getElapsed()), 1000);
    return () => clearInterval(t);
  }, [startedAt]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => setPanelH(entries[0].contentRect.height));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Progressively collapse decorative elements so CTA is always reachable
  const showIllustration = panelH >= 500;
  const timerSize = panelH < 420 ? 32 : 48;

  const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');

  const SHADOW_EL4 = '0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 10px 0px rgba(0,0,0,0.1), 0px 1px 10px 0px rgba(0,0,0,0.1)';
  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#EAEDFA', gap: 8, overflow: 'hidden' }}>
      <style>{`@keyframes eqBounce { from { transform: scaleY(1); } to { transform: scaleY(0.35); } }`}</style>
      {/* Header */}
      <div style={{ background: 'white', borderRadius: 16, boxShadow: SHADOW_EL4, flexShrink: 0, padding: '16px 16px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', color: 'rgba(0,0,0,0.54)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <FigmaUserAvatar />
        </div>
        <div style={{ textAlign: 'center', padding: '0 10px 6px' }}>
          <div style={{ ...P, fontSize: 18, fontWeight: 600, color: '#212121', lineHeight: 1.57, letterSpacing: '0.018px' }}>{clientName}</div>
          <div style={{ ...P, fontSize: 14, fontWeight: 500, color: 'rgba(0,0,0,0.6)', lineHeight: 1.43, letterSpacing: '0.15px' }}>{dateTime}</div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'white', borderRadius: '16px 16px 0 0', boxShadow: '0px 6px 30px 5px rgba(0,0,0,0.12),0px 16px 24px 1px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        {/* Centred content area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 32, padding: '24px 24px 0', minHeight: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
          <svg width="187" height="143" viewBox="0 0 187 143" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ maxWidth: 187, height: 'auto', display: showIllustration ? 'block' : 'none' }}>
            <g clipPath="url(#clip0_mic)">
              <path d="M59.8223 28.5638C60.6429 28.5638 61.3082 27.9004 61.3082 27.0822C61.3082 26.2639 60.6429 25.6006 59.8223 25.6006C59.0017 25.6006 58.3364 26.2639 58.3364 27.0822C58.3364 27.9004 59.0017 28.5638 59.8223 28.5638Z" fill="#FFC04C"/>
              <path d="M47.2332 57.7625C48.0538 57.7625 48.7191 57.0992 48.7191 56.2809C48.7191 55.4626 48.0538 54.7993 47.2332 54.7993C46.4126 54.7993 45.7473 55.4626 45.7473 56.2809C45.7473 57.0992 46.4126 57.7625 47.2332 57.7625Z" fill="#FFC04C"/>
              <path d="M144.907 72.3611C145.727 72.3611 146.392 71.6978 146.392 70.8795C146.392 70.0613 145.727 69.3979 144.907 69.3979C144.086 69.3979 143.421 70.0613 143.421 70.8795C143.421 71.6978 144.086 72.3611 144.907 72.3611Z" fill="#93C7C7"/>
              <path d="M135.37 39.2065C135.788 39.2065 136.128 39.5451 136.128 39.9624V42.4565H138.648C139.067 42.4566 139.406 42.7959 139.406 43.2134C139.405 43.6306 139.066 43.9692 138.648 43.9692H136.128V46.4634C136.128 46.8809 135.788 47.2192 135.37 47.2192C134.951 47.2191 134.612 46.8808 134.612 46.4634V43.9692H132.113C131.694 43.9691 131.355 43.6306 131.355 43.2134C131.355 42.796 131.694 42.4566 132.113 42.4565H134.612V39.9624C134.612 39.5452 134.951 39.2067 135.37 39.2065Z" fill="#FF97A4"/>
              <path fillRule="evenodd" clipRule="evenodd" d="M52.1426 84.2647C52.3663 83.9118 52.2608 83.4449 51.9069 83.2218C51.5531 82.9987 51.0848 83.1039 50.861 83.4568L49.5242 85.5651L47.4121 84.2335C47.0582 84.0104 46.5899 84.1156 46.3662 84.4685C46.1424 84.8213 46.2479 85.2883 46.6018 85.5114L48.714 86.8429L47.377 88.9515C47.1532 89.3044 47.2587 89.7713 47.6126 89.9944C47.9665 90.2175 48.4348 90.1123 48.6585 89.7594L49.9955 87.6508L52.1253 88.9935C52.4792 89.2166 52.9475 89.1114 53.1712 88.7585C53.3949 88.4056 53.2894 87.9387 52.9356 87.7156L50.8058 86.373L52.1426 84.2647Z" fill="#558A8A"/>
              <path d="M90.7961 129.742L90.68 111.124L96.0448 111.087L96.1629 129.521L90.7961 129.742Z" stroke="#294355" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M122.856 66.1152L122.923 81.4972C122.941 85.3397 122.188 89.1514 120.707 92.7138C119.225 96.2762 117.044 99.5192 114.289 102.257C111.535 104.995 108.26 107.173 104.652 108.668C101.045 110.163 97.1767 110.944 93.2685 110.967C85.414 110.991 77.8832 107.957 72.3223 102.527C66.7614 97.0979 63.6226 89.7148 63.5923 81.9922L63.5401 66.6078" stroke="#294355" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <g filter="url(#filter0_mic)">
                <path d="M116.142 32.1805L116.201 81.5925C116.239 84.4903 115.682 87.3726 114.562 90.0722C113.442 92.7719 111.78 95.2353 109.674 97.3197C107.567 99.4041 105.058 101.068 102.291 102.215C99.5242 103.363 96.5547 103.97 93.5546 104.003C90.5545 104.036 87.5835 103.493 84.8136 102.407C82.0438 101.32 79.5303 99.7107 77.4186 97.6724C75.3069 95.6341 73.6391 93.2071 72.5118 90.532C71.3845 87.8569 70.8201 84.987 70.8513 82.0884L70.7791 32.6937C70.7712 26.8819 73.1535 21.2818 77.4018 17.1255C81.65 12.9691 87.4163 10.597 93.4321 10.531C99.4478 10.4649 105.22 12.7103 109.48 16.7731C113.739 20.836 116.136 26.3836 116.144 32.1955L116.142 32.1805Z" fill="#E2F4F4"/>
              </g>
              <path d="M116.142 32.1805L116.201 81.5925C116.239 84.4903 115.682 87.3726 114.562 90.0722C113.442 92.7719 111.78 95.2353 109.674 97.3197C107.567 99.4041 105.058 101.068 102.291 102.215C99.5242 103.363 96.5547 103.97 93.5546 104.003C90.5545 104.036 87.5835 103.493 84.8136 102.407C82.0438 101.32 79.5303 99.7107 77.4186 97.6724C75.3069 95.6341 73.6391 93.2071 72.5118 90.532C71.3845 87.8569 70.8201 84.987 70.8513 82.0884L70.7791 32.6937C70.7712 26.8819 73.1535 21.2818 77.4018 17.1255C81.65 12.9691 87.4163 10.597 93.4321 10.531C99.4478 10.4649 105.22 12.7103 109.48 16.7731C113.739 20.836 116.136 26.3836 116.144 32.1955L116.142 32.1805Z" stroke="#294355" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path fillRule="evenodd" clipRule="evenodd" d="M84.5972 36.9278L70.6245 36.7589L70.6519 39.1897L84.6246 39.3586C85.2503 39.3662 85.7514 38.8281 85.7438 38.1569C85.7363 37.4856 85.2229 36.9353 84.5972 36.9278ZM101.969 37.1377L115.941 37.3066L115.969 39.7375L101.996 39.5686C101.37 39.561 100.857 39.0107 100.849 38.3395C100.842 37.6682 101.343 37.1302 101.969 37.1377ZM116.097 51.0813L102.124 50.9125C101.499 50.9049 100.998 51.4429 101.005 52.1142C101.013 52.7854 101.526 53.3357 102.152 53.3433L116.124 53.5122L116.097 51.0813ZM84.7528 50.7025L70.7801 50.5336L70.8076 52.9645L84.7803 53.1333C85.406 53.1409 85.9071 52.6029 85.8995 51.9316C85.8919 51.2604 85.3785 50.7101 84.7528 50.7025ZM116.253 64.8561L102.28 64.6872C101.654 64.6796 101.153 65.2177 101.161 65.8889C101.168 66.5602 101.682 67.1105 102.307 67.118L116.28 67.2869L116.253 64.8561ZM84.9084 64.4772L70.9357 64.3084L70.9632 66.7392L84.9359 66.9081C85.5616 66.9156 86.0627 66.3776 86.0551 65.7063C86.0475 65.0351 85.5341 64.4848 84.9084 64.4772ZM116.408 78.6308L102.436 78.4619C101.81 78.4544 101.309 78.9924 101.316 79.6636C101.324 80.3349 101.837 80.8852 102.463 80.8927L116.436 81.0616L116.408 78.6308ZM85.0641 78.252L71.0914 78.0831L71.1188 80.5139L85.0915 80.6828C85.7172 80.6904 86.2183 80.1523 86.2107 79.4811C86.2032 78.8098 85.6898 78.2595 85.0641 78.252Z" fill="#294355"/>
              <path d="M72.4692 130.034L113.707 129.779" stroke="#294355" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </g>
            <defs>
              <filter id="filter0_mic" x="70.0291" y="9.77979" width="46.9236" height="94.9746" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dx="-4.10345" dy="-6.44828"/>
                <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0.160784 0 0 0 0 0.262745 0 0 0 0 0.333333 0 0 0 0.3 0"/>
                <feBlend mode="normal" in2="shape" result="effect1_innerShadow"/>
              </filter>
              <clipPath id="clip0_mic">
                <rect width="187" height="143" fill="white"/>
              </clipPath>
            </defs>
          </svg>
          <div style={{ ...P, fontSize: timerSize, fontWeight: 600, color: 'rgba(0,0,0,0.88)', lineHeight: 1, textAlign: 'center', transition: 'font-size 0.2s' }}>{mins}:{secs}</div>
        </div>
        <div style={{ background: 'rgba(45,76,205,0.05)', borderRadius: 8, padding: 16, width: '100%', maxWidth: 295, overflow: 'hidden', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ ...P, fontSize: 14, color: 'rgba(0,0,0,0.87)', letterSpacing: '0.17px', lineHeight: 1.43, whiteSpace: 'nowrap', flexShrink: 0 }}>Your microphone:</span>
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', justifyContent: 'flex-end' }}>
              <EqBars activeCount={3} total={19} animOffset={0} />
            </div>
          </div>
          <div style={{ height: 1, background: 'rgba(45,76,205,0.15)', marginBottom: 12 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ ...P, fontSize: 14, color: 'rgba(0,0,0,0.87)', letterSpacing: '0.17px', lineHeight: 1.43, whiteSpace: 'nowrap', flexShrink: 0 }}>Clients microphone:</span>
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', justifyContent: 'flex-end' }}>
              <EqBars activeCount={15} total={19} animOffset={100} />
            </div>
          </div>
        </div>
        </div>{/* end centred content area */}

        {/* Bottom CTA — flex child at bottom of white card */}
        <div style={{ flexShrink: 0, background: '#EAEDFA', padding: '16px 16px 24px', boxShadow: '0px -1px 3px rgba(0,0,0,0.12),0px -1px 1px rgba(0,0,0,0.05)' }}>
          <button
            onClick={onEndSession}
            style={{ width: '100%', padding: '8px 22px', background: '#2d4ccd', color: 'white', ...P, fontWeight: 500, fontSize: 15, border: 'none', borderRadius: 4, cursor: 'pointer', letterSpacing: '0.46px', lineHeight: '26px', boxShadow: '0px 1px 5px rgba(0,0,0,0.12),0px 2px 2px rgba(0,0,0,0.14),0px 3px 1px -2px rgba(0,0,0,0.2)' }}
          >
            End Session
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Session End Panel ─────────────────────────────────────────────────────────

function SessionEndPanel({ clientName, dateTime, onBack, onGoToActivities, onStartNew, compactMode = false }) {
  const P = { fontFamily: 'Poppins, sans-serif' };
  const SHADOW_EL4 = '0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 10px 0px rgba(0,0,0,0.1), 0px 1px 10px 0px rgba(0,0,0,0.1)';
  const containerRef = useRef(null);
  const [panelH, setPanelH] = useState(600);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => setPanelH(entries[0].contentRect.height));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const showIllustration = panelH >= 480;
  const showDescription  = panelH >= 360;

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#EAEDFA', gap: 8, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ background: 'white', borderRadius: 16, boxShadow: SHADOW_EL4, flexShrink: 0, padding: '16px 16px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', color: 'rgba(0,0,0,0.54)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <FigmaUserAvatar />
        </div>
        <div style={{ textAlign: 'center', padding: '0 10px 6px' }}>
          <div style={{ ...P, fontSize: compactMode ? 15 : 18, fontWeight: 600, color: '#212121', lineHeight: 1.57, letterSpacing: '0.018px' }}>{clientName}</div>
          <div style={{ ...P, fontSize: 14, fontWeight: 500, color: 'rgba(0,0,0,0.6)', lineHeight: 1.43, letterSpacing: '0.15px' }}>{dateTime}</div>
        </div>
      </div>

      {/* Content + CTAs — wrapped together so no gap appears between them */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRadius: '16px 16px 0 0', boxShadow: '0px 6px 30px 5px rgba(0,0,0,0.12),0px 16px 24px 1px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'white', padding: '24px', gap: 24 }}>
        {/* Inline SVG — no network load */}
        <svg preserveAspectRatio="none" width="169" height="116" overflow="visible" viewBox="0 0 169 116" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: showIllustration ? 'block' : 'none' }}>
          <path d="M113.82 38.2293C101.809 38.2293 89.6258 37.7593 78.2034 34.5975C66.781 31.4356 56.7648 25.5249 47.5379 18.6029C41.5397 14.088 36.0581 10.5131 28.2805 11.0543C20.6568 11.4535 13.3655 14.2803 7.48768 19.1157C-2.42802 27.6613 -0.921292 43.6558 3.03925 54.8648C8.9944 71.7423 27.1325 83.4641 42.6016 91.1124C60.4097 99.9428 79.911 105.07 99.5845 108.018C116.804 110.611 138.86 112.491 153.755 101.353C167.445 91.1124 171.204 67.7401 167.846 51.945C166.997 47.2973 164.472 43.1154 160.743 40.1806C151.143 33.2159 136.794 37.8733 126.002 38.1011C121.985 38.1154 117.909 38.2151 113.82 38.2293Z" fill="#F0F7F8"/>
          <path d="M148 102V108" stroke="#FFC04C" strokeWidth="1.23352" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M145 105H151" stroke="#FFC04C" strokeWidth="1.23352" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M31 18V24" stroke="#FFC04C" strokeWidth="1.23352" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M28 21H34" stroke="#FFC04C" strokeWidth="1.23352" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M145 21C146.105 21 147 20.1046 147 19C147 17.8954 146.105 17 145 17C143.895 17 143 17.8954 143 19C143 20.1046 143.895 21 145 21Z" fill="#FF97A4"/>
          <path d="M35.5 63C36.3284 63 37 62.3284 37 61.5C37 60.6716 36.3284 60 35.5 60C34.6716 60 34 60.6716 34 61.5C34 62.3284 34.6716 63 35.5 63Z" fill="#93C7C7"/>
          <path d="M111.375 103.162L85.5874 87.7969C84.7104 87.2788 83.7088 87.0053 82.6882 87.0053C81.6677 87.0053 80.6661 87.2788 79.7891 87.7969L54.5959 103.047C53.7388 103.566 52.758 103.848 51.7544 103.866C50.7508 103.884 49.7605 103.636 48.8852 103.149C48.01 102.661 47.2814 101.95 46.7744 101.091C46.2673 100.231 46 99.2525 46 98.2562V6.61093C46 5.12282 46.5956 3.69566 47.6558 2.6434C48.716 1.59115 50.1539 1 51.6533 1H114.347C115.845 1.0038 117.28 1.59617 118.34 2.6476C119.399 3.69903 119.996 5.12399 120 6.61093V98.3426C120.008 99.3456 119.745 100.333 119.239 101.201C118.733 102.069 118.001 102.786 117.12 103.278C116.24 103.77 115.242 104.019 114.232 103.999C113.221 103.978 112.235 103.69 111.375 103.162Z" fill="white" stroke="#294355" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M122.086 114.164L95.2593 98.1959C94.3396 97.645 93.2856 97.3538 92.2111 97.3538C91.1366 97.3538 90.0825 97.645 89.1629 98.1959L62.9569 114.064C62.0637 114.602 61.0422 114.896 59.9971 114.914C58.9519 114.932 57.9207 114.674 57.0092 114.167C56.0977 113.66 55.3386 112.921 54.8098 112.027C54.281 111.134 54.0015 110.116 54 109.08V13.8288C54.0038 12.2816 54.6265 10.799 55.7315 9.70634C56.8364 8.61364 58.3335 8 59.8942 8H125.12C126.68 8 128.175 8.6141 129.278 9.70721C130.381 10.8003 131 12.2829 131 13.8288V109.166C131.001 110.199 130.725 111.213 130.201 112.106C129.676 112.998 128.922 113.736 128.015 114.245C127.108 114.753 126.082 115.014 125.04 114.999C123.998 114.985 122.979 114.697 122.086 114.164Z" fill="white" stroke="#294355" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M92.5 74C107.136 74 119 62.1355 119 47.5C119 32.8645 107.136 21 92.5 21C77.8645 21 66 32.8645 66 47.5C66 62.1355 77.8645 74 92.5 74Z" fill="#D7EDFC" stroke="#294355" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M93.8684 28.8951L98.7676 39.0236L109.705 40.6441C109.985 40.6874 110.247 40.8088 110.463 40.9948C110.678 41.1808 110.839 41.424 110.926 41.6973C111.013 41.9706 111.024 42.2631 110.956 42.5422C110.889 42.8213 110.747 43.0759 110.546 43.2776L102.627 51.1199L104.493 62.1889C104.541 62.4734 104.51 62.7659 104.403 63.0334C104.297 63.3009 104.118 63.5328 103.889 63.7028C103.659 63.8729 103.387 63.9743 103.104 63.9957C102.821 64.0171 102.537 63.9576 102.285 63.824L92.5012 58.5282L82.717 63.7661C82.4652 63.8998 82.1816 63.9593 81.8982 63.9379C81.6149 63.9165 81.3431 63.815 81.1135 63.645C80.8839 63.4749 80.7057 63.243 80.599 62.9755C80.4923 62.708 80.4613 62.4155 80.5095 62.131L82.3894 51.062L74.4709 43.1907C74.2641 42.9915 74.117 42.7368 74.0467 42.4561C73.9763 42.1754 73.9857 41.8803 74.0736 41.6048C74.1615 41.3293 74.3244 41.0847 74.5434 40.8993C74.7624 40.714 75.0286 40.5954 75.3112 40.5573L86.249 38.9368L91.1482 28.8083C91.2831 28.5565 91.4841 28.3476 91.7289 28.2051C91.9736 28.0625 92.2526 27.9918 92.5346 28.0008C92.8166 28.0098 93.0906 28.0981 93.3261 28.256C93.5616 28.4139 93.7494 28.6352 93.8684 28.8951Z" fill="#FFC04C" stroke="#294355" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <div style={{ textAlign: 'center' }}>
          <div style={{ ...P, fontSize: compactMode ? 15 : 18, fontWeight: 600, color: '#212121', lineHeight: 1.57, letterSpacing: '0.018px', marginBottom: 10 }}>Audio capture completed</div>
          {showDescription && <div style={{ ...P, fontSize: 14, fontWeight: 400, color: 'rgba(0,0,0,0.6)', lineHeight: 1.57, letterSpacing: '0.17px', maxWidth: 280 }}>We're generating suggestions for you! They will be available shortly.</div>}
        </div>
      </div>

      {/* Bottom CTAs */}
      <div style={{ background: '#EAEDFA', padding: '12px 16px 24px', borderTop: '1px solid rgba(0,0,0,0.08)', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button onClick={onGoToActivities} style={{ width: '100%', height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#2d4ccd', color: 'white', ...P, fontWeight: 500, fontSize: 13, border: 'none', borderRadius: 4, cursor: 'pointer', letterSpacing: '0.46px', boxShadow: '0px 1px 5px rgba(0,0,0,0.12),0px 2px 2px rgba(0,0,0,0.14),0px 3px 1px -2px rgba(0,0,0,0.2)' }}>
          {compactMode ? 'Activities' : 'Go to Activities List'}
        </button>
        <button onClick={onStartNew} style={{ width: '100%', height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', color: '#2d4ccd', ...P, fontWeight: 500, fontSize: 13, border: '1px solid rgba(45,76,205,0.5)', borderRadius: 4, cursor: 'pointer', letterSpacing: '0.46px' }}>
          {compactMode ? 'New Session' : 'Start New Session'}
        </button>
      </div>
      </div>{/* end content+CTAs wrapper */}
    </div>
  );
}

// ── Recording Panel (step 2) ──────────────────────────────────────────────────

function RecordingPanel({ ending, onEndSession }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--eleos-content-bg)', gap: 8 }}>
      {/* Header card */}
      <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 10px rgba(0,0,0,0.10), 0 1px 10px rgba(0,0,0,0.10)', zIndex: 2, position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px 0' }}>
          <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 16, color: '#212121' }}>My Activities</span>
          <FigmaUserAvatar />
        </div>
        <div style={{ margin: '12px 16px 0', position: 'relative' }}>
          <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}><FigmaSearchIcon /></div>
          <div style={{ background: 'white', border: '1.5px solid rgba(33,33,33,0.42)', borderRadius: 8, padding: '10px 12px 10px 36px', fontFamily: 'Poppins, sans-serif', fontSize: 13, color: 'rgba(33,33,33,0.38)' }}>
            Filter by client name
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', margin: '10px 0 0', paddingLeft: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, paddingBottom: 10, borderBottom: '2px solid var(--eleos-tab-active)', cursor: 'default' }}>
            <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, fontWeight: 500, color: 'var(--eleos-tab-active)' }}>Add to EHR</span>
            <span style={{ background: 'var(--eleos-badge-red)', color: 'white', borderRadius: 10, padding: '1px 7px', fontSize: 10, fontWeight: 600, fontFamily: 'Poppins, sans-serif', lineHeight: '18px' }}>25</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingBottom: 10, paddingLeft: 18, borderBottom: '2px solid transparent', cursor: 'default' }}>
            <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, color: '#757575' }}>Marked as Done</span>
            <span style={{ background: '#F5F5F5', color: '#757575', borderRadius: 10, padding: '1px 7px', fontSize: 10, fontWeight: 500, fontFamily: 'Poppins, sans-serif', lineHeight: '18px' }}>10</span>
          </div>
        </div>
        <div style={{ height: 1, background: 'rgba(33,33,33,0.12)', marginLeft: 16 }} />
      </div>

      {/* Recording banner */}
      <div style={{ margin: '0 12px', borderRadius: 10, background: 'white', border: '1px solid var(--eleos-card-border)', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', padding: '10px 14px', flexShrink: 0 }}>
        {ending ? <ProcessingContent /> : <RecordingContent onEndSession={onEndSession} />}
      </div>

      {/* Session list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0' }}>
        {/* Sticky top spacer */}
        <div style={{ position: 'sticky', top: 0, height: 12, background: 'var(--eleos-content-bg)', zIndex: 5 }} />
        {SESSION_LIST.map((session, i) => {
          const showDate = i === 0 || SESSION_LIST[i - 1].day !== session.day || SESSION_LIST[i - 1].month !== session.month;
          const showMonthSep = i > 0 && SESSION_LIST[i - 1].month !== session.month;
          return (
            <React.Fragment key={i}>
              {showMonthSep && (
                <div style={{ background: 'var(--eleos-content-bg)', padding: '6px 16px', marginBottom: 4 }}>
                  <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 12, fontWeight: 500, color: 'var(--eleos-tab-active)' }}>{session.month === 'Mar' ? 'March' : session.month}</span>
                </div>
              )}
              <div style={{ display: 'flex', marginBottom: 6, paddingLeft: 8, paddingRight: 12 }}>
                {/* Date column */}
                <div style={{ width: 38, flexShrink: 0, paddingTop: 10, textAlign: 'center' }}>
                  {showDate && (
                    <>
                      <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 9, fontWeight: 500, color: '#9E9E9E', textTransform: 'uppercase', lineHeight: 1, letterSpacing: 0.3 }}>{session.month}</div>
                      <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 18, fontWeight: 600, color: '#212121', lineHeight: 1.15 }}>{session.day}</div>
                    </>
                  )}
                </div>

                {/* Card: left bar + body */}
                <div style={{ flex: 1, marginLeft: 6, display: 'flex' }}>
                  <div style={{ width: 6, flexShrink: 0, background: 'var(--eleos-card-bar)', borderRadius: '4px 0 0 4px', alignSelf: 'stretch' }} />
                  <div style={{
                    flex: 1, minWidth: 0, background: 'white',
                    border: '1px solid var(--eleos-card-border)', borderLeft: 'none',
                    borderRadius: '0 4px 4px 0', padding: '10px 10px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.12)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', minWidth: 0, marginBottom: 0 }}>
                      <div style={{ flex: 1, minWidth: 0, marginRight: 8 }}>
                        <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 500, fontSize: 13, color: '#212121', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{session.name}</div>
                        <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 11, color: '#757575', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{session.time}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, paddingTop: 2 }}>
                        {session.type === 'group' ? <CardGroupIcon /> : <CardPersonIcon />}
                        <CardDocIcon />
                        <CardChevron open={false} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

function RecordingContent({ onEndSession }) {
  return (
    <div>
      <style>{`
        @keyframes waveBar  { 0%,100%{transform:scaleY(0.3)} 50%{transform:scaleY(1)} }
        @keyframes recPing  { 0%{transform:scale(1);opacity:0.7} 100%{transform:scale(2.2);opacity:0} }
      `}</style>
      {/* Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 9 }}>
        <span style={{ position: 'relative', display: 'inline-flex', width: 10, height: 10 }}>
          <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#EF4444', animation: 'recPing 1s ease-out infinite' }} />
          <span style={{ position: 'relative', width: 10, height: 10, borderRadius: '50%', background: '#EF4444', display: 'inline-block' }} />
        </span>
        <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 11, fontWeight: 500, color: 'var(--gold-dark)' }}>Recording...</span>
        <span style={{ marginLeft: 'auto', fontFamily: 'Poppins, sans-serif', fontSize: 9, fontWeight: 600, background: 'var(--gold-light)', color: 'var(--gold-dark)', borderRadius: 20, padding: '2px 7px' }}>LIVE</span>
      </div>
      {/* Timer */}
      <SessionTimer />
      {/* Waveform */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 28, marginBottom: 10 }}>
        {BAR_DELAYS.map((d, i) => (
          <div key={i} style={{ flex: 1, height: '100%', background: 'var(--gold-mid)', borderRadius: 2, transformOrigin: 'bottom', animation: `waveBar 0.9s ease-in-out ${d}s infinite` }} />
        ))}
        {BAR_DELAYS.map((d, i) => (
          <div key={`b${i}`} style={{ flex: 1, height: '100%', background: 'var(--gold-light)', borderRadius: 2, transformOrigin: 'bottom', animation: `waveBar 0.9s ease-in-out ${BAR_DELAYS[(i+2)%5]}s infinite` }} />
        ))}
      </div>
      {/* End Session */}
      <button onClick={onEndSession} style={{ width: '100%', padding: '9px 0', background: 'var(--gold-mid)', color: 'var(--navy-deep)', fontFamily: 'Poppins, sans-serif', fontSize: 12, fontWeight: 600, border: 'none', borderRadius: 8, cursor: 'pointer' }}>
        End Session
      </button>
    </div>
  );
}

function ProcessingContent() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
      <SpinnerSVG />
      <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 11, fontWeight: 500, color: 'var(--navy-mid)' }}>Processing session...</span>
      <span style={{ marginLeft: 'auto', fontFamily: 'Poppins, sans-serif', fontSize: 9, fontWeight: 600, background: 'var(--teal-light)', color: 'var(--teal-dark)', borderRadius: 20, padding: '2px 7px' }}>AI</span>
    </div>
  );
}

function SessionTimer() {
  const [seconds, setSeconds] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    ref.current = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(ref.current);
  }, []);
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  return (
    <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 26, fontWeight: 600, color: 'var(--navy-deep)', letterSpacing: '0.04em', marginBottom: 8, tabularNums: true }}>
      {mm}:{ss}
    </div>
  );
}

// ── Shared helpers ────────────────────────────────────────────────────────────

function SpinnerSVG() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--teal-dark)" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 0.75s linear infinite' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  );
}


// Eleos logo — exact paths from Figma _SideActions.svg (lines 26-34)
function EleosNavLogo() {
  return (
    // viewBox covers y=757–828, x=26–48 (vertical wordmark + flame)
    <svg width="22" height="72" viewBox="26 757 22 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* "eleos" vertical letterforms (lines 30–34) */}
      <path d="M38.5006 802.363C35.7407 802.363 33.4736 800.235 33.4736 797.481C33.4736 794.949 35.7125 792.919 38.4161 792.919C38.6977 792.919 38.9794 792.946 39.2469 792.974V800.152C40.7817 799.846 41.5844 798.622 41.5844 797.203C41.5844 796.229 41.2887 795.297 40.7395 794.49L42.3307 793.642C43.0629 794.699 43.4712 795.951 43.4853 797.245C43.4994 799.957 41.6689 802.363 38.5006 802.363ZM37.6557 795.005C37.0221 795.089 36.4307 795.395 36.0082 795.881C35.5858 796.354 35.3605 796.98 35.3605 797.606C35.3605 798.83 36.2758 799.901 37.6557 800.193V795.005Z" fill="white"/>
      <path d="M30.5017 791.625V789.497H43.3015V791.625H30.5017Z" fill="white"/>
      <path d="M38.5006 788.217C35.7407 788.217 33.4736 786.089 33.4736 783.335C33.4736 780.803 35.7125 778.773 38.4161 778.773C38.6977 778.773 38.9794 778.8 39.2469 778.828V786.006C40.7817 785.7 41.5844 784.476 41.5844 783.057C41.5844 782.083 41.3027 781.137 40.7536 780.344L42.3447 779.496C43.077 780.553 43.4853 781.805 43.4994 783.099C43.4994 785.797 41.6688 788.217 38.5006 788.217ZM37.6557 780.845C37.0221 780.929 36.4307 781.235 36.0082 781.721C35.5858 782.194 35.3605 782.82 35.3605 783.446C35.3605 784.67 36.2758 785.741 37.6557 786.033V780.845Z" fill="white"/>
      <path d="M38.5006 777.994C35.6985 777.994 33.4736 775.755 33.4736 772.959C33.4736 770.163 35.6985 767.924 38.5006 767.924C41.2887 767.924 43.4994 770.163 43.4994 772.959C43.4994 775.755 41.2746 777.994 38.5006 777.994ZM38.5006 770.08C36.8109 770.08 35.5576 771.318 35.5576 772.945C35.5576 774.572 36.7968 775.81 38.5006 775.81C40.1762 775.81 41.4154 774.572 41.4154 772.945C41.4154 771.331 40.1762 770.08 38.5006 770.08Z" fill="white"/>
      <path d="M42.091 767.367L40.3167 766.56C40.8237 765.948 41.4573 764.974 41.4573 763.555C41.4573 762.693 41.1334 761.678 40.4435 761.678C39.7676 761.678 39.5704 762.637 39.3029 763.583C38.796 765.378 38.2468 766.922 36.3599 766.922C34.4731 766.922 33.4592 765.016 33.4592 763.361C33.4592 761.942 33.8253 761.01 34.459 759.967L36.205 760.746C35.7263 761.525 35.4728 762.415 35.4869 763.333C35.4869 764.042 35.8108 764.752 36.3177 764.752C36.9795 764.752 37.1344 763.973 37.3175 763.124C37.7117 761.358 38.4299 759.522 40.4153 759.522C42.6683 759.522 43.485 761.803 43.485 763.555C43.4991 765.517 42.5979 766.852 42.091 767.367Z" fill="white"/>
      {/* Flame logomark (lines 26–29) */}
      <path d="M31.7607 807.748C31.7607 807.748 36.3515 807.249 37.0633 811.977C37.0736 812.466 37.1252 812.976 37.1664 813.496C37.3212 815.442 37.1664 817.266 36.3205 818.886C35.7119 820.058 35.9491 822.025 37.5791 822.922C39.2194 823.819 41.3239 823.207 42.3245 822.524C44.4084 821.118 45.7083 819.029 46.1312 817.236C46.7296 814.708 46.0281 812.15 44.2227 810.153C44.1712 810.092 44.1093 810.041 44.0577 809.98C42.1595 807.758 38.0124 804.467 31.7607 807.748Z" fill="#F9B534"/>
      <path d="M33.6895 823.37C33.6895 822.971 33.3616 822.647 32.9571 822.647C32.5525 822.647 32.2246 822.971 32.2246 823.37C32.2246 823.77 32.5525 824.094 32.9571 824.094C33.3616 824.094 33.6895 823.77 33.6895 823.37Z" fill="white"/>
      <path d="M29.129 825.276C29.129 824.876 28.801 824.552 28.3965 824.552C27.992 824.552 27.6641 824.876 27.6641 825.276C27.6641 825.676 27.992 826 28.3965 826C28.801 826 29.129 825.676 29.129 825.276Z" fill="white"/>
      <path d="M28.9327 822.219C29.0049 822.147 29.0565 822.056 29.0875 821.964C29.1184 821.872 29.139 821.77 29.1287 821.668V817.276C29.1287 817.174 29.17 817.073 29.2422 816.991C29.3144 816.92 29.4176 816.879 29.5311 816.879C29.6445 816.879 29.7374 816.92 29.8199 816.991C29.8921 817.062 29.9334 817.164 29.9334 817.276V819.549C29.9437 819.732 30.0262 819.905 30.1603 820.038C30.2945 820.17 30.4801 820.232 30.6658 820.232C30.8515 820.232 31.0372 820.16 31.1713 820.038C31.3054 819.916 31.388 819.742 31.3983 819.549V815.289C31.3983 815.187 31.4396 815.085 31.5118 815.004C31.584 814.932 31.6871 814.892 31.8006 814.892C31.9141 814.892 32.0069 814.932 32.0895 815.004C32.1617 815.075 32.203 815.177 32.203 815.289V821.016C32.2133 821.2 32.2958 821.373 32.4299 821.505C32.564 821.628 32.7497 821.699 32.9354 821.699C33.1211 821.699 33.3068 821.628 33.4409 821.505C33.5853 821.373 33.6472 821.179 33.6472 820.996V814.586C33.6472 813.139 34.7923 811.926 36.2469 811.875C36.5254 811.865 36.7937 811.906 37.0413 811.967C36.3294 807.259 31.7903 807.728 31.7387 807.738C31.5221 807.85 31.3054 807.983 31.1094 808.135C31.0991 808.146 31.0888 808.156 31.0785 808.166C31.0682 808.176 31.0579 808.186 31.0475 808.197C30.9547 808.268 30.8722 808.339 30.7896 808.421C30.7793 808.431 30.7793 808.431 30.769 808.441C29.789 809.328 29.0049 810.408 28.4685 811.61C27.9424 812.813 27.6638 814.117 27.6638 815.432V821.668C27.6535 821.77 27.6741 821.872 27.7051 821.964C27.736 822.056 27.7876 822.147 27.8598 822.219C27.932 822.29 28.0146 822.351 28.1074 822.392C28.2003 822.433 28.3034 822.453 28.3963 822.453C28.4891 822.453 28.5923 822.433 28.6851 822.392C28.7883 822.341 28.8708 822.29 28.9327 822.219Z" fill="white"/>
    </svg>
  );
}

// ── Card Icons ────────────────────────────────────────────────────────────────

function CardPersonIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M19.2862 17.5546C18.8849 16.6039 18.3024 15.7403 17.5714 15.012C16.8425 14.2816 15.9791 13.6993 15.0288 13.2972C15.0203 13.2929 15.0118 13.2908 15.0033 13.2865C16.3288 12.3291 17.1905 10.7695 17.1905 9.00996C17.1905 6.09508 14.8288 3.7334 11.9139 3.7334C8.99907 3.7334 6.63738 6.09508 6.63738 9.00996C6.63738 10.7695 7.49908 12.3291 8.8246 13.2887C8.81609 13.2929 8.80758 13.295 8.79907 13.2993C7.84588 13.7014 6.99057 14.278 6.25653 15.0142C5.52613 15.743 4.94378 16.6064 4.54165 17.5567C4.14659 18.487 3.93353 19.4845 3.91399 20.495C3.91343 20.5177 3.91741 20.5403 3.92571 20.5614C3.93401 20.5826 3.94646 20.6018 3.96232 20.6181C3.97818 20.6344 3.99714 20.6473 4.01807 20.6561C4.039 20.6649 4.06149 20.6695 4.08421 20.6695H5.36079C5.45441 20.6695 5.52888 20.595 5.531 20.5035C5.57356 18.861 6.23313 17.3227 7.39908 16.1567C8.60545 14.9503 10.2076 14.2865 11.9139 14.2865C13.6203 14.2865 15.2224 14.9503 16.4288 16.1567C17.5948 17.3227 18.2543 18.861 18.2969 20.5035C18.299 20.5971 18.3735 20.6695 18.4671 20.6695H19.7437C19.7664 20.6695 19.7889 20.6649 19.8098 20.6561C19.8307 20.6473 19.8497 20.6344 19.8656 20.6181C19.8814 20.6018 19.8939 20.5826 19.9022 20.5614C19.9105 20.5403 19.9145 20.5177 19.9139 20.495C19.8926 19.478 19.682 18.4886 19.2862 17.5546ZM11.9139 12.6695C10.9374 12.6695 10.0182 12.2887 9.32672 11.5972C8.63524 10.9057 8.25439 9.98655 8.25439 9.00996C8.25439 8.03337 8.63524 7.11423 9.32672 6.42274C10.0182 5.73126 10.9374 5.35041 11.9139 5.35041C12.8905 5.35041 13.8097 5.73126 14.5012 6.42274C15.1926 7.11423 15.5735 8.03337 15.5735 9.00996C15.5735 9.98655 15.1926 10.9057 14.5012 11.5972C13.8097 12.2887 12.8905 12.6695 11.9139 12.6695Z" fill="#212121"/>
    </svg>
  );
}

function CardGroupIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M22.95 14.1002C22.8712 14.1593 22.7816 14.2023 22.6862 14.2267C22.5908 14.2511 22.4915 14.2566 22.394 14.2426C22.2965 14.2287 22.2027 14.1957 22.1179 14.1455C22.0332 14.0953 21.9591 14.029 21.9 13.9502C21.448 13.3425 20.8596 12.8495 20.1822 12.5108C19.5048 12.1721 18.7574 11.9972 18 12.0002C17.8526 12.0002 17.7083 11.9567 17.5855 11.8751C17.4626 11.7936 17.3664 11.6776 17.3091 11.5417C17.2702 11.4495 17.2501 11.3503 17.2501 11.2502C17.2501 11.15 17.2702 11.0509 17.3091 10.9586C17.3664 10.8227 17.4626 10.7068 17.5855 10.6252C17.7083 10.5437 17.8526 10.5002 18 10.5002C18.4209 10.5001 18.8332 10.3821 19.1903 10.1594C19.5474 9.93677 19.8349 9.61844 20.0201 9.24058C20.2054 8.86273 20.2809 8.4405 20.2382 8.02185C20.1955 7.60321 20.0363 7.20493 19.7786 6.87225C19.5209 6.53958 19.175 6.28584 18.7803 6.13987C18.3856 5.9939 17.9579 5.96154 17.5458 6.04646C17.1336 6.13139 16.7535 6.3302 16.4487 6.62031C16.1439 6.91043 15.9265 7.28021 15.8213 7.68767C15.7967 7.78308 15.7535 7.87271 15.6942 7.95144C15.635 8.03017 15.5608 8.09645 15.4759 8.14651C15.391 8.19656 15.2971 8.22941 15.1995 8.24318C15.102 8.25694 15.0026 8.25135 14.9072 8.22673C14.8118 8.20211 14.7222 8.15893 14.6435 8.09967C14.5647 8.04041 14.4984 7.96622 14.4484 7.88134C14.3983 7.79646 14.3655 7.70256 14.3517 7.60498C14.338 7.50741 14.3435 7.40808 14.3682 7.31267C14.5142 6.74765 14.7901 6.22451 15.1738 5.78487C15.5576 5.34523 16.0387 5.00124 16.5788 4.78025C17.119 4.55926 17.7032 4.46738 18.2851 4.51191C18.867 4.55645 19.4304 4.73618 19.9306 5.0368C20.4308 5.33742 20.8539 5.75063 21.1663 6.24356C21.4787 6.73648 21.6718 7.29552 21.7301 7.87618C21.7884 8.45684 21.7104 9.0431 21.5023 9.58831C21.2942 10.1335 20.9617 10.6226 20.5313 11.0167C21.5511 11.4583 22.4377 12.159 23.1029 13.0492C23.1619 13.1282 23.2049 13.2181 23.2292 13.3137C23.2535 13.4093 23.2587 13.5088 23.2445 13.6064C23.2303 13.704 23.197 13.7979 23.1465 13.8826C23.0959 13.9673 23.0292 14.0413 22.95 14.1002ZM17.8988 19.8752C17.9531 19.9605 17.9895 20.056 18.0059 20.1558C18.0223 20.2556 18.0184 20.3577 17.9943 20.456C17.9703 20.5542 17.9266 20.6466 17.8659 20.7275C17.8052 20.8084 17.7288 20.8762 17.6412 20.9268C17.5536 20.9775 17.4567 21.0099 17.3563 21.022C17.2559 21.0342 17.154 21.026 17.0569 20.9978C16.9597 20.9696 16.8693 20.9221 16.791 20.8581C16.7127 20.794 16.6482 20.7148 16.6013 20.6252C16.1288 19.8252 15.456 19.1622 14.6491 18.7016C13.8422 18.241 12.9291 17.9988 12 17.9988C11.0709 17.9988 10.1579 18.241 9.35102 18.7016C8.54412 19.1622 7.87125 19.8252 7.39879 20.6252C7.3519 20.7148 7.28737 20.794 7.20908 20.8581C7.13078 20.9221 7.04034 20.9696 6.94319 20.9978C6.84605 21.026 6.7442 21.0342 6.64379 21.022C6.54338 21.0099 6.44647 20.9775 6.35889 20.9268C6.27132 20.8762 6.19489 20.8084 6.1342 20.7275C6.07352 20.6466 6.02983 20.5542 6.00576 20.456C5.9817 20.3577 5.97775 20.2556 5.99417 20.1558C6.01059 20.056 6.04702 19.9605 6.10129 19.8752C6.82841 18.6258 7.9371 17.6427 9.26441 17.0702C8.51753 16.4983 7.96863 15.7068 7.69485 14.8069C7.42108 13.9069 7.4362 12.9438 7.73808 12.053C8.03997 11.1621 8.61346 10.3882 9.37792 9.84005C10.1424 9.29194 11.0594 8.99716 12 8.99716C12.9407 8.99716 13.8577 9.29194 14.6222 9.84005C15.3866 10.3882 15.9601 11.1621 16.262 12.053C16.5639 12.9438 16.579 13.9069 16.3052 14.8069C16.0315 15.7068 15.4825 16.4983 14.7357 17.0702C16.063 17.6427 17.1717 18.6258 17.8988 19.8752ZM12 16.5002C12.5934 16.5002 13.1734 16.3242 13.6667 15.9946C14.1601 15.6649 14.5446 15.1964 14.7717 14.6482C14.9987 14.1 15.0582 13.4968 14.9424 12.9149C14.8266 12.333 14.5409 11.7984 14.1214 11.3788C13.7018 10.9593 13.1673 10.6736 12.5853 10.5578C12.0034 10.4421 11.4002 10.5015 10.852 10.7285C10.3038 10.9556 9.83528 11.3401 9.50563 11.8335C9.17599 12.3268 9.00004 12.9068 9.00004 13.5002C9.00004 14.2958 9.31611 15.0589 9.87872 15.6215C10.4413 16.1841 11.2044 16.5002 12 16.5002ZM6.75004 11.2502C6.75004 11.0513 6.67102 10.8605 6.53037 10.7198C6.38972 10.5792 6.19895 10.5002 6.00004 10.5002C5.57922 10.5001 5.16685 10.3821 4.80976 10.1594C4.45267 9.93677 4.16518 9.61844 3.97994 9.24058C3.79471 8.86273 3.71915 8.4405 3.76185 8.02185C3.80455 7.60321 3.9638 7.20493 4.22152 6.87225C4.47923 6.53958 4.82507 6.28584 5.21976 6.13987C5.61445 5.9939 6.04216 5.96154 6.45432 6.04646C6.86648 6.13139 7.24656 6.3302 7.55139 6.62031C7.85622 6.91043 8.07359 7.28021 8.17879 7.68767C8.22852 7.88036 8.35276 8.04541 8.52418 8.14651C8.6956 8.2476 8.90016 8.27646 9.09285 8.22673C9.28555 8.177 9.4506 8.05276 9.55169 7.88134C9.65279 7.70992 9.68164 7.50536 9.63191 7.31267C9.48589 6.74765 9.21002 6.22451 8.82624 5.78487C8.44246 5.34523 7.96137 5.00124 7.42125 4.78025C6.88112 4.55926 6.29688 4.46738 5.715 4.51191C5.13312 4.55645 4.56967 4.73618 4.06947 5.0368C3.56928 5.33742 3.14614 5.75063 2.83375 6.24356C2.52135 6.73648 2.32831 7.29552 2.26998 7.87618C2.21165 8.45684 2.28965 9.0431 2.49777 9.58831C2.70589 10.1335 3.03838 10.6226 3.46879 11.0167C2.44999 11.4587 1.56446 12.1594 0.90004 13.0492C0.780569 13.2084 0.729204 13.4084 0.757247 13.6054C0.785289 13.8024 0.890442 13.9802 1.04957 14.0997C1.2087 14.2192 1.40877 14.2705 1.60577 14.2425C1.80278 14.2144 1.98057 14.1093 2.10004 13.9502C2.55209 13.3425 3.14049 12.8495 3.81788 12.5108C4.49526 12.1721 5.24271 11.9972 6.00004 12.0002C6.19895 12.0002 6.38972 11.9211 6.53037 11.7805C6.67102 11.6398 6.75004 11.4491 6.75004 11.2502Z" fill="#212121"/>
    </svg>
  );
}

function CardDocIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M17.4012 5.34152L16.1592 4.09802C15.8118 3.74875 15.3984 3.47187 14.9432 3.2834C14.488 3.09493 13.9999 2.99861 13.5072 3.00002H8.75C7.7558 3.00121 6.80267 3.39668 6.09966 4.09968C5.39666 4.80268 5.00119 5.75582 5 6.75002V17.25C5.00119 18.2442 5.39666 19.1973 6.09966 19.9004C6.80267 20.6034 7.7558 20.9988 8.75 21H14.75C15.7442 20.9988 16.6973 20.6034 17.4003 19.9004C18.1033 19.1973 18.4988 18.2442 18.5 17.25V7.99277C18.5012 7.50015 18.4047 7.01219 18.2161 6.55711C18.0275 6.10203 17.7506 5.68886 17.4012 5.34152ZM16.3407 6.40201C16.4471 6.508 16.5424 6.62461 16.625 6.75002H14.75V4.87502C14.8752 4.95851 14.992 5.05395 15.0987 5.16002L16.3407 6.40201ZM17 17.25C17 17.8468 16.7629 18.419 16.341 18.841C15.919 19.263 15.3467 19.5 14.75 19.5H8.75C8.15326 19.5 7.58097 19.263 7.15901 18.841C6.73705 18.419 6.5 17.8468 6.5 17.25V6.75002C6.5 6.15328 6.73705 5.58098 7.15901 5.15903C7.58097 4.73707 8.15326 4.50002 8.75 4.50002H13.25V6.75002C13.25 7.14784 13.408 7.52937 13.6893 7.81068C13.9706 8.09198 14.3522 8.25002 14.75 8.25002H17V17.25ZM14.75 9.75002C14.9489 9.75002 15.1397 9.82903 15.2803 9.96969C15.421 10.1103 15.5 10.3011 15.5 10.5C15.5 10.6989 15.421 10.8897 15.2803 11.0303C15.1397 11.171 14.9489 11.25 14.75 11.25H8.75C8.55109 11.25 8.36032 11.171 8.21967 11.0303C8.07902 10.8897 8 10.6989 8 10.5C8 10.3011 8.07902 10.1103 8.21967 9.96969C8.36032 9.82903 8.55109 9.75002 8.75 9.75002H14.75ZM15.5 13.5C15.5 13.6989 15.421 13.8897 15.2803 14.0303C15.1397 14.171 14.9489 14.25 14.75 14.25H8.75C8.55109 14.25 8.36032 14.171 8.21967 14.0303C8.07902 13.8897 8 13.6989 8 13.5C8 13.3011 8.07902 13.1103 8.21967 12.9697C8.36032 12.829 8.55109 12.75 8.75 12.75H14.75C14.9489 12.75 15.1397 12.829 15.2803 12.9697C15.421 13.1103 15.5 13.3011 15.5 13.5ZM15.356 16.0598C15.4726 16.2202 15.5209 16.4202 15.4904 16.6161C15.4599 16.812 15.3531 16.9879 15.1932 17.1053C14.4334 17.6467 13.5334 17.9574 12.6012 18C12.0567 17.9974 11.5286 17.8126 11.1012 17.475C10.8552 17.3063 10.7615 17.25 10.5762 17.25C10.0748 17.3276 9.60171 17.5327 9.20225 17.8455C9.04381 17.9585 8.84768 18.0054 8.65527 17.9765C8.46286 17.9475 8.28924 17.8449 8.17106 17.6903C8.05289 17.5357 7.99942 17.3413 8.02194 17.148C8.04445 16.9547 8.1412 16.7778 8.29175 16.6545C8.95263 16.1415 9.74621 15.8277 10.5792 15.75C11.0788 15.758 11.5618 15.9307 11.9532 16.2413C12.1317 16.4017 12.3614 16.4935 12.6012 16.5C13.2145 16.4541 13.8042 16.2445 14.309 15.8933C14.47 15.7766 14.6706 15.7286 14.867 15.7598C15.0633 15.791 15.2392 15.8989 15.356 16.0598Z" fill="#212121"/>
    </svg>
  );
}

function CardAudioIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path fillRule="evenodd" clipRule="evenodd" d="M7.6995 6.61239C9.05601 4.72978 11.0845 3.44084 13.365 3.01239C13.4733 2.99245 13.5847 2.99662 13.6913 3.0246C13.7978 3.05258 13.8969 3.10368 13.9814 3.17427C14.066 3.24487 14.1339 3.33322 14.1805 3.43305C14.227 3.53288 14.251 3.64174 14.2508 3.75189V19.9751C14.2508 20.174 14.1717 20.3648 14.0311 20.5055C13.8904 20.6461 13.6997 20.7251 13.5008 20.7251C13.4552 20.7254 13.4097 20.7211 13.365 20.7124C11.0846 20.2836 9.05628 18.9947 7.6995 17.1124H6.75C5.75593 17.1108 4.80302 16.7152 4.1001 16.0123C3.39718 15.3094 3.00159 14.3565 3 13.3624V10.3624C3.00159 9.36831 3.39718 8.41541 4.1001 7.71249C4.80302 7.00957 5.75593 6.61397 6.75 6.61239H7.6995ZM8.72175 15.9536C9.67341 17.4058 11.0958 18.4863 12.75 19.0136V4.71114C11.0977 5.23985 9.67747 6.32082 8.72775 7.77264C8.65958 7.87697 8.56649 7.96266 8.45688 8.02198C8.34728 8.0813 8.22463 8.11237 8.1 8.11239H6.75C6.15326 8.11239 5.58097 8.34944 5.15901 8.7714C4.73705 9.19335 4.5 9.76565 4.5 10.3624V13.3624C4.5 13.9591 4.73705 14.5314 5.15901 14.9534C5.58097 15.3753 6.15326 15.6124 6.75 15.6124H8.094C8.21876 15.6126 8.34151 15.6439 8.45112 15.7035C8.56074 15.763 8.65376 15.849 8.72175 15.9536ZM18.605 6.08002C18.5353 6.01034 18.4526 5.95506 18.3616 5.91735C18.2705 5.87964 18.1729 5.86023 18.0744 5.86023C17.9758 5.86023 17.8783 5.87964 17.7872 5.91735C17.6962 5.95506 17.6134 6.01034 17.5438 6.08002C17.4741 6.1497 17.4188 6.23243 17.3811 6.32347C17.3434 6.41452 17.324 6.5121 17.324 6.61065C17.324 6.70919 17.3434 6.80677 17.3811 6.89782C17.4188 6.98886 17.4741 7.07159 17.5438 7.14127C18.794 8.39445 19.4961 10.0923 19.4961 11.8625C19.4961 13.6327 18.794 15.3306 17.5438 16.5838C17.403 16.7245 17.324 16.9154 17.324 17.1144C17.324 17.3134 17.403 17.5043 17.5438 17.645C17.6845 17.7858 17.8754 17.8648 18.0744 17.8648C18.2734 17.8648 18.4643 17.7858 18.605 17.645C20.1363 16.1102 20.9963 14.0306 20.9963 11.8625C20.9963 9.69442 20.1363 7.61484 18.605 6.08002ZM16.575 8.33025C16.5053 8.26032 16.4226 8.2048 16.3314 8.16686C16.2403 8.12892 16.1426 8.10931 16.0438 8.10913C15.9451 8.10896 15.8473 8.12823 15.7561 8.16585C15.6648 8.20346 15.5818 8.25869 15.5119 8.32837C15.442 8.39806 15.3864 8.48083 15.3485 8.57197C15.3106 8.66311 15.2909 8.76083 15.2908 8.85955C15.2906 8.95827 15.3099 9.05606 15.3475 9.14733C15.3851 9.2386 15.4403 9.32157 15.51 9.3915C16.1646 10.0471 16.5322 10.9356 16.5322 11.862C16.5322 12.7884 16.1646 13.6769 15.51 14.3325C15.4403 14.4024 15.3851 14.4854 15.3475 14.5767C15.3099 14.6679 15.2906 14.7657 15.2908 14.8644C15.2909 14.9632 15.3106 15.0609 15.3485 15.152C15.3864 15.2432 15.442 15.3259 15.5119 15.3956C15.6531 15.5363 15.8445 15.6152 16.0438 15.6149C16.1426 15.6147 16.2403 15.5951 16.3314 15.5571C16.4226 15.5192 16.5053 15.4637 16.575 15.3937C17.5105 14.4564 18.0359 13.1863 18.0359 11.862C18.0359 10.5377 17.5105 9.26756 16.575 8.33025Z" fill="#212121"/>
    </svg>
  );
}

function CardChevron({ open }) {
  // Exact filled chevron from Compact Card2.svg — fill #424242, rotates 180° when open
  return (
    <svg
      width="16" height="16"
      viewBox="285 29.5 22 22"
      fill="none"
      style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 200ms ease-in-out', flexShrink: 0 }}
    >
      <path d="M299.59 33.7949L295 38.3749L290.41 33.7949L289 35.2049L295 41.2049L301 35.2049L299.59 33.7949Z" fill="#424242"/>
    </svg>
  );
}

// ── Figma-accurate shared helpers ─────────────────────────────────────────────

function FigmaUserAvatar() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'default' }}>
      {/* Exact from _Top-Header/_Header/User.svg — 25×24, avatar circle + person icon + online dot */}
      <svg width="25" height="24" viewBox="0 0 25 24" fill="none">
        <rect width="24" height="24" rx="12" fill="#EAEDFA"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M12 6.66683C10.5272 6.66683 9.33333 7.86074 9.33333 9.3335C9.33333 10.8063 10.5272 12.0002 12 12.0002C13.4728 12.0002 14.6667 10.8063 14.6667 9.3335C14.6667 7.86074 13.4728 6.66683 12 6.66683ZM8 9.3335C8 7.12436 9.79086 5.3335 12 5.3335C14.2091 5.3335 16 7.12436 16 9.3335C16 11.5426 14.2091 13.3335 12 13.3335C9.79086 13.3335 8 11.5426 8 9.3335Z" fill="#2D4CCD"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M7.75736 13.7574C8.88258 12.6321 10.4087 12 12 12C13.5913 12 15.1174 12.6321 16.2426 13.7574C17.3679 14.8826 18 16.4087 18 18C18 18.3682 17.7015 18.6667 17.3333 18.6667C16.9651 18.6667 16.6667 18.3682 16.6667 18C16.6667 16.7623 16.175 15.5753 15.2998 14.7002C14.4247 13.825 13.2377 13.3333 12 13.3333C10.7623 13.3333 9.57534 13.825 8.70017 14.7002C7.825 15.5753 7.33333 16.7623 7.33333 18C7.33333 18.3682 7.03486 18.6667 6.66667 18.6667C6.29848 18.6667 6 18.3682 6 18C6 16.4087 6.63214 14.8826 7.75736 13.7574Z" fill="#2D4CCD"/>
        <circle cx="22" cy="4" r="3" fill="#46BC9E"/>
      </svg>
      {/* Chevron */}
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M2.5 4.5l3.5 3.5 3.5-3.5" stroke="#424242" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

function FigmaSearchIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <circle cx="9" cy="9" r="6" stroke="#9E9E9E" strokeWidth="1.5"/>
      <path d="M14 14L17.5 17.5" stroke="#9E9E9E" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function AddPersonIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="8" cy="7" r="3.5" stroke="white" strokeWidth="1.4"/>
      <path d="M2 17c0-3.3 2.7-5 6-5" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M15 11v6M12 14h6" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M3 5l4 4 4-4" stroke="#aaa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
