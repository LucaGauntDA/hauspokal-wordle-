
import React, { useState, useEffect } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import WordleGame from './components/WordleGame';
import { User } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  // Persistence (optional, let's keep it simple as requested)
  useEffect(() => {
    const saved = localStorage.getItem('wizard_user');
    if (saved) {
      setUser(JSON.parse(saved));
    }
  }, []);

  const handleStart = (userData: User) => {
    setUser(userData);
    localStorage.setItem('wizard_user', JSON.stringify(userData));
  };

  const handleReset = () => {
    setUser(null);
    localStorage.removeItem('wizard_user');
  };

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
