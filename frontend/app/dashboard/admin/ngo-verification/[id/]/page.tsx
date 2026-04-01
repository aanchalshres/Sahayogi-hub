"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import type { NGO } from '@/app/types';
import { Button } from '@/app/components/ui/button';
import { ConfirmationModal } from '@/app/components/ui-custom/ConfirmationModal';
import { apiGet, apiPost } from '@/app/lib/api';
import { mockNGOs } from '@/app/data/mockData';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Mail,
  Phone,
  Calendar,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  Download,
} from 'lucide-react';

export default function NGODetailPage() {
  const router = useRouter();
  const params = useParams();
  const ngoId = params.id as string;

  const [ngo, setNgo] = useState<NGO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch NGO details
  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const fetchNGODetails = async () => {
      try {
        if (!isMounted) return;
        setIsLoading(true);

        // Add 5 second timeout for API call
        const controller = new AbortController();
        timeoutId = setTimeout(() => controller.abort(), 5000);

        const data = await Promise.race([
          apiGet<any>(`/api/ngo-profiles/${ngoId}`),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('API timeout')), 5000)
          ),
        ]);

        if (!isMounted) return;
        const ngoData = data.data || data;

        const mappedNGO: NGO = {
          id: ngoData.id?.toString(),
          organizationName: ngoData.organization_name,
          registrationNumber: ngoData.registration_number,
          officeLocation: ngoData.office_location,
          status: ngoData.status || 'pending',
          ownerName: ngoData.user?.name || 'N/A',
          email: ngoData.user?.email || '',
          phone: ngoData.user?.phone || '',
          createdAt: ngoData.created_at || ngoData.createdAt,
          documents: {
            registrationCertificate: '',
            panCard: '',
            organizationProfile: '',
          },
        };

        if (isMounted) {
          setNgo(mappedNGO);
        }
      } catch (error) {
        if (!isMounted) return;
        console.error('Failed to fetch NGO details from API:', error);
        // Fallback to mock data
        const foundNGO = mockNGOs.find((n) => n.id === ngoId);
        setNgo(foundNGO || null);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (ngoId) {
      fetchNGODetails();
    }

    // Cleanup function
    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [ngoId]);

  const handleApprove = async () => {
    if (ngo) {
      setIsProcessing(true);
      try {
        await apiPost(`/api/ngo-profiles/${ngo.id}/approve`, {});
        // Update local state
        setNgo((prev) => prev ? { ...prev, status: 'verified' } : null);
        setIsApproveModalOpen(false);
        // Show success message and redirect
        setTimeout(() => {
          router.push('/dashboard/admin/ngo-verification?status=verified');
        }, 1500);
      } catch (error) {
        console.error('Failed to approve NGO:', error);
        alert('Failed to approve NGO. Please try again.');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleReject = async () => {
    if (ngo) {
      setIsProcessing(true);
      try {
        await apiPost(`/api/ngo-profiles/${ngo.id}/reject`, {});
        // Update local state
        setNgo((prev) => prev ? { ...prev, status: 'rejected' } : null);
        setIsRejectModalOpen(false);
        // Show success message and redirect
        setTimeout(() => {
          router.push('/dashboard/admin/ngo-verification?status=rejected');
        }, 1500);
      } catch (error) {
        console.error('Failed to reject NGO:', error);
        alert('Failed to reject NGO. Please try again.');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'text-green-600 bg-green-50';
      case 'rejected':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-amber-600 bg-amber-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle2 className="w-5 h-5" />;
      case 'rejected':
        return <XCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.push('/dashboard/admin/ngo-verification')}
            className="flex items-center gap-2 text-sahayogi-blue hover:text-sahayogi-blue-dark mb-6 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to List
          </button>
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded w-32" />
            <div className="h-64 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!ngo) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.push('/dashboard/admin/ngo-verification')}
            className="flex items-center gap-2 text-sahayogi-blue hover:text-sahayogi-blue-dark mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-600">NGO not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard/admin/ngo-verification')}
            className="flex items-center gap-2 text-sahayogi-blue hover:text-sahayogi-blue-dark mb-6 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to List
          </button>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">{ngo.organizationName}</h1>
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${getStatusColor(
                ngo.status
              )}`}
            >
              {getStatusIcon(ngo.status)}
              <span className="capitalize">{ngo.status}</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Organization Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Organization Information</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-sahayogi-blue mt-1 shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600">Organization Name</p>
                    <p className="text-base font-medium text-gray-900">{ngo.organizationName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-sahayogi-blue mt-1 shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600">Registration Number</p>
                    <p className="text-base font-medium text-gray-900 font-mono">{ngo.registrationNumber}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-sahayogi-blue mt-1 shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600">Office Location</p>
                    <p className="text-base font-medium text-gray-900">{ngo.officeLocation}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Owner Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Owner Information</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Full Name</p>
                  <p className="text-base font-medium text-gray-900">{ngo.ownerName}</p>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-sahayogi-blue mt-1 shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600">Email Address</p>
                    <p className="text-base font-medium text-gray-900">{ngo.email || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-sahayogi-blue mt-1 shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600">Phone Number</p>
                    <p className="text-base font-medium text-gray-900">{ngo.phone || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Documents */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Submitted Documents</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-sahayogi-blue" />
                    <span className="font-medium text-gray-900">Registration Certificate</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-sahayogi-blue"
                    disabled={!ngo.documents?.registrationCertificate}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-sahayogi-blue" />
                    <span className="font-medium text-gray-900">PAN Card</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-sahayogi-blue"
                    disabled={!ngo.documents?.panCard}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-sahayogi-blue" />
                    <span className="font-medium text-gray-900">Organization Profile</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-sahayogi-blue"
                    disabled={!ngo.documents?.organizationProfile}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h2>
              <div className="flex items-center gap-3 text-gray-600">
                <Calendar className="w-5 h-5" />
                <span className="text-sm">
                  Submitted on{' '}
                  <span className="font-medium text-gray-900">
                    {ngo.createdAt
                      ? new Date(ngo.createdAt).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : 'Unknown'}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Right - Actions */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 bg-white rounded-lg border border-gray-200 p-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Actions</h3>

              {ngo.status === 'pending' && (
                <>
                  <Button
                    onClick={() => setIsApproveModalOpen(true)}
                    disabled={isProcessing}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    onClick={() => setIsRejectModalOpen(true)}
                    disabled={isProcessing}
                    variant="outline"
                    className="w-full text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </>
              )}

              {ngo.status === 'verified' && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800 font-medium">✓ This NGO has been approved</p>
                </div>
              )}

              {ngo.status === 'rejected' && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800 font-medium">✗ This NGO has been rejected</p>
                </div>
              )}

              <Button
                onClick={() => router.push('/dashboard/admin/ngo-verification')}
                variant="outline"
                className="w-full"
              >
                Back to List
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        onConfirm={handleApprove}
        title="Approve NGO"
        message={`Are you sure you want to approve "${ngo?.organizationName}"? This action will mark the NGO as verified.`}
        confirmText="Approve"
        isLoading={isProcessing}
      />

      <ConfirmationModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={handleReject}
        title="Reject NGO"
        message={`Are you sure you want to reject "${ngo?.organizationName}"? This action cannot be undone.`}
        confirmText="Reject"
        type="danger"
        isLoading={isProcessing}
      />
    </div>
  );
}
