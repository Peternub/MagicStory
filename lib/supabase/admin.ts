import "server-only";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { getPublicSupabaseEnv } from "@/lib/supabase/config";

const adminEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1)
});

export function createSupabaseAdminClient() {
  const publicEnv = getPublicSupabaseEnv();
  const adminEnv = adminEnvSchema.parse({
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
  });

  return createClient(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    adminEnv.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}
