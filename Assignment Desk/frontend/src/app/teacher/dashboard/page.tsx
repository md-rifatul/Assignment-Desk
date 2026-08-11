"use client";

import React, { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { TeacherDashboardDto, SubmissionResponseDto, AssignmentResponseDto, SubmissionStatus } from "@/types";
import Link from "next/link";

export default function TeacherDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<TeacherDashboardDto | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionResponseDto[]>([]);
  const [assignments, setAssignments] = useState<AssignmentResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Date formatting state
  const [currentDateStr, setCurrentDateStr] = useState("");
  const [currentDayStr, setCurrentDayStr] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, submissionsData, assignmentsData] = await Promise.all([
        apiFetch<TeacherDashboardDto>("/api/dashboard/teacher"),
        apiFetch<SubmissionResponseDto[]>("/api/submission/teacher/submissions"),
        apiFetch<AssignmentResponseDto[]>("/api/assignment/all"),
      ]);

      setStats(statsData);
      setSubmissions(submissionsData || []);
      setAssignments(assignmentsData || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load dashboard data.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

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
          <button className="btn" style={{ width: "auto", fontSize: "13px", padding: "8px 16px", background: "var(--primary)" }} onClick={loadData}>
            Retry Load
          </button>
        </div>
      </div>
    );
  }

  // Calculate dynamic stats
  const totalSubmissions = submissions.length;
  const reviewedCount = submissions.filter((s) => s.status === SubmissionStatus.Reviewed).length;
  const pendingCount = submissions.filter((s) => s.status === SubmissionStatus.Submitted).length;
  const lateCount = submissions.filter((s) => {
    const assignment = assignments.find((a) => a.id === s.assignmentId);
    return s.status === SubmissionStatus.Submitted && assignment && new Date(assignment.deadline).getTime() < Date.now();
  }).length;

  const reviewedPercentage = totalSubmissions > 0 ? (reviewedCount / totalSubmissions) * 100 : 0;
  const pendingPercentage = totalSubmissions > 0 ? (pendingCount / totalSubmissions) * 100 : 0;
  const latePercentage = totalSubmissions > 0 ? (lateCount / totalSubmissions) * 100 : 0;

  // Filter recent assignments for this teacher (max 2)
  const recentAssignments = assignments
    .filter((a) => a.teacherId === user?.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 2);

  // Filter recent submissions (max 2)
  const recentSubmissions = [...submissions]
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .slice(0, 2);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px", width: "100%" }}>
      {/* Header Greeting Row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#0f172a", marginBottom: "6px" }}>
            Welcome back, {user?.fullName || "Teacher"}!
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "15px" }}>{"Here's what's happening with your classes today."}</p>
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

      {/* Stats Cards Row */}
      <div className="grid grid-3">
        {/* Subjects Card */}
        <div className="auth-card" style={{ maxWidth: "none", padding: "24px", background: "#ffffff", border: "1px solid var(--border-color)", boxShadow: "none", display: "flex", gap: "20px", alignItems: "center" }}>
          <div style={{ background: "rgba(79, 70, 229, 0.08)", color: "var(--primary)", padding: "16px", borderRadius: "var(--radius-md)", display: "flex" }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <div>
            <span style={{ fontSize: "13px", fontWeight: "500", color: "var(--text-secondary)", textTransform: "uppercase" }}>My Subjects</span>
            <p style={{ fontSize: "28px", fontWeight: "700", color: "#0f172a", margin: "4px 0" }}>{stats?.mySubjects ?? 0}</p>
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Total Active Subjects</span>
          </div>
        </div>

        {/* Assignments Card */}
        <div className="auth-card" style={{ maxWidth: "none", padding: "24px", background: "#ffffff", border: "1px solid var(--border-color)", boxShadow: "none", display: "flex", gap: "20px", alignItems: "center" }}>
          <div style={{ background: "rgba(16, 185, 129, 0.08)", color: "var(--success)", padding: "16px", borderRadius: "var(--radius-md)", display: "flex" }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <div>
            <span style={{ fontSize: "13px", fontWeight: "500", color: "var(--text-secondary)", textTransform: "uppercase" }}>My Assignments</span>
            <p style={{ fontSize: "28px", fontWeight: "700", color: "#0f172a", margin: "4px 0" }}>{stats?.myAssignments ?? 0}</p>
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Total Assignments</span>
          </div>
        </div>

        {/* Pending Card */}
        <div className="auth-card" style={{ maxWidth: "none", padding: "24px", background: "#ffffff", border: "1px solid var(--border-color)", boxShadow: "none", display: "flex", gap: "20px", alignItems: "center" }}>
          <div style={{ background: "rgba(245, 158, 11, 0.08)", color: "var(--warning)", padding: "16px", borderRadius: "var(--radius-md)", display: "flex" }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div>
            <span style={{ fontSize: "13px", fontWeight: "500", color: "var(--text-secondary)", textTransform: "uppercase" }}>Pending Review</span>
            <p style={{ fontSize: "28px", fontWeight: "700", color: "#0f172a", margin: "4px 0" }}>{stats?.pendingReview ?? 0}</p>
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Submissions to Review</span>
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
            <Link href="/teacher/assignments" style={{ fontSize: "13px", fontWeight: "600", color: "var(--primary)", textDecoration: "none" }}>View All</Link>
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
                    <p style={{ fontSize: "11px", color: "var(--text-secondary)", margin: 0 }}>Due: {new Date(assignment.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Submissions Overview Donut Chart widget */}
        <div className="auth-card" style={{ maxWidth: "none", padding: "24px", background: "#ffffff", border: "1px solid var(--border-color)", boxShadow: "none" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", margin: 0 }}>Submissions Overview</h3>
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
                <div style={{ width: "100%", height: "4px", background: "#f1f5f9", borderRadius: "2px", overflow: "hidden" }}>
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
                <div style={{ width: "100%", height: "4px", background: "#f1f5f9", borderRadius: "2px", overflow: "hidden" }}>
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
          <Link href="/teacher/submissions" style={{ fontSize: "13px", fontWeight: "600", color: "var(--primary)", textDecoration: "none" }}>View All</Link>
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
                  const matchedAssignment = assignments.find((a) => a.id === submission.assignmentId);
                  const maxMarks = matchedAssignment ? matchedAssignment.maximumMarks : 100;
                  
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
                        <Link href="/teacher/submissions" style={{ display: "inline-flex", textDecoration: "none" }}>
                          <button className="btn" style={{
                            width: "auto",
                            padding: "6px 12px",
                            fontSize: "12px",
                            background: "rgba(79, 70, 229, 0.05)",
                            color: "var(--primary)",
                            border: "1px solid rgba(79, 70, 229, 0.15)",
                            borderRadius: "8px",
                            fontWeight: "600"
                          }}>
                            {submission.status === SubmissionStatus.Reviewed ? "Edit Review" : "Evaluate"}
                          </button>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
