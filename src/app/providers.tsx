import type { ReactNode } from "react";

import { DataProvider } from "./providers/dataProvider";
import { ThemeProvider } from "./providers/themeProvider";
import { ToastProvider } from "./providers/toastProvider";

export const AppProviders = ({ children }: { children: ReactNode }) => (
  <ThemeProvider>
    <DataProvider>
      <ToastProvider>{children}</ToastProvider>
    </DataProvider>
  </ThemeProvider>
);
