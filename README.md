# Vyakti

Vyakti (व्यक्ति) is a voice-first commerce agent for Indian quick commerce. It turns natural language into action across the app stack, with a focus on fast intent parsing, routed search, and a Swiggy MCP client architecture.

## What’s in this repo

This repository currently contains two app surfaces:

- `vyakti-app` - the main Next.js application
- `vyakti-ai-frontend` - a separate frontend workspace for the AI experience

The main implementation work today lives in `vyakti-app`.

## Highlights

- Voice input and intent parsing for shopping requests
- Marketplace routing across Blinkit, Zepto, and Swiggy
- A dedicated Swiggy MCP client layer with private auth, transport, and tool internals
- Mock catalog and scraper-backed search flows for local development
- Next.js App Router architecture with TypeScript throughout

## Swiggy MCP Architecture

The Swiggy layer is organized so that `client.ts` is the only public entry point.

Dependency direction:

`SwiggyClient` → `Tools` → `Transport` → `Auth`

Internal folders remain implementation details:

- `lib/swiggy/auth`
- `lib/swiggy/transport`
- `lib/swiggy/tools`

## Project Layout

```text
vyakti-ai/
├── README.md
├── vyakti-app/
│   ├── app/
│   ├── components/
│   ├── lib/
│   │   ├── marketplace/
│   │   ├── mock/
│   │   ├── scraper/
│   │   ├── stt/
│   │   └── swiggy/
│   └── package.json
└── vyakti-ai-frontend/
    └── src/
```

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm, pnpm, or bun

### Run the main app

```bash
cd vyakti-app
npm install
npm run dev
```

### Build for production

```bash
cd vyakti-app
npm run build
```

## Environment Variables

The app uses environment variables for connected services such as auth, voice, and scraping providers. Refer to `vyakti-app/.env.local` or the app documentation for the exact keys required in your setup.

## Development Notes

- The repository is TypeScript-first.
- The Swiggy client layer was designed to avoid direct imports from marketplace, mock, or scraper modules.
- `vyakti-app` currently builds successfully with TypeScript checks passing.

## License

See the repository for license details if present.
