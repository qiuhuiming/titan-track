import type { Session, User } from '@supabase/supabase-js'
import {
  Activity,
  AlertCircle,
  Bot,
  CalendarDays,
  Dumbbell,
  Globe,
  LayoutDashboard,
  Loader2,
  LogIn,
  LogOut,
  PlusCircle,
  RefreshCw,
  Settings,
  Sparkles,
  X,
} from 'lucide-react'
import type { FC } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import AICoach from './components/AICoach'
import AISettingsModal from './components/AISettingsModal'
import Dashboard from './components/Dashboard'
import ExerciseManager from './components/ExerciseManager'
import PlanManager from './components/PlanManager'
import WorkoutLog from './components/WorkoutLog'
import { authService } from './services/authService'
import { dataService } from './services/dataService'
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
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isExerciseManagerOpen, setIsExerciseManagerOpen] = useState(false)
  const [isAISettingsOpen, setIsAISettingsOpen] = useState(false)
  const [aiSettings, setAISettings] = useState<AISettings | null>(null)
  const desktopSettingsRef = useRef<HTMLDivElement | null>(null)
  const mobileSettingsRef = useRef<HTMLDivElement | null>(null)

  // Auth state
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  const t = translations[language]

  // Load data from API
  const loadData = useCallback(async () => {
    if (!session) {
      setExercises([])
      setLogs([])
      setPlans([])
      setIsLoading(false)
      return
    }

    try {
      setError(null)
      const data = await dataService.fetchAllData()
      setExercises(data.exercises)
      setPlans(data.plans)
      setLogs(data.entries)
    } catch (err) {
      console.error('Failed to load data:', err)
      setError('Failed to load data. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [session])

  // Refresh data
  const handleRefresh = useCallback(async () => {
    if (!session || isRefreshing) return
    setIsRefreshing(true)
    try {
      const data = await dataService.fetchAllData()
      setExercises(data.exercises)
      setPlans(data.plans)
      setLogs(data.entries)
      setError(null)
    } catch (err) {
      console.error('Failed to refresh data:', err)
      setError('Failed to refresh data.')
    } finally {
      setIsRefreshing(false)
    }
  }, [session, isRefreshing])

  // Initial auth check
  useEffect(() => {
    void authService.getSession().then(({ data }) => {
      setSession(data.session)
      setUser(data.session?.user ?? null)
      setAuthLoading(false)
    })

    const { data } = authService.onAuthStateChange((newSession) => {
      setSession(newSession)
      setUser(newSession?.user ?? null)
      setAuthLoading(false)
    })

    return () => {
      data.subscription.unsubscribe()
    }
  }, [])

  // Load data when session changes
  useEffect(() => {
    if (!authLoading) {
      setIsLoading(true)
      void loadData()
    }
  }, [session, authLoading, loadData])

  // Load local preferences
  useEffect(() => {
    setAISettings(storageService.getAISettings())
    const savedLang = storageService.getLanguage()
    setLanguage(savedLang)
  }, [])

  // Escape key and click outside for settings
  useEffect(() => {
    if (!isSettingsOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsSettingsOpen(false)
    }

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      const isInsideDesktop = desktopSettingsRef.current?.contains(target)
      const isInsideMobile = mobileSettingsRef.current?.contains(target)
      if (!isInsideDesktop && !isInsideMobile) {
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
    storageService.saveLanguage(nextLang)
  }

  const handleLogin = () => {
    setIsSettingsOpen(false)
    void authService.signInWithGoogle()
  }

  const handleLogout = () => {
    setIsSettingsOpen(false)
    storageService.clearLegacyData()
    void authService.signOut()
  }

  // Exercise CRUD handlers
  const handleCreateExercise = async (exercise: Exercise) => {
    try {
      const created = await dataService.createExercise(exercise)
      setExercises((prev) => [...prev, created])
    } catch (err) {
      console.error('Failed to create exercise:', err)
      throw err
    }
  }

  const handleUpdateExercise = async (id: string, updates: Partial<Omit<Exercise, 'id'>>) => {
    try {
      const updated = await dataService.updateExercise(id, updates)
      setExercises((prev) => prev.map((e) => (e.id === id ? updated : e)))
    } catch (err) {
      console.error('Failed to update exercise:', err)
      throw err
    }
  }

  const handleDeleteExercise = async (id: string) => {
    try {
      await dataService.deleteExercise(id)
      setExercises((prev) => prev.filter((e) => e.id !== id))
    } catch (err) {
      console.error('Failed to delete exercise:', err)
      throw err
    }
  }

  // Plan CRUD handlers
  const handleCreatePlan = async (plan: WorkoutPlan) => {
    try {
      const created = await dataService.createPlan(plan)
      setPlans((prev) => [...prev, created])
    } catch (err) {
      console.error('Failed to create plan:', err)
      throw err
    }
  }

  const handleUpdatePlan = async (id: string, updates: Partial<Omit<WorkoutPlan, 'id'>>) => {
    try {
      const updated = await dataService.updatePlan(id, updates)
      setPlans((prev) => prev.map((p) => (p.id === id ? updated : p)))
    } catch (err) {
      console.error('Failed to update plan:', err)
      throw err
    }
  }

  const handleDeletePlan = async (id: string) => {
    try {
      await dataService.deletePlan(id)
      setPlans((prev) => prev.filter((p) => p.id !== id))
    } catch (err) {
      console.error('Failed to delete plan:', err)
      throw err
    }
  }

  // Entry CRUD handlers
  const handleCreateEntry = async (entry: WorkoutEntry) => {
    try {
      const created = await dataService.createEntry(entry)
      setLogs((prev) => [...prev, created])
    } catch (err) {
      console.error('Failed to create entry:', err)
      throw err
    }
  }

  const handleUpdateEntry = async (id: string, updates: Partial<Omit<WorkoutEntry, 'id'>>) => {
    try {
      const updated = await dataService.updateEntry(id, updates)
      setLogs((prev) => prev.map((e) => (e.id === id ? updated : e)))
    } catch (err) {
      console.error('Failed to update entry:', err)
      throw err
    }
  }

  const handleDeleteEntry = async (id: string) => {
    try {
      await dataService.deleteEntry(id)
      setLogs((prev) => prev.filter((e) => e.id !== id))
    } catch (err) {
      console.error('Failed to delete entry:', err)
      throw err
    }
  }

  const handleCloseExerciseManager = () => {
    setIsExerciseManagerOpen(false)
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

  // Auth loading state
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
          <p className="text-sm font-bold tracking-widest text-slate-400 uppercase">Loading...</p>
        </div>
      </div>
    )
  }

  // Require login
  if (!session && authService.isConfigured()) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-white p-6">
        <div className="mb-8 flex items-center space-x-3">
          <div className="rounded-xl bg-indigo-600 p-3 shadow-lg shadow-indigo-200">
            <Activity className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase italic">
            Titan<span className="text-indigo-600">Track</span>
          </h1>
        </div>
        <div className="w-full max-w-sm rounded-3xl border border-slate-100 bg-white p-8 shadow-xl">
          <h2 className="mb-2 text-center text-xl font-bold text-slate-900">Welcome Back</h2>
          <p className="mb-6 text-center text-sm text-slate-500">Sign in to access your workouts</p>
          <button
            type="button"
            onClick={handleLogin}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-indigo-600 py-3 font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 hover:shadow-xl active:scale-[0.98]"
          >
            <LogIn size={20} />
            Sign in with Google
          </button>
        </div>
        <button
          type="button"
          onClick={handleLanguageToggle}
          className="mt-6 flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700"
        >
          <Globe size={16} />
          {language === 'zh' ? 'English' : '中文'}
        </button>
      </div>
    )
  }

  // Data loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
          <p className="text-sm font-bold tracking-widest text-slate-400 uppercase">
            Loading your data...
          </p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white p-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-12 w-12 text-rose-500" />
          <h2 className="text-lg font-bold text-slate-900">Something went wrong</h2>
          <p className="text-sm text-slate-500">{error}</p>
          <button
            type="button"
            onClick={() => void loadData()}
            className="mt-4 flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white shadow-lg transition-all hover:bg-indigo-700"
          >
            <RefreshCw size={18} />
            Try Again
          </button>
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

        <div className="mt-auto space-y-2">
          <button
            type="button"
            onClick={handleLanguageToggle}
            className="flex w-full items-center space-x-3 rounded-xl px-4 py-3 text-slate-600 transition-colors hover:bg-slate-100"
          >
            <Globe size={20} />
            <span className="font-medium">{language === 'zh' ? 'English' : '中文'}</span>
          </button>

          {/* Settings button with dropdown for desktop */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsSettingsOpen((prev) => !prev)
              }}
              className={`flex w-full items-center space-x-3 rounded-xl px-4 py-3 transition-colors ${
                isSettingsOpen ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Settings size={20} />
              <span className="font-medium">{t.settings}</span>
            </button>

            {isSettingsOpen && (
              <div
                ref={desktopSettingsRef}
                className="animate-in zoom-in-95 fade-in absolute bottom-full left-0 z-50 mb-2 w-full rounded-2xl border border-slate-100 bg-white p-2 shadow-2xl duration-200"
              >
                {/* Auth buttons */}
                {authService.isConfigured() && user && (
                  <>
                    <div className="truncate px-3 py-2 text-xs text-slate-500">{user.email}</div>
                    <button
                      type="button"
                      onClick={() => void handleRefresh()}
                      disabled={isRefreshing}
                      className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-700 transition-all hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-50"
                    >
                      <RefreshCw
                        size={18}
                        className={`text-emerald-500 ${isRefreshing ? 'animate-spin' : ''}`}
                      />
                      <span>{isRefreshing ? 'Refreshing...' : 'Refresh Data'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-700 transition-all hover:bg-slate-100"
                    >
                      <LogOut size={18} className="text-slate-400" />
                      <span>Sign Out</span>
                    </button>
                    <div className="my-2 border-t border-slate-100" />
                  </>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setIsSettingsOpen(false)
                    setIsAISettingsOpen(true)
                  }}
                  className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-700 transition-all hover:bg-indigo-50 hover:text-indigo-600"
                >
                  <Bot size={18} className="text-indigo-500" />
                  <span>{t.ai_settings}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsSettingsOpen(false)
                    setIsExerciseManagerOpen(true)
                  }}
                  className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-700 transition-all hover:bg-indigo-50 hover:text-indigo-600"
                >
                  <Dumbbell size={18} className="text-indigo-500" />
                  <span>{t.manage_exercises}</span>
                </button>
              </div>
            )}
          </div>
        </div>
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
          <div ref={mobileSettingsRef} className="relative">
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

                {/* Auth buttons */}
                {authService.isConfigured() && user && (
                  <>
                    <div className="truncate px-3 py-2 text-[10px] text-slate-500">
                      {user.email}
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleRefresh()}
                      disabled={isRefreshing}
                      className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-black text-slate-700 transition-all hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-50"
                    >
                      <RefreshCw
                        size={18}
                        className={`text-emerald-500 group-hover:text-emerald-600 ${isRefreshing ? 'animate-spin' : ''}`}
                      />
                      <span className="text-[11px] tracking-widest uppercase">
                        {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-black text-slate-700 transition-all hover:bg-slate-100"
                    >
                      <LogOut size={18} className="text-slate-400" />
                      <span className="text-[11px] tracking-widest uppercase">Sign Out</span>
                    </button>
                    <div className="my-2 border-t border-slate-100" />
                  </>
                )}

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
              exercises={exercises}
              plans={plans}
              language={language}
              onCreateEntry={handleCreateEntry}
              onUpdateEntry={handleUpdateEntry}
              onDeleteEntry={handleDeleteEntry}
              onUpdatePlan={handleUpdatePlan}
            />
          )}
          {activeTab === TabType.PLAN && (
            <PlanManager
              plans={plans}
              exercises={exercises}
              language={language}
              initialParams={activeTabParams}
              onCreatePlan={handleCreatePlan}
              onUpdatePlan={handleUpdatePlan}
              onDeletePlan={handleDeletePlan}
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
                language={language}
                onCreateExercise={handleCreateExercise}
                onUpdateExercise={handleUpdateExercise}
                onDeleteExercise={handleDeleteExercise}
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
