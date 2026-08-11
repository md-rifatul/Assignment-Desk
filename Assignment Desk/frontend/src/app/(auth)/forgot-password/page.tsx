"use client";

import React, { useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidationError(null);

    if (!email) {
      setValidationError("Email address is required.");
      return;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setValidationError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      await apiFetch("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email })
      });
      setSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred while requesting password reset.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      width: "100vw",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "radial-gradient(circle at 10% 20%, #f8fafc 0%, #e0e7ff 100%)",
      padding: "20px"
    }}>
      <div style={{
        maxWidth: "460px",
        width: "100%",
        padding: "40px",
        background: "#ffffff",
        border: "1px solid #f1f5f9",
        borderRadius: "24px",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.04), 0 10px 10px -5px rgba(0, 0, 0, 0.02)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}>
        {/* Circle Mail Icon Badge */}
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
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        </div>

        {/* Header Text */}
        <h1 style={{ fontSize: "26px", fontWeight: "800", color: "#0f172a", marginBottom: "8px", textAlign: "center" }}>
          Forgot Password
        </h1>
        <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "32px", textAlign: "center" }}>
          Request a secure password reset link
        </p>

        {error && (
          <div style={{
            width: "100%",
            padding: "12px 16px",
            background: "#fee2e2",
            color: "#b91c1c",
            fontSize: "13px",
            borderRadius: "12px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
            <div style={{
              padding: "16px",
              background: "#d1fae5",
              color: "#065f46",
              fontSize: "13px",
              borderRadius: "12px",
              display: "flex",
              alignItems: "flex-start",
              gap: "10px"
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginTop: "2px" }}>
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>If an account exists for {email}, a password reset link has been sent. Please check your inbox.</span>
            </div>
            <Link href="/login" style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              padding: "14px",
              background: "#4f46e5",
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: "600",
              borderRadius: "12px",
              textDecoration: "none",
              textAlign: "center"
            }}>
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ width: "100%" }} noValidate>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "24px" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#1e293b" }} htmlFor="email">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                placeholder="name@school.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setValidationError(null);
                }}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: "12px",
                  border: validationError ? "1px solid #ef4444" : "1px solid #e2e8f0",
                  outline: "none",
                  fontSize: "15px",
                  background: "#ffffff",
                  color: "#0f172a"
                }}
              />
              {validationError && (
                <p style={{ color: "#ef4444", fontSize: "12px", margin: 0 }}>{validationError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                background: "#4f46e5",
                color: "#ffffff",
                fontSize: "14px",
                fontWeight: "600",
                border: "none",
                borderRadius: "12px",
                cursor: "pointer",
                transition: "background 0.2s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px"
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = "#4338ca")}
              onMouseOut={(e) => (e.currentTarget.style.background = "#4f46e5")}
            >
              {loading ? (
                <>
                  <span className="btn-spinner" style={{ width: "16px", height: "16px", borderWidth: "2px" }}></span>
                  Sending Link...
                </>
              ) : (
                "Send Reset Link"
              )}
            </button>

            {/* OR divider */}
            <div style={{ display: "flex", alignItems: "center", width: "100%", margin: "24px 0" }}>
              <div style={{ flex: 1, height: "1px", background: "#f1f5f9" }}></div>
              <span style={{ fontSize: "12px", color: "#94a3b8", padding: "0 10px" }}>or</span>
              <div style={{ flex: 1, height: "1px", background: "#f1f5f9" }}></div>
            </div>

            {/* Back to sign in */}
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Link href="/login" style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "14px",
                fontWeight: "600",
                color: "#4f46e5",
                textDecoration: "none"
              }}>
                <span>&larr;</span> Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
