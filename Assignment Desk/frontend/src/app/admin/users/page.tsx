"use client";

import React from "react";

export default function AdminUsersPage() {
  return (
    <div>
      <h1 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "8px" }}>Manage Users</h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: "32px" }}>CRUD administration for Teachers, Students and Administrators</p>
      <div className="auth-card" style={{ maxWidth: "none" }}>
        <p style={{ color: "var(--text-secondary)" }}>User list placeholder.</p>
      </div>
    </div>
  );
}
