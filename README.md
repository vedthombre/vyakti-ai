# 🛍️ VYAKTI — व्यक्ति
### *The Manifestation of Intent*

> **Tell Vyakti what you want. It understands you, finds what you need, explains its choice, and helps you pay.**

**An agentic commerce AI that turns your intent into action — from voice to payment.**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Groq](https://img.shields.io/badge/Groq-Whisper%20%2B%20LLM-orange)](https://groq.com/)
[![LangChain](https://img.shields.io/badge/LangChain-LLM-green)](https://www.langchain.com/)
[![Razorpay](https://img.shields.io/badge/Razorpay-Payments-blue)](https://razorpay.com/)
[![MCP](https://img.shields.io/badge/MCP-SDK-purple)](https://modelcontextprotocol.io/)

---

## 💡 What is Vyakti?

Imagine saying:

> **“Get me 2 litres of Amul milk.”**

Normally, you would open a shopping app, type the product, look through the results, choose one, and then pay.

**Vyakti tries to make all of that much simpler.**

You simply **tell Vyakti what you want**.

Vyakti:

1. 🎙️ **Listens** to your voice.
2. 📝 **Understands** what you are asking for.
3. 🧠 **Turns your words into a structured shopping request.**
4. 🛒 **Looks at the available products and chooses a suitable option.**
5. 💡 **Explains why that product was selected.**
6. ✅ **Asks you for approval.**
7. 💳 **Creates a Razorpay payment and verifies it.**

So instead of:

**Search → Browse → Compare → Choose → Pay**

Vyakti aims for:

**Tell → Understand → Decide → Approve → Pay**

> **The idea is simple: you tell the computer what you want, instead of telling it how to find it.**

---

# 🎙️ How Vyakti Works

The entire experience can be understood in one simple flow:

```text
             🎙️ YOU SPEAK
                  │
                  ▼
       📝 GROQ WHISPER
          Voice → Text
                  │
                  ▼
          🧠 AI UNDERSTANDS
       Groq LLM + LangChain
                  │
                  ▼
          🛒 VYAKTI DECIDES
       Deterministic Rules Engine
                  │
                  ▼
          💡 AI BUYER'S PICK
        Product + Explanation
                  │
                  ▼
          ✅ YOU APPROVE
                  │
                  ▼
            💳 PAY
             Razorpay
                  │
                  ▼
             🎉 PAID
```

### In kid-friendly words:

**You:** “I want 2L Amul milk.”

**Vyakti:** “Got it! I found this one. Here's why I picked it.”

**You:** “Yes, buy it.”

**Vyakti:** “Okay! Let's pay.”

That's the idea behind **agentic commerce**.

---

# 🧠 What Makes Vyakti Different?

Vyakti isn't simply a chatbot that talks about products.

It is designed as an **agentic system** — meaning it can take a user's request, understand what needs to happen, make a decision, and move the task forward.

The important part is that **AI does not control everything**.

The LLM is responsible for understanding the user's words.

The actual product selection is handled by a **deterministic rules engine**.

That means the system doesn't randomly ask an AI model:

> “Which product do you like?”

Instead, it follows explicit rules such as:

```text
Brand Match
     ↓
Is it in stock?
     ↓
Does the unit/quantity match?
     ↓
Compare price
     ↓
Select product
```

This makes the decision:

- 🔍 Understandable
- 🔁 Reproducible
- 🧪 Testable
- 📋 Auditable
- ⚡ Deterministic

**The AI understands.  
The rules decide.  
The user approves.**

---

# 🚦 Application State Machine

Vyakti is built around a state machine.

In simple words:

> **The app always knows what it is doing and what should happen next.**

| State | What happens |
|---|---|
| `IDLE` | 🎙️ Vyakti is ready to listen |
| `RECORDING` | 🎤 You are speaking |
| `TRANSCRIBING` | 📝 Whisper is turning speech into text |
| `THINKING` | 🧠 The LLM is understanding your request |
| `CLARIFY_BRAND` | ❓ Vyakti needs to know which brand you mean |
| `CLARIFY_VARIANT` | ❓ Vyakti needs to know which product variant you mean |
| `DECIDING` | 🛒 The rules engine is selecting a product |
| `AWAITING_APPROVAL` | ✅ Vyakti shows its recommendation and waits for you |
| `PAYING` | 💳 Razorpay payment is open |
| `PAID` | 🎉 Payment succeeded |
| `PAYMENT_FAILED` | ⚠️ Payment failed and you can retry |
| `ERROR` | ❌ Something went wrong and you can start again |

This state-based design keeps the shopping flow predictable and prevents the application from jumping between unrelated actions.

---

# 🏗️ Architecture

```text
┌──────────────────────┐
│     🎙️ Voice Input   │
└──────────┬───────────┘
           │
           ▼
┌────────────────────────────┐
│ /api/voice                 │
│ Groq Whisper               │
│ Speech → Text               │
└──────────┬─────────────────┘
           │
           ▼
┌────────────────────────────┐
│ /api/intent               │
│ LangChain + Groq LLM       │
│ Text → Structured Intent   │
└──────────┬─────────────────┘
           │
           ▼
┌────────────────────────────┐
│ aggregator.ts              │
│ Deterministic Rules Engine │
│ Intent → Product Decision  │
└──────────┬─────────────────┘
           │
           ▼
┌────────────────────────────┐
│ DecisionExplainer           │
│ AI Buyer's Pick             │
│ + Decision Explanation      │
└──────────┬─────────────────┘
           │
           ▼
┌────────────────────────────┐
│ PaymentGate                 │
│ Approve / Decline            │
└──────────┬─────────────────┘
           │
           ▼
┌────────────────────────────┐
│ /api/payment/create-order  │
│ Razorpay Order Creation    │
└──────────┬─────────────────┘
           │
           ▼
┌────────────────────────────┐
│ /api/payment/verify        │
│ HMAC Signature Verification│
└──────────┬─────────────────┘
           │
           ▼
       🎉 PAYMENT
```

---

# 📁 Project Structure

```text
vyakti-app/
│
├── app/
│   ├── api/
│   │   ├── intent/
│   │   │   └── route.ts
│   │   │       # LangChain + Groq → structured Intent
│   │   │
│   │   ├── voice/
│   │   │   └── route.ts
│   │   │       # Groq Whisper → transcript
│   │   │
│   │   ├── payment/
│   │   │   ├── create-order/
│   │   │   │   # Razorpay order creation
│   │   │   │
│   │   │   └── verify/
│   │   │       # Razorpay HMAC signature verification
│   │   │
│   │   └── auth/
│   │       └── swiggy/
│   │           # OAuth 2.1 + PKCE
│   │           # Swiggy MCP authentication
│   │
│   └── page.tsx
│       # State-machine orchestrator
│
├── components/
│   ├── HoldToTalkButton.tsx
│   │   # Voice recording
│   │
│   ├── ChainOfThought.tsx
│   │   # Animated decision explanation
│   │
│   ├── MarketplaceSurface.tsx
│   │   # Brand / variant clarification
│   │
│   ├── DecisionExplainer.tsx
│   │   # AI Buyer's Pick + alternatives
│   │
│   ├── PaymentGate.tsx
│   │   # Approve & Pay / Decline
│   │
│   ├── PaymentStatus.tsx
│   │   # Payment success / failure
│   │
│   └── TextInputField.tsx
│       # Text fallback for voice
│
├── lib/
│   ├── agent/
│   │   └── intentParser.ts
│   │       # Speech/text → Intent pipeline
│   │
│   ├── marketplace/
│   │   └── aggregator.ts
│   │       # Deterministic decision engine
│   │
│   ├── mock/
│   │   └── catalog.ts
│   │       # Product catalog
│   │
│   ├── schemas/
│   │   ├── intent.ts
│   │   │   # Zod Intent schema
│   │   └── decision.ts
│   │       # Zod Decision schema
│   │
│   ├── swiggy/
│   │   # Swiggy MCP integration
│   │
│   └── types/
│       └── appState.ts
│           # Application state definitions
│
└── ...
```

---

# 🛠️ Tech Stack

| Layer | Technology | What it does |
|---|---|---|
| **Framework** | Next.js 15 | Builds the web application |
| **Language** | TypeScript 5 | Keeps the application type-safe |
| **Speech-to-Text** | Groq Whisper | Turns your voice into text |
| **LLM** | Groq + LangChain | Understands the shopping request |
| **Decision Engine** | Rules-based | Selects a product deterministically |
| **Validation** | Zod | Makes sure data has the expected shape |
| **Payments** | Razorpay | Creates and verifies payments |
| **MCP** | Model Context Protocol SDK | Connects Vyakti with external tools |
| **Authentication** | OAuth 2.1 + PKCE | Secure authorization for integrations |
| **Integration** | Swiggy MCP | Provides an external commerce integration |

---

# 🧩 Key Design Decisions

## 1. The LLM does not choose the product

This is one of the most important decisions in Vyakti.

The LLM's job is:

> **“What does the user want?”**

The rules engine's job is:

> **“Which available product satisfies that request?”**

This separation makes the system easier to understand, test, and audit.

---

## 2. Payment never happens automatically

Vyakti does **not** silently purchase something.

The user always gets an approval step:

```text
AI Recommendation
       ↓
User Reviews
       ↓
   APPROVE?
    ↙    ↘
  YES     NO
   ↓       ↓
 PAYMENT   STOP
```

The final decision belongs to the user.

---

## 3. Payment retry does not change the product

If a payment fails, Vyakti does not start the entire decision process again.

Instead:

```text
Same Decision
      ↓
Retry Payment
```

This prevents the system from unexpectedly changing the product during a payment retry.

---

## 4. Swiggy MCP is an integration, not the entire product

Vyakti contains an OAuth 2.1 + MCP integration for Swiggy tools.

However, the core shopping flow currently operates using a **local product catalog**.

This separation allows the agentic shopping experience to be developed independently from external marketplace availability.

---

## 5. Voice is the primary interface, text is the fallback

The preferred experience is:

> 🎙️ **Speak naturally.**

But if microphone access is unavailable, users can type their request instead.

Text input skips speech recognition and goes directly to intent parsing.

---

# 🔐 Environment Variables

Create a `.env.local` file:

```env
# ── Groq (STT + LLM) ──────────────────────────────────────────
GROQ_API_KEY=

# ── Razorpay ──────────────────────────────────────────────────
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
NEXT_PUBLIC_RAZORPAY_KEY_ID=

# ── Swiggy MCP (Optional) ─────────────────────────────────────
SWIGGY_MCP_URL=https://mcp.swiggy.com/im
SWIGGY_AUTHORIZATION_URL=https://mcp.swiggy.com/auth/authorize
SWIGGY_TOKEN_URL=https://mcp.swiggy.com/auth/token
SWIGGY_REDIRECT_URI=http://localhost:3000/api/auth/swiggy/callback

# ── Application ────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

# 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd vyakti-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Add environment variables

Create:

```text
.env.local
```

and add the required keys.

### 4. Start the development server

```bash
npm run dev
```

### 5. Open Vyakti

Visit:

```text
http://localhost:3000
```

Then press the microphone button and **tell Vyakti what you want.**

---

# 🎯 The Bigger Idea

Traditional e-commerce makes people learn how to use the application.

You need to:

**Search → Filter → Browse → Compare → Select → Checkout**

Vyakti explores a different interaction model:

**Intent → Understanding → Decision → Approval → Payment**

The long-term idea is simple:

> **People should be able to tell computers what they want, instead of learning how to operate every application.**

Vyakti is an experiment toward that future.

---

# 🌱 What's Next?

Vyakti's architecture is designed so that more commerce capabilities can be added without changing the fundamental interaction model.

Potential future directions include:

- 🌐 More real-world marketplace integrations
- 🛒 Live product availability
- 💰 Better price and value comparison
- 📍 Location-aware product selection
- 📦 Delivery-time optimization
- 🤖 More capable commerce agents
- 🔐 Stronger authentication and authorization
- 💳 More complete end-to-end checkout flows

The goal is not to build another shopping website.

**The goal is to build an interface where your intent becomes the starting point of commerce.**

---

# ❤️ Why Vyakti?

Because shopping shouldn't always begin with:

> **“Which app should I open?”**

Sometimes it should begin with:

> **“I need milk.”**

And that's where Vyakti starts.

---

## 👨‍💻 Built with curiosity, AI, and a lot of experimentation.

**VYAKTI — व्यक्ति**

### *Your intent. Understood.*
