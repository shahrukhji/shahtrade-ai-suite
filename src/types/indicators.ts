export interface SMAResult { time: number; value: number; }
export interface EMAResult { time: number; value: number; }
export interface RSIResult { time: number; value: number; }
export interface MACDResult { time: number; macd: number; signal: number; histogram: number; }
export interface BollingerResult { time: number; upper: number; middle: number; lower: number; }
export interface SupertrendResult { time: number; value: number; direction: 'up' | 'down'; }
export interface StochasticResult { time: number; k: number; d: number; }
export interface VWAPResult { time: number; value: number; }
export interface ADXResult { time: number; adx: number; plusDI: number; minusDI: number; }
export interface ATRResult { time: number; value: number; }
export interface OBVResult { time: number; value: number; }
export interface CCIResult { time: number; value: number; }
export interface WilliamsRResult { time: number; value: number; }

export interface IndicatorConfig {
  sma: { period: number; enabled: boolean }[];
  ema: { period: number; enabled: boolean }[];
  rsi: { period: number; enabled: boolean };
  macd: { fast: number; slow: number; signal: number; enabled: boolean };
  bollinger: { period: number; stddev: number; enabled: boolean };
  supertrend: { period: number; multiplier: number; enabled: boolean };
  stochastic: { kPeriod: number; dPeriod: number; enabled: boolean };
  vwap: { enabled: boolean };
  adx: { period: number; enabled: boolean };
  atr: { period: number; enabled: boolean };
  obv: { enabled: boolean };
  cci: { period: number; enabled: boolean };
  williamsR: { period: number; enabled: boolean };
  ichimoku: { enabled: boolean };
  volume: { enabled: boolean };
}
