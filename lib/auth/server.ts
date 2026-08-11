import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { isAuthEnabled } from "@/lib/auth/config";
import { createAuthUser } from "@/lib/auth/user";

export const getCurrentUser = cache(async function getCurrentUser() {
  if (!isAuthEnabled()) {
    return null;
  }

  const [{ localAuth }, requestHeaders] = await Promise.all([
    import("@/lib/auth/local"),
    headers()
  ]);
  const session = await localAuth.api.getSession({ headers: requestHeaders });

  return session?.user
    ? createAuthUser({
        id: session.user.id,
        email: session.user.email,
        name: session.user.name
      })
    : null;
});

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  return user;
}
