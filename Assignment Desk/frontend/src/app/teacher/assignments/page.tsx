"use client";

import React, { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { AssignmentResponseDto, CreateAssignmentDto, ClassResponseDto, SubjectResponseDto, AssignmentStatus, TeacherSubjectResponseDto } from "@/types";

export default function TeacherAssignmentsPage() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<AssignmentResponseDto[]>([]);
  const [classes, setClasses] = useState<ClassResponseDto[]>([]);
  const [subjects, setSubjects] = useState<SubjectResponseDto[]>([]);
  const [teacherAllocations, setTeacherAllocations] = useState<{
    subjectId: number;
    subjectName: string;
    classId: number;
    className: string;
  }[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modal controls
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentResponseDto | null>(null);

  // Form states
  const [formData, setFormData] = useState<CreateAssignmentDto>({
    title: "",
    description: "",
    deadline: "",
    maximumMarks: 100,
    status: AssignmentStatus.Draft,
    classId: 0,
    subjectId: 0,
  });

  const [formErrors, setFormErrors] = useState<{
    title?: string;
    description?: string;
    classId?: string;
    subjectId?: string;
    deadline?: string;
    maximumMarks?: string;
  }>({});
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Fetch all assignments, classes, subjects and teacher's allocated subjects
  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const [allAssignments, allClasses, allSubjects, myAllocations] = await Promise.all([
        apiFetch<AssignmentResponseDto[]>("/api/assignment/all"),
        apiFetch<ClassResponseDto[]>("/api/class/all"),
        apiFetch<SubjectResponseDto[]>("/api/subject/all"),
        apiFetch<TeacherSubjectResponseDto[]>(`/api/teachersubject/get${user.id}`).catch((err) => {
          console.warn("Failed to load teacher allocations:", err);
          return [] as TeacherSubjectResponseDto[];
        }),
      ]);

      setAssignments(allAssignments || []);
      setClasses(allClasses || []);
      setSubjects(allSubjects || []);

      // Map teacher allocations to include Class Details
      const mappedAllocations = (myAllocations || []).map(as => {
        const matchSub = (allSubjects || []).find(s => s.id === as.subjectId);
        const matchClass = matchSub ? (allClasses || []).find(c => c.id === matchSub.classId) : null;
        return {
          subjectId: as.subjectId,
          subjectName: as.subjectName,
          classId: matchSub ? matchSub.classId : 0,
          className: matchClass ? matchClass.name : "N/A"
        };
      }).filter(alloc => alloc.classId > 0);

      setTeacherAllocations(mappedAllocations);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load assignment data.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, loadData]);

  const formatDateTimeLocal = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  const validateForm = () => {
    const errors: typeof formErrors = {};
    if (!formData.title.trim()) {
      errors.title = "Assignment title is required.";
    }
    if (!formData.description.trim()) {
      errors.description = "Description is required.";
    }
    if (!formData.classId) {
      errors.classId = "Please select a target class.";
    }
    if (!formData.subjectId) {
      errors.subjectId = "Please select a subject.";
    }
    if (!formData.deadline) {
      errors.deadline = "Deadline date and time is required.";
    } else {
      const deadlineDate = new Date(formData.deadline);
      if (deadlineDate.getTime() < Date.now()) {
        errors.deadline = "Deadline must be in the future.";
      }
    }
    if (formData.maximumMarks <= 0) {
      errors.maximumMarks = "Maximum marks must be greater than 0.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenCreate = () => {
    setFormData({
      title: "",
      description: "",
      deadline: "",
      maximumMarks: 100,
      status: AssignmentStatus.Draft,
      classId: 0,
      subjectId: 0,
    });
    setSelectedAssignment(null);
    setFormErrors({});
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (assignment: AssignmentResponseDto) => {
    // Attempt client-side lookup of subjectId and classId based on subject name mapping
    const matchedSubject = subjects.find(s => s.name === assignment.subjectName);
    
    setSelectedAssignment(assignment);
    setFormData({
      title: assignment.title,
      description: assignment.description,
      deadline: formatDateTimeLocal(assignment.deadline),
      maximumMarks: Number(assignment.maximumMarks),
      status: assignment.status,
      classId: matchedSubject ? matchedSubject.classId : 0,
      subjectId: matchedSubject ? matchedSubject.id : 0,
    });
    setFormErrors({});
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleOpenDetails = (assignment: AssignmentResponseDto) => {
    setSelectedAssignment(assignment);
    setIsDetailsOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!validateForm()) return;

    setFormLoading(true);
    try {
      const payload = {
        ...formData,
        // Convert datetime-local string to UTC ISO string
        deadline: new Date(formData.deadline).toISOString(),
        maximumMarks: Number(formData.maximumMarks),
        status: Number(formData.status) as AssignmentStatus
      };

      if (selectedAssignment) {
        // Edit update
        await apiFetch(`/api/assignment/update/${selectedAssignment.id}`, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setSuccess(`Assignment "${payload.title}" updated successfully.`);
      } else {
        // Create new
        await apiFetch("/api/assignment/create", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setSuccess(`Assignment "${payload.title}" created successfully.`);
      }
      setIsFormOpen(false);
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save assignment.";
      setFormError(msg);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Are you sure you want to delete assignment "${title}"?`)) return;

    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await apiFetch(`/api/assignment/delete?id=${id}`, {
        method: "POST",
      });
      setSuccess(`Assignment "${title}" deleted successfully.`);
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete assignment.";
      setError(msg);
      setLoading(false);
    }
  };

  // Filter classes based on teacher allocations
  const allocatedClasses = classes.filter(c => 
    teacherAllocations.some(alloc => alloc.classId === c.id)
  );

  // Filter subjects based on selected class and teacher allocations
  const filteredSubjects = teacherAllocations.filter(alloc => 
    alloc.classId === formData.classId
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "8px", background: "linear-gradient(to right, #ffffff, #94a3b8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Manage Assignments
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "15px" }}>Create and publish classroom assignments and grading requirements</p>
        </div>
        <button className="btn btn-primary" style={{ width: "auto" }} onClick={handleOpenCreate}>
          + Create Assignment
        </button>
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
                  <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: "600" }}>Title</th>
                  <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: "600" }}>Subject</th>
                  <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: "600" }}>Class</th>
                  <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: "600" }}>Deadline</th>
                  <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: "600" }}>Max Marks</th>
                  <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: "600" }}>Status</th>
                  <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: "600", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignments.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: "40px 24px", textAlign: "center", color: "var(--text-muted)" }}>
                      No assignments created yet.
                    </td>
                  </tr>
                ) : (
                  assignments.map((assignment) => {
                    const matchedSubject = subjects.find(s => s.name === assignment.subjectName);
                    const matchedClass = matchedSubject ? classes.find(c => c.id === matchedSubject.classId) : null;

                    return (
                      <tr key={assignment.id} style={{ borderBottom: "1px solid var(--border-color)", transition: "background var(--transition-fast)" }} className="table-row-hover">
                        <td style={{ padding: "16px 24px", fontWeight: "500" }}>{assignment.title}</td>
                        <td style={{ padding: "16px 24px" }}>{assignment.subjectName}</td>
                        <td style={{ padding: "16px 24px", color: "var(--text-secondary)" }}>
                          {matchedClass ? matchedClass.name : "N/A"}
                        </td>
                        <td style={{ padding: "16px 24px", color: "var(--text-secondary)" }}>
                          {new Date(assignment.deadline).toLocaleString()}
                        </td>
                        <td style={{ padding: "16px 24px", fontWeight: "600" }}>{assignment.maximumMarks}</td>
                        <td style={{ padding: "16px 24px" }}>
                          <span style={{
                            display: "inline-block",
                            padding: "4px 10px",
                            borderRadius: "var(--radius-full)",
                            fontSize: "12px",
                            fontWeight: "600",
                            textTransform: "uppercase",
                            color: assignment.status === AssignmentStatus.Publish ? "var(--success)" : "var(--text-secondary)",
                            background: assignment.status === AssignmentStatus.Publish ? "var(--success-bg)" : "rgba(255,255,255,0.05)",
                            border: assignment.status === AssignmentStatus.Publish ? "1px solid rgba(16,185,129,0.2)" : "1px solid var(--border-color)"
                          }}>
                            {assignment.status === AssignmentStatus.Publish ? "Published" : "Draft"}
                          </span>
                        </td>
                        <td style={{ padding: "16px 24px", textAlign: "right" }}>
                          <div style={{ display: "inline-flex", gap: "8px" }}>
                            <button className="btn" style={{ width: "auto", padding: "6px 12px", fontSize: "12px", background: "rgba(255,255,255,0.05)" }} onClick={() => handleOpenDetails(assignment)}>
                              View
                            </button>
                            <button className="btn" style={{ width: "auto", padding: "6px 12px", fontSize: "12px", background: "rgba(99,102,241,0.1)", color: "var(--primary)" }} onClick={() => handleOpenEdit(assignment)}>
                              Edit
                            </button>
                            <button className="btn" style={{ width: "auto", padding: "6px 12px", fontSize: "12px", background: "rgba(239,68,68,0.1)", color: "var(--danger)" }} onClick={() => handleDelete(assignment.id, assignment.title)}>
                              Delete
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
      )}

      {/* Create / Edit Modal Form */}
      {isFormOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15,23,42,0.8)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div className="auth-card" style={{ maxWidth: "560px", maxHeight: "90vh", overflowY: "auto" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "20px" }}>
              {selectedAssignment ? "Edit Assignment Details" : "Create New Assignment"}
            </h2>

            {formError && (
              <div className="alert alert-danger" style={{ marginBottom: "20px" }}>
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="title">Assignment Title</label>
                <input
                  type="text"
                  id="title"
                  className={`form-control ${formErrors.title ? "is-invalid" : ""}`}
                  placeholder="Term Exam / Homework 1..."
                  value={formData.title}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, title: e.target.value }));
                    if (formErrors.title) setFormErrors(prev => ({ ...prev, title: undefined }));
                  }}
                  disabled={formLoading}
                />
                {formErrors.title && <span className="error-message">{formErrors.title}</span>}
              </div>

              <div className="form-group" style={{ marginTop: "16px" }}>
                <label className="form-label" htmlFor="description">Assignment Description</label>
                <textarea
                  id="description"
                  className={`form-control ${formErrors.description ? "is-invalid" : ""}`}
                  style={{ minHeight: "100px", resize: "vertical" }}
                  placeholder="Provide instruction guidelines..."
                  value={formData.description}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, description: e.target.value }));
                    if (formErrors.description) setFormErrors(prev => ({ ...prev, description: undefined }));
                  }}
                  disabled={formLoading}
                />
                {formErrors.description && <span className="error-message">{formErrors.description}</span>}
              </div>

              <div className="grid grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "16px" }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="classId">Select Class</label>
                  <select
                    id="classId"
                    className={`form-control ${formErrors.classId ? "is-invalid" : ""}`}
                    style={{ background: "rgba(15, 23, 42, 0.95)" }}
                    value={formData.classId}
                    onChange={(e) => {
                      const cid = parseInt(e.target.value);
                      setFormData(prev => ({ ...prev, classId: cid, subjectId: 0 }));
                      if (formErrors.classId) setFormErrors(prev => ({ ...prev, classId: undefined }));
                    }}
                    disabled={formLoading}
                  >
                    <option value={0}>-- Class --</option>
                    {allocatedClasses.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  {formErrors.classId && <span className="error-message">{formErrors.classId}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="subjectId">Select Subject</label>
                  <select
                    id="subjectId"
                    className={`form-control ${formErrors.subjectId ? "is-invalid" : ""}`}
                    style={{ background: "rgba(15, 23, 42, 0.95)" }}
                    value={formData.subjectId}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, subjectId: parseInt(e.target.value) }));
                      if (formErrors.subjectId) setFormErrors(prev => ({ ...prev, subjectId: undefined }));
                    }}
                    disabled={formLoading || !formData.classId}
                  >
                    <option value={0}>-- Subject --</option>
                    {filteredSubjects.map(s => (
                      <option key={s.subjectId} value={s.subjectId}>{s.subjectName}</option>
                    ))}
                  </select>
                  {formErrors.subjectId && <span className="error-message">{formErrors.subjectId}</span>}
                </div>
              </div>

              <div className="grid grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "16px" }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="deadline">Deadline</label>
                  <input
                    type="datetime-local"
                    id="deadline"
                    className={`form-control ${formErrors.deadline ? "is-invalid" : ""}`}
                    value={formData.deadline}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, deadline: e.target.value }));
                      if (formErrors.deadline) setFormErrors(prev => ({ ...prev, deadline: undefined }));
                    }}
                    disabled={formLoading}
                  />
                  {formErrors.deadline && <span className="error-message">{formErrors.deadline}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="maximumMarks">Max Marks</label>
                  <input
                    type="number"
                    id="maximumMarks"
                    className={`form-control ${formErrors.maximumMarks ? "is-invalid" : ""}`}
                    value={formData.maximumMarks}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, maximumMarks: Number(e.target.value) }));
                      if (formErrors.maximumMarks) setFormErrors(prev => ({ ...prev, maximumMarks: undefined }));
                    }}
                    disabled={formLoading}
                  />
                  {formErrors.maximumMarks && <span className="error-message">{formErrors.maximumMarks}</span>}
                </div>
              </div>

              <div className="form-group" style={{ marginTop: "16px" }}>
                <label className="form-label" htmlFor="status">Publishing Status</label>
                <select
                  id="status"
                  className="form-control"
                  style={{ background: "rgba(15, 23, 42, 0.95)" }}
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: parseInt(e.target.value) }))}
                  disabled={formLoading}
                >
                  <option value={AssignmentStatus.Draft}>Save as Draft (Hidden from students)</option>
                  <option value={AssignmentStatus.Publish}>Publish immediately</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "32px" }}>
                <button type="button" className="btn" style={{ background: "rgba(255,255,255,0.05)" }} onClick={() => setIsFormOpen(false)} disabled={formLoading}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={formLoading}>
                  {formLoading ? <span className="btn-spinner"></span> : null}
                  {selectedAssignment ? "Save Changes" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details View Modal */}
      {isDetailsOpen && selectedAssignment && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15,23,42,0.8)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div className="auth-card" style={{ maxWidth: "560px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "700", marginBottom: "8px" }}>{selectedAssignment.title}</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "20px" }}>
              Created on {new Date(selectedAssignment.createdAt).toLocaleDateString()}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "32px", fontSize: "15px" }}>
              <div>
                <label style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "600" }}>Description</label>
                <p style={{ marginTop: "4px", whiteSpace: "pre-line", color: "var(--text-secondary)" }}>{selectedAssignment.description}</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "600" }}>Subject</label>
                  <p style={{ marginTop: "4px", fontWeight: "500" }}>{selectedAssignment.subjectName}</p>
                </div>
                <div>
                  <label style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "600" }}>Max Marks</label>
                  <p style={{ marginTop: "4px", fontWeight: "600", color: "var(--primary)" }}>{selectedAssignment.maximumMarks}</p>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "600" }}>Deadline</label>
                  <p style={{ marginTop: "4px", color: "var(--danger)" }}>{new Date(selectedAssignment.deadline).toLocaleString()}</p>
                </div>
                <div>
                  <label style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "600" }}>Status</label>
                  <p style={{ marginTop: "4px" }}>
                    <span style={{
                      display: "inline-block",
                      padding: "4px 10px",
                      borderRadius: "var(--radius-full)",
                      fontSize: "12px",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      color: selectedAssignment.status === AssignmentStatus.Publish ? "var(--success)" : "var(--text-secondary)",
                      background: selectedAssignment.status === AssignmentStatus.Publish ? "var(--success-bg)" : "rgba(255,255,255,0.05)",
                      border: selectedAssignment.status === AssignmentStatus.Publish ? "1px solid rgba(16,185,129,0.2)" : "1px solid var(--border-color)"
                    }}>
                      {selectedAssignment.status === AssignmentStatus.Publish ? "Published" : "Draft"}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <button className="btn btn-primary" onClick={() => setIsDetailsOpen(false)}>
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
