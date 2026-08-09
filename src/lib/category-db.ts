import { db } from "@/db";
import { categories } from "@/db/schema";
import { eq, or } from "drizzle-orm";

export const STANDARD_CATEGORIES = [
  { name: "Tanken", icon: "gas-pump" },
  { name: "Lebensmittel", icon: "shopping-cart" },
  { name: "Wohnen", icon: "home" },
  { name: "Freizeit", icon: "smile" },
  { name: "Gehalt", icon: "briefcase" },
  { name: "Sonstiges", icon: "tag" },
];

export async function getSystemDefaultCategories(
  _deps = {
    dbSelect: async () => {
      return await db
        .select()
        .from(categories)
        .where(eq(categories.isSystem, true));
    },
  }
) {
  return await _deps.dbSelect();
}

export async function getCategoriesForHousehold(
  householdId: string,
  _deps = {
    dbSelect: async (hid: string) => {
      return await db
        .select()
        .from(categories)
        .where(or(eq(categories.isSystem, true), eq(categories.householdId, hid)));
    },
  }
) {
  return await _deps.dbSelect(householdId);
}

export async function createCustomCategory(
  { name, householdId, icon }: { name: string; householdId: string; icon?: string },
  _deps = {
    dbInsert: async (data: { name: string; householdId: string; icon?: string }) => {
      const [inserted] = await db
        .insert(categories)
        .values({
          name: data.name,
          householdId: data.householdId,
          icon: data.icon || "tag",
          isSystem: false,
        })
        .returning();
      return inserted;
    },
  }
) {
  return await _deps.dbInsert({ name, householdId, icon });
}

export async function seedStandardCategories(
  _deps = {
    getExisting: async () => {
      return await db
        .select()
        .from(categories)
        .where(eq(categories.isSystem, true));
    },
    dbInsertMany: async (items: { name: string; icon: string; isSystem: boolean }[]) => {
      if (items.length === 0) return [];
      return await db.insert(categories).values(items).returning();
    },
  }
) {
  const existing = await _deps.getExisting();
  const existingNames = new Set(existing.map((c) => c.name));
  const missing = STANDARD_CATEGORIES.filter((sc) => !existingNames.has(sc.name)).map(
    (sc) => ({
      name: sc.name,
      icon: sc.icon,
      isSystem: true,
    })
  );

  if (missing.length > 0) {
    await _deps.dbInsertMany(missing);
  }
}
