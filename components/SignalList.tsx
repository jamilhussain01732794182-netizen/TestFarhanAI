import React, { useState, useEffect } from 'react'
import SignalCard from './SignalCard'
import { Button } from './ui/button'
import { Bell, Filter, Download } from 'lucide-react'
import { useWebSocket } from '../hooks/useWebSocket'
import { useTradingStore } from '../context/TradingContext'
import { Signal } from '../types'

export default function SignalList() {
  const { signals, clearSignals } = useTradingStore()
  const { isConnected } = useWebSocket()
  const [filter, setFilter] = useState<'all' | 'call' | 'put'>('all')
  const [sortedSignals, setSortedSignals] = useState<Signal[]>(signals)

  // Sort signals by timestamp (newest first) and filter
  useEffect(() => {
    let filtered = signals
    
    if (filter === 'call') {
      filtered = signals.filter(s => s.action === 'CALL')
    } else if (filter === 'put') {
      filtered = signals.filter(s => s.action === 'PUT')
    }
    
    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    
    setSortedSignals(filtered)
  }, [signals, filter])

  const exportSignals = () => {
    const csv = [
      ['Symbol', 'Action', 'Price', 'Confidence', 'Logic', 'Timestamp'],
      ...signals.map(s => [
        s.symbol,
        s.action,
        s.price,
        s.confidence,
        s.logic,
        new Date(s.timestamp).toLocaleString()
      ])
    ].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'trading-signals.csv'
    a.click()
  }

  if (!isConnected) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center gap-2 text-yellow-500">
          <Bell className="h-5 w-5 animate-bounce" />
          <span>Connecting to signal server...</span>
        </div>
        <p className="text-xs text-gray-500 mt-2">Ensure backend is running at localhost:8000</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold">Live Signals</h2>
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full animate-pulse ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-400">
              {isConnected ? 'Live' : 'Disconnected'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Filter Buttons */}
          <div className="flex border border-gray-700 rounded-lg overflow-hidden">
            <button
              className={`px-3 py-1 text-sm ${filter === 'all' ? 'bg-gray-800' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button
              className={`px-3 py-1 text-sm ${filter === 'call' ? 'bg-green-500/20 text-green-400' : ''}`}
              onClick={() => setFilter('call')}
            >
              CALL
            </button>
            <button
              className={`px-3 py-1 text-sm ${filter === 'put' ? 'bg-red-500/20 text-red-400' : ''}`}
              onClick={() => setFilter('put')}
            >
              PUT
            </button>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={exportSignals}
            className="flex items-center gap-1"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={clearSignals}
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Signal Count */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <span>CALL: {signals.filter(s => s.action === 'CALL').length}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-red-500" />
          <span>PUT: {signals.filter(s => s.action === 'PUT').length}</span>
        </div>
        <div className="text-gray-500">
          Total: {signals.length} signals
        </div>
      </div>

      {/* Signals Grid */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
        {sortedSignals.length === 0 ? (
          <div className="text-center py-8 text-gray-500 border border-dashed border-gray-800 rounded-lg">
            <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No signals yet. Start a trading bot to receive signals.</p>
            <p className="text-sm mt-1">Signals appear 15 seconds before candle close</p>
          </div>
        ) : (
          sortedSignals.map((signal) => (
            <SignalCard key={signal.id} signal={signal} />
          ))
        )}
      </div>

      {/* Auto-scroll info */}
      {sortedSignals.length > 5 && (
        <div className="text-xs text-gray-500 text-center">
          ↑↓ Scroll to see more signals
        </div>
      )}
    </div>
  )
}