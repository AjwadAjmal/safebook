import { test } from "node:test";
import assert from "node:assert";
import { proxyLogic } from "./proxy";

test("proxyLogic should redirect to /createprofile if logged-in user has no accounts", async () => {
  const req = {
    auth: { user: { id: "user-1", householdId: null } },
    nextUrl: new URL("http://localhost:3000/")
  };
  const hasAccounts = async (_userId: string) => _userId !== "user-1"; // user-1 has no accounts

  const res = await proxyLogic(req, hasAccounts);
  assert.ok(res instanceof Response);
  assert.strictEqual(res.headers.get("Location"), "http://localhost:3000/createprofile");
});

test("proxyLogic should redirect to /onboarding/household if user has accounts but no householdId", async () => {
  const req = {
    auth: { user: { id: "user-1", householdId: null } },
    nextUrl: new URL("http://localhost:3000/")
  };
  const hasAccounts = async (_userId: string) => _userId === "user-1"; // user-1 has accounts

  const res = await proxyLogic(req, hasAccounts);
  assert.ok(res instanceof Response);
  assert.strictEqual(res.headers.get("Location"), "http://localhost:3000/onboarding/household");
});

test("proxyLogic should allow /createprofile if user has no accounts", async () => {
  const req = {
    auth: { user: { id: "user-1", householdId: null } },
    nextUrl: new URL("http://localhost:3000/createprofile")
  };
  const hasAccounts = async (_userId: string) => false;

  const res = await proxyLogic(req, hasAccounts);
  assert.strictEqual(res, undefined);
});

test("proxyLogic should redirect from /onboarding/household to /createprofile if user has no accounts", async () => {
  const req = {
    auth: { user: { id: "user-1", householdId: null } },
    nextUrl: new URL("http://localhost:3000/onboarding/household")
  };
  const hasAccounts = async (_userId: string) => false;

  const res = await proxyLogic(req, hasAccounts);
  assert.ok(res instanceof Response);
  assert.strictEqual(res.headers.get("Location"), "http://localhost:3000/createprofile");
});

test("proxyLogic should allow /onboarding/household if user has accounts but no householdId", async () => {
  const req = {
    auth: { user: { id: "user-1", householdId: null } },
    nextUrl: new URL("http://localhost:3000/onboarding/household")
  };
  const hasAccounts = async (_userId: string) => true;

  const res = await proxyLogic(req, hasAccounts);
  assert.strictEqual(res, undefined);
});

test("proxyLogic should NOT redirect to onboarding if user has everything", async () => {
  const req = {
    auth: { user: { id: "user-1", householdId: "h-1" } },
    nextUrl: new URL("http://localhost:3000/dashboard")
  };
  const hasAccounts = async (_userId: string) => true;

  const res = await proxyLogic(req, hasAccounts);
  assert.strictEqual(res, undefined);
});
