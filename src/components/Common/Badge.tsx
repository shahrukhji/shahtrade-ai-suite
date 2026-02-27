import React from 'react';

type Variant = 'success' | 'danger' | 'info' | 'warning' | 'ai';

const styles: Record<Variant, string> = {
  success: 'bg-profit/15 text-profit',
  danger: 'bg-loss/15 text-loss',
  info: 'bg-info/15 text-info',
  warning: 'bg-warning/15 text-warning',
  ai: 'bg-ai/15 text-ai',
};

interface Props {
  variant: Variant;
  children: React.ReactNode;
  className?: string;
}

const Badge: React.FC<Props> = ({ variant, children, className = '' }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${styles[variant]} ${className}`}>
    {children}
  </span>
);

export default Badge;
