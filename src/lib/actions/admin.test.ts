import { test } from "node:test";
import assert from "node:assert";
import { createManagedUserAction } from "./admin";

test("createManagedUserAction should reject unauthenticated user", async () => {
  const deps = {
    getCurrentUser: async () => null,
    createManagedUser: async () => {
      throw new Error("Should not be called");
    },
  };

  const result = await createManagedUserAction(
    {
      username: "someuser",
      password: "somepassword",
    },
    deps
  );

  assert.strictEqual(result.success, false);
  assert.strictEqual(result.error, "Nicht autorisiert.");
});

test("createManagedUserAction should reject user with non-superadmin role", async () => {
  const deps = {
    getCurrentUser: async () => ({
      id: "user-1",
      username: "regularadmin",
      role: "admin" as const,
      householdId: "h-1",
    }),
    createManagedUser: async () => {
      throw new Error("Should not be called");
    },
  };

  const result = await createManagedUserAction(
    {
      username: "someuser",
      password: "somepassword",
    },
    deps
  );

  assert.strictEqual(result.success, false);
  assert.strictEqual(result.error, "Nicht autorisiert.");
});

test("createManagedUserAction should reject user with member role", async () => {
  const deps = {
    getCurrentUser: async () => ({
      id: "user-2",
      username: "memberuser",
      role: "member" as const,
      householdId: "h-1",
    }),
    createManagedUser: async () => {
      throw new Error("Should not be called");
    },
  };

  const result = await createManagedUserAction(
    {
      username: "someuser",
      password: "somepassword",
    },
    deps
  );

  assert.strictEqual(result.success, false);
  assert.strictEqual(result.error, "Nicht autorisiert.");
});

test("createManagedUserAction should succeed for superadmin with plain object input", async () => {
  const deps = {
    getCurrentUser: async () => ({
      id: "superadmin-id",
      username: "dev",
      role: "superadmin" as const,
      householdId: null,
    }),
    createManagedUser: async (data: { username: string; password: string }) => ({
      success: true as const,
      user: {
        id: "created-user-1",
        username: data.username,
        role: "member" as const,
      },
    }),
  };

  const result = await createManagedUserAction(
    {
      username: "alice",
      password: "securepassword123",
    },
    deps
  );

  assert.strictEqual(result.success, true);
  if (result.success) {
    assert.strictEqual(result.user.id, "created-user-1");
    assert.strictEqual(result.user.username, "alice");
    assert.strictEqual(result.user.role, "member");
  }
});

test("createManagedUserAction should succeed for superadmin with FormData input", async () => {
  const formData = new FormData();
  formData.append("username", "bob");
  formData.append("password", "securepassword123");

  const deps = {
    getCurrentUser: async () => ({
      id: "superadmin-id",
      username: "dev",
      role: "superadmin" as const,
      householdId: null,
    }),
    createManagedUser: async (data: { username: string; password: string }) => ({
      success: true as const,
      user: {
        id: "created-user-2",
        username: data.username,
        role: "member" as const,
      },
    }),
  };

  const result = await createManagedUserAction(formData, deps);

  assert.strictEqual(result.success, true);
  if (result.success) {
    assert.strictEqual(result.user.id, "created-user-2");
    assert.strictEqual(result.user.username, "bob");
  }
});

test("createManagedUserAction should return error if createManagedUser fails", async () => {
  const deps = {
    getCurrentUser: async () => ({
      id: "superadmin-id",
      username: "dev",
      role: "superadmin" as const,
      householdId: null,
    }),
    createManagedUser: async () => ({
      success: false as const,
      error: "Benutzername ist bereits vergeben.",
    }),
  };

  const result = await createManagedUserAction(
    {
      username: "existinguser",
      password: "securepassword123",
    },
    deps
  );

  assert.strictEqual(result.success, false);
  if (!result.success) {
    assert.strictEqual(result.error, "Benutzername ist bereits vergeben.");
  }
});

