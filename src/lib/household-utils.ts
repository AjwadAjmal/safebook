import { db } from "@/db";
import { households, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function createHousehold(name: string) {
  const [newHousehold] = await db
    .insert(households)
    .values({ name })
    .returning();
  return newHousehold;
}

export async function updateUserHousehold(userId: string, householdId: string, role: "admin" | "member") {
  await db
    .update(users)
    .set({ householdId, role })
    .where(eq(users.id, userId));
}

export async function findHouseholdByInviteCode(inviteCode: string) {
  const [household] = await db
    .select()
    .from(households)
    .where(eq(households.inviteCode, inviteCode));
  return household;
}
