import { test } from "node:test";
import assert from "node:assert";
import {
  createTransactionAction,
  createCustomCategoryAction,
  deleteTransactionAction,
  updateTransactionAction,
} from "./transaction";



test("createTransactionAction should return error if user is not authenticated", async () => {
  const result = await createTransactionAction(
    {
      type: "expense",
      amount: "15.50",
      accountId: "acc-1",
      categoryId: "cat-1",
      date: "2026-08-09",
      description: "Supermarkt",
    },
    {
      getCurrentUser: async () => null,
      createTx: async () => ({ id: "tx-1" }),
    }
  );

  assert.ok(result?.error);
  assert.ok(result.error.includes("Nicht autorisiert"));
});

test("createTransactionAction should return error if validation fails (e.g. invalid amount)", async () => {
  const result = await createTransactionAction(
    {
      type: "expense",
      amount: "-10",
      accountId: "acc-1",
      categoryId: "cat-1",
      date: "2026-08-09",
      description: "",
    },
    {
      getCurrentUser: async () => ({ id: "user-1", householdId: "hh-1" }),
      createTx: async () => ({ id: "tx-1" }),
    }
  );

  assert.ok(result?.error);
  assert.ok(result.error.includes("Betrag muss größer als 0 sein"));
});

test("createTransactionAction should invoke createTransactionWithBalanceUpdate and redirect on valid input", async () => {
  let createdData: Record<string, unknown> | null = null;
  const deps = {
    getCurrentUser: async () => ({ id: "user-123", householdId: "hh-456" }),
    createTx: async (data: Record<string, unknown>) => {
      createdData = data;
      return { id: "tx-789" };
    },
  };

  try {
    await createTransactionAction(
      {
        type: "expense" as const,
        amount: "45,50",
        accountId: "acc-123",
        categoryId: "cat-456",
        date: "2026-08-09",
        description: "Einkauf",
      },
      deps
    );
    assert.fail("Should have redirected");
  } catch (e: unknown) {
    const error = e as { digest?: string };
    if (error.digest?.startsWith("NEXT_REDIRECT")) {
      assert.ok(createdData);
      assert.strictEqual(createdData.type, "expense");
      assert.strictEqual(createdData.amount, "45.5");
      assert.strictEqual(createdData.accountId, "acc-123");
      assert.strictEqual(createdData.categoryId, "cat-456");
      assert.strictEqual(createdData.userId, "user-123");
      assert.strictEqual(createdData.householdId, "hh-456");
    } else {
      throw e;
    }
  }
});

test("createCustomCategoryAction should return error if unauthenticated", async () => {
  const result = await createCustomCategoryAction(
    { name: "Hobbies" },
    {
      getCurrentUser: async () => null,
      createCategory: async () => ({ id: "cat-2", name: "Hobbies" }),
    }
  );

  assert.ok(result?.error);
  assert.ok(result.error.includes("Nicht autorisiert"));
});

test("createCustomCategoryAction should return error if category name is too short", async () => {
  const result = await createCustomCategoryAction(
    { name: "A" },
    {
      getCurrentUser: async () => ({ id: "user-1", householdId: "hh-1" }),
      createCategory: async () => ({ id: "cat-2", name: "A" }),
    }
  );

  assert.ok(result?.error);
  assert.ok(result.error.includes("mindestens 2 Zeichen"));
});

test("createCustomCategoryAction should create custom category and return created category", async () => {
  let categoryInput: { name: string; householdId: string } | null = null;
  const result = await createCustomCategoryAction(
    { name: "Geschenke", icon: "gift" },
    {
      getCurrentUser: async () => ({ id: "user-1", householdId: "hh-1" }),
      createCategory: async (data: { name: string; householdId: string; icon?: string }) => {
        categoryInput = data;
        return { id: "cat-new", name: data.name, householdId: data.householdId, icon: data.icon || "tag" };
      },
    }
  );

  assert.ok("category" in result);
  assert.strictEqual(result.category.name, "Geschenke");
  assert.strictEqual(categoryInput?.householdId, "hh-1");
});

test("deleteTransactionAction should return error if unauthenticated", async () => {
  const result = await deleteTransactionAction(
    "tx-1",
    {
      getCurrentUser: async () => null,
      deleteTx: async () => {},
    }
  );

  assert.ok(result?.error);
  assert.ok(result.error.includes("Nicht autorisiert"));
});

test("deleteTransactionAction should invoke deleteTransactionWithBalanceRollback on valid auth", async () => {
  let deletedInfo: { txId: string; hid: string } | null = null;
  const result = await deleteTransactionAction(
    "tx-100",
    {
      getCurrentUser: async () => ({ id: "user-1", householdId: "hh-1" }),
      deleteTx: async (txId: string, hid: string) => {
        deletedInfo = { txId, hid };
      },
    }
  );

  assert.strictEqual(result?.success, true);
  assert.strictEqual(deletedInfo?.txId, "tx-100");
  assert.strictEqual(deletedInfo?.hid, "hh-1");
});

test("updateTransactionAction should return error if unauthenticated", async () => {
  const result = await updateTransactionAction(
    "tx-1",
    { amount: "50.00" },
    {
      getCurrentUser: async () => null,
      updateTx: async () => ({ id: "tx-1" }),
    }
  );

  assert.ok(result?.error);
  assert.ok(result.error.includes("Nicht autorisiert"));
});

test("updateTransactionAction should update transaction and return updated record", async () => {
  let updatedPayload: Record<string, unknown> | null = null;
  const result = await updateTransactionAction(
    "tx-100",
    { amount: "75,50", description: "Neuer Einkauf" },
    {
      getCurrentUser: async () => ({ id: "user-1", householdId: "hh-1" }),
      updateTx: async (txId: string, hid: string, data: Record<string, unknown>) => {
        updatedPayload = data;
        return { id: txId, ...data };
      },
    }
  );

  assert.strictEqual(result?.success, true);
  assert.strictEqual(updatedPayload?.amount, "75.5");
  assert.strictEqual(updatedPayload?.description, "Neuer Einkauf");
});

