
import React from 'react';
import { LetterStatus } from '../types';

interface Props {
  guesses: string[];
  currentGuess: string;
  targetWord: string;
  shakeRow: number | null;
}

const Grid: React.FC<Props> = ({ guesses, currentGuess, targetWord, shakeRow }) => {
  const rows = 6;
  const cols = 5;

  const getStatus = (letter: string, index: number, guess: string): LetterStatus => {
    if (letter === targetWord[index]) return LetterStatus.Correct;
    if (targetWord.includes(letter)) return LetterStatus.Present;
    return LetterStatus.Absent;
  };

  return (
    <div className="grid grid-rows-6 gap-2 w-full max-w-[320px]">
      {[...Array(rows)].map((_, rowIndex) => {
        const isCurrent = rowIndex === guesses.length;
        const isPast = rowIndex < guesses.length;
        const guess = isPast ? guesses[rowIndex] : (isCurrent ? currentGuess : '');
        const isShaking = shakeRow === rowIndex;

        return (
          <div key={rowIndex} className={`grid grid-cols-5 gap-2 ${isShaking ? 'animate-shake' : ''}`}>
            {[...Array(cols)].map((_, colIndex) => {
              const letter = guess[colIndex] || '';
              const status = isPast ? getStatus(letter, colIndex, guess) : LetterStatus.Initial;
              
              return (
                <Tile key={colIndex} letter={letter} status={status} delay={colIndex * 100} />
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

const Tile: React.FC<{ letter: string; status: LetterStatus; delay: number }> = ({ letter, status, delay }) => {
  const statusColors = {
    [LetterStatus.Initial]: 'border-white/10 bg-transparent',
    [LetterStatus.Absent]: 'border-transparent bg-slate-800 text-slate-500',
    [LetterStatus.Present]: 'border-transparent bg-amber-600 text-white',
    [LetterStatus.Correct]: 'border-transparent bg-green-700 text-white shadow-[0_0_15px_rgba(21,128,61,0.5)]',
  };

  const isRevealed = status !== LetterStatus.Initial;

  return (
    <div
      style={{ animationDelay: `${delay}ms` }}
      className={`
        aspect-square flex items-center justify-center text-2xl font-bold uppercase rounded-md border-2
        transition-all duration-500
        ${letter ? 'scale-105 border-white/30' : ''}
        ${isRevealed ? 'animate-flip' : ''}
        ${statusColors[status]}
      `}
    >
      <span className={isRevealed ? 'animate-fade-in' : ''}>{letter}</span>
    </div>
  );
};

export default Grid;
