type ChildProfile = {
  name: string;
  age: number;
  interests: string | null;
  fears: string | null;
  additional_context: string | null;
};

type GenerateStoryParams = {
  child: ChildProfile;
  theme: string;
};

type GeneratedStory = {
  title: string;
  text: string;
};

function joinOptionalParts(parts: Array<string | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export async function generateStory({
  child,
  theme
}: GenerateStoryParams): Promise<GeneratedStory> {
  const title = `Как ${child.name} справился с темой "${theme}"`;

  const interests = child.interests
    ? `Больше всего ${child.name.toLowerCase()} любит ${child.interests}.`
    : "";
  const fears = child.fears
    ? `Иногда его беспокоит ${child.fears}.`
    : "";
  const context = child.additional_context
    ? `Родители также рассказали, что ${child.additional_context}.`
    : "";

  const text = joinOptionalParts([
    `${child.name} был ребенком ${child.age} лет с очень живым воображением.`,
    interests,
    fears,
    context,
    `Однажды случилась важная история: ${theme}.`,
    `Сначала ${child.name.toLowerCase()} не знал, как правильно поступить, и поэтому немного растерялся.`,
    `Но рядом появился добрый сказочный помощник, который предложил посмотреть на ситуацию спокойно и по шагам.`,
    `Они вместе заметили, что любой трудный момент становится легче, если назвать свои чувства, попросить помощь и сделать маленький полезный шаг.`,
    `Тогда ${child.name.toLowerCase()} попробовал поступить по-новому: внимательно выслушал взрослых, вспомнил о том, что важно для близких, и сделал одно доброе действие прямо сейчас.`,
    `Постепенно тревога ушла, а на ее место пришли уверенность, тепло и гордость за себя.`,
    `С тех пор ${child.name.toLowerCase()} помнил: даже если тема дня кажется сложной, внутри всегда есть сила выбрать добрый и смелый путь.`,
    `Вечером ${child.name.toLowerCase()} уснул с ощущением, что стал еще немного взрослее, добрее и мудрее.`
  ]);

  return {
    title,
    text
  };
}
