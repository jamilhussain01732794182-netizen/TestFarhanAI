import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Signal, PriceUpdate } from '../types';

interface TradingStore {
  signals: Signal[];
  addSignal: (signal: Signal) => void;
  updateSignal: (updatedSignal: Partial<Signal> & { id: string }) => void;
  clearSignals: () => void;
  activeBots: string[];
  setActiveBots: (bots: string[]) => void;
  prices: PriceUpdate;
  updatePrices: (updates: PriceUpdate) => void;
}

const TradingContext = createContext<TradingStore | undefined>(undefined);

export const TradingProvider = ({ children }: { children?: ReactNode }) => {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [activeBots, setActiveBots] = useState<string[]>(['EURUSD', 'GBPUSD']);
  const [prices, setPrices] = useState<PriceUpdate>({
    EURUSD: 1.0850,
    GBPUSD: 1.2650,
    USDJPY: 145.00,
    XAUUSD: 2315.50,
    BTCUSD: 65000.00
  });

  const addSignal = useCallback((signal: Signal) => {
    setSignals((prev) => {
      // Avoid duplicates
      if (prev.find(s => s.id === signal.id)) return prev;
      
      // Keep only last 100 signals for performance
      const newSignals = [signal, ...prev];
      if (newSignals.length > 100) {
        return newSignals.slice(0, 100);
      }
      return newSignals;
    });
  }, []);

  const updateSignal = useCallback((updatedSignal: Partial<Signal> & { id: string }) => {
    setSignals((prev) =>
      prev.map((signal) =>
        signal.id === updatedSignal.id
          ? { ...signal, ...updatedSignal }
          : signal
      )
    );
  }, []);

  const updatePrices = useCallback((updates: PriceUpdate) => {
    setPrices((prev) => ({
      ...prev,
      ...updates
    }));

    // Also update active signals' current prices if they match the symbols
    setSignals((prevSignals) =>
      prevSignals.map((signal) => {
        if (updates[signal.symbol] && signal.status === 'ACTIVE') {
          const currentPrice = updates[signal.symbol];
          let newStatus = signal.status;
          let pnl = signal.pnl || 0;
          let closed_at = signal.closed_at;
          let trade_result = signal.trade_result;

          // Check if SL or TP is hit
          if (signal.action === 'CALL' || signal.action === 'BUY') {
            if (currentPrice <= signal.sl_price) {
              newStatus = 'LOST';
              pnl = -Math.abs(signal.price - signal.sl_price) * 10000;
              closed_at = new Date().toISOString();
              trade_result = 'LOSS';
            } else if (currentPrice >= signal.tp_price) {
              newStatus = 'WON';
              pnl = Math.abs(signal.price - signal.tp_price) * 10000;
              closed_at = new Date().toISOString();
              trade_result = 'WIN';
            }
          } else if (signal.action === 'PUT' || signal.action === 'SELL') {
            if (currentPrice >= signal.sl_price) {
              newStatus = 'LOST';
              pnl = -Math.abs(signal.price - signal.sl_price) * 10000;
              closed_at = new Date().toISOString();
              trade_result = 'LOSS';
            } else if (currentPrice <= signal.tp_price) {
              newStatus = 'WON';
              pnl = Math.abs(signal.price - signal.tp_price) * 10000;
              closed_at = new Date().toISOString();
              trade_result = 'WIN';
            }
          }

          // Check if signal expired
          if (signal.expiry_time && new Date(signal.expiry_time) < new Date() && newStatus === 'ACTIVE') {
            newStatus = 'EXPIRED';
            closed_at = new Date().toISOString();
          }

          if (newStatus !== signal.status) {
            return {
              ...signal,
              status: newStatus,
              pnl,
              closed_at,
              trade_result
            };
          }
        }
        return signal;
      })
    );
  }, []);

  const clearSignals = useCallback(() => {
    setSignals([]);
  }, []);

  return (
    <TradingContext.Provider
      value={{
        signals,
        addSignal,
        updateSignal,
        clearSignals,
        activeBots,
        setActiveBots,
        prices,
        updatePrices
      }}
    >
      {children}
    </TradingContext.Provider>
  );
};

export const useTradingStore = () => {
  const context = useContext(TradingContext);
  if (!context) {
    throw new Error('useTradingStore must be used within a TradingProvider');
  }
  return context;
};
