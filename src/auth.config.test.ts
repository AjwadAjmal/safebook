import { test } from "node:test";
import assert from "node:assert";
import { authConfig } from "./auth.config";

test("authConfig jwt callback should attach superadmin role and householdId to token", async () => {
  const jwtCallback = authConfig.callbacks?.jwt;
  assert.ok(jwtCallback);

  const initialToken = { sub: "user-superadmin-1" };
  const user = {
    id: "user-superadmin-1",
    role: "superadmin" as const,
    householdId: "household-1",
  };

  // @ts-expect-error test invocation of jwt callback
  const token = await jwtCallback({ token: initialToken, user });
  assert.strictEqual(token.role, "superadmin");
  assert.strictEqual(token.householdId, "household-1");
});

test("authConfig session callback should attach superadmin role and householdId to session", async () => {
  const sessionCallback = authConfig.callbacks?.session;
  assert.ok(sessionCallback);

  const session = {
    user: {
      id: "",
      role: "member" as const,
      householdId: null,
    },
    expires: "2026-08-19T12:00:00.000Z",
  };

  const token = {
    sub: "user-superadmin-1",
    role: "superadmin" as const,
    householdId: "household-1",
  };

  // @ts-expect-error test invocation of session callback
  const resultSession = await sessionCallback({ session, token });
  assert.strictEqual(resultSession.user.id, "user-superadmin-1");
  assert.strictEqual(resultSession.user.role, "superadmin");
  assert.strictEqual(resultSession.user.householdId, "household-1");
});
