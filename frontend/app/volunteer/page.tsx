"use client";

import { useEffect, useState } from "react";
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

export default function VolunteerDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const storedTasks = JSON.parse(localStorage.getItem("tasks") || "[]");
    setTasks(storedTasks);
  }, []);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#F0F1F3] p-10 py-12 md:py-12">

        <h1 className="text-3xl font-bold text-[#111827] mb-8">
          Volunteer Tasks
        </h1>

      {tasks.length === 0 && (
        <p className="text-gray-500">No tasks available</p>
      )}

      <div className="grid md:grid-cols-2 gap-6">

        {tasks.map((task, index) => (
          <div
            key={index}
            className="bg-white border border-[#CACDD3] p-6 rounded-lg shadow"
          >
            <h2 className="text-xl font-semibold">{task.title}</h2>

            <p className="text-sm text-gray-500">
              {task.category} • {task.district}
            </p>

            <p className="mt-2 text-gray-600">
              {task.description}
            </p>

            <p className="mt-2 text-sm">
              Volunteers Needed: {task.quota}
            </p>

            <div className="flex flex-wrap gap-2 mt-3">
              {task.skills.map((skill, i) => (
                <span
                  key={i}
                  className="bg-[#B9C0D4] px-2 py-1 text-xs rounded"
                >
                  {skill}
                </span>
              ))}
            </div>

            <button className="mt-4 bg-[#4F46C8] text-white px-4 py-2 rounded">
              Apply
            </button>
          </div>
        ))}

      </div>

      </div>
      <Footer />
    </>
  );
}
