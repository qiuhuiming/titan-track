
import React, { useState, useEffect } from 'react';
import { TabType, Exercise, WorkoutEntry, Language, WorkoutPlan } from './types';
import { storageService } from './services/storageService';
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
  Globe
} from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>(TabType.DASHBOARD);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [logs, setLogs] = useState<WorkoutEntry[]>([]);
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [language, setLanguage] = useState<Language>('zh');

  useEffect(() => {
    setExercises(storageService.getExercises());
    setLogs(storageService.getLogs());
    setPlans(storageService.getPlans());
    const savedLang = localStorage.getItem('titan_track_lang') as Language;
    if (savedLang) setLanguage(savedLang);
  }, []);

  const handleLanguageToggle = () => {
    const nextLang = language === 'zh' ? 'en' : 'zh';
    setLanguage(nextLang);
    localStorage.setItem('titan_track_lang', nextLang);
  };

  const t = translations[language];

  const handleUpdateLogs = (newLogs: WorkoutEntry[]) => {
    setLogs(newLogs);
    storageService.saveLogs(newLogs);
  };

  const handleUpdatePlans = (newPlans: WorkoutPlan[]) => {
    setPlans(newPlans);
    storageService.savePlans(newPlans);
  };

  const tabs = [
    { id: TabType.DASHBOARD, label: t.home, icon: LayoutDashboard },
    { id: TabType.WORKOUT_LOG, label: t.log, icon: PlusCircle },
    { id: TabType.PLAN, label: t.plan, icon: CalendarDays },
    { id: TabType.AI_COACH, label: t.ai_coach, icon: Sparkles },
  ];

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
              onClick={() => setActiveTab(tab.id)}
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
          onClick={handleLanguageToggle}
          className="mt-auto flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <Globe size={20} />
          <span className="font-medium">{language === 'zh' ? 'English' : '中文'}</span>
        </button>
      </aside>

      <header className="md:hidden pt-safe sticky top-0 bg-white/80 backdrop-blur-md z-40 px-6 py-4 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <Activity className="text-indigo-600" size={24} />
          <span className="text-xl font-extrabold tracking-tight text-slate-900 uppercase italic">Titan<span className="text-indigo-600">Track</span></span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleLanguageToggle} className="p-2 text-indigo-600 bg-indigo-50 rounded-lg text-xs font-black uppercase tracking-tight">
            {language === 'zh' ? 'EN' : '中'}
          </button>
          <button className="p-2 text-slate-400">
            <Settings size={20} />
          </button>
        </div>
      </header>

      <main className="flex-grow p-4 md:p-8 lg:p-12">
        <div className="max-w-5xl mx-auto h-full">
          {activeTab === TabType.DASHBOARD && <Dashboard logs={logs} exercises={exercises} plans={plans} language={language} />}
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
            />
          )}
          {activeTab === TabType.AI_COACH && <AICoach logs={logs} exercises={exercises} language={language} />}
        </div>
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-200 px-6 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))] z-50 flex justify-between items-center shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
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
