"use client";

import React from "react";

export default function StudentSubmissionsPage() {
  return (
    <div>
      <h1 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "8px" }}>My Submissions</h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: "32px" }}>Status of your uploaded solutions and grades</p>
      <div className="auth-card" style={{ maxWidth: "none" }}>
        <p style={{ color: "var(--text-secondary)" }}>Student submission history placeholder.</p>
      </div>
    </div>
  );
}
