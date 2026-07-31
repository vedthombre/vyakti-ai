/**
 * lib/swiggy/types.ts
 *
 * Domain and protocol types for the Swiggy SDK.
 * 
 * IMPORTANT: This file must NOT import any types from the Marketplace layer
 * (e.g. lib/marketplace/types.ts or lib/mock/catalog.ts).
 */

// ── Auth Types ────────────────────────────────────────────────────────────────

export interface OAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number; // Unix timestamp (ms)
}

// ── MCP Protocol Types (JSON-RPC 2.0) ─────────────────────────────────────────

export interface McpRequest<T = Record<string, unknown>> {
  jsonrpc: "2.0";
  id: string | number;
  method: string;
  params?: T;
}

export interface McpResponse<T = unknown> {
  jsonrpc: "2.0";
  id: string | number;
  result?: T;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

// ── Domain Types ──────────────────────────────────────────────────────────────

export interface SwiggyProduct {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  inStock: boolean;
  estimatedDeliveryTime?: string;
  storeId?: string;
}

export interface SwiggyCartItem {
  productId: string;
  quantity: number;
}
