"use client";

import { useState } from "react";

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

export default function OrgPage() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [skills, setSkills] = useState("");
  const [quota, setQuota] = useState("");
  const [district, setDistrict] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const task: Task = {
      title,
      category,
      skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
      quota,
      district,
      location,
      date,
      description,
    };

    const storedTasks = JSON.parse(localStorage.getItem("tasks") || "[]");
    storedTasks.push(task);
    localStorage.setItem("tasks", JSON.stringify(storedTasks));

    setSuccess(true);

    // Reset form
    setTitle("");
    setCategory("");
    setSkills("");
    setQuota("");
    setDistrict("");
    setLocation("");
    setDate("");
    setDescription("");

    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#F0F1F3] flex justify-center items-start py-16 px-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl border border-[#CACDD3] p-8 md:p-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-[#111827] text-center">
          Post a Volunteer Task
        </h1>

        {success && (
          <div className="mb-6 p-4 text-green-800 bg-green-100 rounded-lg text-center font-medium">
            Task posted successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Task Title */}
          <input
            type="text"
            placeholder="Task Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-4 border border-[#CACDD3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46C8] focus:border-[#4F46C8] transition"
            required
          />

          {/* Category */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-4 border border-[#CACDD3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46C8] focus:border-[#4F46C8] transition"
            required
          >
            <option value="">Select Category</option>
            <option value="Education">Education</option>
            <option value="Health">Health</option>
            <option value="Environment">Environment</option>
          </select>

          {/* Skills */}
          <input
            type="text"
            placeholder="Skills (comma separated)"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            className="w-full p-4 border border-[#CACDD3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46C8] focus:border-[#4F46C8] transition"
          />

          {/* Quota */}
          <input
            type="number"
            placeholder="Volunteer Quota"
            value={quota}
            onChange={(e) => setQuota(e.target.value)}
            className="w-full p-4 border border-[#CACDD3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46C8] focus:border-[#4F46C8] transition"
            required
          />

          {/* District */}
          <input
            type="text"
            placeholder="District"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="w-full p-4 border border-[#CACDD3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46C8] focus:border-[#4F46C8] transition"
            required
          />

          {/* Location */}
          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full p-4 border border-[#CACDD3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46C8] focus:border-[#4F46C8] transition"
          />

          {/* Date */}
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-4 border border-[#CACDD3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46C8] focus:border-[#4F46C8] transition"
          />

          {/* Description */}
          <textarea
            placeholder="Task Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-4 border border-[#CACDD3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46C8] focus:border-[#4F46C8] transition min-h-[120px]"
          />

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-[#4F46C8] hover:bg-[#3b3aa5] text-white font-semibold py-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
          >
            Post Task
          </button>
        </form>
      </div>
    </div>
  );
}