export const formatINR = (n: number) =>
  '₹' + Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const formatINRCompact = (n: number) => {
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (abs >= 1e7) return sign + '₹' + (abs / 1e7).toFixed(2) + ' Cr';
  if (abs >= 1e5) return sign + '₹' + (abs / 1e5).toFixed(2) + ' L';
  if (abs >= 1e3) return sign + '₹' + (abs / 1e3).toFixed(1) + 'K';
  return sign + '₹' + abs.toFixed(2);
};

export const formatPercent = (n: number) => (n >= 0 ? '+' : '') + n.toFixed(2) + '%';

export const formatNumber = (n: number) => n.toLocaleString('en-IN');

export const formatTime = (d: Date | string) =>
  new Date(d).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit' });

export const formatDate = (d: Date | string) =>
  new Date(d).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric' });

export const timeAgo = (ts: string) => {
  const s = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (s < 60) return s + 's ago';
  if (s < 3600) return Math.floor(s / 60) + 'm ago';
  return Math.floor(s / 3600) + 'h ago';
};
