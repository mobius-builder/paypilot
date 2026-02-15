'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Bot,
  Plus,
  Play,
  Pause,
  Settings,
  MessageCircle,
  Users,
  Calendar,
  MoreVertical,
  Zap,
  TrendingUp,
  Clock,
  CheckCircle2,
  Search,
  X,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { useUser } from '@/contexts/user-context'
import {
  STATIC_EMPLOYEES,
  STATIC_AGENT_INSTANCES,
  AGENT_TEMPLATES,
  AGENT_PAGE_STATS,
  searchEmployees,
} from '@/lib/static-demo-data'

// Client-side employee search for demo mode (deterministic, no API needed)
function searchEmployeesLocally(query: string, limit: number = 15) {
  const results = searchEmployees(query, limit)
  return results.map(emp => ({
    id: emp.id,
    full_name: emp.name,
    email: emp.email,
    department: emp.department,
    job_title: emp.title,
  }))
}

interface Agent {
  id: string
  name: string
  slug: string
  description: string
  agent_type: string
}

interface AgentInstance {
  id: string
  name: string
  status: 'draft' | 'active' | 'paused' | 'archived'
  config: {
    tone_preset: string
    audience_type: string
    target_employee_ids?: string[]
  }
  created_at: string
  agents: Agent
  agent_schedules: Array<{
    cadence: string
    next_run_at: string
  }>
  stats?: {
    conversations: number
    messages: number
  }
}

interface TonePreset {
  id: string
  slug: string
  name: string
  description: string
}

interface Employee {
  id: string
  full_name: string
  email: string
  department?: string
  job_title?: string
}

const AGENT_TYPE_ICONS: Record<string, React.ReactNode> = {
  pulse_check: <TrendingUp className="h-5 w-5" />,
  onboarding: <Users className="h-5 w-5" />,
  exit_interview: <MessageCircle className="h-5 w-5" />,
  manager_coaching: <Zap className="h-5 w-5" />,
}

