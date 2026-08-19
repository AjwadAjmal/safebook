import { test } from "node:test";
import assert from "node:assert";
import { createManagedUser } from "./admin-db";

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


