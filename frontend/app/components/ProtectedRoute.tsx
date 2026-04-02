// app/components/ProtectedRoute.tsx

"use client";

import { useAuth } from "@/app/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("volunteer" | "ngo" | "admin")[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle redirects in a separate effect (not during render)
  useEffect(() => {
    if (!mounted || isLoading) return;

    // Check if user is authenticated
    if (!isAuthenticated) {
      console.log('ProtectedRoute: Not authenticated, redirecting to login');
      router.push("/login");
      return;
    }

    // Check if user has required role
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      console.log('ProtectedRoute: Role not allowed, redirecting to unauthorized');
      router.push("/unauthorized");
      return;
    }

    console.log('ProtectedRoute: Auth check passed');
  }, [mounted, isLoading, isAuthenticated, user, allowedRoles, router]);

  console.log('ProtectedRoute render:', { mounted, isLoading, isAuthenticated, userRole: user?.role });

  // Wait for context to finish loading
  if (!mounted || isLoading) {
    console.log('ProtectedRoute: Showing spinner');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4F46C8]"></div>
      </div>
    );
  }

  // If not authenticated, don't render yet (redirect will happen via effect)
  if (!isAuthenticated) {
    return null;
  }

  // If role check fails, don't render yet (redirect will happen via effect)
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return null;
  }

  console.log('ProtectedRoute: Rendering children');
  return <>{children}</>;
}
