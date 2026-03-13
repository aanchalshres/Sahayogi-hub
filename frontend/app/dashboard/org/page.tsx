"use client";

import { useState } from "react";
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
    <>
      <Navbar />
      <div className="min-h-screen bg-[#F0F1F3] flex justify-center items-center p-10 py-12 md:py-12">
        <div className="max-w-2xl w-full bg-white p-8 rounded-lg border border-[#CACDD3] shadow">
        <h1 className="text-3xl font-bold mb-6 text-[#111827]">
          Post Volunteer Task
        </h1>

        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
            Task posted successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            type="text"
            placeholder="Task Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 border border-[#CACDD3] rounded"
            required
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-3 border border-[#CACDD3] rounded"
            required
          >
            <option value="">Select Category</option>
            <option value="Education">Education</option>
            <option value="Health">Health</option>
            <option value="Environment">Environment</option>
          </select>

          <input
            type="text"
            placeholder="Skills (comma separated)"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            className="w-full p-3 border border-[#CACDD3] rounded"
          />

          <input
            type="number"
            placeholder="Volunteer Quota"
            value={quota}
            onChange={(e) => setQuota(e.target.value)}
            className="w-full p-3 border border-[#CACDD3] rounded"
            required
          />

          <input
            type="text"
            placeholder="District"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="w-full p-3 border border-[#CACDD3] rounded"
            required
          />

          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full p-3 border border-[#CACDD3] rounded"
          />

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-3 border border-[#CACDD3] rounded"
          />

          <textarea
            placeholder="Task Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 border border-[#CACDD3] rounded"
          />

          <button className="bg-[#4F46C8] text-white px-6 py-3 rounded w-full">
            Post Task
          </button>

        </form>
      </div>
    </div>
    <Footer />
    </>
  );
}
