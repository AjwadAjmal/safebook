import { test } from "node:test";
import assert from "node:assert";
import { createProfileAccounts } from "./account";

test("createProfileAccounts should return error if no accounts provided", async () => {
  const result = await createProfileAccounts([], {
    getCurrentUser: async () => ({ id: "user-1" }),
    saveAccounts: async () => [],
  });

  assert.ok(result?.error);
  assert.ok(result.error.includes("Mindestens ein Konto"));
});

test("createProfileAccounts should return error if validation fails", async () => {
  const result = await createProfileAccounts([
    {
      type: "giro",
      name: "G", // too short
      institution: "Bank",
      currentValue: 100,
      initialDate: new Date().toISOString(),
    }
  ], {
    getCurrentUser: async () => ({ id: "user-1" }),
    saveAccounts: async () => [],
  });

  assert.ok(result?.error);
  assert.ok(result.error.includes("2 Zeichen"));
});

test("createProfileAccounts should save accounts and redirect", async () => {
  let savedData: {
    userId: string;
    type: string;
    investedCapital?: string;
  }[] = [];
  const accountsToSave: {
    type: "giro" | "depot" | "cash";
    name: string;
    institution: string;
    currentValue: number;
    investedCapital?: number;
    initialDate: string;
  }[] = [
    {
      type: "giro",
      name: "Girokonto",
      institution: "Sparkasse",
      currentValue: 1500.50,
      initialDate: new Date().toISOString(),
    },
    {
      type: "depot",
      name: "Aktiendepot",
      institution: "Trade Republic",
      currentValue: 5000,
      investedCapital: 4500,
      initialDate: new Date().toISOString(),
    }
  ];

  const deps = {
    getCurrentUser: async () => ({ id: "user-1" }),
    saveAccounts: async (data: { userId: string; type: string; investedCapital?: string }[]) => {
      savedData = data;
      return data;
    },
  };

  try {
    await createProfileAccounts(accountsToSave, deps);
    assert.fail("Should have redirected");
  } catch (e: unknown) {
    const error = e as { digest?: string };
    if (error.digest?.startsWith("NEXT_REDIRECT")) {
      assert.strictEqual(savedData.length, 2);
      assert.strictEqual(savedData[0].userId, "user-1");
      assert.strictEqual(savedData[0].type, "giro");
      assert.strictEqual(savedData[1].type, "depot");
      assert.strictEqual(savedData[1].investedCapital, "4500");
      assert.ok(error.digest.includes("/onboarding/household"));
    } else {
      throw e;
    }
  }
});
