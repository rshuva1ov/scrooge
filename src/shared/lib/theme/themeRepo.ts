import { getDb } from "@/shared/db";

import { applyTheme } from "./applyTheme";
import { resolveThemeId, THEME_SETTING_KEY, THEME_STORAGE_KEY } from "./presets";
import type { TThemeId } from "./types";

const readThemeCache = (): string | null => {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY);
  } catch {
    return null;
  }
};

const writeThemeCache = (themeId: TThemeId): void => {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, themeId);
  } catch {
    // localStorage can be unavailable in private mode
  }
};

export const getTheme = async (): Promise<TThemeId> => {
  const cached = readThemeCache();
  if (cached) {
    return resolveThemeId(cached);
  }

  const db = await getDb();
  const setting = await db.get("settings", THEME_SETTING_KEY);
  const themeId = resolveThemeId(setting?.value);
  writeThemeCache(themeId);
  return themeId;
};

export const setTheme = async (themeId: TThemeId): Promise<void> => {
  const db = await getDb();
  await db.put("settings", { key: THEME_SETTING_KEY, value: themeId });
  writeThemeCache(themeId);
  applyTheme(themeId);
};
