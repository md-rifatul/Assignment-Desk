"use client";

import React from "react";

export default function StudentAssignmentsPage() {
  return (
    <div>
      <h1 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "8px" }}>Class Assignments</h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: "32px" }}>Active assignments published for your class</p>
      <div className="auth-card" style={{ maxWidth: "none" }}>
        <p style={{ color: "var(--text-secondary)" }}>Student active assignments list placeholder.</p>
      </div>
    </div>
  );
}
