"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { NGO, Task } from '@/app/types';
import { Button } from '@/app/components/ui/button';
import { StatsCard } from '@/app/components/ui-custom/StatsCard';
import { ActivityTimeline } from '@/app/components/ui-custom/ActivityTimeline';
import { DataTable } from '@/app/components/ui-custom/DataTable';
import { StatusBadge } from '@/app/components/ui-custom/StatusBadge';
import { ConfirmationModal } from '@/app/components/ui-custom/ConfirmationModal';
import { DocumentPreviewModal } from '@/app/components/ui-custom/DocumentPreviewModal';
import { EmptyState } from '@/app/components/ui-custom/EmptyState';
import { StatsCardSkeleton, ActivitySkeleton } from '@/app/components/ui-custom/Skeleton';
import { mockStats, mockTasks, mockActivities, mockNGOs } from '@/app/data/mockData';
import { apiGet } from '@/app/lib/api';
import {
  Users,
  Heart,
  Building2,
  Clock,
  ClipboardList,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  FileCheck,
  Trash2,
} from 'lucide-react';


interface DashboardProps {
}

function Dashboard({ }: DashboardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNGO, setSelectedNGO] = useState<NGO | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [ngos, setNgos] = useState<NGO[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<typeof mockActivities>([]);
  const [stats, setStats] = useState<typeof mockStats | null>(null);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch pending NGOs
        const ngoData = await apiGet<any>('/api/ngo-profiles?status=pending');
        
        const mappedNGOs = ((ngoData.data || ngoData) || [])
          .slice(0, 3)
          .map((ngo: any) => ({
            id: ngo.id?.toString(),
            organizationName: ngo.organization_name,
            registrationNumber: ngo.registration_number,
            officeLocation: ngo.office_location,
            status: ngo.status || 'pending',
            ownerName: ngo.user?.name || 'N/A',
            email: ngo.user?.email || '',
            phone: ngo.user?.phone || '',
            createdAt: ngo.created_at || ngo.createdAt,
            documents: {
              registrationCertificate: '',
              panCard: '',
              organizationProfile: '',
            },
          }));
        
        setNgos(mappedNGOs);
        setTasks(mockTasks.slice(0, 5));
        setActivities(mockActivities.slice(0, 5));
        setStats(mockStats);
      } catch (error) {
        console.error('Failed to fetch dashboard data from API:', error);
        console.log('⚠️  Falling back to mock data for pending NGOs. To use real data: implement GET /api/ngo-profiles?status=pending');
        // Fallback to mock data
        const pendingNGOs = mockNGOs.filter((n) => n.status === 'pending').slice(0, 3);
        setNgos(pendingNGOs);
        setTasks(mockTasks.slice(0, 5));
        setActivities(mockActivities.slice(0, 5));
        setStats(mockStats);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRefresh = async () => {
    try {
      setIsLoading(true);
      const ngoData = await apiGet<any>('/api/ngo-profiles?status=pending');
      
      const mappedNGOs = ((ngoData.data || ngoData) || [])
        .slice(0, 3)
        .map((ngo: any) => ({
          id: ngo.id?.toString(),
          organizationName: ngo.organization_name,
          registrationNumber: ngo.registration_number,
          officeLocation: ngo.office_location,
          status: ngo.status || 'pending',
          ownerName: ngo.user?.name || 'N/A',
          email: ngo.user?.email || '',
          phone: ngo.user?.phone || '',
          createdAt: ngo.created_at || ngo.createdAt,
          documents: {
            registrationCertificate: '',
            panCard: '',
            organizationProfile: '',
          },
        }));
      
      setNgos(mappedNGOs);
      setTasks(mockTasks.slice(0, 5));
      setActivities(mockActivities.slice(0, 5));
      setStats(mockStats);
    } catch (error) {
      console.error('Failed to refresh data from API:', error);
      // Fallback to mock data
      const pendingNGOs = mockNGOs.filter((n) => n.status === 'pending').slice(0, 3);
      setNgos(pendingNGOs);
      setTasks(mockTasks.slice(0, 5));
      setActivities(mockActivities.slice(0, 5));
      setStats(mockStats);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveNGO = (ngo: NGO) => {
    setNgos((prev) => prev.filter((n) => n.id !== ngo.id));
  };

  const handleRejectNGO = (ngo: NGO) => {
    setNgos((prev) => prev.filter((n) => n.id !== ngo.id));
  };

  const handleViewDocuments = (ngo: NGO) => {
    setSelectedNGO(ngo);
    setIsDocModalOpen(true);
  };

  const handleDeleteTask = (task: Task) => {
    setSelectedTask(task);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteTask = () => {
    if (selectedTask) {
      setTasks((prev) => prev.filter((t) => t.id !== selectedTask.id));
      setIsDeleteModalOpen(false);
      setSelectedTask(null);
    }
  };

  const ngoColumns = [
    {
      key: 'organizationName',
      header: 'Organization',
      render: (ngo: NGO) => (
        <div>
          <p className="text-sm font-medium text-gray-900">{ngo.organizationName}</p>
          <p className="text-xs text-gray-500">{ngo.ownerName}</p>
        </div>
      ),
    },
    {
      key: 'registrationNumber',
      header: 'Reg. Number',
      render: (ngo: NGO) => (
        <span className="text-sm text-gray-600 font-mono">{ngo.registrationNumber}</span>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      render: (ngo: NGO) => (
        <span className="text-sm text-gray-600">{ngo.officeLocation}</span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Submitted',
      render: (ngo: NGO) => (
        <span className="text-sm text-gray-500">
          {ngo.createdAt ? new Date(ngo.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }) : '—'}
        </span>
      ),
    },
  ];

  const taskColumns = [
    {
      key: 'title',
      header: 'Task',
      render: (task: Task) => (
        <div>
          <p className="text-sm font-medium text-gray-900">{task.title}</p>
          <p className="text-xs text-gray-500">{task.ngoName}</p>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (task: Task) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: "hsl(234, 100%, 97%)", color: "hsl(234, 100%, 62%)" }}>
          {task.category}
        </span>
      ),
    },
    {
      key: 'district',
      header: 'District',
      render: (task: Task) => (
        <span className="text-sm text-gray-600">{task.district}</span>
      ),
    },
    {
      key: 'quota',
      header: 'Quota',
      render: (task: Task) => (
        <span className="text-sm text-gray-600">
          {task.filledQuota}/{task.quota}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (task: Task) => <StatusBadge status={task.status} />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening on Sahayogi.</p>
        
        {/* Quick Actions */}
        <div className="flex items-center gap-3 mt-6">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={() => router.push('/dashboard/admin/ngo-verification')}
            className="gap-2 text-white"
            style={{ backgroundColor: "hsl(234, 100%, 62%)" }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "hsl(234, 71%, 42%)"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "hsl(234, 100%, 62%)"}
          >
            <FileCheck className="w-4 h-4" />
            Verify NGOs
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      {isLoading || !stats ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <StatsCardSkeleton key={i} />
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <StatsCardSkeleton key={i} />
            ))}
          </div>
        </>
      ) : (
        <>
          {/* First Row - 4 Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Users"
              value={stats.totalUsers}
              icon={Users}
              iconBgStyle={{ backgroundColor: "hsl(234, 100%, 97%)" }}
              iconStyle={{ color: "hsl(234, 100%, 62%)" }}
            />
            <StatsCard
              title="Total Volunteers"
              value={stats.totalVolunteers}
              icon={Heart}
              iconBgColor="bg-red-100"
              iconColor="text-red-600"
            />
            <StatsCard
              title="Total NGOs"
              value={stats.totalNGOs}
              icon={Building2}
              iconBgColor="bg-purple-100"
              iconColor="text-purple-600"
            />
            <StatsCard
              title="Pending Verifications"
              value={stats.pendingVerifications}
              icon={Clock}
              iconBgColor="bg-amber-100"
              iconColor="text-amber-600"
            />
          </div>

          {/* Second Row - 3 Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatsCard
              title="Active Tasks"
              value={stats.activeTasks}
              icon={ClipboardList}
              iconBgColor="bg-emerald-100"
              iconColor="text-emerald-600"
            />
            <StatsCard
              title="Completed Tasks"
              value={stats.completedTasks}
              icon={CheckCircle2}
              iconBgColor="bg-green-100"
              iconColor="text-green-600"
            />
            <StatsCard
              title="Flagged Tasks"
              value={stats.flaggedTasks}
              icon={Trash2}
              iconBgColor="bg-red-100"
              iconColor="text-red-600"
            />
          </div>
        </>
      )}

      {/* Content Grid - Recent Activity & Pending NGOs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-1">
          {isLoading ? (
            <ActivitySkeleton count={5} />
          ) : (
            <ActivityTimeline activities={activities} />
          )}
        </div>

        {/* Pending NGO Approvals */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Pending NGO Approvals</h3>
                <p className="text-sm text-gray-600 mt-1">NGOs awaiting verification</p>
              </div>
              <Button
                variant="ghost"
                onClick={() => router.push('/dashboard/admin/ngo-verification')}
                className="gap-1"
                style={{ color: "hsl(234, 100%, 62%)" }}
                onMouseEnter={(e) => e.currentTarget.style.color = "hsl(234, 71%, 42%)"}
                onMouseLeave={(e) => e.currentTarget.style.color = "hsl(234, 100%, 62%)"}
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-6">
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
                  ))}
                </div>
              ) : ngos.length === 0 ? (
                <EmptyState
                  type="ngos"
                  title="No Pending NGOs"
                  message="All NGOs have been verified. Great job!"
                  actionLabel="View All NGOs"
                  onAction={() => router.push('/dashboard/admin/ngo-verification')}
                />
              ) : (
                <DataTable
                  columns={ngoColumns}
                  data={ngos}
                  keyExtractor={(ngo) => (ngo as NGO).id}
                  onApprove={handleApproveNGO}
                  onReject={handleRejectNGO}
                  onViewDocuments={handleViewDocuments}
                  emptyMessage="No pending NGOs"
                  showActions={true}
                  actionType="ngo"
                  itemsPerPage={3}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Document Preview Modal */}
      {selectedNGO && selectedNGO.documents && (
        <DocumentPreviewModal
          isOpen={isDocModalOpen}
          onClose={() => {
            setIsDocModalOpen(false);
            setSelectedNGO(null);
          }}
          documents={[
            { name: 'Registration Certificate', url: selectedNGO.documents.registrationCertificate, type: 'pdf' },
            { name: 'Organization Profile', url: selectedNGO.documents.organizationProfile, type: 'pdf' },
          ]}
          organizationName={selectedNGO.organizationName}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedTask(null);
        }}
        onConfirm={confirmDeleteTask}
        title="Delete Task"
        message={`Are you sure you want to delete "${selectedTask?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
}

export default Dashboard;
