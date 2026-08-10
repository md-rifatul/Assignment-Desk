"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== "Student")) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== "Student") {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <div className="btn-spinner" style={{ width: "40px", height: "40px" }}></div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      {/* Sidebar Navigation */}
      <aside style={{ width: "260px", background: "rgba(15, 23, 42, 0.95)", borderRight: "1px solid var(--border-color)", padding: "24px", display: "flex", flexDirection: "column" }}>
        <div style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "700" }}>Student Desk</h2>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Logged as {user.fullName}</p>
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
          <Link href="/student/dashboard" style={{ padding: "12px", borderRadius: "var(--radius-sm)", color: "var(--text-primary)", fontWeight: "500" }}>Dashboard</Link>
          <Link href="/student/assignments" style={{ padding: "12px", borderRadius: "var(--radius-sm)", color: "var(--text-secondary)" }}>Class Assignments</Link>
          <Link href="/student/submissions" style={{ padding: "12px", borderRadius: "var(--radius-sm)", color: "var(--text-secondary)" }}>My Submissions</Link>
        </nav>
        <button className="btn" style={{ background: "var(--danger-bg)", color: "var(--danger)" }} onClick={logout}>
          Log Out
        </button>
      </aside>
      
      {/* Main Content */}
      <main style={{ flex: 1, padding: "40px", overflowY: "auto" }}>
        {children}
      </main>
    </div>
  );
}
