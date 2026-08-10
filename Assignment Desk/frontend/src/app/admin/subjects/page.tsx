"use client";

import React from "react";

export default function AdminSubjectsPage() {
  return (
    <div>
      <h1 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "8px" }}>Manage Subjects</h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: "32px" }}>CRUD administration for academic subjects linked to classes</p>
      <div className="auth-card" style={{ maxWidth: "none" }}>
        <p style={{ color: "var(--text-secondary)" }}>Subjects list placeholder.</p>
      </div>
    </div>
  );
}
