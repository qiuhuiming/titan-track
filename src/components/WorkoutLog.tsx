import {
  ArrowRight,
  Calendar,
  Check,
  CheckCircle,
  ClipboardList,
  Clock,
  Play,
  Plus,
  SkipForward,
  Trash2,
  X,
} from 'lucide-react'
import type { FC } from 'react'
import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { translations } from '../translations'
import type { Exercise, Language, WorkoutEntry, WorkoutPlan, WorkoutSet } from '../types'

interface WorkoutLogProps {
  logs: WorkoutEntry[]
  exercises: Exercise[]
  plans: WorkoutPlan[]
  onUpdateLogs: (logs: WorkoutEntry[]) => void
  onUpdatePlans: (plans: WorkoutPlan[]) => void
  language: Language
}

const WorkoutLog: FC<WorkoutLogProps> = ({
  logs,
  exercises,
  plans,
  onUpdateLogs,
  onUpdatePlans,
  language,
}) => {
  const t = translations[language]
  const [isAdding, setIsAdding] = useState(false)

  // State for the multi-exercise form (plan based)
  const [activePlan, setActivePlan] = useState<WorkoutPlan | null>(null)
  const [planProgress, setPlanProgress] = useState<
    { exerciseId: string; sets: WorkoutSet[]; skipped?: boolean }[]
  >([])
  const [activePlanOriginalDate, setActivePlanOriginalDate] = useState<string | null>(null)

  const todayStr = new Date().toISOString().split('T')[0]
  const hasExercises = exercises.length > 0

  // Find the next nearest incomplete plan
  const upcomingPlan = useMemo((): WorkoutPlan | null => {
    const incompletePlans = plans
      .filter((p) => !p.isCompleted)
      .sort((a, b) => a.date.localeCompare(b.date))

    // First try to find today's plan
    const todayPlan = incompletePlans.find((p) => p.date === todayStr)
    if (todayPlan) return todayPlan

    // Otherwise find the first one in the future
    const futurePlan = incompletePlans.find((p) => p.date > todayStr)
    if (futurePlan) return futurePlan

    // If no future plans, find the most recent missed one
    return incompletePlans[incompletePlans.length - 1] ?? null
  }, [plans, todayStr])

  const startLoggingPlan = (plan: WorkoutPlan, forceToday: boolean = false) => {
    let targetPlan = plan
    if (forceToday && plan.date !== todayStr) {
      setActivePlanOriginalDate(plan.date)
      const updatedPlans = plans.map((p) => (p.id === plan.id ? { ...p, date: todayStr } : p))
      onUpdatePlans(updatedPlans)
      targetPlan = { ...plan, date: todayStr }
    } else {
      setActivePlanOriginalDate(null)
    }

    setActivePlan(targetPlan)
    setPlanProgress(
      targetPlan.exercises.map((ex) => ({
        exerciseId: ex.exerciseId,
        skipped: false,
        sets: ex.sets.map((s) => ({ ...s, completed: false, rpe: 7, notes: '' })),
      }))
    )
    setIsAdding(true)
  }

  const [formData, setFormData] = useState({
    date: todayStr,
    workoutType: '',
    exerciseId: exercises[0]?.id || '',
    sets: [{ id: '1', weight: 0, reps: 0, rpe: 7, completed: true }] as WorkoutSet[],
  })

  const formDateId = 'workout-log-date'
  const formTypeId = 'workout-log-type'
  const formExerciseId = 'workout-log-exercise'

  const updatePlanSet = (
    exIdx: number,
    setIdx: number,
    field: keyof WorkoutSet,
    value: WorkoutSet[keyof WorkoutSet]
  ) => {
    const updatedProgress = [...planProgress]
    updatedProgress[exIdx].sets[setIdx] = {
      ...updatedProgress[exIdx].sets[setIdx],
      [field]: value,
    }
    // If user interacts with a set, mark the exercise as not skipped
    updatedProgress[exIdx].skipped = false
    setPlanProgress(updatedProgress)
  }

  const toggleSkipExercise = (exIdx: number) => {
    const updatedProgress = [...planProgress]
    const currentlySkipped = updatedProgress[exIdx].skipped
    updatedProgress[exIdx].skipped = !currentlySkipped

    // If skipping, mark all sets as incomplete to be safe
    if (!currentlySkipped) {
      updatedProgress[exIdx].sets = updatedProgress[exIdx].sets.map((s) => ({
        ...s,
        completed: false,
      }))
    }
    setPlanProgress(updatedProgress)
  }

  const completeAllSets = (exIdx: number) => {
    const updatedProgress = [...planProgress]
    updatedProgress[exIdx].skipped = false
    updatedProgress[exIdx].sets = updatedProgress[exIdx].sets.map((s) => ({
      ...s,
      completed: true,
    }))
    setPlanProgress(updatedProgress)
  }

  const handleCancelLogging = () => {
    if (activePlan && activePlanOriginalDate && activePlan.date !== activePlanOriginalDate) {
      const updatedPlans = plans.map((p) =>
        p.id === activePlan.id ? { ...p, date: activePlanOriginalDate } : p
      )
      onUpdatePlans(updatedPlans)
    }
    setIsAdding(false)
    setActivePlan(null)
    setPlanProgress([])
    setActivePlanOriginalDate(null)
  }

  const handleCompletePlan = () => {
    if (!activePlan) return

    // Only log exercises that weren't skipped and have at least one completed set
    const logsToSave: WorkoutEntry[] = planProgress
      .filter((p) => !p.skipped)
      .map((p) => ({
        id: Math.random().toString(36).substring(2, 11),
        date: activePlan.date,
        exerciseId: p.exerciseId,
        workoutType: activePlan.title,
        sets: p.sets,
        planId: activePlan.id,
      }))

    if (logsToSave.length > 0) {
      onUpdateLogs([...logs, ...logsToSave])
    }

    const updatedPlans = plans.map((p) =>
      p.id === activePlan.id ? { ...p, isCompleted: true } : p
    )
    onUpdatePlans(updatedPlans)

    setIsAdding(false)
    setActivePlan(null)
    setPlanProgress([])
    setActivePlanOriginalDate(null)
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newEntry: WorkoutEntry = {
      id: Math.random().toString(36).substring(2, 11),
      ...formData,
    }
    onUpdateLogs([...logs, newEntry])
    setIsAdding(false)
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 space-y-6 pb-12 duration-500">
      {!isAdding ? (
        <div className="flex flex-col space-y-6">
          {/* Upcoming Mission Card */}
          <div className="group relative overflow-hidden rounded-[2.5rem] bg-slate-900 p-6 text-white shadow-2xl shadow-slate-200 md:p-8">
            <div className="absolute top-0 right-0 p-8 opacity-10 transition-transform duration-500 group-hover:scale-110">
              <Calendar size={100} />
            </div>

            <div className="relative z-10">
              <div className="mb-4 flex items-center gap-2 md:mb-6">
                <div className="h-2 w-2 animate-pulse rounded-full bg-indigo-500"></div>
                <span className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">
                  Next Mission
                </span>
              </div>

              {upcomingPlan ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="mb-2 text-2xl leading-tight font-black tracking-tight uppercase italic sm:text-3xl">
                      {upcomingPlan.title}
                    </h3>
                    <div className="flex items-center gap-4 text-slate-400">
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        <span className="text-xs font-bold uppercase">
                          {upcomingPlan.date === todayStr ? 'Today' : upcomingPlan.date}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ClipboardList size={14} />
                        <span className="text-xs font-bold uppercase">
                          {upcomingPlan.exercises.length} Exercises
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => {
                        startLoggingPlan(upcomingPlan, upcomingPlan.date !== todayStr)
                      }}
                      disabled={!hasExercises}
                      className={`flex flex-1 items-center justify-center gap-3 rounded-2xl px-6 py-4 font-black shadow-lg transition-all active:scale-95 ${hasExercises ? 'bg-indigo-600 text-white shadow-indigo-900/20 hover:bg-indigo-500' : 'cursor-not-allowed bg-slate-700/40 text-slate-300 shadow-none'}`}
                    >
                      <Play size={18} fill="currentColor" />
                      <span className="text-sm tracking-widest uppercase">
                        {upcomingPlan.date === todayStr ? 'Start Now' : 'Move to Today & Start'}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAdding(true)
                      }}
                      disabled={!hasExercises}
                      className={`flex items-center justify-center gap-2 rounded-2xl px-6 py-4 font-black backdrop-blur-sm transition-all ${hasExercises ? 'bg-white/10 text-white hover:bg-white/20' : 'cursor-not-allowed bg-white/5 text-slate-400'}`}
                    >
                      <Plus size={18} />
                      <span className="text-sm tracking-widest uppercase">Other</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <p className="font-bold text-slate-400 italic">
                    No plans scheduled. Ready to wing it?
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAdding(true)
                    }}
                    disabled={!hasExercises}
                    className={`w-full rounded-2xl px-10 py-4 text-sm font-black tracking-widest uppercase shadow-lg transition-transform active:scale-95 ${hasExercises ? 'bg-white text-slate-900' : 'cursor-not-allowed bg-slate-700/40 text-slate-300 shadow-none'}`}
                  >
                    {t.log_new_session}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="mb-4 flex items-center justify-between px-2">
              <h4 className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                {t.past_records}
              </h4>
              <ArrowRight size={16} className="text-slate-300" />
            </div>
            <div className="space-y-3">
              {[...logs]
                .reverse()
                .slice(0, 10)
                .map((log) => {
                  const ex = exercises.find((e) => e.id === log.exerciseId)
                  return (
                    <div
                      key={log.id}
                      className="flex items-center justify-between rounded-[2rem] border border-slate-100 bg-white p-4 shadow-sm transition-colors hover:border-indigo-100 md:p-5"
                    >
                      <div className="flex items-center gap-3 overflow-hidden md:gap-4">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500">
                          <CheckCircle size={20} />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate leading-tight font-black text-slate-900">
                            {ex?.name || '???'}
                          </p>
                          <p className="mt-0.5 text-[10px] font-bold tracking-widest text-indigo-500 uppercase">
                            {log.date}
                          </p>
                        </div>
                      </div>
                      <div className="ml-2 flex-shrink-0 text-right">
                        <p className="text-xs font-black text-slate-900 uppercase md:text-sm">
                          {log.sets.length}{' '}
                          {language === 'en' ? (log.sets.length > 1 ? 'Sets' : 'Set') : '组'}
                        </p>
                        <p className="max-w-[100px] truncate text-[9px] font-bold tracking-tighter text-slate-300 uppercase">
                          {log.workoutType}
                        </p>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        </div>
      ) : (
        createPortal(
          <div className="animate-in slide-in-from-bottom-4 fixed inset-0 z-[60] flex flex-col bg-white duration-300">
            <div className="pt-safe flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <button
                type="button"
                onClick={handleCancelLogging}
                className="rounded-xl bg-slate-50 p-2 text-slate-400"
              >
                <X size={24} />
              </button>
              <h3 className="text-lg font-black tracking-tight text-slate-900 uppercase italic">
                {activePlan ? activePlan.title : t.log_workout}
              </h3>
              <div className="w-10"></div>
            </div>

            <div
              className="flex-grow space-y-8 overflow-y-auto p-6 pb-32"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {activePlan ? (
                <div className="space-y-12">
                  {planProgress.map((p, exIdx) => {
                    const ex = exercises.find((e) => e.id === p.exerciseId)
                    const completedSetsCount = p.sets.filter((s) => s.completed).length
                    const allDone = completedSetsCount === p.sets.length

                    return (
                      <div
                        key={p.exerciseId}
                        className={`space-y-4 transition-all duration-300 ${p.skipped ? 'scale-[0.98] opacity-40 grayscale' : 'opacity-100'}`}
                      >
                        <div className="flex items-center justify-between px-1">
                          <div className="flex items-center gap-3">
                            <div
                              className={`h-6 w-1.5 rounded-full transition-colors ${p.skipped ? 'bg-slate-300' : allDone ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                            ></div>
                            <h4 className="text-lg font-black tracking-tight text-slate-900 uppercase italic">
                              {ex?.name}
                            </h4>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                toggleSkipExercise(exIdx)
                              }}
                              className={`rounded-xl border p-2 transition-all ${p.skipped ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-400'}`}
                              title={t.skip_exercise}
                            >
                              <SkipForward size={16} />
                            </button>
                            {!p.skipped && (
                              <button
                                type="button"
                                onClick={() => {
                                  completeAllSets(exIdx)
                                }}
                                className={`rounded-xl border p-2 transition-all ${allDone ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-emerald-200 bg-white text-emerald-500'}`}
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
                              <div
                                key={set.id}
                                className={`rounded-[2rem] border-2 bg-slate-50 p-5 transition-all ${set.completed ? 'border-emerald-500 bg-emerald-50/20 opacity-60' : 'border-transparent'}`}
                              >
                                <div className="mb-4 flex items-center justify-between px-1">
                                  <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                                    Set {setIdx + 1}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      updatePlanSet(exIdx, setIdx, 'completed', !set.completed)
                                    }}
                                    className={`rounded-xl px-4 py-2 text-[9px] font-black uppercase transition-all ${set.completed ? 'bg-emerald-500 text-white shadow-md shadow-emerald-100' : 'border border-slate-200 bg-white text-slate-400 hover:border-indigo-300'}`}
                                  >
                                    {set.completed ? t.status_completed : t.status_incomplete}
                                  </button>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                  <div className="rounded-2xl bg-white p-3 text-center shadow-sm">
                                    <p className="mb-1 text-[8px] font-black tracking-widest text-slate-300 uppercase">
                                      KG
                                    </p>
                                    <input
                                      type="number"
                                      aria-label="Weight in kg"
                                      value={set.weight}
                                      onChange={(e) => {
                                        updatePlanSet(
                                          exIdx,
                                          setIdx,
                                          'weight',
                                          parseFloat(e.target.value)
                                        )
                                      }}
                                      className="w-full bg-transparent text-center text-lg font-black text-slate-900 outline-none"
                                    />
                                  </div>
                                  <div className="rounded-2xl bg-white p-3 text-center shadow-sm">
                                    <p className="mb-1 text-[8px] font-black tracking-widest text-slate-300 uppercase">
                                      Reps
                                    </p>
                                    <input
                                      type="number"
                                      aria-label="Reps"
                                      value={set.reps}
                                      onChange={(e) => {
                                        updatePlanSet(
                                          exIdx,
                                          setIdx,
                                          'reps',
                                          parseInt(e.target.value, 10)
                                        )
                                      }}
                                      className="w-full bg-transparent text-center text-lg font-black text-slate-900 outline-none"
                                    />
                                  </div>
                                  <div className="rounded-2xl bg-white p-3 text-center shadow-sm">
                                    <p className="mb-1 text-[8px] font-black tracking-widest text-slate-300 uppercase">
                                      RPE
                                    </p>
                                    <input
                                      type="number"
                                      aria-label="RPE"
                                      value={set.rpe}
                                      onChange={(e) => {
                                        updatePlanSet(
                                          exIdx,
                                          setIdx,
                                          'rpe',
                                          parseInt(e.target.value, 10)
                                        )
                                      }}
                                      className="w-full bg-transparent text-center text-lg font-black text-slate-900 outline-none"
                                    />
                                  </div>
                                </div>
                                <input
                                  type="text"
                                  aria-label="Notes"
                                  placeholder={t.notes}
                                  value={set.notes}
                                  onChange={(e) => {
                                    updatePlanSet(exIdx, setIdx, 'notes', e.target.value)
                                  }}
                                  className="mt-4 w-full rounded-2xl border border-slate-100 bg-white p-3 text-xs font-bold text-slate-600 shadow-sm outline-none"
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        {p.skipped && (
                          <div className="rounded-[2rem] border border-dashed border-slate-200 bg-slate-100/50 p-6 text-center">
                            <p className="flex items-center justify-center gap-2 text-xs font-black tracking-widest text-slate-400 uppercase italic">
                              <SkipForward size={14} /> Exercise Skipped
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                toggleSkipExercise(exIdx)
                              }}
                              className="mt-2 text-[10px] font-bold text-indigo-600 underline"
                            >
                              Undo Skip
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : !hasExercises ? (
                <div className="space-y-2 rounded-[2rem] border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                  <p className="text-sm font-black tracking-widest text-slate-700 uppercase">
                    {t.no_exercises_title}
                  </p>
                  <p className="text-xs font-bold text-slate-400">{t.no_exercises_hint}</p>
                </div>
              ) : (
                <div className="animate-in fade-in space-y-6 duration-500">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label
                          htmlFor={formDateId}
                          className="ml-1 text-[10px] font-bold tracking-widest text-slate-400 uppercase"
                        >
                          {t.date}
                        </label>
                        <input
                          id={formDateId}
                          type="date"
                          value={formData.date}
                          onChange={(e) => {
                            setFormData({ ...formData, date: e.target.value })
                          }}
                          className="w-full rounded-2xl border-none bg-slate-50 p-4 font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label
                          htmlFor={formTypeId}
                          className="ml-1 text-[10px] font-bold tracking-widest text-slate-400 uppercase"
                        >
                          {t.type}
                        </label>
                        <input
                          id={formTypeId}
                          type="text"
                          placeholder={t.type}
                          value={formData.workoutType}
                          onChange={(e) => {
                            setFormData({ ...formData, workoutType: e.target.value })
                          }}
                          className="w-full rounded-2xl border-none bg-slate-50 p-4 font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label
                        htmlFor={formExerciseId}
                        className="ml-1 text-[10px] font-bold tracking-widest text-slate-400 uppercase"
                      >
                        {t.exercise}
                      </label>
                      <select
                        id={formExerciseId}
                        value={formData.exerciseId}
                        onChange={(e) => {
                          setFormData({ ...formData, exerciseId: e.target.value })
                        }}
                        className="w-full appearance-none rounded-2xl border-none bg-slate-50 p-4 font-bold text-slate-900 shadow-sm focus:ring-2 focus:ring-indigo-500"
                      >
                        {exercises.map((ex) => (
                          <option key={ex.id} value={ex.id}>
                            {ex.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="mb-2 flex items-center justify-between px-1">
                      <h4 className="text-sm font-black tracking-tight text-slate-900 uppercase">
                        {t.sets_data}
                      </h4>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            sets: [
                              ...formData.sets,
                              {
                                id: Math.random().toString(),
                                weight: 0,
                                reps: 0,
                                rpe: 7,
                                completed: true,
                              },
                            ],
                          })
                        }}
                        className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-600"
                      >
                        + {t.add_set.toUpperCase()}
                      </button>
                    </div>
                    {formData.sets.map((set, i) => (
                      <div
                        key={set.id}
                        className="flex flex-col gap-4 rounded-[2rem] border border-slate-100 bg-slate-50 p-5 shadow-sm"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-slate-100 bg-white text-xs font-black text-slate-400 shadow-sm">
                            {i + 1}
                          </div>
                          <div className="grid flex-1 grid-cols-3 gap-2">
                            <div className="rounded-xl bg-white p-2 text-center shadow-sm">
                              <p className="text-[8px] font-black tracking-widest text-slate-300 uppercase">
                                KG
                              </p>
                              <input
                                type="number"
                                aria-label="Weight in kg"
                                placeholder="KG"
                                value={set.weight || ''}
                                onChange={(e) => {
                                  const updated = [...formData.sets]
                                  updated[i].weight = parseFloat(e.target.value)
                                  setFormData({ ...formData, sets: updated })
                                }}
                                className="w-full bg-transparent text-center font-black text-slate-900 outline-none"
                              />
                            </div>
                            <div className="rounded-xl bg-white p-2 text-center shadow-sm">
                              <p className="text-[8px] font-black tracking-widest text-slate-300 uppercase">
                                Reps
                              </p>
                              <input
                                type="number"
                                aria-label="Reps"
                                placeholder="REPS"
                                value={set.reps || ''}
                                onChange={(e) => {
                                  const updated = [...formData.sets]
                                  updated[i].reps = parseInt(e.target.value, 10)
                                  setFormData({ ...formData, sets: updated })
                                }}
                                className="w-full bg-transparent text-center font-black text-slate-900 outline-none"
                              />
                            </div>
                            <div className="rounded-xl bg-white p-2 text-center shadow-sm">
                              <p className="text-[8px] font-black tracking-widest text-slate-300 uppercase">
                                RPE
                              </p>
                              <input
                                type="number"
                                aria-label="RPE"
                                placeholder="RPE"
                                value={set.rpe || ''}
                                onChange={(e) => {
                                  const updated = [...formData.sets]
                                  updated[i].rpe = parseInt(e.target.value, 10)
                                  setFormData({ ...formData, sets: updated })
                                }}
                                className="w-full bg-transparent text-center font-black text-slate-900 outline-none"
                              />
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                sets: formData.sets.filter((s) => s.id !== set.id),
                              })
                            }}
                            className="rounded-xl p-2 text-rose-500 transition-colors hover:bg-rose-50"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="fixed right-0 bottom-0 left-0 border-t border-slate-100 bg-white/80 p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] backdrop-blur-lg">
              <button
                type="button"
                onClick={activePlan ? handleCompletePlan : handleManualSubmit}
                disabled={!hasExercises}
                className={`w-full rounded-[2rem] py-5 text-sm font-black tracking-widest uppercase shadow-2xl transition-transform active:scale-95 ${hasExercises ? 'bg-indigo-600 text-white shadow-indigo-100' : 'cursor-not-allowed bg-slate-200 text-slate-400 shadow-none'}`}
              >
                {activePlan ? t.complete_plan : t.save_workout}
              </button>
            </div>
          </div>,
          document.body
        )
      )}
    </div>
  )
}

export default WorkoutLog
