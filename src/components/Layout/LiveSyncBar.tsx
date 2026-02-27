import { useEffect, useState } from 'react';
import { useAngelOne } from '@/context/AngelOneContext';
import { getMarketStatus } from '@/utils/marketHours';

const LiveSyncBar = () => {
  const { isConnected, isSyncing, lastSyncTime, error, syncAllData } = useAngelOne();
  const [secondsAgo, setSecondsAgo] = useState(0);
  const [marketStatus, setMarketStatus] = useState(getMarketStatus());

  useEffect(() => {
    if (!lastSyncTime) return;
    const interval = setInterval(() => {
      setSecondsAgo(Math.floor((Date.now() - new Date(lastSyncTime).getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [lastSyncTime]);

  useEffect(() => {
    const interval = setInterval(() => setMarketStatus(getMarketStatus()), 60000);
    return () => clearInterval(interval);
  }, []);

  let dotClass = 'bg-muted-foreground';
  let text = '';

  if (!isConnected) {
    dotClass = 'bg-loss animate-pulse-red'; text = 'Disconnected';
  } else if (error) {
    dotClass = 'bg-loss animate-pulse-red'; text = '⚠️ Sync Error';
  } else if (isSyncing) {
    dotClass = 'bg-info'; text = 'Syncing...';
  } else if (marketStatus === 'closed') {
    dotClass = 'bg-warning'; text = 'Market Closed';
  } else {
    dotClass = 'bg-profit animate-pulse-green'; text = `Live • Updated ${secondsAgo}s ago`;
  }

  return (
    <div className="sticky z-[45] w-full flex items-center justify-center gap-1.5" style={{ top: 56, height: 24, background: 'rgba(10,14,39,0.95)' }}>
      <div className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
      <span className="text-[11px] text-muted-foreground cursor-pointer" onClick={error ? syncAllData : undefined}>{text}</span>
    </div>
  );
};

export default LiveSyncBar;
