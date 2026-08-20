export type TelegramUpdate = {
  update_id: number;
  message?: {
    text?: string;
    chat: { id: number };
  };
};

type TelegramResponse<T> = { ok: boolean; result?: T; description?: string };

export class TelegramClient {
  constructor(
    private readonly token: string,
    private readonly fetchImpl: typeof fetch = fetch
  ) {}

  private async call<T>(method: string, body: Record<string, unknown>, attempts = 3): Promise<T> {
    let lastError: Error | null = null;
    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      try {
        const response = await this.fetchImpl(`https://api.telegram.org/bot${this.token}/${method}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(35_000)
        });
        const data = await response.json() as TelegramResponse<T>;
        if (response.ok && data.ok && data.result !== undefined) return data.result;
        if (response.status < 500 && response.status !== 429) {
          throw new Error("TELEGRAM_PERMANENT_FAILURE");
        }
        lastError = new Error("TELEGRAM_TEMPORARY_FAILURE");
      } catch (error) {
        lastError = error instanceof Error ? error : new Error("TELEGRAM_REQUEST_FAILED");
        if (lastError.message === "TELEGRAM_PERMANENT_FAILURE") throw lastError;
      }
      if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
    }
    throw lastError ?? new Error("TELEGRAM_REQUEST_FAILED");
  }

  async sendMessage(chatId: string, text: string) {
    await this.call("sendMessage", { chat_id: chatId, text, disable_web_page_preview: true });
  }

  async getUpdates(offset?: number) {
    return this.call<TelegramUpdate[]>("getUpdates", {
      offset,
      timeout: 30,
      allowed_updates: ["message"]
    }, 1);
  }
}
