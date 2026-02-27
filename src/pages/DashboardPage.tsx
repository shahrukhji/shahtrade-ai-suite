import { useAngelOne } from '@/context/AngelOneContext';
import { useSafeMode } from '@/context/SafeModeContext';
import GlassCard from '@/components/Common/GlassCard';
import PnLDisplay from '@/components/Common/PnLDisplay';
import ShimmerCard from '@/components/Common/ShimmerCard';
import { formatINR } from '@/utils/formatters';
import { sampleIndices, sampleAISignal, sampleTradeSetup } from '@/utils/sampleData';
import Badge from '@/components/Common/Badge';
import ProgressBar from '@/components/Common/ProgressBar';
import CircularProgress from '@/components/Common/CircularProgress';
import Disclaimer from '@/components/Common/Disclaimer';
import SafeModeBanner from '@/components/SafeMode/SafeModeBanner';
import CapitalProtectionMeter from '@/components/SafeMode/CapitalProtectionMeter';
import AffordableStocks from '@/components/SafeMode/AffordableStocks';
import PennyProfitCard from '@/components/SafeMode/PennyProfitCard';
import GrowthMilestones from '@/components/SafeMode/GrowthMilestones';
import TipOfTheDay from '@/components/SafeMode/TipOfTheDay';
import MicroPnLTracker from '@/components/SafeMode/MicroPnLTracker';
import { useNavigate } from 'react-router-dom';
import { Sparkles, RefreshCw } from 'lucide-react';
import { useCustomToast } from '@/hooks/useCustomToast';

