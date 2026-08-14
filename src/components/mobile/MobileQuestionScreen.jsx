import { useSmartScribeSkin, smartScribeColor, smartScribeRgb } from '../../contexts/EhrContext.jsx';

const P = { fontFamily: 'Poppins, sans-serif' };

function IconBack() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="rgba(0,0,0,0.87)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function OptionRow({ label, checked, multi, onToggle }) {
  const smartScribeSkin = useSmartScribeSkin();
  return (
    <button
      onClick={onToggle}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 12,
        background: checked ? `rgba(${smartScribeRgb(smartScribeSkin, '45,76,205')},0.06)` : 'white',
        border: `1.5px solid ${checked ? smartScribeColor(smartScribeSkin, '#2d4ccd') : 'rgba(33,33,33,0.23)'}`,
        borderRadius: 8, padding: '12px 14px', marginBottom: 10,
        cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s, border-color 0.15s',
      }}
    >
      <span style={{
        width: 20, height: 20, flexShrink: 0,
        borderRadius: multi ? 5 : '50%',
        border: `1.5px solid ${checked ? smartScribeColor(smartScribeSkin, '#2d4ccd') : 'rgba(33,33,33,0.38)'}`,
        background: checked ? smartScribeColor(smartScribeSkin, '#2d4ccd') : 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {checked && multi && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M4 12l5 5L20 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
        {checked && !multi && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }} />}
      </span>
      <span style={{ ...P, fontSize: 15, fontWeight: 400, color: 'rgba(0,0,0,0.87)', letterSpacing: '0.15px', lineHeight: 1.4 }}>{label}</span>
    </button>
  );
}

export default function MobileQuestionScreen({
  screen, stepIndex, totalSteps, value, onChange, otherValue, onOtherChange,
  onBack, onNext, onSkip, isLast, compactMode,
}) {
  const smartScribeSkin = useSmartScribeSkin();
  const multi = screen.type === 'multi';
  const selected = multi ? (value || []) : value;
  const showOther = screen.allowOtherText && (multi ? selected.includes('Other') : selected === 'Other');

  const toggle = (opt) => {
    if (multi) {
      onChange(selected.includes(opt) ? selected.filter(o => o !== opt) : [...selected, opt]);
    } else {
      onChange(opt);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#EAEDFA', position: 'relative' }}>
      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid rgba(0,0,0,0.12)', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
          <IconBack />
        </button>
        <span style={{ ...P, fontSize: 13, fontWeight: 500, color: 'rgba(0,0,0,0.54)', letterSpacing: '0.4px' }}>
          Step {stepIndex + 1} of {totalSteps}
        </span>
        <span style={{ width: 24 }} />
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 110px' }}>
        <p style={{ ...P, fontSize: compactMode ? 16 : 18, fontWeight: 600, color: '#212121', letterSpacing: '0.1px', marginTop: 0, marginBottom: 16 }}>
          {screen.title}
        </p>
        {screen.options.map(opt => (
          <OptionRow
            key={opt}
            label={opt}
            multi={multi}
            checked={multi ? selected.includes(opt) : selected === opt}
            onToggle={() => toggle(opt)}
          />
        ))}
        {showOther && (
          <input
            value={otherValue}
            onChange={e => onOtherChange(e.target.value)}
            placeholder="Describe other..."
            style={{ ...P, width: '100%', boxSizing: 'border-box', border: '1.5px solid rgba(33,33,33,0.23)', borderRadius: 8, padding: '10px 14px', fontSize: 15, marginTop: 4, outline: 'none' }}
          />
        )}
      </div>

      {/* Bottom CTA */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#EAEDFA', padding: '16px 24px 12px', boxShadow: '0px -1px 3px rgba(0,0,0,0.12),0px -1px 1px rgba(0,0,0,0.05)' }}>
        <button
          onClick={onNext}
          style={{ width: '100%', padding: '8px 22px', background: smartScribeColor(smartScribeSkin, '#2d4ccd'), color: 'white', ...P, fontWeight: 500, fontSize: 15, border: 'none', borderRadius: 4, cursor: 'pointer', letterSpacing: '0.46px', lineHeight: '26px', boxShadow: '0px 1px 5px rgba(0,0,0,0.12),0px 2px 2px rgba(0,0,0,0.14),0px 3px 1px -2px rgba(0,0,0,0.2)' }}
        >
          {isLast ? 'Finish' : 'Next'}
        </button>
        <div style={{ textAlign: 'center', marginTop: 10, marginBottom: 4 }}>
          <span onClick={onSkip} style={{ ...P, fontSize: 13, fontWeight: 500, color: smartScribeColor(smartScribeSkin, '#2d4ccd'), letterSpacing: '0.46px', lineHeight: '22px', cursor: 'pointer' }}>
            Skip to suggestions
          </span>
        </div>
      </div>
    </div>
  );
}
