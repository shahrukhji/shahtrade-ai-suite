import { useMarketStatus } from '@/hooks/useMarketStatus';

const MarketStatusBadge = () => {
  const status = useMarketStatus();

  const config = {
    open: { text: '🟢 Open', bg: 'rgba(0,255,136,0.1)', color: 'hsl(var(--profit))' },
    preMarket: { text: '🟡 Pre-Mkt', bg: 'rgba(255,215,0,0.1)', color: 'hsl(var(--warning))' },
    closed: { text: '🔴 Closed', bg: 'rgba(255,51,102,0.1)', color: 'hsl(var(--loss))' },
  };

  const c = config[status];

  return (
    <span
      className="text-[10px] font-bold px-1.5 py-0.5 rounded"
      style={{ background: c.bg, color: c.color }}
    >
      {c.text}
    </span>
  );
};

export default MarketStatusBadge;
