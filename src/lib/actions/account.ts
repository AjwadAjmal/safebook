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
  investedCapital: z.number().min(0, "Investiertes Kapital darf nicht negativ sein").optional(),
  initialDate: z.date(),
}).refine(
  (data) => {
    if (data.type === "depot") {
      return data.investedCapital !== undefined && data.investedCapital !== null;
    }
    return true;
  },
  {
    message: "Investiertes Kapital ist für ein Depot-Konto erforderlich",
    path: ["investedCapital"],
  }
);

export const accountsSchema = z.array(accountSchema).min(1, "Mindestens ein Konto muss angelegt werden.");

function parseDecimal(value: string | number | undefined | null): number | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "") return undefined;
    const parsed = Number(trimmed.replace(",", "."));
    return isNaN(parsed) ? undefined : parsed;
  }
  const num = Number(value);
  return isNaN(num) ? undefined : num;
}

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
    currentValue: parseDecimal(acc.currentValue) ?? NaN,
    investedCapital: parseDecimal(acc.investedCapital),
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
