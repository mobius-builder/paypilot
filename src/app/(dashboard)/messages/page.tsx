'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageCircle,
  Send,
  Bot,
  User,
  ChevronLeft,
  Search,
  Clock,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useUser } from '@/contexts/user-context'
import { STATIC_CONVERSATIONS, getConversationsForUser, getConversationById } from '@/lib/agent-demo-data'
import { getDemoMessages } from '@/lib/demo-context'

interface Conversation {
  id: string
  status: string
  unread_count: number
  message_count: number
  last_message_at: string
  employee_name?: string // For admin to see who the conversation is with
  agent_instances: {
    id: string
    name: string
    agents: {
      name: string
      agent_type: string
    }
  }
  latest_message?: {
    content: string
    sender_type: string
    created_at: string
  }
}

interface Message {
  id: string
  content: string
  sender_type: 'employee' | 'agent' | 'system'
  content_type: string
  created_at: string
  is_read: boolean
}

const AGENT_TYPE_COLORS: Record<string, string> = {
  pulse_check: 'bg-primary',
  onboarding: 'bg-primary/80',
  exit_interview: 'bg-primary/60',
  manager_coaching: 'bg-primary/70',
}

export default function MessagesPage() {
  const { user, isAdmin, isLoading: isUserLoading } = useUser()
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Get conversations based on user role (RBAC)
  const conversations = useMemo(() => {
    if (!user) return []

    // Use static data filtered by user role
    const staticConvs = getConversationsForUser(user.userId, isAdmin)

    // Map to expected format
    return staticConvs.map(c => ({
      id: c.id,
      status: c.status,
      unread_count: c.unread_count,
      message_count: c.message_count,
      last_message_at: c.last_message_at,
      employee_name: c.employee_name, // For admin to see who the conversation is with
      agent_instances: {
        id: c.agent_instance_id,
        name: c.agent_name,
        agents: {
          name: c.agent_name,
          agent_type: c.agent_instance_id === 'inst_001' ? 'pulse_check' :
                      c.agent_instance_id === 'inst_002' ? 'onboarding' : 'pulse_check',
        },
      },
      latest_message: c.messages.length > 0 ? {
        content: c.messages[c.messages.length - 1].content,
        sender_type: c.messages[c.messages.length - 1].sender_type,
        created_at: c.messages[c.messages.length - 1].created_at,
      } : undefined,
    })) as Conversation[]
  }, [user, isAdmin])

  useEffect(() => {
    // Set loading false once user is loaded
    if (!isUserLoading) {
      setIsLoading(false)
    }
  }, [isUserLoading])

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id)
    }
  }, [selectedConversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Fetch messages from static data or demo-context (for runtime messages)
  const fetchMessages = async (conversationId: string) => {
    setIsLoadingMessages(true)
    try {
      // First check for runtime messages (added via demo mode messaging)
      const runtimeMessages = getDemoMessages(conversationId)
      if (runtimeMessages && runtimeMessages.length > 0) {
        const msgs = runtimeMessages.map(m => ({
          id: m.id,
          content: m.content,
          sender_type: m.sender_type as 'employee' | 'agent' | 'system',
          content_type: m.content_type || 'text',
          created_at: m.created_at,
          is_read: m.is_read,
        }))
        setMessages(msgs)
        setIsLoadingMessages(false)
        return
      }

      // Then check static conversations
      const conv = STATIC_CONVERSATIONS.find(c => c.id === conversationId)
      if (conv && conv.messages && conv.messages.length > 0) {
        const msgs = conv.messages.map(m => ({
          id: m.id,
          content: m.content,
          sender_type: m.sender_type as 'employee' | 'agent' | 'system',
          content_type: 'text',
          created_at: m.created_at,
          is_read: true,
        }))
        setMessages(msgs)
        setIsLoadingMessages(false)
        return
      }

      // Try API fallback for real conversations
      const res = await fetch(`/api/conversations/${conversationId}`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages || [])
      } else {
        // No messages found
        setMessages([])
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error)
      toast.error('Failed to load conversation')
    } finally {
      setIsLoadingMessages(false)
    }
  }

  const sendMessage = async () => {
    if (!selectedConversation || !newMessage.trim()) return

    setIsSending(true)
    const messageContent = newMessage.trim()
    setNewMessage('')

    // Optimistically add message
    const tempId = `temp-${Date.now()}`
    const tempMessage: Message = {
      id: tempId,
      content: messageContent,
      sender_type: 'employee',
      content_type: 'text',
      created_at: new Date().toISOString(),
      is_read: true,
    }
    setMessages(prev => [...prev, tempMessage])

    try {
      const res = await fetch(`/api/conversations/${selectedConversation.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: messageContent }),
      })

      if (res.ok) {
        const data = await res.json()

        // Replace temp message with real one and add agent response
        setMessages(prev => {
          const filtered = prev.filter(m => m.id !== tempId)
          const newMessages = [...filtered, { ...tempMessage, id: `sent-${Date.now()}` }]
          if (data.response) {
            newMessages.push(data.response)
          }
          return newMessages
        })

        if (data.escalated) {
          toast.info('Your message has been flagged for HR review. Someone will reach out to you directly.')
        }
      } else {
        // Remove temp message on error
        setMessages(prev => prev.filter(m => m.id !== tempId))
        setNewMessage(messageContent)
        const error = await res.json()
        toast.error(error.error || 'Failed to send message')
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      setMessages(prev => prev.filter(m => m.id !== tempId))
      setNewMessage(messageContent)
      toast.error('Failed to send message')
    } finally {
      setIsSending(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const formatTime = (date: string) => {
    const d = new Date(date)
    const now = new Date()
    const diff = now.getTime() - d.getTime()

    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    if (diff < 604800000) return d.toLocaleDateString('en-US', { weekday: 'short' })
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const filteredConversations = conversations.filter(c =>
    c.agent_instances?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-8rem)]">
      <div className="flex h-full gap-4">
        {/* Conversation List */}
        <Card className={cn(
          "w-80 flex-shrink-0 flex flex-col",
          selectedConversation && "hidden md:flex"
        )}>
          <div className="p-4 border-b">
            <h2 className="font-semibold mb-3">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No messages yet</p>
                <p className="text-sm">Check back when agents are active</p>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={cn(
                    "w-full p-4 text-left border-b hover:bg-accent/50 transition-colors",
                    selectedConversation?.id === conv.id && "bg-accent"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className={AGENT_TYPE_COLORS[conv.agent_instances?.agents?.agent_type] || 'bg-primary'}>
                          <Bot className="h-5 w-5 text-white" />
                        </AvatarFallback>
                      </Avatar>
                      {conv.unread_count > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium truncate">
                          {conv.agent_instances?.name || 'Agent'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {conv.last_message_at ? formatTime(conv.last_message_at) : ''}
                        </span>
                      </div>
                      {/* Show employee name for admin view */}
                      {isAdmin && conv.employee_name && (
                        <p className="text-xs text-primary font-medium truncate mb-0.5">
                          with {conv.employee_name}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground truncate">
                        {conv.latest_message?.content || 'No messages yet'}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </Card>

        {/* Chat Area */}
        <Card className={cn(
          "flex-1 flex flex-col",
          !selectedConversation && "hidden md:flex"
        )}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setSelectedConversation(null)}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Avatar className="h-10 w-10">
                  <AvatarFallback className={AGENT_TYPE_COLORS[selectedConversation.agent_instances?.agents?.agent_type] || 'bg-primary'}>
                    <Bot className="h-5 w-5 text-white" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{selectedConversation.agent_instances?.name}</h3>
                  <p className="text-sm text-muted-foreground capitalize">
                    {selectedConversation.agent_instances?.agents?.agent_type?.replace('_', ' ')} Assistant
                  </p>
                </div>
                {selectedConversation.status === 'escalated' && (
                  <Badge variant="destructive" className="ml-auto">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Escalated
                  </Badge>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {isLoadingMessages ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No messages yet</p>
                    <p className="text-sm">The agent will reach out soon!</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {messages.map((message, index) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={cn(
                          "flex gap-3",
                          message.sender_type === 'employee' && "flex-row-reverse"
                        )}
                      >
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback className={
                            message.sender_type === 'agent'
                              ? AGENT_TYPE_COLORS[selectedConversation.agent_instances?.agents?.agent_type] || 'bg-primary'
                              : 'bg-secondary'
                          }>
                            {message.sender_type === 'agent' ? (
                              <Bot className="h-4 w-4 text-white" />
                            ) : (
                              <User className="h-4 w-4" />
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div className={cn(
                          "max-w-[70%] space-y-1",
                          message.sender_type === 'employee' && "items-end"
                        )}>
                          <div className={cn(
                            "rounded-2xl px-4 py-2",
                            message.sender_type === 'agent'
                              ? "bg-accent rounded-tl-sm"
                              : "bg-primary text-primary-foreground rounded-tr-sm",
                            message.content_type === 'escalation' && "bg-red-50 border border-red-200 text-red-800"
                          )}>
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          </div>
                          <div className={cn(
                            "flex items-center gap-1 text-xs text-muted-foreground",
                            message.sender_type === 'employee' && "justify-end"
                          )}>
                            <Clock className="h-3 w-3" />
                            {formatTime(message.created_at)}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              {selectedConversation.status !== 'escalated' && selectedConversation.status !== 'closed' && (
                <div className="p-4 border-t">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      sendMessage()
                    }}
                    className="flex gap-2"
                  >
                    <Input
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      disabled={isSending}
                      className="flex-1"
                    />
                    <Button type="submit" disabled={isSending || !newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              )}

              {selectedConversation.status === 'escalated' && (
                <div className="p-4 border-t bg-red-50">
                  <p className="text-sm text-red-800 text-center">
                    This conversation has been escalated to HR. Someone will reach out to you directly.
                  </p>
                </div>
              )}
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="font-medium mb-1">Select a conversation</h3>
                <p className="text-sm">Choose from your messages on the left</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}
