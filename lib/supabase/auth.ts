import { redirect } from "next/navigation";
import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type CurrentUser = {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown> | null;
  app_metadata?: Record<string, unknown> | null;
};

type SessionClaims = {
  sub?: string;
  email?: string;
  user_metadata?: unknown;
  app_metadata?: unknown;
};

export const getCurrentUser = cache(async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    return null;
  }

  const { data: claimsData } = await supabase.auth.getClaims(session.access_token);
  const claims = claimsData?.claims as SessionClaims | undefined;

  if (claims?.sub) {
    return {
      id: claims.sub,
      email: claims.email,
      user_metadata: pickRecord(claims.user_metadata),
      app_metadata: pickRecord(claims.app_metadata)
    };
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  return user;
});

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  return user;
}

function pickRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}
