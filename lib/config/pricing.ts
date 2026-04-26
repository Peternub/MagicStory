export type MagicPlanTone = "starter" | "family" | "premium";
export type MagicPlanFormat = "stories" | "audio";
export type MagicPlanModel = "plus" | "premium";

export type MagicPlan = {
  code: string;
  name: string;
  stories: number;
  storiesPrice: number;
  audioPrice: number;
  subtitle: string;
  tone: MagicPlanTone;
  highlight?: boolean;
};

export const planFormats: Array<{
  code: MagicPlanFormat;
  label: string;
}> = [
  {
    code: "stories",
    label: "Сказки"
  },
  {
    code: "audio",
    label: "Сказки с озвучкой"
  }
];

export const planModels: Array<{
  code: MagicPlanModel;
  label: string;
  priceExtra: number;
}> = [
  {
    code: "plus",
    label: 'Модель "Plus"',
    priceExtra: 0
  },
  {
    code: "premium",
    label: 'Модель "Premium"',
    priceExtra: 50
  }
];

export const magicPlans: MagicPlan[] = [
  {
    code: "stories-10",
    name: "10 сказок",
    stories: 10,
    storiesPrice: 149,
    audioPrice: 249,
    subtitle: "Спокойный старт",
    tone: "starter"
  },
  {
    code: "stories-20",
    name: "20 сказок",
    stories: 20,
    storiesPrice: 249,
    audioPrice: 449,
    subtitle: "Семейный запас",
    tone: "family",
    highlight: true
  },
  {
    code: "stories-30",
    name: "30 сказок",
    stories: 30,
    storiesPrice: 299,
    audioPrice: 549,
    subtitle: "Большой набор",
    tone: "premium"
  }
];

export function getPlanPrice(
  plan: MagicPlan,
  format: MagicPlanFormat,
  model: MagicPlanModel
) {
  const modelConfig = planModels.find((item) => item.code === model) ?? planModels[0];
  const basePrice = format === "audio" ? plan.audioPrice : plan.storiesPrice;

  return basePrice + modelConfig.priceExtra;
}

export function getPlanIncludedLabel(
  plan: MagicPlan,
  format: MagicPlanFormat,
  model: MagicPlanModel
) {
  const modelLabel = model === "premium" ? "премиум" : "обычных";
  const ending = format === "audio" ? " с озвучкой" : "";

  return `${plan.stories} ${modelLabel} сказок${ending}`;
}
