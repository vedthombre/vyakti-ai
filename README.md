<div align="center">

# *VYAKTI*
### व्यक्ति — Agentic Commerce Comparison Engine

**A modular commerce assistant that compares three platforms and recommends the best one, with Swiggy MCP included as one integrated source.**

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![MCP SDK](https://img.shields.io/badge/MCP%20SDK-%40modelcontextprotocol%2Fsdk-2f855a?style=for-the-badge)](https://www.npmjs.com/package/@modelcontextprotocol/sdk)
[![OAuth 2.1](https://img.shields.io/badge/OAuth-2.1%20%2B%20PKCE-2b6cb0?style=for-the-badge)](https://www.oauth.com/oauth2-servers/authorization/the-authorization-request/)
[![Swiggy MCP](https://img.shields.io/badge/Swiggy-MCP%20Integration-ff6f00?style=for-the-badge)](https://mcp.swiggy.com/builders/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

[Live Demo](#) · [Report Bug](https://github.com/vedthombre/vyakti-ai/issues) · [Request Feature](https://github.com/vedthombre/vyakti-ai/issues)

</div>

---

## What is Vyakti?

Vyakti (व्यक्ति) is Sanskrit for **"a person" or "the manifestation of something"**. In this repo, it represents an agentic commerce engine that compares three different platforms and recommends the best one for the user.

> "Compare clearly, choose smartly, and only then execute."

Vyakti is a **platform-comparison layer** that lets the app:

1. Compare products, prices, and availability across three commerce platforms.
2. Use the best available connector for each platform, including Swiggy MCP where supported.
3. Rank the options using business rules and the user’s intent.
4. Preserve a modular architecture so each platform integration stays isolated.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🏆 **Best-Platform Ranking** | Compares three platforms and selects the strongest match for the user |
| 🔀 **Multi-Source Aggregation** | Pulls data from multiple commerce connectors instead of one locked-in provider |
| 🧩 **Official MCP SDK** | Uses `@modelcontextprotocol/sdk` for the Swiggy MCP integration path |
| 🔐 **OAuth Layer** | PKCE-based auth with persistent verifier and token storage abstraction |
| 🔄 **Generic Transport** | Transport stays tool-agnostic and returns raw MCP responses unchanged |
| 🧰 **Tool Discovery** | `listTools()` is available for server introspection without custom protocol code |
| 📍 **Swiggy Proof Point** | `getAddresses()` proves authenticated MCP tool execution end to end |
| 🧪 **Testable Boundaries** | Auth, transport, tools, and comparison logic stay modular and replaceable |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Vyakti Comparison Layer                 │
│                                                             │
│   Compare intent across three platforms                     │
│   Rank the best option                                       │
│   Orchestrate platform-specific tool calls                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
          │                              │
          ▼                              ▼
  ┌───────────────┐             ┌────────────────────┐
  │ Comparison     │             │   SDK Transport    │
  │               │             │                    │
  │  Rankers      │             │  Streamable HTTP   │
  │  Platform A   │             │  connect/disconnect│
  │  Platform B   │             │  listTools/callTool│
  │  Swiggy MCP   │             │  raw MCP responses │
  └───────────────┘             └────────────────────┘
                                        │
                                        ▼
                               ┌────────────────────┐
                               │     OAuth Layer    │
                               │                    │
                               │  PKCE verifier     │
                               │  access token      │
                               │  storage abstraction│
                               └────────────────────┘
```

### State Machine

```
UNAUTHENTICATED ──[getAuthorizationUrl]──► AUTH_URL_READY
        │                                     │
        │                                     └──[handleCallbackCode]
        ▼
   TOKEN_STORED ──[connect]──► CONNECTED ──[callTool/listTools]──► TOOL_RESULT
        │                                     │
        └──────────────[401 / expired token]──┘
                                              │
                                              ▼
                                         REAUTH_REQUIRED
```

---

## 🗂️ Project Structure

```
vyakti-app/
├── app/
│   ├── api/
│   │   └── auth/               # OAuth callback surface
│   ├── globals.css             # Existing app styling
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Existing app shell
│
├── lib/
│   ├── comparison/            # Platform comparison and ranking logic
│   ├── swiggy/
│   │   ├── auth/
│   │   │   ├── pkce.ts         # PKCE generation
│   │   │   ├── storage.ts      # Token + verifier storage abstraction
│   │   │   └── oauth.ts       # OAuth lifecycle and token refresh
│   │   ├── transport/
│   │   │   ├── http.ts         # MCP SDK-backed transport session
│   │   │   └── rpc.ts          # Generic MCP facade
│   │   ├── tools/
│   │   │   ├── addresses.ts    # First MCP proof-of-life tool
│   │   │   ├── search.ts       # Planned tool wrapper
│   │   │   ├── cart.ts         # Planned tool wrapper
│   │   │   └── checkout.ts     # Planned tool wrapper
│   │   ├── client.ts           # Public Swiggy SDK entry point
│   │   └── types.ts            # Shared Swiggy domain types
│   ├── marketplace/            # Preserved marketplace layer
│   └── mock/                   # Existing non-MCP support code
│
├── .env.local                  # API keys and auth settings (never commit)
├── next.config.ts
├── package.json
└── tsconfig.json
```

---

## 🔌 API Reference

### `SwiggyClient.getAuthorizationUrl()`
Generates the OAuth authorization URL for the Swiggy MCP flow.

**Purpose:** Start PKCE-based auth.

**Request:**
```
No arguments.
```

**Response:**
```json
"https://mcp.swiggy.com/auth/authorize?..."
```

---

### `SwiggyClient.handleCallbackCode(code)`
Exchanges the authorization code for access token storage.

**Request:**
```json
{ "code": "authorization_code_from_callback" }
```

**Response:**
```json
void
```

---

### `SwiggyClient.getAddresses()`
Calls the first verified Swiggy MCP tool, `get_addresses`, and returns the raw SDK response.

**Request:**
```json
{}
```

**Response:**
```json
{
  "content": [],
  "structuredContent": {},
  "isError": false
}
```

---

### `SwiggyClient.searchProducts(query)`
Planned wrapper for search across the three-platform comparison layer.

**Status:** Not yet wired to a real MCP tool.

---

### `SwiggyClient.addToCart(item)`
Planned wrapper for platform-specific cart actions after a winner is chosen.

**Status:** Not yet wired to a real MCP tool.

---

### `SwiggyClient.checkout(cart)`
Planned wrapper for the final purchase path after comparison.

**Status:** Not yet wired to a real MCP tool.

---

### `listTools()`
Returns the remote MCP tool catalog without interpreting it.

**Status:** Available through the transport layer.

---

### `callTool(name, arguments)`
Calls any MCP tool generically and returns the raw MCP result.

**Status:** Available through the transport layer.

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18
- A Swiggy MCP-compatible OAuth flow
- Access to the official `@modelcontextprotocol/sdk`

### 1. Clone the repo

```bash
git clone https://github.com/vedthombre/vyakti-ai.git
cd vyakti-ai/vyakti-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the example and fill in your auth values:

```bash
cp .env.example .env.local
```

```env
# ── Required for Swiggy MCP ─────────────────────────────
SWIGGY_MCP_URL=https://mcp.swiggy.com/im
SWIGGY_AUTHORIZATION_URL=https://mcp.swiggy.com/auth/authorize
SWIGGY_TOKEN_URL=https://mcp.swiggy.com/auth/token
SWIGGY_REDIRECT_URI=http://localhost:3000/api/auth/swiggy/callback

# ── Optional app configuration ───────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> ⚠️ **Never commit `.env.local` to Git.** It is already listed in `.gitignore`.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing the MCP Flow

Once the app is running:

1. Use the comparison layer to evaluate three candidate platforms for the same user request.
2. Call the Swiggy MCP auth flow when Swiggy is one of the platforms being compared.
3. Call `await swiggyClient.getAddresses()` to verify the Swiggy MCP integration path.
4. Use `await swiggyClient.listTools()` if you need to inspect the remote Swiggy tool catalog.
5. Keep platform-specific parsing and ranking logic outside the transport layer.

> 💡 This milestone validates the MCP SDK, the OAuth integration, and the transport lifecycle without coupling the transport to any specific tool schema.

---

## 🛣️ Roadmap

### MVP (Current — v0.1)
- [x] Three-platform comparison focus
- [x] Swiggy MCP integrated as one source
- [x] OAuth 2.1 + PKCE auth layer
- [x] Official MCP SDK integration
- [x] Streamable HTTP connection lifecycle
- [x] Generic raw `callTool(name, arguments)` transport
- [x] First working MCP tool: `get_addresses`
- [x] Public `SwiggyClient` API preserved

### Phase 2
- [ ] Add the other two platform connectors
- [ ] `search_products` MCP wrapper
- [ ] Cart and checkout wrappers where applicable
- [ ] Tool result shaping in the tool layer
- [ ] Better session persistence for auth state
- [ ] Remote tool discovery caching

### Phase 3
- [ ] Provider-level integration
- [ ] Marketplace consumption of multi-platform comparison results
- [ ] UI surfaces for ranked platform recommendations
- [ ] Optional voice or intent entry points if still needed

---

## 🔧 Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 16 (App Router) | Existing app shell and server/client surfaces |
| **Language** | TypeScript 5 | End-to-end type safety |
| **MCP Client** | `@modelcontextprotocol/sdk` | Official MCP connection and Swiggy tool execution |
| **Auth** | OAuth 2.1 + PKCE | Swiggy authentication and token lifecycle |
| **Transport** | Streamable HTTP | Remote MCP session transport |
| **Schema** | Zod | SDK peer dependency and runtime validation support |
| **Architecture** | Modular comparison client | Keeps auth, transport, tools, and consumers separate |

---

## 🤝 Contributing

Contributions are welcome. For this codebase, keep changes aligned with the MCP-first architecture:

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Keep transport generic and tool-agnostic
4. Keep Swiggy MCP as one platform integration, not the whole product
5. Add tool-specific parsing only in the relevant tool wrapper
6. Open a pull request

Please follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

---

## 📄 License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for more information.

---

## 👤 Author

**Ved Thombre**
- GitHub: [@vedthombre](https://github.com/vedthombre)
- Project: [vyakti-ai](https://github.com/vedthombre/vyakti-ai)

---

<div align="center">
  <sub>Built for platform comparison, with Swiggy MCP included as one integration</sub>
</div>
