
import { WEEKLY_WORDS, ALLOWED_WORDS } from '../constants';

/**
 * Gets the current ISO week number (1-52/53)
 */
export const getWeekNumber = (d: Date): number => {
  const date = new Date(d.getTime());
  date.setHours(0, 0, 0, 0);
  // Thursday in current week decides the year.
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  // January 4 is always in week 1.
  const week1 = new Date(date.getFullYear(), 0, 4);
  // Adjust to Thursday in week 1 and count number of weeks from date to week1.
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000
                        - 3 + (week1.getDay() + 6) % 7) / 7);
};

export const getTargetWord = (): string => {
  // Der Nutzer möchte, dass das Wort dauerhaft "SNAPE" bleibt.
  return "SNAPE";
};

export const isValidWord = (word: string): boolean => {
  if (word.length !== 5) return false;
  const upper = word.toUpperCase();
  // Check against the official allowlist AND the weekly list
  return ALLOWED_WORDS.includes(upper) || WEEKLY_WORDS.includes(upper);
};
