import React, { useState } from 'react'
import { geminiService } from '../services/geminiService'
import { WorkoutEntry, Exercise, Language } from '../types'
import { translations } from '../translations'
import { Sparkles, MessageSquare, Loader2, Send, BrainCircuit } from 'lucide-react'

interface AICoachProps {
  logs: WorkoutEntry[]
  exercises: Exercise[]
  language: Language
}

const AICoach: React.FC<AICoachProps> = ({ logs, exercises, language }) => {
  const t = translations[language]
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')
  const [chatResponse, setChatResponse] = useState<string | null>(null)

  const handleFullAnalysis = async () => {
    setLoading(true)
    // Modified to pass language for prompt instructions
    const result = await geminiService.analyzePerformance(logs, exercises, language)
    setAnalysis(result)
    setLoading(false)
  }

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    const result = await geminiService.getWorkoutAdvice(query, logs, exercises, language)
    setChatResponse(result)
    setLoading(false)
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 mx-auto max-w-4xl space-y-8 duration-500">
      <header className="text-center">
        <div className="mb-4 inline-flex rounded-full bg-indigo-100 p-3 text-indigo-600">
          <Sparkles size={32} />
        </div>
        <h2 className="text-3xl font-black text-slate-900">{t.titan_ai_coach}</h2>
        <p className="mt-2 text-slate-500">{t.coach_desc}</p>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 p-8 text-white shadow-xl shadow-indigo-200">
          <BrainCircuit className="mb-4 opacity-80" size={40} />
          <h3 className="mb-2 text-2xl font-bold">{t.weekly_deep_dive}</h3>
          <p className="mb-6 text-sm leading-relaxed text-indigo-100">{t.deep_dive_desc}</p>
          <button
            onClick={handleFullAnalysis}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-3 font-bold text-indigo-600 transition-colors hover:bg-indigo-50 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
            {t.generate_analysis}
          </button>
        </div>

        <div className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <MessageSquare className="mb-4 text-emerald-500" size={40} />
          <h3 className="mb-2 text-2xl font-bold text-slate-900">{t.ask_expert}</h3>
          <p className="mb-6 text-sm text-slate-500">{t.ask_desc}</p>

          <form onSubmit={handleChat} className="relative mt-auto">
            <input
              id="ai-coach-query"
              type="text"
              aria-label="Ask AI Coach"
              placeholder={t.ask_anything}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-4 pr-12 pl-4 outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded-xl bg-indigo-600 p-2 text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>

      {(analysis || chatResponse) && (
        <div className="prose prose-indigo max-w-none rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
          <div className="mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
            <Sparkles className="text-indigo-600" size={20} />
            <h3 className="m-0 text-xl font-bold text-slate-900">{t.ai_insight}</h3>
          </div>
          <div className="leading-relaxed whitespace-pre-wrap text-slate-700">
            {analysis || chatResponse}
          </div>
          <div className="mt-8 border-t border-slate-100 pt-6 text-center">
            <button
              onClick={() => {
                setAnalysis(null)
                setChatResponse(null)
              }}
              className="text-sm font-bold text-slate-400 hover:text-slate-600"
            >
              {t.clear_insights}
            </button>
          </div>
        </div>
      )}

      {loading && !analysis && !chatResponse && (
        <div className="flex flex-col items-center justify-center space-y-4 py-20">
          <Loader2 className="animate-spin text-indigo-600" size={48} />
          <p className="font-medium text-slate-500">{t.processing}</p>
        </div>
      )}
    </div>
  )
}

export default AICoach
