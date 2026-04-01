export type TaskStatus = 'pending' | 'approved' | 'rejected';
export type NGOStatus = 'pending' | 'approved' | 'rejected';

export interface Task {
  id: string;
  title: string;
  ngoName: string;
  category: string;
  status: TaskStatus;
  createdAt: string;
  flagged: boolean;
}

export interface NGO {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: NGOStatus;
  registrationDocs: { name: string; url: string }[];
  createdAt: string;
}

export interface Activity {
  id: string;
  type: 'ngo-approved' | 'ngo-rejected' | 'task-deleted';
  message: string;
  createdAt: string;
}
