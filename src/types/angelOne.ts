export interface UserProfile {
  clientcode: string;
  name: string;
  email: string;
  mobileno: string;
  exchanges: string[];
  products: string[];
  broker: string;
}

export interface Funds {
  availablecash: number;
  availableintradaypayin: number;
  availablelimitmargin: number;
  collateral: number;
  m2munrealized: number;
  m2mrealized: number;
  utiliseddebits: number;
  utilisedspan: number;
  utilisedoptionpremium: number;
  utilisedholdingtrades: number;
  utilisedexposure: number;
  utilisedturnover: number;
  utilisedpayout: number;
  net: number;
}

export interface LTPData {
  exchange: string;
  tradingsymbol: string;
  symboltoken: string;
  ltp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface AngelOneState {
  isConnected: boolean;
  isLoading: boolean;
  isSyncing: boolean;
  lastSyncTime: string | null;
  error: string | null;
  userProfile: UserProfile | null;
  funds: Funds | null;
  holdings: import('./trading').Holding[];
  positions: import('./trading').Position[];
  orders: import('./trading').Order[];
  trades: import('./trading').Trade[];
  apiKey: string;
  clientId: string;
  password: string;
  totp: string;
  jwtToken: string | null;
  refreshToken: string | null;
  feedToken: string | null;
}

export interface AngelOneContextType extends AngelOneState {
  connect: (apiKey: string, clientId: string, password: string, totp: string) => Promise<void>;
  disconnect: () => void;
  syncAllData: () => Promise<void>;
  refreshFunds: () => Promise<void>;
  getLTP: (exchange: string, symbol: string, token: string) => Promise<LTPData | null>;
  placeOrder: (params: any) => Promise<any>;
  cancelOrder: (orderId: string) => Promise<any>;
}
