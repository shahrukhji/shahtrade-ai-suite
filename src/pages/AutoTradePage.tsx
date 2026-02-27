import GlassCard from '@/components/Common/GlassCard';
import Toggle from '@/components/Common/Toggle';
import Badge from '@/components/Common/Badge';
import ProgressBar from '@/components/Common/ProgressBar';
import PnLDisplay from '@/components/Common/PnLDisplay';
import ConnectionDot from '@/components/Common/ConnectionDot';
import EmptyState from '@/components/Common/EmptyState';
import ConfirmModal from '@/components/Common/ConfirmModal';
import Disclaimer from '@/components/Common/Disclaimer';
import { useAutoTrade } from '@/context/AutoTradeContext';
import { formatINR, formatTime, timeAgo } from '@/utils/formatters';
import { useState, useEffect, useRef } from 'react';
import { Pause, Play, Square, AlertTriangle } from 'lucide-react';

const AutoTradePage = () => {
  const { isAutoTrading, engineStatus, mode, activeTrades, todayStats, safetyStatus, scanLog, startEngine, stopEngine, pauseEngine, killAll, setMode } = useAutoTrade();
  const [showKillConfirm, setShowKillConfirm] = useState(false);
  const [showLiveConfirm, setShowLiveConfirm] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => { logRef.current?.scrollTo(0, logRef.current.scrollHeight); }, [scanLog]);

  const statusColors: Record<string, string> = { RUNNING: 'connected', PAUSED: 'syncing', STOPPED: 'disconnected', EMERGENCY_STOPPED: 'disconnected' };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">🤖 Auto Trade</h1>

      {/* Master Switch */}
      <GlassCard>
        <p className="text-lg font-bold mb-3">🤖 AUTO TRADE MODE</p>
        <Toggle checked={isAutoTrading} onChange={v => v ? startEngine() : stopEngine()} label="MASTER SWITCH" />
        <div className="flex gap-3 mt-3">
          <button onClick={() => setMode('paper')} className={`flex-1 py-2 rounded-lg text-xs font-bold ${mode === 'paper' ? 'bg-info/20 text-info' : 'bg-muted text-muted-foreground'}`}>📝 Paper</button>
          <button onClick={() => mode === 'live' ? null : setShowLiveConfirm(true)} className={`flex-1 py-2 rounded-lg text-xs font-bold ${mode === 'live' ? 'bg-profit/20 text-profit' : 'bg-muted text-muted-foreground'}`}>💰 Live</button>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <ConnectionDot status={statusColors[engineStatus] as any} showLabel={false} />
          <span className="text-sm font-bold">{engineStatus}</span>
          {isAutoTrading && <span className="text-[11px] text-muted-foreground ml-auto">Scanning every 10s</span>}
        </div>
        <div className="flex gap-2 mt-3">
          <button onClick={pauseEngine} disabled={!isAutoTrading} className="flex-1 h-10 rounded-lg border border-info text-info text-xs font-bold flex items-center justify-center gap-1 disabled:opacity-30">
            {engineStatus === 'PAUSED' ? <><Play size={14} />Resume</> : <><Pause size={14} />Pause</>}
          </button>
          <button onClick={stopEngine} disabled={!isAutoTrading} className="flex-1 h-10 rounded-lg border border-border text-muted-foreground text-xs font-bold flex items-center justify-center gap-1 disabled:opacity-30"><Square size={14} />Stop</button>
          <button onClick={() => setShowKillConfirm(true)} disabled={!isAutoTrading && activeTrades.length === 0} className="flex-1 h-10 rounded-lg bg-loss text-foreground text-xs font-bold flex items-center justify-center gap-1 disabled:opacity-30"><AlertTriangle size={14} />KILL</button>
        </div>
      </GlassCard>

      {mode === 'paper' && (
        <div className="text-center py-1.5 rounded-lg text-xs font-bold bg-info/10 border border-info/20 text-info">
          📝 PAPER TRADING MODE — No real orders placed
        </div>
      )}

      {/* Performance */}
      <GlassCard>
        <p className="text-sm font-bold mb-2">📊 TODAY'S PERFORMANCE</p>
        <div className={`rounded-xl p-3 mb-3 text-center ${todayStats.totalPnl >= 0 ? 'bg-profit/10' : 'bg-loss/10'}`}>
          <PnLDisplay value={todayStats.totalPnl} percentage={todayStats.totalPnlPercent} size="lg" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            ['Trades', `${todayStats.totalTrades} (${todayStats.wins}W/${todayStats.losses}L)`],
            ['Win Rate', `${todayStats.winRate.toFixed(0)}%`],
            ['P.Factor', todayStats.profitFactor.toFixed(2)],
            ['Best', todayStats.bestTrade > 0 ? `+${formatINR(todayStats.bestTrade)}` : '—'],
            ['Worst', todayStats.worstTrade < 0 ? formatINR(todayStats.worstTrade) : '—'],
            ['Avg Win', todayStats.avgWin > 0 ? `+${formatINR(todayStats.avgWin)}` : '—'],
          ].map(([l, v]) => (
            <div key={l} className="bg-background/30 rounded-lg p-2">
              <p className="text-[10px] text-muted-foreground">{l}</p>
              <p className="text-xs font-bold font-mono">{v}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Active Trades */}
      <GlassCard>
        <p className="text-sm font-bold mb-2">📈 ACTIVE TRADES ({activeTrades.length})</p>
        {activeTrades.length === 0 ? (
          <EmptyState title="No active trades" description={isAutoTrading ? "Scanning for opportunities..." : "Start auto trading to see trades here."} />
        ) : activeTrades.map(t => (
          <div key={t.id} className="bg-background/30 rounded-xl p-3 mb-2 border border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>{t.direction === 'BUY' ? '📈' : '📉'}</span>
                <span className="font-bold text-sm">{t.symbol}</span>
                <Badge variant={t.direction === 'BUY' ? 'success' : 'danger'}>{t.direction}</Badge>
              </div>
              <span className="text-xs font-mono">@ {formatINR(t.entryPrice)}</span>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs">LTP: <span className="font-mono font-bold">{formatINR(t.ltp)}</span></span>
              <PnLDisplay value={t.pnl} percentage={t.pnlPercent} size="sm" />
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">SL: {formatINR(t.stopLoss)} | T1: {formatINR(t.target1)}</div>
            <ProgressBar value={Math.max(0, Math.min(100, t.target1 !== t.entryPrice ? ((t.ltp - t.entryPrice) / (t.target1 - t.entryPrice)) * 100 : 0))} className="mt-2" />
            <div className="flex justify-between mt-2 text-[11px]">
              <span>⏱️ {timeAgo(t.entryTime)}</span>
              <div className="flex items-center gap-1">
                <Badge variant="ai">AI: {t.aiConfidence}%</Badge>
                <Badge variant="info">{t.strategy}</Badge>
              </div>
            </div>
          </div>
        ))}
      </GlassCard>

      {/* Safety */}
      <GlassCard>
        <p className="text-sm font-bold mb-2">🛡️ SAFETY DASHBOARD</p>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs">Daily Loss: {formatINR(safetyStatus.dailyLossUsed)} / {formatINR(safetyStatus.dailyLossLimit)}</span>
          <Badge variant={safetyStatus.status === 'safe' ? 'success' : safetyStatus.status === 'warning' ? 'warning' : 'danger'}>
            {safetyStatus.status === 'safe' ? '✅ SAFE' : safetyStatus.status === 'warning' ? '⚠️ WARNING' : '🚨 LIMIT'}
          </Badge>
        </div>
        <ProgressBar value={safetyStatus.dailyLossLimit > 0 ? (safetyStatus.dailyLossUsed / safetyStatus.dailyLossLimit) * 100 : 0} showLabel />
        <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
          <div>Deployed: {formatINR(safetyStatus.capitalDeployed)}</div>
          <div>Available: {formatINR(safetyStatus.capitalAvailable)}</div>
          <div>Open: {safetyStatus.openPositions}/{safetyStatus.maxPositions}</div>
          <div>Consec. Losses: {safetyStatus.consecutiveLosses}/{safetyStatus.maxConsecutiveLosses}</div>
          {safetyStatus.cooldownRemaining > 0 && <div className="col-span-2 text-warning">⏳ Cooldown: {safetyStatus.cooldownRemaining.toFixed(0)}min</div>}
        </div>
      </GlassCard>

      {/* Scan Log */}
      <GlassCard>
        <p className="text-sm font-bold mb-2">📋 SCAN LOG ({scanLog.length})</p>
        <div ref={logRef} className="max-h-[250px] overflow-y-auto space-y-1">
          {scanLog.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">Start engine to see scan logs</p>
          ) : scanLog.map((l, i) => (
            <p key={i} className={`text-[11px] ${l.type === 'success' || l.type === 'trade' ? 'text-profit' : l.type === 'error' ? 'text-loss' : l.type === 'warning' ? 'text-warning' : 'text-muted-foreground'}`}>
              {formatTime(l.time)} {l.emoji} {l.message}
            </p>
          ))}
        </div>
      </GlassCard>

      <Disclaimer />

      <ConfirmModal isOpen={showKillConfirm} title="🚨 Emergency Kill" message="This will cancel ALL orders and close ALL positions immediately. Are you sure?" confirmText="KILL ALL" onConfirm={() => { killAll(); setShowKillConfirm(false); }} onCancel={() => setShowKillConfirm(false)} />
      <ConfirmModal isOpen={showLiveConfirm} title="⚠️ Switch to Live" message="Real money will be used for trades. Start with Paper mode to test strategies first. Are you sure?" confirmText="Go Live" confirmColor="bg-warning" onConfirm={() => { setMode('live'); setShowLiveConfirm(false); }} onCancel={() => setShowLiveConfirm(false)} />
    </div>
  );
};

export default AutoTradePage;
