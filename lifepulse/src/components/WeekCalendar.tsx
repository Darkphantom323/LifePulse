'use client';

import { useCallback, useMemo } from 'react';
import { format, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameDay, 
  isToday,
  getHours,
  getMinutes,
  addMinutes
} from 'date-fns';
import { motion } from 'framer-motion';
import { Task, CalendarEvent, TaskMode, TaskType, Priority } from '@/types';

// Enhanced color schemes for better visual hierarchy
const taskTypeColors = {
  [TaskType.WORK]: { bg: 'bg-blue-100 dark:bg-blue-900/30', border: 'border-blue-300 dark:border-blue-700', text: 'text-blue-800 dark:text-blue-200', dot: 'bg-blue-500' },
  [TaskType.PERSONAL]: { bg: 'bg-green-100 dark:bg-green-900/30', border: 'border-green-300 dark:border-green-700', text: 'text-green-800 dark:text-green-200', dot: 'bg-green-500' },
  [TaskType.HEALTH]: { bg: 'bg-red-100 dark:bg-red-900/30', border: 'border-red-300 dark:border-red-700', text: 'text-red-800 dark:text-red-200', dot: 'bg-red-500' },
  [TaskType.LEARNING]: { bg: 'bg-purple-100 dark:bg-purple-900/30', border: 'border-purple-300 dark:border-purple-700', text: 'text-purple-800 dark:text-purple-200', dot: 'bg-purple-500' },
  [TaskType.HOUSEHOLD]: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', border: 'border-yellow-300 dark:border-yellow-700', text: 'text-yellow-800 dark:text-yellow-200', dot: 'bg-yellow-500' },
  [TaskType.OTHER]: { bg: 'bg-gray-100 dark:bg-gray-700/30', border: 'border-gray-300 dark:border-gray-600', text: 'text-gray-800 dark:text-gray-200', dot: 'bg-gray-500' },
};

// Constants for better calendar layout
const HOUR_HEIGHT = 60; // Height of each hour slot in pixels
const TIME_COLUMN_WIDTH = 80; // Width of the time column in pixels

// Static time slots from 12 AM to 11 PM
const timeSlots = Array.from({ length: 24 }, (_, i) => i);

type WeekEventWithPosition = (Task | CalendarEvent) & {
  top: number;
  height: number;
  left: number;
  width: number;
  zIndex: number;
  dayIndex: number;
}

interface WeekCalendarProps {
  currentDate: Date;
  tasks: Task[];
  calendarEvents: CalendarEvent[];
  currentTime: Date;
  onTimeSlotClick: (date: Date, hour: number) => void;
  onDateClick: (date: Date) => void;
  onEventClick: (event: Task | CalendarEvent, clickEvent: React.MouseEvent) => void;
}

