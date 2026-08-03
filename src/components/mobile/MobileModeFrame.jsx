function IconX() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M3 3L15 15M15 3L3 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

export default function MobileModeFrame({ onExit, children }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(20, 22, 30, 0.72)',
        pointerEvents: 'auto',
      }}
    >
      <button
        onClick={onExit}
        aria-label="Exit mobile mode"
        style={{
          position: 'absolute',
          top: 20,
          right: 24,
          width: 36,
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          border: 'none',
          background: 'rgba(255,255,255,0.12)',
          color: 'white',
          cursor: 'pointer',
        }}
      >
        <IconX />
      </button>
      <div
        style={{
          width: 390,
          maxWidth: '100vw',
          height: 'min(844px, 100vh - 64px)',
          maxHeight: '100vh',
          borderRadius: 32,
          overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(0,0,0,0.45)',
          background: 'white',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        {children}
      </div>
    </div>
  );
}
