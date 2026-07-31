/**
 * lib/swiggy/client.ts
 *
 * The unified public entry point for the Swiggy SDK.
 * 
 * Vyakti components (like the Marketplace Aggregator or Providers)
 * must ONLY import from this file. They should never import Auth,
 * Transport, or Tools directly.
 */

import { OAuthManager } from "./auth/oauth";
import { HttpTransport } from "./transport/http";
import { RpcClient } from "./transport/rpc";

import { SearchTool } from "./tools/search";
import { CartTool } from "./tools/cart";
import { CheckoutTool } from "./tools/checkout";

import type { SwiggyProduct, SwiggyCartItem } from "./types";

export type { OAuthTokens, SwiggyCartItem, SwiggyProduct } from "./types";

export class SwiggyClient {
  private auth: OAuthManager;
  private http: HttpTransport;
  private rpc: RpcClient;

  // Tools
  private searchTool: SearchTool;
  private cartTool: CartTool;
  private checkoutTool: CheckoutTool;

  constructor() {
    // 1. Initialize Auth Layer
    this.auth = new OAuthManager();

    // 2. Initialize Transport Layer
    this.http = new HttpTransport(this.auth);
    this.rpc = new RpcClient(this.http);

    // 3. Initialize Tools Layer
    this.searchTool = new SearchTool(this.rpc);
    this.cartTool = new CartTool(this.rpc);
    this.checkoutTool = new CheckoutTool(this.rpc);
  }

  // ── Auth Public Methods ─────────────────────────────────────────────────────

  /**
   * Authenticates the client. Usually redirects user to the OAuth URL.
   */
  async getAuthorizationUrl(): Promise<string> {
    return this.auth.getAuthorizationUrl();
  }

  /**
   * Exchanges an OAuth callback code for valid tokens.
   */
  async handleCallbackCode(code: string): Promise<void> {
    return this.auth.exchangeCodeForTokens(code);
  }

  // ── SDK Public API (Delegates to tools) ─────────────────────────────────────

  /**
   * Search for products on Swiggy Instamart via MCP.
   */
  async searchProducts(query: string): Promise<SwiggyProduct[]> {
    return this.searchTool.searchProducts(query);
  }

  /**
   * Add a specific item to the Swiggy cart via MCP.
   */
  async addToCart(item: SwiggyCartItem): Promise<boolean> {
    return this.cartTool.addToCart(item);
  }

  /**
   * Initiates checkout for the items in the cart via MCP.
   */
  async checkout(cart: SwiggyCartItem[]): Promise<string> {
    return this.checkoutTool.checkout(cart);
  }
}
