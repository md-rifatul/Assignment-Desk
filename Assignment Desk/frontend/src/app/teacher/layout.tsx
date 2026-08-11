"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && (!user || user.role !== "Teacher")) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== "Teacher") {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <div className="btn-spinner" style={{ width: "40px", height: "40px" }}></div>
      </div>
    );
  }

  const isActive = (path: string) => pathname === path || pathname?.startsWith(path + "/");

  return (
    <div className="dashboard-layout teacher-theme">
      {/* Sidebar Navigation */}
      <aside style={{ width: "260px", background: "#ffffff", borderRight: "1px solid var(--border-color)", padding: "24px", display: "flex", flexDirection: "column" }}>
        <div style={{ marginBottom: "32px", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ background: "rgba(79, 70, 229, 0.1)", color: "var(--primary)", padding: "8px", borderRadius: "10px", display: "flex" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
            </svg>
          </div>
          <div>
            <h2 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", margin: 0 }}>Teacher Desk</h2>
            <p style={{ fontSize: "11px", color: "var(--text-secondary)", margin: 0 }}>Logged in as {user.fullName}</p>
          </div>
        </div>
        
        <nav style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
          <Link 
            href="/teacher/dashboard" 
            className={isActive("/teacher/dashboard") && pathname === "/teacher/dashboard" ? "active-link" : ""}
            style={{ padding: "12px 16px", borderRadius: "var(--radius-md)", textDecoration: "none", fontSize: "14px", display: "flex", alignItems: "center", gap: "10px" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Dashboard
          </Link>
          <Link 
            href="/teacher/assignments" 
            className={isActive("/teacher/assignments") ? "active-link" : ""}
            style={{ padding: "12px 16px", borderRadius: "var(--radius-md)", textDecoration: "none", fontSize: "14px", display: "flex", alignItems: "center", gap: "10px" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            Manage Assignments
          </Link>
          <Link 
            href="/teacher/submissions" 
            className={isActive("/teacher/submissions") ? "active-link" : ""}
            style={{ padding: "12px 16px", borderRadius: "var(--radius-md)", textDecoration: "none", fontSize: "14px", display: "flex", alignItems: "center", gap: "10px" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
            </svg>
            Grading & Submissions
          </Link>
        </nav>
        
        <button 
          className="btn" 
          style={{ background: "rgba(239,68,68,0.05)", color: "var(--danger)", padding: "12px", border: "1px solid rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", borderRadius: "var(--radius-md)" }} 
          onClick={logout}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Log Out
        </button>
      </aside>
      
      {/* Main Content */}
      <main style={{ flex: 1, padding: "40px", overflowY: "auto", display: "flex", flexDirection: "column" }}>
        {children}
      </main>
    </div>
  );
}
