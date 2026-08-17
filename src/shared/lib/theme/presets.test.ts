import { describe, expect, it } from "vitest";

import { resolveThemeId } from "./presets";

describe("resolveThemeId", () => {
  it("keeps light and dark", () => {
    expect(resolveThemeId("light")).toBe("light");
    expect(resolveThemeId("dark")).toBe("dark");
  });

  it("maps old color presets to dark", () => {
    expect(resolveThemeId("vault")).toBe("dark");
    expect(resolveThemeId("midnight")).toBe("dark");
    expect(resolveThemeId("copper")).toBe("dark");
    expect(resolveThemeId("amethyst")).toBe("dark");
  });

  it("falls back to dark", () => {
    expect(resolveThemeId(null)).toBe("dark");
    expect(resolveThemeId("unknown")).toBe("dark");
  });
});
