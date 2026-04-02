"use client";

import { ProtectedRoute } from "@/app/components/ProtectedRoute";

export default function VolunteerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["volunteer"]}>
      {children}
    </ProtectedRoute>
  );
}
