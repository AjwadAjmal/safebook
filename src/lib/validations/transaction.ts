import { z } from "zod";

export function parseDecimalString(val: string | number | undefined | null): string | null {
  if (val === undefined || val === null || val === "") return null;
  if (typeof val === "number") {
    if (isNaN(val)) return null;
    return val.toString();
  }
  const trimmed = val.trim().replace(",", ".");
  const parsed = Number(trimmed);
  if (isNaN(parsed)) return null;
  return parsed.toString();
}

export const createTransactionSchema = z.object({
  type: z.enum(["expense", "income"]),
  amount: z.string().refine((val) => {
    const parsed = parseDecimalString(val);
    return parsed !== null && Number(parsed) > 0;
  }, { message: "Betrag muss größer als 0 sein" }),
  description: z.string().optional().nullable(),
  date: z.string().min(1, "Datum ist erforderlich"),
  accountId: z.string().min(1, "Konto ist erforderlich"),
  categoryId: z.string().min(1, "Kategorie ist erforderlich"),
});

export type CreateTransactionSchemaInput = z.infer<typeof createTransactionSchema>;

export const createCustomCategorySchema = z.object({
  name: z.string().trim().min(2, "Kategoriename muss mindestens 2 Zeichen lang sein"),
  icon: z.string().optional(),
});

export type CreateCustomCategorySchemaInput = z.infer<typeof createCustomCategorySchema>;
