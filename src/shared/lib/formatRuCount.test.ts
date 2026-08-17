import { describe, expect, it } from "vitest";

import { formatRuCount } from "./formatRuCount";
import { zodFieldErrors } from "./zodFieldErrors";

describe("formatRuCount", () => {
  const forms: [string, string, string] = ["операция", "операции", "операций"];

  it("picks the correct Russian plural form", () => {
    expect(formatRuCount(1, forms)).toBe("1 операция");
    expect(formatRuCount(2, forms)).toBe("2 операции");
    expect(formatRuCount(5, forms)).toBe("5 операций");
    expect(formatRuCount(21, forms)).toBe("21 операция");
    expect(formatRuCount(22, forms)).toBe("22 операции");
    expect(formatRuCount(11, forms)).toBe("11 операций");
  });
});

describe("zodFieldErrors", () => {
  it("keeps the first message per field", () => {
    expect(
      zodFieldErrors<"amount" | "date">({
        issues: [
          { path: ["amount"], message: "Сумма должна быть больше 0" },
          { path: ["amount"], message: "ignored" },
          { path: ["date"], message: "Укажите дату" }
        ]
      })
    ).toEqual({
      amount: "Сумма должна быть больше 0",
      date: "Укажите дату"
    });
  });
});
