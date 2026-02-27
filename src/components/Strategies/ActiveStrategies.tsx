import GlassCard from '@/components/Common/GlassCard';
import Badge from '@/components/Common/Badge';
import PnLDisplay from '@/components/Common/PnLDisplay';
import EmptyState from '@/components/Common/EmptyState';
import { useStrategies } from '@/context/StrategiesContext';
import { formatINR } from '@/utils/formatters';

const ActiveStrategies = () => {
  const { activeExecutions, closeExecution } = useStrategies();
  const active = activeExecutions.filter(e => e.status === 'ACTIVE' || e.status === 'PARTIAL');

  if (active.length === 0) {
    return <EmptyState title="No active strategies" description="Select and apply a strategy to start tracking." />;
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-bold">📊 Active Strategies ({active.length})</h3>
      {active.map(exec => (
        <GlassCard key={exec.id} className="!p-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm font-bold">{exec.strategyName} — {exec.symbol}</p>
              <p className="text-[11px] text-muted-foreground">Expiry: {exec.expiry} | DTE: {exec.daysToExpiry}d</p>
            </div>
            <Badge variant="success">ACTIVE</Badge>
          </div>
          {exec.legs.map((leg, i) => (
            <div key={i} className="flex items-center justify-between text-xs py-1 border-t border-border/30">
              <span>
                <Badge variant={leg.action === 'BUY' ? 'success' : 'danger'} className="mr-1">{leg.action}</Badge>
                {leg.strike} {leg.type}
              </span>
              <span className="font-mono">
                @ {formatINR(leg.entryPrice)} → <span className={leg.pnl >= 0 ? 'text-profit' : 'text-loss'}>{formatINR(leg.currentPrice)}</span>
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/30">
            <PnLDisplay value={exec.realizedPnL} percentage={exec.netCost > 0 ? (exec.realizedPnL / exec.netCost) * 100 : 0} size="sm" />
            <div className="flex gap-1">
              <button onClick={() => closeExecution(exec.id)} className="px-3 py-1.5 rounded-lg bg-loss/20 text-loss text-[11px] font-bold min-h-[32px]">✕ Close</button>
            </div>
          </div>
        </GlassCard>
      ))}
    </div>
  );
};

export default ActiveStrategies;
