import { useState, useMemo } from 'react';
import GlassCard from '@/components/Common/GlassCard';
import PillButton from '@/components/Common/PillButton';
import Badge from '@/components/Common/Badge';
import ProgressBar from '@/components/Common/ProgressBar';
import Disclaimer from '@/components/Common/Disclaimer';
import StockSearchUniversal from '@/components/Search/StockSearchUniversal';
import { runBacktest, type BacktestConfig, type BacktestResult } from '@/services/backtestEngine';
import { generateSampleCandles } from '@/utils/sampleData';
import { formatINR, formatPercent } from '@/utils/formatters';
import { Loader2 } from 'lucide-react';
import type { StockSearchResult } from '@/types/trading';

const strategies = [
  { id: 'momentum_breakout', name: 'Momentum Breakout' },
  { id: 'mean_reversion', name: 'Mean Reversion' },
  { id: 'vwap_bounce', name: 'VWAP Bounce' },
  { id: 'ema_crossover', name: 'EMA Crossover' },
  { id: 'supertrend_follow', name: 'Supertrend Follow' },
  { id: 'bollinger_squeeze', name: 'Bollinger Squeeze' },
  { id: 'orb', name: 'Opening Range Breakout' },
];

const quickPeriods = [
  { label: '3M', days: 90 },
  { label: '6M', days: 180 },
  { label: '1Y', days: 365 },
  { label: '2Y', days: 730 },
];

const BacktestPanel = () => {
  const [selectedStock, setSelectedStock] = useState<StockSearchResult | null>(null);
  const [strategy, setStrategy] = useState(strategies[0].id);
  const [capital, setCapital] = useState(200000);
  const [slPct, setSlPct] = useState(1.5);
  const [targetPct, setTargetPct] = useState(3);
  const [posSizePct, setPosSizePct] = useState(5);
  const [trailingSL, setTrailingSL] = useState(true);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [error, setError] = useState('');

  const handleRun = async () => {
    setRunning(true);
    setError('');
    setResult(null);
    setProgress(0);
    try {
      const candles = generateSampleCandles(500, selectedStock ? 2400 : 22400);
      const config: BacktestConfig = {
        symbol: selectedStock?.symbol || 'NIFTY',
        exchange: selectedStock?.exchange || 'NSE',
        symbolToken: selectedStock?.token || '26000',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        timeframe: 'FIVE_MINUTE',
        initialCapital: capital,
        strategy,
        stopLossPercent: slPct,
        target1Percent: targetPct,
        target2Percent: targetPct * 1.5,
        target3Percent: targetPct * 2,
        trailingSL,
        trailingPercent: 0.8,
        breakevenSL: false,
        partialBooking: false,
        positionSizePercent: posSizePct,
      };
      const res = await runBacktest(config, candles, setProgress);
      setResult(res);
    } catch (e) {
      setError((e as Error).message);
    }
    setRunning(false);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">🧪 Backtest Your Strategy</h2>

      {/* Config */}
      <GlassCard>
        <p className="text-sm font-bold mb-2">Configuration</p>
        <StockSearchUniversal onSelect={setSelectedStock} placeholder="Search stock to backtest..." />
        {selectedStock && <p className="text-xs mt-1 text-info">Selected: {selectedStock.symbol} ({selectedStock.exchange})</p>}

        <p className="text-xs font-bold mt-3 mb-1">Strategy</p>
        <div className="flex gap-1.5 flex-wrap">
          {strategies.map(s => (
            <PillButton key={s.id} active={strategy === s.id} onClick={() => setStrategy(s.id)}>
              {s.name}
            </PillButton>
          ))}
        </div>

        <div className="flex gap-2 mt-3">
          {quickPeriods.map(p => (
            <PillButton key={p.label} active={false} onClick={() => {}}>{p.label}</PillButton>
          ))}
        </div>

        <div className="mt-3 space-y-2">
          <div className="flex justify-between text-xs">
            <span>Capital</span><span className="font-mono">{formatINR(capital)}</span>
          </div>
          <input type="range" min={50000} max={1000000} step={10000} value={capital} onChange={e => setCapital(+e.target.value)} className="w-full accent-info" />

          <div className="flex justify-between text-xs"><span>Stop Loss</span><span className="font-mono">{slPct}%</span></div>
          <input type="range" min={0.5} max={5} step={0.1} value={slPct} onChange={e => setSlPct(+e.target.value)} className="w-full accent-loss" />

          <div className="flex justify-between text-xs"><span>Target</span><span className="font-mono">{targetPct}%</span></div>
          <input type="range" min={1} max={10} step={0.5} value={targetPct} onChange={e => setTargetPct(+e.target.value)} className="w-full accent-profit" />

          <div className="flex justify-between text-xs"><span>Position Size</span><span className="font-mono">{posSizePct}%</span></div>
          <input type="range" min={1} max={20} step={1} value={posSizePct} onChange={e => setPosSizePct(+e.target.value)} className="w-full accent-info" />

          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={trailingSL} onChange={e => setTrailingSL(e.target.checked)} className="accent-info" />
            Trailing Stop Loss
          </label>
        </div>

        <button onClick={handleRun} disabled={running}
          className="w-full h-12 mt-3 rounded-xl bg-gradient-to-r from-ai to-info text-foreground font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
          {running ? <><Loader2 size={16} className="animate-spin" /> Running... {progress}%</> : '🚀 Run Backtest'}
        </button>
        {running && <ProgressBar value={progress} showLabel className="mt-2" />}
        {error && <p className="text-xs text-loss mt-2">{error}</p>}
      </GlassCard>

      {/* Results */}
      {result && <BacktestResultsView result={result} strategy={strategies.find(s => s.id === strategy)?.name || strategy} />}

      <Disclaimer />
      <p className="text-center text-[10px] text-muted-foreground/50 italic">Made with ❤️ by Shahrukh</p>
    </div>
  );
};

