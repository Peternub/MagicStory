export type ChildRecord = {
  id: string;
  user_id: string;
  name: string;
  age: number;
  gender: "boy" | "girl";
  interests: string | null;
  fears: string | null;
  additional_context: string | null;
  created_at: string;
  updated_at: string;
};

export type StorySeriesRecord = {
  id: string;
  user_id: string;
  child_id: string;
  title: string;
  premise: string;
  planned_episodes: number;
  status: "draft" | "pending" | "generating" | "active" | "completed" | "failed";
  model_code: string;
  series_memory: {
    characters: string[];
    facts: string[];
    open_threads: string[];
    episode_summaries: string[];
  };
  private_aliases: Record<string, string>;
  creation_key: string | null;
  last_error: string | null;
  generation_started_at: string | null;
  created_at: string;
  updated_at: string;
};
