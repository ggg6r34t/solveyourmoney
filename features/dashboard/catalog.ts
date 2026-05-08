export type LessonCatalogItem = {
  slug: string;
  title: string;
  category: "debt" | "savings" | "budget" | "credit" | "bnpl";
  readingMinutes: number;
  xpReward: number;
  behaviorLink: string;
};

export const lessonCatalog: LessonCatalogItem[] = [
  {
    slug: "debt-avalanche-basics",
    title: "Why the avalanche method lowers the drag first",
    category: "debt",
    readingMinutes: 6,
    xpReward: 90,
    behaviorLink: "Helps you choose where extra payments create the most relief.",
  },
  {
    slug: "starter-buffer-before-optimization",
    title: "Build a starter buffer before chasing perfect plans",
    category: "savings",
    readingMinutes: 5,
    xpReward: 80,
    behaviorLink: "Makes setbacks less likely to turn into new debt.",
  },
  {
    slug: "budget-friction-audit",
    title: "Spot the categories that keep stealing your margin",
    category: "budget",
    readingMinutes: 7,
    xpReward: 95,
    behaviorLink: "Turns overspending into one concrete category change.",
  },
  {
    slug: "credit-utilization-calm",
    title: "Use credit utilization as a signal, not a shame spiral",
    category: "credit",
    readingMinutes: 4,
    xpReward: 70,
    behaviorLink: "Helps you protect borrowing power while paying debt down.",
  },
  {
    slug: "bnpl-hidden-monthly-load",
    title: "How BNPL quietly crowds out next month",
    category: "bnpl",
    readingMinutes: 5,
    xpReward: 75,
    behaviorLink: "Connects split payments back to your real monthly breathing room.",
  },
  {
    slug: "goal-contributions-that-stick",
    title: "Set savings transfers your real life can actually sustain",
    category: "savings",
    readingMinutes: 6,
    xpReward: 85,
    behaviorLink: "Keeps progress motivational instead of fragile.",
  },
];
