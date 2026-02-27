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
import { generateSampleScanLog } from '@/utils/sampleData';
import { Pause, Square, AlertTriangle } from 'lucide-react';

const AutoTradePage = () => {
  const { isAutoTrading, engineStatus, mode, activeTrades, todayStats, safetyStatus, scanLog, startEngine, stopEngine, pauseEngine, killAll, setMode } = useAutoTrade();
  const [showKillConfirm, setShowKillConfirm] = useState(false);
  const [showLiveConfirm, setShowLiveConfirm] = useState(false);
  const [logs, setLogs] = useState(scanLog);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAutoTrading) return;
    const interval = setInterval(() => {
      const newLog = generateSampleScanLog(1)[0];
      newLog.time = new Date().toISOString();
      setLogs(prev => [...prev.slice(-20), newLog]);
    }, 3000);
    return () => clearInterval(interval);
  }, [isAutoTrading]);

  useEffect(() => { logRef.current?.scrollTo(0, logRef.current.scrollHeight); }, [logs]);

  const statusColors: Record<string, string> = { RUNNING: 'connected', PAUSED: 'syncing', STOPPED: 'disconnected', EMERGENCY_STOPPED: 'disconnected' };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">🤖 Auto Trade</h1>

      {/* Master Switch */}
      <GlassCard>
        <p className="text-lg font-bold mb-3">🤖 AUTO TRADE MODE</p>
        <Toggle checked={isAutoTrading} onChange={v => v ? startEngine() : stopEngine()} label="MASTER SWITCH" size="lg" />
        <div className="flex gap-3 mt-3">
          <button onClick={() => mode === 'paper' ? setMode('paper') : null} className={`flex-1 py-2 rounded-lg text-xs font-bold ${mode === 'paper' ? 'bg-info/20 text-info' : 'bg-muted text-muted-foreground'}`}>📝 Paper</button>
          <button onClick={() => mode === 'live' ? null : setShowLiveConfirm(true)} className={`flex-1 py-2 rounded-lg text-xs font-bold ${mode === 'live' ? 'bg-profit/20 text-profit' : 'bg-muted text-muted-foreground'}`}>💰 Live</button>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <ConnectionDot status={statusColors[engineStatus] as any} showLabel={false} />
          <span className="text-sm font-bold">{engineStatus}</span>
        </div>
        <div className="flex gap-2 mt-3">
          <button onClick={pauseEngine} className="flex-1 h-10 rounded-lg border border-info text-info text-xs font-bold flex items-center justify-center gap-1"><Pause size={14} />Pause</button>
          <button onClick={stopEngine} className="flex-1 h-10 rounded-lg border border-border text-muted-foreground text-xs font-bold flex items-center justify-center gap-1"><Square size={14} />Stop</button>
          <button onClick={() => setShowKillConfirm(true)} className="flex-1 h-10 rounded-lg bg-loss text-foreground text-xs font-bold flex items-center justify-center gap-1"><AlertTriangle size={14} />KILL</button>
        </div>
      </GlassCard>

      {mode === 'paper' && (
        <div className="text-center py-1.5 rounded-lg text-xs font-bold" style={{ background: 'rgba(77,159,255,0.1)', border: '1px solid rgba(77,159,255,0.2)', color: 'hsl(var(--info))' }}>
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
            ['Win Rate', `${todayStats.winRate}%`],
            ['P.Factor', todayStats.profitFactor.toFixed(2)],
            ['Best', `+${formatINR(todayStats.bestTrade)}`],
            ['Worst', formatINR(todayStats.worstTrade)],
            ['Sharpe', todayStats.sharpeRatio.toFixed(1)],
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
          <EmptyState title="No active trades" description="Start auto trading to see trades here." />
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
            <ProgressBar value={Math.min(100, ((t.ltp - t.entryPrice) / (t.target1 - t.entryPrice)) * 100)} className="mt-2" />
            <div className="flex justify-between mt-2 text-[11px]">
              <span>⏱️ {timeAgo(t.entryTime)}</span>
              <Badge variant="ai">AI: {t.aiConfidence}%</Badge>
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
        <ProgressBar value={(safetyStatus.dailyLossUsed / safetyStatus.dailyLossLimit) * 100} showLabel />
        <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
          <div>Open: {safetyStatus.openPositions}/{safetyStatus.maxPositions}</div>
          <div>Consec. Losses: {safetyStatus.consecutiveLosses}/{safetyStatus.maxConsecutiveLosses}</div>
        </div>
      </GlassCard>

      {/* Scan Log */}
      <GlassCard>
        <p className="text-sm font-bold mb-2">📋 SCAN LOG</p>
        <div ref={logRef} className="max-h-[250px] overflow-y-auto space-y-1">
          {logs.map((l, i) => (
            <p key={i} className={`text-[11px] ${l.type === 'success' ? 'text-profit' : l.type === 'error' ? 'text-loss' : l.type === 'warning' ? 'text-warning' : 'text-muted-foreground'}`}>
              {formatTime(l.time)} {l.emoji} {l.message}
            </p>
          ))}
        </div>
      </GlassCard>

      <Disclaimer />

      <ConfirmModal isOpen={showKillConfirm} title="🚨 Emergency Kill" message="This will cancel ALL orders and close ALL positions immediately. Are you sure?" confirmText="KILL ALL" onConfirm={() => { killAll(); setShowKillConfirm(false); }} onCancel={() => setShowKillConfirm(false)} />
      <ConfirmModal isOpen={showLiveConfirm} title="⚠️ Switch to Live" message="Real money will be used for trades. Are you sure?" confirmText="Go Live" confirmColor="bg-warning" onConfirm={() => { setMode('live'); setShowLiveConfirm(false); }} onCancel={() => setShowLiveConfirm(false)} />
    </div>
  );
};

export default AutoTradePage;
