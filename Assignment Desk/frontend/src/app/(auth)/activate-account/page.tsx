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
      <div style={{
        maxWidth: "460px",
        width: "100%",
        padding: "40px 24px",
        background: "#ffffff",
        border: "1px solid #f1f5f9",
        borderRadius: "24px",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.04), 0 10px 10px -5px rgba(0, 0, 0, 0.02)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        boxSizing: "border-box",
        textAlign: "center"
      }}>
        <div style={{
          width: "72px",
          height: "72px",
          borderRadius: "50%",
          background: "#ecfdf5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#10b981",
          marginBottom: "24px"
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", marginBottom: "8px", textAlign: "center" }}>
          Account Activated!
        </h1>
        <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "32px", textAlign: "center" }}>
          Your password has been set successfully. You can now log in to your account.
        </p>
        <Link href="/login" style={{
          width: "100%",
          padding: "14px",
          background: "#4f46e5",
          color: "#ffffff",
          fontSize: "15px",
          fontWeight: "600",
          border: "none",
          borderRadius: "12px",
          cursor: "pointer",
          textDecoration: "none",
          textAlign: "center",
          boxSizing: "border-box",
          display: "block",
          transition: "background 0.2s ease"
        }}
        onMouseOver={(e) => (e.currentTarget.style.background = "#4338ca")}
        onMouseOut={(e) => (e.currentTarget.style.background = "#4f46e5")}
        >
          Back to Login
        </Link>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: "460px",
      width: "100%",
      padding: "40px 24px",
      background: "#ffffff",
      border: "1px solid #f1f5f9",
      borderRadius: "24px",
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.04), 0 10px 10px -5px rgba(0, 0, 0, 0.02)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      boxSizing: "border-box"
    }}>
      {/* Circle Lock Badge */}
      <div style={{
        width: "72px",
        height: "72px",
        borderRadius: "50%",
        background: "#f0f2ff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#4f46e5",
        marginBottom: "24px"
      }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
        </svg>
      </div>

      <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", marginBottom: "8px", textAlign: "center" }}>
        Activate Account
      </h1>
      <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "32px", textAlign: "center" }}>
        Set your password to activate your school account
      </p>

      {!token && (
        <div style={{
          width: "100%",
          padding: "12px 16px",
          background: "#fee2e2",
          color: "#b91c1c",
          fontSize: "13px",
          borderRadius: "12px",
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          boxSizing: "border-box"
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>Activation token is missing. Please use the link sent in your email.</span>
        </div>
      )}

      {apiError && (
        <div style={{
          width: "100%",
          padding: "12px 16px",
          background: "#fee2e2",
          color: "#b91c1c",
          fontSize: "13px",
          borderRadius: "12px",
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          boxSizing: "border-box"
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{apiError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ width: "100%" }} noValidate>
        {/* Password field */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
          <label style={{ fontSize: "13px", fontWeight: "600", color: "#1e293b" }} htmlFor="password">
            New Password
          </label>
          <div style={{ position: "relative", width: "100%" }}>
            <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", display: "flex", alignItems: "center" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </span>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              disabled={loading || !token}
              style={{
                width: "100%",
                padding: "14px 16px 14px 44px",
                borderRadius: "12px",
                border: errors.password ? "1px solid #ef4444" : "1px solid #e2e8f0",
                outline: "none",
                fontSize: "15px",
                background: "#ffffff",
                color: "#0f172a",
                boxSizing: "border-box"
              }}
            />
          </div>
          {errors.password && (
            <p style={{ color: "#ef4444", fontSize: "12px", margin: 0 }}>{errors.password}</p>
          )}
        </div>

        {/* Confirm password field */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "32px" }}>
          <label style={{ fontSize: "13px", fontWeight: "600", color: "#1e293b" }} htmlFor="confirmPassword">
            Confirm Password
          </label>
          <div style={{ position: "relative", width: "100%" }}>
            <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", display: "flex", alignItems: "center" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </span>
            <input
              type="password"
              id="confirmPassword"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
              }}
              disabled={loading || !token}
              style={{
                width: "100%",
                padding: "14px 16px 14px 44px",
                borderRadius: "12px",
                border: errors.confirmPassword ? "1px solid #ef4444" : "1px solid #e2e8f0",
                outline: "none",
                fontSize: "15px",
                background: "#ffffff",
                color: "#0f172a",
                boxSizing: "border-box"
              }}
            />
          </div>
          {errors.confirmPassword && (
            <p style={{ color: "#ef4444", fontSize: "12px", margin: 0 }}>{errors.confirmPassword}</p>
          )}
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading || !token}
          style={{
            width: "100%",
            padding: "14px",
            background: "#4f46e5",
            color: "#ffffff",
            fontSize: "15px",
            fontWeight: "600",
            border: "none",
            borderRadius: "12px",
            cursor: "pointer",
            transition: "background 0.2s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            boxSizing: "border-box"
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = "#4338ca")}
          onMouseOut={(e) => (e.currentTarget.style.background = "#4f46e5")}
        >
          {loading ? (
            <>
              <span className="btn-spinner" style={{ width: "16px", height: "16px", borderWidth: "2px" }}></span>
              Activating Account...
            </>
          ) : (
            <>
              Activate Account
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: "4px" }}>
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </>
          )}
        </button>
      </form>

      <div style={{ display: "flex", justifyContent: "center", marginTop: "24px" }}>
        <Link href="/login" style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "14px",
          fontWeight: "600",
          color: "#4f46e5",
          textDecoration: "none"
        }}>
          Back to Login
        </Link>
      </div>
    </div>
  );
}

export default function ActivateAccountPage() {
  return (
    <div style={{
      minHeight: "100vh",
      width: "100vw",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "radial-gradient(circle at 10% 20%, #f8fafc 0%, #e0e7ff 100%)",
      padding: "20px",
      boxSizing: "border-box"
    }}>
      <Suspense fallback={
        <div style={{
          maxWidth: "460px",
          width: "100%",
          padding: "60px 40px",
          background: "#ffffff",
          border: "1px solid #f1f5f9",
          borderRadius: "24px",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.04), 0 10px 10px -5px rgba(0, 0, 0, 0.02)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          boxSizing: "border-box",
          textAlign: "center"
        }}>
          <div className="btn-spinner" style={{ width: "40px", height: "40px", borderTopColor: "#4f46e5", margin: "0 auto 20px" }}></div>
          <p style={{ color: "#64748b" }}>Loading activation link details...</p>
        </div>
      }>
        <ActivateAccountContent />
      </Suspense>
    </div>
  );
}
