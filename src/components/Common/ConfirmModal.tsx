import React from 'react';

interface Props {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  confirmColor?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<Props> = ({ isOpen, title, message, confirmText = 'Confirm', confirmColor = 'bg-loss', onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onCancel} />
      <div className="relative bg-card rounded-2xl p-5 w-full max-w-sm shadow-2xl animate-fade-in">
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <p className="text-sm text-secondary-foreground mb-5">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 h-12 rounded-xl bg-muted text-secondary-foreground font-medium">Cancel</button>
          <button onClick={onConfirm} className={`flex-1 h-12 rounded-xl ${confirmColor} text-foreground font-bold`}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
