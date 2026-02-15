'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  MessageCircle,
  Users,
  AlertTriangle,
  Smile,
  Meh,
  Frown,
  ArrowRight,
  Clock,
  Tag,
  CheckCircle2,
  ExternalLink,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import Link from 'next/link'

interface FeedbackItem {
  id: string
  conversation_id: string
  summary: string
  sentiment: 'positive' | 'neutral' | 'negative' | 'mixed'
  tags: string[]
  computed_at: string
  participant: {
    name: string
    avatar_url?: string
  }
  agent_name: string
  key_quotes: string[]
  delta_notes: string | null
}

interface ActionItem {
  text: string
  confidence: number
  priority: 'low' | 'medium' | 'high'
  conversation_id: string
  participant_name: string
}

interface Escalation {
  id: string
  escalation_type: string
  severity: string
  status: string
  created_at: string
  participant_name: string
}

interface InsightsData {
  feed: FeedbackItem[]
  sentiment_distribution: {
    positive: number
    neutral: number
    negative: number
    mixed: number
  }
  top_tags: { tag: string; count: number }[]
  action_items: ActionItem[]
  escalations: Escalation[]
  delta_highlights: {
    improved: string[]
    declined: string[]
    new_concerns: string[]
  }
  stats: {
    active_conversations: number
    messages_this_period: number
    summaries_count: number
    open_escalations: number
  }
}

const SENTIMENT_CONFIG = {
  positive: { icon: Smile, color: 'text-green-500', bg: 'bg-green-500' },
  neutral: { icon: Meh, color: 'text-gray-500', bg: 'bg-gray-500' },
  negative: { icon: Frown, color: 'text-red-500', bg: 'bg-red-500' },
  mixed: { icon: Meh, color: 'text-yellow-500', bg: 'bg-yellow-500' },
}

const PRIORITY_COLORS = {
  high: 'bg-red-100 text-red-700 border-red-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  low: 'bg-accent text-primary border-border',
}

const TAG_COLORS: Record<string, string> = {
  workload: 'bg-accent text-primary',
  manager: 'bg-accent text-primary',
  compensation: 'bg-accent text-primary',
  culture: 'bg-accent text-primary',
  tooling: 'bg-accent/50 text-muted-foreground',
  growth: 'bg-accent text-primary',
  work_life_balance: 'bg-accent text-primary',
  communication: 'bg-accent text-primary',
  team_dynamics: 'bg-accent text-primary',
  recognition: 'bg-accent text-primary',
}

