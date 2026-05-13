// ─── Enums ────────────────────────────────────────────────────────────────────

export type SystemRole = 'ADMIN' | 'MANAGER' | 'AGENT' | 'VENDOR';
export type UserStatus = 'ACTIVE' | 'INACTIVE';

export type PermissionModule =
  | 'dashboard'
  | 'leads'
  | 'customers'
  | 'itinerary'
  | 'bookings'
  | 'payments'
  | 'tasks'
  | 'users'
  | 'reports'
  | 'attendance'
  | 'chat'
  | 'vendors';

export type PermissionAction = 'view' | 'create' | 'edit' | 'delete';

// ─── Core Models ──────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: SystemRole;
  status: UserStatus;
  profileImage?: string | null;
  department?: string | null;
  lastLogin?: string | null;
  customRoleId?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    assignedLeads: number;
    assignedCustomers: number;
    assignedTasks: number;
  };
}

export interface RolePermission {
  id: string;
  roleId: string;
  module: PermissionModule;
  action: PermissionAction;
  allowed: boolean;
}

export interface CustomRole {
  id: string;
  name: string;
  description?: string | null;
  permissions: RolePermission[];
  createdAt: string;
  updatedAt: string;
  _count?: { users: number };
}

export interface ActivityLog {
  id: string;
  userId?: string | null;
  user?: Pick<User, 'id' | 'name' | 'email' | 'role' | 'profileImage'> | null;
  action: string;
  entity: string;
  entityId?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  byRole: Partial<Record<SystemRole, number>>;
  activeInLast7Days: number;
}

// ─── API Payloads ─────────────────────────────────────────────────────────────

export interface CreateUserPayload {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: SystemRole;
  department?: string;
  profileImage?: string;
  status?: UserStatus;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  phone?: string | null;
  role?: SystemRole;
  department?: string | null;
  status?: UserStatus;
  profileImage?: string | null;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface CreateRolePayload {
  name: string;
  description?: string;
  permissions?: Array<{
    module: PermissionModule;
    action: PermissionAction;
    allowed: boolean;
  }>;
}

export interface UpdatePermissionsPayload {
  permissions: Array<{
    module: PermissionModule;
    action: PermissionAction;
    allowed: boolean;
  }>;
}

// ─── Query Params ─────────────────────────────────────────────────────────────

export interface UserQueryParams {
  page?: number;
  limit?: number;
  role?: SystemRole;
  status?: UserStatus;
  search?: string;
  department?: string;
  sortBy?: 'name' | 'email' | 'createdAt' | 'lastLogin';
  sortOrder?: 'asc' | 'desc';
}

// ─── API Response Wrappers ────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
}

// ─── Permission Matrix Helper ─────────────────────────────────────────────────

export type PermissionMatrix = Record<PermissionModule, Record<PermissionAction, boolean>>;

export const ALL_MODULES: PermissionModule[] = [
  'dashboard', 'leads', 'customers', 'itinerary', 'bookings',
  'payments', 'tasks', 'users', 'reports', 'attendance', 'chat', 'vendors',
];

export const ALL_ACTIONS: PermissionAction[] = ['view', 'create', 'edit', 'delete'];

export const MODULE_LABELS: Record<PermissionModule, string> = {
  dashboard: 'Dashboard',
  leads: 'Leads',
  customers: 'Customers',
  itinerary: 'Itinerary',
  bookings: 'Bookings',
  payments: 'Payments',
  tasks: 'Tasks',
  users: 'Users',
  reports: 'Reports',
  attendance: 'Attendance',
  chat: 'Chat',
  vendors: 'Vendors',
};

export const ROLE_COLORS: Record<SystemRole, string> = {
  ADMIN: 'bg-red-100 text-red-700 border-red-200',
  MANAGER: 'bg-blue-100 text-blue-700 border-blue-200',
  AGENT: 'bg-green-100 text-green-700 border-green-200',
  VENDOR: 'bg-orange-100 text-orange-700 border-orange-200',
};

export const STATUS_COLORS: Record<UserStatus, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  INACTIVE: 'bg-gray-100 text-gray-500 border-gray-200',
};