
import React, { useMemo, useState, useRef, useEffect } from 'react';
import { WorkoutEntry, Exercise, Language, WorkoutPlan, TabType, NavigationParams } from '../types';
import { translations } from '../translations';
import { Calendar, ChevronRight, XCircle, ChevronLeft, CheckCircle2, Clock, CircleSlash, Info, Dumbbell, Zap, ArrowRight } from 'lucide-react';

interface DashboardProps {
  logs: WorkoutEntry[];
  exercises: Exercise[];
  plans: WorkoutPlan[];
  language: Language;
  onNavigate: (tab: TabType, params?: NavigationParams) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ logs, exercises, plans, language, onNavigate }) => {
  const t = translations[language];
  const [viewDate, setViewDate] = useState(new Date());
  const [previewDay, setPreviewDay] = useState<{
    date: string;
    day: number;
    plan?: WorkoutPlan;
    logs: WorkoutEntry[];
    x: number;
    y: number;
  } | null>(null);

  const longPressTimer = useRef<number | null>(null);
  
  const handleLongPressStart = (e: React.MouseEvent | React.TouchEvent, dayData: any) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    longPressTimer.current = window.setTimeout(() => {
      const dayLogs = logs.filter(l => l.date === dayData.date);
      const dayPlan = plans.find(p => p.date === dayData.date);
      
      if (dayPlan || dayLogs.length > 0) {
        setPreviewDay({
          ...dayData,
          plan: dayPlan,
          logs: dayLogs,
          x: clientX,
          y: clientY
        });
        
        if ('vibrate' in navigator) {
          navigator.vibrate(50);
        }
      }
    }, 500);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  useEffect(() => {
    const handleClick = () => setPreviewDay(null);
    if (previewDay) {
      window.addEventListener('mousedown', handleClick);
      window.addEventListener('touchstart', handleClick);
    }
    return () => {
      window.removeEventListener('mousedown', handleClick);
      window.removeEventListener('touchstart', handleClick);
    };
  }, [previewDay]);

  const calendarDays = useMemo(() => {
    const currentMonth = viewDate.getMonth();
    const currentYear = viewDate.getFullYear();
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    today.setHours(0, 0, 0, 0);
    
    const days = [];
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    
    // Fill previous month days
    for (let i = firstDay.getDay(); i > 0; i--) {
      days.push({ day: prevMonthLastDay - i + 1, currentMonth: false });
    }
    
    // Fill current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const dateObj = new Date(currentYear, currentMonth, i);
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const plan = plans.find(p => p.date === dateStr);
      const isCompleted = plan?.isCompleted || logs.some(l => l.date === dateStr);
      const isPlanned = !!plan;
      
      const isPast = dateObj < today;
      const isToday = dateStr === todayStr;
      const isFuture = dateObj > today;
      
      days.push({ 
        day: i, 
        currentMonth: true, 
        date: dateStr,
        isCompleted,
        isPlanned,
        isToday,
        isPast,
        isFuture,
        isMissed: isPlanned && !isCompleted && isPast
      });
    }
    
    return days;
  }, [plans, logs, viewDate]);

  const changeMonth = (offset: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1);
    setViewDate(newDate);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-8 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-1">{t.today_summary}</h2>
          <p className="text-sm font-medium text-slate-500">{new Date().toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200 border border-indigo-500/20 self-end sm:self-auto">
          <span className="text-xs font-black text-indigo-50 uppercase tracking-widest leading-none">
            {t.streak}
          </span>
          <div className="h-4 w-[1px] bg-indigo-400/30" />
          <span className="text-sm font-black text-white leading-none">
            {logs.length} {t.days} 🔥
          </span>
        </div>
      </div>

      {/* Calendar View */}
      <div className="bg-white p-5 sm:p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl transition-transform duration-700 group-hover:scale-110" />
        
        <div className="flex items-center justify-between mb-8 relative z-10">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-xl">
              <Calendar size={18} className="text-indigo-600" />
            </div>
            {t.training_calendar}
          </h3>
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
            <button 
              type="button"
              onClick={() => changeMonth(-1)} 
              className="p-1.5 hover:bg-white hover:shadow-sm rounded-xl text-slate-400 hover:text-indigo-600 transition-all active:scale-95"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-[11px] font-black text-slate-900 uppercase italic tracking-tight min-w-[100px] text-center">
              {viewDate.toLocaleString(language === 'zh' ? 'zh-CN' : 'en-US', { month: 'short', year: 'numeric' })}
            </span>
            <button 
              type="button"
              onClick={() => changeMonth(1)} 
              className="p-1.5 hover:bg-white hover:shadow-sm rounded-xl text-slate-400 hover:text-indigo-600 transition-all active:scale-95"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1.5 sm:gap-3 relative z-10">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
            <div key={`day-header-${d}`} className="text-center text-[10px] font-black text-slate-300 uppercase mb-2 tracking-widest">{d}</div>
          ))}
          {calendarDays.map((d, i) => {
            let bgColor = 'bg-slate-50';
            let textColor = 'text-slate-900';
            let borderStyle = 'border-transparent';
            let shadow = '';

            if (d.currentMonth) {
              if (d.isPast) {
                bgColor = 'bg-slate-50/50';
                textColor = 'text-slate-400';
              } else if (d.isToday) {
                bgColor = 'bg-white';
                borderStyle = 'border-indigo-600 ring-4 ring-indigo-50';
                textColor = 'text-indigo-600';
                shadow = 'shadow-md';
              } else if (d.isFuture) {
                bgColor = 'bg-white';
                textColor = 'text-slate-600';
                borderStyle = 'border-slate-100';
              }
              
              if (d.isPlanned) {
                bgColor = 'bg-indigo-600';
                textColor = 'text-white';
                borderStyle = 'border-indigo-500';
                shadow = 'shadow-lg shadow-indigo-200';
              }
            } else {
              textColor = 'text-slate-200 opacity-20';
              bgColor = 'bg-transparent';
            }

            const dayKey = d.currentMonth ? `day-${d.date}` : `prev-${i}-${d.day}`;

            return (
              <button 
                key={dayKey} 
                type="button"
                onMouseDown={(e) => d.currentMonth && handleLongPressStart(e, d)}
                onMouseUp={handleLongPressEnd}
                onMouseLeave={handleLongPressEnd}
                onTouchStart={(e) => d.currentMonth && handleLongPressStart(e, d)}
                onTouchEnd={handleLongPressEnd}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    d.currentMonth && handleLongPressStart(e as any, d);
                  }
                }}
                onKeyUp={handleLongPressEnd}
                className={`aspect-square flex flex-col items-center justify-center rounded-xl sm:rounded-2xl relative transition-all border ${borderStyle} ${bgColor} ${textColor} ${shadow} ${
                  d.isPlanned ? 'scale-105 z-10 hover:scale-110 cursor-pointer' : 'hover:bg-slate-100/50'
                }`}
              >
                <span className={`text-[10px] sm:text-xs font-black ${d.isToday && !d.isPlanned ? 'underline decoration-2 underline-offset-2' : ''}`}>
                  {d.day}
                </span>
                
                {d.isCompleted && (
                  <div className={`absolute bottom-1 w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${d.isPlanned ? 'bg-white' : 'bg-emerald-500'}`} />
                )}
                
                {d.isMissed && !d.isCompleted && (
                  <XCircle size={10} className="text-rose-400 absolute bottom-1 sm:bottom-1.5" strokeWidth={3} />
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap justify-center gap-3 relative z-10">
          {[
            { label: language === 'zh' ? '已完成' : 'Completed', color: 'bg-emerald-500', icon: CheckCircle2 },
            { label: language === 'zh' ? '计划中' : 'Planned', color: 'bg-indigo-600', icon: Clock },
            { label: language === 'zh' ? '未达标' : 'Missed', color: 'bg-rose-400', icon: CircleSlash },
            { label: language === 'zh' ? '休息日' : 'Rest', color: 'bg-slate-100', icon: Info },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-100 transition-all hover:bg-white hover:shadow-sm">
              <div className={`w-2 h-2 rounded-full ${item.color}`} />
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {previewDay && (
        <div 
          className="fixed z-[100] animate-in zoom-in-95 fade-in duration-300"
          style={{ 
            left: Math.min(window.innerWidth - 300, Math.max(20, previewDay.x - 150)),
            top: Math.max(20, previewDay.y - 220)
          }}
        >
          <div 
            role="none"
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            className="w-[300px] bg-white/98 backdrop-blur-2xl border border-white shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14),0_0_0_1px_rgba(0,0,0,0.02)] rounded-[2.5rem] overflow-hidden"
          >
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              <div className="flex justify-between items-start relative z-10">
                <div className="text-[11px] font-black uppercase tracking-[0.25em] text-indigo-100/80 mb-2 flex items-center gap-2">
                  <Calendar size={12} className="text-indigo-200" />
                  {new Date(previewDay.date).toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate(TabType.PLAN, { date: previewDay.date });
                    setPreviewDay(null);
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 border border-white/30 rounded-xl transition-all duration-200 group/btn active:scale-95"
                >
                  <span className="text-[11px] font-black uppercase tracking-wider">
                    {(t as any).go_to_plan}
                  </span>
                  <ArrowRight size={14} className="transition-transform group-hover/btn:translate-x-0.5" />
                </button>
              </div>
              <h4 className="text-2xl font-black leading-tight tracking-tight break-words relative z-10">
                {previewDay.plan?.title || (previewDay.logs.length > 0 ? (language === 'zh' ? '自主训练' : 'Free Session') : '')}
              </h4>
            </div>
            
            <div className="p-6 space-y-6">
              {previewDay.plan && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2">
                      <Dumbbell size={14} className="text-indigo-500" />
                      {language === 'zh' ? '训练项目' : 'EXERCISES'}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      previewDay.plan.isCompleted ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                    }`}>
                      {previewDay.plan.isCompleted ? (language === 'zh' ? '已完成' : 'Completed') : (language === 'zh' ? '计划中' : 'Planned')}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {previewDay.plan.exercises.map((ex) => {
                      const exerciseName = exercises.find(e => e.id === ex.exerciseId)?.name || (language === 'zh' ? '动作' : 'Exercise');
                      return (
                        <div key={ex.exerciseId} className="flex items-center gap-3 text-sm font-bold text-slate-700 group">
                          <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(79,70,229,0.4)]" />
                          {exerciseName}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {!previewDay.plan && previewDay.logs.length > 0 && (
                <div>
                  <div className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
                    <Zap size={14} className="text-emerald-500" />
                    {language === 'zh' ? '训练记录' : 'WORKOUT LOGS'}
                  </div>
                  <div className="space-y-3">
                    {Array.from(new Set(previewDay.logs.map(l => l.exerciseId))).map((id) => {
                      const exerciseName = exercises.find(e => e.id === id)?.name || (language === 'zh' ? '动作' : 'Exercise');
                      return (
                        <div key={id} className="flex items-center gap-3 text-sm font-bold text-slate-700">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                          {exerciseName}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {previewDay.plan?.tags && previewDay.plan.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-5 border-t border-slate-50">
                  {previewDay.plan.tags.map(tag => (
                    <span key={tag} className="text-[10px] font-black bg-slate-100/80 text-slate-500 px-3 py-1 rounded-lg uppercase tracking-wider border border-slate-200/50">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="flex items-center justify-center gap-2 pt-2">
                <div className="w-1 h-1 bg-slate-200 rounded-full" />
                <div className="w-1 h-1 bg-slate-200 rounded-full" />
                <div className="w-1 h-1 bg-slate-200 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
