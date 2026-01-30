
import React, { useState } from 'react';
import { House, User } from '../types';
import { HOUSE_THEMES } from '../constants';

interface Props {
  onStart: (user: User) => void;
}

const WelcomeScreen: React.FC<Props> = ({ onStart }) => {
  const [name, setName] = useState('');
  const [selectedHouse, setSelectedHouse] = useState<House | null>(null);

  const houses: House[] = ['Gryffindor', 'Slytherin', 'Ravenclaw', 'Hufflepuff'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && selectedHouse) {
      onStart({ name, house: selectedHouse });
    }
  };

  // Helper to get hex to rgba for the glow effect
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return (
    <div className="w-full max-w-md px-6 flex flex-col items-center space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <h1 className="text-5xl font-magic tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-amber-200 to-amber-500">
          HAUSPOKAL WORDLE
        </h1>
        <p className="text-slate-400 font-light italic text-sm">Spiele hier das Wordle-Game des DA-Hauspokals, inspiriert von der New York Times</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full space-y-8">
        <div className="space-y-2">
          <label className="text-sm font-semibold tracking-widest text-amber-200/60 uppercase ml-1">Dein Name</label>
          <input
            required
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Dein Name"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all text-xl"
          />
        </div>

        <div className="space-y-4">
          <label className="text-sm font-semibold tracking-widest text-amber-200/60 uppercase ml-1">Hogwarts-Haus</label>
          <div className="grid grid-cols-2 gap-3">
            {houses.map((house) => {
              const theme = HOUSE_THEMES[house];
              const isSelected = selectedHouse === house;
              const borderColor = isSelected ? theme.accent : 'transparent';
              const shadowColor = isSelected ? hexToRgba(theme.accent, 0.4) : 'transparent';

              return (
                <button
                  key={house}
                  type="button"
                  onClick={() => setSelectedHouse(house)}
                  className={`
                    relative overflow-hidden group py-4 rounded-xl border-2 transition-all duration-300
                    ${isSelected 
                      ? `scale-105` 
                      : 'border-white/5 opacity-60 hover:opacity-100 hover:border-white/20'}
                  `}
                  style={{
                    background: `linear-gradient(135deg, ${theme.primary}aa, ${theme.secondary}88)`,
                    borderColor: isSelected ? theme.accent : undefined,
                    boxShadow: isSelected ? `0 0 20px ${shadowColor}` : undefined
                  }}
                >
                  <span className="relative z-10 font-magic text-sm tracking-wider drop-shadow-md">
                    {house}
                  </span>
                  {isSelected && (
                     <div className="absolute inset-0 bg-white/10 animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <button
          disabled={!name || !selectedHouse}
          type="submit"
          className={`
            w-full py-5 rounded-full font-magic text-xl tracking-widest transition-all duration-500
            ${name && selectedHouse 
              ? 'bg-amber-500 text-[#0a0a0c] hover:bg-amber-400 cursor-pointer shadow-lg shadow-amber-500/20' 
              : 'bg-white/5 text-white/20 cursor-not-allowed'}
          `}
        >
          SPIELEN
        </button>
      </form>

      <p className="text-xs text-slate-600 font-light mt-4">
        Jede Woche kannst du ein neues Hauspokal-Wordle spielen.
      </p>
    </div>
  );
};

export default WelcomeScreen;