const BacktestResultsView: React.FC<{ result: BacktestResult; strategy: string }> = ({ result, strategy }) => {
  const [showTrades, setShowTrades] = useState(false);

  const stats = [
    ['Trades', `${result.totalTrades} (${result.winningTrades}W/${result.losingTrades}L)`],
    ['Win Rate', `${result.winRate.toFixed(1)}%`],
    ['Profit Factor', result.profitFactor === Infinity ? '∞' : result.profitFactor.toFixed(2)],
    ['Avg Win', result.avgWin > 0 ? `+${formatINR(result.avgWin)}` : '—'],
    ['Avg Loss', result.avgLoss > 0 ? `-${formatINR(result.avgLoss)}` : '—'],
    ['Expectancy', formatINR(result.expectancy)],
    ['Max Win', result.largestWin > 0 ? `+${formatINR(result.largestWin)}` : '—'],
    ['Max Loss', result.largestLoss < 0 ? formatINR(result.largestLoss) : '—'],
    ['Max DD', `-${result.maxDrawdownPercent.toFixed(1)}%`],
    ['Sharpe', result.sharpeRatio.toFixed(2)],
    ['Calmar', result.calmarRatio.toFixed(2)],
    ['Recovery', result.recoveryFactor.toFixed(2)],
    ['Max Cons. Wins', String(result.maxConsecutiveWins)],
    ['Max Cons. Losses', String(result.maxConsecutiveLosses)],
  ];

  return (
    <div className="space-y-3">
      <GlassCard>
        <p className="text-sm font-bold">📊 BACKTEST RESULTS</p>
        <p className="text-[11px] text-muted-foreground">{strategy}</p>

        <div className={`rounded-xl p-3 mt-2 text-center ${result.netPnL >= 0 ? 'bg-profit/10' : 'bg-loss/10'}`}>
          <p className="text-xs text-muted-foreground">NET P&L</p>
          <p className={`text-2xl font-mono font-bold ${result.netPnL >= 0 ? 'text-profit' : 'text-loss'}`}>
            {result.netPnL >= 0 ? '+' : ''}{formatINR(result.netPnL)}
          </p>
          <p className={`text-sm font-mono ${result.netPnLPercent >= 0 ? 'text-profit' : 'text-loss'}`}>
            ({formatPercent(result.netPnLPercent)})
          </p>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>Start: {formatINR(result.startingCapital)}</span>
            <span>End: {formatINR(result.endingCapital)}</span>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-3 gap-2">
        {stats.map(([label, value]) => (
          <div key={label} className="bg-card rounded-lg p-2 border border-border">
            <p className="text-[10px] text-muted-foreground">{label}</p>
            <p className="text-xs font-bold font-mono">{value}</p>
          </div>
        ))}
      </div>

      {/* Monthly Returns */}
      {result.monthlyReturns.length > 0 && (
        <GlassCard>
          <p className="text-xs font-bold mb-2">📅 Monthly Returns</p>
          <div className="space-y-1">
            {result.monthlyReturns.map(m => (
              <div key={m.month} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{m.month}</span>
                <div className="flex-1 mx-2"><ProgressBar value={Math.min(100, Math.abs(m.pnl / (result.startingCapital * 0.1) * 100))} /></div>
                <span className={`font-mono ${m.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>{m.pnl >= 0 ? '+' : ''}{formatINR(m.pnl)}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Verdict */}
      <GlassCard className="!border-info/20">
        <p className="text-xs font-bold mb-2">📋 Strategy Verdict</p>
        {result.verdict.map((v, i) => <p key={i} className="text-xs">{v}</p>)}
      </GlassCard>

      {/* Trade Log */}
      <GlassCard>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold">📋 Trade Log ({result.trades.length})</p>
          <button onClick={() => setShowTrades(!showTrades)} className="text-[11px] text-info">{showTrades ? 'Hide' : 'Show'}</button>
        </div>
        {showTrades && (
          <div className="max-h-[250px] overflow-y-auto space-y-1">
            {result.trades.map((t, i) => (
              <div key={i} className="flex items-center justify-between text-[11px] py-1 border-t border-border/30">
                <span>
                  <Badge variant={t.action === 'BUY' ? 'success' : 'danger'} className="mr-1">{t.action}</Badge>
                  @{t.entryPrice.toFixed(0)} → {t.exitPrice.toFixed(0)}
                </span>
                <span className={`font-mono ${t.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                  {t.pnl >= 0 ? '+' : ''}{formatINR(t.pnl)}
                </span>
                <Badge variant="info">{t.exitReason}</Badge>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      <p className="text-center text-[10px] text-muted-foreground/50 italic">Made with ❤️ by Shahrukh</p>
    </div>
  );
};

export default BacktestPanel;
