/**
 * lib/payments/types.ts
 *
 * Server-side Razorpay domain types. These describe what our own backend
 * produces/consumes — distinct from lib/schemas/payment.ts, which describes
 * the shape of our own API route request/response bodies.
 */

export type PaymentStatus = "CREATED" | "PAID" | "FAILED";

/**
 * Returned by lib/payments/razorpay.ts after creating a Razorpay order.
 * `amount` is in paise (Razorpay's smallest-unit convention), always
 * computed server-side from PRODUCTS — never accepted from the client.
 */
export type PaymentOrder = {
  orderId: string;       // Razorpay order_id
  amount: number;        // paise
  currency: string;      // e.g. "INR"
  productId: string;
  createdAt: string;     // ISO timestamp
};

/**
 * Returned by lib/payments/razorpay.ts after verifying a payment signature.
 */
export type PaymentResult = {
  status: PaymentStatus;
  orderId: string;
  paymentId?: string;    // present once Razorpay has charged
  failureReason?: string; // present only when status === "FAILED"
};