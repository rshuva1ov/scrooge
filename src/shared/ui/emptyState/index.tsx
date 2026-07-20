import type { ReactNode } from "react";

import styles from "./index.module.scss";

interface IEmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  children?: ReactNode;
}

export const EmptyState = ({ icon = "🪙", title, description, action, children }: IEmptyStateProps) => (
  <div className={styles.empty}>
    {children ?? <span className={styles.icon}>{icon}</span>}
    <h3 className={styles.title}>{title}</h3>
    {description && <p className={styles.description}>{description}</p>}
    {action}
  </div>
);
