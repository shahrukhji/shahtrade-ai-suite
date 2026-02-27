import GlassCard from '@/components/Common/GlassCard';
import { useSafeMode } from '@/context/SafeModeContext';
import { formatINR } from '@/utils/formatters';

const SafeSettings = () => {
  const { enabled, config, capital, overridden, setOverridden } = useSafeMode();
  if (!enabled) return null;

  const rows = [
    ['Max per trade', formatINR(config.maxTradeAmount)],
    ['Max loss/trade', formatINR(config.maxLossPerTrade)],
    ['Max daily loss', formatINR(config.maxDailyLoss)],
    ['Stop loss', config.stopLossPercent + '%'],
    ['Target', config.targetPercent + '%'],
    ['AI Confidence', config.minAIConfidence + '%+'],
    ['Order type', config.onlyDelivery ? 'Delivery' : 'Any'],
    ['F&O Trading', config.noFnO ? 'Disabled' : 'Enabled'],
    ['Short Selling', config.onlyBuy ? 'Disabled' : 'Enabled'],
    ['Max positions', String(config.maxQuantity)],
    ['Max trades/day', String(config.maxTradesPerDay)],
    ['Strategy', 'Penny Profit'],
  ];

  return (
    <GlassCard style={{ background: 'rgba(0,255,136,0.04)', borderColor: 'rgba(0,255,136,0.15)' }}>
      <p className="text-sm font-bold mb-1">🛡️ SAFE MODE SETTINGS (Auto-Set)</p>
      <p className="text-[10px] text-muted-foreground mb-3">
        Automatically configured to protect your {formatINR(capital)} capital. Cannot be changed while Safe Mode is active.
      </p>
      <div className="space-y-1">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{label}:</span>
            <span className="font-mono font-bold">{value} 🔒</span>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground mt-3">
        ℹ️ Safe Mode turns off when capital exceeds ₹25,000
      </p>
    </GlassCard>
  );
};

export default SafeSettings;
