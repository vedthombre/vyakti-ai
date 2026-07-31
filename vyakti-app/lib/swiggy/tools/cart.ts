/**
 * lib/swiggy/tools/cart.ts
 *
 * Implements the Swiggy MCP "addToCart" capability.
 * Uses the RPC client to execute the call.
 */

import type { RpcClient } from "../transport/rpc";
import type { SwiggyCartItem } from "../types";

export class CartTool {
  constructor(private rpc: RpcClient) {}

  /**
   * Adds an item to the Swiggy cart via MCP.
   */
  async addToCart(item: SwiggyCartItem): Promise<boolean> {
    return this.rpc.call<boolean, { item: SwiggyCartItem }>("addToCart", { item });
  }
}
