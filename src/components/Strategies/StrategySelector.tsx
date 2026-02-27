import { useState } from 'react';
import GlassCard from '@/components/Common/GlassCard';
import PillButton from '@/components/Common/PillButton';
import Badge from '@/components/Common/Badge';
import { ALL_STRATEGIES, type Strategy } from '@/data/strategies';

const categories = ['ALL', 'BULLISH', 'BEARISH', 'NEUTRAL', 'VOLATILE', 'HEDGE'];
const catIcons: Record<string, string> = { ALL: '🌐', BULLISH: '📈', BEARISH: '📉', NEUTRAL: '⚖️', VOLATILE: '↕️', HEDGE: '🛡️' };
const riskFilters = ['All', 'LOW', 'MEDIUM', 'HIGH'];

interface Props {
  onSelectStrategy: (strategy: Strategy) => void;
}

const StrategySelector: React.FC<Props> = ({ onSelectStrategy }) => {
  const [category, setCategory] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('All');

  const filtered = ALL_STRATEGIES.filter(s => {
    if (category !== 'ALL' && s.category !== category) return false;
    if (riskFilter !== 'All' && s.riskLevel !== riskFilter) return false;
    return true;
  });

  return (
    <div className="space-y-3">
      <div className="flex gap-1.5 overflow-x-auto hide-scrollbar">
        {categories.map(c => (
          <PillButton key={c} active={category === c} onClick={() => setCategory(c)}>
            {catIcons[c]} {c === 'ALL' ? 'All' : c.charAt(0) + c.slice(1).toLowerCase()}
          </PillButton>
        ))}
      </div>
      <div className="flex gap-1.5 overflow-x-auto hide-scrollbar">
        {riskFilters.map(r => (
          <PillButton key={r} active={riskFilter === r} onClick={() => setRiskFilter(r)}>
            {r === 'LOW' ? '🟢' : r === 'MEDIUM' ? '🟡' : r === 'HIGH' ? '🔴' : '🔵'} {r}
          </PillButton>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {filtered.map(s => (
          <GlassCard key={s.id} className="!p-3">
            <p className="text-xl mb-1">{s.icon}</p>
            <p className="text-xs font-bold leading-tight">{s.name}</p>
            <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">{s.description}</p>
            <div className="flex gap-1 mt-2 flex-wrap">
              <Badge variant={s.riskLevel === 'LOW' ? 'success' : s.riskLevel === 'MEDIUM' ? 'warning' : 'danger'}>{s.riskLevel}</Badge>
              <Badge variant="info">{s.category}</Badge>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Win: ~{s.expectedWinRate}%</p>
            <button onClick={() => onSelectStrategy(s)}
              className="w-full mt-2 py-1.5 rounded-lg bg-info/20 text-info text-[11px] font-bold min-h-[36px]">
              Select Strategy
            </button>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

export default StrategySelector;
