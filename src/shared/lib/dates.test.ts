import { describe, expect, it } from "vitest";

import { getMonthKey, getMonthRange, inferPeriodPreset, toInputDate } from "@/shared/lib/dates";

describe("dates", () => {
  it("keeps calendar dates as YYYY-MM-DD", () => {
    expect(toInputDate("2026-07-31")).toBe("2026-07-31");
    expect(toInputDate("2026-07-31T12:00:00.000Z")).toBe("2026-07-31");
    expect(getMonthKey("2026-07-31")).toBe("2026-07");
  });

  it("returns a full calendar month for reports navigation", () => {
    expect(getMonthRange("2026-07")).toEqual({ from: "2026-07-01", to: "2026-07-31" });
    expect(getMonthRange("2026-02")).toEqual({ from: "2026-02-01", to: "2026-02-28" });
  });

  it("infers custom month navigation as the all preset", () => {
    expect(inferPeriodPreset({ from: "2026-07-01", to: "2026-07-31" })).toBe("all");
    expect(inferPeriodPreset({ from: null, to: null })).toBe("all");
  });
});
