export interface Signal {
  id: string;
  symbol: string;
  action: 'CALL' | 'PUT';
  price: number;
  confidence: number;
  logic: string;
  patterns: string[];
  seconds_left: number;
  timestamp: string;
  sl_price?: number;
  tp_price?: number;
  timeframe?: string;
  time_utc6?: string;
}

export interface Trade {
  id: string;
  signal_id: string;
  entry_price: number;
  exit_price?: number;
  pnl?: number;
  status: 'OPEN' | 'CLOSED';
}