/**
 * lib/swiggy/tools/checkout.ts
 *
 * Implements the Swiggy MCP "checkout" capability.
 * Uses the RPC client to execute the call.
 */

import type { RpcClient } from "../transport/rpc";
import type { SwiggyCartItem } from "../types";

export class CheckoutTool {
  constructor(private rpc: RpcClient) {}

  /**
   * Initiates checkout for the given cart items via MCP.
   */
  async checkout(cart: SwiggyCartItem[]): Promise<string> {
    return this.rpc.call<string, { cart: SwiggyCartItem[] }>("checkout", { cart });
  }
}
