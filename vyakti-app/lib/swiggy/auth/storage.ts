/**
 * lib/swiggy/auth/storage.ts
 *
 * Handles persistent storage for OAuth tokens and the pending PKCE verifier.
 * Lowest layer in the auth stack.
 */

import type { OAuthTokens } from "../types";

export interface TokenStorage {
  getTokens(): Promise<OAuthTokens | null>;
  saveTokens(tokens: OAuthTokens): Promise<void>;
  clearTokens(): Promise<void>;
  getPendingCodeVerifier(): Promise<string | null>;
  savePendingCodeVerifier(verifier: string): Promise<void>;
  clearPendingCodeVerifier(): Promise<void>;
  getPendingState(): Promise<string | null>;
  savePendingState(state: string): Promise<void>;
  clearPendingState(): Promise<void>;
}

const TOKEN_STORAGE_KEY = "vyakti-swiggy-oauth-tokens";
const PKCE_VERIFIER_STORAGE_KEY = "vyakti-swiggy-oauth-pkce-verifier";
const OAUTH_STATE_STORAGE_KEY = "vyakti-swiggy-oauth-state";

function readSerializedValue(storage: Storage, key: string): string | null {
  const value = storage.getItem(key);
  return value && value.length > 0 ? value : null;
}

class MemoryTokenStorage implements TokenStorage {
  private tokens: OAuthTokens | null = null;
  private pendingCodeVerifier: string | null = null;
  private pendingState: string | null = null;

  async getTokens(): Promise<OAuthTokens | null> {
    return this.tokens;
  }

  async saveTokens(tokens: OAuthTokens): Promise<void> {
    this.tokens = tokens;
    console.log("[Swiggy/Auth/Storage] Tokens saved securely.");
  }

  async clearTokens(): Promise<void> {
    this.tokens = null;
  }

  async getPendingCodeVerifier(): Promise<string | null> {
    return this.pendingCodeVerifier;
  }

  async savePendingCodeVerifier(verifier: string): Promise<void> {
    this.pendingCodeVerifier = verifier;
  }

  async clearPendingCodeVerifier(): Promise<void> {
    this.pendingCodeVerifier = null;
  }

  async getPendingState(): Promise<string | null> {
    return this.pendingState;
  }

  async savePendingState(state: string): Promise<void> {
    this.pendingState = state;
  }

  async clearPendingState(): Promise<void> {
    this.pendingState = null;
  }
}

class BrowserTokenStorage implements TokenStorage {
  constructor(
    private tokenStorageKey: string,
    private verifierStorageKey: string,
  ) {}

  async getTokens(): Promise<OAuthTokens | null> {
    const serializedTokens = readSerializedValue(window.localStorage, this.tokenStorageKey);

    if (!serializedTokens) {
      return null;
    }

    try {
      return JSON.parse(serializedTokens) as OAuthTokens;
    } catch {
      await this.clearTokens();
      return null;
    }
  }

  async saveTokens(tokens: OAuthTokens): Promise<void> {
    window.localStorage.setItem(this.tokenStorageKey, JSON.stringify(tokens));
  }

  async clearTokens(): Promise<void> {
    window.localStorage.removeItem(this.tokenStorageKey);
  }

  async getPendingCodeVerifier(): Promise<string | null> {
    return readSerializedValue(window.sessionStorage, this.verifierStorageKey);
  }

  async savePendingCodeVerifier(verifier: string): Promise<void> {
    window.sessionStorage.setItem(this.verifierStorageKey, verifier);
  }

  async clearPendingCodeVerifier(): Promise<void> {
    window.sessionStorage.removeItem(this.verifierStorageKey);
  }

  async getPendingState(): Promise<string | null> {
    return readSerializedValue(window.sessionStorage, OAUTH_STATE_STORAGE_KEY);
  }

  async savePendingState(state: string): Promise<void> {
    window.sessionStorage.setItem(OAUTH_STATE_STORAGE_KEY, state);
  }

  async clearPendingState(): Promise<void> {
    window.sessionStorage.removeItem(OAUTH_STATE_STORAGE_KEY);
  }
}

export function createDefaultTokenStorage(): TokenStorage {
  if (typeof window !== "undefined" && typeof window.localStorage !== "undefined") {
    return new BrowserTokenStorage(TOKEN_STORAGE_KEY, PKCE_VERIFIER_STORAGE_KEY);
  }

  return new MemoryTokenStorage();
}
