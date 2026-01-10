
import React, { useState } from 'react';
import { Exercise, MuscleGroup, Language } from '../types';
import { translations } from '../translations';
import { Plus, Search, Filter, Trash2, Edit2, Zap } from 'lucide-react';

interface ExerciseManagerProps {
  exercises: Exercise[];
  onUpdateExercises: (exercises: Exercise[]) => void;
  language: Language;
}

const MUSCLE_GROUPS: MuscleGroup[] = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Full Body', 'Cardio'];

const ExerciseManager: React.FC<ExerciseManagerProps> = ({ exercises, onUpdateExercises, language }) => {
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

  const filteredExercises = exercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterGroup === 'All' || ex.muscleGroup === filterGroup;
    return matchesSearch && matchesFilter;
  });

  const handleAdd = (e: React.FormEvent) => {
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
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center justify-center space-x-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
        >
          <Plus size={20} />
          <span>{t.new_exercise}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder={t.search_exercises}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white shadow-sm"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <select 
            value={filterGroup}
            onChange={e => setFilterGroup(e.target.value as any)}
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
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAdd} className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-8 space-y-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-bold text-slate-900">{t.add_new_exercise}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">{t.exercise_name}</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g., Incline Dumbbell Press"
                  value={newExercise.name}
                  onChange={e => setNewExercise({...newExercise, name: e.target.value})}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">{t.muscle_group}</label>
                <select 
                  value={newExercise.muscleGroup}
                  onChange={e => setNewExercise({...newExercise, muscleGroup: e.target.value as any})}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  {MUSCLE_GROUPS.map(mg => (
                    <option key={mg} value={mg}>{t.muscle_groups[mg]}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">{t.equipment}</label>
                <input 
                  type="text" 
                  placeholder="e.g., Dumbbell, Cable, Barbell"
                  value={newExercise.equipment}
                  onChange={e => setNewExercise({...newExercise, equipment: e.target.value})}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
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
                <button className="p-2 text-slate-400 hover:text-indigo-600"><Edit2 size={16} /></button>
                <button onClick={() => deleteExercise(ex.id)} className="p-2 text-slate-400 hover:text-rose-600"><Trash2 size={16} /></button>
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
