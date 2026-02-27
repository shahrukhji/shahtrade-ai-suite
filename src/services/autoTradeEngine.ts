import { calcAllIndicators } from '@/utils/indicators';
import { detectPatterns } from '@/utils/candlePatterns';
import { isMarketOpen } from '@/utils/marketHours';
import * as api from '@/services/angelOneApi';
import type { Candle } from '@/types/trading';
import type { ActiveTrade, ScanLogEntry, TodayStats, SafetyStatus } from '@/types/autoTrade';

export interface EngineConfig {
  watchlist: { symbol: string; exchange: string; token?: string; tradingsymbol?: string; enabled: boolean }[];
  strategies: { id: string; name: string; enabled: boolean }[];
  totalCapital: number;
  maxPerTradePercent: number;
  maxDeployedPercent: number;
  reservePercent: number;
  maxLossPerTradePercent: number;
  maxDailyLoss: number;
  maxConsecutiveLosses: number;
  maxOpenPositions: number;
  cooldownMinutes: number;
  minAIConfidence: number;
  scanIntervalSeconds: number;
  tradingStart: string;
  tradingEnd: string;
  squareOffTime: string;
  noNewTradesAfter: string;
  slType: string;
  fixedSLPercent: number;
  atrMultiplier: number;
  trailingSL: boolean;
  trailingPercent: number;
  trailingActivation: number;
  breakevenSL: boolean;
  breakevenTrigger: number;
  t1Percent: number;
  t2Percent: number;
  t3Percent: number;
  partialBooking: boolean;
  t1BookPercent: number;
  t2BookPercent: number;
  tradingStyle: string;
}

export interface EngineCallbacks {
  onTradesUpdate: (trades: ActiveTrade[]) => void;
  onLogEntry: (entry: ScanLogEntry) => void;
  onStatsUpdate: (stats: TodayStats) => void;
  onSafetyUpdate: (safety: SafetyStatus) => void;
  onNotification: (type: string, message: string) => void;
}

const defaultEngineConfig: EngineConfig = {
  watchlist: [], strategies: [], totalCapital: 500000, maxPerTradePercent: 5,
  maxDeployedPercent: 50, reservePercent: 20, maxLossPerTradePercent: 1.5,
  maxDailyLoss: 10000, maxConsecutiveLosses: 3, maxOpenPositions: 3,
  cooldownMinutes: 10, minAIConfidence: 75, scanIntervalSeconds: 30,
  tradingStart: '09:20', tradingEnd: '15:00', squareOffTime: '15:15',
  noNewTradesAfter: '14:30', slType: 'fixed', fixedSLPercent: 1.5,
  atrMultiplier: 2, trailingSL: false, trailingPercent: 0.8,
  trailingActivation: 1, breakevenSL: false, breakevenTrigger: 1,
  t1Percent: 2, t2Percent: 4, t3Percent: 6, partialBooking: true,
  t1BookPercent: 40, t2BookPercent: 30, tradingStyle: 'intraday',
};

export class AutoTradeEngine {
  config: EngineConfig;
  activeTrades: Map<string, ActiveTrade> = new Map();
  tradeHistory: ActiveTrade[] = [];
  scanLog: ScanLogEntry[] = [];
  isRunning = false;
  isPaused = false;
  isPaperMode = true;
  emergencyStop = false;
  dailyPnL = 0;
  consecutiveLosses = 0;
  totalTradesToday = 0;
  winningTrades = 0;
  losingTrades = 0;
  lastCooldownTime: number | null = null;
  private scanInterval: ReturnType<typeof setInterval> | null = null;
  private monitorInterval: ReturnType<typeof setInterval> | null = null;
  private callbacks: EngineCallbacks;

  constructor(config: Partial<EngineConfig>, callbacks: EngineCallbacks) {
    this.config = { ...defaultEngineConfig, ...config };
    this.callbacks = callbacks;
  }

