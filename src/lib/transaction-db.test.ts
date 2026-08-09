import { test } from "node:test";
import assert from "node:assert";
import {
  createTransactionWithBalanceUpdate,
  deleteTransactionWithBalanceRollback,
  updateTransactionWithBalanceAdjustment,
  getTransactionsByHouseholdId,
  getRecentTransactionsWithDetails,
  CreateTransactionInput,
  UpdateTransactionInput,
} from "./transaction-db";

test("createTransactionWithBalanceUpdate should insert transaction and update account balance atomically", async () => {
  let updatedAccountBalance: string | null = null;
  let insertedTxPayload: CreateTransactionInput | null = null;

  const mockAccount = {
    id: "acc-100",
    name: "Girokonto",
    currentValue: "1000.00",
    householdId: "hh-1",
  };

  const deps = {
    getAccount: async (accId: string, hid: string) => {
      if (accId === "acc-100" && hid === "hh-1") return mockAccount;
      return null;
    },
    insertTransaction: async (data: CreateTransactionInput) => {
      insertedTxPayload = data;
      return { id: "tx-1", ...data, createdAt: new Date(), updatedAt: new Date() };
    },
    updateAccountValue: async (accId: string, newValue: string) => {
      updatedAccountBalance = newValue;
    },
  };

  const txData = {
    type: "expense" as const,
    amount: "250.00",
    description: "Einkauf",
    date: new Date("2026-08-09"),
    accountId: "acc-100",
    userId: "user-1",
    householdId: "hh-1",
    categoryId: "cat-1",
  };

  const result = await createTransactionWithBalanceUpdate(txData, deps);

  assert.strictEqual(result.id, "tx-1");
  assert.strictEqual(insertedTxPayload?.amount, "250.00");
  assert.strictEqual(updatedAccountBalance, "750.00");
});

test("createTransactionWithBalanceUpdate should throw error if account not found or wrong household", async () => {
  const deps = {
    getAccount: async () => null,
    insertTransaction: async () => {
      return { id: "tx-mock" };
    },
    updateAccountValue: async () => {},
  };

  const txData = {
    type: "expense" as const,
    amount: "50.00",
    description: "Test",
    date: new Date(),
    accountId: "non-existent",
    userId: "user-1",
    householdId: "hh-1",
    categoryId: "cat-1",
  };

  await assert.rejects(
    async () => {
      await createTransactionWithBalanceUpdate(txData, deps as never);
    },
    { message: "Account not found or access denied" }
  );
});

test("deleteTransactionWithBalanceRollback should delete transaction and revert account balance", async () => {
  let deletedTxId: string | null = null;
  let updatedAccountBalance: string | null = null;

  const mockTx = {
    id: "tx-2",
    type: "expense" as const,
    amount: "100.00",
    accountId: "acc-100",
    householdId: "hh-1",
  };

  const mockAccount = {
    id: "acc-100",
    currentValue: "900.00",
    householdId: "hh-1",
  };

  const deps = {
    getTransaction: async (txId: string, hid: string) => {
      if (txId === "tx-2" && hid === "hh-1") return mockTx;
      return null;
    },
    getAccount: async (accId: string, hid: string) => {
      if (accId === "acc-100" && hid === "hh-1") return mockAccount;
      return null;
    },
    deleteTransaction: async (txId: string) => {
      deletedTxId = txId;
    },
    updateAccountValue: async (accId: string, newValue: string) => {
      updatedAccountBalance = newValue;
    },
  };

  await deleteTransactionWithBalanceRollback("tx-2", "hh-1", deps);

  assert.strictEqual(deletedTxId, "tx-2");
  assert.strictEqual(updatedAccountBalance, "1000.00");
});

test("updateTransactionWithBalanceAdjustment should update tx and adjust balance", async () => {
  let updatedTxData: UpdateTransactionInput | null = null;
  let updatedAccountBalance: string | null = null;

  const mockTx = {
    id: "tx-3",
    type: "expense" as const,
    amount: "50.00",
    accountId: "acc-100",
    householdId: "hh-1",
  };

  const mockAccount = {
    id: "acc-100",
    currentValue: "950.00",
    householdId: "hh-1",
  };

  const deps = {
    getTransaction: async (txId: string, hid: string) => {
      if (txId === "tx-3" && hid === "hh-1") return mockTx;
      return null;
    },
    getAccount: async (accId: string, hid: string) => {
      if (accId === "acc-100" && hid === "hh-1") return mockAccount;
      return null;
    },
    updateTransaction: async (_txId: string, data: UpdateTransactionInput) => {
      updatedTxData = data;
      return { ...mockTx, ...data };
    },
    updateAccountValue: async (accId: string, newValue: string) => {
      updatedAccountBalance = newValue;
    },
  };

  await updateTransactionWithBalanceAdjustment(
    "tx-3",
    "hh-1",
    { amount: "100.00", type: "expense" },
    deps
  );

  assert.strictEqual(updatedTxData?.amount, "100.00");
  assert.strictEqual(updatedAccountBalance, "900.00");
});

test("getTransactionsByHouseholdId should return household transactions", async () => {
  const mockList = [
    { id: "tx-1", amount: "50.00" },
    { id: "tx-2", amount: "100.00" },
  ];

  const deps = {
    dbSelect: async () => {
      return mockList;
    },
  };

  const result = await getTransactionsByHouseholdId("hh-1", 10, deps as never);
  assert.deepStrictEqual(result, mockList);
});

test("getRecentTransactionsWithDetails should return transactions mapped with account and category names", async () => {
  const mockRows = [
    {
      id: "tx-101",
      type: "expense" as const,
      amount: "45.00",
      description: "Supermarkt",
      date: new Date("2026-08-09"),
      accountId: "acc-1",
      accountName: "Girokonto",
      categoryId: "cat-1",
      categoryName: "Lebensmittel",
      categoryIcon: "shopping-cart",
    },
  ];

  const deps = {
    dbSelectRecent: async (hid: string, lim: number) => {
      if (hid === "hh-1" && lim === 5) return mockRows;
      return [];
    },
  };

  const result = await getRecentTransactionsWithDetails("hh-1", 5, deps);
  assert.strictEqual(result.length, 1);
  assert.strictEqual(result[0].accountName, "Girokonto");
  assert.strictEqual(result[0].categoryName, "Lebensmittel");
});


