"use client";

import React from "react";

export default function StudentDashboardPage() {
  return (
    <div>
      <h1 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "8px" }}>Student Dashboard</h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: "32px" }}>Overview of courses, submissions and grading results</p>
      
      <div className="grid grid-4">
        <div className="auth-card" style={{ maxWidth: "none", padding: "20px" }}>
          <h3 style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "8px" }}>My Subjects</h3>
          <p style={{ fontSize: "32px", fontWeight: "700" }}>0</p>
        </div>
        <div className="auth-card" style={{ maxWidth: "none", padding: "20px" }}>
          <h3 style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "8px" }}>My Assignments</h3>
          <p style={{ fontSize: "32px", fontWeight: "700" }}>0</p>
        </div>
        <div className="auth-card" style={{ maxWidth: "none", padding: "20px" }}>
          <h3 style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "8px" }}>Submitted</h3>
          <p style={{ fontSize: "32px", fontWeight: "700" }}>0</p>
        </div>
        <div className="auth-card" style={{ maxWidth: "none", padding: "20px" }}>
          <h3 style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "8px" }}>Pending Review</h3>
          <p style={{ fontSize: "32px", fontWeight: "700" }}>0</p>
        </div>
      </div>
    </div>
  );
}
