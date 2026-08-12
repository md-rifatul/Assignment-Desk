"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Sidebar toggle state for mobile views
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== "Admin")) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Close sidebar on pathname change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  if (loading || !user || user.role !== "Admin") {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <div className="btn-spinner" style={{ width: "40px", height: "40px" }}></div>
      </div>
    );
  }

  const isActive = (path: string) => pathname === path || pathname?.startsWith(path + "/");

  return (
    <div className="dashboard-layout admin-theme" style={{ display: "flex", height: "100vh", overflow: "hidden", position: "relative" }}>
      
      {/* Scoped CSS styling for slide drawer sidebar */}
      <style>{`
        @media (max-width: 768px) {
          .admin-sidebar {
            position: fixed !important;
            top: 0;
            left: 0;
            bottom: 0;
            z-index: 99999 !important;
            transform: translateX(${isSidebarOpen ? "0%" : "-100%"});
            transition: transform 0.3s ease !important;
            box-shadow: ${isSidebarOpen ? "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)" : "none"} !important;
          }
          .admin-hamburger-header {
            display: flex !important;
          }
          .admin-main-content {
            padding: 24px 16px !important;
          }
        }
      `}</style>

      {/* Backdrop overlay for mobile drawer */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15,23,42,0.15)",
            backdropFilter: "blur(2px)",
            zIndex: 99998,
            display: "block"
          }}
        />
      )}

      {/* Sidebar Navigation */}
      <aside 
        className="admin-sidebar"
        style={{ 
          width: "260px", 
          background: "#ffffff", 
          borderRight: "1px solid var(--border-color)", 
          padding: "24px", 
          display: "flex", 
          flexDirection: "column",
          flexShrink: 0
        }}
      >
        <div style={{ marginBottom: "32px", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ background: "rgba(79, 70, 229, 0.1)", color: "var(--primary)", padding: "8px", borderRadius: "10px", display: "flex" }}>
            {/* Shield/Admin icon */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div>
            <h2 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", margin: 0 }}>Admin Desk</h2>
            <p style={{ fontSize: "11px", color: "var(--text-secondary)", margin: 0 }}>Logged in as System Admin</p>
          </div>
        </div>
        
        <nav style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
          <Link 
            href="/admin/dashboard" 
            className={isActive("/admin/dashboard") && pathname === "/admin/dashboard" ? "active-link" : ""}
            onClick={() => setIsSidebarOpen(false)}
            style={{ padding: "12px 16px", borderRadius: "var(--radius-md)", textDecoration: "none", fontSize: "14px", display: "flex", alignItems: "center", gap: "10px" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Dashboard
          </Link>
          <Link 
            href="/admin/users" 
            className={isActive("/admin/users") ? "active-link" : ""}
            onClick={() => setIsSidebarOpen(false)}
            style={{ padding: "12px 16px", borderRadius: "var(--radius-md)", textDecoration: "none", fontSize: "14px", display: "flex", alignItems: "center", gap: "10px" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Manage Users
          </Link>
          <Link 
            href="/admin/classes" 
            className={isActive("/admin/classes") ? "active-link" : ""}
            onClick={() => setIsSidebarOpen(false)}
            style={{ padding: "12px 16px", borderRadius: "var(--radius-md)", textDecoration: "none", fontSize: "14px", display: "flex", alignItems: "center", gap: "10px" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="9" y1="3" x2="9" y2="21" />
            </svg>
            Manage Classes
          </Link>
          <Link 
            href="/admin/subjects" 
            className={isActive("/admin/subjects") ? "active-link" : ""}
            onClick={() => setIsSidebarOpen(false)}
            style={{ padding: "12px 16px", borderRadius: "var(--radius-md)", textDecoration: "none", fontSize: "14px", display: "flex", alignItems: "center", gap: "10px" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
            Manage Subjects
          </Link>
          <Link 
            href="/admin/student-classes" 
            className={isActive("/admin/student-classes") ? "active-link" : ""}
            onClick={() => setIsSidebarOpen(false)}
            style={{ padding: "12px 16px", borderRadius: "var(--radius-md)", textDecoration: "none", fontSize: "14px", display: "flex", alignItems: "center", gap: "10px" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <polyline points="16 11 18 11 20 11" />
              <polyline points="12 5 19 12 20 12" />
            </svg>
            Student Classes
          </Link>
          <Link 
            href="/admin/teacher-subjects" 
            className={isActive("/admin/teacher-subjects") ? "active-link" : ""}
            onClick={() => setIsSidebarOpen(false)}
            style={{ padding: "12px 16px", borderRadius: "var(--radius-md)", textDecoration: "none", fontSize: "14px", display: "flex", alignItems: "center", gap: "10px" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            Teacher Subjects
          </Link>
        </nav>
        
        <button 
          className="btn" 
          style={{ background: "rgba(239,68,68,0.05)", color: "var(--danger)", padding: "12px", border: "1px solid rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", borderRadius: "var(--radius-md)" }} 
          onClick={logout}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Log Out
        </button>
      </aside>
      
      {/* Main Content Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        
        {/* Mobile Hamburger Header Menu Bar */}
        <header className="admin-hamburger-header" style={{
          display: "none",
          alignItems: "center",
          padding: "16px",
          background: "#ffffff",
          borderBottom: "1px solid var(--border-color)",
          gap: "12px",
          width: "100%",
          boxSizing: "border-box"
        }}>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#0f172a",
              display: "flex",
              alignItems: "center",
              padding: "6px"
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <span style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a" }}>Admin Desk</span>
        </header>

        {/* Content Box */}
        <main className="admin-main-content" style={{ flex: 1, padding: "40px", overflowY: "auto", display: "flex", flexDirection: "column" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
