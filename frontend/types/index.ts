// NGO Types
export interface NGO {
  id: string;
  organizationName: string;
  registrationNumber: string;
  panNumber: string;
  location: string;
  district: string;
  documents: {
    registrationCertificate: string;
    panCard: string;
    organizationProfile: string;
  };
  status: 'pending' | 'verified' | 'rejected';
  submittedAt: string;
  ownerName: string;
  email: string;
  phone: string;
}

// Task Types
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
  status: 'active' | 'pending' | 'completed' | 'removed';
  createdAt: string;
  startDate: string;
  endDate: string;
}

// Activity Types
export interface Activity {
  id: string;
  type: 'ngo_registered' | 'ngo_verified' | 'task_created' | 'task_approved' | 'volunteer_applied' | 'task_deleted';
  message: string;
  timestamp: string;
  metadata?: {
    ngoId?: string;
    ngoName?: string;
    taskId?: string;
    taskTitle?: string;
    volunteerName?: string;
  };
}

// Stats Types
export interface DashboardStats {
  totalUsers: number;
  totalVolunteers: number;
  totalNGOs: number;
  pendingVerifications: number;
  activeTasks: number;
  completedTasks: number;
  flaggedTasks: number;
}

// Admin User Types
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'super_admin';
  avatar?: string;
}

// Filter Types
export interface NGOFilters {
  search: string;
  status: 'all' | 'pending' | 'verified' | 'rejected';
  location: string;
  dateRange: string;
}

export interface TaskFilters {
  search: string;
  category: string;
  district: string;
  status: 'all' | 'active' | 'pending' | 'completed' | 'removed';
  dateRange: string;
}
