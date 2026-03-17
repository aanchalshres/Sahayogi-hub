"use client";

import Navbar from "@/app/components/Navbar";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

const Login = () => {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      localStorage.setItem(
        "user",
        JSON.stringify({
          email,
        })
      );

      router.push("/dashboard");
    } catch (err) {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
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
              Welcome Back
            </CardTitle>

            <p className="text-sm text-[#6B7280]">
              Sign in to your Sahayogi account
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">

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
                className="w-full bg-[#4F46C8] hover:bg-[#3f37c9] text-white rounded-full"
                size="lg"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Log In"}
              </Button>
            </form>

            <div className="mt-6 border-t border-[#B9C0D4] pt-4">
              <p className="text-center text-sm text-[#6B7280]">
                Don't have an account?{" "}
                <Link
                  href="/signup"
                  className="font-medium text-[#4F46C8] hover:underline"
                >
                  Sign up
                </Link>
              </p>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;