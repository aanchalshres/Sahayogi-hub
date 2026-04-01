"use client";

import { useState, useMemo, useEffect } from 'react';
import type { NGO } from '@/types';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { DataTable } from '@/app/components/ui-custom/DataTable';
import { StatusBadge } from '@/app/components/ui-custom/StatusBadge';
import { ConfirmationModal } from '@/app/components/ui-custom/ConfirmationModal';
import { DocumentPreviewModal } from '@/app/components/ui-custom/DocumentPreviewModal';
import { EmptyState } from '@/app/components/ui-custom/EmptyState';
import { TableSkeleton, StatsCardSkeleton } from '@/app/components/ui-custom/Skeleton';
import { mockNGOs } from '@/app/data/mockData';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import {
  Search,
  Filter,
  FileText,
  Building2,
  MapPin,
  Calendar,
  RefreshCw,
} from 'lucide-react';

export function NGOVerification() {
  const [isLoading, setIsLoading] = useState(true);
  const [ngos, setNgos] = useState<NGO[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [districtFilter, setDistrictFilter] = useState<string>('all');
  const [selectedNGO, setSelectedNGO] = useState<NGO | null>(null);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setNgos(mockNGOs);
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const filteredNGOs = useMemo(() => {
    return ngos.filter((ngo) => {
      const matchesSearch =
        ngo.organizationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ngo.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ngo.ownerName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || ngo.status === statusFilter;
      const matchesDistrict = districtFilter === 'all' || ngo.district === districtFilter;
      return matchesSearch && matchesStatus && matchesDistrict;
    });
  }, [ngos, searchQuery, statusFilter, districtFilter]);

  const districts = useMemo(() => {
    const uniqueDistricts = [...new Set(ngos.map((ngo) => ngo.district))];
    return ['all', ...uniqueDistricts];
  }, [ngos]);

  const stats = useMemo(() => {
    return {
      total: ngos.length,
      pending: ngos.filter((n) => n.status === 'pending').length,
      verified: ngos.filter((n) => n.status === 'verified').length,
      rejected: ngos.filter((n) => n.status === 'rejected').length,
    };
  }, [ngos]);

  const handleViewDocuments = (ngo: NGO) => {
    setSelectedNGO(ngo);
    setIsDocModalOpen(true);
  };

  const handleApprove = (ngo: NGO) => {
    setSelectedNGO(ngo);
    setIsApproveModalOpen(true);
  };

  const handleReject = (ngo: NGO) => {
    setSelectedNGO(ngo);
    setIsRejectModalOpen(true);
  };

  const confirmApprove = () => {
    if (selectedNGO) {
      setIsProcessing(true);
      setTimeout(() => {
        setNgos((prev) =>
          prev.map((ngo) =>
            ngo.id === selectedNGO.id ? { ...ngo, status: 'verified' } : ngo
          )
        );
        setIsProcessing(false);
        setIsApproveModalOpen(false);
        setSelectedNGO(null);
      }, 800);
    }
  };

  const confirmReject = () => {
    if (selectedNGO) {
      setIsProcessing(true);
      setTimeout(() => {
        setNgos((prev) =>
          prev.map((ngo) =>
            ngo.id === selectedNGO.id ? { ...ngo, status: 'rejected' } : ngo
          )
        );
        setIsProcessing(false);
        setIsRejectModalOpen(false);
        setSelectedNGO(null);
      }, 800);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setDistrictFilter('all');
  };

  const columns = [
    {
      key: 'organizationName',
      header: 'Organization',
      render: (ngo: NGO) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-linear-to-br from-sahayogi-blue to-sahayogi-blue-dark flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5 text-sahayogi-blue" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{ngo.organizationName}</p>
            <p className="text-xs text-gray-500">{ngo.ownerName}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'registrationNumber',
      header: 'Reg. Number',
      render: (ngo: NGO) => (
        <div className="space-y-1">
          <p className="text-sm font-mono text-gray-600">{ngo.registrationNumber}</p>
          <p className="text-xs text-gray-400">PAN: {ngo.panNumber}</p>
        </div>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      render: (ngo: NGO) => (
        <div className="flex items-center gap-1.5 text-sm text-gray-600">
          <MapPin className="w-4 h-4 text-gray-400" />
          {ngo.district}
        </div>
      ),
    },
    {
      key: 'documents',
      header: 'Documents',
      render: (ngo: NGO) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleViewDocuments(ngo)}
          style={{ color: "hsl(234, 100%, 62%)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "hsl(234, 71%, 42%)";
            e.currentTarget.style.backgroundColor = "hsl(234, 100%, 97%)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "hsl(234, 100%, 62%)";
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <FileText className="w-4 h-4 mr-1.5" />
          View Docs
        </Button>
      ),
    },
    {
      key: 'submittedAt',
      header: 'Submitted',
      render: (ngo: NGO) => (
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <Calendar className="w-4 h-4 text-gray-400" />
          {new Date(ngo.submittedAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (ngo: NGO) => <StatusBadge status={ngo.status} />,
    },
  ];

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">NGO Verification</h1>
          <p className="text-sm text-gray-500 mt-1">
            Review and verify NGO registrations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={clearFilters} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Reset Filters
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Total NGOs</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Pending</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Verified</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.verified}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Rejected</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{stats.rejected}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by organization, registration number, or owner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <Filter className="w-4 h-4 mr-2 text-gray-400" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={districtFilter} onValueChange={setDistrictFilter}>
              <SelectTrigger className="w-40">
                <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                <SelectValue placeholder="District" />
              </SelectTrigger>
              <SelectContent>
                {districts.map((district) => (
                  <SelectItem key={district} value={district}>
                    {district === 'all' ? 'All Districts' : district}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      {!isLoading && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing <span className="font-medium text-gray-900">{filteredNGOs.length}</span> results
          </p>
          {(searchQuery || statusFilter !== 'all' || districtFilter !== 'all') && (
            <Button variant="ghost" size="sm" onClick={clearFilters} style={{ color: "hsl(234, 100%, 62%)" }}>
              Clear all filters
            </Button>
          )}
        </div>
      )}

      {/* Data Table */}
      {isLoading ? (
        <TableSkeleton rows={5} columns={7} />
      ) : filteredNGOs.length === 0 ? (
        <EmptyState
          type="search"
          title="No NGOs Found"
          message="No NGOs match your search criteria. Try adjusting your filters."
          actionLabel="Clear Filters"
          onAction={clearFilters}
        />
      ) : (
        <DataTable
          columns={columns}
          data={filteredNGOs}
          keyExtractor={(ngo) => (ngo as NGO).id}
          onApprove={handleApprove}
          onReject={handleReject}
          onViewDocuments={handleViewDocuments}
          emptyMessage="No NGOs found matching your criteria"
          showActions={true}
          actionType="ngo"
          itemsPerPage={10}
        />
      )}

      {/* Document Preview Modal */}
      {selectedNGO && (
        <DocumentPreviewModal
          isOpen={isDocModalOpen}
          onClose={() => {
            setIsDocModalOpen(false);
            setSelectedNGO(null);
          }}
          documents={[
            { name: 'Registration Certificate', url: selectedNGO.documents.registrationCertificate, type: 'pdf' },
            { name: 'PAN Card', url: selectedNGO.documents.panCard, type: 'pdf' },
            { name: 'Organization Profile', url: selectedNGO.documents.organizationProfile, type: 'pdf' },
          ]}
          organizationName={selectedNGO.organizationName}
        />
      )}

      {/* Approve Confirmation Modal */}
      <ConfirmationModal
        isOpen={isApproveModalOpen}
        onClose={() => {
          setIsApproveModalOpen(false);
          setSelectedNGO(null);
        }}
        onConfirm={confirmApprove}
        title="Approve NGO"
        message={`Are you sure you want to approve "${selectedNGO?.organizationName}"? This will allow them to post tasks on the platform.`}
        confirmText="Approve"
        type="success"
        isLoading={isProcessing}
      />

      {/* Reject Confirmation Modal */}
      <ConfirmationModal
        isOpen={isRejectModalOpen}
        onClose={() => {
          setIsRejectModalOpen(false);
          setSelectedNGO(null);
        }}
        onConfirm={confirmReject}
        title="Reject NGO"
        message={`Are you sure you want to reject "${selectedNGO?.organizationName}"? This action cannot be undone.`}
        confirmText="Reject"
        type="danger"
        isLoading={isProcessing}
      />
    </div>
  );
}
