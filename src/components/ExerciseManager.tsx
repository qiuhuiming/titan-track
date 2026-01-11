import { Edit2, Filter, Plus, Search, Trash2, Zap } from 'lucide-react';
import type { ChangeEvent, FC, FormEvent } from 'react';
import { useState } from 'react';
import { translations } from '../translations';
import type { Exercise, Language, MuscleGroup } from '../types';

interface ExerciseManagerProps {
  exercises: Exercise[];
  onUpdateExercises: (exercises: Exercise[]) => void;
  language: Language;
}

const MUSCLE_GROUPS: MuscleGroup[] = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Full Body', 'Cardio'];

const ExerciseManager: FC<ExerciseManagerProps> = ({ exercises, onUpdateExercises, language }) => {
  const t = translations[language];
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGroup, setFilterGroup] = useState<MuscleGroup | 'All'>('All');
  const [isAdding, setIsAdding] = useState(false);
  const [newExercise, setNewExercise] = useState({
    name: '',
    muscleGroup: 'Chest' as MuscleGroup,
    equipment: '',
    notes: ''
  });

  const handleFilterChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setFilterGroup(event.target.value as MuscleGroup | 'All');
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setNewExercise((prev) => ({ ...prev, name: event.target.value }));
  };

  const handleMuscleGroupChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setNewExercise((prev) => ({ ...prev, muscleGroup: event.target.value as MuscleGroup }));
  };

  const handleEquipmentChange = (event: ChangeEvent<HTMLInputElement>) => {
    setNewExercise((prev) => ({ ...prev, equipment: event.target.value }));
  };

  const filteredExercises = exercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterGroup === 'All' || ex.muscleGroup === filterGroup;
    return matchesSearch && matchesFilter;
  });

  const handleAdd = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const ex: Exercise = {
      id: Math.random().toString(36).substr(2, 9),
      ...newExercise
    };
    onUpdateExercises([...exercises, ex]);
    setIsAdding(false);
    setNewExercise({ name: '', muscleGroup: 'Chest', equipment: '', notes: '' });
  };

  const deleteExercise = (id: string) => {
    if (confirm(t.confirm_delete)) {
      onUpdateExercises(exercises.filter(ex => ex.id !== id));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">{t.exercise_arsenal}</h2>
          <p className="text-slate-500 mt-1">{t.manage_arsenal}</p>
        </div>
        <button 
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center justify-center space-x-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
        >
          <Plus size={20} />
          <span>{isAdding ? t.cancel : t.new_exercise}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder={t.search_exercises}
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white shadow-sm"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <select 
            value={filterGroup}
            onChange={handleFilterChange}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white shadow-sm appearance-none"
          >
            <option value="All">{t.all_muscle_groups}</option>
            {MUSCLE_GROUPS.map(mg => (
              <option key={mg} value={mg}>{t.muscle_groups[mg]}</option>
            ))}
          </select>
        </div>
      </div>

      {isAdding && (
        <div className="rounded-[2rem] border border-slate-100 bg-slate-50/80 shadow-sm p-6 md:p-8 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
          <form onSubmit={handleAdd} className="space-y-6">
            <h3 className="text-2xl font-bold text-slate-900">{t.add_new_exercise}</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label htmlFor="exercise-name-input" className="block text-sm font-semibold text-slate-700 mb-1">{t.exercise_name}</label>
                <input 
                  id="exercise-name-input"
                  type="text" 
                  required
                  placeholder="e.g., Incline Dumbbell Press"
                  value={newExercise.name}
                  onChange={handleNameChange}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                />
              </div>

              <div>
                <label htmlFor="muscle-group-select" className="block text-sm font-semibold text-slate-700 mb-1">{t.muscle_group}</label>
                <select 
                  id="muscle-group-select"
                  value={newExercise.muscleGroup}
                  onChange={handleMuscleGroupChange}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                >
                  {MUSCLE_GROUPS.map(mg => (
                    <option key={mg} value={mg}>{t.muscle_groups[mg]}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="equipment-input" className="block text-sm font-semibold text-slate-700 mb-1">{t.equipment}</label>
                <input 
                  id="equipment-input"
                  type="text" 
                  placeholder="e.g., Dumbbell, Cable, Barbell"
                  value={newExercise.equipment}
                  onChange={handleEquipmentChange}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                type="button" 
                onClick={() => setIsAdding(false)}
                className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                {t.cancel}
              </button>
              <button 
                type="submit"
                className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
              >
                {t.save_exercise}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExercises.map(ex => (
          <div key={ex.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Zap size={20} />
              </div>
              <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button type="button" className="p-2 text-slate-400 hover:text-indigo-600"><Edit2 size={16} /></button>
                <button type="button" onClick={() => deleteExercise(ex.id)} className="p-2 text-slate-400 hover:text-rose-600"><Trash2 size={16} /></button>
              </div>
            </div>
            <h4 className="text-xl font-bold text-slate-900 mb-1">{ex.name}</h4>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                {t.muscle_groups[ex.muscleGroup]}
              </span>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
                {ex.equipment}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExerciseManager;
