type UserLike = {
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
};

function pickString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

export function getUserDisplayName(user: UserLike) {
  const firstName = pickString(user.user_metadata?.first_name);
  const lastName = pickString(user.user_metadata?.last_name);
  const fullName = [firstName, lastName].filter(Boolean).join(" ");

  if (fullName) {
    return fullName;
  }

  const metadataFullName = pickString(user.user_metadata?.full_name);

  if (metadataFullName) {
    return metadataFullName;
  }

  return "Профиль";
}

export function getUserInitials(user: UserLike) {
  const firstName = pickString(user.user_metadata?.first_name);
  const lastName = pickString(user.user_metadata?.last_name);

  if (firstName || lastName) {
    return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
  }

  const emailInitial = user.email?.trim()?.[0];

  return (emailInitial ?? "U").toUpperCase();
}
