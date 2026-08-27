/**
 * GET /api/audit?sessionId=...
 *
 * Optional, judge-facing: returns the audit trail for a session so the
 * demo can show "here's the DB trail" (plan §10).
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuditTrail } from "@/lib/audit/auditLog";

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("sessionId");
  if (!sessionId) {
    return NextResponse.json(
      { success: false, error: "Missing sessionId query param." },
      { status: 400 }
    );
  }

  try {
    const entries = await getAuditTrail(sessionId);
    return NextResponse.json({ success: true, entries });
  } catch (err) {
    console.error("[audit] failed:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}