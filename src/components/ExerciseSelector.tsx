import React, { useState, useMemo } from 'react'
import { Search, X, Check, Zap } from 'lucide-react'
import type { Exercise, Language, MuscleGroup } from '../types'
import { translations } from '../translations'

interface ExerciseSelectorProps {
  exercises: Exercise[]
  selectedExerciseId: string
  onSelect: (exerciseId: string) => void
  language: Language
  onClose?: () => void
}

const MUSCLE_GROUPS: MuscleGroup[] = [
  'Chest',
  'Back',
  'Legs',
  'Shoulders',
  'Arms',
  'Core',
  'Full Body',
  'Cardio',
]

const ExerciseSelector: React.FC<ExerciseSelectorProps> = ({
  exercises,
  selectedExerciseId,
  onSelect,
  language,
  onClose,
}) => {
  const t = translations[language]
  const [searchTerm, setSearchTerm] = useState('')
  const [filterGroup, setFilterGroup] = useState<MuscleGroup | 'All'>('All')

  const filteredExercises = useMemo(() => {
    return exercises.filter((ex) => {
      const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesFilter = filterGroup === 'All' || ex.muscleGroup === filterGroup
      return matchesSearch && matchesFilter
    })
  }, [exercises, searchTerm, filterGroup])

  const groupedExercises = useMemo(() => {
    const groups: Record<string, Exercise[]> = {}
    filteredExercises.forEach((ex) => {
      const groupName = ex.muscleGroup as string
      if (!(groupName in groups)) {
        groups[groupName] = []
      }
      groups[groupName].push(ex)
    })
    return groups
  }, [filteredExercises])

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="sticky top-0 z-10 space-y-4 bg-white/80 p-4 backdrop-blur-md">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder={t.search_exercises}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
            }}
            className="w-full rounded-2xl border-none bg-slate-100 py-3 pr-4 pl-10 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('')
              }}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => {
              setFilterGroup('All')
            }}
            className={`shrink-0 rounded-xl px-4 py-2 text-[10px] font-black tracking-widest uppercase transition-all ${
              filterGroup === 'All'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            {t.all_muscle_groups}
          </button>
          {MUSCLE_GROUPS.map((mg) => (
            <button
              key={mg}
              type="button"
              onClick={() => {
                setFilterGroup(mg)
              }}
              className={`shrink-0 rounded-xl px-4 py-2 text-[10px] font-black tracking-widest uppercase transition-all ${
                filterGroup === mg
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {t.muscle_groups[mg]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pt-0">
        {Object.entries(groupedExercises).map(([group, groupExs]) => (
          <div key={group} className="mb-6 last:mb-0">
            <h4 className="mb-3 ml-1 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">
              {t.muscle_groups[group as MuscleGroup]}
            </h4>
            <div className="space-y-2">
              {groupExs.map((ex) => (
                <button
                  key={ex.id}
                  type="button"
                  onClick={() => {
                    onSelect(ex.id)
                    onClose?.()
                  }}
                  className={`flex w-full items-center justify-between rounded-2xl p-4 text-left transition-all active:scale-[0.98] ${
                    selectedExerciseId === ex.id
                      ? 'bg-indigo-50 ring-2 ring-indigo-500 ring-inset'
                      : 'bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`rounded-xl p-2 ${
                        selectedExerciseId === ex.id
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white text-slate-400 shadow-sm'
                      }`}
                    >
                      <Zap size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">{ex.name}</p>
                      {ex.equipment && (
                        <p className="text-[10px] font-bold tracking-tight text-slate-400 uppercase">
                          {ex.equipment}
                        </p>
                      )}
                    </div>
                  </div>
                  {selectedExerciseId === ex.id && (
                    <div className="rounded-full bg-indigo-600 p-1 text-white">
                      <Check size={14} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}

        {filteredExercises.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 rounded-full bg-slate-50 p-6 text-slate-200">
              <Search size={32} />
            </div>
            <p className="font-bold text-slate-400 italic">No exercises found</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ExerciseSelector
