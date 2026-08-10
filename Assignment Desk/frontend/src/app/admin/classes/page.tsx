"use client";

import React from "react";

export default function AdminClassesPage() {
  return (
    <div>
      <h1 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "8px" }}>Manage Classes</h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: "32px" }}>CRUD administration for academic classes</p>
      <div className="auth-card" style={{ maxWidth: "none" }}>
        <p style={{ color: "var(--text-secondary)" }}>Classes list placeholder.</p>
      </div>
    </div>
  );
}
