/**
 * lib/swiggy/tools/addresses.ts
 *
 * Implements the Swiggy MCP "get_addresses" capability.
 * The transport stays generic; this wrapper is responsible for any future
 * parsing or shaping of the raw MCP response.
 */

import type { RpcClient, McpToolCallResult } from "../transport/rpc";

export class AddressesTool {
  constructor(private rpc: RpcClient) {}

  /**
   * Fetches the authenticated user's saved addresses from Swiggy MCP.
   */
  async getAddresses(): Promise<McpToolCallResult> {
    return await this.rpc.callTool("get_addresses", {});
  }
}