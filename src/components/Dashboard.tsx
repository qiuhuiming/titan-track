import React, { useMemo, useState, useRef, useEffect } from 'react'
import { WorkoutEntry, Exercise, Language, WorkoutPlan, TabType, NavigationParams } from '../types'
import { translations } from '../translations'
import {
  Calendar,
  ChevronRight,
  XCircle,
  ChevronLeft,
  CheckCircle2,
  Dumbbell,
  Zap,
  ArrowRight,
} from 'lucide-react'

interface DashboardProps {
  logs: WorkoutEntry[]
  exercises: Exercise[]
  plans: WorkoutPlan[]
  language: Language
  onNavigate: (tab: TabType, params?: NavigationParams) => void
}

const Dashboard: React.FC<DashboardProps> = ({ logs, exercises, plans, language, onNavigate }) => {
  const t = translations[language]
  const [viewDate, setViewDate] = useState(new Date())
  const [previewDay, setPreviewDay] = useState<{
    date: string
    day: number
    plan?: WorkoutPlan
    logs: WorkoutEntry[]
    x: number
    y: number
  } | null>(null)

  const longPressTimer = useRef<number | null>(null)

  const handleLongPressStart = (e: React.MouseEvent | React.TouchEvent, dayData: any) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

    longPressTimer.current = window.setTimeout(() => {
      const dayLogs = logs.filter((l) => l.date === dayData.date)
      const dayPlan = plans.find((p) => p.date === dayData.date)

      if (dayPlan || dayLogs.length > 0) {
        setPreviewDay({
          ...dayData,
          plan: dayPlan,
          logs: dayLogs,
          x: clientX,
          y: clientY,
        })

        if ('vibrate' in navigator) {
          navigator.vibrate(50)
        }
      }
    }, 500)
  }

  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  useEffect(() => {
    const handleClick = () => setPreviewDay(null)
    if (previewDay) {
      window.addEventListener('mousedown', handleClick)
      window.addEventListener('touchstart', handleClick)
    }
    return () => {
      window.removeEventListener('mousedown', handleClick)
      window.removeEventListener('touchstart', handleClick)
    }
  }, [previewDay])

  const calendarDays = useMemo(() => {
    const currentMonth = viewDate.getMonth()
    const currentYear = viewDate.getFullYear()
    const firstDay = new Date(currentYear, currentMonth, 1)
    const lastDay = new Date(currentYear, currentMonth + 1, 0)

    const today = new Date()
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    today.setHours(0, 0, 0, 0)

    const days = []
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate()

    // Fill previous month days
    for (let i = firstDay.getDay(); i > 0; i--) {
      days.push({ day: prevMonthLastDay - i + 1, currentMonth: false })
    }

    // Fill current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const dateObj = new Date(currentYear, currentMonth, i)
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      const plan = plans.find((p) => p.date === dateStr)
      const isCompleted = plan?.isCompleted || logs.some((l) => l.date === dateStr)
      const isPlanned = !!plan

      const isPast = dateObj < today
      const isToday = dateStr === todayStr
      const isFuture = dateObj > today

      days.push({
        day: i,
        currentMonth: true,
        date: dateStr,
        isCompleted,
        isPlanned,
        isToday,
        isPast,
        isFuture,
        isMissed: isPlanned && !isCompleted && isPast,
      })
    }

    return days
  }, [plans, logs, viewDate])

  const changeMonth = (offset: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1)
    setViewDate(newDate)
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 mx-auto max-w-4xl space-y-8 pb-8 duration-500">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="mb-1 text-3xl leading-none font-black tracking-tight text-slate-900">
            {t.today_summary}
          </h2>
          <p className="text-sm font-medium text-slate-500">
            {new Date().toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <div className="inline-flex items-center gap-2 self-end rounded-2xl border border-indigo-500/20 bg-indigo-600 px-4 py-2 shadow-lg shadow-indigo-200 sm:self-auto">
          <span className="text-xs leading-none font-black tracking-widest text-indigo-50 uppercase">
            {t.streak}
          </span>
          <div className="h-4 w-[1px] bg-indigo-400/30" />
          <span className="text-sm leading-none font-black text-white">
            {logs.length} {t.days} 🔥
          </span>
        </div>
      </div>

      {/* Calendar View */}
      <div className="group relative overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white p-5 shadow-xl shadow-slate-200/50 sm:p-8">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-indigo-50/50 blur-3xl transition-transform duration-700 group-hover:scale-110" />

        <div className="relative z-10 mb-8 flex items-center justify-between">
          <h3 className="flex items-center gap-3 text-sm font-black tracking-[0.2em] text-slate-400 uppercase">
            <div className="rounded-xl bg-indigo-50 p-2">
              <Calendar size={18} className="text-indigo-600" />
            </div>
            {t.training_calendar}
          </h3>
          <div className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-1.5">
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              className="rounded-xl p-1.5 text-slate-400 transition-all hover:bg-white hover:text-indigo-600 hover:shadow-sm active:scale-95"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="min-w-[100px] text-center text-[11px] font-black tracking-tight text-slate-900 uppercase italic">
              {viewDate.toLocaleString(language === 'zh' ? 'zh-CN' : 'en-US', {
                month: 'short',
                year: 'numeric',
              })}
            </span>
            <button
              type="button"
              onClick={() => changeMonth(1)}
              className="rounded-xl p-1.5 text-slate-400 transition-all hover:bg-white hover:text-indigo-600 hover:shadow-sm active:scale-95"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-7 gap-1.5 sm:gap-3">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, index) => (
            <div
              key={`day-header-${index}`}
              className="mb-2 text-center text-[10px] font-black tracking-widest text-slate-300 uppercase"
            >
              {d}
            </div>
          ))}
          {calendarDays.map((d, i) => {
            let bgColor = 'bg-slate-50'
            let textColor = 'text-slate-900'
            let borderStyle = 'border-transparent'
            let shadow = ''
            let showCheckmark = false
            let showMissedIcon = false

            if (d.currentMonth) {
              if (d.isCompleted) {
                bgColor = 'bg-emerald-50'
                textColor = 'text-emerald-700'
                borderStyle = 'border-emerald-200'
                shadow = 'shadow-sm'
                if (d.isToday) {
                  borderStyle = 'border-emerald-500 ring-4 ring-emerald-100'
                  shadow = 'shadow-md shadow-emerald-100'
                }
                showCheckmark = true
              } else if (d.isPlanned) {
                if (d.isMissed) {
                  bgColor = 'bg-rose-50'
                  textColor = 'text-rose-600'
                  borderStyle = 'border-rose-200'
                  shadow = 'shadow-sm'
                  showMissedIcon = true
                } else {
                  bgColor = 'bg-indigo-50'
                  textColor = 'text-indigo-700'
                  borderStyle = 'border-indigo-200'
                  shadow = 'shadow-sm shadow-indigo-50'
                  if (d.isToday) {
                    borderStyle = 'border-indigo-500 ring-4 ring-indigo-100'
                    shadow = 'shadow-md shadow-indigo-100'
                  }
                }
              } else if (d.isToday) {
                bgColor = 'bg-white'
                borderStyle = 'border-indigo-400 ring-4 ring-indigo-50'
                textColor = 'text-indigo-600'
                shadow = 'shadow-md shadow-indigo-50'
              } else if (d.isPast) {
                bgColor = 'bg-slate-50/30'
                textColor = 'text-slate-400'
              } else {
                bgColor = 'bg-white'
                textColor = 'text-slate-500'
                borderStyle = 'border-slate-100'
              }
            } else {
              textColor = 'text-slate-300 opacity-30'
              bgColor = 'bg-transparent'
            }

            const dayKey = d.currentMonth ? `day-${d.date}` : `prev-${i}-${d.day}`

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
                    d.currentMonth && handleLongPressStart(e as any, d)
                  }
                }}
                onKeyUp={handleLongPressEnd}
                className={`relative flex aspect-square flex-col items-center justify-center rounded-xl border transition-all sm:rounded-2xl ${borderStyle} ${bgColor} ${textColor} ${shadow} ${
                  d.isPlanned
                    ? 'z-10 scale-105 cursor-pointer hover:scale-110'
                    : 'hover:bg-slate-100/50'
                }`}
              >
                <span
                  className={`text-[10px] font-black sm:text-xs ${d.isToday && !d.isCompleted && !d.isPlanned ? 'underline decoration-2 underline-offset-2' : ''}`}
                >
                  {d.day}
                </span>

                {showCheckmark && (
                  <CheckCircle2
                    size={10}
                    className={`absolute bottom-1 sm:bottom-1.5 ${d.isCompleted && d.isPlanned ? 'text-emerald-600' : 'text-emerald-500'}`}
                    strokeWidth={3}
                  />
                )}

                {showMissedIcon && (
                  <XCircle
                    size={10}
                    className="absolute bottom-1 text-rose-500 sm:bottom-1.5"
                    strokeWidth={3}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {previewDay && (
        <div
          className="animate-in zoom-in-95 fade-in fixed z-[100] duration-300"
          style={{
            left: Math.min(window.innerWidth - 300, Math.max(20, previewDay.x - 150)),
            top: Math.max(20, previewDay.y - 220),
          }}
        >
          <div
            role="none"
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            className="w-[300px] overflow-hidden rounded-[2.5rem] border border-white bg-white/98 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14),0_0_0_1px_rgba(0,0,0,0.02)] backdrop-blur-2xl"
          >
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 text-white">
              <div className="absolute top-0 right-0 -mt-8 -mr-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
              <div className="relative z-10 flex items-start justify-between">
                <div className="mb-2 flex items-center gap-2 text-[11px] font-black tracking-[0.25em] text-indigo-100/80 uppercase">
                  <Calendar size={12} className="text-indigo-200" />
                  {new Date(previewDay.date).toLocaleDateString(
                    language === 'zh' ? 'zh-CN' : 'en-US',
                    { month: 'short', day: 'numeric', year: 'numeric' }
                  )}
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onNavigate(TabType.PLAN, { date: previewDay.date })
                    setPreviewDay(null)
                  }}
                  className="group/btn flex items-center gap-2 rounded-xl border border-white/30 bg-white/20 px-3 py-2 transition-all duration-200 hover:bg-white/30 active:scale-95"
                >
                  <span className="text-[11px] font-black tracking-wider uppercase">
                    {(t as any).go_to_plan}
                  </span>
                  <ArrowRight
                    size={14}
                    className="transition-transform group-hover/btn:translate-x-0.5"
                  />
                </button>
              </div>
              <h4 className="relative z-10 text-2xl leading-tight font-black tracking-tight break-words">
                {previewDay.plan?.title ||
                  (previewDay.logs.length > 0
                    ? language === 'zh'
                      ? '自主训练'
                      : 'Free Session'
                    : '')}
              </h4>
            </div>

            <div className="space-y-6 p-6">
              {previewDay.plan && (
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[11px] font-black tracking-[0.15em] text-slate-400 uppercase">
                      <Dumbbell size={14} className="text-indigo-500" />
                      {language === 'zh' ? '训练项目' : 'EXERCISES'}
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-[10px] font-black tracking-wider uppercase ${
                        previewDay.plan.isCompleted
                          ? 'border border-emerald-100 bg-emerald-50 text-emerald-600'
                          : 'border border-indigo-100 bg-indigo-50 text-indigo-600'
                      }`}
                    >
                      {previewDay.plan.isCompleted
                        ? language === 'zh'
                          ? '已完成'
                          : 'Completed'
                        : language === 'zh'
                          ? '计划中'
                          : 'Planned'}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {previewDay.plan.exercises.map((ex) => {
                      const exerciseName =
                        exercises.find((e) => e.id === ex.exerciseId)?.name ||
                        (language === 'zh' ? '动作' : 'Exercise')
                      return (
                        <div
                          key={ex.exerciseId}
                          className="group flex items-center gap-3 text-sm font-bold text-slate-700"
                        >
                          <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(79,70,229,0.4)]" />
                          {exerciseName}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {!previewDay.plan && previewDay.logs.length > 0 && (
                <div>
                  <div className="mb-4 flex items-center gap-2 text-[11px] font-black tracking-[0.15em] text-slate-400 uppercase">
                    <Zap size={14} className="text-emerald-500" />
                    {language === 'zh' ? '训练记录' : 'WORKOUT LOGS'}
                  </div>
                  <div className="space-y-3">
                    {Array.from(new Set(previewDay.logs.map((l) => l.exerciseId))).map((id) => {
                      const exerciseName =
                        exercises.find((e) => e.id === id)?.name ||
                        (language === 'zh' ? '动作' : 'Exercise')
                      return (
                        <div
                          key={id}
                          className="flex items-center gap-3 text-sm font-bold text-slate-700"
                        >
                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                          {exerciseName}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {previewDay.plan?.tags && previewDay.plan.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 border-t border-slate-50 pt-5">
                  {previewDay.plan.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-lg border border-slate-200/50 bg-slate-100/80 px-3 py-1 text-[10px] font-black tracking-wider text-slate-500 uppercase"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-center gap-2 pt-2">
                <div className="h-1 w-1 rounded-full bg-slate-200" />
                <div className="h-1 w-1 rounded-full bg-slate-200" />
                <div className="h-1 w-1 rounded-full bg-slate-200" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
