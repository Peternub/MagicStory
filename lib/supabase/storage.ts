const STORY_AUDIO_BUCKET = "story-audio";

export function getStoryAudioBucket() {
  return STORY_AUDIO_BUCKET;
}

export function buildStoryAudioPath(userId: string, storyId: string) {
  return `${userId}/${storyId}.mp3`;
}
