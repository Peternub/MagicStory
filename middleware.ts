import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const legacyDevChunkPaths = new Set([
  "/_next/static/chunks/react-refresh.js",
  "/_next/static/chunks/main.js",
  "/_next/static/chunks/pages/_app.js",
  "/_next/static/chunks/fallback/react-refresh.js",
  "/_next/static/chunks/fallback/main.js",
  "/_next/static/chunks/fallback/pages/_app.js",
  "/_next/static/chunks/fallback/pages/_error.js"
]);

function createEmptyDevChunkResponse() {
  return new NextResponse("self.__magicStoryLegacyChunk = true;\n", {
    headers: {
      "cache-control": "no-store",
      "content-type": "application/javascript; charset=utf-8"
    }
  });
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (legacyDevChunkPaths.has(pathname)) {
    return createEmptyDevChunkResponse();
  }

  if (pathname === "/_next/static/chunks/fallback/webpack.js") {
    const url = request.nextUrl.clone();
    url.pathname = "/_next/static/chunks/webpack.js";
    return NextResponse.rewrite(url);
  }

  if (pathname.startsWith("/_next/")) {
    return NextResponse.next();
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    "/_next/static/chunks/:path*",
    "/auth/callback",
    "/billing/:path*",
    "/children/:path*",
    "/dashboard/:path*",
    "/stories/:path*"
  ]
};
