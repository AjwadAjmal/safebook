"use server";

import { db } from "@/db";
import { households, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { z } from "zod";

const RegistrationSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  mode: z.enum(["create", "join"]),
  householdName: z.string().optional(),
  inviteCode: z.string().optional(),
});

function generateInviteCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function register(prevState: any, formData: FormData) {
  const validatedFields = RegistrationSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors };
  }

  const { username, password, mode, householdName, inviteCode } = validatedFields.data;
  const passwordHash = await bcrypt.hash(password, 10);

  try {
    return await db.transaction(async (tx) => {
      // 1. Check if user exists
      const [existingUser] = await tx
        .select()
        .from(users)
        .where(eq(users.username, username));
      
      if (existingUser) {
        return { error: "Username already taken" };
      }

      let hId: string | null = null;
      let role: "admin" | "member" = "member";

      if (mode === "create") {
        if (!householdName) return { error: "Household name is required" };
        
        const [newHousehold] = await tx
          .insert(households)
          .values({
            name: householdName,
            inviteCode: generateInviteCode(),
          })
          .returning();
        
        hId = newHousehold.id;
        role = "admin";
      } else {
        if (!inviteCode) return { error: "Invite code is required" };
        
        const [targetHousehold] = await tx
          .select()
          .from(households)
          .where(eq(households.inviteCode, inviteCode.toUpperCase()));
        
        if (!targetHousehold) {
          return { error: "Invalid invite code" };
        }
        
        hId = targetHousehold.id;
        role = "member";
      }

      // 2. Create user
      await tx.insert(users).values({
        username,
        passwordHash,
        role,
        householdId: hId,
      });

      return { success: true };
    });
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "Database error during registration" };
  }
}

export async function login(prevState: any, formData: FormData) {
  try {
    await signIn("credentials", {
      username: formData.get("username"),
      password: formData.get("password"),
      redirect: true,
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid credentials.";
        default:
          return "Something went wrong.";
      }
    }
    throw error;
  }
}
