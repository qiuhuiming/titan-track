import { useEffect, useMemo, useState } from 'react';
import { Calendar, ChevronDown, ChevronUp, Clock, Edit2, Plus, Trash2, X } from 'lucide-react';
import type { Exercise, Language, NavigationParams, WorkoutPlan, WorkoutSet } from '../types';
import { translations } from '../translations';

interface PlanManagerProps {
  plans: WorkoutPlan[];
  exercises: Exercise[];
  onUpdatePlans: (plans: WorkoutPlan[]) => void;
  language: Language;
  initialParams?: NavigationParams | null;
}

const PLANS_PER_PAGE = 5;

type PlanSetGroup = WorkoutSet & { count?: number };

type PlanFormExercise = {
  id: string;
  exerciseId: string;
  sets: PlanSetGroup[];
};

type PlanFormState = Partial<WorkoutPlan> & {
  exercises?: PlanFormExercise[];
};

const PlanManager: React.FC<PlanManagerProps> = ({ plans, exercises, onUpdatePlans, language, initialParams }) => {
  const t = translations[language];
  const [isAdding, setIsAdding] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);

  const [isUpcomingExpanded, setIsUpcomingExpanded] = useState(true);
  const [isPastExpanded, setIsPastExpanded] = useState(false);

  const [incompletePage, setIncompletePage] = useState(1);
  const [pastPage, setPastPage] = useState(1);

  const [newPlan, setNewPlan] = useState<PlanFormState>({
    date: new Date().toISOString().split('T')[0],
    title: '',
    tags: [],
    exercises: []
  });

  useEffect(() => {
    if (initialParams?.date) {
      const planToExpand = plans.find(p => p.date === initialParams.date);
      if (planToExpand) {
        setExpandedPlanId(planToExpand.id);
        setTimeout(() => {
          const element = document.getElementById(`plan-${planToExpand.id}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      }
    }
  }, [initialParams, plans]);

  const uniquePlans = useMemo(() => {
    const uniquePlansMap = new Map<string, WorkoutPlan>();
    plans.forEach(plan => {
      uniquePlansMap.set(plan.id, plan);
    });
    return Array.from(uniquePlansMap.values());
  }, [plans]);

  const groupedPlans = useMemo(() => {
    const now = new Date();

    const toEndOfDay = (dateStr: string) => new Date(`${dateStr}T23:59:59.999`);

    const compareByDateAsc = (a: WorkoutPlan, b: WorkoutPlan) => {
      const dateComparison = a.date.localeCompare(b.date);
      if (dateComparison !== 0) return dateComparison;

      const aCreatedAt = a.createdAt ?? a.date;
      const bCreatedAt = b.createdAt ?? b.date;
      return bCreatedAt.localeCompare(aCreatedAt);
    };

    const compareByDateDesc = (a: WorkoutPlan, b: WorkoutPlan) => {
      const dateComparison = b.date.localeCompare(a.date);
      if (dateComparison !== 0) return dateComparison;

      const aCreatedAt = a.createdAt ?? a.date;
      const bCreatedAt = b.createdAt ?? b.date;
      return bCreatedAt.localeCompare(aCreatedAt);
    };

    const upcoming = uniquePlans
      .filter(plan => !plan.isCompleted && toEndOfDay(plan.date) >= now)
      .sort(compareByDateAsc);

    const past = uniquePlans
      .filter(plan => plan.isCompleted || toEndOfDay(plan.date) < now)
      .sort(compareByDateDesc);

    return { upcoming, past };
  }, [uniquePlans]);

  const paginatedIncomplete = useMemo(() => {
    const start = (incompletePage - 1) * PLANS_PER_PAGE;
    return groupedPlans.upcoming.slice(start, start + PLANS_PER_PAGE);
  }, [groupedPlans.upcoming, incompletePage]);

  const paginatedPast = useMemo(() => {
    const start = (pastPage - 1) * PLANS_PER_PAGE;
    return groupedPlans.past.slice(start, start + PLANS_PER_PAGE);
  }, [groupedPlans.past, pastPage]);

  useEffect(() => {
    const maxUpcoming = Math.max(1, Math.ceil(groupedPlans.upcoming.length / PLANS_PER_PAGE));
    if (incompletePage > maxUpcoming) setIncompletePage(maxUpcoming);

    const maxPast = Math.max(1, Math.ceil(groupedPlans.past.length / PLANS_PER_PAGE));
    if (pastPage > maxPast) setPastPage(maxPast);
  }, [groupedPlans.upcoming.length, groupedPlans.past.length, incompletePage, pastPage]);

  const isSameSetGroup = (a: WorkoutSet, b: WorkoutSet) => (
    a.weight === b.weight &&
    a.reps === b.reps &&
    a.timeMinutes === b.timeMinutes &&
    a.distance === b.distance &&
    a.rpe === b.rpe
  );

  const groupSets = (sets: WorkoutSet[]): PlanSetGroup[] => (
    sets.reduce<PlanSetGroup[]>((acc, set) => {
      const last = acc[acc.length - 1];
      if (last && isSameSetGroup(last, set)) {
        last.count = (last.count ?? 1) + 1;
        return acc;
      }
      acc.push({ ...set, count: 1 });
      return acc;
    }, [])
  );

  const expandSetGroups = (groups: PlanSetGroup[]): WorkoutSet[] => (
    groups.flatMap(group => {
      const { count = 1, ...set } = group;
      return Array.from({ length: Math.max(1, count) }, () => ({
        ...set,
        id: Math.random().toString(36).slice(2, 9)
      }));
    })
  );

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
      exercises: plan.exercises.map((exercise, index) => ({
        id: `edit-${plan.id}-${exercise.exerciseId}-${index}`,
        exerciseId: exercise.exerciseId,
        sets: groupSets(exercise.sets)
      }))
    });
    setIsAdding(true);
    setExpandedPlanId(null);
  };

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    const planTitle = newPlan.title;
    const planDate = newPlan.date;
    const planExercises = newPlan.exercises;

    if (!planTitle || !planDate || !planExercises || planExercises.length === 0) return;

    const expandedExercises = planExercises.map(exercise => ({
      exerciseId: exercise.exerciseId,
      sets: expandSetGroups(exercise.sets)
    }));

    if (editingPlanId) {
      const updatedPlans = plans.map(plan => (
        plan.id === editingPlanId
          ? {
              ...plan,
              date: planDate,
              title: planTitle,
              tags: newPlan.tags || [],
              exercises: expandedExercises,
              createdAt: plan.createdAt ?? new Date().toISOString()
            }
          : plan
      ));
      onUpdatePlans(updatedPlans);
    } else {
      const plan: WorkoutPlan = {
        id: Math.random().toString(36).slice(2, 9),
        date: planDate,
        title: planTitle,
        tags: newPlan.tags || [],
        exercises: expandedExercises,
        isCompleted: false,
        createdAt: new Date().toISOString()
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
        {
          id: `new-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          exerciseId: exercises[0]?.id || '',
          sets: [{ id: Math.random().toString(36).slice(2, 9), weight: 0, reps: 0, count: 1 }]
        }
      ]
    });
  };

  const removeExerciseFromPlan = (idx: number) => {
    const updated = [...(newPlan.exercises || [])];
    updated.splice(idx, 1);
    setNewPlan({ ...newPlan, exercises: updated });
  };

  const removePlan = (id: string) => {
    if (confirm(t.confirm_delete)) {
      onUpdatePlans(plans.filter(p => p.id !== id));
    }
  };

  const renderPagination = (
    totalItems: number,
    currentPage: number,
    setPage: (p: number) => void,
    colorScheme: 'indigo' | 'slate'
  ) => {
    const totalPages = Math.ceil(totalItems / PLANS_PER_PAGE);
    if (totalPages <= 1) return null;

    return (
      <div className="flex justify-center gap-2 mt-6 mb-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <button
            key={`page-${colorScheme}-${page}`}
            type="button"
            onClick={() => setPage(page)}
            className={`w-9 h-9 rounded-xl text-xs font-black transition-all active:scale-90 shadow-sm ${
              currentPage === page
                ? colorScheme === 'indigo'
                  ? 'bg-indigo-600 text-white shadow-indigo-200'
                  : 'bg-slate-800 text-white shadow-slate-200'
                : colorScheme === 'indigo'
                  ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {page}
          </button>
        ))}
      </div>
    );
  };

  const renderPlanCard = (plan: WorkoutPlan, colorScheme: 'indigo' | 'slate') => (
    <div key={plan.id} id={`plan-${plan.id}`} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden transition-all mb-4 last:mb-0">
      <button
        type="button"
        className="w-full p-5 flex items-center justify-between cursor-pointer active:bg-slate-50 text-left"
        onClick={() => setExpandedPlanId(expandedPlanId === plan.id ? null : plan.id)}
      >
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${plan.isCompleted ? 'bg-emerald-50 text-emerald-500' : colorScheme === 'indigo' ? 'bg-indigo-50 text-indigo-500' : 'bg-slate-50 text-slate-500'}`}>
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
            <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg ${colorScheme === 'indigo' ? 'text-indigo-400 bg-indigo-50' : 'text-slate-400 bg-slate-50'}`}>
              {t.status_incomplete}
            </span>
          )}
          {expandedPlanId === plan.id ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
        </div>
      </button>

      {expandedPlanId === plan.id && (
        <div className="px-5 pb-5 border-t border-slate-50 pt-4 animate-in slide-in-from-top-2">
          <div className="space-y-4">
            {plan.exercises.map((item, exerciseIndex) => {
              const ex = exercises.find(e => e.id === item.exerciseId);
              return (
                <div key={`plan-ex-${plan.id}-${item.exerciseId}-${exerciseIndex}`} className="bg-slate-50 p-4 rounded-2xl">
                  <div className="flex justify-between mb-2">
                    <span className="text-xs font-black text-slate-900">{ex?.name}</span>
                    <span className="text-[10px] font-bold text-slate-400">{item.sets.length} Sets</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {item.sets.map((set, setIndex) => (
                      <div key={set.id || `set-${plan.id}-${exerciseIndex}-${setIndex}`} className="text-[10px] text-slate-500 bg-white p-2 rounded-lg border border-slate-100">
                        Set {setIndex + 1}:{' '}
                        <span className="font-black text-slate-900">{set.weight}kg x {set.reps}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex gap-2 mt-4">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleStartEdit(plan);
              }}
              className="flex-1 p-3 flex items-center justify-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50 rounded-xl active:scale-95 transition-transform"
            >
              <Edit2 size={14} /> {t.edit_plan}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removePlan(plan.id);
              }}
              className="flex-1 p-3 flex items-center justify-center gap-2 text-xs font-bold text-rose-500 bg-rose-50 rounded-xl active:scale-95 transition-transform"
            >
              <Trash2 size={14} /> {t.cancel}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex items-center justify-between shrink-0 px-1">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">{t.plan}</h2>
        <button
          type="button"
          onClick={handleStartAdd}
          className="bg-indigo-600 text-white p-3 rounded-2xl shadow-lg active:scale-95 transition-transform"
        >
          <Plus size={24} />
        </button>
      </div>

      {isAdding ? (
        <form onSubmit={handleSavePlan} className="flex flex-col bg-white rounded-[2.5rem] border border-slate-100 shadow-sm animate-in zoom-in-95">
          <div className="p-6 pb-2 flex justify-between items-center shrink-0">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight italic">
              {editingPlanId ? t.edit_plan : t.add_plan}
            </h3>
            <button type="button" onClick={() => setIsAdding(false)} className="text-slate-400 p-1">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 pt-2 space-y-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="plan-title" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t.plan_title}</label>
                <input
                  id="plan-title"
                  type="text"
                  required
                  placeholder={t.plan_title}
                  value={newPlan.title}
                  onChange={e => setNewPlan({ ...newPlan, title: e.target.value })}
                  className="w-full bg-slate-50 p-3 rounded-xl border-none font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="plan-date" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t.date}</label>
                <input
                  id="plan-date"
                  type="date"
                  required
                  value={newPlan.date}
                  onChange={e => setNewPlan({ ...newPlan, date: e.target.value })}
                  className="w-full bg-slate-50 p-3 rounded-xl border-none font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.exercise}</span>
                <button type="button" onClick={addExerciseToPlan} className="text-[10px] font-black text-indigo-600 uppercase tracking-tight">+ {t.exercise}</button>
              </div>

              {newPlan.exercises?.map((item: PlanFormExercise, idx: number) => (
                <div key={item.id} className="bg-slate-50 p-4 rounded-2xl space-y-3 relative group">
                  <button
                    type="button"
                    onClick={() => removeExerciseFromPlan(idx)}
                    className="absolute -top-1 -right-1 bg-white p-1.5 rounded-full text-rose-500 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  >
                    <X size={12} />
                  </button>

                  <div className="space-y-1">
                    <label htmlFor={`exercise-select-${item.id}`} className="sr-only">{t.exercise}</label>
                    <select
                      id={`exercise-select-${item.id}`}
                      value={item.exerciseId}
                      onChange={e => {
                        const updated = [...(newPlan.exercises || [])];
                        updated[idx].exerciseId = e.target.value;
                        setNewPlan({ ...newPlan, exercises: updated });
                      }}
                      className="w-full bg-white p-2.5 rounded-lg border-none text-sm font-bold shadow-sm focus:ring-2 focus:ring-indigo-500"
                    >
                      {exercises.map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
                    </select>
                  </div>

                  <div className="space-y-2">
                    {item.sets.map((group: PlanSetGroup, groupIdx: number) => (
                      <div key={group.id} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-100 shadow-sm">
                        <div className="flex-1 flex items-center gap-1">
                          <input
                            type="number"
                            aria-label="Weight"
                            value={group.weight || 0}
                            onChange={e => {
                              const updated = [...(newPlan.exercises || [])];
                              updated[idx].sets[groupIdx] = { ...group, weight: parseFloat(e.target.value) || 0 };
                              setNewPlan({ ...newPlan, exercises: updated });
                            }}
                            className="w-full text-center text-sm font-black text-slate-900 bg-slate-50 rounded-lg p-1.5 border border-slate-200 focus:ring-2 focus:ring-indigo-500 transition-all"
                            placeholder="0"
                          />
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">kg</span>
                        </div>

                        <div className="flex-1 flex items-center gap-1">
                          <input
                            type="number"
                            aria-label="Reps"
                            value={group.reps || 0}
                            onChange={e => {
                              const updated = [...(newPlan.exercises || [])];
                              updated[idx].sets[groupIdx] = { ...group, reps: parseInt(e.target.value, 10) || 0 };
                              setNewPlan({ ...newPlan, exercises: updated });
                            }}
                            className="w-full text-center text-sm font-black text-slate-900 bg-slate-50 rounded-lg p-1.5 border border-slate-200 focus:ring-2 focus:ring-indigo-500 transition-all"
                            placeholder="0"
                          />
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">reps</span>
                        </div>

                        <div className="w-16 flex items-center gap-1 bg-indigo-50/50 rounded-lg px-2 py-1.5 border border-indigo-100">
                          <span className="text-[10px] font-black text-indigo-400 italic">×</span>
                          <input
                            type="number"
                            min={1}
                            aria-label="Set count"
                            value={group.count ?? 1}
                            onChange={e => {
                              const nextCount = Math.max(1, parseInt(e.target.value, 10) || 1);
                              const updated = [...(newPlan.exercises || [])];
                              updated[idx].sets[groupIdx] = { ...group, count: nextCount };
                              setNewPlan({ ...newPlan, exercises: updated });
                            }}
                            className="w-full text-center text-sm font-black text-indigo-600 bg-transparent border-none p-0 focus:ring-0"
                            placeholder="1"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...(newPlan.exercises || [])];
                            updated[idx].sets = updated[idx].sets.filter((_, i) => i !== groupIdx);
                            setNewPlan({ ...newPlan, exercises: updated });
                          }}
                          className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...(newPlan.exercises || [])];
                        updated[idx].sets.push({ id: Math.random().toString(36).slice(2, 9), weight: 0, reps: 0, count: 1 });
                        setNewPlan({ ...newPlan, exercises: updated });
                      }}
                      className="text-[10px] font-black text-indigo-600 uppercase italic tracking-widest bg-indigo-50 px-4 py-2.5 rounded-xl hover:bg-indigo-100 active:scale-95 transition-all shadow-sm"
                    >
                      + Add Group
                    </button>
                    <div className="flex-1 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest self-center">
                      Total: {item.sets.reduce((acc: number, set: PlanSetGroup) => acc + (set.count ?? 1), 0)} Sets
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 pt-2 flex gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="flex-1 p-4 bg-slate-100 rounded-2xl font-black text-slate-400 uppercase text-xs active:scale-95 transition-transform"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="flex-[2] p-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs shadow-lg active:scale-95 transition-transform"
            >
              {editingPlanId ? t.update_plan : t.save_plan}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-8 -mx-4 px-4 pb-24">
          {groupedPlans.upcoming.length > 0 && (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setIsUpcomingExpanded(!isUpcomingExpanded)}
                className="flex items-center w-full gap-2 text-indigo-600 ml-1 sticky top-0 bg-slate-50/80 backdrop-blur-sm py-2 z-20 text-left hover:opacity-80 transition-opacity"
                aria-expanded={isUpcomingExpanded}
              >
                <Clock size={18} className={isUpcomingExpanded ? 'animate-pulse' : ''} />
                <h3 className="text-sm font-bold uppercase tracking-widest flex-1">{language === 'zh' ? '未完成' : 'UPCOMING'}</h3>
                <span className="text-[10px] font-black bg-indigo-50 px-2 py-0.5 rounded-full mr-1">{groupedPlans.upcoming.length}</span>
                {isUpcomingExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {isUpcomingExpanded && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="space-y-0">
                    {paginatedIncomplete.map(plan => renderPlanCard(plan, 'indigo'))}
                  </div>
                  {renderPagination(groupedPlans.upcoming.length, incompletePage, setIncompletePage, 'indigo')}
                </div>
              )}
            </div>
          )}

          {groupedPlans.past.length > 0 && (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setIsPastExpanded(!isPastExpanded)}
                className="flex items-center w-full gap-2 text-slate-400 ml-1 sticky top-0 bg-slate-50/80 backdrop-blur-sm py-2 z-20 text-left hover:opacity-80 transition-opacity"
                aria-expanded={isPastExpanded}
              >
                <Calendar size={18} />
                <h3 className="text-sm font-bold uppercase tracking-widest flex-1">{language === 'zh' ? '过去' : 'PAST'}</h3>
                <span className="text-[10px] font-black bg-slate-100 px-2 py-0.5 rounded-full mr-1">{groupedPlans.past.length}</span>
                {isPastExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {isPastExpanded && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="space-y-0">
                    {paginatedPast.map(plan => renderPlanCard(plan, 'slate'))}
                  </div>
                  {renderPagination(groupedPlans.past.length, pastPage, setPastPage, 'slate')}
                </div>
              )}
            </div>
          )}

          {plans.length === 0 && (
            <div className="text-center py-16 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
              <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar size={32} className="text-slate-200" />
              </div>
              <p className="text-slate-400 font-bold italic">{t.no_plans}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PlanManager;
