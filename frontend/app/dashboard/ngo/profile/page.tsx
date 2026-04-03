"use client";

import { useState, useRef, useEffect } from "react";
import DashboardLayout from "@/app/components/DashboardLayout";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";

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
  // FORM STATE (REAL FUNCTIONAL)
  const [form, setForm] = useState({
    name: "Ram Sharma",
    email: "ram@example.com",
    location: "Kathmandu, Nepal",
    availability: "Weekends",
  });

  const [skills, setSkills] = useState<string[]>([
    "First Aid",
    "Medical",
    "Logistics",
  ]);

  const [profileImage, setProfileImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // LOAD FROM LOCALSTORAGE
  useEffect(() => {
    const saved = localStorage.getItem("volunteerProfile");
    if (saved) {
      const data = JSON.parse(saved);
      setForm(data.form);
      setSkills(data.skills);
      setProfileImage(data.profileImage);
    }
  }, []);

  // HANDLE INPUT CHANGE
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // TOGGLE SKILLS
  const toggleSkill = (skill: string) => {
    setSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : [...prev, skill]
    );
  };

  // IMAGE UPLOAD
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setProfileImage(imageUrl);
  };

  // SAVE PROFILE
  const handleSave = () => {
    const data = {
      form,
      skills,
      profileImage,
    };

    localStorage.setItem("volunteerProfile", JSON.stringify(data));
    alert("Profile saved successfully ✅");
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

            {/* AVATAR */}
            <div className="flex items-center justify-between border-b pb-4">

              <div className="flex items-center gap-4">

                <Avatar className="h-20 w-20">
                  {profileImage ? (
                    <AvatarImage src={profileImage} />
                  ) : (
                    <AvatarFallback className="bg-[#4F46C8] text-white text-2xl">
                      {form.name.charAt(0)}
                    </AvatarFallback>
                  )}
                </Avatar>

                <div>
                  <h2 className="font-semibold text-[#111827]">
                    {form.name}
                  </h2>
                  <p className="text-sm text-[#6B7280]">
                    Volunteer
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                Change Photo
              </Button>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>

            {/* FORM */}
            <div className="grid gap-5 sm:grid-cols-2">

              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label>Availability</Label>
                <Input
                  name="availability"
                  value={form.availability}
                  onChange={handleChange}
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

            {/* SAVE */}
            <div className="pt-4 border-t flex justify-end">
              <Button
                onClick={handleSave}
                className="bg-[#4F46C8] hover:bg-[#3f3db5] text-white px-6"
              >
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