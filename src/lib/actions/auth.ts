"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

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
