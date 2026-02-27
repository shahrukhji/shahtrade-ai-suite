import type { Candle } from '@/types/trading';

export const calcSMA = (data: number[], period: number): number => {
  if (data.length < period) return data[data.length - 1] || 0;
  return data.slice(-period).reduce((s, v) => s + v, 0) / period;
};

export const calcEMA = (data: number[], period: number): number => {
  if (data.length < period) return data[data.length - 1] || 0;
  const k = 2 / (period + 1);
  let ema = calcSMA(data.slice(0, period), period);
  for (let i = period; i < data.length; i++) ema = data[i] * k + ema * (1 - k);
  return ema;
};

export const calcRSI = (data: number[], period = 14): number => {
  if (data.length < period + 1) return 50;
  let gains = 0, losses = 0;
  for (let i = data.length - period; i < data.length; i++) {
    const d = data[i] - data[i - 1];
    if (d > 0) gains += d; else losses -= d;
  }
  if (losses === 0) return 100;
  const rs = (gains / period) / (losses / period);
  return 100 - 100 / (1 + rs);
};

export const calcMACD = (data: number[]): { macd: number; signal: number; histogram: number } => {
  const ema12 = calcEMA(data, 12);
  const ema26 = calcEMA(data, 26);
  const macd = ema12 - ema26;
  const macdValues = data.slice(-9).map(() => macd);
  const signal = calcEMA(macdValues, 9);
  return { macd, signal, histogram: macd - signal };
};

export const calcBollinger = (data: number[], period = 20, mult = 2) => {
  const sma = calcSMA(data, period);
  const slice = data.slice(-period);
  const std = Math.sqrt(slice.reduce((s, v) => s + (v - sma) ** 2, 0) / period);
  const upper = sma + mult * std, lower = sma - mult * std;
  const cur = data[data.length - 1];
  return { upper, middle: sma, lower, width: (upper - lower) / sma * 100, percentB: upper !== lower ? (cur - lower) / (upper - lower) : 0.5 };
};

export const calcStochastic = (highs: number[], lows: number[], closes: number[], period = 14) => {
  const h = Math.max(...highs.slice(-period));
  const l = Math.min(...lows.slice(-period));
  const c = closes[closes.length - 1];
  const k = h !== l ? ((c - l) / (h - l)) * 100 : 50;
  return { k, d: k };
};

export const calcATR = (highs: number[], lows: number[], closes: number[], period = 14): number => {
  if (highs.length < period + 1) return 0;
  let sum = 0;
  for (let i = highs.length - period; i < highs.length; i++) {
    sum += Math.max(highs[i] - lows[i], Math.abs(highs[i] - closes[i - 1]), Math.abs(lows[i] - closes[i - 1]));
  }
  return sum / period;
};

export const calcADX = (highs: number[], lows: number[], closes: number[], period = 14): number => {
  if (highs.length < period * 2) return 25;
  let sumDX = 0;
  for (let i = highs.length - period; i < highs.length; i++) {
    const upMove = highs[i] - highs[i - 1];
    const downMove = lows[i - 1] - lows[i];
    const pDM = upMove > downMove && upMove > 0 ? upMove : 0;
    const mDM = downMove > upMove && downMove > 0 ? downMove : 0;
    if (pDM + mDM > 0) sumDX += Math.abs(pDM - mDM) / (pDM + mDM) * 100;
  }
  return sumDX / period;
};

export const calcVWAP = (highs: number[], lows: number[], closes: number[], volumes: number[]): number => {
  let tpv = 0, vol = 0;
  for (let i = 0; i < closes.length; i++) {
    const tp = (highs[i] + lows[i] + closes[i]) / 3;
    tpv += tp * volumes[i]; vol += volumes[i];
  }
  return vol > 0 ? tpv / vol : closes[closes.length - 1];
};

export const calcSupertrend = (highs: number[], lows: number[], closes: number[], period = 10, mult = 3) => {
  const atr = calcATR(highs, lows, closes, period);
  const c = closes[closes.length - 1];
  const hl2 = (highs[highs.length - 1] + lows[lows.length - 1]) / 2;
  const upper = hl2 + mult * atr, lower = hl2 - mult * atr;
  return { value: c > lower ? lower : upper, trend: c > lower ? 'BULLISH' as const : 'BEARISH' as const };
};

export const calcOBV = (closes: number[], volumes: number[]): number => {
  let obv = 0;
  for (let i = 1; i < closes.length; i++) {
    if (closes[i] > closes[i - 1]) obv += volumes[i];
    else if (closes[i] < closes[i - 1]) obv -= volumes[i];
  }
  return obv;
};

export const calcWilliamsR = (highs: number[], lows: number[], closes: number[], period = 14): number => {
  const h = Math.max(...highs.slice(-period));
  const l = Math.min(...lows.slice(-period));
  return h !== l ? ((h - closes[closes.length - 1]) / (h - l)) * -100 : -50;
};

export const calcCCI = (highs: number[], lows: number[], closes: number[], period = 20): number => {
  const tps = closes.map((c, i) => (highs[i] + lows[i] + c) / 3);
  const sma = calcSMA(tps, period);
  const md = tps.slice(-period).reduce((s, t) => s + Math.abs(t - sma), 0) / period;
  return md > 0 ? (tps[tps.length - 1] - sma) / (0.015 * md) : 0;
};

export const calcAllIndicators = (candles: Candle[]) => {
  if (!candles.length) return null;
  const closes = candles.map(c => c.close);
  const highs = candles.map(c => c.high);
  const lows = candles.map(c => c.low);
  const volumes = candles.map(c => c.volume);
  return {
    sma20: calcSMA(closes, 20), sma50: calcSMA(closes, 50), sma200: calcSMA(closes, 200),
    ema9: calcEMA(closes, 9), ema21: calcEMA(closes, 21), ema50: calcEMA(closes, 50),
    rsi14: calcRSI(closes, 14),
    macd: calcMACD(closes),
    bollinger: calcBollinger(closes),
    stochastic: calcStochastic(highs, lows, closes),
    adx: calcADX(highs, lows, closes),
    atr: calcATR(highs, lows, closes),
    vwap: calcVWAP(highs, lows, closes, volumes),
    supertrend: calcSupertrend(highs, lows, closes),
    obv: calcOBV(closes, volumes),
    williamsR: calcWilliamsR(highs, lows, closes),
    cci: calcCCI(highs, lows, closes),
    currentPrice: closes[closes.length - 1],
    volumeRatio: calcSMA(volumes, 20) > 0 ? volumes[volumes.length - 1] / calcSMA(volumes, 20) : 1,
  };
};

// Legacy exports for backward compat
import type { SMAResult, EMAResult, RSIResult, MACDResult, BollingerResult, SupertrendResult } from '@/types/indicators';
export const calculateSMA = (_candles: Candle[], _period: number): SMAResult[] => [];
export const calculateEMA = (_candles: Candle[], _period: number): EMAResult[] => [];
export const calculateRSI = (_candles: Candle[], _period: number): RSIResult[] => [];
export const calculateMACD = (_candles: Candle[], _fast: number, _slow: number, _signal: number): MACDResult[] => [];
export const calculateBollinger = (_candles: Candle[], _period: number, _stddev: number): BollingerResult[] => [];
export const calculateSupertrend = (_candles: Candle[], _period: number, _multiplier: number): SupertrendResult[] => [];
export const calculateVWAP = (_candles: Candle[]): { time: number; value: number }[] => [];
