import bcrypt from "bcrypt";
import { db } from "@/db";
import { users } from "@/db/schema";
import { findUserByUsername, type User } from "./auth-utils";
import {
  createManagedUserSchema,
  type CreateManagedUserInput,
} from "./validations/admin";

export interface ManagedUserResult {
  id: string;
  username: string;
  role: "superadmin" | "admin" | "member";
}

export type CreateManagedUserResponse =
  | { success: true; user: ManagedUserResult }
  | { success: false; error: string };

export async function createManagedUser(
  input: CreateManagedUserInput,
  _deps = {
    findUserByUsername,
    insertUser: async (u: { username: string; passwordHash: string }) => {
      const [user] = await db
        .insert(users)
        .values({
          username: u.username,
          passwordHash: u.passwordHash,
          role: "member",
        })
        .returning();
      return user as User;
    },
    hashPassword: async (password: string) => {
      return await bcrypt.hash(password, 10);
    },
  }
): Promise<CreateManagedUserResponse> {
  const result = createManagedUserSchema.safeParse(input);
  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0]?.message || "Ungültige Eingabedaten.",
    };
  }

  const existingUser = await _deps.findUserByUsername(result.data.username);
  if (existingUser) {
    return {
      success: false,
      error: "Benutzername ist bereits vergeben.",
    };
  }

  const passwordHash = await _deps.hashPassword(result.data.password);
  const createdUser = await _deps.insertUser({
    username: result.data.username,
    passwordHash,
  });

  return {
    success: true,
    user: {
      id: createdUser.id,
      username: createdUser.username,
      role: createdUser.role,
    },
  };
}
