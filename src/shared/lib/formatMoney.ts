export const formatMoney = (
  amount: number,
  currency = "₽",
  options?: { signed?: boolean }
): string => {
  const abs = Math.abs(amount);
  const formatted = new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(abs);

  if (options?.signed && amount < 0) {
    return `−${formatted} ${currency}`;
  }

  if (options?.signed && amount > 0) {
    return `+${formatted} ${currency}`;
  }

  return `${formatted} ${currency}`;
};
