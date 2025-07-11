'use client';

import { useAuth } from '@/components/providers';
import { useGoals, useDashboard, useHydration, useMeditation, useUserProfile, useUpdateProfile, useUploadProfilePicture, useDeleteProfilePicture, useUpdateStreak } from '@/hooks/useApi';
import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { format, subMonths } from 'date-fns';
import { 
  User,
  Mail,
  Calendar,
  Target,
  Award,
  TrendingUp,
  Edit3,
  Camera,
  Loader2,
  CheckCircle,
  Clock,
  Star,
  Save,
  X,
  Settings,
  Droplets,
  Heart,
  CalendarDays,
  Trophy,
  Activity,
  Upload,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ImageCropModal from '@/components/ImageCropModal';
import AnalyticsChart from '@/components/AnalyticsChart';

interface Goal {
  id: string;
  title: string;
  completed: boolean;
  category: string;
  targetValue?: number;
  currentValue: number;
  unit?: string;
  deadline?: string;
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const { data: goals = [], isLoading: goalsLoading } = useGoals();
  const { data: dashboard, isLoading: dashboardLoading } = useDashboard();
  const { data: hydrationData = [] } = useHydration();
  const { data: meditationData = [] } = useMeditation();
  
  // Get analytics data (last 12 months for comprehensive analytics)
  const startDate = format(subMonths(new Date(), 12), 'yyyy-MM-dd');
  const endDate = format(new Date(), 'yyyy-MM-dd');
  const { data: hydrationAnalytics = [] } = useHydration({ startDate, endDate });
  const { data: meditationAnalytics = [] } = useMeditation({ startDate, endDate });
  const { data: profileData, isLoading: profileLoading } = useUserProfile();
  const updateProfile = useUpdateProfile();
  const uploadProfilePicture = useUploadProfilePicture();
  const deleteProfilePicture = useDeleteProfilePicture();
  const updateStreak = useUpdateStreak();
  const queryClient = useQueryClient();
  
  const [isEditing, setIsEditing] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    bio: '',
  });

  // Update form when profile data loads
  useEffect(() => {
    if (profileData) {
      setEditForm({
        name: profileData.name || '',
        email: profileData.email || '',
        bio: profileData.bio || '',
      });
    }
  }, [profileData]);

  // Auto-update streak when profile loads
  useEffect(() => {
    if (user && !authLoading) {
      // Update streak on profile visit
      updateStreak.mutate();
    }
  }, [user, authLoading]);

  // Refresh all data function
  const refreshData = async () => {
    await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    await queryClient.invalidateQueries({ queryKey: ['hydration'] });
    await queryClient.invalidateQueries({ queryKey: ['meditation'] });
    await queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
    await queryClient.invalidateQueries({ queryKey: ['goals'] });
  };

  const isLoading = authLoading || goalsLoading || dashboardLoading || profileLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Profile not found
          </h2>
          <p className="text-gray-600">
            Please sign in to view your profile.
          </p>
        </div>
      </div>
    );
  }

  // Calculate comprehensive stats
  const completedGoals = goals.filter((goal: Goal) => goal.completed);
  const totalGoals = goals.length;
  const completionRate = totalGoals > 0 ? Math.round((completedGoals.length / totalGoals) * 100) : 0;
  
  // Calculate real activity data - fix data structure handling
  const todayStats = dashboard?.today || {};
  
  // Extract hydration entries from response structure
  const hydrationEntries = hydrationData?.entries || (Array.isArray(hydrationData) ? hydrationData : []);
  const totalHydrationEntries = hydrationEntries.length;
  
  // Debug logging
  console.log('Profile Page - Hydration Data:', hydrationData);
  console.log('Profile Page - Hydration Entries:', hydrationEntries);
  console.log('Profile Page - Total Hydration Entries:', totalHydrationEntries);
  
  // Calculate today's hydration amount from actual entries
  const today = new Date().toISOString().split('T')[0];
  const todayHydrationAmount = hydrationEntries
    .filter((entry: any) => entry.timestamp?.startsWith(today))
    .reduce((total: number, entry: any) => total + (entry.amount || 0), 0);
    
  console.log('Profile Page - Today\'s Hydration Amount:', todayHydrationAmount);
  
  const totalMeditationSessions = Array.isArray(meditationData) ? meditationData.length : 0;
  const totalMeditationMinutes = Array.isArray(meditationData) 
    ? meditationData.reduce((total: number, session: any) => total + (session.duration || 0), 0)
    : 0;

  // Achievement calculations
  const totalPoints = (completedGoals.length * 10) + (totalMeditationSessions * 5) + (totalHydrationEntries * 2);
  const currentStreak = profileData?.streak || 0; // Real streak from backend
  const longestStreak = profileData?.streak || 0; // For now using current streak, could add separate field later

  const recentGoals = goals.slice(0, 6); // Show last 6 goals

  // Save profile function
  const handleSaveProfile = async () => {
    try {
      await updateProfile.mutateAsync({
        name: editForm.name,
        bio: editForm.bio,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  // Handle file selection (opens crop modal)
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    // Set file and show crop modal
    setSelectedFile(file);
    setShowImageUpload(false);
    setShowCropModal(true);
    
    // Reset file input
    event.target.value = '';
  };

  // Handle cropped image upload
  const handleCroppedImageUpload = async (croppedFile: File) => {
    try {
      await uploadProfilePicture.mutateAsync(croppedFile);
      setShowCropModal(false);
      setSelectedFile(null);
    } catch (error) {
      console.error('Failed to upload profile picture:', error);
      alert('Failed to upload profile picture. Please try again.');
    }
  };

  // Handle profile picture deletion
  const handleDeleteProfilePicture = async () => {
    if (confirm('Are you sure you want to delete your profile picture?')) {
      try {
        await deleteProfilePicture.mutateAsync();
      } catch (error) {
        console.error('Failed to delete profile picture:', error);
        alert('Failed to delete profile picture. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <User className="h-8 w-8 text-blue-500" />
              Profile
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your account and view your progress
            </p>
          </div>
          <button
            onClick={refreshData}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Data
          </button>
        </div>

        {/* Profile Info */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-start gap-6">
            {/* Profile Picture */}
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg overflow-hidden">
                {profileData?.profilePictureUrl ? (
                  <img 
                    src={profileData.profilePictureUrl} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-white" />
                )}
              </div>
              <button
                onClick={() => setShowImageUpload(true)}
                className="absolute -bottom-2 -right-2 p-2 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <Camera className="h-4 w-4 text-gray-600" />
              </button>
            </div>

            {/* User Details */}
            <div className="flex-1 min-w-0">
              {!isEditing ? (
                <>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {profileData?.name || user?.name || 'User'}
                    </h2>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{profileData?.email || user?.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Member since {profileData?.createdAt ? format(new Date(profileData.createdAt), 'MMMM yyyy') : format(new Date(), 'MMMM yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      <span>Current streak: </span>
                      <span className={`font-semibold ${
                        currentStreak >= 30 ? 'text-purple-600' :
                        currentStreak >= 14 ? 'text-blue-600' :
                        currentStreak >= 7 ? 'text-green-600' :
                        currentStreak >= 3 ? 'text-yellow-600' :
                        'text-gray-600'
                      }`}>
                        {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
                      </span>
                      {currentStreak >= 7 && (
                        <span className="text-orange-500">🔥</span>
                      )}
                    </div>
                  </div>

                  <p className="mt-3 text-gray-700">
                    {profileData?.bio || 'No bio provided yet.'}
                  </p>
                </>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    <textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      rows={3}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveProfile}
                      disabled={updateProfile.isPending}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      <Save className="h-4 w-4" />
                      {updateProfile.isPending ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Comprehensive Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-lg bg-blue-500">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Goals</p>
                <p className="text-2xl font-bold text-gray-900">{totalGoals}</p>
                <p className="text-xs text-green-600">{completedGoals.length} completed</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-lg bg-cyan-500">
                <Droplets className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Hydration Logs</p>
                <p className="text-2xl font-bold text-gray-900">{totalHydrationEntries}</p>
                <p className="text-xs text-blue-600">Total entries</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-lg bg-purple-500">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Meditation</p>
                <p className="text-2xl font-bold text-gray-900">{totalMeditationSessions}</p>
                <p className="text-xs text-purple-600">{Math.round(totalMeditationMinutes / 60)}h total</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-lg bg-orange-500">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Points</p>
                <p className="text-2xl font-bold text-gray-900">{totalPoints}</p>
                <p className="text-xs text-orange-600">Keep it up!</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Detailed Performance Metrics */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            Performance Overview
          </h2>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Target className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900">Goal Success</h3>
              <p className="text-2xl font-bold text-blue-600 mt-1">{completionRate}%</p>
              <p className="text-sm text-gray-600">Completion rate</p>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg">
              <div className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Droplets className="h-6 w-6 text-white" />
              </div>
                             <h3 className="font-semibold text-gray-900">Hydration</h3>
               <p className="text-2xl font-bold text-cyan-600 mt-1">{todayHydrationAmount}</p>
               <p className="text-sm text-gray-600">Today's intake</p>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900">Mindfulness</h3>
              <p className="text-2xl font-bold text-purple-600 mt-1">{totalMeditationMinutes}</p>
              <p className="text-sm text-gray-600">Total minutes</p>
            </div>

            <div className={`text-center p-4 rounded-lg ${
              currentStreak >= 30 ? 'bg-gradient-to-br from-purple-50 to-purple-100' :
              currentStreak >= 14 ? 'bg-gradient-to-br from-blue-50 to-blue-100' :
              currentStreak >= 7 ? 'bg-gradient-to-br from-green-50 to-green-100' :
              currentStreak >= 3 ? 'bg-gradient-to-br from-yellow-50 to-yellow-100' :
              'bg-gradient-to-br from-gray-50 to-gray-100'
            }`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
                currentStreak >= 30 ? 'bg-purple-500' :
                currentStreak >= 14 ? 'bg-blue-500' :
                currentStreak >= 7 ? 'bg-green-500' :
                currentStreak >= 3 ? 'bg-yellow-500' :
                'bg-gray-500'
              }`}>
                <Award className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900">
                Login Streak {currentStreak >= 7 && '🔥'}
              </h3>
              <p className={`text-2xl font-bold mt-1 ${
                currentStreak >= 30 ? 'text-purple-600' :
                currentStreak >= 14 ? 'text-blue-600' :
                currentStreak >= 7 ? 'text-green-600' :
                currentStreak >= 3 ? 'text-yellow-600' :
                'text-gray-600'
              }`}>
                {currentStreak}
              </p>
              <p className="text-sm text-gray-600">
                {currentStreak === 0 ? 'Start your streak!' :
                 currentStreak === 1 ? 'Day active' :
                 'Days active'}
              </p>
            </div>
          </div>
        </div>

        {/* Activity & Achievements */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Recent Goals</h2>
              <Target className="h-5 w-5 text-gray-400" />
            </div>
            
            <div className="space-y-3">
              {recentGoals.length > 0 ? (
                recentGoals.map((goal: Goal) => (
                  <div key={goal.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    {goal.completed ? (
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <Clock className="h-5 w-5 text-amber-500 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium ${goal.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {goal.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          goal.category === 'HEALTH' ? 'bg-green-100 text-green-800' :
                          goal.category === 'FITNESS' ? 'bg-blue-100 text-blue-800' :
                          goal.category === 'PERSONAL' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {goal.category.toLowerCase()}
                        </span>
                        {goal.targetValue && (
                          <span className="text-xs text-gray-500">
                            {goal.currentValue} / {goal.targetValue} {goal.unit}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Target className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No goals yet</p>
                  <p className="text-xs text-gray-400 mt-1">Create your first goal to get started!</p>
                </div>
              )}
            </div>
          </div>

          {/* Achievements & Badges */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Achievements</h2>
              <Award className="h-5 w-5 text-gray-400" />
            </div>

            <div className="space-y-3">
              {/* Active Streak */}
              <div className={`flex items-center gap-3 p-3 rounded-lg border ${
                currentStreak >= 30 ? 'bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200' :
                currentStreak >= 14 ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200' :
                currentStreak >= 7 ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-200' :
                currentStreak >= 3 ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200' :
                'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200'
              }`}>
                <div className={`flex-shrink-0 p-2 rounded-full ${
                  currentStreak >= 30 ? 'bg-purple-500' :
                  currentStreak >= 14 ? 'bg-blue-500' :
                  currentStreak >= 7 ? 'bg-green-500' :
                  currentStreak >= 3 ? 'bg-yellow-500' :
                  'bg-gray-500'
                }`}>
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    Current Streak {currentStreak >= 7 && '🔥'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {currentStreak === 0 ? 'Log in daily to start your streak!' :
                     currentStreak === 1 ? '1 day active - keep it up!' :
                     currentStreak >= 30 ? `${currentStreak} days - you're legendary! 👑` :
                     currentStreak >= 14 ? `${currentStreak} days - amazing dedication! ⭐` :
                     currentStreak >= 7 ? `${currentStreak} days - on fire! 🔥` :
                     `${currentStreak} days active - great start!`}
                  </p>
                </div>
              </div>

              {/* Best Streak */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100">
                <div className="flex-shrink-0 p-2 rounded-full bg-purple-500">
                  <Star className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Best Streak</p>
                  <p className="text-sm text-gray-600">{longestStreak} days record</p>
                </div>
              </div>

              {/* Dynamic Achievements */}
              {completedGoals.length >= 5 && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100">
                  <div className="flex-shrink-0 p-2 rounded-full bg-green-500">
                    <Award className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Goal Achiever</p>
                    <p className="text-sm text-gray-600">{completedGoals.length} goals completed</p>
                  </div>
                </div>
              )}

              {totalMeditationSessions >= 10 && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100">
                  <div className="flex-shrink-0 p-2 rounded-full bg-purple-500">
                    <Heart className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Mindful Soul</p>
                    <p className="text-sm text-gray-600">{totalMeditationSessions} meditation sessions</p>
                  </div>
                </div>
              )}

              {totalHydrationEntries >= 20 && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-100">
                  <div className="flex-shrink-0 p-2 rounded-full bg-cyan-500">
                    <Droplets className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Hydration Hero</p>
                    <p className="text-sm text-gray-600">{totalHydrationEntries} hydration logs</p>
                  </div>
                </div>
              )}

              {totalGoals >= 1 && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-100">
                  <div className="flex-shrink-0 p-2 rounded-full bg-yellow-500">
                    <Target className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">First Steps</p>
                    <p className="text-sm text-gray-600">Started your wellness journey</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Image Upload Modal */}
        <AnimatePresence>
          {showImageUpload && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowImageUpload(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Profile Picture</h2>
                <button
                  onClick={() => setShowImageUpload(false)}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Current Image Preview */}
                <div className="flex justify-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg overflow-hidden">
                    {profileData?.profilePictureUrl ? (
                      <img 
                        src={profileData.profilePictureUrl} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-16 h-16 text-white" />
                    )}
                  </div>
                </div>

                {/* Upload Options */}
                <div className="space-y-3">
                  <label className="block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={uploadProfilePicture.isPending}
                    />
                    <div className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50">
                      <Upload className="h-4 w-4" />
                      {uploadProfilePicture.isPending ? 'Uploading...' : 'Upload New Picture'}
                    </div>
                  </label>

                  {profileData?.profilePictureUrl && (
                    <button
                      onClick={handleDeleteProfilePicture}
                      disabled={deleteProfilePicture.isPending}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      {deleteProfilePicture.isPending ? 'Deleting...' : 'Delete Picture'}
                    </button>
                  )}
                </div>

                {/* File Requirements */}
                <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium mb-1">Requirements:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Max file size: 5MB</li>
                    <li>Supported formats: JPEG, PNG, GIF, WebP</li>
                    <li>Recommended: Square images work best</li>
                  </ul>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowImageUpload(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Close
                  </button>
                                 </div>
               </div>
               </motion.div>
             </motion.div>
           )}
         </AnimatePresence>

        {/* Analytics Charts */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Analytics Dashboard</h2>
            <div className="text-sm text-gray-500">Track your progress over time</div>
          </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <AnalyticsChart 
              hydrationData={hydrationAnalytics} 
              meditationData={meditationAnalytics} 
              type="hydration" 
            />
            <AnalyticsChart 
              hydrationData={hydrationAnalytics} 
              meditationData={meditationAnalytics} 
              type="meditation" 
            />
          </div>
        </div>

        {/* Image Crop Modal */}
        <ImageCropModal
          isOpen={showCropModal}
          onClose={() => {
            setShowCropModal(false);
            setSelectedFile(null);
          }}
          onCrop={handleCroppedImageUpload}
          file={selectedFile}
        />
      </div>
    </div>
  );
} 