import { test } from "node:test";
import assert from "node:assert";
import { validateCredentials } from "./auth-utils";
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
