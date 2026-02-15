'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Play, CheckCircle2, Loader2 } from 'lucide-react'

// Pipeline stages for the orchestration visualization
const PIPELINE_STAGES = [
  { id: 'trigger', name: 'Trigger', icon: '⚡', color: 'bg-yellow-500' },
  { id: 'planner', name: 'Planner', icon: '🧠', color: 'bg-purple-500' },
  { id: 'retriever', name: 'Retriever', icon: '📚', color: 'bg-blue-500' },
  { id: 'policy', name: 'Policy', icon: '🛡️', color: 'bg-orange-500' },
  { id: 'conversation', name: 'Conversation', icon: '💬', color: 'bg-green-500' },
  { id: 'summarizer', name: 'Summarizer', icon: '📝', color: 'bg-pink-500' },
  { id: 'insights', name: 'Insights', icon: '📊', color: 'bg-indigo-500' },
]

// Trace log entries that will type in
const TRACE_LOGS = [
  { timestamp: '09:00:00.001', level: 'INFO', stage: 'trigger', message: 'run_id=run_7f3e2a started | agent=Weekly Pulse | audience=8 employees' },
  { timestamp: '09:00:00.045', level: 'INFO', stage: 'planner', message: 'Loaded conversation template: pulse_check_v2' },
  { timestamp: '09:00:00.112', level: 'INFO', stage: 'retriever', message: 'RAG query: "employee context" | found 24 docs | latency=67ms' },
  { timestamp: '09:00:00.234', level: 'INFO', stage: 'policy', message: 'Applied guardrails: [no_medical_legal, escalate_distress, no_coercion]' },
  { timestamp: '09:00:00.289', level: 'WARN', stage: 'policy', message: 'PII filter: masked 2 fields in employee context' },
  { timestamp: '09:00:00.456', level: 'INFO', stage: 'conversation', message: 'Spawning 8 parallel conversation workers...' },
  { timestamp: '09:00:01.234', level: 'INFO', stage: 'conversation', message: 'Worker[1/8]: Sarah Chen - greeting sent | tone=friendly' },
  { timestamp: '09:00:01.456', level: 'INFO', stage: 'conversation', message: 'Worker[2/8]: Mike Johnson - greeting sent | tone=friendly' },
  { timestamp: '09:00:01.678', level: 'INFO', stage: 'conversation', message: 'Worker[3/8]: Alex Thompson - greeting sent | tone=friendly' },
  { timestamp: '09:00:02.123', level: 'INFO', stage: 'summarizer', message: 'Aggregating 8 conversation summaries...' },
  { timestamp: '09:00:02.567', level: 'INFO', stage: 'summarizer', message: 'Sentiment analysis: 6 positive, 1 neutral, 1 escalated' },
  { timestamp: '09:00:02.890', level: 'INFO', stage: 'insights', message: 'Generating insights: engagement_score=0.82, response_rate=0.91' },
  { timestamp: '09:00:03.012', level: 'INFO', stage: 'insights', message: 'Run completed successfully | duration=3.011s | tokens=4,823' },
]

interface OrchestrationAnimationProps {
  autoStart?: boolean
  onComplete?: () => void
}

