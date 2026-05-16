import { test } from "node:test";
import assert from "node:assert";
import { getUnlinkedAccounts, linkAccountsToHousehold } from "./account-utils";

test("getUnlinkedAccounts should return accounts with householdId is null for a given userId", async () => {
  const mockAccounts = [
    { id: "1", name: "Account 1", householdId: null },
    { id: "2", name: "Account 2", householdId: null },
  ];

  const mockDbSelect = async (userId: string) => {
    return mockAccounts;
  };

  const result = await getUnlinkedAccounts("user-1", { dbSelect: mockDbSelect });

  assert.deepStrictEqual(result, mockAccounts);
});

test("linkAccountsToHousehold should update accounts with householdId", async () => {
  let updatedAccounts: { accountIds: string[]; householdId: string } | null = null;
  const mockDbUpdate = async (ids: string[], hid: string) => {
    updatedAccounts = { accountIds: ids, householdId: hid };
  };

  const accountIds = ["1", "2"];
  const householdId = "house-123";

  await linkAccountsToHousehold(accountIds, householdId, { dbUpdate: mockDbUpdate });

  assert.ok(updatedAccounts);
  assert.deepStrictEqual(updatedAccounts.accountIds, accountIds);
  assert.strictEqual(updatedAccounts.householdId, householdId);
});
