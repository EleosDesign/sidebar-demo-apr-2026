/** Sparkle icon — 4-pointed star with two accent sparkles */

export const SPARKLE_VIEWBOX = '0 0 24 24';

/**
 * Large central 4-pointed sparkle star.
 * Renders as a sharp diamond-cross shape (not a polygon star).
 */
export const SPARKLE_LARGE_PATH =
  'M12 2 L13.35 9.65 L21 11 L13.35 12.35 L12 20 L10.65 12.35 L3 11 L10.65 9.65 Z';

/**
 * Small accent sparkle — upper right of the icon.
 */
export const SPARKLE_SMALL_TR_PATH =
  'M18.5 2.5 L19.1 4.9 L21.5 5.5 L19.1 6.1 L18.5 8.5 L17.9 6.1 L15.5 5.5 L17.9 4.9 Z';

/**
 * Small accent sparkle — lower left of the icon.
 */
export const SPARKLE_SMALL_BL_PATH =
  'M5.5 15.5 L6.0 17.5 L8.0 18 L6.0 18.5 L5.5 20.5 L5.0 18.5 L3.0 18 L5.0 17.5 Z';

/** Convenience array of all three sparkle paths in render order. */
export const SPARKLE_PATHS = [
  SPARKLE_LARGE_PATH,
  SPARKLE_SMALL_TR_PATH,
  SPARKLE_SMALL_BL_PATH,
] as const;

export type SparklePath = (typeof SPARKLE_PATHS)[number];
