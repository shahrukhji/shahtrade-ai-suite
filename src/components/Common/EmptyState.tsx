import React from 'react';
import { LucideIcon, Package } from 'lucide-react';

interface Props {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<Props> = ({ icon: Icon = Package, title, description, actionLabel, onAction }) => (
  <div className="flex flex-col items-center justify-center py-10 text-center">
    <Icon size={40} className="text-muted-foreground mb-3" />
    <h4 className="text-base font-bold mb-1">{title}</h4>
    {description && <p className="text-[13px] text-muted-foreground max-w-[260px]">{description}</p>}
    {actionLabel && onAction && (
      <button onClick={onAction} className="mt-4 px-5 py-2 rounded-full bg-info/20 text-info text-sm font-semibold">
        {actionLabel}
      </button>
    )}
  </div>
);

export default EmptyState;
