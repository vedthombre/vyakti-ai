/**
 * lib/swiggy/transport/rpc.ts
 *
 * Generic MCP RPC facade over the SDK-backed transport.
 * No tool-specific parsing or protocol interpretation lives here.
 */

import { HttpTransport } from "./http";

export type McpListToolsResult = import("./http").McpListToolsResult;
export type McpToolCallResult = import("./http").McpToolCallResult;

export class RpcClient {
  private readonly transport: HttpTransport;

  constructor(transport: HttpTransport) {
    this.transport = transport;
  }

  /**
   * Connects the underlying MCP transport.
   */
  async connect(): Promise<void> {
    await this.transport.connect();
  }

  /**
   * Disconnects from the MCP server.
   */
  async disconnect(): Promise<void> {
    await this.transport.disconnect();
  }

  /**
   * Lists the tools exposed by the remote MCP server.
   */
  async listTools(): Promise<McpListToolsResult> {
    return await this.transport.listTools();
  }

  /**
   * Calls any MCP tool and returns the raw SDK response unchanged.
   */
  async callTool(name: string, argumentsObject: Record<string, unknown> = {}): Promise<McpToolCallResult> {
    return await this.transport.callTool(name, argumentsObject);
  }

  /**
   * Backwards-compatible generic call wrapper.
   * The returned value is the raw MCP response cast to the requested type.
   */
  async call<TResult, TParams = Record<string, unknown>>(method: string, params?: TParams): Promise<TResult> {
    return (await this.callTool(method, (params ?? {}) as Record<string, unknown>)) as TResult;
  }
}
