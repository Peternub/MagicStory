import "server-only";
import { buildVoiceScript, type TtsSegment } from "@/lib/tts/build-voice-script";

type GenerateAudioParams = {
  text: string;
  characters?: string | null;
};

type GeneratedAudio = {
  buffer: Buffer;
  contentType: string;
  provider: string;
};

type VoiceProfile = {
  voice: string;
  emotion?: string;
  speed?: string;
};

const SAMPLE_RATE = 48000;
const BITS_PER_SAMPLE = 16;
const CHANNELS = 1;

function getVoiceProfile(role: TtsSegment["role"]): VoiceProfile {
  const narratorVoice = process.env.YANDEX_TTS_VOICE_NARRATOR || "alena";
  const femaleVoice = process.env.YANDEX_TTS_VOICE_FEMALE || narratorVoice;
  const maleVoice = process.env.YANDEX_TTS_VOICE_MALE || narratorVoice;
  const childVoice = process.env.YANDEX_TTS_VOICE_CHILD || femaleVoice;

  switch (role) {
    case "female":
      return {
        voice: femaleVoice,
        emotion: "good",
        speed: "1.03"
      };
    case "male":
      return {
        voice: maleVoice,
        emotion: "neutral",
        speed: "0.97"
      };
    case "child":
      return {
        voice: childVoice,
        emotion: "good",
        speed: "1.08"
      };
    default:
      return {
        voice: narratorVoice,
        emotion: "good",
        speed: "1.0"
      };
  }
}

function createWavHeader(dataSize: number) {
  const header = Buffer.alloc(44);

  header.write("RIFF", 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(CHANNELS, 22);
  header.writeUInt32LE(SAMPLE_RATE, 24);
  header.writeUInt32LE((SAMPLE_RATE * CHANNELS * BITS_PER_SAMPLE) / 8, 28);
  header.writeUInt16LE((CHANNELS * BITS_PER_SAMPLE) / 8, 32);
  header.writeUInt16LE(BITS_PER_SAMPLE, 34);
  header.write("data", 36);
  header.writeUInt32LE(dataSize, 40);

  return header;
}

function createSilenceBuffer(durationMs: number) {
  const bytesPerSample = BITS_PER_SAMPLE / 8;
  const sampleCount = Math.floor((SAMPLE_RATE * durationMs) / 1000);

  return Buffer.alloc(sampleCount * CHANNELS * bytesPerSample);
}

function buildWaveFile(chunks: Buffer[]) {
  const pcmData = Buffer.concat(chunks);
  const header = createWavHeader(pcmData.length);

  return Buffer.concat([header, pcmData]);
}

async function synthesizeSegment(input: {
  apiKey: string;
  segment: TtsSegment;
}) {
  const profile = getVoiceProfile(input.segment.role);
  const body = new URLSearchParams({
    text: input.segment.text,
    lang: "ru-RU",
    voice: profile.voice,
    format: "lpcm",
    sampleRateHertz: String(SAMPLE_RATE),
    speed: profile.speed || "1.0"
  });

  if (profile.emotion) {
    body.set("emotion", profile.emotion);
  }

  const response = await fetch(
    "https://tts.api.cloud.yandex.net/speech/v1/tts:synthesize",
    {
      method: "POST",
      headers: {
        Authorization: `Api-Key ${input.apiKey}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body,
      cache: "no-store"
    }
  );

  if (!response.ok) {
    throw new Error("YANDEX_SPEECHKIT_REQUEST_FAILED");
  }

  return Buffer.from(await response.arrayBuffer());
}

export async function generateAudio({
  text,
  characters
}: GenerateAudioParams): Promise<GeneratedAudio | null> {
  const apiKey = process.env.YANDEX_SPEECHKIT_API_KEY;

  if (!apiKey) {
    return null;
  }

  const segments = await buildVoiceScript({
    text,
    characters
  });

  if (segments.length === 0) {
    return null;
  }

  const pcmChunks: Buffer[] = [];

  for (const segment of segments) {
    const audioChunk = await synthesizeSegment({
      apiKey,
      segment
    });

    pcmChunks.push(audioChunk, createSilenceBuffer(180));
  }

  return {
    buffer: buildWaveFile(pcmChunks),
    contentType: "audio/wav",
    provider:
      segments.length > 1 ? "yandex-speechkit-multivoice" : "yandex-speechkit"
  };
}
