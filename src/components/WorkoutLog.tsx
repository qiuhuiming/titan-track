
import React, { useState, useEffect, useMemo } from 'react';
import { WorkoutEntry, Exercise, WorkoutSet, Language, WorkoutPlan } from '../types';
import { translations } from '../translations';
import { Plus, Trash2, ClipboardList, X, CheckCircle, Calendar, ArrowRight, Play, Clock, Check, SkipForward } from 'lucide-react';

interface WorkoutLogProps {
  logs: WorkoutEntry[];
  exercises: Exercise[];
  plans: WorkoutPlan[];
  onUpdateLogs: (logs: WorkoutEntry[]) => void;
  onUpdatePlans: (plans: WorkoutPlan[]) => void;
  language: Language;
}

const WorkoutLog: React.FC<WorkoutLogProps> = ({ logs, exercises, plans, onUpdateLogs, onUpdatePlans, language }) => {
  const t = translations[language];
  const [isAdding, setIsAdding] = useState(false);
  
  // State for the multi-exercise form (plan based)
  const [activePlan, setActivePlan] = useState<WorkoutPlan | null>(null);
  const [planProgress, setPlanProgress] = useState<{ exerciseId: string; sets: WorkoutSet[]; skipped?: boolean }[]>([]);

  const todayStr = new Date().toISOString().split('T')[0];

  // Find the next nearest incomplete plan
  const upcomingPlan = useMemo(() => {
    const incompletePlans = plans
      .filter(p => !p.isCompleted)
      .sort((a, b) => a.date.localeCompare(b.date));
    
    // First try to find today's plan
    const todayPlan = incompletePlans.find(p => p.date === todayStr);
    if (todayPlan) return todayPlan;

    // Otherwise find the first one in the future
    const futurePlan = incompletePlans.find(p => p.date > todayStr);
    if (futurePlan) return futurePlan;

    // If no future plans, find the most recent missed one
    return incompletePlans[incompletePlans.length - 1] || null;
  }, [plans, todayStr]);

  const startLoggingPlan = (plan: WorkoutPlan, forceToday: boolean = false) => {
    let targetPlan = plan;
    if (forceToday && plan.date !== todayStr) {
      // Update plan date in parent state
      const updatedPlans = plans.map(p => p.id === plan.id ? { ...p, date: todayStr } : p);
      onUpdatePlans(updatedPlans);
      targetPlan = { ...plan, date: todayStr };
    }

    setActivePlan(targetPlan);
    setPlanProgress(targetPlan.exercises.map(ex => ({
      exerciseId: ex.exerciseId,
      skipped: false,
      sets: ex.sets.map(s => ({ ...s, completed: false, rpe: 7, notes: '' }))
    })));
    setIsAdding(true);
  };

  const [formData, setFormData] = useState({
    date: todayStr,
    workoutType: '',
    exerciseId: exercises[0]?.id || '',
    sets: [{ id: '1', weight: 0, reps: 0, rpe: 7, completed: true }] as WorkoutSet[]
  });

  const updatePlanSet = (exIdx: number, setIdx: number, field: keyof WorkoutSet, value: any) => {
    const updatedProgress = [...planProgress];
    updatedProgress[exIdx].sets[setIdx] = {
      ...updatedProgress[exIdx].sets[setIdx],
      [field]: value
    };
    // If user interacts with a set, mark the exercise as not skipped
    updatedProgress[exIdx].skipped = false;
    setPlanProgress(updatedProgress);
  };

  const toggleSkipExercise = (exIdx: number) => {
    const updatedProgress = [...planProgress];
    const currentlySkipped = updatedProgress[exIdx].skipped;
    updatedProgress[exIdx].skipped = !currentlySkipped;
    
    // If skipping, mark all sets as incomplete to be safe
    if (!currentlySkipped) {
      updatedProgress[exIdx].sets = updatedProgress[exIdx].sets.map(s => ({ ...s, completed: false }));
    }
    setPlanProgress(updatedProgress);
  };

  const completeAllSets = (exIdx: number) => {
    const updatedProgress = [...planProgress];
    updatedProgress[exIdx].skipped = false;
    updatedProgress[exIdx].sets = updatedProgress[exIdx].sets.map(s => ({ ...s, completed: true }));
    setPlanProgress(updatedProgress);
  };

  const handleCompletePlan = () => {
    if (!activePlan) return;
    
    // Only log exercises that weren't skipped and have at least one completed set
    const logsToSave: WorkoutEntry[] = planProgress
      .filter(p => !p.skipped)
      .map(p => ({
        id: Math.random().toString(36).substr(2, 9),
        date: activePlan.date,
        exerciseId: p.exerciseId,
        workoutType: activePlan.title,
        sets: p.sets,
        planId: activePlan.id
      }));

    if (logsToSave.length > 0) {
      onUpdateLogs([...logs, ...logsToSave]);
    }
    
    const updatedPlans = plans.map(p => p.id === activePlan.id ? { ...p, isCompleted: true } : p);
    onUpdatePlans(updatedPlans);
    
    setIsAdding(false);
    setActivePlan(null);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: WorkoutEntry = {
      id: Math.random().toString(36).substr(2, 9),
      ...formData
    };
    onUpdateLogs([...logs, newEntry]);
    setIsAdding(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-12">
      {!isAdding ? (
        <div className="flex flex-col space-y-6">
          {/* Upcoming Mission Card */}
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-200 overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
               <Calendar size={120} />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Next Mission</span>
              </div>

              {upcomingPlan ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-3xl font-black italic uppercase tracking-tight leading-none mb-2">{upcomingPlan.title}</h3>
                    <div className="flex items-center gap-4 text-slate-400">
                       <div className="flex items-center gap-1">
                         <Clock size={14} />
                         <span className="text-xs font-bold uppercase">{upcomingPlan.date === todayStr ? 'Today' : upcomingPlan.date}</span>
                       </div>
                       <div className="flex items-center gap-1">
                         <ClipboardList size={14} />
                         <span className="text-xs font-bold uppercase">{upcomingPlan.exercises.length} Exercises</span>
                       </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button 
                      onClick={() => startLoggingPlan(upcomingPlan, upcomingPlan.date !== todayStr)}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-indigo-900/20"
                    >
                      <Play size={18} fill="currentColor" />
                      <span className="uppercase text-sm tracking-widest">{upcomingPlan.date === todayStr ? 'Start Now' : 'Move to Today & Start'}</span>
                    </button>
                    <button 
                      onClick={() => setIsAdding(true)}
                      className="bg-white/10 hover:bg-white/20 text-white font-black py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all backdrop-blur-sm"
                    >
                      <Plus size={18} />
                      <span className="uppercase text-sm tracking-widest">Other</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <p className="text-slate-400 font-bold italic">No plans scheduled. Ready to wing it?</p>
                  <button 
                    onClick={() => setIsAdding(true)}
                    className="w-full bg-white text-slate-900 font-black py-4 px-10 rounded-2xl shadow-lg active:scale-95 transition-transform uppercase tracking-widest text-sm"
                  >
                    {t.log_new_session}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="px-2">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">{t.past_records}</h4>
              <ArrowRight size={16} className="text-slate-300" />
            </div>
            <div className="space-y-3">
              {[...logs].reverse().slice(0, 10).map(log => {
                const ex = exercises.find(e => e.id === log.exerciseId);
                return (
                  <div key={log.id} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between hover:border-indigo-100 transition-colors">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                         <CheckCircle size={20} />
                       </div>
                       <div>
                        <p className="font-black text-slate-900 leading-tight">{ex?.name || '???'}</p>
                        <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-0.5">{log.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-slate-900">{log.sets.length} {t.log.toUpperCase()}S</p>
                      <p className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">{log.workoutType}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="fixed inset-0 bg-white z-[60] flex flex-col animate-in slide-in-from-bottom-4 duration-300">
          <div className="pt-safe px-6 py-4 flex items-center justify-between border-b border-slate-100">
            <button onClick={() => setIsAdding(false)} className="p-2 text-slate-400 bg-slate-50 rounded-xl">
              <X size={24} />
            </button>
            <h3 className="text-lg font-black tracking-tight text-slate-900 uppercase italic">
              {activePlan ? activePlan.title : t.log_workout}
            </h3>
            <div className="w-10"></div>
          </div>
          
          <div className="flex-grow overflow-y-auto p-6 space-y-8 pb-32">
             {activePlan ? (
               <div className="space-y-12">
                 {planProgress.map((p, exIdx) => {
                   const ex = exercises.find(e => e.id === p.exerciseId);
                   const completedSetsCount = p.sets.filter(s => s.completed).length;
                   const allDone = completedSetsCount === p.sets.length;

                   return (
                     <div key={exIdx} className={`space-y-4 transition-all duration-300 ${p.skipped ? 'opacity-40 grayscale scale-[0.98]' : 'opacity-100'}`}>
                       <div className="flex items-center justify-between px-1">
                         <div className="flex items-center gap-3">
                           <div className={`w-1.5 h-6 rounded-full transition-colors ${p.skipped ? 'bg-slate-300' : allDone ? 'bg-emerald-500' : 'bg-indigo-600'}`}></div>
                           <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight italic">{ex?.name}</h4>
                         </div>
                         <div className="flex gap-2">
                           <button 
                             onClick={() => toggleSkipExercise(exIdx)}
                             className={`p-2 rounded-xl border transition-all ${p.skipped ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-200'}`}
                             title={t.skip_exercise}
                           >
                             <SkipForward size={16} />
                           </button>
                           {!p.skipped && (
                             <button 
                               onClick={() => completeAllSets(exIdx)}
                               className={`p-2 rounded-xl border transition-all ${allDone ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-emerald-500 border-emerald-200'}`}
                               title={t.complete_all}
                             >
                               <Check size={16} />
                             </button>
                           )}
                         </div>
                       </div>
                       
                       {!p.skipped && (
                         <div className="space-y-3">
                           {p.sets.map((set, setIdx) => (
                             <div key={setIdx} className={`bg-slate-50 p-5 rounded-[2rem] transition-all border-2 ${set.completed ? 'opacity-60 border-emerald-500 bg-emerald-50/20' : 'border-transparent'}`}>
                               <div className="flex justify-between items-center mb-4 px-1">
                                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Set {setIdx + 1}</span>
                                 <button 
                                   onClick={() => updatePlanSet(exIdx, setIdx, 'completed', !set.completed)}
                                   className={`text-[9px] font-black uppercase px-4 py-2 rounded-xl transition-all ${set.completed ? 'bg-emerald-500 text-white shadow-md shadow-emerald-100' : 'bg-white text-slate-400 border border-slate-200 hover:border-indigo-300'}`}
                                 >
                                   {set.completed ? t.status_completed : t.status_incomplete}
                                 </button>
                               </div>
                               <div className="grid grid-cols-3 gap-3">
                                 <div className="bg-white p-3 rounded-2xl text-center shadow-sm">
                                   <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">KG</p>
                                   <input 
                                     type="number" 
                                     value={set.weight} 
                                     onChange={e => updatePlanSet(exIdx, setIdx, 'weight', parseFloat(e.target.value))}
                                     className="w-full text-center font-black text-slate-900 bg-transparent outline-none text-lg" 
                                   />
                                 </div>
                                 <div className="bg-white p-3 rounded-2xl text-center shadow-sm">
                                   <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Reps</p>
                                   <input 
                                     type="number" 
                                     value={set.reps} 
                                     onChange={e => updatePlanSet(exIdx, setIdx, 'reps', parseInt(e.target.value))}
                                     className="w-full text-center font-black text-slate-900 bg-transparent outline-none text-lg" 
                                   />
                                 </div>
                                 <div className="bg-white p-3 rounded-2xl text-center shadow-sm">
                                   <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">RPE</p>
                                   <input 
                                     type="number" 
                                     value={set.rpe} 
                                     onChange={e => updatePlanSet(exIdx, setIdx, 'rpe', parseInt(e.target.value))}
                                     className="w-full text-center font-black text-slate-900 bg-transparent outline-none text-lg" 
                                   />
                                 </div>
                               </div>
                               <input 
                                 type="text" 
                                 placeholder={t.notes}
                                 value={set.notes}
                                 onChange={e => updatePlanSet(exIdx, setIdx, 'notes', e.target.value)}
                                 className="w-full mt-4 bg-white p-3 rounded-2xl text-xs font-bold text-slate-600 outline-none border border-slate-100 shadow-sm" 
                               />
                             </div>
                           ))}
                         </div>
                       )}

                       {p.skipped && (
                         <div className="bg-slate-100/50 p-6 rounded-[2rem] border border-dashed border-slate-200 text-center">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest italic flex items-center justify-center gap-2">
                              <SkipForward size={14} /> Exercise Skipped
                            </p>
                            <button 
                              onClick={() => toggleSkipExercise(exIdx)}
                              className="mt-2 text-[10px] font-bold text-indigo-600 underline"
                            >
                              Undo Skip
                            </button>
                         </div>
                       )}
                     </div>
                   );
                 })}
               </div>
             ) : (
               <div className="space-y-6 animate-in fade-in duration-500">
                 <div className="space-y-4">
                   <div className="grid grid-cols-2 gap-3">
                     <div className="space-y-1">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t.date}</label>
                       <input 
                        type="date" 
                        value={formData.date}
                        onChange={e => setFormData({...formData, date: e.target.value})}
                        className="w-full bg-slate-50 p-4 rounded-2xl border-none font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                       />
                     </div>
                     <div className="space-y-1">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t.type}</label>
                       <input 
                        type="text" 
                        placeholder={t.type}
                        value={formData.workoutType}
                        onChange={e => setFormData({...formData, workoutType: e.target.value})}
                        className="w-full bg-slate-50 p-4 rounded-2xl border-none font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                       />
                     </div>
                   </div>

                   <div className="space-y-1">
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t.exercise}</label>
                     <select 
                        value={formData.exerciseId}
                        onChange={e => setFormData({...formData, exerciseId: e.target.value})}
                        className="w-full bg-slate-50 p-4 rounded-2xl border-none font-bold text-slate-900 appearance-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                     >
                       {exercises.map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
                     </select>
                   </div>
                 </div>

                 <div className="space-y-3">
                    <div className="flex justify-between items-center px-1 mb-2">
                      <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{t.sets_data}</h4>
                      <button type="button" onClick={() => setFormData({...formData, sets: [...formData.sets, { id: Math.random().toString(), weight: 0, reps: 0, rpe: 7, completed: true }]})} className="text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">+ {t.add_set.toUpperCase()}</button>
                    </div>
                    {formData.sets.map((set, i) => (
                      <div key={set.id} className="bg-slate-50 p-5 rounded-[2rem] flex flex-col gap-4 border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xs font-black text-slate-400 border border-slate-100 flex-shrink-0 shadow-sm">
                            {i + 1}
                          </div>
                          <div className="flex-1 grid grid-cols-3 gap-2">
                            <div className="bg-white p-2 rounded-xl text-center shadow-sm">
                              <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">KG</p>
                              <input type="number" placeholder="KG" value={set.weight || ''} onChange={e => {
                                 const updated = [...formData.sets];
                                 updated[i].weight = parseFloat(e.target.value);
                                 setFormData({...formData, sets: updated});
                              }} className="w-full text-center font-black text-slate-900 bg-transparent outline-none" />
                            </div>
                            <div className="bg-white p-2 rounded-xl text-center shadow-sm">
                              <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Reps</p>
                              <input type="number" placeholder="REPS" value={set.reps || ''} onChange={e => {
                                 const updated = [...formData.sets];
                                 updated[i].reps = parseInt(e.target.value);
                                 setFormData({...formData, sets: updated});
                              }} className="w-full text-center font-black text-slate-900 bg-transparent outline-none" />
                            </div>
                            <div className="bg-white p-2 rounded-xl text-center shadow-sm">
                              <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">RPE</p>
                              <input type="number" placeholder="RPE" value={set.rpe || ''} onChange={e => {
                                 const updated = [...formData.sets];
                                 updated[i].rpe = parseInt(e.target.value);
                                 setFormData({...formData, sets: updated});
                              }} className="w-full text-center font-black text-slate-900 bg-transparent outline-none" />
                            </div>
                          </div>
                          <button type="button" onClick={() => setFormData({...formData, sets: formData.sets.filter(s => s.id !== set.id)})} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"><Trash2 size={18}/></button>
                        </div>
                      </div>
                    ))}
                 </div>
               </div>
             )}
          </div>

          <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-lg pb-[calc(1.5rem+env(safe-area-inset-bottom))] border-t border-slate-100">
             <button 
                onClick={activePlan ? handleCompletePlan : handleManualSubmit}
                className="w-full bg-indigo-600 text-white font-black py-5 rounded-[2rem] shadow-2xl shadow-indigo-100 active:scale-95 transition-transform uppercase tracking-widest text-sm"
             >
               {activePlan ? t.complete_plan : t.save_workout}
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutLog;
