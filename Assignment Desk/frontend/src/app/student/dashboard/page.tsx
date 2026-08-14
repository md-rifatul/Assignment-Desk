"use client";

import React, { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { StudentDashboardDto, AssignmentResponseDto, SubmissionResponseDto, SubmissionStatus } from "@/types";
import Link from "next/link";

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<StudentDashboardDto | null>(null);
  const [assignments, setAssignments] = useState<AssignmentResponseDto[]>([]);
  const [submissionsList, setSubmissionsList] = useState<SubmissionResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionResponseDto | null>(null);

  // Date formatting state
  const [currentDateStr, setCurrentDateStr] = useState("");
  const [currentDayStr, setCurrentDayStr] = useState("");

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, assignmentsData, subsData] = await Promise.all([
        apiFetch<StudentDashboardDto>("/api/dashboard/student"),
        apiFetch<AssignmentResponseDto[]>("/api/assignment/student/my-assignments"),
        apiFetch<SubmissionResponseDto[]>("/api/submission/my-submissions").catch((err) => {
          console.warn("Failed to load submissions list:", err);
          return [] as SubmissionResponseDto[];
        })
      ]);

      setStats(statsData || null);
      setAssignments(assignmentsData || []);
      setSubmissionsList(subsData || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load dashboard statistics.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();

    const d = new Date();
    setCurrentDateStr(d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }));
    setCurrentDayStr(d.toLocaleDateString("en-US", { weekday: "long" }));
  }, []);



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
          <button className="btn" style={{ width: "auto", fontSize: "13px", padding: "8px 16px", background: "var(--primary)" }} onClick={loadDashboardData}>
            Retry Load
          </button>
        </div>
      </div>
    );
  }

  // 1. Dynamic calculation for stats cards
  const assignmentsCount = assignments.length;
  const submittedCount = submissionsList.length;

  const reviewedSubmissions = submissionsList.filter((s) => s.status === SubmissionStatus.Reviewed);
  const averageScore = reviewedSubmissions.length > 0
    ? Math.round(reviewedSubmissions.reduce((sum, s) => sum + (s.marks ?? 0), 0) / reviewedSubmissions.length)
    : 85; // Default average fallback

  const nowMs = Date.now();
  const upcomingAssignmentsList = assignments
    .filter((a) => {
      // Not submitted yet and deadline in future
      const isSubmitted = submissionsList.some((s) => s.assignmentId === a.id);
      return !isSubmitted && new Date(a.deadline).getTime() > nowMs;
    })
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

  const upcomingCount = upcomingAssignmentsList.length;

  // Slice top 2 upcoming assignments for view
  const displayUpcoming = upcomingAssignmentsList.slice(0, 2);

  // Slice top 2 submissions for view
  const recentSubmissions = [...submissionsList]
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .slice(0, 2);

  // 2. Submission Overview donut stats calculation
  const reviewedOverviewCount = reviewedSubmissions.length;
  const pendingOverviewCount = submissionsList.filter((s) => s.status === SubmissionStatus.Submitted).length;
  
  // Not Submitted: any assignment that is not submitted yet
  const notSubOverviewCount = assignments.filter((a) => {
    return !submissionsList.some((s) => s.assignmentId === a.id);
  }).length;

  const totalSubCount = reviewedOverviewCount + pendingOverviewCount + notSubOverviewCount;

  const reviewedPct = totalSubCount > 0 ? (reviewedOverviewCount / totalSubCount) * 100 : 50;
  const pendingPct = totalSubCount > 0 ? (pendingOverviewCount / totalSubCount) * 100 : 50;

  // 3. Dynamic classes list
  const classesMap: { [key: string]: { subjectName: string; className: string; count: number } } = {};
  assignments.forEach((a) => {
    const key = `${a.subjectName}-${a.className}`;
    if (!classesMap[key]) {
      classesMap[key] = {
        subjectName: a.subjectName,
        className: a.className || "Class 1",
        count: 0
      };
    }
    classesMap[key].count++;
  });
  
  let classesList = Object.values(classesMap).slice(0, 3);
  if (classesList.length === 0) {
    // Mock fallbacks if no subjects/assignments assigned yet
    classesList = [
      { subjectName: "Bangla", className: "Class 1", count: 2 },
      { subjectName: "English", className: "Class 1", count: 0 },
      { subjectName: "Math", className: "Class 1", count: 1 }
    ];
  }

  // Formatting due date display helper
  const getDueLabel = (deadlineStr: string) => {
    const diffMs = new Date(deadlineStr).getTime() - nowMs;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "Due Tomorrow";
    if (diffDays > 1 && diffDays <= 3) return `Due in ${diffDays} Days`;
    return `Due in ${diffDays} Days`;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px", width: "100%" }}>
      
      {/* Scoped CSS styling overrides for responsive rows */}
      <style>{`
        @media (max-width: 1024px) {
          .student-dashboard-mid-row, .student-dashboard-bottom-row {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 768px) {
          .student-dashboard-header-row {
            flex-direction: column;
            align-items: flex-start !important;
            gap: 20px;
          }
          .student-dashboard-header-date {
            width: 100%;
            justify-content: flex-start;
          }
          .student-dashboard-overview-container {
            flex-direction: column !important;
            align-items: center !important;
            gap: 28px !important;
          }
          .student-dashboard-card-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 12px !important;
          }
          .student-dashboard-card-grid .auth-card {
            padding: 12px !important;
            gap: 10px !important;
          }
          .student-dashboard-card-grid .auth-card svg {
            width: 20px !important;
            height: 20px !important;
          }
          .student-dashboard-card-grid .auth-card p {
            font-size: 20px !important;
          }
        }
      `}</style>

      {/* Header Greeting Row */}
      <div className="student-dashboard-header-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#0f172a", marginBottom: "6px" }}>
            Welcome back, {user?.fullName.split(" ")[0]}! 👋
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "15px" }}>{"Here's what's happening with your courses today."}</p>
        </div>
        
        <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
          {/* Class Card Widget */}
          <div className="student-dashboard-header-date" style={{ background: "#ffffff", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "12px 20px", display: "flex", alignItems: "center", gap: "14px", boxShadow: "0 2px 4px rgba(0,0,0,0.01)" }}>
            <div style={{ background: "rgba(16, 185, 129, 0.08)", color: "var(--success)", padding: "8px", borderRadius: "10px", display: "flex" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12.5V16a6 6 0 0 0 12 0v-3.5" />
              </svg>
            </div>
            <div>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: 0 }}>Class</p>
              <p style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a", margin: 0 }}>{stats?.className || "Loading..."}</p>
            </div>
          </div>

          {/* Date Card Widget */}
          <div className="student-dashboard-header-date" style={{ background: "#ffffff", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "12px 20px", display: "flex", alignItems: "center", gap: "14px", boxShadow: "0 2px 4px rgba(0,0,0,0.01)" }}>
            <div style={{ background: "rgba(99, 102, 241, 0.08)", color: "var(--primary)", padding: "8px", borderRadius: "10px", display: "flex" }}>
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
      </div>

      {/* 4 Stats Cards Grid */}
      <div className="student-dashboard-card-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "20px" }}>
        
        {/* Assignments Card */}
        <div className="auth-card" style={{ maxWidth: "none", padding: "20px", background: "#ffffff", border: "1px solid var(--border-color)", boxShadow: "none", display: "flex", gap: "16px", alignItems: "center" }}>
          <div style={{ background: "rgba(16, 185, 129, 0.08)", color: "var(--success)", padding: "12px", borderRadius: "var(--radius-md)", display: "flex" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <div>
            <span style={{ fontSize: "12px", fontWeight: "500", color: "var(--text-secondary)" }}>Assignments</span>
            <p style={{ fontSize: "24px", fontWeight: "700", color: "#0f172a", margin: "2px 0" }}>{assignmentsCount}</p>
            <Link href="/student/assignments" style={{ fontSize: "10px", color: "var(--success)", textDecoration: "none", fontWeight: "600" }}>View all assignments &rarr;</Link>
          </div>
        </div>

        {/* Submitted Card */}
        <div className="auth-card" style={{ maxWidth: "none", padding: "20px", background: "#ffffff", border: "1px solid var(--border-color)", boxShadow: "none", display: "flex", gap: "16px", alignItems: "center" }}>
          <div style={{ background: "rgba(245, 158, 11, 0.08)", color: "var(--warning)", padding: "12px", borderRadius: "var(--radius-md)", display: "flex" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
            </svg>
          </div>
          <div>
            <span style={{ fontSize: "12px", fontWeight: "500", color: "var(--text-secondary)" }}>Submitted</span>
            <p style={{ fontSize: "24px", fontWeight: "700", color: "#0f172a", margin: "2px 0" }}>{submittedCount}</p>
            <Link href="/student/submissions" style={{ fontSize: "10px", color: "var(--warning)", textDecoration: "none", fontWeight: "600" }}>View my submissions &rarr;</Link>
          </div>
        </div>

        {/* Average Score Card */}
        <div className="auth-card" style={{ maxWidth: "none", padding: "20px", background: "#ffffff", border: "1px solid var(--border-color)", boxShadow: "none", display: "flex", gap: "16px", alignItems: "center" }}>
          <div style={{ background: "rgba(6, 182, 212, 0.08)", color: "#06b6d4", padding: "12px", borderRadius: "var(--radius-md)", display: "flex" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <div>
            <span style={{ fontSize: "12px", fontWeight: "500", color: "var(--text-secondary)" }}>Average Score</span>
            <p style={{ fontSize: "24px", fontWeight: "700", color: "#0f172a", margin: "2px 0" }}>{averageScore}%</p>
            <Link href="/student/submissions" style={{ fontSize: "10px", color: "#06b6d4", textDecoration: "none", fontWeight: "600" }}>View my grades &rarr;</Link>
          </div>
        </div>

        {/* Upcoming Card */}
        <div className="auth-card" style={{ maxWidth: "none", padding: "20px", background: "#ffffff", border: "1px solid var(--border-color)", boxShadow: "none", display: "flex", gap: "16px", alignItems: "center" }}>
          <div style={{ background: "rgba(244, 63, 94, 0.08)", color: "#f43f5e", padding: "12px", borderRadius: "var(--radius-md)", display: "flex" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
            </svg>
          </div>
          <div>
            <span style={{ fontSize: "12px", fontWeight: "500", color: "var(--text-secondary)" }}>Upcoming</span>
            <p style={{ fontSize: "24px", fontWeight: "700", color: "#0f172a", margin: "2px 0" }}>{upcomingCount}</p>
            <Link href="/student/assignments?status=pending" style={{ fontSize: "10px", color: "#f43f5e", textDecoration: "none", fontWeight: "600" }}>Due this week &rarr;</Link>
          </div>
        </div>
      </div>

      {/* Mid row layout: Upcoming Assignments & Submission Overview */}
      <div className="student-dashboard-mid-row" style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "24px" }}>
        
        {/* Upcoming Assignments Widget */}
        <div className="auth-card" style={{ maxWidth: "none", padding: "24px", background: "#ffffff", border: "1px solid var(--border-color)", boxShadow: "none", display: "flex", flexDirection: "column", justifySelf: "stretch" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: "var(--primary)" }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              Upcoming Assignments
            </h3>
            <Link href="/student/assignments?status=pending" style={{ fontSize: "13px", fontWeight: "600", color: "var(--primary)", textDecoration: "none" }}>View All</Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", flex: 1, justifyContent: "center" }}>
            {displayUpcoming.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: "14px", textAlign: "center", padding: "20px" }}>No upcoming assignments due.</p>
            ) : (
              displayUpcoming.map((assignment) => (
                <div key={assignment.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div style={{ background: "rgba(99, 102, 241, 0.05)", color: "var(--primary)", padding: "10px", borderRadius: "10px", display: "flex" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      </svg>
                    </div>
                    <div>
                      <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a", margin: "0 0 4px 0" }}>{assignment.title}</h4>
                      <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: 0 }}>{assignment.subjectName} • {assignment.className || "Class 1"}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{
                      display: "inline-block",
                      padding: "2px 8px",
                      borderRadius: "12px",
                      fontSize: "11px",
                      fontWeight: "600",
                      color: "#e11d48",
                      background: "#fff1f2",
                      border: "1px solid #ffe4e6",
                      marginBottom: "6px"
                    }}>
                      {getDueLabel(assignment.deadline)}
                    </span>
                    <p style={{ fontSize: "11px", color: "var(--text-secondary)", margin: 0 }}>
                      {new Date(assignment.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} • {new Date(assignment.deadline).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Submissions Overview Donut Widget */}
        <div className="auth-card" style={{ maxWidth: "none", padding: "24px", background: "#ffffff", border: "1px solid var(--border-color)", boxShadow: "none" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", margin: 0 }}>Submission Overview</h3>
            <select style={{ border: "1px solid var(--border-color)", background: "#ffffff", color: "#475569", fontSize: "12px", fontWeight: "600", padding: "6px 12px", borderRadius: "8px", outline: "none", cursor: "pointer" }}>
              <option>This Week</option>
            </select>
          </div>

          <div className="student-dashboard-overview-container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "20px", marginTop: "10px" }}>
            {/* SVG Donut Chart */}
            <div style={{ position: "relative", width: "120px", height: "120px", display: "flex", justifyContent: "center", alignItems: "center", flexShrink: 0 }}>
              <svg width="120" height="120" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="3.5" />
                {totalSubCount > 0 && (
                  <>
                    {/* Reviewed segment (green) */}
                    <circle
                      cx="18"
                      cy="18"
                      r="15.915"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="3.5"
                      strokeDasharray={`${reviewedPct} ${100 - reviewedPct}`}
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
                      strokeDasharray={`${pendingPct} ${100 - pendingPct}`}
                      strokeDashoffset={`${25 - reviewedPct}`}
                    />
                  </>
                )}
              </svg>
              <div style={{ position: "absolute", textAlign: "center" }}>
                <p style={{ fontSize: "22px", fontWeight: "700", color: "#0f172a", margin: 0 }}>{totalSubCount}</p>
                <p style={{ fontSize: "10px", color: "var(--text-secondary)", textTransform: "uppercase", margin: 0 }}>Total</p>
              </div>
            </div>

            {/* Horizontal Stats Legend */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1, width: "100%" }}>
              {/* Reviewed */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-secondary)" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981" }}></span>
                  Reviewed
                </span>
                <span style={{ fontWeight: "700", color: "#0f172a" }}>{reviewedOverviewCount}</span>
              </div>
              {/* Pending */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-secondary)" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#f59e0b" }}></span>
                  Pending
                </span>
                <span style={{ fontWeight: "700", color: "#0f172a" }}>{pendingOverviewCount}</span>
              </div>

              {/* Not Submitted */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-secondary)" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#3b82f6" }}></span>
                  Not Submitted
                </span>
                <span style={{ fontWeight: "700", color: "#0f172a" }}>{notSubOverviewCount}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom section: Recent Submissions (Full-Width) */}
      <div className="auth-card" style={{ maxWidth: "none", padding: "0", background: "#ffffff", border: "1px solid var(--border-color)", boxShadow: "none", overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 24px 16px 24px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", margin: 0 }}>Recent Submissions</h3>
          <Link href="/student/submissions" style={{ fontSize: "13px", fontWeight: "600", color: "var(--primary)", textDecoration: "none" }}>View All</Link>
        </div>

        <div style={{ overflowX: "auto", width: "100%" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px", minWidth: "800px" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: "600" }}>Assignment</th>
                <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: "600" }}>Class</th>
                <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: "600" }}>Submitted Date</th>
                <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: "600" }}>Score</th>
                <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: "600" }}>Status</th>
                <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: "600", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "40px 24px", textAlign: "center", color: "var(--text-muted)" }}>
                    No submissions uploaded yet.
                  </td>
                </tr>
              ) : (
                recentSubmissions.map((submission) => (
                  <tr key={submission.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "16px 24px", color: "#0f172a", fontWeight: "600" }}>{submission.assignmentTitle}</td>
                    <td style={{ padding: "16px 24px", color: "var(--text-secondary)" }}>{submission.subjectName} • {submission.className || "Class 1"}</td>
                    <td style={{ padding: "16px 24px" }}>
                      {new Date(submission.submittedAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "16px 24px", fontWeight: "700", color: "#0f172a" }}>
                      {submission.status === SubmissionStatus.Reviewed ? `${submission.marks} / 100` : `- / 100`}
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <span style={{
                        display: "inline-block",
                        padding: "4px 10px",
                        borderRadius: "12px",
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
                        {/* Chat bubble icon showing feedback presence */}
                        <button 
                          onClick={() => {
                            if (submission.feedback) {
                              setSelectedSubmission(submission);
                            }
                          }}
                          title={submission.feedback || "No feedback comments yet"}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: submission.feedback ? "var(--primary)" : "#cbd5e1",
                            cursor: submission.feedback ? "pointer" : "default",
                            padding: "6px"
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                          </svg>
                        </button>

                        {/* Action button to open document */}
                        <a 
                          href={submission.fileUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          style={{ display: "flex", color: "#64748b" }}
                        >
                          <button className="btn" style={{ padding: "6px 8px", background: "transparent", border: "1px solid var(--border-color)", borderRadius: "8px" }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polyline points="9 18 15 12 9 6" />
                            </svg>
                          </button>
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Feedback Modal */}
      {selectedSubmission && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15,23,42,0.4)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 10000, padding: "20px" }}>
          <div style={{ maxWidth: "500px", width: "100%", padding: "28px", background: "#ffffff", border: "1px solid var(--border-color)", borderRadius: "var(--radius-lg)", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)", display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a", margin: 0 }}>Teacher Feedback</h3>
              <button onClick={() => setSelectedSubmission(null)} style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer", fontSize: "24px", fontWeight: "300" }}>&times;</button>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: "600", textTransform: "uppercase" }}>Assignment</label>
                <p style={{ fontSize: "15px", fontWeight: "700", color: "#0f172a", margin: "4px 0 0 0" }}>{selectedSubmission.assignmentTitle}</p>
              </div>
              <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "12px" }}>
                <label style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: "600", textTransform: "uppercase" }}>Teacher Comment</label>
                <p style={{ background: "#f8fafc", padding: "14px", borderRadius: "10px", border: "1px solid #e2e8f0", color: "#334155", fontSize: "14px", margin: "6px 0 0 0", lineHeight: "1.5" }}>
                  {selectedSubmission.feedback}
                </p>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #f1f5f9", paddingTop: "12px" }}>
                <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: "500" }}>Obtained Score</span>
                <span style={{ fontSize: "15px", fontWeight: "700", color: "var(--success)" }}>{selectedSubmission.marks} / 100 Marks</span>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
              <button 
                onClick={() => setSelectedSubmission(null)}
                className="btn btn-primary" 
                style={{ width: "100px", padding: "10px", fontSize: "14px" }}
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
