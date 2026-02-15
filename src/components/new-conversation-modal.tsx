'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import {
  Search,
  X,
  Loader2,
  MessageCircle,
  Mic,
  Bot,
  Users,
  TrendingUp,
} from 'lucide-react'
import {
  searchEmployees,
  STATIC_AGENT_INSTANCES,
  AGENT_TEMPLATES,
  type Conversation,
} from '@/lib/static-demo-data'

interface Employee {
  id: string
  name: string
  email: string
  department: string
  title: string
}

interface NewConversationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConversationCreated: (conversation: Conversation) => void
}

const AGENT_TYPE_ICONS: Record<string, React.ReactNode> = {
  pulse_check: <TrendingUp className="h-4 w-4" />,
  onboarding: <Users className="h-4 w-4" />,
  exit_interview: <MessageCircle className="h-4 w-4" />,
  chat_agent: <Bot className="h-4 w-4" />,
}

export function NewConversationModal({
  open,
  onOpenChange,
  onConversationCreated,
}: NewConversationModalProps) {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [employeeSearch, setEmployeeSearch] = useState('')
  const [employeeResults, setEmployeeResults] = useState<Employee[]>([])
  const [isSearchingEmployees, setIsSearchingEmployees] = useState(false)
  const [employeePickerOpen, setEmployeePickerOpen] = useState(false)

  const [selectedAgentInstanceId, setSelectedAgentInstanceId] = useState('')
  const [mode, setMode] = useState<'chat' | 'voice'>('chat')
  const [seedMessage, setSeedMessage] = useState('')

  const [isCreating, setIsCreating] = useState(false)

  // Get active agent instances
  const activeAgents = STATIC_AGENT_INSTANCES.filter(a => a.status === 'active')

  // Search employees
  useEffect(() => {
    if (employeeSearch.length >= 2) {
      setIsSearchingEmployees(true)
      const results = searchEmployees(employeeSearch.trim(), 10)
      setEmployeeResults(
        results
          .filter(e => e.id !== selectedEmployee?.id)
          .map(e => ({
            id: e.id,
            name: e.name,
            email: e.email,
            department: e.department,
            title: e.title,
          }))
      )
      setIsSearchingEmployees(false)
    } else {
      setEmployeeResults([])
    }
  }, [employeeSearch, selectedEmployee])

  // Set default agent when modal opens
  useEffect(() => {
    if (open && activeAgents.length > 0 && !selectedAgentInstanceId) {
      setSelectedAgentInstanceId(activeAgents[0].id)
    }
  }, [open, activeAgents, selectedAgentInstanceId])

  const handleSelectEmployee = (employee: Employee) => {
    setSelectedEmployee(employee)
    setEmployeeSearch('')
    setEmployeeResults([])
    setEmployeePickerOpen(false)
  }

  const handleCreate = async () => {
    if (!selectedEmployee) {
      toast.error('Please select an employee')
      return
    }

    if (!selectedAgentInstanceId) {
      toast.error('Please select an agent')
      return
    }

    setIsCreating(true)
    try {
      const res = await fetch('/api/messages/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: selectedEmployee.id,
          agentInstanceId: selectedAgentInstanceId,
          mode,
          seedMessage: seedMessage.trim() || undefined,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        toast.success(`Conversation started with ${selectedEmployee.name}`)
        onConversationCreated(data.conversation)
        resetForm()
        onOpenChange(false)
      } else {
        const error = await res.json()
        toast.error(error.error || 'Failed to create conversation')
      }
    } catch (error) {
      console.error('Error creating conversation:', error)
      toast.error('Failed to create conversation')
    } finally {
      setIsCreating(false)
    }
  }

  const resetForm = () => {
    setSelectedEmployee(null)
    setEmployeeSearch('')
    setEmployeeResults([])
    setSelectedAgentInstanceId(activeAgents[0]?.id || '')
    setMode('chat')
    setSeedMessage('')
  }

  const getAgentTemplate = (agentType: string) => {
    return AGENT_TEMPLATES.find(t => t.id === agentType)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
          <DialogDescription>
            Start a new conversation with an employee using an AI agent
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Employee Picker */}
          <div className="space-y-2">
            <Label>Employee *</Label>

            {selectedEmployee ? (
              <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
                <div>
                  <p className="font-medium">{selectedEmployee.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedEmployee.email} • {selectedEmployee.department}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedEmployee(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
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
                      placeholder="Type name or email (min 2 chars)..."
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
                                <span className="font-medium">{emp.name}</span>
                                <span className="text-sm text-muted-foreground">
                                  {emp.email}
                                  {emp.title && ` • ${emp.title}`}
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
            )}
          </div>

          {/* Agent Instance Selector */}
          <div className="space-y-2">
            <Label>Agent</Label>
            <Select value={selectedAgentInstanceId} onValueChange={setSelectedAgentInstanceId}>
              <SelectTrigger>
                <SelectValue placeholder="Select an agent" />
              </SelectTrigger>
              <SelectContent>
                {activeAgents.map((agent) => {
                  const template = getAgentTemplate(agent.agentType)
                  return (
                    <SelectItem key={agent.id} value={agent.id}>
                      <div className="flex items-center gap-2">
                        {AGENT_TYPE_ICONS[agent.agentType] || <Bot className="h-4 w-4" />}
                        <span>{agent.name}</span>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
            {selectedAgentInstanceId && (
              <p className="text-xs text-muted-foreground">
                {getAgentTemplate(
                  activeAgents.find(a => a.id === selectedAgentInstanceId)?.agentType || ''
                )?.description}
              </p>
            )}
          </div>

          {/* Mode Toggle */}
          <div className="space-y-2">
            <Label>Mode</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={mode === 'chat' ? 'default' : 'outline'}
                className="flex-1 gap-2"
                onClick={() => setMode('chat')}
              >
                <MessageCircle className="h-4 w-4" />
                Chat
              </Button>
              <Button
                type="button"
                variant={mode === 'voice' ? 'default' : 'outline'}
                className="flex-1 gap-2"
                onClick={() => setMode('voice')}
              >
                <Mic className="h-4 w-4" />
                Voice
              </Button>
            </div>
          </div>

          {/* Seed Message (Optional) */}
          <div className="space-y-2">
            <Label>
              Initial Context <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              placeholder="Add context for the agent, e.g., 'Follow up on last week's concerns about workload'"
              value={seedMessage}
              onChange={(e) => setSeedMessage(e.target.value)}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              This will be sent as the first message from the employee
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isCreating || !selectedEmployee}>
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <MessageCircle className="h-4 w-4 mr-2" />
                Start Conversation
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
