import React from 'react';

interface Props {
  height?: number | string;
  width?: number | string;
  radius?: number;
  className?: string;
}

const LoadingSkeleton: React.FC<Props> = ({ height = 20, width = '100%', radius = 8, className = '' }) => (
  <div
    className={`animate-shimmer rounded ${className}`}
    style={{ height, width, borderRadius: radius, background: 'rgba(255,255,255,0.05)' }}
  />
);

export default LoadingSkeleton;
