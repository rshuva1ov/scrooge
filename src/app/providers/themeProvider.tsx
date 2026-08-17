import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import { applyTheme, readCachedTheme } from "@/shared/lib/theme/applyTheme";
import { getTheme, setTheme as saveTheme } from "@/shared/lib/theme/themeRepo";
import type { TThemeId } from "@/shared/lib/theme/types";

import { ThemeContext } from "./useTheme";

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<TThemeId>(readCachedTheme);

  useEffect(() => {
    let active = true;

    void getTheme().then((nextTheme) => {
      if (!active) return;
      setThemeState(nextTheme);
      applyTheme(nextTheme);
    });

    return () => {
      active = false;
    };
  }, []);

  const setTheme = useCallback(async (themeId: TThemeId) => {
    setThemeState(themeId);
    applyTheme(themeId);
    await saveTheme(themeId);
  }, []);

  const value = useMemo(
    () => ({
      theme,
      setTheme
    }),
    [theme, setTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
