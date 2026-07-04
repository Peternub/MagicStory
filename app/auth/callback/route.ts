import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { ensureUserProfile } from "@/lib/account/ensure-profile";
import { getPublicSupabaseEnv } from "@/lib/supabase/config";

type CookieToSet = {
  name: string;
  value: string;
  options?: CookieOptions;
};

function createOAuthErrorResponse(request: NextRequest, reason?: string | null) {
  const url = new URL("/auth/login", request.url);
  url.searchParams.set("error", "oauth");

  if (reason) {
    url.searchParams.set("reason", reason.slice(0, 180));
  }

  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const env = getPublicSupabaseEnv();
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const providerError = requestUrl.searchParams.get("error_description");
  const next = requestUrl.searchParams.get("next") || "/dashboard";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
  let response = NextResponse.redirect(new URL(safeNext, request.url));

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        }
      }
    }
  );

  if (!code) {
    console.error("Google callback missing code", {
      providerError
    });
    return createOAuthErrorResponse(request, providerError ?? "Google не вернул код авторизации");
  }

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    console.error("Google callback error", {
      status: error?.status,
      message: error?.message
    });
    return createOAuthErrorResponse(request, error?.message ?? "Supabase не создал сессию");
  }

  try {
    await ensureUserProfile(data.user.id, data.user.email);
  } catch {
    console.error("Google callback profile creation failed", {
      userId: data.user.id
    });
  }

  return response;
}
