import { test } from "node:test";
import assert from "node:assert";
import { createManagedUser, deleteUserCleanly, getAdminUsersList } from "./admin-db";

test("createManagedUser should return validation error if username or password is invalid", async () => {
  const resultTooShort = await createManagedUser({
    username: "ab",
    password: "123",
  });

  assert.strictEqual(resultTooShort.success, false);
  if (!resultTooShort.success) {
    assert.ok(resultTooShort.error.includes("Benutzername"));
  }

  const resultShortPassword = await createManagedUser({
    username: "validuser",
    password: "short",
  });

  assert.strictEqual(resultShortPassword.success, false);
  if (!resultShortPassword.success) {
    assert.ok(resultShortPassword.error.includes("Passwort"));
  }
});

test("createManagedUser should return error if username already exists", async () => {
  const deps = {
    findUserByUsername: async (username: string) => ({
      id: "existing-id",
      username,
      passwordHash: "somehash",
      role: "member" as const,
      householdId: null,
    }),
    insertUser: async () => {
      throw new Error("Should not be called");
    },
    hashPassword: async () => "hashed",
  };

  const result = await createManagedUser(
    {
      username: "existinguser",
      password: "validPassword123",
    },
    deps
  );

  assert.strictEqual(result.success, false);
  if (!result.success) {
    assert.strictEqual(result.error, "Benutzername ist bereits vergeben.");
  }
});

test("createManagedUser should hash password and create user with default member role on success", async () => {
  let insertedPayload: { username: string; passwordHash: string } | null = null;

  const deps = {
    findUserByUsername: async () => null,
    insertUser: async (u: { username: string; passwordHash: string }) => {
      insertedPayload = u;
      return {
        id: "new-user-123",
        username: u.username,
        passwordHash: u.passwordHash,
        role: "member" as const,
        householdId: null,
      };
    },
    hashPassword: async (password: string) => `mock_hashed_${password}`,
  };

  const result = await createManagedUser(
    {
      username: "freshuser",
      password: "securePassword123",
    },
    deps
  );

  assert.strictEqual(result.success, true);
  if (result.success) {
    assert.strictEqual(result.user.id, "new-user-123");
    assert.strictEqual(result.user.username, "freshuser");
    assert.strictEqual(result.user.role, "member");
  }

  assert.ok(insertedPayload);
  const payload = insertedPayload as { username: string; passwordHash: string };
  assert.strictEqual(payload.username, "freshuser");
  assert.strictEqual(payload.passwordHash, "mock_hashed_securePassword123");
});

test("deleteUserCleanly should prevent self-deletion by executor", async () => {
  const result = await deleteUserCleanly("user-admin-1", "user-admin-1");

  assert.strictEqual(result.success, false);
  if (!result.success) {
    assert.strictEqual(result.error, "Selbstlöschung ist nicht erlaubt.");
  }
});

test("deleteUserCleanly should return error if target user is not found", async () => {
  const deps = {
    getUser: async () => null,
    getHouseholdMemberCount: async () => 0,
    executeCleanup: async () => {},
  };

  const result = await deleteUserCleanly("non-existent-user", "admin-1", deps);

  assert.strictEqual(result.success, false);
  if (!result.success) {
    assert.strictEqual(result.error, "Benutzer nicht gefunden.");
  }
});

test("deleteUserCleanly should cleanly remove isolated user without household", async () => {
  let executedPlan: { type: string; userId: string; householdId?: string | null } | null = null;

  const deps = {
    getUser: async (id: string) => ({
      id,
      username: "isolateduser",
      passwordHash: "hash",
      role: "member" as const,
      householdId: null,
    }),
    getHouseholdMemberCount: async () => 0,
    executeCleanup: async (plan: { type: "isolated" | "sole_member" | "multi_member"; userId: string; householdId?: string | null }) => {
      executedPlan = plan;
    },
  };

  const result = await deleteUserCleanly("isolated-user-1", "admin-1", deps);

  assert.strictEqual(result.success, true);
  assert.deepStrictEqual(executedPlan, {
    type: "isolated",
    userId: "isolated-user-1",
    householdId: null,
  });
});

test("deleteUserCleanly should cleanly remove sole household member and the entire household", async () => {
  let executedPlan: { type: string; userId: string; householdId?: string | null } | null = null;

  const deps = {
    getUser: async (id: string) => ({
      id,
      username: "soleuser",
      passwordHash: "hash",
      role: "admin" as const,
      householdId: "household-single",
    }),
    getHouseholdMemberCount: async (householdId: string) => {
      assert.strictEqual(householdId, "household-single");
      return 1;
    },
    executeCleanup: async (plan: { type: "isolated" | "sole_member" | "multi_member"; userId: string; householdId?: string | null }) => {
      executedPlan = plan;
    },
  };

  const result = await deleteUserCleanly("sole-user-1", "admin-1", deps);

  assert.strictEqual(result.success, true);
  assert.deepStrictEqual(executedPlan, {
    type: "sole_member",
    userId: "sole-user-1",
    householdId: "household-single",
  });
});

test("deleteUserCleanly should preserve household and other members when deleting user in multi-member household", async () => {
  let executedPlan: { type: string; userId: string; householdId?: string | null } | null = null;

  const deps = {
    getUser: async (id: string) => ({
      id,
      username: "memberuser",
      passwordHash: "hash",
      role: "member" as const,
      householdId: "household-multi",
    }),
    getHouseholdMemberCount: async (householdId: string) => {
      assert.strictEqual(householdId, "household-multi");
      return 3;
    },
    executeCleanup: async (plan: { type: "isolated" | "sole_member" | "multi_member"; userId: string; householdId?: string | null }) => {
      executedPlan = plan;
    },
  };

  const result = await deleteUserCleanly("member-user-1", "admin-1", deps);

  assert.strictEqual(result.success, true);
  assert.deepStrictEqual(executedPlan, {
    type: "multi_member",
    userId: "member-user-1",
    householdId: "household-multi",
  });
});

test("getAdminUsersList should return all users with enriched household and account details", async () => {
  const mockCreatedAt = new Date("2026-01-01T00:00:00Z");
  const deps = {
    fetchUsersList: async () => [
      {
        id: "user-1",
        username: "dev",
        role: "superadmin" as const,
        householdId: null,
        householdName: null,
        accountsCount: 0,
        createdAt: mockCreatedAt,
      },
      {
        id: "user-2",
        username: "alice",
        role: "admin" as const,
        householdId: "h-1",
        householdName: "Familie Schmidt",
        accountsCount: 3,
        createdAt: mockCreatedAt,
      },
    ],
  };

  const list = await getAdminUsersList(deps);

  assert.strictEqual(list.length, 2);
  assert.strictEqual(list[0].username, "dev");
  assert.strictEqual(list[0].role, "superadmin");
  assert.strictEqual(list[0].householdName, null);
  assert.strictEqual(list[0].accountsCount, 0);

  assert.strictEqual(list[1].username, "alice");
  assert.strictEqual(list[1].householdName, "Familie Schmidt");
  assert.strictEqual(list[1].accountsCount, 3);
});





