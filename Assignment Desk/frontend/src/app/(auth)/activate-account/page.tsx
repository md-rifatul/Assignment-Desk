"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";

function ActivateAccountContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});

  const validate = () => {
    const newErrors: { password?: string; confirmPassword?: string } = {};

    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required.";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!token) {
      setApiError("Activation token is missing. Please check your activation link.");
      return;
    }

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      await apiFetch("/api/auth/activate-account", {
        method: "POST",
        body: JSON.stringify({ token, password, confirmPassword }),
      });
      setSuccess(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to activate account.";
      setApiError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-card" style={{ textAlign: "center" }}>
        <div style={{ display: "inline-flex", background: "rgba(16, 185, 129, 0.1)", color: "var(--success)", padding: "16px", borderRadius: "var(--radius-full)", marginBottom: "24px" }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1 className="auth-title" style={{ fontSize: "24px", marginBottom: "8px" }}>Account Activated!</h1>
        <p className="auth-subtitle" style={{ marginBottom: "32px" }}>
          Your password has been set successfully. You can now log in to your account.
        </p>
        <Link href="/login" className="btn btn-primary">
          Back to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="auth-card">
      <div className="auth-header">
        <h1 className="auth-title">Activate Account</h1>
        <p className="auth-subtitle">Set your password to activate your school account</p>
      </div>

      {!token && (
        <div className="alert alert-danger" role="alert" style={{ marginBottom: "24px" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>Activation token is missing. Please use the link sent in your email.</span>
        </div>
      )}

      {apiError && (
        <div className="alert alert-danger" role="alert">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{apiError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label className="form-label" htmlFor="password">New Password</label>
          <input
            type="password"
            id="password"
            className={`form-control ${errors.password ? "is-invalid" : ""}`}
            placeholder="••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
            }}
            disabled={loading || !token}
            required
          />
          {errors.password && (
            <div className="error-message">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {errors.password}
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
            }}
            disabled={loading || !token}
            required
          />
          {errors.confirmPassword && (
            <div className="error-message">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {errors.confirmPassword}
            </div>
          )}
        </div>

        <button type="submit" className="btn btn-primary" style={{ marginTop: "24px" }} disabled={loading || !token}>
          {loading ? (
            <>
              <span className="btn-spinner"></span>
              Activating Account...
            </>
          ) : (
            "Activate Account"
          )}
        </button>
      </form>

      <div className="auth-links" style={{ display: "flex", justifyContent: "center", marginTop: "24px" }}>
        <Link href="/login" className="auth-link">
          Back to Login
        </Link>
      </div>
    </div>
  );
}

export default function ActivateAccountPage() {
  return (
    <div className="auth-container">
      <Suspense fallback={
        <div className="auth-card" style={{ textAlign: "center", padding: "60px 40px" }}>
          <div className="btn-spinner" style={{ width: "40px", height: "40px", borderTopColor: "var(--primary)", margin: "0 auto 20px" }}></div>
          <p style={{ color: "var(--text-secondary)" }}>Loading activation link details...</p>
        </div>
      }>
        <ActivateAccountContent />
      </Suspense>
    </div>
  );
}
