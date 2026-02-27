import React, { createContext, useContext, useState } from 'react';

interface GeminiContextType {
  apiKey: string;
  isConfigured: boolean;
  setApiKey: (key: string) => void;
  analyze: (prompt: string, data: any) => Promise<string>;
}

const GeminiContext = createContext<GeminiContextType | null>(null);

export const GeminiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [apiKey, setApiKey] = useState('');
  const isConfigured = apiKey.length > 0;

  const analyze = async (_prompt: string, _data: any): Promise<string> => {
    console.log('gemini.analyze called');
    return 'AI analysis placeholder';
  };

  return (
    <GeminiContext.Provider value={{ apiKey, isConfigured, setApiKey, analyze }}>
      {children}
    </GeminiContext.Provider>
  );
};

export const useGemini = () => {
  const ctx = useContext(GeminiContext);
  if (!ctx) throw new Error('useGemini must be used within GeminiProvider');
  return ctx;
};

export default GeminiContext;
