import { useState } from 'react';
import GlassCard from '@/components/Common/GlassCard';
import Badge from '@/components/Common/Badge';
import CircularProgress from '@/components/Common/CircularProgress';
import { useGemini } from '@/context/GeminiContext';
import { getAIStrategySuggestions, type AIStrategyResult } from '@/services/aiStrategyEngine';
import { Loader2 } from 'lucide-react';
import { formatINR } from '@/utils/formatters';

interface Props {
  symbol?: string;
  spotPrice?: number;
  indicators?: any;
  onApplyStrategy?: (strategyId: string, strikes: any) => void;
}

const AIStrategySuggestion: React.FC<Props> = ({ symbol = 'NIFTY', spotPrice = 22400, indicators, onApplyStrategy }) => {
  const { apiKey } = useGemini();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIStrategyResult | null>(null);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!apiKey) { setError('Configure Gemini API key in Settings first'); return; }
    setLoading(true);
    setError('');
    try {
      const data = {
        symbol, spotPrice,
        trend: indicators?.supertrend?.trend || 'NEUTRAL',
        rsi: indicators?.rsi14 || 50,
        macd: indicators?.macd?.histogram || 0,
        adx: indicators?.adx || 25,
        atr: indicators?.atr || spotPrice * 0.01,
        ivPercentile: 45,
        pcr: 0.85,
        maxPain: spotPrice,
        supports: `${spotPrice - 200}, ${spotPrice - 400}`,
        resistances: `${spotPrice + 200}, ${spotPrice + 400}`,
        dte: 5,
      };
      const res = await getAIStrategySuggestions(apiKey, data);
      setResult(res);
    } catch (e) {
      setError((e as Error).message);
    }
    setLoading(false);
  };

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="space-y-3">
      <button onClick={handleAnalyze} disabled={loading}
        className="w-full h-12 rounded-xl bg-gradient-to-r from-ai to-info text-foreground font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
        {loading ? <><Loader2 size={16} className="animate-spin" /> AI Analyzing...</> : '🤖 Which Strategy Should I Use?'}
      </button>

      {error && <p className="text-xs text-loss text-center">{error}</p>}

      {result && (
        <>
          {result.marketAnalysis && (
            <GlassCard className="!p-3">
              <p className="text-xs font-bold mb-1">📊 Market Analysis</p>
              <p className="text-xs text-muted-foreground">{result.marketAnalysis}</p>
            </GlassCard>
          )}

          {result.recommendations.map((rec, i) => (
            <GlassCard key={i} className={`!p-3 ${i === 0 ? '!border-profit/30' : ''}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{medals[i] || '🏅'}</span>
                  <div>
                    <p className="text-sm font-bold">#{rec.rank} {rec.strategyName}</p>
                  </div>
                </div>
                <CircularProgress value={rec.confidence} size={40} strokeWidth={3} />
              </div>

              {rec.reasoning.map((r, j) => (
                <p key={j} className="text-[11px] text-muted-foreground">✅ {r}</p>
              ))}

              <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                <div className="bg-background/30 rounded-lg p-2">
                  <p className="text-[10px] text-muted-foreground">Max Profit</p>
                  <p className="font-mono font-bold text-profit">{formatINR(rec.maxProfit)}</p>
                </div>
                <div className="bg-background/30 rounded-lg p-2">
                  <p className="text-[10px] text-muted-foreground">Max Loss</p>
                  <p className="font-mono font-bold text-loss">{formatINR(rec.maxLoss)}</p>
                </div>
                <div className="bg-background/30 rounded-lg p-2">
                  <p className="text-[10px] text-muted-foreground">R:R</p>
                  <p className="font-mono font-bold">{rec.riskReward}</p>
                </div>
                <div className="bg-background/30 rounded-lg p-2">
                  <p className="text-[10px] text-muted-foreground">Win Prob</p>
                  <p className="font-mono font-bold">{rec.winProbability}%</p>
                </div>
              </div>

              {rec.riskWarnings.length > 0 && (
                <div className="mt-2">
                  {rec.riskWarnings.map((w, j) => <p key={j} className="text-[10px] text-warning">⚠️ {w}</p>)}
                </div>
              )}

              <button onClick={() => onApplyStrategy?.(rec.strategyId, rec.suggestedStrikes)}
                className="w-full mt-2 h-10 rounded-lg bg-info/20 text-info text-xs font-bold">📋 Apply This Strategy</button>
            </GlassCard>
          ))}

          {result.avoidStrategies.length > 0 && (
            <GlassCard className="!p-3 !border-loss/20">
              <p className="text-xs font-bold mb-1">⛔ AVOID THESE</p>
              {result.avoidStrategies.map((a, i) => (
                <p key={i} className="text-[11px] text-muted-foreground">• <span className="font-bold">{a.name}</span> — {a.reason}</p>
              ))}
            </GlassCard>
          )}
        </>
      )}
    </div>
  );
};

export default AIStrategySuggestion;
