"use client";

import Link from "next/link";
import { Bell, User } from "lucide-react";
import { useState } from "react";

const OrgNavbar = () => {
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <div className="flex-1 flex flex-col">
      {/* NAVBAR */}
      <div className="h-16 flex items-center justify-end px-4 bg-[#F0F1F3] border-b border-[#CACDD3]">

        {/* RIGHT SIDE: Notification + Profile */}
        <div className="flex items-center gap-4 relative">

          {/* Notification Icon */}
          <button className="relative p-2 rounded-full hover:bg-gray-200 transition">
            <Bell className="h-6 w-6 text-gray-700" />
            {/* Notification Badge */}
            <span className="absolute top-0 right-0 inline-block w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Profile Icon */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="p-2 rounded-full hover:bg-gray-200 transition"
            >
              <User className="h-6 w-6 text-gray-700" />
            </button>

            {/* DROPDOWN MENU */}
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow-lg py-1 z-50">
                <Link
                  href="/dashboard/org"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setProfileOpen(false)}
                >
                  Dashboard
                </Link>

                <button
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => {
                    setProfileOpen(false);
                    alert("Logged out"); // Replace with actual logout
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default OrgNavbar;