"use client";

import React from "react";
import Link from "next/link";

export default function ActivateAccountPage() {
  return (
    <div className="auth-container">
      <div className="auth-card" style={{ textAlign: "center" }}>
        <h1 className="auth-title" style={{ fontSize: "24px" }}>Activate Account</h1>
        <p className="auth-subtitle" style={{ margin: "16px 0 32px" }}>
          Set your password to activate your school account.
        </p>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "24px" }}>
          Placeholder for Account Activation.
        </p>
        <Link href="/login" className="btn btn-primary">
          Back to Login
        </Link>
      </div>
    </div>
  );
}
