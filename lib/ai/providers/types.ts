export type GenerateEpisodeRequest = {
  requestId: string;
  model: string;
  instructions: string;
  input: string;
  schema: Record<string, unknown>;
};

export type GenerateEpisodeResult = {
  output: string;
  model: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
};

export interface AiProvider {
  generateEpisode(request: GenerateEpisodeRequest): Promise<GenerateEpisodeResult>;
}
