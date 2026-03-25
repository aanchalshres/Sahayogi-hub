"use client";

import Navbar from "@/app/components/Navbar";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import Link from "next/link";
import { User, Building2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

const Signup = () => {
  const router = useRouter();

  const [role, setRole] = useState<"volunteer" | "organization" | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Volunteer
  const [location, setLocation] = useState("");

  // NGO Fields
  const [regNo, setRegNo] = useState("");
  const [panNo, setPanNo] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  // Files
  const [regFile, setRegFile] = useState<File | null>(null);
  const [panFile, setPanFile] = useState<File | null>(null);
  const [letterhead, setLetterhead] = useState<File | null>(null);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !name ||
      !email ||
      !password ||
      (role === "volunteer" && !location) ||
      (role === "organization" &&
        (!regNo || !panNo || !address || !phone || !regFile || !panFile))
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (role === "organization" && panNo.length !== 9) {
      setError("PAN number must be 9 digits.");
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
        ...(role === "organization" && {
          regNo,
          panNo,
          address,
          phone,
          // ⚠️ Files stored as name only (since localStorage can't store files)
          regFile: regFile?.name,
          panFile: panFile?.name,
          letterhead: letterhead?.name,
        }),
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
          
          {/* HEADER */}
          <CardHeader className="text-center space-y-3">
            <div className="flex justify-center">
              <img src="/logo1.png" alt="Logo" className="h-20 w-20 object-contain" />
            </div>

            <CardTitle className="text-2xl font-bold text-[#111827]">
              Create Account
            </CardTitle>

            <p className="text-sm text-[#6B7280]">
              Join Sahayogi and start making an impact
            </p>
          </CardHeader>

          {/* BODY */}
          <CardContent className="space-y-4">

            {/* ROLE SELECT */}
            {!role ? (
              <div className="space-y-3">
                <p className="text-sm font-medium text-center text-[#111827]">
                  I want to join as:
                </p>

                <button
                  onClick={() => setRole("volunteer")}
                  className="flex w-full items-center gap-4 rounded-xl border-2 border-[#CACDD3] p-4 hover:border-[#4F46C8] hover:bg-[#4F46C8]/10"
                >
                  <User className="text-[#4F46C8]" />
                  <div>
                    <p className="font-semibold">Volunteer</p>
                    <p className="text-sm text-gray-500">
                      Find opportunities and make a difference
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => setRole("organization")}
                  className="flex w-full items-center gap-4 rounded-xl border-2 border-[#CACDD3] p-4 hover:border-[#7683D6] hover:bg-[#7683D6]/10"
                >
                  <Building2 className="text-[#7683D6]" />
                  <div>
                    <p className="font-semibold">Organization (NGO)</p>
                    <p className="text-sm text-gray-500">
                      Post opportunities and find volunteers
                    </p>
                  </div>
                </button>
              </div>
            ) : (

              /* FORM */
              <form onSubmit={handleSubmit} className="space-y-4">

                <button
                  type="button"
                  onClick={() => setRole(null)}
                  className="text-sm text-[#4F46C8] hover:underline"
                >
                  ← Change role
                </button>

                {/* NAME */}
                <div>
                  <Label>{role === "organization" ? "Organization Name" : "Full Name"}</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                {/* EMAIL */}
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {/* NGO FIELDS */}
                {role === "organization" && (
                  <>
                    <div>
                      <Label>Registration No.</Label>
                      <Input value={regNo} onChange={(e) => setRegNo(e.target.value)} required />
                    </div>

                    <div>
                      <Label>PAN No.</Label>
                      <Input value={panNo} onChange={(e) => setPanNo(e.target.value)} required />
                    </div>

                    <div>
                      <Label>Address</Label>
                      <Input value={address} onChange={(e) => setAddress(e.target.value)} required />
                    </div>

                    <div>
                      <Label>Phone</Label>
                      <Input value={phone} onChange={(e) => setPhone(e.target.value)} required />
                    </div>

                    <div>
                      <Label>Registration Certificate</Label>
                      <Input type="file" onChange={(e) => setRegFile(e.target.files?.[0] || null)} required />
                    </div>

                    <div>
                      <Label>PAN Certificate</Label>
                      <Input type="file" onChange={(e) => setPanFile(e.target.files?.[0] || null)} required />
                    </div>

                    <div>
                      <Label>Letterhead (Optional)</Label>
                      <Input type="file" onChange={(e) => setLetterhead(e.target.files?.[0] || null)} />
                    </div>

                    <p className="text-xs text-gray-500">
                      Upload clear documents for verification
                    </p>
                  </>
                )}

                {/* VOLUNTEER */}
                {role === "volunteer" && (
                  <div>
                    <Label>Location</Label>
                    <Input value={location} onChange={(e) => setLocation(e.target.value)} required />
                  </div>
                )}

                {/* PASSWORD */}
                <div>
                  <Label>Password</Label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <Button
  type="submit"
  className="w-full bg-[#4F46C8] hover:bg-[#4338CA] text-white rounded-full transition-all duration-200"
  disabled={loading}
>
  {loading ? "Creating..." : "Create Account"}
</Button>
              </form>
            )}

            {/* FOOTER */}
            <div className="border-t pt-4">
              <p className="text-center text-sm">
                Already have an account?{" "}
                <Link href="/login" className="text-blue-600">
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