/**
 * lib/swiggy/tools/search.ts
 *
 * Implements the Swiggy MCP "searchProducts" capability.
 * Uses the RPC client to execute the call.
 */

import type { RpcClient } from "../transport/rpc";
import type { SwiggyProduct } from "../types";

export class SearchTool {
  constructor(private rpc: RpcClient) {}

  /**
   * Searches for products using the Swiggy MCP.
   */
  async searchProducts(query: string): Promise<SwiggyProduct[]> {
    return this.rpc.call<SwiggyProduct[], { query: string }>("searchProducts", { query });
  }
}
