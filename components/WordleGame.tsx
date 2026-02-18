import React, { useState, useEffect, useCallback, useRef } from 'react';
import { User, GameState, LetterStatus } from '../types';
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
    hasSubmitted: false,
  });
  const [shakeRow, setShakeRow] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [showEnterHint, setShowEnterHint] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const enterHintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const theme = HOUSE_THEMES[user.house];
  const storageKey = `wordle_state_${user.name.replace(/\s+/g, '_')}_${user.house}`;

  // Load game state
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.targetWord === targetWord) {
          setGameState(parsed.state);
          // If we already submitted in the past, reflect that in the UI
          if (parsed.state.hasSubmitted) {
            setSubmissionStatus('success');
          }
        } else {
          localStorage.removeItem(storageKey);
        }
      } catch (e) {
        console.error("Failed to load game state", e);
      }
    }
    // Auto-focus on start
    setTimeout(() => {
        inputRef.current?.focus();
    }, 100);
  }, [targetWord, storageKey]);

  // Save game state
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

  // Enter Hint Timer Logic
  useEffect(() => {
    // Clear existing timer
    if (enterHintTimerRef.current) {
      clearTimeout(enterHintTimerRef.current);
      enterHintTimerRef.current = null;
    }

    // If game is not over and we have exactly 5 letters
    if (!gameState.isGameOver && gameState.currentGuess.length === 5) {
      // Set timer for 60 seconds
      enterHintTimerRef.current = setTimeout(() => {
        setShowEnterHint(true);
      }, 60000);
    } else {
      // Otherwise hide hint immediately
      setShowEnterHint(false);
    }

    return () => {
      if (enterHintTimerRef.current) {
        clearTimeout(enterHintTimerRef.current);
      }
    };
  }, [gameState.currentGuess, gameState.isGameOver]);

  const onChar = useCallback((char: string) => {
    if (gameState.isGameOver) return;
    setGameState(prev => ({
      ...prev,
      currentGuess: prev.currentGuess.length < 5 ? prev.currentGuess + char : prev.currentGuess
    }));
  }, [gameState.isGameOver]);

  const onDelete = useCallback(() => {
    if (gameState.isGameOver) return;
    setGameState(prev => ({
      ...prev,
      currentGuess: prev.currentGuess.slice(0, -1)
    }));
  }, [gameState.isGameOver]);

  const onEnter = useCallback(() => {
    setShowEnterHint(false); // Hide hint on attempt
    if (gameState.isGameOver) return;
    
    const guess = gameState.currentGuess.toUpperCase();
    
    if (guess.length !== 5) {
      setShakeRow(gameState.guesses.length);
      setTimeout(() => setShakeRow(null), 500);
      return;
    }

    if (!isValidWord(guess)) {
      setShakeRow(gameState.guesses.length);
      setTimeout(() => setShakeRow(null), 500);
      alert("Dieses Wort kenne ich nicht!");
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

  // Handle character input via onChange to support Android/IME which often doesn't fire proper keydown events for characters
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    
    if (val.length > 0) {
      // Get the last character typed
      const lastChar = val.slice(-1).toUpperCase();
      
      // Only accept letters
      if (/^[A-Z]$/.test(lastChar)) {
        onChar(lastChar);
      }
    }
    
    // Clear input immediately to keep it ready for next char
    e.target.value = '';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (gameState.isGameOver) return;
    
    if (e.key === 'Enter') {
      e.preventDefault();
      onEnter();
    } else if (e.key === 'Backspace') {
      onDelete();
    } 
    // Character input is handled in handleInputChange
  };

  // Keep focus on hidden input
  const handleContainerClick = () => {
    if (!gameState.isGameOver) {
      inputRef.current?.focus();
    }
  };

  // Automated result submission
  useEffect(() => {
    // Only submit if: Game Over, URL exists, NOT placeholder, status is idle, AND NOT already submitted
    if (gameState.isGameOver && 
        !gameState.hasSubmitted && 
        RESULT_SUBMISSION_URL && 
        !RESULT_SUBMISSION_URL.includes('WEBHOOK_URL_HIER') && 
        submissionStatus === 'idle') {
      
      const timer = setTimeout(() => sendResults(), 1500);
      return () => clearTimeout(timer);
    }
  }, [gameState.isGameOver, gameState.hasSubmitted]);

  const sendResults = async () => {
    if (submissionStatus === 'success' || submissionStatus === 'sending') return;
    if (gameState.hasSubmitted) return; // Double check
    if (!RESULT_SUBMISSION_URL || RESULT_SUBMISSION_URL.includes('WEBHOOK_URL_HIER')) return;

    setSubmissionStatus('sending');
    
    const week = getWeekNumber(new Date());
    const emojiGrid = gameState.guesses.map(guess => {
      return guess.split('').map((letter, i) => {
        if (letter === targetWord[i]) return '🟩';
        if (targetWord.includes(letter)) return '🟧';
        return '⬛️';
      }).join('');
    }).join('\n');

    let payload: any;

    if (RESULT_SUBMISSION_URL.includes('discord.com/api/webhooks')) {
      const hexColor = parseInt(theme.primary.replace('#', ''), 16);
      payload = {
        embeds: [{
          title: `Hauspokal Wordle KW ${week}`,
          description: `**${user.name}** (${user.house}) hat das Wordle beendet!\n\n${emojiGrid}`,
          color: hexColor,
          fields: [
            { name: "Versuche", value: `${gameState.isWinner ? gameState.guesses.length : 'X'}/6`, inline: true },
            { name: "Status", value: gameState.isWinner ? "Gewonnen 🏆" : "Verloren 💀", inline: true },
            { name: "Wort", value: `||${targetWord}||`, inline: true }
          ],
          timestamp: new Date().toISOString()
        }]
      };
    } else {
      payload = {
        name: user.name,
        house: user.house,
        week: week,
        target_word: targetWord,
        attempts: gameState.guesses.length,
        status: gameState.isWinner ? 'Sieg' : 'Niederlage',
        grid_emoji: emojiGrid,
        timestamp: new Date().toISOString()
      };
    }

    try {
      const response = await fetch(RESULT_SUBMISSION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        setSubmissionStatus('success');
        // Persist that we have submitted to prevent duplicates on reload
        setGameState(prev => ({ ...prev, hasSubmitted: true }));
      } else {
        setSubmissionStatus('error');
      }
    } catch (e) {
      console.error("Submission error:", e);
      setSubmissionStatus('error');
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
    <div 
      className="h-screen w-full flex flex-col bg-[#0a0a0c] overflow-hidden select-none"
      onClick={handleContainerClick}
    >
      {/* Hidden input to trigger native keyboard. 
          Moved off-screen but kept 'visible' to browser logic to ensure events fire. 
          FontSize 16px prevents iOS zoom. 
      */}
      <input
        ref={inputRef}
        type="text"
        className="absolute top-0 left-0 opacity-0 w-full h-full cursor-default"
        style={{ fontSize: '16px', zIndex: 10 }} 
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        autoFocus
        autoCapitalize="characters"
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
        inputMode="text"
        aria-label="Wordle Eingabe"
      />

      <header className={`px-4 py-3 border-b border-white/5 flex items-center justify-between sticky top-0 z-50 glass-panel`}>
        <button onClick={onReset} className="text-white/40 hover:text-white transition-colors p-1 relative z-20">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" /></svg>
        </button>
        <div className="text-center relative z-20 pointer-events-none">
          <h1 className="font-magic text-xl tracking-widest text-amber-200">HAUSPOKAL-WORDLE</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold" style={{ color: theme.accent }}>
            {user.house} House
          </p>
        </div>
        <div className="w-8" />
      </header>

      <main className="flex-grow flex flex-col items-center justify-center relative">
        {/* Enter Hint Banner */}
        {showEnterHint && (
          <div 
            className="absolute top-4 z-40 bg-amber-500 text-black px-6 py-2 rounded-full font-bold shadow-[0_0_20px_rgba(245,158,11,0.5)] animate-bounce cursor-pointer flex items-center gap-2 pointer-events-auto"
            onClick={(e) => {
              e.stopPropagation(); // Prevent focusing input if checking container click
              setShowEnterHint(false);
            }}
          >
            <span className="text-sm tracking-wider">Drücke ENTER ↵</span>
            <span className="opacity-50 text-xl leading-none hover:opacity-100">×</span>
          </div>
        )}

        <div className="flex-grow flex items-center justify-center w-full px-4 mb-20 pointer-events-none">
          <Grid 
            guesses={gameState.guesses} 
            currentGuess={gameState.currentGuess} 
            targetWord={targetWord}
            shakeRow={shakeRow}
            isGameOver={gameState.isGameOver}
          />
        </div>

        <div className="pb-8 text-center animate-pulse pointer-events-none">
          <p className="text-white/20 text-xs tracking-widest uppercase">
            {gameState.isGameOver ? 'SPIEL BEENDET' : 'Tippe zum Schreiben...'}
          </p>
        </div>

        {gameState.isGameOver && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-6 animate-fade-in">
            <div className="glass-panel w-full max-w-sm rounded-2xl p-8 border-2 border-amber-500/30 text-center space-y-6 shadow-2xl">
              <h2 className="text-4xl font-magic text-amber-400">
                {gameState.isWinner ? 'SEHR GUT!' : 'LEIDER...'}
              </h2>
              <p className="text-slate-300">
                {gameState.isWinner 
                  ? `Herzlichen Glückwunsch, ${user.name}` 
                  : `Vielleicht klappt es beim nächsten Mal.`}
              </p>
              
              <div className="space-y-1">
                <span className="text-xs text-white/40 uppercase tracking-widest">Das Lösungswort</span>
                <div className="text-3xl font-magic text-white tracking-widest bg-white/5 py-3 rounded-lg border border-white/10">
                  {targetWord}
                </div>
              </div>

              {RESULT_SUBMISSION_URL && (
                <div className="text-[10px] uppercase tracking-widest h-4">
                  {submissionStatus === 'sending' && <span className="text-amber-200/50">Wird geloggt...</span>}
                  {submissionStatus === 'success' && <span className="text-green-500">Ergebnis übermittelt ✓</span>}
                  {submissionStatus === 'error' && (
                    <button onClick={sendResults} className="text-red-400 underline decoration-red-400/30 relative z-[101]">
                      Fehler beim Loggen - Erneut versuchen?
                    </button>
                  )}
                </div>
              )}

              <div className="pt-4 space-y-3 relative z-[101]">
                <button 
                  onClick={handleCopyResults}
                  className="w-full py-4 rounded-xl bg-white/10 text-amber-200 border border-white/10 font-bold tracking-widest flex items-center justify-center space-x-2 active:scale-95 transition-all cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                  <span>{copied ? 'KOPIERT!' : 'TEILEN'}</span>
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