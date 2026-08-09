import { db } from "@/db";
import { accounts, transactions } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import {
  calculateNewBalance,
  calculateBalanceRollback,
  calculateBalanceAdjustmentOnEdit,
} from "./transaction-utils";

export interface CreateTransactionInput {
  type: "expense" | "income";
  amount: string;
  description?: string | null;
  date: Date;
  accountId: string;
  userId: string;
  householdId: string;
  categoryId: string;
}

export interface UpdateTransactionInput {
  type?: "expense" | "income";
  amount?: string;
  description?: string | null;
  date?: Date;
  categoryId?: string;
  accountId?: string;
}

/**
 * Server-only database operations for transactions with atomic balance updates.
 */

export async function createTransactionWithBalanceUpdate(
  data: CreateTransactionInput,
  _deps = {
    getAccount: async (accId: string, hid: string) => {
      const [account] = await db
        .select()
        .from(accounts)
        .where(and(eq(accounts.id, accId), eq(accounts.householdId, hid)))
        .limit(1);
      return account || null;
    },
    insertTransaction: async (txData: CreateTransactionInput) => {
      const [inserted] = await db
        .insert(transactions)
        .values({
          type: txData.type,
          amount: txData.amount,
          description: txData.description ?? null,
          date: txData.date,
          accountId: txData.accountId,
          userId: txData.userId,
          householdId: txData.householdId,
          categoryId: txData.categoryId,
        })
        .returning();
      return inserted;
    },
    updateAccountValue: async (accId: string, newValue: string) => {
      await db
        .update(accounts)
        .set({ currentValue: newValue, updatedAt: new Date() })
        .where(eq(accounts.id, accId));
    },
  }
) {
  const account = await _deps.getAccount(data.accountId, data.householdId);
  if (!account) {
    throw new Error("Account not found or access denied");
  }

  const newBalance = calculateNewBalance(account.currentValue, data.amount, data.type);

  const insertedTx = await _deps.insertTransaction(data);
  await _deps.updateAccountValue(data.accountId, newBalance);

  return insertedTx;
}

export async function deleteTransactionWithBalanceRollback(
  transactionId: string,
  householdId: string,
  _deps = {
    getTransaction: async (txId: string, hid: string) => {
      const [tx] = await db
        .select()
        .from(transactions)
        .where(and(eq(transactions.id, txId), eq(transactions.householdId, hid)))
        .limit(1);
      return tx || null;
    },
    getAccount: async (accId: string, hid: string) => {
      const [account] = await db
        .select()
        .from(accounts)
        .where(and(eq(accounts.id, accId), eq(accounts.householdId, hid)))
        .limit(1);
      return account || null;
    },
    deleteTransaction: async (txId: string) => {
      await db.delete(transactions).where(eq(transactions.id, txId));
    },
    updateAccountValue: async (accId: string, newValue: string) => {
      await db
        .update(accounts)
        .set({ currentValue: newValue, updatedAt: new Date() })
        .where(eq(accounts.id, accId));
    },
  }
) {
  const tx = await _deps.getTransaction(transactionId, householdId);
  if (!tx) {
    throw new Error("Transaction not found or access denied");
  }

  const account = await _deps.getAccount(tx.accountId, householdId);
  if (!account) {
    throw new Error("Account not found or access denied");
  }

  const newBalance = calculateBalanceRollback(account.currentValue, tx.amount, tx.type);

  await _deps.deleteTransaction(transactionId);
  await _deps.updateAccountValue(tx.accountId, newBalance);
}

export async function updateTransactionWithBalanceAdjustment(
  transactionId: string,
  householdId: string,
  data: UpdateTransactionInput,
  _deps = {
    getTransaction: async (txId: string, hid: string) => {
      const [tx] = await db
        .select()
        .from(transactions)
        .where(and(eq(transactions.id, txId), eq(transactions.householdId, hid)))
        .limit(1);
      return tx || null;
    },
    getAccount: async (accId: string, hid: string) => {
      const [account] = await db
        .select()
        .from(accounts)
        .where(and(eq(accounts.id, accId), eq(accounts.householdId, hid)))
        .limit(1);
      return account || null;
    },
    updateTransaction: async (txId: string, updateData: UpdateTransactionInput) => {
      const [updated] = await db
        .update(transactions)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(transactions.id, txId))
        .returning();
      return updated;
    },
    updateAccountValue: async (accId: string, newValue: string) => {
      await db
        .update(accounts)
        .set({ currentValue: newValue, updatedAt: new Date() })
        .where(eq(accounts.id, accId));
    },
  }
) {
  const oldTx = await _deps.getTransaction(transactionId, householdId);
  if (!oldTx) {
    throw new Error("Transaction not found or access denied");
  }

  const account = await _deps.getAccount(oldTx.accountId, householdId);
  if (!account) {
    throw new Error("Account not found or access denied");
  }

  const newTxType = data.type ?? oldTx.type;
  const newTxAmount = data.amount ?? oldTx.amount;

  const newBalance = calculateBalanceAdjustmentOnEdit(
    account.currentValue,
    { amount: oldTx.amount, type: oldTx.type },
    { amount: newTxAmount, type: newTxType }
  );

  const updatedTx = await _deps.updateTransaction(transactionId, data);
  await _deps.updateAccountValue(oldTx.accountId, newBalance);

  return updatedTx;
}

export async function getTransactionsByHouseholdId(
  householdId: string,
  limit: number = 20,
  _deps = {
    dbSelect: async (hid: string, lim: number) => {
      return await db
        .select()
        .from(transactions)
        .where(eq(transactions.householdId, hid))
        .orderBy(desc(transactions.date))
        .limit(lim);
    },
  }
) {
  return await _deps.dbSelect(householdId, limit);
}
