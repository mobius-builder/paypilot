'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sparkles,
  Send,
  User,
  Loader2,
  Calendar,
  DollarSign,
  Clock,
  Shield,
  HelpCircle,
  ArrowRight
} from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const suggestedQuestions = [
  { icon: Calendar, text: "How many PTO days do I have left?", category: "Time Off" },
  { icon: DollarSign, text: "When is the next payday?", category: "Payroll" },
  { icon: Shield, text: "What's the company health insurance plan?", category: "Benefits" },
  { icon: Clock, text: "What are the core working hours?", category: "Policy" },
  { icon: HelpCircle, text: "How do I enroll in the 401(k)?", category: "Benefits" },
  { icon: Calendar, text: "Who is on leave this week?", category: "Team" },
]

// Call the AI API endpoint
const callAIApi = async (message: string, history: Array<{ role: string; content: string }>): Promise<string> => {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      conversationHistory: history.slice(-10) // Keep last 10 messages for context
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to get AI response')
  }

  const data = await response.json()
  return data.message
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your AI HR Assistant. I can help you with questions about PTO, payroll, benefits, company policies, and more. What would you like to know?",
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async (text?: string) => {
    const messageText = text || input
    if (!messageText.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date()
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setIsLoading(true)

    try {
      // Build conversation history for API
      const history = updatedMessages
        .filter(m => m.id !== '1') // Exclude initial greeting
        .map(m => ({ role: m.role, content: m.content }))

      const response = await callAIApi(messageText, history)

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error getting AI response:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I'm having trouble processing your request right now. Please try again in a moment.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestedQuestion = (question: string) => {
    handleSend(question)
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">AI HR Assistant</h1>
            <p className="text-slate-600">Ask me anything about HR, payroll, or company policies</p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary">
                      <Sparkles className="w-4 h-4 text-white" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-white rounded-tr-none'
                      : 'bg-slate-100 text-slate-900 rounded-tl-none'
                  }`}
                >
                  <div
                    className="text-sm whitespace-pre-wrap prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: message.content
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\n/g, '<br/>')
                    }}
                  />
                </div>
                {message.role === 'user' && (
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-accent text-primary">
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-primary">
                    <Sparkles className="w-4 h-4 text-white" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-slate-100 rounded-2xl rounded-tl-none px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                    <span className="text-sm text-slate-500">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Suggested Questions */}
        {messages.length === 1 && (
          <div className="p-4 border-t bg-slate-50">
            <p className="text-sm text-slate-500 mb-3">Suggested questions:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestedQuestion(q.text)}
                  className="flex items-center gap-3 p-3 bg-white border rounded-lg hover:border-primary hover:bg-accent transition-colors text-left group"
                >
                  <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center group-hover:bg-accent">
                    <q.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{q.text}</p>
                    <p className="text-xs text-slate-500">{q.category}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-primary" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me about PTO, payroll, benefits, policies..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-primary hover:bg-primary/90"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
          <p className="text-xs text-center text-slate-400 mt-2">
            AI responses are for informational purposes. Always verify important details with HR.
          </p>
        </div>
      </Card>
    </div>
  )
}
