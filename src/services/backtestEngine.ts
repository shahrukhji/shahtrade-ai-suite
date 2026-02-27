import { calcAllIndicators } from '@/utils/indicators';
import { detectPatterns } from '@/utils/candlePatterns';

export interface BacktestConfig {
  symbol: string;
  exchange: string;
  symbolToken: string;
  startDate: string;
  endDate: string;
  timeframe: string;
  initialCapital: number;
  strategy: string;
  stopLossPercent: number;
  target1Percent: number;
  target2Percent: number;
  target3Percent: number;
  trailingSL: boolean;
  trailingPercent: number;
  breakevenSL: boolean;
  partialBooking: boolean;
  positionSizePercent: number;
}

export interface BacktestTrade {
  entryDate: string;
  exitDate: string;
  symbol: string;
  action: 'BUY' | 'SELL';
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  pnl: number;
  pnlPercent: number;
  exitReason: string;
  holdingPeriod: string;
  strategyUsed: string;
  indicators: { rsi: number; macd: number; score: number };
}

export interface BacktestResult {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  netPnL: number;
  netPnLPercent: number;
  grossProfit: number;
  grossLoss: number;
  profitFactor: number;
  expectancy: number;
  avgWin: number;
  avgLoss: number;
  largestWin: number;
  largestLoss: number;
  maxConsecutiveWins: number;
  maxConsecutiveLosses: number;
  maxDrawdown: number;
  maxDrawdownPercent: number;
  sharpeRatio: number;
  calmarRatio: number;
  recoveryFactor: number;
  startingCapital: number;
  endingCapital: number;
  peakCapital: number;
  trades: BacktestTrade[];
  equityCurve: { date: string; capital: number }[];
  monthlyReturns: { month: string; pnl: number; trades: number; winRate: number }[];
  drawdownCurve: { date: string; drawdown: number }[];
  verdict: string[];
}

function evaluateStrategy(strategyId: string, candles: any[], indicators: any): { action: 'BUY' | 'SELL' } | null {
  const c = indicators;
  switch (strategyId) {
    case 'momentum_breakout': {
      const high20 = Math.max(...candles.slice(-20).map((x: any) => x.high));
      if (c.currentPrice > high20 && c.volumeRatio > 1.5 && c.rsi14 > 40 && c.rsi14 < 65) return { action: 'BUY' };
      return null;
    }
    case 'mean_reversion':
      if (c.rsi14 < 30 && c.bollinger.percentB < 0.1) return { action: 'BUY' };
      if (c.rsi14 > 70 && c.bollinger.percentB > 0.9) return { action: 'SELL' };
      return null;
    case 'vwap_bounce': {
      const prev = candles[candles.length - 2];
      const cur = candles[candles.length - 1];
      if (prev.close < c.vwap && cur.close > c.vwap && cur.close > cur.open && c.volumeRatio > 1) return { action: 'BUY' };
      return null;
    }
    case 'ema_crossover':
      if (c.ema9 > c.ema21 && c.macd.histogram > 0 && c.adx > 20) return { action: 'BUY' };
      if (c.ema9 < c.ema21 && c.macd.histogram < 0 && c.adx > 20) return { action: 'SELL' };
      return null;
    case 'supertrend_follow':
      if (c.supertrend.trend === 'BULLISH' && c.rsi14 > 50 && c.macd.histogram > 0) return { action: 'BUY' };
      if (c.supertrend.trend === 'BEARISH' && c.rsi14 < 50 && c.macd.histogram < 0) return { action: 'SELL' };
      return null;
    case 'bollinger_squeeze':
      if (c.bollinger.width < 2 && c.currentPrice > c.bollinger.upper) return { action: 'BUY' };
      return null;
    case 'orb': {
      const first3 = candles.slice(0, 3);
      const orbH = Math.max(...first3.map((x: any) => x.high));
      const orbL = Math.min(...first3.map((x: any) => x.low));
      if (c.currentPrice > orbH && c.volumeRatio > 1.2) return { action: 'BUY' };
      if (c.currentPrice < orbL && c.volumeRatio > 1.2) return { action: 'SELL' };
      return null;
    }
    default: return null;
  }
}

