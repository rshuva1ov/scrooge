import { beforeEach, describe, expect, it } from "vitest";

import { getDb } from "@/shared/db";
import { resetVaultStorage } from "@/test/indexedDb";

import { applyTheme, initTheme, readCachedTheme } from "./applyTheme";
import { THEME_SETTING_KEY, THEME_STORAGE_KEY } from "./presets";
import { getTheme, setTheme } from "./themeRepo";

const themeColorMeta = () => {
  let meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "theme-color");
    document.head.appendChild(meta);
  }
  return meta;
};

describe("theme", () => {
  beforeEach(async () => {
    await resetVaultStorage();
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.style.colorScheme = "";
    themeColorMeta().setAttribute("content", "");
  });

  it("applies dataset, color-scheme and theme-color", () => {
    applyTheme("light");

    expect(document.documentElement.dataset.theme).toBe("light");
    expect(document.documentElement.style.colorScheme).toBe("light");
    expect(themeColorMeta().getAttribute("content")).toBe("#f3efe6");
  });

  it("reads a cached theme and maps legacy presets", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "vault");
    expect(readCachedTheme()).toBe("dark");

    initTheme();
    expect(document.documentElement.dataset.theme).toBe("dark");
  });

  it("persists a theme to IndexedDB and localStorage", async () => {
    await setTheme("light");

    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(await getTheme()).toBe("light");
  });

  it("falls back to IndexedDB when the cache is empty", async () => {
    await setTheme("light");
    localStorage.removeItem(THEME_STORAGE_KEY);

    expect(await getTheme()).toBe("light");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
  });

  it("stores the setting under the theme key", async () => {
    await setTheme("light");
    const db = await getDb();
    const setting = await db.get("settings", THEME_SETTING_KEY);

    expect(setting?.value).toBe("light");
  });
});
