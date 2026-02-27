export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Holding {
  symbol: string;
  exchange: string;
  qty: number;
  avgPrice: number;
  ltp: number;
  pnl: number;
  pnlPercent: number;
  investedValue: number;
  currentValue: number;
  dayChange: number;
  dayChangePercent: number;
  closePrice: number;
}

export interface Position {
  symbol: string;
  exchange: string;
  product: 'INTRADAY' | 'DELIVERY' | 'CARRYFORWARD';
  netQty: number;
  buyQty: number;
  sellQty: number;
  avgPrice: number;
  ltp: number;
  pnl: number;
  pnlPercent: number;
}

export interface Order {
  orderId: string;
  symbol: string;
  exchange: string;
  type: 'BUY' | 'SELL';
  qty: number;
  price: number;
  triggerPrice?: number;
  status: 'OPEN' | 'COMPLETE' | 'REJECTED' | 'CANCELLED';
  orderType: 'LIMIT' | 'MARKET' | 'SL' | 'SL-M';
  timestamp: string;
}

export interface Trade {
  tradeId: string;
  orderId: string;
  symbol: string;
  exchange: string;
  type: 'BUY' | 'SELL';
  qty: number;
  price: number;
  timestamp: string;
}

export interface MarketIndex {
  name: string;
  ltp: number;
  change: number;
  changePercent: number;
}

export interface StockSearchResult {
  symbol: string;
  name: string;
  exchange: string;
  token: string;
  instrumentType: string;
}

export interface TradeSetup {
  action: 'BUY' | 'SELL';
  symbol: string;
  entry: number;
  stopLoss: number;
  target1: number;
  target2: number;
  target3: number;
  qty: number;
  riskPercent: number;
  riskReward1: number;
  riskReward2: number;
  riskReward3: number;
  maxProfit: number;
  maxLoss: number;
}

export interface AISignal {
  direction: 'BUY' | 'SELL' | 'NEUTRAL';
  strength: 'STRONG BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG SELL';
  confidence: number;
  tradeScore: number;
  reasons: { icon: string; text: string }[];
}

export type MarketStatus = 'open' | 'preMarket' | 'closed';
export type ToastType = 'success' | 'error' | 'warning' | 'info';
