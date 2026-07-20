import cn from "classnames";

import { formatMoney } from "@/shared/lib/formatMoney";

import styles from "./index.module.scss";

interface IAmountProps {
  value: number;
  type?: "income" | "expense" | "neutral" | "debt";
  size?: "sm" | "md" | "lg" | "xl";
  signed?: boolean;
  allowNegative?: boolean;
  className?: string;
}

const resolveType = (
  value: number,
  type: IAmountProps["type"],
  allowNegative: boolean
): NonNullable<IAmountProps["type"]> => {
  if (allowNegative && value < 0) {
    return "debt";
  }
  return type ?? "neutral";
};

export const Amount = ({
  value,
  type = "neutral",
  size = "md",
  signed = false,
  allowNegative = false,
  className
}: IAmountProps) => {
  const resolvedType = resolveType(value, type, allowNegative);
  const displayValue = allowNegative || signed ? value : Math.abs(value);

  let prefix = "";
  if (signed) {
    if (value > 0) prefix = "+";
    if (value < 0) prefix = "−";
  } else if (allowNegative && value < 0) {
    prefix = "−";
  }

  const formatted = formatMoney(Math.abs(displayValue));

  return (
    <span className={cn(styles.amount, styles[resolvedType], styles[size], className)}>
      {prefix}
      {formatted}
    </span>
  );
};
