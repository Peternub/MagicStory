import { deleteStory } from "@/app/actions/stories";

type DeleteStoryButtonProps = {
  storyId: string;
};

export function DeleteStoryButton({ storyId }: DeleteStoryButtonProps) {
  return (
    <form action={deleteStory}>
      <input type="hidden" name="storyId" value={storyId} />
      <button
        type="submit"
        className="rounded-full border border-red-200 px-4 py-2 text-sm text-red-700 transition hover:border-red-400"
      >
        Удалить сказку
      </button>
    </form>
  );
}
