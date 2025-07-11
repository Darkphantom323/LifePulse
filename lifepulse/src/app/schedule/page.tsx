'use client';

import { useSchedule, useCreateScheduleEvent, useUpdateScheduleEvent, useDeleteScheduleEvent } from '@/hooks/useApi';
import { useAuth } from '@/components/providers';
import { useState, useEffect, useMemo } from 'react';
import { format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  setHours,
  setMinutes,
  addMinutes
} from 'date-fns';
import { 
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Grid3X3,
  Rows3,
  Square,
  Edit3,
  Trash2,
  X,
  Loader2,
  CheckCircle,
  Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import WeekCalendar from '@/components/WeekCalendar';
import DayCalendar from '@/components/DayCalendar';
import { useGoals } from '@/hooks/useApi';

// Enhanced color schemes for month view only
const eventTypeColors = {
  'work': { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-800', dot: 'bg-blue-500' },
  'personal': { bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-800', dot: 'bg-green-500' },
  'health': { bg: 'bg-red-100', border: 'border-red-300', text: 'text-red-800', dot: 'bg-red-500' },
  'social': { bg: 'bg-purple-100', border: 'border-purple-300', text: 'text-purple-800', dot: 'bg-purple-500' },
  'other': { bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-800', dot: 'bg-gray-500' },
  // Add goal styling
  goal: {
    bg: 'bg-orange-50',
    border: 'border-l-orange-400',
    text: 'text-orange-700',
    dot: 'bg-orange-500'
  }
};

// Generate time options for dropdowns
const generateTimeOptions = () => {
  const options = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) { // 15-minute intervals
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const displayString = format(setMinutes(setHours(new Date(), hour), minute), 'h:mm a');
      options.push({ value: timeString, label: displayString });
    }
  }
  return options;
};

const timeOptions = generateTimeOptions();

export default function SchedulePage() {
  const { data: scheduleEvents = [], isLoading } = useSchedule();
  const createScheduleEvent = useCreateScheduleEvent();
  const updateScheduleEvent = useUpdateScheduleEvent();
  const deleteScheduleEvent = useDeleteScheduleEvent();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [view, setView] = useState<'month' | 'week' | 'day'>('week');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });

  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '09:00',
    endTime: '10:00',
    category: 'personal' as 'work' | 'personal' | 'health' | 'social' | 'other',
    priority: 'medium' as 'low' | 'medium' | 'high',
    selectedSlot: null as { date: Date, hour: number } | null,
  });

  const [editEventForm, setEditEventForm] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '09:00',
    endTime: '10:00',
    category: 'personal' as 'work' | 'personal' | 'health' | 'social' | 'other',
    priority: 'medium' as 'low' | 'medium' | 'high',
  });

  // Update current time every minute for the time indicator
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Navigation handlers
  const handlePrevious = () => {
    if (view === 'month') {
      setCurrentDate(subMonths(currentDate, 1));
    } else if (view === 'week') {
      setCurrentDate(subWeeks(currentDate, 1));
    } else {
      setCurrentDate(subDays(currentDate, 1));
    }
  };

  const handleNext = () => {
    if (view === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else if (view === 'week') {
      setCurrentDate(addWeeks(currentDate, 1));
    } else {
      setCurrentDate(addDays(currentDate, 1));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Get calendar dates for different views
  const getCalendarData = () => {
    switch (view) {
      case 'month':
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        const calendarStart = startOfWeek(monthStart);
        const calendarEnd = endOfWeek(monthEnd);
        return { 
          startDate: calendarStart, 
          endDate: calendarEnd,
          dates: eachDayOfInterval({ start: calendarStart, end: calendarEnd })
        };
      case 'week':
        const weekStart = startOfWeek(currentDate);
        const weekEnd = endOfWeek(currentDate);
        return { 
          startDate: weekStart, 
          endDate: weekEnd,
          dates: eachDayOfInterval({ start: weekStart, end: weekEnd })
        };
      case 'day':
        return { 
          startDate: currentDate, 
          endDate: currentDate,
          dates: [currentDate]
        };
      default:
        return { 
          startDate: new Date(), 
          endDate: new Date(),
          dates: [new Date()]
        };
    }
  };

  const { dates: calendarDates } = getCalendarData();

  // Get events for a specific date (month view only)
  const getEventsForDate = (date: Date) => {
    const dayEvents = scheduleEvents.filter((event: any) => 
      isSameDay(new Date(event.startTime), date)
    );

    // Add goals that have deadlines on this date
    const dayGoals = goals.filter((goal: any) => 
      goal.deadline && isSameDay(new Date(goal.deadline), date)
    ).map((goal: any) => ({
      ...goal,
      type: 'goal', // Add type to distinguish from events
      startTime: goal.deadline,
      endTime: goal.deadline
    }));

    return [...dayEvents, ...dayGoals];
  };

  // Transform schedule events to match CalendarEvent interface
  const transformedCalendarEvents = useMemo(() => {
    return scheduleEvents.map((event: any) => ({
      ...event,
      start: new Date(event.startTime),
      end: new Date(event.endTime),
      type: 'event' as const,
    }));
  }, [scheduleEvents]);

  // Fetch goals
  const { data: goals = [] } = useGoals();

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading schedule...</p>
        </div>
      </div>
    );
  }

  const getDateTitle = () => {
    if (view === 'month') {
      return format(currentDate, 'MMMM yyyy');
    } else if (view === 'week') {
      const weekStart = startOfWeek(currentDate);
      const weekEnd = endOfWeek(currentDate);
      return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
    } else {
      return format(currentDate, 'EEEE, MMMM d, yyyy');
    }
  };

  // Handle clicking on time slots to create events
  const handleTimeSlotClick = (date: Date, hour: number) => {
    const slotTime = setHours(setMinutes(date, 0), hour);
    const endTime = addMinutes(slotTime, 60);
    
    setEventForm({
      title: '',
      description: '',
      date: format(date, 'yyyy-MM-dd'),
      startTime: format(slotTime, 'HH:mm'),
      endTime: format(endTime, 'HH:mm'),
      category: 'personal',
      priority: 'medium',
      selectedSlot: { date, hour },
    });
    setShowAddEvent(true);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setCurrentDate(date);
    setView('day'); // Navigate to day view when clicking a date
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title || !eventForm.date || !eventForm.startTime || !eventForm.endTime) return;

    try {
      // Combine date and time to create proper datetime strings - NO TIMEZONE CONVERSION
      const startDateTimeString = `${eventForm.date}T${eventForm.startTime}:00`;
      const endDateTimeString = `${eventForm.date}T${eventForm.endTime}:00`;

      console.log('Creating event with data:', {
        title: eventForm.title,
        description: eventForm.description,
        startTime: startDateTimeString,
        endTime: endDateTimeString,
        category: eventForm.category.toUpperCase(),
        priority: eventForm.priority.toUpperCase(),
      });

      // Create the schedule event
      await createScheduleEvent.mutateAsync({
        title: eventForm.title,
        description: eventForm.description,
        startTime: startDateTimeString,
        endTime: endDateTimeString,
        category: eventForm.category.toUpperCase(),
        priority: eventForm.priority.toUpperCase(),
      });

      setEventForm({
        title: '',
        description: '',
        date: '',
        startTime: '09:00',
        endTime: '10:00',
        category: 'personal',
        priority: 'medium',
        selectedSlot: null,
      });
      setShowAddEvent(false);
    } catch (error) {
      console.error('Failed to create event:', error);
    }
  };

  const handleEventClick = (event: any, clickEvent: React.MouseEvent) => {
    // Don't show popup for goals - they should be managed in the goals page
    if (event.type === 'goal') {
      return;
    }

    setSelectedEvent(event);
    setShowEventDetails(true);
    setIsEditingEvent(false);
    
    // Calculate popup position relative to the clicked event
    const rect = clickEvent.currentTarget.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const popupWidth = 320; // Approximate popup width
    const popupHeight = 400; // Increased for editing form
    const margin = 16; // Margin from screen edges
    
    let x = rect.right + 10; // Position to the right of the event
    let y = rect.top;
    
    // Adjust if popup would go off-screen to the right
    if (x + popupWidth > viewportWidth - margin) {
      x = rect.left - popupWidth - 10; // Position to the left instead
    }
    
    // Adjust if popup would still go off-screen horizontally (both sides)
    if (x < margin) {
      x = Math.max(margin, Math.min(rect.left, viewportWidth - popupWidth - margin));
    }
    
    // Ensure popup stays within horizontal bounds
    x = Math.max(margin, Math.min(x, viewportWidth - popupWidth - margin));
    
    // Adjust if popup would go off-screen vertically
    if (y + popupHeight > viewportHeight - margin) {
      y = Math.max(margin, viewportHeight - popupHeight - margin);
    }
    
    // Ensure popup stays within vertical bounds
    y = Math.max(margin, Math.min(y, viewportHeight - popupHeight - margin));
    
    setPopupPosition({ x, y });
    
    setEditEventForm({
      title: event.title,
      description: event.description || '',
      date: format(new Date(event.startTime), 'yyyy-MM-dd'),
      startTime: format(new Date(event.startTime), 'HH:mm'),
      endTime: format(new Date(event.endTime), 'HH:mm'),
      category: event.category || 'personal',
      priority: event.priority || 'medium',
    });
  };

  const handleEditEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;
    if (!editEventForm.title || !editEventForm.date || !editEventForm.startTime || !editEventForm.endTime) return;

    try {
      // Combine date and time to create proper datetime strings - NO TIMEZONE CONVERSION
      const startDateTimeString = `${editEventForm.date}T${editEventForm.startTime}:00`;
      const endDateTimeString = `${editEventForm.date}T${editEventForm.endTime}:00`;

      await updateScheduleEvent.mutateAsync({
        eventId: selectedEvent.id,
        updates: {
          title: editEventForm.title,
          description: editEventForm.description,
          startTime: startDateTimeString,
          endTime: endDateTimeString,
          category: editEventForm.category.toUpperCase(),
          priority: editEventForm.priority.toUpperCase(),
        }
      });

      setShowEventDetails(false);
      setSelectedEvent(null);
      setIsEditingEvent(false);
      // Data will refresh automatically via React Query
    } catch (error) {
      console.error('Failed to update event:', error);
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    
    console.log('Deleting event:', selectedEvent);
    console.log('Event ID:', selectedEvent.id);
    console.log('Event ID type:', typeof selectedEvent.id);
    
    try {
      await deleteScheduleEvent.mutateAsync(selectedEvent.id);
      setShowEventDetails(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Failed to delete event:', error);
    }
  };

  // Event styling helper (month view only)
  const getEventStyling = (event: any) => {
    const eventType = event.type === 'goal' ? 'goal' : event.category;
    const typeColors = eventTypeColors[eventType as keyof typeof eventTypeColors] || eventTypeColors.other;
    return {
      className: `${typeColors.bg} ${typeColors.border} ${typeColors.text}`,
      dotColor: typeColors.dot,
      borderColor: typeColors.dot.includes('blue') ? '#3b82f6' : 
                  typeColors.dot.includes('green') ? '#10b981' :
                  typeColors.dot.includes('red') ? '#ef4444' :
                  typeColors.dot.includes('purple') ? '#8b5cf6' :
                  typeColors.dot.includes('yellow') ? '#f59e0b' : '#6b7280'
    };
  };

  // Enhanced month view
  const renderEnhancedMonthView = () => (
    <div className="p-6 bg-white">
      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDates.map((date) => {
          const events = getEventsForDate(date);
          const isCurrentMonth = isSameMonth(date, currentDate);
          const isSelectedDate = selectedDate && isSameDay(date, selectedDate);
          const isTodayDate = isToday(date);

          return (
            <motion.button
              key={date.toString()}
              onClick={() => handleDateClick(date)}
              className={`
                relative h-28 p-2 text-left rounded-lg border transition-all hover:bg-gray-50
                ${isCurrentMonth 
                  ? 'text-gray-900' 
                  : 'text-gray-400'
                }
                ${isTodayDate 
                  ? 'bg-blue-50 border-blue-200' 
                  : 'border-gray-200'
                }
                ${isSelectedDate 
                  ? 'ring-2 ring-blue-500 bg-blue-50' 
                  : ''
                }
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm font-medium ${isTodayDate ? 'text-blue-700' : ''}`}>
                  {format(date, 'd')}
                </span>
                {events.length > 0 && (
                  <div className="flex gap-1">
                    {events.slice(0, 3).map((event: any, i: number) => {
                      const styling = getEventStyling(event);
                      return (
                        <div key={i} className={`w-2 h-2 rounded-full ${styling.dotColor}`} />
                      );
                    })}
                  </div>
                )}
              </div>
              
              <div className="space-y-1">
                {events.slice(0, 3).map((event: any, index: number) => {
                  const styling = getEventStyling(event);
                  return (
                    <div
                      key={index}
                      className={`text-xs px-1 py-0.5 rounded truncate border-l-2 ${styling.className} cursor-pointer`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEventClick(event, e);
                      }}
                    >
                      <div className="flex items-center gap-1">
                        {event.type === 'goal' && <Target className="h-3 w-3 flex-shrink-0" />}
                        {event.type === 'goal' && event.completed && <CheckCircle className="h-3 w-3 flex-shrink-0" />}
                        <span className="truncate">{event.title}</span>
                      </div>
                      {event.type === 'goal' && event.targetValue && (
                        <div className="text-xs opacity-75 mt-0.5">
                          {event.currentValue}/{event.targetValue} {event.unit}
                        </div>
                      )}
                    </div>
                  );
                })}
                {events.length > 3 && (
                  <div className="text-xs text-gray-500">
                    +{events.length - 3} more
                  </div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-gray-200 gap-4 bg-white">
        <div className="flex items-center gap-4">
          <button
            onClick={handlePrevious}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-semibold text-gray-900 min-w-fit">
            {getDateTitle()}
          </h2>
          <button
            onClick={handleNext}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddEvent(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create
          </button>
          
          {/* View Switcher */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setView('month')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                view === 'month' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid3X3 className="h-4 w-4" />
              Month
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                view === 'week' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Rows3 className="h-4 w-4" />
              Week
            </button>
            <button
              onClick={() => setView('day')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                view === 'day' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Square className="h-4 w-4" />
              Day
            </button>
          </div>
          
          <button
            onClick={handleToday}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Today
          </button>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {view === 'month' && renderEnhancedMonthView()}
            {view === 'week' && (
              <WeekCalendar
                currentDate={currentDate}
                tasks={[]}
                calendarEvents={transformedCalendarEvents}
                currentTime={currentTime}
                onTimeSlotClick={handleTimeSlotClick}
                onDateClick={handleDateClick}
                onEventClick={handleEventClick}
              />
            )}
            {view === 'day' && (
              <DayCalendar
                currentDate={currentDate}
                tasks={[]}
                calendarEvents={transformedCalendarEvents}
                currentTime={currentTime}
                onTimeSlotClick={handleTimeSlotClick}
                onEventClick={handleEventClick}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Add Event Modal */}
      <AnimatePresence>
        {showAddEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowAddEvent(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Create Event</h2>
              <form onSubmit={handleAddEvent} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={eventForm.title}
                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                    placeholder="Event title"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={eventForm.description}
                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                    rows={3}
                    placeholder="Event description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={eventForm.category}
                      onChange={(e) => setEventForm({ ...eventForm, category: e.target.value as any })}
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                    >
                      <option value="personal">Personal</option>
                      <option value="work">Work</option>
                      <option value="health">Health</option>
                      <option value="social">Social</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <select
                      value={eventForm.priority}
                      onChange={(e) => setEventForm({ ...eventForm, priority: e.target.value as any })}
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={eventForm.date}
                    onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time *
                    </label>
                    <select
                      value={eventForm.startTime}
                      onChange={(e) => setEventForm({ ...eventForm, startTime: e.target.value })}
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                      required
                    >
                      {timeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time *
                    </label>
                    <select
                      value={eventForm.endTime}
                      onChange={(e) => setEventForm({ ...eventForm, endTime: e.target.value })}
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                      required
                    >
                      {timeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={createScheduleEvent.isPending}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {createScheduleEvent.isPending ? 'Creating...' : 'Create Event'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddEvent(false)}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Event Details Popup */}
      <AnimatePresence>
        {showEventDetails && selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
            onClick={() => setShowEventDetails(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: -10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: -10 }}
              className="absolute bg-white rounded-lg shadow-2xl border border-gray-200 p-4 w-80 max-w-sm"
              style={{
                left: popupPosition.x,
                top: popupPosition.y,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-gray-900">
                  Event Details
                </h2>
                <button
                  onClick={() => setShowEventDetails(false)}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              {!isEditingEvent ? (
                <div className="space-y-3">
                  <div>
                    <h3 className="text-base font-medium text-gray-900 mb-1">
                      {selectedEvent.title}
                    </h3>
                    {selectedEvent.description && (
                      <p className="text-sm text-gray-600">
                        {selectedEvent.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="border-t pt-3">
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <div>{format(new Date(selectedEvent.startTime), 'EEEE, MMMM d, yyyy')}</div>
                        <div className="text-xs">{format(new Date(selectedEvent.startTime), 'h:mm a')} - {format(new Date(selectedEvent.endTime), 'h:mm a')}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                      <div className={`w-3 h-3 rounded-full ${eventTypeColors[selectedEvent.category as keyof typeof eventTypeColors]?.dot || 'bg-gray-500'}`} />
                      <span>{selectedEvent.category.charAt(0).toUpperCase() + selectedEvent.category.slice(1)}</span>
                      <span>•</span>
                      <span>{selectedEvent.priority.charAt(0).toUpperCase() + selectedEvent.priority.slice(1)} Priority</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setIsEditingEvent(true)}
                      disabled={updateScheduleEvent.isPending || deleteScheduleEvent.isPending}
                      className="flex-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                    >
                      <Edit3 className="h-3 w-3" />
                      Edit
                    </button>
                    <button
                      onClick={handleDeleteEvent}
                      disabled={updateScheduleEvent.isPending || deleteScheduleEvent.isPending}
                      className="flex-1 px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                    >
                      <Trash2 className="h-3 w-3" />
                      {deleteScheduleEvent.isPending ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleEditEvent} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={editEventForm.title}
                      onChange={(e) => setEditEventForm({ ...editEventForm, title: e.target.value })}
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={editEventForm.description}
                      onChange={(e) => setEditEventForm({ ...editEventForm, description: e.target.value })}
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={editEventForm.date}
                      onChange={(e) => setEditEventForm({ ...editEventForm, date: e.target.value })}
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Time *
                      </label>
                      <select
                        value={editEventForm.startTime}
                        onChange={(e) => setEditEventForm({ ...editEventForm, startTime: e.target.value })}
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        {timeOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Time *
                      </label>
                      <select
                        value={editEventForm.endTime}
                        onChange={(e) => setEditEventForm({ ...editEventForm, endTime: e.target.value })}
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        {timeOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-3">
                    <button
                      type="submit"
                      disabled={updateScheduleEvent.isPending}
                      className="flex-1 px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {updateScheduleEvent.isPending ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingEvent(false)}
                      className="flex-1 px-3 py-1.5 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 