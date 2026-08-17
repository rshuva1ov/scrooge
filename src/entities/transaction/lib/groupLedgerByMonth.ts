import { formatMonthLabel, getMonthKey } from "@/shared/lib/dates";

import type { TTransaction } from "@/entities/transaction/model/types";

export interface ILedgerMonthGroup {
  key: string;
  label: string;
  items: TTransaction[];
}

export const groupLedgerByMonth = (transactions: TTransaction[]): ILedgerMonthGroup[] => {
  const groups: ILedgerMonthGroup[] = [];

  for (const transaction of transactions) {
    const key = getMonthKey(transaction.date);
    const lastGroup = groups.at(-1);

    if (lastGroup?.key === key) {
      lastGroup.items.push(transaction);
    } else {
      groups.push({
        key,
        label: formatMonthLabel(transaction.date),
        items: [transaction]
      });
    }
  }

  return groups;
};
