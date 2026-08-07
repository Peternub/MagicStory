export type MagicPlanTone = "standard" | "premium";
export type MagicPlanModel = "plus" | "premium";

export type MagicPlan = {
  billingPeriod: "month" | "once";
  code: string;
  name: string;
  priceMonthly: number;
  model: MagicPlanModel;
  subtitle: string;
  description: string;
  features: string[];
  tone: MagicPlanTone;
  highlight?: boolean;
};

export const magicPlans: MagicPlan[] = [
  {
    billingPeriod: "once",
    code: "starter-series-3",
    name: "Пробный сериал",
    priceMonthly: 39,
    model: "plus",
    subtitle: "Один раз",
    description: "Один персональный сериал из трёх связанных серий.",
    features: [
      "3 связанные серии",
      "Один профиль ребёнка",
      "Без подписки и продления"
    ],
    tone: "standard"
  },
  {
    billingPeriod: "month",
    code: "unlimited-plus",
    name: "Обычные серии",
    priceMonthly: 555,
    model: "plus",
    subtitle: "Без ограничений",
    description: "Создавайте сколько угодно серий с обычной моделью генерации.",
    features: [
      "Неограниченное количество серий",
      'Модель генерации "Plus"',
      "Все профили детей и сериалы в одном кабинете"
    ],
    tone: "standard"
  },
  {
    billingPeriod: "month",
    code: "unlimited-premium",
    name: "Премиум-серии",
    priceMonthly: 888,
    model: "premium",
    subtitle: "Максимальное качество",
    description: "Создавайте сколько угодно серий с премиальной моделью генерации.",
    features: [
      "Неограниченное количество премиум-серий",
      'Модель генерации "Premium"',
      "Более глубокий сюжет и проработка персонажей"
    ],
    tone: "premium",
    highlight: true
  }
];
