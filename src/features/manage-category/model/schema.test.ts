import { describe, expect, it } from "vitest";

import { categorySchema } from "./schema";

describe("categorySchema", () => {
  const valid = {
    name: "Еда",
    type: "expense" as const,
    color: "#8b4513",
    icon: "🍽️"
  };

  it("accepts a valid category", () => {
    expect(categorySchema.safeParse(valid).success).toBe(true);
  });

  it("trims the name and rejects a blank one", () => {
    const trimmed = categorySchema.safeParse({ ...valid, name: "  Кофе  " });
    const blank = categorySchema.safeParse({ ...valid, name: "   " });

    expect(trimmed.success).toBe(true);
    if (trimmed.success) {
      expect(trimmed.data.name).toBe("Кофе");
    }
    expect(blank.success).toBe(false);
  });

  it("rejects a name longer than 40 characters", () => {
    expect(categorySchema.safeParse({ ...valid, name: "к".repeat(41) }).success).toBe(false);
  });
});
