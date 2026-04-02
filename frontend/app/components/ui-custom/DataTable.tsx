import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { EmptyState } from './EmptyState';
import { TableSkeleton } from './Skeleton';
import {
  CheckCircle2,
  XCircle,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  FileText,
  ArrowRight,
} from 'lucide-react';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  onView?: (item: T) => void;
  onApprove?: (item: T) => void;
  onReject?: (item: T) => void;
  onDelete?: (item: T) => void;
  onViewDocuments?: (item: T) => void;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  emptyType?: 'ngos' | 'tasks' | 'flagged' | 'search';
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  itemsPerPage?: number;
  showActions?: boolean;
  actionType?: 'ngo' | 'task';
  isLoading?: boolean;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  onView,
  onApprove,
  onReject,
  onDelete,
  onViewDocuments,
  onRowClick,
  emptyMessage,
  emptyType = 'ngos',
  emptyActionLabel,
  onEmptyAction,
  itemsPerPage = 5,
  showActions = true,
  actionType = 'ngo',
  isLoading = false,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = data.slice(startIndex, startIndex + itemsPerPage);

  if (isLoading) {
    return <TableSkeleton rows={itemsPerPage} columns={columns.length + (showActions ? 1 : 0)} />;
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-[#CACDD3] shadow-card">
        <EmptyState
          type={emptyType}
          message={emptyMessage}
          actionLabel={emptyActionLabel}
          onAction={onEmptyAction}
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#CACDD3] shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#F0F1F3] border-b border-[#CACDD3]">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-4 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider ${
                    column.width || ''
                  }`}
                >
                  {column.header}
                </th>
              ))}
              {showActions && (
                <th className="px-6 py-4 text-right text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#CACDD3]">
            {paginatedData.map((item, index) => (
              <tr
                key={keyExtractor(item)}
                onClick={() => onRowClick?.(item)}
                className={`group hover:bg-[#E8EAFB]/50 transition-all duration-200 animate-slide-in-right ${
                  onRowClick ? 'cursor-pointer hover:shadow-md' : ''
                }`}
                style={{ animationDelay: `${index * 80}ms` }}
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                    {column.render ? (
                      column.render(item)
                    ) : (
                      <span className="text-sm text-[#111827]">
                        {(item as Record<string, string>)[column.key] || '-'}
                      </span>
                    )}
                  </td>
                ))}
                {showActions && (
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {actionType === 'ngo' && onViewDocuments && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewDocuments(item)}
                          className="text-[#4F46C8] hover:text-[#3730A3] hover:bg-[#9FA8DA]"
                        >
                          <FileText className="w-4 h-4 mr-1" />
                          Docs
                        </Button>
                      )}
                      {onView && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onView(item)}
                          className="text-[#6B7280] hover:text-[#4F46C8] hover:bg-[#9FA8DA]"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
                      {actionType === 'ngo' && onApprove && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onApprove(item)}
                          className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </Button>
                      )}
                      {actionType === 'ngo' && onReject && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onReject(item)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      )}
                      {actionType === 'task' && onDelete && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(item)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                )}
                {!showActions && onRowClick && (
                  <td className="px-4 py-4 text-right">
                    <ArrowRight className="w-5 h-5 text-[#CACDD3] group-hover:text-[#4F46C8] group-hover:translate-x-0.5 transition-all duration-200 opacity-0 group-hover:opacity-100" />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-[#CACDD3] flex items-center justify-between">
          <p className="text-sm text-[#6B7280]">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, data.length)} of{' '}
            {data.length} entries
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-[#6B7280]">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
