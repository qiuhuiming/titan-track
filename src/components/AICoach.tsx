import React, { useState, useRef, useEffect } from 'react'
import { getAIResponse } from '../services/aiService'
import type { WorkoutEntry, Exercise, Language, AISettings, AIRequestMessage } from '../types'
import { translations } from '../translations'
import { MessageSquare, Loader2, Send, Settings, AlertCircle } from 'lucide-react'

interface AICoachProps {
  logs: WorkoutEntry[]
  exercises: Exercise[]
  language: Language
  aiSettings: AISettings | null
  onOpenSettings: () => void
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const AICoach: React.FC<AICoachProps> = ({
  logs,
  exercises,
  language,
  aiSettings,
  onOpenSettings,
}) => {
  const t = translations[language]
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim() || !aiSettings || loading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: query.trim(),
    }

    setMessages((prev) => [...prev, userMessage])
    setQuery('')
    setLoading(true)

    try {
      const summary = `Total workouts: ${String(logs.length)}. Common exercises: ${exercises
        .slice(0, 3)
        .map((ex) => ex.name)
        .join(', ')}.`
      const langInstruction =
        language === 'zh' ? '请用中文简短地回答。' : 'Respond concisely in English.'

      const systemPrompt = `You are a world-class fitness coach. Give concise, science-based advice.
User Training Summary: ${summary}
${langInstruction}`

      // Build full message history for multi-turn conversation
      const apiMessages: AIRequestMessage[] = [
        ...messages.map((msg) => ({ role: msg.role, content: msg.content })),
        { role: 'user' as const, content: userMessage.content },
      ]

      const result = await getAIResponse(aiSettings, systemPrompt, apiMessages)

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error('Failed to get workout advice:', error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: language === 'zh' ? '连接 AI 教练出错。' : 'Error connecting to AI coach.',
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  // Show configuration prompt if AI is not configured
  if (!aiSettings) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8">
        <div className="max-w-md rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto mb-4 text-amber-500" size={48} />
          <h3 className="mb-2 text-xl font-bold text-slate-900">{t.no_ai_configured}</h3>
          <p className="mb-6 text-sm text-slate-600">{t.configure_ai_hint}</p>
          <button
            onClick={onOpenSettings}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white transition-colors hover:bg-indigo-700"
          >
            <Settings size={20} />
            {t.ai_settings}
          </button>
        </div>
      </div>
    )
  }

  const providerLabel = aiSettings.provider.charAt(0).toUpperCase() + aiSettings.provider.slice(1)

  return (
    <div className="flex h-full flex-col">
      {/* Header - minimal */}
      <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-sm font-medium text-slate-700">
            {providerLabel} - {aiSettings.model}
          </span>
        </div>
        <button
          onClick={onOpenSettings}
          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          aria-label="AI Settings"
        >
          <Settings size={20} />
        </button>
      </header>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-slate-400">
            <MessageSquare size={48} className="mb-4 opacity-50" />
            <p className="text-sm">{t.ask_anything}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'rounded-br-md bg-indigo-600 text-white'
                      : 'rounded-bl-md bg-slate-100 text-slate-800'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-slate-100 px-4 py-3 text-slate-500">
                  <Loader2 size={16} className="animate-spin" />
                  <span className="text-sm">{t.processing}</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input bar */}
      <form
        onSubmit={(e) => {
          void handleSend(e)
        }}
        className="flex gap-2 border-t border-slate-200 p-4"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
          }}
          placeholder={t.ask_anything}
          disabled={loading}
          className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="rounded-xl bg-indigo-600 px-4 py-3 text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  )
}

export default AICoach
