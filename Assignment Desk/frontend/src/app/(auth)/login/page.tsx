"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { LoginResponseDto } from "@/types";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Password toggle visibility state
  const [showPassword, setShowPassword] = useState(false);

  // Form field validation states
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!email) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    
    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const response = await apiFetch<LoginResponseDto>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (response && response.token) {
        login(response.token);
      } else {
        setApiError("Authentication succeeded but no token was returned.");
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to log in. Please try again.";
      setApiError(errorMessage);
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
      padding: "20px",
      boxSizing: "border-box"
    }}>
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
        {/* Circle Checklist Icon Badge */}
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
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
            <path d="M9 14l2 2 4-4" />
          </svg>
        </div>

        {/* Header Text */}
        <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", marginBottom: "8px", textAlign: "center" }}>
          Assignment Desk
        </h1>
        <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "32px", textAlign: "center" }}>
          Sign in to manage assignments
        </p>

        {apiError && (
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
            gap: "8px",
            boxSizing: "border-box"
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ width: "100%" }} noValidate>
          {/* Email Address Field */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "#1e293b" }} htmlFor="email">
              Email Address
            </label>
            <div style={{ position: "relative", width: "100%" }}>
              <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", display: "flex", alignItems: "center" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </span>
              <input
                type="email"
                id="email"
                placeholder="name@school.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "14px 16px 14px 44px",
                  borderRadius: "12px",
                  border: errors.email ? "1px solid #ef4444" : "1px solid #e2e8f0",
                  outline: "none",
                  fontSize: "15px",
                  background: "#ffffff",
                  color: "#0f172a",
                  boxSizing: "border-box"
                }}
              />
            </div>
            {errors.email && (
              <p style={{ color: "#ef4444", fontSize: "12px", margin: 0 }}>{errors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "32px" }}>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "#1e293b" }} htmlFor="password">
              Password
            </label>
            <div style={{ position: "relative", width: "100%" }}>
              <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", display: "flex", alignItems: "center" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "14px 44px 14px 44px",
                  borderRadius: "12px",
                  border: errors.password ? "1px solid #ef4444" : "1px solid #e2e8f0",
                  outline: "none",
                  fontSize: "15px",
                  background: "#ffffff",
                  color: "#0f172a",
                  boxSizing: "border-box"
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
            {errors.password && (
              <p style={{ color: "#ef4444", fontSize: "12px", margin: 0 }}>{errors.password}</p>
            )}
          </div>

          {/* Submit Sign In Button */}
          <button
            type="submit"
            disabled={loading}
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
                Signing In...
              </>
            ) : (
              <>
                Sign In
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: "4px" }}>
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </>
            )}
          </button>

          {/* OR divider */}
          <div style={{ display: "flex", alignItems: "center", width: "100%", margin: "24px 0" }}>
            <div style={{ flex: 1, height: "1px", background: "#f1f5f9" }}></div>
            <span style={{ fontSize: "12px", color: "#94a3b8", padding: "0 10px" }}>or</span>
            <div style={{ flex: 1, height: "1px", background: "#f1f5f9" }}></div>
          </div>

          {/* Forgot Password Link */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Link href="/forgot-password" style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "14px",
              fontWeight: "600",
              color: "#4f46e5",
              textDecoration: "none"
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Forgot Password?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