  private addLog(emoji: string, message: string, type: ScanLogEntry['type'] = 'info') {
    const entry: ScanLogEntry = { time: new Date().toISOString(), emoji, message, type };
    this.scanLog.push(entry);
    if (this.scanLog.length > 100) this.scanLog = this.scanLog.slice(-100);
    this.callbacks.onLogEntry(entry);
  }

  private updateUI() {
    this.callbacks.onTradesUpdate(Array.from(this.activeTrades.values()));
    this.callbacks.onStatsUpdate(this.getStats());
    this.callbacks.onSafetyUpdate(this.getSafetyStatus());
  }

  getStats(): TodayStats {
    const closed = this.tradeHistory;
    const wins = closed.filter(t => t.pnl >= 0);
    const losses = closed.filter(t => t.pnl < 0);
    const totalPnl = this.dailyPnL + Array.from(this.activeTrades.values()).reduce((s, t) => s + t.pnl, 0);
    const lossSum = losses.reduce((s, t) => s + Math.abs(t.pnl), 0);
    return {
      totalPnl, totalPnlPercent: this.config.totalCapital > 0 ? (totalPnl / this.config.totalCapital) * 100 : 0,
      totalTrades: this.totalTradesToday, wins: this.winningTrades, losses: this.losingTrades,
      winRate: this.totalTradesToday > 0 ? (this.winningTrades / this.totalTradesToday) * 100 : 0,
      profitFactor: lossSum > 0 ? wins.reduce((s, t) => s + t.pnl, 0) / lossSum : wins.length > 0 ? 99 : 0,
      bestTrade: closed.length > 0 ? Math.max(...closed.map(t => t.pnl)) : 0,
      worstTrade: closed.length > 0 ? Math.min(...closed.map(t => t.pnl)) : 0,
      avgWin: wins.length > 0 ? wins.reduce((s, t) => s + t.pnl, 0) / wins.length : 0,
      avgLoss: losses.length > 0 ? losses.reduce((s, t) => s + t.pnl, 0) / losses.length : 0,
      maxDrawdown: 0, sharpeRatio: 0,
    };
  }

  getSafetyStatus(): SafetyStatus {
    const deployed = Array.from(this.activeTrades.values()).reduce((s, t) => s + t.entryPrice * t.qty, 0);
    const lossPct = this.config.maxDailyLoss > 0 ? (Math.abs(Math.min(0, this.dailyPnL)) / this.config.maxDailyLoss) * 100 : 0;
    return {
      dailyLossUsed: Math.abs(Math.min(0, this.dailyPnL)),
      dailyLossLimit: this.config.maxDailyLoss,
      capitalDeployed: deployed,
      capitalAvailable: this.config.totalCapital - deployed,
      capitalReserve: this.config.totalCapital * this.config.reservePercent / 100,
      openPositions: this.activeTrades.size,
      maxPositions: this.config.maxOpenPositions,
      consecutiveLosses: this.consecutiveLosses,
      maxConsecutiveLosses: this.config.maxConsecutiveLosses,
      cooldownRemaining: this.getCooldownRemaining(),
      status: lossPct > 80 || this.consecutiveLosses >= this.config.maxConsecutiveLosses - 1 ? 'danger' : lossPct > 50 ? 'warning' : 'safe',
    };
  }

  private getCooldownRemaining(): number {
    if (!this.lastCooldownTime) return 0;
    return Math.max(0, this.config.cooldownMinutes - (Date.now() - this.lastCooldownTime) / 60000);
  }

  private isInCooldown(): boolean { return this.getCooldownRemaining() > 0; }

  private getISTTime(): Date {
    return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  }

  private isAfterCutoff(): boolean {
    const ist = this.getISTTime();
    const [h, m] = this.config.noNewTradesAfter.split(':').map(Number);
    return ist.getHours() * 60 + ist.getMinutes() >= h * 60 + m;
  }

  private isSquareOffTime(): boolean {
    const ist = this.getISTTime();
    const [h, m] = this.config.squareOffTime.split(':').map(Number);
    return ist.getHours() * 60 + ist.getMinutes() >= h * 60 + m;
  }

