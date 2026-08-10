import { z } from "zod";

const dataBackendSchema = z.enum(["supabase", "postgres"]);

export type DataBackend = z.infer<typeof dataBackendSchema>;

export function parseDataBackend(value?: string): DataBackend {
  return dataBackendSchema.parse(value ?? "supabase");
}

export function getDataBackend() {
  return parseDataBackend(process.env.DATA_BACKEND);
}

export function usesPostgresDataBackend() {
  return getDataBackend() === "postgres";
}
