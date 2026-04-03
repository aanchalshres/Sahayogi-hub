"use client";

import { useState } from "react";
import { Pencil, Trash2, XCircle, Plus } from "lucide-react";

type Task = {
  id: number;
  title: string;
  description: string;
  category: string;
  location: string;
  volunteers: number;
  totalVolunteers: number;
  status: "Active" | "Completed";
  emergency?: boolean;
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      title: "Earthquake Relief Support",
      description: "Assist with earthquake relief operations.",
      category: "Emergency",
      location: "Gorkha",
      volunteers: 32,
      totalVolunteers: 50,
      status: "Active",
      emergency: true,
    },
    {
      id: 2,
      title: "Community Health Camp",
      description: "Organize health checkup camp.",
      category: "Health",
      location: "Kathmandu",
      volunteers: 20,
      totalVolunteers: 20,
      status: "Completed",
    },
    {
      id: 3,
      title: "School Renovation Project",
      description: "Help renovate rural school buildings.",
      category: "Education",
      location: "Pokhara",
      volunteers: 18,
      totalVolunteers: 30,
      status: "Active",
    },
  ]);

  const deleteTask = (id: number) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const closeTask = (id: number) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, status: "Completed" } : task
      )
    );
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">My Tasks</h1>
          <p className="text-gray-500">
            Manage, edit, close, or delete your posted tasks.
          </p>
        </div>

        <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700">
          <Plus size={18} />
          New Task
        </button>
      </div>

      {/* Task List */}
      <div className="space-y-6">
        {tasks.map((task) => {
          const progress =
            (task.volunteers / task.totalVolunteers) * 100;

          return (
            <div
              key={task.id}
              className="bg-white p-6 rounded-xl shadow border"
            >
              {/* Top */}
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold">
                      {task.title}
                    </h2>

                    {task.status === "Active" && (
                      <span className="bg-indigo-100 text-indigo-600 text-xs px-2 py-1 rounded-full">
                        Active
                      </span>
                    )}

                    {task.status === "Completed" && (
                      <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full">
                        Completed
                      </span>
                    )}

                    {task.emergency && (
                      <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                        🚨 Emergency
                      </span>
                    )}
                  </div>

                  <p className="text-gray-500 mt-1">
                    {task.description}
                  </p>

                  {/* Category */}
                  <div className="flex items-center gap-3 mt-3 text-sm">
                    <span className="bg-gray-200 px-3 py-1 rounded-full">
                      {task.category}
                    </span>
                    <span className="text-gray-600">
                      {task.location}
                    </span>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-2">
                  <button className="flex items-center gap-1 border px-3 py-1 rounded-lg text-gray-700 hover:bg-gray-100">
                    <Pencil size={16} />
                    Edit
                  </button>

                  {task.status === "Active" && (
                    <button
                      onClick={() => closeTask(task.id)}
                      className="flex items-center gap-1 bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600"
                    >
                      <XCircle size={16} />
                      Close
                    </button>
                  )}

                  <button
                    onClick={() => deleteTask(task.id)}
                    className="flex items-center gap-1 bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>

              {/* Volunteers */}
              <div className="mt-4 text-sm text-gray-600">
                {task.volunteers}/{task.totalVolunteers} volunteers
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
                <div
                  className="bg-indigo-600 h-3 rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>

              <div className="text-right text-sm text-gray-500 mt-1">
                {Math.round(progress)}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}