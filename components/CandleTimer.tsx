import React, { useState, useEffect } from 'react'
import { Card, CardContent } from './ui/card'
import { Clock, AlertCircle } from 'lucide-react'

interface CandleTimerProps {
  symbol: string
  onSignalTime?: () => void
}

export default function CandleTimer({ symbol, onSignalTime }: CandleTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState<number>(60)
  const [lastSignalTime, setLastSignalTime] = useState<Date | null>(null)

  // Calculate seconds until next 1-minute candle
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date()
      const seconds = now.getSeconds()
      const milliseconds = now.getMilliseconds()
      const totalSecondsPassed = seconds + milliseconds / 1000
      const timeLeft = 60 - totalSecondsPassed
      
      return Math.max(0, Math.floor(timeLeft))
    }

    // Initial calculation
    setSecondsLeft(calculateTimeLeft())

    // Update every 100ms for smoother countdown
    const interval = setInterval(() => {
      const newTimeLeft = calculateTimeLeft()
      setSecondsLeft(newTimeLeft)

      // Trigger signal at 15 seconds
      if (newTimeLeft === 15) {
        // Check if we already sent signal for this candle
        const now = new Date()
        const currentMinute = now.getMinutes()
        
        if (!lastSignalTime || lastSignalTime.getMinutes() !== currentMinute) {
          if (onSignalTime) {
            onSignalTime()
          }
          setLastSignalTime(now)
        }
      }
    }, 100)

    return () => clearInterval(interval)
  }, [onSignalTime, lastSignalTime])

  const getTimerColor = () => {
    if (secondsLeft <= 5) return 'text-red-500'
    if (secondsLeft <= 15) return 'text-yellow-500'
    return 'text-green-500'
  }

  const getBarColor = () => {
    if (secondsLeft <= 5) return 'bg-red-500'
    if (secondsLeft <= 15) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <Card className="border border-gray-800 bg-gray-900/50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-400">Next candle in</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className={`text-3xl font-bold font-mono ${getTimerColor()}`}>
                {secondsLeft}
              </span>
              <span className="text-gray-400">seconds</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {symbol} • 1-minute candle
            </p>
          </div>

          {/* Signal indicator */}
          <div className={`p-3 rounded-full ${secondsLeft <= 15 ? 'bg-yellow-500/10' : 'bg-gray-800'}`}>
            {secondsLeft <= 15 ? (
              <AlertCircle className={`h-6 w-6 ${getTimerColor()}`} />
            ) : (
              <Clock className="h-6 w-6 text-gray-400" />
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full ${getBarColor()} transition-all duration-100`}
              style={{
                width: `${((60 - secondsLeft) / 60) * 100}%`
              }}
            />
          </div>
          
          {/* Time markers */}
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0s</span>
            <span className={secondsLeft <= 45 ? 'text-yellow-400' : ''}>15s</span>
            <span className={secondsLeft <= 30 ? 'text-yellow-400' : ''}>30s</span>
            <span className={secondsLeft <= 15 ? 'text-red-400' : ''}>45s</span>
            <span>60s</span>
          </div>
        </div>

        {/* Signal alert */}
        {secondsLeft <= 15 && (
          <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-400" />
              <span className="text-yellow-300">Signal time! Analyzing market...</span>
            </div>
            <p className="text-xs text-yellow-400/80 mt-1">
              ICT/SMC signals generated in next {secondsLeft} seconds
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}