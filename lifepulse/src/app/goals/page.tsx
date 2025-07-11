'use client';

import { useGoals, useCreateGoal, useUpdateGoal, useDeleteGoal, useIncrementGoal } from '@/hooks/useApi';
import { useAuth } from '@/components/providers';
import { useState } from 'react';
import { format } from 'date-fns';
import { 
  Plus, 
  Target, 
  CheckCircle, 
  Circle, 
  Clock,
  Trash2,
  Filter,
  Loader2,
  Minus,
  PlusIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const taskTypeColors = {
  'work': 'bg-blue-500',
  'personal': 'bg-green-500',
  'health': 'bg-red-500',
  'fitness': 'bg-orange-500',
  'other': 'bg-gray-500',
};

type GoalCategory = 'work' | 'personal' | 'health' | 'fitness' | 'other';

interface Goal {
  id: string;
  title: string;
  description?: string;
  targetValue?: number;
  currentValue: number;
  unit?: string;
  category: GoalCategory;
  deadline?: string;
  completed: boolean;
  priority?: 'low' | 'medium' | 'high';
}

export default function GoalsPage() {
  const { data: goals = [], isLoading } = useGoals();
  const createGoal = useCreateGoal();
  const updateGoal = useUpdateGoal();
  const deleteGoal = useDeleteGoal();
  const incrementGoal = useIncrementGoal();
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterType, setFilterType] = useState<GoalCategory | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'personal' as GoalCategory,
    targetValue: '',
    unit: '',
    deadline: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
  });

  const filteredGoals = goals.filter((goal: Goal) => {
    const typeMatch = filterType === 'all' || goal.category === filterType;
    const statusMatch = filterStatus === 'all' || 
      (filterStatus === 'completed' && goal.completed) ||
      (filterStatus === 'pending' && !goal.completed);
    return typeMatch && statusMatch;
  }).sort((a: Goal, b: Goal) => {
    // Sort by priority first, then by deadline
    const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
    const aPriority = a.priority || 'medium';
    const bPriority = b.priority || 'medium';
    
    if (priorityOrder[aPriority] !== priorityOrder[bPriority]) {
      return priorityOrder[bPriority] - priorityOrder[aPriority];
    }
    if (!a.deadline || !b.deadline) return 0;
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    // Validate that if targetValue is provided, unit must also be provided
    if (formData.targetValue && !formData.unit.trim()) {
      alert('Unit is required when target value is provided');
      return;
    }

    try {
      await createGoal.mutateAsync({
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category.toUpperCase(),
        targetValue: formData.targetValue ? parseInt(formData.targetValue) : undefined,
        unit: formData.unit.trim() || undefined,
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : undefined,
      });

      setFormData({
        title: '',
        description: '',
        category: 'personal',
        targetValue: '',
        unit: '',
        deadline: '',
        priority: 'medium',
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to create goal:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this goal?')) {
      try {
        await deleteGoal.mutateAsync(id);
      } catch (error) {
        console.error('Failed to delete goal:', error);
      }
    }
  };

  const handleToggleComplete = async (goal: Goal) => {
    try {
      if (goal.targetValue) {
        // For progress goals, clicking checkbox fills progress to 100%
        await updateGoal.mutateAsync({
          goalId: goal.id,
          updates: { 
            completed: !goal.completed,
            currentValue: goal.completed ? 0 : goal.targetValue
          }
        });
      } else {
        // For simple goals, just toggle completion
        await updateGoal.mutateAsync({
          goalId: goal.id,
          updates: { completed: !goal.completed }
        });
      }
    } catch (error) {
      console.error('Failed to update goal:', error);
    }
  };

  const handleIncrement = async (goalId: string, increment: number) => {
    try {
      await incrementGoal.mutateAsync({ goalId, increment });
    } catch (error) {
      console.error('Failed to increment goal:', error);
    }
  };

  const completedGoals = goals.filter((goal: Goal) => goal.completed);
  const pendingGoals = goals.filter((goal: Goal) => !goal.completed);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading goals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Target className="h-8 w-8 text-blue-500" />
              Goals
            </h1>
            <p className="text-gray-600 mt-1">
              Track your tasks and achieve your objectives
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Goal
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-md bg-blue-500">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Goals</p>
                <p className="text-2xl font-bold text-gray-900">{filteredGoals.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-md bg-green-500">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{completedGoals.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-md bg-orange-500">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{pendingGoals.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="flex items-center gap-4 flex-wrap">
            <Filter className="h-5 w-5 text-gray-400" />
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Type:</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as GoalCategory | 'all')}
                className="rounded-md border border-gray-300 bg-white text-gray-900 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Types</option>
                <option value="work">Work</option>
                <option value="personal">Personal</option>
                <option value="health">Health</option>
                <option value="fitness">Fitness</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Status:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'all' | 'pending' | 'completed')}
                className="rounded-md border border-gray-300 bg-white text-gray-900 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Add Goal Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-lg shadow-lg p-6 border border-gray-200"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Goal</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-500 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter goal title"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as GoalCategory })}
                      className="w-full rounded-md border border-gray-300 bg-white text-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="work">Work</option>
                      <option value="personal">Personal</option>
                      <option value="health">Health</option>
                      <option value="fitness">Fitness</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Target Value
                    </label>
                    <input
                      type="number"
                      value={formData.targetValue}
                      onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
                      className="w-full rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-500 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 10 (optional)"
                    />
                    <p className="text-xs text-gray-500 mt-1">Leave empty for simple checkbox goal</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit
                    </label>
                    <input
                      type="text"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-500 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., books, workouts, kg"
                    />
                    <p className="text-xs text-gray-500 mt-1">Required only if target value is provided</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Deadline (Optional)
                    </label>
                    <input
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      className="w-full rounded-md border border-gray-300 bg-white text-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-500 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      placeholder="Describe your goal..."
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={createGoal.isPending}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {createGoal.isPending ? 'Creating...' : 'Add Goal'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Goals List */}
        <div className="space-y-4">
          <AnimatePresence>
            {filteredGoals.map((goal: Goal) => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`bg-white rounded-lg shadow-lg p-6 border border-gray-200 ${goal.completed ? 'opacity-75' : ''}`}
              >
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => handleToggleComplete(goal)}
                    className="mt-1 flex-shrink-0"
                  >
                    {goal.completed ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-400 hover:text-blue-500 transition-colors" />
                    )}
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`text-lg font-semibold ${goal.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                            {goal.title}
                          </h3>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${taskTypeColors[goal.category] || taskTypeColors.other} text-white`}>
                            {goal.category}
                          </div>
                        </div>
                        {goal.description && (
                          <p className="text-gray-600 mt-1">{goal.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                          {goal.targetValue ? (
                            <span>Progress: {goal.currentValue} / {goal.targetValue} {goal.unit}</span>
                          ) : (
                            <span>Simple goal - click checkbox to complete</span>
                          )}
                          {goal.deadline && (
                            <span>Due: {format(new Date(goal.deadline), 'MMM d, yyyy')}</span>
                          )}
                        </div>
                        
                        {/* Progress Bar - only for goals with target values */}
                        {goal.targetValue && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="font-medium text-gray-700">Progress</span>
                              <span className="text-gray-500">
                                {Math.round((goal.currentValue / goal.targetValue) * 100)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${Math.min((goal.currentValue / goal.targetValue) * 100, 100)}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Progress Controls - only for goals with target values */}
                        {goal.targetValue && !goal.completed && (
                          <div className="flex items-center gap-2 mt-3">
                            <button
                              onClick={() => handleIncrement(goal.id, -1)}
                              disabled={goal.currentValue <= 0}
                              className="p-1 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Minus className="h-4 w-4 text-gray-600" />
                            </button>
                            <span className="text-sm font-medium px-2 text-gray-900">
                              {goal.currentValue} {goal.unit}
                            </span>
                            <button
                              onClick={() => handleIncrement(goal.id, 1)}
                              disabled={goal.currentValue >= goal.targetValue}
                              className="p-1 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <PlusIcon className="h-4 w-4 text-gray-600" />
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleDelete(goal.id)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {filteredGoals.length === 0 && (
            <div className="text-center py-12">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No goals yet</h3>
              <p className="text-gray-500 mb-4">
                Create your first goal to start tracking your progress
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Goal
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}