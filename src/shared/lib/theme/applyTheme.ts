import { DEFAULT_THEME, resolveThemeId, THEME_STORAGE_KEY } from "./presets";
import type { TThemeId } from "./types";

const THEME_COLOR: Record<TThemeId, string> = {
  dark: "#141c2c",
  light: "#f3efe6"
};

export const applyTheme = (themeId: TThemeId): void => {
  const root = document.documentElement;
  root.dataset.theme = themeId;
  root.style.colorScheme = themeId;

  const meta = document.querySelector('meta[name="theme-color"]');
  meta?.setAttribute("content", THEME_COLOR[themeId]);
};

export const readCachedTheme = (): TThemeId => {
  try {
    return resolveThemeId(localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    return DEFAULT_THEME;
  }
};

export const initTheme = (): void => {
  applyTheme(readCachedTheme());
};
