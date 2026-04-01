import type { Activity } from '@/types';
import {
  Building2,
  CheckCircle2,
  UserPlus,
  FileCheck,
  Trash2,
  ClipboardList,
} from 'lucide-react';

interface ActivityTimelineProps {
  activities: Activity[];
}

const activityConfig = {
  ngo_registered: {
    icon: Building2,
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  ngo_verified: {
    icon: FileCheck,
    bgColor: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  task_created: {
    icon: ClipboardList,
    bgColor: 'bg-purple-50',
    iconColor: 'text-purple-600',
  },
  task_approved: {
    icon: CheckCircle2,
    bgColor: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  volunteer_applied: {
    icon: UserPlus,
    bgColor: 'bg-amber-50',
    iconColor: 'text-amber-600',
  },
  task_deleted: {
    icon: Trash2,
    bgColor: 'bg-red-50',
    iconColor: 'text-red-600',
  },
};

function formatTimeAgo(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-card">
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <p className="text-sm text-gray-500 mt-1">Latest actions on the platform</p>
      </div>

      <div className="p-6">
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-5 top-0 bottom-0 w-px bg-gray-200" />

          {/* Activities */}
          <div className="space-y-6">
            {activities.map((activity, index) => {
              const config = activityConfig[activity.type as keyof typeof activityConfig];
              const Icon = config?.icon || Building2;

              return (
                <div
                  key={activity.id}
                  className="relative flex items-start gap-4 group animate-slide-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Icon */}
                  <div
                    className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                      config?.bgColor || 'bg-blue-50'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${config?.iconColor || 'text-blue-600'}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-1.5">
                    <p className="text-sm font-medium text-gray-900 group-hover:text-sahayogi-blue transition-colors">
                      {activity.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTimeAgo(activity.timestamp)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
