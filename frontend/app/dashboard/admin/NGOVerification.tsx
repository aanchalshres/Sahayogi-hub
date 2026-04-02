"use client";

import { useState, useMemo, useEffect } from 'react';
import type { NGO } from '@/app/types';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { DataTable } from '@/app/components/ui-custom/DataTable';
import { StatusBadge } from '@/app/components/ui-custom/StatusBadge';
import { EmptyState } from '@/app/components/ui-custom/EmptyState';
import { TableSkeleton, StatsCardSkeleton } from '@/app/components/ui-custom/Skeleton';
import { apiGet, apiPost } from '@/app/lib/api';
import { mockNGOs } from '@/app/data/mockData';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/app/components/ui/dialog';
import {
  Search,
  Filter,
  Building2,
  MapPin,
  RefreshCw,
  FileText,
  Download,
} from 'lucide-react';

export function NGOVerification() {
  const [isLoading, setIsLoading] = useState(true);
  const [ngos, setNgos] = useState<NGO[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [districtFilter, setDistrictFilter] = useState<string>('all');
  const [selectedNGO, setSelectedNGO] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  // Fetch NGO data from API
  useEffect(() => {
    let isMounted = true;

    const fetchNGOs = async () => {
      try {
        if (!isMounted) return;
        setIsLoading(true);

        const data = await apiGet<any>('/api/ngos');
        
        // Map backend response to NGO type
        const mappedNGOs = (Array.isArray(data) ? data : data.data || []).map((ngo: any) => ({
          id: ngo.id?.toString(),
          organizationName: ngo.organization_name,
          registrationNumber: ngo.registration_number,
          officeLocation: ngo.office_location,
          status: ngo.status || 'pending',
          ownerName: ngo.user?.name || 'N/A',
          email: ngo.user?.email || '',
          phone: ngo.user?.phone || '',
          createdAt: ngo.created_at,
          panNumber: ngo.pan_number || '',
          documents: {
            registrationCertificate: ngo.registration_file_path || '',
            panCard: ngo.pan_file_path || '',
            organizationProfile: ngo.letterhead_file_path || '',
          },
        }));
        
        if (isMounted) {
          setNgos(mappedNGOs);
        }
      } catch (error) {
        console.error('Failed to fetch NGOs:', error);
        // Fallback to mock data
        setNgos(mockNGOs);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchNGOs();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      setIsDetailModalOpen(false);
      setDetailLoading(false);
      setSelectedNGO(null);
    };
  }, []);

  const filteredNGOs = useMemo(() => {
    return ngos.filter((ngo) => {
      const matchesSearch =
        ngo.organizationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ngo.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ngo.ownerName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || ngo.status === statusFilter;
      const matchesLocation = districtFilter === 'all' || ngo.officeLocation === districtFilter;
      return matchesSearch && matchesStatus && matchesLocation;
    });
  }, [ngos, searchQuery, statusFilter, districtFilter]);

  const districts = useMemo(() => {
    const uniqueLocations = [...new Set(ngos.map((ngo) => ngo.officeLocation).filter(Boolean))].filter(loc => loc && loc.trim() !== '');
    return ['all', ...uniqueLocations];
  }, [ngos]);

  const stats = useMemo(() => {
    return {
      total: ngos.length,
      pending: ngos.filter((n) => n.status === 'pending').length,
      verified: ngos.filter((n) => n.status === 'verified').length,
      rejected: ngos.filter((n) => n.status === 'rejected').length,
    };
  }, [ngos]);

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setDistrictFilter('all');
  };

  const handleRowClick = async (ngo: NGO) => {
    setIsDetailModalOpen(true);
    setDetailLoading(true);
    try {
      // Add timeout to prevent hanging requests
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 15000)
      );
      
      const data = await Promise.race([
        apiGet<any>(`/api/ngos/${ngo.id}`),
        timeoutPromise,
      ]);
      
      setSelectedNGO(data);
    } catch (error) {
      console.error('Failed to fetch NGO details:', error);
      setSelectedNGO(ngo);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleApproveNGO = async () => {
    if (!selectedNGO?.id) return;

    const isConfirmed = window.confirm(
      `Are you sure you want to approve "${selectedNGO.organization_name || selectedNGO.organizationName}"?`
    );

    if (!isConfirmed) return;

    try {
      setDetailLoading(true);
      
      // Add timeout to prevent hanging requests
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 15000)
      );
      
      await Promise.race([
        apiPost<any>(`/api/ngo-profiles/${selectedNGO.id}/approve`, {}),
        timeoutPromise,
      ]);
      
      // Update the NGO in the list
      setNgos(ngos.map(ngo => 
        ngo.id === selectedNGO.id 
          ? { ...ngo, status: 'verified' } 
          : ngo
      ));

      // Update selected NGO
      setSelectedNGO({ ...selectedNGO, status: 'verified' });
      
      alert('NGO approved successfully!');
      setIsDetailModalOpen(false);
    } catch (error) {
      console.error('Failed to approve NGO:', error);
      alert('Failed to approve NGO. Please try again.');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleRejectNGO = async () => {
    if (!selectedNGO?.id) return;

    const isConfirmed = window.confirm(
      `Are you sure you want to reject "${selectedNGO.organization_name || selectedNGO.organizationName}"?`
    );

    if (!isConfirmed) return;

    try {
      setDetailLoading(true);
      
      // Add timeout to prevent hanging requests
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 15000)
      );
      
      await Promise.race([
        apiPost<any>(`/api/ngo-profiles/${selectedNGO.id}/reject`, {}),
        timeoutPromise,
      ]);
      
      // Update the NGO in the list
      setNgos(ngos.map(ngo => 
        ngo.id === selectedNGO.id 
          ? { ...ngo, status: 'rejected' } 
          : ngo
      ));

      // Update selected NGO
      setSelectedNGO({ ...selectedNGO, status: 'rejected' });
      
      alert('NGO rejected successfully!');
      setIsDetailModalOpen(false);
    } catch (error) {
      console.error('Failed to reject NGO:', error);
      alert('Failed to reject NGO. Please try again.');
    } finally {
      setDetailLoading(false);
    }
  };

  const columns = [
    {
      key: 'organizationName',
      header: 'Organization',
      render: (ngo: NGO) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-[#4F46C8] to-[#3730A3] flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-xs md:text-sm font-medium text-[#111827] truncate">{ngo.organizationName}</p>
            <p className="text-xs text-[#6B7280] truncate hidden md:block">{ngo.ownerName}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'registrationNumber',
      header: 'Reg. No.',
      render: (ngo: NGO) => (
        <p className="text-xs md:text-sm font-mono text-[#6B7280] truncate">{ngo.registrationNumber || '—'}</p>
      ),
    },
    {
      key: 'officeLocation',
      header: 'Location',
      render: (ngo: NGO) => (
        <div className="flex items-center gap-1 text-xs md:text-sm text-[#6B7280]">
          <MapPin className="w-3 h-3 md:w-4 md:h-4 text-[#6B7280] shrink-0" />
          <span className="truncate hidden md:inline">{ngo.officeLocation || '—'}</span>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      render: (ngo: NGO) => (
        <p className="text-xs md:text-sm text-[#6B7280] truncate hidden lg:table-cell">{ngo.email}</p>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (ngo: NGO) => (
        <p className="text-xs md:text-sm text-[#6B7280] hidden lg:table-cell">{ngo.phone || '—'}</p>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (ngo: NGO) => <StatusBadge status={ngo.status} />,
    },
  ];

  return (
    <div className="w-full max-w-full overflow-hidden p-3 md:p-4 lg:p-6 space-y-3 md:space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#111827]">NGO Verification</h1>
          <p className="text-xs md:text-sm text-[#6B7280] mt-1">
            Review and verify NGO registrations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={clearFilters} className="gap-2 text-sm">
            <RefreshCw className="w-4 h-4" />
            Reset Filters
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
          <div className="bg-white rounded-lg border border-[#CACDD3] p-3 md:p-4">
            <p className="text-xs md:text-sm text-[#6B7280] truncate">Total NGOs</p>
            <p className="text-xl md:text-2xl font-bold text-[#111827] mt-1">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg border border-[#CACDD3] p-3 md:p-4">
            <p className="text-xs md:text-sm text-[#6B7280] truncate">Pending</p>
            <p className="text-xl md:text-2xl font-bold text-amber-600 mt-1">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-lg border border-[#CACDD3] p-3 md:p-4">
            <p className="text-xs md:text-sm text-[#6B7280] truncate">Verified</p>
            <p className="text-xl md:text-2xl font-bold text-emerald-600 mt-1">{stats.verified}</p>
          </div>
          <div className="bg-white rounded-lg border border-[#CACDD3] p-3 md:p-4">
            <p className="text-xs md:text-sm text-[#6B7280] truncate">Rejected</p>
            <p className="text-xl md:text-2xl font-bold text-red-600 mt-1">{stats.rejected}</p>
          </div>
        </div>
      )}

      {/* Filters and Results - truncated for brevity, copy from original */}
      <div className="bg-white rounded-xl border border-[#CACDD3] p-3 md:p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
            <Input
              placeholder="Search by organization, registration number, or contact..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-sm"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32 md:w-40 text-sm">
                <Filter className="w-4 h-4 mr-2 text-[#6B7280]" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={districtFilter} onValueChange={setDistrictFilter}>
              <SelectTrigger className="w-32 md:w-40 text-sm">
                <MapPin className="w-4 h-4 mr-2 text-[#6B7280]" />
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {districts.map((district) => (
                  <SelectItem key={district} value={district}>
                    {district === 'all' ? 'All Locations' : district}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Results and Table - using DataTable component */}
      <div className="space-y-4">

        {/* Table */}
        <div className="w-full overflow-x-auto bg-white rounded-xl border border-[#CACDD3]">
        {isLoading ? (
          <TableSkeleton rows={3} columns={7} />
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
            onRowClick={handleRowClick}
            emptyMessage="No NGOs found matching your criteria"
            showActions={false}
            itemsPerPage={5}
          />
        )}
        </div>
      </div>

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="sm:max-w-3xl bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl text-[#111827]">
              {selectedNGO?.organization_name || selectedNGO?.organizationName || 'NGO Details'}
            </DialogTitle>
            <DialogDescription>
              {selectedNGO?.status && <StatusBadge status={selectedNGO.status} />}
            </DialogDescription>
          </DialogHeader>

          {detailLoading ? (
            <div className="space-y-4 py-4">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ) : selectedNGO ? (
            <div className="space-y-6 py-4">
              {/* Organization Information */}
              <div>
                <h3 className="text-sm font-semibold text-[#111827] mb-3">Organization Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-[#6B7280] mb-1">Organization Name</p>
                    <p className="text-sm font-medium text-[#111827]">
                      {selectedNGO.organization_name || selectedNGO.organizationName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#6B7280] mb-1">Registration Number</p>
                    <p className="text-sm font-medium text-[#111827]">
                      {selectedNGO.registration_number || selectedNGO.registrationNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#6B7280] mb-1">PAN Number</p>
                    <p className="text-sm font-medium text-[#111827]">
                      {selectedNGO.pan_number || selectedNGO.panNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#6B7280] mb-1">Office Location</p>
                    <p className="text-sm font-medium text-[#111827]">
                      {selectedNGO.office_location || selectedNGO.officeLocation}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="border-t border-[#CACDD3] pt-4">
                <h3 className="text-sm font-semibold text-[#111827] mb-3">Contact Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-[#6B7280] mb-1">Contact Person</p>
                    <p className="text-sm font-medium text-[#111827]">
                      {selectedNGO.user?.name || selectedNGO.ownerName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#6B7280] mb-1">Email</p>
                    <p className="text-sm font-medium text-[#111827]">
                      {selectedNGO.user?.email || selectedNGO.email}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-[#6B7280] mb-1">Phone</p>
                    <p className="text-sm font-medium text-[#111827]">
                      {selectedNGO.user?.phone || selectedNGO.phone || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Documents */}
              {(selectedNGO.registration_file_path || selectedNGO.pan_file_path || selectedNGO.letterhead_file_path) && (
                <div className="border-t border-[#CACDD3] pt-4">
                  <h3 className="text-sm font-semibold text-[#111827] mb-4 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#4F46C8]" />
                    Submitted Documents
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {selectedNGO.registration_file_path && (
                      <div className="flex items-center justify-between p-3 bg-[#F0F1F3] rounded-lg border border-[#CACDD3]">
                        <div>
                          <p className="text-xs font-medium text-[#6B7280] mb-1">Registration Certificate</p>
                          <p className="text-xs text-[#6B7280]">Registration document</p>
                        </div>
                        <a
                          href={selectedNGO.registration_file_path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 bg-[#4F46C8] text-white rounded text-xs font-medium hover:bg-[#3730A3]"
                        >
                          <Download className="w-3 h-3" />
                          View
                        </a>
                      </div>
                    )}
                    {selectedNGO.pan_file_path && (
                      <div className="flex items-center justify-between p-3 bg-[#F0F1F3] rounded-lg border border-[#CACDD3]">
                        <div>
                          <p className="text-xs font-medium text-[#6B7280] mb-1">PAN Certificate</p>
                          <p className="text-xs text-[#6B7280]">Tax identification document</p>
                        </div>
                        <a
                          href={selectedNGO.pan_file_path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 bg-[#4F46C8] text-white rounded text-xs font-medium hover:bg-[#3730A3]"
                        >
                          <Download className="w-3 h-3" />
                          View
                        </a>
                      </div>
                    )}
                    {selectedNGO.letterhead_file_path && (
                      <div className="flex items-center justify-between p-3 bg-[#F0F1F3] rounded-lg border border-[#CACDD3]">
                        <div>
                          <p className="text-xs font-medium text-[#6B7280] mb-1">Organization Letterhead</p>
                          <p className="text-xs text-[#6B7280]">Official letterhead sample</p>
                        </div>
                        <a
                          href={selectedNGO.letterhead_file_path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 bg-[#4F46C8] text-white rounded text-xs font-medium hover:bg-[#3730A3]"
                        >
                          <Download className="w-3 h-3" />
                          View
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="border-t border-[#CACDD3] pt-4 flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setIsDetailModalOpen(false)}
                  className="text-sm"
                  disabled={detailLoading}
                >
                  Close
                </Button>
                {selectedNGO.status === 'pending' && (
                  <>
                    <Button
                      variant="outline"
                      onClick={handleRejectNGO}
                      className="text-red-600 border-red-200 hover:bg-red-50 text-sm"
                      disabled={detailLoading}
                    >
                      {detailLoading ? 'Processing...' : 'Reject'}
                    </Button>
                    <Button
                      onClick={handleApproveNGO}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm"
                      disabled={detailLoading}
                    >
                      {detailLoading ? 'Processing...' : 'Approve'}
                    </Button>
                  </>
                )}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* End of page */}
    </div>
  );
}
