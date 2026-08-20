import { NextResponse } from "next/server";
import { getServerOAuthManager } from "@/lib/swiggy/auth/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const authorizationUrl = await getServerOAuthManager().getAuthorizationUrl();
    return NextResponse.redirect(authorizationUrl);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to start the Swiggy OAuth flow.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
