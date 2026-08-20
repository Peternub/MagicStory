import type { TelegramUpdate } from "./client";

export type CommandDependencies = {
  allowedChatIds: Set<string>;
  sendMessage(chatId: string, text: string): Promise<void>;
  generateToday(): Promise<string>;
  getStatus(): Promise<string>;
  now(): number;
};

export class TelegramCommandRouter {
  private readonly lastCommandAt = new Map<string, number>();

  constructor(private readonly dependencies: CommandDependencies) {}

  async handle(update: TelegramUpdate) {
    const message = update.message;
    if (!message?.text) return;
    const chatId = String(message.chat.id);
    if (!this.dependencies.allowedChatIds.has(chatId)) return;
    const command = message.text.trim().split(/\s+/)[0]?.split("@")[0];
    if (command !== "/today" && command !== "/status") return;

    const now = this.dependencies.now();
    const last = this.lastCommandAt.get(chatId) ?? 0;
    if (now - last < 5_000) return;
    this.lastCommandAt.set(chatId, now);

    const response = command === "/today"
      ? await this.dependencies.generateToday()
      : await this.dependencies.getStatus();
    await this.dependencies.sendMessage(chatId, response);
  }
}
