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
    availability: "",
    skills: [] as string[],
    location: "",
    shareLocation: true,
  });

  const [userLocation, setUserLocation] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("selectedTask") || "null");

      if (stored && !stored.organization) {
        stored.organization = "Nepal Red Cross";
      }

      setTask(stored);
    } catch {
      setTask(null);
    }

    // 🌍 Detect location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          setCoords({ lat: latitude, lng: longitude });

          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await res.json();

            const locationName =
              data.address?.city ||
              data.address?.town ||
              data.address?.village ||
              data.display_name ||
              "Detected location";

            setUserLocation(locationName);

            // auto fill in form
            setForm((prev) => ({ ...prev, location: locationName }));
          } catch {
            setUserLocation("Location detected");
          }
        },
        () => {
          console.log("Location permission denied");
        }
      );
    }
  }, []);

  // 🔹 Toggle skills
  const toggleSkill = (skill: string) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.phone || !form.availability) {
      alert("Please fill all required fields!");
      return;
    }

    const applications = JSON.parse(
      localStorage.getItem("applications") || "[]"
    );

    // 🚫 Prevent duplicate
    const alreadyApplied = applications.find(
      (app: any) => app.taskId == id && app.email === form.email
    );

    if (alreadyApplied) {
      alert("You already applied!");
      return;
    }

    applications.push({
      taskId: id,
      taskTitle: task?.title,
      name: form.name,
      email: form.email,
      phone: form.phone,
      message: form.message,
      skills: form.skills,
      availability: form.availability,
      location: form.shareLocation ? form.location : "Not shared",
      coordinates: form.shareLocation ? coords : null,
      appliedAt: new Date().toISOString(),
    });

    localStorage.setItem("applications", JSON.stringify(applications));

    alert("✅ Application submitted successfully!");
    router.push("/volunteer");
  };

  const progress =
    task && task.quota > 0
      ? (task.volunteers / task.quota) * 100
      : 0;

  return (
    <div className="bg-[#F0F1F3] min-h-screen p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* BACK */}
        <button
          onClick={() => router.push("/volunteer")}
          className="text-sm text-[#4F46C8]"
        >
          ← Back
        </button>

        {/* TASK DETAILS */}
        {task && (
          <div className="bg-white p-6 rounded-xl space-y-4">
            <h1 className="text-xl font-bold">{task.title}</h1>
            <p>{task.description}</p>

            <div className="flex flex-wrap gap-2">
              {task.skills.map((skill) => (
                <Badge key={skill}>{skill}</Badge>
              ))}
            </div>

            <p>📍 {task.district}</p>

            <div className="h-2 bg-gray-200 rounded">
              <div
                className="h-2 bg-indigo-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-xl space-y-4"
        >
          <h3 className="font-semibold">Apply Now</h3>

          <input
            placeholder="Name *"
            className="w-full p-2 border rounded"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />

          <input
            placeholder="Email *"
            className="w-full p-2 border rounded"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />

          <input
            placeholder="Phone *"
            className="w-full p-2 border rounded"
            value={form.phone}
            onChange={(e) =>
              setForm({ ...form, phone: e.target.value })
            }
          />

          {/* Availability */}
          <select
            className="w-full p-2 border rounded"
            value={form.availability}
            onChange={(e) =>
              setForm({ ...form, availability: e.target.value })
            }
          >
            <option value="">Select Availability *</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Weekend">Weekend</option>
          </select>

          {/* Skills */}
          <div>
            <p className="text-sm mb-2">Select Your Skills</p>
            <div className="flex flex-wrap gap-2">
              {(task?.skills || []).map((skill) => (
                <button
                  type="button"
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  className={`px-3 py-1 rounded-full border ${
                    form.skills.includes(skill)
                      ? "bg-indigo-500 text-white"
                      : "bg-gray-100"
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <textarea
            placeholder="Message"
            className="w-full p-2 border rounded"
            value={form.message}
            onChange={(e) =>
              setForm({ ...form, message: e.target.value })
            }
          />

          {/* LOCATION */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Your Location</p>

            <input
              placeholder="Enter your location"
              className="w-full p-2 border rounded"
              value={form.location}
              onChange={(e) =>
                setForm({ ...form, location: e.target.value })
              }
            />

            <button
              type="button"
              onClick={() =>
                setForm({ ...form, location: userLocation })
              }
              className="text-sm text-blue-500 underline"
            >
              📍 Use detected location
            </button>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.shareLocation}
                onChange={(e) =>
                  setForm({
                    ...form,
                    shareLocation: e.target.checked,
                  })
                }
              />
              Share my location with NGO
            </label>
          </div>

          <Button type="submit" className="w-full bg-indigo-600 text-white">
            Apply
          </Button>
        </form>
      </div>
    </div>
  );
}