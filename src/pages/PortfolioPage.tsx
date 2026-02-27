import GlassCard from '@/components/Common/GlassCard';
import PnLDisplay from '@/components/Common/PnLDisplay';
import PillButton from '@/components/Common/PillButton';
import Badge from '@/components/Common/Badge';
import EmptyState from '@/components/Common/EmptyState';
import ShimmerCard from '@/components/Common/ShimmerCard';
import { useAngelOne } from '@/context/AngelOneContext';
import { formatINR } from '@/utils/formatters';
import { useState } from 'react';

const tabs = ['Holdings', 'Positions', 'Orders', 'Trades'];

const PortfolioPage = () => {
  const { isConnected, holdings, positions, orders, trades, funds } = useAngelOne();
  const [activeTab, setActiveTab] = useState('Holdings');

  if (!isConnected) return <EmptyState title="Not Connected" description="Connect your Angel One account to view portfolio" />;

  const totalInvested = holdings.reduce((s, h) => s + h.investedValue, 0);
  const totalCurrent = holdings.reduce((s, h) => s + h.currentValue, 0);
  const totalPnl = totalCurrent - totalInvested;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">💼 Portfolio</h1>

      {/* Summary cards */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar -mx-4 px-4">
        {[
          ['Investment', formatINR(totalInvested), 'from-card to-info/10'],
          ['Current', formatINR(totalCurrent), 'from-card to-profit/10'],
          ['P&L', `${totalPnl >= 0 ? '+' : ''}${formatINR(totalPnl)}`, totalPnl >= 0 ? 'from-card to-profit/10' : 'from-card to-loss/10'],
          ['Balance', formatINR(funds?.availablecash || 0), 'from-card to-warning/10'],
        ].map(([l, v, g]) => (
          <div key={l} className={`min-w-[140px] rounded-xl p-3 bg-gradient-to-br ${g} border border-border`}>
            <p className="text-[10px] text-muted-foreground">{l}</p>
            <p className="text-sm font-bold font-mono">{v}</p>
          </div>
        ))}
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2">
        {tabs.map(t => <PillButton key={t} active={t === activeTab} onClick={() => setActiveTab(t)}>{t}</PillButton>)}
      </div>

      {/* Holdings */}
      {activeTab === 'Holdings' && (
        holdings.length === 0 ? <EmptyState title="No holdings" /> :
        <div className="space-y-2">
          {holdings.map(h => (
            <GlassCard key={h.symbol}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-[15px]">{h.symbol}</p>
                  <div className="flex items-center gap-1">
                    <Badge variant="info">{h.exchange}</Badge>
                    <span className="text-[11px] text-muted-foreground">Qty: {h.qty}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono font-bold">{formatINR(h.ltp)}</p>
                  <PnLDisplay value={h.pnl} percentage={h.pnlPercent} size="sm" />
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Positions */}
      {activeTab === 'Positions' && (
        positions.length === 0 ? <EmptyState title="No open positions" /> :
        <div className="space-y-2">
          {positions.map(p => (
            <GlassCard key={p.symbol}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold">{p.symbol}</p>
                  <Badge variant={p.product === 'INTRADAY' ? 'warning' : 'info'}>{p.product}</Badge>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono">{formatINR(p.ltp)}</p>
                  <PnLDisplay value={p.pnl} percentage={p.pnlPercent} size="sm" />
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Orders */}
      {activeTab === 'Orders' && (
        orders.length === 0 ? <EmptyState title="No orders" /> :
        <div className="space-y-2">
          {orders.map(o => (
            <GlassCard key={o.orderId}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm">{o.symbol}</p>
                  <div className="flex gap-1">
                    <Badge variant={o.type === 'BUY' ? 'success' : 'danger'}>{o.type}</Badge>
                    <Badge variant={o.status === 'COMPLETE' ? 'success' : o.status === 'OPEN' ? 'info' : 'danger'}>{o.status}</Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono">{formatINR(o.price)}</p>
                  <p className="text-[11px] text-muted-foreground">Qty: {o.qty}</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Trades */}
      {activeTab === 'Trades' && (
        trades.length === 0 ? <EmptyState title="No trades" /> :
        <div className="space-y-2">
          {trades.map(t => (
            <GlassCard key={t.tradeId}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm">{t.symbol}</p>
                  <Badge variant={t.type === 'BUY' ? 'success' : 'danger'}>{t.type}</Badge>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono">{formatINR(t.price)}</p>
                  <p className="text-[11px] text-muted-foreground">Qty: {t.qty}</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
};

export default PortfolioPage;
