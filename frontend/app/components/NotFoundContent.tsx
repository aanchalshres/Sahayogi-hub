"use client";

import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFoundContent() {
  return (
    <div className="min-h-screen bg-[#F0F1F3] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        {/* 404 Text */}
        <div className="text-8xl font-bold text-[#4F46C8] opacity-20">404</div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-[#111827]">Page Not Found</h1>
          <p className="text-lg text-[#6B7280]">Sorry, the page you're looking for doesn't exist.</p>
        </div>

        {/* Icon */}
        <div className="py-8">
          <div className="w-48 h-48 mx-auto bg-linear-to-br from-[#4F46C8]/10 to-[#4F46C8]/5 rounded-full flex items-center justify-center">
            <span className="text-6xl">🔍</span>
          </div>
        </div>

        {/* Message */}
        <p className="text-[#6B7280] text-sm leading-relaxed">It might have been moved or deleted. Let's get you back on track.</p>

        {/* Buttons */}
        <div className="flex flex-col gap-3 pt-4">

          <button onClick={() => typeof window !== "undefined" && window.history.back()} className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-[#4F46C8] text-[#4F46C8] font-medium rounded-lg hover:bg-[#4F46C8]/10 transition">
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>

        {/* Footer */}
        <div className="pt-8 border-t border-[#CACDD3]">
          <p className="text-sm text-[#6B7280] mb-4">Need help?</p>
          <div className="flex gap-4 justify-center text-sm">
            <Link href="/" className="text-[#4F46C8] hover:underline font-medium">Home</Link>
            <span className="text-[#CACDD3]">•</span>
            <Link href="/dashboard" className="text-[#4F46C8] hover:underline font-medium">Dashboard</Link>
            <span className="text-[#CACDD3]">•</span>
            <Link href="/" className="text-[#4F46C8] hover:underline font-medium">Contact</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