const AGENT_TYPE_COLORS: Record<string, string> = {
  pulse_check: 'bg-accent text-primary',
  onboarding: 'bg-accent text-primary',
  exit_interview: 'bg-accent text-primary',
  manager_coaching: 'bg-accent text-primary',
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-500',
  paused: 'bg-yellow-500',
  draft: 'bg-gray-500',
  archived: 'bg-red-500',
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export default function AgentsPage() {
  const { user, isAdmin, isLoading: isUserLoading } = useUser()
  const [instances, setInstances] = useState<AgentInstance[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [tonePresets, setTonePresets] = useState<TonePreset[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [hasShownMembershipError, setHasShownMembershipError] = useState(false)

  // Form state
  const [selectedAgentId, setSelectedAgentId] = useState('')
  const [instanceName, setInstanceName] = useState('')
  const [tonePreset, setTonePreset] = useState('poke_lite')
  const [audienceType, setAudienceType] = useState('company_wide')
  const [cadence, setCadence] = useState('weekly')
  const [guardrails, setGuardrails] = useState({
    no_sensitive_topics: true,
    no_medical_legal: true,
    no_coercion: true,
    no_harassment: true,
  })

  // Employee picker state
  const [selectedEmployees, setSelectedEmployees] = useState<Employee[]>([])
  const [employeeSearch, setEmployeeSearch] = useState('')
  const [employeeResults, setEmployeeResults] = useState<Employee[]>([])
  const [isSearchingEmployees, setIsSearchingEmployees] = useState(false)
  const [employeePickerOpen, setEmployeePickerOpen] = useState(false)

  const debouncedEmployeeSearch = useDebounce(employeeSearch, 200)

  useEffect(() => {
    fetchData()
  }, [])

  // Search employees when debounced search changes
  useEffect(() => {
    if (audienceType === 'individual' && debouncedEmployeeSearch.length >= 2) {
      searchEmployees(debouncedEmployeeSearch)
    } else if (debouncedEmployeeSearch.length < 2) {
      setEmployeeResults([])
    }
  }, [debouncedEmployeeSearch, audienceType])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      // Check for demo mode - use static data for reliability
      const isDemoMode = typeof document !== 'undefined' &&
        document.cookie.includes('paypilot_demo_mode=true')

      if (isDemoMode) {
        // Use static data - transform STATIC_AGENT_INSTANCES to page format
        const staticInstances: AgentInstance[] = STATIC_AGENT_INSTANCES.map(inst => {
          const template = AGENT_TEMPLATES.find(t => t.id === inst.agentType)
          return {
            id: inst.id,
            name: inst.name,
            status: inst.status as 'active' | 'paused',
            config: {
              tone_preset: inst.tone,
              audience_type: inst.audienceType,
            },
            created_at: inst.createdAt,
            agents: {
              id: template?.id || inst.agentType,
              name: template?.name || inst.name,
              slug: inst.agentType,
              description: template?.description || '',
              agent_type: inst.agentType,
            },
            agent_schedules: [{
              cadence: 'weekly',
              next_run_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            }],
            stats: {
              conversations: inst.conversationsCount,
              messages: inst.conversationsCount * 6, // Avg 6 messages per conversation
            },
          }
        })
        setInstances(staticInstances)

        // Use static agents from AGENT_TEMPLATES
        const staticAgents: Agent[] = AGENT_TEMPLATES.map(t => ({
          id: t.id,
          name: t.name,
          slug: t.id,
          description: t.description,
          agent_type: t.id,
        }))
        setAgents(staticAgents)

        // Static tone presets
        setTonePresets([
          { id: 'friendly', slug: 'friendly', name: 'Friendly', description: 'Warm and approachable' },
          { id: 'professional', slug: 'professional', name: 'Professional', description: 'Formal and business-like' },
          { id: 'casual', slug: 'casual', name: 'Casual', description: 'Relaxed and informal' },
          { id: 'empathetic', slug: 'empathetic', name: 'Empathetic', description: 'Understanding and supportive' },
        ])

        if (staticAgents.length > 0) {
          setSelectedAgentId(staticAgents[0].id)
        }
        setIsLoading(false)
        return
      }

      // API calls for real mode
      const [instancesRes, agentsRes] = await Promise.all([
        fetch('/api/agents/instances'),
        fetch('/api/agents'),
      ])

      if (instancesRes.ok) {
        const data = await instancesRes.json()
        setInstances(data.instances || [])
      } else {
        const errorData = await instancesRes.json()
        // Only show error once per session
        if (!hasShownMembershipError && errorData.error) {
          if (errorData.error === 'Not a company member') {
            toast.error('Not a company member. Please contact your administrator.')
          } else {
            toast.error(errorData.error)
          }
          setHasShownMembershipError(true)
        }
      }

      if (agentsRes.ok) {
        const data = await agentsRes.json()
        setAgents(data.agents || [])
        setTonePresets(data.tonePresets || [])
        if (data.agents?.length > 0) {
          setSelectedAgentId(data.agents[0].id)
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
      if (!hasShownMembershipError) {
        toast.error('Failed to load agents')
        setHasShownMembershipError(true)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const searchEmployees = async (query: string) => {
    if (query.length < 2) {
      setEmployeeResults([])
      return
    }

    setIsSearchingEmployees(true)

    // Check for demo mode - use client-side filtering for reliability
    const isDemoMode = typeof document !== 'undefined' &&
      document.cookie.includes('paypilot_demo_mode=true')

    if (isDemoMode) {
      // Use deterministic client-side search
      const results = searchEmployeesLocally(query.trim(), 15)
      const selectedIds = new Set(selectedEmployees.map(e => e.id))
      setEmployeeResults(results.filter(e => !selectedIds.has(e.id)))
      setIsSearchingEmployees(false)
      return
    }

    // API call for real mode
    try {
      const res = await fetch(`/api/employees/search?q=${encodeURIComponent(query.trim())}&limit=15`)
      if (res.ok) {
        const data = await res.json()
        // Filter out already selected employees
        const selectedIds = new Set(selectedEmployees.map(e => e.id))
        setEmployeeResults((data.employees || []).filter((e: Employee) => !selectedIds.has(e.id)))
      } else {
        const errorData = await res.json()
        // Don't spam toasts on each keystroke
        console.error('Employee search failed:', errorData)
      }
    } catch (error) {
      console.error('Failed to search employees:', error)
    } finally {
      setIsSearchingEmployees(false)
    }
  }

  const handleSelectEmployee = (employee: Employee) => {
    // Prevent duplicates - only add if not already selected
    setSelectedEmployees(prev =>
      prev.some(e => e.id === employee.id)
        ? prev
        : [...prev, employee]
    )
    setEmployeeSearch('')
    setEmployeeResults([])
    setEmployeePickerOpen(false)
  }

  const handleRemoveEmployee = (employeeId: string) => {
    setSelectedEmployees(prev => prev.filter(e => e.id !== employeeId))
  }

  const handleCreate = async () => {
    if (!selectedAgentId || !instanceName) {
      toast.error('Please fill in all required fields')
      return
    }

    if (audienceType === 'individual' && selectedEmployees.length === 0) {
      toast.error('Please select at least one employee')
      return
    }

    setIsCreating(true)
    try {
      const res = await fetch('/api/agents/instances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_id: selectedAgentId,
          name: instanceName,
          config: {
            tone_preset: tonePreset,
            audience_type: audienceType,
            audience_filter: audienceType === 'individual' ? {
              employee_ids: selectedEmployees.map(e => e.id),
            } : undefined,
            guardrails,
          },
          schedule: {
            cadence,
          },
        }),
      })

      if (res.ok) {
        toast.success('Agent created successfully!')
        setIsCreateOpen(false)
        resetForm()
        fetchData()
      } else {
        const error = await res.json()
        toast.error(error.error || 'Failed to create agent')
      }
    } catch (error) {
      console.error('Failed to create agent:', error)
      toast.error('Failed to create agent')
    } finally {
      setIsCreating(false)
    }
  }

  const handleTrigger = async (instanceId: string) => {
    try {
      const res = await fetch(`/api/agents/instances/${instanceId}/trigger`, {
        method: 'POST',
      })

      if (res.ok) {
        const data = await res.json()
        toast.success(`Sent ${data.messages_sent} messages to ${data.conversations_touched} employees`)
      } else {
        const error = await res.json()
        toast.error(error.error || 'Failed to trigger agent')
      }
    } catch (error) {
      console.error('Failed to trigger agent:', error)
      toast.error('Failed to trigger agent')
    }
  }

  const handleStatusChange = async (instanceId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/agents/instances/${instanceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        toast.success(`Agent ${newStatus === 'active' ? 'activated' : 'paused'}`)
        fetchData()
      } else {
        const error = await res.json()
        toast.error(error.error || 'Failed to update agent')
      }
    } catch (error) {
      console.error('Failed to update agent:', error)
      toast.error('Failed to update agent')
    }
  }

  const resetForm = () => {
    setInstanceName('')
    setTonePreset('poke_lite')
    setAudienceType('company_wide')
    setCadence('weekly')
    setSelectedEmployees([])
    setEmployeeSearch('')
    setEmployeeResults([])
    setGuardrails({
      no_sensitive_topics: true,
      no_medical_legal: true,
      no_coercion: true,
      no_harassment: true,
    })
    if (agents.length > 0) {
      setSelectedAgentId(agents[0].id)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">AI Agents</h1>
          <p className="text-muted-foreground">
            Create and manage automated employee engagement agents
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Agent
          </Button>
        )}
        {!isAdmin && user && (
          <Badge variant="outline" className="text-muted-foreground">
            View Only
          </Badge>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{instances.filter(i => i.status === 'active').length}</p>
                <p className="text-sm text-muted-foreground">Active Agents</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent">
                <MessageCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {instances.reduce((acc, i) => acc + (i.stats?.conversations || 0), 0)}
                </p>
                <p className="text-sm text-muted-foreground">Conversations</p>
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
                <p className="text-2xl font-bold">
                  {instances.reduce((acc, i) => acc + (i.stats?.messages || 0), 0)}
                </p>
                <p className="text-sm text-muted-foreground">Messages Sent</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{instances.length}</p>
                <p className="text-sm text-muted-foreground">Total Agents</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agent Instances Grid */}
      {instances.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No agents yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first AI agent to start collecting employee feedback
            </p>
            {isAdmin ? (
              <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Agent
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">
                Contact your HR administrator to set up AI agents.
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {instances.map((instance, index) => (
            <motion.div
              key={instance.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${AGENT_TYPE_COLORS[instance.agents?.agent_type] || 'bg-gray-500/10 text-gray-500'}`}>
                        {AGENT_TYPE_ICONS[instance.agents?.agent_type] || <Bot className="h-5 w-5" />}
                      </div>
                      <div>
                        <CardTitle className="text-base">{instance.name}</CardTitle>
                        <p className="text-sm text-muted-foreground capitalize">
                          {instance.agents?.agent_type?.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                    {isAdmin && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleTrigger(instance.id)}>
                            <Play className="h-4 w-4 mr-2" />
                            Run Now
                          </DropdownMenuItem>
                          {instance.status === 'active' ? (
                            <DropdownMenuItem onClick={() => handleStatusChange(instance.id, 'paused')}>
                              <Pause className="h-4 w-4 mr-2" />
                              Pause
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleStatusChange(instance.id, 'active')}>
                              <Play className="h-4 w-4 mr-2" />
                              Activate
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem>
                            <Settings className="h-4 w-4 mr-2" />
                            Settings
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${STATUS_COLORS[instance.status]}`} />
                    <span className="text-sm capitalize">{instance.status}</span>
                    <Badge variant="outline" className="ml-auto text-xs">
                      {instance.config?.tone_preset?.replace('_', ' ')}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Audience</p>
                      <p className="font-medium capitalize">
                        {instance.config?.audience_type?.replace('_', ' ')}
                        {instance.config?.target_employee_ids?.length ? ` (${instance.config.target_employee_ids.length})` : ''}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Cadence</p>
                      <p className="font-medium capitalize">
                        {instance.agent_schedules?.[0]?.cadence || 'Not set'}
                      </p>
                    </div>
                  </div>

                  {instance.agent_schedules?.[0]?.next_run_at && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      Next run: {formatDate(instance.agent_schedules[0].next_run_at)}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{instance.stats?.conversations || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4 text-muted-foreground" />
                        <span>{instance.stats?.messages || 0}</span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTrigger(instance.id)}
                      disabled={instance.status !== 'active'}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Run
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Agent Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create AI Agent</DialogTitle>
            <DialogDescription>
              Set up an automated agent to engage with employees
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Agent Type */}
            <div className="space-y-2">
              <Label>Agent Type</Label>
              <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select agent type" />
                </SelectTrigger>
                <SelectContent>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      <div className="flex items-center gap-2">
                        {AGENT_TYPE_ICONS[agent.agent_type]}
                        <span>{agent.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedAgentId && (
                <p className="text-sm text-muted-foreground">
                  {agents.find(a => a.id === selectedAgentId)?.description}
                </p>
              )}
            </div>

            {/* Instance Name */}
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                placeholder="e.g., Weekly Team Pulse"
                value={instanceName}
                onChange={(e) => setInstanceName(e.target.value)}
              />
            </div>

            {/* Tone Preset */}
            <div className="space-y-2">
              <Label>Tone</Label>
              <Select value={tonePreset} onValueChange={setTonePreset}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tonePresets.map((preset) => (
                    <SelectItem key={preset.slug} value={preset.slug}>
                      {preset.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Audience */}
            <div className="space-y-2">
              <Label>Audience</Label>
              <Select value={audienceType} onValueChange={(val) => {
                setAudienceType(val)
                if (val !== 'individual') {
                  setSelectedEmployees([])
                }
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="company_wide">Company-wide</SelectItem>
                  <SelectItem value="department">By Department</SelectItem>
                  <SelectItem value="team">By Team</SelectItem>
                  <SelectItem value="individual">Specific Employees</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Employee Picker - only shown when audience is "individual" */}
            {audienceType === 'individual' && (
              <div className="space-y-2">
                <Label>Select Employees</Label>

                {/* Selected employees as pills */}
                {selectedEmployees.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedEmployees.map((emp) => (
                      <Badge
                        key={emp.id}
                        variant="secondary"
                        className="gap-1 pr-1"
                      >
                        {emp.full_name}
                        <button
                          type="button"
                          onClick={() => handleRemoveEmployee(emp.id)}
                          className="ml-1 rounded-full hover:bg-muted p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Search combobox */}
                <Popover open={employeePickerOpen} onOpenChange={setEmployeePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={employeePickerOpen}
                      className="w-full justify-start text-muted-foreground font-normal"
                    >
                      <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                      Search employees...
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0" align="start">
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder="Type to search (min 2 chars)..."
                        value={employeeSearch}
                        onValueChange={setEmployeeSearch}
                      />
                      <CommandList>
                        {isSearchingEmployees && (
                          <div className="flex items-center justify-center py-6">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
                          </div>
                        )}
                        {!isSearchingEmployees && employeeSearch.length >= 2 && employeeResults.length === 0 && (
                          <CommandEmpty>No employees found.</CommandEmpty>
                        )}
                        {!isSearchingEmployees && employeeSearch.length < 2 && (
                          <div className="py-6 text-center text-sm text-muted-foreground">
                            Type at least 2 characters to search
                          </div>
                        )}
                        {employeeResults.length > 0 && (
                          <CommandGroup heading="Employees">
                            {employeeResults.map((emp) => (
                              <CommandItem
                                key={emp.id}
                                value={emp.id}
                                onSelect={() => handleSelectEmployee(emp)}
                                className="cursor-pointer"
                              >
                                <div className="flex flex-col">
                                  <span className="font-medium">{emp.full_name}</span>
                                  <span className="text-sm text-muted-foreground">
                                    {emp.email}
                                    {emp.job_title && ` • ${emp.job_title}`}
                                  </span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                <p className="text-xs text-muted-foreground">
                  {selectedEmployees.length} employee{selectedEmployees.length !== 1 ? 's' : ''} selected
                </p>
              </div>
            )}

            {/* Cadence */}
            <div className="space-y-2">
              <Label>Cadence</Label>
              <Select value={cadence} onValueChange={setCadence}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="once">Once</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Bi-weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Guardrails */}
            <div className="space-y-2">
              <Label>Safety Guardrails</Label>
              <div className="space-y-2">
                {Object.entries(guardrails).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <Checkbox
                      id={key}
                      checked={value}
                      onCheckedChange={(checked) =>
                        setGuardrails({ ...guardrails, [key]: checked as boolean })
                      }
                    />
                    <label htmlFor={key} className="text-sm capitalize">
                      {key.replace(/_/g, ' ')}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create Agent'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
