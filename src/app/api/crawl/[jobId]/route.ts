import { NextRequest, NextResponse } from "next/server";
import { CLOUDFLARE_API_TOKEN, CLOUDFLARE_BASE_URL } from "@/lib/cloudflare";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get("limit") || "100";
    const cursor = searchParams.get("cursor") || "0";

    const url = new URL(`${CLOUDFLARE_BASE_URL}/crawl/${jobId}`);
    url.searchParams.set("limit", limit);
    url.searchParams.set("cursor", cursor);

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.errors?.[0]?.message || "Failed to fetch crawl status" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Crawl status API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;

    const response = await fetch(`${CLOUDFLARE_BASE_URL}/crawl/${jobId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.errors?.[0]?.message || "Failed to cancel crawl" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Crawl cancel API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
