import { test } from "node:test";
import assert from "node:assert";
import { registerAction } from "./auth";

// Mocking dependencies for registerAction
// We'll pass them as arguments if possible, or use a pattern that allows mocking.
// For now, let's see how registerAction is structured.

test("registerAction should return error if validation fails", async () => {
  const formData = new FormData();
  formData.append("username", "us"); // too short
  formData.append("password", "short"); // too short

  const result = await registerAction(formData, {
    createUser: async () => { throw new Error("Should not be called"); },
    findUserByUsername: async () => null,
  });

  assert.ok(result?.error);
  assert.ok(result.error.includes("Benutzername") || result.error.includes("Passwort"));
});

test("registerAction should return error if user exists", async () => {
  const formData = new FormData();
  formData.append("username", "existinguser");
  formData.append("password", "validpassword");

  const result = await registerAction(formData, {
    createUser: async () => { throw new Error("Should not be called"); },
    findUserByUsername: async (username) => ({
      id: "1",
      username,
      passwordHash: "hash",
      role: "member",
      householdId: null,
    }),
  });

  assert.strictEqual(result?.error, "Benutzername ist bereits vergeben.");
});

test("registerAction should call createUser and redirect on success", async () => {
  const formData = new FormData();
  formData.append("username", "newuser");
  formData.append("password", "validpassword");

  let created = false;
  const deps = {
    createUser: async (u: string) => {
      created = true;
      return { id: "1", username: u, passwordHash: "hash", role: "member" as const, householdId: null };
    },
    findUserByUsername: async () => null,
  };

  try {
    await registerAction(formData, deps);
    assert.fail("Should have redirected");
  } catch (e: unknown) {
    // Next.js redirect throws an error with digest 'NEXT_REDIRECT;...'
    const error = e as { message?: string; digest?: string };
    if (error.message === "NEXT_REDIRECT") {
       assert.ok(created);
    } else if (error.digest?.startsWith("NEXT_REDIRECT")) {
       assert.ok(created);
       assert.ok(error.digest.includes("/login"));
    } else {
      throw e;
    }
  }
});
