import React from 'react';

interface Props {
  value: number;
  color?: string;
  height?: number;
  showLabel?: boolean;
  className?: string;
}

const ProgressBar: React.FC<Props> = ({ value, color, height = 6, showLabel, className = '' }) => {
  const clampedVal = Math.min(100, Math.max(0, value));
  const bg = color || (clampedVal > 80 ? 'bg-loss' : clampedVal > 50 ? 'bg-warning' : 'bg-profit');

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex-1 rounded-full overflow-hidden" style={{ height, background: '#222' }}>
        <div className={`h-full rounded-full transition-all duration-500 ${bg}`} style={{ width: `${clampedVal}%` }} />
      </div>
      {showLabel && <span className="text-[10px] font-mono text-secondary-foreground w-8 text-right">{Math.round(clampedVal)}%</span>}
    </div>
  );
};

export default ProgressBar;
