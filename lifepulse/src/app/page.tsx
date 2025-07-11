'use client';

import { useDashboard } from '@/hooks/useApi';
import { useAuth } from '@/components/providers';
import { format, isToday, isTomorrow } from 'date-fns';
import { 
  Target, 
  Droplets, 
  Heart, 
  Calendar,
  CheckCircle,
  Circle,
  TrendingUp,
  Loader2,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Goal {
  id: string;
  completed: boolean;
  title: string;
  targetValue?: number;
  currentValue: number;
  unit?: string;
  deadline?: string;
}

interface Event {
  id: string;
  title: string;
  startTime: string;
  category: string;
  priority?: string;
  completed: boolean;
}

export default function InsightsPage() {
  const { user, loading: authLoading } = useAuth();
  const { data: dashboard, isLoading: dashboardLoading, error } = useDashboard();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin');
    }
  }, [authLoading, user, router]);

  // Always call hooks before any early returns
  const stats = useMemo(() => {
    if (!dashboard?.today) return [];
    
    return [
      {
        name: "Goals Progress",
        value: `${dashboard.today.goals?.completed || 0}/${dashboard.today.goals?.total || 0}`,
        subtitle: `${Math.round(dashboard.today.goals?.percentage || 0)}% completed • ${dashboard.today.goals?.active || 0} active`,
        icon: Target,
        color: 'bg-blue-500',
        href: '/goals'
      },
      {
        name: 'Hydration',
        value: `${Math.round((dashboard.today.hydration?.amount || 0) / 250)}`,
        subtitle: `glasses (${Math.round(dashboard.today.hydration?.percentage || 0)}%)`,
        icon: Droplets,
        color: 'bg-cyan-500',
        href: '/hydration'
      },
      {
        name: 'Meditation',
        value: `${dashboard.today.meditation?.minutes || 0}m`,
        subtitle: `${dashboard.today.meditation?.sessions || 0} sessions • ${Math.round(((dashboard.today.meditation?.minutes || 0) / (dashboard.today.meditation?.goal || 20)) * 100)}%`,
        icon: Heart,
        color: 'bg-pink-500',
        href: '/breathe'
      },
      {
        name: "Today's Schedule",
        value: `${dashboard.today.schedule?.total || 0}`,
        subtitle: `events today`,
        icon: Calendar,
        color: 'bg-purple-500',
        href: '/schedule'
      }
    ];
  }, [dashboard]);

  const upcomingGoals = useMemo(() => {
    if (!dashboard?.recentGoals) return [];
    
    return (dashboard.recentGoals as Goal[])
      .filter((goal) => !goal.completed)
      .slice(0, 5);
  }, [dashboard?.recentGoals]);

  const upcomingEvents = useMemo(() => {
    if (!dashboard?.upcomingEvents) return [];
    const now = new Date();
    return (dashboard.upcomingEvents as Event[])
      .filter(event => new Date(event.startTime) > now) // Only truly upcoming events
      .slice(0, 5); // Limit to 5 events
  }, [dashboard?.upcomingEvents]);

  // Helper function to format event time
  const formatEventTime = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return `Today, ${format(date, 'h:mm a')}`;
    } else if (isTomorrow(date)) {
      return `Tomorrow, ${format(date, 'h:mm a')}`;
    } else {
      return format(date, 'MMM d, h:mm a');
    }
  };

  // Helper function to get event category color
  const getEventCategoryColor = (category: string) => {
    const colors = {
      work: 'text-blue-600 bg-blue-50',
      personal: 'text-green-600 bg-green-50',
      health: 'text-red-600 bg-red-50',
      social: 'text-purple-600 bg-purple-50',
      other: 'text-gray-600 bg-gray-50'
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  // Show loading state for dashboard
  if (dashboardLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">
              Failed to load dashboard
            </h2>
            <p className="text-red-600">
              {error.message || 'Something went wrong'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboard) return null;

  // Simplified animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <motion.div 
        className="space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0] || 'there'}! 👋
            </h1>
            <p className="text-gray-600 mt-1">
              {"Here's how you're doing today, "}{format(new Date(), 'EEEE, MMMM d')}
            </p>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Link key={stat.name} href={stat.href}>
              <div className="relative overflow-hidden rounded-xl bg-white px-6 py-6 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group border border-gray-100 hover:border-gray-200">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 p-3 rounded-xl ${stat.color} shadow-sm`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4 flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-600 group-hover:text-gray-700 transition-colors">
                      {stat.name}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {stat.value}
                    </p>
                    <p className="text-sm text-gray-500 mt-1 truncate">
                      {stat.subtitle}
                    </p>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-20 h-20 opacity-5">
                  <stat.icon className="h-full w-full text-gray-900 transform rotate-12 translate-x-4 -translate-y-2" />
                </div>
              </div>
            </Link>
          ))}
        </motion.div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Today's Progress and Quick Actions */}
          <motion.div 
            variants={itemVariants}
            className="lg:col-span-2 space-y-6"
          >
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  {"Today's Progress"}
                </h2>
                <TrendingUp className="h-5 w-5 text-gray-400" />
              </div>

              {/* Hydration Progress */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Today's Hydration
                  </span>
                  <span className="text-sm text-gray-500">
                    {dashboard.today?.hydration?.amount || 0}ml • {Math.round((dashboard.today?.hydration?.amount || 0) / 250)} glasses
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-cyan-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(dashboard.today?.hydration?.percentage || 0, 100)}%` }}
                  />
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {Math.round(dashboard.today?.hydration?.percentage || 0)}% of {dashboard.today?.hydration?.goal || 2500}ml daily goal
                </div>
              </div>

              {/* Goals Progress */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Goal Completion
                  </span>
                  <span className="text-sm text-gray-500">
                    {dashboard.today?.goals?.completed || 0} completed • {dashboard.today?.goals?.active || 0} active
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(dashboard.today?.goals?.percentage || 0, 100)}%` }}
                  />
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {Math.round(dashboard.today?.goals?.percentage || 0)}% of all goals completed
                </div>
              </div>

              {/* Meditation Progress */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Today's Meditation
                  </span>
                  <span className="text-sm text-gray-500">
                    {dashboard.today?.meditation?.minutes || 0}m • {dashboard.today?.meditation?.sessions || 0} sessions
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-pink-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(((dashboard.today?.meditation?.minutes || 0) / (dashboard.today?.meditation?.goal || 20)) * 100, 100)}%` }}
                  />
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {Math.round(((dashboard.today?.meditation?.minutes || 0) / (dashboard.today?.meditation?.goal || 20)) * 100)}% of {dashboard.today?.meditation?.goal || 20}min daily goal
                </div>
              </div>

              {/* Today's Schedule Summary */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {"Today's Schedule"}
                  </span>
                  <span className="text-sm text-gray-500">
                    {dashboard.today?.schedule?.total || 0} events today
                  </span>
                </div>
                
                {(dashboard.today?.schedule?.total || 0) > 0 ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        Upcoming events
                      </span>
                      <span className="font-medium text-blue-600">
                        {dashboard.today?.schedule?.upcoming || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        <span className="inline-block w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                        Past events
                      </span>
                      <span className="font-medium text-gray-600">
                        {dashboard.today?.schedule?.past || 0}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Calendar className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No events scheduled today</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Quick Actions
                </h2>
                <div className="text-xl">⚡</div>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Link href="/goals" className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-all duration-200 group">
                  <Target className="h-8 w-8 text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Add Goal</span>
                </Link>
                <Link href="/hydration" className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-all duration-200 group">
                  <Droplets className="h-8 w-8 text-cyan-500 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Log Water</span>
                </Link>
                <Link href="/breathe" className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-all duration-200 group">
                  <Heart className="h-8 w-8 text-pink-500 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Meditate</span>
                </Link>
                <Link href="/schedule" className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-all duration-200 group">
                  <Calendar className="h-8 w-8 text-purple-500 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Schedule</span>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Goals and Events */}
          <motion.div variants={itemVariants} className="space-y-6">
            {/* Recent Goals */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Recent Goals
                </h2>
                <Target className="h-5 w-5 text-gray-400" />
              </div>
              
              <div className="space-y-3">
                {upcomingGoals.length > 0 ? (
                  upcomingGoals.map((goal) => (
                    <div key={goal.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      {goal.completed ? (
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <Circle className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {goal.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {goal.targetValue ? (
                            <>
                              {goal.currentValue} / {goal.targetValue} {goal.unit}
                              {goal.deadline && (
                                <span className="ml-2">
                                  • Due {format(new Date(goal.deadline), 'MMM d')}
                                </span>
                              )}
                            </>
                          ) : (
                            <>
                              Simple goal
                              {goal.deadline && (
                                <span className="ml-2">
                                  • Due {format(new Date(goal.deadline), 'MMM d')}
                                </span>
                              )}
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <Target className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 mb-2">
                      No goals yet
                    </p>
                    <Link 
                      href="/goals"
                      className="text-sm font-medium text-blue-600 hover:text-blue-500"
                    >
                      Create your first goal →
                    </Link>
                  </div>
                )}
              </div>

              {upcomingGoals.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Link 
                    href="/goals"
                    className="text-sm font-medium text-blue-600 hover:text-blue-500"
                  >
                    View all goals →
                  </Link>
                </div>
              )}
            </div>

            {/* Upcoming Events */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Upcoming Events
                </h2>
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              
              <div className="space-y-3">
                {upcomingEvents.length > 0 ? (
                  upcomingEvents.map((event) => (
                    <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <Clock className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {event.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatEventTime(event.startTime)}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getEventCategoryColor(event.category)}`}>
                            {event.category}
                          </span>
                          {event.priority === 'high' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-red-600 bg-red-50">
                              High Priority
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <Calendar className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 mb-2">
                      No upcoming events
                    </p>
                    <Link 
                      href="/schedule"
                      className="text-sm font-medium text-purple-600 hover:text-purple-500"
                    >
                      Schedule your first event →
                    </Link>
                  </div>
                )}
              </div>

              {upcomingEvents.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Link 
                    href="/schedule"
                    className="text-sm font-medium text-purple-600 hover:text-purple-500"
                  >
                    View full schedule →
                  </Link>
                </div>
              )}
            </div>


          </motion.div>
        </div>


      </motion.div>
    </div>
  );
}
