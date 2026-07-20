import cn from "classnames";
import type { ButtonHTMLAttributes, ReactNode } from "react";

import styles from "./index.module.scss";

interface IButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

export const Button = ({
  children,
  className,
  variant = "primary",
  size = "md",
  fullWidth,
  type = "button",
  ...props
}: IButtonProps) => (
  <button
    className={cn(styles.button, styles[variant], styles[size], fullWidth && styles.fullWidth, className)}
    type={type}
    {...props}
  >
    {children}
  </button>
);
