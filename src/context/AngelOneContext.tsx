import React, { createContext, useContext, useState, useCallback } from 'react';
import type { AngelOneContextType, AngelOneState } from '@/types/angelOne';
import type { Holding, Position, Order, Trade } from '@/types/trading';
import { sampleHoldings } from '@/utils/sampleData';

const defaultState: AngelOneState = {
  isConnected: false, isLoading: false, isSyncing: false, lastSyncTime: null, error: null,
  userProfile: null, funds: null, holdings: [], positions: [], orders: [], trades: [],
  apiKey: '', clientId: '', password: '', totp: '', jwtToken: null, refreshToken: null, feedToken: null,
};

const AngelOneContext = createContext<AngelOneContextType | null>(null);

export const AngelOneProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AngelOneState>(defaultState);

  const connect = useCallback(async (_apiKey: string, _clientId: string, _password: string, _totp: string) => {
    setState(s => ({ ...s, isLoading: true, error: null }));
    await new Promise(r => setTimeout(r, 1500));
    setState(s => ({
      ...s, isConnected: true, isLoading: false,
      userProfile: { clientcode: 'S12345', name: 'Shahrukh', email: 'shah@trade.ai', mobileno: '9876543210', exchanges: ['NSE', 'BSE', 'NFO', 'MCX'], products: ['DELIVERY', 'INTRADAY', 'CARRYFORWARD'], broker: 'Angel One' },
      funds: { availablecash: 487250.50, availableintradaypayin: 0, availablelimitmargin: 487250.50, collateral: 125000, m2munrealized: 12450, m2mrealized: 8320, utiliseddebits: 112749.50, utilisedspan: 85000, utilisedoptionpremium: 15000, utilisedholdingtrades: 12749.50, utilisedexposure: 0, utilisedturnover: 0, utilisedpayout: 0, net: 600000 },
      holdings: sampleHoldings as Holding[],
      positions: [
        { symbol: 'RELIANCE', exchange: 'NSE', product: 'INTRADAY' as const, netQty: 10, buyQty: 10, sellQty: 0, avgPrice: 2480, ltp: 2520.75, pnl: 407.50, pnlPercent: 1.64 },
      ] as Position[],
      orders: [
        { orderId: 'ORD001', symbol: 'RELIANCE', exchange: 'NSE', type: 'BUY' as const, qty: 10, price: 2480, status: 'COMPLETE' as const, orderType: 'LIMIT' as const, timestamp: new Date().toISOString() },
        { orderId: 'ORD002', symbol: 'TCS', exchange: 'NSE', type: 'BUY' as const, qty: 5, price: 3750, status: 'OPEN' as const, orderType: 'LIMIT' as const, timestamp: new Date().toISOString() },
      ] as Order[],
      trades: [
        { tradeId: 'TRD001', orderId: 'ORD001', symbol: 'RELIANCE', exchange: 'NSE', type: 'BUY' as const, qty: 10, price: 2480, timestamp: new Date().toISOString() },
      ] as Trade[],
      lastSyncTime: new Date().toISOString(),
      apiKey: _apiKey, clientId: _clientId, jwtToken: 'mock-jwt',
    }));
  }, []);

  const disconnect = useCallback(() => setState(defaultState), []);

  const syncAllData = useCallback(async () => {
    setState(s => ({ ...s, isSyncing: true }));
    await new Promise(r => setTimeout(r, 1000));
    setState(s => ({ ...s, isSyncing: false, lastSyncTime: new Date().toISOString() }));
  }, []);

  const refreshFunds = useCallback(async () => {
    console.log('refreshFunds called');
  }, []);

  const getLTP = useCallback(async (_e: string, _s: string, _t: string) => {
    console.log('getLTP called');
    return null;
  }, []);

  const placeOrder = useCallback(async (_params: any) => {
    console.log('placeOrder called');
    return null;
  }, []);

  const cancelOrder = useCallback(async (_orderId: string) => {
    console.log('cancelOrder called');
    return null;
  }, []);

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
