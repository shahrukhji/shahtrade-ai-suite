import GlassCard from '@/components/Common/GlassCard';
import ProgressBar from '@/components/Common/ProgressBar';
import { useSafeMode } from '@/context/SafeModeContext';
import { formatINR } from '@/utils/formatters';

const MicroPnLTracker = () => {
  const { capital, growthHistory } = useSafeMode();
  const startCap = growthHistory.length > 0 ? growthHistory[0].capital : capital;
  const todayProfit = capital - startCap;
  const dailyGoal = startCap * 0.01; // 1% daily goal
  const goalPct = dailyGoal > 0 ? Math.min(100, (Math.max(0, todayProfit) / dailyGoal) * 100) : 0;

  // Calculate weekly/monthly from growth history
  const weekEntries = growthHistory.slice(-7);
  const monthEntries = growthHistory.slice(-30);
  const weekPnL = weekEntries.length > 0 ? capital - weekEntries[0].capital : 0;
  const monthPnL = monthEntries.length > 0 ? capital - monthEntries[0].capital : 0;

  return (
    <GlassCard>
      <p className="text-sm font-bold mb-2">📊 MICRO P&L TRACKER</p>
      <div className="space-y-1 text-xs mb-3">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Starting Balance:</span>
          <span className="font-mono">{formatINR(startCap)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Current Balance:</span>
          <span className="font-mono font-bold text-profit">{formatINR(capital)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Total Profit:</span>
          <span className={`font-mono font-bold ${todayProfit >= 0 ? 'text-profit' : 'text-loss'}`}>
            {todayProfit >= 0 ? '+' : ''}{formatINR(todayProfit)}
          </span>
        </div>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-[10px] mb-1">
          <span className="text-muted-foreground">🎯 Daily Goal: {formatINR(dailyGoal)}</span>
          <span className="font-mono">{goalPct.toFixed(0)}%</span>
        </div>
        <ProgressBar value={goalPct} />
      </div>

      <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
        <div className="bg-background/30 rounded-lg p-1.5">
          <p className="text-muted-foreground">This Week</p>
          <p className={`font-mono font-bold ${weekPnL >= 0 ? 'text-profit' : 'text-loss'}`}>
            {weekPnL >= 0 ? '+' : ''}{formatINR(weekPnL)}
          </p>
        </div>
        <div className="bg-background/30 rounded-lg p-1.5">
          <p className="text-muted-foreground">This Month</p>
          <p className={`font-mono font-bold ${monthPnL >= 0 ? 'text-profit' : 'text-loss'}`}>
            {monthPnL >= 0 ? '+' : ''}{formatINR(monthPnL)}
          </p>
        </div>
        <div className="bg-background/30 rounded-lg p-1.5">
          <p className="text-muted-foreground">All Time</p>
          <p className={`font-mono font-bold ${todayProfit >= 0 ? 'text-profit' : 'text-loss'}`}>
            {todayProfit >= 0 ? '+' : ''}{formatINR(todayProfit)}
          </p>
        </div>
      </div>

      {todayProfit > 0 && (
        <p className="text-[10px] text-profit mt-2">
          🏦 Your money grew from {formatINR(startCap)} to {formatINR(capital)}! 📈
        </p>
      )}
    </GlassCard>
  );
};

export default MicroPnLTracker;
