import React, { useEffect, useState } from 'react';
import { formatINR } from '@/utils/formatters';

interface Props {
  value: number;
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
  previousValue?: number;
}

const sizeClasses = { sm: 'text-sm', md: 'text-lg', lg: 'text-2xl' };

const PriceDisplay: React.FC<Props> = ({ value, size = 'md', animate, previousValue }) => {
  const [flash, setFlash] = useState('');

  useEffect(() => {
    if (animate && previousValue !== undefined && previousValue !== value) {
      setFlash(value > previousValue ? 'animate-flash-green' : 'animate-flash-red');
      const t = setTimeout(() => setFlash(''), 500);
      return () => clearTimeout(t);
    }
  }, [value, previousValue, animate]);

  return (
    <span className={`font-mono font-bold ${sizeClasses[size]} ${flash}`}>
      {formatINR(value)}
    </span>
  );
};

export default PriceDisplay;
