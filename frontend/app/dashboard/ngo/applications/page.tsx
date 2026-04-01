"use client";

import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";

interface Applicant {
  id: number;
  name: string;
  initials: string;
  task: string;
  location: string;
  time: string;
  skills: string[];
  match: number;
  eligible: boolean;
  status: "pending" | "accepted" | "rejected";
}

export default function ApplicantPage() {
  const [applicants, setApplicants] = useState<Applicant[]>([
    {
      id: 1,
      name: "Ram Sharma",
      initials: "RS",
      task: "Earthquake Relief",
      location: "Gorkha",
      time: "2 hours ago",
      skills: ["First Aid", "Logistics"],
      match: 92,
      eligible: true,
      status: "pending",
    },
    {
      id: 2,
      name: "Sita Thapa",
      initials: "ST",
      task: "Health Camp",
      location: "Kathmandu",
      time: "5 hours ago",
      skills: ["Medical", "Counseling"],
      match: 88,
      eligible: true,
      status: "pending",
    },
    {
      id: 3,
      name: "Hari Gurung",
      initials: "HG",
      task: "School Renovation",
      location: "Pokhara",
      time: "1 day ago",
      skills: ["Construction"],
      match: 45,
      eligible: false,
      status: "pending",
    },
    {
      id: 4,
      name: "Maya Tamang",
      initials: "MT",
      task: "Earthquake Relief",
      location: "Gorkha",
      time: "1 day ago",
      skills: ["First Aid", "Communication"],
      match: 78,
      eligible: true,
      status: "pending",
    },
    {
      id: 5,
      name: "Anita Rai",
      initials: "AR",
      task: "Health Camp",
      location: "Kathmandu",
      time: "",
      skills: [],
      match: 0,
      eligible: true,
      status: "accepted",
    },
    {
      id: 6,
      name: "Dipak Shrestha",
      initials: "DS",
      task: "Earthquake Relief",
      location: "Gorkha",
      time: "",
      skills: [],
      match: 0,
      eligible: false,
      status: "rejected",
    },
  ]);

  const handleAction = (id: number, status: "accepted" | "rejected") => {
    setApplicants((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status } : a
      )
    );
  };

  const pending = applicants.filter((a) => a.status === "pending");
  const reviewed = applicants.filter((a) => a.status !== "pending");

  return (
    <div className="p-6 bg-[#F0F1F3] min-h-screen space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">Applicant List</h1>
        <p className="text-gray-500">
          Review volunteer applications, check eligibility, and accept or reject.
        </p>
      </div>

      {/* FILTERS */}
      <div className="flex gap-4">
        <select className="p-2 border rounded-md bg-white">
          <option>All Tasks</option>
        </select>

        <select className="p-2 border rounded-md bg-white">
          <option>All Status</option>
        </select>
      </div>

      {/* PENDING */}
      <div className="bg-white rounded-xl p-5 border space-y-4">
        <h2 className="text-lg font-semibold">
          Pending Applications ({pending.length})
        </h2>

        {pending.map((a) => (
          <div
            key={a.id}
            className="flex justify-between items-center border rounded-xl p-4"
          >
            {/* LEFT */}
            <div className="flex gap-4 items-center">

              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center font-bold">
                {a.initials}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{a.name}</h3>

                  <Badge className={a.eligible ? "bg-green-500 text-white" : "bg-red-500 text-white"}>
                    {a.eligible ? "Eligible" : "Not Eligible"}
                  </Badge>

                  <span className="text-sm text-gray-500">
                    Match: {a.match}%
                  </span>
                </div>

                <p className="text-sm text-gray-500">
                  {a.task} • {a.location} • {a.time}
                </p>

                <div className="flex gap-2 mt-2">
                  {a.skills.map((s) => (
                    <Badge key={s} className="bg-green-100 text-green-700">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="flex gap-2">

              <Button variant="outline">👁 View</Button>

              <Button
                onClick={() => handleAction(a.id, "accepted")}
                disabled={!a.eligible}
                className="bg-indigo-600 text-white"
              >
                ✔ Accept
              </Button>

              <Button
                onClick={() => handleAction(a.id, "rejected")}
                className="bg-red-500 text-white"
              >
                ✖ Reject
              </Button>

            </div>
          </div>
        ))}
      </div>

      {/* REVIEWED */}
      <div className="bg-white rounded-xl p-5 border space-y-4">
        <h2 className="text-lg font-semibold">
          Reviewed ({reviewed.length})
        </h2>

        {reviewed.map((a) => (
          <div
            key={a.id}
            className="flex justify-between items-center border rounded-xl p-4"
          >
            <div className="flex gap-4 items-center">

              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center font-bold">
                {a.initials}
              </div>

              <div>
                <h3 className="font-semibold">{a.name}</h3>
                <p className="text-sm text-gray-500">
                  {a.task} • {a.location}
                </p>
              </div>
            </div>

            <Badge
              className={
                a.status === "accepted"
                  ? "bg-green-500 text-white"
                  : "bg-red-500 text-white"
              }
            >
              {a.status === "accepted" ? "Accepted" : "Rejected"}
            </Badge>
          </div>
        ))}
      </div>

    </div>
  );
}
