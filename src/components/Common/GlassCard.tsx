import React from 'react';

interface Props {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

const GlassCard: React.FC<Props> = ({ children, className = '', noPadding }) => (
  <div className={`glass rounded-2xl shadow-lg ${noPadding ? '' : 'p-4'} ${className}`}>
    {children}
  </div>
);

export default GlassCard;
