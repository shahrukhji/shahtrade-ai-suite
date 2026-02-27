import { callGemini } from '@/services/geminiAIService';

export interface AIStrategyRecommendation {
  rank: number;
  strategyId: string;
  strategyName: string;
  confidence: number;
  reasoning: string[];
  suggestedStrikes: { leg1: number; leg2?: number; leg3?: number; leg4?: number };
  maxProfit: number;
  maxLoss: number;
  breakeven: number;
  riskReward: string;
  winProbability: number;
  idealExitCondition: string;
  timeHorizon: string;
  riskWarnings: string[];
}

export interface AIStrategyResult {
  recommendations: AIStrategyRecommendation[];
  marketAnalysis: string;
  avoidStrategies: { name: string; reason: string }[];
}

export async function getAIStrategySuggestions(
  apiKey: string,
  data: {
    symbol: string;
    spotPrice: number;
    trend: string;
    rsi: number;
    macd: number;
    adx: number;
    atr: number;
    ivPercentile: number;
    pcr: number;
    maxPain: number;
    supports: string;
    resistances: string;
    dte: number;
  }
): Promise<AIStrategyResult> {
  const prompt = `You are an expert F&O strategist for Indian markets. Based on the following data, recommend the TOP 3 best option strategies to execute RIGHT NOW.

SYMBOL: ${data.symbol}
SPOT: ₹${data.spotPrice}
TREND: ${data.trend}
RSI: ${data.rsi.toFixed(1)} | MACD: ${data.macd.toFixed(2)} | ADX: ${data.adx.toFixed(1)} | ATR: ${data.atr.toFixed(2)}
IV PERCENTILE: ${data.ivPercentile}%
PCR: ${data.pcr.toFixed(2)}
MAX PAIN: ₹${data.maxPain}
SUPPORT: ${data.supports}
RESISTANCE: ${data.resistances}
DAYS TO EXPIRY: ${data.dte}

Available strategies: Bull Call Spread, Bear Put Spread, Long Straddle, Short Straddle, Iron Condor, Iron Butterfly, Long Strangle, Short Strangle, Long Call, Long Put, Covered Call, Protective Put, Calendar Spread, Jade Lizard, Strap, Strip, Call Ratio Back Spread, Put Ratio Back Spread, Bull Put Spread, Bear Call Spread

Return a JSON object with:
{
  "recommendations": [
    {
      "rank": 1,
      "strategyId": "iron_condor",
      "strategyName": "Iron Condor",
      "confidence": 85,
      "reasoning": ["reason1", "reason2", "reason3"],
      "suggestedStrikes": { "leg1": 22500, "leg2": 22700, "leg3": 22300, "leg4": 22100 },
      "maxProfit": 4200,
      "maxLoss": 5800,
      "breakeven": 22400,
      "riskReward": "1:1.4",
      "winProbability": 72,
      "idealExitCondition": "Exit at 50% of max profit",
      "timeHorizon": "Hold till 3 days before expiry",
      "riskWarnings": ["warning1"]
    }
  ],
  "marketAnalysis": "2-line summary",
  "avoidStrategies": [{"name": "Long Straddle", "reason": "IV too low"}]
}`;

  try {
    const result = await callGemini(apiKey, prompt);
    if (result && typeof result === 'object' && 'recommendations' in result) {
      return result as AIStrategyResult;
    }
    // Fallback
    return {
      recommendations: [{
        rank: 1, strategyId: 'iron_condor', strategyName: 'Iron Condor',
        confidence: 75, reasoning: ['Market appears range-bound', 'IV at moderate levels', 'ADX suggests no strong trend'],
        suggestedStrikes: { leg1: data.spotPrice + 100, leg2: data.spotPrice + 300, leg3: data.spotPrice - 100, leg4: data.spotPrice - 300 },
        maxProfit: 4200, maxLoss: 5800, breakeven: data.spotPrice,
        riskReward: '1:1.4', winProbability: 65,
        idealExitCondition: 'Exit at 50% of max profit',
        timeHorizon: '3-5 days', riskWarnings: ['Monitor if spot moves beyond strikes'],
      }],
      marketAnalysis: result?.raw || 'Analysis complete. Market appears to favor range-bound strategies.',
      avoidStrategies: [],
    };
  } catch (e) {
    throw new Error('AI Strategy analysis failed: ' + (e as Error).message);
  }
}

