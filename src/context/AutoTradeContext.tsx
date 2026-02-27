import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import type { AutoTradeContextType, EngineStatus, AutoTradeConfig, ActiveTrade, TodayStats, SafetyStatus, ScanLogEntry } from '@/types/autoTrade';
import { AutoTradeEngine, type EngineConfig } from '@/services/autoTradeEngine';
import { useCustomToast } from '@/hooks/useCustomToast';

const defaultStats: TodayStats = {
  totalPnl: 0, totalPnlPercent: 0, totalTrades: 0, wins: 0, losses: 0, winRate: 0,
  profitFactor: 0, bestTrade: 0, worstTrade: 0, avgWin: 0, avgLoss: 0, maxDrawdown: 0, sharpeRatio: 0,
};

const defaultSafety: SafetyStatus = {
  dailyLossUsed: 0, dailyLossLimit: 10000, capitalDeployed: 0, capitalAvailable: 500000,
  capitalReserve: 50000, openPositions: 0, maxPositions: 5, consecutiveLosses: 0,
  maxConsecutiveLosses: 3, cooldownRemaining: 0, status: 'safe',
};

const defaultConfig: AutoTradeConfig = {
  enabled: false, mode: 'paper', capital: 500000, maxPositions: 5, maxDailyLoss: 10000,
  maxConsecutiveLosses: 3, cooldownMinutes: 15, strategies: ['Momentum', 'Mean Reversion'],
  instruments: ['NIFTY', 'BANKNIFTY', 'RELIANCE'], scanIntervalSeconds: 30, reservePercent: 10,
};

const ALL_STRATEGIES = [
  { id: 'momentum_breakout', name: '📈 Momentum Breakout', enabled: true, desc: 'Buy on 20-candle high breakout with volume > 1.5x', winRate: 65, risk: 'MEDIUM' },
  { id: 'mean_reversion', name: '📉 Mean Reversion', desc: 'Buy oversold RSI<30 at lower Bollinger support', winRate: 60, risk: 'MEDIUM', enabled: false },
  { id: 'vwap_bounce', name: '📊 VWAP Bounce', desc: 'Buy on bullish bounce off VWAP with volume', winRate: 62, risk: 'LOW', enabled: true },
  { id: 'ema_crossover', name: '🔄 EMA Crossover', desc: 'EMA 9/21 crossover with MACD confirmation', winRate: 58, risk: 'MEDIUM', enabled: false },
  { id: 'supertrend_follow', name: '🎯 Supertrend Follow', desc: 'Follow Supertrend with RSI + MACD confirmation', winRate: 63, risk: 'LOW', enabled: true },
  { id: 'bollinger_squeeze', name: '📏 Bollinger Squeeze', desc: 'Breakout from low volatility Bollinger squeeze', winRate: 55, risk: 'HIGH', enabled: false },
  { id: 'orb', name: '🔔 Opening Range Breakout', desc: 'First 15-min range breakout with volume', winRate: 60, risk: 'MEDIUM', enabled: true },
];

const loadFromLS = (key: string, def: any) => {
  try { const v = localStorage.getItem(`st_${key}`); return v ? JSON.parse(v) : def; } catch { return def; }
};

const AutoTradeContext = createContext<AutoTradeContextType | null>(null);

