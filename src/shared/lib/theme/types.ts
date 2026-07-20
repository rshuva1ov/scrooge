export type TThemePresetId = "vault" | "midnight" | "copper" | "amethyst";

export interface IThemePreset {
  id: TThemePresetId;
  label: string;
  description: string;
  swatch: [string, string, string];
}
