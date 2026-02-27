import React, { createContext, useContext, useState, useCallback } from 'react';
import type { AutoTradeContextType, EngineStatus, AutoTradeConfig, ActiveTrade, TodayStats, SafetyStatus, ScanLogEntry } from '@/types/autoTrade';
import { sampleActiveTrades, sampleTodayStats, sampleSafetyStatus, generateSampleScanLog } from '@/utils/sampleData';

const defaultConfig: AutoTradeConfig = {
  enabled: false, mode: 'paper', capital: 500000, maxPositions: 5, maxDailyLoss: 10000,
  maxConsecutiveLosses: 3, cooldownMinutes: 15, strategies: ['Momentum', 'Mean Reversion'],
  instruments: ['NIFTY', 'BANKNIFTY', 'RELIANCE'], scanIntervalSeconds: 30, reservePercent: 10,
};

const AutoTradeContext = createContext<AutoTradeContextType | null>(null);

export const AutoTradeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAutoTrading, setIsAutoTrading] = useState(false);
  const [engineStatus, setEngineStatus] = useState<EngineStatus>('STOPPED');
  const [mode, setMode] = useState<'paper' | 'live'>('paper');
  const [activeTrades] = useState<ActiveTrade[]>(sampleActiveTrades);
  const [tradeHistory] = useState<ActiveTrade[]>([]);
  const [todayStats] = useState<TodayStats>(sampleTodayStats);
  const [safetyStatus] = useState<SafetyStatus>(sampleSafetyStatus);
  const [config, setConfig] = useState<AutoTradeConfig>(defaultConfig);
  const [scanLog] = useState<ScanLogEntry[]>(generateSampleScanLog());

  const startEngine = useCallback(() => { setIsAutoTrading(true); setEngineStatus('RUNNING'); }, []);
  const stopEngine = useCallback(() => { setIsAutoTrading(false); setEngineStatus('STOPPED'); }, []);
  const pauseEngine = useCallback(() => { setEngineStatus('PAUSED'); }, []);
  const killAll = useCallback(() => { setIsAutoTrading(false); setEngineStatus('EMERGENCY_STOPPED'); }, []);
  const updateConfig = useCallback((c: Partial<AutoTradeConfig>) => setConfig(prev => ({ ...prev, ...c })), []);

  return (
    <AutoTradeContext.Provider value={{ isAutoTrading, engineStatus, mode, activeTrades, tradeHistory, todayStats, safetyStatus, config, scanLog, startEngine, stopEngine, pauseEngine, killAll, setMode, updateConfig }}>
      {children}
    </AutoTradeContext.Provider>
  );
};

export const useAutoTrade = () => {
  const ctx = useContext(AutoTradeContext);
  if (!ctx) throw new Error('useAutoTrade must be used within AutoTradeProvider');
  return ctx;
};

export default AutoTradeContext;
