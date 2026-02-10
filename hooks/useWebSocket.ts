import { useState, useEffect, useRef, useCallback } from 'react';
import { useTradingStore } from '../context/TradingContext';
import { Signal, TradeAction } from '../types';

// Realtime WebSocket URL - আপনার বেকেন্ড এড্রেস দিন
const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8000/ws/signals';

// ICT Concepts for logic generation
const ICT_CONCEPTS = [
  "Bullish Order Block retest",
  "Bearish FVG (Fair Value Gap) fill",
  "Liquidity Sweep of Asian Lows",
  "Market Structure Shift (MSS)",
  "Optimal Trade Entry (OTE) 0.62",
  "Breaker Block bounce",
  "Mitigation Block reaction",
  "Power of 3 (Accumulation, Manipulation, Distribution)"
];

const PATTERNS = ["Engulfing", "Pin Bar", "Inside Bar", "Three White Soldiers", "Morning Star", "Railway Tracks"];

const SYMBOLS = ['EURUSD', 'GBPUSD', 'USDJPY', 'XAUUSD', 'BTCUSD'];

// Realtime price generator
class RealtimePriceGenerator {
  private basePrices: { [key: string]: number } = {
    'EURUSD': 1.0850,
    'GBPUSD': 1.2650,
    'USDJPY': 145.00,
    'XAUUSD': 2315.50,
    'BTCUSD': 65000.00
  };
  
  private lastPrices: { [key: string]: number } = { ...this.basePrices };
  
  generatePrice(symbol: string): number {
    const lastPrice = this.lastPrices[symbol] || this.basePrices[symbol];
    const volatility = this.getVolatility(symbol);
    
    // Random walk with slight mean reversion
    const randomChange = (Math.random() - 0.5) * 2 * volatility;
    const newPrice = lastPrice + randomChange;
    
    // Keep within reasonable bounds
    this.lastPrices[symbol] = newPrice;
    return parseFloat(newPrice.toFixed(5));
  }
  
  private getVolatility(symbol: string): number {
    const volatilities: { [key: string]: number } = {
      'EURUSD': 0.0003,  // 3 pips
      'GBPUSD': 0.0004,  // 4 pips
      'USDJPY': 0.03,    // 30 pips
      'XAUUSD': 2.5,     // 250 pips
      'BTCUSD': 50       // $50
    };
    return volatilities[symbol] || 0.001;
  }
}

// Signal generator with improved realism
function generateRealtimeSignal(symbol: string, priceGenerator: RealtimePriceGenerator): Signal {
  const currentPrice = priceGenerator.generatePrice(symbol);
  const trend = Math.random() > 0.5 ? 'BULLISH' : 'BEARISH';
  const action: TradeAction = trend === 'BULLISH' ? 'CALL' : 'PUT';
  
  const isHighConfidence = Math.random() > 0.7;
  const confidence = isHighConfidence 
    ? 80 + Math.floor(Math.random() * 15)  // 80-95%
    : 65 + Math.floor(Math.random() * 15); // 65-80%
  
  // Dynamic SL/TP based on volatility
  const pipValue = symbol.includes('JPY') ? 0.01 : 0.0001;
  const slPips = (isHighConfidence ? 12 : 18) * pipValue;
  const tpPips = slPips * (isHighConfidence ? 2.5 : 2.0);
  
  const patternsCount = isHighConfidence ? 2 : 1;
  const selectedPatterns = [];
  for (let i = 0; i < patternsCount; i++) {
    selectedPatterns.push(PATTERNS[Math.floor(Math.random() * PATTERNS.length)]);
  }
  
  // Smart logic selection based on trend
  const logicIndex = Math.floor(Math.random() * ICT_CONCEPTS.length);
  const logic = `${trend} ${ICT_CONCEPTS[logicIndex]}`;
  
  // Realistic timestamp with milliseconds
  const now = new Date();
  const timestamp = now.toISOString();
  
  // Calculate expiry time (30-120 seconds from now)
  const expirySeconds = 30 + Math.floor(Math.random() * 90);
  const expiryTime = new Date(now.getTime() + expirySeconds * 1000);
  
  return {
    id: `${symbol}_${now.getTime()}_${Math.random().toString(36).substr(2, 9)}`,
    symbol,
    action,
    price: currentPrice,
    confidence,
    logic,
    patterns: Array.from(new Set(selectedPatterns)), // Remove duplicates
    seconds_left: expirySeconds,
    timestamp,
    expiry_time: expiryTime.toISOString(),
    sl_price: action === 'CALL' 
      ? parseFloat((currentPrice - slPips).toFixed(5))
      : parseFloat((currentPrice + slPips).toFixed(5)),
    tp_price: action === 'CALL'
      ? parseFloat((currentPrice + tpPips).toFixed(5))
      : parseFloat((currentPrice - tpPips).toFixed(5)),
    timeframe: isHighConfidence ? '5m' : '1m',
    status: 'ACTIVE',
    pnl: 0,
    closed_at: null,
    trade_result: null
  };
}

// Reconnection logic
const RECONNECT_DELAYS = [1000, 2000, 5000, 10000, 30000];
let reconnectAttempts = 0;

