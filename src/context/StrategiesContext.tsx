import React, { createContext, useContext, useState, useCallback } from 'react';
import { ALL_STRATEGIES, type Strategy, type StrategyExecution } from '@/data/strategies';

interface StrategiesContextType {
  strategies: Strategy[];
  activeExecutions: StrategyExecution[];
  toggleStrategy: (id: string) => void;
  addExecution: (exec: StrategyExecution) => void;
  closeExecution: (id: string) => void;
  updateExecutionPrices: (id: string, legPrices: Record<string, number>) => void;
}

const StrategiesContext = createContext<StrategiesContextType | null>(null);

export const StrategiesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [strategies, setStrategies] = useState<Strategy[]>(() => {
    try {
      const saved = localStorage.getItem('st_strategies_enabled');
      if (saved) {
        const enabledIds: string[] = JSON.parse(saved);
        return ALL_STRATEGIES.map(s => ({ ...s, enabled: enabledIds.includes(s.id) }));
      }
    } catch {}
    return [...ALL_STRATEGIES];
  });

  const [activeExecutions, setActiveExecutions] = useState<StrategyExecution[]>(() => {
    try {
      const saved = localStorage.getItem('st_active_executions');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const toggleStrategy = useCallback((id: string) => {
    setStrategies(prev => {
      const updated = prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s);
      localStorage.setItem('st_strategies_enabled', JSON.stringify(updated.filter(s => s.enabled).map(s => s.id)));
      return updated;
    });
  }, []);

  const addExecution = useCallback((exec: StrategyExecution) => {
    setActiveExecutions(prev => {
      const updated = [...prev, exec];
      localStorage.setItem('st_active_executions', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const closeExecution = useCallback((id: string) => {
    setActiveExecutions(prev => {
      const updated = prev.map(e => e.id === id ? { ...e, status: 'CLOSED' as const, exitTime: new Date().toISOString() } : e);
      localStorage.setItem('st_active_executions', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateExecutionPrices = useCallback((id: string, legPrices: Record<string, number>) => {
    setActiveExecutions(prev => prev.map(e => {
      if (e.id !== id) return e;
      const legs = e.legs.map(l => {
        const newPrice = legPrices[l.tradingsymbol];
        if (newPrice !== undefined) {
          const dir = l.action === 'BUY' ? 1 : -1;
          return { ...l, currentPrice: newPrice, pnl: dir * (newPrice - l.entryPrice) * l.quantity };
        }
        return l;
      });
      const realizedPnL = legs.reduce((s, l) => s + l.pnl, 0);
      return { ...e, legs, realizedPnL };
    }));
  }, []);

  return (
    <StrategiesContext.Provider value={{ strategies, activeExecutions, toggleStrategy, addExecution, closeExecution, updateExecutionPrices }}>
      {children}
    </StrategiesContext.Provider>
  );
};

export const useStrategies = () => {
  const ctx = useContext(StrategiesContext);
  if (!ctx) throw new Error('useStrategies must be used within StrategiesProvider');
  return ctx;
};
