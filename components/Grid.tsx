
import React from 'react';
import { LetterStatus } from '../types';

interface Props {
  guesses: string[];
  currentGuess: string;
  targetWord: string;
  shakeRow: number | null;
  isGameOver: boolean;
}

const Grid: React.FC<Props> = ({ guesses, currentGuess, targetWord, shakeRow, isGameOver }) => {
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
        const isCurrentRow = rowIndex === guesses.length;
        const isPastRow = rowIndex < guesses.length;
        const guess = isPastRow ? guesses[rowIndex] : (isCurrentRow ? currentGuess : '');
        const isShaking = shakeRow === rowIndex;

        return (
          <div key={rowIndex} className={`grid grid-cols-5 gap-2 ${isShaking ? 'animate-shake' : ''}`}>
            {[...Array(cols)].map((_, colIndex) => {
              const letter = guess[colIndex] || '';
              const status = isPastRow ? getStatus(letter, colIndex, guess) : LetterStatus.Initial;
              const isActiveTile = isCurrentRow && !isGameOver && colIndex === currentGuess.length;
              
              return (
                <Tile 
                  key={colIndex} 
                  letter={letter} 
                  status={status} 
                  delay={colIndex * 100} 
                  isActive={isActiveTile}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

interface TileProps {
  letter: string;
  status: LetterStatus;
  delay: number;
  isActive: boolean;
}

const Tile: React.FC<TileProps> = ({ letter, status, delay, isActive }) => {
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
        relative aspect-square flex items-center justify-center text-2xl font-bold uppercase rounded-md border-2
        transition-all duration-300
        ${letter ? 'scale-105 border-white/40' : ''}
        ${isRevealed ? 'animate-flip' : ''}
        ${isActive ? 'border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.2)]' : ''}
        ${statusColors[status]}
      `}
    >
      <span className={isRevealed ? 'animate-fade-in' : ''}>{letter}</span>
      
      {/* Blinking Cursor Indicator */}
      {isActive && (
        <div className="absolute w-[2px] h-3/5 bg-amber-400 animate-pulse-fast" />
      )}

      <style>{`
        @keyframes pulse-fast {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .animate-pulse-fast {
          animation: pulse-fast 0.8s infinite;
        }
      `}</style>
    </div>
  );
};

export default Grid;
