import { getDb } from "@/shared/db";

import { applyTheme } from "./applyTheme";
import { DEFAULT_THEME_PRESET, isThemePresetId, THEME_SETTING_KEY, THEME_STORAGE_KEY } from "./presets";
import type { TThemePresetId } from "./types";

export const getThemePreset = async (): Promise<TThemePresetId> => {
  const cached = localStorage.getItem(THEME_STORAGE_KEY);
  if (isThemePresetId(cached)) {
    return cached;
  }

  const db = await getDb();
  const setting = await db.get("settings", THEME_SETTING_KEY);

  if (isThemePresetId(setting?.value)) {
    localStorage.setItem(THEME_STORAGE_KEY, setting.value);
    return setting.value;
  }

  return DEFAULT_THEME_PRESET;
};

export const setThemePreset = async (presetId: TThemePresetId): Promise<void> => {
  const db = await getDb();
  await db.put("settings", { key: THEME_SETTING_KEY, value: presetId });
  localStorage.setItem(THEME_STORAGE_KEY, presetId);
  applyTheme(presetId);
};
