/**
 * TypeScript definitions for SiAntri Dukcapil Queue Management System
 */

export type ServiceCode = 'A' | 'B' | 'C' | 'D' | 'E' | 'P';

export interface QueueService {
  id: string;
  code: ServiceCode;
  name: string;
  description: string;
  requirements: string[];
  estimatedMinutes: number;
  dailyQuota: number;
  isPriority: boolean;
  active: boolean;
}

export interface QueueDesk {
  id: number;
  name: string;
  officerName: string;
  assignedServiceIds: string[];
  status: 'active' | 'paused' | 'closed';
  currentTicketId: string | null;
}

export type TicketStatus = 
  | 'waiting' 
  | 'calling' 
  | 'serving' 
  | 'held' 
  | 'skipped' 
  | 'completed' 
  | 'cancelled';

export interface QueueTicket {
  id: string; // e.g., "A-001"
  serviceId: string;
  serviceName: string;
  serviceCode: ServiceCode;
  number: number;
  nik: string;
  name: string;
  phone: string;
  address?: string;
  isPriority: boolean;
  priorityReason?: 'Lansia (>60 Thn)' | 'Penyandang Disabilitas' | 'Ibu Hamil / Menyusui' | 'Kebutuhan Khusus';
  status: TicketStatus;
  createdAt: string;
  calledAt?: string;
  servedAt?: string;
  completedAt?: string;
  deskId?: number;
  deskName?: string;
  officerName?: string;
  notes?: string;
  rating?: number; // 1-5
  ratingFeedback?: string;
  callCount: number;
}

export type UserRole = 'admin' | 'supervisor' | 'petugas';

export interface InternalUser {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  passwordHash: string; // Salted SHA256
  salt: string;
  deskId?: number;
  active: boolean;
  lastLogin?: string;
  mustChangePassword?: boolean;
}

export interface ScheduleConfig {
  openTime: string; // "08:00"
  closeTime: string; // "15:00"
  breakStartTime: string; // "12:00"
  breakEndTime: string; // "13:00"
  maxDailyOnlineQuota: number;
  announcementText: string;
  isPaused: boolean;
  agencyName: string;
  agencyAddress: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  username: string;
  role: string;
  action: string;
  details: string;
  ip: string;
}

export interface QueueStats {
  totalToday: number;
  waitingCount: number;
  servingCount: number;
  completedCount: number;
  skippedCount: number;
  cancelledCount: number;
  avgWaitMinutes: number;
  avgServiceMinutes: number;
  slaBreachCount: number; // Waiting > 15 mins
}

export interface SystemState {
  services: QueueService[];
  desks: QueueDesk[];
  tickets: QueueTicket[];
  users: InternalUser[];
  schedule: ScheduleConfig;
  auditLogs: AuditLog[];
  lastCallBroadcast?: {
    ticketId: string;
    ticketNumber: string;
    deskName: string;
    deskId: number;
    timestamp: number;
  };
}

export interface AuthSession {
  token: string;
  user: {
    id: string;
    username: string;
    name: string;
    role: UserRole;
    deskId?: number;
    mustChangePassword?: boolean;
  };
}
