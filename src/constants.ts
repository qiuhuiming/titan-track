
import type { Exercise, WorkoutEntry, WorkoutPlan } from './types';

export const INITIAL_EXERCISES: Exercise[] = [
  // Chest
  { id: '1', name: '杠铃平地卧推', muscleGroup: 'Chest', equipment: '杠铃' },
  { id: '10', name: '上斜哑铃卧推', muscleGroup: 'Chest', equipment: '哑铃' },
  // Legs
  { id: '2', name: '杠铃深蹲', muscleGroup: 'Legs', equipment: '杠铃' },
  { id: '8', name: '保加利亚分腿蹲', muscleGroup: 'Legs', equipment: '哑铃' },
  { id: '13', name: '罗马尼亚硬拉', muscleGroup: 'Legs', equipment: '杠铃' },
  // Back
  { id: '3', name: '传统硬拉', muscleGroup: 'Back', equipment: '杠铃' },
  { id: '7', name: '正手引体向上', muscleGroup: 'Back', equipment: '自重' },
  { id: '9', name: '杠铃划船', muscleGroup: 'Back', equipment: '杠铃' },
  // Shoulders
  { id: '4', name: '哑铃推肩', muscleGroup: 'Shoulders', equipment: '哑铃' },
  { id: '11', name: '哑铃侧平举', muscleGroup: 'Shoulders', equipment: '哑铃' },
  // Arms
  { id: '6', name: '哑铃二头肌弯举', muscleGroup: 'Arms', equipment: '哑铃' },
  { id: '12', name: '绳索三头肌下压', muscleGroup: 'Arms', equipment: '绳索' },
  // Other
  { id: '5', name: '跑步', muscleGroup: 'Cardio', equipment: '跑步机' },
  { id: '14', name: '平板支撑', muscleGroup: 'Core', equipment: '自重' },
];

export const INITIAL_PLANS: WorkoutPlan[] = [
  {
    id: 'p-jan-01',
    date: '2026-01-01',
    title: '上半身推力日',
    tags: ['Chest', 'Shoulders', 'Arms'],
    isCompleted: true,
    createdAt: '2026-01-01T08:00:00.000Z',
    exercises: [
      { exerciseId: '1', sets: [{ id: 's1', weight: 60, reps: 8 }, { id: 's2', weight: 60, reps: 8 }, { id: 's3', weight: 60, reps: 8 }] },
      { exerciseId: '4', sets: [{ id: 's4', weight: 15, reps: 10 }, { id: 's5', weight: 15, reps: 10 }] },
      { exerciseId: '10', sets: [{ id: 's6', weight: 20, reps: 12 }, { id: 's7', weight: 20, reps: 12 }] },
      { exerciseId: '12', sets: [{ id: 's8', weight: 25, reps: 15 }] }
    ]
  },
  {
    id: 'p-jan-03',
    date: '2026-01-03',
    title: '上半身拉力日',
    tags: ['Back', 'Arms'],
    isCompleted: true,
    createdAt: '2026-01-02T08:00:00.000Z',
    exercises: [
      { exerciseId: '7', sets: [{ id: 's9', weight: 0, reps: 10 }, { id: 's10', weight: 0, reps: 8 }] },
      { exerciseId: '9', sets: [{ id: 's11', weight: 50, reps: 10 }, { id: 's12', weight: 50, reps: 10 }] },
      { exerciseId: '6', sets: [{ id: 's13', weight: 12.5, reps: 12 }, { id: 's14', weight: 12.5, reps: 12 }] },
      { exerciseId: '14', sets: [{ id: 's15', weight: 0, timeMinutes: 1 }] }
    ]
  },
  {
    id: 'p-jan-05',
    date: '2026-01-05',
    title: '腿部基础力量',
    tags: ['Legs'],
    isCompleted: true,
    createdAt: '2026-01-04T08:00:00.000Z',
    exercises: [
      { exerciseId: '2', sets: [{ id: 's16', weight: 80, reps: 5 }, { id: 's17', weight: 80, reps: 5 }, { id: 's18', weight: 80, reps: 5 }] },
      { exerciseId: '13', sets: [{ id: 's19', weight: 70, reps: 8 }, { id: 's20', weight: 70, reps: 8 }] },
      { exerciseId: '8', sets: [{ id: 's21', weight: 15, reps: 10 }, { id: 's22', weight: 15, reps: 10 }] }
    ]
  },
  {
    id: 'p-jan-08',
    date: '2026-01-08',
    title: '恢复性有氧 + 核心',
    tags: ['Cardio', 'Core'],
    isCompleted: false,
    createdAt: '2026-01-07T08:00:00.000Z',
    exercises: [
      { exerciseId: '5', sets: [{ id: 's23', weight: 0, timeMinutes: 30 }] },
      { exerciseId: '14', sets: [{ id: 's24', weight: 0, timeMinutes: 2 }] }
    ]
  },
  {
    id: 'p-jan-10',
    date: '2026-01-10',
    title: '力量循环：全身激活动作',
    tags: ['Full Body'],
    isCompleted: false,
    createdAt: '2026-01-09T08:00:00.000Z',
    exercises: [
      { exerciseId: '3', sets: [{ id: 's25', weight: 100, reps: 5 }] },
      { exerciseId: '1', sets: [{ id: 's26', weight: 65, reps: 6 }] },
      { exerciseId: '2', sets: [{ id: 's27', weight: 85, reps: 5 }] },
      { exerciseId: '7', sets: [{ id: 's28', weight: 0, reps: 8 }] }
    ]
  }
];

export const INITIAL_LOGS: WorkoutEntry[] = [
  // Logs for Jan 01 (Push Day)
  {
    id: 'l-01-1', date: '2026-01-01', exerciseId: '1', workoutType: '上半身推力日', planId: 'p-jan-01',
    sets: [
      { id: 's1', weight: 60, reps: 8, rpe: 8, completed: true },
      { id: 's2', weight: 60, reps: 8, rpe: 8, completed: true },
      { id: 's3', weight: 60, reps: 7, rpe: 9, completed: true },
    ]
  },
  {
    id: 'l-01-2', date: '2026-01-01', exerciseId: '4', workoutType: '上半身推力日', planId: 'p-jan-01',
    sets: [
      { id: 's4', weight: 15, reps: 10, rpe: 7, completed: true },
      { id: 's5', weight: 15, reps: 10, rpe: 8, completed: true },
    ]
  },
  // Logs for Jan 03 (Pull Day)
  {
    id: 'l-03-1', date: '2026-01-03', exerciseId: '7', workoutType: '上半身拉力日', planId: 'p-jan-03',
    sets: [
      { id: 's9', weight: 0, reps: 10, rpe: 7, completed: true },
      { id: 's10', weight: 0, reps: 9, rpe: 9, completed: true },
    ]
  },
  {
    id: 'l-03-2', date: '2026-01-03', exerciseId: '9', workoutType: '上半身拉力日', planId: 'p-jan-03',
    sets: [
      { id: 's11', weight: 50, reps: 10, rpe: 7, completed: true },
      { id: 's12', weight: 55, reps: 8, rpe: 9, completed: true },
    ]
  },
  // Logs for Jan 05 (Leg Day)
  {
    id: 'l-05-1', date: '2026-01-05', exerciseId: '2', workoutType: '腿部基础力量', planId: 'p-jan-05',
    sets: [
      { id: 's16', weight: 80, reps: 5, rpe: 7, completed: true },
      { id: 's17', weight: 85, reps: 5, rpe: 8, completed: true },
      { id: 's18', weight: 90, reps: 4, rpe: 10, completed: true },
    ]
  }
];
