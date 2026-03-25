"use client";

import DashboardLayout from "@/app/components/DashboardLayout";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Badge } from "@/app/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { useState } from "react";
import { useToast } from "@/app/hooks/use-toast";
import { CheckCircle } from "lucide-react";

const skillOptions = [
  "First Aid", "Medical", "Logistics", "Construction", "Teaching",
  "IT", "Translation", "Driving", "Swimming", "Communication",
  "Cooking", "Counseling", "Photography", "Gardening", "Painting",
];

const categoryOptions = [
  "Emergency", "Health", "Education", "Environment", "Infrastructure",
  "Community", "Disaster Relief", "Technology", "Social Welfare",
];

const districtOptions = [
  "Kathmandu", "Lalitpur", "Bhaktapur", "Pokhara", "Gorkha",
  "Chitwan", "Morang", "Sunsari", "Kaski", "Rupandehi",
  "Jhapa", "Makwanpur", "Parsa", "Bara", "Dhanusha",
  "Kailali", "Banke", "Surkhet", "Dang", "Palpa",
];

const CreateOpportunity: React.FC = () => {
  const { toast } = useToast();
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [isEmergency, setIsEmergency] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [district, setDistrict] = useState("");
  const [quota, setQuota] = useState("");

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast({ title: "Validation Error", description: "Title is required.", variant: "destructive" });
      return;
    }
    if (!category) {
      toast({ title: "Validation Error", description: "Please select a category.", variant: "destructive" });
      return;
    }
    if (!district) {
      toast({ title: "Validation Error", description: "Please select a district.", variant: "destructive" });
      return;
    }
    if (!quota || Number(quota) <= 0) {
      toast({ title: "Validation Error", description: "Quota must be a positive number.", variant: "destructive" });
      return;
    }
    if (selectedSkills.length === 0) {
      toast({ title: "Validation Error", description: "Select at least one skill.", variant: "destructive" });
      return;
    }

    toast({
      title: "Task Created!",
      description: `"${title}" has been posted successfully.`,
    });

    // Reset form
    setTitle("");
    setDescription("");
    setCategory("");
    setDistrict("");
    setQuota("");
    setSelectedSkills([]);
    setIsEmergency(false);
  };

  return (
    <DashboardLayout role="organization">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Post New Task</h1>
          <p className="text-[#6B7280]">Create a volunteer opportunity for your organization.</p>
        </div>

        {/* Form Card */}
        <Card className="bg-[#B9C0D4] border border-[#CACDD3]">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-[#111827]">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="e.g., Community Health Camp"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                  className="border-[#CACDD3] text-[#111827]"
                />
              </div>

              {/* Category & District */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-[#111827]">Category <span className="text-destructive">*</span></Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="border-[#CACDD3] text-[#111827]">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-[#111827]">District <span className="text-destructive">*</span></Label>
                  <Select value={district} onValueChange={setDistrict}>
                    <SelectTrigger className="border-[#CACDD3] text-[#111827]">
                      <SelectValue placeholder="Select district" />
                    </SelectTrigger>
                    <SelectContent>
                      {districtOptions.map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Quota */}
              <div className="space-y-2">
                <Label htmlFor="quota" className="text-[#111827]">Volunteer Quota <span className="text-destructive">*</span></Label>
                <Input
                  id="quota"
                  type="number"
                  placeholder="e.g., 20"
                  min={1}
                  max={1000}
                  value={quota}
                  onChange={(e) => setQuota(e.target.value)}
                  className="border-[#CACDD3] text-[#111827]"
                />
              </div>

              {/* Skills */}
              <div className="space-y-2">
                <Label className="text-[#111827]">Required Skills <span className="text-destructive">*</span></Label>
                <div className="flex flex-wrap gap-2">
                  {skillOptions.map((skill) => (
                    <Badge
                      key={skill}
                      variant={selectedSkills.includes(skill) ? "default" : "outline"}
                      className="cursor-pointer select-none transition-colors text-[#111827] border-[#CACDD3]"
                      onClick={() => toggleSkill(skill)}
                    >
                      {selectedSkills.includes(skill) && <CheckCircle className="mr-1 h-3 w-3" />}
                      {skill}
                    </Badge>
                  ))}
                </div>
                {selectedSkills.length > 0 && (
                  <p className="text-xs text-[#6B7280]">{selectedSkills.length} skill(s) selected</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-[#111827]">Description</Label>
                <Textarea
                  id="description"
                  rows={4}
                  placeholder="Describe the task, requirements, and expectations..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={1000}
                  className="border-[#CACDD3] text-[#111827]"
                />
                <p className="text-xs text-[#6B7280] text-right">{description.length}/1000</p>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label className="text-[#111827]">Priority</Label>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant={!isEmergency ? "default" : "outline"}
                    size="sm"
                    className={`bg-[#4F46C8] text-white ${!isEmergency ? "" : "bg-[#F0F1F3] text-[#111827]"}`}
                    onClick={() => setIsEmergency(false)}
                  >
                    Regular
                  </Button>
                  <Button
                    type="button"
                    variant={isEmergency ? "emergency" : "outline"}
                    size="sm"
                    className={`bg-[#7683D6] text-white ${isEmergency ? "" : "bg-[#F0F1F3] text-[#111827]"}`}
                    onClick={() => setIsEmergency(true)}
                  >
                    🚨 Emergency
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full bg-[#4F46C8] hover:bg-[#3b3aa5] text-white" size="lg">
                Post Task
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CreateOpportunity;