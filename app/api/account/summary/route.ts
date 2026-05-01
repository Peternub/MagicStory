import { NextResponse } from "next/server";
import { getUserSummary } from "@/lib/account/user-summary";
import { getCurrentUser } from "@/lib/supabase/auth";
import { getUserDisplayName, getUserInitials } from "@/lib/user/display-name";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { user: null },
      {
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  }

  const summary = await getUserSummary(user.id);

  return NextResponse.json(
    {
      user: {
        displayName: getUserDisplayName(user),
        email: user.email ?? "",
        initials: getUserInitials(user),
        storiesBalance: summary.storiesBalance,
        subscriptionStatus: summary.subscriptionStatus
      }
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
