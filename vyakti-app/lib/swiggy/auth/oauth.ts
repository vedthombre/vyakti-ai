/**
 * lib/swiggy/auth/oauth.ts
 *
 * Orchestrates the OAuth 2.1 flow.
 * Depends on storage.ts and pkce.ts. Does not depend on transport layer.
 */

import type { OAuthTokens } from "../types";
import { createDefaultTokenStorage, type TokenStorage } from "./storage";
import { generateCodeVerifier, generateCodeChallenge } from "./pkce";

const DEFAULT_AUTHORIZATION_URL = "https://auth.swiggy.com/oauth/authorize";
const DEFAULT_TOKEN_URL = "https://auth.swiggy.com/oauth/token";
const DEFAULT_CLIENT_ID = "vyakti-swiggy-client";
const DEFAULT_REDIRECT_URI = "http://localhost:3000/api/auth/swiggy/callback";
const DEFAULT_SCOPE = "openid profile offline_access";

export class OAuthManager {
  private storage: TokenStorage;
  private lastCodeVerifier: string | null = null;

  constructor(storage?: TokenStorage) {
    this.storage = storage ?? createDefaultTokenStorage();
  }

  /**
   * Generates the authorization URL to redirect the user to.
   */
  async getAuthorizationUrl(): Promise<string> {
    this.lastCodeVerifier = generateCodeVerifier();
    const challenge = await generateCodeChallenge(this.lastCodeVerifier);

    const authorizationUrl = new URL(DEFAULT_AUTHORIZATION_URL);
    authorizationUrl.searchParams.set("client_id", DEFAULT_CLIENT_ID);
    authorizationUrl.searchParams.set("response_type", "code");
    authorizationUrl.searchParams.set("redirect_uri", DEFAULT_REDIRECT_URI);
    authorizationUrl.searchParams.set("scope", DEFAULT_SCOPE);
    authorizationUrl.searchParams.set("code_challenge", challenge);
    authorizationUrl.searchParams.set("code_challenge_method", "S256");

    return authorizationUrl.toString();
  }

  /**
   * Exchanges an authorization code for access/refresh tokens.
   */
  async exchangeCodeForTokens(code: string): Promise<void> {
    const verifier = this.lastCodeVerifier;

    if (!verifier) {
      throw new Error("[Swiggy/Auth/OAuth] Missing PKCE verifier. Generate an authorization URL first.");
    }

    const response = await fetch(DEFAULT_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: DEFAULT_CLIENT_ID,
        redirect_uri: DEFAULT_REDIRECT_URI,
        code,
        code_verifier: verifier,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`[Swiggy/Auth/OAuth] Token exchange failed (${response.status}): ${errorText}`);
    }

    const payload = (await response.json()) as {
      access_token?: string;
      refresh_token?: string;
      expires_in?: number;
    };

    if (!payload.access_token) {
      throw new Error("[Swiggy/Auth/OAuth] Token response did not include an access token.");
    }

    const expiresIn = payload.expires_in ?? 3600;

    await this.storage.saveTokens({
      accessToken: payload.access_token,
      refreshToken: payload.refresh_token,
      expiresAt: Date.now() + expiresIn * 1000,
    });
  }

  /**
   * Retrieves a valid access token. Refreshes if necessary.
   */
  async getValidAccessToken(): Promise<string | null> {
    const tokens = await this.storage.getTokens();

    if (!tokens) {
      return null;
    }

    if (Date.now() > tokens.expiresAt) {
      if (!tokens.refreshToken) {
        await this.storage.clearTokens();
        return null;
      }

      const response = await fetch(DEFAULT_TOKEN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          client_id: DEFAULT_CLIENT_ID,
          refresh_token: tokens.refreshToken,
        }),
      });

      if (!response.ok) {
        await this.storage.clearTokens();
        return null;
      }

      const payload = (await response.json()) as {
        access_token?: string;
        refresh_token?: string;
        expires_in?: number;
      };

      if (!payload.access_token) {
        await this.storage.clearTokens();
        return null;
      }

      const refreshedTokens: OAuthTokens = {
        accessToken: payload.access_token,
        refreshToken: payload.refresh_token ?? tokens.refreshToken,
        expiresAt: Date.now() + (payload.expires_in ?? 3600) * 1000,
      };

      await this.storage.saveTokens(refreshedTokens);
      return refreshedTokens.accessToken;
    }

    return tokens.accessToken;
  }
}
