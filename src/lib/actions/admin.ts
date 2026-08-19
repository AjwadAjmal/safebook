"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import {
  createManagedUser,
  deleteUserCleanly,
  type CreateManagedUserResponse,
  type DeleteUserResult,
} from "@/lib/admin-db";
import { type CreateManagedUserInput } from "@/lib/validations/admin";

export type CreateManagedUserActionInput =
  | FormData
  | CreateManagedUserInput;

export type CreateManagedUserActionResult =
  | { success: true; user: { id: string; username: string; role: "superadmin" | "admin" | "member" } }
  | { success: false; error: string };

export async function createManagedUserAction(
  input: CreateManagedUserActionInput,
  _deps = {
    getCurrentUser: async () => {
      const session = await auth();
      return session?.user;
    },
    createManagedUser: async (
      data: CreateManagedUserInput
    ): Promise<CreateManagedUserResponse> => {
      return await createManagedUser(data);
    },
  }
): Promise<CreateManagedUserActionResult> {
  const currentUser = await _deps.getCurrentUser();

  if (!currentUser || currentUser.role !== "superadmin") {
    return {
      success: false,
      error: "Nicht autorisiert.",
    };
  }

  const username = (
    input instanceof FormData ? input.get("username") : input.username
  ) as string;
  const password = (
    input instanceof FormData ? input.get("password") : input.password
  ) as string;

  const result = await _deps.createManagedUser({
    username: username || "",
    password: password || "",
  });

  if (!result.success) {
    return {
      success: false,
      error: result.error,
    };
  }

  try {
    revalidatePath("/admin");
  } catch {
    // Ignore in non-Next runtime / unit tests
  }

  return {
    success: true,
    user: result.user,
  };
}

export async function deleteUserAction(
  targetUserId: string,
  _deps = {
    getCurrentUser: async () => {
      const session = await auth();
      return session?.user;
    },
    deleteUserCleanly: async (
      targetUserId: string,
      executorUserId: string
    ): Promise<DeleteUserResult> => {
      return await deleteUserCleanly(targetUserId, executorUserId);
    },
  }
): Promise<DeleteUserResult> {
  const currentUser = await _deps.getCurrentUser();

  if (!currentUser || currentUser.role !== "superadmin") {
    return {
      success: false,
      error: "Nicht autorisiert.",
    };
  }

  if (!targetUserId) {
    return {
      success: false,
      error: "Ungültige Benutzer-ID.",
    };
  }

  const result = await _deps.deleteUserCleanly(targetUserId, currentUser.id);

  if (!result.success) {
    return {
      success: false,
      error: result.error,
    };
  }

  try {
    revalidatePath("/admin");
  } catch {
    // Ignore in non-Next runtime / unit tests
  }

  return {
    success: true,
  };
}

