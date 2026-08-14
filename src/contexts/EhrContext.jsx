import React, { createContext, useContext, useState } from 'react';

const EhrContext = createContext({ selectedEhr: 'welligent', setSelectedEhr: () => {}, clientName: 'Webb, Marcus', setClientName: () => {} });

export const useEhrContext = () => useContext(EhrContext);

// EHR backgrounds that render the same underlying SmartCare product (ADR-0005) and
// share the Companion Sidebar's navy "SmartScribe skin" (ADR-0006).
const SMARTSCRIBE_SKIN_EHRS = new Set(['streamline', 'calmhsa']);

export const useSmartScribeSkin = () => {
  const { selectedEhr } = useEhrContext();
  return SMARTSCRIBE_SKIN_EHRS.has(selectedEhr);
};

// The single source of truth for the skin's navy — every CTA/border that swaps
// under the skin (ADR-0006, ADR-0007) should derive its color through this
// helper rather than re-deriving its own skin-active ternary.
export const SMARTSCRIBE_NAVY = '#254A67';
export const smartScribeColor = (skinActive, defaultColor = '#293D87') =>
  skinActive ? SMARTSCRIBE_NAVY : defaultColor;

const hexToRgb = (hex) => {
  const n = parseInt(hex.replace('#', ''), 16);
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
};

// Same navy, as an "r,g,b" triplet for rgba() shadow/glow tints that can't use
// smartScribeColor's hex string directly. Derived from SMARTSCRIBE_NAVY so the
// two can't drift apart.
export const SMARTSCRIBE_NAVY_RGB = hexToRgb(SMARTSCRIBE_NAVY);
export const smartScribeRgb = (skinActive, defaultRgb = '41,61,135') =>
  skinActive ? SMARTSCRIBE_NAVY_RGB : defaultRgb;

// Shared box-shadow recipe for the Enhance CTA family's lavender glow — used by
// EnhanceTooltip/InlineLaunchButton (EhrBackgrounds.jsx), EnhancePointer, and
// EnhanceInlineButton so the 5-layer shadow isn't hand-duplicated per usage site.
export const smartScribeEnhanceShadow = (skinActive, { includeOuterFade = true } = {}) => {
  const rgb = smartScribeRgb(skinActive, '41,61,135');
  const layers = [
    `0px 7.3px 14.6px 0px rgba(${rgb},0.14)`,
    `0px 25.55px 25.55px 0px rgba(${rgb},0.12)`,
    `0px 58.4px 34.675px 0px rgba(${rgb},0.07)`,
    `0px 102.2px 40.15px 0px rgba(${rgb},0.02)`,
  ];
  if (includeOuterFade) layers.push(`0px 160.6px 45.625px 0px rgba(${rgb},0)`);
  return layers.join(', ');
};

export function EhrProvider({ children }) {
  const [selectedEhr, setSelectedEhr] = useState('welligent');
  const [clientName, setClientName] = useState('Webb, Marcus');
  return (
    <EhrContext.Provider value={{ selectedEhr, setSelectedEhr, clientName, setClientName }}>
      {children}
    </EhrContext.Provider>
  );
}
