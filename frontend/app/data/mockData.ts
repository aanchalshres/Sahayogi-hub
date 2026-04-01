import { Task, NGO, Activity, DashboardStats, AdminUser } from '@/app/types';

export const mockTasks: Task[] = [
  {
    id: 'task1',
    title: 'Distribute Relief Materials',
    ngoId: 'ngo1',
    ngoName: 'Helping Hands',
    category: 'Disaster Relief',
    district: 'Kathmandu',
    description: 'Distribute food and supplies to flood victims.',
    quota: 100,
    filledQuota: 60,
    status: 'pending',
    createdAt: '2024-06-01T10:00:00Z',
    startDate: '2024-06-05',
    endDate: '2024-06-10',
  },
  {
    id: 'task2',
    title: 'Blood Donation Camp',
    ngoId: 'ngo2',
    ngoName: 'Red Cross',
    category: 'Health',
    district: 'Lalitpur',
    description: 'Organize a blood donation camp.',
    quota: 50,
    filledQuota: 40,
    status: 'active',
    createdAt: '2024-06-02T09:00:00Z',
    startDate: '2024-06-10',
    endDate: '2024-06-12',
  },
  {
    id: 'task3',
    title: 'Tree Plantation Drive',
    ngoId: 'ngo3',
    ngoName: 'Green Nepal',
    category: 'Environment',
    district: 'Bhaktapur',
    description: 'Plant 500 trees in Bhaktapur.',
    quota: 30,
    filledQuota: 10,
    status: 'completed',
    createdAt: '2024-06-03T08:00:00Z',
    startDate: '2024-06-15',
    endDate: '2024-06-20',
  },
];

export const mockNGOs: NGO[] = [
  {
    id: 'ngo1',
    organizationName: 'Helping Hands',
    registrationNumber: 'REG12345',
    officeLocation: 'Kathmandu',
    status: 'pending',
    ownerName: 'Sita Sharma',
    email: 'contact@helpinghands.org',
    phone: '9800000001',
    createdAt: '2024-05-20T10:00:00Z',
    documents: {
      registrationCertificate: 'reg-cert.pdf',
      panCard: 'pan-card.pdf',
      organizationProfile: 'profile.pdf',
    },
  },
  {
    id: 'ngo2',
    organizationName: 'Red Cross',
    registrationNumber: 'REG54321',
    officeLocation: 'Lalitpur',
    status: 'verified',
    ownerName: 'Ram Bahadur',
    email: 'info@redcross.org',
    phone: '9800000002',
    createdAt: '2024-05-22T11:00:00Z',
    documents: {
      registrationCertificate: 'reg-cert2.pdf',
      panCard: 'pan-card2.pdf',
      organizationProfile: 'profile2.pdf',
    },
  },
  {
    id: 'ngo3',
    organizationName: 'Green Nepal',
    registrationNumber: 'REG67890',
    officeLocation: 'Bhaktapur',
    status: 'rejected',
    ownerName: 'Mina Karki',
    email: 'hello@greennepal.org',
    phone: '9800000003',
    createdAt: '2024-05-25T09:00:00Z',
    documents: {
      registrationCertificate: 'reg-cert3.pdf',
      panCard: 'pan-card3.pdf',
      organizationProfile: 'profile3.pdf',
    },
  },
];

export const mockActivities: Activity[] = [
  {
    id: 'a1',
    type: 'ngo-registered',
    message: 'Helping Hands registered as a new NGO.',
    timestamp: '2024-05-20T10:00:00Z',
    metadata: { ngoId: 'ngo1', ngoName: 'Helping Hands' },
  },
  {
    id: 'a2',
    type: 'task-created',
    message: 'Task "Blood Donation Camp" was created.',
    timestamp: '2024-06-02T09:00:00Z',
    metadata: { ngoId: 'ngo2', taskId: 'task2', taskTitle: 'Blood Donation Camp' },
  },
  {
    id: 'a3',
    type: 'ngo-verified',
    message: 'Red Cross was verified.',
    timestamp: '2024-05-22T11:00:00Z',
    metadata: { ngoId: 'ngo2', ngoName: 'Red Cross' },
  },
];

export const mockStats: DashboardStats = {
  totalUsers: 1000,
  totalVolunteers: 800,
  totalNGOs: 3,
  pendingVerifications: 1,
  activeTasks: 1,
  completedTasks: 1,
  flaggedTasks: 0,
};

export const mockAdmin: AdminUser = {
  id: 'admin1',
  name: 'Admin User',
  email: 'admin@sahayogi.com',
  role: 'super_admin',
  createdAt: '2024-01-01T00:00:00Z',
};

export const categories = [
  'Disaster Relief',
  'Health',
  'Environment',
  'Education',
  'Women Empowerment',
];

export const districts = [
  'Kathmandu',
  'Lalitpur',
  'Bhaktapur',
  'Pokhara',
  'Chitwan',
];
