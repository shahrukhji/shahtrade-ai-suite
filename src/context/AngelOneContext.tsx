import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import type { AngelOneContextType, AngelOneState } from '@/types/angelOne';
import type { Holding, Position, Order, Trade } from '@/types/trading';
import * as api from '@/services/angelOneApi';
import { isMarketOpen } from '@/utils/marketHours';

const defaultState: AngelOneState = {
  isConnected: false, isLoading: false, isSyncing: false, lastSyncTime: null, error: null,
  userProfile: null, funds: null, holdings: [], positions: [], orders: [], trades: [],
  apiKey: '', clientId: '', password: '', jwtToken: null, refreshToken: null, feedToken: null,
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
      if (e.message?.includes('INVALID') || e.message?.includes('SESSION')) {
        await api.refreshAccessToken();
      }
    }
  }, []);

  const connect = useCallback(async (apiKey: string, clientId: string, password: string) => {
    setState(s => ({ ...s, isLoading: true, error: null }));
    localStorage.setItem('ao_apikey', apiKey);
    localStorage.setItem('ao_client_id', clientId);

    try {
      const session = await api.generateSession(clientId, password);
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
      setState(s => ({ ...s, isLoading: false, error: e.message }));
      throw e;
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