export const AutoTradeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAutoTrading, setIsAutoTrading] = useState(false);
  const [engineStatus, setEngineStatus] = useState<EngineStatus>('STOPPED');
  const [mode, setModeState] = useState<'paper' | 'live'>('paper');
  const [activeTrades, setActiveTrades] = useState<ActiveTrade[]>([]);
  const [tradeHistory, setTradeHistory] = useState<ActiveTrade[]>([]);
  const [todayStats, setTodayStats] = useState<TodayStats>(defaultStats);
  const [safetyStatus, setSafetyStatus] = useState<SafetyStatus>(defaultSafety);
  const [config, setConfig] = useState<AutoTradeConfig>(defaultConfig);
  const [scanLog, setScanLog] = useState<ScanLogEntry[]>([]);
  const engineRef = useRef<AutoTradeEngine | null>(null);
  const toastRef = useRef<any>(null);

  // We need toast but can't use hook in callback directly — use ref
  const toast = useCustomToast();
  useEffect(() => { toastRef.current = toast; }, [toast]);

  const getEngineConfig = useCallback((): Partial<EngineConfig> => {
    const risk = loadFromLS('risk', { capital: 500000, maxPerTrade: 5, maxDeployed: 50, reserve: 20, maxLossTrade: 1.5, maxDailyLoss: 10000, maxConsecutive: 3, maxOpenPositions: 3, cooldown: 10 });
    const sl = loadFromLS('sl', { type: 'fixed', fixedPercent: 1.5, atrMultiplier: 2, trailing: false, trailingPercent: 0.8, trailingActivation: 1, breakeven: false, breakevenTrigger: 1 });
    const targets = loadFromLS('targets', { t1: 2, t2: 4, t3: 6, partial: true, t1Book: 40, t2Book: 30 });
    const ai = loadFromLS('ai', { minConfidence: 75 });
    const time = loadFromLS('time', { start: '09:20', end: '15:00', squareOff: '15:15', noNewAfter: '14:30' });
    const adv = loadFromLS('adv', { style: 'intraday' });
    const watchlistRaw = loadFromLS('watchlist', [
      { symbol: 'RELIANCE', exchange: 'NSE', enabled: true }, { symbol: 'TCS', exchange: 'NSE', enabled: true },
      { symbol: 'HDFCBANK', exchange: 'NSE', enabled: true }, { symbol: 'INFY', exchange: 'NSE', enabled: true },
      { symbol: 'ICICIBANK', exchange: 'NSE', enabled: true }, { symbol: 'SBIN', exchange: 'NSE', enabled: true },
      { symbol: 'TATAMOTORS', exchange: 'NSE', enabled: true },
    ]);
    const strategiesRaw = loadFromLS('strategies', ALL_STRATEGIES);

    return {
      watchlist: watchlistRaw,
      strategies: strategiesRaw,
      totalCapital: risk.capital,
      maxPerTradePercent: risk.maxPerTrade,
      maxDeployedPercent: risk.maxDeployed,
      reservePercent: risk.reserve,
      maxLossPerTradePercent: risk.maxLossTrade,
      maxDailyLoss: risk.maxDailyLoss,
      maxConsecutiveLosses: risk.maxConsecutive,
      maxOpenPositions: risk.maxOpenPositions,
      cooldownMinutes: risk.cooldown,
      minAIConfidence: ai.minConfidence,
      scanIntervalSeconds: 10,
      tradingStart: time.start,
      tradingEnd: time.end,
      squareOffTime: time.squareOff,
      noNewTradesAfter: time.noNewAfter,
      slType: sl.type,
      fixedSLPercent: sl.fixedPercent,
      atrMultiplier: sl.atrMultiplier,
      trailingSL: sl.trailing,
      trailingPercent: sl.trailingPercent,
      trailingActivation: sl.trailingActivation,
      breakevenSL: sl.breakeven,
      breakevenTrigger: sl.breakevenTrigger,
      t1Percent: targets.t1,
      t2Percent: targets.t2,
      t3Percent: targets.t3,
      partialBooking: targets.partial,
      t1BookPercent: targets.t1Book,
      t2BookPercent: targets.t2Book,
      tradingStyle: adv.style,
    };
  }, []);

  const startEngine = useCallback(() => {
    if (engineRef.current) engineRef.current.destroy();
    const cfg = getEngineConfig();
    const engine = new AutoTradeEngine(cfg, {
      onTradesUpdate: (trades) => setActiveTrades([...trades]),
      onLogEntry: (entry) => setScanLog(prev => [...prev.slice(-99), entry]),
      onStatsUpdate: (stats) => setTodayStats(stats),
      onSafetyUpdate: (safety) => setSafetyStatus(safety),
      onNotification: (type, msg) => { toastRef.current?.[type === 'error' ? 'error' : type === 'success' ? 'success' : 'info']?.(msg); },
    });
    engine.isPaperMode = mode === 'paper';
    engineRef.current = engine;
    engine.start();
    setIsAutoTrading(true);
    setEngineStatus('RUNNING');
  }, [mode, getEngineConfig]);

  const stopEngine = useCallback(() => {
    engineRef.current?.stop();
    setIsAutoTrading(false);
    setEngineStatus('STOPPED');
  }, []);

  const pauseEngine = useCallback(() => {
    if (engineRef.current?.isPaused) { engineRef.current.resume(); setEngineStatus('RUNNING'); }
    else { engineRef.current?.pause(); setEngineStatus('PAUSED'); }
  }, []);

  const killAll = useCallback(() => {
    engineRef.current?.killAll();
    setIsAutoTrading(false);
    setEngineStatus('EMERGENCY_STOPPED');
  }, []);

  const setMode = useCallback((m: 'paper' | 'live') => {
    setModeState(m);
    if (engineRef.current) engineRef.current.isPaperMode = m === 'paper';
  }, []);

  const updateConfig = useCallback((c: Partial<AutoTradeConfig>) => {
    setConfig(prev => ({ ...prev, ...c }));
  }, []);

  // Cleanup on unmount
  useEffect(() => () => { engineRef.current?.destroy(); }, []);

  return (
    <AutoTradeContext.Provider value={{
      isAutoTrading, engineStatus, mode, activeTrades, tradeHistory, todayStats, safetyStatus, config, scanLog,
      startEngine, stopEngine, pauseEngine, killAll, setMode, updateConfig,
    }}>
      {children}
    </AutoTradeContext.Provider>
  );
};

export const useAutoTrade = () => {
  const ctx = useContext(AutoTradeContext);
  if (!ctx) throw new Error('useAutoTrade must be used within AutoTradeProvider');
  return ctx;
};

export { ALL_STRATEGIES };
export default AutoTradeContext;
