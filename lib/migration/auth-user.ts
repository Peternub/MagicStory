import { z } from "zod";

const sourceAuthUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  email_confirmed_at: z.string().nullish(),
  created_at: z.string().min(1),
  updated_at: z.string().min(1).nullish(),
  user_metadata: z.record(z.unknown()).nullish()
});

function pickText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function buildAuthUserMigrationRecord(source: unknown) {
  const user = sourceAuthUserSchema.parse(source);
  const metadata = user.user_metadata ?? {};
  const firstName = pickText(metadata.first_name);
  const lastName = pickText(metadata.last_name);
  const name =
    pickText(metadata.full_name) ||
    [firstName, lastName].filter(Boolean).join(" ") ||
    user.email.split("@")[0] ||
    "Пользователь";
  const image = pickText(metadata.avatar_url) || pickText(metadata.picture) || null;

  return {
    id: user.id,
    email: user.email.toLowerCase(),
    name,
    emailVerified: Boolean(user.email_confirmed_at),
    image,
    createdAt: user.created_at,
    updatedAt: user.updated_at ?? user.created_at
  };
}
