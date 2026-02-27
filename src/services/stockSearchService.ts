import type { StockSearchResult } from '@/types/trading';

const sampleResults: StockSearchResult[] = [
  { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', exchange: 'NSE', token: '2885', instrumentType: 'EQ' },
  { symbol: 'TCS', name: 'Tata Consultancy Services', exchange: 'NSE', token: '11536', instrumentType: 'EQ' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', exchange: 'NSE', token: '1333', instrumentType: 'EQ' },
  { symbol: 'INFY', name: 'Infosys Ltd', exchange: 'NSE', token: '1594', instrumentType: 'EQ' },
  { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd', exchange: 'NSE', token: '3456', instrumentType: 'EQ' },
  { symbol: 'SBIN', name: 'State Bank of India', exchange: 'NSE', token: '3045', instrumentType: 'EQ' },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', exchange: 'NSE', token: '4963', instrumentType: 'EQ' },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance Ltd', exchange: 'NSE', token: '317', instrumentType: 'EQ' },
  { symbol: 'NIFTY', name: 'NIFTY 50', exchange: 'NSE', token: '26000', instrumentType: 'INDEX' },
  { symbol: 'BANKNIFTY', name: 'NIFTY BANK', exchange: 'NSE', token: '26009', instrumentType: 'INDEX' },
];

export const searchStocks = async (query: string, _exchange?: string): Promise<StockSearchResult[]> => {
  if (!query) return [];
  const q = query.toLowerCase();
  return sampleResults.filter(s => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q));
};
