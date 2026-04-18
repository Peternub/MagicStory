export type MagicPlanTone = "starter" | "family" | "premium";

export type MagicPlan = {
  code: string;
  name: string;
  price: number;
  stories: number;
  subtitle: string;
  description: string;
  tone: MagicPlanTone;
  highlight?: boolean;
};

export const magicPlans: MagicPlan[] = [
  {
    code: "starter-10",
    name: "10 сказок",
    price: 299,
    stories: 10,
    subtitle: "Для спокойного старта",
    description: "Небольшой пакет для первых уютных вечеров.",
    tone: "starter"
  },
  {
    code: "family-30",
    name: "30 сказок",
    price: 399,
    stories: 30,
    subtitle: "Лучший выбор для семьи",
    description: "Оптимальный запас историй на частые вечерние ритуалы.",
    tone: "family",
    highlight: true
  },
  {
    code: "premium-40",
    name: "40 сказок",
    price: 449,
    stories: 40,
    subtitle: "Максимум историй под рукой",
    description: "Когда хочется чаще радовать ребенка новыми историями.",
    tone: "premium"
  }
];
