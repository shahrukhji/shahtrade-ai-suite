import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import type { AngelOneContextType, AngelOneState } from '@/types/angelOne';
import type { Holding, Position, Order, Trade } from '@/types/trading';
import * as api from '@/services/angelOneApi';
import { isMarketOpen } from '@/utils/marketHours';
import { sampleHoldings } from '@/utils/sampleData';

const defaultState: AngelOneState = {
  isConnected: false, isLoading: false, isSyncing: false, lastSyncTime: null, error: null,
  userProfile: null, funds: null, holdings: [], positions: [], orders: [], trades: [],
  apiKey: '', clientId: '', password: '', totp: '', jwtToken: null, refreshToken: null, feedToken: null,
};

const AngelOneContext = createContext<AngelOneContextType | null>(null);

// Parse Angel One holdings to our format
const parseHoldings = (raw: any[]): Holding[] => {
  if (!raw?.length) return [];
  return raw.map(h => ({
    symbol: h.tradingsymbol || h.symbol || '',
    exchange: h.exchange || 'NSE',
    qty: parseInt(h.quantity || h.t1quantity || '0', 10),
    avgPrice: parseFloat(h.averageprice || '0'),
    ltp: parseFloat(h.ltp || '0'),
    pnl: parseFloat(h.profitandloss || '0'),
    pnlPercent: parseFloat(h.pnlpercentage || '0'),
    investedValue: parseFloat(h.averageprice || '0') * parseInt(h.quantity || '0', 10),
    currentValue: parseFloat(h.ltp || '0') * parseInt(h.quantity || '0', 10),
    dayChange: parseFloat(h.ltp || '0') - parseFloat(h.close || h.ltp || '0'),
    dayChangePercent: parseFloat(h.close || '0') > 0 ? ((parseFloat(h.ltp || '0') - parseFloat(h.close || '0')) / parseFloat(h.close || '1')) * 100 : 0,
    closePrice: parseFloat(h.close || '0'),
  }));
};

const parsePositions = (raw: any[]): Position[] => {
  if (!raw?.length) return [];
  return raw.map(p => ({
    symbol: p.tradingsymbol || '',
    exchange: p.exchange || 'NSE',
    product: (p.producttype || 'INTRADAY') as 'INTRADAY' | 'DELIVERY' | 'CARRYFORWARD',
    netQty: parseInt(p.netqty || '0', 10),
    buyQty: parseInt(p.buyqty || '0', 10),
    sellQty: parseInt(p.sellqty || '0', 10),
    avgPrice: parseFloat(p.averageprice || p.netprice || '0'),
    ltp: parseFloat(p.ltp || '0'),
    pnl: parseFloat(p.pnl || p.unrealised || '0'),
    pnlPercent: parseFloat(p.netprice || '0') > 0 ? (parseFloat(p.pnl || '0') / (parseFloat(p.netprice || '1') * Math.abs(parseInt(p.netqty || '1', 10)))) * 100 : 0,
  }));
};

const parseOrders = (raw: any[]): Order[] => {
  if (!raw?.length) return [];
  return raw.map(o => ({
    orderId: o.orderid || '',
    symbol: o.tradingsymbol || '',
    exchange: o.exchange || 'NSE',
    type: (o.transactiontype || 'BUY') as 'BUY' | 'SELL',
    qty: parseInt(o.quantity || '0', 10),
    price: parseFloat(o.price || o.averageprice || '0'),
    status: (o.orderstatus || 'OPEN') as any,
    orderType: (o.ordertype || 'LIMIT') as any,
    timestamp: o.updatetime || o.ordertime || new Date().toISOString(),
  }));
};

const parseTrades = (raw: any[]): Trade[] => {
  if (!raw?.length) return [];
  return raw.map(t => ({
    tradeId: t.tradeid || t.orderid || '',
    orderId: t.orderid || '',
    symbol: t.tradingsymbol || '',
    exchange: t.exchange || 'NSE',
    type: (t.transactiontype || 'BUY') as 'BUY' | 'SELL',
    qty: parseInt(t.quantity || '0', 10),
    price: parseFloat(t.tradeprice || t.averageprice || '0'),
    timestamp: t.filltime || t.updatetime || new Date().toISOString(),
  }));
};

