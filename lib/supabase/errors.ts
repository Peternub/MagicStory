type SupabaseErrorLike = {
  code?: string;
  message?: string;
  details?: string | null;
  hint?: string | null;
};

export function isMissingColumnError(
  error: SupabaseErrorLike | null | undefined,
  columnName: string
) {
  if (!error) {
    return false;
  }

  const errorText = [
    error.code,
    error.message,
    error.details,
    error.hint
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return (
    errorText.includes(columnName.toLowerCase()) &&
    (error.code === "42703" ||
      error.code === "PGRST204" ||
      errorText.includes("schema cache") ||
      errorText.includes("column"))
  );
}
