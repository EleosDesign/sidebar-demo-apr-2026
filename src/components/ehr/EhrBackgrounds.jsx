/**
 * EhrBackgrounds.jsx
 * Named exports for each EHR background used in the Eleos demo.
 * Each component: position absolute, inset 0, accepts { noteValues, onNoteChange, highlightedField }
 * Patient: Webb, Marcus
 */
import React, { useState } from 'react';

// ── Shared note-field keys ────────────────────────────────────────────────────
const FIELDS = [
  { key: 'Data/Goal:',                         label: 'Data/Goal:',                         height: 80 },
  { key: 'Intervention/Response:',             label: 'Intervention/Response:',             height: 72 },
  { key: 'Assessment/Level of Participation:', label: 'Assessment/Level of Participation:', height: 60 },
  { key: 'Plan:',                              label: 'Plan:',                               height: 56, placeholder: 'Continue weekly individual therapy...' },
];

// ── Generic label-column note fields (used by most EHRs) ─────────────────────
function LabelNoteField({ label, value, onChange, height, highlighted, placeholder, labelWidth = 190, fontSize = 11, labelBg = '#fff', borderColor = '#ddd' }) {
  return (
    <div style={{ borderBottom: `1px solid ${borderColor}`, display: 'flex', transition: 'background 0.3s', background: highlighted ? '#fffde7' : 'transparent' }}>
      <div style={{ width: labelWidth, padding: '6px 8px', color: '#333', borderRight: `1px solid ${borderColor}`, flexShrink: 0, fontSize, background: labelBg }}>{label}</div>
      <div style={{ flex: 1 }}>
        <textarea
          value={value ?? ''}
          onChange={e => onChange?.(e.target.value)}
          placeholder={placeholder || ''}
          style={{ width: '100%', height, padding: '5px 6px', fontSize, color: '#111', lineHeight: 1.5, resize: 'none', border: 'none', outline: 'none', background: 'transparent', fontFamily: 'inherit', boxSizing: 'border-box' }}
        />
      </div>
    </div>
  );
}

function StandardNoteFields({ noteValues = {}, onNoteChange, highlightedField, labelWidth, fontSize, labelBg, borderColor }) {
  return (
    <div>
      {FIELDS.map(f => (
        <LabelNoteField
          key={f.key}
          label={f.label}
          value={noteValues[f.key]}
          onChange={v => onNoteChange?.(f.key, v)}
          height={f.height}
          highlighted={highlightedField === f.key}
          placeholder={f.placeholder}
          labelWidth={labelWidth}
          fontSize={fontSize}
          labelBg={labelBg}
          borderColor={borderColor}
        />
      ))}
    </div>
  );
}

// Simple stacked textarea fields (for EHRs that show label above textarea)
function StackedNoteFields({ noteValues = {}, onNoteChange, highlightedField, labelColor = '#555', borderRadius = 4, borderColor = '#ccc', minHeight = 100 }) {
  return (
    <div style={{ padding: '0 0 12px' }}>
      {FIELDS.map(f => (
        <div key={f.key} style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 12, color: labelColor, marginBottom: 5, fontWeight: 500 }}>{f.label}</div>
          <textarea
            value={noteValues[f.key] ?? ''}
            onChange={e => onNoteChange?.(f.key, e.target.value)}
            placeholder={f.placeholder || 'Type here or use the cards on the right to build your note'}
            style={{
              width: '100%', minHeight, padding: '8px 10px',
              border: `1px solid ${borderColor}`,
              borderRadius,
              borderLeft: highlightedField === f.key ? '3px solid #f5a623' : `1px solid ${borderColor}`,
              background: highlightedField === f.key ? '#fffde7' : '#fff',
              resize: 'vertical', fontSize: 12, color: '#222',
              fontFamily: 'inherit', outline: 'none', lineHeight: 1.6,
              boxSizing: 'border-box', transition: 'background 0.3s',
            }}
          />
        </div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// WELLIGENT
// ══════════════════════════════════════════════════════════════════════════════
function WelligentDropdownGrid() {
  const DGFIELDS = ['Suicidal Ideation Present:', 'Homicidal Ideation Present:', 'Safety Concerns Present:'];
  const [vals, setVals] = useState({ 'Suicidal Ideation Present:': 'No', 'Homicidal Ideation Present:': 'No', 'Safety Concerns Present:': 'No' });
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderTop: '1px solid #ddd', marginTop: 4 }}>
      {DGFIELDS.map(label => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', padding: '6px 8px', borderBottom: '1px solid #ddd', borderRight: '1px solid #ddd' }}>
          <span style={{ flex: 1, color: '#333', fontSize: 11 }}>{label}</span>
          <select value={vals[label]} onChange={e => setVals(p => ({ ...p, [label]: e.target.value }))}
            style={{ border: '1px solid #aaa', borderRadius: 2, padding: '1px 4px', background: '#fff', fontSize: 11, cursor: 'pointer', outline: 'none' }}>
            <option>No</option><option>Yes</option><option>Unknown</option>
          </select>
        </div>
      ))}
    </div>
  );
}

