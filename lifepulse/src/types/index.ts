export interface Task {
  id: string;
  title: string;
  description?: string;
  type: TaskType;
  purpose: string;
  mode: TaskMode;
  // For deadline tasks
  deadline?: Date;
  // For time-range tasks
  startTime?: Date;
  endTime?: Date;
  completed: boolean;
  priority: Priority;
  createdAt: Date;
  updatedAt: Date;
  googleCalendarEventId?: string;
  isReminder?: boolean; // Flag for auto-generated reminders
  parentTaskId?: string; // Reference to original task for reminders
}

export enum TaskMode {
  DEADLINE = 'deadline', // Traditional deadline task
  TIME_RANGE = 'time_range' // Time-blocked task with start and end
}

export enum TaskType {
  WORK = 'work',
  PERSONAL = 'personal',
  HEALTH = 'health',
  LEARNING = 'learning',
  HOUSEHOLD = 'household',
  OTHER = 'other'
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export interface HydrationEntry {
  id: string;
  timestamp: Date;
  amount: number; // in ml
  type: 'glass' | 'custom';
}

export interface HydrationGoal {
  dailyGoal: number; // in ml
  glassSize: number; // in ml (default 250)
}

export interface MeditationSession {
  id: string;
  duration: number; // in minutes
  type: BreathingPattern;
  completedAt: Date;
}

export enum BreathingPattern {
  BASIC = 'basic', // 4-4-4 (inhale-hold-exhale)
  RELAXING = 'relaxing', // 4-7-8
  ENERGIZING = 'energizing', // 6-2-6
  BALANCED = 'balanced' // 4-4-4-4 (inhale-hold-exhale-hold)
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  type: 'task' | 'event';
  taskId?: string;
  googleCalendarEventId?: string;
}

export interface DailyStats {
  date: string; // YYYY-MM-DD
  tasksCompleted: number;
  totalTasks: number;
  hydrationAchieved: number; // in ml
  hydrationGoal: number; // in ml
  meditationMinutes: number;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  hydrationReminders: boolean;
  hydrationReminderInterval: number; // in minutes
  dailyHydrationGoal: number; // in ml
  defaultGlassSize: number; // in ml
  meditationReminders: boolean;
  weekStartsOn: 0 | 1; // 0 = Sunday, 1 = Monday
} 