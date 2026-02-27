const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

async function callGemini(apiKey: string, prompt: string) {
  const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 2048, responseMimeType: 'application/json' },
    }),
  });
  if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  try { return JSON.parse(text); } catch { return { raw: text }; }
}

export const analyzeStock = async (apiKey: string, symbol: string, data: {
  indicators: any; patterns: any[]; candles: any[];
}): Promise<any> => {
  if (!apiKey) throw new Error('Gemini API key not configured');
  const { indicators, patterns, candles } = data;
  const lastCandle = candles[candles.length - 1];

  const prompt = `You are a professional stock market analyst. Analyze ${symbol} and return a JSON trading signal.

Current Price: ₹${lastCandle?.close}
Technical Indicators:
- SMA20: ${indicators?.sma20?.toFixed(2)}, SMA50: ${indicators?.sma50?.toFixed(2)}, SMA200: ${indicators?.sma200?.toFixed(2)}
- EMA9: ${indicators?.ema9?.toFixed(2)}, EMA21: ${indicators?.ema21?.toFixed(2)}
- RSI(14): ${indicators?.rsi14?.toFixed(2)}
- MACD: ${indicators?.macd?.macd?.toFixed(2)}, Signal: ${indicators?.macd?.signal?.toFixed(2)}, Histogram: ${indicators?.macd?.histogram?.toFixed(2)}
- Bollinger: Upper=${indicators?.bollinger?.upper?.toFixed(2)}, Mid=${indicators?.bollinger?.middle?.toFixed(2)}, Lower=${indicators?.bollinger?.lower?.toFixed(2)}
- Supertrend: ${indicators?.supertrend?.trend} at ${indicators?.supertrend?.value?.toFixed(2)}
- ADX: ${indicators?.adx?.toFixed(2)}, ATR: ${indicators?.atr?.toFixed(2)}
- VWAP: ${indicators?.vwap?.toFixed(2)}
- Volume Ratio: ${indicators?.volumeRatio?.toFixed(2)}x
Candle Patterns: ${patterns?.map(p => `${p.name}(${p.type})`).join(', ') || 'None'}

Return JSON: { "action": "BUY"|"SELL"|"NEUTRAL", "confidence": 0-100, "entryPrice": number, "stopLoss": number, "target1": number, "target2": number, "target3": number, "reasoning": [{"icon": "✅"|"❌"|"⚠️", "text": "reason"}], "riskLevel": "LOW"|"MEDIUM"|"HIGH", "tradeScore": 0-100, "detectedPatterns": ["pattern names"] }`;

  return callGemini(apiKey, prompt);
};

export const analyzeOptionChain = async (apiKey: string, data: {
  instrument: string; spotPrice: number; chainData: any[];
}): Promise<any> => {
  if (!apiKey) throw new Error('Gemini API key not configured');
  const { instrument, spotPrice, chainData } = data;
  const totalCallOI = chainData.reduce((s: number, r: any) => s + (r.callOI || 0), 0);
  const totalPutOI = chainData.reduce((s: number, r: any) => s + (r.putOI || 0), 0);
  const pcr = totalCallOI > 0 ? (totalPutOI / totalCallOI).toFixed(2) : '0';

  const prompt = `Analyze ${instrument} option chain. Spot: ₹${spotPrice}, PCR: ${pcr}, Total Call OI: ${totalCallOI}, Total Put OI: ${totalPutOI}.
Top 5 strikes by OI: ${JSON.stringify(chainData.slice(0, 5).map(r => ({ strike: r.strike, callOI: r.callOI, putOI: r.putOI, callLTP: r.callLTP, putLTP: r.putLTP })))}

Return JSON: { "outlook": "BULLISH"|"BEARISH"|"NEUTRAL", "confidence": 0-100, "pcr": number, "maxPain": number, "expectedRange": { "low": number, "high": number }, "strategies": [{ "name": string, "type": "BUY"|"SELL", "risk": "LOW"|"MEDIUM"|"HIGH", "legs": [string], "maxProfit": number, "maxLoss": number, "breakeven": number, "riskReward": string, "reasoning": string, "winProbability": number }] }`;

  return callGemini(apiKey, prompt);
};

export const getTradeRecommendation = async (apiKey: string, data: any): Promise<any> => {
  if (!apiKey) throw new Error('Gemini API key not configured');
  return callGemini(apiKey, `Provide a trade recommendation based on: ${JSON.stringify(data)}. Return JSON with action, confidence, entry, stopLoss, targets.`);
};
