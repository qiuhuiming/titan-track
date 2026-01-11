import { Edit2, Filter, Plus, Search, Trash2, Zap } from 'lucide-react'
import type { ChangeEvent, FC, FormEvent } from 'react'
import { useState } from 'react'
import { translations } from '../translations'
import type { Exercise, Language, MuscleGroup } from '../types'

interface ExerciseManagerProps {
  exercises: Exercise[]
  onUpdateExercises: (exercises: Exercise[]) => void
  language: Language
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

const ExerciseManager: FC<ExerciseManagerProps> = ({ exercises, onUpdateExercises, language }) => {
  const t = translations[language]
  const [searchTerm, setSearchTerm] = useState('')
  const [filterGroup, setFilterGroup] = useState<MuscleGroup | 'All'>('All')
  const [isAdding, setIsAdding] = useState(false)
  const [newExercise, setNewExercise] = useState({
    name: '',
    muscleGroup: 'Chest' as MuscleGroup,
    equipment: '',
    notes: '',
  })

  const handleFilterChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setFilterGroup(event.target.value as MuscleGroup | 'All')
  }

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setNewExercise((prev) => ({ ...prev, name: event.target.value }))
  }

  const handleMuscleGroupChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setNewExercise((prev) => ({ ...prev, muscleGroup: event.target.value as MuscleGroup }))
  }

  const handleEquipmentChange = (event: ChangeEvent<HTMLInputElement>) => {
    setNewExercise((prev) => ({ ...prev, equipment: event.target.value }))
  }

  const filteredExercises = exercises.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterGroup === 'All' || ex.muscleGroup === filterGroup
    return matchesSearch && matchesFilter
  })

  const handleAdd = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const ex: Exercise = {
      id: Math.random().toString(36).substr(2, 9),
      ...newExercise,
    }
    onUpdateExercises([...exercises, ex])
    setIsAdding(false)
    setNewExercise({ name: '', muscleGroup: 'Chest', equipment: '', notes: '' })
  }

  const deleteExercise = (id: string) => {
    if (confirm(t.confirm_delete)) {
      onUpdateExercises(exercises.filter((ex) => ex.id !== id))
    }
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 duration-500">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">{t.exercise_arsenal}</h2>
          <p className="mt-1 text-slate-500">{t.manage_arsenal}</p>
        </div>
        <button
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center justify-center space-x-2 rounded-xl bg-indigo-600 px-5 py-2.5 font-bold text-white shadow-md shadow-indigo-100 transition-all hover:bg-indigo-700"
        >
          <Plus size={20} />
          <span>{isAdding ? t.cancel : t.new_exercise}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="relative md:col-span-2">
          <Search className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder={t.search_exercises}
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pr-4 pl-10 shadow-sm outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="relative">
          <Filter className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" size={20} />
          <select
            value={filterGroup}
            onChange={handleFilterChange}
            className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pr-4 pl-10 shadow-sm outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">{t.all_muscle_groups}</option>
            {MUSCLE_GROUPS.map((mg) => (
              <option key={mg} value={mg}>
                {t.muscle_groups[mg]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isAdding && (
        <div className="animate-in fade-in slide-in-from-top-2 space-y-6 rounded-[2rem] border border-slate-100 bg-slate-50/80 p-6 shadow-sm duration-300 md:p-8">
          <form onSubmit={handleAdd} className="space-y-6">
            <h3 className="text-2xl font-bold text-slate-900">{t.add_new_exercise}</h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label
                  htmlFor="exercise-name-input"
                  className="mb-1 block text-sm font-semibold text-slate-700"
                >
                  {t.exercise_name}
                </label>
                <input
                  id="exercise-name-input"
                  type="text"
                  required
                  placeholder="e.g., Incline Dumbbell Press"
                  value={newExercise.name}
                  onChange={handleNameChange}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label
                  htmlFor="muscle-group-select"
                  className="mb-1 block text-sm font-semibold text-slate-700"
                >
                  {t.muscle_group}
                </label>
                <select
                  id="muscle-group-select"
                  value={newExercise.muscleGroup}
                  onChange={handleMuscleGroupChange}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {MUSCLE_GROUPS.map((mg) => (
                    <option key={mg} value={mg}>
                      {t.muscle_groups[mg]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="equipment-input"
                  className="mb-1 block text-sm font-semibold text-slate-700"
                >
                  {t.equipment}
                </label>
                <input
                  id="equipment-input"
                  type="text"
                  placeholder="e.g., Dumbbell, Cable, Barbell"
                  value={newExercise.equipment}
                  onChange={handleEquipmentChange}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="flex-1 rounded-xl bg-slate-100 px-4 py-3 font-bold text-slate-600 transition-colors hover:bg-slate-200"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 font-bold text-white shadow-lg shadow-indigo-100 transition-colors hover:bg-indigo-700"
              >
                {t.save_exercise}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredExercises.map((ex) => (
          <div
            key={ex.id}
            className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                <Zap size={20} />
              </div>
              <div className="flex space-x-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button type="button" className="p-2 text-slate-400 hover:text-indigo-600">
                  <Edit2 size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => deleteExercise(ex.id)}
                  className="p-2 text-slate-400 hover:text-rose-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <h4 className="mb-1 text-xl font-bold text-slate-900">{ex.name}</h4>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold tracking-wider text-slate-600 uppercase">
                {t.muscle_groups[ex.muscleGroup]}
              </span>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold tracking-wider text-emerald-700 uppercase">
                {ex.equipment}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ExerciseManager
