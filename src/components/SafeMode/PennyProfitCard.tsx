import GlassCard from '@/components/Common/GlassCard';
import { PENNY_PROFIT_STRATEGY } from '@/data/affordableStocks';

interface Props {
  onStart?: () => void;
}

const PennyProfitCard: React.FC<Props> = ({ onStart }) => {
  const s = PENNY_PROFIT_STRATEGY;
  const p = s.expectedPerformance;

  return (
    <GlassCard className="border-profit/20" style={{ background: 'rgba(0,255,136,0.04)' }}>
      <p className="text-sm font-bold mb-1">{s.icon} RECOMMENDED: PENNY PROFIT</p>
      <p className="text-[10px] text-muted-foreground mb-2">{s.description}</p>

      <div className="space-y-1 text-xs mb-3">
        <p>1️⃣ Finds safe stocks that dipped today (buy low)</p>
        <p>2️⃣ Buys 1–3 shares with ultra-tight SL</p>
        <p>3️⃣ Takes ₹2–15 profit per trade</p>
        <p>4️⃣ Never risks more than ₹5/trade</p>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center text-[10px] mb-3">
        <div className="bg-background/30 rounded-lg p-1.5">
          <p className="text-muted-foreground">Expected</p>
          <p className="font-bold">{p.monthlyExpected}</p>
        </div>
        <div className="bg-background/30 rounded-lg p-1.5">
          <p className="text-muted-foreground">Win Rate</p>
          <p className="font-bold text-profit">{p.winRate}</p>
        </div>
        <div className="bg-background/30 rounded-lg p-1.5">
          <p className="text-muted-foreground">Risk</p>
          <p className="font-bold text-profit">{p.riskLevel}</p>
        </div>
      </div>

      <button onClick={onStart} className="w-full h-12 rounded-xl bg-gradient-to-r from-profit to-info text-background font-bold text-sm">
        ▶️ Start Penny Profit Mode
      </button>
      <p className="text-[10px] text-muted-foreground text-center mt-1">(Paper mode first — no real money)</p>
    </GlassCard>
  );
};

export default PennyProfitCard;
