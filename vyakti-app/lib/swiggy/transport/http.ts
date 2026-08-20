/**
 * lib/swiggy/transport/http.ts
 *
 * SDK-backed transport session for Swiggy MCP.
 * Responsible for connection lifecycle, authentication injection, and raw MCP calls.
 */

import type { OAuthSession } from "../auth/oauth";
import { Client as McpClient } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

export type McpListToolsResult = Awaited<ReturnType<McpClient["listTools"]>>;
export type McpToolCallResult = Awaited<ReturnType<McpClient["callTool"]>>;

const DEFAULT_SWIGGY_MCP_URL = "https://mcp.swiggy.com/im";
const DEFAULT_CLIENT_NAME = "vyakti-swiggy-client";
const DEFAULT_CLIENT_VERSION = "0.1.0";

export class HttpTransport {
  private readonly authManager: OAuthSession;
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;
  private client: McpClient | null = null;
  private transport: StreamableHTTPClientTransport | null = null;
  private connectPromise: Promise<void> | null = null;
  private isConnected = false;

  constructor(authManager: OAuthSession, baseUrl = DEFAULT_SWIGGY_MCP_URL, fetchImpl: typeof fetch = fetch) {
    this.authManager = authManager;
    this.baseUrl = baseUrl;
    this.fetchImpl = fetchImpl;
  }

  /**
   * Establishes an MCP session over Streamable HTTP.
   */
  async connect(): Promise<void> {
    await this.ensureConnected();
  }

  /**
   * Tears down the MCP session.
   */
  async disconnect(): Promise<void> {
    try {
      if (this.client) {
        await this.client.close();
      } else if (this.transport) {
        await this.transport.close();
      }
    } finally {
      this.client = null;
      this.transport = null;
      this.connectPromise = null;
      this.isConnected = false;
    }
  }

  /**
   * Lists the tools exposed by the Swiggy MCP server.
   */
  async listTools(): Promise<McpListToolsResult> {
    await this.ensureConnected();

    if (!this.client) {
      throw new Error("[Swiggy/Transport/HTTP] MCP client is not connected.");
    }

    return await this.client.listTools();
  }

  /**
   * Calls a Swiggy MCP tool and returns the raw SDK response unchanged.
   */
  async callTool(name: string, argumentsObject: Record<string, unknown> = {}): Promise<McpToolCallResult> {
    await this.ensureConnected();

    if (!this.client) {
      throw new Error("[Swiggy/Transport/HTTP] MCP client is not connected.");
    }

    return await this.client.callTool({ name, arguments: argumentsObject });
  }

  private async ensureConnected(): Promise<void> {
    if (this.isConnected) {
      return;
    }

    if (!this.connectPromise) {
      this.connectPromise = this.connectInternal();
    }

    await this.connectPromise;
  }

  private async connectInternal(): Promise<void> {
    const transport = new StreamableHTTPClientTransport(new URL(this.baseUrl), {
      fetch: this.createAuthenticatedFetch(),
    });

    const client = new McpClient({
      name: DEFAULT_CLIENT_NAME,
      version: DEFAULT_CLIENT_VERSION,
    });

    try {
      await client.connect(transport);
      this.transport = transport;
      this.client = client;
      this.isConnected = true;
    } catch (error) {
      await transport.close().catch(() => undefined);
      throw error;
    }
  }

  private createAuthenticatedFetch(): typeof fetch {
    return async (input, init) => {
      const firstAttempt = await this.fetchWithAuthorization(input, init);

      if (firstAttempt.status !== 401) {
        return firstAttempt;
      }

      return await this.fetchWithAuthorization(input, init);
    };
  }

  private async fetchWithAuthorization(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const token = await this.authManager.getValidAccessToken();

    if (!token) {
      throw new Error("[Swiggy/Transport/HTTP] Unauthorized: No valid access token.");
    }

    const headers = new Headers(init?.headers);
    headers.set("Authorization", `Bearer ${token}`);

    return await this.fetchImpl(input, {
      ...init,
      headers,
    });
  }
}
