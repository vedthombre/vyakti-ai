/**
 * lib/swiggy/auth/pkce.ts
 *
 * Utilities for generating PKCE code verifiers and challenges.
 * Used during the initial OAuth 2.1 authorization flow.
 */

/**
 * Stubs for PKCE generation.
 * In a real implementation, this would use the Web Crypto API to generate
 * cryptographically secure random strings and SHA-256 hashes.
 */

export function generateCodeVerifier(): string {
  const randomBytes = new Uint8Array(64);
  crypto.getRandomValues(randomBytes);
  return base64UrlEncode(randomBytes);
}

export async function generateCodeChallenge(verifier: string): Promise<string> {
  const verifierBytes = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", verifierBytes);
  return base64UrlEncode(new Uint8Array(digest));
}

function base64UrlEncode(bytes: Uint8Array): string {
  const base64 =
    typeof Buffer !== "undefined"
      ? Buffer.from(bytes).toString("base64")
      : btoa(String.fromCharCode(...bytes));

  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
