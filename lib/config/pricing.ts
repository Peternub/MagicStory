export type MagicPlan = {
  code: string;
  letter: "M" | "A" | "G" | "I" | "C";
  name: string;
  price: number;
  generations: number;
  minutes: number;
  hasAudio: boolean;
  description: string;
  highlight?: boolean;
};

export const magicPlans: MagicPlan[] = [
  {
    code: "minimal-minimum",
    letter: "M",
    name: "Минимальный минимум",
    price: 299,
    generations: 30,
    minutes: 10,
    hasAudio: false,
    description: "До 30 генераций сказки до 10 минут без озвучки."
  },
  {
    code: "basic-minimum",
    letter: "A",
    name: "Базовый минимум",
    price: 490,
    generations: 15,
    minutes: 10,
    hasAudio: true,
    description: "До 15 генераций сказки до 10 минут с озвучкой.",
    highlight: true
  },
  {
    code: "basic-maximum",
    letter: "G",
    name: "Базовый максимум",
    price: 690,
    generations: 30,
    minutes: 10,
    hasAudio: true,
    description: "До 30 генераций сказки до 10 минут с озвучкой."
  },
  {
    code: "maximum-minimum",
    letter: "I",
    name: "Максимальный минимум",
    price: 999,
    generations: 30,
    minutes: 15,
    hasAudio: true,
    description: "До 30 генераций сказки до 15 минут с озвучкой."
  },
  {
    code: "maximum-maximum",
    letter: "C",
    name: "Максимальный максимум",
    price: 1299,
    generations: 45,
    minutes: 15,
    hasAudio: true,
    description: "До 45 генераций сказки до 15 минут с озвучкой."
  }
];