const DashboardPage = () => {
  const { isConnected, userProfile, funds, holdings, lastSyncTime, syncAllData } = useAngelOne();
  const { enabled: safeModeEnabled, capital: safeCapital } = useSafeMode();
  const navigate = useNavigate();
  const toast = useCustomToast();

  const totalInvested = holdings.reduce((s, h) => s + h.investedValue, 0);
  const totalCurrent = holdings.reduce((s, h) => s + h.currentValue, 0);
  const totalPnl = totalCurrent - totalInvested;
  const totalPnlPct = totalInvested ? (totalPnl / totalInvested) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Welcome */}
      <GlassCard>
        {isConnected ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-bold">Welcome, {userProfile?.name} 👋</p>
              <p className="text-[11px] text-muted-foreground">Client: {userProfile?.clientcode}</p>
            </div>
            <button onClick={syncAllData} className="p-2 rounded-lg bg-muted"><RefreshCw size={16} /></button>
          </div>
        ) : (
          <div className="text-center py-2">
            <p className="text-base font-bold mb-1">🔗 Connect Your Angel One Account</p>
            <p className="text-xs text-muted-foreground mb-3">Link your account to start trading</p>
            <button onClick={() => navigate('/settings')} className="px-5 py-2 rounded-full bg-info/20 text-info text-sm font-semibold">Connect Now</button>
          </div>
        )}
      </GlassCard>

      {/* Safe Mode Banner */}
      <SafeModeBanner />

      {/* Wallet */}
      {isConnected && (
        funds ? (
          <GlassCard className="bg-gradient-to-br from-card to-accent/20">
            <p className="text-xs text-muted-foreground mb-1">💰 Angel One Wallet</p>
            <p className="text-[11px] text-muted-foreground">Available Balance</p>
            <p className="text-2xl font-bold font-mono text-profit">{formatINR(funds.availablecash)}</p>
            <div className="grid grid-cols-2 gap-2 mt-3">
              {[['Net Value', funds.net], ['Used Margin', funds.utiliseddebits], ['Collateral', funds.collateral], ['M2M', funds.m2munrealized]].map(([l, v]) => (
                <div key={l as string} className="bg-background/30 rounded-lg p-2">
                  <p className="text-[10px] text-muted-foreground">{l as string}</p>
                  <p className="text-sm font-bold font-mono">{formatINR(v as number)}</p>
                </div>
              ))}
            </div>
            <ProgressBar value={(funds.utiliseddebits / funds.net) * 100} showLabel className="mt-3" />
          </GlassCard>
        ) : <ShimmerCard />
      )}

      {/* Capital Protection Meter (Safe Mode) */}
      <CapitalProtectionMeter />

      {/* Micro P&L Tracker (Safe Mode) */}
      {safeModeEnabled && <MicroPnLTracker />}

      {/* Penny Profit Recommendation (Safe Mode, low capital) */}
      {safeModeEnabled && safeCapital <= 5000 && (
        <PennyProfitCard onStart={() => { navigate('/auto-trade'); toast.info('Starting Penny Profit in Paper Mode'); }} />
      )}

      {/* Tip of the Day (Safe Mode) */}
      {safeModeEnabled && <TipOfTheDay />}

      {/* Market Indices */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar -mx-4 px-4 snap-x">
        {sampleIndices.map(idx => (
          <div key={idx.name} className="min-w-[130px] bg-card rounded-lg p-3 snap-start border border-border">
            <p className="text-[11px] text-muted-foreground">{idx.name}</p>
            <p className="text-[15px] font-bold font-mono">{idx.ltp.toLocaleString('en-IN')}</p>
            <p className={`text-xs font-mono ${idx.change >= 0 ? 'text-profit' : 'text-loss'}`}>
              {idx.change >= 0 ? '▲' : '▼'} {Math.abs(idx.change).toFixed(2)} ({idx.changePercent >= 0 ? '+' : ''}{idx.changePercent.toFixed(2)}%)
            </p>
          </div>
        ))}
      </div>

      {/* AI Signal */}
      <GlassCard className="text-center">
        <p className="text-xs text-muted-foreground mb-2">🤖 AI SIGNAL</p>
        <p className="text-5xl mb-2">⬆️</p>
        <p className="text-2xl font-bold text-profit mb-3">{sampleAISignal.strength}</p>
        <div className="flex justify-center mb-3"><CircularProgress value={sampleAISignal.confidence} /></div>
        <p className="text-xs text-muted-foreground mb-1">Trade Score</p>
        <ProgressBar value={sampleAISignal.tradeScore} showLabel />
        <div className="mt-3 text-left space-y-1">
          {sampleAISignal.reasons.map((r, i) => (
            <p key={i} className="text-[13px]">{r.icon} {r.text}</p>
          ))}
        </div>
      </GlassCard>

      {/* Trade Setup */}
      <GlassCard>
        <p className="text-sm font-bold mb-2">💡 Trade Setup</p>
        <Badge variant={sampleTradeSetup.action === 'BUY' ? 'success' : 'danger'}>{sampleTradeSetup.action}</Badge>
        <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
          {[['Entry', formatINR(sampleTradeSetup.entry)], ['Stop Loss', formatINR(sampleTradeSetup.stopLoss)], ['T1', formatINR(sampleTradeSetup.target1)], ['T2', formatINR(sampleTradeSetup.target2)], ['Max Profit', formatINR(sampleTradeSetup.maxProfit)], ['Max Loss', formatINR(sampleTradeSetup.maxLoss)]].map(([l, v]) => (
            <div key={l} className="bg-background/30 rounded-lg p-2">
              <p className="text-[10px] text-muted-foreground">{l}</p>
              <p className="font-bold font-mono">{v}</p>
            </div>
          ))}
        </div>
        <Disclaimer />
      </GlassCard>

      {/* Affordable Stocks (Safe Mode) */}
      {safeModeEnabled && <AffordableStocks onAnalyze={() => toast.info('AI Analysis coming soon')} onBuy={() => toast.info('Paper mode — simulated buy')} />}

      {/* Growth Milestones (Safe Mode) */}
      {safeModeEnabled && <GrowthMilestones />}

      {/* Portfolio Summary */}
      {isConnected && holdings.length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-2">
            {[['Investment', formatINR(totalInvested)], ['Current', formatINR(totalCurrent)]].map(([l, v]) => (
              <GlassCard key={l}><p className="text-[10px] text-muted-foreground">{l}</p><p className="text-sm font-bold font-mono">{v}</p></GlassCard>
            ))}
            <GlassCard><p className="text-[10px] text-muted-foreground">Total P&L</p><PnLDisplay value={totalPnl} percentage={totalPnlPct} size="sm" /></GlassCard>
            <GlassCard><p className="text-[10px] text-muted-foreground">Today P&L</p><PnLDisplay value={1245.65} percentage={1.12} size="sm" /></GlassCard>
          </div>

          <GlassCard>
            <p className="text-sm font-bold mb-2">📈 Your Holdings</p>
            {holdings.slice(0, 5).map(h => (
              <div key={h.symbol} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="font-bold text-sm">{h.symbol}</span>
                <div className="text-right">
                  <p className="text-sm font-mono">{formatINR(h.ltp)}</p>
                  <PnLDisplay value={h.pnl} percentage={h.pnlPercent} size="sm" />
                </div>
              </div>
            ))}
            <button onClick={() => navigate('/portfolio')} className="text-xs text-info mt-2">View all →</button>
          </GlassCard>
        </>
      )}

      {/* FAB */}
      <button
        onClick={() => toast.info('AI Analysis coming soon')}
        className="fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-profit to-info flex items-center justify-center shadow-lg"
      >
        <Sparkles size={24} className="text-background" />
      </button>
    </div>
  );
};

export default DashboardPage;
