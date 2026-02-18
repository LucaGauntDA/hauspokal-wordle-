
export type House = 'Gryffindor' | 'Slytherin' | 'Ravenclaw' | 'Hufflepuff';

export interface User {
  name: string;
  house: House;
}

export enum LetterStatus {
  Initial = 'initial',
  Absent = 'absent',
  Present = 'present',
  Correct = 'correct'
}

export interface TileState {
  letter: string;
  status: LetterStatus;
}

export interface GameState {
  guesses: string[];
  currentGuess: string;
  isGameOver: boolean;
  isWinner: boolean;
  hasSubmitted?: boolean;
}

export interface HouseTheme {
  primary: string;
  secondary: string;
  accent: string;
  gradient: string;
}
