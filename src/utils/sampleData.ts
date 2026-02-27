import type { Candle, Holding, MarketIndex, AISignal, TradeSetup } from '@/types/trading';
import type { ActiveTrade, TodayStats, ScanLogEntry, SafetyStatus } from '@/types/autoTrade';

export const generateSampleCandles = (count = 100, basePrice = 22400): Candle[] => {
  const candles: Candle[] = [];
  let price = basePrice;
  const now = Math.floor(Date.now() / 1000);

  for (let i = count - 1; i >= 0; i--) {
    const time = now - i * 300;
    const change = (Math.random() - 0.48) * price * 0.012;
    const open = price;
    const close = +(price + change).toFixed(2);
    const high = +Math.max(open, close, open + Math.random() * price * 0.005).toFixed(2);
    const low = +Math.min(open, close, open - Math.random() * price * 0.005).toFixed(2);
    const volume = Math.floor(Math.random() * 50000 + 10000);
    candles.push({ time, open: +open.toFixed(2), high, low, close, volume });
    price = close;
  }
  return candles;
};

export const sampleHoldings: Holding[] = [
  { symbol: 'RELIANCE', exchange: 'NSE', qty: 10, avgPrice: 2450.50, ltp: 2520.75, pnl: 702.50, pnlPercent: 2.87, investedValue: 24505, currentValue: 25207.50, dayChange: 35.20, dayChangePercent: 1.42, closePrice: 2485.55 },
  { symbol: 'TCS', exchange: 'NSE', qty: 5, avgPrice: 3680.00, ltp: 3755.30, pnl: 376.50, pnlPercent: 2.05, investedValue: 18400, currentValue: 18776.50, dayChange: -12.40, dayChangePercent: -0.33, closePrice: 3767.70 },
  { symbol: 'HDFCBANK', exchange: 'NSE', qty: 15, avgPrice: 1620.25, ltp: 1585.60, pnl: -519.75, pnlPercent: -2.14, investedValue: 24303.75, currentValue: 23784.00, dayChange: 8.90, dayChangePercent: 0.56, closePrice: 1576.70 },
  { symbol: 'INFY', exchange: 'NSE', qty: 12, avgPrice: 1520.00, ltp: 1580.45, pnl: 725.40, pnlPercent: 3.98, investedValue: 18240, currentValue: 18965.40, dayChange: 22.15, dayChangePercent: 1.42, closePrice: 1558.30 },
  { symbol: 'TATAMOTORS', exchange: 'NSE', qty: 20, avgPrice: 680.30, ltp: 725.80, pnl: 910.00, pnlPercent: 6.69, investedValue: 13606, currentValue: 14516, dayChange: -5.30, dayChangePercent: -0.72, closePrice: 731.10 },
];

export const sampleIndices: MarketIndex[] = [
  { name: 'NIFTY 50', ltp: 22456.80, change: 125.30, changePercent: 0.56 },
  { name: 'SENSEX', ltp: 73852.40, change: 410.20, changePercent: 0.56 },
  { name: 'BANK NIFTY', ltp: 47234.50, change: -89.60, changePercent: -0.19 },
  { name: 'NIFTY IT', ltp: 38920.15, change: 245.80, changePercent: 0.64 },
  { name: 'FINNIFTY', ltp: 21345.70, change: 56.30, changePercent: 0.26 },
  { name: 'MIDCPNIFTY', ltp: 11234.90, change: -34.50, changePercent: -0.31 },
];

export const sampleAISignal: AISignal = {
  direction: 'BUY',
  strength: 'STRONG BUY',
  confidence: 87,
  tradeScore: 82,
  reasons: [
    { icon: '✅', text: 'Price above all major SMAs (20/50/200)' },
    { icon: '✅', text: 'RSI at 62 — bullish momentum, not overbought' },
    { icon: '✅', text: 'MACD bullish crossover confirmed' },
    { icon: '⚠️', text: 'Volume slightly below average' },
    { icon: '✅', text: 'Supertrend in BUY mode since 3 candles' },
    { icon: '❌', text: 'Stochastic nearing overbought zone (78)' },
  ],
};

export const sampleTradeSetup: TradeSetup = {
  action: 'BUY',
  symbol: 'NIFTY 50',
  entry: 22450,
  stopLoss: 22350,
  target1: 22550,
  target2: 22650,
  target3: 22800,
  qty: 50,
  riskPercent: 0.45,
  riskReward1: 1.0,
  riskReward2: 2.0,
  riskReward3: 3.5,
  maxProfit: 17500,
  maxLoss: 5000,
};

