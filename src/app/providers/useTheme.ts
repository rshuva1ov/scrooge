import { createContext, useContext } from "react";

import type { TThemePresetId } from "@/shared/lib/theme/types";

interface IThemeContextValue {
  themePreset: TThemePresetId;
  setThemePreset: (presetId: TThemePresetId) => Promise<void>;
  isLoading: boolean;
}

export const ThemeContext = createContext<IThemeContextValue | null>(null);

export const useTheme = (): IThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};
