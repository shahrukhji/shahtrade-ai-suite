import { useSafeMode } from '@/context/SafeModeContext';
import { formatINR } from '@/utils/formatters';
import { Shield } from 'lucide-react';

const LEVEL_LABELS: Record<string, string> = {
  ULTRA_SAFE: 'ULTRA PROTECTION',
  VERY_SAFE: 'HIGH PROTECTION',
  SAFE: 'STANDARD PROTECTION',
  MODERATE_SAFE: 'MODERATE PROTECTION',
};

const SafeModeBanner = () => {
  const { enabled, config, capital, paperDaysLeft } = useSafeMode();
  if (!enabled) return null;

  return (
    <div className="rounded-xl border p-3 space-y-1.5" style={{ background: 'rgba(0,255,136,0.06)', borderColor: 'rgba(0,255,136,0.2)' }}>
      <div className="flex items-center gap-2">
        <Shield size={18} className="text-profit" />
        <span className="text-sm font-bold text-profit">🛡️ SAFE MODE: {LEVEL_LABELS[config.level] || 'ACTIVE'}</span>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs">
        <span className="text-muted-foreground">Capital:</span>
        <span className="font-mono font-bold">{formatINR(capital)}</span>
        <span className="text-muted-foreground">Max risk/trade:</span>
        <span className="font-mono font-bold">{formatINR(config.maxLossPerTrade)}</span>
        <span className="text-muted-foreground">Max daily loss:</span>
        <span className="font-mono font-bold">{formatINR(config.maxDailyLoss)}</span>
      </div>
      {config.onlyBuy && <p className="text-[10px] text-profit">✅ Only buying blue-chip stocks</p>}
      {config.noFnO && <p className="text-[10px] text-profit">✅ F&O disabled (too risky for low capital)</p>}
      {paperDaysLeft > 0 && <p className="text-[10px] text-warning">📝 Paper mode: {paperDaysLeft} days left</p>}
      <p className="text-[10px] text-profit/70">Your money is protected ✅</p>
    </div>
  );
};

export default SafeModeBanner;
