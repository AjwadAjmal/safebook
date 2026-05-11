"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { registerSchema } from "../validations/auth";
import { createUser, findUserByUsername } from "../auth-utils";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { error: "Bitte Benutzernamen und Passwort eingeben." };
  }

  try {
    await signIn("credentials", {
      username,
      password,
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Ungültiger Benutzername oder Passwort." };
        default:
          return { error: "Etwas ist schiefgelaufen." };
      }
    }
    throw error;
  }
}

export async function registerAction(
  formData: FormData,
  _deps = { createUser, findUserByUsername }
) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  const result = registerSchema.safeParse({ username, password });

  if (!result.success) {
    return { error: result.error.issues[0]?.message || "Ungültige Eingabe." };
  }

  const existingUser = await _deps.findUserByUsername(username);
  if (existingUser) {
    return { error: "Benutzername ist bereits vergeben." };
  }

  try {
    await _deps.createUser(username, password);
  } catch (error) {
    console.error("Failed to create user:", error);
    return { error: "Fehler bei der Registrierung." };
  }

  redirect("/login");
}
