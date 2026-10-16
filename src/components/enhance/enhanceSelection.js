import { ENHANCE_ERRORS } from '../../data/enhanceConfig.js';

export function validateSelection(text) {
  const words = [...new Intl.Segmenter('en', { granularity: 'word' }).segment(text)]
    .filter(segment => segment.isWordLike).length;
  return words >= 5 ? null : ENHANCE_ERRORS.short;
}

export function replaceCapturedRange(value, capture, replacement) {
  if (!capture || value !== capture.value || !Number.isInteger(capture.start) ||
      !Number.isInteger(capture.end) || capture.start < 0 ||
      capture.end <= capture.start || capture.end > value.length) return null;
  const selected = value.slice(capture.start, capture.end);
  return value.slice(0, capture.start) + selected.match(/^\s*/)[0] +
    replacement.trim() + selected.match(/\s*$/)[0] + value.slice(capture.end);
}
