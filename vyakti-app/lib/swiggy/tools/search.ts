/**
 * lib/swiggy/tools/search.ts
 *
 * Implements the Swiggy MCP "search_products" capability.
 * Uses the RPC client to execute the call and returns the raw SDK response.
 */

import type { RpcClient, McpToolCallResult } from "../transport/rpc";

export class SearchTool {
  constructor(private rpc: RpcClient) {}

  /**
   * Searches for products using the Swiggy MCP.
   */
  async searchProducts(query: string): Promise<McpToolCallResult> {
    return this.rpc.callTool("search_products", { query });
  }
}
