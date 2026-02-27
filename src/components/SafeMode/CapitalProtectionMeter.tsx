import { useSafeMode } from '@/context/SafeModeContext';
import GlassCard from '@/components/Common/GlassCard';
import ProgressBar from '@/components/Common/ProgressBar';
import { formatINR } from '@/utils/formatters';

const CapitalProtectionMeter = () => {
  const { enabled, config, capital, dailyRiskUsed, todayTrades } = useSafeMode();
  if (!enabled) return null;

  const riskPct = config.maxDailyLoss > 0 ? (dailyRiskUsed / config.maxDailyLoss) * 100 : 0;
  const safe = riskPct < 60;

  return (
    <GlassCard>
      <p className="text-sm font-bold mb-2">🛡️ CAPITAL PROTECTION</p>
      <div className="space-y-1.5 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Starting Capital:</span>
          <span className="font-mono font-bold">{formatINR(config.absoluteStopLoss / 0.95)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Current Capital:</span>
          <span className="font-mono font-bold text-profit">{formatINR(capital)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Protected Amount:</span>
          <span className="font-mono font-bold">{formatINR(config.absoluteStopLoss)} 🔒</span>
        </div>
      </div>

      <div className="mt-3">
        <div className="flex justify-between text-[10px] mb-1">
          <span className="text-muted-foreground">Risk Used Today:</span>
          <span className="font-mono">{formatINR(dailyRiskUsed)} / {formatINR(config.maxDailyLoss)}</span>
        </div>
        <ProgressBar value={riskPct} />
        <p className={`text-[10px] mt-1 font-bold ${safe ? 'text-profit' : 'text-warning'}`}>
          {riskPct.toFixed(0)}% — {safe ? 'SAFE ✅' : 'CAUTION ⚠️'}
        </p>
      </div>

      <div className="flex justify-between mt-2 text-xs">
        <span className="text-muted-foreground">Trades Today:</span>
        <span className="font-mono font-bold">{todayTrades} / {config.maxTradesPerDay} max</span>
      </div>

      <p className="text-[10px] text-warning/70 mt-2">
        ⚡ If capital drops below {formatINR(config.absoluteStopLoss)}, ALL trading stops automatically
      </p>
    </GlassCard>
  );
};

export default CapitalProtectionMeter;
