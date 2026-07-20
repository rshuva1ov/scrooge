import { DEFAULT_THEME_PRESET, isThemePresetId, THEME_STORAGE_KEY } from "./presets";
import type { TThemePresetId } from "./types";

export const applyTheme = (presetId: TThemePresetId): void => {
  document.documentElement.dataset.theme = presetId;
};

export const readCachedTheme = (): TThemePresetId => {
  const cached = localStorage.getItem(THEME_STORAGE_KEY);
  return isThemePresetId(cached) ? cached : DEFAULT_THEME_PRESET;
};

export const initTheme = (): void => {
  applyTheme(readCachedTheme());
};