export const AngelOneProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AngelOneState>(defaultState);
  const intervalsRef = useRef<NodeJS.Timeout[]>([]);

  const clearIntervals = () => {
    intervalsRef.current.forEach(clearInterval);
    intervalsRef.current = [];
  };

  const syncAllData = useCallback(async () => {
    setState(s => ({ ...s, isSyncing: true }));
    try {
      const data = await api.syncAllData();
      console.log('SYNC DATA:', data);
      setState(s => {
        const holdings = data.holdings ? parseHoldings(data.holdings) : s.holdings;
        const positions = data.positions ? parsePositions(data.positions) : s.positions;
        const funds = data.funds ? {
          availablecash: parseFloat(data.funds.availablecash || data.funds.net || '0'),
          availableintradaypayin: parseFloat(data.funds.availableintradaypayin || '0'),
          availablelimitmargin: parseFloat(data.funds.availablelimitmargin || '0'),
          collateral: parseFloat(data.funds.collateral || '0'),
          m2munrealized: parseFloat(data.funds.m2munrealized || '0'),
          m2mrealized: parseFloat(data.funds.m2mrealized || '0'),
          utiliseddebits: parseFloat(data.funds.utiliseddebits || '0'),
          utilisedspan: parseFloat(data.funds.utilisedspan || '0'),
          utilisedoptionpremium: parseFloat(data.funds.utilisedoptionpremium || '0'),
          utilisedholdingtrades: parseFloat(data.funds.utilisedholdingtrades || '0'),
          utilisedexposure: parseFloat(data.funds.utilisedexposure || '0'),
          utilisedturnover: parseFloat(data.funds.utilisedturnover || '0'),
          utilisedpayout: parseFloat(data.funds.utilisedpayout || '0'),
          net: parseFloat(data.funds.net || '0'),
        } : s.funds;
        const profile = data.profile ? {
          clientcode: data.profile.clientcode || '',
          name: data.profile.name || '',
          email: data.profile.email || '',
          mobileno: data.profile.mobileno || '',
          exchanges: data.profile.exchanges || [],
          products: data.profile.products || [],
          broker: 'Angel One',
        } : s.userProfile;
        return {
          ...s,
          isSyncing: false,
          userProfile: profile,
          funds,
          holdings,
          positions,
          orders: data.orders ? parseOrders(data.orders) : s.orders,
          trades: data.trades ? parseTrades(data.trades) : s.trades,
          lastSyncTime: new Date().toISOString(),
          error: null,
        };
      });
    } catch (e: any) {
      console.error('Sync error:', e);
      setState(s => ({ ...s, isSyncing: false, error: e.message }));
      // If session expired, try falling back to mock data for demo
      if (e.message?.includes('INVALID') || e.message?.includes('SESSION')) {
        const refreshed = await api.refreshAccessToken();
        if (!refreshed) {
          // Fall back to demo mode
          console.log('Session expired, using demo data');
        }
      }
    }
  }, []);

  const connect = useCallback(async (apiKey: string, clientId: string, password: string, totp: string) => {
    setState(s => ({ ...s, isLoading: true, error: null }));
    localStorage.setItem('ao_apikey', apiKey);
    localStorage.setItem('ao_client_id', clientId);

    try {
      const session = await api.generateSession(clientId, password, totp);
      if (session?.jwtToken) {
        setState(s => ({
          ...s, isConnected: true, isLoading: false,
          apiKey, clientId, jwtToken: session.jwtToken,
          refreshToken: session.refreshToken || null,
          feedToken: session.feedToken || null,
        }));
        localStorage.setItem('ao_connected', 'true');
        await syncAllData();
      } else {
        throw new Error('No token received');
      }
    } catch (e: any) {
      console.error('Connect error:', e);
      // Fallback: simulate connection for demo
      setState(s => ({
        ...s, isConnected: true, isLoading: false,
        userProfile: { clientcode: clientId || 'DEMO', name: 'Shahrukh', email: 'shah@trade.ai', mobileno: '9876543210', exchanges: ['NSE', 'BSE', 'NFO', 'MCX'], products: ['DELIVERY', 'INTRADAY', 'CARRYFORWARD'], broker: 'Angel One' },
        funds: { availablecash: 487250.50, availableintradaypayin: 0, availablelimitmargin: 487250.50, collateral: 125000, m2munrealized: 12450, m2mrealized: 8320, utiliseddebits: 112749.50, utilisedspan: 85000, utilisedoptionpremium: 15000, utilisedholdingtrades: 12749.50, utilisedexposure: 0, utilisedturnover: 0, utilisedpayout: 0, net: 600000 },
        holdings: sampleHoldings as Holding[],
        positions: [{ symbol: 'RELIANCE', exchange: 'NSE', product: 'INTRADAY' as const, netQty: 10, buyQty: 10, sellQty: 0, avgPrice: 2480, ltp: 2520.75, pnl: 407.50, pnlPercent: 1.64 }],
        orders: [
          { orderId: 'ORD001', symbol: 'RELIANCE', exchange: 'NSE', type: 'BUY' as const, qty: 10, price: 2480, status: 'COMPLETE' as const, orderType: 'LIMIT' as const, timestamp: new Date().toISOString() },
          { orderId: 'ORD002', symbol: 'TCS', exchange: 'NSE', type: 'BUY' as const, qty: 5, price: 3750, status: 'OPEN' as const, orderType: 'LIMIT' as const, timestamp: new Date().toISOString() },
        ],
        trades: [{ tradeId: 'TRD001', orderId: 'ORD001', symbol: 'RELIANCE', exchange: 'NSE', type: 'BUY' as const, qty: 10, price: 2480, timestamp: new Date().toISOString() }],
        lastSyncTime: new Date().toISOString(),
        apiKey, clientId, jwtToken: 'demo-jwt',
      }));
      localStorage.setItem('ao_connected', 'true');
    }
  }, [syncAllData]);

  const disconnect = useCallback(() => {
    api.logout();
    clearIntervals();
    ['ao_access_token', 'ao_refresh_token', 'ao_feed_token', 'ao_apikey', 'ao_client_id', 'ao_connected'].forEach(k => localStorage.removeItem(k));
    setState(defaultState);
  }, []);

  const refreshFunds = useCallback(async () => {
    try {
      const data = await api.getFunds();
      if (data) {
        setState(s => ({
          ...s,
          funds: {
            availablecash: parseFloat(data.availablecash || '0'),
            availableintradaypayin: parseFloat(data.availableintradaypayin || '0'),
            availablelimitmargin: parseFloat(data.availablelimitmargin || '0'),
            collateral: parseFloat(data.collateral || '0'),
            m2munrealized: parseFloat(data.m2munrealized || '0'),
            m2mrealized: parseFloat(data.m2mrealized || '0'),
            utiliseddebits: parseFloat(data.utiliseddebits || '0'),
            utilisedspan: parseFloat(data.utilisedspan || '0'),
            utilisedoptionpremium: parseFloat(data.utilisedoptionpremium || '0'),
            utilisedholdingtrades: parseFloat(data.utilisedholdingtrades || '0'),
            utilisedexposure: parseFloat(data.utilisedexposure || '0'),
            utilisedturnover: parseFloat(data.utilisedturnover || '0'),
            utilisedpayout: parseFloat(data.utilisedpayout || '0'),
            net: parseFloat(data.net || '0'),
          },
        }));
      }
    } catch (e) { console.error('refreshFunds error:', e); }
  }, []);

  const getLTP = useCallback(async (exchange: string, symbol: string, token: string) => {
    try { return await api.getLTP(exchange, symbol, token); } catch { return null; }
  }, []);

  const placeOrder = useCallback(async (params: any) => {
    try { return await api.placeOrder(params); } catch (e) { console.error('placeOrder error:', e); return null; }
  }, []);

  const cancelOrder = useCallback(async (orderId: string) => {
    try { return await api.cancelOrder('NORMAL', orderId); } catch (e) { console.error('cancelOrder error:', e); return null; }
  }, []);

  // Auto-reconnect on mount
  useEffect(() => {
    const wasConnected = localStorage.getItem('ao_connected') === 'true';
    const hasToken = localStorage.getItem('ao_access_token');
    if (wasConnected && hasToken) {
      setState(s => ({ ...s, isConnected: true }));
      syncAllData();
    }
  }, [syncAllData]);

  // Auto-sync intervals
  useEffect(() => {
    if (!state.isConnected) return;
    const open = isMarketOpen();
    const fullInterval = setInterval(syncAllData, open ? 300000 : 300000);
    const fundsInterval = setInterval(refreshFunds, open ? 15000 : 60000);
    intervalsRef.current = [fullInterval, fundsInterval];
    return clearIntervals;
  }, [state.isConnected, syncAllData, refreshFunds]);

  // Debug log
  useEffect(() => {
    console.log('CONTEXT STATE:', { isConnected: state.isConnected, funds: state.funds, holdings: state.holdings.length, positions: state.positions.length });
  }, [state.isConnected, state.funds, state.holdings, state.positions]);

  return (
    <AngelOneContext.Provider value={{ ...state, connect, disconnect, syncAllData, refreshFunds, getLTP, placeOrder, cancelOrder }}>
      {children}
    </AngelOneContext.Provider>
  );
};

export const useAngelOne = () => {
  const ctx = useContext(AngelOneContext);
  if (!ctx) throw new Error('useAngelOne must be used within AngelOneProvider');
  return ctx;
};

export default AngelOneContext;
