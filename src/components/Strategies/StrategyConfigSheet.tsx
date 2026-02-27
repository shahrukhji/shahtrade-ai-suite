import { useState, useMemo } from 'react';
import BottomSheet from '@/components/Common/BottomSheet';
import PillButton from '@/components/Common/PillButton';
import Badge from '@/components/Common/Badge';
import GlassCard from '@/components/Common/GlassCard';
import Disclaimer from '@/components/Common/Disclaimer';
import { type Strategy } from '@/data/strategies';
import { useStrategies } from '@/context/StrategiesContext';
import { formatINR } from '@/utils/formatters';
import type { StrategyExecution } from '@/data/strategies';

interface Props {
  strategy: Strategy | null;
  isOpen: boolean;
  onClose: () => void;
}

const sampleExpiries = ['16 Jan', '23 Jan', '30 Jan', '27 Feb', '27 Mar'];

const StrategyConfigSheet: React.FC<Props> = ({ strategy, isOpen, onClose }) => {
  const { addExecution } = useStrategies();
  const [lots, setLots] = useState(1);
  const [expiry, setExpiry] = useState(sampleExpiries[0]);
  const spotPrice = 22400;
  const lotSize = 50;

  const legPremiums = useMemo(() => {
    if (!strategy) return [];
    return strategy.legs.map((leg, i) => {
      const base = leg.instrument === 'CALL' ? 85 - i * 25 : 65 - i * 20;
      return Math.max(5, base + Math.random() * 10);
    });
  }, [strategy]);

  if (!strategy) return null;

  const totalQty = lots * lotSize;
  const premiumPaid = strategy.legs.reduce((s, leg, i) => s + (leg.action === 'BUY' ? legPremiums[i] : 0), 0) * totalQty;
  const premiumReceived = strategy.legs.reduce((s, leg, i) => s + (leg.action === 'SELL' ? legPremiums[i] : 0), 0) * totalQty;
  const netCost = premiumPaid - premiumReceived;

  const strikes = strategy.legs.map(leg => {
    const step = 100;
    switch (leg.strikeSelection) {
      case 'ATM': return spotPrice;
      case 'OTM1': return leg.instrument === 'CALL' ? spotPrice + step : spotPrice - step;
      case 'OTM2': return leg.instrument === 'CALL' ? spotPrice + step * 2 : spotPrice - step * 2;
      case 'ITM1': return leg.instrument === 'CALL' ? spotPrice - step : spotPrice + step;
      default: return spotPrice;
    }
  });

  const maxProfit = premiumReceived > premiumPaid ? premiumReceived - premiumPaid + (strikes.length > 1 ? Math.abs(strikes[1] - strikes[0]) * totalQty * 0.5 : 0) : Math.abs(strikes[1] - strikes[0]) * totalQty - netCost;
  const maxLoss = netCost > 0 ? netCost : Math.abs(strikes.length > 1 ? (strikes[1] - strikes[0]) * totalQty : spotPrice * totalQty * 0.05) - premiumReceived;
  const rr = maxLoss > 0 ? (maxProfit / maxLoss).toFixed(1) : '∞';

  const handleApply = () => {
    const exec: StrategyExecution = {
      id: `exec_${Date.now()}`,
      strategyId: strategy.id,
      strategyName: strategy.name,
      symbol: 'NIFTY',
      exchange: 'NFO',
      expiry,
      spotPrice,
      legs: strategy.legs.map((leg, i) => ({
        tradingsymbol: `NIFTY${expiry.replace(' ', '')}${strikes[i]}${leg.instrument === 'CALL' ? 'CE' : 'PE'}`,
        symboltoken: String(26000 + i),
        strike: strikes[i],
        type: leg.instrument === 'CALL' ? 'CE' as const : leg.instrument === 'PUT' ? 'PE' as const : 'EQ' as const,
        action: leg.action,
        quantity: leg.quantity * lots * lotSize,
        entryPrice: legPremiums[i],
        currentPrice: legPremiums[i],
        exitPrice: null,
        pnl: 0,
        orderId: null,
      })),
      totalPremiumPaid: premiumPaid,
      totalPremiumReceived: premiumReceived,
      netCost,
      maxProfit: Math.abs(maxProfit),
      maxLoss: Math.abs(maxLoss),
      breakeven: [spotPrice + netCost / totalQty],
      riskReward: `1:${rr}`,
      status: 'ACTIVE',
      entryTime: new Date().toISOString(),
      exitTime: null,
      realizedPnL: 0,
      daysToExpiry: 5,
    };
    addExecution(exec);
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={`${strategy.icon} ${strategy.name}`}>
      <div className="space-y-3 pb-4">
        <div className="flex gap-1">
          <Badge variant={strategy.riskLevel === 'LOW' ? 'success' : strategy.riskLevel === 'MEDIUM' ? 'warning' : 'danger'}>{strategy.riskLevel}</Badge>
          <Badge variant="info">{strategy.category}</Badge>
        </div>

        <GlassCard className="!p-3">
          <p className="text-xs text-muted-foreground">Selected Instrument</p>
          <p className="text-base font-bold">NIFTY 50 — {formatINR(spotPrice)}</p>
        </GlassCard>

        <div>
          <p className="text-xs font-bold mb-1.5">Expiry</p>
          <div className="flex gap-1.5 overflow-x-auto hide-scrollbar">
            {sampleExpiries.map(e => (
              <PillButton key={e} active={expiry === e} onClick={() => setExpiry(e)}
                className={expiry === e ? '!bg-warning/20 !border-warning !text-warning' : ''}>{e}</PillButton>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-bold mb-1.5">Lots: {lots} ({totalQty} qty)</p>
          <input type="range" min={1} max={10} value={lots} onChange={e => setLots(+e.target.value)}
            className="w-full accent-info" />
        </div>

        {strategy.legs.map((leg, i) => (
          <GlassCard key={i} className="!p-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold">LEG {leg.legNumber}: {leg.action} {leg.instrument}</p>
              <Badge variant={leg.action === 'BUY' ? 'success' : 'danger'}>{leg.action}</Badge>
            </div>
            <div className="flex justify-between mt-1 text-xs">
              <span>Strike: <span className="font-mono font-bold text-warning">{strikes[i]}</span> ({leg.strikeSelection})</span>
              <span>Premium: <span className="font-mono font-bold">{formatINR(legPremiums[i])}</span></span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Qty: {leg.quantity * lots * lotSize}</p>
          </GlassCard>
        ))}

        <GlassCard className="!p-3 !bg-info/5 !border-info/20">
          <p className="text-xs font-bold mb-2">═══ STRATEGY P&L SUMMARY ═══</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div><span className="text-muted-foreground">Net Cost:</span> <span className="font-mono font-bold">{formatINR(Math.abs(netCost))}</span></div>
            <div><span className="text-muted-foreground">Max Profit:</span> <span className="font-mono font-bold text-profit">{formatINR(Math.abs(maxProfit))}</span></div>
            <div><span className="text-muted-foreground">Max Loss:</span> <span className="font-mono font-bold text-loss">{formatINR(Math.abs(maxLoss))}</span></div>
            <div><span className="text-muted-foreground">R:R:</span> <span className="font-mono font-bold text-info">1:{rr}</span></div>
          </div>
        </GlassCard>

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 h-12 rounded-xl border border-border text-muted-foreground font-bold text-sm">Cancel</button>
          <button onClick={handleApply} className="flex-1 h-12 rounded-xl bg-gradient-to-r from-profit to-info text-foreground font-bold text-sm">📋 Apply Strategy</button>
        </div>

        <Disclaimer />
        <p className="text-center text-[10px] text-muted-foreground/50 italic">Made with ❤️ by Shahrukh</p>
      </div>
    </BottomSheet>
  );
};

export default StrategyConfigSheet;
