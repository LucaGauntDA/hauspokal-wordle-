
import React, { useState, useEffect } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import WordleGame from './components/WordleGame';
import { User } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('wizard_user');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved user", e);
      }
    }
    setIsLoaded(true);
  }, []);

  const handleStart = (userData: User) => {
    setUser(userData);
    localStorage.setItem('wizard_user', JSON.stringify(userData));
  };

  const handleReset = () => {
    setUser(null);
    localStorage.removeItem('wizard_user');
    // Also clear game state when user resets profile
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('wordle_state_')) {
        localStorage.removeItem(key);
      }
    });
  };

  if (!isLoaded) return <div className="min-h-screen bg-[#0a0a0c]" />;

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0a0a0c] text-slate-200">
      {!user ? (
        <WelcomeScreen onStart={handleStart} />
      ) : (
        <WordleGame user={user} onReset={handleReset} />
      )}
    </div>
  );
};

export default App;
