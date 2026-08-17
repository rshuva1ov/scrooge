import { describe, expect, it } from "vitest";

import { formatMoney } from "./formatMoney";

describe("formatMoney", () => {
  it("formats rubles without a sign by default", () => {
    expect(formatMoney(1500).replace(/\s/g, " ")).toBe("1 500 ₽");
    expect(formatMoney(-1500).replace(/\s/g, " ")).toBe("1 500 ₽");
  });

  it("adds a sign when requested", () => {
    expect(formatMoney(200, "₽", { signed: true })).toContain("+");
    expect(formatMoney(-200, "₽", { signed: true })).toContain("−");
    expect(formatMoney(0, "₽", { signed: true }).replace(/\s/g, " ")).toBe("0 ₽");
  });
});
