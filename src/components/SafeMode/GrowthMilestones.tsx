import GlassCard from '@/components/Common/GlassCard';
import { useSafeMode } from '@/context/SafeModeContext';
import { MILESTONES } from '@/data/affordableStocks';
import { formatINR } from '@/utils/formatters';

const GrowthMilestones = () => {
  const { capital, growthHistory } = useSafeMode();
  const startCap = growthHistory.length > 0 ? growthHistory[0].capital : capital;
  const growthPct = startCap > 0 ? ((capital - startCap) / startCap) * 100 : 0;
  const days = growthHistory.length || 1;

  // Project future growth
  const dailyRate = days > 1 ? Math.pow(capital / startCap, 1 / days) : 1.003;
  const daysTo = (target: number) => {
    if (capital >= target) return 0;
    if (dailyRate <= 1) return Infinity;
    return Math.ceil(Math.log(target / capital) / Math.log(dailyRate));
  };

  return (
    <GlassCard>
      <p className="text-sm font-bold mb-2">🏆 YOUR TRADING JOURNEY</p>
      <div className="grid grid-cols-3 gap-2 text-center text-[10px] mb-3">
        <div className="bg-background/30 rounded-lg p-1.5">
          <p className="text-muted-foreground">Starting</p>
          <p className="font-mono font-bold">{formatINR(startCap)}</p>
        </div>
        <div className="bg-background/30 rounded-lg p-1.5">
          <p className="text-muted-foreground">Current</p>
          <p className="font-mono font-bold text-profit">{formatINR(capital)}</p>
        </div>
        <div className="bg-background/30 rounded-lg p-1.5">
          <p className="text-muted-foreground">Growth</p>
          <p className={`font-mono font-bold ${growthPct >= 0 ? 'text-profit' : 'text-loss'}`}>
            {growthPct >= 0 ? '+' : ''}{growthPct.toFixed(1)}%
          </p>
        </div>
      </div>

      <p className="text-xs font-bold mb-1.5">🏅 MILESTONES:</p>
      <div className="space-y-1">
        {MILESTONES.map(m => {
          const done = capital >= m.amount;
          const d = daysTo(m.amount);
          return (
            <div key={m.amount} className="flex items-center gap-2 text-xs">
              <span>{done ? '✅' : d < 999 ? '⏳' : '○'}</span>
              <span className={done ? 'text-profit font-bold' : 'text-muted-foreground'}>
                {formatINR(m.amount)} — {m.label}
              </span>
              {!done && d < 999 && (
                <span className="text-[10px] text-muted-foreground ml-auto">~{d}d</span>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-muted-foreground mt-3">💡 Reinvest your profits to grow faster (compounding!)</p>
      <p className="text-center text-[10px] text-muted-foreground/50 mt-2 italic">Made with ❤️ by Shahrukh</p>
    </GlassCard>
  );
};

export default GrowthMilestones;
