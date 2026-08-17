import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  formatDisplayDate,
  formatMonthLabel,
  formatMonthNavLabel,
  getChartMonthKey,
  getMonthKey,
  getMonthRange,
  getPeriodRange,
  inferPeriodPreset,
  shiftMonthKey,
  toInputDate
} from "@/shared/lib/dates";

describe("dates", () => {
  it("keeps calendar dates as YYYY-MM-DD", () => {
    expect(toInputDate("2026-07-31")).toBe("2026-07-31");
    expect(toInputDate("2026-07-31T12:00:00.000Z")).toBe("2026-07-31");
    expect(getMonthKey("2026-07-31")).toBe("2026-07");
  });

  it("returns a full calendar month for reports navigation", () => {
    expect(getMonthRange("2026-07")).toEqual({ from: "2026-07-01", to: "2026-07-31" });
    expect(getMonthRange("2026-02")).toEqual({ from: "2026-02-01", to: "2026-02-28" });
    expect(getMonthRange("2024-02")).toEqual({ from: "2024-02-01", to: "2024-02-29" });
  });

  it("shifts month keys across year boundaries", () => {
    expect(shiftMonthKey("2026-01", -1)).toBe("2025-12");
    expect(shiftMonthKey("2026-12", 1)).toBe("2027-01");
  });

  it("formats month labels in Russian", () => {
    expect(formatMonthLabel("2026-07-31")).toMatch(/^Июль 2026$/i);
    expect(formatMonthNavLabel("2026-07")).toBe(formatMonthLabel("2026-07-01"));
    expect(formatDisplayDate("2026-07-31")).toMatch(/31/);
  });

  it("uses the filter start date for the chart month", () => {
    expect(getChartMonthKey({ from: "2026-03-15", to: "2026-03-31" })).toBe("2026-03");
  });

  it("infers custom month navigation as the all preset", () => {
    expect(inferPeriodPreset({ from: "2026-07-01", to: "2026-07-31" })).toBe("all");
    expect(inferPeriodPreset({ from: null, to: null })).toBe("all");
  });

  describe("period presets", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-08-17T12:00:00.000Z"));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("builds ranges relative to today", () => {
      expect(getPeriodRange("today")).toEqual({ from: toInputDate(new Date()), to: toInputDate(new Date()) });
      expect(getPeriodRange("all")).toEqual({ from: null, to: null });

      const month = getPeriodRange("month");
      expect(month.from).toMatch(/^\d{4}-\d{2}-01$/);
      expect(month.to).toBe(toInputDate(new Date()));
    });

    it("recognizes the current month preset", () => {
      expect(inferPeriodPreset(getPeriodRange("month"))).toBe("month");
      expect(inferPeriodPreset(getPeriodRange("today"))).toBe("today");
      expect(inferPeriodPreset(getPeriodRange("year"))).toBe("year");
    });

    it("falls back to the current month when the chart has no from date", () => {
      expect(getChartMonthKey({ from: null, to: null })).toBe("2026-08");
    });
  });
});
