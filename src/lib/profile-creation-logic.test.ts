import { test } from "node:test";
import assert from "node:assert";
import { validateAccount } from "./profile-creation-logic";

test("validateAccount should return errors for empty fields", () => {
  const data = {
    type: "giro" as const,
    name: "",
    institution: "",
    currentValue: "",
    initialDate: "2024-01-01"
  };

  const errors = validateAccount(data);

  assert.strictEqual(errors.name, "Name ist erforderlich.");
  assert.strictEqual(errors.institution, "Institut ist erforderlich.");
  assert.strictEqual(errors.currentValue, "Saldo ist erforderlich.");
});

test("validateAccount should return no errors for valid fields", () => {
  const data = {
    type: "giro" as const,
    name: "Giro",
    institution: "Sparkasse",
    currentValue: "1000",
    initialDate: "2024-01-01"
  };

  const errors = validateAccount(data);

  assert.strictEqual(Object.keys(errors).length, 0);
});

test("validateAccount should validate numeric balance", () => {
  const data = {
    type: "giro" as const,
    name: "Giro",
    institution: "Sparkasse",
    currentValue: "abc",
    initialDate: "2024-01-01"
  };

  const errors = validateAccount(data);

  assert.strictEqual(errors.currentValue, "Saldo muss eine Zahl sein.");
});

test("validateAccount should require investedCapital for depot account", () => {
  const data = {
    type: "depot" as const,
    name: "Aktiendepot",
    institution: "Trade Republic",
    currentValue: "5000",
    initialDate: "2024-01-01"
  };

  const errors = validateAccount(data);

  assert.strictEqual(errors.investedCapital, "Investiertes Kapital ist erforderlich.");
});

test("validateAccount should require investedCapital to be numeric for depot account", () => {
  const data = {
    type: "depot" as const,
    name: "Aktiendepot",
    institution: "Trade Republic",
    currentValue: "5000",
    investedCapital: "abc",
    initialDate: "2024-01-01"
  };

  const errors = validateAccount(data);

  assert.strictEqual(errors.investedCapital, "Investiertes Kapital muss eine Zahl sein.");
});

test("validateAccount should require investedCapital to be non-negative for depot account", () => {
  const data = {
    type: "depot" as const,
    name: "Aktiendepot",
    institution: "Trade Republic",
    currentValue: "5000",
    investedCapital: "-100",
    initialDate: "2024-01-01"
  };

  const errors = validateAccount(data);

  assert.strictEqual(errors.investedCapital, "Investiertes Kapital darf nicht negativ sein.");
});

test("validateAccount should accept valid investedCapital for depot account", () => {
  const data = {
    type: "depot" as const,
    name: "Aktiendepot",
    institution: "Trade Republic",
    currentValue: "5000",
    investedCapital: "4000",
    initialDate: "2024-01-01"
  };

  const errors = validateAccount(data);

  assert.strictEqual(errors.investedCapital, undefined);
});

test("validateAccount should not require institution for cash account", () => {
  const data = {
    type: "cash" as const,
    name: "Portemonnaie",
    currentValue: "50",
    initialDate: "2024-01-01"
  };

  const errors = validateAccount(data);

  assert.strictEqual(errors.name, undefined);
  assert.strictEqual(errors.institution, undefined);
  assert.strictEqual(errors.currentValue, undefined);
});


