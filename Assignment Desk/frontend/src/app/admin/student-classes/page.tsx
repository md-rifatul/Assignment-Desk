"use client";

import React, { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { UserResponseDto, ClassResponseDto, StudentClassResponseDto, CreateStudentClassDto } from "@/types";

export default function AdminStudentClassesPage() {
  const [students, setStudents] = useState<UserResponseDto[]>([]);
  const [classes, setClasses] = useState<ClassResponseDto[]>([]);
  const [assignments, setAssignments] = useState<StudentClassResponseDto[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modals/Forms State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<StudentClassResponseDto | null>(null);
  const [formData, setFormData] = useState<CreateStudentClassDto>({
    studentId: 0,
    classId: 0,
  });

  const [formErrors, setFormErrors] = useState<{ studentId?: string; classId?: string }>({});
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Search/Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClassFilter, setSelectedClassFilter] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [allUsers, allClasses, allAssignments] = await Promise.all([
        apiFetch<UserResponseDto[]>("/api/user/all"),
        apiFetch<ClassResponseDto[]>("/api/class/all"),
        apiFetch<StudentClassResponseDto[]>("/api/studentclass/all"),
      ]);

      setStudents(allUsers.filter((u) => u.role === "Student"));
      setClasses(allClasses || []);
      setAssignments(allAssignments || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load management data.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const validateForm = () => {
    const errors: { studentId?: string; classId?: string } = {};
    if (!formData.studentId) {
      errors.studentId = "Please select a student.";
    }
    if (!formData.classId) {
      errors.classId = "Please select a class.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenCreate = () => {
    setFormData({ studentId: 0, classId: classes[0]?.id || 0 });
    setSelectedAssignment(null);
    setFormErrors({});
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: StudentClassResponseDto) => {
    setSelectedAssignment(item);
    setFormData({
      studentId: item.studentId,
      classId: classes.find((c) => c.name === item.className)?.id || 0,
    });
    setFormErrors({});
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccess(null);

    if (!validateForm()) return;

    setFormLoading(true);
    try {
      if (selectedAssignment) {
        // Update student class assignment
        // Note: Route is update{id} without slash
        await apiFetch(`/api/studentclass/update${selectedAssignment.id}`, {
          method: "POST",
          body: JSON.stringify(formData),
        });
        setSuccess(`Updated class assignment successfully.`);
      } else {
        // Create student class assignment
        await apiFetch("/api/studentclass/create", {
          method: "POST",
          body: JSON.stringify(formData),
        });
        const student = students.find((s) => s.id === formData.studentId);
        setSuccess(`Assigned student "${student?.fullName}" successfully.`);
      }
      setIsFormOpen(false);
      fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save assignment.";
      setFormError(msg);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number, studentName: string) => {
    if (!confirm(`Are you sure you want to remove student "${studentName}" from their class?`)) {
      return;
    }

    setError(null);
    setSuccess(null);
    try {
      await apiFetch(`/api/studentclass/delete/${id}`, {
        method: "DELETE",
      });
      setSuccess(`Removed student "${studentName}" from class successfully.`);
      fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to remove assignment.";
      setError(msg);
    }
  };

  // Filtered assignments
  const filteredAssignments = assignments.filter((a) => {
    const matchesSearch = a.studentName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = selectedClassFilter === "" || a.className === selectedClassFilter;
    
    return matchesSearch && matchesClass;
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "8px", color: "#0f172a" }}>
            Student-Class Management
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "15px" }}>Assign and allocate students into academic classes</p>
        </div>
        <button className="btn btn-primary" style={{ width: "auto" }} onClick={handleOpenCreate} disabled={students.length === 0 || classes.length === 0}>
          + Assign Class
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

      {/* Filter and Search Section */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "24px", flexDirection: "row", flexWrap: "wrap" }}>
        <input
          type="text"
          className="form-control"
          placeholder="Search by student name..."
          style={{ flex: 2, minWidth: "240px" }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select
          className="form-control"
          style={{ flex: 1, minWidth: "180px", background: "rgba(15, 23, 42, 0.95)" }}
          value={selectedClassFilter}
          onChange={(e) => setSelectedClassFilter(e.target.value)}
        >
          <option value="">All Classes</option>
          {classes.map((c) => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>
      </div>

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
                  <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: "600" }}>Student Name</th>
                  <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: "600" }}>Class Name</th>
                  <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: "600", textAlign: "right", width: "180px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssignments.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ padding: "40px 24px", textAlign: "center", color: "var(--text-muted)" }}>
                      No student-class assignments found.
                    </td>
                  </tr>
                ) : (
                  filteredAssignments.map((item) => (
                    <tr key={item.id} style={{ borderBottom: "1px solid var(--border-color)", transition: "background var(--transition-fast)" }} className="table-row-hover">
                      <td style={{ padding: "16px 24px", fontWeight: "500" }}>{item.studentName}</td>
                      <td style={{ padding: "16px 24px", color: "var(--success)" }}>{item.className}</td>
                      <td style={{ padding: "16px 24px", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "8px" }}>
                          <button className="btn" style={{ width: "auto", padding: "6px 12px", fontSize: "12px", background: "rgba(99, 102, 241, 0.1)", color: "var(--primary)" }} onClick={() => handleOpenEdit(item)}>
                            Change Class
                          </button>
                          <button className="btn" style={{ width: "auto", padding: "6px 12px", fontSize: "12px", background: "rgba(239, 68, 68, 0.1)", color: "var(--danger)" }} onClick={() => handleDelete(item.id, item.studentName)}>
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Assign / Change Class Modal Form */}
      {isFormOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15,23,42,0.8)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div className="auth-card" style={{ maxWidth: "480px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "20px" }}>
              {selectedAssignment ? "Change Student Class" : "Assign Student to Class"}
            </h2>

            {formError && (
              <div className="alert alert-danger" style={{ marginBottom: "20px" }}>
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="studentId">Select Student</label>
                <select
                  id="studentId"
                  className={`form-control ${formErrors.studentId ? "is-invalid" : ""}`}
                  style={{ background: "rgba(15, 23, 42, 0.95)" }}
                  value={formData.studentId}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, studentId: parseInt(e.target.value) }));
                    if (formErrors.studentId) setFormErrors(prev => ({ ...prev, studentId: undefined }));
                  }}
                  disabled={formLoading || !!selectedAssignment}
                >
                  <option value={0} disabled>-- Select a Student --</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>{s.fullName} ({s.email})</option>
                  ))}
                </select>
                {formErrors.studentId && <span className="error-message">{formErrors.studentId}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="classId">Select Class</label>
                <select
                  id="classId"
                  className={`form-control ${formErrors.classId ? "is-invalid" : ""}`}
                  style={{ background: "rgba(15, 23, 42, 0.95)" }}
                  value={formData.classId}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, classId: parseInt(e.target.value) }));
                    if (formErrors.classId) setFormErrors(prev => ({ ...prev, classId: undefined }));
                  }}
                  disabled={formLoading}
                >
                  <option value={0} disabled>-- Select a Class --</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {formErrors.classId && <span className="error-message">{formErrors.classId}</span>}
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "32px" }}>
                <button type="button" className="btn" style={{ background: "rgba(255,255,255,0.05)" }} onClick={() => setIsFormOpen(false)} disabled={formLoading}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={formLoading}>
                  {formLoading ? <span className="btn-spinner"></span> : null}
                  {selectedAssignment ? "Update" : "Assign"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
