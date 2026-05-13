// ─────────────────────────────────────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────────────────────────────────────

export type TaskType = 'TASK' | 'MEETING' | 'FOLLOW_UP';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type TaskStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';
export type RelatedToType = 'LEAD' | 'CUSTOMER' | 'BOOKING';

export type TaskFilter = 'all' | 'today' | 'upcoming' | 'overdue' | 'completed';

// ─────────────────────────────────────────────────────────────────────────────
// CORE MODELS
// ─────────────────────────────────────────────────────────────────────────────

export interface TaskUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  type: TaskType;
  relatedToType?: RelatedToType | null;
  relatedToId?: string | null;
  assignedToId?: string | null;
  assignedTo?: TaskUser | null;
  createdById?: string | null;
  createdBy?: TaskUser | null;
  dueDateTime: string;
  reminderBeforeMinutes: number;
  reminderTime: string;
  reminderSent: boolean;
  overdueNotified: boolean;
  priority: TaskPriority;
  status: TaskStatus;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// API PAYLOADS
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateTaskPayload {
  title: string;
  description?: string;
  type: TaskType;
  relatedToType?: RelatedToType;
  relatedToId?: string;
  assignedToId?: string;
  dueDateTime: string;
  reminderBeforeMinutes: number;
  priority: TaskPriority;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string | null;
  type?: TaskType;
  relatedToType?: RelatedToType | null;
  relatedToId?: string | null;
  assignedToId?: string | null;
  dueDateTime?: string;
  reminderBeforeMinutes?: number;
  priority?: TaskPriority;
  status?: TaskStatus;
}

export interface UpdateTaskStatusPayload {
  status: TaskStatus;
}

// ─────────────────────────────────────────────────────────────────────────────
// API RESPONSES
// ─────────────────────────────────────────────────────────────────────────────

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TaskListResponse {
  success: boolean;
  data: Task[];
  pagination: PaginationMeta;
}

export interface TaskResponse {
  success: boolean;
  data: Task;
  message?: string;
}

export interface TaskStatsResponse {
  success: boolean;
  data: TaskStats;
}

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD / STATS
// ─────────────────────────────────────────────────────────────────────────────

export interface TaskStats {
  counts: {
    today: number;
    upcoming: number;
    overdue: number;
    completed: number;
  };
  todayTasks: Task[];
  upcomingTasks: Task[];
  overdueTasks: Task[];
}

// ─────────────────────────────────────────────────────────────────────────────
// QUERY PARAMS
// ─────────────────────────────────────────────────────────────────────────────

export interface TaskQueryParams {
  page?: number;
  limit?: number;
  filter?: TaskFilter;
  search?: string;
  priority?: TaskPriority;
  type?: TaskType;
  assignedToId?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// REMINDER OPTIONS
// ─────────────────────────────────────────────────────────────────────────────

export const REMINDER_OPTIONS = [
  { label: '5 minutes before',  value: 5   },
  { label: '10 minutes before', value: 10  },
  { label: '15 minutes before', value: 15  },
  { label: '30 minutes before', value: 30  },
  { label: '1 hour before',     value: 60  },
  { label: '2 hours before',    value: 120 },
  { label: '1 day before',      value: 1440 },
] as const;

export type ReminderOption = typeof REMINDER_OPTIONS[number]['value'];