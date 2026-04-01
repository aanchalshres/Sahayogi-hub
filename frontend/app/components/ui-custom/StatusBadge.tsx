import { cn } from '@/app/lib/utils';

interface StatusBadgeProps {
  status: 'pending' | 'verified' | 'rejected' | 'active' | 'completed' | 'removed';
  className?: string;
}

const statusConfig = {
  pending: {
    label: 'Pending',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200',
    glowClass: 'status-glow-pending',
  },
  verified: {
    label: 'Verified',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-200',
    glowClass: 'status-glow-active',
  },
  rejected: {
    label: 'Rejected',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
    glowClass: 'status-glow-rejected',
  },
  active: {
    label: 'Active',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-200',
    glowClass: 'status-glow-active',
  },
  completed: {
    label: 'Completed',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    glowClass: '',
  },
  removed: {
    label: 'Removed',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-600',
    borderColor: 'border-gray-200',
    glowClass: '',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        config.bgColor,
        config.textColor,
        config.borderColor,
        status === 'pending' && 'animate-pulse-glow',
        className
      )}
    >
      <span
        className={cn(
          'w-1.5 h-1.5 rounded-full mr-1.5',
          status === 'pending' && 'bg-amber-500',
          status === 'verified' && 'bg-emerald-500',
          status === 'rejected' && 'bg-red-500',
          status === 'active' && 'bg-emerald-500',
          status === 'completed' && 'bg-blue-500',
          status === 'removed' && 'bg-gray-400'
        )}
      />
      {config.label}
    </span>
  );
}
