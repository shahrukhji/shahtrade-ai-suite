export const getISTTime = (): Date => {
  const now = new Date();
  return new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
};

export const isWeekend = (): boolean => {
  const day = getISTTime().getDay();
  return day === 0 || day === 6;
};

export const isPreMarket = (): boolean => {
  const ist = getISTTime();
  const mins = ist.getHours() * 60 + ist.getMinutes();
  const day = ist.getDay();
  return day >= 1 && day <= 5 && mins >= 540 && mins < 555;
};

export const isMarketOpen = (): boolean => {
  const ist = getISTTime();
  const mins = ist.getHours() * 60 + ist.getMinutes();
  const day = ist.getDay();
  return day >= 1 && day <= 5 && mins >= 555 && mins <= 930;
};

export type MarketStatusType = 'open' | 'preMarket' | 'closed';

export const getMarketStatus = (): MarketStatusType => {
  if (isMarketOpen()) return 'open';
  if (isPreMarket()) return 'preMarket';
  return 'closed';
};

export const isWithinTradingHours = (startMins: number, endMins: number): boolean => {
  const ist = getISTTime();
  const mins = ist.getHours() * 60 + ist.getMinutes();
  return mins >= startMins && mins <= endMins;
};
