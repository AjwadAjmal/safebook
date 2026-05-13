import { test } from "node:test";
import assert from "node:assert";
import { proxyLogic } from "./proxy";

test("proxyLogic should redirect to /onboarding if logged-in user has no householdId", () => {
  const req = {
    auth: { user: { householdId: null } },
    nextUrl: new URL("http://localhost:3000/")
  };

  const res = proxyLogic(req);
  assert.ok(res instanceof Response);
  assert.strictEqual(res.status, 302);
  assert.strictEqual(res.headers.get("Location"), "http://localhost:3000/onboarding");
});

test("proxyLogic should NOT redirect if user is already on /onboarding", () => {
  const req = {
    auth: { user: { householdId: null } },
    nextUrl: new URL("http://localhost:3000/onboarding")
  };

  const res = proxyLogic(req);
  assert.strictEqual(res, undefined);
});

test("proxyLogic should NOT redirect to /onboarding if user has householdId", () => {
  const req = {
    auth: { user: { householdId: "some-uuid" } },
    nextUrl: new URL("http://localhost:3000/")
  };

  const res = proxyLogic(req);
  assert.strictEqual(res, undefined);
});
