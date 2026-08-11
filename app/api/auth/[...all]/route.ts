import { NextResponse } from "next/server";
import { isAuthEnabled } from "@/lib/auth/config";

async function handleAuthRequest(request: Request) {
  if (!isAuthEnabled()) {
    return NextResponse.json({ error: "Маршрут не найден" }, { status: 404 });
  }

  const { localAuth } = await import("@/lib/auth/local");
  return localAuth.handler(request);
}

export const GET = handleAuthRequest;
export const POST = handleAuthRequest;
