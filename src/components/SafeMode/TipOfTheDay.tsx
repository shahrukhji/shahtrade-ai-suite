import { useState, useEffect } from 'react';
import GlassCard from '@/components/Common/GlassCard';
import { TIPS_DATABASE } from '@/data/affordableStocks';

const TipOfTheDay = () => {
  const [idx, setIdx] = useState(() => {
    const day = Math.floor(Date.now() / 86400000);
    return day % TIPS_DATABASE.length;
  });

  return (
    <GlassCard>
      <p className="text-sm font-bold mb-1">💡 TIP OF THE DAY</p>
      <p className="text-xs text-muted-foreground leading-relaxed">"{TIPS_DATABASE[idx]}"</p>
      <button
        onClick={() => setIdx(p => (p + 1) % TIPS_DATABASE.length)}
        className="text-[11px] text-info font-bold mt-2"
      >
        Next Tip →
      </button>
    </GlassCard>
  );
};

export default TipOfTheDay;
