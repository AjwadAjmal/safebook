import { test } from "node:test";
import assert from "node:assert";
import { getHouseholdById } from "./household-utils";

test("getHouseholdById should return the household object if it exists", async () => {
  const mockHousehold = {
    id: "household-123",
    name: "Schmidt Familie",
    inviteCode: "ABC-123",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const deps = {
    dbSelect: async (hid: string) => {
      if (hid === "household-123") {
        return [mockHousehold];
      }
      return [];
    },
  };

  const result = await getHouseholdById("household-123", deps);
  assert.deepStrictEqual(result, mockHousehold);
});

test("getHouseholdById should return null if the household does not exist", async () => {
  const deps = {
    dbSelect: async () => {
      return [];
    },
  };

  const result = await getHouseholdById("non-existent-id", deps);
  assert.strictEqual(result, null);
});


