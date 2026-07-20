import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import type { ReactNode } from "react";

import { DataProvider } from "./providers/dataProvider";
import { ThemeProvider } from "./providers/themeProvider";
import { ToastProvider } from "./providers/toastProvider";

export const AppProviders = ({ children }: { children: ReactNode }) => (
  <ThemeProvider>
    <DataProvider>
      <ToastProvider>
        {children}
        <Analytics />
        <SpeedInsights />
      </ToastProvider>
    </DataProvider>
  </ThemeProvider>
);
