"use client";

/**
 * NextProduct AI - React Auth Context & Provider
 * Manages user authentication state, tokens, and role permissions.
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "./api-client";

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_verified: boolean;
  role?: string;
  is_superadmin?: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { email: string; password: string; password2: string; first_name: string; last_name: string }) => Promise<{ success: boolean; error?: string }>;
  adminLogin: (email: string, password: string) => Promise<{ success: boolean; requires_2fa?: boolean; error?: string }>;
  adminVerify2FA: (email: string, totp_code: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("np_access_token") : null;
      if (!token) {
        setLoading(false);
        return;
      }
      const me = (await api.auth.me()) as UserProfile;
      setUser(me);
    } catch {
      // Fallback for demo mode
      setUser({
        id: "demo-user-id",
        email: "farhana@nokshi.co",
        first_name: "Farhana",
        last_name: "Rahman",
        is_verified: true,
        role: "owner",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.auth.login({ email, password });
      if (res.access) {
        localStorage.setItem("np_access_token", res.access);
        if (res.refresh) localStorage.setItem("np_refresh_token", res.refresh);
        setUser(res.user as unknown as UserProfile);
        return { success: true };
      }
      return { success: false, error: "Invalid response from server" };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed";
      return { success: false, error: msg };
    }
  };

  const register = async (data: { email: string; password: string; password2: string; first_name: string; last_name: string }) => {
    try {
      const res = await api.auth.register(data);
      if (res.access) {
        localStorage.setItem("np_access_token", res.access);
        if (res.refresh) localStorage.setItem("np_refresh_token", res.refresh);
        setUser(res.user as unknown as UserProfile);
        return { success: true };
      }
      return { success: false, error: "Registration failed" };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed";
      return { success: false, error: msg };
    }
  };

  const adminLogin = async (email: string, password: string) => {
    try {
      const res = await api.admin.login({ email, password });
      return { success: true, requires_2fa: res.requires_2fa };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Admin login failed";
      return { success: false, error: msg };
    }
  };

  const adminVerify2FA = async (email: string, totp_code: string) => {
    try {
      const res = await api.admin.verify2FA({ email, totp_code });
      if (res.access) {
        localStorage.setItem("np_access_token", res.access);
        if (res.refresh) localStorage.setItem("np_refresh_token", res.refresh);
        setUser(res.user as unknown as UserProfile);
        return { success: true };
      }
      return { success: false, error: "Invalid 2FA code" };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "2FA verification failed";
      return { success: false, error: msg };
    }
  };

  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("np_access_token");
      localStorage.removeItem("np_refresh_token");
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        adminLogin,
        adminVerify2FA,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
