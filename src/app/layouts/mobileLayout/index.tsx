import { AnimatePresence, motion } from "framer-motion";
import { Outlet, useRouterState } from "@tanstack/react-router";
import cn from "classnames";

import { useData } from "@/app/providers/useData";
import { pageTransition, pageVariants, springSoft } from "@/shared/lib/motion/presets";
import { formatMoney } from "@/shared/lib/formatMoney";
import { BottomNav } from "@/shared/ui/bottomNav";
import { ScroogeArt } from "@/shared/ui/scroogeArt";

import styles from "./index.module.scss";

export const MobileLayout = () => {
  const { balance, isLoading } = useData();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const isDebt = balance < 0;

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
            </>
          )}
        </div>
      </header>
      <main className={styles.content}>
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            animate="animate"
            className={styles.page}
            exit="exit"
            initial="initial"
            key={pathname}
            transition={pageTransition}
            variants={pageVariants}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <BottomNav />
    </div>
  );
};
