/**
 * Stars / sparkle icon used in EnhanceInlineButton.
 * Rendered gold (#F9B534) on the lavender button.
 */

export const STARS_VIEWBOX = '0 0 24 24';

/** Large 4-pointed sparkle star (center) */
export const STAR_LARGE =
  'M12 2 L13.2 9.8 L21 11 L13.2 12.2 L12 20 L10.8 12.2 L3 11 L10.8 9.8 Z';

/** Small star — upper right */
export const STAR_SM_TR =
  'M18 3 L18.55 5.45 L21 6 L18.55 6.55 L18 9 L17.45 6.55 L15 6 L17.45 5.45 Z';

/** Small star — lower left */
export const STAR_SM_BL =
  'M6 15 L6.45 16.85 L8.3 17.3 L6.45 17.75 L6 19.6 L5.55 17.75 L3.7 17.3 L5.55 16.85 Z';

export const STARS_PATHS = [STAR_LARGE, STAR_SM_TR, STAR_SM_BL] as const;
