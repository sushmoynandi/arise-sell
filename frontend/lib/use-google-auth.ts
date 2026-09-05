"use client";

import { useState, useCallback, useEffect } from "react";
import { signInWithGoogleSameTab } from "@/lib/google-auth";
import { useAuth } from "@/lib/auth-context";

interface UseGoogleAuthOptions {
  redirectPath?: string;
  onError?: (error: string) => void;
}

/**
 * Modular React hook for Google Sign-In.
 * Provides unified trigger, error handling, and auto-resetting loading state.
 */
export function useGoogleAuth({
  redirectPath = "/login",
  onError,
}: UseGoogleAuthOptions = {}) {
  const { loading: authLoading, isAuthenticated } = useAuth();
  const [clicked, setClicked] = useState(false);
  const [hasHashToken, setHasHashToken] = useState(() => {
    if (typeof window === "undefined") return false;
    return (window.location.hash || "").includes("access_token=");
  });

  // Check URL on mount for OAuth errors
  useEffect(() => {
    if (typeof window === "undefined") return;

    const hash = window.location.hash || "";
    const search = window.location.search || "";

    if (hash.includes("error=") || search.includes("error=")) {
      const params = new URLSearchParams(
        hash.startsWith("#") ? hash.substring(1) : search,
      );
      const errorMsg =
        params.get("error_description") ||
        params.get("error") ||
        "Google Sign-In was cancelled or failed.";
      if (onError) onError(errorMsg);
      // Clean error from address bar
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [onError]);

  // Safety fallback: Never keep button spinning for more than 10 seconds if redirect doesn't fire
  useEffect(() => {
    if (clicked) {
      const timer = setTimeout(() => {
        setClicked(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [clicked]);

  const triggerGoogleLogin = useCallback(() => {
    setClicked(true);
    try {
      signInWithGoogleSameTab(redirectPath);
    } catch (err: unknown) {
      setClicked(false);
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to initiate Google Sign-In";
      if (onError) onError(msg);
    }
  }, [redirectPath, onError]);

  const resetGoogleLoading = useCallback(() => {
    setClicked(false);
    setHasHashToken(false);
  }, []);

  const googleLoading =
    Boolean(clicked && (authLoading || hasHashToken)) ||
    (hasHashToken && !isAuthenticated);

  return {
    triggerGoogleLogin,
    resetGoogleLoading,
    googleLoading,
  };
}
