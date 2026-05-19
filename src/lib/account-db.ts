import { db } from "@/db";
import { accounts } from "@/db/schema";
import { and, eq, inArray, isNull } from "drizzle-orm";

/**
 * Server-side database operations for accounts.
 * This file should only be imported in Server Components, Server Actions, or other server-side logic.
 */

export async function checkUserHasAccounts(userId: string): Promise<boolean> {
  const [account] = await db
    .select({ id: accounts.id })
    .from(accounts)
    .where(eq(accounts.userId, userId))
    .limit(1);
  
  return !!account;
}

export async function getUnlinkedAccounts(
  userId: string,
  _deps = {
    dbSelect: async (uid: string) => {
      return await db
        .select()
        .from(accounts)
        .where(and(eq(accounts.userId, uid), isNull(accounts.householdId)));
    }
  }
) {
  return await _deps.dbSelect(userId);
}

export async function linkAccountsToHousehold(
  accountIds: string[],
  householdId: string,
  _deps = {
    dbUpdate: async (ids: string[], hid: string) => {
      if (ids.length === 0) return;
      await db
        .update(accounts)
        .set({ householdId: hid })
        .where(inArray(accounts.id, ids));
    }
  }
) {
  await _deps.dbUpdate(accountIds, householdId);
}
