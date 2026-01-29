
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { House } from '../types';

interface Props {
  targetWord: string;
  house: House;
}

const MagicalHint: React.FC<Props> = ({ targetWord, house }) => {
  const [hint, setHint] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchHint = async () => {
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `You are the Sorting Hat or a Professor from Hogwarts. Provide a cryptic, magical, one-sentence hint for the word "${targetWord}" for a ${house} student. Do not mention the word itself. Use Wizarding World lore.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
            temperature: 0.9,
            maxOutputTokens: 100,
        }
      });
      
      setHint(response.text?.trim() || "The crystal ball is clouded...");
    } catch (error) {
      console.error("Magic failed:", error);
      setHint("The owls are lost in the storm...");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-3">
      {!hint && !loading ? (
        <button
          onClick={fetchHint}
          className="text-xs font-magic tracking-widest text-amber-500/60 hover:text-amber-400 flex items-center space-y-1 group"
        >
          <span className="border-b border-amber-500/20 group-hover:border-amber-400/50 pb-1">CONSULT THE ORACLE</span>
        </button>
      ) : (
        <div className="glass-panel p-4 rounded-xl border border-amber-500/20 w-full animate-fade-in">
          {loading ? (
            <div className="flex justify-center py-2">
              <div className="w-5 h-5 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
            </div>
          ) : (
            <p className="text-xs text-center text-amber-200/80 italic font-light leading-relaxed">
              "{hint}"
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default MagicalHint;
