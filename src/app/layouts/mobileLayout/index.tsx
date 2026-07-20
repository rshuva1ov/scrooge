import { Outlet } from "@tanstack/react-router";
import cn from "classnames";

import { useData } from "@/app/providers/useData";
import { formatMoney } from "@/shared/lib/formatMoney";
import { BottomNav } from "@/shared/ui/bottomNav";
import { DuckMascot } from "@/shared/ui/duckMascot";
import duckStyles from "@/shared/ui/duckMascot/index.module.scss";

import styles from "./index.module.scss";

export const MobileLayout = () => {
  const { balance, isLoading } = useData();
  const isDebt = balance < 0;

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.duckWrap}>
          <DuckMascot
            className={duckStyles.duck}
            pose={isDebt ? "sad" : "wave"}
            size={44}
          />
        </div>
        <div className={styles.headerMain}>
          <div className={styles.titleRow}>
            <p className={styles.title}>Skrudge Vault</p>
          </div>
          {isLoading ? (
            <p className={styles.balance}>...</p>
          ) : (
            <>
              <p className={cn(styles.balance, isDebt && styles.balanceDebt)}>
                {isDebt ? "−" : ""}
                {formatMoney(Math.abs(balance))}
              </p>
              {isDebt && <p className={styles.debtHint}>Баланс в минусе</p>}
            </>
          )}
        </div>
      </header>
      <main className={styles.content}>
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};
