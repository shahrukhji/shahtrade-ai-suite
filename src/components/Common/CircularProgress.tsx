import React from 'react';

interface Props {
  value: number;
  size?: number;
  strokeWidth?: number;
}

const CircularProgress: React.FC<Props> = ({ value, size = 80, strokeWidth = 6 }) => {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  const color = value > 80 ? 'hsl(var(--profit))' : value > 50 ? 'hsl(var(--warning))' : 'hsl(var(--loss))';

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#222" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>
      <span className="absolute text-sm font-bold font-mono">{Math.round(value)}%</span>
    </div>
  );
};

export default CircularProgress;
