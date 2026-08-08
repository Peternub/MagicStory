export type SeriesMemory = {
  characters: string[];
  facts: string[];
  open_threads: string[];
  episode_summaries: string[];
};

export const EMPTY_SERIES_MEMORY: SeriesMemory = {
  characters: [],
  facts: [],
  open_threads: [],
  episode_summaries: []
};

export function isSeriesMemory(value: unknown): value is SeriesMemory {
  if (!value || typeof value !== "object") {
    return false;
  }

  const memory = value as Record<string, unknown>;
  const limits: Record<keyof SeriesMemory, { count: number; length: number }> = {
    characters: { count: 20, length: 240 },
    facts: { count: 30, length: 300 },
    open_threads: { count: 10, length: 300 },
    episode_summaries: { count: 16, length: 500 }
  };

  for (const [key, limit] of Object.entries(limits) as Array<
    [keyof SeriesMemory, { count: number; length: number }]
  >) {
    const items = memory[key];
    if (
      !Array.isArray(items) ||
      items.length > limit.count ||
      items.some((item) => typeof item !== "string" || item.length > limit.length)
    ) {
      return false;
    }
  }

  return true;
}

export function parseSeriesMemory(value: unknown): SeriesMemory {
  return isSeriesMemory(value) ? value : EMPTY_SERIES_MEMORY;
}
