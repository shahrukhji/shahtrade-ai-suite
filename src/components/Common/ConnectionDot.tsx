import React from 'react';

interface Props { status: 'connected' | 'disconnected' | 'syncing'; showLabel?: boolean; }

const ConnectionDot: React.FC<Props> = ({ status, showLabel = true }) => {
  const styles = {
    connected: 'bg-profit animate-pulse-green',
    disconnected: 'bg-loss animate-pulse-red',
    syncing: 'bg-warning',
  };
  const labels = { connected: 'Connected', disconnected: 'Disconnected', syncing: 'Syncing...' };

  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-2 h-2 rounded-full ${styles[status]}`} />
      {showLabel && <span className="text-[11px] text-muted-foreground">{labels[status]}</span>}
    </div>
  );
};

export default ConnectionDot;
