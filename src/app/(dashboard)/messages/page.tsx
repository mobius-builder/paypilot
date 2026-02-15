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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { useUser } from '@/contexts/user-context'
import {
  STATIC_CONVERSATIONS,
  STATIC_AGENT_INSTANCES,
  getConversationsForUser,
  getConversationById,
  type Conversation,
  type Message,
} from '@/lib/static-demo-data'

const AGENT_TYPE_COLORS: Record<string, string> = {
  pulse_check: 'bg-blue-500',
  onboarding: 'bg-green-500',
  exit_interview: 'bg-orange-500',
  manager_360: 'bg-purple-500',
}

export default function MessagesPage() {
  const { user, isAdmin, isLoading: isUserLoading } = useUser()
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [localMessages, setLocalMessages] = useState<Message[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Get conversations based on user role (RBAC)
  // Admin sees ALL conversations, Employee sees ONLY their own
  const conversations = useMemo(() => {
    if (!user) return []

    const userId = user.userId
    const userIsAdmin = isAdmin

    // Get filtered conversations based on role
    const filteredConvs = getConversationsForUser(userId, userIsAdmin)

    // Sort by last message date (most recent first)
    return [...filteredConvs].sort((a, b) =>
      new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    )
  }, [user, isAdmin])

  // Get the selected conversation object
  const selectedConversation = useMemo(() => {
    if (!selectedConversationId || !user) return null
    return getConversationById(selectedConversationId, user.userId, isAdmin)
  }, [selectedConversationId, user, isAdmin])

  // Get agent instance for selected conversation
  const selectedAgentInstance = useMemo(() => {
    if (!selectedConversation) return null
    return STATIC_AGENT_INSTANCES.find(i => i.id === selectedConversation.agentInstanceId)
  }, [selectedConversation])

  // Load messages when conversation is selected
  // Messages are inline in the conversation object - no separate fetch needed
  useEffect(() => {
    if (selectedConversation) {
      setLocalMessages([...selectedConversation.messages])
    } else {
      setLocalMessages([])
    }
  }, [selectedConversation])

  useEffect(() => {
    if (!isUserLoading) {
      setIsLoading(false)
    }
  }, [isUserLoading])

  useEffect(() => {
    scrollToBottom()
  }, [localMessages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const sendMessage = async () => {
    if (!selectedConversation || !newMessage.trim()) return

    setIsSending(true)
    const messageContent = newMessage.trim()
    setNewMessage('')

    // Create new message
    const newMsg: Message = {
      id: `msg_new_${Date.now()}`,
      conversationId: selectedConversation.id,
      senderType: 'employee',
      content: messageContent,
      createdAt: new Date().toISOString(),
    }

    // Add to local messages optimistically
    setLocalMessages(prev => [...prev, newMsg])

    // Simulate AI response after a short delay
    setTimeout(() => {
      const aiResponse: Message = {
        id: `msg_ai_${Date.now()}`,
        conversationId: selectedConversation.id,
        senderType: 'agent',
        content: generateAIResponse(messageContent),
        createdAt: new Date().toISOString(),
      }
      setLocalMessages(prev => [...prev, aiResponse])
      setIsSending(false)
    }, 1000)
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

  // Filter conversations by search query
  const filteredConversations = conversations.filter(c => {
    const agentInstance = STATIC_AGENT_INSTANCES.find(i => i.id === c.agentInstanceId)
    const agentName = agentInstance?.name || ''
    return (
      agentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.employeeName.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

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
          selectedConversationId && "hidden md:flex"
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
              filteredConversations.map((conv) => {
                const agentInstance = STATIC_AGENT_INSTANCES.find(i => i.id === conv.agentInstanceId)
                // Preview from ACTUAL last message content
                const lastMessage = conv.messages[conv.messages.length - 1]
                const hasUnread = conv.status === 'active' && lastMessage?.senderType === 'agent'

                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversationId(conv.id)}
                    className={cn(
                      "w-full p-4 text-left border-b hover:bg-accent/50 transition-colors",
                      selectedConversationId === conv.id && "bg-accent"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className={AGENT_TYPE_COLORS[agentInstance?.agentType || 'pulse_check'] || 'bg-primary'}>
                            <Bot className="h-5 w-5 text-white" />
                          </AvatarFallback>
                        </Avatar>
                        {hasUnread && (
                          <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium truncate">
                            {agentInstance?.name || 'Agent'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(conv.lastMessageAt)}
                          </span>
                        </div>
                        {/* Show employee name for admin view */}
                        {isAdmin && (
                          <p className="text-xs text-primary font-medium truncate mb-0.5">
                            with {conv.employeeName}
                          </p>
                        )}
                        {/* Preview from ACTUAL last message content - not hardcoded */}
                        <p className="text-sm text-muted-foreground truncate">
                          {lastMessage?.content || 'No messages yet'}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </Card>

        {/* Chat Area */}
        <Card className={cn(
          "flex-1 flex flex-col",
          !selectedConversationId && "hidden md:flex"
        )}>
          {selectedConversation && selectedAgentInstance ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setSelectedConversationId(null)}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Avatar className="h-10 w-10">
                  <AvatarFallback className={AGENT_TYPE_COLORS[selectedAgentInstance.agentType] || 'bg-primary'}>
                    <Bot className="h-5 w-5 text-white" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{selectedAgentInstance.name}</h3>
                  <p className="text-sm text-muted-foreground capitalize">
                    {selectedAgentInstance.agentType.replace('_', ' ')} Assistant
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
                {localMessages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No messages yet</p>
                    <p className="text-sm">The agent will reach out soon!</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {localMessages.map((message, index) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.02 }}
                        className={cn(
                          "flex gap-3",
                          message.senderType === 'employee' && "flex-row-reverse"
                        )}
                      >
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback className={
                            message.senderType === 'agent'
                              ? AGENT_TYPE_COLORS[selectedAgentInstance.agentType] || 'bg-primary'
                              : message.senderType === 'system'
                              ? 'bg-yellow-500'
                              : 'bg-secondary'
                          }>
                            {message.senderType === 'agent' ? (
                              <Bot className="h-4 w-4 text-white" />
                            ) : message.senderType === 'system' ? (
                              <AlertCircle className="h-4 w-4 text-white" />
                            ) : (
                              <User className="h-4 w-4" />
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div className={cn(
                          "max-w-[70%] space-y-1",
                          message.senderType === 'employee' && "items-end"
                        )}>
                          <div className={cn(
                            "rounded-2xl px-4 py-2",
                            message.senderType === 'agent'
                              ? "bg-accent rounded-tl-sm"
                              : message.senderType === 'system'
                              ? "bg-yellow-50 border border-yellow-200 text-yellow-800"
                              : "bg-primary text-primary-foreground rounded-tr-sm"
                          )}>
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          </div>
                          <div className={cn(
                            "flex items-center gap-1 text-xs text-muted-foreground",
                            message.senderType === 'employee' && "justify-end"
                          )}>
                            <Clock className="h-3 w-3" />
                            {formatTime(message.createdAt)}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              {selectedConversation.status !== 'escalated' && selectedConversation.status !== 'completed' && (
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

              {selectedConversation.status === 'completed' && (
                <div className="p-4 border-t bg-gray-50">
                  <p className="text-sm text-gray-600 text-center">
                    This conversation has been completed.
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

// Helper function to generate AI responses
function generateAIResponse(userMessage: string): string {
  const msg = userMessage.toLowerCase()

  if (msg.includes('stress') || msg.includes('overwhelm') || msg.includes('anxious') || msg.includes('tired')) {
    return "I hear that you're going through a challenging time. Your wellbeing matters to us. Would you like me to share some resources that might help, or would you prefer to talk more about what's going on?"
  }

  if (msg.includes('great') || msg.includes('good') || msg.includes('happy') || msg.includes('excited')) {
    return "That's wonderful to hear! What's been the highlight for you? I'd love to know more about what's going well."
  }

  if (msg.includes('deadline') || msg.includes('workload') || msg.includes('busy')) {
    return "Thanks for sharing that. Balancing priorities can be tough. Is there anything specific that's taking up most of your bandwidth right now?"
  }

  if (msg.includes('team') || msg.includes('manager') || msg.includes('colleague')) {
    return "Team dynamics are so important. How would you describe your working relationship with your team right now?"
  }

  const responses = [
    "Thanks for sharing! That's really helpful to hear. Is there anything else on your mind?",
    "I appreciate you opening up. How are you feeling about the week ahead?",
    "Got it! Your feedback is valuable. Anything else you'd like to add?",
    "Thanks for the update! It sounds like you've been thoughtful about this. What's your priority for next week?",
  ]

  return responses[Math.floor(Math.random() * responses.length)]
}
