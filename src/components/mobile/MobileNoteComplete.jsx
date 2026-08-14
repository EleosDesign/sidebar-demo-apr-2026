import { useSmartScribeSkin, smartScribeColor } from '../../contexts/EhrContext.jsx';

const P = { fontFamily: 'Poppins, sans-serif' };

function IconCheck() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="12" fill="#46BC9E"/>
      <path d="M7 12.5L10.2 15.5L17 8.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default function MobileNoteComplete({ onGoToActivities, onStartNew }) {
  const smartScribeSkin = useSmartScribeSkin();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', background: 'white', padding: '32px 28px', boxSizing: 'border-box', textAlign: 'center' }}>
      <IconCheck />
      <p style={{ ...P, fontSize: 22, fontWeight: 600, color: '#212121', marginTop: 24, marginBottom: 8 }}>Note Complete</p>
      <p style={{ ...P, fontSize: 14, fontWeight: 400, color: 'rgba(0,0,0,0.6)', letterSpacing: '0.15px', lineHeight: 1.5, marginTop: 0, marginBottom: 36, maxWidth: 280 }}>
        Your session note has been sent to the EHR.
      </p>
      <button
        onClick={onGoToActivities}
        style={{ width: '100%', padding: '10px 22px', background: smartScribeColor(smartScribeSkin, '#2d4ccd'), color: 'white', ...P, fontWeight: 500, fontSize: 15, border: 'none', borderRadius: 4, cursor: 'pointer', letterSpacing: '0.46px', lineHeight: '26px', boxShadow: '0px 1px 5px rgba(0,0,0,0.12),0px 2px 2px rgba(0,0,0,0.14),0px 3px 1px -2px rgba(0,0,0,0.2)', marginBottom: 12 }}
      >
        Go to Mobile Activities List
      </button>
      <button
        onClick={onStartNew}
        style={{ width: '100%', padding: '10px 22px', background: 'white', color: smartScribeColor(smartScribeSkin, '#2d4ccd'), ...P, fontWeight: 500, fontSize: 15, border: `1.5px solid ${smartScribeColor(smartScribeSkin, '#2d4ccd')}`, borderRadius: 4, cursor: 'pointer', letterSpacing: '0.46px', lineHeight: '26px' }}
      >
        Enter New Summary
      </button>
    </div>
  );
}
