"use client";

import React, { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { AssignmentResponseDto, AssignmentStatus, SubmissionResponseDto, SubmissionStatus } from "@/types";

export default function StudentAssignmentsPage() {
  const [assignments, setAssignments] = useState<AssignmentResponseDto[]>([]);
  const [submissionsList, setSubmissionsList] = useState<SubmissionResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal / Detail panel states
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentResponseDto | null>(null);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);

  // Submission State
  const [submission, setSubmission] = useState<SubmissionResponseDto | null>(null);
  const [fetchingSubmission, setFetchingSubmission] = useState(false);
  const [showResubmit, setShowResubmit] = useState(false); // Collapsible resubmission panel

  // File Upload State
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const fetchAssignments = async () => {
    setLoading(true);
    setError(null);
    try {
      const [data, subs] = await Promise.all([
        apiFetch<AssignmentResponseDto[]>("/api/assignment/student/my-assignments"),
        apiFetch<SubmissionResponseDto[]>("/api/submission/my-submissions").catch((err) => {
          console.warn("Failed to load submissions list:", err);
          return [] as SubmissionResponseDto[];
        })
      ]);

      const published = (data || []).filter(a => a.status === AssignmentStatus.Publish);
      setAssignments(published);
      setSubmissionsList(subs || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load class assignments.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleOpenDetails = async (assignment: AssignmentResponseDto) => {
    setSelectedAssignment(assignment);
    setPdfFile(null);
    setUploadError(null);
    setUploadSuccess(null);
    setSubmission(null);
    setShowResubmit(false);
    setIsSubmitOpen(true);
    setFetchingSubmission(true);

    try {
      const subData = await apiFetch<SubmissionResponseDto | null>(`/api/submission/get/${assignment.id}`);
      if (subData && subData.id) {
        setSubmission(subData);
      }
    } catch (err: unknown) {
      console.log("No existing submission found or error fetching:", err);
    } finally {
      setFetchingSubmission(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    setUploadSuccess(null);
    const files = e.target.files;
    if (!files || files.length === 0) {
      setPdfFile(null);
      return;
    }

    const file = files[0];
    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      setUploadError("Only PDF files are allowed.");
      setPdfFile(null);
      return;
    }

    setPdfFile(file);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);
    setUploadSuccess(null);

    if (!selectedAssignment) return;

    if (!pdfFile) {
      setUploadError("Please select a PDF file to submit.");
      return;
    }

    const isPastDeadline = new Date(selectedAssignment.deadline).getTime() < Date.now();
    if (isPastDeadline) {
      setUploadError("The submission deadline for this assignment has passed.");
      return;
    }

    setUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append("assignmentId", selectedAssignment.id.toString());
      formData.append("pdfFile", pdfFile);

      await apiFetch("/api/submission/submit", {
        method: "POST",
        body: formData,
      });

      setUploadSuccess("Your solution has been submitted successfully!");
      setPdfFile(null);

      // Reload submission info
      const subData = await apiFetch<SubmissionResponseDto | null>(`/api/submission/get/${selectedAssignment.id}`);
      if (subData && subData.id) {
        setSubmission(subData);
      }

      fetchAssignments();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to submit assignment.";
      setUploadError(msg);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleResubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);
    setUploadSuccess(null);

    if (!selectedAssignment || !pdfFile) return;

    if (submission?.status === SubmissionStatus.Reviewed) {
      setUploadError("This assignment has already been reviewed/graded. Resubmissions are closed.");
      return;
    }

    const isPastDeadline = new Date(selectedAssignment.deadline).getTime() < Date.now();
    if (isPastDeadline) {
      setUploadError("The submission deadline has passed. Resubmissions are closed.");
      return;
    }

    setUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append("pdfFile", pdfFile);

      await apiFetch(`/api/submission/resubmit/${selectedAssignment.id}`, {
        method: "PUT",
        body: formData,
      });

      setUploadSuccess("Your solution has been updated/resubmitted successfully!");
      setPdfFile(null);
      setShowResubmit(false); // Close resubmit accordion panel

      // Reload submission info
      const subData = await apiFetch<SubmissionResponseDto | null>(`/api/submission/get/${selectedAssignment.id}`);
      if (subData && subData.id) {
        setSubmission(subData);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to resubmit assignment.";
      setUploadError(msg);
    } finally {
      setUploadLoading(false);
    }
  };

  const formatDeadline = (dateStr: string) => {
    const d = new Date(dateStr);
    return {
      formatted: d.toLocaleString(),
      isPast: d.getTime() < Date.now(),
      isUrgent: d.getTime() - Date.now() < 86400000 && d.getTime() > Date.now(),
    };
  };

  return (
    <div>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "8px", background: "linear-gradient(to right, #ffffff, #94a3b8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Class Assignments
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "15px" }}>Active assignments published for your course</p>
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
          {assignments.length === 0 ? (
            <div className="auth-card" style={{ gridColumn: "1 / -1", maxWidth: "none", padding: "48px", textAlign: "center", color: "var(--text-secondary)" }}>
              No assignments available at this moment.
            </div>
          ) : (
            assignments.map((assignment) => {
              const deadline = formatDeadline(assignment.deadline);
              const hasSubmitted = submissionsList.some(s => s.assignmentId === assignment.id);

              let statusLabel = "";
              let statusColor = "";
              let statusBg = "";

              if (hasSubmitted) {
                statusLabel = "Submitted";
                statusColor = "#10b981"; // Success Green
                statusBg = "rgba(16, 185, 129, 0.1)";
              } else if (deadline.isPast) {
                statusLabel = "Overdue";
                statusColor = "#ef4444"; // Danger Red
                statusBg = "rgba(239, 68, 68, 0.1)";
              } else {
                statusLabel = "Pending";
                statusColor = "#f59e0b"; // Warning Orange
                statusBg = "rgba(245, 158, 11, 0.1)";
              }

              return (
                <div key={assignment.id} className="auth-card" style={{ maxWidth: "none", padding: "28px", display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%", background: "radial-gradient(circle at top right, rgba(99,102,241,0.02), transparent 70%), var(--bg-card)", border: "1px solid var(--border-color)" }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                      <span style={{ fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px", color: "var(--primary)", background: "rgba(99,102,241,0.1)", padding: "4px 8px", borderRadius: "var(--radius-sm)" }}>
                        {assignment.subjectName}
                      </span>
                      <span style={{
                        fontSize: "11px",
                        fontWeight: "600",
                        textTransform: "uppercase",
                        padding: "4px 8px",
                        borderRadius: "var(--radius-full)",
                        color: statusColor,
                        background: statusBg,
                        border: `1px solid ${statusColor}33`
                      }}>
                        {statusLabel}
                      </span>
                    </div>

                    <h3 style={{ fontSize: "18px", fontWeight: "600", color: "var(--text-primary)", marginBottom: "12px" }}>
                      {assignment.title}
                    </h3>
                    
                    <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: "1.5", marginBottom: "20px", display: "-webkit-box", WebkitLineClamp: "3", WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {assignment.description}
                    </p>
                  </div>

                  <div>
                    <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "16px", marginBottom: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Marks:</span>
                        <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)" }}>{assignment.maximumMarks} Points</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Deadline:</span>
                        <span style={{
                          fontSize: "13px",
                          fontWeight: "600",
                          color: deadline.isPast ? "var(--text-secondary)" : deadline.isUrgent ? "var(--danger)" : "var(--text-primary)"
                        }}>
                          {deadline.isPast ? "Passed" : deadline.formatted}
                        </span>
                      </div>
                    </div>

                    <button className="btn btn-primary" style={{ width: "100%" }} onClick={() => handleOpenDetails(assignment)}>
                      View Details & Submit
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Assignment Details and Submit Modal */}
      {isSubmitOpen && selectedAssignment && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15,23,42,0.8)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div className="auth-card" style={{ maxWidth: "580px", width: "95%", maxHeight: "90vh", overflowY: "auto", padding: "36px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px", color: "var(--primary)", background: "rgba(99,102,241,0.1)", padding: "4px 8px", borderRadius: "var(--radius-sm)" }}>
                  {selectedAssignment.subjectName}
                </span>
                <h2 style={{ fontSize: "22px", fontWeight: "700", marginTop: "8px" }}>{selectedAssignment.title}</h2>
              </div>
              <button style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", padding: "4px" }} onClick={() => setIsSubmitOpen(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "28px", fontSize: "14px" }}>
              <div>
                <label style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "600", letterSpacing: "0.5px" }}>Description</label>
                <p style={{ marginTop: "4px", whiteSpace: "pre-line", color: "var(--text-secondary)", lineHeight: "1.6" }}>{selectedAssignment.description}</p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", borderTop: "1px solid var(--border-color)", borderBottom: "1px solid var(--border-color)", padding: "16px 0" }}>
                <div>
                  <label style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "600", letterSpacing: "0.5px" }}>Maximum Marks</label>
                  <p style={{ marginTop: "2px", fontWeight: "600", color: "var(--primary)", fontSize: "16px" }}>{selectedAssignment.maximumMarks} Points</p>
                </div>
                <div>
                  <label style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "600", letterSpacing: "0.5px" }}>Due Date</label>
                  <p style={{
                    marginTop: "2px",
                    fontWeight: "600",
                    fontSize: "14px",
                    color: formatDeadline(selectedAssignment.deadline).isPast ? "var(--text-secondary)" : formatDeadline(selectedAssignment.deadline).isUrgent ? "var(--danger)" : "var(--text-primary)"
                  }}>
                    {new Date(selectedAssignment.deadline).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Submission Section */}
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px" }}>Submission Details</h3>
              
              {uploadSuccess && (
                <div className="alert alert-success" style={{ marginBottom: "20px" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>{uploadSuccess}</span>
                </div>
              )}

              {uploadError && (
                <div className="alert alert-danger" style={{ marginBottom: "20px" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{uploadError}</span>
                </div>
              )}

              {fetchingSubmission ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "20px 0" }}>
                  <div className="btn-spinner" style={{ width: "24px", height: "24px", borderTopColor: "var(--primary)" }}></div>
                </div>
              ) : submission ? (
                /* IF PREVIOUS SUBMISSION EXISTS */
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  
                  {/* Verified green submission status banner */}
                  <div style={{
                    background: "linear-gradient(to right, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05))",
                    border: "1px solid rgba(16, 185, 129, 0.25)",
                    borderRadius: "var(--radius-md)",
                    padding: "16px 20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ background: "rgba(16, 185, 129, 0.2)", color: "var(--success)", padding: "6px", borderRadius: "var(--radius-sm)", display: "flex" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <div>
                        <h4 style={{ fontSize: "14px", fontWeight: "600", color: "#34d399", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                          Assignment Submitted
                        </h4>
                        <p style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px" }}>
                          {new Date(submission.submittedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <span style={{
                      display: "inline-block",
                      padding: "4px 10px",
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

                  {/* Actions right at the top */}
                  <div style={{ display: "grid", gridTemplateColumns: !formatDeadline(selectedAssignment.deadline).isPast && submission.status !== SubmissionStatus.Reviewed ? "1fr 1fr" : "1fr", gap: "12px", marginTop: "4px" }}>
                    <a
                      href={`http://localhost:5145${submission.fileUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn"
                      style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontSize: "13px", padding: "10px", background: "rgba(255,255,255,0.04)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                      View Submitted PDF
                    </a>

                    {!formatDeadline(selectedAssignment.deadline).isPast && submission.status !== SubmissionStatus.Reviewed && (
                      <button
                        type="button"
                        className="btn"
                        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontSize: "13px", padding: "10px", background: showResubmit ? "rgba(99,102,241,0.15)" : "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.2)", color: "var(--primary)" }}
                        onClick={() => {
                          setShowResubmit(!showResubmit);
                          setPdfFile(null);
                          setUploadError(null);
                          setUploadSuccess(null);
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                        </svg>
                        {showResubmit ? "Cancel Resubmit" : "Resubmit solution"}
                      </button>
                    )}
                  </div>

                  {/* Resubmission dropdown panel (renders right here at the top when toggled) */}
                  {showResubmit && !formatDeadline(selectedAssignment.deadline).isPast && submission.status !== SubmissionStatus.Reviewed && (
                    <form onSubmit={handleResubmit} style={{ background: "rgba(255, 255, 255, 0.01)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "16px", marginTop: "4px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <div style={{ border: "2px dashed var(--border-color)", borderRadius: "var(--radius-md)", padding: "20px", textAlign: "center", position: "relative" }} className="table-row-hover">
                          <input
                            type="file"
                            accept=".pdf"
                            onChange={handleFileChange}
                            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" }}
                            disabled={uploadLoading}
                          />
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "var(--text-secondary)", marginBottom: "4px" }}>
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                          </svg>
                          <p style={{ fontSize: "13px", fontWeight: "500", color: "var(--text-primary)" }}>
                            {pdfFile ? pdfFile.name : "Select new PDF answer sheet"}
                          </p>
                          {pdfFile && (
                            <p style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px" }}>
                              {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          )}
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={uploadLoading || !pdfFile} style={{ alignSelf: "flex-start", width: "auto", padding: "10px 20px" }}>
                          {uploadLoading ? <span className="btn-spinner" style={{ marginRight: "8px" }}></span> : null}
                          Upload & Resubmit
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Submission details metadata below */}
                  <div style={{ background: "rgba(255, 255, 255, 0.01)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "16px", display: "flex", flexDirection: "column", gap: "12px", marginTop: "4px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Obtained Marks:</span>
                      <span style={{ fontSize: "15px", fontWeight: "700", color: "var(--primary)" }}>
                        {submission.status === SubmissionStatus.Reviewed ? `${submission.marks} / ${selectedAssignment.maximumMarks}` : `Pending review`}
                      </span>
                    </div>

                    {submission.feedback && (
                      <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "12px", marginTop: "4px" }}>
                        <label style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "600", letterSpacing: "0.5px" }}>Teacher Feedback</label>
                        <p style={{ marginTop: "4px", fontSize: "13px", color: "var(--text-secondary)", fontStyle: "italic", background: "rgba(255,255,255,0.01)", padding: "10px", borderRadius: "var(--radius-sm)", borderLeft: "2px solid var(--primary)", lineHeight: "1.5" }}>
                          &ldquo;{submission.feedback}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                    <button type="button" className="btn" style={{ background: "rgba(255,255,255,0.05)" }} onClick={() => setIsSubmitOpen(false)}>
                      Close Details
                    </button>
                  </div>

                </div>
              ) : formatDeadline(selectedAssignment.deadline).isPast ? (
                /* IF EXPIRED AND NO SUBMISSION */
                <div className="alert alert-danger" style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)", color: "var(--danger)" }}>
                  <span>This assignment is closed. No submissions were recorded.</span>
                </div>
              ) : (
                /* STANDARD NEW SUBMISSION FORM */
                <form onSubmit={handleFormSubmit}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ border: "2px dashed var(--border-color)", borderRadius: "var(--radius-md)", padding: "28px", textAlign: "center", cursor: "pointer", position: "relative" }} className="table-row-hover">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" }}
                        disabled={uploadLoading}
                      />
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "var(--text-secondary)", marginBottom: "8px" }}>
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      <p style={{ fontSize: "14px", fontWeight: "500", color: "var(--text-primary)" }}>
                        {pdfFile ? pdfFile.name : "Click to select PDF answer sheet"}
                      </p>
                      <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                        {pdfFile ? `${(pdfFile.size / 1024 / 1024).toFixed(2)} MB` : "Only PDF files allowed"}
                      </p>
                    </div>

                    <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
                      <button type="button" className="btn" style={{ background: "rgba(255,255,255,0.05)" }} onClick={() => setIsSubmitOpen(false)} disabled={uploadLoading}>
                        Close
                      </button>
                      <button type="submit" className="btn btn-primary" disabled={uploadLoading || !pdfFile}>
                        {uploadLoading ? <span className="btn-spinner"></span> : null}
                        Submit Work
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