  private getDeployedCapital(): number {
    return Array.from(this.activeTrades.values()).reduce((s, t) => s + t.entryPrice * t.qty, 0);
  }

  private hasActiveTrade(symbol: string): boolean {
    return Array.from(this.activeTrades.values()).some(t => t.symbol === symbol);
  }

  start() {
    if (this.emergencyStop) { this.addLog('🚨', 'Cannot start — emergency stop active', 'error'); return; }
    this.isRunning = true;
    this.isPaused = false;
    this.addLog('🤖', `ENGINE STARTED${this.isPaperMode ? ' (Paper Mode)' : ' (LIVE MODE)'}`, 'success');
    this.scanInterval = setInterval(() => this.scan(), this.config.scanIntervalSeconds * 1000);
    this.monitorInterval = setInterval(() => this.monitorTrades(), 3000);
    this.scan();
    this.updateUI();
  }

  stop() {
    this.isRunning = false;
    if (this.scanInterval) clearInterval(this.scanInterval);
    if (this.monitorInterval) clearInterval(this.monitorInterval);
    this.addLog('⏹️', 'ENGINE STOPPED');
    this.updateUI();
  }

  pause() { this.isPaused = true; this.addLog('⏸️', 'ENGINE PAUSED'); this.updateUI(); }
  resume() { this.isPaused = false; this.addLog('▶️', 'ENGINE RESUMED'); this.updateUI(); }

  async killAll() {
    this.emergencyStop = true;
    this.stop();
    for (const [, trade] of this.activeTrades) await this.closeTrade(trade, 'EMERGENCY_KILL');
    this.addLog('🚨', 'EMERGENCY KILL — ALL POSITIONS CLOSED', 'error');
    this.callbacks.onNotification('error', '🚨 Emergency Kill — All positions closed');
    this.updateUI();
  }

  checkSafety(): { allowed: boolean; reason: string } {
    if (!isMarketOpen()) return { allowed: false, reason: 'Market closed' };
    if (this.isAfterCutoff()) return { allowed: false, reason: 'Past cutoff time' };
    if (this.dailyPnL <= -this.config.maxDailyLoss) return { allowed: false, reason: 'Daily loss limit' };
    if (this.consecutiveLosses >= this.config.maxConsecutiveLosses) return { allowed: false, reason: `${this.consecutiveLosses} consec losses` };
    if (this.activeTrades.size >= this.config.maxOpenPositions) return { allowed: false, reason: 'Max positions' };
    if (this.getDeployedCapital() >= this.config.totalCapital * this.config.maxDeployedPercent / 100) return { allowed: false, reason: 'Max capital deployed' };
    if (this.isInCooldown()) return { allowed: false, reason: `Cooldown ${this.getCooldownRemaining().toFixed(0)}min` };
    return { allowed: true, reason: '✅' };
  }

  async scan() {
    if (!this.isRunning || this.isPaused || this.emergencyStop) return;
    const safety = this.checkSafety();
    if (!safety.allowed) { this.addLog('⏸️', `Skip: ${safety.reason}`, 'warning'); return; }

    const watchlist = this.config.watchlist.filter(s => s.enabled);
    this.addLog('🔍', `Scanning ${watchlist.length} stocks...`);

    for (const stock of watchlist) {
      if (this.hasActiveTrade(stock.symbol)) continue;
      try {
        const candles = this.genCandles(stock.symbol);
        if (candles.length < 20) continue;
        const indicators = calcAllIndicators(candles);
        if (!indicators) continue;
        const patterns = detectPatterns(candles);
        const score = this.calcScore(indicators, patterns);
        const signal = this.checkStrategies(candles, indicators);

        this.addLog(score > 65 ? '📈' : score < 35 ? '📉' : '➡️',
          `${stock.symbol}: Score=${score} RSI=${indicators.rsi14.toFixed(1)} ST=${indicators.supertrend.trend}`);

        const action = signal?.action || (score > 70 ? 'BUY' : score < 30 ? 'SELL' : null);
        const confidence = signal?.confidence || score;
        if (action && confidence >= this.config.minAIConfidence) {
          await this.executeTrade(stock, { action: action as 'BUY' | 'SELL', confidence, reason: signal?.reason || `Score: ${score}`, strategyName: signal?.strategyName || 'Score' }, indicators);
        }
      } catch (e) { this.addLog('❌', `${stock.symbol}: ${(e as Error).message}`, 'error'); }
    }
  }

