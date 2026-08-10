"use client";

import React, { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { ClassResponseDto, CreateClassDto } from "@/types";

export default function AdminClassesPage() {
  const [classes, setClasses] = useState<ClassResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassResponseDto | null>(null);
  const [formData, setFormData] = useState<CreateClassDto>({
    name: "",
    description: "",
  });

  const [formErrors, setFormErrors] = useState<{ name?: string }>({});
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Fetch all classes
  const fetchClasses = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<ClassResponseDto[]>("/api/class/all");
      setClasses(data || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load classes.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const validateForm = () => {
    const errors: { name?: string } = {};
    if (!formData.name.trim()) {
      errors.name = "Class name is required.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenCreate = () => {
    setFormData({ name: "", description: "" });
    setSelectedClass(null);
    setFormErrors({});
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (cls: ClassResponseDto) => {
    setSelectedClass(cls);
    setFormData({
      name: cls.name,
      description: cls.description || "",
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
      if (selectedClass) {
        // Update class
        await apiFetch(`/api/class/update/${selectedClass.id}`, {
          method: "PUT",
          body: JSON.stringify(formData),
        });
        setSuccess(`Class "${formData.name}" updated successfully.`);
      } else {
        // Create class
        await apiFetch("/api/class/create", {
          method: "POST",
          body: JSON.stringify(formData),
        });
        setSuccess(`Class "${formData.name}" created successfully.`);
      }
      setIsFormOpen(false);
      fetchClasses();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save class.";
      setFormError(msg);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete class "${name}"?`)) return;

    setError(null);
    setSuccess(null);
    try {
      await apiFetch(`/api/class/delete/${id}`, {
        method: "DELETE",
      });
      setSuccess(`Class "${name}" deleted successfully.`);
      fetchClasses();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete class.";
      setError(msg);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "8px", background: "linear-gradient(to right, #ffffff, #94a3b8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Manage Classes
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "15px" }}>CRUD administration for academic classes</p>
        </div>
        <button className="btn btn-primary" style={{ width: "auto" }} onClick={handleOpenCreate}>
          + Create Class
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
                  <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: "600", width: "120px" }}>Class ID</th>
                  <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: "600" }}>Class Name</th>
                  <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: "600" }}>Description</th>
                  <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: "600", textAlign: "right", width: "180px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {classes.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: "40px 24px", textAlign: "center", color: "var(--text-muted)" }}>
                      No classes registered yet.
                    </td>
                  </tr>
                ) : (
                  classes.map((cls) => (
                    <tr key={cls.id} style={{ borderBottom: "1px solid var(--border-color)", transition: "background var(--transition-fast)" }} className="table-row-hover">
                      <td style={{ padding: "16px 24px", color: "var(--text-secondary)" }}>{cls.id}</td>
                      <td style={{ padding: "16px 24px", fontWeight: "500" }}>{cls.name}</td>
                      <td style={{ padding: "16px 24px", color: "var(--text-secondary)" }}>{cls.description || <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>No description</span>}</td>
                      <td style={{ padding: "16px 24px", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "8px" }}>
                          <button className="btn" style={{ width: "auto", padding: "6px 12px", fontSize: "12px", background: "rgba(99, 102, 241, 0.1)", color: "var(--primary)" }} onClick={() => handleOpenEdit(cls)}>
                            Edit
                          </button>
                          <button className="btn" style={{ width: "auto", padding: "6px 12px", fontSize: "12px", background: "rgba(239, 68, 68, 0.1)", color: "var(--danger)" }} onClick={() => handleDelete(cls.id, cls.name)}>
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
              {selectedClass ? "Edit Class" : "Create New Class"}
            </h2>

            {formError && (
              <div className="alert alert-danger" style={{ marginBottom: "20px" }}>
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="name">Class Name</label>
                <input
                  type="text"
                  id="name"
                  className={`form-control ${formErrors.name ? "is-invalid" : ""}`}
                  placeholder="e.g. Class 10 - Science"
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
                <label className="form-label" htmlFor="description">Description</label>
                <textarea
                  id="description"
                  className="form-control"
                  style={{ minHeight: "100px", resize: "vertical", background: "rgba(15, 23, 42, 0.6)" }}
                  placeholder="Class description (optional)"
                  value={formData.description || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  disabled={formLoading}
                />
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "32px" }}>
                <button type="button" className="btn" style={{ background: "rgba(255,255,255,0.05)" }} onClick={() => setIsFormOpen(false)} disabled={formLoading}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={formLoading}>
                  {formLoading ? <span className="btn-spinner"></span> : null}
                  {selectedClass ? "Save Changes" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
