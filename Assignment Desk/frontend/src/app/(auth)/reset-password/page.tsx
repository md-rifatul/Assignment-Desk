"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Eye toggle states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});

  const validate = () => {
    const newErrors: { password?: string; confirmPassword?: string } = {};

    if (!password) {
      newErrors.password = "New password is required.";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
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
    setError(null);

    if (!validate()) {
      return;
    }

    if (!token) {
      setError("Reset token is missing from the URL. Please request a new password reset email.");
      return;
    }

    setLoading(true);
    try {
      await apiFetch("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({
          token,
          newPassword: password,
          confirmPassword
        })
      });
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred while resetting password.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
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
      {/* Circle Icon Badge */}
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
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>

      {/* Header Text */}
      <h1 style={{ fontSize: "26px", fontWeight: "800", color: "#0f172a", marginBottom: "8px", textAlign: "center" }}>
        Reset Password
      </h1>
      <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "32px", textAlign: "center" }}>
        Create a new secure password for your account
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
            <span>Password successfully reset! Redirecting to login page...</span>
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
            Login Now
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ width: "100%" }} noValidate>
          {/* New Password Field */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "#1e293b" }} htmlFor="password">
              New Password
            </label>
            <div style={{ position: "relative", width: "100%" }}>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "14px 44px 14px 16px",
                  borderRadius: "12px",
                  border: errors.password ? "1px solid #ef4444" : "1px solid #e2e8f0",
                  outline: "none",
                  fontSize: "15px",
                  background: "#ffffff",
                  color: "#0f172a"
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center"
                }}
              >
                {showPassword ? (
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password ? (
              <p style={{ color: "#ef4444", fontSize: "12px", margin: 0 }}>{errors.password}</p>
            ) : (
              <p style={{ color: "#64748b", fontSize: "12px", margin: "2px 0 0 0", lineHeight: "1.4" }}>
                Password must be at least <span style={{ color: "#4f46e5", fontWeight: "600" }}>8 characters</span> long and include a mix of letters, numbers & symbols.
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "32px" }}>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "#1e293b" }} htmlFor="confirmPassword">
              Confirm Password
            </label>
            <div style={{ position: "relative", width: "100%" }}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                placeholder="••••••••••••"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                }}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "14px 44px 14px 16px",
                  borderRadius: "12px",
                  border: errors.confirmPassword ? "1px solid #ef4444" : "1px solid #e2e8f0",
                  outline: "none",
                  fontSize: "15px",
                  background: "#ffffff",
                  color: "#0f172a"
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center"
                }}
              >
                {showConfirmPassword ? (
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p style={{ color: "#ef4444", fontSize: "12px", margin: 0 }}>{errors.confirmPassword}</p>
            )}
          </div>

          {/* Reset Password Submit Button */}
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
                Resetting Password...
              </>
            ) : (
              "Reset Password"
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
  );
}

export default function ResetPasswordPage() {
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
      <Suspense fallback={
        <div style={{
          maxWidth: "460px",
          width: "100%",
          padding: "40px",
          background: "#ffffff",
          borderRadius: "24px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "200px"
        }}>
          <div className="btn-spinner" style={{ width: "32px", height: "32px", borderTopColor: "var(--primary)" }}></div>
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
