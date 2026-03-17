"use client";

import Navbar from "@/app/components/Navbar";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import Link from "next/link";
import { Heart, User, Building2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

const Signup = () => {
  const router = useRouter();

  const [role, setRole] = useState<"volunteer" | "organization" | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password || (role === "volunteer" && !location)) {
      setError("Please fill in all required fields.");
      return;
    }

    setError("");
    setLoading(true);

    setTimeout(() => {
      const userData = {
        role,
        name,
        email,
        password,
        ...(role === "volunteer" && { location }),
      };

      let users = JSON.parse(localStorage.getItem("users") || "[]");
      users.push(userData);
      localStorage.setItem("users", JSON.stringify(users));

      setLoading(false);

      if (role === "volunteer") {
        router.push("/dashboard");
      } else {
        router.push("/dashboard/org");
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#F0F1F3]">
      <Navbar />

      <div className="container mx-auto flex items-center justify-center py-20 px-4">

        <Card className="w-full max-w-md shadow-xl border border-[#CACDD3] rounded-xl bg-white">

          <CardHeader className="text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#4F46C8]">
              <Heart className="h-6 w-6 text-white" />
            </div>

            <CardTitle className="text-2xl font-bold text-[#111827]">
              Create Account
            </CardTitle>

            <p className="text-sm text-[#6B7280]">
              Join Sahayogi and start making an impact
            </p>
          </CardHeader>

          <CardContent className="space-y-4">

            {!role ? (
              <div className="space-y-3">

                <p className="text-sm font-medium text-center text-[#111827]">
                  I want to join as:
                </p>

                {/* Volunteer */}
                <button
                  onClick={() => setRole("volunteer")}
                  className="flex w-full items-center gap-4 rounded-xl border-2 border-[#CACDD3] p-4 text-left hover:border-[#4F46C8] hover:bg-[#4F46C8]/10 transition-colors"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#4F46C8]/10">
                    <User className="h-5 w-5 text-[#4F46C8]" />
                  </div>

                  <div>
                    <p className="font-semibold text-[#111827]">Volunteer</p>
                    <p className="text-sm text-[#6B7280]">
                      Find opportunities and make a difference
                    </p>
                  </div>
                </button>

                {/* Organization */}
                <button
                  onClick={() => setRole("organization")}
                  className="flex w-full items-center gap-4 rounded-xl border-2 border-[#CACDD3] p-4 text-left hover:border-[#7683D6] hover:bg-[#7683D6]/10 transition-colors"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#7683D6]/10">
                    <Building2 className="h-5 w-5 text-[#7683D6]" />
                  </div>

                  <div>
                    <p className="font-semibold text-[#111827]">Organization</p>
                    <p className="text-sm text-[#6B7280]">
                      Post opportunities and find volunteers
                    </p>
                  </div>
                </button>

              </div>
            ) : (

              <form onSubmit={handleSubmit} className="space-y-4">

                <button
                  type="button"
                  onClick={() => setRole(null)}
                  className="text-sm text-[#4F46C8] hover:underline"
                >
                  ← Change role
                </button>

                <div className="space-y-2">
                  <Label htmlFor="name" className="text-[#111827]">
                    {role === "organization" ? "Organization Name" : "Full Name"}
                  </Label>

                  <Input
                    id="name"
                    placeholder={role === "organization" ? "NGO Nepal" : "Ram Sharma"}
                    className="border-[#CACDD3] focus-visible:ring-[#4F46C8]"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[#111827]">
                    Email
                  </Label>

                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="border-[#CACDD3] focus-visible:ring-[#4F46C8]"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {role === "volunteer" && (
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-[#111827]">
                      Location
                    </Label>

                    <Input
                      id="location"
                      placeholder="Kathmandu, Nepal"
                      className="border-[#CACDD3] focus-visible:ring-[#4F46C8]"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[#111827]">
                    Password
                  </Label>

                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="border-[#CACDD3] focus-visible:ring-[#4F46C8]"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-500">{error}</p>
                )}

                <Button
                  type="submit"
                  className="w-full bg-[#4F46C8] hover:bg-[#4338CA] text-white rounded-full"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </Button>

              </form>
            )}

            <div className="border-t border-[#B9C0D4] pt-4">
              <p className="text-center text-sm text-[#6B7280]">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-medium text-[#4F46C8] hover:underline"
                >
                  Login
                </Link>
              </p>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Signup;