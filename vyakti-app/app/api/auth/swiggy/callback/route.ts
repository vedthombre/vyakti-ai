import { NextResponse } from "next/server";
import { getServerOAuthManager } from "@/lib/swiggy/auth/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!code || !state) {
    return NextResponse.json(
      {
        success: false,
        error: "Missing OAuth callback parameters. Both code and state are required.",
      },
      { status: 400 },
    );
  }

  try {
    await getServerOAuthManager().exchangeCodeForTokens(code, state);

    return NextResponse.json({
      success: true,
      message: "Swiggy OAuth callback completed successfully.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Swiggy OAuth callback failed.";
    return NextResponse.json({ success: false, error: message }, { status: 502 });
  }
}
