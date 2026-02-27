import type { Candle } from '@/types/trading';

export interface PatternResult { time: number; pattern: string; type: 'bullish' | 'bearish' | 'neutral'; }

export const detectDoji = (_candles: Candle[]): PatternResult[] => [];
export const detectHammer = (_candles: Candle[]): PatternResult[] => [];
export const detectEngulfing = (_candles: Candle[]): PatternResult[] => [];
export const detectMorningStar = (_candles: Candle[]): PatternResult[] => [];
export const detectEveningStar = (_candles: Candle[]): PatternResult[] => [];
export const detectAllPatterns = (_candles: Candle[]): PatternResult[] => [];
