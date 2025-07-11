'use client';

import { useHydration, useAddHydration, useDeleteLastHydration } from '@/hooks/useApi';
import { useAuth } from '@/components/providers';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  Droplets, 
  Plus,
  Minus,
  Target,
  Waves,
  Settings,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HydrationEntry {
  _id?: string;
  id?: string;
  amount: number;
  timestamp: string | Date;
}

const WaterGlass = ({ filled = false, animationDelay = 0 }: { filled?: boolean; animationDelay?: number }) => (
  <motion.div
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    transition={{ delay: animationDelay, type: "spring", stiffness: 300 }}
    className="relative w-16 h-20 mx-1 mb-4"
  >
    <div className="absolute inset-0 bg-gray-200 rounded-b-3xl rounded-t-lg border-2 border-gray-300">
      <AnimatePresence>
        {filled && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: '85%' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-cyan-400 to-cyan-300 rounded-b-3xl border-b-2 border-cyan-500"
          >
            <motion.div
              animate={{ 
                y: [-2, 2, -2],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute top-0 left-0 right-0 h-1 bg-cyan-200 rounded-full"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    <Droplets className={`absolute -top-1 -right-1 h-4 w-4 ${filled ? 'text-cyan-500' : 'text-gray-400'}`} />
  </motion.div>
);

export default function HydrationPage() {
  const { data: hydrationData, isLoading } = useHydration({ today: true });
  const addHydration = useAddHydration();
  const deleteLastHydration = useDeleteLastHydration();
  
  const [showSettings, setShowSettings] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [hydrationGoal, setHydrationGoal] = useState({
    dailyGoal: 2500, // ml
    glassSize: 250, // ml
  });

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({
    dailyGoal: hydrationGoal.dailyGoal.toString(),
    glassSize: hydrationGoal.glassSize.toString(),
  });

  // Load settings from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hydrationSettings');
      if (saved) {
        const settings = JSON.parse(saved);
        setHydrationGoal(settings);
        setSettingsForm({
          dailyGoal: settings.dailyGoal.toString(),
          glassSize: settings.glassSize.toString(),
        });
      }
    }
  }, []);

  const saveSettings = () => {
    const newGoal = parseInt(settingsForm.dailyGoal) || 2500;
    const newGlassSize = parseInt(settingsForm.glassSize) || 250;
    
    const newSettings = {
      dailyGoal: newGoal,
      glassSize: newGlassSize,
    };
    
    setHydrationGoal(newSettings);
    if (typeof window !== 'undefined') {
      localStorage.setItem('hydrationSettings', JSON.stringify(newSettings));
    }
    setShowSettings(false);
  };

  const resetSettingsForm = () => {
    setSettingsForm({
      dailyGoal: hydrationGoal.dailyGoal.toString(),
      glassSize: hydrationGoal.glassSize.toString(),
    });
  };

  const todayHydration = hydrationData?.totalAmount || 0;
  const todayGlasses = Math.floor(todayHydration / hydrationGoal.glassSize);
  const goalGlasses = Math.ceil(hydrationGoal.dailyGoal / hydrationGoal.glassSize);
  const progressPercentage = Math.min((todayHydration / hydrationGoal.dailyGoal) * 100, 100);

  // Create array of glasses for visual representation
  const glasses = Array.from({ length: Math.max(goalGlasses, 8) }, (_, i) => i < todayGlasses);

  const handleAddGlass = async () => {
    try {
      await addHydration.mutateAsync(hydrationGoal.glassSize);
    } catch (error) {
      console.error('Failed to add hydration entry:', error);
    }
  };

  const handleAddCustom = async () => {
    const amount = parseInt(customAmount);
    if (amount > 0) {
      try {
        await addHydration.mutateAsync(amount);
        setCustomAmount('');
      } catch (error) {
        console.error('Failed to add hydration entry:', error);
      }
    }
  };

  const handleRemoveLastEntry = async () => {
    if (todayEntries.length === 0) {
      return; // No entries to remove
    }
    
    try {
      await deleteLastHydration.mutateAsync();
    } catch (error) {
      console.error('Failed to remove last hydration entry:', error);
    }
  };

  const todayEntries = hydrationData?.entries || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading hydration data...</p>
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
              <Droplets className="h-8 w-8 text-cyan-500" />
              Hydration
            </h1>
            <p className="text-gray-600 mt-1">
              Stay hydrated and track your daily water intake
            </p>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Settings className="h-4 w-4" />
            Settings
          </button>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-md bg-cyan-500">
                <Droplets className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Intake</p>
                <p className="text-2xl font-bold text-gray-900">{todayHydration}ml</p>
                <p className="text-xs text-gray-500">{todayGlasses} glasses</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-md bg-blue-500">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Daily Goal</p>
                <p className="text-2xl font-bold text-gray-900">{hydrationGoal.dailyGoal}ml</p>
                <p className="text-xs text-gray-500">{goalGlasses} glasses</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-md bg-green-500">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Progress</p>
                <p className="text-2xl font-bold text-gray-900">{Math.round(progressPercentage)}%</p>
                <p className="text-xs text-gray-500">
                  {todayHydration >= hydrationGoal.dailyGoal ? 'Goal achieved! 🎉' : `${hydrationGoal.dailyGoal - todayHydration}ml remaining`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Daily Progress</h2>
            <span className="text-sm text-gray-500">
              {todayHydration}ml / {hydrationGoal.dailyGoal}ml
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <motion.div
              className="bg-gradient-to-r from-cyan-400 to-blue-500 h-4 rounded-full flex items-center justify-end pr-2"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              {progressPercentage > 10 && (
                <Waves className="h-3 w-3 text-white" />
              )}
            </motion.div>
          </div>
        </div>

        {/* Visual Glasses */}
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Water Glasses</h2>
          <div className="flex flex-wrap justify-center gap-2">
            {glasses.map((filled, index) => (
              <WaterGlass 
                key={index} 
                filled={filled} 
                animationDelay={index * 0.1}
              />
            ))}
          </div>
          <p className="text-center text-sm text-gray-500 mt-4">
            {todayGlasses} of {goalGlasses} glasses completed
          </p>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-4">
              <button
                onClick={handleAddGlass}
                disabled={addHydration.isPending}
                className="w-full flex items-center justify-center gap-3 p-4 bg-cyan-50 border-2 border-cyan-200 rounded-lg hover:bg-cyan-100 transition-colors group disabled:opacity-50"
              >
                <Plus className="h-6 w-6 text-cyan-600 group-hover:scale-110 transition-transform" />
                <span className="text-cyan-700 font-medium">
                  {addHydration.isPending ? 'Adding...' : `Add Glass (${hydrationGoal.glassSize}ml)`}
                </span>
              </button>
              
              <div className="flex gap-3">
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="Enter ml"
                  className="flex-1 rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-500 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={handleAddCustom}
                  disabled={!customAmount || addHydration.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {addHydration.isPending ? 'Adding...' : 'Add'}
                </button>
              </div>

              <button
                onClick={handleRemoveLastEntry}
                disabled={deleteLastHydration.isPending || todayEntries.length === 0}
                className="w-full flex items-center justify-center gap-3 p-4 bg-red-50 border-2 border-red-200 rounded-lg hover:bg-red-100 transition-colors group disabled:opacity-50"
              >
                <Minus className="h-6 w-6 text-red-600 group-hover:scale-110 transition-transform" />
                <span className="text-red-700 font-medium">
                  {deleteLastHydration.isPending ? 'Removing...' : 'Remove Last Entry'}
                </span>
              </button>

              <div className="text-center py-4 text-sm text-gray-500">
                <p>Previous entries can be viewed in your history</p>
              </div>
            </div>
          </div>

          {/* Today's Entries */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Entries</h2>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {todayEntries.length > 0 ? (
                todayEntries.map((entry: HydrationEntry) => (
                  <motion.div
                    key={entry._id?.toString() || entry.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-cyan-100">
                        <Droplets className="h-4 w-4 text-cyan-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {entry.amount}ml
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(entry.timestamp), 'h:mm a')}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Droplets className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No entries today</p>
                  <p className="text-sm text-gray-400">Start tracking your hydration!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Hydration Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Daily Goal (ml)
                  </label>
                  <input
                    type="number"
                    value={settingsForm.dailyGoal}
                    onChange={(e) => setSettingsForm({ ...settingsForm, dailyGoal: e.target.value })}
                    className="w-full rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-500 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="2500"
                    min="1000"
                    max="5000"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Recommended: 2000-3000ml per day
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Glass Size (ml)
                  </label>
                  <input
                    type="number"
                    value={settingsForm.glassSize}
                    onChange={(e) => setSettingsForm({ ...settingsForm, glassSize: e.target.value })}
                    className="w-full rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-500 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="250"
                    min="50"
                    max="1000"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Standard glass sizes: 200ml, 250ml, 300ml
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  onClick={saveSettings}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Settings
                </button>
                <button
                  onClick={() => {
                    resetSettingsForm();
                    setShowSettings(false);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 