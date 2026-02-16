
import { WEEKLY_WORDS, ALLOWED_WORDS } from '../constants';

/**
 * Gets the current ISO week number (1-52/53)
 */
export const getWeekNumber = (d: Date): number => {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return weekNo;
};

export const getTargetWord = (): string => {
  // Als zufälliges Wort aus der Liste wurde SNAPE gewählt.
  // Sobald du die wöchentliche Liste schickst, aktivieren wir die Datums-Logik.
  return "SNAPE";
};

export const isValidWord = (word: string): boolean => {
  if (word.length !== 5) return false;
  // Check against the official allowlist
  return ALLOWED_WORDS.includes(word.toUpperCase());
};
