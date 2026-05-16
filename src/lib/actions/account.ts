"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/db";
import { accounts } from "@/db/schema";
import { z } from "zod";

const accountSchema = z.object({
  type: z.enum(["giro", "depot", "cash"]),
  name: z.string().min(2, "Name muss mindestens 2 Zeichen lang sein"),
  institution: z.string().min(2, "Institut muss mindestens 2 Zeichen lang sein"),
  currentValue: z.number().min(0, "Aktueller Wert darf nicht negativ sein"),
  investedCapital: z.number().min(0).optional(),
  initialDate: z.date(),
});

export const accountsSchema = z.array(accountSchema).min(1, "Mindestens ein Konto muss angelegt werden.");

interface AccountInput {
  type: "giro" | "depot" | "cash";
  name: string;
  institution: string;
  currentValue: string | number;
  investedCapital?: string | number;
  initialDate: string;
}

export async function createProfileAccounts(
  accountsList: AccountInput[],
  deps = {
    getCurrentUser: async () => {
      const session = await auth();
      return session?.user;
    },
    saveAccounts: async (data: (typeof accounts.$inferInsert)[]) => {
      return await db.insert(accounts).values(data);
    }
  }
) {
  const user = await deps.getCurrentUser();
  if (!user || !user.id) {
    return { error: "Nicht autorisiert." };
  }

  // Parse dates and numbers from client
  const parsedAccounts = accountsList.map(acc => ({
    ...acc,
    initialDate: new Date(acc.initialDate),
    currentValue: Number(acc.currentValue),
    investedCapital: acc.investedCapital !== undefined ? Number(acc.investedCapital) : undefined,
  }));

  const result = accountsSchema.safeParse(parsedAccounts);

  if (!result.success) {
    return { error: result.error.issues[0]?.message || "Ungültige Eingabe." };
  }

  try {
    const dataToSave = result.data.map(acc => ({
      ...acc,
      userId: user.id as string,
      currentValue: acc.currentValue.toString(), // decimal in schema
      investedCapital: acc.investedCapital?.toString(),
    }));

    await deps.saveAccounts(dataToSave);
  } catch (error) {
    console.error("Failed to save accounts:", error);
    return { error: "Fehler beim Speichern der Konten." };
  }

  redirect("/onboarding/household");
}
