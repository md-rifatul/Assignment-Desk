"use client";

import React from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <div className="auth-container">
      <div className="auth-card" style={{ textAlign: "center" }}>
        <h1 className="auth-title" style={{ fontSize: "24px" }}>Forgot Password</h1>
        <p className="auth-subtitle" style={{ margin: "16px 0 32px" }}>
          Request a password reset link.
        </p>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "24px" }}>
          Placeholder for Forgot Password.
        </p>
        <Link href="/login" className="btn btn-primary">
          Back to Login
        </Link>
      </div>
    </div>
  );
}
