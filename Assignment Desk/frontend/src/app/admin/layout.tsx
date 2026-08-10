"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== "Admin")) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== "Admin") {
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
          <h2 style={{ fontSize: "20px", fontWeight: "700" }}>Admin Desk</h2>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Logged as {user.fullName}</p>
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
          <Link href="/admin/dashboard" style={{ padding: "12px", borderRadius: "var(--radius-sm)", color: "var(--text-primary)", fontWeight: "500" }}>Dashboard</Link>
          <Link href="/admin/users" style={{ padding: "12px", borderRadius: "var(--radius-sm)", color: "var(--text-secondary)" }}>Manage Users</Link>
          <Link href="/admin/classes" style={{ padding: "12px", borderRadius: "var(--radius-sm)", color: "var(--text-secondary)" }}>Manage Classes</Link>
          <Link href="/admin/subjects" style={{ padding: "12px", borderRadius: "var(--radius-sm)", color: "var(--text-secondary)" }}>Manage Subjects</Link>
          <Link href="/admin/student-classes" style={{ padding: "12px", borderRadius: "var(--radius-sm)", color: "var(--text-secondary)" }}>Student Classes</Link>
          <Link href="/admin/teacher-subjects" style={{ padding: "12px", borderRadius: "var(--radius-sm)", color: "var(--text-secondary)" }}>Teacher Subjects</Link>
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
