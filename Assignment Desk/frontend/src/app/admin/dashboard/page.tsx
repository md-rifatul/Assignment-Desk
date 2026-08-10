"use client";

import React from "react";

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "8px" }}>Admin Dashboard</h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: "32px" }}>Overview of system counters and registrations</p>
      
      <div className="grid grid-3">
        <div className="auth-card" style={{ maxWidth: "none", padding: "24px" }}>
          <h3 style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "8px" }}>Teachers</h3>
          <p style={{ fontSize: "36px", fontWeight: "700" }}>0</p>
        </div>
        <div className="auth-card" style={{ maxWidth: "none", padding: "24px" }}>
          <h3 style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "8px" }}>Students</h3>
          <p style={{ fontSize: "36px", fontWeight: "700" }}>0</p>
        </div>
        <div className="auth-card" style={{ maxWidth: "none", padding: "24px" }}>
          <h3 style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "8px" }}>Classes</h3>
          <p style={{ fontSize: "36px", fontWeight: "700" }}>0</p>
        </div>
      </div>
    </div>
  );
}
