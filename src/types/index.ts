// ========================================
// TYPES - Espelho dos tipos do backend
// ========================================

export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'archived';
export type RecurrencePattern = 'daily' | 'weekly' | 'monthly' | 'custom';
export type ThemePreference = 'light' | 'dark' | 'auto';

// ========================================
// DATABASE MODELS
// ========================================

export interface User {
  id: string;
  email: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  theme_preference: ThemePreference;
  custom_color: string;
  notifications_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  category_id: string | null;
  category?: Category;
  title: string;
  description: string | null;
  priority: Priority;
  status: TaskStatus;
  due_date: string | null;
  reminder_date: string | null;
  completed_at: string | null;
  is_recurring: boolean;
  recurrence_pattern: RecurrencePattern | null;
  recurrence_interval: number | null;
  position: number;
  estimated_time: number | null;
  actual_time: number | null;
  tags: string[];
  attachments: Attachment[];
  subtasks?: Subtask[];
  created_at: string;
  updated_at: string;
}

export interface Subtask {
  id: string;
  task_id: string;
  title: string;
  completed: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface PomodoroSession {
  id: string;
  user_id: string;
  task_id: string | null;
  task?: { title: string };
  duration: number;
  completed: boolean;
  started_at: string;
  completed_at: string | null;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  task_id: string | null;
  task?: { title: string };
  action: string;
  details: Record<string, any>;
  created_at: string;
}

export interface Attachment {
  name: string;
  url: string;
  type: string;
  size?: number;
}

// ========================================
// FORM DATA TYPES
// ========================================

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  full_name?: string;
}

export interface TaskFormData {
  title: string;
  description?: string;
  category_id?: string;
  priority?: Priority;
  status?: TaskStatus;
  due_date?: string;
  reminder_date?: string;
  is_recurring?: boolean;
  recurrence_pattern?: RecurrencePattern;
  recurrence_interval?: number;
  estimated_time?: number;
  tags?: string[];
  attachments?: Attachment[];
}

export interface CategoryFormData {
  name: string;
  color?: string;
  icon?: string;
}

export interface SubtaskFormData {
  title: string;
}

export interface ProfileFormData {
  full_name?: string;
  avatar_url?: string;
  theme_preference?: ThemePreference;
  custom_color?: string;
  notifications_enabled?: boolean;
}

// ========================================
// API RESPONSE TYPES
// ========================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface TaskStatistics {
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  in_progress_tasks: number;
  overdue_tasks: number;
  completion_rate: number;
  total_time_spent: number;
  average_completion_time: number;
}

export interface ProductivityData {
  date: string;
  tasks_completed: number;
  time_spent: number;
}

export interface CategoryDistribution {
  id: string;
  name: string;
  color: string;
  count: number;
}

export interface PriorityDistribution {
  priority: string;
  total: number;
  completed: number;
  pending: number;
  completion_rate: number;
}

// ========================================
// FILTER TYPES
// ========================================

export interface TaskFilters {
  status?: TaskStatus;
  priority?: Priority;
  category_id?: string;
  tags?: string[];
  search?: string;
  due_date_from?: string;
  due_date_to?: string;
}

export interface SortOption {
  field: 'due_date' | 'priority' | 'created_at' | 'title';
  direction: 'asc' | 'desc';
}

// ========================================
// UI STATE TYPES
// ========================================

export interface ModalState {
  isOpen: boolean;
  mode: 'create' | 'edit';
  task?: Task;
}

export interface DrawerState {
  isOpen: boolean;
  taskId?: string;
}

export interface PomodoroState {
  isRunning: boolean;
  isPaused: boolean;
  timeLeft: number;
  duration: number;
  taskId?: string;
}
