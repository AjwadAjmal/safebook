import { test } from "node:test";
import assert from "node:assert";
import { createHouseholdAction } from "./household";

test("createHouseholdAction should return error if validation fails", async () => {
  const formData = new FormData();
  formData.append("name", "a"); // too short

  const result = await createHouseholdAction(formData, {
    createHousehold: async () => ({ id: "1", name: "test", createdAt: new Date(), updatedAt: new Date(), inviteCode: null }),
    updateUserHousehold: async () => {},
    getCurrentUser: async () => ({ id: "user-1", username: "testuser", role: "member", householdId: null }),
  });

  assert.ok(result?.error);
  assert.ok(result.error.includes("mindestens 2 Zeichen"));
});

test("createHouseholdAction should create household, update user, link accounts, and call signOut with redirect", async () => {
  const formData = new FormData();
  formData.append("name", "Mein Haushalt");
  formData.append("accountIds", "acc-1");
  formData.append("accountIds", "acc-2");

  let householdCreated = false;
  let userUpdated = false;
  let accountsLinked = false;
  let signOutCalled = false;
  let signOutOptions: { redirectTo?: string } | undefined;

  const deps = {
    createHousehold: async (name: string) => {
      householdCreated = true;
      return { id: "h-1", name, createdAt: new Date(), updatedAt: new Date(), inviteCode: null };
    },
    updateUserHousehold: async (userId: string, householdId: string, role: "admin" | "member") => {
      if (userId === "user-1" && householdId === "h-1" && role === "admin") {
        userUpdated = true;
      }
    },
    linkAccountsToHousehold: async (ids: string[], hid: string) => {
      if (ids.length === 2 && ids.includes("acc-1") && ids.includes("acc-2") && hid === "h-1") {
        accountsLinked = true;
      }
    },
    getCurrentUser: async () => ({ id: "user-1", username: "testuser", role: "member", householdId: null }),
    signOut: async (options?: { redirectTo?: string }) => {
      signOutCalled = true;
      signOutOptions = options;
      // Simulate Next.js redirect behavior that is thrown by NextAuth's signOut
      const redirectError = new Error("NEXT_REDIRECT") as Error & { digest: string };
      redirectError.digest = `NEXT_REDIRECT;303;${options?.redirectTo || "/"};false;`;
      throw redirectError;
    },
  };

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await createHouseholdAction(formData, deps as any);
    assert.fail("Should have redirected");
  } catch (e: unknown) {
    const error = e as { digest?: string };
    if (error.digest?.startsWith("NEXT_REDIRECT")) {
      assert.ok(householdCreated);
      assert.ok(userUpdated);
      assert.ok(accountsLinked);
      assert.ok(signOutCalled, "signOut should have been called");
      assert.deepStrictEqual(signOutOptions, { redirectTo: "/login?onboardingSuccess=true" });
      assert.ok(error.digest.includes("/login?onboardingSuccess=true"), "should redirect to login with onboardingSuccess=true");
    } else {
      throw e;
    }
  }
});

test("joinHouseholdAction should join household and update user and link accounts", async () => {
  const { joinHouseholdAction } = await import("./household");
  
  const formData = new FormData();
  formData.append("inviteCode", "VALID_CODE");
  formData.append("accountIds", "acc-1");

  let userUpdated = false;
  let accountsLinked = false;

  const deps = {
    findHouseholdByInviteCode: async (code: string) => {
      if (code === "VALID_CODE") {
        return { id: "h-1", name: "Family", createdAt: new Date(), updatedAt: new Date(), inviteCode: code };
      }
      return null;
    },
    updateUserHousehold: async (userId: string, householdId: string, role: "admin" | "member") => {
      if (userId === "user-1" && householdId === "h-1" && role === "member") {
        userUpdated = true;
      }
    },
    linkAccountsToHousehold: async (ids: string[], hid: string) => {
      if (ids.length === 1 && ids[0] === "acc-1" && hid === "h-1") {
        accountsLinked = true;
      }
    },
    getCurrentUser: async () => ({ id: "user-1", username: "testuser", role: "member", householdId: null }),
  };

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await joinHouseholdAction(formData, deps as any);
    assert.fail("Should have redirected");
  } catch (e: unknown) {
    const error = e as { digest?: string };
    if (error.digest?.startsWith("NEXT_REDIRECT")) {
      assert.ok(userUpdated);
      assert.ok(accountsLinked);
    } else {
      throw e;
    }
  }
});
