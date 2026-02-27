import React from 'react';

interface Props {
  checked: boolean;
  onChange: (val: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: 'sm' | 'lg';
}

const Toggle: React.FC<Props> = ({ checked, onChange, label, disabled = false, size = 'sm' }) => {
  const w = size === 'lg' ? 64 : 52;
  const h = size === 'lg' ? 32 : 28;
  const thumb = size === 'lg' ? 28 : 24;

  return (
    <label className={`flex items-center gap-2 ${disabled ? 'opacity-50' : 'cursor-pointer'}`}>
      <div
        className="relative rounded-full transition-colors duration-200"
        style={{ width: w, height: h, backgroundColor: checked ? '#00ff88' : '#333' }}
        onClick={() => !disabled && onChange(!checked)}
      >
        <div
          className="absolute top-0.5 rounded-full bg-foreground transition-transform duration-200"
          style={{
            width: thumb, height: thumb,
            transform: `translateX(${checked ? w - thumb - 2 : 2}px)`,
          }}
        />
      </div>
      {label && <span className="text-sm">{label}</span>}
    </label>
  );
};

export default Toggle;
