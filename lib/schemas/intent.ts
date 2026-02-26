import { z } from "zod";

export const OrderIntentSchema = z.object({
  is_intent_clear: z.boolean().describe("True if the user clearly stated an item they want to buy or interact with."),
  is_complete: z.boolean().describe("True if there is enough information to execute a product search on ONDC."),
  
  // The core transaction payload
  extracted_data: z.object({
    item_name: z.string().nullable().describe("The core product name, e.g., 'bread', 'milk'. Null if not found."),
    brand_preference: z.string().nullable().describe("Specific brand if mentioned, e.g., 'Zepto', 'Amul'. Null if none."),
    quantity: z.number().int().positive().default(1).describe("Number of items requested. Default to 1 if not stated."),
    category: z.string().nullable().describe("General category like 'grocery', 'electronics'. Null if unknown."),
  }).nullable(),

  // Fallback state for conversational memory
  clarification_needed: z.string().nullable().describe("If is_complete is false, provide a short, 1-sentence question to ask the user to get the missing info. e.g., 'What brand of bread?'"),
});

// We export the TypeScript type so our Next.js UI knows exactly what to expect
export type OrderIntent = z.infer<typeof OrderIntentSchema>;