function WelligentSideSection({ title, icon, children }) {
  return (
    <div style={{ borderBottom: '1px solid #bbb' }}>
      <div style={{ background: '#d6eaf8', padding: '4px 8px', fontWeight: 'bold', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, borderBottom: '1px solid #bbb' }}>
        <span style={{ fontSize: 10 }}>{icon}</span> {title}
      </div>
      {children}
    </div>
  );
}

export function WelligentBg({ noteValues = {}, onNoteChange, highlightedField }) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#f0f0f0', fontFamily: 'Arial, sans-serif', fontSize: 12, color: '#222', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ background: '#1a5276', padding: '5px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ background: '#2e86c1', borderRadius: 3, padding: '2px 6px', color: 'white', fontWeight: 'bold', fontSize: 11 }}>■</div>
          <span style={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}>Session Notes — Webb, Marcus</span>
          <span style={{ color: '#aed6f1', fontSize: 11 }}>🚩 💬 $</span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {['Other »', 'Print', 'Close'].map(b => (
            <div key={b} style={{ background: '#d5d8dc', borderRadius: 3, padding: '2px 8px', fontSize: 11, cursor: 'default', border: '1px solid #aaa' }}>{b}</div>
          ))}
        </div>
      </div>
      {/* Tab bar */}
      <div style={{ background: '#2e86c1', display: 'flex', gap: 2, padding: '0 8px', flexShrink: 0 }}>
        {['View/Enter Appointment Details', 'Enter Notes', 'Complete Paperwork', 'Approval/Signatures'].map(tab => (
          <div key={tab} style={{ padding: '5px 12px', fontSize: 11, cursor: 'default', borderRadius: '3px 3px 0 0', marginTop: 4, background: tab === 'Enter Notes' ? '#e67e22' : '#1a5276', color: 'white', fontWeight: tab === 'Enter Notes' ? 'bold' : 'normal' }}>{tab}</div>
        ))}
      </div>
      {/* Body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left panel */}
        <div style={{ width: 240, borderRight: '1px solid #bbb', background: '#fafafa', overflowY: 'auto', flexShrink: 0 }}>
          <WelligentSideSection title="Active Medications" icon="💊">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
              <thead><tr style={{ background: '#eaf2ff', borderBottom: '1px solid #ccc' }}>
                <th style={{ textAlign: 'left', padding: '3px 4px', fontWeight: 'normal', color: '#555' }}>Medication</th>
                <th style={{ textAlign: 'left', padding: '3px 4px', fontWeight: 'normal', color: '#555' }}>Sig</th>
                <th style={{ textAlign: 'right', padding: '3px 4px', fontWeight: 'normal', color: '#555' }}>Qty</th>
              </tr></thead>
              <tbody>
                {[
                  { med: 'Escitalopram 10 mg', sig: '1 tab daily', qty: '30/3' },
                  { med: 'Buspirone 10 mg',    sig: '1 tab BID',   qty: '60/2' },
                  { med: 'Hydroxyzine 25 mg',  sig: 'PRN anxiety', qty: '30/0' },
                  { med: 'Melatonin 5 mg',     sig: 'QHS PRN',     qty: '--'   },
                ].map(({ med, sig, qty }) => (
                  <tr key={med} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '3px 4px' }}><span style={{ color: '#7f0000', marginRight: 3, fontSize: 10 }}>℞</span>{med}</td>
                    <td style={{ padding: '3px 4px', color: '#555' }}>{sig}</td>
                    <td style={{ padding: '3px 4px', textAlign: 'right', color: '#555' }}>{qty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ padding: '4px 6px' }}><span style={{ color: '#1a5276', textDecoration: 'underline', fontSize: 11 }}>Copy All to Note</span></div>
          </WelligentSideSection>
          <WelligentSideSection title="Active Allergies" icon="⚠">
            {['Penicillin', 'Sulfa drugs'].map(a => (
              <div key={a} style={{ padding: '3px 8px', borderBottom: '1px solid #eee', fontSize: 11 }}><span style={{ color: '#555', marginRight: 4 }}>◉</span>{a}</div>
            ))}
          </WelligentSideSection>
          <WelligentSideSection title="Diagnoses" icon="👤">
            {[
              { code: 'F41.1',  desc: 'Generalized Anxiety Disorder' },
              { code: 'Z56.0',  desc: 'Problems related to employment' },
              { code: 'F43.22', desc: 'Adjustment disorder w/ anxiety' },
            ].map(({ code, desc }) => (
              <div key={code} style={{ padding: '3px 8px', borderBottom: '1px solid #eee', fontSize: 11, display: 'flex', gap: 6 }}>
                <span style={{ color: '#555', fontSize: 10 }}>◉</span>
                <span><strong>{code}</strong> {desc}</span>
              </div>
            ))}
          </WelligentSideSection>
        </div>
        {/* Note area */}
        <div style={{ flex: 1, overflowY: 'auto', background: 'white' }}>
          <div style={{ padding: '6px 10px', borderBottom: '1px solid #ddd', background: '#f8f9fa' }}>
            <span style={{ fontWeight: 'bold', fontSize: 12 }}><span style={{ color: '#27ae60', marginRight: 5 }}>●</span>Progress Note</span>
          </div>
          <div style={{ padding: '0 10px 12px' }}>
            {FIELDS.map(f => (
              <LabelNoteField key={f.key} label={f.label} value={noteValues[f.key]} onChange={v => onNoteChange?.(f.key, v)} height={f.height} highlighted={highlightedField === f.key} placeholder={f.placeholder} labelWidth={200} fontSize={11} />
            ))}
            <WelligentDropdownGrid />
          </div>
        </div>
        {/* Right icon strip */}
        <div style={{ width: 28, background: '#ecf0f1', borderLeft: '1px solid #ccc', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 8, gap: 12 }}>
          {['♥', '✎', '🚗', '↑', '↓', '≡'].map((ic, i) => <div key={i} style={{ fontSize: 13, color: '#7f8c8d' }}>{ic}</div>)}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// QUALIFACTS (SmartCare)
