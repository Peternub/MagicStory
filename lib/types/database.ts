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
  created_at: string;
  updated_at: string;
};