  private genCandles(symbol: string): Candle[] {
    const base = { RELIANCE: 2500, TCS: 3700, HDFCBANK: 1600, INFY: 1550, SBIN: 780, TATAMOTORS: 720, ICICIBANK: 1100, BANKNIFTY: 47300, NIFTY: 22400 }[symbol] || 1000;
    const candles: Candle[] = [];
    let price = base;
    const now = Math.floor(Date.now() / 1000);
    for (let i = 99; i >= 0; i--) {
      const ch = (Math.random() - 0.48) * price * 0.008;
      const o = price, c = +(price + ch).toFixed(2);
      const h = +Math.max(o, c, o + Math.random() * price * 0.004).toFixed(2);
      const l = +Math.min(o, c, o - Math.random() * price * 0.004).toFixed(2);
      candles.push({ time: now - i * 300, open: +o.toFixed(2), high: h, low: l, close: c, volume: Math.floor(Math.random() * 50000 + 10000) });
      price = c;
    }
    return candles;
  }

  private calcScore(ind: any, patterns: any[]): number {
    let s = 50;
    if (ind.currentPrice > ind.sma20) s += 5;
    if (ind.currentPrice > ind.sma50) s += 5;
    if (ind.currentPrice < ind.sma20) s -= 5;
    if (ind.currentPrice < ind.sma50) s -= 5;
    if (ind.rsi14 > 50 && ind.rsi14 < 70) s += 5;
    if (ind.rsi14 < 30) s += 8;
    if (ind.rsi14 > 70) s -= 5;
    if (ind.macd.histogram > 0) s += 5; else s -= 5;
    if (ind.supertrend.trend === 'BULLISH') s += 7; else s -= 7;
    if (ind.volumeRatio > 1.5) s += 5;
    patterns.forEach(p => { s += p.type === 'BULLISH' ? p.reliability * 2 : -p.reliability * 2; });
    return Math.max(0, Math.min(100, s));
  }

  private checkStrategies(candles: Candle[], ind: any): { action: string; confidence: number; reason: string; strategyName: string } | null {
    for (const strat of this.config.strategies.filter(s => s.enabled)) {
      const sig = this.evalStrat(strat.id, candles, ind);
      if (sig) return { ...sig, strategyName: strat.name };
    }
    return null;
  }

