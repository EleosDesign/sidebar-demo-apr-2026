/**
 * EhrBackgrounds.jsx  —  pixel-accurate EHR chrome for the Eleos demo
 * Each component: position:absolute inset:0, accepts { noteValues, onNoteChange, highlightedField }
 * Patient: Webb, Marcus
 */
import React, { useState } from 'react';
import { useNoteTypeContext } from '../../contexts/NoteTypeContext.jsx';

// ── Shared stacked textarea renderer ─────────────────────────────────────────
function StackedFields({ noteValues = {}, onNoteChange, highlightedField,
  labelColor = '#555', labelWeight = 500, borderRadius = 4,
  borderColor = '#ccc', minHeight = 150, fontSize = 13,
  fontFamily = "'Segoe UI', Arial, sans-serif", bg = '#fff' }) {
  const noteTypeCtx = useNoteTypeContext();
  const sections = noteTypeCtx?.sections ?? [
    { id: 'Data/Goal:',                         label: 'Data' },
    { id: 'Intervention/Response:',             label: 'Intervention/Response' },
    { id: 'Assessment/Level of Participation:', label: 'Assessment' },
    { id: 'Plan:',                              label: 'Plan' },
  ];
  return (
    <>
      {sections.map(s => (
        <div key={s.id} style={{ marginBottom: 22 }}>
          <div style={{ fontSize, color: labelColor, marginBottom: 5, fontWeight: labelWeight }}>{s.label}</div>
          <textarea
            value={noteValues[s.id] ?? ''}
            onChange={e => onNoteChange?.(s.id, e.target.value)}
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
        </div>
      ))}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. WELLIGENT
// ═══════════════════════════════════════════════════════════════════════════════
export function WelligentBg({ noteValues = {}, onNoteChange, highlightedField }) {
  const [activeTab, setActiveTab] = useState('Progress Note');
  const tabs = ['Progress Note', 'Treatment Plan', 'Assessment', 'Medication', 'Lab Results'];
  const rightIcons = [
    { d: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z' },
    { d: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 7a4 4 0 100 8' },
    { d: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8' },
    { d: 'M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 01-3.46 0' },
    { d: 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4z' },
    { d: 'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4 M16 17l5-5-5-5 M21 12H9' },
  ];
  const meds = [
    ['Aripiprazole', '10mg', 'Daily', '01/15/26', 'Active'],
    ['Sertraline', '50mg', 'Daily', '11/03/25', 'Active'],
    ['Clonazepam', '0.5mg', 'BID', '01/15/26', 'Active'],
    ['Lithium', '300mg', 'TID', '09/12/25', 'Active'],
    ['Trazodone', '50mg', 'QHS', '11/03/25', 'Active'],
    ['Hydroxyzine', '25mg', 'PRN', '01/15/26', 'Active'],
    ['Metformin', '500mg', 'BID', '06/01/25', 'Active'],
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily: 'Arial, sans-serif', fontSize: 13, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#e8edf2' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '2px solid #e8e8e8', display: 'flex', alignItems: 'center', padding: '0 14px', height: 46, gap: 10, flexShrink: 0 }}>
        <div style={{ fontWeight: 800, fontSize: 18, color: '#1a3a6b', letterSpacing: '-0.5px' }}>Welligent</div>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: '#666' }}>Webb, Marcus — MR#10234</span>
        <span style={{ fontSize: 12, color: '#999', marginLeft: 16 }}>Eleos Clinician</span>
      </div>
      {/* Tabs bar */}
      <div style={{ background: '#2c5f8a', display: 'flex', alignItems: 'stretch', flexShrink: 0 }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{
            padding: '9px 16px', border: 'none', cursor: 'pointer', fontSize: 13,
            background: activeTab === t ? 'rgba(255,255,255,0.15)' : 'transparent',
            color: '#fff', fontWeight: activeTab === t ? 600 : 400,
            borderBottom: activeTab === t ? '3px solid #f5a623' : '3px solid transparent',
          }}>{t}</button>
        ))}
      </div>
      {/* Body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left panel 295px */}
        <div style={{ width: 295, background: '#f4f8fc', borderRight: '1px solid #c8d8e8', flexShrink: 0, overflowY: 'auto' }}>
          {/* Active Medications */}
          <div style={{ background: '#cfe0ed', padding: '6px 10px', fontSize: 12, fontWeight: 700, color: '#1a3a6b', borderBottom: '1px solid #b8cede' }}>Active Medications</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
            <thead>
              <tr style={{ background: '#ddeaf5' }}>
                {['Drug', 'Dose', 'Freq', 'Date', 'Status'].map(h => (
                  <th key={h} style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid #c8d8e8', color: '#444', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {meds.map((row, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f4f8fc' }}>
                  {row.map((cell, j) => (
                    <td key={j} style={{ padding: '4px 6px', borderBottom: '1px solid #e4eef5', color: j === 4 ? '#2a7a3a' : '#333' }}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {/* Active Allergies */}
          <div style={{ background: '#cfe0ed', padding: '6px 10px', fontSize: 12, fontWeight: 700, color: '#1a3a6b', borderBottom: '1px solid #b8cede', marginTop: 2 }}>Active Allergies</div>
          <div style={{ padding: '8px 10px', fontSize: 12 }}>
            {['Penicillin — Rash', 'Sulfa — GI Upset', 'Latex — Contact'].map((a, i) => (
              <div key={i} style={{ padding: '3px 0', borderBottom: '1px solid #e4eef5', color: '#c84040' }}>{a}</div>
            ))}
          </div>
          {/* Diagnoses */}
          <div style={{ background: '#cfe0ed', padding: '6px 10px', fontSize: 12, fontWeight: 700, color: '#1a3a6b', borderBottom: '1px solid #b8cede', marginTop: 2 }}>Diagnoses</div>
          <div style={{ padding: '8px 10px', fontSize: 12 }}>
            {['F31.81 — Bipolar I, current ep. depressed', 'F41.1 — Generalized Anxiety Disorder', 'F10.20 — AUD, Moderate'].map((d, i) => (
              <div key={i} style={{ padding: '3px 0', borderBottom: '1px solid #e4eef5', color: '#333' }}>{d}</div>
            ))}
          </div>
        </div>
        {/* Note area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', background: '#fff' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#1a3a6b', marginBottom: 16 }}>Progress Note — {new Date().toLocaleDateString()}</div>
          <StackedFields
            noteValues={noteValues} onNoteChange={onNoteChange} highlightedField={highlightedField}
            labelColor='#444' fontSize={13} borderColor='#ccc' minHeight={150}
          />
        </div>
        {/* Right dark navy icon sidebar 38px */}
        <div style={{ width: 38, background: '#162540', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 10, gap: 6 }}>
          {rightIcons.map((ic, i) => (
            <button key={i} style={{ width: 30, height: 30, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d={ic.d} />
              </svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. QUALIFACTS (SmartCare)
// ═══════════════════════════════════════════════════════════════════════════════
export function QualifactsBg({ noteValues = {}, onNoteChange, highlightedField }) {
  const [activeTab, setActiveTab] = useState('Note');
  const [activeNav, setActiveNav] = useState('Client');
  const tabs = ['Service', 'Note', 'Billing Diagnosis', 'Add-On Codes', 'Warnings', 'Disposition'];

  const navItems = [
    { badge: { l: 'CT', bg: '#3a8fc1' }, label: 'Consent To Share Data', hasArrow: false },
    { badge: { l: 'HO', bg: '#1d6aae' }, label: 'My Office', hasArrow: true },
    { badge: { l: 'ST', bg: '#1d6aae' }, label: 'Shared Treatment Plan', hasArrow: false },
    { badge: { l: 'CL', bg: '#1d6aae' }, label: 'Client', hasArrow: true },
    { badge: { l: 'CF', bg: '#7a6a5a' }, label: 'Client Funds', hasArrow: false },
    { badge: { l: 'SL', bg: '#4a6a9a' }, label: 'SmartLinks', hasArrow: false },
  ];

  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: 13, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#e8edf5' }}>
      {/* Top header */}
      <div style={{ background: '#fff', borderBottom: '3px solid #f5a623', display: 'flex', alignItems: 'center', padding: '0 14px', height: 48, gap: 8, flexShrink: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1, marginRight: 8 }}>
          <span style={{ fontWeight: 800, fontSize: 16, color: '#1a3a6b', fontStyle: 'italic' }}>SmartCare™</span>
          <span style={{ fontSize: 7, color: '#888', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 500 }}>Behavioral Health EHR</span>
        </div>
        {[
          <svg key="s" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
          <svg key="h" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>,
          <svg key="u" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
        ].map((ic, i) => (
          <button key={i} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '3px 5px', display: 'flex', alignItems: 'center' }}>{ic}</button>
        ))}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#222' }}>Webb, Marcus (10234)</span>
        </div>
      </div>
      {/* Body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <div style={{ width: 338, background: '#fff', borderRight: '1px solid #dde1e7', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #eee', padding: '6px 12px 0' }}>
            {[
              <svg key="u" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1d6aae" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
              <svg key="h" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>,
              <svg key="g" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
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
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: 4, background: item.badge.bg, color: '#fff', fontSize: 9, fontWeight: 800, flexShrink: 0 }}>{item.badge.l}</span>
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
            {/* Effective row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderBottom: '1px solid #eee' }}>
              <label style={{ fontSize: 12, color: '#555' }}>Effective</label>
              <input defaultValue="04/10/2026" style={{ border: '1px solid #bbb', borderRadius: 3, padding: '4px 8px', fontSize: 12, width: 100 }} readOnly />
              <label style={{ fontSize: 12, color: '#555', marginLeft: 12 }}>Status</label>
              <input defaultValue="New" style={{ border: '1px solid #bbb', borderRadius: 3, padding: '4px 8px', fontSize: 12, width: 120 }} readOnly />
              <label style={{ fontSize: 12, color: '#555', marginLeft: 12 }}>Author</label>
              <input defaultValue="Eleos Clinician" style={{ border: '1px solid #bbb', borderRadius: 3, padding: '4px 8px', fontSize: 12, flex: 1 }} readOnly />
            </div>
            {/* Tabs */}
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
            {/* Note content */}
            <div style={{ padding: '16px 14px' }}>
              {activeTab === 'Note' ? (
                <StackedFields noteValues={noteValues} onNoteChange={onNoteChange} highlightedField={highlightedField} labelColor='#444' fontSize={12} borderColor='#ccc' minHeight={140} />
              ) : activeTab === 'Service' ? (
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1a2b4a', marginBottom: 14 }}>Service</div>
                  {[['Status', 'Show'], ['Program', ''], ['Location', ''], ['Mode Of Delivery', ''], ['Transportation Service', 'No']].map(([lbl, val]) => (
                    <div key={lbl} style={{ display: 'flex', alignItems: 'center', marginBottom: 10, gap: 6 }}>
                      <label style={{ width: 160, flexShrink: 0, fontSize: 12, color: '#444' }}>{lbl}</label>
                      <input defaultValue={val} style={{ flex: 1, border: '1px solid #bbb', borderRadius: 3, padding: '4px 8px', fontSize: 12 }} readOnly />
                    </div>
                  ))}
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
  const [activeNav, setActiveNav] = useState('Clients');
  const navItems = [
    { label: 'Clients', icon: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 7a4 4 0 100 8' },
    { label: 'Scheduling', icon: 'M3 4h18 M3 8h18 M3 12h18 M3 16h12' },
    { label: 'Foster Care', icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z' },
    { label: 'Reporting', icon: 'M18 20V10 M12 20V4 M6 20v-6' },
    { label: 'RX', icon: 'M9 12h6 M12 9v6 M3 12a9 9 0 1018 0 9 9 0 00-18 0' },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily: "'Segoe UI', Arial, sans-serif", fontSize: 13, display: 'flex', overflow: 'hidden' }}>
      {/* Dark teal sidebar */}
      <div style={{ width: 200, background: '#3d5a73', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        {/* Logo */}
        <div style={{ padding: '16px 14px 12px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
          <div style={{ width: 28, height: 28, background: '#f5a623', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          </div>
          <span style={{ fontWeight: 800, fontSize: 17, color: '#fff', letterSpacing: '0.03em' }}>Arize</span>
        </div>
        {/* Nav */}
        {navItems.map(item => (
          <button key={item.label} onClick={() => setActiveNav(item.label)} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px',
            border: 'none', background: activeNav === item.label ? 'rgba(255,255,255,0.15)' : 'transparent',
            cursor: 'pointer', color: '#fff', fontSize: 13, textAlign: 'left', width: '100%',
            borderLeft: activeNav === item.label ? '3px solid #f5a623' : '3px solid transparent',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              {item.icon.split(' M').map((seg, i) => <path key={i} d={i === 0 ? seg : 'M' + seg} />)}
            </svg>
            {item.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ padding: '12px 14px', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>v4.2.1 · Eleos Clinician</div>
      </div>
      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#f4f7fa' }}>
        {/* Top bar */}
        <div style={{ background: '#fff', borderBottom: '1px solid #e0e8f0', display: 'flex', alignItems: 'center', padding: '0 18px', height: 52, gap: 12, flexShrink: 0 }}>
          <div style={{ position: 'relative', flex: '0 0 260px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)' }}><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input placeholder="Search clients..." style={{ width: '100%', padding: '8px 10px 8px 30px', border: '1px solid #e0e8f0', borderRadius: 6, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ flex: 1 }} />
          {[
            { count: '3', color: '#e84040' },
            { count: '7', color: '#f5a623' },
          ].map((badge, i) => (
            <div key={i} style={{ position: 'relative', cursor: 'pointer' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.8"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
              <div style={{ position: 'absolute', top: -5, right: -5, background: badge.color, color: '#fff', borderRadius: '50%', width: 14, height: 14, fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{badge.count}</div>
            </div>
          ))}
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#3d5a73', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
          </div>
        </div>
        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#1a2b4a', marginBottom: 4 }}>Progress Note</div>
          <div style={{ fontSize: 13, color: '#888', marginBottom: 20 }}>Webb, Marcus · Individual Therapy · {new Date().toLocaleDateString()}</div>
          <StackedFields noteValues={noteValues} onNoteChange={onNoteChange} highlightedField={highlightedField} labelColor='#555' fontSize={13} borderColor='#d0d8e4' minHeight={175} borderRadius={5} />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. ECHO (echoVantage)
// ═══════════════════════════════════════════════════════════════════════════════
export function EchoBg({ noteValues = {}, onNoteChange, highlightedField }) {
  const [activeTab, setActiveTab] = useState('DATA/INTERVENTION');
  const tabs = ['GOALS/OBJECTIVES', 'DATA/INTERVENTION'];
  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily: "'Segoe UI', Arial, sans-serif", fontSize: 13, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Dark brown header */}
      <div style={{ background: '#3a3028', display: 'flex', alignItems: 'center', padding: '0 14px', height: 46, gap: 10, flexShrink: 0 }}>
        {/* Gold diamond logo */}
        <svg width="28" height="28" viewBox="0 0 28 28">
          <polygon points="14,2 26,14 14,26 2,14" fill="none" stroke="#c8a84a" strokeWidth="2"/>
          <polygon points="14,6 22,14 14,22 6,14" fill="#c8a84a" opacity="0.3"/>
        </svg>
        <span style={{ fontWeight: 700, fontSize: 15, color: '#e8d8a8', letterSpacing: '0.04em' }}>echoVantage</span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: '#b8a888' }}>00032414 Test, Test, Jr</span>
        <button style={{ background: '#c8a84a', color: '#3a3028', border: 'none', borderRadius: 4, padding: '4px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer', marginLeft: 10 }}>SIGN</button>
        <button style={{ background: '#5a8a5a', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>SEND</button>
        <button style={{ background: 'transparent', color: '#b8a888', border: '1px solid #6a5a48', borderRadius: 4, padding: '4px 10px', fontSize: 13, cursor: 'pointer' }}>✕</button>
      </div>
      {/* Body */}
      <div style={{ flex: 1, background: '#5c4f45', display: 'flex', overflow: 'hidden' }}>
        {/* Dark brown icon sidebar */}
        <div style={{ width: 46, background: '#4a3e34', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 10, gap: 8, flexShrink: 0 }}>
          {[
            'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z',
            'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 7a4 4 0 100 8',
            'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6',
            'M3 4h18 M3 8h18 M3 12h18',
            'M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9',
            'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4 M16 17l5-5-5-5 M21 12H9',
          ].map((d, i) => (
            <button key={i} style={{ width: 34, height: 34, background: 'rgba(255,255,255,0.07)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(220,200,170,0.7)" strokeWidth="1.7" strokeLinecap="round">
                {d.split(' M').map((seg, j) => <path key={j} d={j === 0 ? seg : 'M' + seg} />)}
              </svg>
            </button>
          ))}
        </div>
        {/* White floating panel */}
        <div style={{ flex: 1, display: 'flex', padding: '14px', overflow: 'hidden' }}>
          <div style={{ background: '#fff', flex: 1, borderRadius: 6, boxShadow: '0 4px 20px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Patient name bar */}
            <div style={{ background: '#f4ede4', padding: '8px 14px', borderBottom: '1px solid #e0d4c4', fontSize: 13, fontWeight: 600, color: '#4a3a2a' }}>
              00032414 Test, Test, Jr · Individual Therapy · {new Date().toLocaleDateString()}
            </div>
            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #e0d4c4', background: '#f8f2ea' }}>
              {tabs.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{
                  padding: '8px 16px', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                  background: activeTab === tab ? '#fff' : 'transparent',
                  color: activeTab === tab ? '#3a3028' : '#7a6a58',
                  borderBottom: activeTab === tab ? '2px solid #c8a84a' : '2px solid transparent',
                }}>{tab}</button>
              ))}
            </div>
            {/* Note fields */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px' }}>
              <StackedFields noteValues={noteValues} onNoteChange={onNoteChange} highlightedField={highlightedField} labelColor='#5a4a38' fontSize={13} borderColor='#d8ccc0' minHeight={150} borderRadius={3} bg='#faf7f3' />
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
  const [activeIndex, setActiveIndex] = useState('Narrative');
  const indexItems = ['Narrative', 'Send Copy To', 'Signatures'];
  const quickLinks = ['Treatment Plan', 'Prior Note', 'Labs', 'Medications', 'Allergies', 'Diagnoses', 'Auth/Cert'];
  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily: "Arial, 'Helvetica Neue', sans-serif", fontSize: 13, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#fff' }}>
      {/* Orange gradient nav buttons */}
      <div style={{ background: 'linear-gradient(180deg, #e8e0d0 0%, #d8cfc0 100%)', padding: '6px 10px', display: 'flex', gap: 4, flexShrink: 0, borderBottom: '2px solid #cc6600' }}>
        {['Back', 'Home', 'Logout', 'Help'].map(btn => (
          <button key={btn} style={{
            padding: '4px 14px', border: '1px solid #aa5500', borderRadius: 3, cursor: 'pointer', fontSize: 12,
            background: 'linear-gradient(180deg, #f8a840 0%, #e07020 100%)',
            color: '#fff', fontWeight: 700, textShadow: '0 1px 1px rgba(0,0,0,0.3)',
          }}>{btn}</button>
        ))}
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: '#664400', alignSelf: 'center' }}>Eleos Clinician · Credible BH</span>
      </div>
      {/* Cream nav bar */}
      <div style={{ background: '#f5f0e8', borderBottom: '1px solid #d8c8a8', padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <span style={{ fontWeight: 700, fontSize: 13, color: '#5a3000' }}>Change Behavioral Health Progress Note</span>
        <div style={{ flex: 1 }} />
        <button style={{ padding: '3px 10px', background: '#e07020', color: '#fff', border: 'none', borderRadius: 3, fontSize: 12, cursor: 'pointer' }}>Save</button>
        <button style={{ padding: '3px 10px', background: '#888', color: '#fff', border: 'none', borderRadius: 3, fontSize: 12, cursor: 'pointer' }}>Cancel</button>
      </div>
      {/* Case info bar */}
      <div style={{ background: '#fff8ee', borderBottom: '1px solid #e0c898', padding: '5px 12px', fontSize: 12, flexShrink: 0 }}>
        <span style={{ marginRight: 18 }}><strong>Case#:</strong> 10234-A</span>
        <span style={{ marginRight: 18 }}><strong>LOC:</strong> Outpatient</span>
        <span style={{ marginRight: 18 }}><strong>Program:</strong> Adult Mental Health</span>
        <span><strong>DOS:</strong> {new Date().toLocaleDateString()}</span>
      </div>
      {/* Body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left: patient info + note */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px' }}>
          {/* Patient info 3-column table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 14, fontSize: 12, border: '1px solid #c8b898' }}>
            <tbody>
              <tr style={{ background: '#f5ead8' }}>
                <td style={{ padding: '5px 8px', border: '1px solid #c8b898', fontWeight: 700, color: '#5a3000', width: '33%' }}>
                  <div>Webb, Marcus</div>
                  <div style={{ fontWeight: 400, color: '#666', marginTop: 2 }}>DOB: 03/15/1985 · (555) 234-5678</div>
                </td>
                <td style={{ padding: '5px 8px', border: '1px solid #c8b898', width: '33%' }}>
                  <div style={{ fontWeight: 700, color: '#5a3000', marginBottom: 3 }}>Current Admission</div>
                  <table style={{ width: '100%', fontSize: 11 }}>
                    <tbody>
                      {[['Admit Date', '01/15/2026'], ['Discharge', 'N/A'], ['Diagnosis', 'F31.81']].map(([k, v]) => (
                        <tr key={k}><td style={{ color: '#664400', paddingRight: 6 }}>{k}:</td><td style={{ color: '#333' }}>{v}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </td>
                <td style={{ padding: '5px 8px', border: '1px solid #c8b898', width: '33%', verticalAlign: 'top' }}>
                  <div style={{ fontWeight: 700, color: '#5a3000', marginBottom: 3 }}>Quick Links</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {quickLinks.map(l => (
                      <a key={l} href="#" onClick={e => e.preventDefault()} style={{ fontSize: 11, color: '#cc6600', textDecoration: 'underline' }}>{l}</a>
                    ))}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          {/* Note textareas */}
          <StackedFields noteValues={noteValues} onNoteChange={onNoteChange} highlightedField={highlightedField} labelColor='#664400' labelWeight={600} fontSize={12} borderColor='#c8b898' minHeight={130} borderRadius={2} bg='#fffdf8' />
        </div>
        {/* Right: Index sidebar */}
        <div style={{ width: 160, background: '#f5ead8', borderLeft: '1px solid #c8b898', flexShrink: 0, padding: '10px 0' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#5a3000', padding: '0 10px 8px', borderBottom: '1px solid #c8b898' }}>Index</div>
          {indexItems.map(item => (
            <div key={item} onClick={() => setActiveIndex(item)} style={{
              padding: '8px 10px', cursor: 'pointer', fontSize: 12,
              background: activeIndex === item ? '#e8d0a8' : 'transparent',
              color: activeIndex === item ? '#5a3000' : '#664400',
              fontWeight: activeIndex === item ? 700 : 400,
              borderBottom: '1px solid rgba(200,184,152,0.5)',
            }}>{item}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. INSYNC
// ═══════════════════════════════════════════════════════════════════════════════
export function InsyncBg({ noteValues = {}, onNoteChange, highlightedField }) {
  const [activeTab, setActiveTab] = useState('Session Progress Note');
  const sideIcons = [
    'M11 11a7 7 0 100-14 7 7 0 000 14z M21 21l-4.35-4.35',
    'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M9 13h6 M9 17h3',
    'M9 7a3 3 0 100 6 3 3 0 000-6z M2 20c0-3 3-5 7-5s7 2 7 5 M19 9a2 2 0 100 4 M19 14c2 0 4 1.5 4 3',
    'M18 20V10 M12 20V4 M6 20v-6',
    'M12 8a4 4 0 100 8 4 4 0 000-8z M4 20c0-4 3.6-7 8-7s8 3 8 7',
    'M22 12l-4 0-3 9-6-18-3 9-4 0',
    'M12 1v22 M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6',
    'M12 8a4 4 0 100 8 M4 20c0-4 3.6-7 8-7s8 3 8 7 M19 14l0 6 M16 17h6',
    'M22 12l-6 0-2 3-4-6-2 3-6 0 M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z',
    'M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z',
  ];
  const toolbarColors = ['#4a9fd4', '#4a9fd4', '#e87c3e', '#3aad6e', '#4a9fd4', '#e84a4a', '#7a6aad', '#7a8a9a', '#3ab8d4', '#7a8a9a', '#3aad6e', '#4a9fd4', '#7a8a9a', '#3ab8d4'];

  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily: "'Segoe UI', Arial, sans-serif", fontSize: 13, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#fff' }}>
      {/* Purple accent bar */}
      <div style={{ height: 6, background: '#4a1278', flexShrink: 0 }} />
      {/* Main header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '8px 16px', background: '#fff', borderBottom: '1px solid #e8e8e8', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#1c2e72', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontWeight: 900, fontSize: 17, fontFamily: 'Georgia,serif' }}>Q</span>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 13.5, color: '#1c2e72', letterSpacing: '0.06em' }}>QUALIFACTS</div>
            <div style={{ fontSize: 12, color: '#3a9fd4', fontWeight: 600 }}>insync</div>
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, border: '1px solid #ddd', borderRadius: 5, padding: '5px 10px', cursor: 'pointer' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
            <span style={{ fontSize: 12.5, color: '#333' }}>Test Provider (Prescri...</span>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2.2"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </div>
      </div>
      {/* Sub-header: Note of Session */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '6px 14px', background: '#fff', borderBottom: '1px solid #e2e8f0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, background: '#3a6fc4', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: 14, color: '#1a2540' }}>Note of Session</span>
        </div>
        <div style={{ flex: 1 }} />
        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {toolbarColors.map((bg, i) => (
            <div key={i} style={{ width: 22, height: 22, borderRadius: 3, background: bg, flexShrink: 0 }} />
          ))}
        </div>
      </div>
      {/* Content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left icon sidebar */}
        <div style={{ width: 44, background: '#fff', borderRight: '1px solid #e8edf5', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 8, gap: 1, flexShrink: 0 }}>
          {sideIcons.map((d, i) => (
            <button key={i} style={{ background: 'transparent', border: 'none', cursor: 'pointer', width: 40, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 5 }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#5a6a84" strokeWidth="1.8" strokeLinecap="round">
                {d.split(' M').map((seg, j) => <path key={j} d={j === 0 ? seg : 'M' + seg} />)}
              </svg>
            </button>
          ))}
        </div>
        {/* Main */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Patient bar */}
          <div style={{ background: '#fffde7', borderBottom: '1px solid #e8e4c0', padding: '5px 14px', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
            <div style={{ flex: '0 0 280px', height: 22, background: '#fff', border: '1px solid #ddd', borderRadius: 3, fontSize: 12, color: '#333', display: 'flex', alignItems: 'center', padding: '0 8px' }}>Webb, Marcus</div>
            <div style={{ flex: 1 }} />
            <div style={{ width: 28, height: 28, background: '#3aafd4', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            </div>
          </div>
          {/* Notes area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2.2"><polyline points="6 9 12 15 18 9"/></svg>
              <span style={{ fontWeight: 600, fontSize: 13, color: '#222' }}>General Notes</span>
            </div>
            {/* Tabs */}
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
            </div>
            {/* Fields */}
            <div style={{ display: 'flex', gap: 0, minHeight: 400 }}>
              <div style={{ flex: '0 0 53%', paddingRight: 22 }}>
                <StackedFields noteValues={noteValues} onNoteChange={onNoteChange} highlightedField={highlightedField} labelColor='#555' labelWeight={500} fontSize={13} borderColor='#d0d8e4' minHeight={175} borderRadius={5} />
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {['M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 01-3.46 0', 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10', 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6', 'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4 M16 17l5-5-5-5 M21 12H9'].map((d, i) => (
            <svg key={i} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1a2b5e" strokeWidth="1.8" strokeLinecap="round">
              {d.split(' M').map((seg, j) => <path key={j} d={j === 0 ? seg : 'M' + seg} />)}
            </svg>
          ))}
        </div>
      </div>
      {/* Nav bar */}
      <div style={{ background: '#a8bfd4', display: 'flex', alignItems: 'stretch', flexShrink: 0, borderBottom: '1px solid #8aacc8' }}>
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
          <div style={{ width: 28, height: 28, background: '#1a2b5e', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontWeight: 900, fontSize: 15, fontFamily: 'Georgia,serif' }}>W</span>
          </div>
          <span style={{ fontWeight: 700, fontSize: 14, color: '#222' }}>MyEvolv</span>
        </div>
        <div style={{ flex: 1 }} />
        <button style={{ background: '#7c3aed', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: 6, padding: '5px 14px', fontSize: 12, fontWeight: 600 }}>Share</button>
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
                <input placeholder="What can I help you find?" style={{ width: '100%', padding: '6px 8px 6px 26px', background: '#fff', border: 'none', borderRadius: 4, fontSize: 11, color: '#333', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
              {['My Clients', 'My Forms', 'My Favorites', 'Recent Forms'].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', cursor: 'pointer', color: '#cce0f0', fontSize: 13, fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span>{item}</span>
                  <span style={{ fontSize: 10, color: '#7aa8c8' }}>▶</span>
                </div>
              ))}
              <div style={{ padding: '10px 14px 4px', fontSize: 11, fontWeight: 700, color: '#7aa8c8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Control Panel</div>
              <div style={{ display: 'flex', margin: '4px 10px 0' }}>
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
        <span style={{ fontWeight: 700, fontSize: 17, color: '#fff', letterSpacing: '0.01em' }}>Kipu EMR</span>
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
              <button style={{ background: '#2db564', color: '#fff', border: 'none', borderRadius: 4, padding: '5px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>+ Golden Thread</button>
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
  const navItems = [
    { label: 'Search Client', d: 'M11 11a7 7 0 100-14 7 7 0 000 14z M21 21l-4.35-4.35' },
    { label: 'Home', d: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10' },
    { label: 'Favorites', d: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
    { label: 'Census', d: 'M3 3h18v18H3z M3 9h18 M3 15h18 M9 3v18' },
    { label: 'Charts', d: 'M9 7a3 3 0 100 6 M2 20c0-3 3-5 7-5s7 2 7 5 M19 9a2 2 0 100 4 M19 14c2 0 4 1.5 4 3' },
    { label: 'Administration', d: 'M12 8a4 4 0 100 8 M4 20c0-4 3.6-7 8-7s8 3 8 7' },
    { label: 'Reports', d: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M9 13h6 M9 17h3' },
    { label: 'Print', d: 'M6 9V2h12v7 M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2 M6 14h12v8H6z' },
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
        <span style={{ fontWeight: 700, fontSize: 16, color: '#fff', marginLeft: 14 }}>Foothold Technology</span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Webb, Marcus</span>
      </div>
      {/* Content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left sidebar */}
        <div style={{ width: 240, background: '#1e2d40', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {navItems.map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 20px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.06)', color: '#c8dae8' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b8c8d8" strokeWidth="1.8" strokeLinecap="round">
                  {item.d.split(' M').map((seg, j) => <path key={j} d={j === 0 ? seg : 'M' + seg} />)}
                </svg>
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
              <div style={{ padding: '32px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#c0c8d0', minHeight: 100 }}>
                <span style={{ fontSize: 13 }}>No Useful Links.</span>
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
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #e0e8f0', fontWeight: 600, fontSize: 14, color: '#1a2a3a' }}>Progress Note — Webb, Marcus</div>
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
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #4a5568', borderRadius: 4, overflow: 'hidden' }}>
          <input placeholder="Client Search" style={{ padding: '6px 10px', background: 'transparent', border: 'none', fontSize: 13, color: '#fff', outline: 'none', width: 180 }} />
          <button style={{ background: '#4a5568', border: 'none', cursor: 'pointer', padding: '6px 10px' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2.2"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
// 13–16. PLACEHOLDER EHRs
// ═══════════════════════════════════════════════════════════════════════════════
function PlaceholderBg({ name, headerColor, noteValues = {}, onNoteChange, highlightedField }) {
  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily: "'Segoe UI', Arial, sans-serif", fontSize: 13, background: '#f8f9fa', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ background: headerColor, padding: '10px 18px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>{name}</span>
        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Webb, Marcus — Progress Note</span>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
        <StackedFields noteValues={noteValues} onNoteChange={onNoteChange} highlightedField={highlightedField} labelColor='#555' fontSize={13} borderColor='#ccc' minHeight={110} borderRadius={4} />
      </div>
    </div>
  );
}

export function NetsmartBg(props) { return <PlaceholderBg name="Netsmart" headerColor="#1a4a7a" {...props} />; }
export function PCEBg(props) { return <PlaceholderBg name="PCE" headerColor="#2a6a3a" {...props} />; }
export function EleosLiteBg(props) { return <PlaceholderBg name="Eleos Lite" headerColor="#1a3560" {...props} />; }
export function StreamlineBg(props) { return <PlaceholderBg name="Streamline" headerColor="#4a3a7a" {...props} />; }

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
