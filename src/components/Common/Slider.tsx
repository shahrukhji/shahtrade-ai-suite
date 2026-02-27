import React from 'react';

interface Props {
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (val: number) => void;
  label?: string;
  unit?: string;
  showValue?: boolean;
}

const Slider: React.FC<Props> = ({ min, max, step = 1, value, onChange, label, unit = '', showValue = true }) => {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-1">
      {(label || showValue) && (
        <div className="flex justify-between text-xs text-secondary-foreground">
          {label && <span>{label}</span>}
          {showValue && <span className="font-mono">{value}{unit}</span>}
        </div>
      )}
      <div className="relative h-6 flex items-center">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="w-full h-1 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, hsl(var(--info)) ${pct}%, #333 ${pct}%)`,
          }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
};

export default Slider;
