import type { IThemePreset, TThemePresetId } from "./types";

export const THEME_SETTING_KEY = "themePreset";
export const THEME_STORAGE_KEY = "scrooge-theme-preset";

export const DEFAULT_THEME_PRESET: TThemePresetId = "vault";

export const THEME_PRESETS: IThemePreset[] = [
  {
    id: "vault",
    label: "Сейф",
    description: "Тёмно-зелёный с золотым — классика Scrooge",
    swatch: ["#101915", "#e6c04a", "#5fd68a"]
  },
  {
    id: "midnight",
    label: "Полночь",
    description: "Глубокий синий с холодным серебром",
    swatch: ["#0d1424", "#9eb4d8", "#6eb5ff"]
  },
  {
    id: "copper",
    label: "Медь",
    description: "Тёплый коричневый с медным акцентом",
    swatch: ["#1a1410", "#d4924a", "#7ecf8e"]
  },
  {
    id: "amethyst",
    label: "Аметист",
    description: "Фиолетовый с золотым свечением",
    swatch: ["#16101f", "#c9a0ff", "#6ee7b7"]
  }
];

export const isThemePresetId = (value: string | null | undefined): value is TThemePresetId =>
  THEME_PRESETS.some((preset) => preset.id === value);
