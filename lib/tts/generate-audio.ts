import "server-only";

type GenerateAudioParams = {
  text: string;
};

type GeneratedAudio = {
  buffer: Buffer;
  contentType: string;
  provider: string;
};

export async function generateAudio({
  text
}: GenerateAudioParams): Promise<GeneratedAudio | null> {
  const apiKey = process.env.YANDEX_SPEECHKIT_API_KEY;

  if (!apiKey) {
    return null;
  }

  const body = new URLSearchParams({
    text,
    lang: "ru-RU",
    voice: "alena",
    emotion: "good",
    format: "mp3",
    sampleRateHertz: "48000"
  });

  const response = await fetch(
    "https://tts.api.cloud.yandex.net/speech/v1/tts:synthesize",
    {
      method: "POST",
      headers: {
        Authorization: `Api-Key ${apiKey}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body,
      cache: "no-store"
    }
  );

  if (!response.ok) {
    throw new Error("YANDEX_SPEECHKIT_REQUEST_FAILED");
  }

  const audioBuffer = Buffer.from(await response.arrayBuffer());

  return {
    buffer: audioBuffer,
    contentType: "audio/mpeg",
    provider: "yandex-speechkit"
  };
}
