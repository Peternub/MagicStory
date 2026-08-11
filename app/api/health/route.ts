import { NextResponse } from "next/server";
import { queryDatabase } from "@/lib/db/client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await queryDatabase("select 1");

    return NextResponse.json({ status: "ok" });
  } catch {
    return NextResponse.json(
      { status: "error" },
      { status: 503 }
    );
  }
}
