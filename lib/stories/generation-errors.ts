function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
    return error.message;
  }
  return "";
}

export function getGenerationActionError(error: unknown) {
  const message = getErrorMessage(error);

  if (message.includes("GENERATION_ALREADY_RUNNING") || message === "GENERATION_IN_PROGRESS") {
    return "Другая серия уже создаётся. Дождитесь её завершения.";
  }

  if (message.includes("FAILED_EPISODE_REQUIRES_RETRY")) {
    return "Сначала повторите незавершённую серию.";
  }

  if (message.includes("SERIES_COMPLETED")) {
    return "Все серии уже созданы.";
  }

  if (message.includes("TIMEOUT") || message.includes("ETIMEDOUT")) {
    return "Создание заняло слишком много времени. Нажмите «Повторить».";
  }

  if (message.includes("RATE_LIMIT")) {
    return "Сервис сейчас перегружен. Подождите немного и нажмите «Повторить».";
  }

  if (
    [
      "OPENAI_UNAVAILABLE",
      "AI_GATEWAY_HTTP_502",
      "AI_GATEWAY_HTTP_503",
      "ECONNREFUSED",
      "ECONNRESET",
      "ENOTFOUND",
      "EHOSTUNREACH"
    ].some((code) => message.includes(code))
  ) {
    return "Сервис создания сказок временно недоступен. Нажмите «Повторить» через минуту.";
  }

  if (message.includes("OPENAI_INVALID_RESPONSE") || message.includes("OPENAI_EMPTY_RESPONSE")) {
    return "Не удалось получить готовую сказку. Нажмите «Повторить».";
  }

  return "Не удалось создать серию. Попробуйте ещё раз.";
}
