import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { AlertTriangle } from "lucide-react";
import Navbar from "@/app/components/Navbar";

export default function Unauthorized() {
  return (
    <div className="min-h-screen bg-[#F0F1F3]">
      <Navbar />
      
      <div className="container mx-auto flex items-center justify-center py-20 px-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="flex justify-center">
            <AlertTriangle className="w-16 h-16 text-red-500" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-[#111827]">Access Denied</h1>
            <p className="text-[#6B7280]">
              You don't have permission to access this page.
            </p>
          </div>

          <div className="space-y-3 pt-4">
            <Link href="/">
              <Button className="w-full bg-[#4F46C8] hover:bg-[#3c3a9f]">
                Go to Home
              </Button>
            </Link>
            
            <Link href="/login">
              <Button variant="outline" className="w-full">
                Login with Different Account
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
