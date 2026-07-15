"use server";

import { auth, signOut } from "@/auth";
import { createHouseholdSchema, joinHouseholdSchema } from "../validations/household";
import { createHousehold, updateUserHousehold, findHouseholdByInviteCode } from "../household-utils";
import { linkAccountsToHousehold } from "../account-db";
import { redirect } from "next/navigation";

async function getCurrentUser() {
  const session = await auth();
  return session?.user;
}

export async function createHouseholdAction(
  formData: FormData,
  _deps = { createHousehold, updateUserHousehold, getCurrentUser, linkAccountsToHousehold, signOut }
) {
  const name = formData.get("name") as string;
  const accountIds = formData.getAll("accountIds") as string[];

  const result = createHouseholdSchema.safeParse({ name });

  if (!result.success) {
    return { error: result.error.issues[0]?.message || "Ungültige Eingabe." };
  }

  const user = await _deps.getCurrentUser();
  if (!user || !user.id) {
    return { error: "Nicht autorisiert." };
  }

  try {
    const household = await _deps.createHousehold(name);
    await _deps.updateUserHousehold(user.id, household.id, "admin");
    await _deps.linkAccountsToHousehold(accountIds, household.id);
  } catch (error) {
    console.error("Failed to create household:", error);
    return { error: "Fehler beim Erstellen des Haushalts." };
  }

  await _deps.signOut({ redirectTo: "/login?onboardingSuccess=true" });
}

export async function joinHouseholdAction(
  formData: FormData,
  _deps = { findHouseholdByInviteCode, updateUserHousehold, getCurrentUser, linkAccountsToHousehold }
) {
  const inviteCode = formData.get("inviteCode") as string;
  const accountIds = formData.getAll("accountIds") as string[];

  const result = joinHouseholdSchema.safeParse({ inviteCode });

  if (!result.success) {
    return { error: result.error.issues[0]?.message || "Ungültige Eingabe." };
  }

  const user = await _deps.getCurrentUser();
  if (!user || !user.id) {
    return { error: "Nicht autorisiert." };
  }

  const household = await _deps.findHouseholdByInviteCode(inviteCode);
  if (!household) {
    return { error: "Ungültiger Einladungscode." };
  }

  try {
    await _deps.updateUserHousehold(user.id, household.id, "member");
    await _deps.linkAccountsToHousehold(accountIds, household.id);
  } catch (error) {
    console.error("Failed to join household:", error);
    return { error: "Fehler beim Beitreten des Haushalts." };
  }

  redirect("/");
}
