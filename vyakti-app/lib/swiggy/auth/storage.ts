/**
 * lib/swiggy/auth/storage.ts
 *
 * Handles persistent storage of OAuth tokens.
 * Lowest layer in the auth stack.
 */

import type { OAuthTokens } from "../types";

export interface TokenStorage {
  getTokens(): Promise<OAuthTokens | null>;
  saveTokens(tokens: OAuthTokens): Promise<void>;
  clearTokens(): Promise<void>;
}

const TOKEN_STORAGE_KEY = "vyakti-swiggy-oauth-tokens";

class MemoryTokenStorage implements TokenStorage {
  private tokens: OAuthTokens | null = null;

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
}

class BrowserTokenStorage implements TokenStorage {
  constructor(private storageKey: string) {}

  async getTokens(): Promise<OAuthTokens | null> {
    const serializedTokens = window.localStorage.getItem(this.storageKey);

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
    window.localStorage.setItem(this.storageKey, JSON.stringify(tokens));
  }

  async clearTokens(): Promise<void> {
    window.localStorage.removeItem(this.storageKey);
  }
}

export function createDefaultTokenStorage(): TokenStorage {
  if (typeof window !== "undefined" && typeof window.localStorage !== "undefined") {
    return new BrowserTokenStorage(TOKEN_STORAGE_KEY);
  }

  return new MemoryTokenStorage();
}
