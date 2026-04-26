export type MagicPlanTone = "starter" | "family" | "premium" | "royal";
export type MagicPlanCategory = "stories" | "audio";
export type MagicPlanModel = "plus" | "business";

export type MagicPlan = {
  code: string;
  name: string;
  price: number;
  stories: number;
  voiceovers?: number;
  subtitle: string;
  description: string;
  includedLabel: string;
  category: MagicPlanCategory;
  model: MagicPlanModel;
  tone: MagicPlanTone;
  highlight?: boolean;
};

type MagicPlanBase = Omit<MagicPlan, "code" | "price" | "model"> & {
  code: string;
  basePrice: number;
};

export const tariffTabs: Array<{
  code: MagicPlanCategory;
  label: string;
}> = [
  {
    code: "stories",
    label: "Сказки"
  },
  {
    code: "audio",
    label: "Аудио-сказки"
  }
];

export const tariffModels: Array<{
  code: MagicPlanModel;
  label: string;
  description: string;
  priceExtra: number;
}> = [
  {
    code: "plus",
    label: "Модель плюс",
    description: "Сбалансированная генерация для уютных вечерних историй.",
    priceExtra: 0
  },
  {
    code: "business",
    label: "Модель бизнес",
    description: "Более выразительная подача и премиальная детализация.",
    priceExtra: 50
  }
];

const magicPlanGroups: Record<MagicPlanCategory, MagicPlanBase[]> = {
  stories: [
    {
      code: "stories-10",
      name: "10 сказок",
      basePrice: 149,
      stories: 10,
      subtitle: "Спокойный старт",
      description: "10 обычных сказок для первых персональных вечеров.",
      includedLabel: "10 обычных сказок",
      category: "stories",
      tone: "starter"
    },
    {
      code: "stories-20",
      name: "20 сказок",
      basePrice: 249,
      stories: 20,
      subtitle: "Семейный запас",
      description: "20 обычных сказок для регулярного вечернего ритуала.",
      includedLabel: "20 обычных сказок",
      category: "stories",
      tone: "family",
      highlight: true
    },
    {
      code: "stories-30",
      name: "30 сказок",
      basePrice: 299,
      stories: 30,
      subtitle: "Большой набор",
      description: "30 обычных сказок, когда хочется чаще радовать ребенка.",
      includedLabel: "30 обычных сказок",
      category: "stories",
      tone: "premium"
    }
  ],
  audio: [
    {
      code: "audio-5",
      name: "5 аудио-сказок",
      basePrice: 149,
      stories: 5,
      voiceovers: 5,
      subtitle: "Первые озвучки",
      description: "5 сказок плюс 5 озвучек для мягкого знакомства с аудио.",
      includedLabel: "5 сказок плюс 5 озвучек",
      category: "audio",
      tone: "starter"
    },
    {
      code: "audio-10",
      name: "10 аудио-сказок",
      basePrice: 249,
      stories: 10,
      voiceovers: 10,
      subtitle: "Уютный набор",
      description: "10 сказок плюс 10 озвучек для спокойных вечеров.",
      includedLabel: "10 сказок плюс 10 озвучек",
      category: "audio",
      tone: "family"
    },
    {
      code: "audio-20",
      name: "20 аудио-сказок",
      basePrice: 449,
      stories: 20,
      voiceovers: 20,
      subtitle: "Частый выбор",
      description: "20 сказок плюс 20 озвучек для регулярного прослушивания.",
      includedLabel: "20 сказок плюс 20 озвучек",
      category: "audio",
      tone: "premium",
      highlight: true
    },
    {
      code: "audio-30",
      name: "30 аудио-сказок",
      basePrice: 549,
      stories: 30,
      voiceovers: 30,
      subtitle: "Максимум аудио",
      description: "30 сказок плюс 30 озвучек с самым полным запасом.",
      includedLabel: "30 сказок плюс 30 озвучек",
      category: "audio",
      tone: "royal"
    }
  ]
};

export function getMagicPlans(
  category: MagicPlanCategory = "stories",
  model: MagicPlanModel = "plus"
): MagicPlan[] {
  const modelConfig = tariffModels.find((item) => item.code === model) ?? tariffModels[0];

  return magicPlanGroups[category].map((plan) => ({
    ...plan,
    code: `${plan.code}-${model}`,
    price: plan.basePrice + modelConfig.priceExtra,
    model
  }));
}
