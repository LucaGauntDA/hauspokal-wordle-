
import React from 'react';
import { LetterStatus } from '../types';

interface Props {
  onKeyPress: (key: string) => void;
  guesses: string[];
  targetWord: string;
}

const Keyboard: React.FC<Props> = ({ onKeyPress, guesses, targetWord }) => {
  const rows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
  ];

  const getKeyStatus = (key: string): LetterStatus => {
    let bestStatus = LetterStatus.Initial;
    
    guesses.forEach(guess => {
      for (let i = 0; i < guess.length; i++) {
        if (guess[i] === key) {
          if (targetWord[i] === key) {
            bestStatus = LetterStatus.Correct;
            return;
          }
          if (targetWord.includes(key) && bestStatus !== LetterStatus.Correct) {
            bestStatus = LetterStatus.Present;
          } else if (bestStatus === LetterStatus.Initial) {
            bestStatus = LetterStatus.Absent;
          }
        }
      }
    });

    return bestStatus;
  };

  return (
    <div className="flex flex-col gap-2 w-full max-w-[480px] mx-auto">
      {rows.map((row, i) => (
        <div key={i} className="flex justify-center gap-1.5">
          {row.map((key) => {
            const status = getKeyStatus(key);
            const isControl = key.length > 1;
            
            return (
              <button
                key={key}
                onClick={() => onKeyPress(key)}
                className={`
                  flex items-center justify-center rounded-md text-sm font-bold uppercase transition-all active:scale-95 touch-manipulation
                  ${isControl ? 'px-3 h-14 bg-slate-700/50' : 'w-9 h-14'}
                  ${status === LetterStatus.Correct ? 'bg-green-700' : ''}
                  ${status === LetterStatus.Present ? 'bg-amber-600' : ''}
                  ${status === LetterStatus.Absent ? 'bg-slate-800 text-slate-600' : 'bg-slate-700 text-white'}
                  ${status === LetterStatus.Initial && !isControl ? 'hover:bg-slate-600' : ''}
                `}
              >
                {key === 'BACKSPACE' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" /></svg>
                ) : key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default Keyboard;
