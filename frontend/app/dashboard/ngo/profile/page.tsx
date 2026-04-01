"use client";

import { useState } from "react";
import DashboardLayout from "@/app/components/DashboardLayout";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/app/components/ui/avatar";

const OrgProfile = () => {
  const [formData, setFormData] = useState({
    orgName: "Sahayogi Nepal",
    email: "contact@sahayogi.org",
    location: "Kathmandu, Nepal",
    phone: "+977-1-4123456",
    website: "www.sahayogi.org",
    description: "A non-profit organization dedicated to community development.",
    registrationNumber: "NPO-2024-001",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    // Save logic
    localStorage.setItem("orgProfile", JSON.stringify(formData));
    alert("Organization profile updated successfully!");
  };

  return (
    <DashboardLayout role="organization">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">
            Organization Profile
          </h1>
          <p className="text-[#6B7280] text-sm">
            Manage your organization settings and information
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
                    SN
                  </AvatarFallback>
                </Avatar>

                <div>
                  <h2 className="font-semibold text-[#111827]">
                    {formData.orgName}
                  </h2>
                  <p className="text-sm text-[#6B7280]">
                    Non-Profit Organization
                  </p>
                </div>
              </div>

              <Button variant="outline" size="sm">
                Change Logo
              </Button>
            </div>

            {/* FORM */}
            <div className="space-y-5">

              <div className="space-y-2">
                <Label>Organization Name</Label>
                <Input
                  className="bg-white"
                  name="orgName"
                  value={formData.orgName}
                  onChange={handleChange}
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    className="bg-white"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    className="bg-white"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    className="bg-white"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Website</Label>
                  <Input
                    className="bg-white"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Registration Number</Label>
                  <Input
                    className="bg-white"
                    name="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={handleChange}
                    disabled
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Organization Description</Label>
                <Textarea
                  className="bg-white"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Tell us about your organization..."
                  rows={4}
                />
              </div>

            </div>

            {/* SAVE BUTTON */}
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

export default OrgProfile;
