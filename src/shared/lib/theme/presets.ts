import type { IThemeOption, TThemeId } from "./types";

export const THEME_SETTING_KEY = "themePreset";
export const THEME_STORAGE_KEY = "scrooge-theme-preset";

export const DEFAULT_THEME: TThemeId = "dark";

export const THEMES: IThemeOption[] = [
  { id: "light", label: "Светлая" },
  { id: "dark", label: "Тёмная" }
];

const LEGACY_DARK_THEMES = new Set(["vault", "midnight", "copper", "amethyst"]);

export const isThemeId = (value: string | null | undefined): value is TThemeId =>
  value === "light" || value === "dark";

export const resolveThemeId = (value: string | null | undefined): TThemeId => {
  if (isThemeId(value)) {
    return value;
  }

  if (value && LEGACY_DARK_THEMES.has(value)) {
    return "dark";
  }

  return DEFAULT_THEME;
};
