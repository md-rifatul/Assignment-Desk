"use client";

import React, { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { StudentDashboardDto } from "@/types";

export default function StudentDashboardPage() {
  const [stats, setStats] = useState<StudentDashboardDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<StudentDashboardDto>("/api/dashboard/student");
      setStats(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load dashboard statistics.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div>
        <h1 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "8px" }}>Student Dashboard</h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: "32px" }}>Overview of courses, active assignments, and grades</p>
        <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
          <div className="btn-spinner" style={{ width: "48px", height: "48px", borderTopColor: "var(--primary)" }}></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "8px" }}>Student Dashboard</h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: "32px" }}>Overview of courses, active assignments, and grades</p>
        <div className="alert alert-danger" style={{ maxWidth: "500px", flexDirection: "column", alignItems: "flex-start", gap: "12px", padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span style={{ fontWeight: "600" }}>Error Loading Dashboard Data</span>
          </div>
          <p style={{ fontSize: "14px", color: "#fca5a5" }}>{error}</p>
          <button className="btn" style={{ width: "auto", fontSize: "13px", padding: "8px 16px", marginTop: "8px", background: "var(--primary)" }} onClick={fetchStats}>
            Retry Load
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "8px", background: "linear-gradient(to right, #ffffff, #94a3b8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
        Student Dashboard
      </h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: "32px", fontSize: "15px" }}>Overview of courses, active assignments, and grades</p>
      
      <div className="grid grid-3" style={{ gap: "24px" }}>
        
        {/* My Subjects Card */}
        <div className="auth-card" style={{ maxWidth: "none", padding: "28px", background: "radial-gradient(circle at top right, rgba(99, 102, 241, 0.05), transparent 60%), var(--bg-card)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: "500", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>My Subjects</h3>
            <div style={{ background: "rgba(99, 102, 241, 0.1)", color: "var(--primary)", padding: "10px", borderRadius: "var(--radius-sm)", display: "flex" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
          </div>
          <p style={{ fontSize: "40px", fontWeight: "700", color: "var(--text-primary)", letterSpacing: "-1px" }}>{stats?.mySubjects ?? 0}</p>
        </div>

        {/* My Assignments Card */}
        <div className="auth-card" style={{ maxWidth: "none", padding: "28px", background: "radial-gradient(circle at top right, rgba(16, 185, 129, 0.05), transparent 60%), var(--bg-card)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: "500", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Total Assignments</h3>
            <div style={{ background: "rgba(16, 185, 129, 0.1)", color: "var(--success)", padding: "10px", borderRadius: "var(--radius-sm)", display: "flex" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
          </div>
          <p style={{ fontSize: "40px", fontWeight: "700", color: "var(--text-primary)", letterSpacing: "-1px" }}>{stats?.myAssignments ?? 0}</p>
        </div>

        {/* Submitted Assignments Card */}
        <div className="auth-card" style={{ maxWidth: "none", padding: "28px", background: "radial-gradient(circle at top right, rgba(16, 185, 129, 0.05), transparent 60%), var(--bg-card)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: "500", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Submitted</h3>
            <div style={{ background: "rgba(16, 185, 129, 0.1)", color: "var(--success)", padding: "10px", borderRadius: "var(--radius-sm)", display: "flex" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </div>
          <p style={{ fontSize: "40px", fontWeight: "700", color: "var(--text-primary)", letterSpacing: "-1px" }}>{stats?.submittedAssignments ?? 0}</p>
        </div>

        {/* Pending Assignments Card */}
        <div className="auth-card" style={{ maxWidth: "none", padding: "28px", background: "radial-gradient(circle at top right, rgba(245, 158, 11, 0.05), transparent 60%), var(--bg-card)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: "500", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Pending</h3>
            <div style={{ background: "rgba(245, 158, 11, 0.1)", color: "var(--warning)", padding: "10px", borderRadius: "var(--radius-sm)", display: "flex" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
          </div>
          <p style={{ fontSize: "40px", fontWeight: "700", color: "var(--text-primary)", letterSpacing: "-1px" }}>{stats?.pendingAssignments ?? 0}</p>
        </div>

        {/* Reviewed Assignments Card */}
        <div className="auth-card" style={{ maxWidth: "none", padding: "28px", background: "radial-gradient(circle at top right, rgba(99, 102, 241, 0.05), transparent 60%), var(--bg-card)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: "500", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Reviewed</h3>
            <div style={{ background: "rgba(99, 102, 241, 0.1)", color: "var(--primary)", padding: "10px", borderRadius: "var(--radius-sm)", display: "flex" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
          </div>
          <p style={{ fontSize: "40px", fontWeight: "700", color: "var(--text-primary)", letterSpacing: "-1px" }}>{stats?.reviewedAssignments ?? 0}</p>
        </div>

      </div>
    </div>
  );
}