export default function InsightsPage() {
  const [data, setData] = useState<InsightsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [period, setPeriod] = useState('7')

  useEffect(() => {
    fetchInsights()
  }, [period])

  const fetchInsights = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/insights?days=${period}`)
      if (res.ok) {
        const result = await res.json()
        setData(result)
      } else {
        toast.error('Failed to load insights')
      }
    } catch (error) {
      console.error('Failed to fetch insights:', error)
      toast.error('Failed to load insights')
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (date: string) => {
    const d = new Date(date)
    const now = new Date()
    const diff = now.getTime() - d.getTime()

    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getSentimentTotal = () => {
    if (!data) return 0
    const { positive, neutral, negative, mixed } = data.sentiment_distribution
    return positive + neutral + negative + mixed
  }

  const getSentimentPercent = (count: number) => {
    const total = getSentimentTotal()
    if (total === 0) return 0
    return Math.round((count / total) * 100)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load insights</p>
        <Button onClick={fetchInsights} className="mt-4">Retry</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Employee Insights
          </h1>
          <p className="text-muted-foreground">
            Real-time feedback and sentiment from your AI agents
          </p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="14">Last 14 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Delta Highlights */}
      {(data.delta_highlights.improved.length > 0 ||
        data.delta_highlights.declined.length > 0 ||
        data.delta_highlights.new_concerns.length > 0) && (
        <Card className="bg-accent/50 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">What Changed This Week</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {data.delta_highlights.improved.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-green-600">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm font-medium">Improved</span>
                  </div>
                  {data.delta_highlights.improved.map((item, i) => (
                    <p key={i} className="text-sm text-muted-foreground">{item}</p>
                  ))}
                </div>
              )}
              {data.delta_highlights.declined.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-red-600">
                    <TrendingDown className="h-4 w-4" />
                    <span className="text-sm font-medium">Needs Attention</span>
                  </div>
                  {data.delta_highlights.declined.map((item, i) => (
                    <p key={i} className="text-sm text-muted-foreground">{item}</p>
                  ))}
                </div>
              )}
              {data.delta_highlights.new_concerns.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-yellow-600">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm font-medium">New Signals</span>
                  </div>
                  {data.delta_highlights.new_concerns.map((item, i) => (
                    <p key={i} className="text-sm text-muted-foreground">{item}</p>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.stats.active_conversations}</p>
                <p className="text-sm text-muted-foreground">Active Conversations</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <MessageCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.stats.messages_this_period}</p>
                <p className="text-sm text-muted-foreground">Messages This Period</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.stats.summaries_count}</p>
                <p className="text-sm text-muted-foreground">Insights Generated</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-lg",
                data.stats.open_escalations > 0 ? "bg-red-500/10" : "bg-gray-500/10"
              )}>
                <AlertTriangle className={cn(
                  "h-5 w-5",
                  data.stats.open_escalations > 0 ? "text-red-500" : "text-gray-500"
                )} />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.stats.open_escalations}</p>
                <p className="text-sm text-muted-foreground">Open Escalations</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Sentiment Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sentiment Distribution</CardTitle>
            <CardDescription>Overall employee mood from feedback</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(data.sentiment_distribution).map(([sentiment, count]) => {
              const config = SENTIMENT_CONFIG[sentiment as keyof typeof SENTIMENT_CONFIG]
              const Icon = config.icon
              const percent = getSentimentPercent(count)

              return (
                <div key={sentiment} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={cn("h-4 w-4", config.color)} />
                      <span className="text-sm capitalize">{sentiment}</span>
                    </div>
                    <span className="text-sm font-medium">{percent}%</span>
                  </div>
                  <Progress value={percent} className="h-2" />
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Top Topics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Topics</CardTitle>
            <CardDescription>Most discussed themes</CardDescription>
          </CardHeader>
          <CardContent>
            {data.top_tags.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No topics yet
              </p>
            ) : (
              <div className="space-y-3">
                {data.top_tags.slice(0, 6).map(({ tag, count }) => (
                  <div key={tag} className="flex items-center justify-between">
                    <Badge
                      variant="secondary"
                      className={cn("capitalize", TAG_COLORS[tag] || 'bg-gray-100')}
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {tag.replace('_', ' ')}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{count} mentions</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Items */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Action Items</CardTitle>
            <CardDescription>Recommended follow-ups</CardDescription>
          </CardHeader>
          <CardContent>
            {data.action_items.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No action items yet
              </p>
            ) : (
              <div className="space-y-3">
                {data.action_items.slice(0, 5).map((item, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-start gap-2">
                      <Badge
                        variant="outline"
                        className={cn("text-xs flex-shrink-0", PRIORITY_COLORS[item.priority])}
                      >
                        {item.priority}
                      </Badge>
                      <p className="text-sm">{item.text}</p>
                    </div>
                    <p className="text-xs text-muted-foreground pl-14">
                      Re: {item.participant_name}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Escalations */}
      {data.escalations.length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Open Escalations
            </CardTitle>
            <CardDescription>Issues requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.escalations.map((escalation) => (
                <div
                  key={escalation.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-100"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="destructive" className="capitalize">
                      {escalation.severity}
                    </Badge>
                    <div>
                      <p className="font-medium capitalize">
                        {escalation.escalation_type.replace('_', ' ')} - {escalation.participant_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatTime(escalation.created_at)}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Review
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Feedback Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Latest Feedback</CardTitle>
          <CardDescription>Recent insights from employee conversations</CardDescription>
        </CardHeader>
        <CardContent>
          {data.feed.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No feedback yet</p>
              <p className="text-sm">Insights will appear as agents collect responses</p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.feed.map((item, index) => {
                const config = SENTIMENT_CONFIG[item.sentiment]
                const Icon = config.icon

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 rounded-lg border hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {item.participant.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{item.participant.name}</span>
                            <Icon className={cn("h-4 w-4", config.color)} />
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatTime(item.computed_at)}
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground mb-3">
                          {item.summary}
                        </p>

                        {item.key_quotes && item.key_quotes.length > 0 && (
                          <div className="mb-3 pl-3 border-l-2 border-primary/30">
                            <p className="text-sm italic text-muted-foreground">
                              &ldquo;{item.key_quotes[0]}&rdquo;
                            </p>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-1">
                            {item.tags.slice(0, 4).map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className={cn("text-xs capitalize", TAG_COLORS[tag] || 'bg-gray-100')}
                              >
                                {tag.replace('_', ' ')}
                              </Badge>
                            ))}
                          </div>
                          <Link href={`/messages`}>
                            <Button variant="ghost" size="sm" className="gap-1">
                              View Thread
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </Link>
                        </div>

                        {item.delta_notes && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-xs text-muted-foreground">
                              <ArrowRight className="h-3 w-3 inline mr-1" />
                              {item.delta_notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
