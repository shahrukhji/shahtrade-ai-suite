import type { Candle } from '@/types/trading';

export interface PatternResult { time: number; pattern: string; type: 'bullish' | 'bearish' | 'neutral'; }
export interface CandlePattern { name: string; type: 'BULLISH' | 'BEARISH'; reliability: number; }

const bodySize = (c: Candle) => Math.abs(c.close - c.open);
const upperWick = (c: Candle) => c.high - Math.max(c.open, c.close);
const lowerWick = (c: Candle) => Math.min(c.open, c.close) - c.low;
const isBullish = (c: Candle) => c.close > c.open;
const isBearish = (c: Candle) => c.close < c.open;
const range = (c: Candle) => c.high - c.low;

export const detectPatterns = (candles: Candle[]): CandlePattern[] => {
  if (candles.length < 3) return [];
  const patterns: CandlePattern[] = [];
  const c = candles[candles.length - 1], p = candles[candles.length - 2], pp = candles[candles.length - 3];
  const body = bodySize(c), r = range(c);
  if (r > 0 && body / r < 0.1) patterns.push({ name: 'Doji', type: isBullish(p) ? 'BEARISH' : 'BULLISH', reliability: 3 });
  if (r > 0 && lowerWick(c) > body * 2 && upperWick(c) < body * 0.5 && isBearish(p)) patterns.push({ name: 'Hammer', type: 'BULLISH', reliability: 4 });
  if (r > 0 && upperWick(c) > body * 2 && lowerWick(c) < body * 0.5 && isBullish(p)) patterns.push({ name: 'Shooting Star', type: 'BEARISH', reliability: 4 });
  if (isBearish(p) && isBullish(c) && c.open <= p.close && c.close >= p.open) patterns.push({ name: 'Bullish Engulfing', type: 'BULLISH', reliability: 5 });
  if (isBullish(p) && isBearish(c) && c.open >= p.close && c.close <= p.open) patterns.push({ name: 'Bearish Engulfing', type: 'BEARISH', reliability: 5 });
  if (isBearish(pp) && bodySize(p) < bodySize(pp) * 0.3 && isBullish(c) && c.close > (pp.open + pp.close) / 2) patterns.push({ name: 'Morning Star', type: 'BULLISH', reliability: 5 });
  if (isBullish(pp) && bodySize(p) < bodySize(pp) * 0.3 && isBearish(c) && c.close < (pp.open + pp.close) / 2) patterns.push({ name: 'Evening Star', type: 'BEARISH', reliability: 5 });
  if ([pp, p, c].every(x => isBullish(x)) && p.close > pp.close && c.close > p.close) patterns.push({ name: 'Three White Soldiers', type: 'BULLISH', reliability: 4 });
  if ([pp, p, c].every(x => isBearish(x)) && p.close < pp.close && c.close < p.close) patterns.push({ name: 'Three Black Crows', type: 'BEARISH', reliability: 4 });
  if (r > 0 && upperWick(c) / r < 0.05 && lowerWick(c) / r < 0.05) patterns.push({ name: 'Marubozu', type: isBullish(c) ? 'BULLISH' : 'BEARISH', reliability: 3 });
  return patterns;
};

export const detectDoji = (_candles: Candle[]): PatternResult[] => [];
export const detectHammer = (_candles: Candle[]): PatternResult[] => [];
export const detectEngulfing = (_candles: Candle[]): PatternResult[] => [];
export const detectMorningStar = (_candles: Candle[]): PatternResult[] => [];
export const detectEveningStar = (_candles: Candle[]): PatternResult[] => [];
export const detectAllPatterns = (_candles: Candle[]): PatternResult[] => [];
