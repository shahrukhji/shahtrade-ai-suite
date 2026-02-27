export interface AffordableStock {
  symbol: string;
  name: string;
  token: string;
  exchange: string;
  approxPrice: number;
  category: string;
  safety: 'HIGH' | 'MEDIUM' | 'LOW';
}

export const AFFORDABLE_SAFE_STOCKS: AffordableStock[] = [
  { symbol: 'YESBANK', name: 'Yes Bank', token: '11915', exchange: 'NSE', approxPrice: 20, category: 'Banking', safety: 'MEDIUM' },
  { symbol: 'SUZLON', name: 'Suzlon Energy', token: '13221', exchange: 'NSE', approxPrice: 55, category: 'Energy', safety: 'MEDIUM' },
  { symbol: 'NHPC', name: 'NHPC Ltd', token: '17985', exchange: 'NSE', approxPrice: 85, category: 'Power', safety: 'HIGH' },
  { symbol: 'PNB', name: 'Punjab National Bank', token: '10666', exchange: 'NSE', approxPrice: 95, category: 'Banking', safety: 'HIGH' },
  { symbol: 'CANBK', name: 'Canara Bank', token: '10794', exchange: 'NSE', approxPrice: 95, category: 'Banking', safety: 'HIGH' },
  { symbol: 'HFCL', name: 'HFCL Ltd', token: '15918', exchange: 'NSE', approxPrice: 95, category: 'Telecom', safety: 'MEDIUM' },
  { symbol: 'SAIL', name: 'Steel Authority', token: '2963', exchange: 'NSE', approxPrice: 110, category: 'Metal', safety: 'HIGH' },
  { symbol: 'IOC', name: 'Indian Oil Corp', token: '1624', exchange: 'NSE', approxPrice: 130, category: 'Oil', safety: 'HIGH' },
  { symbol: 'IRFC', name: 'IRFC', token: '26438', exchange: 'NSE', approxPrice: 150, category: 'Finance', safety: 'HIGH' },
  { symbol: 'IEX', name: 'Indian Energy Exch', token: '22180', exchange: 'NSE', approxPrice: 160, category: 'Exchange', safety: 'HIGH' },
  { symbol: 'NATIONALUM', name: 'National Aluminium', token: '6364', exchange: 'NSE', approxPrice: 180, category: 'Metal', safety: 'HIGH' },
  { symbol: 'MANAPPURAM', name: 'Manappuram Finance', token: '19306', exchange: 'NSE', approxPrice: 180, category: 'Finance', safety: 'MEDIUM' },
  { symbol: 'GAIL', name: 'GAIL India', token: '4717', exchange: 'NSE', approxPrice: 185, category: 'Gas', safety: 'HIGH' },
  { symbol: 'BANKBARODA', name: 'Bank of Baroda', token: '4668', exchange: 'NSE', approxPrice: 230, category: 'Banking', safety: 'HIGH' },
  { symbol: 'TATAPOWER', name: 'Tata Power', token: '3426', exchange: 'NSE', approxPrice: 390, category: 'Power', safety: 'HIGH' },
  { symbol: 'RECLTD', name: 'REC Limited', token: '15355', exchange: 'NSE', approxPrice: 450, category: 'Finance', safety: 'HIGH' },
  { symbol: 'IRCTC', name: 'IRCTC', token: '13611', exchange: 'NSE', approxPrice: 800, category: 'Travel', safety: 'HIGH' },
  { symbol: 'TATACHEM', name: 'Tata Chemicals', token: '3405', exchange: 'NSE', approxPrice: 950, category: 'Chemical', safety: 'HIGH' },
];

export const PENNY_PROFIT_STRATEGY = {
  id: 'penny_profit',
  name: '🪙 Penny Profit',
  icon: '🪙',
  description: 'Ultra-safe strategy for ₹1,000–5,000 capital. Makes ₹2–20 per trade with near-zero risk.',
  expectedPerformance: {
    winRate: '70–80%',
    avgWin: '₹2–15 per trade',
    avgLoss: '₹1–5 per trade',
    weeklyExpected: '₹10–50 per week',
    monthlyExpected: '₹50–200 per month',
    riskLevel: 'ULTRA LOW',
  },
  rules: {
    entry: [
      'Stock must be in safe affordable list',
      'Stock dipped ≥1% today from open',
      'RSI below 40 (oversold)',
      'Above SMA 200 (long-term uptrend)',
      'Volume ≥0.8× average',
      'MACD histogram turning positive',
      'AI confidence above 85%',
      'Supertrend bullish on daily TF',
    ],
    exit: [
      'Target hit: 0.5–1.5% profit',
      'Stop loss hit: 0.3% loss',
      'RSI crosses above 65',
      'Holding 3+ days without profit',
    ],
  },
};

export const TIPS_DATABASE = [
  "Buy stocks that dipped 1-2% today — you're buying at a discount 🏷️",
  "Set stop loss BEFORE entering any trade — protect your money first 🛡️",
  "Don't trade in first 15 minutes after market opens — too volatile ⏰",
  "Delivery trades are safer than intraday — you keep the stock 📦",
  "If you're unsure, DON'T trade. Cash is also a position 💵",
  "Never risk more than 1% of your capital on a single trade 🎯",
  "Winning 6 out of 10 trades is EXCELLENT. Don't aim for 100% ✅",
  "Compound your profits — ₹1,000 growing 5%/month = ₹1,796 in 1 year 📈",
  "Government company stocks (PSU) are generally safer for beginners 🏛️",
  "Volume confirms the trend — high volume moves are more reliable 📊",
  "Always trade with a plan. Impulsive trades = guaranteed losses 📝",
  "Start small, learn the market, then scale up gradually 🐢",
  "Paper trade for at least a week before using real money 📝",
  "The market will always be there tomorrow. No rush! 🧘",
  "Diversify — never put all your money in one stock 🎲",
  "Track every trade in a journal to learn from mistakes 📓",
  "Avoid penny stocks under ₹10 — they're very risky 🚫",
  "Blue-chip stocks recover faster from dips. Stick with the big names 💎",
  "Don't average down on losing trades — that's how big losses happen ⬇️",
  "Profits are profits — never feel bad about booking small gains 🎉",
];

export const MILESTONES = [
  { amount: 1050, label: 'First ₹50!', emoji: '🎉' },
  { amount: 1100, label: '10% Growth!', emoji: '🎊' },
  { amount: 1250, label: 'Quarter Up!', emoji: '🌟' },
  { amount: 1500, label: 'Halfway to Double!', emoji: '🚀' },
  { amount: 2000, label: 'DOUBLED! 🏆', emoji: '🏆' },
  { amount: 5000, label: 'Unlock More Stocks', emoji: '🔓' },
  { amount: 10000, label: 'Pro Mode Available', emoji: '💎' },
  { amount: 25000, label: 'Safe Mode Optional', emoji: '👑' },
];
