
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
  // Wunschgemäß bleibt "HARRY" vorerst die aktuelle Lösung
  // Später kann hier wieder die wochenbasierte Auswahl aktiviert werden:
  // const week = getWeekNumber(new Date());
  // return WEEKLY_WORDS[(week - 1) % WEEKLY_WORDS.length].toUpperCase();
  return "HARRY";
};

export const isValidWord = (word: string): boolean => {
  if (word.length !== 5) return false;
  // Check against the official allowlist
  return ALLOWED_WORDS.includes(word.toUpperCase());
};
