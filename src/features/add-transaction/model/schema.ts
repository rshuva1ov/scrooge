import { z } from "zod";

export const transactionSchema = z.object({
  amount: z.coerce.number().positive("Сумма должна быть больше 0"),
  type: z.enum(["income", "expense"]),
  categoryId: z.string().min(1, "Выберите категорию"),
  note: z.string().max(200).optional(),
  date: z.string().min(1, "Укажите дату")
});

export type TTransactionFormValues = z.infer<typeof transactionSchema>;
