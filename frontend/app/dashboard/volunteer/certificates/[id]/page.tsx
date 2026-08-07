"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiGet } from "@/app/lib/api";
import { Award, Download, ArrowLeft } from "lucide-react";
import Link from "next/link";


export default function CertificateDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [cert, setCert] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const certRes = await apiGet<any>(`/volunteer/certificates/${id}`);
        setCert(certRes.data);
      } catch {
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);


  const handleDownload = async () => {
    try {
      const res = await apiGet<any>(`/volunteer/certificates/${id}/download`);
      const blob = new Blob([res.data.html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `certificate-${cert?.certificate_number || id}.html`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F1F3] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#4F46C8]/30 border-t-[#4F46C8] rounded-full animate-spin" />
      </div>
    );
  }

  if (!cert) {
    return (
      <div className="min-h-screen bg-[#F0F1F3] p-6">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-[#CACDD3] p-8 text-center">
          <p className="text-[#6B7280]">Certificate not found</p>
          <Link href="/dashboard/volunteer/certificates" className="text-[#4F46C8] text-sm mt-2 inline-block">Back to certificates</Link>
        </div>
      </div>
    );
  }

  const content = cert.content || {};

  return (
    <div className="min-h-screen bg-[#F0F1F3] p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <Link href="/dashboard/volunteer/certificates" className="inline-flex items-center gap-1 text-sm text-[#6B7280] hover:text-[#4F46C8]">
          <ArrowLeft className="w-4 h-4" /> Back to certificates
        </Link>

        <div className="bg-white rounded-2xl border border-[#CACDD3] overflow-hidden">
          <div className="h-24 bg-[#4F46C8]" />
          <div className="px-6 pb-6 -mt-8">
            <div className="w-16 h-16 rounded-full bg-white border-4 border-[#E0E3EB] flex items-center justify-center">
              <Award className="w-8 h-8 text-[#4F46C8]" />
            </div>
            <div className="mt-4">
              <h1 className="text-xl font-semibold text-[#111827]">{content.task_title || cert.task?.title || "Certificate"}</h1>
              <p className="text-sm text-[#6B7280] mt-1">{content.organization_name || cert.ngo?.organization_name}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-[#CACDD3] p-4">
            <p className="text-xs text-[#6B7280]">Volunteer</p>
            <p className="text-sm font-medium text-[#111827] mt-1">{content.volunteer_name || "You"}</p>
          </div>
          <div className="bg-white rounded-xl border border-[#CACDD3] p-4">
            <p className="text-xs text-[#6B7280]">Hours Contributed</p>
            <p className="text-sm font-medium text-[#111827] mt-1">{content.hours_contributed || 0}h</p>
          </div>
          <div className="bg-white rounded-xl border border-[#CACDD3] p-4">
            <p className="text-xs text-[#6B7280]">Issued</p>
            <p className="text-sm font-medium text-[#111827] mt-1">{cert.issued_at ? new Date(cert.issued_at).toLocaleDateString() : "N/A"}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-2 bg-[#4F46C8] hover:bg-[#4338CA] text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
            <Download className="w-4 h-4" /> Download Certificate
          </button>
        </div>
      </div>
    </div>
  );
}

