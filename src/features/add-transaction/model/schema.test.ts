import { describe, expect, it } from "vitest";

import { transactionSchema } from "./schema";

describe("transactionSchema", () => {
  const valid = {
    amount: 1500,
    type: "expense" as const,
    categoryId: "exp-food",
    note: "Продукты",
    date: "2026-08-17"
  };

  it("accepts a valid operation", () => {
    expect(transactionSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects a zero or negative amount", () => {
    expect(transactionSchema.safeParse({ ...valid, amount: 0 }).success).toBe(false);
    expect(transactionSchema.safeParse({ ...valid, amount: -10 }).success).toBe(false);
  });

  it("requires a category and a date", () => {
    const withoutCategory = transactionSchema.safeParse({ ...valid, categoryId: "" });
    const withoutDate = transactionSchema.safeParse({ ...valid, date: "" });

    expect(withoutCategory.success).toBe(false);
    expect(withoutDate.success).toBe(false);
    if (!withoutCategory.success) {
      expect(withoutCategory.error.issues[0]?.message).toBe("Выберите категорию");
    }
    if (!withoutDate.success) {
      expect(withoutDate.error.issues[0]?.message).toBe("Укажите дату");
    }
  });

  it("coerces numeric strings to amount", () => {
    const parsed = transactionSchema.safeParse({ ...valid, amount: "99.5" });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.amount).toBe(99.5);
    }
  });
});
