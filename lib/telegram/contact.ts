import "server-only";

type ContactMessage = {
  name: string;
  contact: string;
  message: string;
};

export async function sendContactMessageToTelegram(data: ContactMessage) {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();

  if (!token || !chatId) {
    throw new Error("TELEGRAM_NOT_CONFIGURED");
  }

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: [
        "Новое обращение с MagicStory",
        `Имя: ${data.name}`,
        `Контакт: ${data.contact}`,
        "",
        data.message
      ].join("\n"),
      disable_web_page_preview: true
    }),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`TELEGRAM_REQUEST_FAILED_${response.status}`);
  }
}
