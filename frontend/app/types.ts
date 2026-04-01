export type TaskStatus = 'pending' | 'active' | 'completed' | 'removed';
export type NGOStatus = 'pending' | 'verified' | 'rejected';

export interface Task {
  id: string;
  title: string;
  ngoId: string;
  ngoName: string;
  category: string;
  district: string;
  description: string;
  quota: number;
  filledQuota: number;
  status: TaskStatus;
  createdAt: string;
  startDate: string;
  endDate: string;
}

export interface NGO {
  id: string;
  organizationName: string;
  registrationNumber: string;
  officeLocation: string;
  status: NGOStatus;
  ownerName: string;
  email: string;
  phone: string;
  createdAt?: string;
  documents?: {
    registrationCertificate: string;
    panCard: string;
    organizationProfile: string;
  };
}

export interface Activity {
  id: string;
  type: 'ngo-approved' | 'ngo-rejected' | 'task-deleted' | 'task-created' | 'ngo-registered' | 'ngo-verified';
  message: string;
  timestamp: string;
  createdAt?: string;
  metadata?: Record<string, any>;
}

export interface DashboardStats {
  totalUsers: number;
  totalVolunteers: number;
  totalNGOs: number;
  pendingVerifications: number;
  activeTasks: number;
  completedTasks: number;
  flaggedTasks: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'super_admin';
  createdAt: string;
}
