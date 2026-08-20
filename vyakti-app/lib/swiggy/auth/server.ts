/**
 * lib/swiggy/auth/server.ts
 *
 * Shared OAuth manager instance for the local Next.js server runtime.
 * This keeps the pending PKCE verifier/state available across the auth start
 * and callback route handlers during a single dev session.
 */

import { OAuthManager } from "./oauth";

let serverOAuthManager: OAuthManager | null = null;

export function getServerOAuthManager(): OAuthManager {
  if (!serverOAuthManager) {
    serverOAuthManager = new OAuthManager();
  }

  return serverOAuthManager;
}
