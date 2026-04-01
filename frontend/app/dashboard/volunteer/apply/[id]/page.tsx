"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";

interface Task {
  id: number;
  title: string;
  description: string;
  category: string;
  district: string;
  quota: number;
  skills: string[];
  isEmergency: boolean;
  volunteers: number;
  organization?: string;
}

export default function ApplyPage() {
  const { id } = useParams();
  const router = useRouter();

  const [task, setTask] = useState<Task | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("selectedTask") || "null");

    // Add fallback NGO name if not exists
    if (stored && !stored.organization) {
      stored.organization = "Nepal Red Cross";
    }

    setTask(stored);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.phone) {
      alert("Please fill all required fields!");
      return;
    }

    const applications = JSON.parse(
      localStorage.getItem("applications") || "[]"
    );

    applications.push({
      taskId: id,
      taskTitle: task?.title,
      ...form,
      appliedAt: new Date().toISOString(),
    });

    localStorage.setItem("applications", JSON.stringify(applications));

    alert("✅ Application submitted!");
    router.push("/dashboard/volunteer");
  };

  const progress = task
    ? (task.volunteers / task.quota) * 100
    : 0;

  return (
    <div className="bg-[#F0F1F3] min-h-screen p-6">

      <div className="max-w-5xl mx-auto space-y-6">

        {/* 🔙 BACK BUTTON */}
        <button
          onClick={() => router.push("/dashboard/volunteer")}
          className="text-sm text-[#4F46C8] font-medium"
        >
          ← Back to Opportunities
        </button>

        {/* 🔥 MAIN CARD */}
        {task && (
          <div className="bg-white rounded-xl border p-6 space-y-6">

            {/* TITLE + ORG */}
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{task.title}</h1>

                {task.isEmergency && (
                  <Badge className="bg-red-500 text-white">
                    Emergency
                  </Badge>
                )}
              </div>

              <p className="text-gray-600 mt-1">
                {task.organization}
              </p>

              <p className="text-sm text-gray-500 mt-2">
                Leading humanitarian organization in Nepal providing disaster relief and emergency services.
              </p>
            </div>

            {/* DESCRIPTION */}
            <div>
              <h3 className="font-semibold mb-1">Description</h3>
              <p className="text-gray-600 text-sm">
                {task.description}
              </p>
            </div>

            {/* INFO GRID */}
            <div className="grid md:grid-cols-2 gap-4 text-sm">

              <p>📍 {task.district}, Nepal</p>
              <p>⏳ Ongoing</p>
              <p>👥 {task.volunteers}/{task.quota} volunteers</p>

              {/* Progress */}
              <div>
                <p className="mb-1">Volunteer Quota</p>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-2 bg-[#4F46C8] rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs mt-1">{Math.round(progress)}%</p>
              </div>
            </div>

            {/* SKILLS */}
            <div>
              <h3 className="font-semibold mb-2">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {task.skills.map((skill) => (
                  <Badge key={skill} className="bg-green-100 text-green-700">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            {/* MAP PLACEHOLDER */}
            <div>
              <h3 className="font-semibold mb-1">Location</h3>
              <div className="bg-gray-200 rounded-md h-32 flex items-center justify-center text-gray-500">
                Map placeholder — {task.district}, Nepal
              </div>
            </div>
          </div>
        )}

        {/* 📝 FORM */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border rounded-xl p-6 space-y-4"
        >

          <h3 className="text-lg font-semibold">
            Volunteer Application
          </h3>

          <input
            placeholder="Full Name *"
            className="w-full p-2 border rounded-md"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />

          <input
            type="email"
            placeholder="Email *"
            className="w-full p-2 border rounded-md"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />

          <input
            placeholder="Phone Number *"
            className="w-full p-2 border rounded-md"
            value={form.phone}
            onChange={(e) =>
              setForm({ ...form, phone: e.target.value })
            }
          />

          <textarea
            placeholder="Why do you want to join?"
            className="w-full p-2 border rounded-md"
            value={form.message}
            onChange={(e) =>
              setForm({ ...form, message: e.target.value })
            }
          />

          {/* CTA */}
          <Button
            type="submit"
            className={`w-full ${
              task?.isEmergency
                ? "bg-red-500 hover:bg-red-600"
                : "bg-[#4F46C8] hover:bg-[#3f3db5]"
            } text-white`}
          >
            {task?.isEmergency
              ? "🚨 Respond to Emergency"
              : "Apply Now"}
          </Button>

        </form>

      </div>
    </div>
  );
}
