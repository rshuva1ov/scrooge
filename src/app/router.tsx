import { createRootRoute, createRoute, createRouter } from "@tanstack/react-router";

import { MobileLayout } from "@/app/layouts/mobileLayout";
import { CategoriesPage } from "@/pages/categories";
import { LedgerPage } from "@/pages/ledger";
import { ReportsPage } from "@/pages/reports";
import { SettingsPage } from "@/pages/settings";

const rootRoute = createRootRoute({
  component: MobileLayout
});

const ledgerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LedgerPage
});

const categoriesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/categories",
  component: CategoriesPage
});

const reportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reports",
  component: ReportsPage
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: SettingsPage
});

const routeTree = rootRoute.addChildren([ledgerRoute, categoriesRoute, reportsRoute, settingsRoute]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
