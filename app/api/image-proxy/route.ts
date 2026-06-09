import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  // Only allow proxying localhost/127.0.0.1 URLs to prevent open-proxy abuse
  const parsed = new URL(url);
  const isLocal =
    parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";

  if (!isLocal) {
    return new NextResponse("Only local URLs are allowed", { status: 403 });
  }

  try {
    const upstream = await fetch(url);

    if (!upstream.ok) {
      return new NextResponse("Upstream fetch failed", {
        status: upstream.status,
      });
    }

    const contentType =
      upstream.headers.get("content-type") ?? "application/octet-stream";
    const buffer = await upstream.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
      },
    });
  } catch {
    return new NextResponse("Failed to fetch upstream image", { status: 502 });
  }
}
