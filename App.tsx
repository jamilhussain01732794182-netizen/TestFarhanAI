import React, { useEffect } from 'react';
import CandleTimer from './components/CandleTimer';
import SignalList from './components/SignalList';
import { Activity, LayoutDashboard, Terminal } from 'lucide-react';

export default function App() {
  
  // Request notification permissions for signals
  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans">
      {/* Navbar */}
      <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  ICT/SMC Bot
                </h1>
                <p className="text-xs text-gray-500">Professional Trading Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                System Operational
              </span>
              <div className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700">
                <Terminal className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Sidebar / Top Section (Mobile) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Timers for Active Pairs */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <ClockIcon /> Active Sessions
              </h3>
              
              <div className="grid gap-4">
                <CandleTimer 
                  symbol="EURUSD" 
                  onSignalTime={() => console.log('Signal check for EURUSD')} 
                />
                <CandleTimer 
                  symbol="GBPUSD" 
                  onSignalTime={() => console.log('Signal check for GBPUSD')} 
                />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gray-900/30 rounded-lg p-4 border border-gray-800">
               <h3 className="text-sm font-semibold text-gray-400 mb-3">Strategy Configuration</h3>
               <div className="space-y-2 text-sm">
                 <div className="flex justify-between">
                   <span className="text-gray-500">Method</span>
                   <span className="font-medium">ICT / SMC</span>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-gray-500">Timeframe</span>
                   <span className="font-medium">1 Minute</span>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-gray-500">Signal Timing</span>
                   <span className="font-medium text-yellow-500">T-15s</span>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-gray-500">Risk Ratio</span>
                   <span className="font-medium">1:2</span>
                 </div>
               </div>
            </div>
          </div>

          {/* Right Main Content */}
          <div className="lg:col-span-8">
            <SignalList />
          </div>

        </div>
      </main>
    </div>
  );
}

function ClockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}