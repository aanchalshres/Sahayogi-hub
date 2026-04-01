"use client";

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { NGO } from '@/app/types';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { DataTable } from '@/app/components/ui-custom/DataTable';
import { StatusBadge } from '@/app/components/ui-custom/StatusBadge';
import { EmptyState } from '@/app/components/ui-custom/EmptyState';
import { TableSkeleton, StatsCardSkeleton } from '@/app/components/ui-custom/Skeleton';
import { apiGet } from '@/app/lib/api';
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
  Building2,
  MapPin,
  Calendar,
  RefreshCw,
  ArrowRight,
  Info,
} from 'lucide-react';

export function NGOVerification() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [ngos, setNgos] = useState<NGO[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [districtFilter, setDistrictFilter] = useState<string>('all');
  const [selectedNGO, setSelectedNGO] = useState<NGO | null>(null);

  // Fetch NGO data from API
  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const fetchNGOs = async () => {
      try {
        if (!isMounted) return;
        setIsLoading(true);

        // Add 5 second timeout for API call
        const controller = new AbortController();
        timeoutId = setTimeout(() => controller.abort(), 5000);

        const data = await Promise.race([
          apiGet<any>('/api/ngo-profiles'),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('API timeout')), 5000)
          ),
        ]);

        if (!isMounted) return;
        
        // Map backend response to NGO type
        const mappedNGOs = (data.data || data || []).map((ngo: any) => ({
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
        
        if (isMounted) {
          setNgos(mappedNGOs);
        }
      } catch (error) {
        if (!isMounted) return;
        console.error('Failed to fetch NGOs from API:', error);
        console.log('⚠️  Falling back to mock data. To use real data:');
        console.log('1. Start Laravel backend: php artisan serve');
        console.log('2. Implement GET /api/ngo-profiles endpoint');
        console.log('3. Expected response: { data: [...] } or direct array');
        // Fallback to mock data
        setNgos(mockNGOs);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchNGOs();

    // Cleanup function
    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
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
    const uniqueLocations = [...new Set(ngos.map((ngo) => ngo.officeLocation))];
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

  const handleRowClick = (ngo: NGO) => {
    router.push(`/dashboard/admin/ngo-verification/${ngo.id}`);
  };

  const columns = [
    {
      key: 'organizationName',
      header: 'Organization',
      render: (ngo: NGO) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-sahayogi-blue to-sahayogi-blue-dark flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4 text-sahayogi-blue" />
          </div>
          <div className="min-w-0">
            <p className="text-xs md:text-sm font-medium text-gray-900 truncate">{ngo.organizationName}</p>
            <p className="text-xs text-gray-500 truncate hidden md:block">{ngo.ownerName}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'registrationNumber',
      header: 'Reg. No.',
      render: (ngo: NGO) => (
        <p className="text-xs md:text-sm font-mono text-gray-600 truncate">{ngo.registrationNumber || '—'}</p>
      ),
    },
    {
      key: 'officeLocation',
      header: 'Location',
      render: (ngo: NGO) => (
        <div className="flex items-center gap-1 text-xs md:text-sm text-gray-600">
          <MapPin className="w-3 h-3 md:w-4 md:h-4 text-gray-400 shrink-0" />
          <span className="truncate hidden md:inline">{ngo.officeLocation || '—'}</span>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      render: (ngo: NGO) => (
        <p className="text-xs md:text-sm text-gray-600 truncate hidden lg:table-cell">{ngo.email}</p>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (ngo: NGO) => (
        <p className="text-xs md:text-sm text-gray-600 hidden lg:table-cell">{ngo.phone || '—'}</p>
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
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">NGO Verification</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
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
          <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
            <p className="text-xs md:text-sm text-gray-500 truncate">Total NGOs</p>
            <p className="text-xl md:text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
            <p className="text-xs md:text-sm text-gray-500 truncate">Pending</p>
            <p className="text-xl md:text-2xl font-bold text-amber-600 mt-1">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
            <p className="text-xs md:text-sm text-gray-500 truncate">Verified</p>
            <p className="text-xl md:text-2xl font-bold text-emerald-600 mt-1">{stats.verified}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
            <p className="text-xs md:text-sm text-gray-500 truncate">Rejected</p>
            <p className="text-xl md:text-2xl font-bold text-red-600 mt-1">{stats.rejected}</p>
          </div>
        </div>
      )}

      {/* Filters and Results - truncated for brevity, copy from original */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 md:p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
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
              <SelectTrigger className="w-32 md:w-40 text-sm">
                <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
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
        <div className="w-full overflow-x-auto bg-white rounded-xl border border-gray-200">
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

      {/* End of page */}
    </div>
  );
}
