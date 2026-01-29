
import React, { useState, useEffect, useCallback } from 'react';
import { User, GameState, LetterStatus, TileState } from '../types';
import { getTargetWord, getWeekNumber } from '../utils/gameUtils';
import Grid from './Grid';
import Keyboard from './Keyboard';
import MagicalHint from './MagicalHint';
import { HOUSE_THEMES } from '../constants';

interface Props {
  user: User;
  onReset: () => void;
}

const WordleGame: React.FC<Props> = ({ user, onReset }) => {
  const [targetWord] = useState(getTargetWord());
  const [gameState, setGameState] = useState<GameState>({
    guesses: [],
    currentGuess: '',
    isGameOver: false,
    isWinner: false,
  });
  const [shakeRow, setShakeRow] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const theme = HOUSE_THEMES[user.house];

  const onKeyPress = useCallback((key: string) => {
    if (gameState.isGameOver) return;

    if (key === 'ENTER') {
      if (gameState.currentGuess.length !== 5) {
        setShakeRow(gameState.guesses.length);
        setTimeout(() => setShakeRow(null), 500);
        return;
      }
      
      const newGuess = gameState.currentGuess.toUpperCase();
      const newGuesses = [...gameState.guesses, newGuess];
      const isWinner = newGuess === targetWord;
      const isGameOver = isWinner || newGuesses.length === 6;

      setGameState(prev => ({
        ...prev,
        guesses: newGuesses,
        currentGuess: '',
        isGameOver,
        isWinner
      }));
    } else if (key === 'BACKSPACE' || key === 'DELETE') {
      setGameState(prev => ({
        ...prev,
        currentGuess: prev.currentGuess.slice(0, -1)
      }));
    } else if (gameState.currentGuess.length < 5 && /^[A-Z]$/.test(key)) {
      setGameState(prev => ({
        ...prev,
        currentGuess: prev.currentGuess + key
      }));
    }
  }, [gameState, targetWord]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      if (key === 'ENTER' || key === 'BACKSPACE') {
        onKeyPress(key);
      } else if (/^[A-Z]$/.test(key)) {
        onKeyPress(key);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onKeyPress]);

  const handleCopyResults = () => {
    const week = getWeekNumber(new Date());
    const attempts = gameState.isWinner ? gameState.guesses.length : 'X';
    let shareText = `Hauspokal Wordle KW ${week}\nVersuche: ${attempts}/6\n\n`;

    const emojiGrid = gameState.guesses.map(guess => {
      return guess.split('').map((letter, i) => {
        if (letter === targetWord[i]) return '🟩';
        if (targetWord.includes(letter)) return '🟧';
        return '⬛️';
      }).join('');
    }).join('\n');

    shareText += emojiGrid;

    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="h-screen w-full flex flex-col bg-[#0a0a0c] overflow-hidden select-none">
      {/* Header */}
      <header className={`px-4 py-3 border-b border-white/5 flex items-center justify-between sticky top-0 z-50 glass-panel`}>
        <button onClick={onReset} className="text-white/40 hover:text-white transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" /></svg>
        </button>
        <div className="text-center">
          <h1 className="font-magic text-xl tracking-widest text-amber-200">HAUSPOKAL-WORDLE</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold" style={{ color: theme.accent }}>
            {user.house} House
          </p>
        </div>
        <div className="w-6" /> {/* Spacer */}
      </header>

      {/* Game Content */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 py-6 overflow-y-auto">
        <Grid 
          guesses={gameState.guesses} 
          currentGuess={gameState.currentGuess} 
          targetWord={targetWord}
          shakeRow={shakeRow}
        />
        
        {/* Magical Hint via Gemini Integration */}
        {!gameState.isGameOver && (
          <div className="mt-8 w-full max-w-[300px]">
            <MagicalHint targetWord={targetWord} house={user.house} />
          </div>
        )}

        {/* Game Over Modal / Message */}
        {gameState.isGameOver && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6 animate-fade-in">
            <div className="glass-panel w-full max-w-sm rounded-2xl p-8 border-2 border-amber-500/30 text-center space-y-6">
              <h2 className="text-4xl font-magic text-amber-400">
                {gameState.isWinner ? 'SEHR GUT!' : 'LEIDER...'}
              </h2>
              <p className="text-slate-300">
                {gameState.isWinner 
                  ? `Herzlichen Glückwunsch, ${user.name}` 
                  : `Deine Versuche sind leider aufgebraucht`}
              </p>
              <div className="space-y-1">
                <span className="text-xs text-white/40 uppercase tracking-widest">Das Wort</span>
                <div className="text-3xl font-magic text-white tracking-widest bg-white/5 py-3 rounded-lg border border-white/10">
                  {targetWord}
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <button 
                  onClick={handleCopyResults}
                  className="w-full py-4 rounded-xl bg-white/5 text-amber-200 border border-white/10 font-bold tracking-widest flex items-center justify-center space-x-2 active:scale-95 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                  <span>{copied ? 'KOPIERT!' : 'ERGEBNIS TEILEN'}</span>
                </button>

                <button 
                  onClick={onReset}
                  className="w-full py-4 rounded-xl bg-amber-500 text-black font-bold tracking-widest shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
                >
                  ABSCHLIESSEN
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Keyboard */}
      <footer className="pb-8 px-2 flex-shrink-0">
        <Keyboard 
          onKeyPress={onKeyPress} 
          guesses={gameState.guesses} 
          targetWord={targetWord} 
        />
      </footer>
    </div>
  );
};

export default WordleGame;
