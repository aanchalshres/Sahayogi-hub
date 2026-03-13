"use client";

import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { ArrowLeft, Shield } from "lucide-react";

interface Badge {
  name: string;
  type: "skill" | "participation" | "impact" | "special";
  icon: string;
  description: string;
  dateEarned: string;
  trustPoints?: number;
  skillPoints?: number;
}

// Mock badges
const mockBadges: Badge[] = [
  {
    name: "First Aid Expert",
    type: "skill",
    icon: "⚕️",
    description: "Completed 3 verified First Aid tasks",
    dateEarned: "March 7, 2026",
    trustPoints: 10,
    skillPoints: 15,
  },
  {
    name: "Community Builder",
    type: "impact",
    icon: "🏘️",
    description: "Led 2 community development projects",
    dateEarned: "Feb 15, 2026",
    trustPoints: 8,
    skillPoints: 5,
  },
  {
    name: "Rapid Responder",
    type: "special",
    icon: "⚡",
    description: "Completed 5 emergency tasks within 24 hrs",
    dateEarned: "Jan 30, 2026",
    trustPoints: 15,
    skillPoints: 20,
  },
  {
    name: "Education Champion",
    type: "participation",
    icon: "📚",
    description: "Taught 4 classes to local students",
    dateEarned: "Dec 25, 2025",
    trustPoints: 7,
    skillPoints: 5,
  },
];

export default function VolunteerBadges() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#F0F1F3] p-10 py-12 md:py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header with Back Button */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/volunteer">
              <button className="flex items-center gap-2 text-[#4F46C8] hover:text-[#3f3fa3] font-medium transition">
                <ArrowLeft className="w-5 h-5" />
                Back to Tasks
              </button>
            </Link>
          </div>

          {/* User Profile Card */}
          <div className="bg-white rounded-lg border border-[#CACDD3] p-8 mb-8 shadow">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Avatar */}
              <div className="w-20 h-20 rounded-full bg-[#4F46C8] text-white flex items-center justify-center text-2xl font-bold">
                RS
              </div>

              {/* User Info */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-[#111827]">Ram Sharma</h1>
                <p className="text-gray-600 mt-1">Kathmandu, Nepal</p>

                {/* Skills Tags */}
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="bg-[#4F46C8] text-white px-3 py-1 rounded-full text-sm font-medium">
                    First Aid
                  </span>
                  <span className="bg-[#4F46C8] text-white px-3 py-1 rounded-full text-sm font-medium">
                    Medical
                  </span>
                  <span className="bg-[#4F46C8] text-white px-3 py-1 rounded-full text-sm font-medium">
                    Logistics
                  </span>
                </div>

                {/* Trust Score */}
                <div className="flex items-center gap-2 mt-4">
                  <Shield className="w-5 h-5 text-[#4C956C]" />
                  <span className="font-medium text-[#111827]">Trust Score: 92%</span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#4F46C8]">4</div>
                  <p className="text-sm text-gray-600">Badges Earned</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#4C956C]">45</div>
                  <p className="text-sm text-gray-600">Total Points</p>
                </div>
              </div>
            </div>
          </div>

          {/* Badges Section */}
          <div>
            <h2 className="text-3xl font-bold text-[#111827] mb-8">My Achievements</h2>

            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {mockBadges.map((badge) => (
                <div
                  key={badge.name}
                  className="bg-white rounded-lg shadow-md p-6 border border-[#CACDD3] hover:shadow-lg transition flex flex-col"
                >
                  {/* Badge Icon */}
                  <div className="text-4xl mb-4">{badge.icon}</div>

                  {/* Badge Name */}
                  <h3 className="text-lg font-bold text-[#111827] mb-2">
                    {badge.name}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4 grow">
                    {badge.description}
                  </p>

                  {/* Date Earned */}
                  <p className="text-xs text-gray-500 mb-4">
                    Earned: {badge.dateEarned}
                  </p>

                  {/* Points */}
                  <div className="flex items-center justify-between gap-2 p-3 bg-[#F0F1F3] rounded-lg">
                    <span className="text-xs font-medium text-gray-700">
                      🔒 {badge.trustPoints} Trust
                    </span>
                    <span className="text-xs font-medium text-gray-700">
                      ⭐ {badge.skillPoints} Skill
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
