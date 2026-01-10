
import React, { useState, useEffect } from 'react';
import { TabType, Exercise, WorkoutEntry, Language, WorkoutPlan, NavigationParams } from './types';
import { tauriStorageService } from './services/tauriStorageService';
import { translations } from './translations';
import Dashboard from './components/Dashboard';
import WorkoutLog from './components/WorkoutLog';
import PlanManager from './components/PlanManager';
import AICoach from './components/AICoach';
import { 
  Activity, 
  LayoutDashboard, 
  CalendarDays, 
  Sparkles, 
  PlusCircle, 
  Settings,
  Globe,
  Loader2
} from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>(TabType.DASHBOARD);
  const [activeTabParams, setActiveTabParams] = useState<NavigationParams | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [logs, setLogs] = useState<WorkoutEntry[]>([]);
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [language, setLanguage] = useState<Language>('zh');
  const [isLoading, setIsLoading] = useState(true);

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

  const handleLanguageToggle = () => {
    const nextLang = language === 'zh' ? 'en' : 'zh';
    setLanguage(nextLang);
    localStorage.setItem('titan_track_lang', nextLang);
  };

  const t = translations[language];

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
    <div className="min-h-screen bg-white md:bg-slate-50 flex flex-col md:flex-row pb-[calc(70px+env(safe-area-inset-bottom))] md:pb-0">
      
      <aside className="hidden md:flex w-72 bg-white border-r border-slate-200 p-6 flex-col h-screen sticky top-0">
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

      <header className="md:hidden pt-safe sticky top-0 bg-white/80 backdrop-blur-xl z-40 px-6 py-4 flex items-center justify-between border-b border-slate-100 shadow-sm shadow-slate-200/20">
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
          <button type="button" className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <Settings size={22} />
          </button>
        </div>
      </header>

      <main className="flex-grow p-4 md:p-8 lg:p-12">
        <div className="max-w-5xl mx-auto h-full">
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

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-200 px-6 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))] z-50 flex justify-between items-center shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => navigateToTab(tab.id)}
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
