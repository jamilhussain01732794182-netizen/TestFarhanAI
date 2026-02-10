import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Signal } from '../types';

interface TradingStore {
  signals: Signal[];
  addSignal: (signal: Signal) => void;
  clearSignals: () => void;
  activeBots: string[];
  setActiveBots: (bots: string[]) => void;
}

const TradingContext = createContext<TradingStore | undefined>(undefined);

export const TradingProvider = ({ children }: { children?: ReactNode }) => {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [activeBots, setActiveBots] = useState<string[]>(['EURUSD', 'GBPUSD']); // Default active for demo

  const addSignal = useCallback((signal: Signal) => {
    setSignals((prev) => {
      // Avoid duplicates
      if (prev.find(s => s.id === signal.id)) return prev;
      return [signal, ...prev];
    });
  }, []);

  const clearSignals = useCallback(() => {
    setSignals([]);
  }, []);

  return (
    <TradingContext.Provider value={{ signals, addSignal, clearSignals, activeBots, setActiveBots }}>
      {children}
    </TradingContext.Provider>
  );
};

// Hook to mimic the "useTradingStore" usage from the provided snippets
export const useTradingStore = () => {
  const context = useContext(TradingContext);
  if (!context) {
    throw new Error('useTradingStore must be used within a TradingProvider');
  }
  return context;
};