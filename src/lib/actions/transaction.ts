"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import {
  createTransactionSchema,
  createCustomCategorySchema,
  updateTransactionSchema,
  parseDecimalString,
} from "@/lib/validations/transaction";
import {
  createTransactionWithBalanceUpdate,
  deleteTransactionWithBalanceRollback,
  updateTransactionWithBalanceAdjustment,
  CreateTransactionInput,
  UpdateTransactionInput,
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

export type UpdateTransactionFormInput = Partial<CreateTransactionFormInput>;


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

export async function deleteTransactionAction(
  transactionId: string,
  deps = {
    getCurrentUser: async () => {
      const session = await auth();
      return session?.user;
    },
    deleteTx: async (txId: string, hid: string) => {
      await deleteTransactionWithBalanceRollback(txId, hid);
    },
  }
) {
  const user = await deps.getCurrentUser();
  if (!user || !user.id || !user.householdId) {
    return { error: "Nicht autorisiert." };
  }

  try {
    await deps.deleteTx(transactionId, user.householdId);
    try {
      revalidatePath("/");
    } catch {
      // Ignore in test env
    }
    return { success: true };
  } catch (error) {
    console.error("Failed to delete transaction:", error);
    return { error: "Fehler beim Löschen der Transaktion." };
  }
}

export async function updateTransactionAction(
  transactionId: string,
  input: UpdateTransactionFormInput,
  deps = {
    getCurrentUser: async () => {
      const session = await auth();
      return session?.user;
    },
    updateTx: async (txId: string, hid: string, data: UpdateTransactionInput) => {
      return await updateTransactionWithBalanceAdjustment(txId, hid, data);
    },
  }
) {
  const user = await deps.getCurrentUser();
  if (!user || !user.id || !user.householdId) {
    return { error: "Nicht autorisiert." };
  }

  const validationResult = updateTransactionSchema.safeParse(input);
  if (!validationResult.success) {
    return {
      error: validationResult.error.issues[0]?.message || "Ungültige Eingabe.",
    };
  }

  const updatePayload: UpdateTransactionInput = {};
  if (input.type) updatePayload.type = input.type;
  if (input.amount !== undefined && input.amount !== "") {
    const normalizedAmount = parseDecimalString(input.amount);
    if (!normalizedAmount) {
      return { error: "Betrag muss eine gültige Zahl sein." };
    }
    updatePayload.amount = normalizedAmount;
  }
  if (input.description !== undefined) updatePayload.description = input.description;
  if (input.date) updatePayload.date = new Date(input.date);
  if (input.accountId) updatePayload.accountId = input.accountId;
  if (input.categoryId) updatePayload.categoryId = input.categoryId;

  try {
    const updated = await deps.updateTx(transactionId, user.householdId, updatePayload);
    try {
      revalidatePath("/");
    } catch {
      // Ignore in test env
    }
    return { success: true, transaction: updated };
  } catch (error) {
    console.error("Failed to update transaction:", error);
    return { error: "Fehler beim Aktualisieren der Transaktion." };
  }
}

