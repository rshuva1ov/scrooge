import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import cn from "classnames";
import { BarChart3, FolderOpen, Settings, Wallet } from "lucide-react";

import { springSnappy } from "@/shared/lib/motion/presets";

import styles from "./index.module.scss";

const NAV_ITEMS = [
  { to: "/", label: "Журнал", icon: Wallet, exact: true },
  { to: "/categories", label: "Категории", icon: FolderOpen, exact: false },
  { to: "/reports", label: "Отчёты", icon: BarChart3, exact: false },
  { to: "/settings", label: "Настройки", icon: Settings, exact: false }
] as const;

export const BottomNav = () => {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <nav className={styles.nav}>
      {NAV_ITEMS.map(({ to, label, icon: Icon, exact }) => {
        const isActive = exact ? pathname === to : pathname.startsWith(to);

        return (
          <Link
            className={cn(styles.link, isActive && styles.linkActive)}
            key={to}
            to={to}
          >
            {isActive && (
              <motion.span
                className={styles.activePill}
                layoutId="bottom-nav-active"
                transition={springSnappy}
              />
            )}
            <span className={styles.icon}>
              <Icon size={20} strokeWidth={1.75} />
            </span>
            <span className={styles.label}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
