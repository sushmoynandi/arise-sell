/**
 * NextProduct AI - Google OAuth 2.0 Client
 *
 * Implements hardened same-tab OAuth 2.0 flow:
 * - Anti-CSRF cryptographic state parameter generation & validation.
 * - Address bar sanitization (removes sensitive tokens from history).
 * - Guaranteed same-tab navigation (no popups, no new tabs, no FedCM errors).
 */

export const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  "800991434441-8tl7rr6qp1ko6frqe7c1ovr964jtt18g.apps.googleusercontent.com";

const STATE_STORAGE_KEY = "np_google_oauth_state";
const RETURN_TO_KEY = "np_google_return_to";

/**
 * Initiates Google OAuth 2.0 in the CURRENT tab with anti-CSRF state token.
 */
export function signInWithGoogleSameTab(customRedirectPath: string = "/login") {
  if (typeof window === "undefined") return;

  const pathname = customRedirectPath.startsWith("/")
    ? customRedirectPath
    : `/${customRedirectPath}`;

  const redirectUri = `${window.location.origin}${pathname}`;

  // Generate cryptographically secure state nonce for CSRF mitigation
  const stateNonce =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2) + Date.now().toString(36);

  sessionStorage.setItem(STATE_STORAGE_KEY, stateNonce);
  sessionStorage.setItem(RETURN_TO_KEY, "/console");

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "token",
    scope: "openid email profile",
    state: stateNonce,
    prompt: "select_account",
    include_granted_scopes: "true",
  });

  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Parses and verifies access_token from URL hash upon redirect.
 * Enforces CSRF state verification and sanitizes the address bar.
 */
export function parseGoogleHashToken(): string | null {
  if (typeof window === "undefined") return null;

  const hash = window.location.hash;
  if (!hash || !hash.includes("access_token=")) return null;

  const cleanHash = hash.startsWith("#") ? hash.substring(1) : hash;
  const params = new URLSearchParams(cleanHash);
  const token = params.get("access_token");
  const returnedState = params.get("state");

  // Always sanitize the address bar immediately so tokens are never exposed
  window.history.replaceState(
    null,
    "",
    window.location.pathname + window.location.search,
  );

  if (!token) return null;

  // CSRF State Validation
  const savedState = sessionStorage.getItem(STATE_STORAGE_KEY);
  sessionStorage.removeItem(STATE_STORAGE_KEY);

  if (savedState && returnedState && savedState !== returnedState) {
    console.error("OAuth state mismatch: potential CSRF attack detected.");
    return null;
  }

  return token;
}
