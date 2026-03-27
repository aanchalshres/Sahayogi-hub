"use client";

import { useState } from "react";
import DashboardLayout from "@/app/components/DashboardLayout";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Badge } from "@/app/components/ui/badge";
import { Avatar, AvatarFallback } from "@/app/components/ui/avatar";

// Skill list (typed automatically as string[])
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
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold">Profile Settings</h1>

        <Card className="card-elevated">
          <CardContent className="space-y-6 p-6">
            
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  RS
                </AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm">
                Change Photo
              </Button>
            </div>

            {/* Form */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" defaultValue="Ram Sharma" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="ram@example.com" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" defaultValue="Kathmandu, Nepal" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="availability">Availability</Label>
                <Input id="availability" defaultValue="Weekends" />
              </div>
            </div>

            {/* Skills */}
            <div className="space-y-2">
              <Label>Skills</Label>
              <div className="flex flex-wrap gap-2">
                {allSkills.map((skill: string) => (
                  <Badge
                    key={skill}
                    variant={skills.includes(skill) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleSkill(skill)}
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <Button size="lg" className="w-full">
              Save Changes
            </Button>

          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Profile;