import React from 'react';
import { formatINR, formatPercent } from '@/utils/formatters';

interface Props {
  value: number;
  percentage?: number;
  showArrow?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = { sm: 'text-xs', md: 'text-sm', lg: 'text-lg' };

const PnLDisplay: React.FC<Props> = ({ value, percentage, showArrow = true, size = 'md' }) => {
  const isPos = value >= 0;
  const color = isPos ? 'text-profit' : 'text-loss';
  const arrow = isPos ? '▲' : '▼';

  return (
    <span className={`font-mono font-semibold ${sizes[size]} ${color}`}>
      {showArrow && <span className="mr-0.5">{arrow}</span>}
      {isPos ? '+' : ''}{formatINR(value)}
      {percentage !== undefined && <span className="ml-1 text-[0.85em]">({formatPercent(percentage)})</span>}
    </span>
  );
};

export default PnLDisplay;
