export type Tone = "primary" | "success" | "warning" | "danger" | "info";

export type Metric = {
  label: string;
  value: string;
  helper: string;
  tone: Tone;
  icon?: string;
};

export type ProgressItem = {
  label: string;
  value: string;
  percent: number;
  tone: Tone;
  icon: string;
};

export type DebtAccount = {
  name: string;
  provider: string;
  balance: string;
  limit: string;
  payoff: string;
  payment: string;
  apr: string;
  percent: number;
  tone: Tone;
  icon: string;
  focus?: boolean;
};

export type BudgetCategory = {
  name: string;
  spent: string;
  budgeted: string;
  percent: number;
  tone: Tone;
  icon: string;
  alert?: string;
};

export type SavingsGoal = {
  name: string;
  icon: string;
  saved: string;
  target: string;
  percent: number;
  targetDate: string;
  autoSave: string;
  projection: string;
  tone: Tone;
};

export type LearnItemData = {
  title: string;
  category: string;
  readTime: string;
  xp: number;
  read: boolean;
  icon: string;
  tone: Tone;
};

export const devDashboard = {
  user: {
    name: "Jordan",
    level: 7,
    xp: 1240,
    nextLevelXp: 1600,
    streak: 14,
  },
  overviewMetrics: [
    { label: "Total Debt", value: "€6.910", helper: "↓ €240 this month", tone: "danger", icon: "▤" },
    { label: "Monthly Income", value: "€2.200", helper: "Next payday in 12 days", tone: "success", icon: "$" },
    { label: "Spent This Month", value: "€1.270", helper: "58% of income", tone: "warning", icon: "▥" },
    { label: "Total Saved", value: "€1.610", helper: "Across 3 goals", tone: "primary", icon: "◆" },
  ] satisfies Metric[],
  debtOverview: [
    { label: "Credit Card", value: "€1.840", percent: 61, tone: "danger", icon: "💳" },
    { label: "BNPL - Klarna", value: "€320", percent: 47, tone: "success", icon: "🛍️" },
    { label: "Personal Loan", value: "€4.500", percent: 90, tone: "primary", icon: "🏦" },
    { label: "Overdraft", value: "€250", percent: 54, tone: "warning", icon: "⚠️" },
  ] satisfies ProgressItem[],
  savingsProgress: [
    { label: "Emergency Fund", value: "32%", percent: 32, tone: "success", icon: "🛡️" },
    { label: "New Laptop", value: "71%", percent: 71, tone: "primary", icon: "💻" },
    { label: "Holiday Trip", value: "15%", percent: 15, tone: "danger", icon: "✈️" },
  ] satisfies ProgressItem[],
  recentWins: ["Paid €240 toward debt", "Emergency fund +€80", "14-day streak kept", "Read 3 money tips"],
  debts: [
    { name: "Credit Card", provider: "Revolut", balance: "€1.840", limit: "of €3.000", payoff: "22mo", payment: "€105/mo", apr: "22.9% APR", percent: 61, tone: "danger", icon: "💳", focus: true },
    { name: "Overdraft", provider: "ABN AMRO", balance: "€250", limit: "of €500", payoff: "∞", payment: "€0/mo", apr: "14.9% APR", percent: 50, tone: "warning", icon: "⚠️" },
    { name: "Personal Loan", provider: "ING Bank", balance: "€4.500", limit: "of €5.000", payoff: "35mo", payment: "€150/mo", apr: "9.9% APR", percent: 90, tone: "primary", icon: "🏦" },
    { name: "BNPL - Klarna", provider: "Klarna", balance: "€320", limit: "of €800", payoff: "4mo", payment: "€80/mo", apr: "0% interest", percent: 40, tone: "success", icon: "🛍️" },
  ] satisfies DebtAccount[],
  budgetCategories: [
    { name: "Housing", spent: "€650", budgeted: "€700", percent: 93, tone: "primary", icon: "🏠" },
    { name: "Food & Groceries", spent: "€280", budgeted: "€300", percent: 93, tone: "danger", icon: "🛒" },
    { name: "Transport", spent: "€95", budgeted: "€120", percent: 79, tone: "success", icon: "🚌" },
    { name: "Entertainment", spent: "€140", budgeted: "€100", percent: 100, tone: "danger", icon: "🎮", alert: "Over by €40" },
    { name: "Clothing", spent: "€60", budgeted: "€80", percent: 75, tone: "warning", icon: "👕" },
    { name: "Health", spent: "€45", budgeted: "€60", percent: 75, tone: "info", icon: "💊" },
  ] satisfies BudgetCategory[],
  savingsGoals: [
    { name: "Emergency Fund", icon: "🛡️", saved: "€640", target: "€2.000", percent: 32, targetDate: "Dec 2025", autoSave: "€80/mo auto", projection: "Goal in ~17 months", tone: "success" },
    { name: "New Laptop", icon: "💻", saved: "€850", target: "€1.200", percent: 71, targetDate: "Aug 2025", autoSave: "€120/mo auto", projection: "Goal in ~3 months", tone: "primary" },
    { name: "Holiday Trip", icon: "✈️", saved: "€120", target: "€800", percent: 15, targetDate: "Jul 2026", autoSave: "€30/mo auto", projection: "Goal in ~12 months", tone: "danger" },
  ] satisfies SavingsGoal[],
  learnItems: [
    { title: "Use the Avalanche Method", category: "Debt", readTime: "3 min read", xp: 50, read: true, icon: "⛰️", tone: "primary" },
    { title: "Pay Yourself First", category: "Savings", readTime: "2 min read", xp: 30, read: true, icon: "🌤️", tone: "success" },
    { title: "The 50/30/20 Rule", category: "Budget", readTime: "3 min read", xp: 40, read: true, icon: "📊", tone: "info" },
    { title: "Keep Utilisation Below 30%", category: "Credit", readTime: "2 min read", xp: 35, read: true, icon: "📈", tone: "danger" },
    { title: "BNPL Isn’t Free Money", category: "BNPL", readTime: "3 min read", xp: 45, read: false, icon: "🚨", tone: "warning" },
    { title: "Build Your Emergency Fund First", category: "Savings", readTime: "4 min read", xp: 65, read: false, icon: "🛡️", tone: "success" },
    { title: "Check Your Credit Report Yearly", category: "Credit", readTime: "2 min read", xp: 25, read: false, icon: "🔍", tone: "info" },
    { title: "Snowball vs Avalanche", category: "Debt", readTime: "3 min read", xp: 40, read: false, icon: "☃️", tone: "primary" },
  ] satisfies LearnItemData[],
};

export function getDevelopmentDashboardData() {
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return devDashboard;
}
