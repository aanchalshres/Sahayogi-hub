"use client";

import { Card, CardContent } from "@/app/components/ui/card";
import Link from "next/link";
import { Plus, Users, FileText, CheckSquare } from "lucide-react";

export default function NGODashboard() {
  const stats = [
    { label: "Active Tasks", value: 8, icon: FileText, color: "bg-blue-50" },
    { label: "Applications", value: 24, icon: Users, color: "bg-green-50" },
    { label: "Volunteers Needed", value: 15, icon: CheckSquare, color: "bg-amber-50" },
    { label: "Tasks Posted", value: 32, icon: Plus, color: "bg-purple-50" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#111827]">Welcome Back!</h1>
        <p className="text-[#6B7280]">Here's what's happening with your tasks today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="bg-white border border-[#CACDD3]">
              <CardContent className="p-6">
                <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
                  <Icon className="w-6 h-6 text-gray-600" />
                </div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-3xl font-bold text-[#111827]">{stat.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-white border border-[#CACDD3]">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-[#111827] mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link href="/dashboard/ngo/post-task" className="p-4 border border-[#CACDD3] rounded-lg hover:bg-[#F0F1F3] transition">
              <Plus className="w-6 h-6 text-[#4F46C8] mb-2" />
              <p className="font-medium text-[#111827]">Post New Task</p>
            </Link>
            <Link href="/dashboard/ngo/applications" className="p-4 border border-[#CACDD3] rounded-lg hover:bg-[#F0F1F3] transition">
              <Users className="w-6 h-6 text-[#4F46C8] mb-2" />
              <p className="font-medium text-[#111827]">View Applications</p>
            </Link>
            <Link href="/dashboard/ngo/tasks" className="p-4 border border-[#CACDD3] rounded-lg hover:bg-[#F0F1F3] transition">
              <FileText className="w-6 h-6 text-[#4F46C8] mb-2" />
              <p className="font-medium text-[#111827]">My Tasks</p>
            </Link>
            <Link href="/dashboard/ngo/profile" className="p-4 border border-[#CACDD3] rounded-lg hover:bg-[#F0F1F3] transition">
              <CheckSquare className="w-6 h-6 text-[#4F46C8] mb-2" />
              <p className="font-medium text-[#111827]">Profile Settings</p>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border border-[#CACDD3]">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-[#111827] mb-4">Recent Activity</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-[#F0F1F3] rounded-lg">
              <div>
                <p className="font-medium text-[#111827]">New application received</p>
                <p className="text-sm text-[#6B7280]">Ram Sharma applied for "Community Health Camp"</p>
              </div>
              <span className="text-xs text-[#6B7280]">2 hours ago</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#F0F1F3] rounded-lg">
              <div>
                <p className="font-medium text-[#111827]">Task completed</p>
                <p className="text-sm text-[#6B7280]">"School Renovation" task completed with 12 volunteers</p>
              </div>
              <span className="text-xs text-[#6B7280]">1 day ago</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#F0F1F3] rounded-lg">
              <div>
                <p className="font-medium text-[#111827]">Task posted</p>
                <p className="text-sm text-[#6B7280]">"Earthquake Relief Drive" posted successfully</p>
              </div>
              <span className="text-xs text-[#6B7280]">2 days ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
