export const events = {
  signupStarted: "signup_started",
  onboardingCompleted: "onboarding_completed",
  planPurchased: "plan_purchased",
  subscriptionStarted: "subscription_started",
  weeklyCheckinCompleted: "weekly_checkin_completed",
  paymentSucceeded: "payment_succeeded",
  paymentFailed: "payment_failed",
  criticalError: "critical_error",
  dashboardViewed: "dashboard_viewed",
  debtUpdated: "debt_updated",
  savingsUpdated: "savings_updated",
  planEngaged: "plan_engaged",
  learningCompleted: "learning_completed",
  upgradeIntentClicked: "upgrade_intent_clicked",
} as const;

export type AnalyticsEventName = (typeof events)[keyof typeof events];
