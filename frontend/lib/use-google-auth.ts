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
  const [hasHashToken, setHasHashToken] = useState(false);

  // Check URL on mount for OAuth tokens or OAuth errors
  useEffect(() => {
    if (typeof window === "undefined") return;

    const hash = window.location.hash || "";
    const search = window.location.search || "";

    if (hash.includes("access_token=")) {
      setHasHashToken(true);
    } else if (hash.includes("error=") || search.includes("error=")) {
      const params = new URLSearchParams(
        hash.startsWith("#") ? hash.substring(1) : search,
      );
      const errorMsg =
        params.get("error_description") ||
        params.get("error") ||
        "Google Sign-In was cancelled or failed.";
      setClicked(false);
      setHasHashToken(false);
      if (onError) onError(errorMsg);
      // Clean error from address bar
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [onError]);

  // Once parent auth completes or fails, release the loading state
  useEffect(() => {
    if (!authLoading && !hasHashToken) {
      setClicked(false);
    }
  }, [authLoading, hasHashToken]);

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

  return {
    triggerGoogleLogin,
    resetGoogleLoading,
    googleLoading: (clicked || hasHashToken) && !isAuthenticated,
  };
}
