import bcrypt from "bcrypt";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  role: "admin" | "member";
  householdId: string | null;
}

export async function findUserByUsername(username: string): Promise<User | null> {
  const [user] = await db.select().from(users).where(eq(users.username, username));
  return (user as User) || null;
}

export async function validateCredentials(
  username: string,
  password: string,
  _findUserByUsername = findUserByUsername
) {
  const user = await _findUserByUsername(username);

  if (!user) return null;

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) return null;

  return user;
}
