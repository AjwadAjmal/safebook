import { test } from "node:test";
import assert from "node:assert";
import { validateCredentials, createUser } from "./auth-utils";
import bcrypt from "bcrypt";

test("validateCredentials should return user if credentials are correct", async () => {
  const passwordHash = await bcrypt.hash("correctpassword", 10);
  const mockUser = {
    id: "1",
    username: "testuser",
    passwordHash: passwordHash,
    role: "member" as const,
    householdId: null,
  };

  const findUserByUsername = async (username: string) => {
    if (username === "testuser") return mockUser;
    return null;
  };

  const user = await validateCredentials("testuser", "correctpassword", findUserByUsername);
  assert.ok(user);
  assert.strictEqual(user?.username, "testuser");
});

test("validateCredentials should return null if password is incorrect", async () => {
  const passwordHash = await bcrypt.hash("correctpassword", 10);
  const mockUser = {
    id: "1",
    username: "testuser",
    passwordHash: passwordHash,
    role: "member" as const,
    householdId: null,
  };

  const findUserByUsername = async (username: string) => {
    if (username === "testuser") return mockUser;
    return null;
  };

  const user = await validateCredentials("testuser", "wrongpassword", findUserByUsername);
  assert.strictEqual(user, null);
});

test("validateCredentials should return null if user not found", async () => {
  const findUserByUsername = async () => null;

  const user = await validateCredentials("nonexistent", "password", findUserByUsername);
  assert.strictEqual(user, null);
});

test("createUser should hash password and insert user", async () => {
  let insertedUser: { username: string; passwordHash: string } | null = null;
  const mockInsert = async (u: { username: string; passwordHash: string }) => {
    insertedUser = u;
    return { id: "1", ...u, role: "member" as const, householdId: null };
  };

  await createUser("newuser", "plainpassword", mockInsert);

  assert.ok(insertedUser);
  assert.strictEqual(insertedUser.username, "newuser");
  assert.notStrictEqual(insertedUser.passwordHash, "plainpassword");
  
  const isMatch = await bcrypt.compare("plainpassword", insertedUser.passwordHash);
  assert.ok(isMatch);
});

test("validateCredentials should return user with superadmin role if credentials are correct", async () => {
  const passwordHash = await bcrypt.hash("superadminpass", 10);
  const mockSuperadmin = {
    id: "admin-1",
    username: "superadmin",
    passwordHash: passwordHash,
    role: "superadmin" as const,
    householdId: null,
  };

  const findUserByUsername = async (username: string) => {
    if (username === "superadmin") return mockSuperadmin;
    return null;
  };

  const user = await validateCredentials("superadmin", "superadminpass", findUserByUsername);
  assert.ok(user);
  assert.strictEqual(user?.username, "superadmin");
  assert.strictEqual(user?.role, "superadmin");
});

