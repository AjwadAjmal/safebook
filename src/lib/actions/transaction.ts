"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import {
  createTransactionSchema,
  createCustomCategorySchema,
  parseDecimalString,
} from "@/lib/validations/transaction";
import {
  createTransactionWithBalanceUpdate,
  CreateTransactionInput,
} from "@/lib/transaction-db";
import { createCustomCategory } from "@/lib/category-db";

export interface CreateTransactionFormInput {
  type: "expense" | "income";
  amount: string;
  description?: string | null;
  date: string;
  accountId: string;
  categoryId: string;
}

export interface CreateCustomCategoryFormInput {
  name: string;
  icon?: string;
}

export async function createTransactionAction(
  input: CreateTransactionFormInput,
  deps = {
    getCurrentUser: async () => {
      const session = await auth();
      return session?.user;
    },
    createTx: async (txInput: CreateTransactionInput) => {
      return await createTransactionWithBalanceUpdate(txInput);
    },
  }
) {
  const user = await deps.getCurrentUser();
  if (!user || !user.id || !user.householdId) {
    return { error: "Nicht autorisiert." };
  }

  const validationResult = createTransactionSchema.safeParse(input);
  if (!validationResult.success) {
    return {
      error: validationResult.error.issues[0]?.message || "Ungültige Eingabe.",
    };
  }

  const normalizedAmount = parseDecimalString(input.amount);
  if (!normalizedAmount) {
    return { error: "Betrag muss eine gültige Zahl sein." };
  }

  const parsedDate = new Date(input.date);
  if (isNaN(parsedDate.getTime())) {
    return { error: "Ungültiges Datum." };
  }

  try {
    await deps.createTx({
      type: input.type,
      amount: normalizedAmount,
      description: input.description ?? null,
      date: parsedDate,
      accountId: input.accountId,
      userId: user.id,
      householdId: user.householdId,
      categoryId: input.categoryId,
    });
  } catch (error) {
    console.error("Failed to create transaction:", error);
    return { error: "Fehler beim Speichern der Transaktion." };
  }

  try {
    revalidatePath("/");
  } catch {
    // Ignore revalidate errors in non-Next runtime tests
  }

  redirect("/");
}

export async function createCustomCategoryAction(
  input: CreateCustomCategoryFormInput,
  deps = {
    getCurrentUser: async () => {
      const session = await auth();
      return session?.user;
    },
    createCategory: async (catInput: {
      name: string;
      householdId: string;
      icon?: string;
    }) => {
      return await createCustomCategory(catInput);
    },
  }
) {
  const user = await deps.getCurrentUser();
  if (!user || !user.id || !user.householdId) {
    return { error: "Nicht autorisiert." };
  }

  const validationResult = createCustomCategorySchema.safeParse(input);
  if (!validationResult.success) {
    return {
      error: validationResult.error.issues[0]?.message || "Ungültige Eingabe.",
    };
  }

  try {
    const category = await deps.createCategory({
      name: validationResult.data.name,
      householdId: user.householdId,
      icon: validationResult.data.icon,
    });

    try {
      revalidatePath("/transactions/new");
    } catch {
      // Ignore in test environment
    }

    return { category };
  } catch (error) {
    console.error("Failed to create category:", error);
    return { error: "Fehler beim Erstellen der Kategorie." };
  }
}
