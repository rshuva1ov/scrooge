import { createContext, useContext } from "react";

import type { TThemeId } from "@/shared/lib/theme/types";

interface IThemeContextValue {
  theme: TThemeId;
  setTheme: (themeId: TThemeId) => Promise<void>;
}

export const ThemeContext = createContext<IThemeContextValue | null>(null);

export const useTheme = (): IThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};
