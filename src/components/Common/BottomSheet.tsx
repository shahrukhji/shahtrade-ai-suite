import React, { useState } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

const BottomSheet: React.FC<Props> = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 max-h-[80vh] bg-card rounded-t-2xl animate-slide-up overflow-hidden">
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        </div>
        {title && <h3 className="text-base font-bold px-4 pb-2">{title}</h3>}
        <div className="overflow-y-auto max-h-[calc(80vh-60px)] px-4 pb-6">{children}</div>
      </div>
    </div>
  );
};

export default BottomSheet;
