"use client";

import React from "react";

export default function AdminStudentClassesPage() {
  return (
    <div>
      <h1 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "8px" }}>Student Class Mappings</h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: "32px" }}>Assign students to specific class sections</p>
      <div className="auth-card" style={{ maxWidth: "none" }}>
        <p style={{ color: "var(--text-secondary)" }}>Student class mapping placeholder.</p>
      </div>
    </div>
  );
}
