
import React, { useMemo, useState } from 'react';
import { WorkoutEntry, Exercise, Language, WorkoutPlan } from '../types';
import { translations } from '../translations';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Calendar, Zap, TrendingUp, ChevronRight, CheckCircle2, XCircle, ChevronLeft } from 'lucide-react';

interface DashboardProps {
  logs: WorkoutEntry[];
  exercises: Exercise[];
  plans: WorkoutPlan[];
  language: Language;
}

const Dashboard: React.FC<DashboardProps> = ({ logs, exercises, plans, language }) => {
  const t = translations[language];
  const [viewDate, setViewDate] = useState(new Date());

  const volumeData = useMemo(() => {
    const dataMap: Record<string, number> = {};
    logs.forEach(log => {
      const volume = log.sets.reduce((acc, set) => acc + (set.weight * (set.reps || 0)), 0);
      dataMap[log.date] = (dataMap[log.date] || 0) + volume;
    });
    return Object.entries(dataMap)
      .map(([date, vol]) => ({ date, volume: vol }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7);
  }, [logs]);

  const stats = useMemo(() => {
    const totalVolume = logs.reduce((acc, log) => acc + log.sets.reduce((sAcc, s) => sAcc + (s.weight * (s.reps || 0)), 0), 0);
    return [
      { label: t.total_volume, value: `${(totalVolume / 1000).toFixed(1)}t`, icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
      { label: t.workouts, value: logs.length, icon: Calendar, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    ];
  }, [logs, language]);

  const calendarDays = useMemo(() => {
    const currentMonth = viewDate.getMonth();
    const currentYear = viewDate.getFullYear();
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];
    
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{t.today_summary}</h2>
        <div className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full uppercase tracking-widest">
          {t.streak}: {logs.length} {t.days} 🔥
        </div>
      </div>

      {/* Calendar View */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <Calendar size={16} className="text-indigo-600" />
            {t.training_calendar}
          </h3>
          <div className="flex items-center gap-4">
            <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors">
              <ChevronLeft size={20} />
            </button>
            <span className="text-xs font-black text-slate-900 uppercase italic tracking-tighter w-24 text-center">
              {viewDate.toLocaleString('default', { month: 'short', year: 'numeric' })}
            </span>
            <button onClick={() => changeMonth(1)} className="p-1 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
            <div key={d} className="text-center text-[10px] font-black text-slate-300 uppercase mb-1">{d}</div>
          ))}
          {calendarDays.map((d, i) => {
            // Dynamic styling based on past, today, future
            let bgColor = 'bg-slate-50';
            let textColor = 'text-slate-900';
            let borderStyle = 'border-transparent';

            if (d.currentMonth) {
              if (d.isPast) {
                bgColor = 'bg-slate-100';
                textColor = 'text-slate-400';
              } else if (d.isToday) {
                bgColor = 'bg-white';
                borderStyle = 'border-indigo-600 ring-2 ring-indigo-100 ring-offset-1';
                textColor = 'text-indigo-600';
              } else if (d.isFuture) {
                bgColor = 'bg-white';
                textColor = 'text-slate-600';
              }
              
              // Planned items take priority on background if not missed
              if (d.isPlanned) {
                bgColor = 'bg-indigo-600';
                textColor = 'text-white';
                if (!d.isToday) borderStyle = 'border-transparent';
              }
            } else {
              textColor = 'text-slate-200 opacity-30';
              bgColor = 'bg-transparent';
            }

            return (
              <div 
                key={i} 
                className={`aspect-square flex flex-col items-center justify-center rounded-2xl relative transition-all border-2 ${borderStyle} ${bgColor} ${textColor} ${
                  d.isPlanned ? 'shadow-lg shadow-indigo-100 scale-105 z-10' : ''
                }`}
              >
                <span className={`text-xs font-black ${d.isToday && !d.isPlanned ? 'underline decoration-2' : ''}`}>
                  {d.day}
                </span>
                
                {d.isCompleted && (
                  <div className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${d.isPlanned ? 'bg-white' : 'bg-emerald-500'}`} />
                )}
                
                {d.isMissed && !d.isCompleted && (
                  <XCircle size={10} className="text-rose-300 absolute bottom-1" strokeWidth={3} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden">
            <div className={`p-2 rounded-xl ${stat.bg} w-fit relative z-10`}>
              <stat.icon size={20} className={stat.color} />
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-xl font-black text-slate-900 leading-tight">{stat.value}</p>
            </div>
            <div className="absolute -right-2 -bottom-2 opacity-5 scale-150 rotate-12">
               <stat.icon size={80} />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <TrendingUp size={16} className="text-indigo-600" />
            {t.performance_curve}
          </h3>
        </div>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={volumeData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" stroke="#cbd5e1" fontSize={10} tickFormatter={(val) => val.split('-').slice(2).join('/')} />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontSize: '12px' }}
                cursor={{ stroke: '#4f46e5', strokeWidth: 1 }}
              />
              <Line 
                type="monotone" 
                dataKey="volume" 
                stroke="#4f46e5" 
                strokeWidth={4} 
                dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }} 
                activeDot={{ r: 6, strokeWidth: 0 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
