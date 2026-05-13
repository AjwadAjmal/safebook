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

test("createHouseholdAction should create household and update user", async () => {
  const formData = new FormData();
  formData.append("name", "Mein Haushalt");

  let householdCreated = false;
  let userUpdated = false;

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
    getCurrentUser: async () => ({ id: "user-1", username: "testuser", role: "member", householdId: null }),
  };

  try {
    await createHouseholdAction(formData, deps);
    assert.fail("Should have redirected");
  } catch (e: unknown) {
    const error = e as { digest?: string };
    if (error.digest?.startsWith("NEXT_REDIRECT")) {
      assert.ok(householdCreated);
      assert.ok(userUpdated);
      assert.ok(error.digest.includes("/")); // Redirects to dashboard
    } else {
      throw e;
    }
  }
});

test("joinHouseholdAction should return error if validation fails", async () => {
  // We'll need to import joinHouseholdAction once it exists or define a stub
  // For now, I'll assume it will be exported from ./household
  const { joinHouseholdAction } = await import("./household");
  
  const formData = new FormData();
  formData.append("inviteCode", "SHORT"); // too short (must be 10)

  const result = await joinHouseholdAction(formData, {
    findHouseholdByInviteCode: async () => null,
    updateUserHousehold: async () => {},
    getCurrentUser: async () => ({ id: "user-1", username: "testuser", role: "member", householdId: null }),
  });

  assert.ok(result?.error);
  assert.ok(result.error.includes("10 Zeichen"));
});

test("joinHouseholdAction should return error if household is not found", async () => {
  const { joinHouseholdAction } = await import("./household");
  
  const formData = new FormData();
  formData.append("inviteCode", "1234567890");

  const result = await joinHouseholdAction(formData, {
    findHouseholdByInviteCode: async () => null,
    updateUserHousehold: async () => {},
    getCurrentUser: async () => ({ id: "user-1", username: "testuser", role: "member", householdId: null }),
  });

  assert.ok(result?.error);
  assert.ok(result.error.includes("Ungültiger Einladungscode"));
});

test("joinHouseholdAction should join household and update user", async () => {
  const { joinHouseholdAction } = await import("./household");
  
  const formData = new FormData();
  formData.append("inviteCode", "VALID_CODE");

  let userUpdated = false;

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
    getCurrentUser: async () => ({ id: "user-1", username: "testuser", role: "member", householdId: null }),
  };

  try {
    await joinHouseholdAction(formData, deps);
    assert.fail("Should have redirected");
  } catch (e: unknown) {
    const error = e as { digest?: string };
    if (error.digest?.startsWith("NEXT_REDIRECT")) {
      assert.ok(userUpdated);
      assert.ok(error.digest.includes("/"));
    } else {
      throw e;
    }
  }
});
