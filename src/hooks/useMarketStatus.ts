import { useState, useEffect } from 'react';
import { getMarketStatus, type MarketStatusType } from '@/utils/marketHours';

export const useMarketStatus = () => {
  const [status, setStatus] = useState<MarketStatusType>(getMarketStatus());

  useEffect(() => {
    const interval = setInterval(() => setStatus(getMarketStatus()), 60000);
    return () => clearInterval(interval);
  }, []);

  return status;
};