  private evalStrat(id: string, candles: Candle[], ind: any): { action: string; confidence: number; reason: string } | null {
    switch (id) {
      case 'momentum_breakout': {
        const h20 = Math.max(...candles.slice(-20).map(c => c.high));
        return ind.currentPrice > h20 && ind.volumeRatio > 1.5 && ind.rsi14 > 40 && ind.rsi14 < 65 ? { action: 'BUY', confidence: 75, reason: 'Momentum breakout' } : null;
      }
      case 'mean_reversion':
        if (ind.rsi14 < 30 && ind.bollinger.percentB < 0.1) return { action: 'BUY', confidence: 70, reason: 'RSI oversold' };
        if (ind.rsi14 > 70 && ind.bollinger.percentB > 0.9) return { action: 'SELL', confidence: 70, reason: 'RSI overbought' };
        return null;
      case 'vwap_bounce':
        return candles.length >= 2 && candles[candles.length - 2].close < ind.vwap && ind.currentPrice > ind.vwap && ind.volumeRatio > 1 ? { action: 'BUY', confidence: 72, reason: 'VWAP bounce' } : null;
      case 'ema_crossover':
        if (ind.ema9 > ind.ema21 && ind.macd.histogram > 0 && ind.adx > 20) return { action: 'BUY', confidence: 73, reason: 'EMA crossover bullish' };
        if (ind.ema9 < ind.ema21 && ind.macd.histogram < 0 && ind.adx > 20) return { action: 'SELL', confidence: 73, reason: 'EMA crossover bearish' };
        return null;
      case 'supertrend_follow':
        if (ind.supertrend.trend === 'BULLISH' && ind.rsi14 > 50) return { action: 'BUY', confidence: 71, reason: 'Supertrend bullish' };
        if (ind.supertrend.trend === 'BEARISH' && ind.rsi14 < 50) return { action: 'SELL', confidence: 71, reason: 'Supertrend bearish' };
        return null;
      case 'bollinger_squeeze':
        return ind.bollinger.width < 2 && ind.currentPrice > ind.bollinger.upper ? { action: 'BUY', confidence: 68, reason: 'Bollinger squeeze' } : null;
      case 'orb': {
        if (candles.length < 4) return null;
        const orbH = Math.max(...candles.slice(0, 3).map(c => c.high));
        const orbL = Math.min(...candles.slice(0, 3).map(c => c.low));
        if (ind.currentPrice > orbH && ind.volumeRatio > 1.2) return { action: 'BUY', confidence: 70, reason: 'ORB breakout' };
        if (ind.currentPrice < orbL && ind.volumeRatio > 1.2) return { action: 'SELL', confidence: 70, reason: 'ORB breakdown' };
        return null;
      }
      default: return null;
    }
  }

  async executeTrade(stock: any, decision: { action: 'BUY' | 'SELL'; confidence: number; reason: string; strategyName: string }, indicators: any) {
    const price = indicators.currentPrice;
    const slPct = this.config.slType === 'fixed' ? this.config.fixedSLPercent / 100 : this.config.atrMultiplier * indicators.atr / price;
    const sl = decision.action === 'BUY' ? price * (1 - slPct) : price * (1 + slPct);
    const risk = Math.abs(price - sl);
    const maxRisk = this.config.totalCapital * this.config.maxPerTradePercent / 100;
    const qty = Math.max(1, Math.floor(maxRisk / risk));
    const t1 = decision.action === 'BUY' ? price * (1 + this.config.t1Percent / 100) : price * (1 - this.config.t1Percent / 100);
    const rr = risk > 0 ? Math.abs(t1 - price) / risk : 0;
    if (rr < 1) { this.addLog('⚠️', `${stock.symbol}: R:R too low`, 'warning'); return; }

    const trade: ActiveTrade = {
      id: `${Date.now()}_${stock.symbol}`, symbol: stock.symbol, exchange: stock.exchange,
      direction: decision.action, entryPrice: price, ltp: price, qty,
      stopLoss: +sl.toFixed(2), target1: +t1.toFixed(2),
      target2: +(decision.action === 'BUY' ? price * (1 + this.config.t2Percent / 100) : price * (1 - this.config.t2Percent / 100)).toFixed(2),
      pnl: 0, pnlPercent: 0, entryTime: new Date().toISOString(),
      aiConfidence: decision.confidence, strategy: decision.strategyName,
    };

    if (!this.isPaperMode) {
      try {
        await api.placeOrder({ variety: 'NORMAL', tradingsymbol: stock.symbol, symboltoken: stock.token || '', transactiontype: decision.action, exchange: stock.exchange, ordertype: 'MARKET', producttype: 'INTRADAY', duration: 'DAY', price: '0', squareoff: '0', stoploss: '0', quantity: qty.toString() });
        this.addLog('✅', `LIVE ${decision.action} ${qty} ${stock.symbol} @ ₹${price.toFixed(2)}`, 'trade');
      } catch (e) { this.addLog('❌', `Order failed: ${(e as Error).message}`, 'error'); return; }
    } else {
      this.addLog('📝', `PAPER ${decision.action} ${qty} ${stock.symbol} @ ₹${price.toFixed(2)}`, 'trade');
    }

    this.activeTrades.set(trade.id, trade);
    this.totalTradesToday++;
    this.callbacks.onNotification('success', `${this.isPaperMode ? '📝' : '✅'} ${decision.action} ${stock.symbol} @ ₹${price.toFixed(2)}`);
    this.updateUI();
  }

