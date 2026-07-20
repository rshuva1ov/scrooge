import cn from "classnames";
import type { HTMLAttributes, ReactNode } from "react";

import styles from "./index.module.scss";

interface ICardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  gap?: "8" | "12" | "16";
  padding?: "12" | "16" | "20";
  border?: "12" | "16";
  fullWidth?: boolean;
}

export const Card = ({
  children,
  className,
  gap = "12",
  padding = "16",
  border = "16",
  fullWidth,
  ...props
}: ICardProps) => (
  <div
    className={cn(
      styles.card,
      styles.default,
      styles[`gap_${gap}`],
      styles[`padding_${padding}`],
      styles[`border_${border}`],
      fullWidth && styles.fullWidth,
      className
    )}
    {...props}
  >
    {children}
  </div>
);
