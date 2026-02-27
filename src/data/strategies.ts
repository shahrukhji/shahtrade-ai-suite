export interface StrategyLeg {
  legNumber: number;
  action: 'BUY' | 'SELL';
  instrument: 'STOCK' | 'CALL' | 'PUT' | 'FUTURE';
  strikeSelection: 'ATM' | 'ITM1' | 'ITM2' | 'OTM1' | 'OTM2' | 'OTM3' | 'CUSTOM';
  quantity: number;
  lots: number;
}

export interface Strategy {
  id: string;
  name: string;
  icon: string;
  category: 'BULLISH' | 'BEARISH' | 'NEUTRAL' | 'VOLATILE' | 'HEDGE';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  type: 'EQUITY' | 'FNO' | 'BOTH';
  legs: StrategyLeg[];
  description: string;
  whenToUse: string;
  maxProfit: string;
  maxLoss: string;
  breakeven: string;
  marginRequired: boolean;
  expectedWinRate: number;
  idealMarketCondition: string;
  enabled: boolean;
  parameters: Record<string, number>;
}

export interface StrategyExecution {
  id: string;
  strategyId: string;
  strategyName: string;
  symbol: string;
  exchange: string;
  expiry: string;
  spotPrice: number;
  legs: ExecutedLeg[];
  totalPremiumPaid: number;
  totalPremiumReceived: number;
  netCost: number;
  maxProfit: number;
  maxLoss: number;
  breakeven: number[];
  riskReward: string;
  status: 'PLANNED' | 'EXECUTING' | 'ACTIVE' | 'PARTIAL' | 'CLOSED' | 'EXPIRED';
  entryTime: string;
  exitTime: string | null;
  realizedPnL: number;
  daysToExpiry: number;
}

export interface ExecutedLeg {
  tradingsymbol: string;
  symboltoken: string;
  strike: number;
  type: 'CE' | 'PE' | 'FUT' | 'EQ';
  action: 'BUY' | 'SELL';
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  exitPrice: number | null;
  pnl: number;
  orderId: string | null;
}