export default function WeekCalendar({
  currentDate,
  tasks,
  calendarEvents,
  currentTime,
  onTimeSlotClick,
  onDateClick,
  onEventClick
}: WeekCalendarProps) {
  
  // Get week dates
  const weekDates = useMemo(() => {
    const weekStart = startOfWeek(currentDate);
    const weekEnd = endOfWeek(currentDate);
    return eachDayOfInterval({ start: weekStart, end: weekEnd });
  }, [currentDate]);

  // Type guard functions
  const isTask = (event: any): event is Task => 'deadline' in event;
  const isCalendarEvent = (event: any): event is CalendarEvent => 'start' in event && !('deadline' in event);

  // Week-specific event positioning logic
  const calculateWeekEventPositions = useCallback((events: (Task | CalendarEvent)[], dates: Date[]): WeekEventWithPosition[] => {
    const positionedEvents: WeekEventWithPosition[] = [];
    
    // Process events for each day separately
    dates.forEach((date, dayIndex) => {
      const dayEvents = events.filter(event => {
        if (isTask(event) && event.completed) return false;
        
        // For deadline tasks, only show the reminder, not the original task
        if (isTask(event) && event.mode === TaskMode.DEADLINE && !event.isReminder) {
          return false;
        }
        
        let eventDate: Date | undefined;
        if (isTask(event)) {
          eventDate = event.mode === TaskMode.TIME_RANGE ? event.startTime : event.deadline;
        } else if (isCalendarEvent(event)) {
          eventDate = event.start;
        }
        
        return eventDate && isSameDay(eventDate, date);
      });

      // Sort events by start time
      const sortedEvents = dayEvents.sort((a, b) => {
        let aTime: Date;
        let bTime: Date;
        
        if (isTask(a)) {
          aTime = a.mode === TaskMode.TIME_RANGE ? a.startTime! : a.deadline!;
        } else if (isCalendarEvent(a)) {
          aTime = a.start;
        } else {
          aTime = new Date();
        }
        
        if (isTask(b)) {
          bTime = b.mode === TaskMode.TIME_RANGE ? b.startTime! : b.deadline!;
        } else if (isCalendarEvent(b)) {
          bTime = b.start;
        } else {
          bTime = new Date();
        }
        
        return aTime.getTime() - bTime.getTime();
      });

      // Process overlapping events for this day
      const dayColumns: { start: number; end: number; events: WeekEventWithPosition[] }[] = [];

      sortedEvents.forEach(event => {
        let eventStart: Date;
        let eventEnd: Date;
        
        if (isTask(event)) {
          if (event.mode === TaskMode.TIME_RANGE) {
            eventStart = event.startTime!;
            eventEnd = event.endTime!;
          } else {
            eventStart = event.deadline!;
            eventEnd = addMinutes(event.deadline!, 15);
          }
        } else {
          eventStart = event.start;
          eventEnd = event.end;
        }

        const startMinutes = getHours(eventStart) * 60 + getMinutes(eventStart);
        const endMinutes = getHours(eventEnd) * 60 + getMinutes(eventEnd);
        const duration = Math.max(endMinutes - startMinutes, 15); // Minimum 15 minutes

        // Find the first column where this event can fit
        let columnIndex = dayColumns.findIndex(col => col.end <= startMinutes);
        
        if (columnIndex === -1) {
          // Create a new column
          columnIndex = dayColumns.length;
          dayColumns.push({ start: startMinutes, end: endMinutes, events: [] });
        } else {
          // Update the column end time
          dayColumns[columnIndex].end = Math.max(dayColumns[columnIndex].end, endMinutes);
        }

        // Calculate position within the day
        let topPosition = Math.round((startMinutes / 60) * HOUR_HEIGHT);
        const endPosition = Math.round((endMinutes / 60) * HOUR_HEIGHT);
        let rawHeight = endPosition - topPosition;

        // Nudge away from hour grid borders
        if (startMinutes % 60 === 0 && rawHeight > 1) {
          topPosition += 1;
          rawHeight -= 1;
        }
        if (endMinutes % 60 === 0 && rawHeight > 1) {
          rawHeight -= 1;
        }

        const finalHeight = Math.max(rawHeight, 2);
        
        const positionedEvent: WeekEventWithPosition = {
          ...event,
          top: topPosition,
          height: finalHeight,
          left: columnIndex, // Column within the day
          width: 1, // Will be adjusted for overlaps
          zIndex: 10 + columnIndex,
          dayIndex: dayIndex,
        };

        dayColumns[columnIndex].events.push(positionedEvent);
        positionedEvents.push(positionedEvent);
      });

      // Normalize overlapping events within this day
      const dayPositionedEvents = positionedEvents.filter(e => e.dayIndex === dayIndex);
      
      // Group overlapping events
      const overlaps = (a: WeekEventWithPosition, b: WeekEventWithPosition) => {
        const aStart = a.top;
        const aEnd = a.top + a.height;
        const bStart = b.top;
        const bEnd = b.top + b.height;
        return aStart < bEnd && bStart < aEnd;
      };

      const visited = new Set<WeekEventWithPosition>();
      dayPositionedEvents.forEach(evt => {
        if (visited.has(evt)) return;
        
        // BFS to collect overlap cluster
        const group: WeekEventWithPosition[] = [];
        const stack: WeekEventWithPosition[] = [evt];
        
        while (stack.length) {
          const current = stack.pop()!;
          if (visited.has(current)) continue;
          visited.add(current);
          group.push(current);
          
          dayPositionedEvents.forEach(other => {
            if (!visited.has(other) && overlaps(current, other)) {
              stack.push(other);
            }
          });
        }

        // Unique columns used in this group
        const uniqueCols = Array.from(new Set(group.map(e => e.left))).sort((a, b) => a - b);
        const colsCount = uniqueCols.length;

        group.forEach(ev => {
          const colIdxRel = uniqueCols.indexOf(ev.left);
          ev.width = 1 / colsCount;
          ev.left = colIdxRel / colsCount;
        });
      });
    });

    return positionedEvents;
  }, []);

  // Get events for the week with positioning
  const weekEvents = useMemo(() => {
    const allEvents = [...tasks, ...calendarEvents];
    return calculateWeekEventPositions(allEvents, weekDates);
  }, [tasks, calendarEvents, weekDates, calculateWeekEventPositions]);

  // Event styling helper
  const getEventStyling = (event: Task | CalendarEvent) => {
    if (isTask(event)) {
      const typeColors = taskTypeColors[event.type] || taskTypeColors[TaskType.OTHER];
      return {
        className: `${typeColors.bg} ${typeColors.text}`,
        dotColor: typeColors.dot,
        borderColor: typeColors.border.includes('border-blue') ? '#3b82f6' : 
                    typeColors.border.includes('border-green') ? '#10b981' :
                    typeColors.border.includes('border-red') ? '#ef4444' :
                    typeColors.border.includes('border-purple') ? '#8b5cf6' :
                    typeColors.border.includes('border-yellow') ? '#f59e0b' : '#6b7280'
      };
    } else {
      return {
        className: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
        dotColor: 'bg-blue-500',
        borderColor: '#3b82f6'
      };
    }
  };

  // Get current time indicator position
  const getCurrentTimePosition = (date: Date) => {
    if (!isToday(date)) return null;
    
    const now = currentTime;
    const hours = getHours(now);
    const minutes = getMinutes(now);
    const totalMinutes = hours * 60 + minutes;
    
    return (totalMinutes / 60) * HOUR_HEIGHT;
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Week Header */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 sticky top-0 z-20">
        <div className="w-20 p-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
          {/* Empty space for time column */}
        </div>
        {weekDates.map(date => (
          <div key={date.toString()} className="flex-1 p-4 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" onClick={() => onDateClick(date)}>
            <div className={`text-xs font-medium uppercase tracking-wide mb-2 ${isToday(date) ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
              {format(date, 'EEE')}
            </div>
            <div className={`text-2xl font-semibold ${isToday(date) ? 'bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto' : 'text-gray-900 dark:text-white'}`}>
              {format(date, 'd')}
            </div>
          </div>
        ))}
      </div>

      {/* Time Grid */}
      <div className="flex-1 overflow-auto">
        <div className="relative min-h-full">
          {timeSlots.map(hour => (
            <div key={hour} className="flex relative" style={{ height: HOUR_HEIGHT }}>
              {/* Time Column */}
              <div className="w-20 relative">
                {hour > 0 && hour <= 23 && (
                  <div className="absolute -top-2 right-2 text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 pr-2">
                    {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                  </div>
                )}
              </div>
              
              {/* Day Columns Container with Grid Line */}
              <div className={`flex-1 flex relative ${hour < 23 ? 'border-b border-gray-100 dark:border-gray-700/30' : ''}`}>
                {/* Day Columns */}
                {weekDates.map((date, dayIndex) => (
                  <div
                    key={`${date.toString()}-${hour}`}
                    className="flex-1 relative hover:bg-gray-50 dark:hover:bg-gray-800/20 cursor-pointer transition-colors group border-r border-gray-100 dark:border-gray-700/30 last:border-r-0"
                    onClick={() => onTimeSlotClick(date, hour)}
                  >
                    {/* Hover effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute inset-x-1 inset-y-0 bg-blue-50 dark:bg-blue-900/10 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          {/* Current Time Indicator */}
          {weekDates.map((date, dayIndex) => {
            const timePosition = getCurrentTimePosition(date);
            if (timePosition === null) return null;
            
            const totalDays = weekDates.length;
            
            return (
              <div
                key={`time-indicator-${date.toString()}`}
                className="absolute z-30 pointer-events-none"
                style={{
                  top: timePosition,
                  left: `${TIME_COLUMN_WIDTH}px`,
                  width: `calc((100% - ${TIME_COLUMN_WIDTH}px) / ${totalDays})`,
                  marginLeft: `calc((100% - ${TIME_COLUMN_WIDTH}px) * ${dayIndex} / ${totalDays})`,
                }}
              >
                <div className="relative">
                  <div className="absolute left-0 w-2 h-2 bg-red-500 rounded-full -ml-1 -mt-1" />
                  <div className="h-0.5 bg-red-500" />
                </div>
              </div>
            );
          })}
          
          {/* Positioned Events */}
          {weekEvents.map((event, eventIndex) => {
            const styling = getEventStyling(event);
            const totalDays = weekDates.length;
            
            // Week-specific positioning: (dayIndex + event.left) / totalDays
            const leftPercentage = (event.dayIndex + event.left) / totalDays;
            const widthPercentage = event.width / totalDays;
            
            return (
              <motion.div
                key={`${event.id}-${eventIndex}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`absolute rounded shadow-sm cursor-pointer transition-all hover:shadow-md hover:z-20 ${styling.className}`}
                style={{
                  top: event.top,
                  height: Math.max(event.height, 12),
                  left: `calc(${TIME_COLUMN_WIDTH}px + (100% - ${TIME_COLUMN_WIDTH}px) * ${leftPercentage})`,
                  width: `calc((100% - ${TIME_COLUMN_WIDTH}px) * ${widthPercentage} - 1px)`,
                  zIndex: event.zIndex,
                  boxShadow: `inset 4px 0 0 ${styling.borderColor}`,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onEventClick(event, e);
                }}
              >
                <div className="px-1 py-0.5 h-full flex flex-col justify-center overflow-hidden">
                  <div className={`font-medium leading-tight text-gray-900 dark:text-white ${
                    event.height < 18 ? 'text-[10px]' : event.height < 26 ? 'text-xs' : event.height < 40 ? 'text-sm' : 'text-sm'
                  }`}>
                    {isTask(event) && event.isReminder 
                      ? `Reminder: ${event.title.replace(/^(?:[⏰\s]*Reminder:\s*)/i, '')}` 
                      : event.title}
                  </div>
                  {event.height > 35 && (
                    <div className="text-xs text-gray-600 dark:text-gray-300 mt-0.5 leading-none truncate">
                      {isTask(event) ? (
                        event.mode === TaskMode.TIME_RANGE 
                          ? `${format(event.startTime!, 'h:mm a')} - ${format(event.endTime!, 'h:mm a')}`
                          : `${format(event.deadline!, 'h:mm a')}`
                      ) : isCalendarEvent(event) ? (
                        `${format(event.start, 'h:mm a')} - ${format(event.end, 'h:mm a')}`
                      ) : ''}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 