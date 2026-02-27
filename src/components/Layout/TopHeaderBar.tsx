import { Bell } from 'lucide-react';
import ConnectionDot from '@/components/Common/ConnectionDot';
import MarketStatusBadge from '@/components/Common/MarketStatusBadge';
import { useAngelOne } from '@/context/AngelOneContext';

const TopHeaderBar = () => {
  const { isConnected, isSyncing } = useAngelOne();
  const status = !isConnected ? 'disconnected' : isSyncing ? 'syncing' : 'connected';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-nav border-b border-border" style={{ height: 56 }}>
      <div className="flex items-center justify-between h-full px-4 max-w-[430px] mx-auto">
        <span className="text-base font-bold flex items-center gap-1">ShahTrade AI 📈</span>
        <ConnectionDot status={status} />
        <div className="flex items-center gap-3">
          <MarketStatusBadge />
          <div className="relative">
            <Bell size={20} className="text-secondary-foreground" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopHeaderBar;
