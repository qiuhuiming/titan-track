
import React, { useState } from 'react';
import { WorkoutPlan, Exercise, MuscleGroup, Language, WorkoutSet } from '../types';
import { translations } from '../translations';
import { Plus, ChevronDown, ChevronUp, Trash2, Calendar, Edit2, X } from 'lucide-react';

interface PlanManagerProps {
  plans: WorkoutPlan[];
  exercises: Exercise[];
  onUpdatePlans: (plans: WorkoutPlan[]) => void;
  language: Language;
}

const PlanManager: React.FC<PlanManagerProps> = ({ plans, exercises, onUpdatePlans, language }) => {
  const t = translations[language];
  const [isAdding, setIsAdding] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);
  
  const [newPlan, setNewPlan] = useState<Partial<WorkoutPlan>>({
    date: new Date().toISOString().split('T')[0],
    title: '',
    tags: [],
    exercises: []
  });

  const handleStartAdd = () => {
    setEditingPlanId(null);
    setNewPlan({
      date: new Date().toISOString().split('T')[0],
      title: '',
      tags: [],
      exercises: []
    });
    setIsAdding(true);
  };

  const handleStartEdit = (plan: WorkoutPlan) => {
    setEditingPlanId(plan.id);
    setNewPlan({
      date: plan.date,
      title: plan.title,
      tags: plan.tags,
      exercises: JSON.parse(JSON.stringify(plan.exercises)) // Deep copy
    });
    setIsAdding(true);
    setExpandedPlanId(null); // Close the expansion when editing
  };

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlan.title || newPlan.exercises?.length === 0) return;
    
    if (editingPlanId) {
      const updatedPlans = plans.map(p => 
        p.id === editingPlanId 
          ? { ...p, ...newPlan as WorkoutPlan } 
          : p
      );
      onUpdatePlans(updatedPlans);
    } else {
      const plan: WorkoutPlan = {
        id: Math.random().toString(36).substr(2, 9),
        date: newPlan.date!,
        title: newPlan.title!,
        tags: newPlan.tags || [],
        exercises: newPlan.exercises || [],
        isCompleted: false
      };
      onUpdatePlans([...plans, plan]);
    }
    
    setIsAdding(false);
    setEditingPlanId(null);
    setNewPlan({ date: new Date().toISOString().split('T')[0], title: '', tags: [], exercises: [] });
  };

  const addExerciseToPlan = () => {
    setNewPlan({
      ...newPlan,
      exercises: [
        ...(newPlan.exercises || []),
        { exerciseId: exercises[0]?.id || '', sets: [{ id: Math.random().toString(), weight: 0, reps: 0 }] }
      ]
    });
  };

  const removeExerciseFromPlan = (idx: number) => {
    const updated = [...(newPlan.exercises || [])];
    updated.splice(idx, 1);
    setNewPlan({...newPlan, exercises: updated});
  };

  const removePlan = (id: string) => {
    if (confirm(t.confirm_delete)) {
      onUpdatePlans(plans.filter(p => p.id !== id));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">{t.plan}</h2>
        <button 
          onClick={handleStartAdd}
          className="bg-indigo-600 text-white p-3 rounded-2xl shadow-lg active:scale-95 transition-transform"
        >
          <Plus size={24} />
        </button>
      </div>

      {isAdding ? (
        <form onSubmit={handleSavePlan} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6 animate-in zoom-in-95">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight italic">
              {editingPlanId ? t.edit_plan : t.add_plan}
            </h3>
            <button type="button" onClick={() => setIsAdding(false)} className="text-slate-400">
              <X size={20} />
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t.date}</label>
                <input 
                  type="date" 
                  value={newPlan.date}
                  onChange={e => setNewPlan({...newPlan, date: e.target.value})}
                  className="w-full bg-slate-50 p-3 rounded-xl border-none font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t.plan_title}</label>
                <input 
                  type="text" 
                  placeholder={t.plan_title}
                  value={newPlan.title}
                  onChange={e => setNewPlan({...newPlan, title: e.target.value})}
                  className="w-full bg-slate-50 p-3 rounded-xl border-none font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t.exercise}</label>
                <button type="button" onClick={addExerciseToPlan} className="text-[10px] font-black text-indigo-600">+ {t.exercise.toUpperCase()}</button>
              </div>
              
              {newPlan.exercises?.map((item, idx) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-2xl space-y-3 relative group">
                  <button 
                    type="button" 
                    onClick={() => removeExerciseFromPlan(idx)}
                    className="absolute -top-1 -right-1 bg-white p-1 rounded-full text-rose-500 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                  <select 
                    value={item.exerciseId}
                    onChange={e => {
                      const updated = [...(newPlan.exercises || [])];
                      updated[idx].exerciseId = e.target.value;
                      setNewPlan({...newPlan, exercises: updated});
                    }}
                    className="w-full bg-white p-2 rounded-lg border-none text-sm font-bold"
                  >
                    {exercises.map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
                  </select>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => {
                       const updated = [...(newPlan.exercises || [])];
                       updated[idx].sets.push({ id: Math.random().toString(), weight: 0, reps: 0 });
                       setNewPlan({...newPlan, exercises: updated});
                    }} className="text-[9px] font-black text-slate-400 uppercase">+ Set</button>
                    <div className="flex-1 text-right text-[10px] font-bold text-slate-400">
                      {item.sets.length} Sets
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
             <button type="button" onClick={() => setIsAdding(false)} className="flex-1 p-4 bg-slate-100 rounded-2xl font-black text-slate-400 uppercase text-xs">{t.cancel}</button>
             <button type="submit" className="flex-2 p-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs shadow-lg">
               {editingPlanId ? t.update_plan : t.save_plan}
             </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-1">{t.view_plans}</h3>
          {plans.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
              <p className="text-slate-400 font-bold italic">{t.no_plans}</p>
            </div>
          ) : (
            [...plans].sort((a, b) => b.date.localeCompare(a.date)).map(plan => (
              <div key={plan.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden transition-all">
                <div 
                  className="p-5 flex items-center justify-between cursor-pointer active:bg-slate-50"
                  onClick={() => setExpandedPlanId(expandedPlanId === plan.id ? null : plan.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${plan.isCompleted ? 'bg-emerald-50 text-emerald-500' : 'bg-indigo-50 text-indigo-500'}`}>
                      <Calendar size={20} />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 leading-tight">{plan.title}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{plan.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {plan.isCompleted ? (
                      <span className="text-[9px] font-black text-emerald-500 uppercase bg-emerald-50 px-2 py-1 rounded-lg">{t.status_completed}</span>
                    ) : (
                      <span className="text-[9px] font-black text-indigo-400 uppercase bg-indigo-50 px-2 py-1 rounded-lg">{t.status_incomplete}</span>
                    )}
                    {expandedPlanId === plan.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </div>
                
                {expandedPlanId === plan.id && (
                  <div className="px-5 pb-5 border-t border-slate-50 pt-4 animate-in slide-in-from-top-2">
                    <div className="space-y-4">
                      {plan.exercises.map((item, i) => {
                        const ex = exercises.find(e => e.id === item.exerciseId);
                        return (
                          <div key={i} className="bg-slate-50 p-4 rounded-2xl">
                            <div className="flex justify-between mb-2">
                              <span className="text-xs font-black text-slate-900">{ex?.name}</span>
                              <span className="text-[10px] font-bold text-slate-400">{item.sets.length} Sets</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                               {item.sets.map((set, si) => (
                                 <div key={si} className="text-[10px] text-slate-500 bg-white p-2 rounded-lg border border-slate-100">
                                   Set {si+1}: <span className="font-black text-slate-900">{set.weight}kg x {set.reps}</span>
                                 </div>
                               ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleStartEdit(plan); }}
                        className="flex-1 p-3 flex items-center justify-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50 rounded-xl"
                      >
                        <Edit2 size={14} /> {t.edit_plan}
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); removePlan(plan.id); }}
                        className="flex-1 p-3 flex items-center justify-center gap-2 text-xs font-bold text-rose-500 bg-rose-50 rounded-xl"
                      >
                        <Trash2 size={14} /> {t.cancel}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default PlanManager;