export const sampleActiveTrades: ActiveTrade[] = [
  { id: '1', symbol: 'RELIANCE', exchange: 'NSE', direction: 'BUY', entryPrice: 2480, ltp: 2520.75, qty: 10, stopLoss: 2440, target1: 2560, pnl: 407.50, pnlPercent: 1.64, entryTime: new Date(Date.now() - 3600000).toISOString(), aiConfidence: 85, strategy: 'Momentum' },
  { id: '2', symbol: 'BANKNIFTY', exchange: 'NFO', direction: 'SELL', entryPrice: 47400, ltp: 47234.50, qty: 25, stopLoss: 47600, target1: 47000, pnl: 4137.50, pnlPercent: 0.35, entryTime: new Date(Date.now() - 7200000).toISOString(), aiConfidence: 72, strategy: 'Mean Reversion' },
];

export const sampleTodayStats: TodayStats = {
  totalPnl: 12450, totalPnlPercent: 2.49, totalTrades: 8, wins: 6, losses: 2, winRate: 75, profitFactor: 3.01, bestTrade: 4200, worstTrade: -1100, avgWin: 2258, avgLoss: -750, maxDrawdown: -1800, sharpeRatio: 2.4,
};

export const sampleSafetyStatus: SafetyStatus = {
  dailyLossUsed: 1800, dailyLossLimit: 10000, capitalDeployed: 125000, capitalAvailable: 375000, capitalReserve: 50000, openPositions: 2, maxPositions: 5, consecutiveLosses: 1, maxConsecutiveLosses: 3, cooldownRemaining: 0, status: 'safe',
};

export const generateSampleScanLog = (count = 15): ScanLogEntry[] => {
  const entries: ScanLogEntry[] = [];
  const messages = [
    { emoji: '🔍', message: 'Scanning NIFTY 50 — 5min timeframe', type: 'info' as const },
    { emoji: '📊', message: 'RSI: 62.4 | MACD: Bullish | Supertrend: BUY', type: 'info' as const },
    { emoji: '✅', message: 'BUY signal detected on RELIANCE @ ₹2,480', type: 'success' as const },
    { emoji: '📈', message: 'Order placed: BUY 10 RELIANCE @ ₹2,480', type: 'trade' as const },
    { emoji: '💰', message: 'Target 1 hit! RELIANCE +₹800 (+3.2%)', type: 'success' as const },
    { emoji: '⚠️', message: 'High volatility detected on BANKNIFTY', type: 'warning' as const },
    { emoji: '🔍', message: 'Scanning HDFCBANK — 15min timeframe', type: 'info' as const },
    { emoji: '❌', message: 'SL hit on INFY trade — Loss ₹450', type: 'error' as const },
    { emoji: '🔄', message: 'Cooldown active — 5min remaining', type: 'warning' as const },
    { emoji: '📊', message: 'Portfolio risk: 24% utilized', type: 'info' as const },
    { emoji: '✅', message: 'SELL signal on TATAMOTORS @ ₹730', type: 'success' as const },
    { emoji: '🤖', message: 'AI confidence: 87% for NIFTY BUY', type: 'info' as const },
    { emoji: '💰', message: 'Closed BANKNIFTY short +₹4,137', type: 'success' as const },
    { emoji: '⚠️', message: 'Daily loss at 18% of limit', type: 'warning' as const },
    { emoji: '🔍', message: 'Next scan in 30s...', type: 'info' as const },
  ];
  const now = Date.now();
  for (let i = 0; i < count; i++) {
    const m = messages[i % messages.length];
    entries.push({ time: new Date(now - (count - i) * 15000).toISOString(), ...m });
  }
  return entries;
};

export const generateOptionChainData = (spotPrice = 22400) => {
  const strikes: any[] = [];
  for (let i = -10; i <= 10; i++) {
    const strike = spotPrice + i * 50;
    const isATM = i === 0;
    const dist = Math.abs(i);
    const callITM = strike < spotPrice;
    const putITM = strike > spotPrice;
    strikes.push({
      strike,
      isATM,
      callOI: Math.floor(Math.random() * 500000 + (callITM ? 200000 : 50000)),
      callVol: Math.floor(Math.random() * 100000 + 10000),
      callIV: +(15 + dist * 0.8 + Math.random() * 3).toFixed(1),
      callLTP: +(Math.max(5, (callITM ? spotPrice - strike : 0) + 50 - dist * 8 + Math.random() * 20)).toFixed(2),
      callChg: +((Math.random() - 0.4) * 15).toFixed(2),
      putOI: Math.floor(Math.random() * 500000 + (putITM ? 200000 : 50000)),
      putVol: Math.floor(Math.random() * 100000 + 10000),
      putIV: +(15 + dist * 0.8 + Math.random() * 3).toFixed(1),
      putLTP: +(Math.max(5, (putITM ? strike - spotPrice : 0) + 50 - dist * 8 + Math.random() * 20)).toFixed(2),
      putChg: +((Math.random() - 0.4) * 15).toFixed(2),
      callITM,
      putITM,
    });
  }
  return strikes;
};
