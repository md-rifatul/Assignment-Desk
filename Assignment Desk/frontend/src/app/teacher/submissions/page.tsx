"use client";

import React, { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { SubmissionResponseDto, AssignmentResponseDto, ReviewSubmissionDto, SubmissionStatus } from "@/types";

export default function TeacherSubmissionsPage() {
  const [submissions, setSubmissions] = useState<SubmissionResponseDto[]>([]);
  const [assignments, setAssignments] = useState<AssignmentResponseDto[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Review Modal controls
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionResponseDto | null>(null);

  // Review Form state
  const [formData, setFormData] = useState<{ marks: number | ""; feedback: string }>({
    marks: "",
    feedback: "",
  });

  const [formErrors, setFormErrors] = useState<{ marks?: string; feedback?: string }>({});
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [allSubmissions, allAssignments] = await Promise.all([
        apiFetch<SubmissionResponseDto[]>("/api/submission/teacher/submissions"),
        apiFetch<AssignmentResponseDto[]>("/api/assignment/all"),
      ]);

      setSubmissions(allSubmissions || []);
      setAssignments(allAssignments || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load submissions data.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenReview = (submission: SubmissionResponseDto) => {
    setSelectedSubmission(submission);
    setFormData({
      marks: (submission.status === SubmissionStatus.Reviewed && typeof submission.marks === "number") ? submission.marks : "",
      feedback: submission.feedback || "",
    });
    setFormErrors({});
    setFormError(null);
    setIsReviewOpen(true);
  };

  const getMatchedAssignment = (assignmentId: number) => {
    return assignments.find((a) => a.id === assignmentId);
  };

  const validateForm = () => {
    const errors: typeof formErrors = {};
    if (!selectedSubmission) return false;

    const matchedAssignment = getMatchedAssignment(selectedSubmission.assignmentId);
    const maxMarks = matchedAssignment ? matchedAssignment.maximumMarks : 100;

    if (formData.marks === "" || formData.marks === undefined || formData.marks === null || isNaN(Number(formData.marks))) {
      errors.marks = "Marks are required.";
    } else if (Number(formData.marks) < 0) {
      errors.marks = "Marks cannot be negative.";
    } else if (Number(formData.marks) > maxMarks) {
      errors.marks = `Marks cannot exceed the maximum marks of ${maxMarks}.`;
    }


    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!selectedSubmission || !validateForm()) return;

    setFormLoading(true);
    try {
      const payload: ReviewSubmissionDto = {
        marks: Number(formData.marks),
        feedback: formData.feedback,
      };

      await apiFetch(`/api/submission/review/${selectedSubmission.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      setSuccess(`Submission from "${selectedSubmission.studentName}" graded successfully.`);
      setIsReviewOpen(false);
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to submit grading review.";
      setFormError(msg);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "8px", color: "#0f172a" }}>
          Grading & Submissions
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "15px" }}>Evaluate student solutions, check uploaded PDF work, and assign grades</p>
      </div>

      {success && (
        <div className="alert alert-success" style={{ marginBottom: "24px" }} role="alert">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{success}</span>
        </div>
      )}

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
        <div className="auth-card" style={{ maxWidth: "none", padding: "0", overflow: "hidden", border: "1px solid var(--border-color)" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
              <thead>
                <tr style={{ background: "rgba(15, 23, 42, 0.4)", borderBottom: "1px solid var(--border-color)" }}>
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
                {submissions.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: "40px 24px", textAlign: "center", color: "var(--text-muted)", fontStyle: "italic" }}>
                      No student submissions received yet.
                    </td>
                  </tr>
                ) : (
                  submissions.map((submission) => {
                    const matchedAssignment = getMatchedAssignment(submission.assignmentId);
                    const maxMarks = matchedAssignment ? matchedAssignment.maximumMarks : "N/A";

                    return (
                      <tr key={submission.id} style={{ borderBottom: "1px solid var(--border-color)", transition: "background var(--transition-fast)" }} className="table-row-hover">
                        <td style={{ padding: "16px 24px", fontWeight: "500" }}>{submission.studentName}</td>
                        <td style={{ padding: "16px 24px" }}>{submission.assignmentTitle}</td>
                        <td style={{ padding: "16px 24px", color: "var(--text-secondary)" }}>{submission.subjectName}</td>
                        <td style={{ padding: "16px 24px", color: "var(--text-secondary)" }}>
                          {new Date(submission.submittedAt).toLocaleString()}
                        </td>
                        <td style={{ padding: "16px 24px", fontWeight: "600" }}>
                          {submission.status === SubmissionStatus.Reviewed ? `${submission.marks} / ${maxMarks}` : `- / ${maxMarks}`}
                        </td>
                        <td style={{ padding: "16px 24px" }}>
                          <span style={{
                            display: "inline-block",
                            padding: "4px 10px",
                            borderRadius: "var(--radius-full)",
                            fontSize: "12px",
                            fontWeight: "600",
                            textTransform: "uppercase",
                            color: submission.status === SubmissionStatus.Reviewed ? "var(--success)" : "var(--warning)",
                            background: submission.status === SubmissionStatus.Reviewed ? "var(--success-bg)" : "var(--warning-bg)",
                            border: submission.status === SubmissionStatus.Reviewed ? "1px solid rgba(16,185,129,0.2)" : "1px solid rgba(245,158,11,0.2)"
                          }}>
                            {submission.status === SubmissionStatus.Reviewed ? "Reviewed" : "Pending Review"}
                          </span>
                        </td>
                        <td style={{ padding: "16px 24px", textAlign: "right" }}>
                          <button className="btn btn-primary" style={{ width: "auto", padding: "6px 12px", fontSize: "12px" }} onClick={() => handleOpenReview(submission)}>
                            {submission.status === SubmissionStatus.Reviewed ? "Edit Review" : "Evaluate"}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Review Modal Form */}
      {isReviewOpen && selectedSubmission && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15,23,42,0.8)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div className="auth-card" style={{ maxWidth: "560px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "8px" }}>Review Submission</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "20px" }}>
              Student: <strong style={{ color: "var(--text-primary)" }}>{selectedSubmission.studentName}</strong> | Assignment: <strong style={{ color: "var(--text-primary)" }}>{selectedSubmission.assignmentTitle}</strong>
            </p>

            {formError && (
              <div className="alert alert-danger" style={{ marginBottom: "20px" }}>
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit}>
              {/* Document/PDF viewer row */}
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "16px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "14px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "8px" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  Uploaded Student Answer PDF
                </span>
                <a
                  href={`http://localhost:5145${selectedSubmission.fileUrl}`}
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
                  View File
                </a>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="marks">
                  Marks (Max: {getMatchedAssignment(selectedSubmission.assignmentId)?.maximumMarks ?? "N/A"})
                </label>
                <input
                  type="number"
                  id="marks"
                  className={`form-control ${formErrors.marks ? "is-invalid" : ""}`}
                  placeholder="Enter score"
                  value={formData.marks}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData(prev => ({ ...prev, marks: val === "" ? "" : Number(val) }));
                    if (formErrors.marks) setFormErrors(prev => ({ ...prev, marks: undefined }));
                  }}
                  disabled={formLoading}
                />
                {formErrors.marks && <span className="error-message">{formErrors.marks}</span>}
              </div>

              <div className="form-group" style={{ marginTop: "16px" }}>
                <label className="form-label" htmlFor="feedback">Evaluation Feedback</label>
                <textarea
                  id="feedback"
                  className={`form-control ${formErrors.feedback ? "is-invalid" : ""}`}
                  style={{ minHeight: "100px", resize: "vertical" }}
                  placeholder="Provide comments, corrections, and grading breakdown..."
                  value={formData.feedback}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, feedback: e.target.value }));
                    if (formErrors.feedback) setFormErrors(prev => ({ ...prev, feedback: undefined }));
                  }}
                  disabled={formLoading}
                />
                {formErrors.feedback && <span className="error-message">{formErrors.feedback}</span>}
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "32px" }}>
                <button type="button" className="btn" style={{ background: "rgba(255,255,255,0.05)" }} onClick={() => setIsReviewOpen(false)} disabled={formLoading}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={formLoading}>
                  {formLoading ? <span className="btn-spinner"></span> : null}
                  Submit Grade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
