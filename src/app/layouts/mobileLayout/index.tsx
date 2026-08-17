import { useEffect, useRef } from "react";

import { motion } from "framer-motion";
import { Outlet, useRouterState } from "@tanstack/react-router";
import cn from "classnames";

import { useData } from "@/app/providers/useData";
import { ErrorBoundary } from "@/app/providers/errorBoundary";
import { pageTransition, springSoft } from "@/shared/lib/motion/presets";
import { formatMoney } from "@/shared/lib/formatMoney";
import { Amount } from "@/shared/ui/amount";
import { BottomNav } from "@/shared/ui/bottomNav";
import { ScroogeArt } from "@/shared/ui/scroogeArt";

import styles from "./index.module.scss";

export const MobileLayout = () => {
  const { balance, income, expense, isLoading } = useData();
  const contentRef = useRef<HTMLElement>(null);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const isDebt = balance < 0;

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <ScroogeArt animate={false} className={styles.headerArt} size="sm" variant={isDebt ? "cute" : "classic"} />
        <div className={styles.headerMain}>
          <p className={styles.title}>Scrooge Vault</p>
          {isLoading ? (
            <p className={styles.balance}>...</p>
          ) : (
            <>
              <motion.p
                animate={{ opacity: 1, scale: 1 }}
                className={cn(styles.balance, isDebt && styles.balanceDebt)}
                initial={{ opacity: 0.6, scale: 0.98 }}
                key={balance}
                transition={springSoft}
              >
                {isDebt ? "−" : ""}
                {formatMoney(Math.abs(balance))}
              </motion.p>
              {isDebt && <p className={styles.debtHint}>Баланс в минусе</p>}
              <div className={styles.totals}>
                <div className={styles.total}>
                  <span className={styles.totalLabel}>Доход</span>
                  <Amount signed={income > 0} size="sm" type="income" value={income} />
                </div>
                <div className={styles.total}>
                  <span className={styles.totalLabel}>Расход</span>
                  <Amount signed={expense > 0} size="sm" type="expense" value={expense} />
                </div>
              </div>
            </>
          )}
        </div>
      </header>
      <main className={styles.content} ref={contentRef}>
        <ErrorBoundary>
          <motion.div
            animate={{ opacity: 1 }}
            className={styles.page}
            initial={{ opacity: 0 }}
            key={pathname}
            transition={pageTransition}
          >
            <Outlet />
          </motion.div>
        </ErrorBoundary>
      </main>
      <BottomNav />
    </div>
  );
};