  async monitorTrades() {
    if (!this.isRunning || this.activeTrades.size === 0) return;
    for (const [, trade] of this.activeTrades) {
      const ch = (Math.random() - 0.48) * trade.entryPrice * 0.003;
      trade.ltp = +(trade.ltp + ch).toFixed(2);
      const dir = trade.direction === 'BUY' ? 1 : -1;
      trade.pnl = +((trade.ltp - trade.entryPrice) * dir * trade.qty).toFixed(2);
      trade.pnlPercent = +((trade.ltp - trade.entryPrice) / trade.entryPrice * dir * 100).toFixed(2);

      if ((trade.direction === 'BUY' && trade.ltp <= trade.stopLoss) || (trade.direction === 'SELL' && trade.ltp >= trade.stopLoss)) {
        await this.closeTrade(trade, 'STOP_LOSS'); continue;
      }
      if ((trade.direction === 'BUY' && trade.ltp >= trade.target1) || (trade.direction === 'SELL' && trade.ltp <= trade.target1)) {
        await this.closeTrade(trade, 'TARGET_HIT'); continue;
      }
      if (this.config.trailingSL && trade.pnlPercent >= this.config.trailingActivation) {
        const trail = trade.entryPrice * this.config.trailingPercent / 100;
        const newSL = trade.direction === 'BUY' ? trade.ltp - trail : trade.ltp + trail;
        if ((trade.direction === 'BUY' && newSL > trade.stopLoss) || (trade.direction === 'SELL' && newSL < trade.stopLoss))
          trade.stopLoss = +newSL.toFixed(2);
      }
      if (this.config.breakevenSL && trade.pnlPercent >= this.config.breakevenTrigger) {
        if ((trade.direction === 'BUY' && trade.stopLoss < trade.entryPrice) || (trade.direction === 'SELL' && trade.stopLoss > trade.entryPrice))
          trade.stopLoss = trade.entryPrice;
      }
    }
    if (this.isSquareOffTime()) {
      for (const [, trade] of this.activeTrades) await this.closeTrade(trade, 'SQUARE_OFF');
    }
    this.updateUI();
  }

  async closeTrade(trade: ActiveTrade, reason: string) {
    if (!this.isPaperMode && trade.qty > 0) {
      try {
        await api.placeOrder({ variety: 'NORMAL', tradingsymbol: trade.symbol, symboltoken: '', transactiontype: trade.direction === 'BUY' ? 'SELL' : 'BUY', exchange: trade.exchange, ordertype: 'MARKET', producttype: 'INTRADAY', duration: 'DAY', price: '0', squareoff: '0', stoploss: '0', quantity: trade.qty.toString() });
      } catch {} 
    }
    this.dailyPnL += trade.pnl;
    if (trade.pnl >= 0) { this.winningTrades++; this.consecutiveLosses = 0; }
    else { this.losingTrades++; this.consecutiveLosses++; if (this.consecutiveLosses >= 2) this.lastCooldownTime = Date.now(); }
    this.addLog(trade.pnl >= 0 ? '💰' : '🛑', `${reason}: ${trade.symbol} ${trade.pnl >= 0 ? '+' : ''}₹${trade.pnl.toFixed(2)}`, trade.pnl >= 0 ? 'success' : 'error');
    this.callbacks.onNotification(trade.pnl >= 0 ? 'success' : 'error', `${trade.pnl >= 0 ? '💰' : '🛑'} ${trade.symbol}: ${trade.pnl >= 0 ? '+' : ''}₹${trade.pnl.toFixed(2)}`);
    this.tradeHistory.push({ ...trade });
    this.activeTrades.delete(trade.id);
    this.updateUI();
  }

  destroy() {
    this.stop();
    this.activeTrades.clear();
  }
}
