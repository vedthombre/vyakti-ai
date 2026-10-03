/**
 * lib/payments/razorpay.ts
 *
 * Server-side Razorpay SDK wrapper. This is the ONLY file that touches
 * RAZORPAY_KEY_SECRET. Never import this from client components.
 *
 * Security rule (locked, decision #6): the amount charged is always
 * computed here from PRODUCTS (lib/mock/catalog.ts), never accepted
 * from the client. The client only ever tells us *which* product it
 * wants to pay for.
 */

import Razorpay from "razorpay";
import crypto from "crypto";
import { PRODUCTS } from "@/lib/mock/catalog";
import type { PaymentOrder, PaymentResult } from "@/lib/payments/types";

function getClient(): Razorpay {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) {
    throw new Error("Razorpay credentials missing — check .env.local");
  }
  return new Razorpay({ key_id, key_secret });
}

/**
 * Looks up the authoritative price for productId and creates a
 * test-mode Razorpay order for that amount. Throws if the product
 * doesn't exist or is out of stock — caller (the API route) turns
 * that into a 400/404 response.
 */
export async function createOrder(productId: string): Promise<PaymentOrder> {
  const product = PRODUCTS.find((p) => p.id === productId);
  if (!product) {
    throw new Error(`Unknown productId: ${productId}`);
  }
  if (!product.inStock) {
    throw new Error(`Product is out of stock: ${productId}`);
  }

  const amountInPaise = Math.round(product.price * 100);
  const client = getClient();

  const order = await client.orders.create({
    amount: amountInPaise,
    currency: product.currency,
    // Razorpay receipt field is just a label for the dashboard — not
    // used for anything security-relevant.
    receipt: `vyakti_${productId}_${Date.now()}`,
  });

  return {
    orderId: order.id,
    amount: amountInPaise,
    currency: product.currency,
    productId,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Recomputes the HMAC SHA256 signature server-side and compares against
 * what the client returned from Razorpay Checkout.js. This is the ONLY
 * source of truth for payment success — the client callback is never
 * trusted alone (locked decision #6).
 */
export function verifySignature(params: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}): PaymentResult {
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_secret) {
    throw new Error("Razorpay credentials missing — check .env.local");
  }

  const body = `${params.razorpay_order_id}|${params.razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac("sha256", key_secret)
    .update(body)
    .digest("hex");

  const isValid = expectedSignature === params.razorpay_signature;

  if (isValid) {
    return {
      status: "PAID",
      orderId: params.razorpay_order_id,
      paymentId: params.razorpay_payment_id,
    };
  }

  return {
    status: "FAILED",
    orderId: params.razorpay_order_id,
    paymentId: params.razorpay_payment_id,
    failureReason: "Signature mismatch — payment could not be verified.",
  };
}