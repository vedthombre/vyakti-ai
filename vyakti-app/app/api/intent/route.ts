import { NextResponse } from "next/server";
import { ChatGroq } from "@langchain/groq";
import { z } from "zod";

// ── Schema ─────────────────────────────────────────────────────────────────
const IntentResponseSchema = z.object({
  routing: z.enum(["ONDC_SEARCH", "DIRECT_APP", "UNKNOWN"]).describe(
    "ONDC_SEARCH = open marketplace search; DIRECT_APP = user named a branded quick-commerce app explicitly; UNKNOWN = insufficient info"
  ),
  item_name: z.string().nullable().describe("Normalised product name, e.g. 'milk', 'bread'. Null if not found."),
  brand_preference: z.string().nullable().describe("Specific brand the user mentioned, e.g. 'Amul', 'Britannia'. Null if not mentioned."),
  store_brand: z.string().nullable().describe("If routing is DIRECT_APP, the quick-commerce platform name, e.g. 'Zepto', 'Blinkit'. Null otherwise."),
  quantity: z.number().int().positive().default(1),
  category: z.string().nullable().describe("General category like 'grocery', 'dairy', 'electronics'. Null if unknown."),
  clarification_needed: z.string().nullable().describe("If intent is UNKNOWN, a short clarifying question. Null otherwise."),
  steps: z.array(z.string()).describe(
    "An array of 3-5 short, single-sentence 'thinking' steps the agent performed to arrive at this intent, e.g. 'Parsing speech for product entity...' Suitable for display in a chain-of-thought UI."
  ),
});

export type IntentResponse = z.infer<typeof IntentResponseSchema>;

// ── Route Handler ───────────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const text: string = body?.text ?? "";

    if (!text.trim()) {
      return NextResponse.json({ error: "Missing text payload" }, { status: 400 });
    }

    const llm = new ChatGroq({
      model: "openai/gpt-oss-120b",
      temperature: 0,
    });

    const structuredLlm = llm.withStructuredOutput(IntentResponseSchema, {
      name: "parse_commerce_intent",
    });

    const result = await structuredLlm.invoke([
      {
        role: "system",
        content: `You are Vyakti, an agentic commerce AI operating in India. 
Your role is to parse the user's voice transcription and extract a structured purchase intent.

CRITICAL RULES — follow these strictly:
1. The user MUST mention a clear product or item name (e.g. "milk", "bread", "rice", "eggs"). If they only mention a quantity, brand, or platform WITHOUT a product name, you MUST set routing = "UNKNOWN" and ask for clarification.
   - Example: "order two liters" → UNKNOWN (two liters of WHAT?)
   - Example: "order from Zepto" → UNKNOWN (order WHAT from Zepto?)
   - Example: "get me Amul" → UNKNOWN (Amul makes many products — which one?)
2. If the user explicitly names a quick-commerce platform (Zepto, Blinkit, Swiggy Instamart, Dunzo, BigBasket) AND a product, set routing = "DIRECT_APP" and set store_brand to that platform name.
3. If the user names a product but no specific platform, set routing = "ONDC_SEARCH".
4. When routing is "UNKNOWN", set item_name to null and provide a short, friendly clarification question in clarification_needed.
5. Do NOT guess or assume a product. If unsure, always ask.

In the steps field, provide exactly 4 short, human-readable reasoning steps that describe what you did to reach this conclusion, as if narrating your chain-of-thought. Keep each step under 10 words. Use present-continuous tense, e.g. "Scanning ONDC network for sellers..."`,
      },
      {
        role: "user",
        content: `Parse this voice command: "${text}"`,
      },
    ]);

    return NextResponse.json({ success: true, intent: result });
  } catch (error: any) {
    console.error("[CRITICAL] Intent parsing failed:", error.message);
    return NextResponse.json(
      { error: "Intent parsing unavailable", details: error.message },
      { status: 502 }
    );
  }
  
}
