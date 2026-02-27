import React from 'react';

interface Props {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  style?: React.CSSProperties;
}

const GlassCard: React.FC<Props> = ({ children, className = '', noPadding, style }) => (
  <div className={`glass rounded-2xl shadow-lg ${noPadding ? '' : 'p-4'} ${className}`} style={style}>
    {children}
  </div>
);

export default GlassCard;
