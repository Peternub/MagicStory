type UserLike = {
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
};

function pickString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function capitalizeWord(word: string) {
  if (!word) {
    return "";
  }

  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function formatEmailFallback(email?: string | null) {
  const localPart = email?.split("@")[0]?.trim();

  if (!localPart) {
    return "Профиль";
  }

  const parts = localPart
    .split(/[._-]+/g)
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2);

  if (!parts.length) {
    return "Профиль";
  }

  return parts.map(capitalizeWord).join(" ");
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

  return formatEmailFallback(user.email);
}

export function getUserInitials(user: UserLike) {
  const firstName = pickString(user.user_metadata?.first_name);
  const lastName = pickString(user.user_metadata?.last_name);

  if (firstName || lastName) {
    return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
  }

  const displayName = formatEmailFallback(user.email);
  const words = displayName.split(" ").filter(Boolean);

  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }

  return (words[0]?.[0] ?? "U").toUpperCase();
}
