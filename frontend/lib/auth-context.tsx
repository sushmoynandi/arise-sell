"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import api from "./api-client";
import { setCookie, deleteCookie } from "./cookies";
import { parseGoogleHashToken } from "./google-auth";

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_verified: boolean;
  role?: string;
  is_superadmin?: boolean;
  plan?: string | null;
  has_plan?: boolean;
  phone?: string | null;
  avatar_url?: string | null;
  hue?: number;
  auth_provider?: string;
  has_password?: boolean;
  business_id?: string | null;
  has_store?: boolean;
  scheduled_deletion_at?: string | null;
  reactivated?: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (
    email: string,
    password: string,
    rememberMe?: boolean,
  ) => Promise<{ success: boolean; user?: UserProfile; error?: string }>;
  register: (data: {
    email: string;
    password: string;
    password2?: string;
    first_name?: string;
    last_name?: string;
    full_name?: string;
    store_name?: string;
  }) => Promise<{ success: boolean; user?: UserProfile; error?: string }>;
  updateProfile: (data: {
    first_name?: string;
    last_name?: string;
    phone?: string;
    avatar_url?: string;
    hue?: number;
  }) => Promise<{ success: boolean; user?: UserProfile; error?: string }>;
  changePassword: (data: {
    current_password?: string;
    new_password: string;
    confirm_password?: string;
  }) => Promise<{ success: boolean; message?: string; error?: string }>;
  adminLogin: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; requires_2fa?: boolean; error?: string }>;
  adminVerify2FA: (
    email: string,
    totp_code: string,
  ) => Promise<{ success: boolean; error?: string }>;
  selectPlan: (
    planId: string,
    billingPeriod?: string,
    reconciliation?: {
      keep_store_ids?: string[];
      keep_team_member_ids?: string[];
    },
  ) => Promise<{ success: boolean; error?: string }>;
  forgotPassword: (email: string) => Promise<{
    success: boolean;
    message?: string;
    error?: string;
    reset_token?: string;
  }>;
  resetPassword: (
    token: string,
    new_password: string,
    confirm_password?: string,
  ) => Promise<{ success: boolean; message?: string; error?: string }>;
  loginWithGoogle: (data: {
    credential?: string;
    access_token?: string;
  }) => Promise<{ success: boolean; user?: UserProfile; error?: string }>;
  deleteAccount: (data: {
    password?: string;
    confirm_phrase: string;
  }) => Promise<{
    success: boolean;
    scheduled_deletion_at?: string;
    grace_days?: number;
    message?: string;
    error?: string;
  }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const googleAuthHandled = useRef(false);

  const syncUserCookies = (u: UserProfile | null, days: number = 7) => {
    if (u) {
      setCookie("np_role", u.role || "merchant", days);
      setCookie("np_is_superadmin", u.is_superadmin ? "true" : "false", days);
      setCookie("np_has_plan", u.has_plan ? "true" : "false", days);
    } else {
      deleteCookie("np_role");
      deleteCookie("np_is_superadmin");
      deleteCookie("np_has_plan");
    }
  };

  const fetchCurrentUser = useCallback(async () => {
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("np_access_token")
          : null;
      if (!token) {
        setLoading(false);
        return;
      }
      const me = (await api.auth.me()) as unknown as UserProfile;
      setUser(me);
      syncUserCookies(me);
    } catch {
      // Clear invalid/expired token without falling back to mock user
      api.clearTokens();
      syncUserCookies(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // 1. Check if returning from same-tab Google OAuth redirect
    const googleAccessToken = parseGoogleHashToken();
    if (googleAccessToken && !googleAuthHandled.current) {
      googleAuthHandled.current = true;
      setLoading(true);
      api.auth
        .google({ access_token: googleAccessToken })
        .then((res) => {
          if (res.access) {
            api.setTokens(res.access, res.refresh, 7);
            const userProfile = res.user as unknown as UserProfile;
            setUser(userProfile);
            syncUserCookies(userProfile, 7);

            const returnTo = userProfile.is_superadmin ? "/admin" : "/console";
            sessionStorage.removeItem("np_google_return_to");

            // Guaranteed cookie flush before redirection
            setTimeout(() => {
              window.location.replace(returnTo);
            }, 100);
          } else {
            setLoading(false);
            fetchCurrentUser();
          }
        })
        .catch((err) => {
          console.error("Google authentication failed:", err);
          setLoading(false);
          fetchCurrentUser();
        });
      return;
    }

    if (!googleAuthHandled.current) {
      // 2. Normal session check
      fetchCurrentUser();
    }
  }, [fetchCurrentUser]);

  const login = async (email: string, password: string, rememberMe = true) => {
    try {
      const res = await api.auth.login({ email, password });
      if (res.access) {
        const days = rememberMe ? 7 : 1;
        api.setTokens(res.access, res.refresh, days);
        const userProfile = res.user as unknown as UserProfile;
        setUser(userProfile);
        syncUserCookies(userProfile, days);
        if (userProfile.reactivated) {
          localStorage.setItem("arise_account_reactivated", "true");
        }
        return { success: true, user: userProfile };
      }
      return { success: false, error: "Invalid response from server" };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed";
      return { success: false, error: msg };
    }
  };

  const register = async (data: {
    email: string;
    password: string;
    password2?: string;
    first_name?: string;
    last_name?: string;
    full_name?: string;
    store_name?: string;
  }) => {
    try {
      const res = await api.auth.register(data);
      if (res.access) {
        api.setTokens(res.access, res.refresh, 7);
        const userProfile = res.user as unknown as UserProfile;
        setUser(userProfile);
        syncUserCookies(userProfile, 7);
        return { success: true, user: userProfile };
      }
      return { success: false, error: "Registration failed" };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed";
      return { success: false, error: msg };
    }
  };

  const updateProfile = async (data: {
    first_name?: string;
    last_name?: string;
    phone?: string;
    avatar_url?: string;
    hue?: number;
  }) => {
    try {
      const res = await api.auth.updateProfile(data);
      if (res && res.id) {
        const updated = res as unknown as UserProfile;
        setUser(updated);
        syncUserCookies(updated, 7);
        return { success: true, user: updated };
      }
      return { success: false, error: "Failed to update profile" };
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to update profile";
      return { success: false, error: msg };
    }
  };

  const changePassword = async (data: {
    current_password?: string;
    new_password: string;
    confirm_password?: string;
  }) => {
    try {
      const res = await api.auth.changePassword(data);
      if (res.success) {
        setUser((prev) => (prev ? { ...prev, has_password: true } : prev));
        return { success: true, message: res.message };
      }
      return { success: false, error: "Failed to change password" };
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to change password";
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
        api.setTokens(res.access, res.refresh, 7);
        const userProfile = res.user as unknown as UserProfile;
        setUser(userProfile);
        syncUserCookies(userProfile, 7);
        return { success: true };
      }
      return { success: false, error: "Invalid 2FA code" };
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "2FA verification failed";
      return { success: false, error: msg };
    }
  };

  const selectPlan = async (
    planId: string,
    billingPeriod = "monthly",
    reconciliation?: {
      keep_store_ids?: string[];
      keep_team_member_ids?: string[];
    },
  ) => {
    try {
      const res = await api.billing.selectPlan({
        plan_id: planId,
        billing_period: billingPeriod,
        reconciliation,
      });
      if (res.success) {
        if (user) {
          const updated: UserProfile = {
            ...user,
            plan: res.plan,
            has_plan: true,
          };
          setUser(updated);
          syncUserCookies(updated, 7);
        }
        return { success: true };
      }
      return { success: false, error: "Failed to activate plan" };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Plan activation failed";
      return { success: false, error: msg };
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      const res = await api.auth.forgotPassword(email);
      return {
        success: true,
        message: res.message,
        reset_token: res.reset_token,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Password reset failed";
      return { success: false, error: msg };
    }
  };

  const resetPassword = async (
    token: string,
    new_password: string,
    confirm_password?: string,
  ) => {
    try {
      const res = await api.auth.resetPassword({
        token,
        new_password,
        confirm_password,
      });
      return { success: true, message: res.message };
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to reset password";
      return { success: false, error: msg };
    }
  };

  const loginWithGoogle = async (data: {
    credential?: string;
    access_token?: string;
  }) => {
    try {
      const res = await api.auth.google(data);
      if (res.access) {
        api.setTokens(res.access, res.refresh, 7);
        const userProfile = res.user as unknown as UserProfile;
        setUser(userProfile);
        syncUserCookies(userProfile, 7);
        if (userProfile.reactivated) {
          localStorage.setItem("arise_account_reactivated", "true");
        }
        return { success: true, user: userProfile };
      }
      return { success: false, error: "Invalid response from server" };
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Google authentication failed";
      return { success: false, error: msg };
    }
  };

  const deleteAccount = async (data: {
    password?: string;
    confirm_phrase: string;
  }) => {
    try {
      const res = await api.auth.deleteAccount(data);
      if (res.success) {
        api.clearTokens();
        syncUserCookies(null);
        setUser(null);
        return {
          success: true,
          scheduled_deletion_at: res.scheduled_deletion_at,
          grace_days: res.grace_days,
          message: res.message,
        };
      }
      return { success: false, error: "Failed to delete account" };
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Account deletion failed";
      return { success: false, error: msg };
    }
  };

  const logout = () => {
    api.auth.logout().catch(() => {});
    api.clearTokens();
    syncUserCookies(null);
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
        updateProfile,
        changePassword,
        adminLogin,
        adminVerify2FA,
        selectPlan,
        forgotPassword,
        resetPassword,
        loginWithGoogle,
        deleteAccount,
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
