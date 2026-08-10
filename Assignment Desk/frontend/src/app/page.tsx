"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Redirect to dashboard corresponding to role
        if (user.role === "Admin") {
          router.push("/admin/dashboard");
        } else if (user.role === "Teacher") {
          router.push("/teacher/dashboard");
        } else if (user.role === "Student") {
          router.push("/student/dashboard");
        }
      } else {
        router.push("/login");
      }
    }
  }, [user, loading, router]);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
      <div className="btn-spinner" style={{ width: "40px", height: "40px" }}></div>
    </div>
  );
}
