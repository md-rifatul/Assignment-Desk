"use client";

import React, { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { UserResponseDto, RegisterDto, UserRoleEnum } from "@/types";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserResponseDto | null>(null);
  const [formData, setFormData] = useState<RegisterDto>({
    fullName: "",
    email: "",
    role: UserRoleEnum.Student,
  });

  const [formErrors, setFormErrors] = useState<{ fullName?: string; email?: string }>({});
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Fetch all users
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<UserResponseDto[]>("/api/user/all");
      setUsers(data || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load users.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const validateForm = () => {
    const errors: { fullName?: string; email?: string } = {};
    if (!formData.fullName.trim()) {
      errors.fullName = "Full name is required.";
    }
    if (!formData.email.trim()) {
      errors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenCreate = () => {
    setFormData({ fullName: "", email: "", role: UserRoleEnum.Student });
    setSelectedUser(null);
    setFormErrors({});
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (user: UserResponseDto) => {
    setSelectedUser(user);
    // Map role string to enum
    let roleEnum = UserRoleEnum.Student;
    if (user.role === "Admin") roleEnum = UserRoleEnum.Admin;
    else if (user.role === "Teacher") roleEnum = UserRoleEnum.Teacher;

    setFormData({
      fullName: user.fullName,
      email: user.email,
      role: roleEnum,
    });
    setFormErrors({});
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleOpenView = (user: UserResponseDto) => {
    setSelectedUser(user);
    setIsViewOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!validateForm()) return;

    setFormLoading(true);
    try {
      if (selectedUser) {
        // Update user
        await apiFetch(`/api/user/update/${selectedUser.id}`, {
          method: "PUT",
          body: JSON.stringify(formData),
        });
        setSuccess(`User "${formData.fullName}" updated successfully.`);
      } else {
        // Create user
        await apiFetch("/api/user/create", {
          method: "POST",
          body: JSON.stringify(formData),
        });
        setSuccess(`User "${formData.fullName}" registered successfully. An activation email has been sent.`);
      }
      setIsFormOpen(false);
      fetchUsers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save user.";
      setFormError(msg);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete user "${name}"?`)) return;

    setError(null);
    setSuccess(null);
    try {
      await apiFetch(`/api/user/delete/${id}`, {
        method: "DELETE",
      });
      setSuccess(`User "${name}" deleted successfully.`);
      fetchUsers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete user.";
      setError(msg);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "8px", color: "#0f172a" }}>
            Manage Users
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "15px" }}>CRUD administration for Teachers, Students and Administrators</p>
        </div>
        <button className="btn btn-primary" style={{ width: "auto" }} onClick={handleOpenCreate}>
          + Register User
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
                  <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: "600" }}>Full Name</th>
                  <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: "600" }}>Email</th>
                  <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: "600" }}>Role</th>
                  <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: "600" }}>Status</th>
                  <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: "600", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: "40px 24px", textAlign: "center", color: "var(--text-muted)" }}>
                      No users registered yet.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} style={{ borderBottom: "1px solid var(--border-color)", transition: "background var(--transition-fast)" }} className="table-row-hover">
                      <td style={{ padding: "16px 24px", fontWeight: "500" }}>{user.fullName}</td>
                      <td style={{ padding: "16px 24px", color: "var(--text-secondary)" }}>{user.email}</td>
                      <td style={{ padding: "16px 24px" }}>
                        <span style={{
                          display: "inline-block",
                          padding: "4px 10px",
                          borderRadius: "var(--radius-full)",
                          fontSize: "12px",
                          fontWeight: "600",
                          textTransform: "uppercase",
                          color: user.role === "Admin" ? "var(--primary)" : user.role === "Teacher" ? "var(--warning)" : "var(--success)",
                          background: user.role === "Admin" ? "rgba(99,102,241,0.1)" : user.role === "Teacher" ? "rgba(245,158,11,0.1)" : "rgba(16,185,129,0.1)",
                          border: user.role === "Admin" ? "1px solid rgba(99,102,241,0.2)" : user.role === "Teacher" ? "1px solid rgba(245,158,11,0.2)" : "1px solid rgba(16,185,129,0.2)"
                        }}>
                          {user.role}
                        </span>
                      </td>
                      <td style={{ padding: "16px 24px" }}>
                        <span style={{
                          display: "inline-block",
                          padding: "4px 10px",
                          borderRadius: "var(--radius-full)",
                          fontSize: "12px",
                          fontWeight: "600",
                          textTransform: "uppercase",
                          color: user.isActive ? "var(--success)" : "var(--danger)",
                          background: user.isActive ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                          border: user.isActive ? "1px solid rgba(16,185,129,0.2)" : "1px solid rgba(239,68,68,0.2)"
                        }}>
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td style={{ padding: "16px 24px", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "8px" }}>
                          <button className="btn" style={{ width: "auto", padding: "6px 12px", fontSize: "12px", background: "rgba(255,255,255,0.05)" }} onClick={() => handleOpenView(user)}>
                            View
                          </button>
                          <button className="btn" style={{ width: "auto", padding: "6px 12px", fontSize: "12px", background: "rgba(99,102,241,0.1)", color: "var(--primary)" }} onClick={() => handleOpenEdit(user)}>
                            Edit
                          </button>
                          <button className="btn" style={{ width: "auto", padding: "6px 12px", fontSize: "12px", background: "rgba(239,68,68,0.1)", color: "var(--danger)" }} onClick={() => handleDelete(user.id, user.fullName)}>
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

      {/* View User Modal */}
      {isViewOpen && selectedUser && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15,23,42,0.8)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div className="auth-card" style={{ maxWidth: "480px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "20px" }}>User Details</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "32px" }}>
              <div>
                <label style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase" }}>User ID</label>
                <p style={{ fontSize: "15px", fontWeight: "500", marginTop: "4px" }}>{selectedUser.id}</p>
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase" }}>Full Name</label>
                <p style={{ fontSize: "15px", fontWeight: "500", marginTop: "4px" }}>{selectedUser.fullName}</p>
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase" }}>Email Address</label>
                <p style={{ fontSize: "15px", fontWeight: "500", marginTop: "4px" }}>{selectedUser.email}</p>
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase" }}>System Role</label>
                <p style={{ fontSize: "15px", fontWeight: "500", marginTop: "4px" }}>{selectedUser.role}</p>
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase" }}>Status</label>
                <p style={{ fontSize: "15px", fontWeight: "500", marginTop: "4px" }}>
                  <span style={{
                    display: "inline-block",
                    padding: "2px 8px",
                    borderRadius: "var(--radius-full)",
                    fontSize: "12px",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    color: selectedUser.isActive ? "var(--success)" : "var(--danger)",
                    background: selectedUser.isActive ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                    border: selectedUser.isActive ? "1px solid rgba(16,185,129,0.2)" : "1px solid rgba(239,68,68,0.2)"
                  }}>
                    {selectedUser.isActive ? "Active" : "Inactive"}
                  </span>
                </p>
              </div>
            </div>
            <button className="btn btn-primary" onClick={() => setIsViewOpen(false)}>
              Close View
            </button>
          </div>
        </div>
      )}

      {/* Create / Edit Modal Form */}
      {isFormOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15,23,42,0.8)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div className="auth-card" style={{ maxWidth: "480px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "20px" }}>
              {selectedUser ? "Edit User Details" : "Register New User"}
            </h2>

            {formError && (
              <div className="alert alert-danger" style={{ marginBottom: "20px" }}>
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="fullName">Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  className={`form-control ${formErrors.fullName ? "is-invalid" : ""}`}
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, fullName: e.target.value }));
                    if (formErrors.fullName) setFormErrors(prev => ({ ...prev, fullName: undefined }));
                  }}
                  disabled={formLoading}
                />
                {formErrors.fullName && <span className="error-message">{formErrors.fullName}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  className={`form-control ${formErrors.email ? "is-invalid" : ""}`}
                  placeholder="johndoe@school.com"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, email: e.target.value }));
                    if (formErrors.email) setFormErrors(prev => ({ ...prev, email: undefined }));
                  }}
                  disabled={formLoading}
                />
                {formErrors.email && <span className="error-message">{formErrors.email}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="role">User Role</label>
                <select
                  id="role"
                  className="form-control"
                  style={{ background: "rgba(15, 23, 42, 0.95)" }}
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: parseInt(e.target.value) }))}
                  disabled={formLoading}
                >
                  <option value={UserRoleEnum.Student}>Student</option>
                  <option value={UserRoleEnum.Teacher}>Teacher</option>
                  <option value={UserRoleEnum.Admin}>Admin</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "32px" }}>
                <button type="button" className="btn" style={{ background: "rgba(255,255,255,0.05)" }} onClick={() => setIsFormOpen(false)} disabled={formLoading}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={formLoading}>
                  {formLoading ? <span className="btn-spinner"></span> : null}
                  {selectedUser ? "Save Changes" : "Register"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
