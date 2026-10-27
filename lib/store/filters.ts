"use client";
import { create } from "zustand";
import type { GlobalFilters, DateRange, Environment } from "@/types";
import { subDays } from "date-fns";

const DEFAULT_DATE_RANGE: DateRange = {
  label: "Last 7 days",
  from: subDays(new Date(), 7),
  to: new Date(),
};

interface FiltersState extends GlobalFilters {
  setDateRange: (range: DateRange) => void;
  setEnvironment: (env: Environment) => void;
}

export const useFiltersStore = create<FiltersState>((set) => ({
  dateRange: DEFAULT_DATE_RANGE,
  environment: "production",
  setDateRange: (range) => set({ dateRange: range }),
  setEnvironment: (env) => set({ environment: env }),
}));

// Preset date ranges
export const DATE_RANGE_PRESETS: DateRange[] = [
  { label: "Last 24 hours", from: subDays(new Date(), 1), to: new Date() },
  { label: "Last 7 days", from: subDays(new Date(), 7), to: new Date() },
  { label: "Last 14 days", from: subDays(new Date(), 14), to: new Date() },
  { label: "Last 30 days", from: subDays(new Date(), 30), to: new Date() },
];
