import { useState } from 'react';
import GlassCard from '@/components/Common/GlassCard';
import Badge from '@/components/Common/Badge';
import PillButton from '@/components/Common/PillButton';
import { useSafeMode } from '@/context/SafeModeContext';
import { AFFORDABLE_SAFE_STOCKS, type AffordableStock } from '@/data/affordableStocks';
import { formatINR } from '@/utils/formatters';

const BUDGET_FILTERS = [
  { label: '< ₹100', max: 100 },
  { label: '< ₹200', max: 200 },
  { label: '< ₹500', max: 500 },
  { label: 'All', max: 99999 },
];

const SAFETY_BADGE: Record<string, { variant: 'success' | 'warning' | 'danger'; label: string }> = {
  HIGH: { variant: 'success', label: '🟢 SAFE' },
  MEDIUM: { variant: 'warning', label: '🟡 MEDIUM' },
  LOW: { variant: 'danger', label: '🔴 RISKY' },
};

interface Props {
  onAnalyze?: (stock: AffordableStock) => void;
  onBuy?: (stock: AffordableStock) => void;
}

const AffordableStocks: React.FC<Props> = ({ onAnalyze, onBuy }) => {
  const { capital, config } = useSafeMode();
  const [budgetFilter, setBudgetFilter] = useState(500);
  const [safetyFilter, setSafetyFilter] = useState<'ALL' | 'HIGH'>('HIGH');

  const filtered = AFFORDABLE_SAFE_STOCKS.filter(s => {
    if (s.approxPrice > budgetFilter) return false;
    if (s.approxPrice > capital * 0.3) return false;
    if (safetyFilter === 'HIGH' && s.safety !== 'HIGH') return false;
    return true;
  });

  return (
    <GlassCard>
      <p className="text-sm font-bold mb-2">💰 STOCKS YOU CAN BUY WITH {formatINR(capital)}</p>

      <div className="flex gap-1.5 mb-2 overflow-x-auto hide-scrollbar">
        {BUDGET_FILTERS.map(f => (
          <PillButton key={f.label} active={budgetFilter === f.max} onClick={() => setBudgetFilter(f.max)}>{f.label}</PillButton>
        ))}
      </div>
      <div className="flex gap-1.5 mb-3">
        <PillButton active={safetyFilter === 'HIGH'} onClick={() => setSafetyFilter('HIGH')}>🟢 Safe Only</PillButton>
        <PillButton active={safetyFilter === 'ALL'} onClick={() => setSafetyFilter('ALL')}>All</PillButton>
      </div>

      {filtered.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-4">No stocks match your budget & filters</p>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {filtered.map(stock => {
            const canBuy = Math.floor(Math.min(capital * 0.2, config.maxTradeAmount) / stock.approxPrice);
            const sb = SAFETY_BADGE[stock.safety];
            return (
              <div key={stock.symbol} className="bg-background/30 rounded-xl p-3 border border-border/30">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm">{stock.symbol}</span>
                  <Badge variant={sb.variant}>{sb.label}</Badge>
                </div>
                <p className="text-[10px] text-muted-foreground">{stock.name} · {stock.category}</p>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="font-mono font-bold text-sm">{formatINR(stock.approxPrice)}</span>
                  <span className="text-[10px] text-muted-foreground">Can buy: <span className="font-bold text-foreground">{canBuy} shares</span></span>
                </div>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => onAnalyze?.(stock)} className="flex-1 py-2 rounded-lg bg-info/20 text-info text-[11px] font-bold min-h-[36px]">📊 Analyze</button>
                  <button onClick={() => onBuy?.(stock)} className="flex-1 py-2 rounded-lg bg-profit/20 text-profit text-[11px] font-bold min-h-[36px]">📈 Buy</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <p className="text-center text-[10px] text-muted-foreground/50 mt-3 italic">Made with ❤️ by Shahrukh</p>
    </GlassCard>
  );
};

export default AffordableStocks;
