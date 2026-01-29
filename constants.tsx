
import { House, HouseTheme } from './types';

export const HOUSE_THEMES: Record<House, HouseTheme> = {
  Gryffindor: {
    primary: '#740001',
    secondary: '#ae0001',
    accent: '#d3a625',
    gradient: 'from-red-900 to-red-700'
  },
  Slytherin: {
    primary: '#1a472a',
    secondary: '#2a623d',
    accent: '#5d5d5d',
    gradient: 'from-green-900 to-green-700'
  },
  Ravenclaw: {
    primary: '#0e1a40',
    secondary: '#222f5b',
    accent: '#946b2d',
    gradient: 'from-blue-900 to-blue-800'
  },
  Hufflepuff: {
    primary: '#ecb939',
    secondary: '#f0c75e',
    accent: '#372e29',
    gradient: 'from-yellow-600 to-yellow-500'
  }
};

// Placeholder weekly word list
// Format: 52 weeks of the year. 
// Every Sunday at midnight, the word rotates based on ISO week.
// Updated: Week 5 (index 4) is now "HARRY" as requested for 2026.
export const WEEKLY_WORDS = [
  "WITCH", "BROOM", "STAGS", "SNAKE", "HARRY", "WANDS", "CLOAK", "OWLRY",
  "ALBUS", "POTER", "SNAPE", "DOBBY", "CHARM", "SPELL", "QUAFF", "SNICH",
  "DRACO", "LUNAS", "SIRUS", "REMUS", "GHOST", "TROLL", "GIANT", "FLAME",
  "BOOKY", "HEART", "SOULS", "KINGS", "CROSS", "MAGIC", "HOUSE", "TRAIN",
  "PLATY", "CROWD", "HAGRD", "CEDRC", "TONKS", "MOONY", "PADFT", "PRONG",
  "WOLFS", "DEATH", "HALLOW", "ELDER", "STONE", "POINT", "DIARY", "FANGS",
  "STORM", "LIGHT", "STARS", "DARKN"
];
