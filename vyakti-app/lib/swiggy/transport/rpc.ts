/**
 * lib/swiggy/transport/rpc.ts
 *
 * JSON-RPC 2.0 wrapper over the HTTP transport.
 * Formats requests to match the MCP specification and parses responses.
 */

import type { McpRequest, McpResponse } from "../types";
import { HttpTransport } from "./http";

export class RpcClient {
  private http: HttpTransport;
  private idCounter = 1;

  constructor(http: HttpTransport) {
    this.http = http;
  }

  /**
   * Executes a JSON-RPC method.
   */
  async call<TResult, TParams = Record<string, unknown>>(
    method: string,
    params?: TParams
  ): Promise<TResult> {
    const requestId = this.idCounter++;
    
    const request: McpRequest<TParams> = {
      jsonrpc: "2.0",
      id: requestId,
      method,
      params,
    };

    console.log(`[Swiggy/Transport/RPC] Requesting method: ${method}`);

    const response = await this.http.post<McpResponse<TResult>>("/rpc", request);

    if (response.jsonrpc !== "2.0") {
      throw new Error(`[Swiggy/Transport/RPC] Invalid JSON-RPC version for method ${method}.`);
    }

    if (response.id !== requestId) {
      throw new Error(`[Swiggy/Transport/RPC] Response id mismatch for method ${method}.`);
    }

    if (response.error) {
      throw new Error(`[Swiggy/Transport/RPC] Error ${response.error.code}: ${response.error.message}`);
    }

    if (!Object.prototype.hasOwnProperty.call(response, "result")) {
      throw new Error(`[Swiggy/Transport/RPC] Missing result for method ${method}.`);
    }

    return response.result as TResult;
  }
}