export async function runBacktest(
  config: BacktestConfig,
  candles: any[],
  onProgress?: (pct: number) => void
): Promise<BacktestResult> {
  if (!candles || candles.length < 100) throw new Error('Insufficient data (need 100+ candles)');

  let capital = config.initialCapital;
  let peakCapital = capital;
  let maxDrawdown = 0;
  const trades: BacktestTrade[] = [];
  const equityCurve: { date: string; capital: number }[] = [{ date: candles[0]?.time || config.startDate, capital }];
  const drawdownCurve: { date: string; drawdown: number }[] = [];
  let inTrade = false;
  let currentTrade: any = null;
  let consecutiveWins = 0, consecutiveLosses = 0;
  let maxConsWins = 0, maxConsLosses = 0;

  for (let i = 50; i < candles.length; i++) {
    if (onProgress && i % 50 === 0) onProgress(Math.round((i / candles.length) * 100));

    const slice = candles.slice(Math.max(0, i - 200), i + 1);
    const current = candles[i];

    if (inTrade && currentTrade) {
      const price = current.close;
      const dir = currentTrade.action === 'BUY' ? 1 : -1;
      const pnlPct = dir * ((price - currentTrade.entryPrice) / currentTrade.entryPrice) * 100;

      let exitReason: string | null = null;
      if (dir * (currentTrade.stopLoss - price) >= 0) exitReason = 'STOPLOSS';
      else if (pnlPct >= config.target1Percent) exitReason = 'TARGET1';

      if (config.trailingSL && pnlPct > config.trailingPercent) {
        const newSL = currentTrade.action === 'BUY'
          ? price * (1 - config.trailingPercent / 100)
          : price * (1 + config.trailingPercent / 100);
        if (currentTrade.action === 'BUY' && newSL > currentTrade.stopLoss) currentTrade.stopLoss = newSL;
        if (currentTrade.action === 'SELL' && newSL < currentTrade.stopLoss) currentTrade.stopLoss = newSL;
      }

      if (exitReason) {
        const pnl = dir * (price - currentTrade.entryPrice) * currentTrade.quantity;
        capital += pnl;
        const timeStr = typeof current.time === 'number' ? new Date(current.time * 1000).toISOString() : String(current.time);
        trades.push({
          entryDate: currentTrade.entryTime, exitDate: timeStr,
          symbol: config.symbol, action: currentTrade.action,
          entryPrice: currentTrade.entryPrice, exitPrice: price,
          quantity: currentTrade.quantity, pnl, pnlPercent: pnlPct,
          exitReason, holdingPeriod: '', strategyUsed: config.strategy,
          indicators: currentTrade.indicators,
        });

        if (pnl > 0) { consecutiveWins++; consecutiveLosses = 0; }
        else { consecutiveLosses++; consecutiveWins = 0; }
        maxConsWins = Math.max(maxConsWins, consecutiveWins);
        maxConsLosses = Math.max(maxConsLosses, consecutiveLosses);
        if (capital > peakCapital) peakCapital = capital;
        const dd = ((peakCapital - capital) / peakCapital) * 100;
        if (dd > maxDrawdown) maxDrawdown = dd;
        equityCurve.push({ date: timeStr, capital });
        drawdownCurve.push({ date: timeStr, drawdown: -dd });
        inTrade = false;
        currentTrade = null;
      }
    } else {
      const indicators = calcAllIndicators(slice);
      const signal = evaluateStrategy(config.strategy, slice, indicators);

      if (signal && capital > 0) {
        const price = current.close;
        const riskPerTrade = capital * (config.positionSizePercent / 100);
        const sl = signal.action === 'BUY'
          ? price * (1 - config.stopLossPercent / 100)
          : price * (1 + config.stopLossPercent / 100);
        const riskPerShare = Math.abs(price - sl);
        const qty = riskPerShare > 0 ? Math.max(1, Math.floor(riskPerTrade / riskPerShare)) : 1;
        const timeStr = typeof current.time === 'number' ? new Date(current.time * 1000).toISOString() : String(current.time);

        currentTrade = {
          action: signal.action, entryPrice: price, entryTime: timeStr,
          stopLoss: sl, quantity: qty,
          indicators: { rsi: indicators.rsi14, macd: indicators.macd.histogram, score: 0 },
        };
        inTrade = true;
      }
    }
  }

  // Close any open trade
  if (inTrade && currentTrade) {
    const last = candles[candles.length - 1];
    const dir = currentTrade.action === 'BUY' ? 1 : -1;
    const pnl = dir * (last.close - currentTrade.entryPrice) * currentTrade.quantity;
    capital += pnl;
    const timeStr = typeof last.time === 'number' ? new Date(last.time * 1000).toISOString() : String(last.time);
    trades.push({
      entryDate: currentTrade.entryTime, exitDate: timeStr,
      symbol: config.symbol, action: currentTrade.action,
      entryPrice: currentTrade.entryPrice, exitPrice: last.close,
      quantity: currentTrade.quantity, pnl, pnlPercent: dir * ((last.close - currentTrade.entryPrice) / currentTrade.entryPrice) * 100,
      exitReason: 'END_OF_DATA', holdingPeriod: '', strategyUsed: config.strategy,
      indicators: currentTrade.indicators,
    });
  }

  const wins = trades.filter(t => t.pnl > 0);
  const losses = trades.filter(t => t.pnl <= 0);
  const grossProfit = wins.reduce((s, t) => s + t.pnl, 0);
  const grossLoss = Math.abs(losses.reduce((s, t) => s + t.pnl, 0));
  const netPnL = capital - config.initialCapital;
  const netPnLPercent = (netPnL / config.initialCapital) * 100;

  // Monthly returns
  const monthly: Record<string, { pnl: number; trades: number; wins: number }> = {};
  trades.forEach(t => {
    const m = t.entryDate.substring(0, 7);
    if (!monthly[m]) monthly[m] = { pnl: 0, trades: 0, wins: 0 };
    monthly[m].pnl += t.pnl;
    monthly[m].trades++;
    if (t.pnl > 0) monthly[m].wins++;
  });
  const monthlyReturns = Object.entries(monthly).map(([month, d]) => ({
    month, pnl: d.pnl, trades: d.trades, winRate: d.trades > 0 ? (d.wins / d.trades) * 100 : 0,
  }));

  // Verdict
  const verdict: string[] = [];
  if (netPnL > 0) verdict.push('✅ Profitable strategy');
  else verdict.push('❌ Strategy not profitable in this period');
  const wr = trades.length > 0 ? (wins.length / trades.length) * 100 : 0;
  if (wr >= 60) verdict.push('✅ Win rate above 60%');
  else if (wr >= 50) verdict.push('⚠️ Win rate moderate at ' + wr.toFixed(0) + '%');
  else verdict.push('❌ Win rate below 50%');
  const pf = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;
  if (pf >= 2) verdict.push('✅ Profit factor above 2');
  else if (pf >= 1.5) verdict.push('⚠️ Profit factor moderate');
  else verdict.push('❌ Profit factor below 1.5');
  if (maxDrawdown < 10) verdict.push('✅ Max drawdown under 10%');
  else if (maxDrawdown < 20) verdict.push('⚠️ Max drawdown ' + maxDrawdown.toFixed(1) + '% — moderate');
  else verdict.push('❌ Max drawdown ' + maxDrawdown.toFixed(1) + '% — high risk');
  if (netPnL > 0 && pf >= 1.5 && wr >= 50) verdict.push('✅ Good candidate for live trading');
  else verdict.push('⚠️ Consider optimizing before live trading');

  return {
    totalTrades: trades.length,
    winningTrades: wins.length, losingTrades: losses.length,
    winRate: wr, netPnL, netPnLPercent,
    grossProfit, grossLoss, profitFactor: pf,
    expectancy: trades.length > 0 ? netPnL / trades.length : 0,
    avgWin: wins.length > 0 ? grossProfit / wins.length : 0,
    avgLoss: losses.length > 0 ? grossLoss / losses.length : 0,
    largestWin: wins.length > 0 ? Math.max(...wins.map(t => t.pnl)) : 0,
    largestLoss: losses.length > 0 ? Math.min(...losses.map(t => t.pnl)) : 0,
    maxConsecutiveWins: maxConsWins, maxConsecutiveLosses: maxConsLosses,
    maxDrawdown, maxDrawdownPercent: maxDrawdown,
    sharpeRatio: trades.length > 5 ? (netPnLPercent / (maxDrawdown || 1)) * 0.5 : 0,
    calmarRatio: maxDrawdown > 0 ? netPnLPercent / maxDrawdown : 0,
    recoveryFactor: maxDrawdown > 0 ? netPnL / (config.initialCapital * maxDrawdown / 100) : 0,
    startingCapital: config.initialCapital, endingCapital: capital, peakCapital,
    trades, equityCurve, monthlyReturns, drawdownCurve, verdict,
  };
}
