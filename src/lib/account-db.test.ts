import { test } from "node:test";
import assert from "node:assert";
import { getAccountsByHouseholdId } from "./account-db";

test("getAccountsByHouseholdId should return all accounts associated with the householdId", async () => {
  const mockAccounts = [
    {
      id: "acc-1",
      userId: "user-1",
      householdId: "household-123",
      type: "giro" as const,
      name: "Hauptkonto",
      institution: "Sparkasse",
      currentValue: "1500.00",
      investedCapital: null,
      initialDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "acc-2",
      userId: "user-1",
      householdId: "household-123",
      type: "cash" as const,
      name: "Bargeld",
      institution: null,
      currentValue: "200.00",
      investedCapital: null,
      initialDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const deps = {
    dbSelect: async (hid: string) => {
      if (hid === "household-123") {
        return mockAccounts;
      }
      return [];
    },
  };

  const result = await getAccountsByHouseholdId("household-123", deps);
  assert.deepStrictEqual(result, mockAccounts);
});

test("getAccountsByHouseholdId should return an empty array if no accounts exist for the householdId", async () => {
  const deps = {
    dbSelect: async () => {
      return [];
    },
  };

  const result = await getAccountsByHouseholdId("non-existent-household", deps);
  assert.deepStrictEqual(result, []);
});


