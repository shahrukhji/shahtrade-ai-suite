import React from 'react';

interface Props { message: string; onRetry?: () => void; }

const ErrorBanner: React.FC<Props> = ({ message, onRetry }) => (
  <div className="rounded-xl p-3 flex items-center gap-2" style={{ background: 'rgba(255,51,102,0.1)', border: '1px solid rgba(255,51,102,0.3)' }}>
    <span>⚠️</span>
    <span className="flex-1 text-sm text-loss">{message}</span>
    {onRetry && <button onClick={onRetry} className="text-xs text-info font-semibold">Retry</button>}
  </div>
);

export default ErrorBanner;
