import type { ReactNode } from "react";

import { DataProvider } from "./providers/dataProvider";

export const AppProviders = ({ children }: { children: ReactNode }) => (
  <DataProvider>{children}</DataProvider>
);
