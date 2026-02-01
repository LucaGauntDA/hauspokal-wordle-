
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { User, GameState } from '../types';
import { getTargetWord, getWeekNumber, isValidWord } from '../utils/gameUtils';
import Grid from './Grid';
import { HOUSE_THEMES, RESULT_SUBMISSION_URL } from '../constants';

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
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const inputRef = useRef<HTMLInputElement>(null);

  const theme = HOUSE_THEMES[user.house];
  const storageKey = `wordle_state_${user.name.replace(/\s+/g, '_')}_${user.house}`;

  // Load game state on mount
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Only restore if it's the same word
        if (parsed.targetWord === targetWord) {
          setGameState(parsed.state);
        } else {
          // New word detected! Clear old game state for this user
          localStorage.removeItem(storageKey);
        }
      } catch (e) {
        console.error("Failed to load game state", e);
      }
    }
  }, [targetWord, storageKey]);

  // Save game state whenever it changes
  useEffect(() => {
    if (gameState.guesses.length > 0 || gameState.isGameOver) {
      const dataToSave = {
        targetWord,
        state: gameState,
        timestamp: new Date().getTime()
      };
      localStorage.setItem(storageKey, JSON.stringify(dataToSave));
    }
  }, [gameState, targetWord, storageKey]);

  const submitGuess = useCallback(() => {
    if (gameState.isGameOver) return;
    
    const guess = gameState.currentGuess.toUpperCase();
    
    if (guess.length !== 5 || !isValidWord(guess)) {
      setShakeRow(gameState.guesses.length);
      setTimeout(() => setShakeRow(null), 500);
      return;
    }
    
    const newGuesses = [...gameState.guesses, guess];
    const isWinner = guess === targetWord;
    const isGameOver = isWinner || newGuesses.length === 6;

    setGameState(prev => ({
      ...prev,
      guesses: newGuesses,
      currentGuess: '',
      isGameOver,
      isWinner
    }));
  }, [gameState, targetWord]);

  useEffect(() => {
    if (gameState.isGameOver && RESULT_SUBMISSION_URL) {
      // Small delay to ensure state is committed before potentially sending
      const timer = setTimeout(() => {
        sendResults();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [gameState.isGameOver]);

  const sendResults = async () => {
    // Prevent double submission if already successful
    if (submissionStatus === 'success') return;

    setSubmissionStatus('sending');
    const week = getWeekNumber(new Date());
    
    const emojiGrid = gameState.guesses.map(guess => {
      return guess.split('').map((letter, i) => {
        if (letter === targetWord[i]) return '🟩';
        if (targetWord.includes(letter)) return '🟧';
        return '⬛️';
      }).join('');
    }).join('\n');

    const payload = {
      name: user.name,
      house: user.house,
      week: week,
      word: targetWord,
      attempts: gameState.guesses.length,
      status: gameState.isWinner ? 'Sieg' : 'Niederlage',
      guesses: gameState.guesses.join(', '),
      grid: emojiGrid,
      timestamp: new Date().toISOString()
    };

    try {
      const response = await fetch(RESULT_SUBMISSION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        setSubmissionStatus('success');
      } else {
        setSubmissionStatus('error');
      }
    } catch (e) {
      console.error("Submission failed", e);
      setSubmissionStatus('error');
    }
  };

  const focusInput = () => {
    if (!gameState.isGameOver) {
      inputRef.current?.focus();
    }
  };

  useEffect(() => {
    focusInput();
    const handleGlobalClick = () => focusInput();
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [gameState.isGameOver]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (gameState.isGameOver) return;
    const val = e.target.value.toUpperCase().replace(/[^A-Z]/g, '');
    setGameState(prev => ({
      ...prev,
      currentGuess: val.slice(0, 5)
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      submitGuess();
    }
  };

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
    <div className="h-screen w-full flex flex-col bg-[#0a0a0c] overflow-hidden select-none" onClick={focusInput}>
      <input
        ref={inputRef}
        type="text"
        value={gameState.currentGuess}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        className="absolute opacity-0 pointer-events-none"
        autoFocus
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck="false"
      />

      <header className={`px-4 py-3 border-b border-white/5 flex items-center justify-between sticky top-0 z-50 glass-panel`}>
        <button onClick={onReset} title="Profil wechseln" className="text-white/40 hover:text-white transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" /></svg>
        </button>
        <div className="text-center">
          <h1 className="font-magic text-xl tracking-widest text-amber-200">HAUSPOKAL-WORDLE</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold" style={{ color: theme.accent }}>
            {user.house} House
          </p>
        </div>
        <div className="w-6" />
      </header>

      <main className="flex-grow flex flex-col items-center justify-start pt-10 px-4 overflow-y-auto">
        <Grid 
          guesses={gameState.guesses} 
          currentGuess={gameState.currentGuess} 
          targetWord={targetWord}
          shakeRow={shakeRow}
          isGameOver={gameState.isGameOver}
        />
        
        {!gameState.isGameOver && (
          <p className="text-[10px] text-center text-white/20 mt-8 uppercase tracking-widest">
            Nutze deine Tastatur zum Tippen
          </p>
        )}

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

              {RESULT_SUBMISSION_URL && (
                <div className="text-[10px] uppercase tracking-widest">
                  {submissionStatus === 'sending' && <span className="text-amber-200/50">Wird geloggt...</span>}
                  {submissionStatus === 'success' && <span className="text-green-500">Ergebnis übermittelt ✓</span>}
                  {submissionStatus === 'error' && (
                    <button onClick={sendResults} className="text-red-400 underline decoration-red-400/30">
                      Fehler beim Loggen - Erneut versuchen?
                    </button>
                  )}
                </div>
              )}

              <div className="pt-4 space-y-3">
                <button 
                  onClick={handleCopyResults}
                  className="w-full py-4 rounded-xl bg-white/5 text-amber-200 border border-white/10 font-bold tracking-widest flex items-center justify-center space-x-2 active:scale-95 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                  <span>{copied ? 'KOPIERT!' : 'ERGEBNIS TEILEN'}</span>
                </button>

                <button 
                  onClick={() => {
                    // Simple refresh of the screen logic, keeping the user
                    window.location.reload();
                  }}
                  className="w-full py-4 rounded-xl bg-amber-500 text-black font-bold tracking-widest shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
                >
                  BEENDEN
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default WordleGame;
