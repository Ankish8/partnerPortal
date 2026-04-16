import { NextRequest, NextResponse } from "next/server";
import { CLOUDFLARE_API_TOKEN, CLOUDFLARE_BASE_URL } from "@/lib/cloudflare";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, limit = 50 } = body;

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
    }

    const response = await fetch(`${CLOUDFLARE_BASE_URL}/crawl`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        limit,
        render: false, // No JS rendering — free during beta
        formats: ["markdown"],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.errors?.[0]?.message || "Crawl request failed" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Crawl API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
