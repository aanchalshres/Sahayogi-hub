"use client";

import { useEffect, useState } from "react";

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

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const storedTasks = JSON.parse(localStorage.getItem("tasks") || "[]");
    setTasks(storedTasks);
  }, []);

  return (
    <div className="min-h-screen bg-[#F0F1F3] p-6 md:p-10">
      <h1 className="text-3xl md:text-4xl font-bold text-[#111827] mb-8 text-center md:text-left">
        Volunteer Tasks
      </h1>

      {tasks.length === 0 && (
        <p className="text-gray-500 text-center md:text-left">No tasks available</p>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map((task, index) => (
          <div
            key={index}
            className="bg-white border border-[#CACDD3] rounded-2xl p-6 shadow hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between"
          >
            {/* Title */}
            <h2 className="text-xl md:text-2xl font-semibold text-[#111827] mb-2">
              {task.title}
            </h2>

            {/* Category & District */}
            <p className="text-sm text-gray-500 mb-3">
              {task.category} • {task.district}
            </p>

            {/* Description */}
            <p className="text-gray-600 mb-4 flex-1">{task.description}</p>

            {/* Quota */}
            <p className="text-sm font-medium mb-3">
              Volunteers Needed: <span className="text-[#4F46C8]">{task.quota}</span>
            </p>

            {/* Skills */}
            <div className="flex flex-wrap gap-2 mb-4">
              {task.skills.map((skill, i) => (
                <span
                  key={i}
                  className="bg-[#B9C0D4] text-[#111827] px-3 py-1 rounded-full text-xs hover:bg-[#A0A8C0] transition"
                >
                  {skill}
                </span>
              ))}
            </div>

            {/* Apply Button */}
            <button className="mt-auto w-full bg-[#4F46C8] hover:bg-[#3b3aa5] text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
              Apply
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}