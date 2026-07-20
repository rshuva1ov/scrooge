import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import { applyTheme, readCachedTheme } from "@/shared/lib/theme/applyTheme";
import { getThemePreset, setThemePreset as saveThemePreset } from "@/shared/lib/theme/themeRepo";
import type { TThemePresetId } from "@/shared/lib/theme/types";

import { ThemeContext } from "./useTheme";

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [themePreset, setThemePresetState] = useState<TThemePresetId>(readCachedTheme);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    void getThemePreset().then((preset) => {
      if (!active) return;
      setThemePresetState(preset);
      applyTheme(preset);
      setIsLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  const setThemePreset = useCallback(async (presetId: TThemePresetId) => {
    setThemePresetState(presetId);
    applyTheme(presetId);
    await saveThemePreset(presetId);
  }, []);

  const value = useMemo(
    () => ({
      themePreset,
      setThemePreset,
      isLoading
    }),
    [themePreset, setThemePreset, isLoading]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
