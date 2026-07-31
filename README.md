```md
# Vyakti

Vyakti (व्यक्ति) is a voice-first commerce assistant for Indian quick commerce. It turns spoken intent into actionable shopping flows across search, routing, and checkout, with a modular architecture spanning voice, intent parsing, marketplace aggregation, and Swiggy MCP integration.

## What this project does

Vyakti is designed to reduce the friction of shopping across quick-commerce apps by letting users:

- speak a request naturally
- transcribe speech to text
- extract structured intent
- route the request to the right commerce source
- compare or surface products
- move toward checkout with minimal interaction

The project combines a modern Next.js app with supporting commerce and marketplace modules, plus a separate frontend workspace for the AI experience.

## Repository Layout

This repo currently contains two main app surfaces:

- `vyakti-app` - the main Next.js application
- `vyakti-ai-frontend` - a separate frontend workspace for the AI experience

The main product implementation lives in `vyakti-app`.

## Key Features

- Voice input and transcription pipeline
- Intent parsing for shopping commands
- Marketplace routing across Blinkit, Zepto, and Swiggy
- Aggregated product search and ranking
- Swiggy MCP client architecture with a single public entry point
- Mock catalog and scraper-backed data for development
- Modular TypeScript codebase
- Next.js App Router based UI and API surface

## Architecture Overview

Vyakti is organized around a layered flow:

1. Voice is captured and transcribed.
2. Text is converted into structured intent.
3. The intent is routed to the appropriate commerce path.
4. Marketplace results are aggregated or fetched.
5. The user can review and continue to checkout.

### Main Modules

- `app/` - Next.js routes, pages, and API endpoints
- `components/` - shared UI components
- `lib/agent/` - intent parsing logic
- `lib/marketplace/` - marketplace abstraction and provider implementations
- `lib/mock/` - local mock catalog and offline development data
- `lib/scraper/` - search and catalog scraping helpers
- `lib/stt/` - speech-to-text provider integration
- `lib/swiggy/` - Swiggy MCP client architecture

## Swiggy Integration

The Swiggy integration is implemented as a private client layer with this dependency direction:

`SwiggyClient` → `Tools` → `Transport` → `Auth`

Only `lib/swiggy/client.ts` is meant to be imported by the rest of the app. The internal folders remain implementation details.

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm, pnpm, or bun

### Install dependencies

```bash
cd vyakti-app
npm install
```

### Run the main app

```bash
cd vyakti-app
npm run dev
```

### Build for production

```bash
cd vyakti-app
npm run build
```

## Environment Variables

The app uses environment variables for voice, auth, scraping, and commerce integrations. Exact values depend on your deployment, but the project typically expects configuration for:

```env
GROQ_API_KEY=
SARVAM_API_KEY=
FIRECRAWL_API_KEY=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

If you are working on the full production stack, also configure any Swiggy, ONDC, or payment-related credentials used by your deployment.

## Project Structure

```text
vyakti-ai/
├── README.md
├── vyakti-app/
│   ├── app/
│   │   ├── api/
│   │   ├── auth/
│   │   └── preferences/
│   ├── components/
│   ├── lib/
│   │   ├── agent/
│   │   ├── auth/
│   │   ├── marketplace/
│   │   ├── mock/
│   │   ├── scraper/
│   │   ├── stt/
│   │   └── swiggy/
│   ├── public/
│   └── scripts/
└── vyakti-ai-frontend/
    └── src/
```

## Development Notes

- The repository is TypeScript-first.
- The main app is built with Next.js App Router.
- Marketplace behavior is abstracted so provider logic stays isolated.
- Swiggy MCP is intentionally encapsulated behind a single public client.
- The project supports both live integrations and development-time mock data.

## Scripts

Inside `vyakti-app`:

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Status

The codebase is actively evolving and includes both production-oriented modules and development stubs where needed for local iteration.

