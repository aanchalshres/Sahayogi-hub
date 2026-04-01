import { Button } from '@/app/components/ui/button';
import { FileText, Inbox, Search, CheckCircle2, AlertCircle } from 'lucide-react';

interface EmptyStateProps {
  type: 'ngos' | 'tasks' | 'flagged' | 'search' | 'documents' | 'notifications';
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const emptyStateConfig = {
  ngos: {
    icon: Inbox,
    defaultTitle: 'No NGOs Found',
    defaultMessage: 'There are no NGOs matching your criteria at the moment.',
    iconColor: 'text-gray-400',
    bgColor: 'bg-gray-100',
  },
  tasks: {
    icon: FileText,
    defaultTitle: 'No Tasks Available',
    defaultMessage: 'There are no tasks to display at the moment.',
    iconColor: 'text-gray-400',
    bgColor: 'bg-gray-100',
  },
  flagged: {
    icon: AlertCircle,
    defaultTitle: 'No Flagged Items',
    defaultMessage: 'Great! There are no flagged tasks or issues to review.',
    iconColor: 'text-emerald-500',
    bgColor: 'bg-emerald-50',
  },
  search: {
    icon: Search,
    defaultTitle: 'No Results Found',
    defaultMessage: 'Try adjusting your search or filters to find what you are looking for.',
    iconColor: 'text-gray-400',
    bgColor: 'bg-gray-100',
  },
  documents: {
    icon: FileText,
    defaultTitle: 'No Documents',
    defaultMessage: 'No documents have been uploaded yet.',
    iconColor: 'text-gray-400',
    bgColor: 'bg-gray-100',
  },
  notifications: {
    icon: CheckCircle2,
    defaultTitle: 'All Caught Up!',
    defaultMessage: 'You have no new notifications at the moment.',
    iconColor: 'text-emerald-500',
    bgColor: 'bg-emerald-50',
  },
};

export function EmptyState({
  type,
  title,
  message,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const config = emptyStateConfig[type];
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className={`w-16 h-16 rounded-full ${config.bgColor} flex items-center justify-center mb-4`}>
        <Icon className={`w-8 h-8 ${config.iconColor}`} />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title || config.defaultTitle}
      </h3>
      <p className="text-sm text-gray-500 max-w-sm mb-6">
        {message || config.defaultMessage}
      </p>
      {actionLabel && onAction && (
        <Button
          variant="outline"
          onClick={onAction}
          className="text-sahayogi-blue border-sahayogi-blue hover:bg-sahayogi-blue-light"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
