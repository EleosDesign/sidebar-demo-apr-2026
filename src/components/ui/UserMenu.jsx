import { useState, useRef, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { useEhrNoteHeadersContext } from '../../contexts/EhrNoteHeadersContext.jsx';
import { useMobileModeContext } from '../../contexts/MobileModeContext.jsx';

function IconCard() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="2" y="4" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <line x1="2" y1="7.5" x2="16" y2="7.5" stroke="currentColor" strokeWidth="1.5"/>
      <line x1="5" y1="11" x2="8" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function IconWand() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M2 16L10 8M10 8L13 3L15 5L10 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/>
      <path d="M13.5 1.5L14.5 3.5M16 5L14 5.5M15.5 2.5L16.5 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

function IconBook() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M9 4.5V15M9 4.5C9 4.5 7 3 4 3C3.4 3 3 3.4 3 4V14C3 14.6 3.4 15 4 15C7 15 9 16.5 9 16.5M9 4.5C9 4.5 11 3 14 3C14.6 3 15 3.4 15 4V14C15 14.6 14.6 15 14 15C11 15 9 16.5 9 16.5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  );
}

function IconBriefcase() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="2" y="6" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M6 6V4.5C6 3.7 6.7 3 7.5 3H10.5C11.3 3 12 3.7 12 4.5V6" stroke="currentColor" strokeWidth="1.5"/>
      <line x1="2" y1="11" x2="16" y2="11" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  );
}

function IconGrid() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="2" y="2" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="10" y="2" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="2" y="10" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="10" y="10" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  );
}

function IconPhone() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="4.5" y="1.5" width="9" height="15" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="9" cy="14" r="1" fill="currentColor"/>
    </svg>
  );
}

function Toggle({ on }) {
  return (
    <span
      style={{
        position: 'relative',
        display: 'inline-flex',
        flexShrink: 0,
        borderRadius: 999,
        width: 36,
        height: 20,
        backgroundColor: on ? 'var(--primary, #2D4CCD)' : 'rgba(0,0,0,0.15)',
        transition: 'background-color 0.2s',
      }}
    >
      <span
        style={{
          display: 'block',
          width: 16,
          height: 16,
          marginTop: 2,
          borderRadius: '50%',
          background: 'white',
          boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
          transform: on ? 'translateX(18px)' : 'translateX(2px)',
          transition: 'transform 0.2s',
        }}
      />
    </span>
  );
}

export default function UserMenu() {
  const [open, setOpen] = useState(false);
  const { useEhrNoteHeaders, setUseEhrNoteHeaders } = useEhrNoteHeadersContext();
  const { enterMobileMode } = useMobileModeContext();
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, right: 0 });

  const updatePos = useCallback(() => {
    if (buttonRef.current) {
      const r = buttonRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 4, right: window.innerWidth - r.right });
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePos();
    function handleOutside(e) {
      if (
        buttonRef.current && !buttonRef.current.contains(e.target) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target)
      ) setOpen(false);
    }
    document.addEventListener('mousedown', handleOutside);
    window.addEventListener('scroll', updatePos, true);
    window.addEventListener('resize', updatePos);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      window.removeEventListener('scroll', updatePos, true);
      window.removeEventListener('resize', updatePos);
    };
  }, [open, updatePos]);

  const items = [
    { icon: <IconCard />, label: 'Refer to me as', onClick: () => setOpen(false) },
    { icon: <IconWand />, label: 'Enhance', onClick: () => setOpen(false) },
    {
      icon: <IconBook />, label: 'Use My EHR Note Headers',
      toggle: true, toggled: useEhrNoteHeaders,
      onClick: () => setUseEhrNoteHeaders(!useEhrNoteHeaders),
    },
    {
      icon: <IconBriefcase />, label: 'Management Hub',
      onClick: () => { setOpen(false); window.open('https://eleos-management-hub.figma.site/', '_blank'); },
    },
    {
      icon: <IconGrid />, label: 'Dashboards',
      onClick: () => { setOpen(false); window.open('https://eleos-compliance.figma.site/', '_blank'); },
    },
    {
      icon: <IconPhone />, label: 'Mobile',
      onClick: () => { setOpen(false); enterMobileMode(); },
    },
  ];

  const menuStyle = {
    position: 'fixed',
    top: pos.top,
    right: pos.right,
    zIndex: 9999,
    background: 'white',
    border: '1px solid rgba(0,0,0,0.12)',
    borderRadius: 8,
    boxShadow: '0px 2px 8px rgba(0,0,0,0.15)',
    minWidth: 220,
    overflow: 'hidden',
    fontFamily: 'Poppins, sans-serif',
  };

  const itemStyle = {
    width: '100%', display: 'flex', alignItems: 'center', gap: 12,
    padding: '10px 16px', background: 'transparent', border: 'none',
    cursor: 'pointer', textAlign: 'left', color: 'rgba(0,0,0,0.87)',
    fontSize: 14, fontFamily: 'inherit',
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        ref={buttonRef}
        onClick={() => setOpen(o => !o)}
        aria-label="User menu"
        aria-expanded={open}
        style={{
          display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer',
          background: 'transparent', border: 'none', padding: '4px 0',
          borderRadius: 16,
        }}
      >
        {/* Avatar — same SVG as original FigmaUserAvatar */}
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
      </button>

      {open && ReactDOM.createPortal(
        <div ref={dropdownRef} style={menuStyle}>
          {items.map(item => (
            <button key={item.label} onClick={item.onClick} style={itemStyle}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.04)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ color: 'rgba(0,0,0,0.56)', display: 'flex', flexShrink: 0 }}>
                {item.icon}
              </span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.toggle && <Toggle on={item.toggled} />}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}
