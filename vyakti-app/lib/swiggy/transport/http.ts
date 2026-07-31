/**
 * lib/swiggy/transport/http.ts
 *
 * Base HTTP transport client.
 * Responsible for injecting Auth headers, handling retries, and network errors.
 * Knows about Auth, but knows nothing about JSON-RPC or specific MCP tools.
 */

import { OAuthManager } from "../auth/oauth";

export class HttpTransport {
  private authManager: OAuthManager;
  private baseUrl: string;
  private fetchImpl: typeof fetch;

  constructor(authManager: OAuthManager, baseUrl = "https://api.swiggy.com/mcp", fetchImpl: typeof fetch = fetch) {
    this.authManager = authManager;
    this.baseUrl = baseUrl;
    this.fetchImpl = fetchImpl;
  }

  /**
   * Executes a raw HTTP POST request to the MCP server.
   */
  async post<T>(endpoint: string, body: unknown): Promise<T> {
    const token = await this.authManager.getValidAccessToken();
    
    if (!token) {
      throw new Error("[Swiggy/Transport/HTTP] Unauthorized: No valid access token.");
    }

    const url = `${this.baseUrl}${endpoint}`;
    const response = await this.fetchImpl(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`[Swiggy/Transport/HTTP] HTTP ${response.status} ${response.statusText}: ${errorText}`);
    }

    return (await response.json()) as T;
  }
}