export function OrchestrationAnimation({ autoStart = false, onComplete }: OrchestrationAnimationProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [hasCompleted, setHasCompleted] = useState(false)
  const [activeStageIndex, setActiveStageIndex] = useState(-1)
  const [completedStages, setCompletedStages] = useState<Set<number>>(new Set())
  const [visibleLogs, setVisibleLogs] = useState<typeof TRACE_LOGS>([])
  const [stats, setStats] = useState({ toolCalls: 0, agentsSpawned: 0, conversations: 0 })
  const logContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
    }
  }, [visibleLogs])

  // Auto-start if prop is set
  useEffect(() => {
    if (autoStart && !isRunning && !hasCompleted) {
      startAnimation()
    }
  }, [autoStart])

  const startAnimation = () => {
    setIsRunning(true)
    setHasCompleted(false)
    setActiveStageIndex(0)
    setCompletedStages(new Set())
    setVisibleLogs([])
    setStats({ toolCalls: 0, agentsSpawned: 0, conversations: 0 })

    // Progress through stages
    let stageIndex = 0
    const stageInterval = setInterval(() => {
      if (stageIndex < PIPELINE_STAGES.length) {
        setActiveStageIndex(stageIndex)
        if (stageIndex > 0) {
          setCompletedStages(prev => new Set([...prev, stageIndex - 1]))
        }
        stageIndex++
      } else {
        setCompletedStages(prev => new Set([...prev, stageIndex - 1]))
        setActiveStageIndex(-1)
        clearInterval(stageInterval)
      }
    }, 400)

    // Add logs progressively
    let logIndex = 0
    const logInterval = setInterval(() => {
      if (logIndex < TRACE_LOGS.length) {
        setVisibleLogs(prev => [...prev, TRACE_LOGS[logIndex]])

        // Update stats based on log content
        const log = TRACE_LOGS[logIndex]
        if (log.message.includes('tool calls') || log.message.includes('RAG query')) {
          setStats(prev => ({ ...prev, toolCalls: prev.toolCalls + 1 }))
        }
        if (log.message.includes('Spawning') || log.message.includes('Worker')) {
          setStats(prev => ({
            ...prev,
            agentsSpawned: Math.min(prev.agentsSpawned + 1, 5),
            conversations: Math.min(prev.conversations + 1, 8)
          }))
        }

        logIndex++
      } else {
        clearInterval(logInterval)
        setTimeout(() => {
          setIsRunning(false)
          setHasCompleted(true)
          onComplete?.()
        }, 500)
      }
    }, 250)

    // Cleanup
    return () => {
      clearInterval(stageInterval)
      clearInterval(logInterval)
    }
  }

  return (
    <div className="w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 md:p-8 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-white font-semibold text-lg">Live Agent Orchestration Trace</h3>
          <p className="text-slate-400 text-sm">Real-time multi-agent pipeline execution</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Stats Counters */}
          <div className="hidden sm:flex items-center gap-4 text-sm">
            <div className="text-center">
              <motion.p
                className="text-white font-mono font-bold text-lg"
                key={stats.toolCalls}
                initial={{ scale: 1.5 }}
                animate={{ scale: 1 }}
              >
                {stats.toolCalls}
              </motion.p>
              <p className="text-slate-500 text-xs">Tool Calls</p>
            </div>
            <div className="text-center">
              <motion.p
                className="text-white font-mono font-bold text-lg"
                key={stats.agentsSpawned}
                initial={{ scale: 1.5 }}
                animate={{ scale: 1 }}
              >
                {stats.agentsSpawned}
              </motion.p>
              <p className="text-slate-500 text-xs">Agents</p>
            </div>
            <div className="text-center">
              <motion.p
                className="text-white font-mono font-bold text-lg"
                key={stats.conversations}
                initial={{ scale: 1.5 }}
                animate={{ scale: 1 }}
              >
                {stats.conversations}
              </motion.p>
              <p className="text-slate-500 text-xs">Conversations</p>
            </div>
          </div>
          {!isRunning && (
            <Button
              onClick={startAnimation}
              variant="secondary"
              size="sm"
              className="gap-2"
            >
              {hasCompleted ? (
                <>
                  <Play className="h-4 w-4" />
                  Replay
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Run Demo
                </>
              )}
            </Button>
          )}
          {isRunning && (
            <div className="flex items-center gap-2 text-green-400 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Running...</span>
            </div>
          )}
        </div>
      </div>

      {/* Pipeline Visualization */}
      <div className="mb-6 overflow-x-auto pb-2">
        <div className="flex items-center gap-2 min-w-max">
          {PIPELINE_STAGES.map((stage, index) => {
            const isActive = index === activeStageIndex
            const isCompleted = completedStages.has(index)

            return (
              <div key={stage.id} className="flex items-center">
                {/* Node */}
                <motion.div
                  className={cn(
                    "relative flex flex-col items-center",
                  )}
                  initial={{ opacity: 0.5 }}
                  animate={{
                    opacity: isActive || isCompleted ? 1 : 0.5,
                    scale: isActive ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all duration-300",
                      isCompleted ? "bg-green-500/20 border-2 border-green-500" :
                      isActive ? `${stage.color} ring-4 ring-white/30` :
                      "bg-slate-700/50 border border-slate-600"
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-6 w-6 text-green-400" />
                    ) : (
                      <span>{stage.icon}</span>
                    )}
                  </div>
                  <span className={cn(
                    "text-xs mt-1.5 font-medium",
                    isActive ? "text-white" : "text-slate-400"
                  )}>
                    {stage.name}
                  </span>
                  {/* Pulse animation for active node */}
                  {isActive && (
                    <motion.div
                      className={cn("absolute inset-0 rounded-xl", stage.color)}
                      initial={{ opacity: 0.5, scale: 1 }}
                      animate={{ opacity: 0, scale: 1.5 }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  )}
                </motion.div>

                {/* Edge */}
                {index < PIPELINE_STAGES.length - 1 && (
                  <div className="relative w-8 mx-1">
                    <div className="absolute top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-600" />
                    {/* Animated pulse along edge */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white"
                          initial={{ left: 0 }}
                          animate={{ left: '100%' }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Trace Log Terminal */}
      <div
        ref={logContainerRef}
        className="bg-black/50 rounded-lg p-4 h-48 overflow-y-auto font-mono text-xs"
      >
        {visibleLogs.length === 0 && !isRunning && (
          <div className="text-slate-500 text-center py-8">
            Click "Run Demo" to see the orchestration trace
          </div>
        )}
        <AnimatePresence>
          {visibleLogs.map((log, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.15 }}
              className="flex gap-2 mb-1"
            >
              <span className="text-slate-500">[{log.timestamp}]</span>
              <span className={cn(
                log.level === 'WARN' ? 'text-yellow-400' :
                log.level === 'ERROR' ? 'text-red-400' :
                'text-green-400'
              )}>
                {log.level}
              </span>
              <span className="text-purple-400">{log.stage}</span>
              <span className="text-slate-300">{log.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
        {isRunning && (
          <motion.span
            className="inline-block w-2 h-4 bg-green-400"
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
        )}
      </div>

      {/* Footer stats for mobile */}
      <div className="sm:hidden grid grid-cols-3 gap-4 mt-4 text-center">
        <div>
          <p className="text-white font-mono font-bold">{stats.toolCalls}</p>
          <p className="text-slate-500 text-xs">Tool Calls</p>
        </div>
        <div>
          <p className="text-white font-mono font-bold">{stats.agentsSpawned}</p>
          <p className="text-slate-500 text-xs">Agents</p>
        </div>
        <div>
          <p className="text-white font-mono font-bold">{stats.conversations}</p>
          <p className="text-slate-500 text-xs">Conversations</p>
        </div>
      </div>
    </div>
  )
}
