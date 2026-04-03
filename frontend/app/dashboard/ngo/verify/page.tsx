"use client";

import { useState } from "react";

type Volunteer = {
  id: number;
  name: string;
  task: string;
  proof: string;
  completed: string;
  hours: string;
};

export default function VerifyCompletion() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([
    {
      id: 1,
      name: "Sita Thapa",
      task: "Health Camp",
      proof: "Photo documentation submitted",
      completed: "2025-03-01",
      hours: "12h logged",
    },
    {
      id: 2,
      name: "Maya Tamang",
      task: "Earthquake Relief",
      proof: "Supervisor sign-off received",
      completed: "2025-02-28",
      hours: "48h logged",
    },
    {
      id: 3,
      name: "Ram Sharma",
      task: "Earthquake Relief",
      proof: "Field report submitted",
      completed: "2025-02-25",
      hours: "36h logged",
    },
  ]);

  const handleVerify = (id: number) => {
    setVolunteers((prev) => prev.filter((v) => v.id !== id));
    alert("Badge issued successfully ✅");
  };

  const handleReject = (id: number) => {
    setVolunteers((prev) => prev.filter((v) => v.id !== id));
    alert("Submission rejected ❌");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center p-8">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-sm p-6 border">
        <h1 className="text-2xl font-bold text-gray-900">Verify Completion</h1>
        <p className="text-gray-500 mt-1 mb-6">
          Verify volunteer task completion to issue digital badges.
        </p>

        {/* Pending Section */}
        <div className="border rounded-xl bg-gray-50 p-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-indigo-600 text-lg">⏱</span>
            <h2 className="font-semibold text-gray-800">
              Pending Verification ({volunteers.length})
            </h2>
          </div>

          <div className="space-y-4">
            {volunteers.map((v) => (
              <div
                key={v.id}
                className="bg-white border rounded-lg p-5 flex justify-between items-start shadow-sm"
              >
                {/* Left content */}
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">
                    {v.name}
                  </h3>
                  <p className="text-gray-500">{v.task}</p>

                  <div className="mt-3 text-sm text-gray-600 space-y-1">
                    <p>📄 {v.proof}</p>
                    <p>📅 Completed: {v.completed}</p>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => handleVerify(v.id)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      ✔ Verify & Issue Badge
                    </button>

                    <button
                      onClick={() => handleReject(v.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Reject
                    </button>
                  </div>
                </div>

                {/* Hours badge */}
                <div>
                  <span className="bg-gray-200 text-gray-700 text-xs px-3 py-1 rounded-full">
                    {v.hours}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {volunteers.length === 0 && (
            <p className="text-center text-gray-500 py-6">
              No pending verifications 
            </p>
          )}
        </div>
      </div>
    </div>
  );
}