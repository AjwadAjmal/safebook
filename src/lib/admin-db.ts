import bcrypt from "bcrypt";
import { db } from "@/db";
import { accounts, categories, households, transactions, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { findUserByUsername, type User } from "./auth-utils";
import {
  createManagedUserSchema,
  type CreateManagedUserInput,
} from "./validations/admin";

export interface ManagedUserResult {
  id: string;
  username: string;
  role: "superadmin" | "admin" | "member";
}

export type CreateManagedUserResponse =
  | { success: true; user: ManagedUserResult }
  | { success: false; error: string };

export async function createManagedUser(
  input: CreateManagedUserInput,
  _deps = {
    findUserByUsername,
    insertUser: async (u: { username: string; passwordHash: string }) => {
      const [user] = await db
        .insert(users)
        .values({
          username: u.username,
          passwordHash: u.passwordHash,
          role: "member",
        })
        .returning();
      return user as User;
    },
    hashPassword: async (password: string) => {
      return await bcrypt.hash(password, 10);
    },
  }
): Promise<CreateManagedUserResponse> {
  const result = createManagedUserSchema.safeParse(input);
  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0]?.message || "Ungültige Eingabedaten.",
    };
  }

  const existingUser = await _deps.findUserByUsername(result.data.username);
  if (existingUser) {
    return {
      success: false,
      error: "Benutzername ist bereits vergeben.",
    };
  }

  const passwordHash = await _deps.hashPassword(result.data.password);
  const createdUser = await _deps.insertUser({
    username: result.data.username,
    passwordHash,
  });

  return {
    success: true,
    user: {
      id: createdUser.id,
      username: createdUser.username,
      role: createdUser.role,
    },
  };
}

export type DeleteUserResult =
  | { success: true }
  | { success: false; error: string };

export type CleanupPlan =
  | { type: "isolated"; userId: string; householdId?: string | null }
  | { type: "sole_member"; userId: string; householdId: string }
  | { type: "multi_member"; userId: string; householdId: string };

export async function deleteUserCleanly(
  targetUserId: string,
  executorUserId: string,
  _deps = {
    getUser: async (userId: string) => {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      return (user as User) || null;
    },
    getHouseholdMemberCount: async (householdId: string) => {
      const members = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.householdId, householdId));
      return members.length;
    },
    executeCleanup: async (plan: CleanupPlan) => {
      await db.transaction(async (tx) => {
        if (plan.type === "sole_member" && plan.householdId) {
          await tx
            .delete(transactions)
            .where(eq(transactions.householdId, plan.householdId));
          await tx
            .delete(accounts)
            .where(eq(accounts.householdId, plan.householdId));
          await tx
            .delete(categories)
            .where(eq(categories.householdId, plan.householdId));
          await tx
            .delete(users)
            .where(eq(users.id, plan.userId));
          await tx
            .delete(households)
            .where(eq(households.id, plan.householdId));
        } else {
          await tx
            .delete(transactions)
            .where(eq(transactions.userId, plan.userId));
          await tx
            .delete(accounts)
            .where(eq(accounts.userId, plan.userId));
          await tx
            .delete(users)
            .where(eq(users.id, plan.userId));
        }
      });
    },
  }
): Promise<DeleteUserResult> {
  if (targetUserId === executorUserId) {
    return {
      success: false,
      error: "Selbstlöschung ist nicht erlaubt.",
    };
  }

  const targetUser = await _deps.getUser(targetUserId);
  if (!targetUser) {
    return {
      success: false,
      error: "Benutzer nicht gefunden.",
    };
  }

  if (!targetUser.householdId) {
    await _deps.executeCleanup({
      type: "isolated",
      userId: targetUserId,
      householdId: null,
    });
    return { success: true };
  }

  const memberCount = await _deps.getHouseholdMemberCount(targetUser.householdId);
  if (memberCount <= 1) {
    await _deps.executeCleanup({
      type: "sole_member",
      userId: targetUserId,
      householdId: targetUser.householdId,
    });
  } else {
    await _deps.executeCleanup({
      type: "multi_member",
      userId: targetUserId,
      householdId: targetUser.householdId,
    });
  }

  return {
    success: true,
  };
}

export interface AdminUserListItem {
  id: string;
  username: string;
  role: "superadmin" | "admin" | "member";
  householdId: string | null;
  householdName: string | null;
  accountsCount: number;
  createdAt: Date;
}

export async function getAdminUsersList(
  _deps = {
    fetchUsersList: async (): Promise<AdminUserListItem[]> => {
      const rows = await db
        .select({
          id: users.id,
          username: users.username,
          role: users.role,
          householdId: users.householdId,
          householdName: households.name,
          createdAt: users.createdAt,
        })
        .from(users)
        .leftJoin(households, eq(users.householdId, households.id))
        .orderBy(users.createdAt);

      const allAccounts = await db
        .select({
          id: accounts.id,
          userId: accounts.userId,
        })
        .from(accounts);

      const accountCountMap = new Map<string, number>();
      for (const acc of allAccounts) {
        accountCountMap.set(
          acc.userId,
          (accountCountMap.get(acc.userId) || 0) + 1
        );
      }

      return rows.map((r) => ({
        id: r.id,
        username: r.username,
        role: r.role,
        householdId: r.householdId,
        householdName: r.householdName ?? null,
        accountsCount: accountCountMap.get(r.id) || 0,
        createdAt: r.createdAt,
      }));
    },
  }
): Promise<AdminUserListItem[]> {
  return await _deps.fetchUsersList();
}



