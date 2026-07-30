export type MagicPlanTone = "standard" | "premium";
export type MagicPlanModel = "plus" | "premium";

export type MagicPlan = {
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
