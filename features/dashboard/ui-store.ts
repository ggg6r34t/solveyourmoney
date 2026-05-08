"use client";

import { create } from "zustand";

type DashboardUIState = {
  debtExtraPayment: number;
  selectedTrendRange: "6m" | "12m";
  isMobileNavOpen: boolean;
  dismissedCoachCue: boolean;
  setDebtExtraPayment: (value: number) => void;
  setSelectedTrendRange: (value: "6m" | "12m") => void;
  setMobileNavOpen: (value: boolean) => void;
  setDismissedCoachCue: (value: boolean) => void;
};

export const useDashboardUIStore = create<DashboardUIState>((set) => ({
  debtExtraPayment: 0,
  selectedTrendRange: "6m",
  isMobileNavOpen: false,
  dismissedCoachCue: false,
  setDebtExtraPayment: (value) => set({ debtExtraPayment: value }),
  setSelectedTrendRange: (value) => set({ selectedTrendRange: value }),
  setMobileNavOpen: (value) => set({ isMobileNavOpen: value }),
  setDismissedCoachCue: (value) => set({ dismissedCoachCue: value }),
}));
