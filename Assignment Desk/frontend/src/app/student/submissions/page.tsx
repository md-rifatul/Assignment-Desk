"use client";

import React, { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { SubmissionResponseDto, AssignmentResponseDto, SubmissionStatus } from "@/types";

export default function StudentSubmissionsPage() {
  const [submissions, setSubmissions] = useState<SubmissionResponseDto[]>([]);
  const [assignments, setAssignments] = useState<AssignmentResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected submission modal for details
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionResponseDto | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [subs, assigns] = await Promise.all([
        apiFetch<SubmissionResponseDto[]>("/api/submission/my-submissions").catch((err) => {
          console.warn("Failed to fetch my submissions:", err);
          return [] as SubmissionResponseDto[];
        }),
        apiFetch<AssignmentResponseDto[]>("/api/assignment/student/my-assignments").catch((err) => {
          console.warn("Failed to fetch student assignments:", err);
          return [] as AssignmentResponseDto[];
        }),
      ]);

      setSubmissions(subs || []);
      setAssignments(assigns || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load submission history.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getMatchedAssignment = (assignmentId: number) => {
    return assignments.find((a) => a.id === assignmentId);
  };

  const handleOpenDetails = (submission: SubmissionResponseDto) => {
    setSelectedSubmission(submission);
    setIsDetailsOpen(true);
  };

  return (
    <div>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "8px", color: "#0f172a" }}>
          My Submissions
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "15px" }}>History of your uploaded solution files, grading status, and feedback</p>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: "24px" }} role="alert">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
          <div className="btn-spinner" style={{ width: "48px", height: "48px", borderTopColor: "var(--primary)" }}></div>
        </div>
      ) : (
        <div className="grid grid-3" style={{ gap: "24px" }}>
          {submissions.length === 0 ? (
            <div className="auth-card" style={{ gridColumn: "1 / -1", maxWidth: "none", padding: "48px", textAlign: "center", color: "var(--text-secondary)", fontStyle: "italic" }}>
              You haven&apos;t submitted any assignments yet.
            </div>
          ) : (
            submissions.map((submission) => {
              const matchedAssignment = getMatchedAssignment(submission.assignmentId);
              const maxMarks = matchedAssignment ? matchedAssignment.maximumMarks : "N/A";
              const description = matchedAssignment ? matchedAssignment.description : "No description available.";
              const subjectName = matchedAssignment ? matchedAssignment.subjectName : (submission.subjectName || "N/A");
              const assignmentTitle = matchedAssignment ? matchedAssignment.title : (submission.assignmentTitle || "N/A");

              return (
                <div key={submission.id} className="auth-card" style={{ maxWidth: "none", padding: "28px", display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%", background: "radial-gradient(circle at top right, rgba(16,185,129,0.01), transparent 70%), var(--bg-card)", border: "1px solid var(--border-color)" }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                      <span style={{ fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px", color: "var(--primary)", background: "rgba(99,102,241,0.1)", padding: "4px 8px", borderRadius: "var(--radius-sm)" }}>
                        {subjectName}
                      </span>
                      <span style={{
                        display: "inline-block",
                        padding: "3px 8px",
                        borderRadius: "var(--radius-full)",
                        fontSize: "11px",
                        fontWeight: "600",
                        textTransform: "uppercase",
                        color: submission.status === SubmissionStatus.Reviewed ? "var(--success)" : "var(--warning)",
                        background: submission.status === SubmissionStatus.Reviewed ? "var(--success-bg)" : "var(--warning-bg)",
                        border: submission.status === SubmissionStatus.Reviewed ? "1px solid rgba(16,185,129,0.2)" : "1px solid rgba(245,158,11,0.2)"
                      }}>
                        {submission.status === SubmissionStatus.Reviewed ? "Reviewed" : "Submitted"}
                      </span>
                    </div>

                    <h3 style={{ fontSize: "18px", fontWeight: "600", color: "var(--text-primary)", marginBottom: "8px" }}>
                      {assignmentTitle}
                    </h3>
                    
                    <p style={{ color: "var(--text-secondary)", fontSize: "13px", lineHeight: "1.5", marginBottom: "20px", display: "-webkit-box", WebkitLineClamp: "3", WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {description}
                    </p>
                  </div>

                  <div>
                    <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "16px", marginBottom: "20px", display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ color: "var(--text-secondary)" }}>Submitted:</span>
                        <span style={{ fontWeight: "500", color: "var(--text-primary)" }}>{new Date(submission.submittedAt).toLocaleDateString()}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ color: "var(--text-secondary)" }}>Score:</span>
                        <span style={{ fontWeight: "700", color: submission.status === SubmissionStatus.Reviewed ? "var(--success)" : "var(--warning)" }}>
                          {submission.status === SubmissionStatus.Reviewed ? `${submission.marks} / ${maxMarks}` : "Pending Review"}
                        </span>
                      </div>
                    </div>

                    <button className="btn btn-primary" style={{ width: "100%" }} onClick={() => handleOpenDetails(submission)}>
                      View Submission
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Submission Details Modal */}
      {isDetailsOpen && selectedSubmission && (() => {
        const matchedAssignment = getMatchedAssignment(selectedSubmission.assignmentId);
        const assignmentTitle = matchedAssignment ? matchedAssignment.title : (selectedSubmission.assignmentTitle || "N/A");
        const subjectName = matchedAssignment ? matchedAssignment.subjectName : (selectedSubmission.subjectName || "N/A");
        const maxMarks = matchedAssignment ? matchedAssignment.maximumMarks : "N/A";
        const assignmentDescription = matchedAssignment ? matchedAssignment.description : "No description available.";

        return (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15,23,42,0.8)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
            <div className="auth-card" style={{ maxWidth: "560px", width: "95%" }}>
              <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "8px" }}>Submission Details</h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "12px" }}>
                Assignment: <strong style={{ color: "var(--text-primary)" }}>{assignmentTitle}</strong>
              </p>

              <div style={{ marginBottom: "20px", background: "rgba(255, 255, 255, 0.01)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", padding: "12px" }}>
                <label style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "600", letterSpacing: "0.5px" }}>Description / Question</label>
                <p style={{ marginTop: "4px", fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.6", whiteSpace: "pre-line" }}>
                  {assignmentDescription}
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "32px", fontSize: "14px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "600" }}>Subject</label>
                    <p style={{ marginTop: "2px", fontWeight: "500" }}>{subjectName}</p>
                  </div>
                  <div>
                    <label style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "600" }}>Status</label>
                    <p style={{ marginTop: "2px" }}>
                      <span style={{
                        display: "inline-block",
                        padding: "4px 8px",
                        borderRadius: "var(--radius-full)",
                        fontSize: "11px",
                        fontWeight: "600",
                        textTransform: "uppercase",
                        color: selectedSubmission.status === SubmissionStatus.Reviewed ? "var(--success)" : "var(--warning)",
                        background: selectedSubmission.status === SubmissionStatus.Reviewed ? "var(--success-bg)" : "var(--warning-bg)",
                        border: selectedSubmission.status === SubmissionStatus.Reviewed ? "1px solid rgba(16,185,129,0.2)" : "1px solid rgba(245,158,11,0.2)"
                      }}>
                        {selectedSubmission.status === SubmissionStatus.Reviewed ? "Reviewed" : "Submitted"}
                      </span>
                    </p>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "600" }}>Submitted Date</label>
                    <p style={{ marginTop: "2px", color: "var(--text-secondary)" }}>{new Date(selectedSubmission.submittedAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <label style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "600" }}>Obtained Score</label>
                    <p style={{ marginTop: "2px", fontWeight: "700", color: "var(--primary)", fontSize: "15px" }}>
                      {selectedSubmission.status === SubmissionStatus.Reviewed 
                        ? `${selectedSubmission.marks} / ${maxMarks}`
                        : "Pending review"}
                    </p>
                  </div>
                </div>

                {selectedSubmission.feedback && (
                  <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "12px" }}>
                    <label style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "600" }}>Teacher Feedback</label>
                    <p style={{ marginTop: "4px", color: "var(--text-secondary)", fontStyle: "italic", background: "rgba(255,255,255,0.01)", padding: "12px", borderRadius: "var(--radius-sm)", borderLeft: "2px solid var(--primary)", lineHeight: "1.5" }}>
                      &ldquo;{selectedSubmission.feedback}&rdquo;
                    </p>
                  </div>
                )}

                <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <a
                    href={selectedSubmission.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn"
                    style={{ width: "auto", fontSize: "13px", padding: "8px 16px", background: "var(--primary-glow)", color: "var(--primary)", border: "1px solid rgba(99,102,241,0.2)", display: "flex", alignItems: "center", gap: "6px" }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                    View Submitted PDF
                  </a>
                </div>
              </div>

              <button className="btn btn-primary" onClick={() => setIsDetailsOpen(false)}>
                Close
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
