import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAngelOne } from '@/context/AngelOneContext';

export type SafeLevel = 'ULTRA_SAFE' | 'VERY_SAFE' | 'SAFE' | 'MODERATE_SAFE' | 'NORMAL';

export interface SafeConfig {
  level: SafeLevel;
  maxTradeAmount: number;
  maxLossPerTrade: number;
  maxDailyLoss: number;
  absoluteStopLoss: number;
  stopLossPercent: number;
  targetPercent: number;
  minAIConfidence: number;
  maxQuantity: number;
  maxTradesPerDay: number;
  onlyDelivery: boolean;
  onlyBuy: boolean;
  noFnO: boolean;
  onlyStocksUnder: number;
  paperModeForced: boolean;
  scanInterval: number;
}

interface SafeModeContextType {
  enabled: boolean;
  config: SafeConfig;
  capital: number;
  setCapitalOverride: (v: number) => void;
  overridden: boolean;
  setOverridden: (v: boolean) => void;
  paperDaysLeft: number;
  paperStartDate: string | null;
  dailyRiskUsed: number;
  addDailyRisk: (v: number) => void;
  resetDailyRisk: () => void;
  todayTrades: number;
  addTrade: () => void;
  milestoneReached: string | null;
  dismissMilestone: () => void;
  growthHistory: { date: string; capital: number }[];
  addGrowthEntry: (capital: number) => void;
}

const SafeModeContext = createContext<SafeModeContextType | null>(null);

function calcConfig(capital: number): SafeConfig {
  if (capital <= 1000) return {
    level: 'ULTRA_SAFE', maxTradeAmount: Math.max(100, capital * 0.2), maxLossPerTrade: 5, maxDailyLoss: 15,
    absoluteStopLoss: capital * 0.95, stopLossPercent: 0.3, targetPercent: 0.8, minAIConfidence: 92,
    maxQuantity: 1, maxTradesPerDay: 2, onlyDelivery: true, onlyBuy: true, noFnO: true,
    onlyStocksUnder: 500, paperModeForced: true, scanInterval: 60,
  };
  if (capital <= 5000) return {
    level: 'VERY_SAFE', maxTradeAmount: 1000, maxLossPerTrade: 20, maxDailyLoss: 50,
    absoluteStopLoss: capital * 0.96, stopLossPercent: 0.5, targetPercent: 1.2, minAIConfidence: 88,
    maxQuantity: 5, maxTradesPerDay: 3, onlyDelivery: true, onlyBuy: true, noFnO: true,
    onlyStocksUnder: 1000, paperModeForced: false, scanInterval: 30,
  };
  if (capital <= 10000) return {
    level: 'SAFE', maxTradeAmount: 2000, maxLossPerTrade: 40, maxDailyLoss: 100,
    absoluteStopLoss: capital * 0.95, stopLossPercent: 0.8, targetPercent: 1.5, minAIConfidence: 85,
    maxQuantity: 10, maxTradesPerDay: 4, onlyDelivery: false, onlyBuy: true, noFnO: true,
    onlyStocksUnder: 2000, paperModeForced: false, scanInterval: 15,
  };
  if (capital <= 25000) return {
    level: 'MODERATE_SAFE', maxTradeAmount: 5000, maxLossPerTrade: 100, maxDailyLoss: 300,
    absoluteStopLoss: capital * 0.92, stopLossPercent: 1.0, targetPercent: 2.0, minAIConfidence: 80,
    maxQuantity: 20, maxTradesPerDay: 5, onlyDelivery: false, onlyBuy: false, noFnO: true,
    onlyStocksUnder: 5000, paperModeForced: false, scanInterval: 10,
  };
  return {
    level: 'NORMAL', maxTradeAmount: capital * 0.1, maxLossPerTrade: capital * 0.015, maxDailyLoss: capital * 0.03,
    absoluteStopLoss: capital * 0.9, stopLossPercent: 1.5, targetPercent: 3.0, minAIConfidence: 75,
    maxQuantity: 100, maxTradesPerDay: 10, onlyDelivery: false, onlyBuy: false, noFnO: false,
    onlyStocksUnder: 99999, paperModeForced: false, scanInterval: 10,
  };
}

export const SafeModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { funds } = useAngelOne();
  const [capitalOverride, setCapitalOverride] = useState<number>(() => {
    try { return parseFloat(localStorage.getItem('st_safe_capital') || '0'); } catch { return 0; }
  });
  const [overridden, setOverridden] = useState(() => localStorage.getItem('st_safe_override') === 'true');
  const [dailyRiskUsed, setDailyRiskUsed] = useState(0);
  const [todayTrades, setTodayTrades] = useState(0);
  const [milestoneReached, setMilestoneReached] = useState<string | null>(null);
  const [growthHistory, setGrowthHistory] = useState<{ date: string; capital: number }[]>(() => {
    try { return JSON.parse(localStorage.getItem('st_growth_history') || '[]'); } catch { return []; }
  });

  const capital = capitalOverride > 0 ? capitalOverride : (funds?.availablecash || 0);
  const config = calcConfig(capital);
  const enabled = !overridden && capital > 0 && capital <= 25000;

  // Paper mode tracking
  const [paperStartDate] = useState<string | null>(() => {
    const saved = localStorage.getItem('st_paper_start');
    if (saved) return saved;
    const d = new Date().toISOString();
    localStorage.setItem('st_paper_start', d);
    return d;
  });
  const paperDaysLeft = paperStartDate ? Math.max(0, 7 - Math.floor((Date.now() - new Date(paperStartDate).getTime()) / 86400000)) : 7;

  useEffect(() => {
    if (capitalOverride > 0) localStorage.setItem('st_safe_capital', String(capitalOverride));
    localStorage.setItem('st_safe_override', String(overridden));
  }, [capitalOverride, overridden]);

  const addDailyRisk = useCallback((v: number) => setDailyRiskUsed(p => p + v), []);
  const resetDailyRisk = useCallback(() => { setDailyRiskUsed(0); setTodayTrades(0); }, []);
  const addTrade = useCallback(() => setTodayTrades(p => p + 1), []);
  const dismissMilestone = useCallback(() => setMilestoneReached(null), []);

  const addGrowthEntry = useCallback((cap: number) => {
    setGrowthHistory(prev => {
      const today = new Date().toISOString().slice(0, 10);
      const updated = prev.filter(e => e.date !== today);
      updated.push({ date: today, capital: cap });
      localStorage.setItem('st_growth_history', JSON.stringify(updated.slice(-90)));
      return updated.slice(-90);
    });
  }, []);

  return (
    <SafeModeContext.Provider value={{
      enabled, config, capital, setCapitalOverride, overridden, setOverridden,
      paperDaysLeft, paperStartDate, dailyRiskUsed, addDailyRisk, resetDailyRisk,
      todayTrades, addTrade, milestoneReached, dismissMilestone, growthHistory, addGrowthEntry,
    }}>
      {children}
    </SafeModeContext.Provider>
  );
};

export const useSafeMode = () => {
  const ctx = useContext(SafeModeContext);
  if (!ctx) throw new Error('useSafeMode must be inside SafeModeProvider');
  return ctx;
};
