'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Smile,
  Meh,
  Frown,
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  Users,
  MessageCircle,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface PulseData {
  overallMood: 'positive' | 'neutral' | 'negative'
  moodScore: number
  trend: 'up' | 'down' | 'stable'
  trendDelta: number
  activeConversations: number
  topTopics: { name: string; sentiment: 'positive' | 'neutral' | 'negative' }[]
  recentSignals: { emoji: string; text: string; time: string }[]
}

// Simulated pulse data - in production would come from API
const MOCK_PULSE_DATA: PulseData = {
  overallMood: 'positive',
  moodScore: 78,
  trend: 'up',
  trendDelta: 5,
  activeConversations: 23,
  topTopics: [
    { name: 'Work-life balance', sentiment: 'positive' },
    { name: 'Team collaboration', sentiment: 'positive' },
    { name: 'Workload', sentiment: 'neutral' },
  ],
  recentSignals: [
    { emoji: '😊', text: 'Positive feedback about new wellness program', time: '2m ago' },
    { emoji: '💬', text: 'Team discussing Q1 goals', time: '5m ago' },
    { emoji: '🎉', text: 'Sarah celebrated work anniversary', time: '12m ago' },
  ],
}

const MOOD_CONFIG = {
  positive: {
    icon: Smile,
    color: 'text-green-500',
    bgColor: 'bg-green-500',
    label: 'Positive',
    gradient: 'from-green-400 to-emerald-500',
    pulseColor: 'bg-green-400',
  },
  neutral: {
    icon: Meh,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500',
    label: 'Neutral',
    gradient: 'from-yellow-400 to-amber-500',
    pulseColor: 'bg-yellow-400',
  },
  negative: {
    icon: Frown,
    color: 'text-red-500',
    bgColor: 'bg-red-500',
    label: 'Needs Attention',
    gradient: 'from-red-400 to-rose-500',
    pulseColor: 'bg-red-400',
  },
}

const TREND_CONFIG = {
  up: { icon: TrendingUp, color: 'text-green-500', label: 'Improving' },
  down: { icon: TrendingDown, color: 'text-red-500', label: 'Declining' },
  stable: { icon: Minus, color: 'text-gray-500', label: 'Stable' },
}

export function CompanyPulse() {
  const [data, setData] = useState<PulseData>(MOCK_PULSE_DATA)
  const [isPulsing, setIsPulsing] = useState(true)
  const [currentSignalIndex, setCurrentSignalIndex] = useState(0)

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => ({
        ...prev,
        moodScore: Math.min(100, Math.max(0, prev.moodScore + (Math.random() - 0.5) * 2)),
        activeConversations: Math.max(0, prev.activeConversations + Math.floor((Math.random() - 0.3) * 2)),
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  // Rotate through signals
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSignalIndex(prev => (prev + 1) % data.recentSignals.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [data.recentSignals.length])

  const moodConfig = MOOD_CONFIG[data.overallMood]
  const trendConfig = TREND_CONFIG[data.trend]
  const MoodIcon = moodConfig.icon
  const TrendIcon = trendConfig.icon

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-5 w-5 text-primary" />
            Company Pulse
          </CardTitle>
          <Badge variant="secondary" className="gap-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Live
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Pulse Visualization */}
        <div className="flex items-center gap-6">
          {/* Animated Pulse Ring */}
          <div className="relative flex-shrink-0">
            <div className="relative w-20 h-20">
              {/* Outer pulse rings */}
              <motion.div
                className={cn(
                  "absolute inset-0 rounded-full opacity-20",
                  moodConfig.bgColor
                )}
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.2, 0, 0.2],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className={cn(
                  "absolute inset-2 rounded-full opacity-30",
                  moodConfig.bgColor
                )}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.1, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.3,
                }}
              />
              {/* Center circle with mood icon */}
              <motion.div
                className={cn(
                  "absolute inset-4 rounded-full flex items-center justify-center bg-gradient-to-br shadow-lg",
                  moodConfig.gradient
                )}
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <MoodIcon className="h-8 w-8 text-white" />
              </motion.div>
            </div>
          </div>

          {/* Score and Trend */}
          <div className="flex-1">
            <div className="flex items-baseline gap-2 mb-1">
              <motion.span
                className="text-3xl font-bold"
                key={Math.round(data.moodScore)}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {Math.round(data.moodScore)}
              </motion.span>
              <span className="text-muted-foreground">/100</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={cn("gap-1", moodConfig.bgColor, "text-white")}>
                {moodConfig.label}
              </Badge>
              <div className={cn("flex items-center gap-1 text-sm", trendConfig.color)}>
                <TrendIcon className="h-4 w-4" />
                <span>{data.trend === 'stable' ? '' : data.trend === 'up' ? '+' : '-'}{data.trendDelta}%</span>
              </div>
            </div>
          </div>

          {/* Active Conversations */}
          <div className="text-center px-4 border-l">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <MessageCircle className="h-4 w-4" />
              <span className="text-xs">Active</span>
            </div>
            <motion.p
              className="text-2xl font-bold text-primary"
              key={data.activeConversations}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              {data.activeConversations}
            </motion.p>
          </div>
        </div>

        {/* Top Topics */}
        <div className="flex flex-wrap gap-2">
          {data.topTopics.map((topic, i) => (
            <Badge
              key={i}
              variant="outline"
              className={cn(
                "text-xs",
                topic.sentiment === 'positive' && "border-green-200 bg-green-50 text-green-700",
                topic.sentiment === 'neutral' && "border-yellow-200 bg-yellow-50 text-yellow-700",
                topic.sentiment === 'negative' && "border-red-200 bg-red-50 text-red-700"
              )}
            >
              {topic.name}
            </Badge>
          ))}
        </div>

        {/* Rotating Recent Signals */}
        <div className="bg-accent/50 rounded-lg p-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSignalIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-3"
            >
              <span className="text-xl">{data.recentSignals[currentSignalIndex].emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{data.recentSignals[currentSignalIndex].text}</p>
                <p className="text-xs text-muted-foreground">{data.recentSignals[currentSignalIndex].time}</p>
              </div>
              <Zap className="h-4 w-4 text-primary animate-pulse" />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* CTA */}
        <Link href="/admin/insights">
          <Button variant="outline" className="w-full gap-2">
            <Zap className="h-4 w-4" />
            View Full Insights
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
