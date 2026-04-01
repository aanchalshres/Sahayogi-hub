"use client";

import { useState } from "react";
import DashboardLayout from "@/app/components/DashboardLayout";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Badge } from "@/app/components/ui/badge";
import { Avatar, AvatarFallback } from "@/app/components/ui/avatar";

const allSkills: string[] = [
  "First Aid",
  "Medical",
  "Logistics",
  "Construction",
  "Teaching",
  "IT",
  "Translation",
  "Driving",
  "Swimming",
  "Communication",
];

const Profile = () => {
  const [skills, setSkills] = useState<string[]>([
    "First Aid",
    "Medical",
    "Logistics",
  ]);

  const toggleSkill = (skill: string) => {
    setSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : [...prev, skill]
    );
  };

  return (
    <DashboardLayout role="volunteer">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">
            Profile Settings
          </h1>
          <p className="text-[#6B7280] text-sm">
            Manage your personal information and skills
          </p>
        </div>

        {/* MAIN CARD */}
        <Card className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm">
          <CardContent className="p-6 space-y-6">

            {/* AVATAR SECTION */}
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-[#4F46C8] text-white text-2xl">
                    RS
                  </AvatarFallback>
                </Avatar>

                <div>
                  <h2 className="font-semibold text-[#111827]">
                    Ram Sharma
                  </h2>
                  <p className="text-sm text-[#6B7280]">
                    Volunteer
                  </p>
                </div>
              </div>

              <Button variant="outline" size="sm">
                Change Photo
              </Button>
            </div>

            {/* FORM */}
            <div className="grid gap-5 sm:grid-cols-2">

              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  className="bg-white"
                  defaultValue="Ram Sharma"
                />
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  className="bg-white"
                  defaultValue="ram@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  className="bg-white"
                  defaultValue="Kathmandu, Nepal"
                />
              </div>

              <div className="space-y-2">
                <Label>Availability</Label>
                <Input
                  className="bg-white"
                  defaultValue="Weekends"
                />
              </div>

            </div>

            {/* SKILLS */}
            <div className="space-y-3">
              <Label>Skills</Label>

              <div className="flex flex-wrap gap-2">
                {allSkills.map((skill) => {
                  const selected = skills.includes(skill);

                  return (
                    <span
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className={`px-3 py-1.5 rounded-full text-sm cursor-pointer border transition ${
                        selected
                          ? "bg-[#4F46C8] text-white border-[#4F46C8]"
                          : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      {skill}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* SAVE BUTTON */}
            <div className="pt-4 border-t flex justify-end">
              <Button className="bg-[#4F46C8] hover:bg-[#3f3db5] text-white px-6">
                Save Changes
              </Button>
            </div>

          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Profile;