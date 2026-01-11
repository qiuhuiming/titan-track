import {
  Activity,
  CalendarDays,
  Dumbbell,
  Globe,
  LayoutDashboard,
  Loader2,
  PlusCircle,
  Settings,
  Sparkles,
  X,
} from 'lucide-react';
import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';
import AICoach from './components/AICoach';
import Dashboard from './components/Dashboard';
import ExerciseManager from './components/ExerciseManager';
import PlanManager from './components/PlanManager';
import WorkoutLog from './components/WorkoutLog';
import { INITIAL_EXERCISES } from './constants';
import { tauriStorageService } from './services/tauriStorageService';
import { translations } from './translations';
import { type Exercise, type Language, type NavigationParams, TabType, type WorkoutEntry, type WorkoutPlan } from './types';

const App: FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>(TabType.DASHBOARD);
  const [activeTabParams, setActiveTabParams] = useState<NavigationParams | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [logs, setLogs] = useState<WorkoutEntry[]>([]);
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [language, setLanguage] = useState<Language>('zh');
  const [isLoading, setIsLoading] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExerciseManagerOpen, setIsExerciseManagerOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [loadedExercises, loadedLogs, loadedPlans] = await Promise.all([
          tauriStorageService.getExercises(),
          tauriStorageService.getLogs(),
          tauriStorageService.getPlans(),
        ]);
        setExercises(loadedExercises);
        setLogs(loadedLogs);
        setPlans(loadedPlans);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    const savedLang = localStorage.getItem('titan_track_lang') as Language;
    if (savedLang) setLanguage(savedLang);
  }, []);

  useEffect(() => {
    if (!isSettingsOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsSettingsOpen(false);
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSettingsOpen]);

  useEffect(() => {
    if (!isExerciseManagerOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsExerciseManagerOpen(false);
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isExerciseManagerOpen]);

  const handleLanguageToggle = () => {
    const nextLang = language === 'zh' ? 'en' : 'zh';
    setLanguage(nextLang);
    localStorage.setItem('titan_track_lang', nextLang);
  };

  const t = translations[language];

  const handleClearAllData = async () => {
    if (!window.confirm(t.confirm_clear_all)) return;

    try {
      await Promise.all([
        tauriStorageService.saveExercises(INITIAL_EXERCISES),
        tauriStorageService.saveLogs([]),
        tauriStorageService.savePlans([])
      ]);
      setExercises(INITIAL_EXERCISES);
      setLogs([]);
      setPlans([]);
    } catch (error) {
      console.error('Failed to clear data:', error);
    } finally {
      setIsSettingsOpen(false);
    }
  };

  const handleUpdateExercises = async (newExercises: Exercise[]) => {
    setExercises(newExercises);
    try {
      await tauriStorageService.saveExercises(newExercises);
    } catch (error) {
      console.error('Failed to save exercises:', error);
    }
  };

  const handleCloseExerciseManager = () => {
    setIsExerciseManagerOpen(false);
  };

  const handleUpdateLogs = async (newLogs: WorkoutEntry[]) => {
    setLogs(newLogs);
    try {
      await tauriStorageService.saveLogs(newLogs);
    } catch (error) {
      console.error('Failed to save logs:', error);
    }
  };

  const handleUpdatePlans = async (newPlans: WorkoutPlan[]) => {
    setPlans(newPlans);
    try {
      await tauriStorageService.savePlans(newPlans);
    } catch (error) {
      console.error('Failed to save plans:', error);
    }
  };

  const navigateToTab = (tab: TabType, params: NavigationParams | null = null) => {
    setActiveTab(tab);
    setActiveTabParams(params);
  };

  const tabs = [
    { id: TabType.DASHBOARD, label: t.home, icon: LayoutDashboard },
    { id: TabType.WORKOUT_LOG, label: t.log, icon: PlusCircle },
    { id: TabType.PLAN, label: t.plan, icon: CalendarDays },
    { id: TabType.AI_COACH, label: t.ai_coach, icon: Sparkles },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white md:bg-slate-50 flex flex-col md:flex-row overflow-hidden">
      
      <aside className={`hidden md:flex w-72 bg-white border-r border-slate-200 p-6 flex-col h-screen sticky top-0 ${isExerciseManagerOpen ? 'pointer-events-none opacity-50' : ''}`}>
        <div className="flex items-center space-x-2 mb-10">
          <Activity className="text-indigo-600" size={32} />
          <h1 className="text-2xl font-black tracking-tight text-slate-900 italic uppercase">Titan<span className="text-indigo-600">Track</span></h1>
        </div>

        <nav className="space-y-2 flex-grow">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => navigateToTab(tab.id)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 w-full ${
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
          className="mt-auto flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <Globe size={20} />
          <span className="font-medium">{language === 'zh' ? 'English' : '中文'}</span>
        </button>
      </aside>

      <header className={`md:hidden pt-safe sticky top-0 bg-white/80 backdrop-blur-xl z-40 px-6 py-4 flex items-center justify-between border-b border-slate-100 shadow-sm shadow-slate-200/20 ${isExerciseManagerOpen ? 'pointer-events-none opacity-50' : ''}`}>
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-100">
            <Activity className="text-white" size={20} />
          </div>
          <span className="text-xl font-black tracking-tighter text-slate-900 uppercase italic">Titan<span className="text-indigo-600">Track</span></span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={handleLanguageToggle} 
            className="px-3 py-1.5 text-indigo-600 bg-indigo-50 rounded-xl text-[10px] font-black uppercase tracking-widest border border-indigo-100 active:scale-95 transition-transform"
          >
            {language === 'zh' ? 'EN' : '中文'}
          </button>
          <div ref={settingsRef} className="relative">
            <button
              type="button"
              onClick={() => setIsSettingsOpen((prev) => !prev)}
              className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
              aria-haspopup="true"
              aria-expanded={isSettingsOpen}
            >
              <Settings size={22} />
            </button>
            {isSettingsOpen && (
              <div className="absolute right-0 mt-3 w-60 rounded-2xl border border-slate-100 bg-white/90 backdrop-blur-lg shadow-2xl p-2 z-50 animate-in zoom-in-95 fade-in duration-200 origin-top-right">
                <div className="px-3 pt-2 pb-1 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                  {t.settings}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsSettingsOpen(false);
                    setIsExerciseManagerOpen(true);
                  }}
                  className="group flex items-center gap-3 w-full px-3 py-3 rounded-xl text-sm font-black text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                >
                  <Dumbbell size={18} className="text-indigo-500 group-hover:text-indigo-600" />
                  <span className="uppercase tracking-widest text-[11px]">{t.manage_exercises}</span>
                </button>
                <button
                  type="button"
                  onClick={handleClearAllData}
                  className="group flex items-center gap-3 w-full px-3 py-3 rounded-xl text-sm font-black text-rose-600 hover:bg-rose-50 transition-all"
                >
                  {t.clear_all_data}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 min-h-0 overflow-y-auto p-4 md:p-8 lg:p-12 pb-[calc(70px+env(safe-area-inset-bottom))] md:pb-0">
        <div className="max-w-5xl mx-auto">
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
          {activeTab === TabType.AI_COACH && <AICoach logs={logs} exercises={exercises} language={language} />}
        </div>
      </main>

      {isExerciseManagerOpen && (
        <div className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 relative">
          <button
            type="button"
            className="absolute inset-0"
            onClick={handleCloseExerciseManager}
            aria-label={t.close}
          />
          <div
            role="dialog"
            aria-modal="true"
            className="relative z-10 w-full max-w-5xl max-h-[85vh] bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col"
          >
            <button
              type="button"
              onClick={handleCloseExerciseManager}
              className="absolute top-4 right-4 z-10 p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
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

      <nav className={`md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-200 px-6 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))] z-50 flex justify-between items-center shadow-[0_-4px_12px_rgba(0,0,0,0.03)] transition ${isExerciseManagerOpen ? 'pointer-events-none opacity-40 blur-[1px]' : ''}`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => navigateToTab(tab.id)}
            disabled={isExerciseManagerOpen}
            aria-disabled={isExerciseManagerOpen}
            className={`flex flex-col items-center space-y-1 relative transition-colors duration-300 ${
              activeTab === tab.id ? 'text-indigo-600' : 'text-slate-400'
            }`}
          >
            <div className={`p-1.5 rounded-full transition-all duration-300 ${activeTab === tab.id ? 'scale-110' : 'scale-100'}`}>
               <tab.icon size={24} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${activeTab === tab.id ? 'opacity-100' : 'opacity-60'}`}>
              {tab.label}
            </span>
            {activeTab === tab.id && (
              <span className="absolute -top-1 w-1 h-1 bg-indigo-600 rounded-full animate-pulse" />
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;
