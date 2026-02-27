import React from 'react';

interface Props {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

const PillButton: React.FC<Props> = ({ active, onClick, children, className = '' }) => (
  <button
    onClick={onClick}
    className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap ${
      active
        ? 'bg-info/20 border-info text-info'
        : 'bg-transparent border-border text-muted-foreground hover:border-secondary-foreground'
    } ${className}`}
  >
    {children}
  </button>
);

export default PillButton;
