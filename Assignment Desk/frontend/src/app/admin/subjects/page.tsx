"use client";

import React, { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { SubjectResponseDto, CreateSubjectDto, ClassResponseDto } from "@/types";

export default function AdminSubjectsPage() {
  const [subjects, setSubjects] = useState<SubjectResponseDto[]>([]);
  const [classes, setClasses] = useState<ClassResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<SubjectResponseDto | null>(null);
  const [formData, setFormData] = useState<CreateSubjectDto>({
    name: "",
    classId: 0,
  });

  const [formErrors, setFormErrors] = useState<{ name?: string; classId?: string }>({});
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Helper dictionary to lookup class name by class ID
  const classMap = React.useMemo(() => {
    const map: Record<number, string> = {};
    classes.forEach((cls) => {
      map[cls.id] = cls.name;
    });
    return map;
  }, [classes]);

  // Fetch subjects and classes
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Run concurrent requests
      const [subjectsData, classesData] = await Promise.all([
        apiFetch<SubjectResponseDto[]>("/api/subject/all"),
        apiFetch<ClassResponseDto[]>("/api/class/all"),
      ]);
      setSubjects(subjectsData || []);
      setClasses(classesData || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load subjects or classes data.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const validateForm = () => {
    const errors: { name?: string; classId?: string } = {};
    if (!formData.name.trim()) {
      errors.name = "Subject name is required.";
    }
    if (!formData.classId) {
      errors.classId = "Please select a class.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenCreate = () => {
    setFormData({ name: "", classId: classes[0]?.id || 0 });
    setSelectedSubject(null);
    setFormErrors({});
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (sub: SubjectResponseDto) => {
    setSelectedSubject(sub);
    setFormData({
      name: sub.name,
      classId: sub.classId,
    });
    setFormErrors({});
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!validateForm()) return;

    setFormLoading(true);
    try {
      if (selectedSubject) {
        // Update subject
        await apiFetch(`/api/subject/update/${selectedSubject.id}`, {
          method: "PUT",
          body: JSON.stringify(formData),
        });
        setSuccess(`Subject "${formData.name}" updated successfully.`);
      } else {
        // Create subject
        await apiFetch("/api/subject/create", {
          method: "POST",
          body: JSON.stringify(formData),
        });
        setSuccess(`Subject "${formData.name}" created successfully.`);
      }
      setIsFormOpen(false);
      fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save subject.";
      setFormError(msg);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete subject "${name}"?`)) return;

    setError(null);
    setSuccess(null);
    try {
      await apiFetch(`/api/subject/delete/${id}`, {
        method: "DELETE",
      });
      setSuccess(`Subject "${name}" deleted successfully.`);
      fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete subject.";
      setError(msg);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "8px", background: "linear-gradient(to right, #ffffff, #94a3b8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Manage Subjects
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "15px" }}>CRUD administration for academic subjects linked to classes</p>
        </div>
        <button className="btn btn-primary" style={{ width: "auto" }} onClick={handleOpenCreate} disabled={classes.length === 0}>
          + Create Subject
        </button>
      </div>

      {classes.length === 0 && !loading && (
        <div className="alert alert-danger" style={{ marginBottom: "24px" }} role="alert">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>You must create at least one Class in &quot;Manage Classes&quot; before you can register Subjects.</span>
        </div>
      )}

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
                  <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: "600", width: "120px" }}>Subject ID</th>
                  <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: "600" }}>Subject Name</th>
                  <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: "600" }}>Class Name</th>
                  <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: "600", textAlign: "right", width: "180px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subjects.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: "40px 24px", textAlign: "center", color: "var(--text-muted)" }}>
                      No subjects registered yet.
                    </td>
                  </tr>
                ) : (
                  subjects.map((sub) => (
                    <tr key={sub.id} style={{ borderBottom: "1px solid var(--border-color)", transition: "background var(--transition-fast)" }} className="table-row-hover">
                      <td style={{ padding: "16px 24px", color: "var(--text-secondary)" }}>{sub.id}</td>
                      <td style={{ padding: "16px 24px", fontWeight: "500" }}>{sub.name}</td>
                      <td style={{ padding: "16px 24px", color: "var(--text-secondary)" }}>{classMap[sub.classId] || `Class ID: ${sub.classId}`}</td>
                      <td style={{ padding: "16px 24px", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "8px" }}>
                          <button className="btn" style={{ width: "auto", padding: "6px 12px", fontSize: "12px", background: "rgba(99, 102, 241, 0.1)", color: "var(--primary)" }} onClick={() => handleOpenEdit(sub)}>
                            Edit
                          </button>
                          <button className="btn" style={{ width: "auto", padding: "6px 12px", fontSize: "12px", background: "rgba(239, 68, 68, 0.1)", color: "var(--danger)" }} onClick={() => handleDelete(sub.id, sub.name)}>
                            Delete
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

      {/* Create / Edit Modal Form */}
      {isFormOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15,23,42,0.8)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div className="auth-card" style={{ maxWidth: "480px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "20px" }}>
              {selectedSubject ? "Edit Subject" : "Create New Subject"}
            </h2>

            {formError && (
              <div className="alert alert-danger" style={{ marginBottom: "20px" }}>
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="name">Subject Name</label>
                <input
                  type="text"
                  id="name"
                  className={`form-control ${formErrors.name ? "is-invalid" : ""}`}
                  placeholder="e.g. Mathematics"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, name: e.target.value }));
                    if (formErrors.name) setFormErrors(prev => ({ ...prev, name: undefined }));
                  }}
                  disabled={formLoading}
                />
                {formErrors.name && <span className="error-message">{formErrors.name}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="classId">Class Section</label>
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
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
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
                  {selectedSubject ? "Save Changes" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
