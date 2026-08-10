export type AuthUser = {
  id: string;
  email: string | null;
  user_metadata: Record<string, unknown>;
};

type AuthUserSource = {
  id: string;
  email?: string | null;
  name?: string | null;
  metadata?: Record<string, unknown> | null;
};

export function createAuthUser(source: AuthUserSource): AuthUser {
  const userMetadata = { ...(source.metadata ?? {}) };

  if (source.name && !userMetadata.full_name) {
    userMetadata.full_name = source.name;
  }

  return {
    id: source.id,
    email: source.email ?? null,
    user_metadata: userMetadata
  };
}
