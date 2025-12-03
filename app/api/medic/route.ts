import { NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const response = await fetch(`${BACKEND_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Backend error", status: response.status },
        { status: 500 }
      );
    }

    const result = await response.json();

    // 🔥 Normalize backend response so UI NEVER breaks
    return NextResponse.json({
      text: result.advice || "",
      label: result.label || "general",
      urgency: result.urgency || "low",
      actions: result.actions || [],
      sources: result.sources || [],
      metadata: result.metadata || {},
      request_id: result.request_id || null,
      latency_s: result.latency_s || null,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: "Failed to connect to MEDIC backend",
        detail: err?.message,
      },
      { status: 500 }
    );
  }
}
