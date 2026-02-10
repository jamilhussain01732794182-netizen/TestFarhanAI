import React, { useState, useEffect } from 'react'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Clock, 
  AlertCircle,
  Copy,
  ExternalLink
} from 'lucide-react'
import { Button } from './ui/button'
import { Signal } from '../types'

interface SignalCardProps {
  signal: Signal;
}

const SignalCard: React.FC<SignalCardProps> = ({ signal }) => {
  const [timeLeft, setTimeLeft] = useState(signal.seconds_left)
  const [copied, setCopied] = useState(false)

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [signal.seconds_left])

  const copySignal = () => {
    const text = `${signal.symbol} ${signal.action} @ ${signal.price}\n`
      + `Confidence: ${signal.confidence}%\n`
      + `Logic: ${signal.logic}\n`
      + `Time left: ${timeLeft}s`

    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-500'
    if (confidence >= 60) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <Card className={`border-l-4 ${
      signal.action === 'CALL' 
        ? 'border-l-green-500 hover:border-l-green-600' 
        : 'border-l-red-500 hover:border-l-red-600'
    } transition-all duration-300 hover:shadow-lg hover:scale-[1.01] bg-gray-900 border-gray-800`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          {/* Left side - Signal Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                signal.action === 'CALL' ? 'bg-green-500/10' : 'bg-red-500/10'
              }`}>
                {signal.action === 'CALL' ? (
                  <ArrowUpCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <ArrowDownCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
              
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold">{signal.symbol}</h3>
                  <Badge variant={signal.action === 'CALL' ? 'default' : 'destructive'}>
                    {signal.action}
                  </Badge>
                  <Badge className={getConfidenceColor(signal.confidence)}>
                    {signal.confidence}%
                  </Badge>
                </div>
                <p className="text-sm text-gray-400">{signal.logic}</p>
              </div>
            </div>

            {/* Price Info */}
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="space-y-1">
                <p className="text-gray-500">Price</p>
                <p className="font-mono font-bold">{signal.price.toFixed(5)}</p>
              </div>
              {signal.sl_price && (
                <div className="space-y-1">
                  <p className="text-gray-500">SL</p>
                  <p className="font-mono text-red-400">{signal.sl_price.toFixed(5)}</p>
                </div>
              )}
              {signal.tp_price && (
                <div className="space-y-1">
                  <p className="text-gray-500">TP</p>
                  <p className="font-mono text-green-400">{signal.tp_price.toFixed(5)}</p>
                </div>
              )}
            </div>

            {/* Patterns */}
            {signal.patterns && signal.patterns.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {signal.patterns.map((pattern, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {pattern}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Right side - Timer & Actions */}
          <div className="flex flex-col items-end gap-3">
            {/* Countdown Timer */}
            <div className="text-center">
              <div className="flex items-center gap-1 text-sm text-gray-400">
                <Clock className="h-4 w-4" />
                <span>Candle closes in</span>
              </div>
              <div className={`text-2xl font-bold font-mono ${
                timeLeft <= 5 ? 'text-red-500 animate-pulse' : 
                timeLeft <= 10 ? 'text-yellow-500' : 'text-green-500'
              }`}>
                {timeLeft}s
              </div>
              {timeLeft === 0 && (
                <div className="text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Expired
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={copySignal}
                className="flex items-center gap-1"
              >
                <Copy className="h-3 w-3" />
                {copied ? 'Copied!' : 'Copy'}
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                asChild
              >
                <a
                  href={`https://www.tradingview.com/chart/?symbol=FX:${signal.symbol}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  Chart
                </a>
              </Button>
            </div>

            {/* Timestamp */}
            <p className="text-xs text-gray-500">
              {new Date(signal.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}
            </p>
          </div>
        </div>

        {/* Progress bar for countdown */}
        <div className="mt-3">
          <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full ${
                timeLeft <= 5 ? 'bg-red-500' : 
                timeLeft <= 10 ? 'bg-yellow-500' : 'bg-green-500'
              } transition-all duration-1000 ease-linear`}
              style={{
                width: `${(timeLeft / 60) * 100}%`
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default SignalCard