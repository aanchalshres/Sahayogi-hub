"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "../components/ui/button";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

interface Task {
  title: string;
  category: string;
  skills: string[];
  quota: string;
  district: string;
  location: string;
  date: string;
  description: string;
}

export default function NGODashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const storedTasks = JSON.parse(localStorage.getItem("tasks") || "[]");
    setTasks(storedTasks);
  }, []);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#F0F1F3] p-10 py-12 md:py-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-[#111827]">NGO Dashboard</h1>
            <Link href="/dashboard/org">
              <Button className="bg-[#4F46C8] hover:bg-[#3f3fa3] text-white">
                Post New Task
              </Button>
            </Link>
          </div>

          <div className="bg-white rounded-lg border border-[#CACDD3] p-6 shadow">
            <h2 className="text-2xl font-bold text-[#111827] mb-6">Your Posted Tasks</h2>

            {tasks.length === 0 ? (
              <p className="text-gray-500">No tasks posted yet. Create your first task to get started.</p>
            ) : (
              <div className="space-y-4">
                {tasks.map((task, index) => (
                  <div
                    key={index}
                    className="border border-[#CACDD3] rounded-lg p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-[#111827]">{task.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {task.category} • {task.district}
                        </p>
                        <p className="text-gray-600 mt-2">{task.description}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {task.skills.map((skill, i) => (
                            <span
                              key={i}
                              className="bg-[#B9C0D4] px-2 py-1 text-xs rounded text-[#111827]"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                        <div className="mt-3 text-sm text-gray-600">
                          <span className="font-medium">Quota:</span> {task.quota} •{" "}
                          <span className="font-medium">Location:</span> {task.location || "N/A"} •{" "}
                          <span className="font-medium">Date:</span> {task.date || "N/A"}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
