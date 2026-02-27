import { useState, useEffect, useCallback } from 'react';
import GlassCard from '@/components/Common/GlassCard';
import Toggle from '@/components/Common/Toggle';
import Slider from '@/components/Common/Slider';
import PillButton from '@/components/Common/PillButton';
import Badge from '@/components/Common/Badge';
import ConfirmModal from '@/components/Common/ConfirmModal';
import Disclaimer from '@/components/Common/Disclaimer';
import { useAngelOne } from '@/context/AngelOneContext';
import { useGemini } from '@/context/GeminiContext';
import { useCustomToast } from '@/hooks/useCustomToast';
import { formatINR, formatTime } from '@/utils/formatters';
import { ChevronDown, Eye, EyeOff, Clipboard, Info, X, RefreshCw } from 'lucide-react';

// Collapsible section wrapper
const Section = ({ title, icon, children, defaultOpen = false }: { title: string; icon: string; children: React.ReactNode; defaultOpen?: boolean }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <GlassCard>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between">
        <p className="text-sm font-bold">{icon} {title}</p>
        <ChevronDown size={16} className={`transition-transform text-muted-foreground ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="mt-3 space-y-3">{children}</div>}
    </GlassCard>
  );
};

// Password input with show/hide + paste
const SecureInput = ({ placeholder, value, onChange, type = 'password' }: { placeholder: string; value: string; onChange: (v: string) => void; type?: string }) => {
  const [show, setShow] = useState(false);
  const handlePaste = async () => {
    try { const t = await navigator.clipboard.readText(); onChange(t); } catch { }
  };
  return (
    <div className="relative">
      <input
        className="w-full h-12 rounded-xl px-4 pr-20 text-sm bg-input border border-border focus:border-info focus:outline-none"
        placeholder={placeholder} type={show ? 'text' : type} value={value} onChange={e => onChange(e.target.value)}
      />
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
        <button onClick={() => setShow(!show)} className="p-1.5 text-muted-foreground">{show ? <EyeOff size={16} /> : <Eye size={16} />}</button>
        <button onClick={handlePaste} className="p-1.5 text-muted-foreground"><Clipboard size={16} /></button>
      </div>
    </div>
  );
};

const inputClass = "w-full h-12 rounded-xl px-4 text-sm bg-input border border-border focus:border-info focus:outline-none font-mono";

// Load/save settings from localStorage
const loadSettings = (key: string, defaults: any) => {
  try { const s = localStorage.getItem(`st_${key}`); return s ? { ...defaults, ...JSON.parse(s) } : defaults; } catch { return defaults; }
};
const saveSettings = (key: string, val: any) => localStorage.setItem(`st_${key}`, JSON.stringify(val));

const SettingsPage = () => {
  const { isConnected, connect, disconnect, userProfile, funds, lastSyncTime, syncAllData, isSyncing } = useAngelOne();
  const { apiKey, setApiKey, isConfigured } = useGemini();
  const toast = useCustomToast();

  // Connection fields
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [clientId, setClientId] = useState('');
  const [password, setPassword] = useState('');
  const [totp, setTotp] = useState('');
  const [connecting, setConnecting] = useState(false);

  // Gemini
  const [geminiKey, setGeminiKey] = useState(apiKey);
  const [geminiStatus, setGeminiStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');

  // CORS
  const [corsProxy, setCorsProxy] = useState(loadSettings('cors', { proxy: 'direct' }).proxy);
  const [customProxy, setCustomProxy] = useState(loadSettings('cors', { custom: '' }).custom);

  // Risk Management
  const [risk, setRisk] = useState(loadSettings('risk', {
    capital: 500000, maxPerTrade: 5, maxDeployed: 50, reserve: 20,
    maxLossTrade: 1.5, maxDailyLoss: 10000, maxWeeklyLoss: 30000,
    maxConsecutive: 3, maxOpenPositions: 3, cooldown: 10,
  }));

  // Stop Loss
  const [sl, setSl] = useState(loadSettings('sl', {
    type: 'fixed', fixedPercent: 1.5, atrMultiplier: 2,
    trailing: false, trailingPercent: 0.8, trailingActivation: 1,
    breakeven: false, breakevenTrigger: 1,
  }));

  // Targets
  const [targets, setTargets] = useState(loadSettings('targets', {
    t1: 2, t2: 4, t3: 6, partial: true, t1Book: 40, t2Book: 30,
  }));

  // AI Settings
  const [ai, setAi] = useState(loadSettings('ai', {
    minConfidence: 75, multiTF: true, volumeConfirm: true, minIndicators: 3,
  }));

  // Time Settings
  const [time, setTime] = useState(loadSettings('time', {
    start: '09:20', end: '15:00', squareOff: '15:15', noNewAfter: '14:30',
  }));

  // Advanced
  const [adv, setAdv] = useState(loadSettings('adv', {
    style: 'intraday', mode: 'equity', pyramiding: false, antiMartingale: false,
  }));

  // Watchlist
  const [watchlist, setWatchlist] = useState<{ symbol: string; exchange: string; enabled: boolean }[]>(
    loadSettings('watchlist', [
      { symbol: 'RELIANCE', exchange: 'NSE', enabled: true },
      { symbol: 'TCS', exchange: 'NSE', enabled: true },
      { symbol: 'HDFCBANK', exchange: 'NSE', enabled: true },
      { symbol: 'INFY', exchange: 'NSE', enabled: true },
      { symbol: 'ICICIBANK', exchange: 'NSE', enabled: true },
      { symbol: 'SBIN', exchange: 'NSE', enabled: true },
      { symbol: 'TATAMOTORS', exchange: 'NSE', enabled: true },
    ])
  );
  const [watchlistSearch, setWatchlistSearch] = useState('');

  // Sync settings
  const [sync, setSync] = useState(loadSettings('sync', {
    autoSync: true, frequency: 10, marketHoursOnly: true,
  }));

  // Notifications
  const [notifications, setNotifications] = useState(loadSettings('notif', { enabled: true }).enabled);

  const [showReset, setShowReset] = useState(false);

  // Auto-save all settings
  const saveAll = useCallback(() => {
    saveSettings('risk', risk);
    saveSettings('sl', sl);
    saveSettings('targets', targets);
    saveSettings('ai', ai);
    saveSettings('time', time);
    saveSettings('adv', adv);
    saveSettings('watchlist', watchlist);
    saveSettings('sync', sync);
    saveSettings('cors', { proxy: corsProxy, custom: customProxy });
    saveSettings('notif', { enabled: notifications });
  }, [risk, sl, targets, ai, time, adv, watchlist, sync, corsProxy, customProxy, notifications]);

  useEffect(() => { saveAll(); }, [saveAll]);

  const handleConnect = async () => {
    if (!apiKeyInput || !clientId || !password || !totp) { toast.error('Please fill all fields'); return; }
    setConnecting(true);
    try {
      await connect(apiKeyInput, clientId, password, totp);
      toast.success('Connected to Angel One!');
    } catch { toast.error('Connection failed'); }
    setConnecting(false);
  };

  const updateRisk = (k: string, v: number) => setRisk((p: any) => ({ ...p, [k]: v }));
  const updateSl = (k: string, v: any) => setSl((p: any) => ({ ...p, [k]: v }));
  const updateTargets = (k: string, v: any) => setTargets((p: any) => ({ ...p, [k]: v }));
  const updateAi = (k: string, v: any) => setAi((p: any) => ({ ...p, [k]: v }));
  const updateTime = (k: string, v: string) => setTime((p: any) => ({ ...p, [k]: v }));
  const updateAdv = (k: string, v: any) => setAdv((p: any) => ({ ...p, [k]: v }));
  const updateSync = (k: string, v: any) => setSync((p: any) => ({ ...p, [k]: v }));

  const handleReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-bold">⚙️ Settings</h1>

      {/* 5.1 Account Connection */}
      <Section title="Angel One" icon="🔗" defaultOpen>
        {isConnected ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-profit animate-pulse-green" />
              <span className="text-sm text-profit font-bold">Connected Successfully</span>
            </div>
            <div className="space-y-1 text-sm">
              <p>Name: <span className="font-bold">{userProfile?.name}</span></p>
              <p>Client ID: <span className="font-mono">{userProfile?.clientcode}</span></p>
              {funds && <p>Balance: <span className="font-mono text-profit font-bold">{formatINR(funds.availablecash)}</span></p>}
              {lastSyncTime && <p className="text-xs text-muted-foreground">Last Sync: {formatTime(lastSyncTime)}</p>}
            </div>
            <div className="flex gap-2">
              <button onClick={syncAllData} disabled={isSyncing} className="flex-1 h-10 rounded-xl bg-info/20 text-info text-sm font-bold flex items-center justify-center gap-1">
                <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />{isSyncing ? 'Syncing...' : 'Sync Now'}
              </button>
              <button onClick={disconnect} className="flex-1 h-10 rounded-xl border border-loss text-loss text-sm font-bold">🔴 Disconnect</button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <SecureInput placeholder="API Key" value={apiKeyInput} onChange={setApiKeyInput} />
            <div className="relative">
              <input className={inputClass} placeholder="Client ID" value={clientId} onChange={e => setClientId(e.target.value)} />
            </div>
            <SecureInput placeholder="MPIN" value={password} onChange={setPassword} />
            <div className="relative">
              <input className={inputClass} placeholder="TOTP (6 digits)" value={totp} onChange={e => setTotp(e.target.value)} maxLength={6} inputMode="numeric" />
            </div>
            <details className="text-xs text-muted-foreground">
              <summary className="cursor-pointer flex items-center gap-1"><Info size={12} />Where to find these?</summary>
              <p className="mt-1 pl-4">Get API Key from SmartAPI portal → My API → Create App. Client ID is your Angel One login ID.</p>
            </details>
            <button onClick={handleConnect} disabled={connecting} className="w-full h-12 rounded-xl bg-gradient-to-r from-profit to-info text-background font-bold text-sm disabled:opacity-50">
              {connecting ? '🔄 Connecting...' : '🔗 Connect Account'}
            </button>
          </div>
        )}
      </Section>

      {/* 5.2 Gemini AI */}
      <Section title="Gemini AI" icon="🤖">
        <SecureInput placeholder="Gemini API Key" value={geminiKey} onChange={setGeminiKey} type="text" />
        <details className="text-xs text-muted-foreground">
          <summary className="cursor-pointer flex items-center gap-1"><Info size={12} />Get free API key</summary>
          <p className="mt-1 pl-4">Visit makersuite.google.com → Get API Key → Create</p>
        </details>
        <div className="flex gap-2">
          <button onClick={() => { setApiKey(geminiKey); toast.success('API key saved'); setGeminiStatus(geminiKey ? 'valid' : 'idle'); }} className="flex-1 h-10 rounded-xl bg-ai/20 text-ai text-sm font-bold">Save Key</button>
          <button onClick={() => { setGeminiStatus(geminiKey ? 'valid' : 'invalid'); toast.info(geminiKey ? 'Key looks valid' : 'No key set'); }} className="flex-1 h-10 rounded-xl border border-ai text-ai text-sm font-bold">Test Key</button>
        </div>
        {geminiStatus !== 'idle' && (
          <p className={`text-xs font-bold ${geminiStatus === 'valid' ? 'text-profit' : 'text-loss'}`}>
            {geminiStatus === 'valid' ? '✅ Valid' : '❌ Invalid'}
          </p>
        )}
        {isConfigured && <Badge variant="ai">Configured</Badge>}
      </Section>

      {/* 5.3 CORS Proxy */}
      <Section title="CORS Proxy" icon="🌐">
        {['direct', 'corsproxy.io', 'allorigins.win', 'custom'].map(opt => (
          <label key={opt} className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="radio" name="cors" checked={corsProxy === opt} onChange={() => setCorsProxy(opt)} className="accent-info" />
            <span className="capitalize">{opt === 'direct' ? 'Direct (No Proxy)' : opt}</span>
          </label>
        ))}
        {corsProxy === 'custom' && (
          <input className={inputClass} placeholder="https://your-proxy.com/?url=" value={customProxy} onChange={e => setCustomProxy(e.target.value)} />
        )}
      </Section>

      {/* 5.4 Risk Management */}
      <Section title="Risk Management" icon="🛡️">
        <p className="text-xs font-bold text-muted-foreground">💰 Capital</p>
        <div>
          <label className="text-xs text-secondary-foreground">Total Capital (₹)</label>
          <input className={inputClass} type="number" value={risk.capital} onChange={e => updateRisk('capital', +e.target.value)} />
        </div>
        <Slider min={1} max={10} step={0.5} value={risk.maxPerTrade} onChange={v => updateRisk('maxPerTrade', v)} label="Max Per Trade" unit="%" />
        <Slider min={20} max={80} step={5} value={risk.maxDeployed} onChange={v => updateRisk('maxDeployed', v)} label="Max Deployed" unit="%" />
        <Slider min={10} max={40} step={5} value={risk.reserve} onChange={v => updateRisk('reserve', v)} label="Reserve" unit="%" />

        <p className="text-xs font-bold text-muted-foreground mt-2">🛑 Loss Limits</p>
        <Slider min={0.5} max={5} step={0.25} value={risk.maxLossTrade} onChange={v => updateRisk('maxLossTrade', v)} label="Max Loss/Trade" unit="%" />
        <div>
          <label className="text-xs text-secondary-foreground">Max Daily Loss (₹)</label>
          <input className={inputClass} type="number" value={risk.maxDailyLoss} onChange={e => updateRisk('maxDailyLoss', +e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-secondary-foreground">Max Weekly Loss (₹)</label>
          <input className={inputClass} type="number" value={risk.maxWeeklyLoss} onChange={e => updateRisk('maxWeeklyLoss', +e.target.value)} />
        </div>
        <Slider min={1} max={10} value={risk.maxConsecutive} onChange={v => updateRisk('maxConsecutive', v)} label="Max Consecutive Losses" />
        <Slider min={1} max={10} value={risk.maxOpenPositions} onChange={v => updateRisk('maxOpenPositions', v)} label="Max Open Positions" />
        <Slider min={0} max={60} step={5} value={risk.cooldown} onChange={v => updateRisk('cooldown', v)} label="Cooldown" unit=" min" />
      </Section>

      {/* 5.5 Stop Loss */}
      <Section title="Stop Loss" icon="🛑">
        <div className="flex gap-2">
          {['fixed', 'atr', 'ai'].map(t => (
            <PillButton key={t} active={sl.type === t} onClick={() => updateSl('type', t)}>
              {t === 'fixed' ? 'Fixed%' : t === 'atr' ? 'ATR-based' : 'AI Dynamic'}
            </PillButton>
          ))}
        </div>
        {sl.type === 'fixed' && <Slider min={0.5} max={5} step={0.25} value={sl.fixedPercent} onChange={v => updateSl('fixedPercent', v)} label="Fixed SL%" unit="%" />}
        {sl.type === 'atr' && <Slider min={1} max={4} step={0.5} value={sl.atrMultiplier} onChange={v => updateSl('atrMultiplier', v)} label="ATR Multiplier" unit="x" />}

        <div className="border-t border-border pt-3">
          <Toggle checked={sl.trailing} onChange={v => updateSl('trailing', v)} label="Trailing SL" />
          {sl.trailing && (
            <>
              <Slider min={0.3} max={3} step={0.1} value={sl.trailingPercent} onChange={v => updateSl('trailingPercent', v)} label="Trail %" unit="%" />
              <Slider min={0.5} max={5} step={0.25} value={sl.trailingActivation} onChange={v => updateSl('trailingActivation', v)} label="Activation %" unit="%" />
            </>
          )}
        </div>

        <div className="border-t border-border pt-3">
          <Toggle checked={sl.breakeven} onChange={v => updateSl('breakeven', v)} label="Breakeven SL" />
          {sl.breakeven && <Slider min={0.5} max={3} step={0.25} value={sl.breakevenTrigger} onChange={v => updateSl('breakevenTrigger', v)} label="Trigger %" unit="%" />}
        </div>
      </Section>

      {/* 5.6 Targets */}
      <Section title="Targets" icon="🎯">
        <Slider min={1} max={10} step={0.5} value={targets.t1} onChange={v => updateTargets('t1', v)} label="Target 1" unit="%" />
        <Slider min={2} max={15} step={0.5} value={targets.t2} onChange={v => updateTargets('t2', v)} label="Target 2" unit="%" />
        <Slider min={3} max={20} step={0.5} value={targets.t3} onChange={v => updateTargets('t3', v)} label="Target 3" unit="%" />
        <Toggle checked={targets.partial} onChange={v => updateTargets('partial', v)} label="Partial Booking" />
        {targets.partial && (
          <>
            <Slider min={20} max={60} step={5} value={targets.t1Book} onChange={v => updateTargets('t1Book', v)} label="T1 Book%" unit="%" />
            <Slider min={20} max={50} step={5} value={targets.t2Book} onChange={v => updateTargets('t2Book', v)} label="T2 Book%" unit="%" />
            <p className="text-xs text-muted-foreground">T3: Remaining {100 - targets.t1Book - targets.t2Book}%</p>
          </>
        )}
      </Section>

      {/* 5.7 AI Settings */}
      <Section title="AI Settings" icon="🧠">
        <Slider min={50} max={95} step={5} value={ai.minConfidence} onChange={v => updateAi('minConfidence', v)} label="Min Confidence" unit="%" />
        <Toggle checked={ai.multiTF} onChange={v => updateAi('multiTF', v)} label="Multi-timeframe Analysis" />
        <Toggle checked={ai.volumeConfirm} onChange={v => updateAi('volumeConfirm', v)} label="Volume Confirmation" />
        <Slider min={2} max={6} value={ai.minIndicators} onChange={v => updateAi('minIndicators', v)} label="Min Indicators Agreeing" />
      </Section>

      {/* 5.8 Time Settings */}
      <Section title="Trading Hours" icon="🕐">
        {[['start', 'Trading Start'], ['end', 'Trading End'], ['squareOff', 'Square Off'], ['noNewAfter', 'No New Trades After']].map(([k, l]) => (
          <div key={k}>
            <label className="text-xs text-secondary-foreground">{l}</label>
            <input type="time" className={inputClass} value={(time as any)[k]} onChange={e => updateTime(k, e.target.value)} />
          </div>
        ))}
      </Section>

      {/* 5.9 Advanced */}
      <Section title="Advanced" icon="⚡">
        <p className="text-xs text-secondary-foreground mb-1">Trading Style</p>
        <div className="flex gap-2">
          {['scalping', 'intraday', 'swing'].map(s => (
            <PillButton key={s} active={adv.style === s} onClick={() => updateAdv('style', s)} className="capitalize">{s}</PillButton>
          ))}
        </div>
        <p className="text-xs text-secondary-foreground mb-1 mt-2">Mode</p>
        <div className="flex gap-2">
          {['equity', 'fno', 'both'].map(m => (
            <PillButton key={m} active={adv.mode === m} onClick={() => updateAdv('mode', m)} className="capitalize">{m === 'fno' ? 'F&O' : m}</PillButton>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Toggle checked={adv.pyramiding} onChange={v => updateAdv('pyramiding', v)} label="Pyramiding" />
          {adv.pyramiding && <Badge variant="danger">⚠️ Risky</Badge>}
        </div>
        <Toggle checked={adv.antiMartingale} onChange={v => updateAdv('antiMartingale', v)} label="Anti-Martingale" />
      </Section>

      {/* 5.10 Watchlist */}
      <Section title="Auto Trade Watchlist" icon="📋">
        <div className="flex gap-2">
          <input className={`${inputClass} flex-1`} placeholder="Search stock to add..." value={watchlistSearch} onChange={e => setWatchlistSearch(e.target.value)} />
          <button
            onClick={() => {
              if (watchlistSearch && !watchlist.find(w => w.symbol === watchlistSearch.toUpperCase())) {
                setWatchlist(prev => [...prev, { symbol: watchlistSearch.toUpperCase(), exchange: 'NSE', enabled: true }]);
                setWatchlistSearch('');
              }
            }}
            className="h-12 px-4 rounded-xl bg-info/20 text-info text-sm font-bold whitespace-nowrap"
          >+ Add</button>
        </div>
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {watchlist.map((w, i) => (
            <div key={w.symbol} className="flex items-center justify-between bg-background/30 rounded-lg p-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">{w.symbol}</span>
                <Badge variant="info">{w.exchange}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Toggle checked={w.enabled} onChange={v => setWatchlist(prev => prev.map((x, j) => j === i ? { ...x, enabled: v } : x))} />
                <button onClick={() => setWatchlist(prev => prev.filter((_, j) => j !== i))} className="text-loss p-1"><X size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* 5.11 Sync Settings */}
      <Section title="Sync" icon="🔄">
        <Toggle checked={sync.autoSync} onChange={v => updateSync('autoSync', v)} label="Auto Sync" />
        <div>
          <label className="text-xs text-secondary-foreground">Frequency (seconds)</label>
          <select className={inputClass} value={sync.frequency} onChange={e => updateSync('frequency', +e.target.value)}>
            {[3, 5, 10, 15, 30].map(s => <option key={s} value={s}>{s}s</option>)}
          </select>
        </div>
        <Toggle checked={sync.marketHoursOnly} onChange={v => updateSync('marketHoursOnly', v)} label="Market Hours Only" />
      </Section>

      {/* 5.12 Preferences */}
      <Section title="Preferences" icon="🔔">
        <Toggle checked={notifications} onChange={v => setNotifications(v)} label="Push Notifications" />
      </Section>

      {/* About */}
      <Section title="About" icon="ℹ️">
        <p className="text-xs text-muted-foreground">ShahTrade AI v1.0.0</p>
        <p className="text-xs text-muted-foreground">AI-Powered Algo Trading Platform</p>
        <p className="text-lg text-center mt-2">Made with ❤️ by Shahrukh</p>
        <Disclaimer />
        <button onClick={() => setShowReset(true)} className="text-sm text-loss font-bold mt-2">Reset All Settings</button>
      </Section>

      <ConfirmModal isOpen={showReset} title="⚠️ Reset All Settings" message="This will clear ALL saved settings and reload the app. Are you sure?" confirmText="Reset" onConfirm={handleReset} onCancel={() => setShowReset(false)} />
    </div>
  );
};

export default SettingsPage;
