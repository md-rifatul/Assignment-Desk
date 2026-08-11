"use client";

import React, { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { AdminDashboardDto, AssignmentResponseDto, SubmissionResponseDto, SubmissionStatus } from "@/types";
import Link from "next/link";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminDashboardDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isAssignmentsModalOpen, setIsAssignmentsModalOpen] = useState(false);
  const [isSubmissionsModalOpen, setIsSubmissionsModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionResponseDto | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentResponseDto | null>(null);

  // Date formatting state
  const [currentDateStr, setCurrentDateStr] = useState("");
  const [currentDayStr, setCurrentDayStr] = useState("");

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<AdminDashboardDto>("/api/dashboard/admin");
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

    const d = new Date();
    setCurrentDateStr(d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }));
    setCurrentDayStr(d.toLocaleDateString("en-US", { weekday: "long" }));
  }, []);

  const getAvatarBg = (name: string) => {
    const colors = ["#dbeafe", "#d1fae5", "#fee2e2", "#fef3c7", "#f3e8ff", "#e0f2fe"];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const getAvatarColor = (name: string) => {
    const colors = ["#1e40af", "#065f46", "#991b1b", "#854d0e", "#6b21a8", "#075985"];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  if (loading) {
    return (
      <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <div className="btn-spinner" style={{ width: "48px", height: "48px", borderTopColor: "var(--primary)" }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "20px" }}>
        <div className="alert alert-danger" style={{ maxWidth: "500px", flexDirection: "column", alignItems: "flex-start", gap: "12px", padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span style={{ fontWeight: "600" }}>Error Loading Dashboard</span>
          </div>
          <p style={{ fontSize: "14px", color: "#fca5a5" }}>{error}</p>
          <button className="btn" style={{ width: "auto", fontSize: "13px", padding: "8px 16px", background: "var(--primary)" }} onClick={fetchStats}>
            Retry Load
          </button>
        </div>
      </div>
    );
  }

  const allAssignments = stats?.recentAssignments || [];
  const allSubmissions = stats?.recentSubmissions || [];

  // Slice the top 2 for the recent lists shown on widgets
  const recentAssignments = allAssignments.slice(0, 2);
  const recentSubmissions = allSubmissions.slice(0, 2);

  // Calculate overview donut chart segments from submissions
  const totalSubmissions = allSubmissions.length;
  const reviewedCount = allSubmissions.filter((s) => s.status === SubmissionStatus.Reviewed).length;
  const pendingCount = allSubmissions.filter((s) => s.status === SubmissionStatus.Submitted).length;
  const lateCount = 0; // Assume 0 for late as default

  const reviewedPercentage = totalSubmissions > 0 ? (reviewedCount / totalSubmissions) * 100 : 0;
  const pendingPercentage = totalSubmissions > 0 ? (pendingCount / totalSubmissions) * 100 : 0;
  const latePercentage = totalSubmissions > 0 ? (lateCount / totalSubmissions) * 100 : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px", width: "100%" }}>
      {/* Header Greeting Row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#0f172a", marginBottom: "6px" }}>
            Welcome back, System Admin! 👋
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "15px" }}>{"Here's what's happening in your system today."}</p>
        </div>
        
        {/* Date Card Widget */}
        <div style={{ background: "#ffffff", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "12px 20px", display: "flex", alignItems: "center", gap: "14px", boxShadow: "0 2px 4px rgba(0,0,0,0.01)" }}>
          <div style={{ background: "rgba(79, 70, 229, 0.08)", color: "var(--primary)", padding: "8px", borderRadius: "10px", display: "flex" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div>
            <p style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a", margin: 0 }}>{currentDateStr}</p>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: 0 }}>{currentDayStr}</p>
          </div>
        </div>
      </div>

      {/* 5 Stats Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "20px" }}>
        {/* Teachers Card */}
        <div className="auth-card" style={{ maxWidth: "none", padding: "20px", background: "#ffffff", border: "1px solid var(--border-color)", boxShadow: "none", display: "flex", gap: "16px", alignItems: "center" }}>
          <div style={{ background: "rgba(79, 70, 229, 0.08)", color: "var(--primary)", padding: "12px", borderRadius: "var(--radius-md)", display: "flex" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div>
            <span style={{ fontSize: "12px", fontWeight: "500", color: "var(--text-secondary)" }}>Total Teachers</span>
            <p style={{ fontSize: "24px", fontWeight: "700", color: "#0f172a", margin: "2px 0" }}>{stats?.totalTeachers ?? 0}</p>
            <Link href="/admin/users" style={{ fontSize: "10px", color: "var(--primary)", textDecoration: "none", fontWeight: "600" }}>View all teachers &rarr;</Link>
          </div>
        </div>

        {/* Students Card */}
        <div className="auth-card" style={{ maxWidth: "none", padding: "20px", background: "#ffffff", border: "1px solid var(--border-color)", boxShadow: "none", display: "flex", gap: "16px", alignItems: "center" }}>
          <div style={{ background: "rgba(16, 185, 129, 0.08)", color: "var(--success)", padding: "12px", borderRadius: "var(--radius-md)", display: "flex" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
            </svg>
          </div>
          <div>
            <span style={{ fontSize: "12px", fontWeight: "500", color: "var(--text-secondary)" }}>Total Students</span>
            <p style={{ fontSize: "24px", fontWeight: "700", color: "#0f172a", margin: "2px 0" }}>{stats?.totalStudents ?? 0}</p>
            <Link href="/admin/users" style={{ fontSize: "10px", color: "var(--success)", textDecoration: "none", fontWeight: "600" }}>View all students &rarr;</Link>
          </div>
        </div>

        {/* Classes Card */}
        <div className="auth-card" style={{ maxWidth: "none", padding: "20px", background: "#ffffff", border: "1px solid var(--border-color)", boxShadow: "none", display: "flex", gap: "16px", alignItems: "center" }}>
          <div style={{ background: "rgba(245, 158, 11, 0.08)", color: "var(--warning)", padding: "12px", borderRadius: "var(--radius-md)", display: "flex" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="9" y1="3" x2="9" y2="21" />
            </svg>
          </div>
          <div>
            <span style={{ fontSize: "12px", fontWeight: "500", color: "var(--text-secondary)" }}>Total Classes</span>
            <p style={{ fontSize: "24px", fontWeight: "700", color: "#0f172a", margin: "2px 0" }}>{stats?.totalClasses ?? 0}</p>
            <Link href="/admin/classes" style={{ fontSize: "10px", color: "var(--warning)", textDecoration: "none", fontWeight: "600" }}>View all classes &rarr;</Link>
          </div>
        </div>

        {/* Subjects Card */}
        <div className="auth-card" style={{ maxWidth: "none", padding: "20px", background: "#ffffff", border: "1px solid var(--border-color)", boxShadow: "none", display: "flex", gap: "16px", alignItems: "center" }}>
          <div style={{ background: "rgba(139, 92, 246, 0.08)", color: "#8b5cf6", padding: "12px", borderRadius: "var(--radius-md)", display: "flex" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <span style={{ fontSize: "12px", fontWeight: "500", color: "var(--text-secondary)" }}>Total Subjects</span>
            <p style={{ fontSize: "24px", fontWeight: "700", color: "#0f172a", margin: "2px 0" }}>{stats?.totalSubjects ?? 0}</p>
            <Link href="/admin/subjects" style={{ fontSize: "10px", color: "#8b5cf6", textDecoration: "none", fontWeight: "600" }}>View all subjects &rarr;</Link>
          </div>
        </div>

        {/* Assignments Card */}
        <div className="auth-card" style={{ maxWidth: "none", padding: "20px", background: "#ffffff", border: "1px solid var(--border-color)", boxShadow: "none", display: "flex", gap: "16px", alignItems: "center" }}>
          <div style={{ background: "rgba(20, 184, 166, 0.08)", color: "#14b8a6", padding: "12px", borderRadius: "var(--radius-md)", display: "flex" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <div>
            <span style={{ fontSize: "12px", fontWeight: "500", color: "var(--text-secondary)" }}>Total Assignments</span>
            <p style={{ fontSize: "24px", fontWeight: "700", color: "#0f172a", margin: "2px 0" }}>{stats?.totalAssignments ?? 0}</p>
            <button 
              onClick={() => setIsAssignmentsModalOpen(true)}
              style={{ background: "transparent", border: "none", padding: 0, color: "#14b8a6", fontWeight: "600", fontSize: "10px", cursor: "pointer", textAlign: "left", display: "block" }}
            >
              View all assignments &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Mid row layout: Recent Assignments & Overview Chart */}
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "24px", flexWrap: "wrap" }}>
        
        {/* Recent Assignments widget */}
        <div className="auth-card" style={{ maxWidth: "none", padding: "24px", background: "#ffffff", border: "1px solid var(--border-color)", boxShadow: "none", display: "flex", flexDirection: "column", justifySelf: "stretch" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: "var(--primary)" }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              Recent Assignments
            </h3>
            <button 
              onClick={() => setIsAssignmentsModalOpen(true)}
              style={{ background: "transparent", border: "none", padding: 0, fontSize: "13px", fontWeight: "600", color: "var(--primary)", cursor: "pointer" }}
            >
              View All
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", flex: 1, justifyContent: "center" }}>
            {recentAssignments.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: "14px", textAlign: "center", padding: "20px" }}>No recent assignments published.</p>
            ) : (
              recentAssignments.map((assignment) => (
                <div key={assignment.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div style={{ background: "rgba(79, 70, 229, 0.05)", color: "var(--primary)", padding: "10px", borderRadius: "10px", display: "flex" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      </svg>
                    </div>
                    <div>
                      <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a", margin: "0 0 4px 0" }}>{assignment.title}</h4>
                      <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: 0 }}>{assignment.subjectName} • Max Score: {assignment.maximumMarks}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: "var(--radius-full)", fontSize: "11px", fontWeight: "600", color: "var(--success)", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)", marginBottom: "6px" }}>
                      PUBLISHED
                    </span>
                    <p style={{ fontSize: "11px", color: "var(--text-secondary)", margin: 0 }}>Published: {new Date(assignment.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Submissions Overview Donut Chart widget */}
        <div className="auth-card" style={{ maxWidth: "none", padding: "24px", background: "#ffffff", border: "1px solid var(--border-color)", boxShadow: "none" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", margin: 0 }}>Assignments Overview</h3>
            <select style={{ border: "1px solid var(--border-color)", background: "#ffffff", color: "#475569", fontSize: "12px", fontWeight: "600", padding: "6px 12px", borderRadius: "8px", outline: "none", cursor: "pointer" }}>
              <option>This Week</option>
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "20px", marginTop: "10px" }}>
            {/* SVG Donut Chart */}
            <div style={{ position: "relative", width: "120px", height: "120px", display: "flex", justifyContent: "center", alignItems: "center" }}>
              <svg width="120" height="120" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="3.5" />
                {totalSubmissions > 0 && (
                  <>
                    {/* Reviewed segment (blue) */}
                    <circle
                      cx="18"
                      cy="18"
                      r="15.915"
                      fill="none"
                      stroke="#4f46e5"
                      strokeWidth="3.5"
                      strokeDasharray={`${reviewedPercentage} ${100 - reviewedPercentage}`}
                      strokeDashoffset="25"
                    />
                    {/* Pending segment (orange) */}
                    <circle
                      cx="18"
                      cy="18"
                      r="15.915"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="3.5"
                      strokeDasharray={`${pendingPercentage} ${100 - pendingPercentage}`}
                      strokeDashoffset={`${25 - reviewedPercentage}`}
                    />
                  </>
                )}
              </svg>
              <div style={{ position: "absolute", textAlign: "center" }}>
                <p style={{ fontSize: "22px", fontWeight: "700", color: "#0f172a", margin: 0 }}>{totalSubmissions}</p>
                <p style={{ fontSize: "10px", color: "var(--text-secondary)", textTransform: "uppercase", margin: 0 }}>Total</p>
              </div>
            </div>

            {/* Horizontal Stats List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
              {/* Reviewed */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px", fontSize: "12px" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: "500", color: "var(--text-secondary)" }}>
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#4f46e5" }}></span>
                    Reviewed
                  </span>
                  <span style={{ fontWeight: "700", color: "#0f172a" }}>{reviewedCount}</span>
                </div>
                <div style={{ width: "100%", height: "4px", background: "#f1f5f9", borderRadius: "2px", overflow: "hidden" }}>
                  <div style={{ width: `${reviewedPercentage}%`, height: "100%", background: "#4f46e5" }}></div>
                </div>
              </div>

              {/* Pending */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px", fontSize: "12px" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: "500", color: "var(--text-secondary)" }}>
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#f59e0b" }}></span>
                    Pending
                  </span>
                  <span style={{ fontWeight: "700", color: "#0f172a" }}>{pendingCount}</span>
                </div>
                <div style={{ width: "100%", height: "4px", background: "#f59e0b", borderRadius: "2px", overflow: "hidden" }}>
                  <div style={{ width: `${pendingPercentage}%`, height: "100%", background: "#f59e0b" }}></div>
                </div>
              </div>

              {/* Late */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px", fontSize: "12px" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: "500", color: "var(--text-secondary)" }}>
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444" }}></span>
                    Late
                  </span>
                  <span style={{ fontWeight: "700", color: "#0f172a" }}>{lateCount}</span>
                </div>
                <div style={{ width: "100%", height: "4px", background: "#ef4444", borderRadius: "2px", overflow: "hidden" }}>
                  <div style={{ width: `${latePercentage}%`, height: "100%", background: "#ef4444" }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom section: Recent Submissions */}
      <div className="auth-card" style={{ maxWidth: "none", padding: "0", background: "#ffffff", border: "1px solid var(--border-color)", boxShadow: "none", overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 24px 16px 24px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", margin: 0 }}>Recent Submissions</h3>
          <button 
            onClick={() => setIsSubmissionsModalOpen(true)}
            style={{ background: "transparent", border: "none", padding: 0, fontSize: "13px", fontWeight: "600", color: "var(--primary)", cursor: "pointer" }}
          >
            View All
          </button>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: "600" }}>Student</th>
                <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: "600" }}>Assignment</th>
                <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: "600" }}>Subject</th>
                <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: "600" }}>Submitted Date</th>
                <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: "600" }}>Marks / Max</th>
                <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: "600" }}>Status</th>
                <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: "600", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: "40px 24px", textAlign: "center", color: "var(--text-muted)" }}>
                    No recent student submissions.
                  </td>
                </tr>
              ) : (
                recentSubmissions.map((submission) => {
                  const maxMarks = 100; // Default max mark
                  
                  return (
                    <tr key={submission.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      {/* Student Circle Avatar + Name */}
                      <td style={{ padding: "16px 24px", fontWeight: "500" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "13px",
                            fontWeight: "700",
                            background: getAvatarBg(submission.studentName),
                            color: getAvatarColor(submission.studentName)
                          }}>
                            {submission.studentName.charAt(0).toUpperCase()}
                          </span>
                          <span style={{ color: "#0f172a" }}>{submission.studentName}</span>
                        </div>
                      </td>
                      <td style={{ padding: "16px 24px", color: "#0f172a" }}>{submission.assignmentTitle}</td>
                      <td style={{ padding: "16px 24px" }}>{submission.subjectName}</td>
                      <td style={{ padding: "16px 24px" }}>
                        {new Date(submission.submittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} at {new Date(submission.submittedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                      </td>
                      <td style={{ padding: "16px 24px", fontWeight: "600", color: "#0f172a" }}>
                        {submission.status === SubmissionStatus.Reviewed ? `${submission.marks} / ${maxMarks}` : `- / ${maxMarks}`}
                      </td>
                      <td style={{ padding: "16px 24px" }}>
                        <span style={{
                          display: "inline-block",
                          padding: "4px 10px",
                          borderRadius: "var(--radius-full)",
                          fontSize: "11px",
                          fontWeight: "600",
                          textTransform: "uppercase",
                          color: submission.status === SubmissionStatus.Reviewed ? "var(--success)" : "var(--warning)",
                          background: submission.status === SubmissionStatus.Reviewed ? "rgba(16,185,129,0.08)" : "rgba(245,158,11,0.08)",
                          border: submission.status === SubmissionStatus.Reviewed ? "1px solid rgba(16,185,129,0.15)" : "1px solid rgba(245,158,11,0.15)"
                        }}>
                          {submission.status === SubmissionStatus.Reviewed ? "Reviewed" : "Pending"}
                        </span>
                      </td>
                      <td style={{ padding: "16px 24px", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "8px", alignItems: "center" }}>
                          <span style={{
                            fontSize: "12px",
                            color: "var(--text-secondary)",
                            padding: "6px 12px",
                            background: "#f1f5f9",
                            borderRadius: "8px",
                            fontWeight: "500"
                          }}>
                            {submission.status === SubmissionStatus.Reviewed ? "Reviewed" : "Pending"}
                          </span>
                          
                          {/* View details eye icon button */}
                          <button 
                            onClick={() => setSelectedSubmission(submission)}
                            className="btn" 
                            style={{
                              width: "auto",
                              padding: "6px 10px",
                              background: "transparent",
                              color: "var(--text-secondary)",
                              border: "1px solid var(--border-color)",
                              borderRadius: "8px",
                              display: "flex",
                              alignItems: "center"
                            }}
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal overlays */}

      {/* All Assignments Modal */}
      {isAssignmentsModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15,23,42,0.4)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999, padding: "20px" }}>
          <div style={{ maxWidth: "950px", width: "100%", padding: "24px", background: "#ffffff", border: "1px solid var(--border-color)", borderRadius: "var(--radius-lg)", maxHeight: "80vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a", margin: 0 }}>All Assignments</h3>
              <button onClick={() => setIsAssignmentsModalOpen(false)} style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer", fontSize: "24px", fontWeight: "300" }}>&times;</button>
            </div>
            <div style={{ overflowY: "auto", flex: 1, paddingRight: "4px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                    <th style={{ padding: "12px 16px", color: "var(--text-secondary)", fontWeight: "600" }}>Title</th>
                    <th style={{ padding: "12px 16px", color: "var(--text-secondary)", fontWeight: "600" }}>Teacher</th>
                    <th style={{ padding: "12px 16px", color: "var(--text-secondary)", fontWeight: "600" }}>Subject</th>
                    <th style={{ padding: "12px 16px", color: "var(--text-secondary)", fontWeight: "600" }}>Class</th>
                    <th style={{ padding: "12px 16px", color: "var(--text-secondary)", fontWeight: "600" }}>Max Marks</th>
                    <th style={{ padding: "12px 16px", color: "var(--text-secondary)", fontWeight: "600" }}>Deadline</th>
                    <th style={{ padding: "12px 16px", color: "var(--text-secondary)", fontWeight: "600" }}>Status</th>
                    <th style={{ padding: "12px 16px", color: "var(--text-secondary)", fontWeight: "600", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allAssignments.map((assignment) => (
                    <tr key={assignment.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "12px 16px", fontWeight: "700", color: "#0f172a" }}>{assignment.title}</td>
                      <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>{assignment.teacherName || "Teacher"}</td>
                      <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>{assignment.subjectName}</td>
                      <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>{assignment.className || "Class 1"}</td>
                      <td style={{ padding: "12px 16px", fontWeight: "600", color: "#0f172a" }}>{assignment.maximumMarks}</td>
                      <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>{new Date(assignment.deadline).toLocaleDateString()}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: "600", color: "var(--success)", background: "rgba(16,185,129,0.08)" }}>
                          PUBLISHED
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "right" }}>
                        <button 
                          onClick={() => {
                            setIsAssignmentsModalOpen(false);
                            setSelectedAssignment(assignment);
                          }}
                          className="btn" 
                          style={{
                            width: "auto",
                            padding: "6px 10px",
                            background: "transparent",
                            color: "var(--text-secondary)",
                            border: "1px solid var(--border-color)",
                            borderRadius: "8px",
                            display: "inline-flex",
                            alignItems: "center"
                          }}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* All Submissions Modal */}
      {isSubmissionsModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15,23,42,0.4)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999, padding: "20px" }}>
          <div style={{ maxWidth: "900px", width: "100%", padding: "24px", background: "#ffffff", border: "1px solid var(--border-color)", borderRadius: "var(--radius-lg)", maxHeight: "80vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a", margin: 0 }}>All Submissions</h3>
              <button onClick={() => setIsSubmissionsModalOpen(false)} style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer", fontSize: "24px", fontWeight: "300" }}>&times;</button>
            </div>
            <div style={{ overflowY: "auto", flex: 1, paddingRight: "4px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                    <th style={{ padding: "12px 16px", color: "var(--text-secondary)", fontWeight: "600" }}>Student</th>
                    <th style={{ padding: "12px 16px", color: "var(--text-secondary)", fontWeight: "600" }}>Assignment</th>
                    <th style={{ padding: "12px 16px", color: "var(--text-secondary)", fontWeight: "600" }}>Subject</th>
                    <th style={{ padding: "12px 16px", color: "var(--text-secondary)", fontWeight: "600" }}>Submitted Date</th>
                    <th style={{ padding: "12px 16px", color: "var(--text-secondary)", fontWeight: "600" }}>Marks / Max</th>
                    <th style={{ padding: "12px 16px", color: "var(--text-secondary)", fontWeight: "600" }}>Status</th>
                    <th style={{ padding: "12px 16px", color: "var(--text-secondary)", fontWeight: "600", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allSubmissions.map((submission) => (
                    <tr key={submission.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "12px 16px", fontWeight: "500" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "12px",
                            fontWeight: "700",
                            background: getAvatarBg(submission.studentName),
                            color: getAvatarColor(submission.studentName)
                          }}>
                            {submission.studentName.charAt(0).toUpperCase()}
                          </span>
                          <span style={{ color: "#0f172a" }}>{submission.studentName}</span>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px", color: "#0f172a" }}>{submission.assignmentTitle}</td>
                      <td style={{ padding: "12px 16px" }}>{submission.subjectName}</td>
                      <td style={{ padding: "12px 16px" }}>{new Date(submission.submittedAt).toLocaleDateString()}</td>
                      <td style={{ padding: "12px 16px", fontWeight: "600", color: "#0f172a" }}>
                        {submission.status === SubmissionStatus.Reviewed ? `${submission.marks} / 100` : `- / 100`}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{
                          display: "inline-block",
                          padding: "2px 8px",
                          borderRadius: "12px",
                          fontSize: "11px",
                          fontWeight: "600",
                          textTransform: "uppercase",
                          color: submission.status === SubmissionStatus.Reviewed ? "var(--success)" : "var(--warning)",
                          background: submission.status === SubmissionStatus.Reviewed ? "rgba(16,185,129,0.08)" : "rgba(245,158,11,0.08)"
                        }}>
                          {submission.status === SubmissionStatus.Reviewed ? "Reviewed" : "Pending"}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "right" }}>
                        <button 
                          onClick={() => {
                            setIsSubmissionsModalOpen(false);
                            setSelectedSubmission(submission);
                          }}
                          className="btn" 
                          style={{
                            width: "auto",
                            padding: "6px 10px",
                            background: "transparent",
                            color: "var(--text-secondary)",
                            border: "1px solid var(--border-color)",
                            borderRadius: "8px",
                            display: "inline-flex",
                            alignItems: "center"
                          }}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Submission Info Modal */}
      {selectedSubmission && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15,23,42,0.4)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 10000, padding: "20px" }}>
          <div style={{ maxWidth: "550px", width: "100%", padding: "28px", background: "#ffffff", border: "1px solid var(--border-color)", borderRadius: "var(--radius-lg)", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)", display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a", margin: 0 }}>Submission Info</h3>
              <button onClick={() => setSelectedSubmission(null)} style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer", fontSize: "24px", fontWeight: "300" }}>&times;</button>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "10px", borderBottom: "1px solid #f1f5f9" }}>
                <span style={{ color: "var(--text-secondary)", fontWeight: "500" }}>Student Name</span>
                <span style={{ fontWeight: "700", color: "#0f172a" }}>{selectedSubmission.studentName}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "10px", borderBottom: "1px solid #f1f5f9" }}>
                <span style={{ color: "var(--text-secondary)", fontWeight: "500" }}>Assignment Title</span>
                <span style={{ fontWeight: "700", color: "#0f172a" }}>{selectedSubmission.assignmentTitle}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "10px", borderBottom: "1px solid #f1f5f9" }}>
                <span style={{ color: "var(--text-secondary)", fontWeight: "500" }}>Class Name</span>
                <span style={{ fontWeight: "700", color: "#0f172a" }}>{selectedSubmission.className || "Class 1"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "10px", borderBottom: "1px solid #f1f5f9" }}>
                <span style={{ color: "var(--text-secondary)", fontWeight: "500" }}>Subject</span>
                <span style={{ fontWeight: "700", color: "#0f172a" }}>{selectedSubmission.subjectName}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "10px", borderBottom: "1px solid #f1f5f9" }}>
                <span style={{ color: "var(--text-secondary)", fontWeight: "500" }}>Submitted Date</span>
                <span style={{ fontWeight: "600", color: "#0f172a" }}>{new Date(selectedSubmission.submittedAt).toLocaleString()}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "10px", borderBottom: "1px solid #f1f5f9" }}>
                <span style={{ color: "var(--text-secondary)", fontWeight: "500" }}>Marks / Max</span>
                <span style={{ fontWeight: "700", color: "#0f172a" }}>
                  {selectedSubmission.status === SubmissionStatus.Reviewed ? `${selectedSubmission.marks} / 100` : `- / 100`}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ color: "var(--text-secondary)", fontWeight: "500" }}>Feedback / Comments</span>
                <p style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0", color: "#475569", fontSize: "13px", margin: 0, minHeight: "60px" }}>
                  {selectedSubmission.feedback || "No feedback given yet."}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
              <a 
                href={selectedSubmission.fileUrl.startsWith("http") ? selectedSubmission.fileUrl : `http://localhost:5145${selectedSubmission.fileUrl}`}
                target="_blank" 
                rel="noreferrer"
                style={{ flex: 1, textDecoration: "none" }}
              >
                <button className="btn btn-primary" style={{ width: "100%", padding: "12px", fontSize: "14px", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  Open PDF Attachment
                </button>
              </a>
              <button 
                onClick={() => setSelectedSubmission(null)}
                className="btn" 
                style={{ width: "100px", padding: "12px", background: "transparent", color: "var(--text-secondary)", border: "1px solid var(--border-color)", fontSize: "14px", fontWeight: "600" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assignment Info Modal */}
      {selectedAssignment && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15,23,42,0.4)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 10000, padding: "20px" }}>
          <div style={{ maxWidth: "550px", width: "100%", padding: "28px", background: "#ffffff", border: "1px solid var(--border-color)", borderRadius: "var(--radius-lg)", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)", display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a", margin: 0 }}>Assignment Info</h3>
              <button onClick={() => setSelectedAssignment(null)} style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer", fontSize: "24px", fontWeight: "300" }}>&times;</button>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "10px", borderBottom: "1px solid #f1f5f9" }}>
                <span style={{ color: "var(--text-secondary)", fontWeight: "500" }}>Assignment Title</span>
                <span style={{ fontWeight: "700", color: "#0f172a" }}>{selectedAssignment.title}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "10px", borderBottom: "1px solid #f1f5f9" }}>
                <span style={{ color: "var(--text-secondary)", fontWeight: "500" }}>Assigned Teacher</span>
                <span style={{ fontWeight: "700", color: "#0f172a" }}>{selectedAssignment.teacherName || "Teacher"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "10px", borderBottom: "1px solid #f1f5f9" }}>
                <span style={{ color: "var(--text-secondary)", fontWeight: "500" }}>Class Name</span>
                <span style={{ fontWeight: "700", color: "#0f172a" }}>{selectedAssignment.className || "Class 1"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "10px", borderBottom: "1px solid #f1f5f9" }}>
                <span style={{ color: "var(--text-secondary)", fontWeight: "500" }}>Subject</span>
                <span style={{ fontWeight: "700", color: "#0f172a" }}>{selectedAssignment.subjectName}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "10px", borderBottom: "1px solid #f1f5f9" }}>
                <span style={{ color: "var(--text-secondary)", fontWeight: "500" }}>Deadline Date</span>
                <span style={{ fontWeight: "600", color: "#0f172a" }}>{new Date(selectedAssignment.deadline).toLocaleString()}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "10px", borderBottom: "1px solid #f1f5f9" }}>
                <span style={{ color: "var(--text-secondary)", fontWeight: "500" }}>Question Marks (Max Marks)</span>
                <span style={{ fontWeight: "700", color: "#0f172a" }}>{selectedAssignment.maximumMarks} Marks</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ color: "var(--text-secondary)", fontWeight: "500" }}>In-details / Description</span>
                <p style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0", color: "#475569", fontSize: "13px", margin: 0, minHeight: "60px" }}>
                  {selectedAssignment.description || "No description provided."}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px" }}>
              <button 
                onClick={() => setSelectedAssignment(null)}
                className="btn btn-primary" 
                style={{ width: "120px", padding: "10px" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