export const ALL_STRATEGIES: Strategy[] = [
  // === BULLISH ===
  {
    id: 'bull_call_spread', name: 'Bull Call Spread', icon: '📈',
    category: 'BULLISH', riskLevel: 'LOW', type: 'FNO',
    legs: [
      { legNumber: 1, action: 'BUY', instrument: 'CALL', strikeSelection: 'ATM', quantity: 1, lots: 1 },
      { legNumber: 2, action: 'SELL', instrument: 'CALL', strikeSelection: 'OTM1', quantity: 1, lots: 1 },
    ],
    description: 'Buy ATM Call + Sell OTM Call. Limited risk, limited reward.',
    whenToUse: 'Moderately bullish, want limited risk',
    maxProfit: 'Strike difference - Net premium paid', maxLoss: 'Net premium paid',
    breakeven: 'Lower strike + net premium', marginRequired: true,
    expectedWinRate: 55, idealMarketCondition: 'Mild uptrend',
    enabled: true, parameters: { otmOffset: 1 },
  },
  {
    id: 'bull_put_spread', name: 'Bull Put Spread', icon: '📈',
    category: 'BULLISH', riskLevel: 'LOW', type: 'FNO',
    legs: [
      { legNumber: 1, action: 'SELL', instrument: 'PUT', strikeSelection: 'ATM', quantity: 1, lots: 1 },
      { legNumber: 2, action: 'BUY', instrument: 'PUT', strikeSelection: 'OTM1', quantity: 1, lots: 1 },
    ],
    description: 'Sell ATM Put + Buy OTM Put. Collect premium with limited risk.',
    whenToUse: 'Moderately bullish, want to collect premium',
    maxProfit: 'Net premium received', maxLoss: 'Strike diff - premium',
    breakeven: 'Higher strike - net premium', marginRequired: true,
    expectedWinRate: 60, idealMarketCondition: 'Mild uptrend, high IV',
    enabled: false, parameters: { otmOffset: 1 },
  },
  {
    id: 'long_call', name: 'Long Call', icon: '📈',
    category: 'BULLISH', riskLevel: 'MEDIUM', type: 'FNO',
    legs: [
      { legNumber: 1, action: 'BUY', instrument: 'CALL', strikeSelection: 'ATM', quantity: 1, lots: 1 },
    ],
    description: 'Buy a Call option. Unlimited upside, limited risk.',
    whenToUse: 'Strongly bullish',
    maxProfit: 'Unlimited', maxLoss: 'Premium paid',
    breakeven: 'Strike + premium', marginRequired: false,
    expectedWinRate: 45, idealMarketCondition: 'Strong uptrend expected',
    enabled: false, parameters: {},
  },
  {
    id: 'covered_call', name: 'Covered Call', icon: '🛡️',
    category: 'BULLISH', riskLevel: 'LOW', type: 'BOTH',
    legs: [
      { legNumber: 1, action: 'BUY', instrument: 'STOCK', strikeSelection: 'ATM', quantity: 1, lots: 1 },
      { legNumber: 2, action: 'SELL', instrument: 'CALL', strikeSelection: 'OTM1', quantity: 1, lots: 1 },
    ],
    description: 'Buy stock + Sell OTM Call. Income strategy for stock holders.',
    whenToUse: 'Mildly bullish, own the stock',
    maxProfit: 'Premium + (strike - stock price)', maxLoss: 'Stock price - premium',
    breakeven: 'Stock price - premium received', marginRequired: false,
    expectedWinRate: 65, idealMarketCondition: 'Sideways to mild uptrend',
    enabled: false, parameters: { otmOffset: 1 },
  },
  {
    id: 'call_ratio_backspread', name: 'Call Ratio Back Spread', icon: '📈',
    category: 'BULLISH', riskLevel: 'MEDIUM', type: 'FNO',
    legs: [
      { legNumber: 1, action: 'SELL', instrument: 'CALL', strikeSelection: 'ITM1', quantity: 1, lots: 1 },
      { legNumber: 2, action: 'BUY', instrument: 'CALL', strikeSelection: 'ATM', quantity: 2, lots: 2 },
    ],
    description: 'Sell 1 ITM Call + Buy 2 ATM Calls. Unlimited upside.',
    whenToUse: 'Very bullish, expect big move up',
    maxProfit: 'Unlimited upside', maxLoss: 'Limited between strikes',
    breakeven: 'Depends on premiums', marginRequired: true,
    expectedWinRate: 50, idealMarketCondition: 'Expected breakout upward',
    enabled: false, parameters: {},
  },
  // === BEARISH ===
  {
    id: 'bear_put_spread', name: 'Bear Put Spread', icon: '📉',
    category: 'BEARISH', riskLevel: 'LOW', type: 'FNO',
    legs: [
      { legNumber: 1, action: 'BUY', instrument: 'PUT', strikeSelection: 'ATM', quantity: 1, lots: 1 },
      { legNumber: 2, action: 'SELL', instrument: 'PUT', strikeSelection: 'OTM1', quantity: 1, lots: 1 },
    ],
    description: 'Buy ATM Put + Sell OTM Put. Limited risk bearish play.',
    whenToUse: 'Moderately bearish',
    maxProfit: 'Strike diff - net premium', maxLoss: 'Net premium paid',
    breakeven: 'Higher strike - net premium', marginRequired: true,
    expectedWinRate: 55, idealMarketCondition: 'Mild downtrend',
    enabled: true, parameters: { otmOffset: 1 },
  },
  {
    id: 'bear_call_spread', name: 'Bear Call Spread', icon: '📉',
    category: 'BEARISH', riskLevel: 'LOW', type: 'FNO',
    legs: [
      { legNumber: 1, action: 'SELL', instrument: 'CALL', strikeSelection: 'ATM', quantity: 1, lots: 1 },
      { legNumber: 2, action: 'BUY', instrument: 'CALL', strikeSelection: 'OTM1', quantity: 1, lots: 1 },
    ],
    description: 'Sell ATM Call + Buy OTM Call. Collect premium on bearish view.',
    whenToUse: 'Moderately bearish, collect premium',
    maxProfit: 'Net premium', maxLoss: 'Strike diff - premium',
    breakeven: 'Lower strike + net premium', marginRequired: true,
    expectedWinRate: 60, idealMarketCondition: 'Mild downtrend, high IV',
    enabled: false, parameters: { otmOffset: 1 },
  },
  {
    id: 'long_put', name: 'Long Put', icon: '📉',
    category: 'BEARISH', riskLevel: 'MEDIUM', type: 'FNO',
    legs: [
      { legNumber: 1, action: 'BUY', instrument: 'PUT', strikeSelection: 'ATM', quantity: 1, lots: 1 },
    ],
    description: 'Buy a Put option. Profits from downside.',
    whenToUse: 'Strongly bearish',
    maxProfit: 'Strike - premium', maxLoss: 'Premium paid',
    breakeven: 'Strike - premium', marginRequired: false,
    expectedWinRate: 45, idealMarketCondition: 'Strong downtrend expected',
    enabled: false, parameters: {},
  },
  {
    id: 'protective_put', name: 'Protective Put', icon: '🔒',
    category: 'HEDGE', riskLevel: 'LOW', type: 'BOTH',
    legs: [
      { legNumber: 1, action: 'BUY', instrument: 'PUT', strikeSelection: 'OTM1', quantity: 1, lots: 1 },
    ],
    description: 'Hold stock + Buy OTM Put. Insurance against downside.',
    whenToUse: 'Own stock, worried about fall',
    maxProfit: 'Unlimited upside - premium', maxLoss: 'Stock - Strike + Premium',
    breakeven: 'Stock price + premium', marginRequired: false,
    expectedWinRate: 70, idealMarketCondition: 'Uncertain, protecting portfolio',
    enabled: false, parameters: { otmOffset: 1 },
  },
  {
    id: 'put_ratio_backspread', name: 'Put Ratio Back Spread', icon: '📉',
    category: 'BEARISH', riskLevel: 'MEDIUM', type: 'FNO',
    legs: [
      { legNumber: 1, action: 'SELL', instrument: 'PUT', strikeSelection: 'ITM1', quantity: 1, lots: 1 },
      { legNumber: 2, action: 'BUY', instrument: 'PUT', strikeSelection: 'ATM', quantity: 2, lots: 2 },
    ],
    description: 'Sell 1 ITM Put + Buy 2 ATM Puts. Large profit on big drop.',
    whenToUse: 'Very bearish, expect big move down',
    maxProfit: 'Large if big drop', maxLoss: 'Limited between strikes',
    breakeven: 'Depends on premiums', marginRequired: true,
    expectedWinRate: 50, idealMarketCondition: 'Expected breakdown',
    enabled: false, parameters: {},
  },
  // === NEUTRAL ===
  {
    id: 'iron_condor', name: 'Iron Condor', icon: '🦅',
    category: 'NEUTRAL', riskLevel: 'LOW', type: 'FNO',
    legs: [
      { legNumber: 1, action: 'SELL', instrument: 'CALL', strikeSelection: 'OTM1', quantity: 1, lots: 1 },
      { legNumber: 2, action: 'BUY', instrument: 'CALL', strikeSelection: 'OTM2', quantity: 1, lots: 1 },
      { legNumber: 3, action: 'SELL', instrument: 'PUT', strikeSelection: 'OTM1', quantity: 1, lots: 1 },
      { legNumber: 4, action: 'BUY', instrument: 'PUT', strikeSelection: 'OTM2', quantity: 1, lots: 1 },
    ],
    description: 'Sell OTM Call+Put spreads. Profit from range-bound market.',
    whenToUse: 'Expecting range-bound, low volatility',
    maxProfit: 'Total premium received', maxLoss: 'Strike diff - premium',
    breakeven: 'Two breakevens at short strikes ± premium', marginRequired: true,
    expectedWinRate: 65, idealMarketCondition: 'Low volatility, range-bound',
    enabled: true, parameters: { otmOffset: 1 },
  },
  {
    id: 'iron_butterfly', name: 'Iron Butterfly', icon: '🦋',
    category: 'NEUTRAL', riskLevel: 'LOW', type: 'FNO',
    legs: [
      { legNumber: 1, action: 'SELL', instrument: 'CALL', strikeSelection: 'ATM', quantity: 1, lots: 1 },
      { legNumber: 2, action: 'SELL', instrument: 'PUT', strikeSelection: 'ATM', quantity: 1, lots: 1 },
      { legNumber: 3, action: 'BUY', instrument: 'CALL', strikeSelection: 'OTM1', quantity: 1, lots: 1 },
      { legNumber: 4, action: 'BUY', instrument: 'PUT', strikeSelection: 'OTM1', quantity: 1, lots: 1 },
    ],
    description: 'Sell ATM straddle + Buy OTM wings. Max profit at ATM.',
    whenToUse: 'Expecting price stays exactly at current level',
    maxProfit: 'Net premium at ATM', maxLoss: 'Wing width - premium',
    breakeven: 'ATM ± net premium', marginRequired: true,
    expectedWinRate: 55, idealMarketCondition: 'Very low volatility expected',
    enabled: false, parameters: { otmOffset: 1 },
  },
  {
    id: 'short_straddle', name: 'Short Straddle', icon: '⚖️',
    category: 'NEUTRAL', riskLevel: 'HIGH', type: 'FNO',
    legs: [
      { legNumber: 1, action: 'SELL', instrument: 'CALL', strikeSelection: 'ATM', quantity: 1, lots: 1 },
      { legNumber: 2, action: 'SELL', instrument: 'PUT', strikeSelection: 'ATM', quantity: 1, lots: 1 },
    ],
    description: 'Sell ATM Call + ATM Put. Max premium collection, unlimited risk.',
    whenToUse: 'Expecting NO movement, high premium',
    maxProfit: 'Total premium', maxLoss: 'Unlimited',
    breakeven: 'ATM ± total premium', marginRequired: true,
    expectedWinRate: 60, idealMarketCondition: 'Very low volatility, no events',
    enabled: false, parameters: {},
  },
  {
    id: 'short_strangle', name: 'Short Strangle', icon: '⚖️',
    category: 'NEUTRAL', riskLevel: 'HIGH', type: 'FNO',
    legs: [
      { legNumber: 1, action: 'SELL', instrument: 'CALL', strikeSelection: 'OTM1', quantity: 1, lots: 1 },
      { legNumber: 2, action: 'SELL', instrument: 'PUT', strikeSelection: 'OTM1', quantity: 1, lots: 1 },
    ],
    description: 'Sell OTM Call + OTM Put. Wider range than straddle.',
    whenToUse: 'Range-bound, wider range expected',
    maxProfit: 'Total premium', maxLoss: 'Unlimited',
    breakeven: 'Short strikes ± premium', marginRequired: true,
    expectedWinRate: 65, idealMarketCondition: 'Low volatility, wide range',
    enabled: false, parameters: { otmOffset: 1 },
  },
  {
    id: 'calendar_spread', name: 'Calendar Spread', icon: '📅',
    category: 'NEUTRAL', riskLevel: 'LOW', type: 'FNO',
    legs: [
      { legNumber: 1, action: 'SELL', instrument: 'CALL', strikeSelection: 'ATM', quantity: 1, lots: 1 },
      { legNumber: 2, action: 'BUY', instrument: 'CALL', strikeSelection: 'ATM', quantity: 1, lots: 1 },
    ],
    description: 'Sell near-expiry + Buy far-expiry ATM Call. Time decay play.',
    whenToUse: 'Neutral short-term, different expiries',
    maxProfit: 'Difference in time decay', maxLoss: 'Net debit paid',
    breakeven: 'Complex, depends on IV', marginRequired: true,
    expectedWinRate: 55, idealMarketCondition: 'Neutral, IV expected to rise',
    enabled: false, parameters: {},
  },
  {
    id: 'jade_lizard', name: 'Jade Lizard', icon: '🦎',
    category: 'NEUTRAL', riskLevel: 'MEDIUM', type: 'FNO',
    legs: [
      { legNumber: 1, action: 'SELL', instrument: 'PUT', strikeSelection: 'OTM1', quantity: 1, lots: 1 },
      { legNumber: 2, action: 'SELL', instrument: 'CALL', strikeSelection: 'OTM1', quantity: 1, lots: 1 },
      { legNumber: 3, action: 'BUY', instrument: 'CALL', strikeSelection: 'OTM2', quantity: 1, lots: 1 },
    ],
    description: 'Sell OTM Put + Bear Call Spread. No upside risk if done right.',
    whenToUse: 'Neutral to slightly bullish',
    maxProfit: 'Net premium', maxLoss: 'Put strike - premium',
    breakeven: 'Put strike - premium', marginRequired: true,
    expectedWinRate: 60, idealMarketCondition: 'Neutral to mild bullish',
    enabled: false, parameters: { otmOffset: 1 },
  },
  // === VOLATILE ===
  {
    id: 'long_straddle', name: 'Long Straddle', icon: '↕️',
    category: 'VOLATILE', riskLevel: 'MEDIUM', type: 'FNO',
    legs: [
      { legNumber: 1, action: 'BUY', instrument: 'CALL', strikeSelection: 'ATM', quantity: 1, lots: 1 },
      { legNumber: 2, action: 'BUY', instrument: 'PUT', strikeSelection: 'ATM', quantity: 1, lots: 1 },
    ],
    description: 'Buy ATM Call + ATM Put. Profits from big move either way.',
    whenToUse: 'Expecting BIG move in either direction (earnings, events)',
    maxProfit: 'Unlimited', maxLoss: 'Total premium paid',
    breakeven: 'Strike ± total premium', marginRequired: false,
    expectedWinRate: 40, idealMarketCondition: 'High volatility event expected',
    enabled: true, parameters: {},
  },
  {
    id: 'long_strangle', name: 'Long Strangle', icon: '🔀',
    category: 'VOLATILE', riskLevel: 'MEDIUM', type: 'FNO',
    legs: [
      { legNumber: 1, action: 'BUY', instrument: 'CALL', strikeSelection: 'OTM1', quantity: 1, lots: 1 },
      { legNumber: 2, action: 'BUY', instrument: 'PUT', strikeSelection: 'OTM1', quantity: 1, lots: 1 },
    ],
    description: 'Buy OTM Call + OTM Put. Cheaper than straddle, needs bigger move.',
    whenToUse: 'Expecting very big move, cheaper than straddle',
    maxProfit: 'Unlimited', maxLoss: 'Total premium',
    breakeven: 'Strike ± total premium', marginRequired: false,
    expectedWinRate: 35, idealMarketCondition: 'Very big event expected',
    enabled: false, parameters: { otmOffset: 1 },
  },
  {
    id: 'strap', name: 'Strap', icon: '💪',
    category: 'VOLATILE', riskLevel: 'HIGH', type: 'FNO',
    legs: [
      { legNumber: 1, action: 'BUY', instrument: 'CALL', strikeSelection: 'ATM', quantity: 2, lots: 2 },
      { legNumber: 2, action: 'BUY', instrument: 'PUT', strikeSelection: 'ATM', quantity: 1, lots: 1 },
    ],
    description: 'Buy 2 ATM Calls + 1 ATM Put. Biased bullish straddle.',
    whenToUse: 'Expecting big move, likely upward',
    maxProfit: 'Unlimited upside, limited downside', maxLoss: 'Total premium',
    breakeven: 'Complex calculation', marginRequired: false,
    expectedWinRate: 40, idealMarketCondition: 'Bullish volatility expected',
    enabled: false, parameters: {},
  },
  {
    id: 'strip', name: 'Strip', icon: '📉💪',
    category: 'VOLATILE', riskLevel: 'HIGH', type: 'FNO',
    legs: [
      { legNumber: 1, action: 'BUY', instrument: 'CALL', strikeSelection: 'ATM', quantity: 1, lots: 1 },
      { legNumber: 2, action: 'BUY', instrument: 'PUT', strikeSelection: 'ATM', quantity: 2, lots: 2 },
    ],
    description: 'Buy 1 ATM Call + 2 ATM Puts. Biased bearish straddle.',
    whenToUse: 'Expecting big move, likely downward',
    maxProfit: 'Large downside, limited upside', maxLoss: 'Total premium',
    breakeven: 'Complex calculation', marginRequired: false,
    expectedWinRate: 40, idealMarketCondition: 'Bearish volatility expected',
    enabled: false, parameters: {},
  },
];

export const getStrategyById = (id: string) => ALL_STRATEGIES.find(s => s.id === id);
export const getStrategiesByCategory = (cat: string) => cat === 'ALL' ? ALL_STRATEGIES : ALL_STRATEGIES.filter(s => s.category === cat);
export const getEnabledStrategies = () => ALL_STRATEGIES.filter(s => s.enabled);
