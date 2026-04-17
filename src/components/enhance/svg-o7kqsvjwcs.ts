/** Magic wand icon — wand stick with star sparkle at tip */

export const WAND_VIEWBOX = '0 0 24 24';

/**
 * Wand body — diagonal line from lower-left handle to upper-right tip,
 * with a rounded rectangular grip at the base.
 */
export const WAND_STICK_PATH =
  'M3 21 L14.5 9.5 M13 11 L15 9 C15.8 8.2 15.8 6.9 15 6.1 L17.9 3.2 C18.7 2.4 20 2.4 20.8 3.2 L20.8 3.2 C21.6 4 21.6 5.3 20.8 6.1 L17.9 9 C17.1 9.8 15.8 9.8 15 9 Z';

/**
 * Small 4-pointed sparkle star at the wand tip area.
 */
export const WAND_STAR_PATH =
  'M10 4 L10.6 6.4 L13 7 L10.6 7.6 L10 10 L9.4 7.6 L7 7 L9.4 6.4 Z';

/**
 * Tiny dot accents near the wand tip.
 */
export const WAND_DOT_ACCENTS: Array<{ cx: number; cy: number; r: number }> = [
  { cx: 19.5, cy: 2.5, r: 0.8 },
  { cx: 17,   cy: 6,   r: 0.5 },
];

/**
 * Convenience array of all wand stroke paths in render order.
 * (Dot accents are rendered separately as <circle> elements.)
 */
export const WAND_PATHS = [WAND_STICK_PATH, WAND_STAR_PATH] as const;

export type WandPath = (typeof WAND_PATHS)[number];
