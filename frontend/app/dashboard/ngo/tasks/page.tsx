"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { ArrowLeft, Calendar, Users, MapPin, FileText } from "lucide-react";
import { apiGet } from "@/app/lib/api";

interface Skill {
  id: number;
  name: string;
}

interface Application {
  id: number;
  volunteer_id: number;
  status: string;
  created_at: string;
}

interface Task {
  id: number;
  title: string;
  description: string;
  category: string;
  district: string;
  quota: number;
  filled_quota: number;
  start_date: string;
  end_date: string;
  status: "active" | "completed" | "cancelled";
  skills: Skill[];
  applications: Application[];
  created_at: string;
  updated_at: string;
}

export default function MyTasksPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTasks();

    // Cleanup: Reset states when component unmounts
    return () => {
      setIsLoading(false);
      setTasks([]);
      setError(null);
    };
  }, []);

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout")), 15000)
      );

      const response = await Promise.race([
        apiGet<{ data: Task[] }>("/ngo/tasks"),
        timeoutPromise,
      ]) as { data: Task[] };

      if (response && Array.isArray(response.data)) {
        setTasks(response.data);
      } else {
        setTasks([]);
      }
    } catch (err) {
    
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getQuotaProgress = (filled: number, quota: number): number => {
    return quota > 0 ? Math.round((filled / quota) * 100) : 0;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-[#111827]">My Tasks</h1>
          <p className="text-[#6B7280]">Manage your volunteer tasks and track applications</p>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <Card className="bg-red-50 border border-red-200">
          <CardContent className="p-4">
            <p className="text-red-700 font-medium">{error}</p>
            <Button
              onClick={loadTasks}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-white border border-[#CACDD3]">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="flex gap-2 mt-4">
                    <div className="h-8 bg-gray-200 rounded w-24"></div>
                    <div className="h-8 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : tasks.length === 0 ? (
        /* Empty state */
        <Card className="bg-white border border-[#CACDD3]">
          <CardContent className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#111827] mb-2">No tasks yet</h3>
            <p className="text-[#6B7280] mb-6">
              You haven't posted any tasks yet. Start by creating a new task to connect with volunteers.
            </p>
            <Button
              onClick={() => router.push("/dashboard/ngo/post-task")}
              className="bg-[#4F46C8] hover:bg-[#4F46C8]/90 text-white"
            >
              Post a New Task
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Tasks list */
        <div className="space-y-4">
          {tasks.map((task) => {
            const quotaProgress = getQuotaProgress(task.filled_quota, task.quota);

            return (
              <Card
                key={task.id}
                className="bg-white border border-[#CACDD3] hover:shadow-md transition"
              >
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Title and Status */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-[#111827] mb-1">
                          {task.title}
                        </h3>
                        <p className="text-sm text-[#6B7280] line-clamp-2">
                          {task.description}
                        </p>
                      </div>
                      <Badge className={`${getStatusColor(task.status)} border-0`}>
                        {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                      </Badge>
                    </div>

                    {/* Task details grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs text-[#6B7280] font-medium">CATEGORY</p>
                        <p className="text-sm font-medium text-[#111827]">{task.category}</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-xs text-[#6B7280] font-medium">
                          <MapPin className="w-3 h-3" />
                          LOCATION
                        </div>
                        <p className="text-sm font-medium text-[#111827]">{task.district}</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-xs text-[#6B7280] font-medium">
                          <Calendar className="w-3 h-3" />
                          START DATE
                        </div>
                        <p className="text-sm font-medium text-[#111827]">
                          {formatDate(task.start_date)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-xs text-[#6B7280] font-medium">
                          <Calendar className="w-3 h-3" />
                          END DATE
                        </div>
                        <p className="text-sm font-medium text-[#111827]">
                          {formatDate(task.end_date)}
                        </p>
                      </div>
                    </div>

                    {/* Quota bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-[#4F46C8]" />
                          <span className="text-sm font-medium text-[#111827]">
                            Volunteers: {task.filled_quota}/{task.quota}
                          </span>
                        </div>
                        <span className="text-xs text-[#6B7280] font-medium">
                          {quotaProgress}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-[#4F46C8] h-2 rounded-full transition-all"
                          style={{ width: `${quotaProgress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Skills */}
                    {task.skills && task.skills.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs text-[#6B7280] font-medium">REQUIRED SKILLS</p>
                        <div className="flex flex-wrap gap-2">
                          {task.skills.map((skill) => (
                            <Badge
                              key={skill.id}
                              variant="outline"
                              className="border-[#CACDD3] text-[#6B7280]"
                            >
                              {skill.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Applications count */}
                    <div className="flex items-center gap-4 pt-2 border-t border-[#CACDD3]">
                      <span className="text-sm text-[#6B7280]">
                        {task.applications?.length || 0}{" "}
                        {task.applications?.length === 1 ? "application" : "applications"}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-auto border-[#CACDD3] text-[#4F46C8] hover:bg-[#F0F1F3]"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
