
import React, { useState } from 'react';
import { geminiService } from '../services/geminiService';
import { WorkoutEntry, Exercise, Language } from '../types';
import { translations } from '../translations';
import { Sparkles, MessageSquare, Loader2, Send, BrainCircuit } from 'lucide-react';

interface AICoachProps {
  logs: WorkoutEntry[];
  exercises: Exercise[];
  language: Language;
}

const AICoach: React.FC<AICoachProps> = ({ logs, exercises, language }) => {
  const t = translations[language];
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [chatResponse, setChatResponse] = useState<string | null>(null);

  const handleFullAnalysis = async () => {
    setLoading(true);
    // Modified to pass language for prompt instructions
    const result = await geminiService.analyzePerformance(logs, exercises, language);
    setAnalysis(result);
    setLoading(false);
  };

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    const result = await geminiService.getWorkoutAdvice(query, logs, exercises, language);
    setChatResponse(result);
    setLoading(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <header className="text-center">
        <div className="inline-flex p-3 bg-indigo-100 rounded-full text-indigo-600 mb-4">
          <Sparkles size={32} />
        </div>
        <h2 className="text-3xl font-black text-slate-900">{t.titan_ai_coach}</h2>
        <p className="text-slate-500 mt-2">{t.coach_desc}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-3xl text-white shadow-xl shadow-indigo-200">
          <BrainCircuit className="mb-4 opacity-80" size={40} />
          <h3 className="text-2xl font-bold mb-2">{t.weekly_deep_dive}</h3>
          <p className="text-indigo-100 mb-6 text-sm leading-relaxed">{t.deep_dive_desc}</p>
          <button 
            onClick={handleFullAnalysis}
            disabled={loading}
            className="w-full bg-white text-indigo-600 font-bold py-3 rounded-2xl hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
            {t.generate_analysis}
          </button>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col h-full">
          <MessageSquare className="mb-4 text-emerald-500" size={40} />
          <h3 className="text-2xl font-bold mb-2 text-slate-900">{t.ask_expert}</h3>
          <p className="text-slate-500 mb-6 text-sm">{t.ask_desc}</p>
          
          <form onSubmit={handleChat} className="mt-auto relative">
            <input 
              type="text" 
              placeholder={t.ask_anything}
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full pl-4 pr-12 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50"
            />
            <button 
              type="submit"
              disabled={loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>

      {(analysis || chatResponse) && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-lg prose max-w-none prose-indigo">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
            <Sparkles className="text-indigo-600" size={20} />
            <h3 className="text-xl font-bold text-slate-900 m-0">{t.ai_insight}</h3>
          </div>
          <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">
            {analysis || chatResponse}
          </div>
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <button onClick={() => { setAnalysis(null); setChatResponse(null); }} className="text-sm font-bold text-slate-400 hover:text-slate-600">
              {t.clear_insights}
            </button>
          </div>
        </div>
      )}

      {loading && !analysis && !chatResponse && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="animate-spin text-indigo-600" size={48} />
          <p className="text-slate-500 font-medium">{t.processing}</p>
        </div>
      )}
    </div>
  );
};

export default AICoach;
