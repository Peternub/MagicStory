import "server-only";
import { randomUUID } from "node:crypto";
import { z } from "zod";

const SALUTESPEECH_OAUTH_URL = "https://ngw.devices.sberbank.ru:9443/api/v2/oauth";
const SALUTESPEECH_UPLOAD_URL = "https://smartspeech.sber.ru/rest/v1/data:upload";
const SALUTESPEECH_SYNTHESIS_URL = "https://smartspeech.sber.ru/rest/v1/text:async_synthesize";
const SALUTESPEECH_TASK_URL = "https://smartspeech.sber.ru/rest/v1/task:get";
const SALUTESPEECH_DOWNLOAD_URL = "https://smartspeech.sber.ru/rest/v1/data:download";

const salutespeechEnvSchema = z.object({
  SALUTESPEECH_AUTH_KEY: z.string().min(1),
  SALUTESPEECH_SCOPE: z.string().min(1).default("SALUTE_SPEECH_PERS"),
  SALUTESPEECH_VOICE: z.string().min(1).default("May_24000"),
  SALUTESPEECH_AUTH_SCHEME: z.enum(["Bearer", "Basic"]).default("Basic")
});

type TokenResponse = {
  access_token?: string;
};

type UploadResponse = {
  result?: {
    request_file_id?: string;
  };
};

type TaskResponse = {
  result?: {
    id?: string;
    status?: string;
    response_file_id?: string;
    error_message?: string;
  };
};

export type SaluteSpeechTaskStatus = {
  id: string;
  status: string;
  responseFileId: string | null;
  errorMessage: string | null;
};

function getSaluteSpeechEnv() {
  return salutespeechEnvSchema.parse({
    SALUTESPEECH_AUTH_KEY: process.env.SALUTESPEECH_AUTH_KEY,
    SALUTESPEECH_SCOPE: process.env.SALUTESPEECH_SCOPE,
    SALUTESPEECH_VOICE: process.env.SALUTESPEECH_VOICE,
    SALUTESPEECH_AUTH_SCHEME: process.env.SALUTESPEECH_AUTH_SCHEME
  });
}

async function readError(response: Response) {
  const text = await response.text().catch(() => "");

  return text ? `${response.status}: ${text}` : `${response.status}`;
}

async function getAccessToken() {
  const env = getSaluteSpeechEnv();
  const body = new URLSearchParams({
    scope: env.SALUTESPEECH_SCOPE
  });

  const response = await fetch(SALUTESPEECH_OAUTH_URL, {
    method: "POST",
    headers: {
      Authorization: `${env.SALUTESPEECH_AUTH_SCHEME} ${env.SALUTESPEECH_AUTH_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
      RqUID: randomUUID()
    },
    body,
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`SALUTESPEECH_TOKEN_FAILED: ${await readError(response)}`);
  }

  const data = (await response.json()) as TokenResponse;

  if (!data.access_token) {
    throw new Error("SALUTESPEECH_TOKEN_EMPTY");
  }

  return data.access_token;
}

async function uploadText(token: string, text: string) {
  const response = await fetch(SALUTESPEECH_UPLOAD_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "text/plain",
      RqUID: randomUUID()
    },
    body: text,
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`SALUTESPEECH_UPLOAD_FAILED: ${await readError(response)}`);
  }

  const data = (await response.json()) as UploadResponse;
  const requestFileId = data.result?.request_file_id;

  if (!requestFileId) {
    throw new Error("SALUTESPEECH_UPLOAD_EMPTY");
  }

  return requestFileId;
}

async function createSynthesisTask(token: string, requestFileId: string) {
  const env = getSaluteSpeechEnv();
  const response = await fetch(SALUTESPEECH_SYNTHESIS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      RqUID: randomUUID()
    },
    body: JSON.stringify({
      audio_encoding: "opus",
      voice: env.SALUTESPEECH_VOICE,
      request_file_id: requestFileId
    }),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`SALUTESPEECH_SYNTHESIS_FAILED: ${await readError(response)}`);
  }

  const data = (await response.json()) as TaskResponse;
  const taskId = data.result?.id;

  if (!taskId) {
    throw new Error("SALUTESPEECH_SYNTHESIS_EMPTY");
  }

  return taskId;
}

export async function startSaluteSpeechSynthesis(text: string) {
  const token = await getAccessToken();
  const requestFileId = await uploadText(token, text);
  const taskId = await createSynthesisTask(token, requestFileId);

  return {
    provider: `SaluteSpeech:${getSaluteSpeechEnv().SALUTESPEECH_VOICE}`,
    requestFileId,
    taskId
  };
}

export async function getSaluteSpeechTaskStatus(taskId: string): Promise<SaluteSpeechTaskStatus> {
  const token = await getAccessToken();
  const url = new URL(SALUTESPEECH_TASK_URL);
  url.searchParams.set("id", taskId);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      RqUID: randomUUID()
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`SALUTESPEECH_STATUS_FAILED: ${await readError(response)}`);
  }

  const data = (await response.json()) as TaskResponse;
  const result = data.result;

  if (!result?.id || !result.status) {
    throw new Error("SALUTESPEECH_STATUS_EMPTY");
  }

  return {
    id: result.id,
    status: result.status,
    responseFileId: result.response_file_id ?? null,
    errorMessage: result.error_message ?? null
  };
}

export async function downloadSaluteSpeechResult(responseFileId: string) {
  const token = await getAccessToken();
  const url = new URL(SALUTESPEECH_DOWNLOAD_URL);
  url.searchParams.set("response_file_id", responseFileId);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      RqUID: randomUUID()
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`SALUTESPEECH_DOWNLOAD_FAILED: ${await readError(response)}`);
  }

  return new Uint8Array(await response.arrayBuffer());
}
