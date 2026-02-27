import React, { createContext, useContext, useState, useCallback } from 'react';
import { analyzeStock, analyzeOptionChain } from '@/services/geminiAIService';

interface GeminiContextType {
  apiKey: string;
  isConfigured: boolean;
  setApiKey: (key: string) => void;
  analyze: (prompt: string, data: any) => Promise<string>;
  analyzeStockData: (symbol: string, data: any) => Promise<any>;
  analyzeOptions: (data: any) => Promise<any>;
  tokensUsed: number;
}

const GeminiContext = createContext<GeminiContextType | null>(null);

export const GeminiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [apiKey, setApiKeyState] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [tokensUsed, setTokensUsed] = useState(0);
  const isConfigured = apiKey.length > 0;

  const setApiKey = useCallback((key: string) => {
    setApiKeyState(key);
    localStorage.setItem('gemini_api_key', key);
  }, []);

  const analyze = useCallback(async (_prompt: string, _data: any): Promise<string> => {
    setTokensUsed(t => t + 1);
    return 'AI analysis placeholder';
  }, []);

  const analyzeStockData = useCallback(async (symbol: string, data: any) => {
    if (!apiKey) throw new Error('Gemini API key not set');
    setTokensUsed(t => t + 1);
    return analyzeStock(apiKey, symbol, data);
  }, [apiKey]);

  const analyzeOptions = useCallback(async (data: any) => {
    if (!apiKey) throw new Error('Gemini API key not set');
    setTokensUsed(t => t + 1);
    return analyzeOptionChain(apiKey, data);
  }, [apiKey]);

  return (
    <GeminiContext.Provider value={{ apiKey, isConfigured, setApiKey, analyze, analyzeStockData, analyzeOptions, tokensUsed }}>
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
