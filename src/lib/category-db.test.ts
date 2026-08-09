import { test } from "node:test";
import assert from "node:assert";
import {
  getSystemDefaultCategories,
  getCategoriesForHousehold,
  createCustomCategory,
  seedStandardCategories,
  STANDARD_CATEGORIES,
} from "./category-db";

test("getSystemDefaultCategories should return system default categories", async () => {
  const mockSystemCategories = [
    {
      id: "cat-1",
      name: "Tanken",
      icon: "gas-pump",
      isSystem: true,
      householdId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "cat-2",
      name: "Lebensmittel",
      icon: "shopping-cart",
      isSystem: true,
      householdId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const deps = {
    dbSelect: async () => mockSystemCategories,
  };

  const categories = await getSystemDefaultCategories(deps);
  assert.deepStrictEqual(categories, mockSystemCategories);
});

test("getCategoriesForHousehold should return system categories and household categories", async () => {
  const mockAllCategories = [
    {
      id: "cat-1",
      name: "Tanken",
      icon: "gas-pump",
      isSystem: true,
      householdId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "cat-custom-1",
      name: "Streaming Dienst",
      icon: "tag",
      isSystem: false,
      householdId: "hh-123",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const deps = {
    dbSelect: async (hid: string) => {
      if (hid === "hh-123") {
        return mockAllCategories;
      }
      return [];
    },
  };

  const result = await getCategoriesForHousehold("hh-123", deps);
  assert.deepStrictEqual(result, mockAllCategories);
});

test("createCustomCategory should insert custom category with householdId", async () => {
  let insertedData: { name: string; householdId: string; icon?: string } | null = null;
  const deps = {
    dbInsert: async (data: { name: string; householdId: string; icon?: string }) => {
      insertedData = data;
      return {
        id: "cat-new",
        name: data.name,
        icon: data.icon || "tag",
        isSystem: false,
        householdId: data.householdId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    },
  };

  const created = await createCustomCategory(
    { name: "Gym", householdId: "hh-456", icon: "dumbbell" },
    deps
  );

  assert.deepStrictEqual(insertedData, {
    name: "Gym",
    householdId: "hh-456",
    icon: "dumbbell",
  });
  assert.strictEqual(created.name, "Gym");
  assert.strictEqual(created.householdId, "hh-456");
});

test("seedStandardCategories should insert missing standard categories", async () => {
  let insertedItems: { name: string; icon: string; isSystem: boolean }[] = [];
  const deps = {
    getExisting: async () => [
      { id: "1", name: "Tanken", icon: "gas-pump", isSystem: true, householdId: null, createdAt: new Date(), updatedAt: new Date() },
    ],
    dbInsertMany: async (items: { name: string; icon: string; isSystem: boolean }[]) => {
      insertedItems = items;
      return items.map((item, idx) => ({
        id: `cat-${idx}`,
        name: item.name,
        icon: item.icon,
        isSystem: item.isSystem,
        householdId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
    },
  };

  await seedStandardCategories(deps);

  assert.strictEqual(insertedItems.length, STANDARD_CATEGORIES.length - 1);
  assert.strictEqual(insertedItems.some((i) => i.name === "Tanken"), false);
  assert.strictEqual(insertedItems.some((i) => i.name === "Lebensmittel"), true);
});



