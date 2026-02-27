import type { Candle } from '@/types/trading';
import type { SMAResult, EMAResult, RSIResult, MACDResult, BollingerResult, SupertrendResult } from '@/types/indicators';

export const calculateSMA = (_candles: Candle[], _period: number): SMAResult[] => [];
export const calculateEMA = (_candles: Candle[], _period: number): EMAResult[] => [];
export const calculateRSI = (_candles: Candle[], _period: number): RSIResult[] => [];
export const calculateMACD = (_candles: Candle[], _fast: number, _slow: number, _signal: number): MACDResult[] => [];
export const calculateBollinger = (_candles: Candle[], _period: number, _stddev: number): BollingerResult[] => [];
export const calculateSupertrend = (_candles: Candle[], _period: number, _multiplier: number): SupertrendResult[] => [];
export const calculateVWAP = (_candles: Candle[]): { time: number; value: number }[] => [];