// ══════════════════════════════════════════════════════════════════════════════
export function QualifactsBg({ noteValues = {}, onNoteChange, highlightedField }) {
  const [activeTab, setActiveTab] = useState('Note');
  const tabs = ['Service', 'Note', 'Billing Diagnosis', 'Add-On Codes', 'Warnings', 'Disposition'];
  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: 13, background: '#e8edf5', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '3px solid #f5a623', display: 'flex', alignItems: 'center', padding: '0 14px', height: 48, gap: 8, flexShrink: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1, userSelect: 'none' }}>
          <span style={{ fontWeight: 800, fontSize: 16, color: '#1a3a6b', fontStyle: 'italic' }}>SmartCare™</span>
          <span style={{ fontSize: 7, color: '#888', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 500 }}>Behavioral Health EHR</span>
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#222' }}>Webb, Marcus (1099) · Individual Therapy</span>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#555' }}>Tal Cohen</span>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#1a3a6b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>TC</div>
        </div>
      </div>
      {/* Tabs */}
      <div style={{ display: 'flex', background: '#fff', borderBottom: '1px solid #ddd', flexShrink: 0 }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{ padding: '10px 14px', border: 'none', cursor: 'pointer', fontSize: 13, background: 'transparent', borderBottom: activeTab === t ? '2px solid #f5a623' : '2px solid transparent', color: activeTab === t ? '#1a3a6b' : '#555', fontWeight: activeTab === t ? 600 : 400 }}>
            {t}
          </button>
        ))}
      </div>
      {/* Content */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left nav */}
        <div style={{ width: 56, background: '#1a3a6b', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 8, gap: 6, flexShrink: 0 }}>
          {[
            'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z',
            'M17 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 7a4 4 0 100 8',
            'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
          ].map((d, i) => (
            <div key={i} style={{ padding: '8px 6px', cursor: 'pointer' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.7" strokeLinecap="round"><path d={d}/></svg>
            </div>
          ))}
        </div>
        {/* Main note area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', background: '#fff' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1a3a6b', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid #eee' }}>
            Progress Note — Webb, Marcus · Apr 10, 2026
          </div>
          <StandardNoteFields noteValues={noteValues} onNoteChange={onNoteChange} highlightedField={highlightedField} labelWidth={200} fontSize={12} borderColor="#ddd" />
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ARIZE (Cantata)
// ══════════════════════════════════════════════════════════════════════════════
export function ArizeBg({ noteValues = {}, onNoteChange, highlightedField }) {
  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: 13, display: 'flex', overflow: 'hidden' }}>
      {/* Sidebar */}
      <div style={{ width: 215, background: '#3d5a73', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '18px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>Arize</span>
            <svg width="20" height="20" viewBox="0 0 24 24"><path d="M13 2L4 14h7l-1 8 10-12h-7z" fill="#f5c518" stroke="#f5c518" strokeWidth="0.5" strokeLinejoin="round"/></svg>
          </div>
        </div>
        <div style={{ padding: '10px 18px', borderBottom: '1px solid rgba(255,255,255,0.1)', fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>
          <span style={{ background: '#27ae60', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10, marginRight: 6 }}>Active</span>
          Webb, Marcus
        </div>
        {['Clients', 'Scheduling', 'Foster Care', 'Reporting', 'RX'].map((item, i) => (
          <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 20px', cursor: 'pointer', borderLeft: i === 0 ? '3px solid #f5c518' : '3px solid transparent', background: i === 0 ? '#2c4860' : 'transparent', color: i === 0 ? '#fff' : 'rgba(255,255,255,0.78)', fontSize: 15 }}>
            {item}
          </div>
        ))}
      </div>
      {/* Main */}
      <div style={{ flex: 1, background: '#f4f6f8', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header bar */}
        <div style={{ background: '#fff', borderBottom: '1px solid #ddd', padding: '10px 20px', fontSize: 13, fontWeight: 600, color: '#1a2a3a', flexShrink: 0 }}>
          Progress Note — Webb, Marcus
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          <StackedNoteFields noteValues={noteValues} onNoteChange={onNoteChange} highlightedField={highlightedField} labelColor="#3d5a73" borderColor="#c8d8e4" borderRadius={3} minHeight={90} />
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ECHO (echoVantage)
// ══════════════════════════════════════════════════════════════════════════════
export function EchoBg({ noteValues = {}, onNoteChange, highlightedField }) {
  const [activeTab, setActiveTab] = useState('DATA/INTERVENTION');
  const tabs = ['DATA/INTERVENTION', 'ASSESSMENT', 'PLAN'];
  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: 13, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Top header — dark brown */}
      <div style={{ background: '#3a3028', display: 'flex', alignItems: 'center', height: 42, padding: '0 14px', gap: 10, flexShrink: 0 }}>
        <div style={{ width: 24, height: 24, borderRadius: 4, background: '#c8a96e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="12" height="12" viewBox="0 0 14 14"><path d="M7 1L13 7L7 13L1 7Z" fill="#3a3028"/></svg>
        </div>
        <span style={{ color: '#e8ddd0', fontSize: 14, fontWeight: 600 }}>echoVantage</span>
        <div style={{ flex: 1 }}/>
        <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>Webb, Marcus</span>
        <div style={{ background: '#2255a4', color: '#fff', borderRadius: 3, padding: '2px 9px', fontSize: 12, fontWeight: 700 }}>37</div>
      </div>
      {/* Sub-header — medium brown */}
      <div style={{ background: '#6b5c4e', display: 'flex', alignItems: 'center', padding: '0 14px', height: 36, gap: 10, flexShrink: 0 }}>
        {['Assessments', 'Services', 'Documents', 'TX Plans'].map((m, i) => (
          <span key={m} style={{ color: i === 1 ? '#f5d48a' : 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: i === 1 ? 600 : 400, cursor: 'pointer', borderBottom: i === 1 ? '2px solid #f5d48a' : '2px solid transparent', padding: '4px 0' }}>{m}</span>
        ))}
      </div>
      {/* Tabs */}
      <div style={{ background: '#f5f0e8', borderBottom: '1px solid #d8cfc4', display: 'flex', flexShrink: 0 }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{ padding: '9px 16px', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: activeTab === t ? 700 : 400, background: activeTab === t ? '#fff' : 'transparent', color: activeTab === t ? '#3a3028' : '#7a6a5a', borderBottom: activeTab === t ? '2px solid #c8a96e' : '2px solid transparent' }}>
            {t}
          </button>
        ))}
      </div>
      {/* Note area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', background: '#fff' }}>
        <StandardNoteFields noteValues={noteValues} onNoteChange={onNoteChange} highlightedField={highlightedField} labelWidth={210} fontSize={12} labelBg="#fdfaf6" borderColor="#d8cfc4" />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// CREDIBLE
// ══════════════════════════════════════════════════════════════════════════════
export function CredibleBg({ noteValues = {}, onNoteChange, highlightedField }) {
  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily: 'Arial, sans-serif', fontSize: 13, background: '#fff', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Nav bar */}
      <div style={{ background: '#f5f0e8', borderBottom: '2px solid #cc6600', display: 'flex', alignItems: 'center', padding: '5px 8px', gap: 3, flexShrink: 0 }}>
        {['Back', 'Home', 'Logout', 'Help'].map(label => (
          <button key={label} style={{ background: 'linear-gradient(to bottom,#f7aa50,#df7a18)', border: '1px solid #a85800', borderRadius: 3, color: '#fff', fontWeight: 700, fontSize: 12, padding: '4px 14px', cursor: 'pointer' }}>
            {label}
          </button>
        ))}
        <div style={{ flex: 1, textAlign: 'right', paddingRight: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>Change Behavioral Health Progress Note</span>
        </div>
      </div>
      {/* Case bar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #ccc', display: 'flex', alignItems: 'center', padding: '5px 14px', gap: 32, flexShrink: 0, fontSize: 13 }}>
        <span><b>Case #: </b><span style={{ color: '#1a5cb5' }}>000002</span></span>
        <span><b>Patient: </b>Webb, Marcus</span>
        <span><b>Case: </b><span style={{ color: '#cc6600', fontWeight: 700 }}>Open</span></span>
      </div>
      {/* Main */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
        <div style={{ border: '1px solid #cc6600', borderRadius: 3, marginBottom: 16, overflow: 'hidden' }}>
          <div style={{ background: '#f5f0e8', padding: '6px 12px', fontWeight: 700, fontSize: 13, borderBottom: '1px solid #cc6600', color: '#7a3800' }}>Progress Note</div>
          <div style={{ padding: '4px 0', background: '#fff' }}>
            <StandardNoteFields noteValues={noteValues} onNoteChange={onNoteChange} highlightedField={highlightedField} labelWidth={220} fontSize={12} labelBg="#fdf6ee" borderColor="#ddd" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// INSYNC (Qualifacts Insync)
// ══════════════════════════════════════════════════════════════════════════════
export function InsyncBg({ noteValues = {}, onNoteChange, highlightedField }) {
  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily: "'Segoe UI', Arial, sans-serif", fontSize: 13, background: '#f5f5f7', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Purple accent bar */}
      <div style={{ height: 5, background: '#4a1278', flexShrink: 0 }}/>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', padding: '0 16px', height: 48, gap: 10, flexShrink: 0 }}>
        <span style={{ fontWeight: 800, fontSize: 14, color: '#4a1278', letterSpacing: '0.03em', textTransform: 'uppercase' }}>QUALIFACTS</span>
        <span style={{ fontWeight: 700, fontSize: 18, color: '#00aaaa', letterSpacing: '-0.5px' }}>insync</span>
        <div style={{ flex: 1 }}/>
        <span style={{ fontSize: 12, color: '#555' }}>Webb, Marcus · Individual Therapy</span>
      </div>
      {/* Sub-header */}
      <div style={{ background: '#f8f8f8', borderBottom: '1px solid #ddd', padding: '6px 16px', flexShrink: 0, fontSize: 13, fontWeight: 600, color: '#333' }}>
        Note of Session
      </div>
      {/* Tabs */}
      <div style={{ display: 'flex', background: '#fff', borderBottom: '1px solid #ddd', flexShrink: 0 }}>
        {['Session Progress Note', 'Service'].map((t, i) => (
          <button key={t} style={{ padding: '8px 16px', border: 'none', cursor: 'pointer', fontSize: 12, background: 'transparent', borderBottom: i === 0 ? '2px solid #00aaaa' : '2px solid transparent', color: i === 0 ? '#00aaaa' : '#666', fontWeight: i === 0 ? 600 : 400 }}>{t}</button>
        ))}
      </div>
      {/* Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left icon strip */}
        <div style={{ width: 44, background: '#4a1278', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 10, gap: 16, flexShrink: 0 }}>
          {['M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z', 'M17 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 7a4 4 0 100 8', 'M3 3h7v7H3z M14 3h7v7h-7z'].map((d, i) => (
            <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.7"><path d={d}/></svg>
          ))}
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px', background: '#fff' }}>
          <StackedNoteFields noteValues={noteValues} onNoteChange={onNoteChange} highlightedField={highlightedField} labelColor="#4a1278" borderColor="#d0c0e8" borderRadius={3} minHeight={85} />
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// CARELOGIC (Qualifacts Carelogic)
// ══════════════════════════════════════════════════════════════════════════════
export function CarlogicBg({ noteValues = {}, onNoteChange, highlightedField }) {
  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily: "'Segoe UI', Arial, sans-serif", fontSize: 13, background: '#d8e8f0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Purple accent */}
      <div style={{ height: 4, background: '#4a1278', flexShrink: 0 }}/>
      {/* Header */}
      <div style={{ background: '#8aacc8', display: 'flex', alignItems: 'center', padding: '8px 14px', gap: 10, flexShrink: 0 }}>
        <span style={{ fontWeight: 800, fontSize: 13, color: '#fff', letterSpacing: '0.05em', textTransform: 'uppercase' }}>QualiFacts</span>
        <span style={{ fontStyle: 'italic', fontWeight: 700, fontSize: 14, color: '#fff' }}>carelogic</span>
        <div style={{ flex: 1 }}/>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)' }}>Webb, Marcus</span>
      </div>
      {/* Nav bar */}
      <div style={{ background: '#a8bfd4', display: 'flex', alignItems: 'center', padding: '0 8px', gap: 2, flexShrink: 0 }}>
        {['Favorites ▾', 'Clients ▾', 'My Schedule', 'Reporting ▾'].map((item, i) => (
          <button key={item} style={{ padding: '7px 12px', border: 'none', cursor: 'pointer', fontSize: 12, background: i === 0 ? '#7a9db8' : 'transparent', color: '#fff', fontWeight: i === 0 ? 600 : 400, borderRadius: 2 }}>{item}</button>
        ))}
        <div style={{ flex: 1 }}/>
        <button style={{ padding: '5px 12px', background: '#1a3a6a', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600, borderRadius: 2 }}>Return to Schedule</button>
      </div>
      {/* Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left sidebar */}
        <div style={{ width: 200, background: '#b4c8d8', borderRight: '1px solid #8aa8c0', overflowY: 'auto', flexShrink: 0 }}>
          <div style={{ padding: '10px 12px', fontWeight: 700, fontSize: 12, color: '#1a3a5a', borderBottom: '1px solid #8aa8c0' }}>Clinical Progress Note (OBH)</div>
          {['Client Demographics', 'Allergies', 'Diagnoses', 'Medications'].map(item => (
            <div key={item} style={{ padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.3)', fontSize: 12, color: '#1a3a5a', cursor: 'pointer' }}>{item}</div>
          ))}
        </div>
        {/* Note area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px', background: '#f0f4f8' }}>
          <StandardNoteFields noteValues={noteValues} onNoteChange={onNoteChange} highlightedField={highlightedField} labelWidth={220} fontSize={12} labelBg="#dce8f0" borderColor="#b0c8d8" />
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MYEVOLV
// ══════════════════════════════════════════════════════════════════════════════
export function MyEvolvBg({ noteValues = {}, onNoteChange, highlightedField }) {
  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily: "'Segoe UI', Arial, sans-serif", fontSize: 13, background: '#f0f2f5', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #ddd', display: 'flex', alignItems: 'center', padding: '0 16px', height: 50, gap: 10, flexShrink: 0 }}>
        <div style={{ width: 30, height: 30, background: '#1a2a4a', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14 }}>W</div>
        <span style={{ fontSize: 16, fontWeight: 700, color: '#1a2a4a' }}>MyEvolv</span>
        <div style={{ flex: 1 }}/>
        <button style={{ background: '#8e44ad', color: '#fff', border: 'none', borderRadius: 3, padding: '5px 14px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>Share</button>
      </div>
      {/* Module nav */}
      <div style={{ background: '#1a2a4a', display: 'flex', alignItems: 'center', padding: '0 12px', height: 36, gap: 2, flexShrink: 0 }}>
        {['Dashboard', 'My Clients', 'Scheduling', 'Documentation'].map((m, i) => (
          <button key={m} style={{ padding: '4px 12px', background: i === 3 ? 'rgba(255,255,255,0.15)' : 'transparent', border: 'none', cursor: 'pointer', fontSize: 12, color: i === 3 ? '#fff' : 'rgba(255,255,255,0.7)', borderRadius: 3 }}>{m}</button>
        ))}
      </div>
      {/* Modal-style content */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', padding: '12px' }}>
        <div style={{ flex: 1, background: '#fff', borderRadius: 4, border: '1px solid #ccc', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          {/* Modal title bar */}
          <div style={{ background: '#e8edf2', padding: '8px 14px', borderBottom: '1px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <span style={{ fontWeight: 700, fontSize: 13, color: '#1a2a4a' }}>Therapy (Individual and Family) — Webb, Marcus</span>
            <div style={{ display: 'flex', gap: 6 }}>
              {['−', '□', '×'].map(c => <div key={c} style={{ width: 18, height: 18, background: '#d0d8e0', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, cursor: 'pointer' }}>{c}</div>)}
            </div>
          </div>
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            {/* Left nav */}
            <div style={{ width: 160, background: '#f8f9fa', borderRight: '1px solid #e0e4e8', overflowY: 'auto', flexShrink: 0 }}>
              {['Information', 'Therapy', 'Assessment', 'Signatures'].map((item, i) => (
                <div key={item} style={{ padding: '10px 14px', borderBottom: '1px solid #e8eaee', fontSize: 12, cursor: 'pointer', background: i === 1 ? '#1f7068' : 'transparent', color: i === 1 ? '#fff' : '#333', fontWeight: i === 1 ? 600 : 400 }}>{item}</div>
              ))}
            </div>
            {/* Note area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px' }}>
              <StackedNoteFields noteValues={noteValues} onNoteChange={onNoteChange} highlightedField={highlightedField} labelColor="#1f7068" borderColor="#b0d4d0" borderRadius={4} minHeight={85} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MYAVATAR
// ══════════════════════════════════════════════════════════════════════════════
export function MyAvatarBg({ noteValues = {}, onNoteChange, highlightedField }) {
  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily: "'Segoe UI', Arial, sans-serif", fontSize: 13, background: '#fff', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #ddd', display: 'flex', alignItems: 'center', padding: '0 14px', height: 46, gap: 10, flexShrink: 0 }}>
        {/* Teal hexagon logo */}
        <svg width="32" height="32" viewBox="0 0 32 32">
          <polygon points="16,2 28,9 28,23 16,30 4,23 4,9" fill="#00a8a8" stroke="none"/>
          <text x="16" y="21" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">mA</text>
        </svg>
        <div style={{ display: 'flex', gap: 0 }}>
          {['myDay', 'Clients', 'Schedule', 'Charts'].map((t, i) => (
            <button key={t} style={{ padding: '12px 14px', border: 'none', cursor: 'pointer', fontSize: 13, background: 'transparent', borderBottom: i === 0 ? '2px solid #1e3a5a' : '2px solid transparent', color: i === 0 ? '#1e3a5a' : '#666', fontWeight: i === 0 ? 700 : 400 }}>{t}</button>
          ))}
        </div>
        <div style={{ flex: 1 }}/>
        <span style={{ fontSize: 12, color: '#555' }}>Webb, Marcus</span>
      </div>
      {/* Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left sidebar */}
        <div style={{ width: 220, background: '#1e3a5a', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: 8, alignItems: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Advanced Client Search</span>
          </div>
          {['Dashboard', 'Progress Notes', 'Assessments', 'Treatment Plan', 'Medications'].map((item, i) => (
            <div key={item} style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 13, cursor: 'pointer', color: i === 1 ? '#fff' : 'rgba(255,255,255,0.7)', fontWeight: i === 1 ? 600 : 400, background: i === 1 ? 'rgba(255,255,255,0.08)' : 'transparent' }}>{item}</div>
          ))}
        </div>
        {/* Note area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', background: '#fff' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1e3a5a', marginBottom: 12 }}>Progress Note — Webb, Marcus</div>
          <StackedNoteFields noteValues={noteValues} onNoteChange={onNoteChange} highlightedField={highlightedField} labelColor="#1e3a5a" borderColor="#c8d8e8" borderRadius={3} minHeight={90} />
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// KIPU
// ══════════════════════════════════════════════════════════════════════════════
export function KipuBg({ noteValues = {}, onNoteChange, highlightedField }) {
  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily: "'Segoe UI', Arial, sans-serif", fontSize: 13, background: '#fff', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Purple header */}
      <div style={{ background: '#7a30b8', display: 'flex', alignItems: 'center', padding: '8px 18px', gap: 16, flexShrink: 0 }}>
        <span style={{ fontWeight: 700, fontSize: 17, color: '#fff' }}>Kipu EMR</span>
        <div style={{ flex: 1 }}/>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>Webb, Marcus</span>
      </div>
      {/* White nav */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e8e8e8', display: 'flex', flexShrink: 0 }}>
        {['Dashboard', 'Clients', 'Schedules', 'Reports', 'Help'].map((item, i) => (
          <button key={item} style={{ padding: '10px 16px', border: 'none', cursor: 'pointer', fontSize: 13, background: 'transparent', color: i === 1 ? '#7a30b8' : '#444', fontWeight: i === 1 ? 600 : 400, borderBottom: i === 1 ? '2px solid #7a30b8' : '2px solid transparent' }}>{item}</button>
        ))}
      </div>
      {/* Blue patient section */}
      <div style={{ background: '#dce8f8', borderBottom: '1px solid #c0d4ec', padding: '10px 20px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 24 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#1a3a6a' }}>Webb, Marcus</span>
        <span style={{ fontSize: 12, color: '#555' }}>DOB: 03/15/1985 · MRN: 10042</span>
        <button style={{ background: '#2db564', color: '#fff', border: 'none', borderRadius: 4, padding: '5px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', marginLeft: 'auto' }}>Golden Thread</button>
      </div>
      {/* Note area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', background: '#fff' }}>
        <StackedNoteFields noteValues={noteValues} onNoteChange={onNoteChange} highlightedField={highlightedField} labelColor="#7a30b8" borderColor="#d0b8e8" borderRadius={5} minHeight={90} />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// FOOTHOLD
// ══════════════════════════════════════════════════════════════════════════════
export function FootholdBg({ noteValues = {}, onNoteChange, highlightedField }) {
  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily: "'Segoe UI', Arial, sans-serif", fontSize: 13, background: '#fff', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Dark header */}
      <div style={{ background: '#162030', padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <svg width="32" height="24" viewBox="0 0 32 24">
          <rect x="0" y="1" width="32" height="4" rx="2" fill="#fff"/>
          <rect x="0" y="9" width="24" height="4" rx="2" fill="#fff"/>
          <rect x="0" y="17" width="16" height="4" rx="2" fill="#fff"/>
        </svg>
        <span style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>Webb, Marcus — Progress Note</span>
      </div>
      {/* Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left sidebar */}
        <div style={{ width: 220, background: '#1e2d40', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          {['Search Client', 'Home', 'Charts', 'Administration', 'Reports'].map((item, i) => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 20px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.06)', color: i === 2 ? '#fff' : '#c8dae8', background: i === 2 ? 'rgba(255,255,255,0.07)' : 'transparent', fontWeight: i === 2 ? 600 : 400, fontSize: 14 }}>
              {item}
            </div>
          ))}
          <div style={{ flex: 1 }}/>
          <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: 11, color: '#6a8aa8' }}>
            Foothold © 2026
          </div>
        </div>
        {/* Note area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', background: '#fff' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1a2a3a', margin: '0 0 16px 0' }}>Progress Note — Webb, Marcus</h3>
          <StackedNoteFields noteValues={noteValues} onNoteChange={onNoteChange} highlightedField={highlightedField} labelColor="#162030" borderColor="#c0ccd8" borderRadius={4} minHeight={90} />
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// EXYM
// ══════════════════════════════════════════════════════════════════════════════
export function ExymBg({ noteValues = {}, onNoteChange, highlightedField }) {
  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily: "'Segoe UI', Arial, sans-serif", fontSize: 13, background: '#f5f5f5', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Dark charcoal header */}
      <div style={{ background: '#2e3540', display: 'flex', alignItems: 'center', padding: '8px 16px', gap: 16, flexShrink: 0 }}>
        <span style={{ fontWeight: 800, fontSize: 18, color: '#fff', letterSpacing: '-0.5px' }}>Exym</span>
        <span style={{ fontSize: 12, color: '#9aabb8', borderLeft: '1px solid #4a5568', paddingLeft: 10 }}>Edit a Note</span>
        <div style={{ flex: 1 }}/>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>Webb, Marcus</span>
      </div>
      {/* Dark nav bar */}
      <div style={{ background: '#3a4254', display: 'flex', alignItems: 'stretch', flexShrink: 0 }}>
        {['Home', 'Clients', 'Activities', 'Documents', 'Reports', 'Admin'].map(item => (
          <button key={item} style={{ padding: '8px 13px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 12, color: '#c8d4e0' }}>{item} ▾</button>
        ))}
      </div>
      {/* Status bar */}
      <div style={{ padding: '8px 16px', background: '#fff', borderBottom: '1px solid #e8e8e8', flexShrink: 0, fontSize: 12, color: '#444' }}>
        <span style={{ fontWeight: 600 }}>Note Status:</span><span style={{ marginLeft: 8 }}>In progress</span>
        <span style={{ marginLeft: 24, fontWeight: 600 }}>Client:</span><span style={{ marginLeft: 6 }}>Webb, Marcus</span>
      </div>
      {/* Page tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #ddd', flexShrink: 0 }}>
        {['PAGE 1', 'CO-SIGNERS', 'DIAGNOSIS', 'PROBLEM LIST', 'CARE PLAN CYCLES'].map((tab, i) => (
          <button key={tab} style={{ flex: i === 0 ? '0 0 160px' : 1, padding: '9px 10px', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: i === 0 ? '#1e3a6e' : '#f0f2f5', color: i === 0 ? '#fff' : '#555', borderRight: '1px solid #ddd' }}>{tab}</button>
        ))}
      </div>
      {/* Action buttons */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '6px 16px', borderBottom: '1px solid #e8e8e8', gap: 6, flexShrink: 0 }}>
        <button style={{ padding: '5px 12px', background: '#fff', border: '1px solid #ccc', borderRadius: 3, fontSize: 11, cursor: 'pointer', color: '#333' }}>VIEW FORMATTED NOTE</button>
        <button style={{ padding: '5px 12px', background: '#fff', border: '1px solid #ccc', borderRadius: 3, fontSize: 11, cursor: 'pointer', color: '#333' }}>SAVE CHANGES</button>
        <button style={{ padding: '5px 12px', background: '#1e3a6e', border: 'none', borderRadius: 3, fontSize: 11, cursor: 'pointer', color: '#fff', fontWeight: 600 }}>--SUBMIT--</button>
      </div>
      {/* Note area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px', background: '#fff' }}>
        <StandardNoteFields noteValues={noteValues} onNoteChange={onNoteChange} highlightedField={highlightedField} labelWidth={220} fontSize={12} labelBg="#f8f9fb" borderColor="#ddd" />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PLACEHOLDER BACKGROUNDS (Netsmart, PCE, Eleos Lite, Streamline)
// ══════════════════════════════════════════════════════════════════════════════
function PlaceholderBg({ name, headerColor, noteValues, onNoteChange, highlightedField }) {
  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily: "'Segoe UI', Arial, sans-serif", fontSize: 13, background: '#f8f9fa', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ background: headerColor, padding: '10px 18px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>{name}</span>
        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Webb, Marcus — Progress Note</span>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
        <StackedNoteFields noteValues={noteValues} onNoteChange={onNoteChange} highlightedField={highlightedField} minHeight={95} />
      </div>
    </div>
  );
}

export function NetsmartBg({ noteValues, onNoteChange, highlightedField }) {
  return <PlaceholderBg name="Netsmart" headerColor="#2a6099" noteValues={noteValues} onNoteChange={onNoteChange} highlightedField={highlightedField} />;
}
export function PCEBg({ noteValues, onNoteChange, highlightedField }) {
  return <PlaceholderBg name="PCE" headerColor="#1a6e3e" noteValues={noteValues} onNoteChange={onNoteChange} highlightedField={highlightedField} />;
}
export function EleosLiteBg({ noteValues, onNoteChange, highlightedField }) {
  return <PlaceholderBg name="Eleos Lite" headerColor="#1a3560" noteValues={noteValues} onNoteChange={onNoteChange} highlightedField={highlightedField} />;
}
export function StreamlineBg({ noteValues, onNoteChange, highlightedField }) {
  return <PlaceholderBg name="Streamline" headerColor="#2d5a8e" noteValues={noteValues} onNoteChange={onNoteChange} highlightedField={highlightedField} />;
}

// ══════════════════════════════════════════════════════════════════════════════
// REGISTRY — keyed by selectedEhr value
// ══════════════════════════════════════════════════════════════════════════════
export const EHR_BACKGROUNDS = {
  welligent:  WelligentBg,
  qualifacts: QualifactsBg,
  arize:      ArizeBg,
  echo:       EchoBg,
  credible:   CredibleBg,
  insync:     InsyncBg,
  carlogic:   CarlogicBg,
  myevolve:   MyEvolvBg,
  myavatar:   MyAvatarBg,
  kipu:       KipuBg,
  foothold:   FootholdBg,
  exym:       ExymBg,
  netsmart:   NetsmartBg,
  pce:        PCEBg,
  'eleos-lite': EleosLiteBg,
  streamline: StreamlineBg,
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
