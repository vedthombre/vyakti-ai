/**
 * lib/swiggy/auth/oauth.ts
 *
 * Orchestrates the OAuth 2.1 flow.
 * Depends on storage.ts and pkce.ts. Does not depend on transport layer.
 */

import type { OAuthTokens } from "../types";
import { createDefaultTokenStorage, type TokenStorage } from "./storage";
import { generateCodeVerifier, generateCodeChallenge } from "./pkce";

const DEFAULT_AUTHORIZATION_URL = "https://mcp.swiggy.com/auth/authorize";
const DEFAULT_TOKEN_URL = "https://mcp.swiggy.com/auth/token";
const DEFAULT_CLIENT_ID = "vyakti-swiggy-client";
const DEFAULT_REDIRECT_URI = "http://localhost:3000/api/auth/swiggy/callback";
const DEFAULT_SCOPE = "openid profile offline_access";

function resolveSwiggyAuthorizationUrl(): string {
  return process.env.SWIGGY_AUTHORIZATION_URL ?? DEFAULT_AUTHORIZATION_URL;
}

function resolveSwiggyTokenUrl(): string {
  return process.env.SWIGGY_TOKEN_URL ?? DEFAULT_TOKEN_URL;
}

export interface OAuthManagerOptions {
  storage?: TokenStorage;
  fetchImpl?: typeof fetch;
  authorizationUrl?: string;
  tokenUrl?: string;
  clientId?: string;
  redirectUri?: string;
  scope?: string;
  now?: () => number;
}

export interface OAuthSession {
  getAuthorizationUrl(): Promise<string>;
  exchangeCodeForTokens(code: string, state: string): Promise<void>;
  getValidAccessToken(): Promise<string | null>;
}

interface TokenEndpointPayload {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
}

function generateOAuthState(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);

  const base64 =
    typeof Buffer !== "undefined"
      ? Buffer.from(bytes).toString("base64")
      : btoa(String.fromCharCode(...bytes));

  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export class OAuthManager implements OAuthSession {
  private readonly storage: TokenStorage;
  private readonly fetchImpl: typeof fetch;
  private readonly authorizationUrl: string;
  private readonly tokenUrl: string;
  private readonly clientId: string;
  private readonly redirectUri: string;
  private readonly scope: string;
  private readonly now: () => number;

  constructor(options: OAuthManagerOptions = {}) {
    this.storage = options.storage ?? createDefaultTokenStorage();
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.authorizationUrl = options.authorizationUrl ?? resolveSwiggyAuthorizationUrl();
    this.tokenUrl = options.tokenUrl ?? resolveSwiggyTokenUrl();
    this.clientId = options.clientId ?? DEFAULT_CLIENT_ID;
    this.redirectUri = options.redirectUri ?? DEFAULT_REDIRECT_URI;
    this.scope = options.scope ?? DEFAULT_SCOPE;
    this.now = options.now ?? (() => Date.now());
  }

  /**
   * Generates the authorization URL to redirect the user to.
   */
  async getAuthorizationUrl(): Promise<string> {
    const codeVerifier = generateCodeVerifier();
    const challenge = await generateCodeChallenge(codeVerifier);
    const state = generateOAuthState();

    await this.storage.savePendingCodeVerifier(codeVerifier);
    await this.storage.savePendingState(state);

    const authorizationUrl = new URL(this.authorizationUrl);
    authorizationUrl.searchParams.set("client_id", this.clientId);
    authorizationUrl.searchParams.set("response_type", "code");
    authorizationUrl.searchParams.set("redirect_uri", this.redirectUri);
    authorizationUrl.searchParams.set("scope", this.scope);
    authorizationUrl.searchParams.set("state", state);
    authorizationUrl.searchParams.set("code_challenge", challenge);
    authorizationUrl.searchParams.set("code_challenge_method", "S256");

    return authorizationUrl.toString();
  }

  /**
   * Exchanges an authorization code for access/refresh tokens.
   */
  async exchangeCodeForTokens(code: string, state: string): Promise<void> {
    const verifier = await this.storage.getPendingCodeVerifier();
    const pendingState = await this.storage.getPendingState();

    if (!verifier) {
      throw new Error("[Swiggy/Auth/OAuth] Missing PKCE verifier. Generate an authorization URL first.");
    }

    if (!pendingState) {
      throw new Error("[Swiggy/Auth/OAuth] Missing OAuth state. Generate an authorization URL first.");
    }

    if (state !== pendingState) {
      throw new Error("[Swiggy/Auth/OAuth] OAuth state mismatch. Restart the authorization flow.");
    }

    const response = await this.fetchImpl(this.tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: this.clientId,
        redirect_uri: this.redirectUri,
        code,
        code_verifier: verifier,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`[Swiggy/Auth/OAuth] Token exchange failed (${response.status}): ${errorText}`);
    }

    const payload = (await response.json()) as TokenEndpointPayload;

    if (!payload.access_token) {
      throw new Error("[Swiggy/Auth/OAuth] Token response did not include an access token.");
    }

    const expiresIn = payload.expires_in ?? 3600;

    await this.storage.saveTokens({
      accessToken: payload.access_token,
      refreshToken: payload.refresh_token,
      expiresAt: this.now() + expiresIn * 1000,
    });

    await this.storage.clearPendingCodeVerifier();
    await this.storage.clearPendingState();
  }

  /**
   * Retrieves a valid access token. Refreshes if necessary.
   */
  async getValidAccessToken(): Promise<string | null> {
    const tokens = await this.storage.getTokens();

    if (!tokens) {
      return null;
    }

    if (this.now() > tokens.expiresAt) {
      if (!tokens.refreshToken) {
        await this.storage.clearTokens();
        return null;
      }

      const response = await this.fetchImpl(this.tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          client_id: this.clientId,
          refresh_token: tokens.refreshToken,
        }),
      });

      if (!response.ok) {
        await this.storage.clearTokens();
        return null;
      }

      const payload = (await response.json()) as TokenEndpointPayload;

      if (!payload.access_token) {
        await this.storage.clearTokens();
        return null;
      }

      const refreshedTokens: OAuthTokens = {
        accessToken: payload.access_token,
        refreshToken: payload.refresh_token ?? tokens.refreshToken,
        expiresAt: this.now() + (payload.expires_in ?? 3600) * 1000,
      };

      await this.storage.saveTokens(refreshedTokens);
      return refreshedTokens.accessToken;
    }

    return tokens.accessToken;
  }
}
