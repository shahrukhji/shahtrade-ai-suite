import GlassCard from '@/components/Common/GlassCard';
import Toggle from '@/components/Common/Toggle';
import { useAngelOne } from '@/context/AngelOneContext';
import { useGemini } from '@/context/GeminiContext';
import { useCustomToast } from '@/hooks/useCustomToast';
import { useState } from 'react';
import Disclaimer from '@/components/Common/Disclaimer';
import Badge from '@/components/Common/Badge';

const SettingsPage = () => {
  const { isConnected, connect, disconnect, userProfile } = useAngelOne();
  const { apiKey, setApiKey, isConfigured } = useGemini();
  const toast = useCustomToast();
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [clientId, setClientId] = useState('');
  const [password, setPassword] = useState('');
  const [totp, setTotp] = useState('');
  const [geminiKey, setGeminiKey] = useState(apiKey);
  const [notifications, setNotifications] = useState(true);

  const handleConnect = async () => {
    if (!apiKeyInput || !clientId || !password || !totp) {
      toast.error('Please fill all fields');
      return;
    }
    try {
      await connect(apiKeyInput, clientId, password, totp);
      toast.success('Connected to Angel One!');
    } catch {
      toast.error('Connection failed');
    }
  };

  const inputClass = "w-full h-12 rounded-xl px-4 text-sm bg-input border border-border focus:border-info focus:outline-none";

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">⚙️ Settings</h1>

      {/* Angel One Connection */}
      <GlassCard>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold">🔗 Angel One</p>
          {isConnected && <Badge variant="success">Connected</Badge>}
        </div>
        {isConnected ? (
          <div>
            <p className="text-sm">Logged in as <span className="font-bold">{userProfile?.name}</span></p>
            <p className="text-xs text-muted-foreground">Client: {userProfile?.clientcode}</p>
            <button onClick={disconnect} className="mt-3 w-full h-10 rounded-xl border border-loss text-loss text-sm font-bold">Disconnect</button>
          </div>
        ) : (
          <div className="space-y-3">
            <input className={inputClass} placeholder="API Key" value={apiKeyInput} onChange={e => setApiKeyInput(e.target.value)} />
            <input className={inputClass} placeholder="Client ID" value={clientId} onChange={e => setClientId(e.target.value)} />
            <input className={inputClass} placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
            <input className={inputClass} placeholder="TOTP" value={totp} onChange={e => setTotp(e.target.value)} />
            <button onClick={handleConnect} className="w-full h-12 rounded-xl bg-info text-foreground font-bold">Connect</button>
          </div>
        )}
      </GlassCard>

      {/* Gemini AI */}
      <GlassCard>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold">🤖 Gemini AI</p>
          {isConfigured && <Badge variant="ai">Configured</Badge>}
        </div>
        <input className={inputClass} placeholder="Gemini API Key" value={geminiKey} onChange={e => setGeminiKey(e.target.value)} />
        <button onClick={() => { setApiKey(geminiKey); toast.success('API key saved'); }} className="mt-3 w-full h-10 rounded-xl bg-ai/20 text-ai text-sm font-bold">Save Key</button>
      </GlassCard>

      {/* Preferences */}
      <GlassCard>
        <p className="text-sm font-bold mb-3">🔔 Preferences</p>
        <Toggle checked={notifications} onChange={setNotifications} label="Push Notifications" />
      </GlassCard>

      {/* About */}
      <GlassCard>
        <p className="text-sm font-bold mb-2">ℹ️ About</p>
        <p className="text-xs text-muted-foreground">ShahTrade AI v1.0.0</p>
        <p className="text-xs text-muted-foreground">AI-Powered Algo Trading Platform</p>
        <p className="text-xs text-muted-foreground mt-2">Made with ❤️ by Shahrukh</p>
      </GlassCard>

      <Disclaimer />
    </div>
  );
};

export default SettingsPage;
