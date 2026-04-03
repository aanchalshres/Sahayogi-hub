"use client";

import { useEffect, useState } from "react";
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
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [selected, setSelected] = useState<Applicant | null>(null);

  // LOAD DATA
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("applications") || "[]");

    const formatted: Applicant[] = stored.map((app: any, index: number) => {
      const initials = app.name
        ?.split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase();

      const match = app.skills?.length
        ? Math.min(100, app.skills.length * 20)
        : 40;

      return {
        id: index + 1,
        name: app.name,
        initials,
        task: app.taskTitle,
        location: app.location,
        time: new Date(app.appliedAt).toLocaleString(),
        skills: app.skills || [],
        match,
        eligible: match >= 50,
        status: "pending",
      };
    });

    const saved = JSON.parse(localStorage.getItem("applicantsStatus") || "null");

    setApplicants(saved || formatted);
  }, []);

  // SAVE STATUS
  const updateStatus = (id: number, status: "accepted" | "rejected") => {
    setApplicants((prev) => {
      const updated = prev.map((a) =>
        a.id === id ? { ...a, status } : a
      );

      localStorage.setItem("applicantsStatus", JSON.stringify(updated));
      return updated;
    });

    // close modal if open
    if (selected?.id === id) {
      setSelected(null);
    }
  };

  const pending = applicants.filter((a) => a.status === "pending");
  const reviewed = applicants.filter((a) => a.status !== "pending");

  return (
    <div className="p-6 bg-[#F0F1F3] min-h-screen space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">Applicant List</h1>
        <p className="text-gray-500">
          Review volunteer applications, check eligibility, and take action.
        </p>
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
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex gap-2">
              <Button onClick={() => setSelected(a)} variant="outline">
                👁 View
              </Button>

              <Button
                onClick={() => updateStatus(a.id, "accepted")}
                disabled={!a.eligible}
                className="bg-indigo-600 text-white"
              >
                ✔ Accept
              </Button>

              <Button
                onClick={() => updateStatus(a.id, "rejected")}
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
              {a.status.toUpperCase()}
            </Badge>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-125 p-6 rounded-xl space-y-4">

            <h2 className="text-xl font-bold">{selected.name}</h2>

            <p><b>Task:</b> {selected.task}</p>
            <p><b>Location:</b> {selected.location}</p>
            <p><b>Applied:</b> {selected.time}</p>
            <p><b>Match:</b> {selected.match}%</p>

            <div className="flex gap-2 flex-wrap">
              {selected.skills.map((s) => (
                <Badge key={s} className="bg-green-100 text-green-700">
                  {s}
                </Badge>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setSelected(null)}>
                Close
              </Button>

              <Button
                onClick={() => updateStatus(selected.id, "accepted")}
                className="bg-indigo-600 text-white"
                disabled={!selected.eligible}
              >
                Accept
              </Button>

              <Button
                onClick={() => updateStatus(selected.id, "rejected")}
                className="bg-red-500 text-white"
              >
                Reject
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}