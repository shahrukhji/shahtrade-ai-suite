import { useToastContext } from '@/context/ToastContext';

const icons: Record<string, string> = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
const borderColors: Record<string, string> = {
  success: 'border-l-profit', error: 'border-l-loss', warning: 'border-l-warning', info: 'border-l-info',
};

const Toast: React.FC<{ id: string; type: string; message: string }> = ({ id, type, message }) => {
  const { removeToast } = useToastContext();
  return (
    <div className={`flex items-center gap-3 bg-popover rounded-xl p-3 px-4 shadow-lg border-l-[3px] ${borderColors[type]} animate-fade-in`}>
      <span className="text-lg">{icons[type]}</span>
      <span className="flex-1 text-sm">{message}</span>
      <button onClick={() => removeToast(id)} className="text-muted-foreground text-lg leading-none">&times;</button>
    </div>
  );
};

import React from 'react';
export default Toast;
