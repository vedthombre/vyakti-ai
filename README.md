<div align="center">

# *VYAKTI*
### व्यक्ति — The Manifestation of Intent

**An ultra-low-latency, voice-first agentic commerce engine for the ONDC network.**

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Groq](https://img.shields.io/badge/Groq-Whisper%20%2B%20LLaMA_3.3-f55036?style=for-the-badge)](https://groq.com/)
[![LangChain](https://img.shields.io/badge/LangChain-LangGraph-1c7c54?style=for-the-badge)](https://www.langchain.com/)
[![ONDC](https://img.shields.io/badge/ONDC-Open%20Network-ff6b00?style=for-the-badge)](https://ondc.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

[Live Demo](#) · [Report Bug](https://github.com/vedthombre/vyakti-ai/issues) · [Request Feature](https://github.com/vedthombre/vyakti-ai/issues)

</div>

---

## What is Vyakti?

Vyakti (व्यक्ति) is Sanskrit for **"a person" or "the manifestation of something"**. In this context, it is the manifestation of *intent* — the idea that a user's spoken word should be enough to complete a commercial transaction.

> "Just say what you want. Vyakti figures out the rest."

Vyakti is a **voice-first, agentic commerce MVP** that lets users speak a purchase command in natural language, then autonomously:

1. **Transcribes** the audio using Groq's Whisper Large V3 (sub-200ms latency)
2. **Parses the intent** using a LLaMA 3.3-70B agent via LangChain's structured output
3. **Routes the order** — either to the open ONDC network (cheapest seller) or directly to a named app (Zepto, Blinkit, etc.)
4. **Surfaces the result** with a Chain-of-Thought reasoning display and a one-tap Checkout

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎙 **Hold-to-Talk** | Push-to-speak button with live pulse animation, hardware lock released on stop |
| ⚡ **Groq STT** | Whisper Large V3 via Groq's inference API — fastest available transcription |
| 🧠 **Agentic Intent Parser** | LLaMA 3.3-70B with Zod-validated structured output — no hallucinated fields |
| 🔀 **Smart Routing** | `ONDC_SEARCH` for open-network best price, `DIRECT_APP` for named platforms |
| 💭 **Chain-of-Thought UI** | Reasoning steps appear one-by-one (800ms drip) — inspired by Comet browser's transparency |
| 🛒 **Result Surface** | Sellers ranked cheapest-first with ETA, rating, price and "Best Price" badge |
| 💳 **Checkout Flow** | One-tap order confirmation (wired to Razorpay in production) |
| 🎨 **Agentic UI** | Deep black + neon blue glassmorphism, animated grid, italic hero type |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Browser (Client)                      │
│                                                             │
│   MediaRecorder API  ──►  FormData Blob  ──►  /api/voice   │
│                                                             │
│   /api/voice response (text)  ──►  /api/intent             │
│                                                             │
│   intent.steps[] ──► CoT drip UI (800ms/step)              │
│   intent.routing ──► ONDC seller cards / Direct App card   │
└─────────────────────────────────────────────────────────────┘
          │                              │
          ▼                              ▼
  ┌───────────────┐             ┌─────────────────┐
  │  /api/voice   │             │  /api/intent    │
  │  (Edge Route) │             │  (Node Route)   │
  │               │             │                 │
  │  Groq Whisper │             │  ChatGroq       │
  │  Large V3     │             │  LLaMA 3.3-70B  │
  │  STT Engine   │             │  + Zod Schema   │
  └───────────────┘             └─────────────────┘
                                        │
                                        ▼
                               ┌─────────────────┐
                               │  Routing Logic  │
                               │                 │
                               │  ONDC_SEARCH ──►│──► ondcMock.ts
                               │  DIRECT_APP  ──►│──► Store brand
                               │  UNKNOWN     ──►│──► Clarification
                               └─────────────────┘
```

### State Machine

```
IDLE ──[Hold]──► RECORDING ──[Release]──► TRANSCRIBING
                                               │
                                    /api/voice responds
                                               │
                                               ▼
                                          THINKING
                                    (CoT steps drip UI)
                                               │
                                    All steps revealed
                                               │
                                               ▼
                                        READY_TO_PAY
                                    (Checkout / New Order)
                                               │
                                          ERROR (any)
```

---

## 🗂️ Project Structure

```
vyakti-app/
├── app/
│   ├── api/
│   │   ├── voice/
│   │   │   └── route.ts        # Edge route: Audio → Groq Whisper STT
│   │   └── intent/
│   │       └── route.ts        # Node route: Text → LLaMA 3.3 intent parser
│   ├── globals.css             # Design tokens + custom keyframe animations
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Main MVP Dashboard (client component)
│
├── lib/
│   ├── agent/
│   │   └── intentParser.ts     # (LangGraph agent — planned)
│   ├── mock/
│   │   └── ondcMock.ts         # Simulated ONDC seller catalogue
│   └── schemas/
│       └── intent.ts           # Zod schema for OrderIntent type
│
├── .env.local                  # API keys (never commit — see .gitignore)
├── next.config.ts
├── package.json
└── tsconfig.json
```

---

## 🔌 API Reference

### `POST /api/voice`
Transcribes audio to text using Groq Whisper.

**Runtime:** Edge (V8 Isolate, zero cold start)

**Request:**
```
Content-Type: multipart/form-data
Body: audio (File) — max 5MB, must be audio/* MIME type
```

**Response:**
```json
{
  "success": true,
  "text": "Order 2 litres of Amul milk from Zepto"
}
```

---

### `POST /api/intent`
Parses a plain-text command into a structured purchase intent using LLaMA 3.3-70B.

**Request:**
```json
{ "text": "Order 2 litres of Amul milk from Zepto" }
```

**Response:**
```json
{
  "success": true,
  "intent": {
    "routing": "DIRECT_APP",
    "item_name": "milk",
    "brand_preference": "Amul",
    "store_brand": "Zepto",
    "quantity": 2,
    "category": "dairy",
    "clarification_needed": null,
    "steps": [
      "Parsing speech for product entity...",
      "Detected quantity modifier: 2 litres...",
      "Identified brand preference: Amul...",
      "Routing directly to Zepto app..."
    ]
  }
}
```

**Routing values:**

| Value | Meaning |
|---|---|
| `ONDC_SEARCH` | No platform named; search open ONDC network for cheapest seller |
| `DIRECT_APP` | User named a platform (Zepto, Blinkit, Swiggy, Dunzo, BigBasket) |
| `UNKNOWN` | Insufficient info; `clarification_needed` will contain a follow-up question |

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18
- A [Groq API key](https://console.groq.com/) (free tier available)

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

Copy the example and fill in your keys:

```bash
cp .env.example .env.local
```

```env
# ── Required ─────────────────────────────────────────────
GROQ_API_KEY=gsk_your_groq_key_here

# ── Optional (for full production stack) ─────────────────
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key   # Never expose to client

RAZORPAY_KEY_ID=rzp_test_xxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret

ONDC_GATEWAY_URL=https://staging.gateway.ondc.org/
ONDC_BAP_ID=vyakti-bap.vercel.app
ONDC_BAP_URI=https://vyakti-bap.vercel.app/api/webhooks/ondc

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> ⚠️ **Never commit `.env.local` to Git.** It is already listed in `.gitignore`.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing the Voice Pipeline

Once the dev server is running:

1. Click **Hold to Talk** and speak clearly, e.g.:
   - *"Order one loaf of Britannia bread"* → triggers `ONDC_SEARCH`
   - *"Get me milk from Zepto"* → triggers `DIRECT_APP` (Zepto)
   - *"I want 3 Amul butter packets from Blinkit"* → triggers `DIRECT_APP` (Blinkit)

2. Release the button — transcription begins immediately.

3. Watch the **Chain-of-Thought** steps appear one by one.

4. See the seller cards ranked cheapest-first.

5. Hit **Checkout →** to confirm the (mock) order.

> 💡 The voice pipeline requires microphone access. Allow it when the browser prompts.

---

## 🛣️ Roadmap

### MVP (Current — v0.1)
- [x] Hold-to-Talk voice recording
- [x] Groq Whisper STT pipeline
- [x] LLaMA 3.3-70B intent parser with structured output
- [x] ONDC routing logic (`ONDC_SEARCH` / `DIRECT_APP`)
- [x] Chain-of-Thought UI with step drip animation
- [x] ONDC mock seller catalogue (Zepto, Blinkit, Swiggy, Dunzo)
- [x] Result surface with seller ranking + Checkout CTA

### Phase 2
- [ ] Live ONDC Sandbox integration (real seller catalogue)
- [ ] Razorpay payment gateway for actual checkout
- [ ] Supabase order history + user sessions
- [ ] Multi-turn conversational memory (LangGraph stateful agent)
- [ ] Hindi language support via Whisper multilingual mode
- [ ] Mobile PWA packaging

### Phase 3
- [ ] ONDC BAP (Buyer App) certification
- [ ] Real-time order tracking via ONDC `/on_status`
- [ ] LangGraph ReAct agent replacing single-shot parser
- [ ] Personalization via purchase history embeddings (pgvector)
- [ ] iOS / Android native wrapper

---

## 🔧 Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 16 (App Router) | Full-stack React with edge/serverless routes |
| **Language** | TypeScript 5 | End-to-end type safety |
| **Styling** | Tailwind CSS v4 + Vanilla CSS | Design tokens, custom keyframe animations |
| **STT** | Groq Whisper Large V3 | Ultra-fast speech-to-text (Edge runtime) |
| **LLM** | Groq LLaMA 3.3-70B Versatile | Intent parsing + Chain-of-Thought generation |
| **AI SDK** | LangChain + LangGraph | Structured output, agent orchestration |
| **Schema** | Zod | Runtime validation of LLM responses |
| **Database** | Supabase (PostgreSQL) | Order history, user memory *(planned)* |
| **Payments** | Razorpay | INR checkout *(planned)* |
| **Commerce** | ONDC Sandbox | Open buyer-seller network *(planned)* |
| **Deployment** | Vercel | Edge functions + CDN |

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feat/your-feature`
5. Open a Pull Request

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
  <sub>Built with ❤️ for the future of commerce in India</sub>
</div>
