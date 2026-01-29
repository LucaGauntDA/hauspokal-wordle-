
import { WEEKLY_WORDS } from '../constants';

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
  const week = getWeekNumber(new Date());
  // Use modulo to wrap around if word list is shorter than 52
  return WEEKLY_WORDS[(week - 1) % WEEKLY_WORDS.length].toUpperCase();
};

export const isValidWord = (word: string): boolean => {
  // In a real app, check against a large dictionary. 
  // For this custom version, we allow any 5 letters for easier placeholder use,
  // or restrict to a small list if provided.
  return word.length === 5;
};
