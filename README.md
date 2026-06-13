Vyakti (व्यक्ति)

The Voice-to-Action Agent for Indian Commerce
"Bol, Order Ho Jaaye"

Vyakti is a production-grade Large Action Model (LAM) designed to bridge the "Action Gap" in current AI. While traditional assistants can only recommend or search, Vyakti executes—turning a natural voice command into a completed transaction across the ONDC network and UPI rails.

⚡ The Core Problem: The 8-Minute Friction Trap
In India’s hyper-competitive delivery market, ordering a single item (like bread) is an ordeal:

Fragmentation: Users manually switch between 3-4 apps (Blinkit, Zepto, Swiggy) to compare availability and price.

Fatigue: The journey from "intent" to "confirmation" involves 15+ clicks, multiple scrolls, and repetitive address selection.

The Gap: AI has been "Read-Only" for too long.

Vyakti reduces this journey from 8 minutes of manual navigation to 30 seconds of voice interaction.

🚀 The Solution: Manifested Agency
Vyakti (meaning "Manifested Entity") acts as a digital agent that "sees" the open market through the ONDC (Open Network for Digital Commerce) protocol.

The User Journey
Command: "Hey Vyakti, order my usual whole wheat bread."

Search: Agent broadcasts a search to the ONDC Gateway, aggregating real-time prices from all local sellers.

Reason: Agent identifies the best deal (Price vs. Delivery Time) and applies user preferences.

Pay: Agent generates a UPI Intent link. The user's phone pops open GPay/PhonePe automatically.

Confirm: User enters PIN. Transaction complete.

🛠️ Technical Architecture
Vyakti is built on a Stateful Multi-Agent Framework to ensure reliability in the asynchronous world of decentralized commerce.

The Engineering Stack
Orchestration: LangGraph (State machines to handle "Wait-and-Listen" ONDC callbacks).

Intelligence: Claude 3.5 Sonnet / GPT-4o for intent extraction and reasoning.

Voice Engine: Groq Whisper-v3 (Achieving <200ms transcription latency for near-instant response).

Protocol: Beckn (ONDC Retail) for decentralized discovery.

Payments: Razorpay / UPI Deep-Linking (Non-custodial, secure handoff).

Backend: Next.js 14 (App Router) + Supabase (Persistent user commerce patterns).

Why this is "Principal Engineer" Grade:
Non-Blocking Async Webhooks: Unlike simple wrappers, Vyakti manages asynchronous on_search and on_init responses from multiple sellers simultaneously.

Pattern Learning: The system doesn't just "forget." It stores user habits in a vector-enhanced Postgres database to enable "the usual" commands.

Latency Optimization: By moving transcription to the edge (Groq), the agent feels like a real-time conversation rather than a "processing" bot.

📊 Engineering Highlights
Metric	Standard App Journey	Vyakti (Agentic)
Time-to-Checkout	~8 Minutes	~30 Seconds
Cognitive Load	High (Compare 4 apps)	Zero (AI Aggregation)
Latency	Network dependent	200ms Voice Auth
Network Reach	Walled Garden (1 App)	ONDC (All Local Sellers)
🛡️ Security & Ethics
Vyakti follows the "Initiate, Don't Authorize" principle.

The Agent handles the complexity of discovery, carting, and gateway navigation.

The User remains the final gatekeeper for the funds, authorizing the transaction via their native UPI app’s 2FA. This ensures 100% legal compliance and user trust.


💡 How to Get Started
Clone & Install: npm install

Keys Required: Groq (Whisper), Razorpay (Test), ONDC Sandbox Credentials.

Run: npm run dev

Built by [Your Name] Developing the next generation of Indian Digital Public Infrastructure.