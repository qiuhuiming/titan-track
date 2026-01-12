import {
  Activity,
  Bot,
  CalendarDays,
  Dumbbell,
  Globe,
  LayoutDashboard,
  Loader2,
  PlusCircle,
  Settings,
  Sparkles,
  X,
} from 'lucide-react'
import type { FC } from 'react'
import { useEffect, useRef, useState } from 'react'
import AICoach from './components/AICoach'
import AISettingsModal from './components/AISettingsModal'
import Dashboard from './components/Dashboard'
import ExerciseManager from './components/ExerciseManager'
import PlanManager from './components/PlanManager'
import WorkoutLog from './components/WorkoutLog'
import { INITIAL_EXERCISES } from './constants'
import { storageService } from './services/storageService'
import { translations } from './translations'
import {
  type AISettings,
  type Exercise,
  type Language,
  type NavigationParams,
  TabType,
  type WorkoutEntry,
  type WorkoutPlan,
} from './types'

const App: FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>(TabType.DASHBOARD)
  const [activeTabParams, setActiveTabParams] = useState<NavigationParams | null>(null)
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [logs, setLogs] = useState<WorkoutEntry[]>([])
  const [plans, setPlans] = useState<WorkoutPlan[]>([])
  const [language, setLanguage] = useState<Language>('zh')
  const [isLoading, setIsLoading] = useState(true)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isExerciseManagerOpen, setIsExerciseManagerOpen] = useState(false)
  const [isAISettingsOpen, setIsAISettingsOpen] = useState(false)
  const [aiSettings, setAISettings] = useState<AISettings | null>(null)
  const settingsRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    try {
      setIsLoading(true)
      setExercises(storageService.getExercises())
      setLogs(storageService.getLogs())
      setPlans(storageService.getPlans())
      setAISettings(storageService.getAISettings())
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setIsLoading(false)
    }

    const savedLang = localStorage.getItem('titan_track_lang')
    if (savedLang === 'zh' || savedLang === 'en') setLanguage(savedLang)
  }, [])

  useEffect(() => {
    if (!isSettingsOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsSettingsOpen(false)
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isSettingsOpen])

  useEffect(() => {
    if (!isExerciseManagerOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsExerciseManagerOpen(false)
    }

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = originalOverflow
    }
  }, [isExerciseManagerOpen])

  const handleLanguageToggle = () => {
    const nextLang = language === 'zh' ? 'en' : 'zh'
    setLanguage(nextLang)
    localStorage.setItem('titan_track_lang', nextLang)
  }

  const t = translations[language]

  const handleClearAllData = () => {
    if (!window.confirm(t.confirm_clear_all)) return

    try {
      storageService.saveExercises(INITIAL_EXERCISES)
      storageService.saveLogs([])
      storageService.savePlans([])
      setExercises(INITIAL_EXERCISES)
      setLogs([])
      setPlans([])
    } catch (error) {
      console.error('Failed to clear data:', error)
    } finally {
      setIsSettingsOpen(false)
    }
  }

  const handleUpdateExercises = (newExercises: Exercise[]) => {
    setExercises(newExercises)
    storageService.saveExercises(newExercises)
  }

  const handleCloseExerciseManager = () => {
    setIsExerciseManagerOpen(false)
  }

  const handleUpdateLogs = (newLogs: WorkoutEntry[]) => {
    setLogs(newLogs)
    storageService.saveLogs(newLogs)
  }

  const handleUpdatePlans = (newPlans: WorkoutPlan[]) => {
    setPlans(newPlans)
    storageService.savePlans(newPlans)
  }

  const handleSaveAISettings = (newSettings: AISettings) => {
    setAISettings(newSettings)
    storageService.saveAISettings(newSettings)
  }

  const navigateToTab = (tab: TabType, params: NavigationParams | null = null) => {
    setActiveTab(tab)
    setActiveTabParams(params)
  }

  const tabs = [
    { id: TabType.DASHBOARD, label: t.home, icon: LayoutDashboard },
    { id: TabType.WORKOUT_LOG, label: t.log, icon: PlusCircle },
    { id: TabType.PLAN, label: t.plan, icon: CalendarDays },
    { id: TabType.AI_COACH, label: t.ai_coach, icon: Sparkles },
  ]

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
          <p className="text-sm font-bold tracking-widest text-slate-400 uppercase">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white md:flex-row md:bg-slate-50">
      <aside
        className={`sticky top-0 hidden h-screen w-72 flex-col border-r border-slate-200 bg-white p-6 md:flex ${isExerciseManagerOpen ? 'pointer-events-none opacity-50' : ''}`}
      >
        <div className="mb-10 flex items-center space-x-2">
          <Activity className="text-indigo-600" size={32} />
          <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase italic">
            Titan<span className="text-indigo-600">Track</span>
          </h1>
        </div>

        <nav className="flex-grow space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                navigateToTab(tab.id)
              }}
              className={`flex w-full items-center space-x-3 rounded-xl px-4 py-3 transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <tab.icon size={20} />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </nav>

        <button
          type="button"
          onClick={handleLanguageToggle}
          className="mt-auto flex items-center space-x-3 rounded-xl px-4 py-3 text-slate-600 transition-colors hover:bg-slate-100"
        >
          <Globe size={20} />
          <span className="font-medium">{language === 'zh' ? 'English' : '中文'}</span>
        </button>
      </aside>

      <header
        className={`pt-safe sticky top-0 z-40 flex items-center justify-between border-b border-slate-100 bg-white/80 px-6 py-4 shadow-sm shadow-slate-200/20 backdrop-blur-xl md:hidden ${isExerciseManagerOpen ? 'pointer-events-none opacity-50' : ''}`}
      >
        <div className="flex items-center space-x-2">
          <div className="rounded-lg bg-indigo-600 p-1.5 shadow-lg shadow-indigo-100">
            <Activity className="text-white" size={20} />
          </div>
          <span className="text-xl font-black tracking-tighter text-slate-900 uppercase italic">
            Titan<span className="text-indigo-600">Track</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleLanguageToggle}
            className="rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-[10px] font-black tracking-widest text-indigo-600 uppercase transition-transform active:scale-95"
          >
            {language === 'zh' ? 'EN' : '中文'}
          </button>
          <div ref={settingsRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setIsSettingsOpen((prev) => !prev)
              }}
              className="p-2 text-slate-400 transition-colors hover:text-slate-600"
              aria-haspopup="true"
              aria-expanded={isSettingsOpen}
            >
              <Settings size={22} />
            </button>
            {isSettingsOpen && (
              <div className="animate-in zoom-in-95 fade-in absolute right-0 z-50 mt-3 w-60 origin-top-right rounded-2xl border border-slate-100 bg-white/90 p-2 shadow-2xl backdrop-blur-lg duration-200">
                <div className="px-3 pt-2 pb-1 text-[11px] font-black tracking-[0.2em] text-slate-400 uppercase">
                  {t.settings}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsSettingsOpen(false)
                    setIsAISettingsOpen(true)
                  }}
                  className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-black text-slate-700 transition-all hover:bg-indigo-50 hover:text-indigo-600"
                >
                  <Bot size={18} className="text-indigo-500 group-hover:text-indigo-600" />
                  <span className="text-[11px] tracking-widest uppercase">{t.ai_settings}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsSettingsOpen(false)
                    setIsExerciseManagerOpen(true)
                  }}
                  className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-black text-slate-700 transition-all hover:bg-indigo-50 hover:text-indigo-600"
                >
                  <Dumbbell size={18} className="text-indigo-500 group-hover:text-indigo-600" />
                  <span className="text-[11px] tracking-widest uppercase">
                    {t.manage_exercises}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleClearAllData}
                  className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-black text-rose-600 transition-all hover:bg-rose-50"
                >
                  {t.clear_all_data}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto p-4 pb-[calc(70px+env(safe-area-inset-bottom))] md:p-8 md:pb-0 lg:p-12">
        <div className="mx-auto max-w-5xl">
          {activeTab === TabType.DASHBOARD && (
            <Dashboard
              logs={logs}
              exercises={exercises}
              plans={plans}
              language={language}
              onNavigate={navigateToTab}
            />
          )}
          {activeTab === TabType.WORKOUT_LOG && (
            <WorkoutLog
              logs={logs}
              onUpdateLogs={handleUpdateLogs}
              exercises={exercises}
              plans={plans}
              onUpdatePlans={handleUpdatePlans}
              language={language}
            />
          )}
          {activeTab === TabType.PLAN && (
            <PlanManager
              plans={plans}
              exercises={exercises}
              onUpdatePlans={handleUpdatePlans}
              language={language}
              initialParams={activeTabParams}
            />
          )}
          {activeTab === TabType.AI_COACH && (
            <AICoach
              logs={logs}
              exercises={exercises}
              language={language}
              aiSettings={aiSettings}
              onOpenSettings={() => {
                setIsAISettingsOpen(true)
              }}
            />
          )}
        </div>
      </main>

      {isExerciseManagerOpen && (
        <div className="fixed relative inset-0 z-[60] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <button
            type="button"
            className="absolute inset-0"
            onClick={handleCloseExerciseManager}
            aria-label={t.close}
          />
          <div
            role="dialog"
            aria-modal="true"
            className="animate-in zoom-in-95 relative z-10 flex max-h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white shadow-2xl duration-200"
          >
            <button
              type="button"
              onClick={handleCloseExerciseManager}
              className="absolute top-4 right-4 z-10 rounded-xl p-2 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-500"
              aria-label={t.close}
            >
              <X size={18} />
            </button>
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              <ExerciseManager
                exercises={exercises}
                onUpdateExercises={handleUpdateExercises}
                language={language}
              />
            </div>
          </div>
        </div>
      )}

      <AISettingsModal
        isOpen={isAISettingsOpen}
        onClose={() => {
          setIsAISettingsOpen(false)
        }}
        settings={aiSettings}
        onSave={handleSaveAISettings}
        language={language}
      />

      <nav
        className={`fixed right-0 bottom-0 left-0 z-50 flex items-center justify-between border-t border-slate-200 bg-white/90 px-6 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))] shadow-[0_-4px_12px_rgba(0,0,0,0.03)] backdrop-blur-xl transition md:hidden ${isExerciseManagerOpen ? 'pointer-events-none opacity-40 blur-[1px]' : ''}`}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              navigateToTab(tab.id)
            }}
            disabled={isExerciseManagerOpen}
            aria-disabled={isExerciseManagerOpen}
            className={`relative flex flex-col items-center space-y-1 transition-colors duration-300 ${
              activeTab === tab.id ? 'text-indigo-600' : 'text-slate-400'
            }`}
          >
            <div
              className={`rounded-full p-1.5 transition-all duration-300 ${activeTab === tab.id ? 'scale-110' : 'scale-100'}`}
            >
              <tab.icon size={24} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
            </div>
            <span
              className={`text-[10px] font-bold tracking-widest uppercase ${activeTab === tab.id ? 'opacity-100' : 'opacity-60'}`}
            >
              {tab.label}
            </span>
            {activeTab === tab.id && (
              <span className="absolute -top-1 h-1 w-1 animate-pulse rounded-full bg-indigo-600" />
            )}
          </button>
        ))}
      </nav>
    </div>
  )
}

export default App