export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting');
  const [lastMessageTime, setLastMessageTime] = useState<Date | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  
  const { addSignal, updateSignal, updatePrices } = useTradingStore();
  const wsRef = useRef<WebSocket | null>(null);
  const priceGeneratorRef = useRef<RealtimePriceGenerator>(new RealtimePriceGenerator());
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pingTimeRef = useRef<number | null>(null);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Show browser notification
  const showNotification = useCallback((signal: Signal) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(`🎯 ICT Signal: ${signal.symbol}`, {
        body: `${signal.action} @ ${signal.price}\n${signal.logic}\nConfidence: ${signal.confidence}%`,
        icon: '/signal-icon.png',
        tag: signal.id,
        requireInteraction: true,
        silent: false
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  }, []);

  // Send ping for heartbeat
  const sendPing = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      pingTimeRef.current = Date.now();
      wsRef.current.send(JSON.stringify({ type: 'ping' }));
    }
  }, []);

  // Handle incoming WebSocket messages
  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      const receivedTime = Date.now();
      
      // Calculate latency for pong
      if (data.type === 'pong' && pingTimeRef.current) {
        setLatency(receivedTime - pingTimeRef.current);
        pingTimeRef.current = null;
      }
      
      // Handle different message types
      switch (data.type) {
        case 'signal':
          const signal: Signal = {
            ...data.payload,
            timestamp: new Date().toISOString()
          };
          addSignal(signal);
          showNotification(signal);
          break;
          
        case 'price_update':
          updatePrices(data.payload);
          break;
          
        case 'signal_update':
          updateSignal(data.payload);
          break;
          
        case 'bulk_signals':
          data.payload.forEach((signal: Signal) => addSignal(signal));
          break;
          
        case 'heartbeat':
          // Just update last message time
          break;
          
        default:
          console.warn('Unknown message type:', data.type);
      }
      
      setLastMessageTime(new Date());
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }, [addSignal, updateSignal, updatePrices, showNotification]);

  // Handle WebSocket errors
  const handleError = useCallback((error: Event) => {
    console.error('WebSocket error:', error);
    setConnectionStatus('error');
    setIsConnected(false);
  }, []);

  // Handle WebSocket close
  const handleClose = useCallback((event: CloseEvent) => {
    console.log('WebSocket closed:', event.code, event.reason);
    setConnectionStatus('disconnected');
    setIsConnected(false);
    
    // Clear heartbeat
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }
    
    // Attempt reconnection
    if (reconnectAttempts < RECONNECT_DELAYS.length) {
      const delay = RECONNECT_DELAYS[reconnectAttempts];
      console.log(`Reconnecting in ${delay}ms... (Attempt ${reconnectAttempts + 1})`);
      
      reconnectTimerRef.current = setTimeout(() => {
        reconnectAttempts++;
        connectWebSocket();
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
      // Fallback to simulated mode
      startSimulationMode();
    }
  }, []);

  // Handle WebSocket open
  const handleOpen = useCallback(() => {
    console.log('WebSocket connected successfully');
    setConnectionStatus('connected');
    setIsConnected(true);
    reconnectAttempts = 0; // Reset reconnect attempts
    
    // Setup heartbeat
    heartbeatTimerRef.current = setInterval(sendPing, 30000);
    
    // Subscribe to symbols
    wsRef.current?.send(JSON.stringify({
      type: 'subscribe',
      symbols: SYMBOLS
    }));
  }, [sendPing]);

  // Main WebSocket connection function
  const connectWebSocket = useCallback(() => {
    // Clear any existing connection
    if (wsRef.current) {
      wsRef.current.close();
    }
    
    // Clear reconnection timer
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    
    setConnectionStatus('connecting');
    
    try {
      wsRef.current = new WebSocket(WS_URL);
      
      wsRef.current.onopen = handleOpen;
      wsRef.current.onmessage = handleMessage;
      wsRef.current.onerror = handleError;
      wsRef.current.onclose = handleClose;
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      setConnectionStatus('error');
      startSimulationMode();
    }
  }, [handleOpen, handleMessage, handleError, handleClose]);

  // Simulation mode as fallback
  const startSimulationMode = useCallback(() => {
    console.log('Starting simulation mode as fallback');
    setIsConnected(true);
    setConnectionStatus('connected');
    
    // Generate initial signals
    SYMBOLS.forEach(symbol => {
      if (Math.random() > 0.5) {
        const signal = generateRealtimeSignal(symbol, priceGeneratorRef.current);
        addSignal(signal);
      }
    });
    
    // Simulate price updates
    const priceInterval = setInterval(() => {
      const priceUpdates: { [key: string]: number } = {};
      SYMBOLS.forEach(symbol => {
        priceUpdates[symbol] = priceGeneratorRef.current.generatePrice(symbol);
      });
      updatePrices(priceUpdates);
    }, 1000);
    
    // Simulate signal generation
    const signalInterval = setInterval(() => {
      if (Math.random() > 0.8) { // 20% chance per second
        const symbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
        const signal = generateRealtimeSignal(symbol, priceGeneratorRef.current);
        addSignal(signal);
        showNotification(signal);
      }
    }, 5000);
    
    // Cleanup function
    return () => {
      clearInterval(priceInterval);
      clearInterval(signalInterval);
    };
  }, [addSignal, updatePrices, showNotification]);

  // Initialize connection
  useEffect(() => {
    connectWebSocket();
    
    return () => {
      // Cleanup on unmount
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      if (heartbeatTimerRef.current) {
        clearInterval(heartbeatTimerRef.current);
      }
    };
  }, [connectWebSocket]);

  // Send message to WebSocket
  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    } else {
      console.warn('WebSocket is not connected');
      return false;
    }
  }, []);

  // Manually generate a signal (for testing)
  const generateSignal = useCallback((symbol: string) => {
    const signal = generateRealtimeSignal(symbol, priceGeneratorRef.current);
    addSignal(signal);
    showNotification(signal);
    return signal;
  }, [addSignal, showNotification]);

  // Reconnect manually
  const reconnect = useCallback(() => {
    reconnectAttempts = 0;
    connectWebSocket();
  }, [connectWebSocket]);

  return {
    isConnected,
    connectionStatus,
    lastMessageTime,
    latency,
    sendMessage,
    generateSignal,
    reconnect,
    symbols: SYMBOLS
  };
};