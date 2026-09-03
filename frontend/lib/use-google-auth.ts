"use client";

import { useState, useCallback, useEffect } from "react";
import { signInWithGoogleSameTab } from "@/lib/google-auth";

interface UseGoogleAuthOptions {
  redirectPath?: string;
  onError?: (error: string) => void;
}

/**
 * Modular React hook for Google Sign-In.
 * Provides unified trigger and loading state across login and signup pages.
 */
export function useGoogleAuth({
  redirectPath = "/login",
}: UseGoogleAuthOptions = {}) {
  const [clicked, setClicked] = useState(false);
  const [hasHashToken, setHasHashToken] = useState(false);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.location.hash.includes("access_token=")
    ) {
      setHasHashToken(true);
    }
  }, []);

  const triggerGoogleLogin = useCallback(() => {
    setClicked(true);
    signInWithGoogleSameTab(redirectPath);
  }, [redirectPath]);

  return {
    triggerGoogleLogin,
    googleLoading: clicked || hasHashToken,
  };
}
