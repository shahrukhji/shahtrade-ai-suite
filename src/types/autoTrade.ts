export interface AutoTradeConfig {
  enabled: boolean;
  mode: 'paper' | 'live';
  capital: number;
  maxPositions: number;
  maxDailyLoss: number;
  maxConsecutiveLosses: number;
  cooldownMinutes: number;
  strategies: string[];
  instruments: string[];
  scanIntervalSeconds: number;
  reservePercent: number;
}

export interface ActiveTrade {
  id: string;
  symbol: string;
  exchange: string;
  direction: 'BUY' | 'SELL';
  entryPrice: number;
  ltp: number;
  qty: number;
  stopLoss: number;
  target1: number;
  target2?: number;
  pnl: number;
  pnlPercent: number;
  entryTime: string;
  aiConfidence: number;
  strategy: string;
}

export interface TodayStats {
  totalPnl: number;
  totalPnlPercent: number;
  totalTrades: number;
  wins: number;
  losses: number;
  winRate: number;
  profitFactor: number;
  bestTrade: number;
  worstTrade: number;
  avgWin: number;
  avgLoss: number;
  maxDrawdown: number;
  sharpeRatio: number;
}

export interface ScanLogEntry {
  time: string;
  emoji: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'trade';
}

export interface SafetyStatus {
  dailyLossUsed: number;
  dailyLossLimit: number;
  capitalDeployed: number;
  capitalAvailable: number;
  capitalReserve: number;
  openPositions: number;
  maxPositions: number;
  consecutiveLosses: number;
  maxConsecutiveLosses: number;
  cooldownRemaining: number;
  status: 'safe' | 'warning' | 'danger';
}

export type EngineStatus = 'RUNNING' | 'PAUSED' | 'STOPPED' | 'EMERGENCY_STOPPED';

export interface AutoTradeContextType {
  isAutoTrading: boolean;
  engineStatus: EngineStatus;
  mode: 'paper' | 'live';
  activeTrades: ActiveTrade[];
  tradeHistory: ActiveTrade[];
  todayStats: TodayStats;
  safetyStatus: SafetyStatus;
  config: AutoTradeConfig;
  scanLog: ScanLogEntry[];
  startEngine: () => void;
  stopEngine: () => void;
  pauseEngine: () => void;
  killAll: () => void;
  setMode: (mode: 'paper' | 'live') => void;
  updateConfig: (config: Partial<AutoTradeConfig>) => void;
}
