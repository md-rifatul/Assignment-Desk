"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCookie, setCookie, deleteCookie, decodeJwt } from "@/lib/api";
import { UserRole } from "@/types";

interface AuthUser {
  id: number;
  email: string;
  fullName: string;
  role: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (token: string, refreshToken: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    // Check for cookie token on mount
    const savedToken = getCookie("auth_token");
    if (savedToken) {
      const decoded = decodeJwt(savedToken);
      if (decoded && decoded.exp * 1000 > Date.now()) {
        setToken(savedToken);
        setUser({
          id: parseInt(decoded.nameid),
          email: decoded.email,
          fullName: decoded.unique_name,
          role: decoded.role as UserRole,
        });
      } else {
        // Token expired
        deleteCookie("auth_token");
      }
    }
    setLoading(false);
  }, []);

  const login = (newToken: string, newRefreshToken: string) => {
    const decoded = decodeJwt(newToken);
    if (!decoded) {
      throw new Error("Invalid token format.");
    }

    setCookie("auth_token", newToken, 60); // 60 minutes expiry
    setCookie("refresh_token", newRefreshToken, 7 * 24 * 60); // 7 days expiry
    setToken(newToken);
    
    const loggedUser: AuthUser = {
      id: parseInt(decoded.nameid),
      email: decoded.email,
      fullName: decoded.unique_name,
      role: decoded.role as UserRole,
    };
    
    setUser(loggedUser);

    // Redirect to dashboard corresponding to role
    if (loggedUser.role === "Admin") {
      router.push("/admin/dashboard");
    } else if (loggedUser.role === "Teacher") {
      router.push("/teacher/dashboard");
    } else if (loggedUser.role === "Student") {
      router.push("/student/dashboard");
    }
  };

  const logout = () => {
    deleteCookie("auth_token");
    deleteCookie("refresh_token");
    setToken(null);
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
